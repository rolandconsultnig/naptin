import { Pool } from 'pg'

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Create a .env file — see .env.example.')
  process.exit(1)
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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

