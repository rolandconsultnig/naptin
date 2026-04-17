/** Native shells first; wire each to `/api/v1/...` as you build real screens. */
export type ModuleDef = {
  id: string
  title: string
  subtitle: string
}

export const WORKPLACE_MODULES: ModuleDef[] = [
  { id: 'dashboard', title: 'Dashboard', subtitle: 'KPIs and approvals (native).' },
  { id: 'hr', title: 'Human resources', subtitle: 'People, leave, attendance.' },
  { id: 'finance', title: 'Finance', subtitle: 'Budgets, postings, cash advance.' },
  { id: 'procurement', title: 'Procurement', subtitle: 'Requisitions and vendors.' },
  { id: 'ict', title: 'ICT', subtitle: 'Assets, incidents, service requests.' },
  { id: 'intranet', title: 'Intranet', subtitle: 'News and discussions.' },
  { id: 'collaboration', title: 'Collaboration', subtitle: 'Tasks and handoffs.' },
]
