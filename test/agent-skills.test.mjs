/**
 * 功能说明：验证 Agent Skills CLI 的跨工具安装入口。
 * 日期：2026-07-16
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
  return execFileSync(process.execPath, [cli, ...args], { encoding: 'utf8', env, stdio: ['ignore', 'pipe', 'pipe'] })
}

test('installs and verifies every bundled skill for all supported targets', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agent-skills-'))
  const env = { ...process.env, CODEX_HOME: join(root, 'codex-home') }
  try {
    for (const skillName of ['challenge-plan', 'code-review']) {
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
    assert.match(await readFile(join(root, 'code-review', '.cursor', 'rules', 'code-review.mdc'), 'utf8'), /代码审查/)
    assert.throws(() => run(['install', 'code-review', '--target', 'cursor', '--project', join(root, 'code-review')], env), /already exists/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
