import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

function SpendMonthEditor() {
  const { state, spendSet } = useFinance()
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {state.spendByMonth.map((r) => (
        <label key={r.month} className="text-[10px] flex items-center gap-1 bg-slate-50 rounded-lg px-2 py-1 border border-slate-100">
          {r.month}
          <input
            type="number"
            className="w-14 text-xs border border-slate-200 rounded px-1 py-0.5"
            value={r.amount}
            onChange={(e) => spendSet(r.month, e.target.value)}
          />
        </label>
      ))}
    </div>
  )
}

export function FinanceOverviewView() {
  const { state, reset, exportPack, addJournal, utilisationSet, treasuryAdd, treasurySetStatus, kpiNudge } = useFinance()
  const navigate = useNavigate()
  const [jDesc, setJDesc] = useState('')
  const [jLines, setJLines] = useState('2')
  const [txDesc, setTxDesc] = useState('')
  const [txAmt, setTxAmt] = useState('')
  const [txDept, setTxDept] = useState('Finance')

  const openAp = state.apInvoices.filter((i) => !['Payment scheduled'].includes(i.status)).length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-slate-500 max-w-xl">
          FY 2026 executive snapshot — figures and tables below reflect your working ledger in this browser (saved automatically).
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary text-sm" onClick={() => reset()}>
            <RotateCcw size={13} /> Reset module
          </button>
          <button type="button" className="btn-secondary text-sm" onClick={() => exportPack()}>
            <Download size={13} /> Export pack
          </button>
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
          { label: 'Total budget', value: '₦3.1B', sub: 'FY 2026 allocation', icon: Wallet, bg: 'bg-green-50', color: 'text-[#006838]' },
          { label: 'Expenditure (view)', value: `${state.budgetUtilisationPct}%`, sub: 'Utilisation slider below', icon: TrendingDown, bg: 'bg-amber-50', color: 'text-amber-600' },
          { label: 'Liquidity (ops)', value: '₦412M', sub: 'Consolidated cash', icon: CheckCircle, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Open AP queue', value: String(openAp), sub: 'Not yet scheduled', icon: Clock, bg: 'bg-purple-50', color: 'text-purple-600' },
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
            <BarChart data={state.spendByMonth} barSize={30}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip formatter={(v) => [`₦${v}M`, 'Spend']} contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="amount" fill="#006838" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <SpendMonthEditor />
        </div>
        <div className="card">
          <div className="mb-4">
            <p className="text-sm font-bold text-slate-800">Budget by category</p>
            <p className="text-xs text-slate-400">₦ millions</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={state.pieBudget} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={45}>
                {state.pieBudget.map((entry, i) => (
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
        <div className="flex flex-col md:flex-row gap-2 md:items-end">
          <input className="np-input flex-1 text-sm" placeholder="Description" value={txDesc} onChange={(e) => setTxDesc(e.target.value)} />
          <input className="np-input w-full md:w-36 text-sm" placeholder="₦ amount" value={txAmt} onChange={(e) => setTxAmt(e.target.value)} />
          <input className="np-input w-full md:w-32 text-sm" placeholder="Dept" value={txDept} onChange={(e) => setTxDept(e.target.value)} />
          <button type="button" className="btn-primary text-sm h-[42px]" onClick={() => { treasuryAdd({ desc: txDesc, amount: txAmt, dept: txDept }); setTxDesc(''); setTxAmt('') }}>
            Add line
          </button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Treasury movements</h3>
          <span className="text-[10px] font-semibold text-slate-400">Live workspace</span>
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
            {state.treasuryTransactions.map((t) => (
              <tr key={t.ref} className="hover:bg-slate-50/50 transition-colors">
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
                    {t.status === 'pending' && (
                      <>
                        <button type="button" className="text-[10px] font-semibold text-[#006838]" onClick={() => treasurySetStatus(t.ref, 'processing')}>
                          Process
                        </button>
                        <button type="button" className="text-[10px] font-semibold text-slate-500" onClick={() => treasurySetStatus(t.ref, 'paid')}>
                          Paid
                        </button>
                      </>
                    )}
                    {t.status === 'processing' && (
                      <button type="button" className="text-[10px] font-semibold text-[#006838]" onClick={() => treasurySetStatus(t.ref, 'paid')}>
                        Mark paid
                      </button>
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

export function FinanceLedgerView() {
  const { state, addJournal, postJournal, updateCoaBalance } = useFinance()
  const [desc, setDesc] = useState('')
  const [lines, setLines] = useState('2')
  const [balances, setBalances] = useState(() =>
    Object.fromEntries(state.chartOfAccounts.map((r) => [r.code, r.balance]))
  )
  const syncBalances = () =>
    setBalances(Object.fromEntries(state.chartOfAccounts.map((r) => [r.code, r.balance])))

  useEffect(() => {
    setBalances(Object.fromEntries(state.chartOfAccounts.map((r) => [r.code, r.balance])))
  }, [state.chartOfAccounts])

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
          <input type="number" min={2} className="np-input w-24 text-sm" value={lines} onChange={(e) => setLines(e.target.value)} />
          <button type="button" className="btn-primary text-sm h-[42px]" onClick={() => { addJournal(desc, lines); setDesc('') }}>
            <Plus size={14} /> Create draft
          </button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-800">Chart of accounts</span>
          <button type="button" className="text-xs text-[#006838] font-semibold" onClick={syncBalances}>
            Reload from state
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="table-th text-left">Code</th>
                <th className="table-th text-left">Account</th>
                <th className="table-th text-left">Type</th>
                <th className="table-th text-right">Balance / YTD</th>
                <th className="table-th text-right">Save</th>
              </tr>
            </thead>
            <tbody>
              {state.chartOfAccounts.map((r) => (
                <tr key={r.code} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="table-td font-mono text-xs">{r.code}</td>
                  <td className="table-td text-slate-800">{r.name}</td>
                  <td className="table-td text-xs text-slate-500">{r.type}</td>
                  <td className="table-td text-right">
                    <input
                      className="w-full max-w-[140px] text-right text-sm border border-slate-200 rounded-lg px-2 py-1"
                      value={balances[r.code] ?? r.balance}
                      onChange={(e) => setBalances((b) => ({ ...b, [r.code]: e.target.value }))}
                    />
                  </td>
                  <td className="table-td text-right">
                    <button type="button" className="text-xs font-semibold text-[#006838]" onClick={() => updateCoaBalance(r.code, balances[r.code] ?? r.balance)}>
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            {state.journals.map((j) => (
              <tr key={j.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="table-td font-mono text-xs">{j.id}</td>
                <td className="table-td text-xs text-slate-500">{j.date}</td>
                <td className="table-td text-slate-700">{j.desc}</td>
                <td className="table-td text-xs">{j.lines}</td>
                <td className="table-td">
                  <span className={`badge text-[10px] ${j.status === 'Posted' ? 'badge-green' : 'badge-amber'}`}>{j.status}</span>
                </td>
                <td className="table-td text-xs font-mono">{j.preparer}</td>
                <td className="table-td text-right">
                  {j.status === 'Draft' && (
                    <button type="button" className="text-xs font-semibold text-[#006838]" onClick={() => postJournal(j.id)}>
                      <Play size={12} className="inline mr-0.5" /> Post
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

export function FinancePayablesView() {
  const { state, apSchedulePayment, apHold, apRelease, apAdd } = useFinance()
  const [form, setForm] = useState({ vendor: '', amount: '', po: '', due: '' })
  const [open, setOpen] = useState(false)
  const F = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const total = state.apInvoices.length
  const pending = state.apInvoices.filter((r) => !['Payment scheduled'].includes(r.status)).length
  const onHold = state.apInvoices.filter((r) => r.status === 'On hold').length

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
            <button type="button" className="btn-primary text-sm" onClick={() => { apAdd(form); setForm({ vendor: '', amount: '', po: '', due: '' }); setOpen(false) }}>
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
            {state.apInvoices.map((r) => (
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
                      <button type="button" className="text-[10px] font-semibold text-[#006838]" onClick={() => apSchedulePayment(r.ref)}>Schedule pay</button>
                    )}
                    {r.status !== 'On hold' && r.status !== 'Payment scheduled' && (
                      <button type="button" className="text-[10px] font-semibold text-slate-500" onClick={() => apHold(r.ref)}>Hold</button>
                    )}
                    {r.status === 'On hold' && (
                      <button type="button" className="text-[10px] font-semibold text-[#006838]" onClick={() => apRelease(r.ref)}>Release</button>
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

export function FinanceReceivablesView() {
  const { state, arRecordPayment, arReminder, arAdd } = useFinance()
  const [form, setForm] = useState({ customer: '', amount: '', terms: 'Net 30' })
  const [open, setOpen] = useState(false)
  const F = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const outstanding = state.arInvoices.filter((r) => r.status !== 'Paid').length
  const overdue = state.arInvoices.filter((r) => r.status.startsWith('Overdue')).length
  const total = state.arInvoices.reduce((sum, r) => {
    const n = parseFloat(String(r.amount).replace(/[₦,MK]/g, '').replace('M', 'e6').replace('K', 'e3'))
    return sum + (isNaN(n) ? 0 : n)
  }, 0)

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
          { label: 'Total invoices', value: state.arInvoices.length, color: 'text-slate-900' },
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
            <button type="button" className="btn-primary text-sm" onClick={() => { arAdd(form); setForm({ customer: '', amount: '', terms: 'Net 30' }); setOpen(false) }}>
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
            {state.arInvoices.map((r) => (
              <tr key={r.ref} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="table-td font-mono text-xs">{r.ref}</td>
                <td className="table-td text-slate-700">{r.customer}</td>
                <td className="table-td text-right font-semibold">{r.amount}</td>
                <td className="table-td text-xs text-slate-400 hidden md:table-cell">{r.terms}</td>
                <td className="table-td text-xs hidden sm:table-cell">{r.dunning}</td>
                <td className="table-td">
                  <span className={`badge text-[10px] ${r.status === 'Paid' ? 'badge-green' : r.status.startsWith('Overdue') ? 'badge-red' : 'badge-amber'}`}>{r.status}</span>
                </td>
                <td className="table-td text-right">
                  <div className={btnRow + ' justify-end'}>
                    {r.status !== 'Paid' && (
                      <>
                        <button type="button" className="text-[10px] font-semibold text-[#006838]" onClick={() => arRecordPayment(r.ref)}>Pay</button>
                        <button type="button" className="text-[10px] font-semibold text-slate-500" onClick={() => arReminder(r.ref)}>Remind</button>
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
  const { state, bankConfirmMatch, bankAdd } = useFinance()
  const [form, setForm] = useState({ desc: '', bank: '', book: '', source: '' })
  const [open, setOpen] = useState(false)
  const F = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const matched = state.bankLines.filter((r) => r.match === 'Auto').length
  const suggested = state.bankLines.filter((r) => r.match === 'Suggested').length
  const unmatched = state.bankLines.filter((r) => r.match !== 'Auto' && r.match !== 'Suggested').length

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
            <button type="button" className="btn-primary text-sm" onClick={() => { bankAdd(form); setForm({ desc: '', bank: '', book: '', source: '' }); setOpen(false) }}>
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
            {state.bankLines.map((r, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="table-td text-xs text-slate-400">{r.source}</td>
                <td className="table-td text-xs text-slate-400">{r.date}</td>
                <td className="table-td text-slate-700">{r.desc}</td>
                <td className="table-td text-right font-mono text-xs">{r.bank}</td>
                <td className="table-td text-right font-mono text-xs">{r.book}</td>
                <td className="table-td">
                  <span className={`badge text-[10px] ${r.match === 'Auto' ? 'badge-green' : r.match === 'Suggested' ? 'badge-amber' : 'badge-blue'}`}>{r.match}</span>
                </td>
                <td className="table-td text-right">
                  {r.match === 'Suggested' && (
                    <button type="button" className="text-[10px] font-semibold text-[#006838] flex items-center gap-0.5 justify-end ml-auto" onClick={() => bankConfirmMatch(i)}>
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
  const { state, fxRefresh, fxAdd } = useFinance()
  const [form, setForm] = useState({ pair: '', rate: '', source: '' })
  const [open, setOpen] = useState(false)
  const F = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

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
            <button type="button" className="btn-secondary text-sm" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {state.fxRates.map((r, i) => (
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
  const { state, depreciateAsset, faAdd } = useFinance()
  const [form, setForm] = useState({ name: '', cost: '', method: 'Straight-Line', life: '5 yrs' })
  const [open, setOpen] = useState(false)
  const F = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const active = state.fixedAssets.filter((a) => a.disposal === '—').length
  const disposed = state.fixedAssets.filter((a) => a.disposal !== '—').length

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
          { label: 'Total assets', value: state.fixedAssets.length, color: 'text-slate-900' },
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
            <button type="button" className="btn-primary text-sm" onClick={() => { faAdd(form); setForm({ name: '', cost: '', method: 'Straight-Line', life: '5 yrs' }); setOpen(false) }}>
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
            {state.fixedAssets.map((r) => (
              <tr key={r.tag} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="table-td font-mono text-xs">{r.tag}</td>
                <td className="table-td text-slate-700">{r.name}</td>
                <td className="table-td text-xs text-slate-400 hidden md:table-cell">{r.method}</td>
                <td className="table-td text-xs text-slate-400 hidden sm:table-cell">{r.life}</td>
                <td className="table-td text-right text-xs">{r.cost}</td>
                <td className="table-td text-right font-semibold">{r.nbv}</td>
                <td className="table-td text-xs">
                  {r.disposal === '—' ? <span className="badge badge-green text-[10px]">Active</span> : <span className="badge badge-amber text-[10px]">{r.disposal}</span>}
                </td>
                <td className="table-td text-right">
                  {r.disposal === '—' && parseFloat(String(r.nbv).replace(/[^\d.]/g, '')) > 0 && (
                    <button type="button" className="text-[10px] font-semibold text-[#006838]" onClick={() => depreciateAsset(r.tag)}>
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
  const { state, expenseApprove, expenseReject, expenseAdd } = useFinance()
  const [form, setForm] = useState({ staff: '', amount: '', card: '' })
  const [open, setOpen] = useState(false)
  const F = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const pending = state.expenseClaims.filter((r) => !r.stage.includes('Posted') && !r.stage.includes('Rejected')).length
  const approved = state.expenseClaims.filter((r) => r.stage.includes('Posted')).length
  const rejected = state.expenseClaims.filter((r) => r.stage.includes('Rejected')).length

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
            {state.expenseClaims.map((r) => (
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
  const { state, cashSimulate, cashAdd } = useFinance()
  const [form, setForm] = useState({ pool: '', available: '', forecast7d: '' })
  const [open, setOpen] = useState(false)
  const F = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const alertCount = state.cashPositions.filter((c) => c.alert !== 'OK').length

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
          { label: 'Cash pools', value: state.cashPositions.length, color: 'text-slate-900' },
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
        {state.cashPositions.map((r, i) => (
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
  const { state, projectSetActual, projectAdd } = useFinance()
  const [draft, setDraft] = useState({})
  const [form, setForm] = useState({ code: '', name: '', budget: '', revenue: '' })
  const [open, setOpen] = useState(false)
  const F = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const onTrack = state.projectAccounting.filter((p) => {
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
          { label: 'Active projects', value: state.projectAccounting.length, color: 'text-slate-900' },
          { label: 'Within budget', value: onTrack, color: 'text-[#006838]' },
          { label: 'Over / TBD', value: state.projectAccounting.length - onTrack, color: 'text-amber-600' },
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
            {state.projectAccounting.map((r) => {
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
  const { state, taxFile, taxAdd } = useFinance()
  const [form, setForm] = useState({ period: '', jurisdiction: '', basis: '', liability: '' })
  const [open, setOpen] = useState(false)
  const F = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const filed = state.taxRuns.filter((r) => r.filing.startsWith('Filed')).length
  const pending = state.taxRuns.filter((r) => !r.filing.startsWith('Filed')).length

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
          { label: 'Total runs', value: state.taxRuns.length, color: 'text-slate-900' },
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
            {state.taxRuns.map((r, i) => (
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
  const { state, entityMap, ifrsRun } = useFinance()
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
              {state.auditTrail.map((r, i) => (
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
              {state.consolidationEntities.map((r) => (
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
          {state.ifrsTemplates.map((t) => (
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
  const { state, budgetAdd } = useFinance()
  const [name, setName] = useState('')
  const [variance, setVariance] = useState('')
  const [type, setType] = useState('Scenario')
  const [owner, setOwner] = useState('FP&A')

  const annual = state.budgetScenarios.filter((b) => b.type === 'Annual').length
  const scenarios = state.budgetScenarios.filter((b) => b.type === 'Scenario').length

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
          { label: 'Total scenarios', value: state.budgetScenarios.length, color: 'text-slate-900' },
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
          onClick={() => {
            budgetAdd({ name, type, variance, owner })
            setName(''); setVariance(''); setType('Scenario'); setOwner('FP&A')
          }}
        >
          <Plus size={14} /> Add scenario
        </button>
      </div>

      <div className="space-y-3">
        {state.budgetScenarios.map((b, i) => (
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
  const { state, reportRefresh } = useFinance()
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
        {state.financialReports.map((r, i) => (
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
  const { state, kpiNudge } = useFinance()
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
        {state.financeKpis.map((k) => (
          <KpiPill key={k.key} k={k} />
        ))}
      </div>
    </div>
  )
}

export function FinancePlatformView() {
  const { state, apiPing } = useFinance()
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
          {state.apiIntegrations.map((x, i) => (
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

