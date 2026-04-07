import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/naptin_portal'

export const pool = new Pool({
  connectionString,
})

export async function query(text, params = []) {
  const res = await pool.query(text, params)
  return res.rows
}

export async function withTx(work) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await work(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

