# Enterprise User Management API Contract

Base path: `/api/v1/admin/rbac`

## Governance and Dashboard

- `GET /users/dashboard-summary`
  - Returns KPIs, risk policy, urgent queue, SoD conflicts, stale overrides, trends, watchlists, anomalies, MFA exceptions, and refactor insights.
  - Supports short-lived server cache (`ttl` configured by env).
- `GET /users/dashboard-performance`
  - Returns endpoint-level latency stats (`avg`, `p50`, `p90`, `p95`, `p99`), per-query breakdown, drift regressions (`current N hours` vs `previous N hours`), tuned thresholds, trend buckets, latest slow samples, and auto-generated perf incidents.
  - Supports `hours=<n>`, `autoTune=true|false`, `incidentEval=true|false`, and `incidentEscalation=true|false`.
- `GET /users/perf-incidents`
  - Lists performance incidents with filters (`status`, `severity`, `q`, `routeCode`), including active/open/acknowledged/resolved views.
- `GET /users/perf-incidents/analytics`
  - Returns incident reliability KPIs (MTTA, MTTR, SLA breach rate, type distribution, owner load, timeline).
- `GET /users/perf-incidents/:id/events`
  - Returns incident timeline events (open, refresh, escalate, acknowledge, resolve, reopen, assign).
- `PATCH /users/perf-incidents/:id`
  - Incident lifecycle actions: `acknowledge`, `resolve`, `reopen`, `assign_owner` with owner/note metadata.
- `POST /users/dashboard-summary/refresh-cache`
  - Clears dashboard cache on-demand.
- `GET /users/review-history`
  - Filterable by `reviewType`, `reviewer`, `userId`, `from`, `to`, `q`, with pagination/sorting.
- `GET /users/reviews/queue`
  - Assignment-ready queue with overdue flag and pagination.
- `GET /users/reviews/sla-summary`
  - SLA/open/overdue/escalated summaries.

## Review Operations

- `POST /users/reviews/:id/assign`
- `POST /users/reviews/:id/comments`
- `GET /users/reviews/:id/comments`
- `PATCH /users/reviews/:id`
- `POST /users/reviews/bulk-update`
  - Bulk status/assignment/priority updates.
- `POST /users/reviews/escalate-overdue`
- `POST /users/reviews/send-reminders`
  - Sends due-soon/overdue reminders (in-app + email).
- `POST /users/reviews/bulk-update`
  - Bulk assign/resolve/reprioritize review records.

## Override Governance (Maker-Checker)

- `PUT /users/:id/permission-overrides`
  - Submits override change request in `pending` state.
  - Enforces mandatory `reason` (min 5 chars), supports `approverEmail` and `expiresAt`.
- `GET /users/:id/permission-overrides/pending`
- `POST /users/:id/permission-overrides/approve`
- `POST /users/:id/permission-overrides/reject`
- `POST /users/permission-overrides/run-expiry-maintenance`
  - Sends pre-expiry reminders and marks expired approved overrides.

## Reports and Attestation

- `GET /reports/schedules`
- `POST /reports/schedules`
- `PATCH /reports/schedules/:id`
- `POST /reports/schedules/:id/run-now`
- `POST /reports/schedules/run-due`
  - Runs all due active schedules.
- `GET /reports/attestation-packs`
- `POST /reports/attestation-packs`
- `GET /reports/attestation-packs/:id`
- `GET /reports/attestation-packs/:id/download.csv`
- `POST /maintenance/run-automation`
  - Runs due schedules, reminders, override expiry maintenance, delivery retries, risk refresh, perf-threshold auto-tuning, incident generation, and SLA-based incident escalation in one automation pass.
- `POST /maintenance/perf/retune`
  - Forces adaptive threshold tuning for dashboard performance instrumentation.
- `POST /maintenance/perf/incidents/generate`
  - Runs regression alert policy and upserts incident cards (`sustained_drift`, `spike_persistence`, `newly_slow_query`), resolving stale open incidents automatically.
- `POST /maintenance/perf/incidents/escalate`
  - Applies incident SLA/aging policy and escalates overdue active incidents with fan-out (in-app + email + webhook).
- `POST /maintenance/perf/retention`
  - Prunes aged perf logs, old resolved incidents, and old incident timeline events based on retention env policy.
- `POST /maintenance/refresh-risk-views`
  - Refreshes risk materialized views and clears dashboard cache.

## Notifications and Delivery Reliability

- `GET /notifications/events`
  - Supports filters: `recipient`, `channel`, `since`, `scope=mine`, `limit`.
- `POST /notifications/retry-failed`
  - Retries failed webhook/email deliveries with backoff and dead-letter threshold.
- `GET /users/mfa-enforcement-report`
  - Lists privileged users and MFA exceptions.
- `GET /users/dashboard-search`
  - Global search across urgent users, exceptions, SoD conflicts, and stale overrides.

## Security and Integrity

- All endpoints are restricted to `super_admin` with level >= 5.
- Route-level rate limits are enforced for read/write traffic.
- Audit log records are hash chained (`prev_hash`, `audit_hash`) for tamper evidence.
- Governance webhooks are HMAC signed with `x-naptin-signature`.
- Materialized views (`adm_mv_user_risk_snapshot`, `adm_mv_department_risk_snapshot`) back heavy risk queries.
