CREATE TABLE IF NOT EXISTS wf_process_definitions (
  id BIGSERIAL PRIMARY KEY,
  tenant_key TEXT,
  process_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  active_version INT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_key, process_key)
);

CREATE TABLE IF NOT EXISTS wf_process_versions (
  id BIGSERIAL PRIMARY KEY,
  process_id BIGINT NOT NULL REFERENCES wf_process_definitions(id) ON DELETE CASCADE,
  version_no INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  graph_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_by TEXT,
  published_at TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (process_id, version_no)
);

CREATE TABLE IF NOT EXISTS wf_nodes (
  id BIGSERIAL PRIMARY KEY,
  process_version_id BIGINT NOT NULL REFERENCES wf_process_versions(id) ON DELETE CASCADE,
  node_key TEXT NOT NULL,
  node_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  assignment_mode TEXT,
  form_ref TEXT,
  service_ref TEXT,
  script_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (process_version_id, node_key)
);

CREATE TABLE IF NOT EXISTS wf_transitions (
  id BIGSERIAL PRIMARY KEY,
  process_version_id BIGINT NOT NULL REFERENCES wf_process_versions(id) ON DELETE CASCADE,
  from_node_id BIGINT NOT NULL REFERENCES wf_nodes(id) ON DELETE CASCADE,
  to_node_id BIGINT NOT NULL REFERENCES wf_nodes(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL DEFAULT 'always',
  condition_expr TEXT,
  priority INT NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wf_assignment_rules (
  id BIGSERIAL PRIMARY KEY,
  node_id BIGINT NOT NULL REFERENCES wf_nodes(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL,
  user_id TEXT,
  role_key TEXT,
  group_key TEXT,
  value_expr TEXT,
  allow_claim BOOLEAN NOT NULL DEFAULT FALSE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wf_round_robin_cursors (
  id BIGSERIAL PRIMARY KEY,
  node_id BIGINT NOT NULL REFERENCES wf_nodes(id) ON DELETE CASCADE,
  role_key TEXT,
  group_key TEXT,
  cursor_index INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (node_id, role_key, group_key)
);

CREATE TABLE IF NOT EXISTS wf_cases (
  id BIGSERIAL PRIMARY KEY,
  tenant_key TEXT,
  case_ref TEXT NOT NULL,
  process_id BIGINT NOT NULL REFERENCES wf_process_definitions(id),
  process_version_id BIGINT NOT NULL REFERENCES wf_process_versions(id),
  status TEXT NOT NULL DEFAULT 'open',
  started_by TEXT NOT NULL,
  current_nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  UNIQUE (tenant_key, case_ref)
);

CREATE TABLE IF NOT EXISTS wf_case_variables (
  id BIGSERIAL PRIMARY KEY,
  case_id BIGINT NOT NULL REFERENCES wf_cases(id) ON DELETE CASCADE,
  var_key TEXT NOT NULL,
  var_type TEXT NOT NULL DEFAULT 'string',
  var_value JSONB,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (case_id, var_key)
);

CREATE TABLE IF NOT EXISTS wf_tasks (
  id BIGSERIAL PRIMARY KEY,
  case_id BIGINT NOT NULL REFERENCES wf_cases(id) ON DELETE CASCADE,
  node_id BIGINT NOT NULL REFERENCES wf_nodes(id),
  task_ref TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'form',
  status TEXT NOT NULL DEFAULT 'pending',
  priority INT NOT NULL DEFAULT 3,
  assigned_user_id TEXT,
  assigned_role_key TEXT,
  assigned_group_key TEXT,
  claimed_by TEXT,
  claimable BOOLEAN NOT NULL DEFAULT FALSE,
  due_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ,
  escalation_level INT NOT NULL DEFAULT 0,
  outcome TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (case_id, task_ref)
);

CREATE TABLE IF NOT EXISTS wf_task_actions (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT NOT NULL REFERENCES wf_tasks(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wf_sla_policies (
  id BIGSERIAL PRIMARY KEY,
  tenant_key TEXT,
  process_id BIGINT NOT NULL REFERENCES wf_process_definitions(id) ON DELETE CASCADE,
  process_version_id BIGINT REFERENCES wf_process_versions(id) ON DELETE CASCADE,
  scope TEXT NOT NULL,
  node_id BIGINT REFERENCES wf_nodes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_minutes INT NOT NULL,
  reminder_minutes_before INT,
  escalate_minutes_after INT,
  penalty_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  penalty_per_hour NUMERIC(12,2),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wf_sla_events (
  id BIGSERIAL PRIMARY KEY,
  policy_id BIGINT NOT NULL REFERENCES wf_sla_policies(id) ON DELETE CASCADE,
  case_id BIGINT REFERENCES wf_cases(id) ON DELETE CASCADE,
  task_id BIGINT REFERENCES wf_tasks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  planned_due_at TIMESTAMPTZ,
  actual_at TIMESTAMPTZ,
  exceeded_minutes INT,
  penalty_amount NUMERIC(12,2),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wf_notifications (
  id BIGSERIAL PRIMARY KEY,
  tenant_key TEXT,
  case_id BIGINT REFERENCES wf_cases(id) ON DELETE CASCADE,
  task_id BIGINT REFERENCES wf_tasks(id) ON DELETE CASCADE,
  user_id TEXT,
  role_key TEXT,
  channel TEXT NOT NULL,
  template_key TEXT,
  subject TEXT,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wf_process_manager_actions (
  id BIGSERIAL PRIMARY KEY,
  case_id BIGINT REFERENCES wf_cases(id) ON DELETE CASCADE,
  task_id BIGINT REFERENCES wf_tasks(id) ON DELETE CASCADE,
  manager_id TEXT NOT NULL,
  action TEXT NOT NULL,
  reason TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wf_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  tenant_key TEXT,
  case_id BIGINT REFERENCES wf_cases(id) ON DELETE CASCADE,
  task_id BIGINT REFERENCES wf_tasks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wf_case_process ON wf_cases(process_id, status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_wf_tasks_assigned_user ON wf_tasks(assigned_user_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_wf_tasks_assigned_role ON wf_tasks(assigned_role_key, status, due_at);
CREATE INDEX IF NOT EXISTS idx_wf_tasks_claimable ON wf_tasks(claimable, status, due_at);
CREATE INDEX IF NOT EXISTS idx_wf_tasks_case ON wf_tasks(case_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wf_task_actions_task ON wf_task_actions(task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wf_sla_events_policy ON wf_sla_events(policy_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wf_notifications_user ON wf_notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wf_notifications_status ON wf_notifications(status, channel, created_at);
CREATE INDEX IF NOT EXISTS idx_wf_audit_case ON wf_audit_logs(case_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wf_audit_task ON wf_audit_logs(task_id, created_at DESC);
