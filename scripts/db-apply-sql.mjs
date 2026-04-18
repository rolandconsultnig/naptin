import 'dotenv/config'
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

if (!process.env.DATABASE_URL?.trim()) {
  console.error('DATABASE_URL is not set.')
  console.error('Create a file named .env in the repository root (next to package.json), not under server/.')
  console.error('Example:')
  console.error('  DATABASE_URL=postgresql://naptin_app:YOUR_PASSWORD@127.0.0.1:5432/naptin_db')
  console.error('Then run npm from that same directory: cd /path/to/repo && npm run db:all')
  process.exit(1)
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

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
