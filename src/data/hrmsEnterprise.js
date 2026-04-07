/**
 * Enterprise HRMS-aligned mock data (from `Enterprise HRMS` reference project).
 * NAPTIN-localised; wire to `VITE_HRMS_API` when the Node API is running.
 */

export const HRMS_DASHBOARD = {
  totalEmployees: 1248,
  activeEmployees: 1189,
  onLeave: 43,
  newHires: 14,
}

export const HRMS_ACTIVITIES = [
  { text: 'Leave approved — Grace Okafor (5 days annual)', time: '12m ago', type: 'leave' },
  { text: 'New candidate submitted — M&E Analyst II', time: '1h ago', type: 'recruitment' },
  { text: 'March payroll run locked for processing', time: '2h ago', type: 'payroll' },
  { text: 'Policy attestation: NDPR refresh — 89% complete', time: '3h ago', type: 'compliance' },
  { text: 'Training completed — Cybersecurity Module 3 (412 staff)', time: '5h ago', type: 'learning' },
]

/** Core HR — departments (org structure) */
export const HRMS_DEPARTMENTS = [
  { code: 'HQ', name: 'Corporate HQ', location: 'Abuja, FCT', headcount: 287, budget: '₦2.4B' },
  { code: 'HRM', name: 'Human Resource Management', location: 'Abuja', headcount: 148, budget: '₦420M' },
  { code: 'FIN', name: 'Finance & Accounts', location: 'Abuja', headcount: 98, budget: '₦180M' },
  { code: 'TRN', name: 'Training', location: 'Multi-RTC', headcount: 44, budget: '₦950M' },
  { code: 'ICT', name: 'ICT', location: 'Abuja', headcount: 67, budget: '₦310M' },
  { code: 'PRO', name: 'Procurement', location: 'Abuja', headcount: 82, budget: '₦90M' },
]

/** ATS — candidates pipeline */
export const HRMS_CANDIDATES = [
  { id: 'CAN-104', name: 'Ibrahim Musa', role: 'Training Officer', stage: 'Interview', source: 'Referral', owner: 'AM' },
  { id: 'CAN-103', name: 'Chioma Nwosu', role: 'Finance Officer I', stage: 'Assessment', source: 'Jobs board', owner: 'GO' },
  { id: 'CAN-102', name: 'Yusuf Garba', role: 'ICT Support', stage: 'Offer', source: 'LinkedIn', owner: 'EB' },
]

export const HRMS_INTERVIEWS = [
  { id: 'INT-55', candidate: 'Ibrahim Musa', panel: 'TA, AM', when: '02 Apr 2026 · 10:00', mode: 'Teams', status: 'Scheduled' },
  { id: 'INT-54', candidate: 'Chioma Nwosu', panel: 'GO, NE', when: '31 Mar 2026 · 14:00', mode: 'On-site', status: 'Completed' },
]

/** Time & attendance — clock log sample */
export const HRMS_CLOCK_LOG = [
  { staff: 'Adebayo Okonkwo', site: 'Corporate HQ', in: '07:58', out: '17:02', hours: '8h 04m', flag: '—' },
  { staff: 'Grace Okafor', site: 'Corporate HQ', in: '08:12', out: '—', hours: '—', flag: 'Late in' },
  { staff: 'Emmanuel Bello', site: 'Remote', in: '08:00', out: '16:45', hours: '8h 45m', flag: '—' },
]

/** Leave — admin queue */
export const HRMS_LEAVE_ADMIN = [
  { ref: 'LV-2026-441', staff: 'Fatima Adamu', type: 'Annual', days: 5, dates: 'Apr 7–11', status: 'Pending', approver: 'DG Office' },
  { ref: 'LV-2026-440', staff: 'Chukwuma Ude', type: 'Sick', days: 2, dates: 'Mar 30–31', status: 'Approved', approver: 'AM' },
  { ref: 'LV-2026-439', staff: 'Kemi Oluwole', type: 'Study', days: 3, dates: 'Apr 14–16', status: 'Manager review', approver: 'HOD M&E' },
]

/** Benefits administration */
export const HRMS_BENEFITS = [
  { name: 'NHIS — Formal sector', type: 'Health', provider: 'NHIS-accredited HMO', employer: '75%', employee: '25%', enrollees: 1189 },
  { name: 'Pension (RSA) — PFA', type: 'Retirement', provider: 'Lead PFA', employer: '10%', employee: '8%', enrollees: 1248 },
  { name: 'Group life assurance', type: 'Insurance', provider: 'Composite insurer', employer: '100%', employee: '0%', enrollees: 1248 },
  { name: 'Housing / car advance (policy)', type: 'Loan / advance', provider: 'Internal', employer: '—', employee: 'Payroll deduction', enrollees: 312 },
]

/** Learning & development — enterprise catalogue */
export const HRMS_LEARNING_PROGRAMS = [
  { code: 'LMS-HSSE', title: 'HSSE induction — substations', mandatory: true, completions: 892, due: 'Rolling' },
  { code: 'LMS-CYBER', title: 'Cybersecurity awareness', mandatory: true, completions: 1104, due: 'Quarterly' },
  { code: 'LMS-LEAD', title: 'Leadership pipeline — GL-12+', mandatory: false, completions: 86, due: 'FY2026 H1' },
  { code: 'LMS-ANCEE', title: 'ANCEE quality standards', mandatory: true, completions: 412, due: 'Mar 2026' },
]

/** Workforce planning & analytics */
export const HRMS_ANALYTICS_REPORTS = [
  { name: 'Headcount by RTC & grade', owner: 'HR Analytics', lastRun: '27 Mar 2026', schedule: 'Weekly', format: 'Power BI' },
  { name: 'Diversity & inclusion snapshot', owner: 'Corporate', lastRun: '15 Mar 2026', schedule: 'Monthly', format: 'Excel / BI' },
  { name: 'Skills gap — technical instructors', owner: 'Training', lastRun: '20 Mar 2026', schedule: 'Ad hoc', format: 'PDF' },
]

export const HRMS_WORKFORCE_PLANS = [
  { scenario: 'Q2 instructor hire', fy: '2026', delta: '+18 FTE', risk: 'Low', status: 'Approved' },
  { scenario: 'ICT service desk scale-up', fy: '2026', delta: '+6 FTE', risk: 'Medium', status: 'Draft' },
]

/** Employee experience */
export const HRMS_EXPERIENCE = {
  eNps: 42,
  recognitionThisMonth: 156,
  openPulse: 'Q1 engagement — closes 5 Apr 2026',
  chatbotQueries: 1284,
}

/** Compliance & risk */
export const HRMS_COMPLIANCE = [
  { id: 'CMP-09', title: 'NDPR — data processing register update', owner: 'ICT + Legal', due: '30 Apr 2026', status: 'In progress' },
  { id: 'CMP-08', title: 'Labour audit — contract templates', owner: 'HR', due: '15 Apr 2026', status: 'Review' },
  { id: 'CMP-07', title: 'Whistleblower case #2026-02 (confidential)', owner: 'Audit', due: '—', status: 'Investigation' },
]

/** Mobile & self-service capabilities */
export const HRMS_MOBILE_CAPS = [
  { feature: 'Push approvals (leave, timesheet)', status: 'Available', platform: 'iOS / Android' },
  { feature: 'Digital payslip & tax certificates', status: 'Available', platform: 'App + web' },
  { feature: 'Geofenced attendance (RTC sites)', status: 'Pilot', platform: 'Android' },
  { feature: 'Voice assistant approvals', status: 'Planned', platform: '—' },
]

/** Integration hub — HR-specific connectors */
export const HRMS_INTEGRATIONS = [
  { name: 'Oracle / SAP payroll bridge', direction: 'Outbound payslip + GL', status: 'Planned' },
  { name: 'Microsoft Entra ID (SCIM)', direction: 'User provision / deprovision', status: 'Connected' },
  { name: 'NHIS / pension file exchange', direction: 'Monthly file', status: 'Connected' },
  { name: 'Background check API', direction: 'Recruitment', status: 'Evaluation' },
]

/** Custom workflows (HRIS) */
export const HRMS_WORKFLOWS = [
  { name: 'Promotion — GL change', steps: 'HOD → HR → Director HR', avgDays: 12, open: 7 },
  { name: 'Inter-RTC transfer', steps: 'HOD A → HOD B → HR → Admin', avgDays: 21, open: 3 },
  { name: 'Contract renewal', steps: 'HR → Legal → Employee e-sign', avgDays: 8, open: 11 },
]
