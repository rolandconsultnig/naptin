import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { Pool } from 'pg'

const legacyTables = [
  'call',
  'group',
  'group_log',
  'group_member',
  'media',
  'meeting',
  'meeting_message',
  'meeting_participant',
  'meeting_slide',
  'message',
  'presentation_recording',
  'tenant',
  'tenant_audit_event',
  'tenant_member',
  'tenant_module_policy',
  'user',
]

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

function nowStamp() {
  const d = new Date()
  const pad = (v) => String(v).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

const outDir = path.resolve(process.cwd(), 'database', 'legacy-backup', nowStamp())
fs.mkdirSync(outDir, { recursive: true })

const manifest = {
  createdAt: new Date().toISOString(),
  databaseUrlPresent: Boolean(process.env.DATABASE_URL),
  outputDir: outDir,
  tables: [],
}

try {
  for (const table of legacyTables) {
    const existsRes = await pool.query(
      `SELECT to_regclass($1) IS NOT NULL AS exists`,
      [`public.${table}`]
    )
    const exists = Boolean(existsRes.rows[0]?.exists)
    if (!exists) {
      manifest.tables.push({ table, exists: false, rowCount: 0, file: null })
      continue
    }

    const safe = table.replace(/"/g, '""')
    const dataRes = await pool.query(`SELECT * FROM "${safe}" ORDER BY 1`)
    const fileName = `${table}.json`
    const filePath = path.join(outDir, fileName)
    fs.writeFileSync(filePath, JSON.stringify(dataRes.rows, null, 2), 'utf8')

    manifest.tables.push({
      table,
      exists: true,
      rowCount: dataRes.rows.length,
      file: fileName,
    })
  }

  const manifestPath = path.join(outDir, 'manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')

  const summary = {
    outputDir: outDir,
    tablesBackedUp: manifest.tables.filter((t) => t.exists).length,
    missingTables: manifest.tables.filter((t) => !t.exists).map((t) => t.table),
    nonEmptyTables: manifest.tables.filter((t) => t.exists && t.rowCount > 0).map((t) => ({ table: t.table, rowCount: t.rowCount })),
  }
  console.log(JSON.stringify(summary, null, 2))
} catch (error) {
  console.error(error?.message || String(error))
  process.exitCode = 1
} finally {
  await pool.end()
}
