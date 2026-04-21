import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { Pool } from 'pg'

const manifestArg = process.argv[2]
if (!manifestArg) {
  console.error('Usage: node scripts/register-legacy-backup-manifest.mjs <path-to-manifest.json> [approvedByEmail]')
  process.exit(1)
}

const approvedBy = (process.argv[3] || 'system@naptin.gov.ng').trim().toLowerCase()
const manifestPath = path.resolve(process.cwd(), manifestArg)

if (!fs.existsSync(manifestPath)) {
  console.error(`Manifest file not found: ${manifestPath}`)
  process.exit(1)
}

const raw = fs.readFileSync(manifestPath, 'utf8')
let parsed
try {
  parsed = JSON.parse(raw)
} catch {
  console.error(`Invalid JSON manifest: ${manifestPath}`)
  process.exit(1)
}

if (!Array.isArray(parsed.tables)) {
  console.error('Manifest missing required "tables" array.')
  process.exit(1)
}

const backupPath = parsed.outputDir || path.dirname(manifestPath)
const tableCount = parsed.tables.length
const nonEmptyTableCount = parsed.tables.filter((t) => Number(t?.rowCount || 0) > 0).length
const hash = crypto.createHash('sha256').update(raw).digest('hex')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

try {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS adm_legacy_backup_registry (
      id BIGSERIAL PRIMARY KEY,
      backup_path TEXT NOT NULL UNIQUE,
      manifest_sha256 TEXT,
      table_count INT,
      non_empty_table_count INT,
      approved_by TEXT NOT NULL DEFAULT 'system@naptin.gov.ng',
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  )

  const { rows } = await pool.query(
    `INSERT INTO adm_legacy_backup_registry (
      backup_path, manifest_sha256, table_count, non_empty_table_count, approved_by, notes
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (backup_path)
    DO UPDATE SET
      manifest_sha256 = EXCLUDED.manifest_sha256,
      table_count = EXCLUDED.table_count,
      non_empty_table_count = EXCLUDED.non_empty_table_count,
      approved_by = EXCLUDED.approved_by,
      notes = EXCLUDED.notes
    RETURNING id, backup_path, manifest_sha256, table_count, non_empty_table_count, approved_by, created_at`,
    [
      backupPath,
      hash,
      tableCount,
      nonEmptyTableCount,
      approvedBy,
      `registered-from:${manifestPath}`,
    ]
  )

  console.log(JSON.stringify({ ok: true, manifestPath, backupPath, registry: rows[0] }, null, 2))
} catch (error) {
  console.error(error?.message || String(error))
  process.exitCode = 1
} finally {
  await pool.end()
}
