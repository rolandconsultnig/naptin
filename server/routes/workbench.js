import { Router } from 'express'
import { z } from 'zod'
import { query, withTx } from '../db.js'

const router = Router()

const onboardingSchema = z.object({
  clientName: z.string().min(2),
  specialistEmail: z.string().email(),
  productType: z.string().min(2),
  scopeSummary: z.string().optional().default(''),
})

const healthSchema = z.object({
  usageScore: z.number().int().min(0).max(100),
  supportScore: z.number().int().min(0).max(100),
  paymentScore: z.number().int().min(0).max(100),
  npsScore: z.number().int().min(0).max(100),
  engagementScore: z.number().int().min(0).max(100),
  trend: z.enum(['up', 'down', 'steady']).default('steady'),
  notes: z.string().optional().default(''),
})

function band(score) {
  if (score >= 80) return 'Green'
  if (score >= 50) return 'Yellow'
  return 'Red'
}

router.get('/summary', async (_req, res, next) => {
  try {
    const [clients] = await query('SELECT COUNT(*)::int AS count FROM wb_clients')
    const [onboarding] = await query("SELECT COUNT(*)::int AS count FROM wb_onboarding_records WHERE status='active'")
    const [opp] = await query("SELECT COUNT(*)::int AS count FROM wb_opportunities WHERE status NOT IN ('Closed Won','Archived')")
    const [health] = await query(
      `SELECT
        COALESCE(SUM(CASE WHEN band='Green' THEN 1 ELSE 0 END),0)::int AS green_count,
        COALESCE(SUM(CASE WHEN band='Yellow' THEN 1 ELSE 0 END),0)::int AS yellow_count,
        COALESCE(SUM(CASE WHEN band='Red' THEN 1 ELSE 0 END),0)::int AS red_count
       FROM wb_health_scores`
    )
    res.json({
      clients: clients?.count ?? 0,
      onboarding: onboarding?.count ?? 0,
      opportunities: opp?.count ?? 0,
      health: health ?? { green_count: 0, yellow_count: 0, red_count: 0 },
    })
  } catch (e) { next(e) }
})

router.get('/clients', async (_req, res, next) => { try { res.json(await query('SELECT * FROM wb_clients ORDER BY id DESC')) } catch (e) { next(e) } })
router.get('/onboarding', async (_req, res, next) => {
  try {
    res.json(await query(`SELECT o.*, c.name AS client_name FROM wb_onboarding_records o JOIN wb_clients c ON c.id=o.client_id ORDER BY o.id DESC`))
  } catch (e) { next(e) }
})

router.post('/onboarding', async (req, res, next) => {
  try {
    const p = onboardingSchema.parse(req.body)
    const data = await withTx(async (c) => {
      const client = await c.query(
        `INSERT INTO wb_clients (name, owner_email, status) VALUES ($1,$2,'onboarding') RETURNING *`,
        [p.clientName, p.specialistEmail]
      )
      const onboarding = await c.query(
        `INSERT INTO wb_onboarding_records (client_id, specialist_email, product_type, scope_summary, status, progress_pct)
         VALUES ($1,$2,$3,$4,'active',0) RETURNING *`,
        [client.rows[0].id, p.specialistEmail, p.productType, p.scopeSummary]
      )
      const titles = ['Send welcome kit', 'Schedule kickoff call', 'Provision accounts', 'Collect client data', 'Generate first invoice']
      for (const t of titles) {
        await c.query(
          `INSERT INTO wb_onboarding_tasks (onboarding_id, title, owner_email, client_visible, client_action, status)
           VALUES ($1,$2,$3,true,false,'pending')`,
          [onboarding.rows[0].id, t, p.specialistEmail]
        )
      }
      return onboarding.rows[0]
    })
    res.status(201).json(data)
  } catch (e) { next(e) }
})

router.get('/onboarding/:id/tasks', async (req, res, next) => { try { res.json(await query('SELECT * FROM wb_onboarding_tasks WHERE onboarding_id=$1 ORDER BY id', [Number(req.params.id)])) } catch (e) { next(e) } })
router.patch('/onboarding/tasks/:taskId', async (req, res, next) => {
  try {
    const [task] = await query(
      `UPDATE wb_onboarding_tasks SET status=$1, completed_at=CASE WHEN $1='done' THEN NOW() ELSE NULL END WHERE id=$2 RETURNING *`,
      [req.body?.status === 'done' ? 'done' : 'pending', Number(req.params.taskId)]
    )
    await query(
      `UPDATE wb_onboarding_records o
       SET progress_pct=(SELECT COALESCE(ROUND(100.0*SUM(CASE WHEN status='done' THEN 1 ELSE 0 END)/NULLIF(COUNT(*),0)),0) FROM wb_onboarding_tasks t WHERE t.onboarding_id=o.id)
       WHERE o.id=$1`,
      [task.onboarding_id]
    )
    res.json(task)
  } catch (e) { next(e) }
})

router.get('/health/config', async (_req, res, next) => { try { const [r] = await query('SELECT * FROM wb_health_configs WHERE id=1'); res.json(r) } catch (e) { next(e) } })
router.patch('/health/config', async (req, res, next) => {
  try {
    const b = req.body || {}
    const [r] = await query(
      `UPDATE wb_health_configs SET usage_weight=$1,support_weight=$2,payment_weight=$3,nps_weight=$4,engagement_weight=$5,updated_by=$6,updated_at=NOW() WHERE id=1 RETURNING *`,
      [b.usageWeight, b.supportWeight, b.paymentWeight, b.npsWeight, b.engagementWeight, b.updatedBy || 'unknown@naptin.gov.ng']
    )
    res.json(r)
  } catch (e) { next(e) }
})
router.get('/health', async (_req, res, next) => {
  try {
    res.json(await query(`SELECT h.*, c.name AS client_name FROM wb_health_scores h JOIN wb_clients c ON c.id=h.client_id ORDER BY h.total_score DESC`))
  } catch (e) { next(e) }
})
router.post('/health/:clientId/recalculate', async (req, res, next) => {
  try {
    const v = healthSchema.parse(req.body)
    const [cfg] = await query('SELECT * FROM wb_health_configs WHERE id=1')
    const total = Math.round((v.usageScore * cfg.usage_weight + v.supportScore * cfg.support_weight + v.paymentScore * cfg.payment_weight + v.npsScore * cfg.nps_weight + v.engagementScore * cfg.engagement_weight) / 100)
    const [r] = await query(
      `INSERT INTO wb_health_scores (client_id,usage_score,support_score,payment_score,nps_score,engagement_score,total_score,band,trend,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (client_id) DO UPDATE SET usage_score=EXCLUDED.usage_score,support_score=EXCLUDED.support_score,payment_score=EXCLUDED.payment_score,nps_score=EXCLUDED.nps_score,engagement_score=EXCLUDED.engagement_score,total_score=EXCLUDED.total_score,band=EXCLUDED.band,trend=EXCLUDED.trend,notes=EXCLUDED.notes,updated_at=NOW()
       RETURNING *`,
      [Number(req.params.clientId), v.usageScore, v.supportScore, v.paymentScore, v.npsScore, v.engagementScore, total, band(total), v.trend, v.notes]
    )
    res.json(r)
  } catch (e) { next(e) }
})

router.get('/opportunities', async (_req, res, next) => { try { res.json(await query(`SELECT o.*, c.name AS client_name FROM wb_opportunities o JOIN wb_clients c ON c.id=o.client_id ORDER BY o.id DESC`)) } catch (e) { next(e) } })
router.post('/opportunities', async (req, res, next) => { try { const b = req.body || {}; const [r] = await query(`INSERT INTO wb_opportunities (client_id,type,suggested_product,estimated_value,evidence,status,assignee_email) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [b.clientId, b.type, b.suggestedProduct, b.estimatedValue || 0, b.evidence || '', b.status || 'Draft', b.assigneeEmail || null]); res.status(201).json(r) } catch (e) { next(e) } })
router.patch('/opportunities/:id', async (req, res, next) => { try { const b = req.body || {}; const [r] = await query(`UPDATE wb_opportunities SET status=COALESCE($1,status), approved_discount_pct=COALESCE($2,approved_discount_pct), closed_at=CASE WHEN $1='Closed Won' THEN NOW() ELSE closed_at END WHERE id=$3 RETURNING *`, [b.status || null, b.approvedDiscountPct ?? null, Number(req.params.id)]); res.json(r) } catch (e) { next(e) } })

router.get('/markets/criteria', async (_req, res, next) => { try { const [r] = await query('SELECT * FROM wb_market_criteria WHERE id=1'); res.json(r) } catch (e) { next(e) } })
router.patch('/markets/criteria', async (req, res, next) => {
  try {
    const b = req.body || {}
    const [r] = await query(
      `UPDATE wb_market_criteria SET market_size_weight=$1,growth_weight=$2,competition_weight=$3,regulation_weight=$4,fit_weight=$5,entry_cost_weight=$6,updated_by=$7,updated_at=NOW() WHERE id=1 RETURNING *`,
      [b.marketSizeWeight, b.growthWeight, b.competitionWeight, b.regulationWeight, b.fitWeight, b.entryCostWeight, b.updatedBy || 'unknown@naptin.gov.ng']
    )
    res.json(r)
  } catch (e) { next(e) }
})
router.get('/markets/candidates', async (_req, res, next) => { try { res.json(await query('SELECT * FROM wb_market_candidates ORDER BY weighted_score DESC NULLS LAST, id DESC')) } catch (e) { next(e) } })
router.post('/markets/candidates', async (req, res, next) => {
  try {
    const b = req.body || {}
    const [cfg] = await query('SELECT * FROM wb_market_criteria WHERE id=1')
    const score = ((Number(b.marketSizeScore || 0) * cfg.market_size_weight) + (Number(b.growthScore || 0) * cfg.growth_weight) + (Number(b.competitionScore || 0) * cfg.competition_weight) + (Number(b.regulationScore || 0) * cfg.regulation_weight) + (Number(b.fitScore || 0) * cfg.fit_weight) + (Number(b.entryCostScore || 0) * cfg.entry_cost_weight)) / 100
    const [r] = await query(
      `INSERT INTO wb_market_candidates (name,market_size_score,growth_score,competition_score,regulation_score,fit_score,entry_cost_score,estimated_roi,entry_cost_usd,weighted_score,stage)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Candidate') RETURNING *`,
      [b.name, b.marketSizeScore, b.growthScore, b.competitionScore, b.regulationScore, b.fitScore, b.entryCostScore, b.estimatedRoi || 0, b.entryCostUsd || 0, Number(score.toFixed(2))]
    )
    res.status(201).json(r)
  } catch (e) { next(e) }
})
router.post('/markets/candidates/:id/deep-dive', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    await withTx(async (c) => {
      await c.query(`UPDATE wb_market_candidates SET stage='Deep Dive' WHERE id=$1`, [id])
      const taskRows = [['Competitive analysis', 10], ['Customer interviews', 15], ['Regulatory check', 20]]
      for (const [title, days] of taskRows) {
        await c.query(`INSERT INTO wb_market_deep_dive_tasks (candidate_id,title,owner_email,due_at,status) VALUES ($1,$2,'analyst@naptin.gov.ng',NOW()+($3 || ' days')::interval,'open')`, [id, title, days])
      }
    })
    res.json({ ok: true })
  } catch (e) { next(e) }
})
router.get('/markets/deep-dive-tasks', async (_req, res, next) => { try { res.json(await query(`SELECT t.*, c.name AS market_name FROM wb_market_deep_dive_tasks t JOIN wb_market_candidates c ON c.id=t.candidate_id ORDER BY t.id DESC`)) } catch (e) { next(e) } })

router.get('/pilots', async (_req, res, next) => { try { res.json(await query('SELECT * FROM wb_pilots ORDER BY id DESC')) } catch (e) { next(e) } })
router.post('/pilots', async (req, res, next) => { try { const b = req.body || {}; const [r] = await query(`INSERT INTO wb_pilots (market_name,duration_days,budget_usd,success_customer_target,success_conversion_target,success_cac_target,status,owner_email) VALUES ($1,$2,$3,$4,$5,$6,'Planned',$7) RETURNING *`, [b.marketName, b.durationDays || 90, b.budgetUsd || 0, b.successCustomerTarget || 50, b.successConversionTarget || 20, b.successCacTarget || 100, b.ownerEmail || null]); res.status(201).json(r) } catch (e) { next(e) } })
router.post('/pilots/:id/metrics', async (req, res, next) => { try { const b = req.body || {}; const [r] = await query(`INSERT INTO wb_pilot_metrics (pilot_id,leads_generated,conversions,cac,support_tickets) VALUES ($1,$2,$3,$4,$5) RETURNING *`, [Number(req.params.id), b.leadsGenerated || 0, b.conversions || 0, b.cac || 0, b.supportTickets || 0]); res.status(201).json(r) } catch (e) { next(e) } })
router.patch('/pilots/:id/decision', async (req, res, next) => { try { const [r] = await query(`UPDATE wb_pilots SET decision=$1, status=CASE WHEN $1='Scale' THEN 'ApprovedScale' WHEN $1='Abort' THEN 'Closed' ELSE 'Iterating' END, ended_at=NOW() WHERE id=$2 RETURNING *`, [req.body?.decision || 'Iterate', Number(req.params.id)]); res.json(r) } catch (e) { next(e) } })

router.get('/feedback', async (_req, res, next) => { try { res.json(await query(`SELECT f.*, c.name AS client_name FROM wb_feedback_items f LEFT JOIN wb_clients c ON c.id=f.client_id ORDER BY f.id DESC`)) } catch (e) { next(e) } })
router.post('/feedback', async (req, res, next) => { try { const b = req.body || {}; const [r] = await query(`INSERT INTO wb_feedback_items (client_id,source,category,summary,sentiment,frequency_count,priority,routed_to,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, [b.clientId || null, b.source || 'manual', b.category || 'Pain point', b.summary, b.sentiment || 'neutral', b.frequencyCount || 1, b.priority || 'P2', b.routedTo || 'Product', b.status || 'Open']); res.status(201).json(r) } catch (e) { next(e) } })
router.patch('/feedback/:id', async (req, res, next) => { try { const b = req.body || {}; const [r] = await query(`UPDATE wb_feedback_items SET priority=COALESCE($1,priority), routed_to=COALESCE($2,routed_to), status=COALESCE($3,status), roadmap_eta=COALESCE($4,roadmap_eta), updated_at=NOW() WHERE id=$5 RETURNING *`, [b.priority || null, b.routedTo || null, b.status || null, b.roadmapEta || null, Number(req.params.id)]); res.json(r) } catch (e) { next(e) } })

router.get('/renewals', async (_req, res, next) => { try { res.json(await query(`SELECT r.*, c.name AS client_name FROM wb_renewals r JOIN wb_clients c ON c.id=r.client_id ORDER BY r.term_end`)) } catch (e) { next(e) } })
router.post('/renewals', async (req, res, next) => {
  try {
    const b = req.body || {}
    const inc = b.currentAmount && b.proposedAmount ? (((Number(b.proposedAmount) - Number(b.currentAmount)) / Number(b.currentAmount)) * 100).toFixed(2) : null
    const [r] = await query(
      `INSERT INTO wb_renewals (client_id,term_start,term_end,current_amount,proposed_amount,increase_pct,recommended_action,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'ProposalDraft') RETURNING *`,
      [b.clientId, b.termStart || null, b.termEnd || null, b.currentAmount || 0, b.proposedAmount || null, inc, b.recommendedAction || 'Renew + upsell']
    )
    res.status(201).json(r)
  } catch (e) { next(e) }
})
router.patch('/renewals/:id/status', async (req, res, next) => {
  try {
    const b = req.body || {}
    const [r] = await query(`UPDATE wb_renewals SET status=$1, counter_amount=COALESCE($2,counter_amount), signed_at=CASE WHEN $1='Signed' THEN NOW() ELSE signed_at END WHERE id=$3 RETURNING *`, [b.status, b.counterAmount || null, Number(req.params.id)])
    if (b.approvedBy) {
      await query(`INSERT INTO wb_approval_logs (module, record_id, action, actor_email, notes) VALUES ('renewal', $1, $2, $3, $4)`, [Number(req.params.id), b.status, b.approvedBy, b.notes || null])
    }
    res.json(r)
  } catch (e) { next(e) }
})

export default router

