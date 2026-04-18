#!/usr/bin/env node
/**
 * NAPTIN portal — integration audit (API + PostgreSQL tables).
 *
 * Usage:
 *   API_BASE=http://localhost:4002 node scripts/portal-integration-audit.mjs
 *
 * Optional (table checks): loads `.env` if present
 *   DATABASE_URL=postgres://... node scripts/portal-integration-audit.mjs
 *
 * Does not start servers; run `npm run api` and apply DB (`npm run db:all`) first.
 */

import 'dotenv/config'
import pg from 'pg'

const API_BASE = (process.env.API_BASE || process.env.VITE_API_URL || 'http://localhost:4002').replace(/\/$/, '')
const DATABASE_URL = process.env.DATABASE_URL || ''

function buildApiGetChecks() {
  const now = new Date()
  const calPath = `/api/v1/collaboration/calendar-events?year=${now.getFullYear()}&month=${now.getMonth() + 1}`
  /** GET endpoints that should return 200 when DB is migrated and API is up. */
  return [
  ['/api/v1/health', [200]],
  ['/api/v1/workbench/summary', [200]],
  ['/api/v1/workbench/clients', [200]],
  ['/api/v1/workbench/onboarding', [200]],
  ['/api/v1/workbench/health/config', [200]],
  ['/api/v1/workbench/health', [200]],
  ['/api/v1/workbench/opportunities', [200]],
  ['/api/v1/workbench/markets/criteria', [200]],
  ['/api/v1/workbench/markets/candidates', [200]],
  ['/api/v1/intranet/posts', [200]],
  ['/api/v1/hrms/employees', [200]],
  ['/api/v1/hrms/departments', [200]],
  ['/api/v1/hrms/org-chart', [200]],
  ['/api/v1/hrms/leave/types', [200]],
  ['/api/v1/hrms/attendance', [200]],
  ['/api/v1/hrms/attendance/summary', [200]],
  ['/api/v1/hrms/payroll/periods', [200]],
  ['/api/v1/hrms/payroll/my-payslips?email=audit-smoke@naptin.local', [200]],
  ['/api/v1/hrms/recruitment/jobs', [200]],
  ['/api/v1/hrms/recruitment/interviews', [200]],
  ['/api/v1/hrms/performance/cycles', [200]],
  ['/api/v1/hrms/training/courses', [200]],
  ['/api/v1/hrms/training/enrollments', [200]],
  ['/api/v1/finance/fiscal-years', [200]],
  ['/api/v1/finance/accounts', [200]],
  ['/api/v1/finance/journals', [200]],
  ['/api/v1/finance/ap/invoices', [200]],
  ['/api/v1/finance/ar/invoices', [200]],
  ['/api/v1/finance/budget', [200]],
  ['/api/v1/finance/budget-workbench/submissions', [200]],
  ['/api/v1/finance/budget-workbench/virements', [200]],
  ['/api/v1/finance/treasury/bank-accounts', [200]],
  ['/api/v1/finance/vendors', [200]],
  ['/api/v1/finance/customers', [200]],
  ['/api/v1/finance/assets', [200]],
  ['/api/v1/finance/overview-summary', [200]],
  ['/api/v1/finance/reports/trial-balance', [200]],
  ['/api/v1/finance/reports/income-statement', [200]],
  ['/api/v1/finance/reports/balance-sheet', [200]],
  ['/api/v1/finance/cash-advances', [200]],
  ['/api/v1/finance/cash-advances/dashboard', [200]],
  ['/api/v1/procurement/vendors', [200]],
  ['/api/v1/procurement/requisitions', [200]],
  ['/api/v1/procurement/tenders', [200]],
  ['/api/v1/procurement/purchase-orders', [200]],
  ['/api/v1/procurement/goods-received', [200]],
  ['/api/v1/procurement/summary', [200]],
  ['/api/v1/ict/tickets', [200]],
  ['/api/v1/ict/assets', [200]],
  ['/api/v1/ict/change-requests', [200]],
  ['/api/v1/ict/systems', [200]],
  [calPath, [200]],
  ['/api/v1/collaboration/forum/threads', [200]],
  ['/api/v1/collaboration/projects', [200]],
  ['/api/v1/collaboration/workspaces', [200]],
  ['/api/v1/collaboration/integrations/office', [200]],
  ['/api/v1/collaboration/files', [200]],
  ['/api/v1/whistleblower/cases', [200]],
  ['/api/v1/whistleblower/summary', [200]],
  ['/api/v1/workflow/processes', [200]],
  ['/api/v1/workflow/cases', [200]],
  ['/api/v1/workflow/tasks', [200]],
  ['/api/v1/workflow/notifications?userId=1', [200]],
  ['/api/v1/workflow/audit', [200]],
  ['/api/v1/admin/rbac/roles', [200]],
  ['/api/v1/admin/rbac/permissions', [200]],
  ['/api/v1/admin/rbac/modules', [200]],
  ['/api/v1/admin/rbac/matrix', [200]],
  ['/api/v1/admin/rbac/users', [200]],
  ]
}

/** Core tables expected after `npm run db:all` (and collab extensions). */
const EXPECTED_TABLES = [
  'wb_clients',
  'intranet_posts',
  'hr_employees',
  'hr_departments',
  'fin_fiscal_years',
  'fin_chart_of_accounts',
  'proc_vendors',
  'ict_tickets',
  'collab_workspaces',
  'collab_calendar_events',
  'wf_process_definitions',
  'adm_users',
  'adm_roles',
  'ca_advances',
]

function fail(msg) {
  console.error(msg)
  process.exitCode = 1
}

async function checkApi() {
  console.log(`\n── HTTP GET checks (${API_BASE}) ──\n`)
  let ok = 0
  let bad = 0
  for (const [path, allowed] of buildApiGetChecks()) {
    const url = `${API_BASE}${path}`
    try {
      const res = await fetch(url, { method: 'GET' })
      const ct = res.headers.get('content-type') || ''
      if (!allowed.includes(res.status)) {
        console.log(`  FAIL ${res.status}  ${path}`)
        bad++
        continue
      }
      if (res.status === 200 && !ct.includes('json') && path !== '/api/v1/health') {
        console.log(`  WARN ${res.status} non-JSON  ${path}`)
      }
      console.log(`  OK   ${res.status}  ${path}`)
      ok++
    } catch (e) {
      console.log(`  FAIL fetch ${path}: ${e.message}`)
      bad++
    }
  }
  console.log(`\n  Summary: ${ok} ok, ${bad} failed`)
  if (bad > 0) fail('\nAPI audit: some endpoints failed (is the API running on ' + API_BASE + '?)')
}

async function checkTables() {
  if (!DATABASE_URL) {
    console.log('\n── PostgreSQL tables (skipped: set DATABASE_URL) ──\n')
    return
  }
  console.log('\n── PostgreSQL tables ──\n')
  const client = new pg.Client({ connectionString: DATABASE_URL })
  await client.connect()
  try {
    const { rows } = await client.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
       ORDER BY table_name`
    )
    const have = new Set(rows.map((r) => r.table_name))
    let missing = 0
    for (const t of EXPECTED_TABLES) {
      if (have.has(t)) {
        console.log(`  OK   ${t}`)
      } else {
        console.log(`  MISS ${t}`)
        missing++
      }
    }
    console.log(`\n  Public tables total: ${rows.length}`)
    if (missing > 0) fail(`\nDB audit: ${missing} expected table(s) missing — run npm run db:all`)
  } finally {
    await client.end()
  }
}

function printSpaRoutes() {
  console.log(`
── SPA route inventory (manual / browser QA) ──
  Public: /, /login, /whistleblower-portal
  App shell /app/*: dashboard, intranet, collaboration, profile, integrations, security,
    legal, corporate, ict, mande, planning, planning-workbench, research-stats, ict-workbench,
    process-maker, dg-portal, marketing, client-ops-markets, documents,
    finance, finance/:section, meetings, chat, training, procurement, public-affairs,
    servicom, actu
  HR hub /app/human-resource/*: people, directory, recruitment, operations, enterprise, self-service
  Admin /admin/*: operations, modules, roles, access, users, audit, brand/*, workflow/inbox
  (Exact paths: see src/App.jsx)
`)
}

async function main() {
  console.log('NAPTIN portal integration audit')
  printSpaRoutes()
  await checkTables().catch((e) => {
    fail(`DB error: ${e.message}`)
  })
  await checkApi()
  if (!process.exitCode) {
    console.log('\nAudit finished successfully.\n')
  }
}

main()
