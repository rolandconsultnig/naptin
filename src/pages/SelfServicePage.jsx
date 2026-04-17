import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { NAPTIN_LOGO } from '../assets/images'
import { LEAVE_HISTORY, PAYSLIPS, PAYSLIP_DETAIL_LINES } from '../data/mock'
import { CalendarDays, FileUp, FileText, CheckCircle, Clock, XCircle, Upload, Wallet, Download, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { hrmsApi } from '../services/hrmsService'

const StatusBadge = ({ status }) => {
  if (status === 'approved') return <span className="badge badge-green"><CheckCircle size={9} />Approved</span>
  if (status === 'pending') return <span className="badge badge-amber"><Clock size={9} />Pending</span>
  return <span className="badge badge-red"><XCircle size={9} />Rejected</span>
}

const DOCS = [
  { name: 'NYSC_Certificate_2021.pdf', status: 'verified', icon: '📄', date: 'Mar 2026' },
  { name: 'NIN_Slip.pdf', status: 'verified', icon: '🪪', date: 'Mar 2026' },
  { name: 'BSc_Certificate.pdf', status: 'pending', icon: '🎓', date: 'Mar 2026' },
]

const FALLBACK_BALANCES = [
  { label: 'Annual Leave', days: 18, total: 30, color: 'bg-[#006838]', text: 'text-[#006838]' },
  { label: 'Sick Leave', days: 12, total: 15, color: 'bg-blue-500', text: 'text-blue-600' },
  { label: 'Study Leave', days: 5, total: 10, color: 'bg-amber-500', text: 'text-amber-600' },
  { label: 'Leave Taken', days: 7, total: 30, color: 'bg-red-400', text: 'text-red-500' },
]

const BALANCE_COLORS = [
  { color: 'bg-[#006838]', text: 'text-[#006838]' },
  { color: 'bg-blue-500', text: 'text-blue-600' },
  { color: 'bg-amber-500', text: 'text-amber-600' },
  { color: 'bg-purple-500', text: 'text-purple-600' },
]

function mapLeaveRequestRow(row) {
  const start = row.startDate ? new Date(row.startDate).toLocaleDateString() : '—'
  const end = row.endDate ? new Date(row.endDate).toLocaleDateString() : '—'
  return {
    type: row.leaveType || 'Leave',
    duration: `${row.daysRequested ?? '—'} day${Number(row.daysRequested) === 1 ? '' : 's'}`,
    dates: `${start} – ${end}`,
    status: String(row.status || 'pending').toLowerCase(),
  }
}

function mapPayslipRow(ps) {
  const fmt = (n) => `₦${Number(n || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
  return {
    period: ps.periodLabel || 'Period',
    payDate: ps.payDate ? new Date(ps.payDate).toLocaleDateString() : '—',
    gross: fmt(ps.grossEarnings),
    net: fmt(ps.netPay),
    deductions: fmt(ps.totalDeductions),
    status: 'Released',
    ref: `PS-${String(ps.id).padStart(6, '0')}`,
    api: ps,
  }
}

export default function SelfServicePage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [leaveTypeId, setLeaveTypeId] = useState('')
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [tab, setTab] = useState('leave')
  const [payslipDetail, setPayslipDetail] = useState(null)
  const [pdfNotice, setPdfNotice] = useState(null)
  const [leaveHistoryRows, setLeaveHistoryRows] = useState(LEAVE_HISTORY)
  const [payslipRows, setPayslipRows] = useState(PAYSLIPS)
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false)
  const [syncNote, setSyncNote] = useState('')
  const [resolvedEmployeeId, setResolvedEmployeeId] = useState(null)
  const [apiBalances, setApiBalances] = useState(null)

  const loadSelfServiceData = useCallback(async () => {
    const email = (user?.email || '').trim().toLowerCase()
    try {
      const types = await hrmsApi.getLeaveTypes().catch(() => [])
      const list = Array.isArray(types) ? types : []
      setLeaveTypeOptions(list)
      setLeaveTypeId((prev) => {
        if (prev && list.some((t) => String(t.id) === prev)) return prev
        return list[0] ? String(list[0].id) : ''
      })

      let employeeId = null
      if (email) {
        const empData = await hrmsApi.getEmployees({ limit: 400 })
        const emps = empData?.employees || []
        const hit = emps.find((e) => String(e.email || '').toLowerCase() === email)
        employeeId = hit?.id ?? null
      }
      setResolvedEmployeeId(employeeId)

      if (employeeId) {
        const [leaveRows, payslipData, balances] = await Promise.all([
          hrmsApi.getLeaveRequests({ employeeId, limit: 80 }).catch(() => []),
          email ? hrmsApi.getMyPayslips({ email }).catch(() => []) : Promise.resolve([]),
          hrmsApi.getLeaveBalances(employeeId, new Date().getFullYear()).catch(() => []),
        ])

        const lr = Array.isArray(leaveRows) ? leaveRows : []
        setLeaveHistoryRows(lr.length ? lr.map(mapLeaveRequestRow) : LEAVE_HISTORY)

        const pr = Array.isArray(payslipData) ? payslipData : []
        setPayslipRows(pr.length ? pr.map(mapPayslipRow) : PAYSLIPS)

        const bl = Array.isArray(balances) ? balances : []
        setApiBalances(bl.length ? bl : null)

        setSyncNote(
          pr.length || lr.length || bl.length
            ? 'Synced leave, balances, and payslips from HRMS API.'
            : 'HRMS linked to your profile; no leave or payslip rows yet (seed data or submit an application).'
        )
      } else {
        setLeaveHistoryRows(LEAVE_HISTORY)
        setPayslipRows(PAYSLIPS)
        setApiBalances(null)
        setSyncNote(
          email
            ? 'No HR record matches your sign-in email yet. Ask HR to create your profile or use your organisation email.'
            : 'Sign in to sync with HRMS.'
        )
      }
    } catch {
      setLeaveHistoryRows(LEAVE_HISTORY)
      setPayslipRows(PAYSLIPS)
      setApiBalances(null)
      setSyncNote('HRMS is temporarily unavailable. Showing saved listings.')
    }
  }, [user?.email])

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t === 'payslips') setTab('payslips')
  }, [searchParams])

  useEffect(() => {
    loadSelfServiceData()
  }, [loadSelfServiceData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!startDate || !endDate) return
    if (!resolvedEmployeeId) {
      setSyncNote('Your account is not linked to an HR employee — contact HR before submitting leave online.')
      return
    }
    const ltid = parseInt(leaveTypeId, 10)
    if (!Number.isFinite(ltid)) {
      setSyncNote('Select a leave type from the list (load leave types from HRMS).')
      return
    }
    const days = Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1)

    setIsSubmittingLeave(true)
    try {
      await hrmsApi.createLeaveRequest({
        employeeId: resolvedEmployeeId,
        leaveTypeId: ltid,
        startDate: startDate,
        endDate: endDate,
        daysRequested: days,
        reason: notes.trim() || '',
      })
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 5000)
      setStartDate('')
      setEndDate('')
      setNotes('')
      setSyncNote('Leave application submitted successfully.')
      await loadSelfServiceData()
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Failed to submit leave application.'
      setSyncNote(msg)
    } finally {
      setIsSubmittingLeave(false)
    }
  }

  const days = startDate && endDate ? Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1) : null

  const balances =
    apiBalances && apiBalances.length
      ? apiBalances.map((b, i) => {
          const ring = BALANCE_COLORS[i % BALANCE_COLORS.length]
          const cap = Math.max(1, (b.entitled || 0) + (b.carriedOver || 0) + (b.adjusted || 0))
          const rem = Math.max(0, Math.round(Number(b.remaining) || 0))
          return {
            label: b.leaveType || 'Leave',
            days: rem,
            total: cap,
            color: ring.color,
            text: ring.text,
          }
        })
      : FALLBACK_BALANCES

  const payslipBreakdownLines = payslipDetail?.api
    ? [
        { label: 'Gross earnings', amount: payslipDetail.gross },
        { label: 'Total deductions', amount: payslipDetail.deductions },
        { label: 'PAYE', amount: `₦${Number(payslipDetail.api.tax || 0).toLocaleString('en-NG')}` },
      ]
    : null

  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Staff Self-Service Portal</h1>
            <p className="text-sm text-slate-400">Leave applications, documents and personal records</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {balances.map((b, i) => (
          <div key={`${b.label}-${i}`} className="stat-card">
            <p className="text-xs text-slate-400 font-medium mb-2">{b.label}</p>
            <div className={`text-2xl font-extrabold ${b.text} mb-2`}>{b.days}</div>
            <div className="text-xs text-slate-400 mb-2">days remaining</div>
            <div className="bg-slate-100 rounded-full h-1.5">
              <div className={`${b.color} h-1.5 rounded-full`} style={{ width: `${Math.min(100, (b.days / b.total) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 mb-4">{syncNote}</p>

      <div className="flex items-center gap-1 mb-6 bg-white border border-slate-100 rounded-2xl p-1 w-fit shadow-sm">
        {[
          { id: 'leave', label: 'Leave Application', icon: CalendarDays },
          { id: 'docs', label: 'Document Upload', icon: FileUp },
          { id: 'payslips', label: 'Payslips', icon: Wallet },
          { id: 'history', label: 'My History', icon: FileText },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id ? 'bg-[#006838] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'leave' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-sm font-extrabold text-slate-800 mb-5">Apply for Leave</h2>
            {submitted && (
              <div className="mb-4 p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-[#006838] text-sm font-semibold">
                <CheckCircle size={16} />
                Leave application submitted! Your supervisor has been notified.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Leave Type</label>
                <select
                  value={leaveTypeId}
                  onChange={(e) => setLeaveTypeId(e.target.value)}
                  className="select"
                  disabled={!leaveTypeOptions.length}
                >
                  {!leaveTypeOptions.length ? <option value="">Loading types…</option> : null}
                  {leaveTypeOptions.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input" />
                </div>
              </div>
              {days && (
                <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 text-sm text-[#006838] font-semibold">
                  Duration: {days} calendar day{days !== 1 ? 's' : ''}
                </div>
              )}
              <div>
                <label className="label">Reason / Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Brief description of leave reason..."
                  className="input resize-none"
                />
              </div>
              <div>
                <label className="label">Supporting Document (optional)</label>
                <div className="border border-dashed border-slate-200 rounded-xl px-4 py-6 text-center cursor-pointer hover:border-[#006838]/40 hover:bg-green-50/30 transition-all">
                  <Upload size={18} className="text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">Click to attach or drag & drop</p>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="flex-1 btn-primary justify-center py-2.5" disabled={isSubmittingLeave}>
                  {isSubmittingLeave ? 'Submitting...' : 'Submit Application'}
                </button>
                <button
                  type="button"
                  className="flex-1 btn-secondary justify-center py-2.5"
                  onClick={() => {
                    setStartDate('')
                    setEndDate('')
                    setNotes('')
                  }}
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>
          <div className="space-y-4">
            <div className="card">
              <h3 className="text-sm font-extrabold text-slate-800 mb-4">Approval Workflow</h3>
              <div className="space-y-3">
                {[
                  { step: 1, label: 'Staff submits application', done: true },
                  { step: 2, label: 'Line Manager review (2 working days)', done: false },
                  { step: 3, label: 'HR Department approval', done: false },
                  { step: 4, label: 'Director sign-off (GL-13+)', done: false },
                  { step: 5, label: 'Notification sent to staff', done: false },
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                        s.done ? 'bg-[#006838] text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {s.done ? '✓' : s.step}
                    </div>
                    <p className={`text-sm font-medium ${s.done ? 'text-[#006838]' : 'text-slate-500'}`}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-800 mb-2">Leave Policy Reminders</p>
              <ul className="text-xs text-amber-700 space-y-1.5 list-disc list-inside">
                <li>Annual leave must be applied at least 5 working days in advance</li>
                <li>Sick leave beyond 3 days requires a medical certificate</li>
                <li>Leave days cannot be carried over beyond December 31</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {tab === 'docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-sm font-extrabold text-slate-800 mb-5">Upload Credential Documents</h2>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl px-6 py-14 text-center cursor-pointer hover:border-[#006838]/40 hover:bg-green-50/20 transition-all group">
              <Upload size={32} className="text-slate-300 group-hover:text-[#006838] mx-auto mb-3 transition-colors" />
              <p className="text-sm font-semibold text-slate-600 mb-1">Drop files here or click to browse</p>
              <p className="text-xs text-slate-400">Certificates, IDs, credentials, medical docs · Max 10MB</p>
              <button type="button" className="mt-4 btn-primary mx-auto text-xs py-2">
                Browse Files
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['📄 Academic Certificates', '🪪 National ID', '📋 NYSC Certificate', '🏥 Medical Records'].map((d) => (
                <span key={d} className="text-[10px] bg-slate-50 text-slate-500 border border-slate-100 px-2.5 py-1 rounded-full font-medium">
                  {d}
                </span>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="text-sm font-extrabold text-slate-800 mb-4">My Uploaded Documents</h3>
            <div className="space-y-3">
              {DOCS.map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xl">{d.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{d.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Uploaded {d.date}</p>
                  </div>
                  {d.status === 'verified' ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap">
                      <CheckCircle size={9} />
                      Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full whitespace-nowrap">
                      <Clock size={9} />
                      Pending
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'payslips' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-sm font-extrabold text-slate-800 mb-1">My payslips</h2>
            <p className="text-xs text-slate-500 mb-5">
              Published payslips for your HR email from the payroll module. Breakdown uses API figures when available.
            </p>
            <div className="space-y-2">
              {payslipRows.map((p) => (
                <div
                  key={p.ref}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-[#006838]/30 transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{p.period}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Paid {p.payDate} · Net <span className="font-mono font-semibold text-slate-700">{p.net}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">{p.ref}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="badge badge-green text-[10px]">{p.status}</span>
                    <button type="button" onClick={() => setPayslipDetail(p)} className="btn-primary text-xs py-2 px-3">
                      View breakdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfNotice(p)}
                      className="btn-secondary text-xs py-2 px-3 flex items-center gap-1"
                    >
                      <Download size={14} /> PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {payslipDetail && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPayslipDetail(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Payslip breakdown</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">{payslipDetail.ref}</p>
              </div>
              <button
                type="button"
                onClick={() => setPayslipDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2 border-t border-slate-100 pt-4">
              {(payslipBreakdownLines || PAYSLIP_DETAIL_LINES).map((line, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-600">{line.label}</span>
                  <span className={`font-mono font-semibold ${String(line.amount).startsWith('-') ? 'text-red-600' : 'text-slate-800'}`}>
                    {line.amount}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold pt-3 border-t border-slate-100">
                <span className="text-slate-800">Net pay</span>
                <span className="font-mono text-[#006838]">{payslipDetail.net}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-4">
              {payslipDetail.api ? 'Figures from HRMS payslip record.' : 'Sample lines only — connect payroll for statutory detail.'}
            </p>
          </div>
        </div>
      )}

      {pdfNotice && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPdfNotice(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-base font-extrabold text-slate-900">Secure PDF download</h3>
              <button
                type="button"
                onClick={() => setPdfNotice(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-600">
              Payslip <span className="font-mono text-slate-800">{pdfNotice.ref}.pdf</span> will be generated with encryption and
              watermarking when payroll publishing is enabled for your account.
            </p>
            <button type="button" className="btn-primary text-sm mt-5 w-full py-2.5" onClick={() => setPdfNotice(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-extrabold text-slate-800">Leave History — {new Date().getFullYear()}</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="table-th">Leave Type</th>
                <th className="table-th">Duration</th>
                <th className="table-th">Dates</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveHistoryRows.map((l, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="table-td font-semibold">{l.type}</td>
                  <td className="table-td text-slate-500">{l.duration}</td>
                  <td className="table-td text-slate-500">{l.dates}</td>
                  <td className="table-td">
                    <StatusBadge status={l.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
