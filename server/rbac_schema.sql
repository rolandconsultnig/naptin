CREATE TABLE IF NOT EXISTS adm_departments (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_department_units (
  id SERIAL PRIMARY KEY,
  department_id INT NOT NULL REFERENCES adm_departments(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_roles (
  id SERIAL PRIMARY KEY,
  role_code TEXT NOT NULL UNIQUE,
  role_name TEXT NOT NULL,
  description TEXT,
  department_id INT REFERENCES adm_departments(id) ON DELETE SET NULL,
  role_level INT NOT NULL DEFAULT 4,
  supervisor_role_id INT REFERENCES adm_roles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_permissions (
  id SERIAL PRIMARY KEY,
  permission_code TEXT NOT NULL UNIQUE,
  module_code TEXT NOT NULL,
  feature_code TEXT NOT NULL,
  action_code TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INT NOT NULL REFERENCES adm_roles(id) ON DELETE CASCADE,
  permission_id INT NOT NULL REFERENCES adm_permissions(id) ON DELETE CASCADE,
  granted BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS adm_modules (
  id SERIAL PRIMARY KEY,
  module_code TEXT NOT NULL UNIQUE,
  module_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  display_order INT NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_module_features (
  id SERIAL PRIMARY KEY,
  module_id INT NOT NULL REFERENCES adm_modules(id) ON DELETE CASCADE,
  feature_code TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (module_id, feature_code)
);

CREATE TABLE IF NOT EXISTS adm_users (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  department_id INT REFERENCES adm_departments(id) ON DELETE SET NULL,
  unit_id INT REFERENCES adm_department_units(id) ON DELETE SET NULL,
  job_title TEXT,
  job_summary TEXT,
  job_description_id INT REFERENCES adm_job_descriptions(id) ON DELETE SET NULL,
  primary_role_id INT REFERENCES adm_roles(id) ON DELETE SET NULL,
  supervisor_user_id INT REFERENCES adm_users(id) ON DELETE SET NULL,
  employment_status TEXT NOT NULL DEFAULT 'active',
  account_status TEXT NOT NULL DEFAULT 'active',
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  account_expiry DATE,
  last_login_at TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_user_secondary_roles (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES adm_users(id) ON DELETE CASCADE,
  role_id INT NOT NULL REFERENCES adm_roles(id) ON DELETE CASCADE,
  starts_on DATE,
  ends_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS adm_user_permission_overrides (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES adm_users(id) ON DELETE CASCADE,
  permission_id INT NOT NULL REFERENCES adm_permissions(id) ON DELETE CASCADE,
  effect TEXT NOT NULL,
  reason TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, permission_id)
);

-- Must run before materialized views that reference these columns (e.g. adm_mv_user_risk_snapshot).
ALTER TABLE adm_user_permission_overrides ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE adm_user_permission_overrides ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE adm_user_permission_overrides ADD COLUMN IF NOT EXISTS reviewer_email TEXT;
ALTER TABLE adm_user_permission_overrides ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE adm_user_permission_overrides ADD COLUMN IF NOT EXISTS requested_by TEXT;
ALTER TABLE adm_user_permission_overrides ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE adm_user_permission_overrides ADD COLUMN IF NOT EXISTS requested_approver_email TEXT;
ALTER TABLE adm_user_permission_overrides ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE adm_user_permission_overrides ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE adm_user_permission_overrides ADD COLUMN IF NOT EXISTS approver_note TEXT;

CREATE TABLE IF NOT EXISTS adm_job_descriptions (
  id SERIAL PRIMARY KEY,
  job_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  department_id INT REFERENCES adm_departments(id) ON DELETE SET NULL,
  unit_id INT REFERENCES adm_department_units(id) ON DELETE SET NULL,
  summary TEXT NOT NULL,
  responsibilities TEXT NOT NULL,
  requirements TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_sod_rules (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  left_permission_id INT NOT NULL REFERENCES adm_permissions(id) ON DELETE CASCADE,
  right_permission_id INT NOT NULL REFERENCES adm_permissions(id) ON DELETE CASCADE,
  severity TEXT NOT NULL DEFAULT 'high',
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (left_permission_id <> right_permission_id)
);

CREATE TABLE IF NOT EXISTS adm_audit_log (
  id SERIAL PRIMARY KEY,
  actor_email TEXT,
  action_code TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  detail TEXT,
  prev_hash TEXT,
  audit_hash TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_risk_policy (
  id SERIAL PRIMARY KEY,
  policy_code TEXT NOT NULL UNIQUE,
  stale_override_days INT NOT NULL DEFAULT 90,
  weight_sod_conflict INT NOT NULL DEFAULT 5,
  weight_stale_override INT NOT NULL DEFAULT 3,
  weight_missing_reason INT NOT NULL DEFAULT 2,
  weight_override_count INT NOT NULL DEFAULT 1,
  inactivity_days_high_privilege INT NOT NULL DEFAULT 60,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_access_reviews (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES adm_users(id) ON DELETE CASCADE,
  review_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'resolved',
  reviewer_email TEXT,
  assigned_to TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  due_at TIMESTAMPTZ,
  sla_hours INT NOT NULL DEFAULT 24,
  first_reviewed_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ,
  escalation_level INT NOT NULL DEFAULT 0,
  review_note TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_access_review_comments (
  id SERIAL PRIMARY KEY,
  review_id INT NOT NULL REFERENCES adm_access_reviews(id) ON DELETE CASCADE,
  actor_email TEXT,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_report_schedules (
  id SERIAL PRIMARY KEY,
  schedule_code TEXT NOT NULL UNIQUE,
  report_type TEXT NOT NULL,
  frequency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  recipients JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_notification_events (
  id SERIAL PRIMARY KEY,
  event_code TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  channel TEXT NOT NULL DEFAULT 'in_app',
  recipient TEXT,
  title TEXT NOT NULL,
  body TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  delivery_status TEXT NOT NULL DEFAULT 'queued',
  delivery_attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  next_retry_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_attestation_packs (
  id SERIAL PRIMARY KEY,
  pack_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'ready',
  requested_by TEXT,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE MATERIALIZED VIEW IF NOT EXISTS adm_mv_user_risk_snapshot AS
WITH effective_permissions AS (
  SELECT u.id AS user_id, rp.permission_id
  FROM adm_users u
  JOIN adm_role_permissions rp ON rp.role_id = u.primary_role_id AND rp.granted = TRUE
  WHERE u.account_status = 'active'
  UNION
  SELECT u.id AS user_id, rp.permission_id
  FROM adm_users u
  JOIN adm_user_secondary_roles usr ON usr.user_id = u.id
  JOIN adm_role_permissions rp ON rp.role_id = usr.role_id AND rp.granted = TRUE
  WHERE u.account_status = 'active'
),
sod_per_user AS (
  SELECT ep.user_id, COUNT(*)::int AS sod_conflicts
  FROM effective_permissions ep
  JOIN adm_sod_rules s ON s.active = TRUE AND s.left_permission_id = ep.permission_id
  JOIN effective_permissions ep2 ON ep2.user_id = ep.user_id AND ep2.permission_id = s.right_permission_id
  GROUP BY ep.user_id
),
override_per_user AS (
  SELECT
    user_id,
    COUNT(*)::int AS override_count,
    COUNT(*) FILTER (WHERE COALESCE(TRIM(reason), '') = '')::int AS overrides_without_reason,
    COUNT(*) FILTER (WHERE created_at < (NOW() - INTERVAL '90 days'))::int AS stale_overrides
  FROM adm_user_permission_overrides
  WHERE approval_status = 'approved'
  GROUP BY user_id
)
SELECT
  u.id AS user_id,
  u.department_id,
  COALESCE(spu.sod_conflicts, 0) AS sod_conflicts,
  COALESCE(opu.override_count, 0) AS override_count,
  COALESCE(opu.overrides_without_reason, 0) AS overrides_without_reason,
  COALESCE(opu.stale_overrides, 0) AS stale_overrides,
  (
    COALESCE(spu.sod_conflicts, 0) * 5
    + COALESCE(opu.stale_overrides, 0) * 3
    + COALESCE(opu.overrides_without_reason, 0) * 2
    + COALESCE(opu.override_count, 0) * 1
  )::int AS risk_score,
  NOW() AS refreshed_at
FROM adm_users u
LEFT JOIN sod_per_user spu ON spu.user_id = u.id
LEFT JOIN override_per_user opu ON opu.user_id = u.id
WHERE u.account_status = 'active';

CREATE MATERIALIZED VIEW IF NOT EXISTS adm_mv_department_risk_snapshot AS
SELECT
  d.id AS department_id,
  d.code AS department_code,
  d.name AS department_name,
  COUNT(mv.user_id)::int AS users_count,
  SUM(mv.override_count)::int AS override_count,
  SUM(mv.sod_conflicts)::int AS sod_conflicts,
  SUM(mv.risk_score)::int AS risk_score,
  NOW() AS refreshed_at
FROM adm_departments d
LEFT JOIN adm_mv_user_risk_snapshot mv ON mv.department_id = d.id
GROUP BY d.id, d.code, d.name;

CREATE TABLE IF NOT EXISTS adm_user_risk_snapshot (
  user_id INT PRIMARY KEY REFERENCES adm_users(id) ON DELETE CASCADE,
  department_id INT REFERENCES adm_departments(id) ON DELETE SET NULL,
  sod_conflicts INT NOT NULL DEFAULT 0,
  override_count INT NOT NULL DEFAULT 0,
  overrides_without_reason INT NOT NULL DEFAULT 0,
  stale_overrides INT NOT NULL DEFAULT 0,
  risk_score INT NOT NULL DEFAULT 0,
  refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_department_risk_snapshot (
  department_id INT PRIMARY KEY REFERENCES adm_departments(id) ON DELETE CASCADE,
  department_code TEXT NOT NULL,
  department_name TEXT NOT NULL,
  users_count INT NOT NULL DEFAULT 0,
  override_count INT NOT NULL DEFAULT 0,
  sod_conflicts INT NOT NULL DEFAULT 0,
  risk_score INT NOT NULL DEFAULT 0,
  refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_risk_refresh_cursor (
  id INT PRIMARY KEY DEFAULT 1,
  last_incremental_at TIMESTAMPTZ,
  last_full_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_query_perf_log (
  id BIGSERIAL PRIMARY KEY,
  route_code TEXT NOT NULL,
  query_code TEXT NOT NULL,
  elapsed_ms NUMERIC(10,2) NOT NULL,
  row_count INT NOT NULL DEFAULT 0,
  actor_email TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_query_perf_tuning (
  id BIGSERIAL PRIMARY KEY,
  route_code TEXT NOT NULL,
  query_code TEXT NOT NULL,
  dynamic_threshold_ms NUMERIC(10,2) NOT NULL,
  last_window_p95_ms NUMERIC(10,2),
  previous_window_p95_ms NUMERIC(10,2),
  drift_ratio NUMERIC(10,4),
  sample_count INT NOT NULL DEFAULT 0,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (route_code, query_code)
);

CREATE TABLE IF NOT EXISTS adm_query_perf_incidents (
  id BIGSERIAL PRIMARY KEY,
  route_code TEXT NOT NULL,
  query_code TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  status TEXT NOT NULL DEFAULT 'open',
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  first_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  detected_count INT NOT NULL DEFAULT 1,
  current_p95_ms NUMERIC(10,2),
  previous_p95_ms NUMERIC(10,2),
  current_p99_ms NUMERIC(10,2),
  threshold_ms NUMERIC(10,2),
  drift_ratio NUMERIC(10,4),
  slow_event_count INT NOT NULL DEFAULT 0,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  owner_email TEXT,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT,
  last_action_by TEXT,
  last_action_at TIMESTAMPTZ,
  sla_due_at TIMESTAMPTZ,
  escalation_level INT NOT NULL DEFAULT 0,
  last_escalated_at TIMESTAMPTZ,
  escalation_note TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_query_perf_incident_events (
  id BIGSERIAL PRIMARY KEY,
  incident_id BIGINT NOT NULL REFERENCES adm_query_perf_incidents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_email TEXT,
  note TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO adm_risk_refresh_cursor (id, last_incremental_at, last_full_at, updated_at)
VALUES (1, NULL, NULL, NOW())
ON CONFLICT (id) DO NOTHING;

ALTER TABLE adm_users ADD COLUMN IF NOT EXISTS unit_id INT REFERENCES adm_department_units(id) ON DELETE SET NULL;
ALTER TABLE adm_users ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE adm_users ADD COLUMN IF NOT EXISTS job_summary TEXT;
ALTER TABLE adm_users ADD COLUMN IF NOT EXISTS job_description_id INT REFERENCES adm_job_descriptions(id) ON DELETE SET NULL;
ALTER TABLE adm_audit_log ADD COLUMN IF NOT EXISTS prev_hash TEXT;
ALTER TABLE adm_audit_log ADD COLUMN IF NOT EXISTS audit_hash TEXT;
ALTER TABLE adm_query_perf_incidents ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE adm_query_perf_incidents ADD COLUMN IF NOT EXISTS acknowledged_by TEXT;
ALTER TABLE adm_query_perf_incidents ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ;
ALTER TABLE adm_query_perf_incidents ADD COLUMN IF NOT EXISTS resolved_by TEXT;
ALTER TABLE adm_query_perf_incidents ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE adm_query_perf_incidents ADD COLUMN IF NOT EXISTS resolution_note TEXT;
ALTER TABLE adm_query_perf_incidents ADD COLUMN IF NOT EXISTS last_action_by TEXT;
ALTER TABLE adm_query_perf_incidents ADD COLUMN IF NOT EXISTS last_action_at TIMESTAMPTZ;
ALTER TABLE adm_query_perf_incidents ADD COLUMN IF NOT EXISTS sla_due_at TIMESTAMPTZ;
ALTER TABLE adm_query_perf_incidents ADD COLUMN IF NOT EXISTS escalation_level INT NOT NULL DEFAULT 0;
ALTER TABLE adm_query_perf_incidents ADD COLUMN IF NOT EXISTS last_escalated_at TIMESTAMPTZ;
ALTER TABLE adm_query_perf_incidents ADD COLUMN IF NOT EXISTS escalation_note TEXT;

CREATE INDEX IF NOT EXISTS idx_adm_users_dept ON adm_users(department_id, account_status);
CREATE INDEX IF NOT EXISTS idx_adm_users_unit ON adm_users(unit_id, account_status);
CREATE INDEX IF NOT EXISTS idx_adm_users_job_desc ON adm_users(job_description_id);
CREATE INDEX IF NOT EXISTS idx_adm_users_primary_role ON adm_users(primary_role_id, account_status);
CREATE INDEX IF NOT EXISTS idx_adm_roles_dept ON adm_roles(department_id, status);
CREATE INDEX IF NOT EXISTS idx_adm_department_units_dept ON adm_department_units(department_id, status);
CREATE INDEX IF NOT EXISTS idx_adm_job_descriptions_dept_unit ON adm_job_descriptions(department_id, unit_id, status);
CREATE INDEX IF NOT EXISTS idx_adm_permissions_module ON adm_permissions(module_code, feature_code, action_code);
CREATE INDEX IF NOT EXISTS idx_adm_role_permissions_role ON adm_role_permissions(role_id, granted);
CREATE INDEX IF NOT EXISTS idx_adm_user_secondary_roles_user ON adm_user_secondary_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_adm_user_permission_overrides_user_status ON adm_user_permission_overrides(user_id, approval_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_adm_audit_log_actor ON adm_audit_log(actor_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_adm_audit_log_entity ON adm_audit_log(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_adm_audit_log_hash ON adm_audit_log(audit_hash);
CREATE INDEX IF NOT EXISTS idx_adm_access_reviews_user ON adm_access_reviews(user_id, reviewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_adm_access_reviews_reviewer ON adm_access_reviews(reviewer_email, reviewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_adm_access_reviews_assigned_status ON adm_access_reviews(assigned_to, status, due_at);
CREATE INDEX IF NOT EXISTS idx_adm_access_review_comments_review ON adm_access_review_comments(review_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_adm_report_schedules_status_next_run ON adm_report_schedules(status, next_run_at);
CREATE INDEX IF NOT EXISTS idx_adm_notification_events_recipient ON adm_notification_events(recipient, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_adm_notification_events_retry ON adm_notification_events(delivery_status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_adm_attestation_packs_generated ON adm_attestation_packs(generated_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_adm_mv_user_risk_snapshot_user ON adm_mv_user_risk_snapshot(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_adm_mv_department_risk_snapshot_dept ON adm_mv_department_risk_snapshot(department_id);
CREATE INDEX IF NOT EXISTS idx_adm_user_risk_snapshot_dept ON adm_user_risk_snapshot(department_id, risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_adm_department_risk_snapshot_score ON adm_department_risk_snapshot(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_adm_query_perf_log_route_time ON adm_query_perf_log(route_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_adm_query_perf_tuning_route ON adm_query_perf_tuning(route_code, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_adm_query_perf_incidents_open ON adm_query_perf_incidents(route_code, status, severity, last_detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_adm_query_perf_incidents_sla ON adm_query_perf_incidents(route_code, status, sla_due_at, escalation_level);
CREATE INDEX IF NOT EXISTS idx_adm_query_perf_incident_events_incident ON adm_query_perf_incident_events(incident_id, created_at DESC);
DROP INDEX IF EXISTS uq_adm_query_perf_incident_open;
CREATE UNIQUE INDEX IF NOT EXISTS uq_adm_query_perf_incident_open ON adm_query_perf_incidents(route_code, query_code, incident_type) WHERE status IN ('open', 'acknowledged');
