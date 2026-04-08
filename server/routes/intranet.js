import { Router } from 'express'
import { z } from 'zod'
import { query, withTx } from '../db.js'

const router = Router()

const postSchema = z.object({
  author: z.string().min(2),
  initials: z.string().min(1).max(6).optional().default('NA'),
  department: z.string().optional().default(''),
  postType: z.enum(['Post', 'Announcement', 'Photo', 'File']).optional().default('Post'),
  content: z.string().min(1),
  attachmentUrl: z.string().url().optional().nullable(),
  attachmentName: z.string().optional().nullable(),
})

const commentSchema = z.object({
  author: z.string().min(2),
  initials: z.string().min(1).max(6).optional().default('NA'),
  text: z.string().min(1),
})

const likeSchema = z.object({
  actor: z.string().min(2),
})

function toUiPost(r) {
  return {
    id: r.id,
    author: r.author,
    initials: r.initials,
    dept: r.department || '',
    time: r.relative_time || 'Just now',
    type: r.post_type,
    content: r.content,
    likes: Number(r.likes_count || 0),
    comments: Number(r.comments_count || 0),
    attachmentUrl: r.attachment_url || null,
    attachmentName: r.attachment_name || null,
    image: r.post_type === 'Photo',
  }
}

async function fetchPostWithCounts(id) {
  const rows = await query(
    `SELECT
      p.*,
      COALESCE(l.likes_count, 0)::int AS likes_count,
      COALESCE(c.comments_count, 0)::int AS comments_count,
      CASE
        WHEN p.created_at > NOW() - INTERVAL '1 minute' THEN 'Just now'
        WHEN p.created_at > NOW() - INTERVAL '1 hour' THEN CONCAT(EXTRACT(MINUTE FROM NOW() - p.created_at)::int, 'm ago')
        WHEN p.created_at > NOW() - INTERVAL '24 hours' THEN CONCAT(EXTRACT(HOUR FROM NOW() - p.created_at)::int, 'h ago')
        ELSE TO_CHAR(p.created_at, 'Mon DD')
      END AS relative_time
     FROM intranet_posts p
     LEFT JOIN (
       SELECT post_id, COUNT(*) AS likes_count
       FROM intranet_post_likes
       GROUP BY post_id
     ) l ON l.post_id = p.id
     LEFT JOIN (
       SELECT post_id, COUNT(*) AS comments_count
       FROM intranet_comments
       GROUP BY post_id
     ) c ON c.post_id = p.id
     WHERE p.id = $1`,
    [id]
  )
  return rows[0] ? toUiPost(rows[0]) : null
}

router.get('/posts', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT
        p.*,
        COALESCE(l.likes_count, 0)::int AS likes_count,
        COALESCE(c.comments_count, 0)::int AS comments_count,
        CASE
          WHEN p.created_at > NOW() - INTERVAL '1 minute' THEN 'Just now'
          WHEN p.created_at > NOW() - INTERVAL '1 hour' THEN CONCAT(EXTRACT(MINUTE FROM NOW() - p.created_at)::int, 'm ago')
          WHEN p.created_at > NOW() - INTERVAL '24 hours' THEN CONCAT(EXTRACT(HOUR FROM NOW() - p.created_at)::int, 'h ago')
          ELSE TO_CHAR(p.created_at, 'Mon DD')
        END AS relative_time
       FROM intranet_posts p
       LEFT JOIN (
         SELECT post_id, COUNT(*) AS likes_count
         FROM intranet_post_likes
         GROUP BY post_id
       ) l ON l.post_id = p.id
       LEFT JOIN (
         SELECT post_id, COUNT(*) AS comments_count
         FROM intranet_comments
         GROUP BY post_id
       ) c ON c.post_id = p.id
       ORDER BY p.created_at DESC
       LIMIT 100`
    )

    const postIds = rows.map((r) => r.id)
    const comments = postIds.length
      ? await query(
          `SELECT id, post_id, author, initials, text,
             CASE
               WHEN created_at > NOW() - INTERVAL '1 minute' THEN 'Just now'
               WHEN created_at > NOW() - INTERVAL '1 hour' THEN CONCAT(EXTRACT(MINUTE FROM NOW() - created_at)::int, 'm ago')
               WHEN created_at > NOW() - INTERVAL '24 hours' THEN CONCAT(EXTRACT(HOUR FROM NOW() - created_at)::int, 'h ago')
               ELSE TO_CHAR(created_at, 'Mon DD')
             END AS relative_time
           FROM intranet_comments
           WHERE post_id = ANY($1::int[])
           ORDER BY created_at ASC`,
          [postIds]
        )
      : []

    const commentsByPost = new Map()
    for (const c of comments) {
      const list = commentsByPost.get(c.post_id) || []
      list.push({
        id: c.id,
        author: c.author,
        initials: c.initials,
        text: c.text,
        time: c.relative_time,
      })
      commentsByPost.set(c.post_id, list)
    }

    const posts = rows.map((r) => ({
      ...toUiPost(r),
      thread: commentsByPost.get(r.id) || [],
    }))

    res.json(posts)
  } catch (e) {
    next(e)
  }
})

router.post('/posts', async (req, res, next) => {
  try {
    const p = postSchema.parse(req.body || {})
    const [row] = await query(
      `INSERT INTO intranet_posts
       (author, initials, department, post_type, content, attachment_url, attachment_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [p.author, p.initials, p.department || '', p.postType, p.content, p.attachmentUrl || null, p.attachmentName || null]
    )
    const created = await fetchPostWithCounts(row.id)
    res.status(201).json({ ...created, thread: [] })
  } catch (e) {
    next(e)
  }
})

router.post('/posts/:id/comments', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const p = commentSchema.parse(req.body || {})
    await query(
      `INSERT INTO intranet_comments (post_id, author, initials, text)
       VALUES ($1, $2, $3, $4)`,
      [id, p.author, p.initials, p.text]
    )

    const [comments] = await query(
      `SELECT COUNT(*)::int AS count
       FROM intranet_comments
       WHERE post_id = $1`,
      [id]
    )

    const [comment] = await query(
      `SELECT id, author, initials, text,
         CASE
           WHEN created_at > NOW() - INTERVAL '1 minute' THEN 'Just now'
           ELSE CONCAT(EXTRACT(MINUTE FROM NOW() - created_at)::int, 'm ago')
         END AS relative_time
       FROM intranet_comments
       WHERE post_id = $1
       ORDER BY id DESC
       LIMIT 1`,
      [id]
    )

    res.status(201).json({
      postId: id,
      comments: Number(comments?.count || 0),
      comment: {
        id: comment.id,
        author: comment.author,
        initials: comment.initials,
        text: comment.text,
        time: comment.relative_time,
      },
    })
  } catch (e) {
    next(e)
  }
})

router.post('/posts/:id/toggle-like', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const p = likeSchema.parse(req.body || {})
    const result = await withTx(async (c) => {
      const existing = await c.query(
        `SELECT id
         FROM intranet_post_likes
         WHERE post_id = $1 AND actor = $2`,
        [id, p.actor]
      )
      let liked = false
      if (existing.rows[0]) {
        await c.query('DELETE FROM intranet_post_likes WHERE id = $1', [existing.rows[0].id])
      } else {
        await c.query('INSERT INTO intranet_post_likes (post_id, actor) VALUES ($1, $2)', [id, p.actor])
        liked = true
      }
      const count = await c.query(
        `SELECT COUNT(*)::int AS count
         FROM intranet_post_likes
         WHERE post_id = $1`,
        [id]
      )
      return { liked, likes: Number(count.rows[0]?.count || 0) }
    })

    res.json({ postId: id, ...result })
  } catch (e) {
    next(e)
  }
})

export default router
