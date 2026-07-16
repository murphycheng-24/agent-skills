#!/usr/bin/env node
/**
 * 功能说明：为 Codex、Claude Code、Cursor 安装或检查指定 Agent skill。
 * 日期：2026-07-16
 * 主要接口：install、doctor
 */
import { appendFile, cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TARGETS = ['codex', 'claude', 'cursor']
const SKILLS = {
  'challenge-plan': {
    claudeInstruction: 'For plan-review requests such as 反对者视角、反驳方案、质疑计划、计划审查、方案优劣、MVP裁剪、更简单替代方案、方案风险审查或真实推荐, first read `SKILL.md` and `references/karpathy-guidelines.md` in this directory. Apply the workflow only when those requests are relevant.',
    cursorDescription: 'Review a product, technical, or implementation plan from an adversarial perspective. Trigger phrases include 反对者视角, 反驳方案, 质疑计划, 计划审查, MVP裁剪, 更简单替代方案 and 真实推荐.',
    cursorReferences: ['references/karpathy-guidelines.md']
  },
  'code-review': {
    claudeInstruction: 'For Git commit-range review requests such as 代码审查, code review, git review, 审查提交, 分析提交, PR 审查 or MR 审查, first read `SKILL.md` and use `references/report_template.md` when producing the report.',
    cursorDescription: 'Review a Git commit range and report P0/P1/P2 risks. Trigger phrases include 代码审查, code review, git review, 审查提交, 分析提交, PR 审查 and MR 审查.',
    cursorReferences: ['references/report_template.md']
  }
}

function usage() {
  return ['Usage:', '  agent-skills install <skill> [--target codex|claude|cursor|all] [--project PATH] [--force]', '  agent-skills doctor [skill] [--target codex|claude|cursor|all] [--project PATH]', '', `Available skills: ${Object.keys(SKILLS).join(', ')}`].join('\n')
}

function skillConfig(skillName) {
  const config = SKILLS[skillName]
  if (!config) throw new Error(`Unsupported skill: ${skillName}. Available skills: ${Object.keys(SKILLS).join(', ')}`)
  return config
}

function claudeMarkers(skillName) {
  return { start: `<!-- agent-skills:${skillName}:start -->`, end: `<!-- agent-skills:${skillName}:end -->` }
}

function parseOptions(args) {
  const options = { target: 'all', project: resolve('.'), force: false }
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--force') {
      options.force = true
      continue
    }
    if (argument === '--target' || argument === '--project') {
      const value = args[index + 1]
      if (!value) throw new Error(`${argument} requires a value.`)
      options[argument.slice(2)] = argument === '--project' ? resolve(value) : value
      index += 1
      continue
    }
    throw new Error(`Unknown option: ${argument}`)
  }
  if (options.target !== 'all' && !TARGETS.includes(options.target)) throw new Error(`Unsupported target: ${options.target}`)
  return options
}

function selectedTargets(target) {
  return target === 'all' ? TARGETS : [target]
}

function codexHome() {
  return process.env.CODEX_HOME || join(homedir(), '.codex')
}

function sourceSkill(skillName) {
  return join(PACKAGE_ROOT, 'skills', skillName)
}

function payloadPath(skillName, target, project) {
  return target === 'codex' ? join(codexHome(), 'skills', skillName) : join(project, '.agent-skills', skillName)
}

function cursorRule(skillName) {
  const config = skillConfig(skillName)
  const references = config.cursorReferences.map((path) => ` and @.agent-skills/${skillName}/${path}`).join('')
  return ['---', `description: ${config.cursorDescription}`, 'alwaysApply: false', '---', '', `When this rule matches, read @.agent-skills/${skillName}/SKILL.md${references} before responding. Apply that workflow only to the relevant request.`, ''].join('\n')
}

function claudeImport(skillName) {
  const { start, end } = claudeMarkers(skillName)
  return [start, `@.agent-skills/${skillName}/claude.md`, end].join('\n')
}

function claudeAdapter(skillName) {
  return [`# ${skillName}`, '', skillConfig(skillName).claudeInstruction, ''].join('\n')
}

async function copySkill(skillName, destination) {
  await mkdir(dirname(destination), { recursive: true })
  await cp(sourceSkill(skillName), destination, { recursive: true, force: true })
}

async function preflightInstall(skillName, targets, options) {
  const payloads = new Set(targets.map((target) => payloadPath(skillName, target, options.project)))
  if (options.force) return
  for (const payload of payloads) {
    if (existsSync(payload)) throw new Error(`${payload} already exists. Re-run with --force to update it.`)
  }
  if (targets.includes('cursor')) {
    const rulePath = join(options.project, '.cursor', 'rules', `${skillName}.mdc`)
    if (existsSync(rulePath)) throw new Error(`${rulePath} already exists. Re-run with --force to update it.`)
  }
}

async function install(skillName, options) {
  skillConfig(skillName)
  const targets = selectedTargets(options.target)
  await preflightInstall(skillName, targets, options)
  const payloads = new Set(targets.map((target) => payloadPath(skillName, target, options.project)))
  for (const payload of payloads) await copySkill(skillName, payload)

  if (targets.includes('claude')) {
    const payload = payloadPath(skillName, 'claude', options.project)
    await writeFile(join(payload, 'claude.md'), claudeAdapter(skillName), 'utf8')
    const claudePath = join(options.project, 'CLAUDE.md')
    const current = existsSync(claudePath) ? await readFile(claudePath, 'utf8') : ''
    const { start } = claudeMarkers(skillName)
    if (!current.includes(start)) await appendFile(claudePath, `${current && !current.endsWith('\n') ? '\n' : ''}${claudeImport(skillName)}\n`, 'utf8')
  }

  if (targets.includes('cursor')) {
    const rulePath = join(options.project, '.cursor', 'rules', `${skillName}.mdc`)
    await mkdir(dirname(rulePath), { recursive: true })
    await writeFile(rulePath, cursorRule(skillName), 'utf8')
  }
  console.log(`Installed ${skillName} for ${targets.join(', ')}.`)
}

async function doctor(skillName, options) {
  skillConfig(skillName)
  const problems = []
  const { start, end } = claudeMarkers(skillName)
  for (const target of selectedTargets(options.target)) {
    const skillPath = join(payloadPath(skillName, target, options.project), 'SKILL.md')
    if (!existsSync(skillPath)) problems.push(`${target}: missing ${skillPath}`)
    if (target === 'claude') {
      const claudePath = join(options.project, 'CLAUDE.md')
      const content = existsSync(claudePath) ? await readFile(claudePath, 'utf8') : ''
      if (!content.includes(start) || !content.includes(end)) problems.push(`claude: missing managed import in ${claudePath}`)
    }
    if (target === 'cursor') {
      const rulePath = join(options.project, '.cursor', 'rules', `${skillName}.mdc`)
      if (!existsSync(rulePath)) problems.push(`cursor: missing ${rulePath}`)
    }
  }
  if (problems.length) throw new Error(problems.join('\n'))
  console.log(`${skillName} is installed correctly.`)
}

async function main() {
  const [command, ...rest] = process.argv.slice(2)
  if (command === 'install') {
    const [skillName, ...args] = rest
    if (!skillName) throw new Error(usage())
    await install(skillName, parseOptions(args))
    return
  }
  if (command === 'doctor') {
    const [maybeSkillName, ...args] = rest
    const skillName = maybeSkillName && !maybeSkillName.startsWith('--') ? maybeSkillName : 'challenge-plan'
    await doctor(skillName, parseOptions(maybeSkillName === skillName ? args : rest))
    return
  }
  throw new Error(usage())
}

main().catch((error) => {
  console.error(`Error: ${error.message}`)
  process.exitCode = 1
})
