import { Router } from 'express'
import { z } from 'zod'
import { query, withTx } from '../db.js'

const router = Router()

// ─── Process Definitions ────────────────────────────────────────

router.get('/processes', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT pd.*,
              (SELECT COUNT(*) FROM wf_cases c WHERE c.process_id = pd.id AND c.status = 'open') AS active_cases
       FROM wf_process_definitions pd
       ORDER BY pd.name`
    )
    res.json(rows.map(r => ({
      id: r.id, processKey: r.process_key, name: r.name,
      description: r.description, category: r.category,
      status: r.status, activeVersion: r.active_version,
      activeCases: parseInt(r.active_cases), createdBy: r.created_by,
    })))
  } catch (e) { next(e) }
})

router.post('/processes', async (req, res, next) => {
  try {
    const data = z.object({
      processKey: z.string().min(2).regex(/^[a-z0-9_-]+$/),
      name: z.string().min(2),
      description: z.string().optional().default(''),
      category: z.string().optional().nullable(),
      createdBy: z.string(),
    }).parse(req.body)

    const [row] = await query(
      `INSERT INTO wf_process_definitions
        (process_key, name, description, category, created_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [data.processKey, data.name, data.description, data.category, data.createdBy]
    )
    res.status(201).json({ id: row.id, processKey: row.process_key })
  } catch (e) { next(e) }
})

router.get('/processes/:id', async (req, res, next) => {
  try {
    const [pd] = await query(
      `SELECT * FROM wf_process_definitions WHERE id = $1`, [req.params.id]
    )
    if (!pd) return res.status(404).json({ error: 'Process not found' })

    const versions = await query(
      `SELECT id, version_no, status, published_at, created_at
       FROM wf_process_versions WHERE process_id = $1
       ORDER BY version_no DESC`,
      [pd.id]
    )

    res.json({
      id: pd.id, processKey: pd.process_key, name: pd.name,
      description: pd.description, category: pd.category,
      status: pd.status, activeVersion: pd.active_version,
      versions: versions.map(v => ({
        id: v.id, versionNo: v.version_no, status: v.status,
        publishedAt: v.published_at, createdAt: v.created_at,
      })),
    })
  } catch (e) { next(e) }
})

// ─── Process Versions ───────────────────────────────────────────

router.post('/processes/:id/versions', async (req, res, next) => {
  try {
    const data = z.object({
      graphJson: z.record(z.unknown()).optional().default({}),
      createdBy: z.string(),
    }).parse(req.body)

    const processId = parseInt(req.params.id)

    // determine next version number
    const [last] = await query(
      `SELECT COALESCE(MAX(version_no), 0) AS max_v FROM wf_process_versions WHERE process_id = $1`,
      [processId]
    )
    const nextVersion = parseInt(last.max_v) + 1

    const [row] = await query(
      `INSERT INTO wf_process_versions (process_id, version_no, graph_json, created_by)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [processId, nextVersion, JSON.stringify(data.graphJson), data.createdBy]
    )
    res.status(201).json({ id: row.id, versionNo: row.version_no })
  } catch (e) { next(e) }
})

router.post('/versions/:id/publish', async (req, res, next) => {
  try {
    const versionId = parseInt(req.params.id)

    const result = await withTx(async (client) => {
      const { rows: [ver] } = await client.query(
        `UPDATE wf_process_versions
         SET status = 'published', published_at = NOW(), published_by = $1
         WHERE id = $2 AND status = 'draft'
         RETURNING *`,
        [req.body.publishedBy || 'system', versionId]
      )
      if (!ver) throw new Error('Version not in draft state')

      await client.query(
        `UPDATE wf_process_definitions
         SET status = 'active', active_version = $1, updated_at = NOW()
         WHERE id = $2`,
        [ver.version_no, ver.process_id]
      )

      return { id: ver.id, versionNo: ver.version_no, status: 'published' }
    })

    res.json(result)
  } catch (e) { next(e) }
})

// ─── Cases ──────────────────────────────────────────────────────

router.get('/cases', async (req, res, next) => {
  try {
    const processId = parseInt(req.query.processId) || 0
    const status = (req.query.status || '').trim()
    const conditions = []
    const params = []

    if (processId) {
      params.push(processId)
      conditions.push(`c.process_id = $${params.length}`)
    }
    if (status && status !== 'all') {
      params.push(status)
      conditions.push(`c.status = $${params.length}`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const rows = await query(
      `SELECT c.*, pd.name AS process_name, pd.process_key
       FROM wf_cases c
       JOIN wf_process_definitions pd ON pd.id = c.process_id
       ${where}
       ORDER BY c.started_at DESC
       LIMIT 100`,
      params
    )

    res.json(rows.map(r => ({
      id: r.id, caseRef: r.case_ref,
      processName: r.process_name, processKey: r.process_key,
      status: r.status, startedBy: r.started_by,
      currentNodes: r.current_nodes,
      startedAt: r.started_at, endedAt: r.ended_at,
    })))
  } catch (e) { next(e) }
})

router.post('/cases', async (req, res, next) => {
  try {
    const data = z.object({
      processId: z.number().int(),
      startedBy: z.string(),
      variables: z.record(z.unknown()).optional().default({}),
    }).parse(req.body)

    const result = await withTx(async (client) => {
      // look up active version
      const { rows: [pd] } = await client.query(
        `SELECT * FROM wf_process_definitions WHERE id = $1 AND status = 'active'`,
        [data.processId]
      )
      if (!pd) throw new Error('Process not active or not found')

      const { rows: [ver] } = await client.query(
        `SELECT * FROM wf_process_versions
         WHERE process_id = $1 AND version_no = $2`,
        [pd.id, pd.active_version]
      )
      if (!ver) throw new Error('Active version not found')

      const seq = Date.now().toString(36).toUpperCase()
      const caseRef = `${pd.process_key.toUpperCase()}-${seq}`

      const { rows: [wfCase] } = await client.query(
        `INSERT INTO wf_cases (case_ref, process_id, process_version_id, started_by)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [caseRef, pd.id, ver.id, data.startedBy]
      )

      // store initial variables
      for (const [key, value] of Object.entries(data.variables)) {
        const varType = typeof value === 'number' ? 'number'
          : typeof value === 'boolean' ? 'boolean' : 'string'
        await client.query(
          `INSERT INTO wf_case_variables (case_id, var_key, var_type, var_value, updated_by)
           VALUES ($1,$2,$3,$4,$5)`,
          [wfCase.id, key, varType, JSON.stringify(value), data.startedBy]
        )
      }

      // Find start node and create first task(s)
      const { rows: startNodes } = await client.query(
        `SELECT * FROM wf_nodes
         WHERE process_version_id = $1 AND node_type = 'start'`,
        [ver.id]
      )

      if (startNodes.length > 0) {
        // Get transitions from start node
        for (const sn of startNodes) {
          const { rows: transitions } = await client.query(
            `SELECT t.*, n.node_key, n.name AS node_name, n.node_type, n.assignment_mode
             FROM wf_transitions t
             JOIN wf_nodes n ON n.id = t.to_node_id
             WHERE t.from_node_id = $1
             ORDER BY t.priority`,
            [sn.id]
          )

          for (const tr of transitions) {
            if (tr.node_type === 'user_task' || tr.node_type === 'approval') {
              const taskSeq = Date.now().toString(36).toUpperCase()
              await client.query(
                `INSERT INTO wf_tasks
                  (case_id, node_id, task_ref, title, task_type, status)
                 VALUES ($1,$2,$3,$4,$5,'pending')`,
                [wfCase.id, tr.to_node_id, `T-${taskSeq}`, tr.node_name,
                 tr.node_type === 'approval' ? 'approval' : 'form']
              )
            }
          }
        }
      }

      // audit
      await client.query(
        `INSERT INTO wf_audit_logs (case_id, event_type, actor_id, details)
         VALUES ($1,'case_started',$2,$3)`,
        [wfCase.id, data.startedBy, JSON.stringify({ processKey: pd.process_key })]
      )

      return { id: wfCase.id, caseRef: wfCase.case_ref }
    })

    res.status(201).json(result)
  } catch (e) { next(e) }
})

// ─── Tasks ──────────────────────────────────────────────────────

router.get('/tasks', async (req, res, next) => {
  try {
    const userId = (req.query.userId || '').trim()
    const status = (req.query.status || '').trim()
    const conditions = []
    const params = []

    if (userId) {
      params.push(userId)
      conditions.push(`(t.assigned_user_id = $${params.length} OR t.claimed_by = $${params.length})`)
    }
    if (status && status !== 'all') {
      params.push(status)
      conditions.push(`t.status = $${params.length}`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const rows = await query(
      `SELECT t.*, c.case_ref, pd.name AS process_name
       FROM wf_tasks t
       JOIN wf_cases c ON c.id = t.case_id
       JOIN wf_process_definitions pd ON pd.id = c.process_id
       ${where}
       ORDER BY t.priority ASC, t.due_at ASC NULLS LAST, t.created_at DESC
       LIMIT 100`,
      params
    )

    res.json(rows.map(r => ({
      id: r.id, taskRef: r.task_ref, title: r.title,
      taskType: r.task_type, status: r.status,
      priority: r.priority, caseRef: r.case_ref,
      processName: r.process_name,
      assignedUserId: r.assigned_user_id,
      assignedRoleKey: r.assigned_role_key,
      claimedBy: r.claimed_by, claimable: r.claimable,
      dueAt: r.due_at, createdAt: r.created_at,
      outcome: r.outcome,
    })))
  } catch (e) { next(e) }
})

router.post('/tasks/:id/claim', async (req, res, next) => {
  try {
    const data = z.object({ userId: z.string() }).parse(req.body)
    const [row] = await query(
      `UPDATE wf_tasks SET claimed_by = $1, status = 'active', started_at = NOW()
       WHERE id = $2 AND claimable = TRUE AND claimed_by IS NULL
       RETURNING *`,
      [data.userId, req.params.id]
    )
    if (!row) return res.status(400).json({ error: 'Task cannot be claimed' })
    res.json({ id: row.id, claimedBy: row.claimed_by, status: row.status })
  } catch (e) { next(e) }
})

router.post('/tasks/:id/complete', async (req, res, next) => {
  try {
    const data = z.object({
      outcome: z.string().default('completed'),
      resolutionNotes: z.string().optional().default(''),
      actorId: z.string(),
      payload: z.record(z.unknown()).optional().default({}),
    }).parse(req.body)

    const result = await withTx(async (client) => {
      const { rows: [task] } = await client.query(
        `UPDATE wf_tasks
         SET status = 'completed', outcome = $1, resolution_notes = $2, completed_at = NOW()
         WHERE id = $3 AND status IN ('pending','active')
         RETURNING *`,
        [data.outcome, data.resolutionNotes, req.params.id]
      )
      if (!task) throw new Error('Task not in completable state')

      // record action
      await client.query(
        `INSERT INTO wf_task_actions (task_id, action, actor_id, payload)
         VALUES ($1,'complete',$2,$3)`,
        [task.id, data.actorId, JSON.stringify(data.payload)]
      )

      // audit
      await client.query(
        `INSERT INTO wf_audit_logs (case_id, task_id, event_type, actor_id, details)
         VALUES ($1,$2,'task_completed',$3,$4)`,
        [task.case_id, task.id, data.actorId,
         JSON.stringify({ outcome: data.outcome })]
      )

      // check if all tasks in case are completed → auto-close case
      const { rows: pending } = await client.query(
        `SELECT COUNT(*) AS c FROM wf_tasks
         WHERE case_id = $1 AND status NOT IN ('completed','canceled')`,
        [task.case_id]
      )

      if (parseInt(pending[0].c) === 0) {
        await client.query(
          `UPDATE wf_cases SET status = 'completed', ended_at = NOW()
           WHERE id = $1`,
          [task.case_id]
        )
      }

      return { id: task.id, status: 'completed', outcome: data.outcome }
    })

    res.json(result)
  } catch (e) { next(e) }
})

// ─── Notifications ──────────────────────────────────────────────

router.get('/notifications', async (req, res, next) => {
  try {
    const userId = (req.query.userId || '').trim()
    if (!userId) return res.status(400).json({ error: 'userId required' })

    const rows = await query(
      `SELECT * FROM wf_notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    )
    res.json(rows.map(r => ({
      id: r.id, subject: r.subject, body: r.body,
      channel: r.channel, isRead: r.is_read,
      caseId: r.case_id, taskId: r.task_id,
      createdAt: r.created_at,
    })))
  } catch (e) { next(e) }
})

router.post('/notifications/:id/read', async (req, res, next) => {
  try {
    const [row] = await query(
      `UPDATE wf_notifications SET is_read = TRUE, read_at = NOW()
       WHERE id = $1 RETURNING *`,
      [req.params.id]
    )
    if (!row) return res.status(404).json({ error: 'Notification not found' })
    res.json({ id: row.id, isRead: true })
  } catch (e) { next(e) }
})

// ─── Audit Logs ─────────────────────────────────────────────────

router.get('/audit', async (req, res, next) => {
  try {
    const caseId = parseInt(req.query.caseId) || 0
    const cond = caseId ? `WHERE a.case_id = $1` : ''
    const params = caseId ? [caseId] : []

    const rows = await query(
      `SELECT a.* FROM wf_audit_logs a ${cond}
       ORDER BY a.created_at DESC LIMIT 200`,
      params
    )
    res.json(rows.map(r => ({
      id: r.id, caseId: r.case_id, taskId: r.task_id,
      eventType: r.event_type, actorId: r.actor_id,
      details: r.details, createdAt: r.created_at,
    })))
  } catch (e) { next(e) }
})

export default router
