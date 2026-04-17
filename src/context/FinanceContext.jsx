import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'
import {
  CHART_OF_ACCOUNTS,
  GL_JOURNAL_PREVIEW,
  AP_INVOICES,
  AR_INVOICES,
  BANK_RECON_LINES,
  FX_RATES,
  FIXED_ASSETS,
  EXPENSE_CLAIMS,
  CASH_POSITIONS,
  PROJECT_ACCOUNTING,
  TAX_RUNS,
  AUDIT_TRAIL_ENTRIES,
  CONSOLIDATION_ENTITIES,
  IFRS_TEMPLATES,
  BUDGET_SCENARIOS,
  FINANCIAL_REPORTS,
  FINANCE_KPIS,
  FINANCE_API_INTEGRATIONS,
} from '../data/financeAccounting'
import { SPEND_DATA, PIE_DATA, TRANSACTIONS } from '../data/mock'

const STORAGE_KEY = 'naptin_finance_module_v2'
const STATE_VERSION = 2

const clone = (x) => JSON.parse(JSON.stringify(x))

export function createInitialFinanceState() {
  return {
    version: STATE_VERSION,
    chartOfAccounts: clone(CHART_OF_ACCOUNTS),
    journals: clone(GL_JOURNAL_PREVIEW),
    apInvoices: clone(AP_INVOICES),
    arInvoices: clone(AR_INVOICES),
    bankLines: clone(BANK_RECON_LINES),
    fxRates: clone(FX_RATES),
    fixedAssets: clone(FIXED_ASSETS),
    expenseClaims: clone(EXPENSE_CLAIMS),
    cashPositions: clone(CASH_POSITIONS),
    projectAccounting: clone(PROJECT_ACCOUNTING),
    taxRuns: clone(TAX_RUNS),
    auditTrail: clone(AUDIT_TRAIL_ENTRIES),
    consolidationEntities: clone(CONSOLIDATION_ENTITIES),
    ifrsTemplates: clone(IFRS_TEMPLATES),
    budgetScenarios: clone(BUDGET_SCENARIOS),
    financialReports: clone(FINANCIAL_REPORTS),
    financeKpis: clone(FINANCE_KPIS),
    apiIntegrations: clone(FINANCE_API_INTEGRATIONS).map((r) => ({ ...r, lastPing: null, ok: null })),
    treasuryTransactions: clone(TRANSACTIONS),
    spendByMonth: clone(SPEND_DATA),
    pieBudget: clone(PIE_DATA),
    budgetUtilisationPct: 68,
    journalSeq: 1843,
  }
}

function loadStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialFinanceState()
    const p = JSON.parse(raw)
    if (p.version !== STATE_VERSION) return createInitialFinanceState()
    return p
  } catch {
    return createInitialFinanceState()
  }
}

function auditEntry(userEmail, entity, action) {
  const ts = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const h = Math.random().toString(16).slice(2, 10)
  return {
    ts,
    user: userEmail || 'system@naptin.gov.ng',
    entity,
    action,
    hash: `sha256:${h}…${h.slice(-3)}`,
  }
}

function financeReducer(state, action) {
  const u = action.meta?.email || 'system@naptin.gov.ng'
  const pushAudit = (entity, act) => ({
    auditTrail: [auditEntry(u, entity, act), ...state.auditTrail].slice(0, 200),
  })

  switch (action.type) {
    case 'RESET':
      return createInitialFinanceState()

    case 'ADD_JOURNAL': {
      const { desc, lines } = action.payload
      if (!desc?.trim()) return state
      const n = Math.max(state.journalSeq, 1843)
      const id = `JE-2026-${n}`
      const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      const preparer = action.meta?.initials || 'ME'
      const row = {
        id,
        date,
        desc: desc.trim(),
        lines: Math.max(2, Number(lines) || 2),
        status: 'Draft',
        preparer,
      }
      return {
        ...state,
        journals: [row, ...state.journals],
        journalSeq: n + 1,
        ...pushAudit(id, 'CREATE_DRAFT'),
      }
    }

    case 'POST_JOURNAL': {
      const id = action.payload.id
      const cur = state.journals.find((j) => j.id === id)
      if (!cur || cur.status !== 'Draft') return state
      const journals = state.journals.map((j) => (j.id === id ? { ...j, status: 'Posted' } : j))
      return { ...state, journals, ...pushAudit(id, 'POST') }
    }

    case 'UPDATE_COA_BALANCE': {
      const { code, balance } = action.payload
      const chartOfAccounts = state.chartOfAccounts.map((r) =>
        r.code === code ? { ...r, balance: balance.trim() || r.balance } : r
      )
      return { ...state, chartOfAccounts, ...pushAudit(`COA ${code}`, 'UPDATE_BALANCE') }
    }

    case 'AP_SCHEDULE_PAYMENT': {
      const ref = action.payload.ref
      const apInvoices = state.apInvoices.map((r) =>
        r.ref === ref ? { ...r, status: 'Payment scheduled' } : r
      )
      return { ...state, apInvoices, ...pushAudit(`AP ${ref}`, 'SCHEDULE_PAYMENT') }
    }

    case 'AP_HOLD': {
      const ref = action.payload.ref
      const apInvoices = state.apInvoices.map((r) => (r.ref === ref ? { ...r, status: 'On hold' } : r))
      return { ...state, apInvoices, ...pushAudit(`AP ${ref}`, 'HOLD') }
    }

    case 'AP_RELEASE': {
      const ref = action.payload.ref
      const apInvoices = state.apInvoices.map((r) =>
        r.ref === ref && r.status === 'On hold' ? { ...r, status: 'Ready for payment' } : r
      )
      return { ...state, apInvoices, ...pushAudit(`AP ${ref}`, 'RELEASE_HOLD') }
    }

    case 'AP_ADD': {
      const { vendor, amount, po, due } = action.payload
      if (!vendor?.trim()) return state
      const refNum = String(Date.now()).slice(-4)
      const ref = `INV-NEW-${refNum}`
      const row = { ref, vendor: vendor.trim(), po: po?.trim() || '—', amount: amount?.trim() || '₦0', match: '2-way', status: 'Ready for payment', due: due?.trim() || '—' }
      return { ...state, apInvoices: [row, ...state.apInvoices], ...pushAudit(ref, 'CREATE') }
    }

    case 'AR_ADD': {
      const { customer, amount, terms } = action.payload
      if (!customer?.trim()) return state
      const refNum = String(Date.now()).slice(-4)
      const ref = `SI-NEW-${refNum}`
      const row = { ref, customer: customer.trim(), amount: amount?.trim() || '₦0', terms: terms?.trim() || 'Net 30', dunning: 'None', status: 'Outstanding' }
      return { ...state, arInvoices: [row, ...state.arInvoices], ...pushAudit(ref, 'CREATE') }
    }

    case 'BANK_ADD': {
      const { desc, bank, book, source } = action.payload
      if (!desc?.trim()) return state
      const row = { source: source?.trim() || 'Manual', date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), desc: desc.trim(), bank: bank?.trim() || '₦0', book: book?.trim() || '—', match: 'Suggested' }
      return { ...state, bankLines: [row, ...state.bankLines], ...pushAudit(desc.trim(), 'BANK_IMPORT') }
    }

    case 'FA_ADD': {
      const { name, cost, method, life } = action.payload
      if (!name?.trim()) return state
      const tagNum = String(Date.now()).slice(-4)
      const tag = `FA-NEW-${tagNum}`
      const row = { tag, name: name.trim(), cost: cost?.trim() || '₦0', method: method?.trim() || 'Straight-Line', life: life?.trim() || '5 yrs', nbv: cost?.trim() || '₦0', disposal: '—' }
      return { ...state, fixedAssets: [row, ...state.fixedAssets], ...pushAudit(tag, 'CREATE_ASSET') }
    }

    case 'EXPENSE_ADD': {
      const { staff, amount, card } = action.payload
      if (!staff?.trim()) return state
      const idNum = String(Date.now()).slice(-4)
      const id = `EC-NEW-${idNum}`
      const row = { id, staff: staff.trim(), amount: amount?.trim() || '₦0', card: card?.trim() || '—', ocr: 'Manual', stage: 'Manager approval' }
      return { ...state, expenseClaims: [row, ...state.expenseClaims], ...pushAudit(id, 'SUBMIT') }
    }

    case 'CASH_ADD': {
      const { pool, available, forecast7d } = action.payload
      if (!pool?.trim()) return state
      const row = { pool: pool.trim(), available: available?.trim() || '₦0', forecast7d: forecast7d?.trim() || '—', alert: 'OK' }
      return { ...state, cashPositions: [...state.cashPositions, row], ...pushAudit(pool.trim(), 'ADD_POOL') }
    }

    case 'PROJECT_ADD': {
      const { code, name, budget, revenue } = action.payload
      if (!name?.trim()) return state
      const codeVal = code?.trim() || `PRJ-${String(Date.now()).slice(-5)}`
      const row = { code: codeVal, name: name.trim(), budget: budget?.trim() || '₦0', actual: '₦0', revenue: revenue?.trim() || '—', margin: 'TBD' }
      return { ...state, projectAccounting: [...state.projectAccounting, row], ...pushAudit(codeVal, 'CREATE_PROJECT') }
    }

    case 'TAX_ADD': {
      const { period, jurisdiction, basis, liability } = action.payload
      if (!period?.trim()) return state
      const row = { period: period.trim(), jurisdiction: jurisdiction?.trim() || '—', basis: basis?.trim() || '—', liability: liability?.trim() || '₦0', filing: 'Draft' }
      return { ...state, taxRuns: [...state.taxRuns, row], ...pushAudit(period.trim(), 'CREATE_TAX') }
    }

    case 'FX_ADD': {
      const { pair, rate, source } = action.payload
      if (!pair?.trim()) return state
      const updated = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
      const row = { pair: pair.trim(), rate: rate?.trim() || '0', source: source?.trim() || 'Manual', updated, unrealized: '—' }
      return { ...state, fxRates: [...state.fxRates, row], ...pushAudit(pair.trim(), 'ADD_RATE') }
    }

    case 'AR_RECORD_PAYMENT': {
      const ref = action.payload.ref
      const arInvoices = state.arInvoices.map((r) =>
        r.ref === ref ? { ...r, status: 'Paid', dunning: 'Cleared' } : r
      )
      return { ...state, arInvoices, ...pushAudit(`AR ${ref}`, 'PAYMENT_APPLIED') }
    }

    case 'AR_REMINDER': {
      const ref = action.payload.ref
      const arInvoices = state.arInvoices.map((r) =>
        r.ref === ref
          ? { ...r, dunning: r.dunning === 'None' ? 'Reminder sent' : '2nd reminder sent' }
          : r
      )
      return { ...state, arInvoices, ...pushAudit(`AR ${ref}`, 'DUNNING') }
    }

    case 'BANK_CONFIRM_MATCH': {
      const i = action.payload.index
      const bankLines = state.bankLines.map((row, idx) =>
        idx === i && row.match === 'Suggested' ? { ...row, match: 'Auto', book: row.bank } : row
      )
      return { ...state, bankLines, ...pushAudit(`Bank line ${i}`, 'CONFIRM_MATCH') }
    }

    case 'FX_REFRESH': {
      const fxRates = state.fxRates.map((r) => {
        const num = parseFloat(String(r.rate).replace(/,/g, ''))
        if (Number.isNaN(num)) return r
        const jitter = 1 + (Math.random() * 0.006 - 0.003)
        const next = (num * jitter).toFixed(2)
        const parts = next.split('.')
        const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        const updated = new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
        return { ...r, rate: `${int}.${parts[1]}`, updated }
      })
      return { ...state, fxRates, ...pushAudit('FX table', 'REFRESH_RATES') }
    }

    case 'DEPRECIATE_ASSET': {
      const tag = action.payload.tag
      const fixedAssets = state.fixedAssets.map((a) => {
        if (a.tag !== tag || a.disposal !== '—') return a
        const m = a.nbv.match(/[\d.]+/)
        if (!m) return a
        const val = Math.max(0, parseFloat(m[0]) - 0.12)
        const newNbv = a.nbv.includes('M') ? `₦${val.toFixed(1)}M` : a.nbv
        return { ...a, nbv: newNbv }
      })
      return { ...state, fixedAssets, ...pushAudit(`FA ${tag}`, 'DEPRECIATION_RUN') }
    }

    case 'EXPENSE_APPROVE': {
      const id = action.payload.id
      const expenseClaims = state.expenseClaims.map((r) =>
        r.id === id ? { ...r, stage: 'Posted to payroll batch' } : r
      )
      return { ...state, expenseClaims, ...pushAudit(id, 'APPROVE') }
    }

    case 'EXPENSE_REJECT': {
      const id = action.payload.id
      const expenseClaims = state.expenseClaims.map((r) =>
        r.id === id ? { ...r, stage: 'Rejected — returned to staff' } : r
      )
      return { ...state, expenseClaims, ...pushAudit(id, 'REJECT') }
    }

    case 'PROJECT_SET_ACTUAL': {
      const { code, actual } = action.payload
      const projectAccounting = state.projectAccounting.map((p) =>
        p.code === code ? { ...p, actual: actual.trim() || p.actual } : p
      )
      return { ...state, projectAccounting, ...pushAudit(code, 'UPDATE_ACTUAL') }
    }

    case 'TAX_FILE': {
      const i = action.payload.index
      const taxRuns = state.taxRuns.map((r, idx) =>
        idx === i ? { ...r, filing: 'Filed — confirmation pending' } : r
      )
      return { ...state, taxRuns, ...pushAudit(`Tax ${state.taxRuns[i]?.period}`, 'FILE') }
    }

    case 'ENTITY_MAP': {
      const code = action.payload.code
      const consolidationEntities = state.consolidationEntities.map((e) =>
        e.code === code ? { ...e, status: 'Mapped' } : e
      )
      return { ...state, consolidationEntities, ...pushAudit(code, 'MAP_ENTITY') }
    }

    case 'IFRS_RUN': {
      const id = action.payload.id
      const lastRun = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      const ifrsTemplates = state.ifrsTemplates.map((t) => (t.id === id ? { ...t, lastRun } : t))
      return { ...state, ifrsTemplates, ...pushAudit(id, 'RUN_REPORT') }
    }

    case 'BUDGET_ADD': {
      const { name, type, variance, owner } = action.payload
      if (!name?.trim()) return state
      const budgetScenarios = [
        ...state.budgetScenarios,
        {
          name: name.trim(),
          type: type || 'Scenario',
          variance: variance?.trim() || 'TBD',
          owner: owner?.trim() || 'FP&A',
        },
      ]
      return { ...state, budgetScenarios, ...pushAudit(name.trim(), 'ADD_SCENARIO') }
    }

    case 'REPORT_REFRESH': {
      const i = action.payload.index
      const financialReports = state.financialReports.map((r, idx) =>
        idx === i ? { ...r, status: 'Ready', period: `Refreshed ${new Date().toLocaleDateString('en-GB')}` } : r
      )
      return { ...state, financialReports, ...pushAudit(state.financialReports[i]?.name, 'REFRESH') }
    }

    case 'TREASURY_ADD': {
      const { desc, amount, dept, status } = action.payload
      if (!desc?.trim()) return state
      const ref = `TXN-2026-${Date.now().toString(36).slice(-5).toUpperCase()}`
      const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      const row = {
        ref,
        desc: desc.trim(),
        dept: dept?.trim() || 'Finance',
        amount: amount?.trim() || '₦0',
        date,
        status: status || 'pending',
      }
      return {
        ...state,
        treasuryTransactions: [row, ...state.treasuryTransactions],
        ...pushAudit(ref, 'CREATE_TXN'),
      }
    }

    case 'TREASURY_SET_STATUS': {
      const { ref, status } = action.payload
      const treasuryTransactions = state.treasuryTransactions.map((t) =>
        t.ref === ref ? { ...t, status } : t
      )
      return { ...state, treasuryTransactions, ...pushAudit(ref, `STATUS_${status}`.toUpperCase()) }
    }

    case 'UTILISATION_SET': {
      const pct = Math.min(100, Math.max(0, Number(action.payload.pct) || 0))
      return { ...state, budgetUtilisationPct: pct, ...pushAudit('Budget utilisation', 'ADJUST_VIEW') }
    }

    case 'SPEND_SET': {
      const { month, amount } = action.payload
      const spendByMonth = state.spendByMonth.map((r) => (r.month === month ? { ...r, amount: Number(amount) || 0 } : r))
      return { ...state, spendByMonth, ...pushAudit(`Spend ${month}`, 'EDIT') }
    }

    case 'KPI_NUDGE': {
      const financeKpis = state.financeKpis.map((k) => {
        if (k.key !== 'Burn rate') return k
        const base = 118 + Math.round(Math.random() * 6 - 3)
        return { ...k, value: `₦${base}M / mo` }
      })
      return { ...state, financeKpis, ...pushAudit('KPI engine', 'RECALC') }
    }

    case 'API_PING': {
      const i = action.payload.index
      const ok = Math.random() > 0.08
      const lastPing = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      const apiIntegrations = state.apiIntegrations.map((r, idx) =>
        idx === i ? { ...r, ok, lastPing } : r
      )
      return { ...state, apiIntegrations, ...pushAudit(state.apiIntegrations[i]?.system, 'HEALTHCHECK') }
    }

    case 'CASH_SIMULATE': {
      const cashPositions = state.cashPositions.map((c, idx) => {
        if (idx !== 0) return c
        return {
          ...c,
          forecast7d: '₦268M (min) — after sim',
          alert: 'Review',
        }
      })
      return { ...state, cashPositions, ...pushAudit('Cash pool GTB', 'SIMULATE') }
    }

    default:
      return state
  }
}

const FinanceContext = createContext(null)

export function FinanceProvider({ children }) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(financeReducer, undefined, loadStoredState)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  const meta = useMemo(
    () => ({ email: user?.email, initials: user?.initials || 'ME' }),
    [user?.email, user?.initials]
  )

  const api = useMemo(() => {
    const run = (type, payload, msg) => {
      dispatch({ type, payload, meta })
      if (msg) toast.success(msg)
    }
    return {
      reset: () => {
        dispatch({ type: 'RESET' })
        toast.success('Finance module reset to defaults')
      },
      addJournal: (desc, lines) => {
        if (!String(desc || '').trim()) {
          toast.error('Enter a journal description')
          return
        }
        run('ADD_JOURNAL', { desc, lines }, 'Journal draft saved')
      },
      postJournal: (id) => {
        const j = stateRef.current.journals.find((x) => x.id === id)
        if (!j || j.status !== 'Draft') {
          toast.error('Only draft journals can be posted')
          return
        }
        run('POST_JOURNAL', { id }, 'Journal posted to GL')
      },
      updateCoaBalance: (code, balance) => run('UPDATE_COA_BALANCE', { code, balance }, 'COA balance updated'),
      apSchedulePayment: (ref) => run('AP_SCHEDULE_PAYMENT', { ref }, 'Payment scheduled'),
      apHold: (ref) => run('AP_HOLD', { ref }, 'Invoice on hold'),
      apRelease: (ref) => run('AP_RELEASE', { ref }, 'Hold released'),
      apAdd: (payload) => { if (!String(payload?.vendor || '').trim()) { toast.error('Enter vendor name'); return } run('AP_ADD', payload, 'Invoice added') },
      arRecordPayment: (ref) => run('AR_RECORD_PAYMENT', { ref }, 'Payment recorded'),
      arReminder: (ref) => run('AR_REMINDER', { ref }, 'Reminder logged'),
      arAdd: (payload) => { if (!String(payload?.customer || '').trim()) { toast.error('Enter customer name'); return } run('AR_ADD', payload, 'Invoice raised') },
      bankConfirmMatch: (index) => run('BANK_CONFIRM_MATCH', { index }, 'Match confirmed'),
      bankAdd: (payload) => { if (!String(payload?.desc || '').trim()) { toast.error('Enter description'); return } run('BANK_ADD', payload, 'Bank line added') },
      fxRefresh: () => run('FX_REFRESH', {}, 'FX rates refreshed'),
      fxAdd: (payload) => { if (!String(payload?.pair || '').trim()) { toast.error('Enter currency pair'); return } run('FX_ADD', payload, 'Rate added') },
      depreciateAsset: (tag) => run('DEPRECIATE_ASSET', { tag }, 'Depreciation run posted'),
      faAdd: (payload) => { if (!String(payload?.name || '').trim()) { toast.error('Enter asset name'); return } run('FA_ADD', payload, 'Asset added') },
      expenseApprove: (id) => run('EXPENSE_APPROVE', { id }, 'Claim approved'),
      expenseReject: (id) => run('EXPENSE_REJECT', { id }, 'Claim rejected'),
      expenseAdd: (payload) => { if (!String(payload?.staff || '').trim()) { toast.error('Enter staff name'); return } run('EXPENSE_ADD', payload, 'Claim submitted') },
      cashAdd: (payload) => { if (!String(payload?.pool || '').trim()) { toast.error('Enter pool name'); return } run('CASH_ADD', payload, 'Cash pool added') },
      projectSetActual: (code, actual) => run('PROJECT_SET_ACTUAL', { code, actual }, 'Project actual updated'),
      projectAdd: (payload) => { if (!String(payload?.name || '').trim()) { toast.error('Enter project name'); return } run('PROJECT_ADD', payload, 'Project added') },
      taxFile: (index) => run('TAX_FILE', { index }, 'Filing submitted'),
      taxAdd: (payload) => { if (!String(payload?.period || '').trim()) { toast.error('Enter period'); return } run('TAX_ADD', payload, 'Tax run added') },
      entityMap: (code) => run('ENTITY_MAP', { code }, 'Entity mapping completed'),
      ifrsRun: (id) => run('IFRS_RUN', { id }, 'Report run queued'),
      budgetAdd: (payload) => run('BUDGET_ADD', payload, 'Scenario added'),
      reportRefresh: (index) => run('REPORT_REFRESH', { index }, 'Report refreshed'),
      treasuryAdd: (payload) => {
        if (!String(payload?.desc || '').trim()) {
          toast.error('Enter a description')
          return
        }
        run('TREASURY_ADD', payload, 'Treasury line added')
      },
      treasurySetStatus: (ref, status) => run('TREASURY_SET_STATUS', { ref, status }, 'Status updated'),
      utilisationSet: (pct) => run('UTILISATION_SET', { pct }),
      spendSet: (month, amount) => run('SPEND_SET', { month, amount }),
      kpiNudge: () => run('KPI_NUDGE', {}, 'KPIs recalculated'),
      apiPing: (index) => {
        dispatch({ type: 'API_PING', payload: { index }, meta })
        toast.success('Connectivity check complete')
      },
      cashSimulate: () => run('CASH_SIMULATE', {}, 'Forecast simulation applied'),
      exportPack: () => toast.success('Export pack generated (browser download simulated)'),
    }
  }, [meta])

  const value = useMemo(() => ({ state, ...api }), [state, api])

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used under FinanceProvider')
  return ctx
}
