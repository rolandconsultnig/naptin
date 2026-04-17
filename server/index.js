import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import workbenchRoutes from './routes/workbench.js'
import adminRbacRoutes from './routes/adminRbac.js'
import intranetRoutes from './routes/intranet.js'
import hrmsCoreRoutes from './routes/hrmsCore.js'
import hrmsLeaveRoutes from './routes/hrmsLeave.js'
import hrmsAttendanceRoutes from './routes/hrmsAttendance.js'
import hrmsPayrollRoutes from './routes/hrmsPayroll.js'
import hrmsRecruitmentRoutes from './routes/hrmsRecruitment.js'
import hrmsPerformanceRoutes from './routes/hrmsPerformance.js'
import hrmsTrainingRoutes from './routes/hrmsTraining.js'
import financeRoutes from './routes/finance.js'
import procurementRoutes from './routes/procurement.js'
import ictRoutes from './routes/ict.js'
import collaborationRoutes from './routes/collaboration.js'
import whistleblowerRoutes from './routes/whistleblower.js'
import workflowRoutes from './routes/workflow.js'
import cashAdvanceRoutes from './routes/cashAdvance.js'
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

// Friendly root when someone opens the API host in a browser (SPA runs on Vite, not this port).
app.get('/', (_req, res) => {
  res.type('html').send(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>NAPTIN API</title></head><body style="font-family:system-ui,sans-serif;padding:2rem">' +
      '<p><strong>This is the JSON API</strong> — open the staff portal from your Vite dev server (usually <code>http://localhost:5173</code>).</p>' +
      '<p>Health check: <a href="/api/v1/health">/api/v1/health</a></p></body></html>'
  )
})

// Chrome DevTools may probe this URL; returning 204 avoids a noisy 404 in the Network panel.
app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => {
  res.status(204).end()
})

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
app.use('/api/v1/hrms', hrmsCoreRoutes)
app.use('/api/v1/hrms/leave', hrmsLeaveRoutes)
app.use('/api/v1/hrms/attendance', hrmsAttendanceRoutes)
app.use('/api/v1/hrms/payroll', hrmsPayrollRoutes)
app.use('/api/v1/hrms/recruitment', hrmsRecruitmentRoutes)
app.use('/api/v1/hrms/performance', hrmsPerformanceRoutes)
app.use('/api/v1/hrms/training', hrmsTrainingRoutes)
app.use('/api/v1/finance', financeRoutes)
app.use('/api/v1/procurement', procurementRoutes)
app.use('/api/v1/ict', ictRoutes)
app.use('/api/v1/collaboration', collaborationRoutes)
app.use('/api/v1/whistleblower', whistleblowerRoutes)
app.use('/api/v1/workflow', workflowRoutes)
app.use('/api/v1/finance/cash-advances', cashAdvanceRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(400).json({
    error: err?.message || 'Request failed',
  })
})

app.listen(port, () => {
  console.log(`NAPTIN API listening on http://localhost:${port}`)
})

