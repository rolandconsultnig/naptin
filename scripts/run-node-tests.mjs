#!/usr/bin/env node
import { readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, 'tests')
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.test.mjs'))
  .map((f) => join(dir, f))
  .sort()

if (files.length === 0) {
  console.error('No tests/*.test.mjs files found')
  process.exit(1)
}

const r = spawnSync(process.execPath, ['--test', ...files], {
  stdio: 'inherit',
  cwd: root,
})

process.exit(r.status ?? 1)
