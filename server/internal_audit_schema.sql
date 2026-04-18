-- =============================================================
-- Internal Audit Schema
-- Risk-based planning, findings, remediation & cross-module linkage
-- =============================================================

CREATE TABLE IF NOT EXISTS ia_audit_engagements (
  id SERIAL PRIMARY KEY,
  engagement_ref TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  fiscal_year INT NOT NULL,
  quarter TEXT,
  department_code TEXT NOT NULL,
  process_area TEXT NOT NULL,
  scope TEXT,
  objective TEXT,
  risk_rating TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  status TEXT NOT NULL DEFAULT 'planned', -- planned, fieldwork, reporting, follow-up, closed
  lead_auditor TEXT NOT NULL,
  team_members TEXT,
  start_date DATE,
  end_date DATE,
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ia_audit_findings (
  id SERIAL PRIMARY KEY,
  finding_ref TEXT NOT NULL UNIQUE,
  engagement_id INT REFERENCES ia_audit_engagements(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  source_module TEXT NOT NULL, -- accounts, procurement, store, hr, ict, governance
  department_code TEXT NOT NULL,
  condition_text TEXT NOT NULL,
  criteria_text TEXT,
  cause_text TEXT,
  impact_text TEXT,
  recommendation TEXT NOT NULL,
  risk_rating TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  control_type TEXT NOT NULL DEFAULT 'detective', -- preventive, detective, corrective
  status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, resolved, closed, accepted_risk
  owner_department TEXT,
  owner_name TEXT,
  due_date DATE,
  closed_at TIMESTAMPTZ,
  created_by TEXT NOT NULL DEFAULT 'internal.audit',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ia_finding_actions (
  id SERIAL PRIMARY KEY,
  finding_id INT NOT NULL REFERENCES ia_audit_findings(id) ON DELETE CASCADE,
  action_note TEXT NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'update', -- update, remediation, evidence, closure, reopen
  actor_name TEXT NOT NULL,
  actor_department TEXT,
  next_due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ia_engagement_status ON ia_audit_engagements(status, fiscal_year);
CREATE INDEX IF NOT EXISTS idx_ia_engagement_dept ON ia_audit_engagements(department_code, process_area);
CREATE INDEX IF NOT EXISTS idx_ia_finding_status ON ia_audit_findings(status, risk_rating);
CREATE INDEX IF NOT EXISTS idx_ia_finding_module ON ia_audit_findings(source_module, department_code);
CREATE INDEX IF NOT EXISTS idx_ia_action_finding ON ia_finding_actions(finding_id, created_at);
