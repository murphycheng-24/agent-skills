#!/usr/bin/env node
/**
 * 功能说明：为仓库级共享项目记忆提供查询、提议、原子写入、校验和诊断能力。
 * 日期：2026-08-12
 * 主要接口：query、propose、apply、lint、doctor。
 */
import { createHash, randomUUID } from 'node:crypto'
import { appendFile, mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'

const PROTOCOL_VERSION = '0.2'
const START_MARKER = '<!-- project-memory-data:start -->'
const END_MARKER = '<!-- project-memory-data:end -->'
const DEFAULT_MEMORY_PATHS = ['docs/ai/project-memory.md', 'doc/ai/project-memory.md']
const ACTIONS = new Set(['ADD', 'UPDATE', 'DELETE', 'NOOP'])
const KINDS = new Set(['requirement', 'api-contract', 'architecture', 'root-cause', 'environment'])
const EVIDENCE_TYPES = new Set(['user-confirmed', 'contract', 'test', 'code', 'runtime'])

function usage() {
  return [
    'Usage:',
    '  project-memory query [--project PATH] [--memory PATH | --all] [--id ID] [--kind KIND] [--text TEXT] [--json]',
    '  project-memory propose --action ADD|UPDATE|DELETE|NOOP [fact options] [--project PATH] [--memory PATH]',
    '  project-memory apply (--proposal PATH | --stdin) [--project PATH] [--json]',
    '  project-memory lint [--project PATH] [--memory PATH | --all] [--json]',
    '  project-memory doctor [--project PATH] [--memory PATH | --all] [--json]',
    '',
    'Fact options:',
    '  --id ID --kind KIND --statement TEXT --evidence-type TYPE --evidence-ref REF',
    '  --reason TEXT --task-id ID --agent NAME',
    '',
    '--all scans the root memory file plus docs/ai/project-memory/*.md and doc/ai/project-memory/*.md.',
  ].join('\n')
}

function parseOptions(args, valueNames, booleanNames = []) {
  const values = new Set(valueNames)
  const booleans = new Set(booleanNames)
  const options = {}
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (!argument.startsWith('--')) throw new Error(`Unknown argument: ${argument}`)
    const name = argument.slice(2)
    if (booleans.has(name)) {
      options[name] = true
      continue
    }
    if (!values.has(name)) throw new Error(`Unknown option: ${argument}`)
    const value = args[index + 1]
    if (!value || value.startsWith('--')) throw new Error(`${argument} requires a value.`)
    options[name] = value
    index += 1
  }
  return options
}

function projectPath(options) {
  return resolve(options.project || '.')
}

function resolveInside(project, candidate) {
  const target = resolve(project, candidate)
  const child = relative(project, target)
  if (!child || child.startsWith(`..${sep}`) || child === '..' || isAbsolute(child)) throw new Error(`Path must stay inside the project: ${candidate}`)
  return target
}

function slashPath(path) {
  return path.split(sep).join('/')
}

function findMemoryPath(project, requested) {
  if (requested) {
    const target = resolveInside(project, requested)
    if (!existsSync(target)) throw new Error(`Memory file does not exist: ${requested}`)
    return target
  }
  const matches = DEFAULT_MEMORY_PATHS.map((path) => resolveInside(project, path)).filter(existsSync)
  if (!matches.length) throw new Error(`Project memory was not found. Expected ${DEFAULT_MEMORY_PATHS.join(' or ')}.`)
  if (matches.length > 1) throw new Error('Multiple project memory files found. Select one with --memory.')
  return matches[0]
}

function hasMemoryDataMarkers(content) {
  return content.includes(START_MARKER) && content.includes(END_MARKER)
}

async function listDomainMemoryFiles(project) {
  const directories = ['docs/ai/project-memory', 'doc/ai/project-memory']
  const files = []
  for (const directory of directories) {
    const absolute = resolve(project, directory)
    if (!existsSync(absolute)) continue
    for (const entry of await readdir(absolute, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue
      const path = join(absolute, entry.name)
      const content = await readFile(path, 'utf8')
      if (hasMemoryDataMarkers(content)) files.push(path)
    }
  }
  return files
}

async function listMemoryFiles(project, options) {
  if (options.memory && options.all) throw new Error('Use either --memory or --all, not both.')
  if (options.all) {
    const root = findMemoryPath(project)
    const domains = await listDomainMemoryFiles(project)
    const paths = [root, ...domains.filter((path) => path !== root)]
    return [...new Set(paths)]
  }
  return [findMemoryPath(project, options.memory)]
}

async function loadMemoryAt(project, path) {
  const content = await readFile(path, 'utf8')
  const parsed = parseMemory(content)
  return { project, path, memory: slashPath(relative(project, path)), content, ...parsed, currentHash: hash(content) }
}

function agentsReferencesMemory(agentsContent, memoryRelative) {
  if (agentsContent.includes(memoryRelative)) return true
  if (agentsContent.includes('project-memory/') || agentsContent.includes('project-memory\\')) return true
  return DEFAULT_MEMORY_PATHS.some((path) => agentsContent.includes(path))
}

function hash(content) {
  return createHash('sha256').update(content).digest('hex')
}

function parseMemory(content) {
  const start = content.indexOf(START_MARKER)
  const end = content.indexOf(END_MARKER)
  if (start < 0 || end < 0 || end <= start) throw new Error('Memory data markers are missing or invalid.')
  const blockStart = start + START_MARKER.length
  const rawBlock = content.slice(blockStart, end).trim()
  const match = rawBlock.match(/^```json\s*([\s\S]*?)\s*```$/)
  if (!match) throw new Error('Memory data must be a fenced JSON block.')
  let data
  try {
    data = JSON.parse(match[1])
  } catch (error) {
    throw new Error(`Memory JSON is invalid: ${error.message}`)
  }
  return { data, start, end: end + END_MARKER.length }
}

async function loadMemory(options, proposalMemory) {
  const project = projectPath(options)
  const path = proposalMemory ? resolveInside(project, proposalMemory) : findMemoryPath(project, options.memory)
  return loadMemoryAt(project, path)
}

function normalizedStatement(statement) {
  return statement.trim().toLowerCase().replace(/\s+/g, ' ')
}

function containsSecret(text) {
  return [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, /\b(?:api[_-]?key|secret|password|token)\s*[:=]\s*["']?[A-Za-z0-9_\-/+=]{8,}/i, /\bgh[pousr]_[A-Za-z0-9]{20,}\b/, /\bsk-[A-Za-z0-9]{20,}\b/].some((pattern) => pattern.test(text))
}

function validateEvidence(evidence, label, errors) {
  if (!Array.isArray(evidence) || evidence.length === 0) {
    errors.push(`${label}.evidence must contain at least one item.`)
    return
  }
  for (const [index, item] of evidence.entries()) {
    if (!item || !EVIDENCE_TYPES.has(item.type)) errors.push(`${label}.evidence[${index}].type is invalid.`)
    if (!item || typeof item.reference !== 'string' || !item.reference.trim()) errors.push(`${label}.evidence[${index}].reference is required.`)
  }
}

function validateData(data, memory, content = '') {
  const errors = []
  if (!data || data.protocolVersion !== PROTOCOL_VERSION) errors.push(`protocolVersion must be ${PROTOCOL_VERSION}.`)
  if (!data || !Array.isArray(data.facts)) return [...errors, 'facts must be an array.']
  const ids = new Set()
  const statements = new Set()
  for (const [index, fact] of data.facts.entries()) {
    const label = `facts[${index}]`
    if (!fact || typeof fact.id !== 'string' || !/^[a-z][a-z0-9-]{2,80}$/.test(fact.id)) errors.push(`${label}.id is invalid.`)
    else if (ids.has(fact.id)) errors.push(`Duplicate fact id: ${fact.id}`)
    else ids.add(fact.id)
    if (!fact || !KINDS.has(fact.kind)) errors.push(`${label}.kind is invalid.`)
    if (!fact || fact.owner !== memory) errors.push(`${label}.owner must be ${memory}.`)
    if (!fact || typeof fact.statement !== 'string' || !fact.statement.trim()) errors.push(`${label}.statement is required.`)
    else {
      const normalized = normalizedStatement(fact.statement)
      if (statements.has(normalized)) errors.push(`Duplicate fact statement: ${fact.id}`)
      statements.add(normalized)
    }
    if (!fact || typeof fact.updatedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fact.updatedAt)) errors.push(`${label}.updatedAt must use YYYY-MM-DD.`)
    validateEvidence(fact?.evidence, label, errors)
    if (fact && containsSecret(JSON.stringify(fact))) errors.push(`${label} may contain a secret.`)
  }
  if (/\{\{[^}]+\}\}|\bTODO\b/.test(content)) errors.push('Memory file contains a template placeholder or TODO.')
  if (containsSecret(content)) errors.push('Memory file may contain a secret.')
  return errors
}

function requireOption(options, name) {
  if (!options[name]) throw new Error(`--${name} is required.`)
  return options[name]
}

function evidenceFrom(options) {
  const type = requireOption(options, 'evidence-type')
  const reference = requireOption(options, 'evidence-ref')
  if (!EVIDENCE_TYPES.has(type)) throw new Error(`Unsupported evidence type: ${type}`)
  return [{ type, reference }]
}

function applyToData(data, proposal, memory) {
  const next = JSON.parse(JSON.stringify(data))
  const index = next.facts.findIndex((fact) => fact.id === proposal.id)
  if (proposal.action === 'ADD') {
    if (index >= 0) throw new Error(`Fact already exists: ${proposal.id}`)
    next.facts.push(proposal.fact)
  } else if (proposal.action === 'UPDATE') {
    if (index < 0) throw new Error(`Fact does not exist: ${proposal.id}`)
    next.facts[index] = proposal.fact
  } else if (proposal.action === 'DELETE') {
    if (index < 0) throw new Error(`Fact does not exist: ${proposal.id}`)
    next.facts.splice(index, 1)
  } else if (proposal.action !== 'NOOP') {
    throw new Error(`Unsupported action: ${proposal.action}`)
  }
  const errors = validateData(next, memory)
  if (errors.length) throw new Error(errors.join('\n'))
  return next
}

function validateProposal(proposal, memory) {
  const errors = []
  if (!proposal || proposal.protocolVersion !== PROTOCOL_VERSION) errors.push(`Proposal protocolVersion must be ${PROTOCOL_VERSION}.`)
  if (!proposal || typeof proposal.proposalId !== 'string' || !proposal.proposalId) errors.push('Proposal proposalId is required.')
  if (!proposal || !ACTIONS.has(proposal.action)) errors.push('Proposal action is invalid.')
  if (!proposal || typeof proposal.baseHash !== 'string' || !/^[a-f0-9]{64}$/.test(proposal.baseHash)) errors.push('Proposal baseHash is invalid.')
  if (!proposal || proposal.memory !== memory) errors.push(`Proposal memory must be ${memory}.`)
  if (proposal?.action === 'NOOP') {
    if (typeof proposal.reason !== 'string' || !proposal.reason.trim()) errors.push('NOOP proposal reason is required.')
  } else if (proposal) {
    if (typeof proposal.id !== 'string' || !/^[a-z][a-z0-9-]{2,80}$/.test(proposal.id)) errors.push('Proposal id is invalid.')
    validateEvidence(proposal.evidence, 'proposal', errors)
    if (proposal.action === 'ADD' || proposal.action === 'UPDATE') {
      if (!proposal.fact || proposal.fact.id !== proposal.id) errors.push('Proposal fact id must match proposal id.')
      if (!proposal.fact || proposal.fact.owner !== memory) errors.push(`Proposal fact owner must be ${memory}.`)
    }
  }
  if (containsSecret(JSON.stringify(proposal))) errors.push('Proposal may contain a secret.')
  return errors
}

function replaceDataBlock(loaded, data) {
  const newline = loaded.content.includes('\r\n') ? '\r\n' : '\n'
  const json = JSON.stringify(data, null, 2).replace(/\n/g, newline)
  const block = `${START_MARKER}${newline}\`\`\`json${newline}${json}${newline}\`\`\`${newline}${END_MARKER}`
  return `${loaded.content.slice(0, loaded.start)}${block}${loaded.content.slice(loaded.end)}`
}

async function atomicWrite(path, content) {
  const temporary = join(dirname(path), `.${basename(path)}.${randomUUID()}.tmp`)
  await writeFile(temporary, content, { encoding: 'utf8', flag: 'wx' })
  try {
    await rename(temporary, path)
  } finally {
    await rm(temporary, { force: true })
  }
}

async function gitDirectory(project) {
  const dotGit = join(project, '.git')
  if (!existsSync(dotGit)) return null
  const info = await stat(dotGit)
  if (info.isDirectory()) return dotGit
  const pointer = (await readFile(dotGit, 'utf8')).trim().match(/^gitdir:\s*(.+)$/i)
  return pointer ? resolve(project, pointer[1]) : null
}

async function appendEvent(project, event) {
  const gitDir = await gitDirectory(project)
  if (!gitDir) return
  const eventDir = join(gitDir, 'project-memory')
  await mkdir(eventDir, { recursive: true })
  await appendFile(join(eventDir, 'events.jsonl'), `${JSON.stringify({ eventVersion: 1, at: new Date().toISOString(), ...event })}\n`, 'utf8')
}

async function readEvents(project) {
  const gitDir = await gitDirectory(project)
  if (!gitDir) return []
  const path = join(gitDir, 'project-memory', 'events.jsonl')
  if (!existsSync(path)) return []
  return (await readFile(path, 'utf8'))
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line)
      } catch {
        throw new Error(`Invalid event JSON at line ${index + 1}.`)
      }
    })
}

function observedMetrics(events) {
  const eligible = new Set(events.filter((event) => event.command === 'propose' && event.action !== 'NOOP').map((event) => event.proposalId))
  const applied = new Set(events.filter((event) => event.command === 'apply' && event.outcome === 'APPLIED').map((event) => event.proposalId))
  const appliedEligible = [...eligible].filter((id) => applied.has(id)).length
  return { eligibleProposals: eligible.size, appliedProposals: appliedEligible, observedWriteBackRate: eligible.size ? appliedEligible / eligible.size : null }
}

async function query(args) {
  const options = parseOptions(args, ['project', 'memory', 'id', 'kind', 'text'], ['json', 'all'])
  const project = projectPath(options)
  const paths = await listMemoryFiles(project, options)
  const text = options.text?.toLowerCase()
  const memories = []
  const facts = []
  for (const path of paths) {
    const loaded = await loadMemoryAt(project, path)
    const errors = validateData(loaded.data, loaded.memory, loaded.content)
    if (errors.length) throw new Error(`${loaded.memory}: ${errors.join('\n')}`)
    memories.push(loaded.memory)
    for (const fact of loaded.data.facts) {
      if (options.id && fact.id !== options.id) continue
      if (options.kind && fact.kind !== options.kind) continue
      if (text && !fact.statement.toLowerCase().includes(text)) continue
      facts.push({ ...fact, memory: loaded.memory })
    }
  }
  if (options.json) console.log(JSON.stringify({ protocolVersion: PROTOCOL_VERSION, memories, facts }, null, 2))
  else console.log(facts.length ? facts.map((fact) => `- [${fact.id}] (${fact.kind}) @${fact.memory} ${fact.statement}`).join('\n') : 'No matching facts.')
}

async function propose(args) {
  const options = parseOptions(args, ['project', 'memory', 'action', 'id', 'kind', 'statement', 'evidence-type', 'evidence-ref', 'reason', 'task-id', 'agent'])
  const loaded = await loadMemory(options)
  const currentErrors = validateData(loaded.data, loaded.memory, loaded.content)
  if (currentErrors.length) throw new Error(currentErrors.join('\n'))
  const action = requireOption(options, 'action').toUpperCase()
  if (!ACTIONS.has(action)) throw new Error(`Unsupported action: ${action}`)
  const proposal = { protocolVersion: PROTOCOL_VERSION, proposalId: randomUUID(), action, memory: loaded.memory, baseHash: loaded.currentHash, taskId: options['task-id'] || null, agent: options.agent || 'unknown' }
  if (action === 'NOOP') proposal.reason = requireOption(options, 'reason')
  else {
    proposal.id = requireOption(options, 'id')
    proposal.evidence = evidenceFrom(options)
    proposal.reason = options.reason || null
    if (action === 'ADD' || action === 'UPDATE') {
      proposal.fact = { id: proposal.id, kind: requireOption(options, 'kind'), owner: loaded.memory, statement: requireOption(options, 'statement'), evidence: proposal.evidence, updatedAt: new Date().toISOString().slice(0, 10) }
    }
  }
  const proposalErrors = validateProposal(proposal, loaded.memory)
  if (proposalErrors.length) throw new Error(proposalErrors.join('\n'))
  applyToData(loaded.data, proposal, loaded.memory)
  await appendEvent(loaded.project, { command: 'propose', proposalId: proposal.proposalId, action, factId: proposal.id || null, taskId: proposal.taskId, agent: proposal.agent, outcome: 'PROPOSED' })
  console.log(JSON.stringify(proposal, null, 2))
}

async function proposalInput(options) {
  if (options.stdin && options.proposal) throw new Error('Use either --stdin or --proposal, not both.')
  if (options.stdin) {
    const chunks = []
    for await (const chunk of process.stdin) chunks.push(chunk)
    return Buffer.concat(chunks).toString('utf8')
  }
  return readFile(requireOption(options, 'proposal'), 'utf8')
}

async function apply(args) {
  const options = parseOptions(args, ['project', 'proposal'], ['stdin', 'json'])
  let proposal
  try {
    proposal = JSON.parse(await proposalInput(options))
  } catch (error) {
    throw new Error(`Proposal JSON is invalid: ${error.message}`)
  }
  const loaded = await loadMemory(options, proposal.memory)
  const currentErrors = validateData(loaded.data, loaded.memory, loaded.content)
  if (currentErrors.length) throw new Error(currentErrors.join('\n'))
  const proposalErrors = validateProposal(proposal, loaded.memory)
  if (proposalErrors.length) throw new Error(proposalErrors.join('\n'))
  if (proposal.baseHash !== loaded.currentHash) {
    await appendEvent(loaded.project, { command: 'apply', proposalId: proposal.proposalId, action: proposal.action, factId: proposal.id || null, taskId: proposal.taskId || null, agent: proposal.agent || 'unknown', outcome: 'CONFLICT' })
    throw new Error('Project memory changed after proposal creation. Re-run propose against the latest file.')
  }
  const data = applyToData(loaded.data, proposal, loaded.memory)
  let resultHash = loaded.currentHash
  if (proposal.action !== 'NOOP') {
    const content = replaceDataBlock(loaded, data)
    const errors = validateData(data, loaded.memory, content)
    if (errors.length) throw new Error(errors.join('\n'))
    await atomicWrite(loaded.path, content)
    resultHash = hash(content)
  }
  await appendEvent(loaded.project, { command: 'apply', proposalId: proposal.proposalId, action: proposal.action, factId: proposal.id || null, taskId: proposal.taskId || null, agent: proposal.agent || 'unknown', outcome: 'APPLIED', baseHash: proposal.baseHash, resultHash })
  const result = { outcome: 'APPLIED', action: proposal.action, factId: proposal.id || null, memory: loaded.memory, resultHash }
  console.log(options.json ? JSON.stringify(result, null, 2) : `${proposal.action} applied to ${loaded.memory}.`)
}

async function lint(args) {
  const options = parseOptions(args, ['project', 'memory'], ['json', 'all'])
  const project = projectPath(options)
  const paths = await listMemoryFiles(project, options)
  const files = []
  let totalFacts = 0
  for (const path of paths) {
    const loaded = await loadMemoryAt(project, path)
    const errors = validateData(loaded.data, loaded.memory, loaded.content)
    if (errors.length) throw new Error(`${loaded.memory}: ${errors.join('\n')}`)
    totalFacts += loaded.data.facts.length
    files.push({ memory: loaded.memory, facts: loaded.data.facts.length, hash: loaded.currentHash })
  }
  const result = {
    outcome: 'OK',
    protocolVersion: PROTOCOL_VERSION,
    memory: files[0]?.memory,
    memories: files.map((file) => file.memory),
    files,
    facts: totalFacts,
    hash: files[0]?.hash,
  }
  console.log(options.json ? JSON.stringify(result, null, 2) : `project-memory lint: OK (${result.facts} facts across ${files.length} file(s))`)
}

async function cursorAdapter(project) {
  const rules = join(project, '.cursor', 'rules')
  if (!existsSync(rules)) return 'not-configured'
  for (const entry of await readdir(rules, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.mdc') && (await readFile(join(rules, entry.name), 'utf8')).includes('AGENTS.md')) return 'L2'
  }
  return 'invalid'
}

async function doctorOne(project, path, agentsContent, support, metrics) {
  const loaded = await loadMemoryAt(project, path)
  const errors = validateData(loaded.data, loaded.memory, loaded.content)
  if (!agentsContent) errors.push('AGENTS.md is missing.')
  else if (!agentsReferencesMemory(agentsContent, loaded.memory)) errors.push(`AGENTS.md does not reference ${loaded.memory} or the project-memory entry path.`)
  return { loaded, errors, support, metrics }
}

async function doctor(args) {
  const options = parseOptions(args, ['project', 'memory'], ['json', 'all'])
  const project = projectPath(options)
  const paths = await listMemoryFiles(project, options)
  const agentPath = join(project, 'AGENTS.md')
  const agentsContent = existsSync(agentPath) ? await readFile(agentPath, 'utf8') : ''
  const gitDir = await gitDirectory(project)
  const claudePath = join(project, 'CLAUDE.md')
  const support = {
    codex: existsSync(agentPath) ? 'L2' : 'invalid',
    claude: existsSync(claudePath) ? ((await readFile(claudePath, 'utf8')).includes('AGENTS.md') ? 'L2' : 'invalid') : 'not-configured',
    cursor: await cursorAdapter(project),
    other: 'L1-manual'
  }
  const metrics = observedMetrics(await readEvents(project))
  const files = []
  const errors = []
  if (!gitDir) errors.push('Git metadata is required for concurrency history and local events.')
  if (support.claude === 'invalid') errors.push('CLAUDE.md does not reference AGENTS.md.')
  if (support.cursor === 'invalid') errors.push('Cursor rules do not reference AGENTS.md.')
  for (const path of paths) {
    const result = await doctorOne(project, path, agentsContent, support, metrics)
    errors.push(...result.errors.map((error) => `${result.loaded.memory}: ${error}`))
    files.push({ memory: result.loaded.memory, facts: result.loaded.data.facts.length })
  }
  if (errors.length) throw new Error(errors.join('\n'))
  const result = {
    outcome: 'OK',
    protocolVersion: PROTOCOL_VERSION,
    memory: files[0]?.memory,
    memories: files.map((file) => file.memory),
    files,
    facts: files.reduce((sum, file) => sum + file.facts, 0),
    support,
    metrics,
  }
  console.log(options.json ? JSON.stringify(result, null, 2) : `project-memory doctor: OK\n${JSON.stringify(result, null, 2)}`)
}

async function main() {
  const [command, ...args] = process.argv.slice(2)
  if (!command || command === '--help' || command === '-h') {
    console.log(usage())
    return
  }
  const commands = { query, propose, apply, lint, doctor }
  if (!commands[command]) throw new Error(usage())
  await commands[command](args)
}

main().catch((error) => {
  console.error(`Error: ${error.message}`)
  process.exitCode = 1
})
