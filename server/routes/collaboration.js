import { Router } from 'express'
import { z } from 'zod'
import { query, withTx } from '../db.js'

const router = Router()

function inlineBody(fileUrl) {
  const s = fileUrl || ''
  return s.startsWith('inline:') ? s.slice(7) : s
}

function toInlineBody(text) {
  const t = text ?? ''
  return t.startsWith('inline:') ? t : `inline:${t}`
}

function calendarDateStr(evDate) {
  if (evDate instanceof Date) return evDate.toISOString().slice(0, 10)
  const s = String(evDate || '')
  return s.length >= 10 ? s.slice(0, 10) : ''
}

function mapCalendarEventRow(r) {
  const dateStr = calendarDateStr(r.event_date)
  let day = parseInt(r.day_num, 10)
  let monthShort = String(r.month_short || '').trim()
  if (!Number.isFinite(day) || day < 1) {
    const p = dateStr.split('-')
    if (p.length === 3) day = parseInt(p[2], 10)
  }
  if (!monthShort && dateStr) {
    const [y, m, da] = dateStr.split('-').map((v) => parseInt(v, 10))
    monthShort = new Date(y, m - 1, da).toLocaleDateString('en-GB', { month: 'short' })
  }
  return {
    id: r.id,
    title: r.title,
    day,
    month: monthShort,
    time: r.start_time,
    location: r.location,
    type: r.event_type,
    eventDate: dateStr,
    createdBy: r.created_by,
  }
}

// ─── Calendar events (collab_calendar_events) ───────────────────

router.get('/calendar-events', async (req, res, next) => {
  try {
    const year = parseInt(String(req.query.year || ''), 10)
    const month = parseInt(String(req.query.month || ''), 10)
    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ error: 'year and month (1-12) are required' })
    }

    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    const rows = await query(
      `SELECT id, title, event_date, start_time, location, event_type, created_by, created_at,
              EXTRACT(DAY FROM event_date)::int AS day_num,
              TRIM(TO_CHAR(event_date, 'FMMon')) AS month_short
       FROM collab_calendar_events
       WHERE event_date >= $1::date AND event_date <= $2::date
       ORDER BY event_date, start_time`,
      [start, end]
    )

    res.json(rows.map(mapCalendarEventRow))
  } catch (e) {
    next(e)
  }
})

router.post('/calendar-events', async (req, res, next) => {
  try {
    const data = z
      .object({
        title: z.string().min(1),
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        time: z.string().optional().default('09:00'),
        location: z.string().optional().default('TBD'),
        type: z.string().optional().default('meeting'),
        createdBy: z.string().min(1),
      })
      .parse(req.body)

    const [row] = await query(
      `INSERT INTO collab_calendar_events
        (title, event_date, start_time, location, event_type, created_by)
       VALUES ($1, $2::date, $3, $4, $5, $6)
       RETURNING *`,
      [data.title, data.eventDate, data.time, data.location, data.type, data.createdBy]
    )

    res.status(201).json(mapCalendarEventRow(row))
  } catch (e) {
    next(e)
  }
})

// ─── Forums (collab_forum_threads / collab_forum_posts) ─────────

function mapForumThreadList(r) {
  return {
    id: r.id,
    title: r.title,
    tag: r.tag || 'General',
    pinned: !!r.pinned,
    authorEmail: r.author_email,
    replies: Number(r.reply_count) || 0,
    views: Number(r.views) || 0,
    lastActivity: r.last_activity,
    createdAt: r.created_at,
  }
}

function mapForumPost(r) {
  return {
    id: r.id,
    authorEmail: r.author_email,
    body: r.body,
    createdAt: r.created_at,
  }
}

router.get('/forum/threads', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT t.id, t.title, t.tag, t.pinned, t.author_email, t.views, t.created_at, t.updated_at,
              (SELECT COUNT(*)::int FROM collab_forum_posts p WHERE p.thread_id = t.id) AS reply_count,
              GREATEST(
                t.updated_at,
                COALESCE((SELECT MAX(p2.created_at) FROM collab_forum_posts p2 WHERE p2.thread_id = t.id), t.updated_at)
              ) AS last_activity
       FROM collab_forum_threads t
       ORDER BY t.pinned DESC, last_activity DESC`
    )
    res.json(rows.map(mapForumThreadList))
  } catch (e) {
    next(e)
  }
})

router.get('/forum/threads/:id', async (req, res, next) => {
  try {
    const id = parseInt(String(req.params.id), 10)
    if (!Number.isFinite(id) || id < 1) return res.status(400).json({ error: 'Invalid thread id' })

    await query(`UPDATE collab_forum_threads SET views = views + 1 WHERE id = $1`, [id])

    const [thread] = await query(`SELECT * FROM collab_forum_threads WHERE id = $1`, [id])
    if (!thread) return res.status(404).json({ error: 'Thread not found' })

    const posts = await query(
      `SELECT * FROM collab_forum_posts WHERE thread_id = $1 ORDER BY created_at ASC`,
      [id]
    )

    res.json({
      thread: {
        id: thread.id,
        title: thread.title,
        tag: thread.tag || 'General',
        pinned: !!thread.pinned,
        authorEmail: thread.author_email,
        body: thread.body || '',
        views: Number(thread.views) || 0,
        createdAt: thread.created_at,
        updatedAt: thread.updated_at,
      },
      posts: posts.map(mapForumPost),
    })
  } catch (e) {
    next(e)
  }
})

router.post('/forum/threads', async (req, res, next) => {
  try {
    const data = z
      .object({
        title: z.string().min(2),
        tag: z.string().optional().default('General'),
        pinned: z.boolean().optional().default(false),
        body: z.string().optional().default(''),
        authorEmail: z.string().min(3),
      })
      .parse(req.body)

    const [row] = await query(
      `INSERT INTO collab_forum_threads (title, tag, pinned, author_email, body, views)
       VALUES ($1, $2, $3, $4, $5, 0)
       RETURNING *`,
      [data.title, data.tag, data.pinned, data.authorEmail, data.body]
    )
    res.status(201).json(mapForumThreadList({ ...row, reply_count: 0, last_activity: row.updated_at }))
  } catch (e) {
    next(e)
  }
})

router.post('/forum/threads/:id/posts', async (req, res, next) => {
  try {
    const id = parseInt(String(req.params.id), 10)
    if (!Number.isFinite(id) || id < 1) return res.status(400).json({ error: 'Invalid thread id' })

    const data = z
      .object({
        body: z.string().min(1),
        authorEmail: z.string().min(3),
      })
      .parse(req.body)

    const [thread] = await query(`SELECT id FROM collab_forum_threads WHERE id = $1`, [id])
    if (!thread) return res.status(404).json({ error: 'Thread not found' })

    const [post] = await query(
      `INSERT INTO collab_forum_posts (thread_id, author_email, body) VALUES ($1, $2, $3)
       RETURNING *`,
      [id, data.authorEmail, data.body]
    )

    await query(`UPDATE collab_forum_threads SET updated_at = NOW() WHERE id = $1`, [id])

    res.status(201).json(mapForumPost(post))
  } catch (e) {
    next(e)
  }
})

// ─── Projects & tasks (collab_projects / collab_project_tasks) ─

function formatDueDatePg(d) {
  if (!d) return '—'
  const s = d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10)
  if (s.length < 10) return '—'
  const [y, m, da] = s.split('-').map((v) => parseInt(v, 10))
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(da)) return '—'
  return new Date(y, m - 1, da).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function mapProjectRow(r) {
  const td = Number(r.tasks_done) || 0
  const to = Number(r.tasks_open) || 0
  const total = td + to
  const progress = total > 0 ? Math.round((100 * td) / total) : 0
  return {
    id: r.id,
    name: r.name,
    owner: r.owner_label || '—',
    ownerEmail: r.owner_email || null,
    due: formatDueDatePg(r.due_date),
    dueDate: r.due_date ? String(r.due_date).slice(0, 10) : null,
    status: r.status || 'on-track',
    description: r.description || '',
    progress,
    tasksOpen: to,
    tasksDone: td,
  }
}

function mapTaskRow(r) {
  return {
    id: r.id,
    projectId: r.project_id,
    title: r.title,
    assignee: r.assignee_label || '',
    assigneeEmail: r.assignee_email || null,
    due: formatDueDatePg(r.due_date),
    dueDate: r.due_date ? String(r.due_date).slice(0, 10) : null,
    priority: r.priority || 'medium',
    status: r.status || 'todo',
  }
}

router.get('/projects', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT p.*,
        (SELECT COUNT(*)::int FROM collab_project_tasks t WHERE t.project_id = p.id AND t.status = 'done') AS tasks_done,
        (SELECT COUNT(*)::int FROM collab_project_tasks t WHERE t.project_id = p.id AND t.status <> 'done') AS tasks_open
       FROM collab_projects p
       ORDER BY p.updated_at DESC`
    )
    res.json(rows.map(mapProjectRow))
  } catch (e) {
    next(e)
  }
})

router.post('/projects', async (req, res, next) => {
  try {
    const data = z
      .object({
        name: z.string().min(2),
        ownerLabel: z.string().optional().default(''),
        ownerEmail: z.string().optional().nullable(),
        dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
        status: z.enum(['on-track', 'at-risk', 'delayed', 'completed']).optional().default('on-track'),
        description: z.string().optional().default(''),
        createdBy: z.string().optional().nullable(),
      })
      .parse(req.body)

    const [row] = await query(
      `INSERT INTO collab_projects (name, owner_label, owner_email, due_date, status, description, created_by)
       VALUES ($1, $2, $3, $4::date, $5, $6, $7)
       RETURNING *`,
      [
        data.name,
        data.ownerLabel,
        data.ownerEmail || null,
        data.dueDate || null,
        data.status,
        data.description,
        data.createdBy || null,
      ]
    )

    const [withCounts] = await query(
      `SELECT p.*,
        (SELECT COUNT(*)::int FROM collab_project_tasks t WHERE t.project_id = p.id AND t.status = 'done') AS tasks_done,
        (SELECT COUNT(*)::int FROM collab_project_tasks t WHERE t.project_id = p.id AND t.status <> 'done') AS tasks_open
       FROM collab_projects p WHERE p.id = $1`,
      [row.id]
    )
    res.status(201).json(mapProjectRow(withCounts))
  } catch (e) {
    next(e)
  }
})

router.patch('/projects/:id', async (req, res, next) => {
  try {
    const id = parseInt(String(req.params.id), 10)
    if (!Number.isFinite(id) || id < 1) return res.status(400).json({ error: 'Invalid project id' })

    const data = z
      .object({
        name: z.string().min(2).optional(),
        ownerLabel: z.string().optional(),
        ownerEmail: z.string().nullable().optional(),
        dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
        status: z.enum(['on-track', 'at-risk', 'delayed', 'completed']).optional(),
        description: z.string().optional(),
      })
      .parse(req.body)

    const sets = ['updated_at = NOW()']
    const params = []
    if (data.name !== undefined) {
      params.push(data.name)
      sets.push(`name = $${params.length}`)
    }
    if (data.ownerLabel !== undefined) {
      params.push(data.ownerLabel)
      sets.push(`owner_label = $${params.length}`)
    }
    if (data.ownerEmail !== undefined) {
      params.push(data.ownerEmail)
      sets.push(`owner_email = $${params.length}`)
    }
    if (data.dueDate !== undefined) {
      params.push(data.dueDate)
      sets.push(`due_date = $${params.length}::date`)
    }
    if (data.status !== undefined) {
      params.push(data.status)
      sets.push(`status = $${params.length}`)
    }
    if (data.description !== undefined) {
      params.push(data.description)
      sets.push(`description = $${params.length}`)
    }

    if (sets.length === 1) return res.status(400).json({ error: 'No fields to update' })

    params.push(id)
    const [row] = await query(
      `UPDATE collab_projects SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    )
    if (!row) return res.status(404).json({ error: 'Project not found' })

    const [withCounts] = await query(
      `SELECT p.*,
        (SELECT COUNT(*)::int FROM collab_project_tasks t WHERE t.project_id = p.id AND t.status = 'done') AS tasks_done,
        (SELECT COUNT(*)::int FROM collab_project_tasks t WHERE t.project_id = p.id AND t.status <> 'done') AS tasks_open
       FROM collab_projects p WHERE p.id = $1`,
      [id]
    )
    res.json(mapProjectRow(withCounts))
  } catch (e) {
    next(e)
  }
})

router.get('/projects/:id/tasks', async (req, res, next) => {
  try {
    const projectId = parseInt(String(req.params.id), 10)
    if (!Number.isFinite(projectId) || projectId < 1) return res.status(400).json({ error: 'Invalid project id' })

    const [p] = await query(`SELECT id FROM collab_projects WHERE id = $1`, [projectId])
    if (!p) return res.status(404).json({ error: 'Project not found' })

    const rows = await query(
      `SELECT * FROM collab_project_tasks WHERE project_id = $1 ORDER BY sort_order, id`,
      [projectId]
    )
    res.json(rows.map(mapTaskRow))
  } catch (e) {
    next(e)
  }
})

router.post('/projects/:id/tasks', async (req, res, next) => {
  try {
    const projectId = parseInt(String(req.params.id), 10)
    if (!Number.isFinite(projectId) || projectId < 1) return res.status(400).json({ error: 'Invalid project id' })

    const [p] = await query(`SELECT id FROM collab_projects WHERE id = $1`, [projectId])
    if (!p) return res.status(404).json({ error: 'Project not found' })

    const raw = { ...req.body }
    if (raw.dueDate === '' || raw.dueDate === undefined) raw.dueDate = null

    const data = z
      .object({
        title: z.string().min(1),
        assigneeLabel: z.string().optional().default(''),
        assigneeEmail: z.string().optional().nullable(),
        dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
        priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
        status: z.enum(['todo', 'in-progress', 'blocked', 'done']).optional().default('todo'),
      })
      .parse(raw)

    const [maxSort] = await query(
      `SELECT COALESCE(MAX(sort_order), 0)::int AS m FROM collab_project_tasks WHERE project_id = $1`,
      [projectId]
    )
    const nextSort = (maxSort?.m ?? 0) + 1

    const [task] = await query(
      `INSERT INTO collab_project_tasks
        (project_id, title, assignee_label, assignee_email, due_date, priority, status, sort_order)
       VALUES ($1, $2, $3, $4, $5::date, $6, $7, $8)
       RETURNING *`,
      [
        projectId,
        data.title,
        data.assigneeLabel,
        data.assigneeEmail || null,
        data.dueDate || null,
        data.priority,
        data.status,
        nextSort,
      ]
    )

    await query(`UPDATE collab_projects SET updated_at = NOW() WHERE id = $1`, [projectId])
    res.status(201).json(mapTaskRow(task))
  } catch (e) {
    next(e)
  }
})

router.patch('/project-tasks/:taskId', async (req, res, next) => {
  try {
    const taskId = parseInt(String(req.params.taskId), 10)
    if (!Number.isFinite(taskId) || taskId < 1) return res.status(400).json({ error: 'Invalid task id' })

    const data = z
      .object({
        title: z.string().min(1).optional(),
        assigneeLabel: z.string().optional(),
        assigneeEmail: z.string().nullable().optional(),
        dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
        priority: z.enum(['high', 'medium', 'low']).optional(),
        status: z.enum(['todo', 'in-progress', 'blocked', 'done']).optional(),
      })
      .parse(req.body)

    const sets = ['updated_at = NOW()']
    const params = []
    if (data.title !== undefined) {
      params.push(data.title)
      sets.push(`title = $${params.length}`)
    }
    if (data.assigneeLabel !== undefined) {
      params.push(data.assigneeLabel)
      sets.push(`assignee_label = $${params.length}`)
    }
    if (data.assigneeEmail !== undefined) {
      params.push(data.assigneeEmail)
      sets.push(`assignee_email = $${params.length}`)
    }
    if (data.dueDate !== undefined) {
      params.push(data.dueDate)
      sets.push(`due_date = $${params.length}::date`)
    }
    if (data.priority !== undefined) {
      params.push(data.priority)
      sets.push(`priority = $${params.length}`)
    }
    if (data.status !== undefined) {
      params.push(data.status)
      sets.push(`status = $${params.length}`)
    }

    if (sets.length === 1) return res.status(400).json({ error: 'No fields to update' })

    params.push(taskId)
    const [task] = await query(
      `UPDATE collab_project_tasks SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    )
    if (!task) return res.status(404).json({ error: 'Task not found' })

    await query(`UPDATE collab_projects SET updated_at = NOW() WHERE id = $1`, [task.project_id])
    res.json(mapTaskRow(task))
  } catch (e) {
    next(e)
  }
})

// ─── Workspaces (schema: operations_schema.sql collab_*) ────────

router.get('/workspaces', async (req, res, next) => {
  try {
    const userEmail = String(req.query.userEmail || req.query.userId || '').trim()
    let rows

    if (userEmail) {
      rows = await query(
        `SELECT w.id, w.name, w.description, w.department, w.owner_email, w.status,
                w.created_at, w.updated_at, wm.role AS member_role,
                (SELECT COUNT(*)::int FROM collab_workspace_members m WHERE m.workspace_id = w.id) AS live_member_count,
                (SELECT COUNT(*)::int FROM collab_documents d WHERE d.workspace_id = w.id) AS live_doc_count
         FROM collab_workspaces w
         JOIN collab_workspace_members wm ON wm.workspace_id = w.id AND wm.user_email = $1
         WHERE COALESCE(w.status, 'active') <> 'archived'
         ORDER BY w.updated_at DESC`,
        [userEmail]
      )
    } else {
      rows = await query(
        `SELECT w.id, w.name, w.description, w.department, w.owner_email, w.status,
                w.created_at, w.updated_at, NULL::text AS member_role,
                (SELECT COUNT(*)::int FROM collab_workspace_members m WHERE m.workspace_id = w.id) AS live_member_count,
                (SELECT COUNT(*)::int FROM collab_documents d WHERE d.workspace_id = w.id) AS live_doc_count
         FROM collab_workspaces w
         WHERE COALESCE(w.status, 'active') <> 'archived'
         ORDER BY w.updated_at DESC`
      )
    }

    res.json(rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || '',
      department: r.department || '',
      createdBy: r.owner_email,
      visibility: r.status === 'archived' ? 'private' : 'public',
      memberCount: parseInt(r.live_member_count, 10) || 0,
      docCount: parseInt(r.live_doc_count, 10) || 0,
      memberRole: r.member_role || null,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })))
  } catch (e) {
    next(e)
  }
})

router.post('/workspaces', async (req, res, next) => {
  try {
    const raw = z
      .object({
        name: z.string().min(2),
        description: z.string().optional().default(''),
        department: z.string().optional().default('General'),
        ownerEmail: z.string().min(3).optional(),
        createdBy: z.string().min(3).optional(),
        visibility: z.enum(['public', 'private']).optional(),
      })
      .parse(req.body)

    const ownerEmail = (raw.ownerEmail || raw.createdBy || '').trim()
    if (!ownerEmail) return res.status(400).json({ error: 'ownerEmail or createdBy is required' })

    const result = await withTx(async (client) => {
      const { rows: [ws] } = await client.query(
        `INSERT INTO collab_workspaces
          (name, description, department, owner_email, member_count, file_count, status)
         VALUES ($1, $2, $3, $4, 1, 0, 'active')
         RETURNING *`,
        [raw.name, raw.description, raw.department, ownerEmail]
      )

      await client.query(
        `INSERT INTO collab_workspace_members (workspace_id, user_email, role)
         VALUES ($1, $2, 'owner')
         ON CONFLICT (workspace_id, user_email) DO UPDATE SET role = EXCLUDED.role`,
        [ws.id, ownerEmail]
      )

      return { id: ws.id, name: ws.name }
    })

    res.status(201).json(result)
  } catch (e) {
    next(e)
  }
})

router.get('/workspaces/:id/members', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT * FROM collab_workspace_members WHERE workspace_id = $1 ORDER BY joined_at`,
      [req.params.id]
    )
    res.json(
      rows.map((r) => ({
        id: r.id,
        userId: r.user_email,
        userEmail: r.user_email,
        role: r.role,
        joinedAt: r.joined_at,
      }))
    )
  } catch (e) {
    next(e)
  }
})

router.post('/workspaces/:id/members', async (req, res, next) => {
  try {
    const data = z
      .object({
        userEmail: z.string().min(3).optional(),
        userId: z.string().min(3).optional(),
        role: z.enum(['viewer', 'editor', 'admin', 'owner', 'member']).default('editor'),
      })
      .parse(req.body)

    const userEmail = (data.userEmail || data.userId || '').trim()
    if (!userEmail) return res.status(400).json({ error: 'userEmail or userId is required' })

    const [row] = await query(
      `INSERT INTO collab_workspace_members (workspace_id, user_email, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (workspace_id, user_email) DO UPDATE SET role = EXCLUDED.role
       RETURNING *`,
      [req.params.id, userEmail, data.role]
    )
    res.status(201).json({ id: row.id, userId: row.user_email, userEmail: row.user_email, role: row.role })
  } catch (e) {
    next(e)
  }
})

// ─── Office / WPS hints (env only — no secrets) ─────────────────

router.get('/integrations/office', async (_req, res) => {
  res.json({
    sharePointHomeUrl: (process.env.COLLAB_SHAREPOINT_HOME_URL || '').trim() || null,
    wpsHomeUrl: (process.env.COLLAB_WPS_HOME_URL || '').trim() || null,
    teamsDeepLinkBase: (process.env.COLLAB_TEAMS_DEEP_LINK || '').trim() || null,
  })
})

// ─── Shared files (collab_documents.workspace_id IS NULL) ───────

function formatBytesHuman(n) {
  const b = Number(n)
  if (!Number.isFinite(b) || b <= 0) return '—'
  if (b < 1024) return `${Math.round(b)} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

function formatModifiedTs(ts) {
  if (!ts) return '—'
  try {
    const d = ts instanceof Date ? ts : new Date(ts)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

function mapSharedFileRow(r) {
  return {
    id: r.id,
    name: r.title,
    uploadedBy: r.uploaded_by,
    fileType: r.file_type || 'document',
    size: formatBytesHuman(r.file_size_bytes),
    shared: (r.department || '').trim() || 'Shared library',
    lock: !!r.is_locked,
    modified: formatModifiedTs(r.updated_at),
    version: r.version,
    webUrl: r.web_url ? String(r.web_url).trim() : null,
  }
}

router.get('/files', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT * FROM collab_documents
       WHERE workspace_id IS NULL AND COALESCE(status, 'active') <> 'archived'
       ORDER BY updated_at DESC`
    )
    res.json(rows.map(mapSharedFileRow))
  } catch (e) {
    next(e)
  }
})

router.post('/files', async (req, res, next) => {
  try {
    const data = z
      .object({
        title: z.string().min(1),
        fileType: z.string().optional().default('document'),
        content: z.string().optional().default(''),
        sharedLabel: z.string().optional().default('Shared library'),
        isLocked: z.boolean().optional().default(false),
        uploadedBy: z.string().min(1),
        webUrl: z.string().optional(),
      })
      .parse(req.body)

    const fileUrl = toInlineBody(data.content)
    const sizeBytes = Buffer.byteLength(fileUrl, 'utf8')
    let webUrl = null
    if (data.webUrl !== undefined && data.webUrl !== null) {
      const t = String(data.webUrl).trim()
      if (t) {
        if (!/^https:\/\//i.test(t)) {
          return res.status(400).json({ error: 'webUrl must be a full https:// link (e.g. SharePoint or OneDrive).' })
        }
        webUrl = t
      }
    }

    const [row] = await query(
      `INSERT INTO collab_documents
        (workspace_id, title, file_type, file_url, file_size_bytes, uploaded_by, department, is_locked, status, web_url)
       VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, 'active', $8)
       RETURNING *`,
      [
        data.title,
        data.fileType || 'document',
        fileUrl,
        sizeBytes,
        data.uploadedBy,
        data.sharedLabel || 'Shared library',
        data.isLocked,
        webUrl,
      ]
    )
    res.status(201).json(mapSharedFileRow(row))
  } catch (e) {
    next(e)
  }
})

// ─── Documents ──────────────────────────────────────────────────

router.get('/workspaces/:id/documents', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT * FROM collab_documents
       WHERE workspace_id = $1
       ORDER BY updated_at DESC`,
      [req.params.id]
    )
    res.json(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        docType: r.file_type || 'document',
        content: inlineBody(r.file_url),
        createdBy: r.uploaded_by,
        lastEditedBy: r.uploaded_by,
        version: r.version,
        status: r.status,
        fileSizeBytes: r.file_size_bytes,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        webUrl: r.web_url ? String(r.web_url).trim() : null,
      }))
    )
  } catch (e) {
    next(e)
  }
})

router.post('/workspaces/:id/documents', async (req, res, next) => {
  try {
    const data = z
      .object({
        title: z.string().min(1),
        docType: z.string().optional().default('document'),
        content: z.string().optional().default(''),
        createdBy: z.string().min(1),
        webUrl: z.string().optional(),
      })
      .parse(req.body)

    const fileUrl = toInlineBody(data.content)
    let webUrl = null
    if (data.webUrl !== undefined && data.webUrl !== null) {
      const t = String(data.webUrl).trim()
      if (t) {
        if (!/^https:\/\//i.test(t)) {
          return res.status(400).json({ error: 'webUrl must be a full https:// link (e.g. SharePoint or OneDrive).' })
        }
        webUrl = t
      }
    }

    const [row] = await query(
      `INSERT INTO collab_documents
        (workspace_id, title, file_type, file_url, file_size_bytes, uploaded_by, department, status, web_url)
       VALUES ($1, $2, $3, $4, $5, $6, '', 'active', $7)
       RETURNING *`,
      [
        req.params.id,
        data.title,
        data.docType || 'document',
        fileUrl,
        Buffer.byteLength(fileUrl, 'utf8'),
        data.createdBy,
        webUrl,
      ]
    )
    res.status(201).json({ id: row.id, title: row.title })
  } catch (e) {
    next(e)
  }
})

router.patch('/documents/:id', async (req, res, next) => {
  try {
    const data = z
      .object({
        title: z.string().optional(),
        content: z.string().optional(),
        editedBy: z.string().min(1),
        isLocked: z.boolean().optional(),
        sharedLabel: z.string().optional(),
        webUrl: z.union([z.string(), z.null()]).optional(),
      })
      .parse(req.body)

    const sets = ['updated_at = NOW()', 'version = version + 1', 'uploaded_by = $1']
    const params = [data.editedBy]

    if (data.title !== undefined) {
      params.push(data.title)
      sets.push(`title = $${params.length}`)
    }
    if (data.content !== undefined) {
      params.push(toInlineBody(data.content))
      sets.push(`file_url = $${params.length}`)
    }
    if (data.isLocked !== undefined) {
      params.push(data.isLocked)
      sets.push(`is_locked = $${params.length}`)
    }
    if (data.sharedLabel !== undefined) {
      params.push(data.sharedLabel)
      sets.push(`department = $${params.length}`)
    }
    if (data.webUrl !== undefined) {
      if (data.webUrl === null) {
        params.push(null)
        sets.push(`web_url = $${params.length}`)
      } else {
        const t = String(data.webUrl).trim()
        if (t && !/^https:\/\//i.test(t)) {
          return res.status(400).json({ error: 'webUrl must be a full https:// link or null to clear.' })
        }
        params.push(t || null)
        sets.push(`web_url = $${params.length}`)
      }
    }

    params.push(req.params.id)
    const [row] = await query(
      `UPDATE collab_documents SET ${sets.join(', ')}
       WHERE id = $${params.length} RETURNING *`,
      params
    )
    if (!row) return res.status(404).json({ error: 'Document not found' })
    res.json({
      id: row.id,
      title: row.title,
      version: row.version,
      webUrl: row.web_url ? String(row.web_url).trim() : null,
    })
  } catch (e) {
    next(e)
  }
})

export default router
