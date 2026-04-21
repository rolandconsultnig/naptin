import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const root = new URL('../', import.meta.url)
const envExample = readFileSync(new URL('deploy/env.production.example', root), 'utf8')
const apiDoc = readFileSync(new URL('docs/enterprise-user-management-api.md', root), 'utf8')
const serverIndex = readFileSync(new URL('server/index.js', root), 'utf8')

test('env.production.example includes governance automation vars', () => {
  for (const key of [
    'ACCESS_GOVERNANCE_WEBHOOK_SECRET',
    'ACCESS_AUDIT_HASH_SECRET',
    'ACCESS_GOVERNANCE_EMAIL_WEBHOOK_URL',
    'ACCESS_GOVERNANCE_AUTOMATION_ENABLED',
    'ACCESS_GOVERNANCE_AUTOMATION_INTERVAL_MS',
    'ACCESS_DASHBOARD_CACHE_TTL_MS',
    'ACCESS_QUERY_PERF_LOG_THRESHOLD_MS',
    'ACCESS_QUERY_PERF_THRESHOLD_REFRESH_MS',
    'ACCESS_QUERY_PERF_AUTO_TUNE_INTERVAL_MS',
    'ACCESS_QUERY_PERF_DRIFT_ALERT_RATIO',
    'ACCESS_QUERY_PERF_INCIDENT_EVAL_INTERVAL_MS',
    'ACCESS_QUERY_PERF_INCIDENT_MIN_SAMPLES',
    'ACCESS_QUERY_PERF_INCIDENT_DRIFT_RATIO',
    'ACCESS_QUERY_PERF_INCIDENT_SPIKE_RATIO',
    'ACCESS_QUERY_PERF_INCIDENT_NEW_SLOW_P95_MS',
    'ACCESS_QUERY_PERF_INCIDENT_SLOW_HIT_COUNT',
    'ACCESS_QUERY_PERF_INCIDENT_CRITICAL_SLA_MINUTES',
    'ACCESS_QUERY_PERF_INCIDENT_WARNING_SLA_MINUTES',
    'ACCESS_QUERY_PERF_INCIDENT_SLA_SUSTAINED_DRIFT_MINUTES',
    'ACCESS_QUERY_PERF_INCIDENT_SLA_SPIKE_PERSISTENCE_MINUTES',
    'ACCESS_QUERY_PERF_INCIDENT_SLA_NEWLY_SLOW_QUERY_MINUTES',
    'ACCESS_QUERY_PERF_INCIDENT_ESCALATION_COOLDOWN_MINUTES',
    'ACCESS_QUERY_PERF_INCIDENT_ESCALATION_MAX_LEVEL',
    'ACCESS_QUERY_PERF_INCIDENT_ESCALATION_INTERVAL_MS',
    'ACCESS_QUERY_PERF_INCIDENT_ESCALATION_EMAILS',
    'ACCESS_QUERY_PERF_ESCALATION_L1_EMAILS',
    'ACCESS_QUERY_PERF_INCIDENT_ESCALATION_LEVEL_COOLDOWNS',
    'ACCESS_QUERY_PERF_INCIDENT_NOTIFICATION_SUPPRESSION_MINUTES',
    'ACCESS_QUERY_PERF_LOG_RETENTION_DAYS',
    'ACCESS_QUERY_PERF_INCIDENT_RETENTION_DAYS',
    'ACCESS_QUERY_PERF_INCIDENT_EVENT_RETENTION_DAYS',
  ]) {
    assert.ok(envExample.includes(`${key}=`), `Missing env key: ${key}`)
  }
})

test('enterprise API doc includes latest governance endpoints', () => {
  for (const signature of [
    '/users/reviews/bulk-update',
    '/users/permission-overrides/run-expiry-maintenance',
    '/users/dashboard-performance',
    '/users/perf-incidents',
    '/users/perf-incidents/analytics',
    '/users/perf-incidents/:id/events',
    '/users/perf-incidents/:id',
    '/reports/schedules/run-due',
    '/maintenance/refresh-risk-views',
    '/maintenance/perf/retune',
    '/maintenance/perf/incidents/generate',
    '/maintenance/perf/incidents/escalate',
    '/maintenance/perf/retention',
    '/users/dashboard-summary/refresh-cache',
    '/notifications/retry-failed',
    '/reports/attestation-packs/:id/download.csv',
  ]) {
    assert.ok(apiDoc.includes(signature), `Missing API doc endpoint: ${signature}`)
  }
})

test('server startup includes governance automation tick', () => {
  assert.ok(serverIndex.includes('/maintenance/run-automation'))
  assert.ok(serverIndex.includes('ACCESS_GOVERNANCE_AUTOMATION_ENABLED'))
})

test('env.production.example documents Owl Talk / chat deployment contract', () => {
  for (const token of [
    'NAPTIN Chat (Owl Talk',
    'OWL_TALK_DISABLE_SSL=',
    'OWL_PORTAL_SYNC=',
    'VITE_CHAT_BACKEND_PROTOCOL',
    'OWL_TALK_CORS_ORIGINS',
  ]) {
    assert.ok(envExample.includes(token), `Missing chat contract token: ${token}`)
  }
})
