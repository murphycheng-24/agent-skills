#!/usr/bin/env node
/**
 * 功能说明：为 Codex、Claude Code、Cursor 安装或检查指定 Agent skill。
 * 日期：2026-07-16
 * 主要接口：install、doctor。
 */
import { appendFile, cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL_NAME = 'challenge-plan'
const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE_SKILL = join(PACKAGE_ROOT, 'skills', SKILL_NAME)
const TARGETS = ['codex', 'claude', 'cursor']
const CLAUDE_START = `<!-- agent-skills:${SKILL_NAME}:start -->`
const CLAUDE_END = `<!-- agent-skills:${SKILL_NAME}:end -->`

function usage() {
  return `Usage:
  agent-skills install ${SKILL_NAME} [--target codex|claude|cursor|all] [--project PATH] [--force]
  agent-skills doctor [--target codex|claude|cursor|all] [--project PATH]`
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

  if (options.target !== 'all' && !TARGETS.includes(options.target)) {
    throw new Error(`Unsupported target: ${options.target}`)
  }

  return options
}

function selectedTargets(target) {
  return target === 'all' ? TARGETS : [target]
}

function codexHome() {
  return process.env.CODEX_HOME || join(homedir(), '.codex')
}

function payloadPath(target, project) {
  return target === 'codex'
    ? join(codexHome(), 'skills', SKILL_NAME)
    : join(project, '.agent-skills', SKILL_NAME)
}

function cursorRule(project) {
  return `---
description: Review a product, technical, or implementation plan from an adversarial perspective. Trigger phrases include 反对者视角, 反驳方案, 质疑计划, 计划审查, MVP裁剪, 更简单替代方案, and 真实推荐.
alwaysApply: false
---

When this rule matches, read @.agent-skills/${SKILL_NAME}/SKILL.md and then @.agent-skills/${SKILL_NAME}/references/karpathy-guidelines.md before responding. Apply that workflow only to the relevant plan-review request.
`
}

function claudeImport() {
  return `${CLAUDE_START}
@.agent-skills/${SKILL_NAME}/claude.md
${CLAUDE_END}`
}

function claudeAdapter() {
  return `# ${SKILL_NAME}\n\nFor plan-review requests such as 反对者视角、反驳方案、质疑计划、计划审查、方案优劣、MVP裁剪、更简单替代方案、方案风险审查或真实推荐, first read \`SKILL.md\` and \`references/karpathy-guidelines.md\` in this directory. Apply the workflow only when those requests are relevant.\n`
}

async function copySkill(destination) {
  await mkdir(dirname(destination), { recursive: true })
  await cp(SOURCE_SKILL, destination, { recursive: true, force: true })
}

async function preflightInstall(targets, options) {
  const payloads = new Set(targets.map((target) => payloadPath(target, options.project)))

  if (!options.force) {
    for (const payload of payloads) {
      if (existsSync(payload)) throw new Error(`${payload} already exists. Re-run with --force to update it.`)
    }

    if (targets.includes('cursor')) {
      const rulePath = join(options.project, '.cursor', 'rules', `${SKILL_NAME}.mdc`)
      if (existsSync(rulePath)) throw new Error(`${rulePath} already exists. Re-run with --force to update it.`)
    }
  }
}

async function install(options) {
  const targets = selectedTargets(options.target)
  await preflightInstall(targets, options)

  const payloads = new Set(targets.map((target) => payloadPath(target, options.project)))
  for (const payload of payloads) await copySkill(payload)

  if (targets.includes('claude')) {
    const payload = payloadPath('claude', options.project)
    await writeFile(join(payload, 'claude.md'), claudeAdapter(), 'utf8')

    const claudePath = join(options.project, 'CLAUDE.md')
    const current = existsSync(claudePath) ? await readFile(claudePath, 'utf8') : ''
    if (!current.includes(CLAUDE_START)) {
      await appendFile(claudePath, `${current && !current.endsWith('\n') ? '\n' : ''}${claudeImport()}\n`, 'utf8')
    }
  }

  if (targets.includes('cursor')) {
    const rulePath = join(options.project, '.cursor', 'rules', `${SKILL_NAME}.mdc`)
    await mkdir(dirname(rulePath), { recursive: true })
    await writeFile(rulePath, cursorRule(options.project), 'utf8')
  }

  console.log(`Installed ${SKILL_NAME} for ${targets.join(', ')}.`)
}

async function doctor(options) {
  const problems = []

  for (const target of selectedTargets(options.target)) {
    const skillPath = join(payloadPath(target, options.project), 'SKILL.md')
    if (!existsSync(skillPath)) problems.push(`${target}: missing ${skillPath}`)

    if (target === 'claude') {
      const claudePath = join(options.project, 'CLAUDE.md')
      const content = existsSync(claudePath) ? await readFile(claudePath, 'utf8') : ''
      if (!content.includes(CLAUDE_START) || !content.includes(CLAUDE_END)) {
        problems.push(`claude: missing managed import in ${claudePath}`)
      }
    }

    if (target === 'cursor') {
      const rulePath = join(options.project, '.cursor', 'rules', `${SKILL_NAME}.mdc`)
      if (!existsSync(rulePath)) problems.push(`cursor: missing ${rulePath}`)
    }
  }

  if (problems.length) throw new Error(problems.join('\n'))
  console.log(`${SKILL_NAME} is installed correctly.`)
}

async function main() {
  const [command, ...rest] = process.argv.slice(2)

  if (command === 'install') {
    const [skillName, ...args] = rest
    if (skillName !== SKILL_NAME) throw new Error(`Only ${SKILL_NAME} is available.`)
    await install(parseOptions(args))
    return
  }

  if (command === 'doctor') {
    await doctor(parseOptions(rest))
    return
  }

  throw new Error(usage())
}

main().catch((error) => {
  console.error(`Error: ${error.message}`)
  process.exitCode = 1
})
