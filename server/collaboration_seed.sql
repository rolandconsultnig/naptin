-- Collaboration demo rows (requires operations_schema.sql collab_* tables).
-- Idempotent: skips when a workspace with the same name already exists.

INSERT INTO collab_workspaces (name, description, department, owner_email, member_count, file_count, status)
SELECT 'Q1 Board Pack', 'Board materials, approvals, and pack assembly', 'Corporate', 'director@naptin.gov.ng', 3, 2, 'active'
WHERE NOT EXISTS (SELECT 1 FROM collab_workspaces WHERE name = 'Q1 Board Pack');

INSERT INTO collab_workspaces (name, description, department, owner_email, member_count, file_count, status)
SELECT 'ICT Infrastructure 2026', 'Change control, vendor submissions, and rollout notes', 'ICT', 'ict@naptin.gov.ng', 4, 5, 'active'
WHERE NOT EXISTS (SELECT 1 FROM collab_workspaces WHERE name = 'ICT Infrastructure 2026');

INSERT INTO collab_workspace_members (workspace_id, user_email, role)
SELECT w.id, 'director@naptin.gov.ng', 'owner'
FROM collab_workspaces w
WHERE w.name = 'Q1 Board Pack'
  AND NOT EXISTS (
    SELECT 1 FROM collab_workspace_members m WHERE m.workspace_id = w.id AND m.user_email = 'director@naptin.gov.ng'
  );

INSERT INTO collab_workspace_members (workspace_id, user_email, role)
SELECT w.id, 'staff@naptin.gov.ng', 'editor'
FROM collab_workspaces w
WHERE w.name = 'Q1 Board Pack'
  AND NOT EXISTS (
    SELECT 1 FROM collab_workspace_members m WHERE m.workspace_id = w.id AND m.user_email = 'staff@naptin.gov.ng'
  );

INSERT INTO collab_workspace_members (workspace_id, user_email, role)
SELECT w.id, 'ict@naptin.gov.ng', 'owner'
FROM collab_workspaces w
WHERE w.name = 'ICT Infrastructure 2026'
  AND NOT EXISTS (
    SELECT 1 FROM collab_workspace_members m WHERE m.workspace_id = w.id AND m.user_email = 'ict@naptin.gov.ng'
  );

INSERT INTO collab_documents (workspace_id, title, file_type, file_url, file_size_bytes, uploaded_by, status)
SELECT w.id, 'Board_Q1_Financial_Summary.pdf', 'pdf', '', 0, 'director@naptin.gov.ng', 'active'
FROM collab_workspaces w
WHERE w.name = 'Q1 Board Pack'
  AND NOT EXISTS (SELECT 1 FROM collab_documents d WHERE d.workspace_id = w.id AND d.title = 'Board_Q1_Financial_Summary.pdf');

INSERT INTO collab_documents (workspace_id, title, file_type, file_url, file_size_bytes, uploaded_by, status)
SELECT w.id, 'Runbook — portal DR test', 'document', 'inline:Weekly checklist for failover rehearsal.', 0, 'ict@naptin.gov.ng', 'active'
FROM collab_workspaces w
WHERE w.name = 'ICT Infrastructure 2026'
  AND NOT EXISTS (SELECT 1 FROM collab_documents d WHERE d.workspace_id = w.id AND d.title = 'Runbook — portal DR test');
