INSERT INTO adm_departments (code, name)
VALUES
  ('DG_OFFICE', 'DG''s Office'),
  ('FINANCE', 'Finance & Accounts'),
  ('PROCUREMENT', 'Procurement'),
  ('ICT', 'ICT Unit'),
  ('LEGAL', 'Legal'),
  ('HR', 'Training/HR'),
  ('SERVICOM', 'SERVICOM')
ON CONFLICT (code) DO NOTHING;

INSERT INTO adm_roles (role_code, role_name, description, department_id, role_level, status)
SELECT
  x.role_code,
  x.role_name,
  x.description,
  d.id,
  x.role_level,
  'active'
FROM (
  VALUES
    ('DG', 'Director General', 'Executive final approver', 'DG_OFFICE', 9),
    ('FIN_DIR', 'Director of Finance', 'Finance executive oversight', 'FINANCE', 8),
    ('FIN_MGR', 'Finance Manager', 'Finance approvals and controls', 'FINANCE', 6),
    ('PROC_MGR', 'Procurement Manager', 'Procurement approval and supervision', 'PROCUREMENT', 6),
    ('PROC_OFF', 'Procurement Officer', 'Procurement processing operations', 'PROCUREMENT', 4),
    ('ICT_OFF', 'ICT Officer', 'ICT operations and support', 'ICT', 4),
    ('HR_OFF', 'HR Officer', 'HR operations', 'HR', 4),
    ('SERVICOM_OFF', 'SERVICOM Officer', 'Service quality and complaints', 'SERVICOM', 4),
    ('AUTH_USER', 'Authenticated User', 'Baseline permissions for all signed-in users', 'DG_OFFICE', 1)
) AS x(role_code, role_name, description, dept_code, role_level)
JOIN adm_departments d ON d.code = x.dept_code
ON CONFLICT (role_code) DO NOTHING;

INSERT INTO adm_modules (module_code, module_name, display_order)
VALUES
  ('PROC', 'Procurement', 10),
  ('BUDGET', 'Budget', 20),
  ('EXP', 'Expenditure', 30),
  ('ICT', 'ICT', 40),
  ('HR', 'HR/Training', 50),
  ('SERVICOM', 'SERVICOM', 60),
  ('WF', 'Workflow', 70),
  ('PROFILE', 'Profile', 80)
ON CONFLICT (module_code) DO NOTHING;

INSERT INTO adm_permissions (permission_code, module_code, feature_code, action_code, description)
VALUES
  ('PROC_REQUISITION_CREATE', 'PROC', 'REQUISITION', 'CREATE', 'Create purchase requisition'),
  ('PROC_REQUISITION_READ', 'PROC', 'REQUISITION', 'READ', 'View purchase requisitions'),
  ('PROC_REQUISITION_APPROVE', 'PROC', 'REQUISITION', 'APPROVE', 'Approve purchase requisitions'),
  ('PROC_PO_CREATE', 'PROC', 'PO', 'CREATE', 'Create purchase order'),
  ('PROC_PO_READ', 'PROC', 'PO', 'READ', 'View purchase orders'),
  ('PROC_PO_APPROVE', 'PROC', 'PO', 'APPROVE', 'Approve purchase orders'),
  ('PROC_VENDOR_CREATE', 'PROC', 'VENDOR', 'CREATE', 'Register new vendor'),
  ('PROC_VENDOR_READ', 'PROC', 'VENDOR', 'READ', 'View vendor list'),
  ('BUDGET_PLAN_CREATE', 'BUDGET', 'PLAN', 'CREATE', 'Create budget plan'),
  ('BUDGET_PLAN_READ', 'BUDGET', 'PLAN', 'READ', 'View budget plans'),
  ('BUDGET_PLAN_APPROVE', 'BUDGET', 'PLAN', 'APPROVE', 'Approve budget plans'),
  ('BUDGET_DASHBOARD_VIEW', 'BUDGET', 'DASHBOARD', 'VIEW', 'View budget dashboard'),
  ('EXP_PV_CREATE', 'EXP', 'PV', 'CREATE', 'Create payment voucher'),
  ('EXP_PV_APPROVE', 'EXP', 'PV', 'APPROVE', 'Approve payment voucher'),
  ('EXP_PV_PAY', 'EXP', 'PV', 'PAY', 'Execute payment'),
  ('ICT_TICKET_CREATE', 'ICT', 'TICKET', 'CREATE', 'Create support ticket'),
  ('ICT_TICKET_ASSIGN', 'ICT', 'TICKET', 'ASSIGN', 'Assign ICT ticket'),
  ('ICT_TICKET_RESOLVE', 'ICT', 'TICKET', 'RESOLVE', 'Resolve ICT ticket'),
  ('ICT_USER_CREATE', 'ICT', 'USER', 'CREATE', 'Create user account'),
  ('ICT_USER_DISABLE', 'ICT', 'USER', 'DISABLE', 'Disable user account'),
  ('ICT_USER_RESET_PWD', 'ICT', 'USER', 'RESET_PWD', 'Reset user password'),
  ('HR_LEAVE_REQUEST', 'HR', 'LEAVE', 'REQUEST', 'Request leave'),
  ('HR_LEAVE_APPROVE', 'HR', 'LEAVE', 'APPROVE', 'Approve leave'),
  ('SERVICOM_COMPLAINT_LOG', 'SERVICOM', 'COMPLAINT', 'LOG', 'Log complaint'),
  ('SERVICOM_COMPLAINT_ASSIGN', 'SERVICOM', 'COMPLAINT', 'ASSIGN', 'Assign complaint'),
  ('SERVICOM_COMPLAINT_RESOLVE', 'SERVICOM', 'COMPLAINT', 'RESOLVE', 'Resolve complaint'),
  ('WF_REQUEST_CREATE', 'WF', 'REQUEST', 'CREATE', 'Create workflow request'),
  ('WF_REQUEST_VIEW', 'WF', 'REQUEST', 'VIEW', 'View workflow requests'),
  ('WF_TASK_CLAIM', 'WF', 'TASK', 'CLAIM', 'Claim workflow task'),
  ('WF_TASK_COMPLETE', 'WF', 'TASK', 'COMPLETE', 'Complete workflow task'),
  ('WF_PROCESS_DESIGN', 'WF', 'PROCESS', 'DESIGN', 'Design workflow process'),
  ('PROFILE_VIEW_OWN', 'PROFILE', 'PROFILE', 'VIEW_OWN', 'View own profile'),
  ('PROFILE_UPDATE_OWN', 'PROFILE', 'PROFILE', 'UPDATE_OWN', 'Update own profile'),
  ('NOTIFICATION_READ', 'PROFILE', 'NOTIFICATION', 'READ', 'Read notifications')
ON CONFLICT (permission_code) DO NOTHING;

INSERT INTO adm_role_permissions (role_id, permission_id, granted)
SELECT r.id, p.id, TRUE
FROM adm_roles r
JOIN adm_permissions p ON p.permission_code IN (
  'PROFILE_VIEW_OWN',
  'PROFILE_UPDATE_OWN',
  'WF_REQUEST_CREATE',
  'WF_REQUEST_VIEW',
  'NOTIFICATION_READ'
)
WHERE r.role_code = 'AUTH_USER'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO adm_role_permissions (role_id, permission_id, granted)
SELECT r.id, p.id, TRUE
FROM adm_roles r
JOIN adm_permissions p ON p.permission_code IN (
  'PROC_REQUISITION_CREATE',
  'PROC_REQUISITION_READ',
  'PROC_PO_CREATE',
  'PROC_PO_READ',
  'PROC_VENDOR_READ',
  'WF_TASK_COMPLETE'
)
WHERE r.role_code = 'PROC_OFF'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO adm_role_permissions (role_id, permission_id, granted)
SELECT r.id, p.id, TRUE
FROM adm_roles r
JOIN adm_permissions p ON p.permission_code IN (
  'PROC_REQUISITION_APPROVE',
  'PROC_PO_APPROVE',
  'PROC_VENDOR_CREATE'
)
WHERE r.role_code = 'PROC_MGR'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO adm_sod_rules (code, left_permission_id, right_permission_id, severity, description)
SELECT
  'SOD_PROC_CREATE_APPROVE',
  p1.id,
  p2.id,
  'high',
  'User should not both create and approve purchase orders'
FROM adm_permissions p1
JOIN adm_permissions p2 ON p2.permission_code = 'PROC_PO_APPROVE'
WHERE p1.permission_code = 'PROC_PO_CREATE'
ON CONFLICT (code) DO NOTHING;

INSERT INTO adm_sod_rules (code, left_permission_id, right_permission_id, severity, description)
SELECT
  'SOD_EXP_CREATE_PAY',
  p1.id,
  p2.id,
  'high',
  'User should not both create and execute payment vouchers'
FROM adm_permissions p1
JOIN adm_permissions p2 ON p2.permission_code = 'EXP_PV_PAY'
WHERE p1.permission_code = 'EXP_PV_CREATE'
ON CONFLICT (code) DO NOTHING;
