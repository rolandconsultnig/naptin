import fs from 'fs'
import path from 'path'
import { Pool } from 'pg'

const target = process.argv[2]
if (!target) {
  console.error('Usage: node scripts/db-apply-sql.mjs <relative-sql-file>')
  process.exit(1)
}

const resolvedPath = path.resolve(process.cwd(), target)
if (!fs.existsSync(resolvedPath)) {
  console.error(`SQL file not found: ${resolvedPath}`)
  process.exit(1)
}

const sql = fs.readFileSync(resolvedPath, 'utf8')
if (!sql.trim()) {
  console.error(`SQL file is empty: ${resolvedPath}`)
  process.exit(1)
}

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/naptin_portal'
const pool = new Pool({ connectionString })

try {
  await pool.query(sql)
  console.log(`Applied SQL: ${target}`)
} catch (error) {
  console.error(`Failed applying SQL: ${target}`)
  console.error(error.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
