import { Router } from 'express'
import { z } from 'zod'
import { query, withTx } from '../db.js'

const router = Router()

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function nextVoucherId() {
  const year = new Date().getFullYear()
  const [row] = await query(
    `SELECT COUNT(*) AS c FROM ca_advances WHERE voucher_id LIKE $1`,
    [`CA-${year}-%`]
  )
  const seq = String(parseInt(row.c) + 1).padStart(4, '0')
  return `CA-${year}-${seq}`
}

function mapAdvance(r) {
  return {
    id: r.id,
    voucherId: r.voucher_id,
    employeeId: r.employee_id,
    employeeName: r.employee_name,
    departmentCode: r.department_code,
    purpose: r.purpose,
    projectCode: r.project_code,
    expectedAmount: parseFloat(r.expected_amount),
    disbursedAmount: r.disbursed_amount ? parseFloat(r.disbursed_amount) : null,
    actualAmount: r.actual_amount ? parseFloat(r.actual_amount) : null,
    variance: r.variance ? parseFloat(r.variance) : null,
    status: r.status,
    proposedRetirementDate: r.proposed_retirement_date,
    requestDate: r.request_date,
    approvedByManager: r.approved_by_manager,
    approvedByManagerAt: r.approved_by_manager_at,
    approvedByFinance: r.approved_by_finance,
    approvedByFinanceAt: r.approved_by_finance_at,
    rejectionReason: r.rejection_reason,
    disbursedBy: r.disbursed_by,
    disbursedAt: r.disbursed_at,
    retiredAt: r.retired_at,
    retirementNotes: r.retirement_notes,
    settledAt: r.settled_at,
    settledBy: r.settled_by,
    settlementMethod: r.settlement_method,
    cashReturned: r.cash_returned ? parseFloat(r.cash_returned) : 0,
    reimbursementAmount: r.reimbursement_amount ? parseFloat(r.reimbursement_amount) : 0,
    payrollDeductionAmount: r.payroll_deduction_amount ? parseFloat(r.payroll_deduction_amount) : 0,
    payrollDeductionRef: r.payroll_deduction_ref,
    financeNotes: r.finance_notes,
    disbursementJournalId: r.disbursement_journal_id,
    settlementJournalId: r.settlement_journal_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

function mapExpenseLine(r) {
  return {
    id: r.id,
    advanceId: r.advance_id,
    expenseDate: r.expense_date,
    vendorName: r.vendor_name,
    category: r.category,
    description: r.description,
    amount: parseFloat(r.amount),
    taxAmount: parseFloat(r.tax_amount),
    receiptRef: r.receipt_ref,
    createdAt: r.created_at,
  }
}

async function logAction(advanceId, stage, action, actor, notes = null) {
  await query(
    `INSERT INTO ca_approval_log (advance_id, stage, action, actor, notes)
     VALUES ($1, $2, $3, $4, $5)`,
    [advanceId, stage, action, actor, notes]
  )
}

// ─── GET /cash-advances  ──── list all (with filters) ─────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { status, employeeId, departmentCode, limit = 100 } = req.query
    const conds = []
    const params = []

    if (status && status !== 'all') { params.push(status); conds.push(`status = $${params.length}`) }
    if (employeeId) { params.push(employeeId); conds.push(`employee_id = $${params.length}`) }
    if (departmentCode) { params.push(departmentCode); conds.push(`department_code = $${params.length}`) }

    params.push(Math.min(parseInt(limit), 500))
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''

    const rows = await query(
      `SELECT * FROM ca_advances ${where} ORDER BY created_at DESC LIMIT $${params.length}`,
      params
    )
    res.json(rows.map(mapAdvance))
  } catch (e) { next(e) }
})

// ─── GET /cash-advances/dashboard ─── summary KPIs ────────────────────────────
router.get('/dashboard', async (_req, res, next) => {
  try {
    const [totals] = await query(
      `SELECT
         COUNT(*) FILTER (WHERE status NOT IN ('settled','rejected','cancelled'))          AS open_count,
         COUNT(*) FILTER (WHERE status = 'disbursed')                                     AS disbursed_count,
         COUNT(*) FILTER (WHERE status IN ('pending_approval','approved'))                AS pending_approval_count,
         COUNT(*) FILTER (WHERE status = 'retired')                                       AS retired_pending_settlement,
         COALESCE(SUM(disbursed_amount) FILTER (WHERE status = 'disbursed'),0)            AS total_open_balance,
         COUNT(*) FILTER (WHERE status = 'disbursed'
                          AND proposed_retirement_date < CURRENT_DATE)                    AS overdue_count
       FROM ca_advances`
    )
    const byDept = await query(
      `SELECT department_code,
              COALESCE(SUM(disbursed_amount),0) AS total_disbursed,
              COUNT(*)                           AS count
       FROM ca_advances
       WHERE status = 'disbursed'
       GROUP BY department_code
       ORDER BY total_disbursed DESC`
    )
    res.json({
      openCount: parseInt(totals.open_count),
      disbursedCount: parseInt(totals.disbursed_count),
      pendingApprovalCount: parseInt(totals.pending_approval_count),
      retiredPendingSettlement: parseInt(totals.retired_pending_settlement),
      totalOpenBalance: parseFloat(totals.total_open_balance),
      overdueCount: parseInt(totals.overdue_count),
      byDepartment: byDept.map(r => ({
        department: r.department_code,
        totalDisbursed: parseFloat(r.total_disbursed),
        count: parseInt(r.count),
      })),
    })
  } catch (e) { next(e) }
})

// ─── GET /cash-advances/:id ───────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const [row] = await query(`SELECT * FROM ca_advances WHERE id = $1`, [req.params.id])
    if (!row) return res.status(404).json({ error: 'Cash advance not found' })

    const lines = await query(
      `SELECT * FROM ca_expense_lines WHERE advance_id = $1 ORDER BY expense_date, id`,
      [row.id]
    )
    const log = await query(
      `SELECT * FROM ca_approval_log WHERE advance_id = $1 ORDER BY created_at`,
      [row.id]
    )

    res.json({
      ...mapAdvance(row),
      expenseLines: lines.map(mapExpenseLine),
      auditLog: log.map(l => ({
        id: l.id, stage: l.stage, action: l.action,
        actor: l.actor, notes: l.notes, createdAt: l.created_at,
      })),
    })
  } catch (e) { next(e) }
})

// ─── POST /cash-advances ─── create request ───────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const data = z.object({
      employeeId: z.string().min(1),
      employeeName: z.string().min(1),
      departmentCode: z.string().min(1),
      purpose: z.string().min(5),
      projectCode: z.string().optional().nullable(),
      expectedAmount: z.number().positive(),
      proposedRetirementDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }).parse(req.body)

    // Block request if employee has unretired advances
    const [unretired] = await query(
      `SELECT COUNT(*) AS c FROM ca_advances
       WHERE employee_id = $1 AND status IN ('disbursed','retired','pending_approval','approved')`,
      [data.employeeId]
    )
    if (parseInt(unretired.c) > 0) {
      return res.status(400).json({
        error: 'Employee has an outstanding unretired advance. Retire the previous advance before requesting a new one.',
      })
    }

    const voucherId = await nextVoucherId()

    const [row] = await query(
      `INSERT INTO ca_advances
         (voucher_id, employee_id, employee_name, department_code, purpose, project_code,
          expected_amount, proposed_retirement_date, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending_approval')
       RETURNING *`,
      [
        voucherId, data.employeeId, data.employeeName, data.departmentCode,
        data.purpose, data.projectCode || null, data.expectedAmount, data.proposedRetirementDate,
      ]
    )

    await logAction(row.id, 'request', 'submitted', data.employeeName)
    res.status(201).json(mapAdvance(row))
  } catch (e) { next(e) }
})

// ─── POST /cash-advances/:id/approve-manager ──────────────────────────────────
router.post('/:id/approve-manager', async (req, res, next) => {
  try {
    const { approvedBy = 'Manager' } = z.object({ approvedBy: z.string().optional() }).parse(req.body)

    const [row] = await query(
      `UPDATE ca_advances
       SET status = 'approved', approved_by_manager = $1, approved_by_manager_at = NOW(), updated_at = NOW()
       WHERE id = $2 AND status = 'pending_approval'
       RETURNING *`,
      [approvedBy, req.params.id]
    )
    if (!row) return res.status(400).json({ error: 'Advance is not in pending_approval state' })

    await logAction(row.id, 'manager_approval', 'approved', approvedBy)
    res.json(mapAdvance(row))
  } catch (e) { next(e) }
})

// ─── POST /cash-advances/:id/approve-finance ──────────────────────────────────
router.post('/:id/approve-finance', async (req, res, next) => {
  try {
    const { approvedBy = 'Finance Controller', notes } = z.object({
      approvedBy: z.string().optional(),
      notes: z.string().optional(),
    }).parse(req.body)

    const [row] = await query(
      `UPDATE ca_advances
       SET approved_by_finance = $1, approved_by_finance_at = NOW(),
           finance_notes = $2, updated_at = NOW()
       WHERE id = $3 AND status = 'approved'
       RETURNING *`,
      [approvedBy, notes || null, req.params.id]
    )
    if (!row) return res.status(400).json({ error: 'Advance must be manager-approved first' })

    await logAction(row.id, 'finance_approval', 'approved', approvedBy, notes)
    res.json(mapAdvance(row))
  } catch (e) { next(e) }
})

// ─── POST /cash-advances/:id/reject ───────────────────────────────────────────
router.post('/:id/reject', async (req, res, next) => {
  try {
    const { rejectedBy = 'Finance Controller', reason } = z.object({
      rejectedBy: z.string().optional(),
      reason: z.string().min(5),
    }).parse(req.body)

    const [row] = await query(
      `UPDATE ca_advances
       SET status = 'rejected', rejection_reason = $1, updated_at = NOW()
       WHERE id = $2 AND status IN ('pending_approval','approved')
       RETURNING *`,
      [reason, req.params.id]
    )
    if (!row) return res.status(400).json({ error: 'Advance cannot be rejected at this stage' })

    await logAction(row.id, 'manager_approval', 'rejected', rejectedBy, reason)
    res.json(mapAdvance(row))
  } catch (e) { next(e) }
})

// ─── POST /cash-advances/:id/disburse ─────────────────────────────────────────
// Finance issues cash; posts GL: Dr Employee Advance Receivable / Cr Petty Cash
router.post('/:id/disburse', async (req, res, next) => {
  try {
    const data = z.object({
      disbursedBy: z.string().min(1),
      disbursedAmount: z.number().positive(),
      advanceReceivableAccountId: z.number().int().optional(),
      pettyCashAccountId: z.number().int().optional(),
    }).parse(req.body)

    await withTx(async (client) => {
      const { rows: [adv] } = await client.query(
        `SELECT * FROM ca_advances WHERE id = $1 AND status = 'approved' AND approved_by_finance IS NOT NULL`,
        [req.params.id]
      )
      if (!adv) throw new Error('Advance must be fully approved (manager + finance) before disbursement')

      // Optional: post a GL journal entry
      let journalId = null
      if (data.advanceReceivableAccountId && data.pettyCashAccountId) {
        const entryRef = `JE-CA-${adv.voucher_id}`
        const { rows: [je] } = await client.query(
          `INSERT INTO fin_journal_entries
             (entry_ref, entry_date, description, source_module, source_ref, status, prepared_by)
           VALUES ($1, CURRENT_DATE, $2, 'cash_advance', $3, 'posted', $4)
           RETURNING id`,
          [
            entryRef,
            `Cash Advance Disbursement — ${adv.voucher_id}`,
            adv.voucher_id,
            data.disbursedBy,
          ]
        )
        journalId = je.id
        // Dr Employee Advance Receivable
        await client.query(
          `INSERT INTO fin_journal_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
           VALUES ($1,$2,$3,$4,0)`,
          [journalId, data.advanceReceivableAccountId, `Advance to ${adv.employee_name}`, data.disbursedAmount]
        )
        // Cr Petty Cash / Bank
        await client.query(
          `INSERT INTO fin_journal_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
           VALUES ($1,$2,$3,0,$4)`,
          [journalId, data.pettyCashAccountId, `Cash out — ${adv.voucher_id}`, data.disbursedAmount]
        )
      }

      const { rows: [updated] } = await client.query(
        `UPDATE ca_advances
         SET status = 'disbursed', disbursed_by = $1, disbursed_at = NOW(),
             disbursed_amount = $2, disbursement_journal_id = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [data.disbursedBy, data.disbursedAmount, journalId, adv.id]
      )

      await client.query(
        `INSERT INTO ca_approval_log (advance_id, stage, action, actor, notes)
         VALUES ($1,'disbursement','disbursed',$2,$3)`,
        [adv.id, data.disbursedBy, `₦${data.disbursedAmount.toLocaleString()} issued`]
      )

      res.json(mapAdvance(updated))
    })
  } catch (e) { next(e) }
})

// ─── POST /cash-advances/:id/retire ───────────────────────────────────────────
// Employee submits actual expenses (line items)
router.post('/:id/retire', async (req, res, next) => {
  try {
    const data = z.object({
      retiredBy: z.string().min(1),
      retirementNotes: z.string().optional(),
      expenseLines: z.array(z.object({
        expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        vendorName: z.string().min(1),
        category: z.enum(['travel', 'supplies', 'meals', 'accommodation', 'repairs', 'other']),
        description: z.string().min(1),
        amount: z.number().positive(),
        taxAmount: z.number().min(0).default(0),
        receiptRef: z.string().optional().nullable(),
      })).min(1),
    }).parse(req.body)

    await withTx(async (client) => {
      const { rows: [adv] } = await client.query(
        `SELECT * FROM ca_advances WHERE id = $1 AND status = 'disbursed'`,
        [req.params.id]
      )
      if (!adv) throw new Error('Advance must be disbursed before retirement')

      // Delete any previous draft expense lines (re-submission)
      await client.query(`DELETE FROM ca_expense_lines WHERE advance_id = $1`, [adv.id])

      // Insert expense lines
      for (const line of data.expenseLines) {
        await client.query(
          `INSERT INTO ca_expense_lines (advance_id, expense_date, vendor_name, category, description, amount, tax_amount, receipt_ref)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [adv.id, line.expenseDate, line.vendorName, line.category,
           line.description, line.amount, line.taxAmount, line.receiptRef || null]
        )
      }

      const actualAmount = data.expenseLines.reduce((s, l) => s + l.amount, 0)
      const variance = actualAmount - parseFloat(adv.disbursed_amount)

      const { rows: [updated] } = await client.query(
        `UPDATE ca_advances
         SET status = 'retired', actual_amount = $1, variance = $2,
             retired_at = NOW(), retirement_notes = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [actualAmount, variance, data.retirementNotes || null, adv.id]
      )

      await client.query(
        `INSERT INTO ca_approval_log (advance_id, stage, action, actor, notes)
         VALUES ($1,'retirement','retired',$2,$3)`,
        [adv.id, data.retiredBy, `Actual: ₦${actualAmount.toLocaleString()}, Variance: ₦${variance.toLocaleString()}`]
      )

      res.json(mapAdvance(updated))
    })
  } catch (e) { next(e) }
})

// ─── POST /cash-advances/:id/settle ───────────────────────────────────────────
// Finance finalises: close out the advance, record returns/reimbursements/deductions
router.post('/:id/settle', async (req, res, next) => {
  try {
    const data = z.object({
      settledBy: z.string().min(1),
      settlementMethod: z.enum(['cash_return', 'salary_deduction', 'reimbursement', 'combined']),
      cashReturned: z.number().min(0).default(0),
      reimbursementAmount: z.number().min(0).default(0),
      payrollDeductionAmount: z.number().min(0).default(0),
      payrollDeductionRef: z.string().optional().nullable(),
      financeNotes: z.string().optional(),
      advanceReceivableAccountId: z.number().int().optional(),
      expenseAccountId: z.number().int().optional(),
      pettyCashAccountId: z.number().int().optional(),
    }).parse(req.body)

    await withTx(async (client) => {
      const { rows: [adv] } = await client.query(
        `SELECT * FROM ca_advances WHERE id = $1 AND status = 'retired'`,
        [req.params.id]
      )
      if (!adv) throw new Error('Advance must be retired before settlement')

      // Optional: post settlement GL journal
      let settlementJournalId = null
      if (data.advanceReceivableAccountId && (data.pettyCashAccountId || data.expenseAccountId)) {
        const entryRef = `JE-CAS-${adv.voucher_id}`
        const variance = parseFloat(adv.variance)

        const { rows: [je] } = await client.query(
          `INSERT INTO fin_journal_entries
             (entry_ref, entry_date, description, source_module, source_ref, status, prepared_by)
           VALUES ($1, CURRENT_DATE, $2, 'cash_advance', $3, 'posted', $4)
           RETURNING id`,
          [
            entryRef,
            `Cash Advance Settlement — ${adv.voucher_id}`,
            adv.voucher_id,
            data.settledBy,
          ]
        )
        settlementJournalId = je.id
        const disbursed = parseFloat(adv.disbursed_amount)

        if (variance < 0 && data.pettyCashAccountId) {
          // Spent less: Dr Petty Cash (return), Cr Employee Advance Receivable
          const returned = Math.abs(variance)
          await client.query(
            `INSERT INTO fin_journal_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
             VALUES ($1,$2,$3,$4,0)`,
            [settlementJournalId, data.pettyCashAccountId, `Cash returned — ${adv.voucher_id}`, returned]
          )
          await client.query(
            `INSERT INTO fin_journal_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
             VALUES ($1,$2,$3,0,$4)`,
            [settlementJournalId, data.advanceReceivableAccountId, `Clear advance — ${adv.voucher_id}`, disbursed]
          )
        } else if (variance > 0 && data.expenseAccountId) {
          // Spent more: Dr Expense (overage), Dr Employee Advance Receiv. (clear), Cr... handled via reimbursement
          await client.query(
            `INSERT INTO fin_journal_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
             VALUES ($1,$2,$3,$4,0)`,
            [settlementJournalId, data.expenseAccountId, `Expense overage — ${adv.voucher_id}`, variance]
          )
          await client.query(
            `INSERT INTO fin_journal_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
             VALUES ($1,$2,$3,0,$4)`,
            [settlementJournalId, data.advanceReceivableAccountId, `Clear advance — ${adv.voucher_id}`, disbursed + variance]
          )
        } else {
          // Exact match: Cr Employee Advance Receivable
          await client.query(
            `INSERT INTO fin_journal_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
             VALUES ($1,$2,$3,$4,0)`,
            [settlementJournalId, data.expenseAccountId || data.pettyCashAccountId, `Expenses — ${adv.voucher_id}`, disbursed]
          )
          await client.query(
            `INSERT INTO fin_journal_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
             VALUES ($1,$2,$3,0,$4)`,
            [settlementJournalId, data.advanceReceivableAccountId, `Clear advance — ${adv.voucher_id}`, disbursed]
          )
        }
      }

      const { rows: [updated] } = await client.query(
        `UPDATE ca_advances
         SET status = 'settled', settled_by = $1, settled_at = NOW(),
             settlement_method = $2, cash_returned = $3, reimbursement_amount = $4,
             payroll_deduction_amount = $5, payroll_deduction_ref = $6,
             finance_notes = $7, settlement_journal_id = $8, updated_at = NOW()
         WHERE id = $9
         RETURNING *`,
        [
          data.settledBy, data.settlementMethod,
          data.cashReturned, data.reimbursementAmount,
          data.payrollDeductionAmount, data.payrollDeductionRef || null,
          data.financeNotes || null, settlementJournalId,
          adv.id,
        ]
      )

      await client.query(
        `INSERT INTO ca_approval_log (advance_id, stage, action, actor, notes)
         VALUES ($1,'settlement','settled',$2,$3)`,
        [adv.id, data.settledBy, `Method: ${data.settlementMethod}`]
      )

      res.json(mapAdvance(updated))
    })
  } catch (e) { next(e) }
})

// ─── GET /cash-advances/:id/expense-lines ─────────────────────────────────────
router.get('/:id/expense-lines', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT * FROM ca_expense_lines WHERE advance_id = $1 ORDER BY expense_date, id`,
      [req.params.id]
    )
    res.json(rows.map(mapExpenseLine))
  } catch (e) { next(e) }
})

// ─── GET /cash-advances/:id/log ───────────────────────────────────────────────
router.get('/:id/log', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT * FROM ca_approval_log WHERE advance_id = $1 ORDER BY created_at`,
      [req.params.id]
    )
    res.json(rows.map(l => ({
      id: l.id, stage: l.stage, action: l.action,
      actor: l.actor, notes: l.notes, createdAt: l.created_at,
    })))
  } catch (e) { next(e) }
})

export default router
