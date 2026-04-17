import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db.js'

const router = Router()

// ─── Tickets ────────────────────────────────────────────────────

router.get('/tickets', async (req, res, next) => {
  try {
    const status = (req.query.status || '').trim()
    const category = (req.query.category || '').trim()
    const priority = (req.query.priority || '').trim()
    const conditions = []
    const params = []

    if (status && status !== 'all') {
      params.push(status)
      conditions.push(`t.status = $${params.length}`)
    }
    if (category && category !== 'all') {
      params.push(category)
      conditions.push(`t.category = $${params.length}`)
    }
    if (priority && priority !== 'all') {
      params.push(priority)
      conditions.push(`t.priority = $${params.length}`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const rows = await query(
      `SELECT t.* FROM ict_tickets t ${where} ORDER BY t.created_at DESC`,
      params
    )

    res.json(rows.map(r => ({
      id: r.id, ticketNo: r.ticket_no, title: r.title,
      description: r.description, category: r.category,
      priority: r.priority, status: r.status,
      reportedBy: r.reported_by, assignedTo: r.assigned_to,
      department: r.department, resolvedAt: r.resolved_at,
      resolutionNotes: r.resolution_notes,
      slaDeadline: r.sla_deadline, createdAt: r.created_at,
    })))
  } catch (e) { next(e) }
})

router.post('/tickets', async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string().min(2),
      description: z.string().optional().default(''),
      category: z.enum(['hardware', 'software', 'network', 'email', 'access', 'other']).default('other'),
      priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
      reportedBy: z.string(),
      department: z.string().optional().nullable(),
    }).parse(req.body)

    const seq = Date.now().toString(36).toUpperCase()
    const ticketNo = `ICT-${seq}`

    // SLA deadlines by priority (hours from now)
    const slaHours = { critical: 2, high: 4, medium: 8, low: 24 }
    const hours = slaHours[data.priority] || 8
    const slaDeadline = new Date(Date.now() + hours * 3600 * 1000).toISOString()

    const [row] = await query(
      `INSERT INTO ict_tickets
        (ticket_no, title, description, category, priority, reported_by, department, sla_deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [ticketNo, data.title, data.description, data.category,
       data.priority, data.reportedBy, data.department, slaDeadline]
    )
    res.status(201).json({ id: row.id, ticketNo: row.ticket_no })
  } catch (e) { next(e) }
})

router.patch('/tickets/:id/assign', async (req, res, next) => {
  try {
    const data = z.object({ assignedTo: z.string().min(1) }).parse(req.body)
    const [row] = await query(
      `UPDATE ict_tickets SET assigned_to = $1, status = 'in_progress'
       WHERE id = $2 RETURNING *`,
      [data.assignedTo, req.params.id]
    )
    if (!row) return res.status(404).json({ error: 'Ticket not found' })
    res.json({ id: row.id, assignedTo: row.assigned_to, status: row.status })
  } catch (e) { next(e) }
})

router.patch('/tickets/:id/resolve', async (req, res, next) => {
  try {
    const data = z.object({
      resolutionNotes: z.string().min(3),
    }).parse(req.body)

    const [row] = await query(
      `UPDATE ict_tickets
       SET status = 'resolved', resolved_at = NOW(), resolution_notes = $1
       WHERE id = $2 AND status != 'closed'
       RETURNING *`,
      [data.resolutionNotes, req.params.id]
    )
    if (!row) return res.status(400).json({ error: 'Ticket cannot be resolved' })
    res.json({ id: row.id, status: row.status, resolvedAt: row.resolved_at })
  } catch (e) { next(e) }
})

router.patch('/tickets/:id/close', async (req, res, next) => {
  try {
    const [row] = await query(
      `UPDATE ict_tickets SET status = 'closed'
       WHERE id = $1 AND status = 'resolved' RETURNING *`,
      [req.params.id]
    )
    if (!row) return res.status(400).json({ error: 'Only resolved tickets can be closed' })
    res.json({ id: row.id, status: row.status })
  } catch (e) { next(e) }
})

// ─── ICT Assets ─────────────────────────────────────────────────

router.get('/assets', async (req, res, next) => {
  try {
    const status = (req.query.status || '').trim()
    const cond = status && status !== 'all' ? `WHERE a.status = $1` : ''
    const params = status && status !== 'all' ? [status] : []

    const rows = await query(
      `SELECT a.* FROM ict_assets a ${cond} ORDER BY a.asset_tag`,
      params
    )
    res.json(rows.map(r => ({
      id: r.id, assetTag: r.asset_tag, name: r.name,
      category: r.category, manufacturer: r.manufacturer,
      model: r.model, serialNumber: r.serial_number,
      assignedTo: r.assigned_to, department: r.department,
      location: r.location, purchaseDate: r.purchase_date,
      warrantyExpiry: r.warranty_expiry, status: r.status,
      ipAddress: r.ip_address, macAddress: r.mac_address,
    })))
  } catch (e) { next(e) }
})

router.post('/assets', async (req, res, next) => {
  try {
    const data = z.object({
      name: z.string().min(2),
      category: z.string().default('computer'),
      manufacturer: z.string().optional().nullable(),
      model: z.string().optional().nullable(),
      serialNumber: z.string().optional().nullable(),
      assignedTo: z.string().optional().nullable(),
      department: z.string().optional().nullable(),
      location: z.string().optional().nullable(),
      purchaseDate: z.string().optional().nullable(),
      warrantyExpiry: z.string().optional().nullable(),
      ipAddress: z.string().optional().nullable(),
      macAddress: z.string().optional().nullable(),
    }).parse(req.body)

    const seq = Date.now().toString(36).toUpperCase().slice(-6)
    const tag = `ICT-${data.category.toUpperCase().slice(0, 3)}-${seq}`

    const [row] = await query(
      `INSERT INTO ict_assets
        (asset_tag, name, category, manufacturer, model, serial_number,
         assigned_to, department, location, purchase_date, warranty_expiry,
         ip_address, mac_address)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [tag, data.name, data.category, data.manufacturer, data.model,
       data.serialNumber, data.assignedTo, data.department, data.location,
       data.purchaseDate, data.warrantyExpiry, data.ipAddress, data.macAddress]
    )
    res.status(201).json({ id: row.id, assetTag: row.asset_tag })
  } catch (e) { next(e) }
})

// ─── Change Requests ────────────────────────────────────────────

router.get('/change-requests', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT * FROM ict_change_requests ORDER BY created_at DESC`
    )
    res.json(rows.map(r => ({
      id: r.id, crNumber: r.cr_number, title: r.title,
      description: r.description, category: r.category,
      impact: r.impact, risk: r.risk,
      requestedBy: r.requested_by, assignedTo: r.assigned_to,
      status: r.status, scheduledDate: r.scheduled_date,
      completedAt: r.completed_at, rollbackPlan: r.rollback_plan,
    })))
  } catch (e) { next(e) }
})

router.post('/change-requests', async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string().min(2),
      description: z.string().min(5),
      category: z.string().default('standard'),
      impact: z.enum(['low', 'medium', 'high']).default('medium'),
      risk: z.enum(['low', 'medium', 'high']).default('medium'),
      requestedBy: z.string(),
      scheduledDate: z.string().optional().nullable(),
      rollbackPlan: z.string().optional().default(''),
    }).parse(req.body)

    const seq = Date.now().toString(36).toUpperCase()
    const crNumber = `CR-${seq}`

    const [row] = await query(
      `INSERT INTO ict_change_requests
        (cr_number, title, description, category, impact, risk,
         requested_by, scheduled_date, rollback_plan)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [crNumber, data.title, data.description, data.category,
       data.impact, data.risk, data.requestedBy,
       data.scheduledDate, data.rollbackPlan]
    )
    res.status(201).json({ id: row.id, crNumber: row.cr_number })
  } catch (e) { next(e) }
})

router.post('/change-requests/:id/approve', async (req, res, next) => {
  try {
    const [row] = await query(
      `UPDATE ict_change_requests SET status = 'approved'
       WHERE id = $1 AND status = 'pending' RETURNING *`,
      [req.params.id]
    )
    if (!row) return res.status(400).json({ error: 'CR not in pending state' })
    res.json({ id: row.id, status: row.status })
  } catch (e) { next(e) }
})

// ─── Systems Monitoring ─────────────────────────────────────────

router.get('/systems', async (_req, res, next) => {
  try {
    const rows = await query(`SELECT * FROM ict_systems ORDER BY name`)
    res.json(rows.map(r => ({
      id: r.id, name: r.name, description: r.description,
      systemType: r.system_type, url: r.url,
      healthStatus: r.health_status, uptime: r.uptime_percent ? parseFloat(r.uptime_percent) : null,
      lastChecked: r.last_health_check, owner: r.owner,
      department: r.department,
    })))
  } catch (e) { next(e) }
})

// ─── Dashboard Summary ──────────────────────────────────────────

router.get('/summary', async (_req, res, next) => {
  try {
    const [openTickets] = await query(
      `SELECT COUNT(*) AS c FROM ict_tickets WHERE status IN ('open','in_progress')`
    )
    const [criticalTickets] = await query(
      `SELECT COUNT(*) AS c FROM ict_tickets WHERE priority = 'critical' AND status NOT IN ('resolved','closed')`
    )
    const [totalAssets] = await query(
      `SELECT COUNT(*) AS c FROM ict_assets WHERE status = 'active'`
    )
    const [pendingCR] = await query(
      `SELECT COUNT(*) AS c FROM ict_change_requests WHERE status = 'pending'`
    )

    // Average resolution time (hours) for last 30 days
    const [avgResolution] = await query(
      `SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600), 0) AS avg_hours
       FROM ict_tickets
       WHERE resolved_at IS NOT NULL AND resolved_at > NOW() - INTERVAL '30 days'`
    )

    // SLA compliance (% resolved before deadline) for last 30 days
    const [slaStats] = await query(
      `SELECT
        COUNT(*) FILTER (WHERE resolved_at <= sla_deadline) AS met,
        COUNT(*) AS total
       FROM ict_tickets
       WHERE resolved_at IS NOT NULL AND resolved_at > NOW() - INTERVAL '30 days'
         AND sla_deadline IS NOT NULL`
    )

    const totalSla = parseInt(slaStats.total) || 1
    const slaCompliance = Math.round((parseInt(slaStats.met) / totalSla) * 100)

    res.json({
      openTickets: parseInt(openTickets.c),
      criticalTickets: parseInt(criticalTickets.c),
      activeAssets: parseInt(totalAssets.c),
      pendingChangeRequests: parseInt(pendingCR.c),
      avgResolutionHours: parseFloat(parseFloat(avgResolution.avg_hours).toFixed(1)),
      slaCompliance,
    })
  } catch (e) { next(e) }
})

export default router
