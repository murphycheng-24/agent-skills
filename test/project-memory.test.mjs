/**
 * 功能说明：验证 project-memory CLI 的 CRUD、冲突、安全校验和诊断行为。
 * 日期：2026-08-12
 * 主要接口：query、propose、apply、lint、doctor。
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'

const cli = resolve('bin', 'project-memory.mjs')

function run(args, input) {
  return execFileSync(process.execPath, [cli, ...args], { encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'pipe'] })
}

function propose(project, options) {
  return JSON.parse(run(['propose', '--project', project, ...options]))
}

test('project memory lifecycle rejects stale and unsafe writes', async () => {
  const project = await mkdtemp(join(tmpdir(), 'project-memory-'))
  const memoryDir = join(project, 'docs', 'ai')
  try {
    await mkdir(join(project, '.git'), { recursive: true })
    await mkdir(memoryDir, { recursive: true })
    await mkdir(join(project, '.cursor', 'rules'), { recursive: true })
    await writeFile(join(project, 'AGENTS.md'), '# Agent rules\n\nRead `docs/ai/project-memory.md`.\n', 'utf8')
    await writeFile(join(project, 'CLAUDE.md'), '@AGENTS.md\n', 'utf8')
    await writeFile(join(project, '.cursor', 'rules', 'project.mdc'), 'Read AGENTS.md first.\n', 'utf8')
    await writeFile(join(memoryDir, 'project-memory.md'), '# Project memory\n\n<!-- project-memory-data:start -->\n```json\n{\n  "protocolVersion": "0.2",\n  "facts": []\n}\n```\n<!-- project-memory-data:end -->\n', 'utf8')

    const add = propose(project, ['--action', 'ADD', '--id', 'req-save-draft', '--kind', 'requirement', '--statement', 'Save draft validates the selected account.', '--evidence-type', 'user-confirmed', '--evidence-ref', 'task:1', '--task-id', 'task-1', '--agent', 'codex'])
    assert.match(run(['apply', '--project', project, '--stdin', '--json'], JSON.stringify(add)), /"outcome": "APPLIED"/)
    assert.equal(JSON.parse(run(['query', '--project', project, '--id', 'req-save-draft', '--json'])).facts.length, 1)
    assert.throws(() => propose(project, ['--action', 'ADD', '--id', 'req-save-copy', '--kind', 'requirement', '--statement', 'Save draft validates the selected account.', '--evidence-type', 'user-confirmed', '--evidence-ref', 'task:duplicate']), /Duplicate fact statement/)
    assert.throws(() => run(['lint', '--project', project, '--memory', '..\\outside.md']), /Path must stay inside the project/)

    const stale = propose(project, ['--action', 'UPDATE', '--id', 'req-save-draft', '--kind', 'requirement', '--statement', 'Stale requirement.', '--evidence-type', 'user-confirmed', '--evidence-ref', 'task:2'])
    const current = propose(project, ['--action', 'UPDATE', '--id', 'req-save-draft', '--kind', 'requirement', '--statement', 'Save draft validates the account and template.', '--evidence-type', 'user-confirmed', '--evidence-ref', 'task:3'])
    run(['apply', '--project', project, '--stdin'], JSON.stringify(current))
    assert.throws(() => run(['apply', '--project', project, '--stdin'], JSON.stringify(stale)), /Project memory changed after proposal creation/)
    assert.throws(() => propose(project, ['--action', 'ADD', '--id', 'security-secret', '--kind', 'environment', '--statement', 'token=abcdefgh12345678', '--evidence-type', 'runtime', '--evidence-ref', 'local']), /may contain a secret/)
    const tampered = { ...current, proposalId: 'tampered', action: 'DELETE', id: 'req-save-draft', evidence: [] }
    assert.throws(() => run(['apply', '--project', project, '--stdin'], JSON.stringify(tampered)), /proposal.evidence must contain at least one item/)

    const remove = propose(project, ['--action', 'DELETE', '--id', 'req-save-draft', '--evidence-type', 'user-confirmed', '--evidence-ref', 'task:4', '--reason', 'Requirement was removed.'])
    run(['apply', '--project', project, '--stdin'], JSON.stringify(remove))
    const beforeNoop = await readFile(join(memoryDir, 'project-memory.md'), 'utf8')
    const noop = propose(project, ['--action', 'NOOP', '--reason', 'No reusable project fact.', '--task-id', 'task-5', '--agent', 'cursor'])
    run(['apply', '--project', project, '--stdin'], JSON.stringify(noop))
    assert.equal(await readFile(join(memoryDir, 'project-memory.md'), 'utf8'), beforeNoop)

    assert.match(run(['lint', '--project', project]), /OK \(0 facts across 1 file\(s\)\)/)
    const diagnosis = JSON.parse(run(['doctor', '--project', project, '--json']))
    assert.deepEqual(diagnosis.support, { codex: 'L2', claude: 'L2', cursor: 'L2', other: 'L1-manual' })
    assert.equal(diagnosis.metrics.eligibleProposals, 4)
    assert.equal(diagnosis.metrics.appliedProposals, 3)
    assert.equal(diagnosis.metrics.observedWriteBackRate, 0.75)
    assert.match(await readFile(join(project, '.git', 'project-memory', 'events.jsonl'), 'utf8'), /"outcome":"CONFLICT"/)
  } finally {
    await rm(project, { recursive: true, force: true })
  }
})

test('project memory --all scans root and domain volumes', async () => {
  const project = await mkdtemp(join(tmpdir(), 'project-memory-all-'))
  const memoryDir = join(project, 'docs', 'ai')
  const domainDir = join(memoryDir, 'project-memory')
  try {
    await mkdir(join(project, '.git'), { recursive: true })
    await mkdir(domainDir, { recursive: true })
    await mkdir(join(project, '.cursor', 'rules'), { recursive: true })
    await writeFile(join(project, 'AGENTS.md'), '# Agent rules\n\nRead `docs/ai/project-memory.md` and domain volumes under `project-memory/`.\n', 'utf8')
    await writeFile(join(project, 'CLAUDE.md'), '@AGENTS.md\n', 'utf8')
    await writeFile(join(project, '.cursor', 'rules', 'project.mdc'), 'Read AGENTS.md first.\n', 'utf8')
    await writeFile(
      join(memoryDir, 'project-memory.md'),
      '# Project memory\n\n<!-- project-memory-data:start -->\n```json\n{\n  "protocolVersion": "0.2",\n  "facts": []\n}\n```\n<!-- project-memory-data:end -->\n',
      'utf8',
    )
    await writeFile(
      join(domainDir, 'domain-a.md'),
      '# Domain A\n\n<!-- project-memory-data:start -->\n```json\n{\n  "protocolVersion": "0.2",\n  "facts": []\n}\n```\n<!-- project-memory-data:end -->\n',
      'utf8',
    )

    const rootFact = propose(project, [
      '--action',
      'ADD',
      '--id',
      'arch-shared',
      '--kind',
      'architecture',
      '--statement',
      'Cross-domain architecture decision.',
      '--evidence-type',
      'user-confirmed',
      '--evidence-ref',
      'task:root',
    ])
    run(['apply', '--project', project, '--stdin'], JSON.stringify(rootFact))

    const domainFact = propose(project, [
      '--memory',
      'docs/ai/project-memory/domain-a.md',
      '--action',
      'ADD',
      '--id',
      'req-domain-a',
      '--kind',
      'requirement',
      '--statement',
      'Domain A requirement.',
      '--evidence-type',
      'user-confirmed',
      '--evidence-ref',
      'task:domain',
    ])
    run(['apply', '--project', project, '--stdin'], JSON.stringify(domainFact))

    const lintAll = JSON.parse(run(['lint', '--project', project, '--all', '--json']))
    assert.equal(lintAll.facts, 2)
    assert.equal(lintAll.files.length, 2)

    const queryAll = JSON.parse(run(['query', '--project', project, '--all', '--json']))
    assert.equal(queryAll.facts.length, 2)
    assert.ok(queryAll.facts.some((fact) => fact.id === 'req-domain-a' && fact.memory === 'docs/ai/project-memory/domain-a.md'))

    const doctorAll = JSON.parse(run(['doctor', '--project', project, '--all', '--json']))
    assert.equal(doctorAll.outcome, 'OK')
    assert.equal(doctorAll.facts, 2)
  } finally {
    await rm(project, { recursive: true, force: true })
  }
})
