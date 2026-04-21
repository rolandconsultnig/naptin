import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const root = new URL('../', import.meta.url)
const routeFile = readFileSync(new URL('server/routes/adminRbac.js', root), 'utf8')

const REQUIRED_ROUTES = [
  "/maintenance/run-automation",
  "/maintenance/perf/retune",
  "/maintenance/perf/incidents/generate",
  "/maintenance/perf/incidents/escalate",
  "/maintenance/perf/retention",
  "/maintenance/refresh-risk-views",
  "/users/reviews/bulk-update",
  "/users/permission-overrides/run-expiry-maintenance",
  "/reports/schedules/run-due",
  "/reports/attestation-packs/:id/download.csv",
  "/users/dashboard-performance",
  "/users/perf-incidents",
  "/users/perf-incidents/analytics",
  "/users/perf-incidents/:id/events",
  "/users/perf-incidents/:id",
  "/users/dashboard-search",
  "/users/dashboard-summary/refresh-cache",
  "/users/mfa-enforcement-report",
  "/notifications/retry-failed",
]

test('enterprise governance critical routes are present', () => {
  for (const route of REQUIRED_ROUTES) {
    assert.ok(routeFile.includes(route), `Missing route signature: ${route}`)
  }
})

test('admin RBAC applies route-level rate limiter', () => {
  assert.ok(routeFile.includes('router.use(enforceRouteRateLimit)'), 'Route rate limiter not applied')
})

test('audit chaining fields are written', () => {
  assert.ok(routeFile.includes('prev_hash'), 'prev_hash not written in audit log')
  assert.ok(routeFile.includes('audit_hash'), 'audit_hash not written in audit log')
})
