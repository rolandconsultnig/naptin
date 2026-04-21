import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const root = new URL('../', import.meta.url)
const routeFile = readFileSync(new URL('server/routes/adminRbac.js', root), 'utf8')
const schemaFile = readFileSync(new URL('server/rbac_schema.sql', root), 'utf8')

test('perf incident policy controls exist in routes', () => {
  for (const signature of [
    'PERF_INCIDENT_ESCALATION_LEVEL_COOLDOWNS',
    'PERF_INCIDENT_NOTIFICATION_SUPPRESSION_MINUTES',
    'PERF_LOG_RETENTION_DAYS',
    'applyPerfRetention',
    'buildPerfIncidentAnalytics',
    'isEscalationNotificationSuppressed',
  ]) {
    assert.ok(routeFile.includes(signature), `Missing policy signature: ${signature}`)
  }
})

test('perf incident timeline schema exists', () => {
  assert.ok(schemaFile.includes('CREATE TABLE IF NOT EXISTS adm_query_perf_incident_events'))
  assert.ok(schemaFile.includes('idx_adm_query_perf_incident_events_incident'))
})
