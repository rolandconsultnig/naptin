-- Collaboration projects & tasks. Run: npm run db:collab:projects

CREATE TABLE IF NOT EXISTS collab_projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  owner_label TEXT NOT NULL DEFAULT '',
  owner_email TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'on-track',
  description TEXT NOT NULL DEFAULT '',
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collab_project_tasks (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES collab_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  assignee_label TEXT NOT NULL DEFAULT '',
  assignee_email TEXT,
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'todo',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collab_project_tasks_project ON collab_project_tasks(project_id, sort_order, id);

-- Demo projects (idempotent by name)
INSERT INTO collab_projects (name, owner_label, due_date, status, description, created_by)
SELECT 'ANCEE Accreditation Renewal', 'BA', DATE '2026-04-30', 'on-track', 'Accreditation cycle', 'system@naptin.gov.ng'
WHERE NOT EXISTS (SELECT 1 FROM collab_projects WHERE name = 'ANCEE Accreditation Renewal');

INSERT INTO collab_projects (name, owner_label, due_date, status, description, created_by)
SELECT 'Lagos RTC Solar Pilot', 'TA', DATE '2026-06-15', 'at-risk', 'Solar pilot rollout', 'system@naptin.gov.ng'
WHERE NOT EXISTS (SELECT 1 FROM collab_projects WHERE name = 'Lagos RTC Solar Pilot');

INSERT INTO collab_projects (name, owner_label, due_date, status, description, created_by)
SELECT 'ERP Phase 2 — HR Module', 'AM', DATE '2026-08-31', 'on-track', 'HR module UAT', 'system@naptin.gov.ng'
WHERE NOT EXISTS (SELECT 1 FROM collab_projects WHERE name = 'ERP Phase 2 — HR Module');

INSERT INTO collab_projects (name, owner_label, due_date, status, description, created_by)
SELECT 'National Grid Safety Campaign', 'NE', DATE '2026-04-10', 'on-track', 'Comms campaign', 'system@naptin.gov.ng'
WHERE NOT EXISTS (SELECT 1 FROM collab_projects WHERE name = 'National Grid Safety Campaign');

INSERT INTO collab_project_tasks (project_id, title, assignee_label, due_date, priority, status, sort_order)
SELECT p.id, 'Submit evidence pack to ANCEE', 'BA', DATE '2026-04-05', 'high', 'in-progress', 1
FROM collab_projects p WHERE p.name = 'ANCEE Accreditation Renewal'
  AND NOT EXISTS (SELECT 1 FROM collab_project_tasks t WHERE t.project_id = p.id AND t.title = 'Submit evidence pack to ANCEE');

INSERT INTO collab_project_tasks (project_id, title, assignee_label, due_date, priority, status, sort_order)
SELECT p.id, 'Internal audit sign-off', 'GO', DATE '2026-04-08', 'medium', 'todo', 2
FROM collab_projects p WHERE p.name = 'ANCEE Accreditation Renewal'
  AND NOT EXISTS (SELECT 1 FROM collab_project_tasks t WHERE t.project_id = p.id AND t.title = 'Internal audit sign-off');

INSERT INTO collab_project_tasks (project_id, title, assignee_label, due_date, priority, status, sort_order)
SELECT p.id, 'Vendor site survey — Ijora', 'MI', DATE '2026-04-02', 'high', 'blocked', 1
FROM collab_projects p WHERE p.name = 'Lagos RTC Solar Pilot'
  AND NOT EXISTS (SELECT 1 FROM collab_project_tasks t WHERE t.project_id = p.id AND t.title LIKE 'Vendor site survey%');

INSERT INTO collab_project_tasks (project_id, title, assignee_label, due_date, priority, status, sort_order)
SELECT p.id, 'Payroll UAT with Finance', 'AM', DATE '2026-04-12', 'medium', 'in-progress', 1
FROM collab_projects p WHERE p.name = 'ERP Phase 2 — HR Module'
  AND NOT EXISTS (SELECT 1 FROM collab_project_tasks t WHERE t.project_id = p.id AND t.title = 'Payroll UAT with Finance');

INSERT INTO collab_project_tasks (project_id, title, assignee_label, due_date, priority, status, sort_order)
SELECT p.id, 'Press release draft', 'BA', DATE '2026-03-29', 'low', 'done', 1
FROM collab_projects p WHERE p.name = 'National Grid Safety Campaign'
  AND NOT EXISTS (SELECT 1 FROM collab_project_tasks t WHERE t.project_id = p.id AND t.title = 'Press release draft');
