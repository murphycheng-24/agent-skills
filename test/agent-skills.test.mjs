/**
 * 功能说明：验证 Agent Skills CLI 的跨工具安装入口。
 * 日期：2026-07-16
 * 主要接口：agent-skills install、agent-skills doctor。
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
    stdio: ['ignore', 'pipe', 'pipe']
  })
}

test('installs and verifies challenge-plan for all supported targets', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agent-skills-'))
  const project = join(root, 'project')
  const env = { ...process.env, CODEX_HOME: join(root, 'codex-home') }

  try {
    run(['install', 'challenge-plan', '--target', 'all', '--project', project], env)

    assert.equal(existsSync(join(env.CODEX_HOME, 'skills', 'challenge-plan', 'SKILL.md')), true)
    assert.equal(existsSync(join(project, '.agent-skills', 'challenge-plan', 'references', 'karpathy-guidelines.md')), true)
    assert.match(await readFile(join(project, 'CLAUDE.md'), 'utf8'), /agent-skills:challenge-plan:start/)
    assert.match(await readFile(join(project, '.cursor', 'rules', 'challenge-plan.mdc'), 'utf8'), /alwaysApply: false/)
    assert.match(run(['doctor', '--target', 'all', '--project', project], env), /installed correctly/)
    assert.throws(
      () => run(['install', 'challenge-plan', '--target', 'cursor', '--project', project], env),
      /already exists/
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
