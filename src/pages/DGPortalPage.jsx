import { useState } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import {
  DG_DIRECTORATES, DG_PENDING_APPROVALS, DG_ISSUES,
  DG_MEETING_REQUESTS, DG_ESIGNATURE_QUEUE,
} from '../data/mock'
import {
  LayoutDashboard, Building2, ClipboardCheck, CalendarDays,
  AlertTriangle, PenLine, ChevronDown, ChevronRight, CheckCircle2,
  RotateCcw, X, Plus, Send, FileText, Users, ShieldCheck,
  MessageSquare, Zap, Bell, Lock, Paperclip,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line, AreaChart, Area,
} from 'recharts'

// ── helpers ──────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:            'bg-amber-50 text-amber-700 border-amber-200',
    pending_dg:         'bg-amber-50 text-amber-700 border-amber-200',
    confirmed:          'bg-teal-50 text-teal-700 border-teal-200',
    submitted:          'bg-blue-50 text-blue-700 border-blue-200',
    open:               'bg-red-50 text-red-700 border-red-200',
    escalated:          'bg-red-100 text-red-800 border-red-300',
    in_review:          'bg-purple-50 text-purple-700 border-purple-200',
    awaiting_signature: 'bg-amber-50 text-amber-700 border-amber-200',
    signed:             'bg-green-50 text-[#006838] border-green-200',
    approved:           'bg-green-50 text-[#006838] border-green-200',
    returned:           'bg-red-50 text-red-600 border-red-200',
    closed:             'bg-slate-50 text-slate-500 border-slate-200',
    cancelled:          'bg-red-50 text-red-600 border-red-200',
  }
  const cls = map[status] ?? 'bg-slate-50 text-slate-500 border-slate-200'
  return (
    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cls} capitalize`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

const PRIORITY_COLOR = {
  Critical: 'text-red-600',
  High:     'text-red-500',
  Medium:   'text-amber-600',
  Low:      'text-slate-400',
}
function PriorityPip({ p }) {
  const bg =
    p === 'Critical' ? 'bg-red-600' :
    p === 'High'     ? 'bg-red-400' :
    p === 'Medium'   ? 'bg-amber-400' : 'bg-slate-300'
  return <span className={`w-2 h-2 rounded-full inline-block flex-shrink-0 mt-1 ${bg}`} title={p} />
}

// ── chart palette ────────────────────────────────────────────────
const CHART_GREEN   = '#006838'
const CHART_COLORS  = ['#006838','#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16','#ec4899']
const PIE_APPROVAL  = ['#f59e0b','#006838','#ef4444']   // pending / approved / returned
const PIE_ISSUE     = ['#ef4444','#f97316','#8b5cf6','#94a3b8']  // escalated/open/in_review/closed
const PIE_SIG       = ['#f59e0b','#006838']              // awaiting / signed

// short label helper (truncate for axis)
const short = s => s.length > 14 ? s.slice(0, 13) + '…' : s

// custom tooltip wrapper
function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      <h4 className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wide">{title}</h4>
      {children}
    </div>
  )
}

// ── Overview tab component ────────────────────────────────────────
function OverviewCharts({ pendingAprs, pendingSigs, totalStaff, setMainTab, approvals, issues, meetings, sigQueue }) {
  // ── data derivations ──
  const staffData = DG_DIRECTORATES.map(d => ({ name: short(d.name), staff: d.headcount, type: d.type }))

  const complianceData = DG_DIRECTORATES.map(d => ({ name: short(d.name), compliance: d.complianceRate }))

  const approvalBreakdown = [
    { name: 'Pending',  value: approvals.filter(a => a.status === 'pending').length },
    { name: 'Approved', value: approvals.filter(a => a.status === 'approved').length },
    { name: 'Returned', value: approvals.filter(a => a.status === 'returned').length },
  ]

  const issueBreakdown = [
    { name: 'Escalated', value: issues.filter(i => i.status === 'escalated').length },
    { name: 'Open',      value: issues.filter(i => i.status === 'open').length },
    { name: 'In Review', value: issues.filter(i => i.status === 'in_review').length },
    { name: 'Closed',    value: issues.filter(i => i.status === 'closed').length },
  ]

  const sigBreakdown = [
    { name: 'Awaiting', value: sigQueue.filter(s => s.status === 'awaiting_signature').length },
    { name: 'Signed',   value: sigQueue.filter(s => s.status === 'signed').length },
  ]

  // Priority split across all approvals
  const priorityData = ['Critical','High','Medium','Low'].map(p => ({
    name: p,
    count: approvals.filter(a => a.priority === p).length,
  }))

  // Radar data: org performance across dimensions
  const radarData = DG_DIRECTORATES.slice(0, 6).map(d => ({
    org: short(d.name),
    Compliance:  d.complianceRate,
    Headcount:   Math.round((d.headcount / 200) * 100),
    Vacancies:   Math.round(((10 - d.openPositions) / 10) * 100),
  }))

  // Monthly budget trend (synthetic Q1 data from Finance KPI)
  const budgetTrend = [
    { month: 'Jan 2026', utilised: 18, revenue: 580 },
    { month: 'Feb 2026', utilised: 23, revenue: 620 },
    { month: 'Mar 2026', utilised: 27, revenue: 640 },
  ]

  // Trainees monthly trend (Training directorate)
  const traineeTrend = [
    { month: 'Jan', count: 1420 },
    { month: 'Feb', count: 1680 },
    { month: 'Mar', count: 1712 },
  ]

  const openIssues = issues.filter(i => i.status !== 'closed').length

  return (
    <div className="space-y-5">
      {/* ── Action alert banner ── */}
      {(pendingAprs > 0 || pendingSigs > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 flex items-start gap-3">
          <Bell size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700 space-y-0.5">
            {pendingAprs > 0 && (
              <div>• <strong>{pendingAprs}</strong> approval{pendingAprs !== 1 ? 's' : ''} awaiting decision —{' '}
                <button onClick={() => setMainTab('approvals')} className="underline font-bold hover:text-amber-900">Go to Approvals</button>
              </div>
            )}
            {pendingSigs > 0 && <div>• <strong>{pendingSigs}</strong> document{pendingSigs !== 1 ? 's' : ''} awaiting e-signature.</div>}
          </div>
        </div>
      )}

      {/* ── Row 1: Staff by Org (bar) + Compliance by Org (bar) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Staff Headcount by Directorate / Unit">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={staffData} margin={{ top: 4, right: 8, left: -10, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e2e8f0' }}
                formatter={(v, _, p) => [`${v} staff`, p.payload.type]}
              />
              <Bar dataKey="staff" radius={[6, 6, 0, 0]}>
                {staffData.map((d, i) => (
                  <Cell key={i} fill={d.type === 'Directorate' ? CHART_GREEN : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center">
            <span className="flex items-center gap-1.5 text-[10px] text-slate-500"><span className="w-3 h-3 rounded bg-[#006838] inline-block"/>Directorate</span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-500"><span className="w-3 h-3 rounded bg-blue-500 inline-block"/>Unit</span>
          </div>
        </ChartCard>

        <ChartCard title="Compliance Rate by Org (%)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={complianceData} layout="vertical" margin={{ top: 4, right: 20, left: 110, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[70, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} unit="%" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: '#64748b' }} width={108} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e2e8f0' }}
                formatter={v => [`${v}%`, 'Compliance']}
              />
              <Bar dataKey="compliance" radius={[0, 6, 6, 0]}>
                {complianceData.map((d, i) => (
                  <Cell key={i} fill={d.compliance >= 95 ? '#006838' : d.compliance >= 85 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 2: Approvals pie + Issues pie + Signatures pie ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <ChartCard title="Approvals Status">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={approvalBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                dataKey="value" paddingAngle={3} label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''} labelLine={false}
                fontSize={9}>
                {approvalBreakdown.map((_, i) => <Cell key={i} fill={PIE_APPROVAL[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-1">
            {approvalBreakdown.map((d, i) => (
              <span key={i} className="flex items-center gap-1 text-[10px] text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: PIE_APPROVAL[i] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Issues by Status">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={issueBreakdown.filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={72}
                dataKey="value" paddingAngle={3}
                label={({ name, value }) => `${name}:${value}`} labelLine={false} fontSize={9}>
                {issueBreakdown.map((_, i) => <Cell key={i} fill={PIE_ISSUE[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 justify-center mt-1">
            {issueBreakdown.map((d, i) => (
              <span key={i} className="flex items-center gap-1 text-[10px] text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: PIE_ISSUE[i] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="E-Signature Queue">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={sigBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={72}
                dataKey="value" paddingAngle={4}
                label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={9}>
                {sigBreakdown.map((_, i) => <Cell key={i} fill={PIE_SIG[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-1">
            {sigBreakdown.map((d, i) => (
              <span key={i} className="flex items-center gap-1 text-[10px] text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: PIE_SIG[i] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ── Row 3: Approval priority bar + Budget trend area chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Approval Priority Breakdown">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                <Cell fill="#ef4444" />
                <Cell fill="#f97316" />
                <Cell fill="#f59e0b" />
                <Cell fill="#94a3b8" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Q1 2026 Budget Utilisation vs Revenue (₦B)">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={budgetTrend} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
              <defs>
                <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#006838" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#006838" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} unit="M" />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e2e8f0' }}
                formatter={(v, name) => [`₦${v}M`, name === 'revenue' ? 'Revenue' : 'Expenditure']} />
              <Area type="monotone" dataKey="revenue" stroke="#006838" strokeWidth={2} fill="url(#gradRev)" dot={{ r: 4, fill: '#006838' }} name="revenue" />
              <Area type="monotone" dataKey="utilised" stroke="#3b82f6" strokeWidth={2} fill="url(#gradExp)" dot={{ r: 4, fill: '#3b82f6' }} name="utilised" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-5 justify-center mt-1">
            <span className="flex items-center gap-1.5 text-[10px] text-slate-500"><span className="w-3 h-1.5 rounded bg-[#006838] inline-block" />Revenue</span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-500"><span className="w-3 h-1.5 rounded bg-blue-500 inline-block" />Expenditure</span>
          </div>
        </ChartCard>
      </div>

      {/* ── Row 4: Trainee growth (line) + Radar (org performance) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Q1 2026 Trainee Volume — Monthly Growth">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={traineeTrend} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e2e8f0' }}
                formatter={v => [v.toLocaleString(), 'Trainees']} />
              <Line type="monotone" dataKey="count" stroke="#006838" strokeWidth={2.5}
                dot={{ r: 5, fill: '#006838', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Org Performance Radar — Top 6 Directorates">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={80}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="org" tick={{ fontSize: 8, fill: '#64748b' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: '#94a3b8' }} />
              <Radar name="Compliance" dataKey="Compliance" stroke="#006838" fill="#006838" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Headcount %" dataKey="Headcount" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={1.5} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e2e8f0' }} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 5: Summary table ── */}
      <div className="card overflow-x-auto">
        <h4 className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wide">All Directorates & Units — Snapshot</h4>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50">
              {['Name', 'Type', 'Head', 'Staff', 'Report', 'Status', 'Compliance'].map(h => (
                <th key={h} className="text-left px-3 py-2 font-semibold text-slate-600 first:rounded-l-xl last:rounded-r-xl whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DG_DIRECTORATES.map(d => (
              <tr key={d.id} className="border-t border-slate-50 hover:bg-slate-50/60 transition-colors">
                <td className="px-3 py-2.5 font-semibold text-slate-800">{d.name}</td>
                <td className="px-3 py-2.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    d.type === 'Directorate' ? 'bg-[#006838]/10 text-[#006838]' : 'bg-blue-50 text-blue-700'
                  }`}>{d.type}</span>
                </td>
                <td className="px-3 py-2.5 text-slate-500">{d.head}</td>
                <td className="px-3 py-2.5 font-bold text-slate-700">{d.headcount}</td>
                <td className="px-3 py-2.5 text-slate-500 max-w-[140px] truncate">{d.latestReport.title}</td>
                <td className="px-3 py-2.5"><StatusBadge status={d.latestReport.status} /></td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-14 bg-slate-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${
                        d.complianceRate >= 95 ? 'bg-[#006838]' : d.complianceRate >= 85 ? 'bg-amber-400' : 'bg-red-400'
                      }`} style={{ width: `${d.complianceRate}%` }} />
                    </div>
                    <span className="font-bold text-slate-700">{d.complianceRate}%</span>
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

// ─────────────────────────────────────────────────────────────────
export default function DGPortalPage() {
  const [mainTab, setMainTab] = useState('overview')

  // Reports
  const [expandedDir, setExpandedDir] = useState(null)

  // Approvals
  const [approvals, setApprovals] = useState(DG_PENDING_APPROVALS)
  const [approvalNote, setApprovalNote] = useState({})
  const [expandedApr, setExpandedApr] = useState(null)
  const [sigPin, setSigPin] = useState({})

  function approvalAction(id, action) {
    setApprovals(prev => prev.map(a => {
      if (a.id !== id) return a
      if (action === 'approve') {
        if (!sigPin[id] || sigPin[id].trim().length < 2) {
          alert('Please enter your name/initials as e-signature before approving.')
          return a
        }
        return {
          ...a,
          status: 'approved',
          signedBy: sigPin[id],
          signedAt: '07 Apr 2026 ' + new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
        }
      }
      if (action === 'return') {
        return { ...a, status: 'returned', note: approvalNote[id] || 'Returned for revision.' }
      }
      return a
    }))
  }

  // Issues
  const [issues, setIssues] = useState(DG_ISSUES)
  const [commentDraft, setCommentDraft] = useState({})
  const [expandedIss, setExpandedIss] = useState(null)

  function addComment(id) {
    const text = (commentDraft[id] || '').trim()
    if (!text) return
    setIssues(prev => prev.map(iss => iss.id !== id ? iss : {
      ...iss,
      comments: [
        ...iss.comments,
        {
          author: 'Director General',
          text,
          date: '07 Apr 2026 ' + new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }))
    setCommentDraft(p => ({ ...p, [id]: '' }))
  }

  function closeIssue(id) {
    setIssues(prev => prev.map(i => i.id !== id ? i : { ...i, status: 'closed' }))
  }

  // Meetings
  const [meetings, setMeetings]     = useState(DG_MEETING_REQUESTS)
  const [showNewMtg, setShowNewMtg] = useState(false)
  const [newMtg, setNewMtg]         = useState({ title: '', date: '', time: '', venue: '', invitees: '', agenda: '' })

  function confirmMeeting(id) {
    setMeetings(prev => prev.map(m => m.id !== id ? m : { ...m, status: 'confirmed' }))
  }
  function cancelMeeting(id) {
    setMeetings(prev => prev.map(m => m.id !== id ? m : { ...m, status: 'cancelled' }))
  }
  function scheduleNewMeeting() {
    if (!newMtg.title.trim() || !newMtg.date) return
    setMeetings(prev => [...prev, {
      id:        'MTG' + Date.now(),
      title:     newMtg.title,
      scheduled: newMtg.date + (newMtg.time ? ', ' + newMtg.time : ''),
      venue:     newMtg.venue || 'TBD',
      organiser: 'Office of the DG',
      invitees:  newMtg.invitees ? newMtg.invitees.split(',').map(s => s.trim()) : ['TBD'],
      status:    'confirmed',
      agenda:    newMtg.agenda ? newMtg.agenda.split('\n').filter(Boolean) : [],
    }])
    setNewMtg({ title: '', date: '', time: '', venue: '', invitees: '', agenda: '' })
    setShowNewMtg(false)
  }

  // E-Signature queue
  const [sigQueue, setSigQueue]       = useState(DG_ESIGNATURE_QUEUE)
  const [sigNameInput, setSigNameInput] = useState({})

  function signDoc(id) {
    const name = (sigNameInput[id] || '').trim()
    if (!name) { alert('Please type your full name to apply your e-signature.'); return }
    setSigQueue(prev => prev.map(d => d.id !== id ? d : {
      ...d,
      status:   'signed',
      signedBy: name,
      signedAt: '07 Apr 2026',
    }))
  }

  // Computed counts
  const pendingAprs = approvals.filter(a => a.status === 'pending').length
  const openIssues  = issues.filter(i => i.status !== 'closed').length
  const pendingSigs = sigQueue.filter(s => s.status === 'awaiting_signature').length
  const totalStaff  = DG_DIRECTORATES.reduce((s, d) => s + d.headcount, 0)

  const MAIN_TABS = [
    { id: 'overview',  icon: LayoutDashboard, label: 'Executive Overview' },
    { id: 'reports',   icon: Building2,        label: 'Directorate Reports' },
    { id: 'approvals', icon: ClipboardCheck,   label: 'Approvals & E-Sign' },
    { id: 'meetings',  icon: CalendarDays,     label: 'Meetings' },
    { id: 'issues',    icon: AlertTriangle,    label: 'Issues & Comments' },
  ]

  return (
    <div className="animate-fade-up">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Director General's Portal</h1>
            <p className="text-sm text-slate-400">Consolidated view · Approvals · E-Signature · Meetings · Issues</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-[#006838]/10 border border-[#006838]/20 rounded-xl px-4 py-2">
          <div className="w-7 h-7 rounded-full bg-[#006838] flex items-center justify-center text-white text-[10px] font-extrabold">DG</div>
          <div className="text-xs">
            <div className="font-bold text-slate-800">Engr. Aliyu Abdullahi</div>
            <div className="text-slate-400">Director General, NAPTIN</div>
          </div>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Staff',        value: totalStaff.toLocaleString(), icon: Users,         bg: 'bg-green-50',  color: 'text-[#006838]' },
          { label: 'Pending Approvals',  value: pendingAprs,                  icon: ClipboardCheck, bg: 'bg-amber-50',  color: 'text-amber-600' },
          { label: 'Open Issues',        value: openIssues,                   icon: AlertTriangle,  bg: 'bg-red-50',    color: 'text-red-600'   },
          { label: 'Awaiting Signature', value: pendingSigs,                  icon: PenLine,        bg: 'bg-blue-50',   color: 'text-blue-600'  },
        ].map((k, i) => (
          <div key={i} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${k.bg} ${k.color} flex items-center justify-center flex-shrink-0`}>
              <k.icon size={18} />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900">{k.value}</div>
              <div className="text-xs text-slate-400 font-medium">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main tab buttons ── */}
      <div className="flex items-center gap-1 mb-5 flex-wrap">
        {MAIN_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setMainTab(t.id)}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mainTab === t.id
                ? 'bg-[#006838] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 bg-white border border-slate-100'
            }`}
          >
            <t.icon size={14} />
            {t.label}
            {t.id === 'approvals' && pendingAprs > 0 && (
              <span className="bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ml-0.5">{pendingAprs}</span>
            )}
            {t.id === 'issues' && openIssues > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ml-0.5">{openIssues}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TAB 1 — EXECUTIVE OVERVIEW (with charts)
      ══════════════════════════════════════════════ */}
      {mainTab === 'overview' && <OverviewCharts
        pendingAprs={pendingAprs}
        pendingSigs={pendingSigs}
        totalStaff={totalStaff}
        setMainTab={setMainTab}
        approvals={approvals}
        issues={issues}
        meetings={meetings}
        sigQueue={sigQueue}
      />}

      {/* ══════════════════════════════════════════════
          TAB 2 — DIRECTORATE / UNIT REPORTS
      ══════════════════════════════════════════════ */}
      {mainTab === 'reports' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 mb-3">
            Expand any directorate or unit to review its Q1 2026 report, KPIs, and sub-unit breakdown.
          </p>
          {DG_DIRECTORATES.map(d => (
            <div key={d.id} className="card hover:shadow-sm transition-shadow">
              <button
                className="w-full flex items-start justify-between"
                onClick={() => setExpandedDir(expandedDir === d.id ? null : d.id)}
              >
                <div className="flex items-start gap-3 text-left">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    d.type === 'Directorate' ? 'bg-[#006838]/10' : 'bg-blue-50'
                  }`}>
                    <Building2 size={16} className={d.type === 'Directorate' ? 'text-[#006838]' : 'text-blue-600'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-800">{d.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        d.type === 'Directorate'
                          ? 'bg-[#006838]/10 text-[#006838] border-green-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>{d.type}</span>
                      <StatusBadge status={d.latestReport.status} />
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{d.head} · {d.headcount} staff</div>
                  </div>
                </div>
                {expandedDir === d.id
                  ? <ChevronDown size={15} className="text-slate-400 flex-shrink-0 mt-1" />
                  : <ChevronRight size={15} className="text-slate-400 flex-shrink-0 mt-1" />}
              </button>

              {expandedDir === d.id && (
                <div className="mt-4 space-y-4 border-t border-slate-50 pt-4">
                  {/* KPI chips */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {d.kpis.map((k, i) => (
                      <div key={i} className="bg-slate-50 rounded-xl px-3 py-2.5 text-center">
                        <div className="text-sm font-extrabold text-slate-800">{k.value}</div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">{k.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Report narrative */}
                  <div className="bg-blue-50/60 border border-blue-100 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <span className="text-xs font-bold text-slate-700">{d.latestReport.title}</span>
                      <span className="text-[10px] text-slate-400">{d.latestReport.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{d.latestReport.summary}</p>
                  </div>

                  {/* Sub-units */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sub-units</div>
                    <div className="flex flex-wrap gap-2">
                      {d.units.map((u, i) => (
                        <span key={i} className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-600 font-medium">
                          {u.name} <span className="text-slate-400">· {u.headCount}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 3 — APPROVALS & E-SIGN
      ══════════════════════════════════════════════ */}
      {mainTab === 'approvals' && (
        <div>
          {/* Summary counters */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: 'Pending',  count: approvals.filter(a => a.status === 'pending').length,  color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200'  },
              { label: 'Approved', count: approvals.filter(a => a.status === 'approved').length, color: 'text-[#006838]', bg: 'bg-green-50 border-green-200'  },
              { label: 'Returned', count: approvals.filter(a => a.status === 'returned').length, color: 'text-red-600',   bg: 'bg-red-50 border-red-200'      },
            ].map(s => (
              <div key={s.label} className={`card border ${s.bg} text-center py-5`}>
                <div className={`text-3xl font-extrabold ${s.color} mb-0.5`}>{s.count}</div>
                <div className="text-xs font-semibold text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Approval cards */}
          <div className="space-y-4">
            {approvals.map(a => (
              <div
                key={a.id}
                className={`card border-l-4 ${
                  a.priority === 'Critical' ? 'border-l-red-600' :
                  a.priority === 'High'     ? 'border-l-red-400' :
                  a.priority === 'Medium'   ? 'border-l-amber-400' : 'border-l-slate-200'
                }`}
              >
                <button
                  className="w-full flex items-start justify-between"
                  onClick={() => setExpandedApr(expandedApr === a.id ? null : a.id)}
                >
                  <div className="flex items-start gap-3 text-left">
                    <PriorityPip p={a.priority} />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-800">{a.title}</span>
                        <StatusBadge status={a.status} />
                        <span className={`text-[10px] font-bold ${PRIORITY_COLOR[a.priority]}`}>{a.priority}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {a.ref} · {a.dept} · Submitted {a.date} by {a.submittedBy}
                      </div>
                    </div>
                  </div>
                  {expandedApr === a.id
                    ? <ChevronDown size={15} className="text-slate-400" />
                    : <ChevronRight size={15} className="text-slate-400" />}
                </button>

                {expandedApr === a.id && (
                  <div className="mt-4 border-t border-slate-50 pt-4 space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed">{a.summary}</p>
                    {a.amount && (
                      <div className="text-xs">
                        <span className="text-slate-400">Amount: </span>
                        <span className="font-bold text-slate-700">{a.amount}</span>
                      </div>
                    )}

                    {/* Attachments */}
                    {a.attachments?.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Paperclip size={11} className="text-slate-400" />
                        {a.attachments.map(att => (
                          <span key={att} className="text-[10px] bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                            <FileText size={9} />{att}
                          </span>
                        ))}
                      </div>
                    )}

                    {a.status === 'pending' && (
                      <div className="space-y-3">
                        {/* E-Signature panel */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-2 mb-2">
                            <PenLine size={13} className="text-blue-600" />
                            <span className="text-xs font-bold text-slate-700">E-Signature — type your full name to authorise</span>
                          </div>
                          <input
                            value={sigPin[a.id] || ''}
                            onChange={e => setSigPin(p => ({ ...p, [a.id]: e.target.value }))}
                            placeholder="Full name (e.g. Engr. Aliyu Abdullahi)"
                            className="w-full text-xs border border-blue-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838] bg-white font-semibold italic text-slate-700"
                          />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => approvalAction(a.id, 'approve')}
                            className="flex items-center gap-1.5 text-xs font-bold bg-[#006838] text-white px-4 py-1.5 rounded-xl hover:bg-[#005530] transition-colors"
                          >
                            <CheckCircle2 size={12} />Approve &amp; Sign
                          </button>
                          <div className="flex items-center gap-2 ml-auto">
                            <input
                              value={approvalNote[a.id] || ''}
                              onChange={e => setApprovalNote(p => ({ ...p, [a.id]: e.target.value }))}
                              placeholder="Return reason (optional)"
                              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-[#006838] w-52"
                            />
                            <button
                              onClick={() => approvalAction(a.id, 'return')}
                              className="flex items-center gap-1 text-xs font-bold text-red-600 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
                            >
                              <RotateCcw size={12} />Return
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {a.status === 'approved' && (
                      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
                        <CheckCircle2 size={14} className="text-[#006838]" />
                        <div className="text-xs">
                          <span className="font-bold text-[#006838]">Approved &amp; Signed</span>
                          <span className="text-slate-500 ml-2">by {a.signedBy} · {a.signedAt}</span>
                        </div>
                      </div>
                    )}
                    {a.status === 'returned' && (
                      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                        <RotateCcw size={13} className="text-red-500" />
                        <span className="text-xs text-red-700 font-semibold">{a.note}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── E-Signature Queue ── */}
          <div className="mt-8">
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <PenLine size={14} className="text-[#006838]" />
              E-Signature Document Queue
            </h3>
            <div className="space-y-3">
              {sigQueue.map(doc => (
                <div key={doc.id} className="card">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-slate-800">{doc.title}</span>
                        <StatusBadge status={doc.status} />
                        <span className={`text-[10px] font-bold ${PRIORITY_COLOR[doc.urgency]}`}>{doc.urgency}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {doc.docRef} · Prepared by {doc.preparedBy} · {doc.date} · {doc.pages} pages
                      </div>

                      {doc.status === 'awaiting_signature' && (
                        <div className="flex items-center gap-2 mt-3">
                          <Lock size={11} className="text-slate-400" />
                          <input
                            value={sigNameInput[doc.id] || ''}
                            onChange={e => setSigNameInput(p => ({ ...p, [doc.id]: e.target.value }))}
                            placeholder="Type full name to e-sign…"
                            className="flex-1 max-w-xs text-xs border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-[#006838] italic font-semibold text-slate-700"
                          />
                          <button
                            onClick={() => signDoc(doc.id)}
                            className="flex items-center gap-1.5 text-xs font-bold bg-[#006838] text-white px-3 py-1.5 rounded-xl hover:bg-[#005530] transition-colors"
                          >
                            <PenLine size={11} />Sign
                          </button>
                        </div>
                      )}

                      {doc.status === 'signed' && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-[#006838] font-semibold">
                          <CheckCircle2 size={12} />
                          Signed by {doc.signedBy} · {doc.signedAt}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 4 — MEETINGS
      ══════════════════════════════════════════════ */}
      {mainTab === 'meetings' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Meeting Schedule ({meetings.length})</h3>
            <button
              onClick={() => setShowNewMtg(v => !v)}
              className="flex items-center gap-1.5 text-xs font-bold bg-[#006838] text-white px-3 py-1.5 rounded-xl hover:bg-[#005530] transition-colors"
            >
              <Plus size={12} />Call a Meeting
            </button>
          </div>

          {/* New meeting form */}
          {showNewMtg && (
            <div className="card mb-5 bg-green-50/40 border border-green-100">
              <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                <CalendarDays size={13} className="text-[#006838]" />Schedule New Meeting
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <input
                  className="lg:col-span-2 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]"
                  placeholder="Meeting title *"
                  value={newMtg.title}
                  onChange={e => setNewMtg(p => ({ ...p, title: e.target.value }))}
                />
                <input
                  type="date"
                  className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]"
                  value={newMtg.date}
                  onChange={e => setNewMtg(p => ({ ...p, date: e.target.value }))}
                />
                <input
                  type="time"
                  className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]"
                  value={newMtg.time}
                  onChange={e => setNewMtg(p => ({ ...p, time: e.target.value }))}
                />
                <input
                  className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]"
                  placeholder="Venue / location"
                  value={newMtg.venue}
                  onChange={e => setNewMtg(p => ({ ...p, venue: e.target.value }))}
                />
                <input
                  className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]"
                  placeholder="Invitees (comma-separated names)"
                  value={newMtg.invitees}
                  onChange={e => setNewMtg(p => ({ ...p, invitees: e.target.value }))}
                />
                <textarea
                  rows={3}
                  className="lg:col-span-2 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838] resize-none"
                  placeholder="Agenda items (one per line)"
                  value={newMtg.agenda}
                  onChange={e => setNewMtg(p => ({ ...p, agenda: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={scheduleNewMeeting}
                  className="flex items-center gap-1.5 text-xs font-bold bg-[#006838] text-white px-3 py-1.5 rounded-xl hover:bg-[#005530] transition-colors"
                >
                  <CheckCircle2 size={12} />Schedule Meeting
                </button>
                <button
                  onClick={() => setShowNewMtg(false)}
                  className="flex items-center gap-1 text-xs text-slate-500 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <X size={12} />Cancel
                </button>
              </div>
            </div>
          )}

          {/* Meeting cards */}
          <div className="space-y-4">
            {meetings.map(m => (
              <div key={m.id} className="card">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <CalendarDays size={13} className="text-[#006838]" />
                      <span className="text-sm font-bold text-slate-800">{m.title}</span>
                      <StatusBadge status={m.status} />
                    </div>
                    <div className="text-xs text-slate-400 space-x-2">
                      <span>{m.scheduled}</span>
                      <span>·</span>
                      <span>{m.venue}</span>
                      <span>·</span>
                      <span>Organised by {m.organiser}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.status === 'pending_dg' && (
                      <button
                        onClick={() => confirmMeeting(m.id)}
                        className="flex items-center gap-1 text-[10px] font-bold text-teal-700 border border-teal-200 px-2.5 py-1 rounded-lg hover:bg-teal-50 transition-colors"
                      >
                        <CheckCircle2 size={10} />Confirm
                      </button>
                    )}
                    {(m.status === 'pending_dg' || m.status === 'confirmed') && (
                      <button
                        onClick={() => cancelMeeting(m.id)}
                        className="flex items-center gap-1 text-[10px] font-bold text-red-600 border border-red-200 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <X size={10} />Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Invitees */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {m.invitees.map((inv, i) => (
                    <span key={i} className="text-[10px] bg-slate-50 border border-slate-200 rounded-full px-2.5 py-0.5 text-slate-600 font-medium flex items-center gap-1">
                      <Users size={8} />{inv}
                    </span>
                  ))}
                </div>

                {/* Agenda */}
                {m.agenda?.length > 0 && (
                  <div className="border-t border-slate-50 pt-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Agenda</div>
                    <ol className="space-y-1">
                      {m.agenda.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="text-[#006838] font-bold w-4 flex-shrink-0">{i + 1}.</span>
                          {item}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 5 — ISSUES & COMMENTS
      ══════════════════════════════════════════════ */}
      {mainTab === 'issues' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 mb-2">
            Issues escalated to the DG. Add directives, post comments, or close resolved issues.
          </p>
          {issues.map(iss => (
            <div
              key={iss.id}
              className={`card border-l-4 ${
                iss.status === 'escalated' ? 'border-l-red-600' :
                iss.status === 'in_review'  ? 'border-l-purple-400' :
                iss.status === 'closed'     ? 'border-l-green-500' : 'border-l-amber-400'
              }`}
            >
              <button
                className="w-full flex items-start justify-between"
                onClick={() => setExpandedIss(expandedIss === iss.id ? null : iss.id)}
              >
                <div className="flex items-start gap-3 text-left">
                  <PriorityPip p={iss.priority} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-800">{iss.title}</span>
                      <StatusBadge status={iss.status} />
                      <span className={`text-[10px] font-bold ${PRIORITY_COLOR[iss.priority]}`}>{iss.priority}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {iss.dept} · Raised by {iss.raisedBy} · {iss.date} · {iss.comments.length} comment{iss.comments.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                {expandedIss === iss.id
                  ? <ChevronDown size={15} className="text-slate-400" />
                  : <ChevronRight size={15} className="text-slate-400" />}
              </button>

              {expandedIss === iss.id && (
                <div className="mt-4 border-t border-slate-50 pt-4 space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">{iss.description}</p>

                  {/* Comment thread */}
                  {iss.comments.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comments</div>
                      {iss.comments.map((c, i) => (
                        <div
                          key={i}
                          className={`rounded-xl px-4 py-2.5 text-xs ${
                            c.author === 'Director General'
                              ? 'bg-[#006838]/5 border border-[#006838]/20'
                              : 'bg-slate-50 border border-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-bold ${c.author === 'Director General' ? 'text-[#006838]' : 'text-slate-700'}`}>
                              {c.author}
                            </span>
                            <span className="text-[10px] text-slate-400">{c.date}</span>
                          </div>
                          <span className="text-slate-600">{c.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* DG comment input */}
                  {iss.status !== 'closed' && (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#006838] flex items-center justify-center text-white text-[9px] font-extrabold flex-shrink-0 mt-0.5">
                          DG
                        </div>
                        <textarea
                          rows={2}
                          value={commentDraft[iss.id] || ''}
                          onChange={e => setCommentDraft(p => ({ ...p, [iss.id]: e.target.value }))}
                          placeholder="Add your directive or comment…"
                          className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838] resize-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addComment(iss.id)}
                          disabled={!(commentDraft[iss.id] || '').trim()}
                          className="flex items-center gap-1.5 text-xs font-bold bg-[#006838] text-white px-3 py-1.5 rounded-xl hover:bg-[#005530] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send size={11} />Post Comment
                        </button>
                        <button
                          onClick={() => closeIssue(iss.id)}
                          className="flex items-center gap-1 text-xs font-bold text-[#006838] border border-green-200 px-3 py-1.5 rounded-xl hover:bg-green-50 ml-auto transition-colors"
                        >
                          <CheckCircle2 size={12} />Close Issue
                        </button>
                      </div>
                    </div>
                  )}

                  {iss.status === 'closed' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-[#006838] font-semibold">
                      <CheckCircle2 size={13} />Issue closed by Director General
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
