import { useState } from 'react'
import { useNotifications } from '../../context/NotificationContext'
import { X, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, FileText, BarChart2, DollarSign, Lock, RefreshCw, Upload, Download, ShieldCheck, Users } from 'lucide-react'

/* ─── Shared Utilities ─── */
function useToast() {
  const [msg, setMsg] = useState(null)
  const show = (m) => { setMsg(m); setTimeout(() => setMsg(null), 3200) }
  return { msg, show }
}
function Toast({ msg, clear }) {
  if (!msg) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 max-w-xs">
      <span className="flex-1">{msg}</span>
      <button onClick={clear}><X size={14} /></button>
    </div>
  )
}
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button onClick={onClose}><X size={16} className="text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  )
}

/* ─── DEPT SUBMISSIONS (Budget Consolidation) ─── */
const DEPT_SUBMISSIONS_INIT = [
  { dept: 'Training', submitted: '28 Mar 2026', status: 'flagged', variance: '+45%', amount: 185000000, prevYear: 127500000, justification: null },
  { dept: 'Administration', submitted: '25 Mar 2026', status: 'submitted', variance: '+8%', amount: 42000000, prevYear: 38900000, justification: null },
  { dept: 'ICT', submitted: '26 Mar 2026', status: 'approved', variance: '+12%', amount: 31000000, prevYear: 27700000, justification: 'Migration to cloud infrastructure' },
  { dept: 'HR', submitted: null, status: 'pending', variance: null, amount: null, prevYear: 18500000, justification: null },
  { dept: 'Procurement', submitted: '27 Mar 2026', status: 'submitted', variance: '+3%', amount: 15200000, prevYear: 14700000, justification: null },
]
const TRANSFERS_INIT = [
  { id: 'VIR-2026-009', fromLine: 'IT — Training Budget', toLine: 'IT — Software Licenses', amount: 2000000, reason: 'MS365 renewal exceeds training allocation', status: 'pending', requestedBy: 'IT Head', approvalLevel: 'Finance Director' },
  { id: 'VIR-2026-008', fromLine: 'Admin — Transport', toLine: 'Admin — Vehicle Maintenance', amount: 850000, reason: 'Unexpected fleet repairs Q1', status: 'approved', requestedBy: 'Admin Head', approvalLevel: 'Finance Officer' },
  { id: 'VIR-2026-007', fromLine: 'HR — Recruitment', toLine: 'HR — Training & Dev', amount: 5500000, reason: 'Freeze on external recruitment — reallocate to capacity building', status: 'pending', requestedBy: 'HR Director', approvalLevel: 'DG + Finance Director' },
]
const BVA_LINES_INIT = [
  { dept: 'Training', approved: 185000000, committed: 12000000, actual: 128000000 },
  { dept: 'Administration', approved: 42000000, committed: 3500000, actual: 39200000 },
  { dept: 'ICT', approved: 31000000, committed: 8000000, actual: 19000000 },
  { dept: 'HR', approved: 18500000, committed: 1200000, actual: 9800000 },
  { dept: 'Maintenance', approved: 22000000, committed: 4000000, actual: 19500000 },
  { dept: 'Procurement Ops', approved: 15200000, committed: 2000000, actual: 8900000 },
]

function fmt(n) {
  if (n == null) return '—'
  return '₦' + n.toLocaleString()
}

function BudgetConsolidationTab({ toast }) {
  const [submissions, setSubmissions] = useState(DEPT_SUBMISSIONS_INIT)
  const [locked, setLocked] = useState(false)
  const [returnModal, setReturnModal] = useState(null) // dept name
  const [returnNote, setReturnNote] = useState('')
  const { addNotification } = useNotifications()

  const handleApproveAll = () => {
    if (locked) return
    setSubmissions(s => s.map(d => d.status === 'submitted' ? { ...d, status: 'approved' } : d))
    toast.show('All submitted budgets approved.')
    addNotification({ title: 'Budget Approved — All Depts', sub: 'All submitted department budgets have been approved for FY 2026.', type: 'success', link: '/app/finance', module: 'Finance' })
  }
  const handleLock = () => {
    const allDone = submissions.every(d => ['approved', 'pending'].includes(d.status) || d.status === 'approved')
    const anyPending = submissions.some(d => d.status === 'pending')
    const anyFlagged = submissions.some(d => d.status === 'flagged' || d.status === 'submitted')
    if (anyFlagged) { toast.show('Cannot lock — flagged or unreviewed submissions remain.'); return }
    setLocked(true)
    toast.show(anyPending ? 'Budget locked — HR submission pending (will carry forward at zero).' : 'Budget locked for FY 2026.')
  }
  const openReturn = (dept) => { setReturnModal(dept); setReturnNote('') }
  const handleReturn = () => {
    setSubmissions(s => s.map(d => d.dept === returnModal ? { ...d, status: 'returned', justification: null } : d))
    toast.show(`Budget returned to ${returnModal} dept with comments.`)
    setReturnModal(null)
  }
  const handleCircular = () => toast.show('Budget Circular 2026/001 published and sent to all Heads of Department.')

  const statusBadge = (s) => {
    const map = { flagged: 'bg-red-100 text-red-700', submitted: 'bg-blue-100 text-blue-700', approved: 'bg-green-100 text-green-700', pending: 'bg-slate-100 text-slate-500', returned: 'bg-amber-100 text-amber-700' }
    return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[s] || 'bg-slate-100 text-slate-500'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
  }

  return (
    <div className="space-y-4">
      {returnModal && (
        <Modal title={`Return Submission — ${returnModal}`} onClose={() => setReturnModal(null)}>
          <label className="text-[10px] font-semibold text-slate-500 uppercase">Comments / Justification Required</label>
          <textarea className="np-input w-full text-sm h-24 mt-0.5" value={returnNote} onChange={e => setReturnNote(e.target.value)} placeholder="Explain what needs to be revised..." />
          <div className="flex justify-end gap-2">
            <button className="btn-secondary text-sm" onClick={() => setReturnModal(null)}>Cancel</button>
            <button className="btn-primary text-sm" onClick={handleReturn} disabled={!returnNote.trim()}>Return Submission</button>
          </div>
        </Modal>
      )}
      <div className="flex flex-wrap gap-2">
        <button className="btn-secondary text-sm" onClick={handleCircular} disabled={locked}><FileText size={14} /> Publish Budget Circular</button>
        <button className="btn-primary text-sm" onClick={handleApproveAll} disabled={locked}>
          <CheckCircle size={14} /> Approve All Submitted
        </button>
        <button className={`text-sm px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 ${locked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`} onClick={handleLock} disabled={locked}>
          <Lock size={14} /> {locked ? 'Budget Locked' : 'Lock Budget'}
        </button>
      </div>
      {locked && <div className="bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl px-4 py-3">Budget FY 2026 is locked. No further modifications are permitted.</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="text-left border-b border-slate-100"><th className="pb-2 pr-4 text-slate-500 font-semibold">Department</th><th className="pb-2 pr-4 text-slate-500 font-semibold">FY2026 Submission</th><th className="pb-2 pr-4 text-slate-500 font-semibold">FY2025 Actual</th><th className="pb-2 pr-4 text-slate-500 font-semibold">Variance</th><th className="pb-2 pr-4 text-slate-500 font-semibold">Submitted</th><th className="pb-2 pr-4 text-slate-500 font-semibold">Status</th><th className="pb-2 text-slate-500 font-semibold">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {submissions.map((d, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-2.5 pr-4 font-semibold text-slate-800">{d.dept}</td>
                <td className="py-2.5 pr-4 text-slate-700">{fmt(d.amount)}</td>
                <td className="py-2.5 pr-4 text-slate-500">{fmt(d.prevYear)}</td>
                <td className="py-2.5 pr-4"><span className={d.variance && d.variance.startsWith('+') && parseInt(d.variance) > 20 ? 'text-red-600 font-bold' : 'text-slate-600'}>{d.variance || '—'}</span></td>
                <td className="py-2.5 pr-4 text-slate-500">{d.submitted || '—'}</td>
                <td className="py-2.5 pr-4">{statusBadge(d.status)}</td>
                <td className="py-2.5">
                  {!locked && d.status === 'flagged' && (
                    <div className="flex gap-1">
                      <button className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-md font-semibold hover:bg-green-200" onClick={() => setSubmissions(s => s.map(x => x.dept === d.dept ? { ...x, status: 'approved' } : x))}>Approve</button>
                      <button className="text-[10px] px-2 py-1 bg-amber-100 text-amber-700 rounded-md font-semibold hover:bg-amber-200" onClick={() => openReturn(d.dept)}>Return</button>
                    </div>
                  )}
                  {!locked && d.status === 'submitted' && (
                    <div className="flex gap-1">
                      <button className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-md font-semibold hover:bg-green-200" onClick={() => setSubmissions(s => s.map(x => x.dept === d.dept ? { ...x, status: 'approved' } : x))}>Approve</button>
                      <button className="text-[10px] px-2 py-1 bg-red-100 text-red-700 rounded-md font-semibold hover:bg-red-200" onClick={() => openReturn(d.dept)}>Return</button>
                    </div>
                  )}
                  {d.justification && <p className="text-[10px] text-slate-400 mt-0.5 max-w-[160px] truncate italic">{d.justification}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DB Schema */}
      <details className="mt-4">
        <summary className="text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-700">DB Schema — Budget Consolidation</summary>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: 'budget_submissions', cols: 'id, fiscal_year, department_id, submitted_by, submission_date, amount, prev_year_amount, variance_pct, status (pending|submitted|flagged|approved|returned|locked), justification, notes, reviewed_by, reviewed_at, locked_at' },
            { name: 'budget_approvals', cols: 'id, submission_id (FK), approver_role, approver_id, action (approve|return), note, actioned_at' },
            { name: 'budget_lines', cols: 'id, submission_id (FK), line_code, description, category (personnel|overhead|capital), prev_year_amount, proposed_amount, approved_amount, status' },
            { name: 'fiscal_years', cols: 'id, year, status (draft|active|locked|closed), budget_circular_ref, circular_published_at, locked_at, total_approved_amount' },
          ].map(t => (
            <div key={t.name} className="bg-slate-50 rounded-xl p-3">
              <p className="text-[11px] font-bold text-slate-700 mb-1">{t.name}</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">{t.cols}</p>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}

function VirementTab({ toast }) {
  const [transfers, setTransfers] = useState(TRANSFERS_INIT)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ fromLine: '', toLine: '', amount: '', reason: '' })
  const { addNotification } = useNotifications()

  const handleApprove = (id) => {
    setTransfers(s => s.map(t => t.id === id ? { ...t, status: 'approved' } : t))
    toast.show(`Virement ${id} approved.`)
    addNotification({ title: `Virement Approved: ${id}`, sub: `Budget virement ${id} has been approved.`, type: 'success', link: '/app/finance', module: 'Finance' })
  }
  const handleReject = (id) => {
    setTransfers(s => s.map(t => t.id === id ? { ...t, status: 'rejected' } : t))
    toast.show(`Virement ${id} rejected.`)
    addNotification({ title: `Virement Rejected: ${id}`, sub: `Budget virement ${id} was rejected and returned.`, type: 'warning', link: '/app/finance', module: 'Finance' })
  }
  const handleSubmit = () => {
    if (!form.fromLine || !form.toLine || !form.amount || !form.reason) { toast.show('All fields are required.'); return }
    const id = `VIR-2026-${String(transfers.length + 10).padStart(3, '0')}`
    setTransfers(s => [{ id, fromLine: form.fromLine, toLine: form.toLine, amount: parseFloat(form.amount), reason: form.reason, status: 'pending', requestedBy: 'Current User', approvalLevel: parseFloat(form.amount) >= 5000000 ? 'DG + Finance Director' : parseFloat(form.amount) >= 1000000 ? 'Finance Director' : 'Finance Officer' }, ...s])
    toast.show(`Virement ${id} submitted for approval.`)
    setShowModal(false); setForm({ fromLine: '', toLine: '', amount: '', reason: '' })
  }

  const statusBadge = (s) => {
    const map = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' }
    return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[s] || 'bg-slate-100 text-slate-500'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
  }

  return (
    <div className="space-y-4">
      {showModal && (
        <Modal title="New Virement Request" onClose={() => setShowModal(false)}>
          {[
            { label: 'Source Budget Line', key: 'fromLine', placeholder: 'e.g. Admin — Transport' },
            { label: 'Destination Budget Line', key: 'toLine', placeholder: 'e.g. Admin — Vehicle Maintenance' },
            { label: 'Amount (₦)', key: 'amount', placeholder: 'e.g. 1500000', type: 'number' },
            { label: 'Justification / Reason', key: 'reason', placeholder: 'Explain the business need...' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">{f.label}</label>
              <input type={f.type || 'text'} className="np-input mt-0.5 w-full text-sm" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          {form.amount && <p className="text-xs text-slate-500">Approval level: <span className="font-semibold">{parseFloat(form.amount) >= 5000000 ? 'DG + Finance Director' : parseFloat(form.amount) >= 1000000 ? 'Finance Director' : 'Finance Officer'}</span></p>}
          <div className="flex justify-end gap-2">
            <button className="btn-secondary text-sm" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary text-sm" onClick={handleSubmit}>Submit Request</button>
          </div>
        </Modal>
      )}
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500">Tiered approval: &lt;₦1M → Finance Officer · ₦1–5M → Finance Director · &gt;₦5M → DG + Finance Director</p>
        <button className="btn-primary text-sm" onClick={() => setShowModal(true)}>+ New Virement</button>
      </div>
      <div className="space-y-3">
        {transfers.map((t, i) => (
          <div key={i} className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-800">{t.id}</span>
                  {statusBadge(t.status)}
                </div>
                <p className="text-xs text-slate-600"><span className="font-semibold">From:</span> {t.fromLine} → <span className="font-semibold">To:</span> {t.toLine}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.reason}</p>
                <p className="text-[10px] text-slate-400 mt-1">Requested by: {t.requestedBy} · Approval level: {t.approvalLevel}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-slate-800">{fmt(t.amount)}</p>
                {t.status === 'pending' && (
                  <div className="flex gap-1 mt-2">
                    <button className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-md font-semibold hover:bg-green-200" onClick={() => handleApprove(t.id)}>Approve</button>
                    <button className="text-[10px] px-2 py-1 bg-red-100 text-red-700 rounded-md font-semibold hover:bg-red-200" onClick={() => handleReject(t.id)}>Reject</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <details className="mt-2">
        <summary className="text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-700">DB Schema — Budget Transfers</summary>
        <div className="mt-3 bg-slate-50 rounded-xl p-3">
          <p className="text-[11px] font-bold text-slate-700 mb-1">budget_transfers</p>
          <p className="text-[10px] text-slate-500 leading-relaxed">id, virement_ref, fiscal_year, from_budget_line_id (FK), to_budget_line_id (FK), amount, reason, requested_by (FK users), approval_level (officer|director|dg+director), status (pending|approved|rejected), approver_id (FK users), approved_at, rejected_at, comments</p>
        </div>
      </details>
    </div>
  )
}

function BvADashboardTab({ toast }) {
  const [lines] = useState(BVA_LINES_INIT)
  const [expanded, setExpanded] = useState(null)

  const getStatus = (l) => {
    const used = (l.actual + l.committed) / l.approved
    if (used >= 1.0) return 'blocked'
    if (used >= 0.9) return 'red'
    if (used >= 0.75) return 'yellow'
    return 'green'
  }
  const statusStyles = { green: 'bg-green-100 text-green-700', yellow: 'bg-amber-100 text-amber-700', red: 'bg-red-100 text-red-700', blocked: 'bg-red-600 text-white' }
  const pct = (l) => Math.min(100, Math.round((l.actual + l.committed) / l.approved * 100))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-xs">
          {[['green', 'bg-green-500', '< 75%'], ['yellow', 'bg-amber-400', '75–90%'], ['red', 'bg-red-500', '> 90%']].map(([key, color, label]) => (
            <span key={key} className="flex items-center gap-1"><span className={`w-2.5 h-2.5 rounded-full ${color}`} />{label}</span>
          ))}
        </div>
        <button className="btn-secondary text-sm" onClick={() => toast.show('BvA Report exported as PDF/Excel.')}><Download size={14} /> Export BvA Report</button>
      </div>
      <div className="space-y-2">
        {lines.map((l, i) => {
          const p = pct(l); const s = getStatus(l)
          return (
            <div key={i} className="card">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(expanded === i ? null : i)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-slate-800">{l.dept}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[s]}`}>{p}% utilized</span>
                    {s === 'red' && <span className="text-[10px] text-red-600 font-bold">⚠ Alert</span>}
                    {s === 'blocked' && <span className="text-[10px] text-red-700 font-bold">🚫 BLOCKED — Spending Halted</span>}
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${s === 'green' ? 'bg-green-500' : s === 'yellow' ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${p}%` }} />
                  </div>
                </div>
                <span className="text-slate-300">{expanded === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
              </div>
              {expanded === i && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
                  {[['Approved', fmt(l.approved), 'text-slate-700'], ['Committed', fmt(l.committed), 'text-amber-600'], ['Actual Spend', fmt(l.actual), 'text-red-600']].map(([label, val, cls]) => (
                    <div key={label}><p className={`text-sm font-bold ${cls}`}>{val}</p><p className="text-[10px] text-slate-400">{label}</p></div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CashFlowPlanTab({ toast }) {
  const [plan, setPlan] = useState([
    { month: 'April 2026', openingBalance: 284500000, expectedReceipts: 145000000, plannedCommitments: 97000000, closingBalance: 332500000, status: 'draft' },
    { month: 'May 2026', openingBalance: 332500000, expectedReceipts: 110000000, plannedCommitments: 85000000, closingBalance: 357500000, status: 'draft' },
    { month: 'June 2026', openingBalance: 357500000, expectedReceipts: 145000000, plannedCommitments: 142000000, closingBalance: 360500000, status: 'draft' },
  ])
  const [editing, setEditing] = useState(null)

  const handleUpdate = (i, key, val) => {
    setPlan(p => {
      const copy = p.map((r, idx) => idx === i ? { ...r, [key]: parseFloat(val) || 0 } : r)
      const updated = copy.map(r => ({ ...r, closingBalance: r.openingBalance + r.expectedReceipts - r.plannedCommitments }))
      return updated
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500">Cash commitment schedule — Q2 FY 2026</p>
        <button className="btn-primary text-sm" onClick={() => { setPlan(p => p.map(r => ({ ...r, status: 'submitted' }))); toast.show('Cash Flow Plan submitted to Treasury.') }}>
          <Upload size={14} /> Submit to Treasury
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="text-left border-b border-slate-100"><th className="pb-2 pr-4 text-slate-500 font-semibold">Month</th><th className="pb-2 pr-4 text-slate-500 font-semibold">Opening Bal.</th><th className="pb-2 pr-4 text-slate-500 font-semibold">Est. Receipts</th><th className="pb-2 pr-4 text-slate-500 font-semibold">Planned Commitments</th><th className="pb-2 pr-4 text-slate-500 font-semibold">Closing Bal.</th><th className="pb-2 text-slate-500 font-semibold">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {plan.map((r, i) => (
              <tr key={i}>
                <td className="py-2.5 pr-4 font-semibold text-slate-800">{r.month}</td>
                <td className="py-2.5 pr-4 text-slate-600">{fmt(r.openingBalance)}</td>
                <td className="py-2.5 pr-4">
                  {editing === i ? <input type="number" className="np-input w-28 text-xs" value={r.expectedReceipts} onChange={e => handleUpdate(i, 'expectedReceipts', e.target.value)} /> : <span className="text-slate-600">{fmt(r.expectedReceipts)}</span>}
                </td>
                <td className="py-2.5 pr-4">
                  {editing === i ? <input type="number" className="np-input w-28 text-xs" value={r.plannedCommitments} onChange={e => handleUpdate(i, 'plannedCommitments', e.target.value)} /> : <span className="text-slate-600">{fmt(r.plannedCommitments)}</span>}
                </td>
                <td className="py-2.5 pr-4 font-bold text-green-700">{fmt(r.closingBalance)}</td>
                <td className="py-2.5">
                  {editing === i
                    ? <button className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-md font-semibold" onClick={() => { setEditing(null); toast.show(`${r.month} plan updated.`) }}>Save</button>
                    : <button className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-semibold hover:bg-slate-200" onClick={() => setEditing(i)}>Edit</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const BUDGET_ROLES = [
  { role: 'Department Head', consolidation: 'Submit estimates', virement: 'Initiate', bva: 'View own dept', cashFlow: 'View' },
  { role: 'Budget Officer', consolidation: 'Review, flag, approve', virement: 'Review & route', bva: 'Full view + alert', cashFlow: 'Edit & submit' },
  { role: 'Finance Director', consolidation: 'Approve / lock', virement: 'Approve < ₦5M', bva: 'Full view + export', cashFlow: 'Approve' },
  { role: 'Director General', consolidation: 'Final lock authority', virement: 'Approve ≥ ₦5M', bva: 'View summary', cashFlow: 'View' },
  { role: 'Internal Auditor', consolidation: 'Read-only', virement: 'Read-only', bva: 'Full read-only', cashFlow: 'Read-only' },
]

function BudgetRolesTab() {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="text-left border-b border-slate-100">
            {['Role', 'Budget Consolidation', 'Virement', 'BvA Dashboard', 'Cash Flow Plan'].map(h => <th key={h} className="pb-2 pr-4 text-slate-500 font-semibold">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {BUDGET_ROLES.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-2.5 pr-4 font-semibold text-slate-800">{r.role}</td>
                <td className="py-2.5 pr-4 text-slate-600">{r.consolidation}</td>
                <td className="py-2.5 pr-4 text-slate-600">{r.virement}</td>
                <td className="py-2.5 pr-4 text-slate-600">{r.bva}</td>
                <td className="py-2.5 text-slate-600">{r.cashFlow}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { name: 'budget_submissions', cols: 'id, fiscal_year, dept_id, submitted_by, amount, prev_year_amount, variance_pct, status, justification, reviewed_by, locked_at' },
          { name: 'budget_approvals', cols: 'id, submission_id (FK), approver_role, approver_id, action, note, actioned_at' },
          { name: 'budget_lines', cols: 'id, submission_id (FK), line_code, category (personnel|overhead|capital), proposed_amount, approved_amount, status' },
          { name: 'budget_transfers', cols: 'id, virement_ref, from_line_id (FK), to_line_id (FK), amount, reason, requested_by, approval_level, status, approver_id, approved_at' },
          { name: 'fiscal_years', cols: 'id, year, status (draft|active|locked|closed), circular_ref, circular_published_at, locked_at, total_approved_amount' },
        ].map(t => (
          <div key={t.name} className="bg-slate-50 rounded-xl p-3">
            <p className="text-[11px] font-bold text-slate-700 mb-1">{t.name}</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">{t.cols}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── BUDGET WORKBENCH ─── */
export function FinanceBudgetWorkbenchView() {
  const toast = useToast()
  const TABS = ['Budget Consolidation', 'Virement / Transfers', 'BvA Dashboard', 'Cash Flow Plan', 'Roles & Schema']
  const [activeTab, setActiveTab] = useState(0)
  return (
    <div className="space-y-5">
      <Toast msg={toast.msg} clear={() => toast.show(null)} />
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
          <BarChart2 size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Budget Unit Workbench</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">Bottom-up budget consolidation, virement management, Budget-vs-Actual tracking, and quarterly cash flow planning.</p>
        </div>
      </div>
      <div className="flex gap-1 flex-wrap border-b border-slate-100 pb-0">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} className={`text-xs px-3 py-2 rounded-t-lg font-medium transition-colors ${activeTab === i ? 'bg-white border border-b-white border-slate-200 text-[#006838] font-semibold -mb-px z-10 relative' : 'text-slate-500 hover:text-slate-700'}`}>{t}</button>
        ))}
      </div>
      <div className="pt-1">
        {activeTab === 0 && <BudgetConsolidationTab toast={toast} />}
        {activeTab === 1 && <VirementTab toast={toast} />}
        {activeTab === 2 && <BvADashboardTab toast={toast} />}
        {activeTab === 3 && <CashFlowPlanTab toast={toast} />}
        {activeTab === 4 && <BudgetRolesTab />}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/*                  EXPENDITURE WORKBENCH                             */
/* ═══════════════════════════════════════════════════════════════════ */

const PV_INIT = [
  { id: 'PV-2026-0441', payee: 'OfficePro Nigeria Ltd', amount: 4800000, budgetLine: 'Admin — Office Equipment', status: 'pending-approval', approvalLevel: 'Finance Director', createdBy: 'Admin Dept', date: '05 Apr 2026', invoiceRef: 'INV-OP-2209' },
  { id: 'PV-2026-0440', payee: 'PHCN Abuja District', amount: 890000, budgetLine: 'Admin — Utilities', status: 'verified', approvalLevel: 'Expenditure Manager', createdBy: 'Admin Dept', date: '04 Apr 2026', invoiceRef: 'INV-PHCN-0498' },
  { id: 'PV-2026-0439', payee: 'TrainMaster Consult', amount: 7200000, budgetLine: 'Training — External Faculty', status: 'approved', approvalLevel: 'DG', createdBy: 'Training Dept', date: '03 Apr 2026', invoiceRef: 'INV-TM-1102' },
  { id: 'PV-2026-0438', payee: 'Kaduna RTC Vendors', amount: 320000, budgetLine: 'Maintenance — Supplies', status: 'paid', approvalLevel: 'Dept Head', createdBy: 'Maintenance', date: '01 Apr 2026', invoiceRef: 'INV-KDN-0771' },
]
const INVOICES_INIT = [
  { id: 'INV-2026-081', vendor: 'TechWorld Nigeria', poRef: 'PO-2026-044', poQty: 100, poUnitPrice: 500000, invoiceQty: 100, invoiceUnitPrice: 500000, grnQty: 100, matchStatus: 'matched', amount: 50000000 },
  { id: 'INV-2026-080', vendor: 'PrintQuick Ltd', poRef: 'PO-2026-041', poQty: 500, poUnitPrice: 2200, invoiceQty: 500, invoiceUnitPrice: 2450, grnQty: 500, matchStatus: 'price-mismatch', amount: 1225000 },
  { id: 'INV-2026-079', vendor: 'PowerGen Supplies', poRef: null, poQty: null, poUnitPrice: null, invoiceQty: 1, invoiceUnitPrice: 8500000, grnQty: null, matchStatus: 'no-po', amount: 8500000 },
  { id: 'INV-2026-078', vendor: 'FurniCo Abuja', poRef: 'PO-2026-039', poQty: 20, poUnitPrice: 180000, invoiceQty: 18, invoiceUnitPrice: 180000, grnQty: 20, matchStatus: 'qty-mismatch', amount: 3600000 },
]
const COMMITMENTS_INIT = [
  { id: 'PO-2026-044', vendor: 'TechWorld Nigeria', description: '100 laptops — ICT refresh', budgetLine: 'ICT — Equipment', committed: 50000000, released: 0, daysOpen: 12, status: 'active' },
  { id: 'PO-2026-043', vendor: 'GenPower Ltd', description: '3x 100kVA generators', budgetLine: 'Admin — Equipment', committed: 28500000, released: 0, daysOpen: 45, status: 'active' },
  { id: 'PO-2026-041', vendor: 'PrintQuick Ltd', description: 'Stationery bulk — Q2', budgetLine: 'Admin — Supplies', committed: 1100000, released: 0, daysOpen: 22, status: 'active' },
  { id: 'PO-2026-036', vendor: 'BuildRight Const.', description: 'RTC Renovation — Kaduna Phase 1', budgetLine: 'Capital — Infrastructure', committed: 95000000, released: 0, daysOpen: 94, status: 'aged' },
]

function PaymentVouchersTab({ toast }) {
  const [pvs, setPvs] = useState(PV_INIT)
  const [showCreate, setShowCreate] = useState(false)
  const [returnModal, setReturnModal] = useState(null)
  const [returnNote, setReturnNote] = useState('')
  const [form, setForm] = useState({ payee: '', amount: '', budgetLine: '', description: '' })
  const { addNotification } = useNotifications()

  const pvStatusBadge = (s) => {
    const map = { draft: 'bg-slate-100 text-slate-500', verified: 'bg-blue-100 text-blue-700', 'pending-approval': 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700', paid: 'bg-emerald-100 text-emerald-700', returned: 'bg-red-100 text-red-700' }
    const labels = { 'pending-approval': 'Pending Approval', draft: 'Draft', verified: 'Verified', approved: 'Approved', paid: 'Paid', returned: 'Returned' }
    return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[s] || 'bg-slate-100 text-slate-500'}`}>{labels[s] || s}</span>
  }

  const nextStatus = { draft: 'verified', verified: 'pending-approval', 'pending-approval': 'approved', approved: 'paid' }
  const nextLabel = { draft: 'Verify PV', verified: 'Route for Approval', 'pending-approval': 'Approve', approved: 'Process Payment' }

  const handleAdvance = (id) => {
    setPvs(p => p.map(v => v.id === id ? { ...v, status: nextStatus[v.status] } : v))
    const pv = pvs.find(v => v.id === id)
    const msgs = { draft: `PV ${id} verified.`, verified: `PV ${id} routed for approval.`, 'pending-approval': `PV ${id} approved.`, approved: `PV ${id} — payment processed and posted to GL.` }
    toast.show(msgs[pv.status])
  }

  const handleReturn = () => {
    setPvs(p => p.map(v => v.id === returnModal ? { ...v, status: 'returned' } : v))
    toast.show(`PV ${returnModal} returned with comments.`)
    setReturnModal(null)
  }

  const handleCreate = () => {
    if (!form.payee || !form.amount || !form.budgetLine) { toast.show('Payee, amount and budget line are required.'); return }
    const id = `PV-2026-${String(pvs.length + 442).padStart(4, '0')}`
    const amt = parseFloat(form.amount)
    const level = amt >= 10000000 ? 'DG' : amt >= 5000000 ? 'Finance Director' : 'Expenditure Manager'
    setPvs(p => [{ id, payee: form.payee, amount: amt, budgetLine: form.budgetLine, status: 'draft', approvalLevel: level, createdBy: 'Current User', date: new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }), invoiceRef: form.description || '—' }, ...p])
    toast.show(`${id} created.`)
    addNotification({ title: `Payment Voucher Created: ${id}`, sub: `PV for ${form.payee} — ₦${Number(amt).toLocaleString()} submitted as draft (${level} approval required).`, type: 'task', link: '/app/finance', module: 'Finance' })
    setShowCreate(false); setForm({ payee: '', amount: '', budgetLine: '', description: '' })
  }

  return (
    <div className="space-y-4">
      {showCreate && (
        <Modal title="Create Payment Voucher" onClose={() => setShowCreate(false)}>
          {[
            { label: 'Payee Name', key: 'payee', placeholder: 'Vendor or supplier name' },
            { label: 'Amount (₦)', key: 'amount', placeholder: 'e.g. 2500000', type: 'number' },
            { label: 'Budget Line', key: 'budgetLine', placeholder: 'e.g. Admin — Office Equipment' },
            { label: 'Invoice Reference / Description', key: 'description', placeholder: 'e.g. INV-001 or brief description' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">{f.label}</label>
              <input type={f.type || 'text'} className="np-input mt-0.5 w-full text-sm" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          {form.amount && <p className="text-xs text-slate-500">Approval level: <span className="font-semibold">{parseFloat(form.amount) >= 10000000 ? 'DG' : parseFloat(form.amount) >= 5000000 ? 'Finance Director' : 'Expenditure Manager'}</span></p>}
          <div className="flex justify-end gap-2">
            <button className="btn-secondary text-sm" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn-primary text-sm" onClick={handleCreate}>Create PV</button>
          </div>
        </Modal>
      )}
      {returnModal && (
        <Modal title={`Return PV — ${returnModal}`} onClose={() => setReturnModal(null)}>
          <label className="text-[10px] font-semibold text-slate-500 uppercase">Return Comments</label>
          <textarea className="np-input w-full text-sm h-20 mt-0.5" value={returnNote} onChange={e => setReturnNote(e.target.value)} placeholder="Reason for return..." />
          <div className="flex justify-end gap-2">
            <button className="btn-secondary text-sm" onClick={() => setReturnModal(null)}>Cancel</button>
            <button className="btn-primary text-sm" onClick={handleReturn} disabled={!returnNote.trim()}>Return PV</button>
          </div>
        </Modal>
      )}
      <div className="flex justify-end">
        <button className="btn-primary text-sm" onClick={() => setShowCreate(true)}>+ Create PV</button>
      </div>
      <div className="space-y-3">
        {pvs.map((pv, i) => (
          <div key={i} className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-800">{pv.id}</span>
                  {pvStatusBadge(pv.status)}
                </div>
                <p className="text-xs text-slate-700"><span className="font-semibold">{pv.payee}</span> · {pv.budgetLine}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{pv.date} · Ref: {pv.invoiceRef} · Approval: {pv.approvalLevel}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-slate-800">{fmt(pv.amount)}</p>
                {nextStatus[pv.status] && (
                  <div className="flex gap-1 mt-1.5 justify-end">
                    <button className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-md font-semibold hover:bg-green-200" onClick={() => handleAdvance(pv.id)}>{nextLabel[pv.status]}</button>
                    {pv.status !== 'draft' && <button className="text-[10px] px-2 py-1 bg-red-100 text-red-700 rounded-md font-semibold hover:bg-red-200" onClick={() => { setReturnModal(pv.id); setReturnNote('') }}>Return</button>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ThreeWayMatchTab({ toast }) {
  const [invoices, setInvoices] = useState(INVOICES_INIT)
  const [resolveModal, setResolveModal] = useState(null)
  const [resolveNote, setResolveNote] = useState('')

  const matchBadge = (s) => {
    const conf = { matched: ['bg-green-100 text-green-700', 'Matched'], 'price-mismatch': ['bg-red-100 text-red-700', 'Price Mismatch'], 'qty-mismatch': ['bg-amber-100 text-amber-700', 'Qty Mismatch'], 'no-po': ['bg-slate-100 text-slate-600', 'No PO'] }
    const [cls, label] = conf[s] || ['bg-slate-100 text-slate-500', s]
    return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
  }

  const handleAutoMatch = () => {
    setInvoices(p => p.map(inv => {
      if (inv.matchStatus !== 'matched') return inv
      return inv
    }))
    toast.show('Auto-match complete. 1 matched, 3 require manual review.')
  }

  const handleRelease = (id) => {
    setInvoices(p => p.map(inv => inv.id === id ? { ...inv, matchStatus: 'released' } : inv))
    toast.show(`${id} released to payment processing.`)
  }

  const handleResolve = () => {
    setInvoices(p => p.map(inv => inv.id === resolveModal ? { ...inv, matchStatus: 'resolved', resolveNote } : inv))
    toast.show(`Exception resolved for ${resolveModal}.`)
    setResolveModal(null); setResolveNote('')
  }

  return (
    <div className="space-y-4">
      {resolveModal && (
        <Modal title={`Resolve Exception — ${resolveModal}`} onClose={() => setResolveModal(null)}>
          <label className="text-[10px] font-semibold text-slate-500 uppercase">Resolution Note</label>
          <textarea className="np-input w-full text-sm h-20 mt-0.5" value={resolveNote} onChange={e => setResolveNote(e.target.value)} placeholder="Describe resolution action taken..." />
          <div className="flex justify-end gap-2">
            <button className="btn-secondary text-sm" onClick={() => setResolveModal(null)}>Cancel</button>
            <button className="btn-primary text-sm" onClick={handleResolve} disabled={!resolveNote.trim()}>Resolve Exception</button>
          </div>
        </Modal>
      )}
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500">PO + GRN + Invoice three-way matching. Matched invoices proceed to payment.</p>
        <button className="btn-secondary text-sm" onClick={handleAutoMatch}><RefreshCw size={14} /> Auto-Match</button>
      </div>
      <div className="space-y-3">
        {invoices.map((inv, i) => (
          <div key={i} className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-800">{inv.id}</span>
                  {matchBadge(inv.matchStatus)}
                </div>
                <p className="text-xs text-slate-700">{inv.vendor}</p>
                <div className="grid grid-cols-3 gap-3 mt-2 text-[10px] text-slate-500">
                  <span>PO Ref: <span className="font-semibold text-slate-700">{inv.poRef || '—'}</span></span>
                  <span>PO Qty: <span className="font-semibold">{inv.poQty ?? '—'}</span> · Inv: <span className="font-semibold">{inv.invoiceQty}</span> · GRN: <span className="font-semibold">{inv.grnQty ?? '—'}</span></span>
                  <span>PO Price: <span className="font-semibold">{inv.poUnitPrice ? `₦${inv.poUnitPrice.toLocaleString()}` : '—'}</span> · Inv: <span className="font-semibold">₦{inv.invoiceUnitPrice.toLocaleString()}</span></span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-slate-800">{fmt(inv.amount)}</p>
                <div className="flex gap-1 mt-1.5 justify-end">
                  {inv.matchStatus === 'matched' && <button className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-md font-semibold hover:bg-green-200" onClick={() => handleRelease(inv.id)}>Release to Payment</button>}
                  {['price-mismatch', 'qty-mismatch', 'no-po'].includes(inv.matchStatus) && <button className="text-[10px] px-2 py-1 bg-amber-100 text-amber-700 rounded-md font-semibold hover:bg-amber-200" onClick={() => { setResolveModal(inv.id); setResolveNote('') }}>Resolve Exception</button>}
                  {inv.matchStatus === 'released' && <span className="text-[10px] px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md font-semibold">Released</span>}
                  {inv.matchStatus === 'resolved' && <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-500 rounded-md font-semibold">Resolved</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CommitmentControlTab({ toast }) {
  const [commitments, setCommitments] = useState(COMMITMENTS_INIT)

  const totalCommitted = commitments.filter(c => c.status !== 'released').reduce((s, c) => s + c.committed - c.released, 0)
  const approvedBudget = 313700000

  const handleRelease = (id) => {
    setCommitments(p => p.map(c => c.id === id ? { ...c, status: 'released', released: c.committed } : c))
    toast.show(`Commitment ${id} released. Budget restored.`)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Approved Budget', value: fmt(approvedBudget), color: 'text-slate-900' },
          { label: 'Total Open Commitments', value: fmt(totalCommitted), color: 'text-amber-600' },
          { label: 'Available Balance', value: fmt(approvedBudget - totalCommitted), color: totalCommitted > approvedBudget * 0.9 ? 'text-red-600' : 'text-green-700' },
        ].map((k, i) => (
          <div key={i} className="stat-card text-center">
            <p className={`text-lg font-extrabold ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{k.label}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button className="btn-secondary text-sm" onClick={() => toast.show('Commitment Aging Report exported.')}><Download size={14} /> Aging Report</button>
      </div>
      <div className="space-y-3">
        {commitments.map((c, i) => (
          <div key={i} className={`card ${c.daysOpen > 90 ? 'border-l-4 border-l-amber-400' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-800">{c.id}</span>
                  {c.daysOpen > 90 && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Aged &gt;90 days</span>}
                  {c.status === 'released' && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">Released</span>}
                </div>
                <p className="text-xs text-slate-700"><span className="font-semibold">{c.vendor}</span> — {c.description}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{c.budgetLine} · Open {c.daysOpen} days</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-slate-800">{fmt(c.committed)}</p>
                {c.status !== 'released' && (
                  <button className="text-[10px] px-2 py-1 bg-red-100 text-red-700 rounded-md font-semibold mt-1.5 hover:bg-red-200" onClick={() => handleRelease(c.id)}>Release Commitment</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const EXPEND_ROLES = [
  { role: 'Dept Head / Initiator', pv: 'Create PV (draft)', match: 'No access', commitment: 'View own dept' },
  { role: 'Expenditure Officer', pv: 'Verify PV', match: 'Run auto-match, flag exceptions', commitment: 'Manage & release' },
  { role: 'Finance Director', pv: 'Approve PV < ₦10M', match: 'Resolve exceptions', commitment: 'Release + report' },
  { role: 'Director General', pv: 'Approve PV ≥ ₦10M', match: 'Read-only', commitment: 'View summary' },
  { role: 'Treasury Officer', pv: 'Process payment', match: 'View matched invoices', commitment: 'View' },
  { role: 'Internal Auditor', pv: 'Read-only', match: 'Full read-only', commitment: 'Full read-only' },
]

function ExpenditureRolesTab() {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="text-left border-b border-slate-100">
            {['Role', 'Payment Vouchers', 'Three-Way Match', 'Commitment Control'].map(h => <th key={h} className="pb-2 pr-4 text-slate-500 font-semibold">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {EXPEND_ROLES.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-2.5 pr-4 font-semibold text-slate-800">{r.role}</td>
                <td className="py-2.5 pr-4 text-slate-600">{r.pv}</td>
                <td className="py-2.5 pr-4 text-slate-600">{r.match}</td>
                <td className="py-2.5 text-slate-600">{r.commitment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { name: 'payment_vouchers', cols: 'id, pv_ref, payee_id (FK), payee_name, amount, budget_line_id (FK), invoice_ref, status (draft|verified|pending-approval|approved|paid|returned), approval_level, created_by, created_at, approved_by, approved_at, paid_at, gl_posted' },
          { name: 'pv_approval_log', cols: 'id, pv_id (FK), approver_id (FK), action (verify|route|approve|return|pay), note, actioned_at' },
          { name: 'invoice_matching', cols: 'id, invoice_ref, vendor_id (FK), po_id (FK), grn_id (FK), po_qty, po_unit_price, invoice_qty, invoice_unit_price, grn_qty, match_status (matched|price-mismatch|qty-mismatch|no-po|resolved|released), amount, resolved_note, resolved_by, resolved_at' },
          { name: 'commitments', cols: 'id, po_ref, vendor_id (FK), description, budget_line_id (FK), committed_amount, released_amount, status (active|aged|released), days_open, created_at, released_at, released_by' },
        ].map(t => (
          <div key={t.name} className="bg-slate-50 rounded-xl p-3">
            <p className="text-[11px] font-bold text-slate-700 mb-1">{t.name}</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">{t.cols}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── EXPENDITURE WORKBENCH ─── */
export function FinanceExpenditureWorkbenchView() {
  const toast = useToast()
  const TABS = ['Payment Vouchers', 'Three-Way Matching', 'Commitment Control', 'Roles & Schema']
  const [activeTab, setActiveTab] = useState(0)
  return (
    <div className="space-y-5">
      <Toast msg={toast.msg} clear={() => toast.show(null)} />
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
          <DollarSign size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Expenditure Unit Workbench</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">Payment voucher lifecycle, three-way invoice matching, and real-time commitment control for approved budget lines.</p>
        </div>
      </div>
      <div className="flex gap-1 flex-wrap border-b border-slate-100 pb-0">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} className={`text-xs px-3 py-2 rounded-t-lg font-medium transition-colors ${activeTab === i ? 'bg-white border border-b-white border-slate-200 text-[#006838] font-semibold -mb-px z-10 relative' : 'text-slate-500 hover:text-slate-700'}`}>{t}</button>
        ))}
      </div>
      <div className="pt-1">
        {activeTab === 0 && <PaymentVouchersTab toast={toast} />}
        {activeTab === 1 && <ThreeWayMatchTab toast={toast} />}
        {activeTab === 2 && <CommitmentControlTab toast={toast} />}
        {activeTab === 3 && <ExpenditureRolesTab />}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/*                  FISCAL REPORTING WORKBENCH                        */
/* ═══════════════════════════════════════════════════════════════════ */

const PERIOD_CLOSE_CHECKS = [
  { id: 'all_txns', label: 'All transactions posted to GL', critical: true },
  { id: 'no_unapproved_pvs', label: 'No unapproved Payment Vouchers outstanding', critical: true },
  { id: 'bank_recon', label: 'Bank reconciliation completed', critical: true },
  { id: 'interco_match', label: 'Inter-company/grant balances reconciled', critical: false },
  { id: 'accruals', label: 'Month-end accruals and adjustments posted', critical: false },
]

const STATEMENT_DATA = {
  incomeStatement: [
    { label: 'Government Subvention', amount: 450000000, type: 'income' },
    { label: 'Training Fees & Certifications', amount: 87500000, type: 'income' },
    { label: 'Consultancy Income', amount: 22000000, type: 'income' },
    { label: 'Donor Grants (Project)', amount: 158000000, type: 'income' },
    { label: 'Personnel Costs', amount: -285000000, type: 'expense' },
    { label: 'Administrative Overhead', amount: -94000000, type: 'expense' },
    { label: 'Training Delivery Costs', amount: -128000000, type: 'expense' },
    { label: 'Capital Amortisation', amount: -35000000, type: 'expense' },
  ],
  balanceSheet: {
    assets: [
      { label: 'Cash & Bank Balances', amount: 284500000 },
      { label: 'Receivables & Prepayments', amount: 67200000 },
      { label: 'Fixed Assets (Net Book Value)', amount: 895000000 },
      { label: 'Capital Work in Progress', amount: 95000000 },
    ],
    liabilities: [
      { label: 'Payables & Accruals', amount: 145000000 },
      { label: 'Deferred Income (Grants)', amount: 112000000 },
      { label: 'Government Grant Account', amount: 450000000 },
      { label: 'Accumulated Surplus', amount: 634700000 },
    ],
  },
}

const GRANTS_INIT = [
  { id: 'GR-2026-001', donor: 'World Bank', title: 'Power Sector Capacity Building', amount: '$5,000,000', period: 'Q1 2026', deadline: '30 Apr 2026', status: 'due', expenditure: 1250000 },
  { id: 'GR-2026-002', donor: 'USAID', title: 'Women in Energy Programme Phase II', amount: '$1,200,000', period: 'Q1 2026', deadline: '15 Apr 2026', status: 'overdue', expenditure: 380000 },
  { id: 'GR-2025-003', donor: 'AfDB', title: 'Technical TVET Strengthening', amount: '₦850,000,000', period: 'H2 2025', deadline: '31 Jan 2026', status: 'submitted', expenditure: 410000000 },
]
const AUDIT_REQUESTS_INIT = [
  { id: 'AQ-2026-012', requestedBy: 'Auditor General Office', schedule: 'All payments > ₦5M (FY2025)', deadline: '14 Apr 2026', status: 'pending' },
  { id: 'AQ-2026-011', requestedBy: 'Auditor General Office', schedule: 'Fixed Assets Register — full', deadline: '14 Apr 2026', status: 'generated' },
  { id: 'AQ-2026-010', requestedBy: 'Internal Audit', schedule: 'Vendor payment analysis — Q1 2026', deadline: '10 Apr 2026', status: 'generated' },
  { id: 'AQ-2026-009', requestedBy: 'Auditor General Office', schedule: 'Payroll reconciliation — FY2025', deadline: '07 Apr 2026', status: 'pending' },
]

function FinancialStatementsTab({ toast }) {
  const [checks, setChecks] = useState(PERIOD_CLOSE_CHECKS.map(c => ({ ...c, done: false })))
  const [closureStatus, setClosureStatus] = useState('open') // open | closed | routed | locked
  const [showStatements, setShowStatements] = useState(false)
  const [activeStatement, setActiveStatement] = useState('is')

  const allCriticalDone = checks.filter(c => c.critical).every(c => c.done)
  const allDone = checks.every(c => c.done)

  const handleClose = () => {
    if (!allCriticalDone) { toast.show('Cannot initiate close — critical checklist items incomplete.'); return }
    setClosureStatus('closed'); setShowStatements(true)
    toast.show('Period close initiated. Financial statements auto-generated.')
  }
  const handleRoute = () => { setClosureStatus('routed'); toast.show('Statements routed for Finance Director approval.') }
  const handleLock = () => { setClosureStatus('locked'); toast.show('Financial statements locked for Q1 FY2026.') }

  const totalIncome = STATEMENT_DATA.incomeStatement.filter(l => l.type === 'income').reduce((s, l) => s + l.amount, 0)
  const totalExpense = STATEMENT_DATA.incomeStatement.filter(l => l.type === 'expense').reduce((s, l) => s + Math.abs(l.amount), 0)
  const surplus = totalIncome - totalExpense

  return (
    <div className="space-y-4">
      <div className="card">
        <p className="text-xs font-bold text-slate-700 mb-3">Period-End Closing Checklist — Q1 FY 2026</p>
        <div className="space-y-2">
          {checks.map((c, i) => (
            <label key={c.id} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={c.done} disabled={closureStatus === 'locked'} onChange={() => setChecks(p => p.map((x, j) => j === i ? { ...x, done: !x.done } : x))} className="w-4 h-4 accent-emerald-600 rounded" />
              <span className={`text-xs ${c.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{c.label}</span>
              {c.critical && <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-semibold">Critical</span>}
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          <button className="btn-primary text-sm" onClick={handleClose} disabled={closureStatus !== 'open'}>
            <Lock size={14} /> Initiate Period Close
          </button>
          {closureStatus === 'closed' && <button className="btn-secondary text-sm" onClick={handleRoute}><Upload size={14} /> Route for Approval</button>}
          {closureStatus === 'routed' && <button className="bg-[#006838] text-white text-sm px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 hover:bg-[#005230]" onClick={handleLock}><ShieldCheck size={14} /> Lock Statements</button>}
        </div>
        {closureStatus !== 'open' && <div className="mt-3 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">Status: {closureStatus === 'closed' ? 'Period closed — statements generated' : closureStatus === 'routed' ? 'Routed for approval' : 'Locked'}</div>}
      </div>

      {showStatements && (
        <div className="card">
          <div className="flex gap-2 mb-4">
            {[['is', 'Income Statement'], ['bs', 'Balance Sheet']].map(([key, label]) => (
              <button key={key} onClick={() => setActiveStatement(key)} className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${activeStatement === key ? 'bg-[#006838] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{label}</button>
            ))}
            <button className="btn-secondary text-sm ml-auto" onClick={() => toast.show('Financial statements exported.')}><Download size={14} /> Export</button>
          </div>

          {activeStatement === 'is' && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Q1 FY 2026 — Income Statement</p>
              {STATEMENT_DATA.incomeStatement.map((l, i) => (
                <div key={i} className="flex justify-between text-xs py-1 border-b border-slate-50">
                  <span className="text-slate-600">{l.label}</span>
                  <span className={`font-semibold ${l.amount < 0 ? 'text-red-600' : 'text-slate-800'}`}>{l.amount < 0 ? `(${fmt(Math.abs(l.amount))})` : fmt(l.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs py-2 font-bold border-t-2 border-slate-200 mt-1">
                <span className="text-slate-800">Net Surplus / (Deficit)</span>
                <span className={surplus >= 0 ? 'text-green-700' : 'text-red-700'}>{surplus >= 0 ? fmt(surplus) : `(${fmt(Math.abs(surplus))})`}</span>
              </div>
            </div>
          )}
          {activeStatement === 'bs' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Assets</p>
                {STATEMENT_DATA.balanceSheet.assets.map((l, i) => (
                  <div key={i} className="flex justify-between text-xs py-1 border-b border-slate-50">
                    <span className="text-slate-600">{l.label}</span>
                    <span className="font-semibold text-slate-800">{fmt(l.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs py-2 font-bold border-t-2 border-slate-200 mt-1">
                  <span>Total Assets</span>
                  <span>{fmt(STATEMENT_DATA.balanceSheet.assets.reduce((s, l) => s + l.amount, 0))}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Liabilities & Equity</p>
                {STATEMENT_DATA.balanceSheet.liabilities.map((l, i) => (
                  <div key={i} className="flex justify-between text-xs py-1 border-b border-slate-50">
                    <span className="text-slate-600">{l.label}</span>
                    <span className="font-semibold text-slate-800">{fmt(l.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs py-2 font-bold border-t-2 border-slate-200 mt-1">
                  <span>Total Liabilities & Equity</span>
                  <span>{fmt(STATEMENT_DATA.balanceSheet.liabilities.reduce((s, l) => s + l.amount, 0))}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BudgetPerformanceTab({ toast }) {
  const [narratives, setNarratives] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const bprLines = BVA_LINES_INIT.map(l => {
    const utilPct = Math.round((l.actual + l.committed) / l.approved * 100)
    const variancePct = Math.round((l.actual - l.approved * 0.5) / (l.approved * 0.5) * 100)
    return { ...l, utilPct, variancePct }
  })

  const handleGenerate = () => toast.show('Budget Performance Report generated for Q1 FY2026.')
  const handleSubmit = () => { setSubmitted(true); toast.show('BPR submitted to Ministry of Finance.') }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <p className="text-xs text-slate-500">Quarterly Budget Performance Report — Q1 FY 2026</p>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm" onClick={handleGenerate}><FileText size={14} /> Generate BPR</button>
          <button className="btn-primary text-sm" onClick={handleSubmit} disabled={submitted}><Upload size={14} /> {submitted ? 'Submitted' : 'Submit to MoF'}</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="text-left border-b border-slate-100">
            {['Department', 'Approved Budget', 'Actual Spend', 'Committed', 'Utilisation', 'Variance', 'Commentary'].map(h => <th key={h} className="pb-2 pr-3 text-slate-500 font-semibold">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {bprLines.map((l, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-2.5 pr-3 font-semibold text-slate-800">{l.dept}</td>
                <td className="py-2.5 pr-3 text-slate-600">{fmt(l.approved)}</td>
                <td className="py-2.5 pr-3 text-slate-600">{fmt(l.actual)}</td>
                <td className="py-2.5 pr-3 text-slate-600">{fmt(l.committed)}</td>
                <td className="py-2.5 pr-3">
                  <span className={`font-semibold ${l.utilPct >= 90 ? 'text-red-600' : l.utilPct >= 75 ? 'text-amber-600' : 'text-green-700'}`}>{l.utilPct}%</span>
                </td>
                <td className="py-2.5 pr-3">
                  <span className={l.variancePct > 0 ? 'text-red-600' : 'text-green-700'}>{l.variancePct > 0 ? '+' : ''}{l.variancePct}%</span>
                </td>
                <td className="py-2.5">
                  <input className="np-input text-[10px] w-36" placeholder="Add narrative..." value={narratives[l.dept] || ''} onChange={e => setNarratives(p => ({ ...p, [l.dept]: e.target.value }))} disabled={submitted} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const TREASURY_RETURN_TYPES = ['Monthly Expenditure Return (MER)', 'Quarterly Revenue Return (QRR)', 'Annual Financial Return (AFR)']
const TREASURY_TEMPLATE = {
  'Monthly Expenditure Return (MER)': [
    { label: 'Opening Cash Balance', value: 284500000 },
    { label: 'Receipts — Subvention', value: 150000000 },
    { label: 'Receipts — IGR', value: 18500000 },
    { label: 'Total Payments', value: -97000000 },
    { label: 'Closing Cash Balance', value: 356000000 },
  ],
  'Quarterly Revenue Return (QRR)': [
    { label: 'Training Fees Collected', value: 87500000 },
    { label: 'Certification Revenues', value: 12200000 },
    { label: 'Consultancy Invoiced', value: 22000000 },
    { label: 'Other IGR', value: 5300000 },
  ],
  'Annual Financial Return (AFR)': [
    { label: 'Total Approved Budget', value: 1250000000 },
    { label: 'Total Expenditure', value: 742000000 },
    { label: 'Balance Unspent', value: 508000000 },
    { label: 'Commitments Outstanding', value: 174600000 },
  ],
}

function TreasuryReturnsTab({ toast }) {
  const [selectedType, setSelectedType] = useState(TREASURY_RETURN_TYPES[0])
  const [populated, setPopulated] = useState(false)
  const [validated, setValidated] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handlePopulate = () => { setPopulated(true); setValidated(false); toast.show('Template auto-populated from GL data.') }
  const handleValidate = () => { setValidated(true); toast.show('Validation passed — all figures reconcile to GL.') }
  const handleSubmit = () => { setSubmitted(true); toast.show(`${selectedType} submitted to OAGF portal.`) }

  const lines = TREASURY_TEMPLATE[selectedType] || []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase">Return Type</label>
          <select className="np-input mt-0.5 text-sm" value={selectedType} onChange={e => { setSelectedType(e.target.value); setPopulated(false); setValidated(false); setSubmitted(false) }}>
            {TREASURY_RETURN_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex gap-2 mt-4">
          <button className="btn-secondary text-sm" onClick={handlePopulate}><RefreshCw size={14} /> Auto-Populate from GL</button>
          {populated && <button className={`text-sm px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 ${validated ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`} onClick={handleValidate}><CheckCircle size={14} /> {validated ? 'Validated' : 'Validate'}</button>}
          {validated && <button className={`text-sm px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 ${submitted ? 'bg-slate-100 text-slate-400' : 'btn-primary'}`} onClick={handleSubmit} disabled={submitted}><Upload size={14} /> {submitted ? 'Submitted' : 'Submit Return'}</button>}
        </div>
      </div>
      {populated && (
        <div className="card">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-3">{selectedType} — {validated ? (submitted ? 'Submitted' : 'Validated') : 'Draft'}</p>
          <div className="space-y-1">
            {lines.map((l, i) => (
              <div key={i} className="flex justify-between text-xs py-1.5 border-b border-slate-50">
                <span className="text-slate-600">{l.label}</span>
                <span className={`font-semibold ${l.value < 0 ? 'text-red-600' : 'text-slate-800'}`}>{l.value < 0 ? `(${fmt(Math.abs(l.value))})` : fmt(l.value)}</span>
              </div>
            ))}
          </div>
          {validated && <div className="mt-3 flex items-center gap-1.5 text-xs text-green-700"><CheckCircle size={12} /> All figures reconcile to General Ledger</div>}
        </div>
      )}
    </div>
  )
}

function DonorReportingTab({ toast }) {
  const [grants, setGrants] = useState(GRANTS_INIT)

  const statusBadge = (s) => {
    const map = { due: ['bg-amber-100 text-amber-700', 'Due'], overdue: ['bg-red-100 text-red-700', 'Overdue'], submitted: ['bg-green-100 text-green-700', 'Submitted'], generated: ['bg-blue-100 text-blue-700', 'Generated'] }
    const [cls, label] = map[s] || ['bg-slate-100 text-slate-500', s]
    return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
  }

  const handleGenerate = (id) => {
    setGrants(p => p.map(g => g.id === id ? { ...g, status: 'generated' } : g))
    toast.show(`Donor report generated for ${id} — tagged expenditure extracted from GL.`)
  }

  const handleSubmit = (id) => {
    setGrants(p => p.map(g => g.id === id ? { ...g, status: 'submitted' } : g))
    toast.show(`Report for ${id} submitted via donor portal.`)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">Active donor grants — expenditure tagged and extracted from GL by grant code.</p>
      <div className="space-y-3">
        {grants.map((g, i) => (
          <div key={i} className={`card ${g.status === 'overdue' ? 'border-l-4 border-l-red-400' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-800">{g.id}</span>
                  {statusBadge(g.status)}
                  {g.status === 'overdue' && <AlertTriangle size={12} className="text-red-500" />}
                </div>
                <p className="text-xs font-semibold text-slate-700">{g.donor} — {g.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Grant: {g.amount} · Period: {g.period} · Deadline: {g.deadline}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Tagged expenditure: {fmt(g.expenditure)}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                {g.status !== 'submitted' && g.status !== 'generated' && (
                  <button className="text-[10px] px-2 py-1 bg-blue-100 text-blue-700 rounded-md font-semibold hover:bg-blue-200" onClick={() => handleGenerate(g.id)}>Generate Report</button>
                )}
                {g.status === 'generated' && (
                  <button className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-md font-semibold hover:bg-green-200" onClick={() => handleSubmit(g.id)}>Submit via Portal</button>
                )}
                {g.status === 'submitted' && <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-400 rounded-md font-semibold">Submitted</span>}
                <button className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-semibold hover:bg-slate-200" onClick={() => toast.show(`Audit trail exported for ${g.id}.`)}><Download size={10} className="inline mr-0.5" />Export</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AuditSupportTab({ toast }) {
  const [requests, setRequests] = useState(AUDIT_REQUESTS_INIT)
  const [portalAccess, setPortalAccess] = useState(false)

  const statusBadge = (s) => {
    const map = { pending: 'bg-amber-100 text-amber-700', generated: 'bg-blue-100 text-blue-700', submitted: 'bg-green-100 text-green-700' }
    return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[s] || 'bg-slate-100 text-slate-500'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
  }

  const handleGenerate = (id) => {
    setRequests(p => p.map(r => r.id === id ? { ...r, status: 'generated' } : r))
    toast.show(`Schedule generated for ${id} — ready for auditor review.`)
  }
  const handleExport = (id) => toast.show(`Audit file exported for ${id}.`)
  const handlePortalAccess = () => { setPortalAccess(true); toast.show('Auditor portal access granted — OAG team notified.') }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <p className="text-xs text-slate-500">Manage audit requests, generate supporting schedules, and track queries.</p>
        <button className={`text-sm px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 ${portalAccess ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'btn-secondary'}`} onClick={handlePortalAccess} disabled={portalAccess}>
          <Users size={14} /> {portalAccess ? 'Portal Access Granted' : 'Grant Auditor Portal Access'}
        </button>
      </div>
      <div className="space-y-3">
        {requests.map((r, i) => (
          <div key={i} className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-800">{r.id}</span>
                  {statusBadge(r.status)}
                </div>
                <p className="text-xs font-semibold text-slate-700">{r.schedule}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Requested by: {r.requestedBy} · Deadline: {r.deadline}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                {r.status === 'pending' && (
                  <button className="text-[10px] px-2 py-1 bg-blue-100 text-blue-700 rounded-md font-semibold hover:bg-blue-200" onClick={() => handleGenerate(r.id)}>Generate Schedule</button>
                )}
                {r.status === 'generated' && (
                  <button className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-md font-semibold hover:bg-green-200" onClick={() => handleExport(r.id)}>Export Audit File</button>
                )}
                {r.status !== 'pending' && (
                  <button className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-semibold hover:bg-slate-200" onClick={() => toast.show(`Query log for ${r.id} opened.`)}>Query Log</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const FISCAL_ROLES = [
  { role: 'Finance Officer', stmt: 'Run checklist, initiate close', bpr: 'Edit narratives', treasury: 'Populate & validate', donor: 'Generate report', audit: 'Generate schedules' },
  { role: 'Finance Director', stmt: 'Approve & route', bpr: 'Generate & submit BPR', treasury: 'Submit return', donor: 'Submit via portal', audit: 'Grant portal access' },
  { role: 'Director General', stmt: 'Lock statements', bpr: 'Approve to MoF', treasury: 'View only', donor: 'View summary', audit: 'View summary' },
  { role: 'Internal Auditor', stmt: 'Read-only', bpr: 'Read-only', treasury: 'Read-only', donor: 'Read-only', audit: 'Raise queries' },
  { role: 'External Auditor', stmt: 'View via portal', bpr: 'View via portal', treasury: 'View only', donor: 'View only', audit: 'Request schedules, raise queries' },
]

function FiscalRolesTab() {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="text-left border-b border-slate-100">
            {['Role', 'Financial Statements', 'Budget Performance', 'Treasury Returns', 'Donor Reporting', 'Audit Support'].map(h => <th key={h} className="pb-2 pr-3 text-slate-500 font-semibold">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {FISCAL_ROLES.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-2.5 pr-3 font-semibold text-slate-800">{r.role}</td>
                <td className="py-2.5 pr-3 text-slate-600">{r.stmt}</td>
                <td className="py-2.5 pr-3 text-slate-600">{r.bpr}</td>
                <td className="py-2.5 pr-3 text-slate-600">{r.treasury}</td>
                <td className="py-2.5 pr-3 text-slate-600">{r.donor}</td>
                <td className="py-2.5 text-slate-600">{r.audit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { name: 'financial_statements', cols: 'id, period (Q1|Q2|Q3|Q4|Annual), fiscal_year, stmt_type (IS|BS|CF), generated_at, generated_by, status (draft|routed|locked), approved_by, locked_at, data_json' },
          { name: 'period_close_log', cols: 'id, period, fiscal_year, check_id, check_label, completed_by, completed_at, close_initiated_by, close_initiated_at' },
          { name: 'treasury_returns', cols: 'id, return_type (MER|QRR|AFR), period, fiscal_year, populated_at, validated_by, validated_at, submitted_by, submitted_at, oagf_ref, data_json' },
          { name: 'donor_reports', cols: 'id, grant_id (FK), donor, period, deadline, generated_at, generated_by, submitted_at, submitted_by, portal_ref, tagged_expenditure, status' },
          { name: 'audit_schedules', cols: 'id, audit_request_ref, requested_by_org, schedule_description, deadline, generated_at, exported_at, status (pending|generated|submitted), portal_access_granted, query_log text' },
        ].map(t => (
          <div key={t.name} className="bg-slate-50 rounded-xl p-3">
            <p className="text-[11px] font-bold text-slate-700 mb-1">{t.name}</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">{t.cols}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── FISCAL REPORTING WORKBENCH ─── */
export function FinanceFiscalReportingView() {
  const toast = useToast()
  const TABS = ['Financial Statements', 'Budget Performance', 'Treasury Returns', 'Donor Reporting', 'Audit Support', 'Roles & Schema']
  const [activeTab, setActiveTab] = useState(0)
  return (
    <div className="space-y-5">
      <Toast msg={toast.msg} clear={() => toast.show(null)} />
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center flex-shrink-0">
          <FileText size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Fiscal &amp; Final Reporting Workbench</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">Period-end closing, financial statement generation, budget performance reporting, treasury returns, donor reporting, and audit support.</p>
        </div>
      </div>
      <div className="flex gap-1 flex-wrap border-b border-slate-100 pb-0">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} className={`text-xs px-3 py-2 rounded-t-lg font-medium transition-colors ${activeTab === i ? 'bg-white border border-b-white border-slate-200 text-[#006838] font-semibold -mb-px z-10 relative' : 'text-slate-500 hover:text-slate-700'}`}>{t}</button>
        ))}
      </div>
      <div className="pt-1">
        {activeTab === 0 && <FinancialStatementsTab toast={toast} />}
        {activeTab === 1 && <BudgetPerformanceTab toast={toast} />}
        {activeTab === 2 && <TreasuryReturnsTab toast={toast} />}
        {activeTab === 3 && <DonorReportingTab toast={toast} />}
        {activeTab === 4 && <AuditSupportTab toast={toast} />}
        {activeTab === 5 && <FiscalRolesTab />}
      </div>
    </div>
  )
}
