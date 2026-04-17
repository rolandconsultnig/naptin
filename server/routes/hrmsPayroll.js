import { Router } from 'express'
import { z } from 'zod'
import { query, withTx } from '../db.js'

const router = Router()

// ─── Payroll Periods ────────────────────────────────────────────

const periodSchema = z.object({
  label: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  payDate: z.string(),
})

router.get('/periods', async (_req, res, next) => {
  try {
    const rows = await query(`SELECT * FROM hr_payroll_periods ORDER BY start_date DESC`)
    res.json(rows.map(r => ({
      id: r.id,
      label: r.label,
      startDate: r.start_date,
      endDate: r.end_date,
      payDate: r.pay_date,
      status: r.status,
      createdBy: r.created_by,
      approvedBy: r.approved_by,
      approvedAt: r.approved_at,
      createdAt: r.created_at,
    })))
  } catch (e) { next(e) }
})

router.post('/periods', async (req, res, next) => {
  try {
    const data = periodSchema.parse(req.body)
    const [row] = await query(
      `INSERT INTO hr_payroll_periods (label, start_date, end_date, pay_date, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.label, data.startDate, data.endDate, data.payDate, req.body.createdBy || 'system']
    )
    res.status(201).json({ id: row.id, label: row.label, status: row.status })
  } catch (e) { next(e) }
})

// ─── Run Payroll ────────────────────────────────────────────────

router.post('/periods/:id/run', async (req, res, next) => {
  try {
    const periodId = parseInt(req.params.id)
    const [period] = await query(`SELECT * FROM hr_payroll_periods WHERE id = $1`, [periodId])
    if (!period) return res.status(404).json({ error: 'Period not found' })
    if (period.status === 'published') return res.status(400).json({ error: 'Period already published' })

    const result = await withTx(async (client) => {
      // clear existing payslips for re-run
      await client.query(`DELETE FROM hr_payslips WHERE payroll_period_id = $1`, [periodId])

      // get all active employees
      const { rows: employees } = await client.query(
        `SELECT e.id, e.grade_level, e.step
         FROM hr_employees e
         WHERE e.employment_status = 'active'`
      )

      // salary lookup by grade level (NAPTIN consolidated salary structure)
      const gradeBase = {
        'GL-01': 68000, 'GL-02': 72000, 'GL-03': 81000, 'GL-04': 89000,
        'GL-05': 98000, 'GL-06': 112000, 'GL-07': 135000, 'GL-08': 170000,
        'GL-09': 210000, 'GL-10': 250000, 'GL-12': 380000, 'GL-14': 520000,
        'GL-15': 620000, 'GL-16': 750000, 'GL-17': 900000,
      }

      const earningsTypes = (await client.query(
        `SELECT * FROM hr_earnings_types WHERE status = 'active'`
      )).rows

      const deductionTypes = (await client.query(
        `SELECT * FROM hr_deduction_types WHERE status = 'active'`
      )).rows

      let totalGross = 0
      let totalDeductions = 0
      let totalNet = 0
      let staffCount = 0

      for (const emp of employees) {
        const basic = gradeBase[emp.grade_level] || 150000
        const stepAllowance = (emp.step || 1) * 2500
        const transport = Math.round(basic * 0.15)
        const housing = Math.round(basic * 0.15)
        const meal = 15000
        const gross = basic + stepAllowance + transport + housing + meal

        // statutory deductions
        const pensionEmp = Math.round(gross * 0.08)
        const pensionEr = Math.round(gross * 0.10)
        const nhf = Math.round(basic * 0.025)

        // income tax (simplified PAYE)
        const taxableIncome = gross - pensionEmp - nhf
        const tax = computePaye(taxableIncome)

        const totalDed = pensionEmp + nhf + tax
        const net = gross - totalDed

        const { rows: [payslip] } = await client.query(
          `INSERT INTO hr_payslips
            (payroll_period_id, employee_id, basic_salary, gross_earnings,
             total_deductions, net_pay, tax_amount, pension_employee,
             pension_employer, nhf, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'computed')
           RETURNING id`,
          [periodId, emp.id, basic, gross, totalDed, net, tax, pensionEmp, pensionEr, nhf]
        )

        // insert earning lines
        const lines = [
          ['earning', 'BASIC', 'Basic Salary', basic],
          ['earning', 'STEP', 'Step Increment', stepAllowance],
          ['earning', 'TRANSPORT', 'Transport Allowance', transport],
          ['earning', 'HOUSING', 'Housing Allowance', housing],
          ['earning', 'MEAL', 'Meal Subsidy', meal],
          ['deduction', 'PENSION_EE', 'Pension (Employee 8%)', pensionEmp],
          ['deduction', 'NHF', 'National Housing Fund', nhf],
          ['deduction', 'PAYE', 'Income Tax (PAYE)', tax],
        ]

        for (const [lineType, code, desc, amount] of lines) {
          await client.query(
            `INSERT INTO hr_payslip_lines (payslip_id, line_type, type_code, description, amount)
             VALUES ($1, $2, $3, $4, $5)`,
            [payslip.id, lineType, code, desc, amount]
          )
        }

        totalGross += gross
        totalDeductions += totalDed
        totalNet += net
        staffCount++
      }

      await client.query(
        `UPDATE hr_payroll_periods SET status = 'computed' WHERE id = $1`,
        [periodId]
      )

      return { staffCount, totalGross, totalDeductions, totalNet }
    })

    res.json(result)
  } catch (e) { next(e) }
})

// ─── Approve / Publish ──────────────────────────────────────────

router.post('/periods/:id/approve', async (req, res, next) => {
  try {
    const [period] = await query(
      `UPDATE hr_payroll_periods
       SET status = 'published', approved_by = $1, approved_at = NOW()
       WHERE id = $2 AND status = 'computed'
       RETURNING *`,
      [req.body.approvedBy || 'system', req.params.id]
    )
    if (!period) return res.status(400).json({ error: 'Period not in computed state' })
    res.json({ id: period.id, status: period.status })
  } catch (e) { next(e) }
})

// ─── Payslips ───────────────────────────────────────────────────

router.get('/periods/:id/payslips', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT ps.*,
              e.first_name || ' ' || e.last_name AS employee_name,
              e.employee_id AS employee_code,
              d.name AS department_name,
              e.grade_level
       FROM hr_payslips ps
       JOIN hr_employees e ON e.id = ps.employee_id
       LEFT JOIN hr_departments d ON d.id = e.department_id
       WHERE ps.payroll_period_id = $1
       ORDER BY e.last_name`,
      [req.params.id]
    )
    res.json(rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      employeeCode: r.employee_code,
      department: r.department_name,
      gradeLevel: r.grade_level,
      basicSalary: parseFloat(r.basic_salary),
      grossEarnings: parseFloat(r.gross_earnings),
      totalDeductions: parseFloat(r.total_deductions),
      netPay: parseFloat(r.net_pay),
      tax: parseFloat(r.tax_amount),
      pensionEmployee: parseFloat(r.pension_employee),
      pensionEmployer: parseFloat(r.pension_employer),
      nhf: parseFloat(r.nhf),
      status: r.status,
    })))
  } catch (e) { next(e) }
})

router.get('/my-payslips', async (req, res, next) => {
  try {
    const email = req.query.email
    if (!email) return res.status(400).json({ error: 'email required' })

    const rows = await query(
      `SELECT ps.*, pp.label AS period_label, pp.pay_date
       FROM hr_payslips ps
       JOIN hr_payroll_periods pp ON pp.id = ps.payroll_period_id
       JOIN hr_employees e ON e.id = ps.employee_id
       WHERE e.email = $1 AND pp.status = 'published'
       ORDER BY pp.pay_date DESC`,
      [email]
    )
    res.json(rows.map(r => ({
      id: r.id,
      periodLabel: r.period_label,
      payDate: r.pay_date,
      basicSalary: parseFloat(r.basic_salary),
      grossEarnings: parseFloat(r.gross_earnings),
      totalDeductions: parseFloat(r.total_deductions),
      netPay: parseFloat(r.net_pay),
      tax: parseFloat(r.tax_amount),
    })))
  } catch (e) { next(e) }
})

// ─── Nigerian PAYE computation ──────────────────────────────────

function computePaye(annualTaxable) {
  const monthly = annualTaxable
  const annual = monthly * 12

  // CRA = max(1% gross, 200000) + 20% gross
  const cra = Math.max(annual * 0.01, 200000) + (annual * 0.20)
  const chargeable = Math.max(0, annual - cra)

  // graduated rates
  let tax = 0
  let remaining = chargeable
  const bands = [
    [300000, 0.07], [300000, 0.11], [500000, 0.15],
    [500000, 0.19], [1600000, 0.21], [Infinity, 0.24],
  ]

  for (const [limit, rate] of bands) {
    if (remaining <= 0) break
    const taxable = Math.min(remaining, limit)
    tax += taxable * rate
    remaining -= taxable
  }

  // minimum tax rule
  const minTax = annual * 0.01
  return Math.round(Math.max(tax, minTax) / 12)
}

export default router
