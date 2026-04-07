/**
 * Every staff-facing module under /app — used by the admin portal for registry + RBAC matrix.
 */
export const PORTAL_MODULES = [
  { segment: 'dashboard', label: 'Dashboard', path: '/app/dashboard', category: 'Workspace' },
  { segment: 'intranet', label: 'Intranet feed', path: '/app/intranet', category: 'Workspace' },
  { segment: 'collaboration', label: 'Collaboration', path: '/app/collaboration', category: 'Workspace' },
  { segment: 'chat', label: 'Messages / chat', path: '/app/chat', category: 'Workspace' },
  { segment: 'meetings', label: 'Meetings', path: '/app/meetings', category: 'Workspace' },
  { segment: 'profile', label: 'My profile', path: '/app/profile', category: 'Workspace' },
  {
    segment: 'human-resource',
    label: 'Human Resource Management',
    path: '/app/human-resource',
    category: 'Departments',
  },
  { segment: 'finance', label: 'Finance & Accounts', path: '/app/finance', category: 'Departments' },
  { segment: 'planning', label: 'Planning, Research & Statistics', path: '/app/planning', category: 'Departments' },
  { segment: 'training', label: 'Training', path: '/app/training', category: 'Departments' },
  { segment: 'corporate', label: 'Corporate & Consultancy Services', path: '/app/corporate', category: 'Departments' },
  { segment: 'marketing', label: 'Marketing & Business Development', path: '/app/marketing', category: 'Departments' },
  { segment: 'client-ops-markets', label: 'Client Operations & New Markets', path: '/app/client-ops-markets', category: 'Departments' },
  { segment: 'legal', label: 'Legal / Board Secretariat', path: '/app/legal', category: 'Units' },
  { segment: 'documents', label: 'Internal Audit', path: '/app/documents', category: 'Units' },
  { segment: 'procurement', label: 'Procurement', path: '/app/procurement', category: 'Units' },
  { segment: 'ict', label: 'ICT', path: '/app/ict', category: 'Units' },
  { segment: 'mande', label: 'M&E (legacy)', path: '/app/mande', category: 'Units' },
  { segment: 'integrations', label: 'Integrations', path: '/app/integrations', category: 'Platform' },
  { segment: 'security', label: 'Security & access', path: '/app/security', category: 'Platform' },
]

export const GRANT_LEVELS = [
  { id: 'none', label: 'No access' },
  { id: 'view', label: 'View' },
  { id: 'contribute', label: 'Contribute' },
  { id: 'manage', label: 'Manage' },
  { id: 'full', label: 'Full admin' },
]

/** Grant ids that count as “may open route” in the SPA prototype */
export const GRANTS_ALLOW_ROUTE = ['view', 'contribute', 'manage', 'full']
