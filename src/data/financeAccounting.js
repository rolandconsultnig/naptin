/** Mock enterprise finance / accounting module data — NAPTIN portal prototype */

export const CHART_OF_ACCOUNTS = [
  { code: '1000', name: 'Cash and bank balances', type: 'Asset', currency: 'NGN', balance: '₦412.8M' },
  { code: '1200', name: 'Accounts receivable — trade', type: 'Asset', currency: 'NGN', balance: '₦89.2M' },
  { code: '1500', name: 'Fixed assets — cost', type: 'Asset', currency: 'NGN', balance: '₦1.84B' },
  { code: '1510', name: 'Accumulated depreciation', type: 'Asset', currency: 'NGN', balance: '(₦612M)' },
  { code: '2000', name: 'Accounts payable — vendors', type: 'Liability', currency: 'NGN', balance: '₦124.5M' },
  { code: '2100', name: 'VAT payable', type: 'Liability', currency: 'NGN', balance: '₦18.3M' },
  { code: '3000', name: 'Retained earnings', type: 'Equity', currency: 'NGN', balance: '₦2.01B' },
  { code: '4000', name: 'Government subvention income', type: 'Revenue', currency: 'NGN', balance: 'YTD ₦890M' },
  { code: '5000', name: 'Training programme revenue', type: 'Revenue', currency: 'NGN', balance: 'YTD ₦156M' },
  { code: '6000', name: 'Personnel costs', type: 'Expense', currency: 'NGN', balance: 'YTD ₦445M' },
  { code: '6100', name: 'Utilities & facilities', type: 'Expense', currency: 'NGN', balance: 'YTD ₦92M' },
]

export const GL_JOURNAL_PREVIEW = [
  { id: 'JE-2026-1842', date: '28 Mar 2026', desc: 'Month-end accrual — utilities', lines: 6, status: 'Posted', preparer: 'GO' },
  { id: 'JE-2026-1841', date: '27 Mar 2026', desc: 'Vendor invoice INV-8841 (3-way match)', lines: 4, status: 'Posted', preparer: 'NE' },
  { id: 'JE-2026-1840', date: '26 Mar 2026', desc: 'FX revaluation — USD clearing', lines: 2, status: 'Posted', preparer: 'GO' },
  { id: 'JE-2026-1839', date: '25 Mar 2026', desc: 'Payroll interface from HRMS', lines: 28, status: 'Posted', preparer: 'SYS' },
]

export const AP_INVOICES = [
  { ref: 'INV-8841', vendor: 'West Africa Supplies Ltd', po: 'PO-2026-044', amount: '₦12.4M', match: '3-way', status: 'Ready for payment', due: '05 Apr 2026' },
  { ref: 'INV-8838', vendor: 'CloudHost NG', po: 'PO-2026-031', amount: '₦2.1M', match: '2-way', status: 'Matched', due: '02 Apr 2026' },
  { ref: 'INV-8832', vendor: 'SecurePrint Ltd', po: '—', amount: '₦840K', match: '2-way', status: 'Exception — no PO', due: '30 Mar 2026' },
]

export const AR_INVOICES = [
  { ref: 'SI-2026-210', customer: 'NERC — capacity building', amount: '₦24.0M', terms: 'Net 30', dunning: 'None', status: 'Outstanding' },
  { ref: 'SI-2026-205', customer: 'Min. of Power — study tour', amount: '₦8.2M', terms: 'Net 45', dunning: 'Reminder sent', status: 'Outstanding' },
  { ref: 'SI-2026-198', customer: 'PHEDC training cohort', amount: '₦3.6M', terms: 'Net 15', dunning: 'Final notice', status: 'Overdue 6d' },
]

export const BANK_RECON_LINES = [
  { source: 'GTBank feed', date: '28 Mar 2026', desc: 'NIP inflow — subvention', bank: '₦450.0M', book: '₦450.0M', match: 'Auto' },
  { source: 'GTBank feed', date: '28 Mar 2026', desc: 'POS charges', bank: '(₦12,400)', book: '—', match: 'Suggested' },
  { source: 'Access feed', date: '27 Mar 2026', desc: 'Vendor payment batch 884', bank: '(₦18.2M)', book: '(₦18.2M)', match: 'Auto' },
]

export const FX_RATES = [
  { pair: 'USD/NGN', rate: '1,612.40', source: 'CBN SMIS', updated: '28 Mar 2026 08:00', unrealized: '₦2.1M (gain)' },
  { pair: 'EUR/NGN', rate: '1,748.20', source: 'Bloomberg ref', updated: '28 Mar 2026 08:00', unrealized: '₦(640K) (loss)' },
  { pair: 'GBP/NGN', rate: '2,045.00', source: 'Bloomberg ref', updated: '28 Mar 2026 08:00', unrealized: '₦890K (gain)' },
]

export const FIXED_ASSETS = [
  { tag: 'FA-4401', name: 'Kaduna campus — HVAC system', cost: '₦42M', method: 'Straight-Line', life: '10 yrs', nbv: '₦31.2M', disposal: '—' },
  { tag: 'FA-4398', name: 'Abuja data centre — UPS', cost: '₦18.5M', method: 'Double-Declining', life: '7 yrs', nbv: '₦11.1M', disposal: '—' },
  { tag: 'FA-4120', name: 'Fleet — Toyota Hilux (retired)', cost: '₦14.2M', method: 'Straight-Line', life: '5 yrs', nbv: '₦0', disposal: 'Sold Mar 2026' },
]

export const EXPENSE_CLAIMS = [
  { id: 'EC-9921', staff: 'Ibrahim Musa', amount: '₦184,200', card: 'Corporate', ocr: 'Receipt OK', stage: 'Manager approval' },
  { id: 'EC-9918', staff: 'Ngozi Eze', amount: '₦62,000', card: '—', ocr: 'OCR 94%', stage: 'Finance review' },
  { id: 'EC-9912', staff: 'Amina Bello', amount: '₦310,500', card: 'Corporate', ocr: 'Policy flag', stage: 'Exception' },
]

export const CASH_POSITIONS = [
  { pool: 'Operating — GTBank', available: '₦298.4M', forecast7d: '₦276M (min)', alert: 'OK' },
  { pool: 'Operating — Access', available: '₦114.2M', forecast7d: '₦108M (min)', alert: 'OK' },
  { pool: 'Project escrow — World Bank', available: 'USD 2.1M', forecast7d: 'Stable', alert: 'Covenant review' },
]

export const PROJECT_ACCOUNTING = [
  { code: 'PRJ-WB-TRN', name: 'Regional trainer upskilling', budget: '₦420M', actual: '₦311M', revenue: '₦98M (fees)', margin: '24%' },
  { code: 'PRJ-GIZ-SOLAR', name: 'Solar curriculum pilot', budget: '€1.2M', actual: '€890K', revenue: 'Grant', margin: 'N/A' },
  { code: 'PRJ-INTERNAL-ICT', name: 'ERP phase 2 — Finance', budget: '₦85M', actual: '₦52M', revenue: '—', margin: 'Cost centre' },
]

export const TAX_RUNS = [
  { period: 'Mar 2026', jurisdiction: 'Nigeria — FIRS', basis: 'VAT 7.5%', liability: '₦18.3M', filing: 'Draft — due 21 Apr' },
  { period: 'Q1 2026', jurisdiction: 'WHT — contractors', basis: '5% / 10%', liability: '₦4.1M', filing: 'Scheduled' },
]

export const AUDIT_TRAIL_ENTRIES = [
  { ts: '28 Mar 2026 14:22:08', user: 'g.okafor@naptin.gov.ng', entity: 'GL Journal JE-1842', action: 'POST', hash: 'sha256:a3f2…9c1' },
  { ts: '28 Mar 2026 11:05:41', user: 'n.eze@naptin.gov.ng', entity: 'COA 6100', action: 'UPDATE', hash: 'sha256:b81e…22d' },
  { ts: '27 Mar 2026 16:40:00', user: 'system@erp', entity: 'Bank feed GTB', action: 'IMPORT', hash: 'sha256:c904…01a' },
]

export const CONSOLIDATION_ENTITIES = [
  { code: 'NAPTIN-HQ', name: 'NAPTIN HQ', role: 'Parent', currency: 'NGN', status: 'Mapped' },
  { code: 'RTC-NW', name: 'North-West Regional Centre', role: 'Subsidiary', currency: 'NGN', status: 'Mapped' },
  { code: 'RTC-SE', name: 'South-East Regional Centre', role: 'Subsidiary', currency: 'NGN', status: 'Elimination rules pending' },
]

export const IFRS_TEMPLATES = [
  { id: 'TPL-BS-IFRS', name: 'Statement of financial position', standard: 'IFRS', lastRun: '28 Mar 2026', notes: 'IAS 1 presentation' },
  { id: 'TPL-PNL-GAAP', name: 'Statement of activities (gov’t)', standard: 'IPSAS / local', lastRun: '15 Mar 2026', notes: 'Configurable mapping' },
  { id: 'TPL-CF-DIRECT', name: 'Cash flows — direct method', standard: 'IFRS', lastRun: '28 Mar 2026', notes: 'IAS 7' },
]

export const BUDGET_SCENARIOS = [
  { name: 'FY2026 Board approved', type: 'Annual', variance: '2.3% under (YTD)', owner: 'Finance' },
  { name: 'What-if — 10% subvention cut', type: 'Scenario', variance: 'Deficit Q3–Q4', owner: 'FP&A' },
  { name: 'Training revenue +15%', type: 'Scenario', variance: 'Surplus runway +4 months', owner: 'FP&A' },
]

export const FINANCIAL_REPORTS = [
  { name: 'Consolidated balance sheet', period: 'As at 28 Mar 2026', format: 'PDF / XBRL', status: 'Ready' },
  { name: 'P&L by programme', period: 'YTD 2026', format: 'Excel', status: 'Ready' },
  { name: 'Cash flow statement', period: 'Q1 2026', format: 'PDF', status: 'Scheduled' },
]

export const FINANCE_KPIS = [
  { key: 'Burn rate', value: '₦118M / mo', target: '< ₦125M', status: 'good' },
  { key: 'Quick ratio', value: '1.42', target: '> 1.0', status: 'good' },
  { key: 'Net profit margin', value: '18.6%', target: '> 15%', status: 'good' },
  { key: 'DSO (days)', value: '38', target: '< 45', status: 'good' },
  { key: 'DPO (days)', value: '41', target: '35–50', status: 'neutral' },
]

export const FINANCE_API_INTEGRATIONS = [
  { system: 'SAP S/4HANA Finance', scope: 'GL, commitments, AP posting', mode: 'REST + iDoc' },
  { system: 'Salesforce CRM', scope: 'Customer master, AR contacts', mode: 'OAuth 2.0' },
  { system: 'HRMS Payroll', scope: 'Personnel costs, WHT', mode: 'Secure file + API' },
  { system: 'Inventory / Stores', scope: '3-way match — GRN', mode: 'Webhooks' },
]

export const FINANCE_RBAC_HINTS = [
  { role: 'Finance staff', access: 'AP/AR entry, bank rec, expenses (own dept)' },
  { role: 'Finance HOD', access: '+ Approvals, COA maintenance (non-critical), reports' },
  { role: 'Director', access: '+ Consolidation, executive dashboards, payroll GL view' },
  { role: 'Auditor (read-only)', access: 'Immutable audit trail, reports, no posting' },
]

export const FINANCE_NAV = [
  { to: 'overview', label: 'Overview' },
  { to: 'ledger', label: 'GL & COA' },
  { to: 'payables', label: 'Payables' },
  { to: 'receivables', label: 'Receivables' },
  { to: 'bank', label: 'Bank rec' },
  { to: 'currency', label: 'Multi-currency' },
  { to: 'fixed-assets', label: 'Fixed assets' },
  { to: 'expenses', label: 'Expenses' },
  { to: 'cash-flow', label: 'Cash & liquidity' },
  { to: 'projects', label: 'Project accounting' },
  { to: 'tax', label: 'Tax engine' },
  { to: 'audit-compliance', label: 'Audit & consolidation' },
  { to: 'budget', label: 'Budget & forecast' },
  { to: 'reports', label: 'Financial reports' },
  { to: 'analytics', label: 'BI & KPIs' },
  { to: 'platform', label: 'Security & APIs' },
  { to: 'budget-workbench', label: 'Budget Workbench' },
  { to: 'expenditure-workbench', label: 'Expenditure' },
  { to: 'fiscal-reporting', label: 'Fiscal Reporting' },
]
