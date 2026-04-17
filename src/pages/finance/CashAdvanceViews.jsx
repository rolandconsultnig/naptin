import { useState } from 'react'
import useFetch from '../../hooks/useFetch'
import useMutation from '../../hooks/useMutation'
import { financeApi } from '../../services/financeService'
import {
  Wallet, Plus, CheckCircle2, XCircle, Banknote, FileText, Clock, AlertTriangle,
  ChevronDown, ChevronUp, ReceiptText, Users, TrendingUp, BarChart2, ArrowRight,
  RefreshCw, Eye,
} from 'lucide-react'

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    draft:              'bg-slate-100 text-slate-600',
    pending_approval:   'bg-amber-100 text-amber-700',
    approved:           'bg-blue-100 text-blue-700',
    disbursed:          'bg-indigo-100 text-indigo-700',
    retired:            'bg-purple-100 text-purple-700',
    settled:            'bg-emerald-100 text-emerald-700',
    rejected:           'bg-red-100 text-red-700',
    cancelled:          'bg-slate-100 text-slate-500',
  }
  const label = {
    draft: 'Draft', pending_approval: 'Pending Approval', approved: 'Approved',
    disbursed: 'Disbursed (Open)', retired: 'Retired', settled: 'Settled',
    rejected: 'Rejected', cancelled: 'Cancelled',
  }
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {label[status] || status}
    </span>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, color = 'text-slate-700', bg = 'bg-slate-50' }) {
  return (
    <div className={`${bg} rounded-2xl border border-slate-100 px-4 py-4 flex items-start gap-3`}>
      <div className={`mt-0.5 ${color}`}><Icon size={20} /></div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      </div>
    </div>
  )
}

function fmt(n) {
  if (n == null) return '—'
  return `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
}

const CATEGORIES = ['travel', 'supplies', 'meals', 'accommodation', 'repairs', 'other']

// ─── New Advance Request Form ─────────────────────────────────────────────────
function NewAdvanceForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    employeeId: '', employeeName: '', departmentCode: '', purpose: '',
    projectCode: '', expectedAmount: '', proposedRetirementDate: '',
  })
  const { run, loading } = useMutation(financeApi.createCashAdvance, {
    onSuccess: (data) => { onSuccess(data); onClose() },
    successMsg: `Cash Advance ${form.employeeId} submitted`,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const submit = (e) => {
    e.preventDefault()
    run({ ...form, expectedAmount: parseFloat(form.expectedAmount) })
  }
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800">New Cash Advance Request</h3>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-xs">Employee ID *</label>
              <input className="input-sm" required value={form.employeeId} onChange={e => set('employeeId', e.target.value)} placeholder="EMP-001" />
            </div>
            <div>
              <label className="label-xs">Employee Name *</label>
              <input className="input-sm" required value={form.employeeName} onChange={e => set('employeeName', e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label className="label-xs">Department Code *</label>
              <input className="input-sm" required value={form.departmentCode} onChange={e => set('departmentCode', e.target.value)} placeholder="FIN / OPS / HR" />
            </div>
            <div>
              <label className="label-xs">Project Code</label>
              <input className="input-sm" value={form.projectCode} onChange={e => set('projectCode', e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div>
            <label className="label-xs">Purpose *</label>
            <textarea className="input-sm w-full" rows={2} required value={form.purpose} onChange={e => set('purpose', e.target.value)} placeholder="Describe the business purpose in detail…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-xs">Expected Amount (₦) *</label>
              <input className="input-sm" type="number" min="1" step="0.01" required value={form.expectedAmount} onChange={e => set('expectedAmount', e.target.value)} />
            </div>
            <div>
              <label className="label-xs">Proposed Retirement Date *</label>
              <input className="input-sm" type="date" required value={form.proposedRetirementDate} onChange={e => set('proposedRetirementDate', e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary text-sm">
              {loading ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Retire Advance Form ──────────────────────────────────────────────────────
function RetireForm({ advance, onClose, onSuccess }) {
  const [lines, setLines] = useState([
    { expenseDate: '', vendorName: '', category: 'supplies', description: '', amount: '', taxAmount: '0', receiptRef: '' },
  ])
  const [retirementNotes, setRetirementNotes] = useState('')
  const { run, loading } = useMutation(financeApi.retireCashAdvance, {
    onSuccess: (data) => { onSuccess(data); onClose() },
    successMsg: 'Advance retired — pending settlement',
  })

  const addLine = () => setLines(l => [...l, { expenseDate: '', vendorName: '', category: 'supplies', description: '', amount: '', taxAmount: '0', receiptRef: '' }])
  const removeLine = (i) => setLines(l => l.filter((_, idx) => idx !== i))
  const setLine = (i, k, v) => setLines(l => l.map((r, idx) => idx === i ? { ...r, [k]: v } : r))

  const total = lines.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0)
  const variance = total - advance.disbursedAmount

  const submit = (e) => {
    e.preventDefault()
    run(advance.id, {
      retiredBy: advance.employeeName,
      retirementNotes,
      expenseLines: lines.map(l => ({
        ...l, amount: parseFloat(l.amount), taxAmount: parseFloat(l.taxAmount) || 0,
      })),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-bold text-slate-800">Retire Advance — {advance.voucherId}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Disbursed: {fmt(advance.disbursedAmount)}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><XCircle size={18} /></button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {lines.map((line, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2 bg-slate-50/50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600">Expense #{i + 1}</span>
                {lines.length > 1 && (
                  <button type="button" onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1">
                    <XCircle size={13} /> Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="label-xs">Date *</label>
                  <input className="input-sm" type="date" required value={line.expenseDate} onChange={e => setLine(i, 'expenseDate', e.target.value)} />
                </div>
                <div>
                  <label className="label-xs">Vendor / Payee *</label>
                  <input className="input-sm" required value={line.vendorName} onChange={e => setLine(i, 'vendorName', e.target.value)} />
                </div>
                <div>
                  <label className="label-xs">Category *</label>
                  <select className="input-sm" value={line.category} onChange={e => setLine(i, 'category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="label-xs">Description *</label>
                  <input className="input-sm w-full" required value={line.description} onChange={e => setLine(i, 'description', e.target.value)} />
                </div>
                <div>
                  <label className="label-xs">Amount (₦) *</label>
                  <input className="input-sm" type="number" min="0.01" step="0.01" required value={line.amount} onChange={e => setLine(i, 'amount', e.target.value)} />
                </div>
                <div>
                  <label className="label-xs">Tax Amount (₦)</label>
                  <input className="input-sm" type="number" min="0" step="0.01" value={line.taxAmount} onChange={e => setLine(i, 'taxAmount', e.target.value)} />
                </div>
                <div>
                  <label className="label-xs">Receipt Ref</label>
                  <input className="input-sm" value={line.receiptRef} onChange={e => setLine(i, 'receiptRef', e.target.value)} placeholder="e.g. RCT-001" />
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={addLine} className="flex items-center gap-1 text-xs text-[#006838] font-semibold hover:underline">
            <Plus size={13} /> Add Expense Line
          </button>

          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-sm">
            <span className="text-slate-600">Total Actual Spend:</span>
            <span className="font-bold text-slate-800">{fmt(total)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Variance (vs Disbursed):</span>
            <span className={`font-bold ${variance > 0 ? 'text-red-600' : variance < 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {variance > 0 ? `+${fmt(variance)} (overspent)` : variance < 0 ? `${fmt(variance)} (underspent)` : 'Exact match'}
            </span>
          </div>

          <div>
            <label className="label-xs">Retirement Notes</label>
            <textarea className="input-sm w-full" rows={2} value={retirementNotes} onChange={e => setRetirementNotes(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary text-sm">
              {loading ? 'Submitting…' : 'Submit Retirement Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Settle Form ──────────────────────────────────────────────────────────────
function SettleForm({ advance, onClose, onSuccess }) {
  const variance = advance.variance || 0
  const defaultMethod = variance < 0 ? 'cash_return' : variance > 0 ? 'reimbursement' : 'cash_return'
  const [form, setForm] = useState({
    settledBy: 'Finance Controller',
    settlementMethod: defaultMethod,
    cashReturned: variance < 0 ? Math.abs(variance) : 0,
    reimbursementAmount: variance > 0 ? variance : 0,
    payrollDeductionAmount: 0,
    payrollDeductionRef: '',
    financeNotes: '',
  })
  const { run, loading } = useMutation(financeApi.settleCashAdvance, {
    onSuccess: (data) => { onSuccess(data); onClose() },
    successMsg: 'Advance settled & closed',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const submit = (e) => {
    e.preventDefault()
    run(advance.id, {
      ...form,
      cashReturned: parseFloat(form.cashReturned) || 0,
      reimbursementAmount: parseFloat(form.reimbursementAmount) || 0,
      payrollDeductionAmount: parseFloat(form.payrollDeductionAmount) || 0,
    })
  }
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800">Settle Advance — {advance.voucherId}</h3>
        <div className="bg-slate-50 rounded-xl p-3 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Disbursed:</span><span className="font-semibold">{fmt(advance.disbursedAmount)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Actual Spent:</span><span className="font-semibold">{fmt(advance.actualAmount)}</span></div>
          <div className="flex justify-between">
            <span className="text-slate-500">Variance:</span>
            <span className={`font-bold ${variance > 0 ? 'text-red-600' : variance < 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{fmt(variance)}</span>
          </div>
        </div>
        {variance < 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            <strong>Employee owes back:</strong> {fmt(Math.abs(variance))} — collect cash or schedule salary deduction.
          </div>
        )}
        {variance > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
            <strong>Company owes employee:</strong> {fmt(variance)} — trigger reimbursement payment.
          </div>
        )}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label-xs">Settlement Method *</label>
            <select className="input-sm w-full" value={form.settlementMethod} onChange={e => set('settlementMethod', e.target.value)}>
              <option value="cash_return">Cash Return by Employee</option>
              <option value="salary_deduction">Salary Deduction</option>
              <option value="reimbursement">Reimburse Employee</option>
              <option value="combined">Combined</option>
            </select>
          </div>
          {(form.settlementMethod === 'cash_return' || form.settlementMethod === 'combined') && (
            <div>
              <label className="label-xs">Cash Returned (₦)</label>
              <input className="input-sm" type="number" min="0" step="0.01" value={form.cashReturned} onChange={e => set('cashReturned', e.target.value)} />
            </div>
          )}
          {(form.settlementMethod === 'salary_deduction' || form.settlementMethod === 'combined') && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label-xs">Payroll Deduction (₦)</label>
                <input className="input-sm" type="number" min="0" step="0.01" value={form.payrollDeductionAmount} onChange={e => set('payrollDeductionAmount', e.target.value)} />
              </div>
              <div>
                <label className="label-xs">Payroll Ref</label>
                <input className="input-sm" value={form.payrollDeductionRef} onChange={e => set('payrollDeductionRef', e.target.value)} />
              </div>
            </div>
          )}
          {(form.settlementMethod === 'reimbursement' || form.settlementMethod === 'combined') && (
            <div>
              <label className="label-xs">Reimbursement Amount (₦)</label>
              <input className="input-sm" type="number" min="0" step="0.01" value={form.reimbursementAmount} onChange={e => set('reimbursementAmount', e.target.value)} />
            </div>
          )}
          <div>
            <label className="label-xs">Settled By</label>
            <input className="input-sm" value={form.settledBy} onChange={e => set('settledBy', e.target.value)} />
          </div>
          <div>
            <label className="label-xs">Finance Notes</label>
            <textarea className="input-sm w-full" rows={2} value={form.financeNotes} onChange={e => set('financeNotes', e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary text-sm">
              {loading ? 'Settling…' : 'Finalise Settlement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Advance Detail Row (expandable) ─────────────────────────────────────────
function AdvanceRow({ adv, onRefresh }) {
  const [open, setOpen] = useState(false)
  const [showRetire, setShowRetire] = useState(false)
  const [showSettle, setShowSettle] = useState(false)

  const { run: approveManager, loading: appMgrLoading } = useMutation(financeApi.approveManagerCashAdvance, {
    onSuccess: onRefresh, successMsg: 'Manager approval recorded',
  })
  const { run: approveFinance, loading: appFinLoading } = useMutation(financeApi.approveFinanceCashAdvance, {
    onSuccess: onRefresh, successMsg: 'Finance approval recorded',
  })
  const { run: disburse, loading: disLoading } = useMutation(financeApi.disburseCashAdvance, {
    onSuccess: onRefresh, successMsg: 'Cash issued — advance is now Open',
  })
  const { run: reject, loading: rejLoading } = useMutation(financeApi.rejectCashAdvance, {
    onSuccess: onRefresh, successMsg: 'Advance rejected',
  })

  const isOverdue = adv.status === 'disbursed' && adv.proposedRetirementDate && new Date(adv.proposedRetirementDate) < new Date()

  return (
    <>
      <tr className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${isOverdue ? 'bg-red-50/30' : ''}`}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setOpen(o => !o)} className="text-slate-400 hover:text-slate-700">
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <span className="text-xs font-bold text-[#006838]">{adv.voucherId}</span>
            {isOverdue && <AlertTriangle size={13} className="text-red-500" title="Overdue" />}
          </div>
        </td>
        <td className="px-4 py-3 text-xs text-slate-700">{adv.employeeName}</td>
        <td className="px-4 py-3 text-xs text-slate-500">{adv.departmentCode}</td>
        <td className="px-4 py-3 text-xs text-slate-600 max-w-[200px] truncate" title={adv.purpose}>{adv.purpose}</td>
        <td className="px-4 py-3 text-xs font-semibold text-slate-800">{fmt(adv.expectedAmount)}</td>
        <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(adv.proposedRetirementDate)}</td>
        <td className="px-4 py-3"><StatusBadge status={adv.status} /></td>
        <td className="px-4 py-3">
          <div className="flex gap-1 flex-wrap">
            {adv.status === 'pending_approval' && (
              <button disabled={appMgrLoading} onClick={() => approveManager(adv.id, { approvedBy: 'Dept Manager' })}
                className="text-[11px] font-bold text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg hover:bg-emerald-50 transition-colors">
                ✓ Mgr Approve
              </button>
            )}
            {adv.status === 'approved' && !adv.approvedByFinance && (
              <button disabled={appFinLoading} onClick={() => approveFinance(adv.id, { approvedBy: 'Finance Controller' })}
                className="text-[11px] font-bold text-blue-700 border border-blue-200 px-2 py-0.5 rounded-lg hover:bg-blue-50 transition-colors">
                ✓ Finance Approve
              </button>
            )}
            {adv.status === 'approved' && adv.approvedByFinance && (
              <button disabled={disLoading}
                onClick={() => disburse(adv.id, { disbursedBy: 'Cashier', disbursedAmount: adv.expectedAmount })}
                className="text-[11px] font-bold text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-lg hover:bg-indigo-50 transition-colors">
                <Banknote size={11} className="inline mr-0.5" /> Disburse
              </button>
            )}
            {adv.status === 'disbursed' && (
              <button onClick={() => setShowRetire(true)}
                className="text-[11px] font-bold text-purple-700 border border-purple-200 px-2 py-0.5 rounded-lg hover:bg-purple-50 transition-colors">
                <ReceiptText size={11} className="inline mr-0.5" /> Retire
              </button>
            )}
            {adv.status === 'retired' && (
              <button onClick={() => setShowSettle(true)}
                className="text-[11px] font-bold text-[#006838] border border-green-200 px-2 py-0.5 rounded-lg hover:bg-green-50 transition-colors">
                <CheckCircle2 size={11} className="inline mr-0.5" /> Settle
              </button>
            )}
            {['pending_approval', 'approved'].includes(adv.status) && (
              <button disabled={rejLoading}
                onClick={() => {
                  const reason = window.prompt('Rejection reason:')
                  if (reason) reject(adv.id, { reason, rejectedBy: 'Finance Controller' })
                }}
                className="text-[11px] font-bold text-red-600 border border-red-200 px-2 py-0.5 rounded-lg hover:bg-red-50 transition-colors">
                <XCircle size={11} className="inline mr-0.5" /> Reject
              </button>
            )}
          </div>
        </td>
      </tr>

      {open && (
        <tr className="bg-slate-50/80">
          <td colSpan={8} className="px-6 py-4">
            <AdvanceDetail advance={adv} />
          </td>
        </tr>
      )}

      {showRetire && <RetireForm advance={adv} onClose={() => setShowRetire(false)} onSuccess={onRefresh} />}
      {showSettle && <SettleForm advance={adv} onClose={() => setShowSettle(false)} onSuccess={onRefresh} />}
    </>
  )
}

// ─── Advance Detail Pane ──────────────────────────────────────────────────────
function AdvanceDetail({ advance }) {
  const { data, loading } = useFetch(() => financeApi.getCashAdvance(advance.id), [advance.id])

  if (loading || !data) return <div className="text-xs text-slate-400 py-2">Loading details…</div>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div>
          <p className="font-semibold text-slate-500 mb-1">Disbursement</p>
          <p>Disbursed By: <span className="text-slate-800">{data.disbursedBy || '—'}</span></p>
          <p>Disbursed At: <span className="text-slate-800">{fmtDate(data.disbursedAt)}</span></p>
          <p>Amount: <span className="font-bold text-slate-800">{fmt(data.disbursedAmount)}</span></p>
        </div>
        <div>
          <p className="font-semibold text-slate-500 mb-1">Retirement</p>
          <p>Retired At: <span className="text-slate-800">{fmtDate(data.retiredAt)}</span></p>
          <p>Actual Spend: <span className="font-bold text-slate-800">{fmt(data.actualAmount)}</span></p>
          <p>Variance: <span className={`font-bold ${(data.variance || 0) > 0 ? 'text-red-600' : (data.variance || 0) < 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{fmt(data.variance)}</span></p>
        </div>
        <div>
          <p className="font-semibold text-slate-500 mb-1">Settlement</p>
          <p>Settled By: <span className="text-slate-800">{data.settledBy || '—'}</span></p>
          <p>Method: <span className="text-slate-800">{data.settlementMethod || '—'}</span></p>
          <p>Settled At: <span className="text-slate-800">{fmtDate(data.settledAt)}</span></p>
        </div>
      </div>

      {data.expenseLines?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2">Expense Lines</p>
          <table className="w-full text-xs border border-slate-100 rounded-xl overflow-hidden">
            <thead className="bg-slate-100">
              <tr>
                {['Date', 'Vendor', 'Category', 'Description', 'Amount', 'Tax', 'Receipt'].map(h => (
                  <th key={h} className="text-left px-2 py-1.5 font-semibold text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.expenseLines.map(l => (
                <tr key={l.id} className="border-t border-slate-50">
                  <td className="px-2 py-1.5">{fmtDate(l.expenseDate)}</td>
                  <td className="px-2 py-1.5">{l.vendorName}</td>
                  <td className="px-2 py-1.5 capitalize">{l.category}</td>
                  <td className="px-2 py-1.5 max-w-[160px] truncate">{l.description}</td>
                  <td className="px-2 py-1.5 font-semibold">{fmt(l.amount)}</td>
                  <td className="px-2 py-1.5 text-slate-500">{fmt(l.taxAmount)}</td>
                  <td className="px-2 py-1.5 text-[#006838]">{l.receiptRef || '—'}</td>
                </tr>
              ))}
              <tr className="border-t border-slate-200 bg-slate-50 font-bold">
                <td colSpan={4} className="px-2 py-1.5 text-right text-slate-600">Total</td>
                <td className="px-2 py-1.5">{fmt(data.expenseLines.reduce((s, l) => s + l.amount, 0))}</td>
                <td className="px-2 py-1.5">{fmt(data.expenseLines.reduce((s, l) => s + l.taxAmount, 0))}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {data.auditLog?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2">Audit Trail</p>
          <div className="space-y-1">
            {data.auditLog.map(l => (
              <div key={l.id} className="flex items-start gap-2 text-xs text-slate-600">
                <ArrowRight size={11} className="mt-0.5 text-slate-300 shrink-0" />
                <span className="text-slate-400 shrink-0">{fmtDate(l.createdAt)}</span>
                <span className="capitalize font-semibold text-slate-700">{l.stage.replace(/_/g, ' ')}</span>
                <span className="capitalize">{l.action.replace(/_/g, ' ')}</span>
                <span className="text-slate-500">by {l.actor}</span>
                {l.notes && <span className="text-slate-400 italic">— {l.notes}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main CashAdvanceView ─────────────────────────────────────────────────────
export function FinanceCashAdvanceView() {
  const [showNew, setShowNew] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  const { data: dashboard, loading: dashLoading, refetch: refetchDash } = useFetch(
    () => financeApi.getCashAdvanceDashboard(), []
  )
  const { data: advances = [], loading: listLoading, refetch: refetchList } = useFetch(
    () => financeApi.getCashAdvances({ status: filterStatus }), [filterStatus]
  )

  const onRefresh = () => { refetchList(); refetchDash() }

  const statuses = ['all', 'pending_approval', 'approved', 'disbursed', 'retired', 'settled', 'rejected']

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Wallet size={20} className="text-[#006838]" /> Cash Advance Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Employee advance requests, disbursement, retirement & settlement — full lifecycle.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onRefresh} disabled={listLoading} className="btn-ghost text-sm gap-1.5">
            <RefreshCw size={13} className={listLoading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowNew(true)} className="btn-primary text-sm gap-1.5">
            <Plus size={14} /> New Request
          </button>
        </div>
      </div>

      {/* KPI Dashboard */}
      {!dashLoading && dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="Open Advances" value={dashboard.openCount} icon={Clock} color="text-indigo-600" bg="bg-indigo-50" />
          <KpiCard label="Pending Approval" value={dashboard.pendingApprovalCount} icon={FileText} color="text-amber-600" bg="bg-amber-50" />
          <KpiCard label="Disbursed" value={dashboard.disbursedCount} icon={Banknote} color="text-purple-600" bg="bg-purple-50" />
          <KpiCard label="Awaiting Settlement" value={dashboard.retiredPendingSettlement} icon={ReceiptText} color="text-blue-600" bg="bg-blue-50" />
          <KpiCard label="Open Balance" value={fmt(dashboard.totalOpenBalance)} icon={TrendingUp} color="text-[#006838]" bg="bg-emerald-50" />
          <KpiCard label="Overdue" value={dashboard.overdueCount} icon={AlertTriangle} color="text-red-600" bg="bg-red-50" />
        </div>
      )}

      {/* Department breakdown */}
      {!dashLoading && dashboard?.byDepartment?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3 flex items-center gap-2">
            <BarChart2 size={14} /> Open Advances by Department
          </p>
          <div className="flex flex-wrap gap-2">
            {dashboard.byDepartment.map(d => (
              <div key={d.department} className="bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs">
                <p className="font-bold text-slate-700">{d.department}</p>
                <p className="text-slate-500">{fmt(d.totalDisbursed)} · {d.count} advance{d.count !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policy reminder */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 space-y-1">
        <p className="font-bold flex items-center gap-1.5"><AlertTriangle size={13} /> Cash Advance Policy Reminders</p>
        <ul className="list-disc list-inside space-y-0.5 text-amber-700">
          <li>Advances must be retired within <strong>30 days</strong> of return or by the proposed retirement date.</li>
          <li>Employees with <strong>unretired advances</strong> cannot request a new advance.</li>
          <li>Original receipts are mandatory. Un-receipted amounts may be deducted from salary.</li>
          <li>Leftover cash <strong>must be returned</strong> to petty cash or deducted from next payroll.</li>
          <li>Failure to retire after D+14 will trigger <strong>automatic payroll deduction</strong>.</li>
        </ul>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${filterStatus === s ? 'bg-[#006838] text-white border-[#006838]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
            {s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Voucher ID', 'Employee', 'Dept', 'Purpose', 'Expected Amt', 'Retirement Date', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600 uppercase tracking-wide text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listLoading && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Loading advances…</td></tr>
            )}
            {!listLoading && advances.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No cash advances found.</td></tr>
            )}
            {!listLoading && advances.map(adv => (
              <AdvanceRow key={adv.id} adv={adv} onRefresh={onRefresh} />
            ))}
          </tbody>
        </table>
      </div>

      {showNew && <NewAdvanceForm onClose={() => setShowNew(false)} onSuccess={onRefresh} />}
    </div>
  )
}

export default FinanceCashAdvanceView
