import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import workbenchRoutes from './routes/workbench.js'
import adminRbacRoutes from './routes/adminRbac.js'
import intranetRoutes from './routes/intranet.js'
import { pool } from './db.js'

const app = express()
const port = Number(process.env.API_PORT || 4002)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.resolve(__dirname, '../uploads/intranet')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use('/uploads/intranet', express.static(uploadsDir))

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
app.use('/api/v1/intranet', intranetRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(400).json({
    error: err?.message || 'Request failed',
  })
})

app.listen(port, () => {
  console.log(`NAPTIN API listening on http://localhost:${port}`)
})

