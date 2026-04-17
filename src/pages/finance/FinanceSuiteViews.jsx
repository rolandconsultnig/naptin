import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useFetch from '../../hooks/useFetch'
import useMutation from '../../hooks/useMutation'
import { financeApi } from '../../services/financeService'
import { useFinance } from '../../context/FinanceContext'
import { FINANCE_RBAC_HINTS } from '../../data/financeAccounting'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import {
  Wallet, TrendingDown, Clock, CheckCircle, Plus, Download, BookOpen, Building2, Landmark,
  ArrowRightLeft, Coins, Factory, Receipt, Droplets, FolderKanban, Calculator, ShieldCheck,
  FileSearch, Layers, Target, FileBarChart, LineChart, Lock, Plug, KeyRound, RotateCcw,
  Play, RefreshCw, Link2,
} from 'lucide-react'

const TxBadge = ({ s }) => {
  const m = { paid: 'badge-green', processing: 'badge-blue', pending: 'badge-amber' }
  const l = { paid: 'Paid', processing: 'Processing', pending: 'Pending' }
  return <span className={`badge ${m[s] || 'badge-blue'}`}>{l[s] || s}</span>
}

const KpiPill = ({ k }) => {
  const ring =
    k.status === 'good' ? 'border-emerald-200 bg-emerald-50/80' : k.status === 'neutral' ? 'border-slate-200 bg-slate-50' : 'border-amber-200 bg-amber-50/80'
  return (
    <div className={`rounded-2xl border px-4 py-3 ${ring}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{k.key}</p>
      <p className="text-lg font-extrabold text-slate-900 mt-0.5">{k.value}</p>
      <p className="text-[11px] text-slate-500 mt-1">Target: {k.target}</p>
    </div>
  )
}

const btnRow = 'flex flex-wrap gap-1.5'

// Placeholder: SpendMonthEditor will need to be rewired to use API if/when spendByMonth is backend-driven
function SpendMonthEditor({ spendByMonth, onSet }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {spendByMonth.map((r) => (
        <label key={r.month} className="text-[10px] flex items-center gap-1 bg-slate-50 rounded-lg px-2 py-1 border border-slate-100">
          {r.month}
          <input
            type="number"
            className="w-14 text-xs border border-slate-200 rounded px-1 py-0.5"
            value={r.amount}
            onChange={(e) => onSet(r.month, e.target.value)}
          />
        </label>
      ))}
    </div>
  )
}

function formatNgnShort(ngn) {
  if (ngn == null || Number.isNaN(Number(ngn))) return '—'
  const n = Number(ngn)
  if (n >= 1e9) return `₦${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `₦${Math.round(n / 1e6)}M`
  if (n >= 1e3) return `₦${Math.round(n / 1e3)}K`
  return `₦${Math.round(n)}`
}

function mapBankTxnToRow(t) {
  const credit = Number(t.credit) || 0
  const debit = Number(t.debit) || 0
  const amt =
    credit > 0
      ? `₦${credit.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
      : debit > 0
        ? `₦(${debit.toLocaleString('en-NG', { maximumFractionDigits: 0 })})`
        : '—'
  return {
    ref: t.reference || `TXN-${t.id}`,
    desc: t.description,
    dept: '—',
    amount: amt,
    date: t.transactionDate,
    status: t.isReconciled ? 'paid' : 'pending',
    source: 'api',
  }
}

export function FinanceOverviewView() {
  const navigate = useNavigate()
  const { state, addJournal, treasuryAdd, treasurySetStatus, kpiNudge, utilisationSet, spendSet } = useFinance()

  const { data: apInvoices = [] } = useFetch(() => financeApi.getAPInvoices(), [])
  const { data: bankAccounts = [] } = useFetch(() => financeApi.getBankAccounts(), [])
  const primaryBankId = bankAccounts[0]?.id
  const { data: bankTransactions = [], refetch: refetchBankTx } = useFetch(
    () => (primaryBankId ? financeApi.getBankTransactions(primaryBankId) : Promise.resolve([])),
    [primaryBankId]
  )
  const { data: overview } = useFetch(() => financeApi.getOverviewSummary(), [])

  const openAp = apInvoices.filter((i) => !['Payment scheduled'].includes(i.status)).length

  const apiSpendLive = useMemo(
    () => (overview?.spendByMonth || []).some((x) => (Number(x.amount) || 0) > 0),
    [overview]
  )
  const spendChart = apiSpendLive ? overview.spendByMonth : state.spendByMonth
  const pieChart = overview?.pieBudget?.length ? overview.pieBudget : state.pieBudget
  const utilPct =
    overview?.budgetUtilisationPct != null && !Number.isNaN(Number(overview.budgetUtilisationPct))
      ? Number(overview.budgetUtilisationPct)
      : state.budgetUtilisationPct
  const openApDisplay =
    overview && typeof overview.openApCount === 'number' ? String(overview.openApCount) : String(openAp)

  const postTxnFn = useCallback(
    (body) => {
      if (!primaryBankId) return Promise.reject(new Error('No bank account in ledger — seed fin_bank_accounts'))
      return financeApi.createBankTransaction(primaryBankId, body)
    },
    [primaryBankId]
  )
  const { run: createBankTxn, loading: bankTxnSaving } = useMutation(postTxnFn, {
    onSuccess: refetchBankTx,
    successMsg: 'Bank movement recorded',
  })

  const [jDesc, setJDesc] = useState('')
  const [jLines, setJLines] = useState('2')
  const [txDesc, setTxDesc] = useState('')
  const [txAmt, setTxAmt] = useState('')
  const [txDept, setTxDept] = useState('Finance')

  const treasuryRows = useMemo(() => {
    if (primaryBankId && Array.isArray(bankTransactions)) {
      return bankTransactions.map(mapBankTxnToRow)
    }
    return state.treasuryTransactions.map((t) => ({ ...t, source: 'local' }))
  }, [primaryBankId, bankTransactions, state.treasuryTransactions])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-slate-500 max-w-xl">
          FY 2026 executive snapshot — figures and tables below reflect your working ledger from the backend API.
        </p>
        <div className="flex flex-wrap gap-2">
          {/* Reset and Export pack buttons can be implemented if API supports */}
          <button type="button" className="btn-primary text-sm" onClick={() => navigate('/app/finance/ledger')}>
            <BookOpen size={13} /> GL &amp; COA
          </button>
        </div>
      </div>

      <div className="card border-[#006838]/20 bg-[#006838]/[0.03]">
        <p className="text-xs font-bold text-slate-700 mb-2">Quick draft journal</p>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <div className="flex-1 min-w-0">
            <label className="text-[10px] font-semibold text-slate-400 uppercase">Description</label>
            <input
              className="np-input mt-0.5 w-full text-sm"
              value={jDesc}
              onChange={(e) => setJDesc(e.target.value)}
              placeholder="e.g. Accrual — training materials"
            />
          </div>
          <div className="w-24">
            <label className="text-[10px] font-semibold text-slate-400 uppercase">Lines</label>
            <input
              type="number"
              min={2}
              className="np-input mt-0.5 w-full text-sm"
              value={jLines}
              onChange={(e) => setJLines(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn-primary text-sm h-[42px] px-4"
            onClick={() => {
              addJournal(jDesc, jLines)
              setJDesc('')
            }}
          >
            <Plus size={14} /> Save draft
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total budget',
            value: overview?.totalBudgetNgn > 0 ? formatNgnShort(overview.totalBudgetNgn) : '₦3.1B',
            sub: overview?.fiscalYearLabel ? `${overview.fiscalYearLabel} · budget heads` : 'FY 2026 allocation',
            icon: Wallet,
            bg: 'bg-green-50',
            color: 'text-[#006838]',
          },
          {
            label: 'Expenditure (view)',
            value: `${utilPct}%`,
            sub:
              overview?.totalBudgetNgn > 0
                ? 'Actual + committed vs revised budget (API)'
                : 'Utilisation slider below',
            icon: TrendingDown,
            bg: 'bg-amber-50',
            color: 'text-amber-600',
          },
          {
            label: 'Liquidity (ops)',
            value: overview?.liquidityNgn > 0 ? formatNgnShort(overview.liquidityNgn) : '₦412M',
            sub: 'Active bank accounts (ledger)',
            icon: CheckCircle,
            bg: 'bg-emerald-50',
            color: 'text-emerald-600',
          },
          {
            label: 'Open AP queue',
            value: openApDisplay,
            sub: 'Invoices not paid / void',
            icon: Clock,
            bg: 'bg-purple-50',
            color: 'text-purple-600',
          },
        ].map((k, i) => (
          <div key={i} className="stat-card">
            <div className={`w-9 h-9 rounded-xl ${k.bg} ${k.color} flex items-center justify-center mb-3`}>
              <k.icon size={16} />
            </div>
            <div className="text-xl font-extrabold text-slate-900 mb-0.5">{k.value}</div>
            <div className="text-xs text-slate-400 font-medium">{k.label}</div>
            <div className="text-xs text-slate-500 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Key performance indicators</p>
          <button type="button" className="text-xs font-semibold text-[#006838] flex items-center gap-1 hover:underline" onClick={() => kpiNudge()}>
            <RefreshCw size={12} /> Recalculate
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {state.financeKpis.map((k) => (
            <KpiPill key={k.key} k={k} />
          ))}
        </div>
      </div>

      <div className="card mb-1">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <p className="text-sm font-bold text-slate-800">FY 2026 budget utilisation</p>
          <span className="text-sm font-extrabold text-slate-900">
            {state.budgetUtilisationPct}% <span className="text-xs font-medium text-slate-400">of ₦3.1B</span>
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={state.budgetUtilisationPct}
          onChange={(e) => utilisationSet(e.target.value)}
          className="w-full accent-[#006838] h-2"
        />
        <div className="bg-slate-100 rounded-full h-3 overflow-hidden mt-2">
          <div className="h-3 rounded-full bg-[#006838] transition-all duration-300" style={{ width: `${state.budgetUtilisationPct}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
          <span>₦0</span>
          <span>Adjust slider to model spend</span>
          <span>₦3.1B</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="mb-4">
            <p className="text-sm font-bold text-slate-800">Monthly expenditure</p>
            <p className="text-xs text-slate-400">₦ millions · edit values below to refresh the chart</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={spendChart} barSize={30}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip formatter={(v) => [`₦${v}M`, 'Spend']} contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="amount" fill="#006838" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {apiSpendLive ? (
            <p className="text-[10px] text-slate-400 mt-2">Monthly bars from posted expense journals (current calendar year).</p>
          ) : (
            <SpendMonthEditor spendByMonth={state.spendByMonth} onSet={spendSet} />
          )}
        </div>
        <div className="card">
          <div className="mb-4">
            <p className="text-sm font-bold text-slate-800">Budget by category</p>
            <p className="text-xs text-slate-400">
              ₦ millions{overview?.pieBudget?.length ? ' · expense budget by department (API)' : ''}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieChart} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={45}>
                {pieChart.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`₦${v}M`, 'Budget']} contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <p className="text-xs font-bold text-slate-700 mb-2">Add treasury movement</p>
        <p className="text-[10px] text-slate-400 mb-2">
          {primaryBankId
            ? `Posting to operating account: ${bankAccounts[0]?.accountName || 'primary'} (credit = cash in).`
            : 'No bank account in API — lines are saved to this browser workspace only until treasury accounts are seeded.'}
        </p>
        <div className="flex flex-col md:flex-row gap-2 md:items-end">
          <input className="np-input flex-1 text-sm" placeholder="Description" value={txDesc} onChange={(e) => setTxDesc(e.target.value)} />
          <input className="np-input w-full md:w-36 text-sm" placeholder="₦ amount" value={txAmt} onChange={(e) => setTxAmt(e.target.value)} />
          <input className="np-input w-full md:w-32 text-sm" placeholder="Dept" value={txDept} onChange={(e) => setTxDept(e.target.value)} />
          <button
            type="button"
            disabled={bankTxnSaving}
            className="btn-primary text-sm h-[42px] disabled:opacity-50"
            onClick={async () => {
              const raw = String(txAmt || '').replace(/[^\d.]/g, '')
              const credit = parseFloat(raw) || 0
              if (primaryBankId && credit > 0) {
                await createBankTxn({
                  transactionDate: new Date().toISOString().slice(0, 10),
                  description: `${txDesc.trim() || 'Cash movement'}${txDept ? ` · ${txDept}` : ''}`,
                  reference: `WEB-${Date.now().toString(36).toUpperCase()}`,
                  debit: 0,
                  credit,
                })
              } else {
                treasuryAdd({ desc: txDesc, amount: txAmt, dept: txDept })
              }
              setTxDesc('')
              setTxAmt('')
            }}
          >
            Add line
          </button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Treasury movements</h3>
          <span className="text-[10px] font-semibold text-slate-400">
            {primaryBankId ? 'Primary account (API)' : 'Live workspace (local)'}
          </span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="table-th">Reference</th>
              <th className="table-th hidden md:table-cell">Description</th>
              <th className="table-th hidden lg:table-cell">Dept</th>
              <th className="table-th">Amount</th>
              <th className="table-th hidden md:table-cell">Date</th>
              <th className="table-th">Status</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {treasuryRows.map((t, idx) => (
              <tr key={`${t.ref}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                <td className="table-td">
                  <span className="text-xs font-mono text-slate-500">{t.ref}</span>
                </td>
                <td className="table-td hidden md:table-cell text-slate-700 text-sm">{t.desc}</td>
                <td className="table-td hidden lg:table-cell text-xs text-slate-400">{t.dept}</td>
                <td className="table-td">
                  <span className="text-sm font-bold text-slate-800">{t.amount}</span>
                </td>
                <td className="table-td hidden md:table-cell text-xs text-slate-400">{t.date}</td>
                <td className="table-td">
                  <TxBadge s={t.status} />
                </td>
                <td className="table-td text-right">
                  <div className={btnRow + ' justify-end'}>
                    {t.source !== 'api' && t.status === 'pending' && (
                      <>
                        <button type="button" className="text-[10px] font-semibold text-[#006838]" onClick={() => treasurySetStatus(t.ref, 'processing')}>
                          Process
                        </button>
                        <button type="button" className="text-[10px] font-semibold text-slate-500" onClick={() => treasurySetStatus(t.ref, 'paid')}>
                          Paid
                        </button>
                      </>
                    )}
                    {t.source !== 'api' && t.status === 'processing' && (
                      <button type="button" className="text-[10px] font-semibold text-[#006838]" onClick={() => treasurySetStatus(t.ref, 'paid')}>
                        Mark paid
                      </button>
                    )}
                    {t.source === 'api' && <span className="text-[10px] text-slate-400">Reconcile in Bank view</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FinanceLedgerView() {
  const { data: chartOfAccounts = [], refetch: refetchCOA } = useFetch(() => financeApi.getChartOfAccounts(), [])
  const { data: journals = [], refetch: refetchJournals } = useFetch(() => financeApi.getJournalEntries(), [])
  const { run: createJournal } = useMutation(financeApi.createJournalEntry, { onSuccess: refetchJournals, successMsg: 'Journal draft saved' })
  const { run: postJournal } = useMutation(financeApi.postJournalEntry, { onSuccess: refetchJournals, successMsg: 'Journal posted to GL' })

  const [desc, setDesc] = useState('')

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#006838]/10 text-[#006838] flex items-center justify-center flex-shrink-0">
          <BookOpen size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">General ledger &amp; chart of accounts</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Post draft journals, adjust displayed COA balances, and review the audit trail from Overview → Audit.
          </p>
        </div>
      </div>

      <div className="card border-slate-200">
        <p className="text-xs font-bold text-slate-700 mb-2">New journal (draft)</p>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <input className="np-input flex-1 text-sm" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" />
          <button
            type="button"
            className="btn-primary text-sm h-[42px]"
            onClick={async () => {
              const withIds = chartOfAccounts.filter((a) => a.id)
              if (withIds.length < 2) {
                toast.error('Add at least two chart of accounts entries before running consolidation.')
                return
              }
              const [a, b] = withIds
              const amt = 1000
              await createJournal({
                entryDate: new Date().toISOString().slice(0, 10),
                description: (desc || 'Manual journal draft').trim(),
                preparedBy: 'portal',
                lines: [
                  { accountId: a.id, description: '', debit: amt, credit: 0 },
                  { accountId: b.id, description: '', debit: 0, credit: amt },
                ],
              })
              setDesc('')
            }}
          >
            <Plus size={14} /> Create draft
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">
          Creates a balanced two-line draft (₦1,000) between the first two COA accounts returned by the API. Adjust lines in the database or extend the form for multi-line journals.
        </p>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-800">Chart of accounts</span>
          <button type="button" className="text-xs text-[#006838] font-semibold" onClick={refetchCOA}>
            Reload from API
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="table-th text-left">Code</th>
                <th className="table-th text-left">Account</th>
                <th className="table-th text-left">Type</th>
              </tr>
            </thead>
            <tbody>
              {chartOfAccounts.map((r) => (
                <tr key={r.id || r.accountCode} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="table-td font-mono text-xs">{r.accountCode}</td>
                  <td className="table-td text-slate-800">{r.name}</td>
                  <td className="table-td text-xs text-slate-500">{r.accountType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-slate-400 px-5 py-2 border-t border-slate-50">
          Trial balance and YTD balances are available from finance reports endpoints — COA here is read-only from the API.
        </p>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <span className="text-sm font-bold text-slate-800">Journals</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="table-th text-left">Journal</th>
              <th className="table-th text-left">Date</th>
              <th className="table-th text-left">Description</th>
              <th className="table-th text-left">Lines</th>
              <th className="table-th text-left">Status</th>
              <th className="table-th text-left">Preparer</th>
              <th className="table-th text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {journals.map((j) => {
              const st = String(j.status || '').toLowerCase()
              const posted = st === 'posted'
              return (
              <tr key={j.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="table-td font-mono text-xs">{j.entryRef || j.id}</td>
                <td className="table-td text-xs text-slate-500">{j.entryDate || j.date}</td>
                <td className="table-td text-slate-700">{j.description || j.desc}</td>
                <td className="table-td text-xs">{Array.isArray(j.lines) ? j.lines.length : j.lines}</td>
                <td className="table-td">
                  <span className={`badge text-[10px] ${posted ? 'badge-green' : 'badge-amber'}`}>{posted ? 'Posted' : 'Draft'}</span>
                </td>
                <td className="table-td text-xs font-mono">{j.preparedBy || j.preparer}</td>
                <td className="table-td text-right">
                  {st === 'draft' && (
                    <button type="button" className="text-xs font-semibold text-[#006838]" onClick={async () => await postJournal(j.id)}>
                      <Play size={12} className="inline mr-0.5" /> Post
                    </button>
                  )}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FinancePayablesView() {
  const { data: apInvoices = [], loading, refetch } = useFetch(() => financeApi.getAPInvoices(), [])
  const { run: createAPInvoice } = useMutation(financeApi.createAPInvoice, { onSuccess: refetch, successMsg: 'Invoice added' })
  const { run: apSchedulePayment } = useMutation(financeApi.approveAPInvoice, { onSuccess: refetch, successMsg: 'Payment scheduled' })
  // Hold/Release would need API endpoints; placeholder for now
  const [form, setForm] = useState({ vendor: '', amount: '', po: '', due: '' })
  const [open, setOpen] = useState(false)
  const F = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const total = apInvoices.length
  const pending = apInvoices.filter((r) => !['Payment scheduled'].includes(r.status)).length
  const onHold = apInvoices.filter((r) => r.status === 'On hold').length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Accounts payable</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">Add vendor invoices, schedule payments, place holds, or release them.</p>
          </div>
        </div>
        <button type="button" className="btn-primary text-sm" onClick={() => setOpen((v) => !v)}>
          <Plus size={14} /> New invoice
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total invoices', value: total, color: 'text-slate-900' },
          { label: 'Pending / open', value: pending, color: 'text-amber-600' },
          { label: 'On hold', value: onHold, color: 'text-red-500' },
        ].map((k, i) => (
          <div key={i} className="stat-card text-center">
            <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {open && (
        <div className="card border-amber-100 bg-amber-50/40">
          <p className="text-xs font-bold text-slate-700 mb-3">Add vendor invoice</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Vendor *</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.vendor} onChange={F('vendor')} placeholder="e.g. West Africa Supplies Ltd" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Amount</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.amount} onChange={F('amount')} placeholder="₦0" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">PO Number</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.po} onChange={F('po')} placeholder="PO-2026-XXX or —" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Due date</label>
              <input type="date" className="np-input mt-0.5 w-full text-sm" value={form.due} onChange={F('due')} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" className="btn-primary text-sm" onClick={async () => { await createAPInvoice(form); setForm({ vendor: '', amount: '', po: '', due: '' }); setOpen(false) }}>
              Save invoice
            </button>
            <button type="button" className="btn-secondary text-sm" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="table-th text-left">Invoice</th>
              <th className="table-th text-left">Vendor</th>
              <th className="table-th text-left hidden md:table-cell">PO</th>
              <th className="table-th text-right">Amount</th>
              <th className="table-th text-left hidden sm:table-cell">Due</th>
              <th className="table-th text-left">Status</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apInvoices.map((r) => (
              <tr key={r.ref} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="table-td font-mono text-xs">{r.ref}</td>
                <td className="table-td text-slate-700">{r.vendor}</td>
                <td className="table-td text-xs text-slate-400 hidden md:table-cell">{r.po}</td>
                <td className="table-td text-right font-semibold">{r.amount}</td>
                <td className="table-td text-xs text-slate-400 hidden sm:table-cell">{r.due}</td>
                <td className="table-td text-xs">
                  <span className={`badge text-[10px] ${r.status === 'Payment scheduled' ? 'badge-green' : r.status === 'On hold' ? 'badge-red' : r.status.startsWith('Exception') ? 'badge-amber' : 'badge-blue'}`}>{r.status}</span>
                </td>
                <td className="table-td text-right">
                  <div className={btnRow + ' justify-end'}>
                    {(r.status === 'Ready for payment' || r.status === 'Matched') && (
                      <button type="button" className="text-[10px] font-semibold text-[#006838]" onClick={async () => await apSchedulePayment(r.ref)}>Schedule pay</button>
                    )}
                    {/* Hold/Release actions would be implemented here if API endpoints exist */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FinanceReceivablesView() {
  const { data: arInvoices = [], loading, refetch } = useFetch(() => financeApi.getARInvoices(), [])
  const { run: createARInvoice } = useMutation(financeApi.createARInvoice, { onSuccess: refetch, successMsg: 'Invoice raised' })
  const { run: recordARReceipt } = useMutation((id) => financeApi.recordARReceipt(id, {}), { onSuccess: refetch, successMsg: 'Payment recorded' })
  // Reminder would need API endpoint; placeholder for now
  const [form, setForm] = useState({ customer: '', amount: '', terms: 'Net 30' })
  const [open, setOpen] = useState(false)
  const F = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const outstanding = arInvoices.filter((r) => r.status !== 'Paid').length
  const overdue = arInvoices.filter((r) => r.status && r.status.startsWith('Overdue')).length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Landmark size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Accounts receivable</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">Raise customer invoices, record cash application or step up dunning.</p>
          </div>
        </div>
        <button type="button" className="btn-primary text-sm" onClick={() => setOpen((v) => !v)}>
          <Plus size={14} /> Raise invoice
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Outstanding', value: outstanding, color: 'text-amber-600' },
          { label: 'Overdue', value: overdue, color: 'text-red-500' },
          { label: 'Total invoices', value: arInvoices.length, color: 'text-slate-900' },
        ].map((k, i) => (
          <div key={i} className="stat-card text-center">
            <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {open && (
        <div className="card border-blue-100 bg-blue-50/30">
          <p className="text-xs font-bold text-slate-700 mb-3">Raise customer invoice</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Customer *</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.customer} onChange={F('customer')} placeholder="e.g. NERC — training" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Amount</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.amount} onChange={F('amount')} placeholder="₦0" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Terms</label>
              <select className="np-input mt-0.5 w-full text-sm" value={form.terms} onChange={F('terms')}>
                <option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Net 60</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" className="btn-primary text-sm" onClick={async () => { await createARInvoice(form); setForm({ customer: '', amount: '', terms: 'Net 30' }); setOpen(false) }}>
              Raise invoice
            </button>
            <button type="button" className="btn-secondary text-sm" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="table-th text-left">Invoice</th>
              <th className="table-th text-left">Customer</th>
              <th className="table-th text-right">Amount</th>
              <th className="table-th text-left hidden md:table-cell">Terms</th>
              <th className="table-th text-left hidden sm:table-cell">Collections</th>
              <th className="table-th text-left">Status</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {arInvoices.map((r) => (
              <tr key={r.ref} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="table-td font-mono text-xs">{r.ref}</td>
                <td className="table-td text-slate-700">{r.customer}</td>
                <td className="table-td text-right font-semibold">{r.amount}</td>
                <td className="table-td text-xs text-slate-400 hidden md:table-cell">{r.terms}</td>
                <td className="table-td text-xs hidden sm:table-cell">{r.dunning}</td>
                <td className="table-td">
                  <span className={`badge text-[10px] ${r.status === 'Paid' ? 'badge-green' : r.status && r.status.startsWith('Overdue') ? 'badge-red' : 'badge-amber'}`}>{r.status}</span>
                </td>
                <td className="table-td text-right">
                  <div className={btnRow + ' justify-end'}>
                    {r.status !== 'Paid' && (
                      <>
                        <button type="button" className="text-[10px] font-semibold text-[#006838]" onClick={async () => await recordARReceipt(r.ref)}>Pay</button>
                        {/* Reminder action would go here if API endpoint exists */}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FinanceBankView() {
  const { data: bankAccounts = [], loading, refetch } = useFetch(() => financeApi.getBankAccounts(), [])
  const { run: reconcile } = useMutation(
    (txId, journalId) => financeApi.reconcileTransaction(txId, journalId),
    { onSuccess: refetch, successMsg: 'Match confirmed' }
  )
  const [bankLines, setBankLines] = useState([])
  const [form, setForm] = useState({ desc: '', bank: '', book: '', source: '' })
  const [open, setOpen] = useState(false)
  const F = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  // Load transactions for first account
  useEffect(() => {
    if (bankAccounts.length > 0) {
      financeApi.getBankTransactions(bankAccounts[0].id).then(setBankLines).catch(() => {})
    }
  }, [bankAccounts])

  const matched = bankLines.filter((r) => r.match === 'Auto' || r.reconciled).length
  const suggested = bankLines.filter((r) => r.match === 'Suggested').length
  const unmatched = bankLines.filter((r) => !r.reconciled && r.match !== 'Auto' && r.match !== 'Suggested').length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <ArrowRightLeft size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Bank reconciliation</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">Import bank feed lines and confirm suggested matches to align books with the bank.</p>
          </div>
        </div>
        <button type="button" className="btn-primary text-sm" onClick={() => setOpen((v) => !v)}>
          <Plus size={14} /> Add bank line
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Auto-matched', value: matched, color: 'text-[#006838]' },
          { label: 'Needs confirmation', value: suggested, color: 'text-amber-600' },
          { label: 'Unmatched / other', value: unmatched, color: 'text-slate-500' },
        ].map((k, i) => (
          <div key={i} className="stat-card text-center">
            <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {open && (
        <div className="card border-emerald-100 bg-emerald-50/30">
          <p className="text-xs font-bold text-slate-700 mb-3">Add bank feed line</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Description *</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.desc} onChange={F('desc')} placeholder="e.g. NIP inflow — grant" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Source</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.source} onChange={F('source')} placeholder="e.g. GTBank feed" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Bank amount</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.bank} onChange={F('bank')} placeholder="₦0" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Book amount</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.book} onChange={F('book')} placeholder="₦0 or —" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" className="btn-primary text-sm" onClick={() => {
              setBankLines((prev) => [{ source: form.source || 'Manual', date: new Date().toLocaleDateString('en-GB'), desc: form.desc, bank: form.bank, book: form.book, match: 'Suggested' }, ...prev])
              setForm({ desc: '', bank: '', book: '', source: '' }); setOpen(false)
            }}>
              Add line
            </button>
            <button type="button" className="btn-secondary text-sm" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="table-th text-left">Source</th>
              <th className="table-th text-left">Date</th>
              <th className="table-th text-left">Description</th>
              <th className="table-th text-right">Bank</th>
              <th className="table-th text-right">Books</th>
              <th className="table-th text-left">Match</th>
              <th className="table-th text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {bankLines.map((r, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="table-td text-xs text-slate-400">{r.source}</td>
                <td className="table-td text-xs text-slate-400">{r.date}</td>
                <td className="table-td text-slate-700">{r.desc}</td>
                <td className="table-td text-right font-mono text-xs">{r.bank || r.amount}</td>
                <td className="table-td text-right font-mono text-xs">{r.book || r.balance}</td>
                <td className="table-td">
                  <span className={`badge text-[10px] ${r.reconciled || r.match === 'Auto' ? 'badge-green' : r.match === 'Suggested' ? 'badge-amber' : 'badge-blue'}`}>{r.reconciled ? 'Auto' : r.match || 'Unmatched'}</span>
                </td>
                <td className="table-td text-right">
                  {!r.reconciled && r.match === 'Suggested' && (
                    <button type="button" className="text-[10px] font-semibold text-[#006838] flex items-center gap-0.5 justify-end ml-auto" onClick={async () => await reconcile(r.id, null)}>
                      <Link2 size={12} /> Confirm
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FinanceCurrencyView() {
  // FX rates: local state only (no dedicated API endpoint yet)
  const [fxRates, setFxRates] = useState([])
  const [form, setForm] = useState({ pair: '', rate: '', source: '' })
  const [open, setOpen] = useState(false)
  const F = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const fxRefresh = () => setFxRates((prev) => prev.map((r) => {
    const num = parseFloat(String(r.rate).replace(/,/g, ''))
    if (Number.isNaN(num)) return r
    const next = (num * (1 + (Math.random() * 0.006 - 0.003))).toFixed(2)
    return { ...r, rate: next, updated: new Date().toLocaleString('en-GB', { hour12: false }) }
  }))
  const fxAdd = (payload) => {
    if (!payload.pair?.trim()) return
    setFxRates((prev) => [{ pair: payload.pair, rate: payload.rate, source: payload.source || 'Manual', updated: new Date().toLocaleString('en-GB', { hour12: false }), unrealized: '—' }, ...prev])
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center flex-shrink-0">
            <Coins size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Multi-currency</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">Manage FX rates, add new currency pairs, and run revaluations.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary text-sm flex items-center gap-1.5" onClick={() => setOpen((v) => !v)}>
            <Plus size={14} /> Add rate
          </button>
          <button type="button" className="btn-secondary text-sm flex items-center gap-1.5" onClick={() => fxRefresh()}>
            <RefreshCw size={14} /> Refresh all
          </button>
        </div>
      </div>

      {open && (
        <div className="card border-violet-100 bg-violet-50/30">
          <p className="text-xs font-bold text-slate-700 mb-3">Add currency pair</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Pair *</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.pair} onChange={F('pair')} placeholder="e.g. JPY/NGN" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Rate</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.rate} onChange={F('rate')} placeholder="e.g. 10.40" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Source</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.source} onChange={F('source')} placeholder="e.g. CBN SMIS" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" className="btn-primary text-sm" onClick={() => { fxAdd(form); setForm({ pair: '', rate: '', source: '' }); setOpen(false) }}>
              Save rate
            </button>
            {/**/}
            <button type="button" className="btn-secondary text-sm" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fxRates.length === 0 && <p className="text-xs text-slate-400 col-span-3">No FX rates added yet.</p>}
        {fxRates.map((r, i) => (
          <div key={i} className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-mono font-bold text-slate-700">{r.pair}</p>
              <span className="badge badge-blue text-[10px]">{r.source}</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{r.rate}</p>
            <p className="text-[11px] text-slate-400 mt-2">Updated {r.updated}</p>
            <p className="text-xs font-semibold text-slate-700 mt-2">Unrealised: {r.unrealized}</p>
            <button type="button" className="mt-3 text-[10px] font-semibold text-violet-600 hover:underline" onClick={() => fxRefresh()}>
              <RefreshCw size={11} className="inline mr-0.5" /> Revalue
            </button>
          </div>
        ))}
      </div>

      <div className="card bg-slate-50 border-slate-200">
        <p className="text-xs font-bold text-slate-700 mb-1">Revaluation note</p>
        <p className="text-xs text-slate-500">Click <strong>Refresh all</strong> to simulate a CBN rate pull (±0.3% jitter). In production this would invoke the CBN SMIS API and post FX revaluation journals automatically.</p>
      </div>
    </div>
  )
}

export function FinanceFixedAssetsView() {
  const { data: fixedAssets = [], loading, refetch } = useFetch(() => financeApi.getFixedAssets(), [])
  const { run: createAsset } = useMutation(financeApi.createFixedAsset, { onSuccess: refetch, successMsg: 'Asset registered' })
  const { run: runDepreciation } = useMutation(
    (period) => financeApi.depreciateAssets(period),
    { onSuccess: refetch, successMsg: 'Depreciation run posted' }
  )
  const [form, setForm] = useState({ name: '', cost: '', method: 'Straight-Line', life: '5 yrs' })
  const [open, setOpen] = useState(false)
  const F = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const active = fixedAssets.filter((a) => !a.disposal || a.disposal === '—').length
  const disposed = fixedAssets.filter((a) => a.disposal && a.disposal !== '—').length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <Factory size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Fixed asset management</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">Register assets, run depreciation postings, and track disposals.</p>
          </div>
        </div>
        <button type="button" className="btn-primary text-sm" onClick={() => setOpen((v) => !v)}>
          <Plus size={14} /> Add asset
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total assets', value: fixedAssets.length, color: 'text-slate-900' },
          { label: 'Active', value: active, color: 'text-[#006838]' },
          { label: 'Disposed', value: disposed, color: 'text-slate-400' },
        ].map((k, i) => (
          <div key={i} className="stat-card text-center">
            <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {open && (
        <div className="card border-slate-200 bg-slate-50/50">
          <p className="text-xs font-bold text-slate-700 mb-3">Register new asset</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Asset name *</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.name} onChange={F('name')} placeholder="e.g. Generator — Kano RTC" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Cost</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.cost} onChange={F('cost')} placeholder="₦0" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Depreciation method</label>
              <select className="np-input mt-0.5 w-full text-sm" value={form.method} onChange={F('method')}>
                <option>Straight-Line</option>
                <option>Double-Declining</option>
                <option>Units of Production</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Useful life</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.life} onChange={F('life')} placeholder="e.g. 10 yrs" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" className="btn-primary text-sm" onClick={async () => { await createAsset(form); setForm({ name: '', cost: '', method: 'Straight-Line', life: '5 yrs' }); setOpen(false) }}>
              Register asset
            </button>
            <button type="button" className="btn-secondary text-sm" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="table-th text-left">Tag</th>
              <th className="table-th text-left">Asset</th>
              <th className="table-th text-left hidden md:table-cell">Method</th>
              <th className="table-th text-left hidden sm:table-cell">Life</th>
              <th className="table-th text-right">Cost</th>
              <th className="table-th text-right">NBV</th>
              <th className="table-th text-left">Disposal</th>
              <th className="table-th text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {fixedAssets.map((r) => (
              <tr key={r.tag || r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="table-td font-mono text-xs">{r.tag || r.id}</td>
                <td className="table-td text-slate-700">{r.name}</td>
                <td className="table-td text-xs text-slate-400 hidden md:table-cell">{r.method || r.depreciation_method}</td>
                <td className="table-td text-xs text-slate-400 hidden sm:table-cell">{r.life || r.useful_life}</td>
                <td className="table-td text-right text-xs">{r.cost}</td>
                <td className="table-td text-right font-semibold">{r.nbv || r.net_book_value}</td>
                <td className="table-td text-xs">
                  {(!r.disposal || r.disposal === '—') ? <span className="badge badge-green text-[10px]">Active</span> : <span className="badge badge-amber text-[10px]">{r.disposal}</span>}
                </td>
                <td className="table-td text-right">
                  {(!r.disposal || r.disposal === '—') && (
                    <button type="button" className="text-[10px] font-semibold text-[#006838]" onClick={async () => await runDepreciation(r.tag || r.id)}>
                      Depreciate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FinanceExpensesView() {
  // Expense claims: local state only (no dedicated API endpoint yet)
  const [expenseClaims, setExpenseClaims] = useState([])
  const [form, setForm] = useState({ staff: '', amount: '', card: '' })
  const [open, setOpen] = useState(false)
  const F = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const expenseAdd = (payload) => {
    if (!payload.staff?.trim()) return
    const id = `EC-${Date.now().toString(36).slice(-5).toUpperCase()}`
    setExpenseClaims((prev) => [{ id, staff: payload.staff, amount: payload.amount || '₦0', card: payload.card || '—', ocr: 'Manual', stage: 'Manager approval' }, ...prev])
  }
  const expenseApprove = (id) => setExpenseClaims((prev) => prev.map((r) => r.id === id ? { ...r, stage: 'Posted to payroll batch' } : r))
  const expenseReject = (id) => setExpenseClaims((prev) => prev.map((r) => r.id === id ? { ...r, stage: 'Rejected — returned to staff' } : r))

  const pending = expenseClaims.filter((r) => !r.stage.includes('Posted') && !r.stage.includes('Rejected')).length
  const approved = expenseClaims.filter((r) => r.stage.includes('Posted')).length
  const rejected = expenseClaims.filter((r) => r.stage.includes('Rejected')).length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center flex-shrink-0">
            <Receipt size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Expense management</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">Submit expense claims, approve for payment batch, or reject back to staff.</p>
          </div>
        </div>
        <button type="button" className="btn-primary text-sm" onClick={() => setOpen((v) => !v)}>
          <Plus size={14} /> Submit claim
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending review', value: pending, color: 'text-amber-600' },
          { label: 'Approved / posted', value: approved, color: 'text-[#006838]' },
          { label: 'Rejected', value: rejected, color: 'text-red-500' },
        ].map((k, i) => (
          <div key={i} className="stat-card text-center">
            <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {open && (
        <div className="card border-orange-100 bg-orange-50/30">
          <p className="text-xs font-bold text-slate-700 mb-3">Submit expense claim</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Staff name *</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.staff} onChange={F('staff')} placeholder="e.g. Grace Okafor" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Amount</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.amount} onChange={F('amount')} placeholder="₦0" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Card / method</label>
              <select className="np-input mt-0.5 w-full text-sm" value={form.card} onChange={F('card')}>
                <option value="">Out-of-pocket</option>
                <option>Corporate</option>
                <option>Imprest</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" className="btn-primary text-sm" onClick={() => { expenseAdd(form); setForm({ staff: '', amount: '', card: '' }); setOpen(false) }}>
              Submit claim
            </button>
            <button type="button" className="btn-secondary text-sm" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="table-th text-left">Claim</th>
              <th className="table-th text-left">Staff</th>
              <th className="table-th text-right">Amount</th>
              <th className="table-th text-left hidden md:table-cell">Card</th>
              <th className="table-th text-left hidden sm:table-cell">OCR</th>
              <th className="table-th text-left">Stage</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenseClaims.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="table-td font-mono text-xs">{r.id}</td>
                <td className="table-td text-slate-700">{r.staff}</td>
                <td className="table-td text-right font-semibold">{r.amount}</td>
                <td className="table-td text-xs text-slate-400 hidden md:table-cell">{r.card || '—'}</td>
                <td className="table-td text-xs text-slate-400 hidden sm:table-cell">{r.ocr}</td>
                <td className="table-td">
                  <span className={`badge text-[10px] ${r.stage.includes('Posted') ? 'badge-green' : r.stage.includes('Rejected') ? 'badge-red' : r.stage.includes('Exception') ? 'badge-amber' : 'badge-blue'}`}>{r.stage}</span>
                </td>
                <td className="table-td text-right">
                  <div className={btnRow + ' justify-end'}>
                    {!r.stage.includes('Rejected') && !r.stage.includes('Posted') && (
                      <>
                        <button type="button" className="text-[10px] font-semibold text-[#006838]" onClick={() => expenseApprove(r.id)}>Approve</button>
                        <button type="button" className="text-[10px] font-semibold text-red-600" onClick={() => expenseReject(r.id)}>Reject</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FinanceCashFlowView() {
  const { data: cashFlowData } = useFetch(() => financeApi.getCashFlow(), [])
  const [cashPositions, setCashPositions] = useState([])
  const [form, setForm] = useState({ pool: '', available: '', forecast7d: '' })
  const [open, setOpen] = useState(false)
  const F = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const cashSimulate = () => setCashPositions((prev) => prev.map((c, idx) =>
    idx === 0 ? { ...c, forecast7d: '₦268M (min) — after sim', alert: 'Review' } : c
  ))
  const cashAdd = (payload) => {
    if (!payload.pool?.trim()) return
    setCashPositions((prev) => [...prev, { pool: payload.pool, available: payload.available || '₦0', forecast7d: payload.forecast7d || '—', alert: 'OK' }])
  }

  const alertCount = cashPositions.filter((c) => c.alert !== 'OK').length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center flex-shrink-0">
            <Droplets size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Cash &amp; liquidity</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">Monitor cash pools, add new accounts, and stress-test forecasts.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary text-sm" onClick={() => setOpen((v) => !v)}>
            <Plus size={14} /> Add pool
          </button>
          <button type="button" className="btn-secondary text-sm" onClick={() => cashSimulate()}>
            Simulate stress
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Cash pools', value: cashPositions.length, color: 'text-slate-900' },
          { label: 'Alerts', value: alertCount, color: alertCount > 0 ? 'text-amber-600' : 'text-[#006838]' },
          { label: 'Total consolidated', value: '₦412M+', color: 'text-[#006838]' },
        ].map((k, i) => (
          <div key={i} className="stat-card text-center">
            <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {open && (
        <div className="card border-cyan-100 bg-cyan-50/30">
          <p className="text-xs font-bold text-slate-700 mb-3">Add cash pool</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Pool name *</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.pool} onChange={F('pool')} placeholder="e.g. Zenith — Petty cash" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Available balance</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.available} onChange={F('available')} placeholder="₦0" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">7-day forecast</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.forecast7d} onChange={F('forecast7d')} placeholder="e.g. ₦85M (min)" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" className="btn-primary text-sm" onClick={() => { cashAdd(form); setForm({ pool: '', available: '', forecast7d: '' }); setOpen(false) }}>
              Add pool
            </button>
            <button type="button" className="btn-secondary text-sm" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cashPositions.length === 0 && <p className="text-xs text-slate-400 col-span-3">No cash pools added yet.</p>}
        {cashPositions.map((r, i) => (
          <div key={i} className="card">
            <p className="text-sm font-bold text-slate-800">{r.pool}</p>
            <p className="text-xl font-extrabold text-[#006838] mt-2">{r.available}</p>
            <p className="text-[11px] text-slate-500 mt-2">7d forecast: {r.forecast7d}</p>
            <span className={`badge text-[10px] mt-3 ${r.alert === 'OK' ? 'badge-green' : 'badge-amber'}`}>{r.alert}</span>
          </div>
        ))}
      </div>

      <div className="card bg-slate-50 border-slate-200">
        <p className="text-xs font-bold text-slate-700 mb-1">Stress simulation note</p>
        <p className="text-xs text-slate-500">Click <strong>Simulate stress</strong> to apply a 10% liquidity shock to the primary operating pool. In production this runs a Monte Carlo model against actual treasury data.</p>
      </div>
    </div>
  )
}

export function FinanceProjectsView() {
  // Project accounting: local state only (no dedicated API endpoint yet)
  const [projects, setProjects] = useState([])
  const [draft, setDraft] = useState({})
  const [form, setForm] = useState({ code: '', name: '', budget: '', revenue: '' })
  const [open, setOpen] = useState(false)
  const F = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const projectAdd = (payload) => {
    if (!payload.name?.trim()) return
    const code = payload.code?.trim() || `PRJ-${Date.now().toString(36).slice(-5).toUpperCase()}`
    setProjects((prev) => [...prev, { code, name: payload.name, budget: payload.budget || '₦0', actual: '₦0', revenue: payload.revenue || '—', margin: 'TBD' }])
  }
  const projectSetActual = (code, actual) => setProjects((prev) => prev.map((p) => p.code === code ? { ...p, actual } : p))

  const onTrack = projects.filter((p) => {
    const b = parseFloat(String(p.budget).replace(/[^0-9.]/g, ''))
    const a = parseFloat(String(p.actual).replace(/[^0-9.]/g, ''))
    return !isNaN(b) && !isNaN(a) && a <= b
  }).length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
            <FolderKanban size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Project accounting</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">Register projects, update actual costs, and monitor budget adherence.</p>
          </div>
        </div>
        <button type="button" className="btn-primary text-sm" onClick={() => setOpen((v) => !v)}>
          <Plus size={14} /> Add project
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active projects', value: projects.length, color: 'text-slate-900' },
          { label: 'Within budget', value: onTrack, color: 'text-[#006838]' },
          { label: 'Over / TBD', value: projects.length - onTrack, color: 'text-amber-600' },
        ].map((k, i) => (
          <div key={i} className="stat-card text-center">
            <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {open && (
        <div className="card border-indigo-100 bg-indigo-50/30">
          <p className="text-xs font-bold text-slate-700 mb-3">Register new project</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Project name *</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.name} onChange={F('name')} placeholder="e.g. Kaduna solar lab upgrade" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Project code</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.code} onChange={F('code')} placeholder="e.g. PRJ-2026-KD" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Budget</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.budget} onChange={F('budget')} placeholder="₦0" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Revenue / funding</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.revenue} onChange={F('revenue')} placeholder="e.g. Grant / Fee income" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" className="btn-primary text-sm" onClick={() => { projectAdd(form); setForm({ code: '', name: '', budget: '', revenue: '' }); setOpen(false) }}>
              Register project
            </button>
            <button type="button" className="btn-secondary text-sm" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="table-th text-left">Code</th>
              <th className="table-th text-left">Project</th>
              <th className="table-th text-right">Budget</th>
              <th className="table-th text-right">Actual</th>
              <th className="table-th text-left hidden md:table-cell">Revenue</th>
              <th className="table-th text-left">Margin</th>
              <th className="table-th text-right">Save</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((r) => {
              const val = draft[r.code] ?? r.actual
              return (
                <tr key={r.code} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="table-td font-mono text-xs">{r.code}</td>
                  <td className="table-td text-slate-700">{r.name}</td>
                  <td className="table-td text-right font-semibold">{r.budget}</td>
                  <td className="table-td text-right">
                    <input
                      className="w-full max-w-[100px] text-right text-xs border border-slate-200 rounded px-2 py-1"
                      value={val}
                      onChange={(e) => setDraft((d) => ({ ...d, [r.code]: e.target.value }))}
                    />
                  </td>
                  <td className="table-td text-xs text-slate-400 hidden md:table-cell">{r.revenue}</td>
                  <td className="table-td text-xs font-semibold">{r.margin}</td>
                  <td className="table-td text-right">
                    <button type="button" className="text-xs text-[#006838] font-semibold" onClick={() => projectSetActual(r.code, val)}>
                      Save
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FinanceTaxView() {
  // Tax runs: local state only (no dedicated API endpoint yet)
  const [taxRuns, setTaxRuns] = useState([])
  const [form, setForm] = useState({ period: '', jurisdiction: '', basis: '', liability: '' })
  const [open, setOpen] = useState(false)
  const F = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const taxAdd = (payload) => {
    if (!payload.period?.trim()) return
    setTaxRuns((prev) => [...prev, { period: payload.period, jurisdiction: payload.jurisdiction || '—', basis: payload.basis || '—', liability: payload.liability || '₦0', filing: 'Draft' }])
  }
  const taxFile = (i) => setTaxRuns((prev) => prev.map((r, idx) => idx === i ? { ...r, filing: 'Filed — confirmation pending' } : r))

  const filed = taxRuns.filter((r) => r.filing.startsWith('Filed')).length
  const pending = taxRuns.filter((r) => !r.filing.startsWith('Filed')).length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center flex-shrink-0">
            <Calculator size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Tax engine</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">Manage tax obligations, add new tax runs, and submit filings to FIRS.</p>
          </div>
        </div>
        <button type="button" className="btn-primary text-sm" onClick={() => setOpen((v) => !v)}>
          <Plus size={14} /> Add tax run
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total runs', value: taxRuns.length, color: 'text-slate-900' },
          { label: 'Filed', value: filed, color: 'text-[#006838]' },
          { label: 'Pending / draft', value: pending, color: 'text-amber-600' },
        ].map((k, i) => (
          <div key={i} className="stat-card text-center">
            <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {open && (
        <div className="card border-red-100 bg-red-50/30">
          <p className="text-xs font-bold text-slate-700 mb-3">Add tax run</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Period *</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.period} onChange={F('period')} placeholder="e.g. Apr 2026" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Jurisdiction</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.jurisdiction} onChange={F('jurisdiction')} placeholder="e.g. Nigeria — FIRS" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Basis</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.basis} onChange={F('basis')} placeholder="e.g. VAT 7.5%" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Liability</label>
              <input className="np-input mt-0.5 w-full text-sm" value={form.liability} onChange={F('liability')} placeholder="₦0" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" className="btn-primary text-sm" onClick={() => { taxAdd(form); setForm({ period: '', jurisdiction: '', basis: '', liability: '' }); setOpen(false) }}>
              Add tax run
            </button>
            <button type="button" className="btn-secondary text-sm" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="table-th text-left">Period</th>
              <th className="table-th text-left">Jurisdiction</th>
              <th className="table-th text-left hidden md:table-cell">Basis</th>
              <th className="table-th text-right">Liability</th>
              <th className="table-th text-left">Filing status</th>
              <th className="table-th text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {taxRuns.map((r, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="table-td text-xs font-semibold">{r.period}</td>
                <td className="table-td text-slate-700">{r.jurisdiction}</td>
                <td className="table-td text-xs text-slate-400 hidden md:table-cell">{r.basis}</td>
                <td className="table-td text-right font-semibold">{r.liability}</td>
                <td className="table-td">
                  <span className={`badge text-[10px] ${r.filing.startsWith('Filed') ? 'badge-green' : r.filing === 'Scheduled' ? 'badge-blue' : 'badge-amber'}`}>{r.filing}</span>
                </td>
                <td className="table-td text-right">
                  {!r.filing.startsWith('Filed') && (
                    <button type="button" className="text-[10px] font-semibold text-[#006838]" onClick={() => taxFile(i)}>File</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FinanceAuditComplianceView() {
  // Audit trail: local state only (no dedicated API endpoint yet)
  const [auditTrail, setAuditTrail] = useState([])
  const [consolidationEntities, setConsolidationEntities] = useState([])
  const [ifrsTemplates, setIfrsTemplates] = useState([])

  const entityMap = (code) => setConsolidationEntities((prev) => prev.map((e) => e.code === code ? { ...e, status: 'Mapped' } : e))
  const ifrsRun = (id) => {
    const lastRun = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    setIfrsTemplates((prev) => prev.map((t) => t.id === id ? { ...t, lastRun } : t))
  }
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Audit trail, consolidation &amp; standards</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">Every finance action above appends here. Map entities and run IFRS templates.</p>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
          <FileSearch size={14} /> Audit trail
        </h3>
        <div className="card p-0 overflow-hidden max-h-[320px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-100">
                <th className="table-th text-left">Timestamp</th>
                <th className="table-th text-left">User</th>
                <th className="table-th text-left">Entity</th>
                <th className="table-th text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {auditTrail.length === 0 && (
                <tr><td colSpan={4} className="table-td text-xs text-slate-400 text-center py-4">No audit entries yet.</td></tr>
              )}
              {auditTrail.map((r, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="table-td text-xs font-mono text-slate-500">{r.ts}</td>
                  <td className="table-td text-xs">{r.user}</td>
                  <td className="table-td text-xs">{r.entity}</td>
                  <td className="table-td">
                    <span className="badge badge-blue text-[10px]">{r.action}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
          <Layers size={14} /> Multi-entity consolidation
        </h3>
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="table-th text-left">Code</th>
                <th className="table-th text-left">Entity</th>
                <th className="table-th text-left">Status</th>
                <th className="table-th text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {consolidationEntities.length === 0 && (
                <tr><td colSpan={4} className="table-td text-xs text-slate-400 text-center py-4">No entities configured.</td></tr>
              )}
              {consolidationEntities.map((r) => (
                <tr key={r.code} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="table-td font-mono text-xs">{r.code}</td>
                  <td className="table-td text-slate-700">{r.name}</td>
                  <td className="table-td text-xs">{r.status}</td>
                  <td className="table-td text-right">
                    {r.status !== 'Mapped' && (
                      <button type="button" className="text-[10px] font-semibold text-[#006838]" onClick={() => entityMap(r.code)}>
                        Complete map
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">IFRS / GAAP reporting templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ifrsTemplates.length === 0 && <p className="text-xs text-slate-400 col-span-3">No IFRS templates configured.</p>}
          {ifrsTemplates.map((t) => (
            <div key={t.id} className="card">
              <p className="text-[10px] font-mono text-slate-400">{t.id}</p>
              <p className="text-sm font-bold text-slate-800 mt-1">{t.name}</p>
              <p className="text-xs text-slate-500 mt-2">Last run: {t.lastRun}</p>
              <button type="button" className="mt-3 text-xs font-semibold text-[#006838]" onClick={() => ifrsRun(t.id)}>
                Run now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function FinanceBudgetView() {
  const { data: budgetHeads = [], loading, refetch } = useFetch(() => financeApi.getBudgetHeads(), [])
  const { run: createBudget } = useMutation(financeApi.createBudgetHead, { onSuccess: refetch, successMsg: 'Scenario added' })
  const [name, setName] = useState('')
  const [variance, setVariance] = useState('')
  const [type, setType] = useState('Scenario')
  const [owner, setOwner] = useState('FP&A')

  const annual = budgetHeads.filter((b) => b.type === 'Annual').length
  const scenarios = budgetHeads.filter((b) => b.type === 'Scenario').length

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
          <Target size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Budgeting &amp; forecasting</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">Manage approved budgets and what-if scenarios for FP&A planning.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total scenarios', value: budgetHeads.length, color: 'text-slate-900' },
          { label: 'Annual budgets', value: annual, color: 'text-teal-700' },
          { label: 'What-if scenarios', value: scenarios, color: 'text-indigo-600' },
        ].map((k, i) => (
          <div key={i} className="stat-card text-center">
            <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="card border-teal-100 bg-teal-50/20">
        <p className="text-xs font-bold text-slate-700 mb-3">Add budget scenario</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase">Scenario name *</label>
            <input className="np-input mt-0.5 w-full text-sm" placeholder="e.g. FY2026 revised mid-year" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase">Type</label>
            <select className="np-input mt-0.5 w-full text-sm" value={type} onChange={(e) => setType(e.target.value)}>
              <option>Annual</option>
              <option>Scenario</option>
              <option>Rolling forecast</option>
              <option>Zero-based</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase">Variance / outcome note</label>
            <input className="np-input mt-0.5 w-full text-sm" placeholder="e.g. Surplus Q3–Q4" value={variance} onChange={(e) => setVariance(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase">Owner</label>
            <input className="np-input mt-0.5 w-full text-sm" placeholder="e.g. FP&A" value={owner} onChange={(e) => setOwner(e.target.value)} />
          </div>
        </div>
        <button
          type="button"
          className="btn-primary text-sm mt-3"
          onClick={async () => {
            await createBudget({ name, type, variance, owner })
            setName(''); setVariance(''); setType('Scenario'); setOwner('FP&A')
          }}
        >
          <Plus size={14} /> Add scenario
        </button>
      </div>

      <div className="space-y-3">
        {budgetHeads.length === 0 && <p className="text-xs text-slate-400">No budget scenarios yet.</p>}
        {budgetHeads.map((b, i) => (
          <div key={i} className="card flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-800">{b.name}</p>
              <p className="text-xs text-slate-500 mt-1">
                Type: <span className="font-semibold">{b.type}</span> · Owner: {b.owner}
              </p>
            </div>
            <span className={`badge text-[10px] ${b.type === 'Annual' ? 'badge-green' : 'badge-amber'}`}>{b.variance}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FinanceReportsView() {
  const [reports, setReports] = useState([
    { name: 'Trial Balance', period: 'Apr 2026', format: 'PDF / XLSX', status: 'Ready' },
    { name: 'Income Statement', period: 'Q1 2026', format: 'PDF', status: 'Draft' },
    { name: 'Balance Sheet', period: 'Apr 2026', format: 'PDF / XLSX', status: 'Ready' },
    { name: 'Cash Flow Statement', period: 'Apr 2026', format: 'PDF', status: 'Draft' },
  ])
  const reportRefresh = (i) => setReports((prev) => prev.map((r, idx) => idx === i ? { ...r, status: 'Ready', period: `Refreshed ${new Date().toLocaleDateString('en-GB')}` } : r))
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center flex-shrink-0">
          <FileBarChart size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Financial reporting</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">Regenerate packs to refresh timestamps and status.</p>
        </div>
      </div>
      <div className="space-y-3">
        {reports.map((r, i) => (
          <div key={i} className="card flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-800">{r.name}</p>
              <p className="text-xs text-slate-500 mt-1">
                {r.period} · {r.format}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`badge text-[10px] ${r.status === 'Ready' ? 'badge-green' : 'badge-blue'}`}>{r.status}</span>
              <button type="button" className="text-xs font-semibold text-[#006838]" onClick={() => reportRefresh(i)}>
                Refresh
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FinanceAnalyticsView() {
  const [kpis, setKpis] = useState([
    { key: 'Burn rate', value: '₦121M / mo', target: '₦115M', status: 'warn' },
    { key: 'Liquidity ratio', value: '1.42', target: '>1.2', status: 'good' },
    { key: 'AP days', value: '32 days', target: '<45', status: 'good' },
    { key: 'AR days', value: '28 days', target: '<30', status: 'good' },
    { key: 'Budget utilisation', value: '68%', target: '≤80%', status: 'good' },
  ])
  const kpiNudge = () => setKpis((prev) => prev.map((k) =>
    k.key !== 'Burn rate' ? k : { ...k, value: `₦${118 + Math.round(Math.random() * 6 - 3)}M / mo` }
  ))
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#006838]/10 text-[#006838] flex items-center justify-center flex-shrink-0">
            <LineChart size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Business intelligence</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">Same KPI engine as Overview — recalc to simulate refreshed analytics job.</p>
          </div>
        </div>
        <button type="button" className="btn-secondary text-sm flex items-center gap-1.5" onClick={() => kpiNudge()}>
          <RefreshCw size={14} /> Recalculate KPIs
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <KpiPill key={k.key} k={k} />
        ))}
      </div>
    </div>
  )
}

export function FinancePlatformView() {
  const [apiIntegrations, setApiIntegrations] = useState([
    { system: 'IPPIS (Payroll)', scope: 'Salary data sync', ok: null, lastPing: null },
    { system: 'GIFMIS (OAGF)', scope: 'Payment gateway', ok: null, lastPing: null },
    { system: 'CBN SMIS', scope: 'FX rate feed', ok: null, lastPing: null },
    { system: 'FIRS e-TaxPay', scope: 'Tax filing API', ok: null, lastPing: null },
  ])
  const apiPing = (i) => {
    const ok = Math.random() > 0.08
    const lastPing = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setApiIntegrations((prev) => prev.map((r, idx) => idx === i ? { ...r, ok, lastPing } : r))
  }
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
          <Lock size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Security &amp; integration</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">Ping each integration endpoint (simulated success / failure).</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <KeyRound size={14} /> Role-based access (summary)
        </h3>
        <ul className="space-y-2">
          {FINANCE_RBAC_HINTS.map((r, i) => (
            <li key={i} className="text-sm text-slate-700 border-l-2 border-[#006838] pl-3">
              <span className="font-semibold text-slate-900">{r.role}:</span> {r.access}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Plug size={14} /> API ecosystem
        </h3>
        <div className="space-y-3">
          {apiIntegrations.map((x, i) => (
            <div key={i} className="flex flex-wrap justify-between gap-2 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-bold text-slate-800">{x.system}</p>
                <p className="text-xs text-slate-500 mt-0.5">{x.scope}</p>
                {x.lastPing && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Last check {x.lastPing} — {x.ok ? 'OK' : 'Degraded'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {x.ok != null && <span className={`badge text-[9px] ${x.ok ? 'badge-green' : 'badge-red'}`}>{x.ok ? 'Healthy' : 'Issue'}</span>}
                <button type="button" className="text-xs font-semibold text-[#006838]" onClick={() => apiPing(i)}>
                  Ping
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card bg-slate-50 border-slate-200">
        <p className="text-sm font-bold text-slate-800">Data protection</p>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          This module stores working data in your browser only. Clear site data or use Reset module on Overview to wipe finance workspace.
        </p>
      </div>
    </div>
  )
}

