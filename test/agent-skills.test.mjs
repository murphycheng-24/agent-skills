/**
 * 功能说明：验证 Agent Skills CLI 的跨工具安装入口。
 * 日期：2026-08-03
 * 主要接口：agent-skills install、agent-skills doctor
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'

const cli = resolve('bin', 'agent-skills.mjs')

function run(args, env) {
  return execFileSync(process.execPath, [cli, ...args], {
    encoding: 'utf8',
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

test('installs and verifies every bundled skill for all supported targets', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agent-skills-'))
  const env = { ...process.env, CODEX_HOME: join(root, 'codex-home') }
  try {
    for (const skillName of ['bootstrap-project-ai-governance', 'challenge-plan', 'code-review']) {
      const project = join(root, skillName)
      run(['install', skillName, '--target', 'all', '--project', project], env)
      assert.equal(existsSync(join(env.CODEX_HOME, 'skills', skillName, 'SKILL.md')), true)
      assert.equal(existsSync(join(project, '.agent-skills', skillName, 'SKILL.md')), true)
      assert.match(await readFile(join(project, 'CLAUDE.md'), 'utf8'), new RegExp(`agent-skills:${skillName}:start`))
      assert.match(await readFile(join(project, '.cursor', 'rules', `${skillName}.mdc`), 'utf8'), /alwaysApply: false/)
      const doctorArgs = skillName === 'challenge-plan' ? ['doctor'] : ['doctor', skillName]
      assert.match(run([...doctorArgs, '--target', 'all', '--project', project], env), /installed correctly/)
    }
    assert.equal(existsSync(join(root, 'code-review', '.agent-skills', 'code-review', 'scripts', 'analyze_commits.py')), true)
    assert.equal(existsSync(join(root, 'bootstrap-project-ai-governance', '.agent-skills', 'bootstrap-project-ai-governance', 'assets', 'templates', 'AGENTS.md')), true)
    assert.equal(existsSync(join(root, 'bootstrap-project-ai-governance', '.agent-skills', 'bootstrap-project-ai-governance', 'references', 'acceptance.md')), true)
    assert.equal(existsSync(join(root, 'bootstrap-project-ai-governance', '.agent-skills', 'bootstrap-project-ai-governance', 'references', 'git-governance.md')), true)
    assert.equal(existsSync(join(root, 'bootstrap-project-ai-governance', '.agent-skills', 'bootstrap-project-ai-governance', 'references', 'runtime-memory.md')), true)
    assert.match(await readFile(join(root, 'bootstrap-project-ai-governance', '.agent-skills', 'bootstrap-project-ai-governance', 'references', 'git-governance.md'), 'utf8'), /<type>\(<scope>\): <subject>/)
    assert.match(await readFile(join(root, 'code-review', '.cursor', 'rules', 'code-review.mdc'), 'utf8'), /代码审查/)
    assert.match(await readFile(join(root, 'bootstrap-project-ai-governance', '.cursor', 'rules', 'bootstrap-project-ai-governance.mdc'), 'utf8'), /project AI governance/)
    assert.match(await readFile(join(root, 'bootstrap-project-ai-governance', '.cursor', 'rules', 'bootstrap-project-ai-governance.mdc'), 'utf8'), /git-governance\.md/)
    assert.throws(() => run(['install', 'code-review', '--target', 'cursor', '--project', join(root, 'code-review')], env), /already exists/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
