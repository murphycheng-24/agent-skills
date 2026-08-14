#!/usr/bin/env node
/**
 * 功能说明：按 manifest 下载并校验上游 Agent Skill 的固定 Git blob 快照。
 * 日期：2026-08-14
 * 主要接口：syncVendoredSkill(manifestPath)
 */
import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function resolveInside(root, path) {
  if (!path || isAbsolute(path)) throw new Error(`Path must be relative: ${path}`)
  const resolved = resolve(root, path)
  const relativePath = relative(root, resolved)
  if (relativePath.startsWith('..') || isAbsolute(relativePath)) throw new Error(`Path escapes package root: ${path}`)
  return resolved
}

function gitBlobSha(content) {
  return createHash('sha1').update(`blob ${content.length}\0`).update(content).digest('hex')
}

async function readUpstreamBlob(repository, sha) {
  const response = await fetch(`https://api.github.com/repos/${repository}/git/blobs/${sha}`, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!response.ok) throw new Error(`Unable to read ${repository}@${sha}: HTTP ${response.status}`)
  const blob = await response.json()
  if (blob.encoding !== 'base64') throw new Error(`Unsupported blob encoding for ${sha}: ${blob.encoding}`)
  return Buffer.from(blob.content.replace(/\n/g, ''), 'base64')
}

export async function syncVendoredSkill(manifestPath) {
  const manifest = JSON.parse(await readFile(resolve(PACKAGE_ROOT, manifestPath), 'utf8'))
  const target = resolveInside(PACKAGE_ROOT, manifest.targetPath)
  const { repository, commit, files } = manifest.source || {}
  if (!manifest.skill || !repository || !commit || !Array.isArray(files) || files.length === 0) throw new Error('Invalid vendor manifest.')

  const temporary = join(dirname(target), `.${manifest.skill}-${randomUUID()}`)
  await mkdir(temporary, { recursive: true })
  try {
    for (const file of files) {
      const destination = resolveInside(temporary, file.path)
      const content = await readUpstreamBlob(repository, file.sha)
      if (gitBlobSha(content) !== file.sha) throw new Error(`Blob checksum mismatch: ${file.path}`)
      await mkdir(dirname(destination), { recursive: true })
      await writeFile(destination, content)
    }
    await rm(target, { recursive: true, force: true })
    await rename(temporary, target)
  } catch (error) {
    await rm(temporary, { recursive: true, force: true })
    throw error
  }

  console.log(`Synced ${manifest.skill} from ${repository}@${commit}.`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [manifestPath] = process.argv.slice(2)
  if (!manifestPath) throw new Error('Usage: sync-vendored-skill <manifest-path>')
  syncVendoredSkill(manifestPath).catch((error) => {
    console.error(`Error: ${error.message}`)
    process.exitCode = 1
  })
}
