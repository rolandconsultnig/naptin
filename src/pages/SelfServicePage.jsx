import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { NAPTIN_LOGO } from '../assets/images'
import { LEAVE_HISTORY, PAYSLIPS, PAYSLIP_DETAIL_LINES } from '../data/mock'
import { CalendarDays, FileUp, FileText, CheckCircle, Clock, XCircle, Upload, Wallet, Download, X } from 'lucide-react'

const StatusBadge = ({ status }) => {
  if (status==='approved') return <span className="badge badge-green"><CheckCircle size={9}/>Approved</span>
  if (status==='pending')  return <span className="badge badge-amber"><Clock size={9}/>Pending</span>
  return <span className="badge badge-red"><XCircle size={9}/>Rejected</span>
}
const DOCS = [
  { name:'NYSC_Certificate_2021.pdf', status:'verified', icon:'📄', date:'Mar 2026' },
  { name:'NIN_Slip.pdf', status:'verified', icon:'🪪', date:'Mar 2026' },
  { name:'BSc_Certificate.pdf', status:'pending', icon:'🎓', date:'Mar 2026' },
]

export default function SelfServicePage() {
  const [searchParams] = useSearchParams()
  const [leaveType, setLeaveType] = useState('Annual Leave')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [tab, setTab] = useState('leave')
  const [payslipDetail, setPayslipDetail] = useState(null)
  const [leaveHistoryRows, setLeaveHistoryRows] = useState(LEAVE_HISTORY)
  const [payslipRows, setPayslipRows] = useState(PAYSLIPS)
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false)
  const [syncNote, setSyncNote] = useState('')

  const fetchJson = async (url, options = {}) => {
    const response = await fetch(url, { ...options, credentials: 'include' })
    const text = await response.text()
    const data = text ? JSON.parse(text) : {}
    if (!response.ok) throw new Error(data?.error || `Request failed: ${response.status}`)
    return data
  }

  const loadSelfServiceData = async () => {
    try {
      const [leaveData, payrollData] = await Promise.all([
        fetchJson('/api/hrms/leave-requests'),
        fetchJson('/api/hrms/payroll-runs'),
      ])

      const leaveItems = (leaveData.items || []).map((row) => ({
        type: row.leave_type,
        duration: `${row.duration_days} day${row.duration_days === 1 ? '' : 's'}`,
        dates: `${row.start_date ? new Date(row.start_date).toLocaleDateString() : '—'} – ${row.end_date ? new Date(row.end_date).toLocaleDateString() : '—'}`,
        status: (row.status || 'pending').toLowerCase(),
      }))

      const payrollItems = (payrollData.items || []).map((row) => ({
        period: row.period_label,
        payDate: row.pay_date ? new Date(row.pay_date).toLocaleDateString() : '—',
        gross: `₦${Number(row.gross_total || 0).toLocaleString()}`,
        net: `₦${Number(row.net_total || 0).toLocaleString()}`,
        deductions: `₦${Number(row.deductions_total || 0).toLocaleString()}`,
        status: row.status === 'draft' ? 'Draft' : 'Released',
        ref: `PS-${String(row.id).padStart(6, '0')}`,
      }))

      setLeaveHistoryRows(leaveItems.length ? leaveItems : LEAVE_HISTORY)
      setPayslipRows(payrollItems.length ? payrollItems : PAYSLIPS)
      setSyncNote('Synced leave and payroll records from HRMS API.')
    } catch {
      setLeaveHistoryRows(LEAVE_HISTORY)
      setPayslipRows(PAYSLIPS)
      setSyncNote('HRMS API unavailable. Showing demo leave and payslip data.')
    }
  }

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t === 'payslips') setTab('payslips')
  }, [searchParams])

  useEffect(() => {
    loadSelfServiceData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!startDate || !endDate) return
    setIsSubmittingLeave(true)
    try {
      await fetchJson('/api/hrms/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          reason: notes.trim() || undefined,
        }),
      })
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 5000)
      setStartDate('')
      setEndDate('')
      setNotes('')
      setSyncNote('Leave application submitted successfully.')
      await loadSelfServiceData()
    } catch (err) {
      setSyncNote(err.message || 'Failed to submit leave application.')
    } finally {
      setIsSubmittingLeave(false)
    }
  }

  const days = startDate && endDate ? Math.max(1, Math.round((new Date(endDate)-new Date(startDate))/(1000*60*60*24))+1) : null

  const balances = [
    { label:'Annual Leave', days:18, total:30, color:'bg-[#006838]', text:'text-[#006838]' },
    { label:'Sick Leave', days:12, total:15, color:'bg-blue-500', text:'text-blue-600' },
    { label:'Study Leave', days:5, total:10, color:'bg-amber-500', text:'text-amber-600' },
    { label:'Leave Taken', days:7, total:30, color:'bg-red-400', text:'text-red-500' },
  ]

  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block"/>
          <div><h1 className="text-xl font-extrabold text-slate-900">Staff Self-Service Portal</h1><p className="text-sm text-slate-400">Leave applications, documents and personal records</p></div>
        </div>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {balances.map((b,i) => (
          <div key={i} className="stat-card">
            <p className="text-xs text-slate-400 font-medium mb-2">{b.label}</p>
            <div className={`text-2xl font-extrabold ${b.text} mb-2`}>{b.days}</div>
            <div className="text-xs text-slate-400 mb-2">days remaining</div>
            <div className="bg-slate-100 rounded-full h-1.5"><div className={`${b.color} h-1.5 rounded-full`} style={{width:`${(b.days/b.total)*100}%`}}/></div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 mb-4">{syncNote}</p>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white border border-slate-100 rounded-2xl p-1 w-fit shadow-sm">
        {[{id:'leave',label:'Leave Application',icon:CalendarDays},{id:'docs',label:'Document Upload',icon:FileUp},{id:'payslips',label:'Payslips',icon:Wallet},{id:'history',label:'My History',icon:FileText}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab===t.id?'bg-[#006838] text-white shadow-sm':'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
            <t.icon size={14}/>{t.label}
          </button>
        ))}
      </div>

      {tab==='leave' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-sm font-extrabold text-slate-800 mb-5">Apply for Leave</h2>
            {submitted && (
              <div className="mb-4 p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-[#006838] text-sm font-semibold">
                <CheckCircle size={16}/>Leave application submitted! Your supervisor has been notified.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">Leave Type</label>
                <select value={leaveType} onChange={e=>setLeaveType(e.target.value)} className="select">
                  {['Annual Leave','Sick Leave','Study Leave','Maternity/Paternity Leave','Compassionate Leave','Emergency Leave'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Start Date</label><input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="input"/></div>
                <div><label className="label">End Date</label><input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="input"/></div>
              </div>
              {days && (
                <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 text-sm text-[#006838] font-semibold">
                  Duration: {days} working day{days!==1?'s':''}
                </div>
              )}
              <div><label className="label">Reason / Notes</label>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Brief description of leave reason..." className="input resize-none"/>
              </div>
              <div>
                <label className="label">Supporting Document (optional)</label>
                <div className="border border-dashed border-slate-200 rounded-xl px-4 py-6 text-center cursor-pointer hover:border-[#006838]/40 hover:bg-green-50/30 transition-all">
                  <Upload size={18} className="text-slate-400 mx-auto mb-2"/>
                  <p className="text-xs text-slate-400 font-medium">Click to attach or drag & drop</p>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="flex-1 btn-primary justify-center py-2.5" disabled={isSubmittingLeave}>{isSubmittingLeave ? 'Submitting...' : 'Submit Application'}</button>
                <button type="button" className="flex-1 btn-secondary justify-center py-2.5">Clear Form</button>
              </div>
            </form>
          </div>
          <div className="space-y-4">
            <div className="card">
              <h3 className="text-sm font-extrabold text-slate-800 mb-4">Approval Workflow</h3>
              <div className="space-y-3">
                {[{step:1,label:'Staff submits application',done:true},{step:2,label:'Line Manager review (2 working days)',done:false},{step:3,label:'HR Department approval',done:false},{step:4,label:'Director sign-off (GL-13+)',done:false},{step:5,label:'Notification sent to staff',done:false}].map((s,i)=>(
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${s.done?'bg-[#006838] text-white':'bg-slate-100 text-slate-400'}`}>{s.done?'✓':s.step}</div>
                    <p className={`text-sm font-medium ${s.done?'text-[#006838]':'text-slate-500'}`}>{s.label}</p>
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

      {tab==='docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-sm font-extrabold text-slate-800 mb-5">Upload Credential Documents</h2>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl px-6 py-14 text-center cursor-pointer hover:border-[#006838]/40 hover:bg-green-50/20 transition-all group">
              <Upload size={32} className="text-slate-300 group-hover:text-[#006838] mx-auto mb-3 transition-colors"/>
              <p className="text-sm font-semibold text-slate-600 mb-1">Drop files here or click to browse</p>
              <p className="text-xs text-slate-400">Certificates, IDs, credentials, medical docs · Max 10MB</p>
              <button className="mt-4 btn-primary mx-auto text-xs py-2">Browse Files</button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['📄 Academic Certificates','🪪 National ID','📋 NYSC Certificate','🏥 Medical Records'].map(d=>(
                <span key={d} className="text-[10px] bg-slate-50 text-slate-500 border border-slate-100 px-2.5 py-1 rounded-full font-medium">{d}</span>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="text-sm font-extrabold text-slate-800 mb-4">My Uploaded Documents</h3>
            <div className="space-y-3">
              {DOCS.map((d,i)=>(
                <div key={i} className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xl">{d.icon}</span>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-700 truncate">{d.name}</p><p className="text-[10px] text-slate-400 mt-0.5">Uploaded {d.date}</p></div>
                  {d.status==='verified'
                    ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap"><CheckCircle size={9}/>Verified</span>
                    : <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full whitespace-nowrap"><Clock size={9}/>Pending</span>
                  }
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
              View and download salary slips by period. In production this pulls from your payroll engine (e.g. Oracle / SAP) with encryption and watermarking.
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
                      onClick={() => window.alert(`Download PDF (prototype)\n\n${p.ref}.pdf would be generated securely.`)}
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
              {PAYSLIP_DETAIL_LINES.map((line, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-600">{line.label}</span>
                  <span className={`font-mono font-semibold ${line.amount.startsWith('-') ? 'text-red-600' : 'text-slate-800'}`}>
                    {line.amount}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold pt-3 border-t border-slate-100">
                <span className="text-slate-800">Net pay</span>
                <span className="font-mono text-[#006838]">{payslipDetail.net}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-4">Sample lines only — actual payslips follow statutory deductions and GL mapping.</p>
          </div>
        </div>
      )}

      {tab==='history' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100"><h2 className="text-sm font-extrabold text-slate-800">Leave History — 2026</h2></div>
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">
              <th className="table-th">Leave Type</th>
              <th className="table-th">Duration</th>
              <th className="table-th">Dates</th>
              <th className="table-th">Status</th>
            </tr></thead>
            <tbody>
              {leaveHistoryRows.map((l,i)=>(
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="table-td font-semibold">{l.type}</td>
                  <td className="table-td text-slate-500">{l.duration}</td>
                  <td className="table-td text-slate-500">{l.dates}</td>
                  <td className="table-td"><StatusBadge status={l.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
