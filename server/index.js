import express from 'express'
import cors from 'cors'
import workbenchRoutes from './routes/workbench.js'
import adminRbacRoutes from './routes/adminRbac.js'
import { pool } from './db.js'

const app = express()
const port = Number(process.env.API_PORT || 4002)

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '2mb' }))

app.get('/api/v1/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true, db: 'connected' })
  } catch {
    res.status(500).json({ ok: false, db: 'disconnected' })
  }
})

app.use('/api/v1/workbench', workbenchRoutes)
app.use('/api/v1/admin/rbac', adminRbacRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(400).json({
    error: err?.message || 'Request failed',
  })
})

app.listen(port, () => {
  console.log(`NAPTIN API listening on http://localhost:${port}`)
})

