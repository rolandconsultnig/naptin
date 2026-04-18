#!/usr/bin/env node
/**
 * Export the current PostgreSQL database used by the NAPTIN API (and Owl Talk when it shares DATABASE_URL).
 *
 * Requires: `pg_dump` on PATH (PostgreSQL client tools).
 * Usage: from repo root with `.env` loaded:
 *   npm run db:export
 *
 * Output: database/exports/naptin-pg-<timestamp>.sql
 * By default exports are gitignored (may contain PII/secrets). For a private repo, force-add if needed:
 *   git add -f database/exports/naptin-pg-*.sql
 */
import 'dotenv/config'
import { mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const url = (process.env.DATABASE_URL || '').trim()

if (!url) {
  console.error('DATABASE_URL is not set. Add it to .env (see .env.example).')
  process.exit(1)
}

const outDir = join(root, 'database', 'exports')
mkdirSync(outDir, { recursive: true })
const stamp = new Date().toISOString().replace(/:/g, '-').replace(/\.\d{3}Z$/, 'Z')
const outfile = join(outDir, `naptin-pg-${stamp}.sql`)

const args = ['--dbname', url, '--format', 'plain', '--no-owner', '--no-acl', '-f', outfile]
const r = spawnSync('pg_dump', args, { stdio: 'inherit', encoding: 'utf8' })

if (r.status !== 0) {
  console.error('pg_dump failed. Install PostgreSQL client tools and ensure DATABASE_URL is valid.')
  process.exit(r.status ?? 1)
}

console.log(`\nWrote: ${outfile}\n`)
