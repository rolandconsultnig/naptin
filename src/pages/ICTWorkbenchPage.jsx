import { useState } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import { useNotifications } from '../context/NotificationContext'
import {
  X, CheckCircle, Plus, Download, RefreshCw, Send, ChevronDown,
  ChevronRight, AlertTriangle, Shield, Server, HardDrive, Headphones,
  Wrench, Link, Users, Clock, CheckCircle2, Database, Activity, Lock,
  Zap, FileText, UserCheck, UserX, Tag, Archive, Search,
} from 'lucide-react'

/* ─── Utilities ─── */
function useToast() {
  const [msg, setMsg] = useState(null)
  const show = (m) => { setMsg(m); setTimeout(() => setMsg(null), 3500) }
  return { msg, show }
}
function Toast({ msg, clear }) {
  if (!msg) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 max-w-sm">
      <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
      <span className="flex-1">{msg}</span>
      <button onClick={clear}><X size={14} /></button>
    </div>
  )
}
function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button onClick={onClose}><X size={16} className="text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
function Fld({ label, children, required }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-slate-500 uppercase">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <div className="mt-0.5">{children}</div>
    </div>
  )
}
function SBadge({ label, color /* green|amber|red|blue|slate */ }) {
  const map = { green: 'bg-green-100 text-green-700 border-green-200', amber: 'bg-amber-100 text-amber-700 border-amber-200', red: 'bg-red-100 text-red-700 border-red-200', blue: 'bg-blue-100 text-blue-700 border-blue-200', slate: 'bg-slate-100 text-slate-500 border-slate-200', purple: 'bg-purple-100 text-purple-700 border-purple-200' }
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[color] || map.slate}`}>{label}</span>
}

/* ═══════════════════════════════ TAB 1: HELP DESK ═══════════════════════════════ */
const SLA_MAP = { Critical: { response: '15 min', resolution: '4 hr' }, High: { response: '1 hr', resolution: '8 hr' }, Medium: { response: '4 hr', resolution: '24 hr' }, Low: { response: '24 hr', resolution: '3 days' } }
const TICKETS_INIT = [
  { id: 'TKT-2026-0142', title: 'VPN latency >500ms at Kaduna RTC', category: 'Network', priority: 'High', status: 'In Progress', assignee: 'E. Bello', raised: '05 Apr 2026', satisfaction: null, notes: 'Remote diagnostic underway. Cisco switch port config suspected.', slaBreached: false },
  { id: 'TKT-2026-0141', title: 'Email delivery failure — Finance outbound', category: 'Email', priority: 'Critical', status: 'Resolved', assignee: 'E. Bello', raised: '03 Apr 2026', satisfaction: 5, notes: 'SMTP relay misconfiguration corrected. All mail flowing.', slaBreached: false },
  { id: 'TKT-2026-0140', title: 'Printer offline — Block B HR', category: 'Hardware', priority: 'Low', status: 'Queued', assignee: 'ICT Service Desk', raised: '02 Apr 2026', satisfaction: null, notes: '', slaBreached: true },
  { id: 'TKT-2026-0139', title: 'New user accounts — 3 Finance hires', category: 'Access', priority: 'Medium', status: 'Resolved', assignee: 'ICT Admin', raised: '06 Apr 2026', satisfaction: 4, notes: 'AD + email + ERP accounts provisioned. Credentials handed over.', slaBreached: false },
  { id: 'TKT-2026-0138', title: 'Laptop screen cracked — Policy Officer', category: 'Hardware', priority: 'Medium', status: 'In Progress', assignee: 'E. Umar', raised: '01 Apr 2026', satisfaction: null, notes: 'Warranty claim logged. Replacement unit approved.', slaBreached: false },
]

function HelpDeskTab({ toast }) {
  const { addNotification } = useNotifications()
  const [tickets, setTickets] = useState(TICKETS_INIT)
  const [expanded, setExpanded] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showResolveModal, setShowResolveModal] = useState(null)
  const [filterPriority, setFilterPriority] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ title: '', category: 'Hardware', priority: 'Medium', description: '' })
  const [resNotes, setResNotes] = useState('')

  const PRIORITY_COLOR = { Critical: 'red', High: 'amber', Medium: 'blue', Low: 'slate' }
  const STATUS_COLOR = { 'In Progress': 'blue', Resolved: 'green', Queued: 'amber', Closed: 'slate' }

  const visible = tickets.filter(t => {
    const mP = filterPriority === 'All' || t.priority === filterPriority
    const mS = filterStatus === 'All' || t.status === filterStatus
    const mQ = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.id.includes(search)
    return mP && mS && mQ
  })

  const handleCreate = () => {
    if (!form.title) { toast.show('Title is required.'); return }
    const id = `TKT-2026-${String(146 + tickets.length).padStart(4, '0')}`
    const assignee = form.priority === 'Critical' ? 'ICT Head (escalated)' : 'ICT Service Desk'
    setTickets(p => [{ id, ...form, status: 'Queued', assignee, raised: '07 Apr 2026', satisfaction: null, notes: '', slaBreached: false }, ...p])
    toast.show(`${id} created. ${form.priority === 'Critical' ? 'ESCALATED to ICT Head.' : `Assigned to ${assignee}.`}`)
    addNotification({ title: `New Ticket: ${id}`, sub: `${form.title} — ${form.priority} priority, assigned to ${assignee}.`, type: form.priority === 'Critical' ? 'error' : 'task', link: '/app/ict-workbench', module: 'ICT Workbench' })
    setShowCreate(false); setForm({ title: '', category: 'Hardware', priority: 'Medium', description: '' })
  }

  const handleResolve = (id) => {
    if (!resNotes) { toast.show('Resolution notes required.'); return }
    setTickets(p => p.map(t => t.id === id ? { ...t, status: 'Resolved', notes: resNotes } : t))
    toast.show(`${id} resolved. Satisfaction survey sent to requester.`)
    addNotification({ title: `Ticket Resolved: ${id}`, sub: `ICT ticket resolved. Satisfaction survey sent to requester.`, type: 'success', link: '/app/ict-workbench', module: 'ICT Workbench' })
    setShowResolveModal(null); setResNotes('')
  }

  const handleSatisfaction = (id, rating) => {
    setTickets(p => p.map(t => t.id === id ? { ...t, satisfaction: rating, status: rating <= 2 ? 'In Progress' : 'Closed' } : t))
    if (rating <= 2) toast.show(`Rating ${rating}/5 — Ticket re-opened for manager review.`)
    else toast.show(`Thank you — rated ${rating}/5.`)
  }

  const openCount = tickets.filter(t => !['Resolved', 'Closed'].includes(t.status)).length
  const slaBreaches = tickets.filter(t => t.slaBreached).length
  const avgSat = +(tickets.filter(t => t.satisfaction).reduce((s, t) => s + t.satisfaction, 0) / (tickets.filter(t => t.satisfaction).length || 1)).toFixed(1)

  return (
    <div className="space-y-4">
      {showCreate && (
        <Modal title="New Support Ticket" onClose={() => setShowCreate(false)}>
          <Fld label="Issue Title" required><input className="np-input w-full text-sm" placeholder="e.g. Cannot connect to shared drive" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></Fld>
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Category"><select className="np-input w-full text-sm" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}><option>Hardware</option><option>Software</option><option>Network</option><option>Email</option><option>Access</option><option>Security</option></select></Fld>
            <Fld label="Priority"><select className="np-input w-full text-sm" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></Fld>
          </div>
          <Fld label="Description"><textarea className="np-input w-full text-sm h-20" placeholder="Describe the issue in detail..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></Fld>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
            <strong>SLA:</strong> {SLA_MAP[form.priority]?.response} response · {SLA_MAP[form.priority]?.resolution} resolution
          </div>
          <div className="flex justify-end gap-2"><button className="btn-secondary text-sm" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn-primary text-sm" onClick={handleCreate}>Submit Ticket</button></div>
        </Modal>
      )}
      {showResolveModal && (
        <Modal title={`Resolve ${showResolveModal}`} onClose={() => setShowResolveModal(null)}>
          <Fld label="Resolution Notes" required><textarea className="np-input w-full text-sm h-24" placeholder="Describe what was done to resolve the issue..." value={resNotes} onChange={e => setResNotes(e.target.value)} /></Fld>
          <div className="flex justify-end gap-2"><button className="btn-secondary text-sm" onClick={() => setShowResolveModal(null)}>Cancel</button><button className="btn-primary text-sm" onClick={() => handleResolve(showResolveModal)}>Mark Resolved</button></div>
        </Modal>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        {[['Open Tickets', openCount, 'text-amber-600'], ['SLA Breaches', slaBreaches, slaBreaches > 0 ? 'text-red-600' : 'text-green-700'], ['Avg Satisfaction', `${avgSat}/5`, 'text-blue-700']].map(([label, val, cls]) => (
          <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
            <p className={`text-lg font-extrabold ${cls}`}>{val}</p><p className="text-[10px] text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5"><Search size={12} className="text-slate-400" /><input className="text-xs outline-none w-36 placeholder:text-slate-400" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <select className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 outline-none bg-white text-slate-600" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}><option value="All">All priorities</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select>
          <select className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 outline-none bg-white text-slate-600" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><option value="All">All statuses</option><option>Queued</option><option>In Progress</option><option>Resolved</option><option>Closed</option></select>
        </div>
        <button className="btn-primary text-sm" onClick={() => setShowCreate(true)}><Plus size={14} /> New Ticket</button>
      </div>

      <div className="space-y-3">
        {visible.map((t, i) => (
          <div key={i} className={`card ${t.slaBreached ? 'border border-red-200' : ''}`}>
            <button className="w-full flex items-start gap-3 text-left" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-[10px] text-slate-400">{t.id}</span>
                  <SBadge label={t.priority} color={PRIORITY_COLOR[t.priority]} />
                  <SBadge label={t.status} color={STATUS_COLOR[t.status]} />
                  <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{t.category}</span>
                  {t.slaBreached && <span className="text-[10px] font-bold text-red-600">⚠ SLA Breached</span>}
                </div>
                <p className="text-sm font-bold text-slate-800">{t.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{t.assignee} · {t.raised} · SLA: {SLA_MAP[t.priority]?.resolution} resolution</p>
              </div>
              {expanded === t.id ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
            </button>
            {expanded === t.id && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                {t.description && <p className="text-xs text-slate-600">{t.description}</p>}
                {t.notes && <div className="bg-slate-50 rounded-xl p-3"><p className="text-[10px] font-bold text-slate-500 mb-1">Resolution / Update</p><p className="text-xs text-slate-700">{t.notes}</p></div>}
                <div className="flex items-center gap-2 flex-wrap">
                  {['In Progress', 'Queued'].includes(t.status) && <button className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50" onClick={() => setShowResolveModal(t.id)}><CheckCircle2 size={11} className="inline mr-1" />Mark Resolved</button>}
                  {t.status === 'Resolved' && !t.satisfaction && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">Rate resolution:</span>
                      {[1, 2, 3, 4, 5].map(n => <button key={n} className="text-[10px] w-6 h-6 rounded-full bg-slate-100 hover:bg-[#006838] hover:text-white font-bold transition-colors" onClick={() => handleSatisfaction(t.id, n)}>{n}</button>)}
                    </div>
                  )}
                  {t.satisfaction && <span className="text-[10px] text-slate-400">User satisfaction: <strong>{t.satisfaction}/5</strong>{t.satisfaction <= 2 ? ' — Re-opened for review' : ''}</span>}
                </div>
              </div>
            )}
          </div>
        ))}
        {visible.length === 0 && <div className="card text-center py-8 text-sm text-slate-400">No tickets match current filters.</div>}
      </div>
    </div>
  )
}

/* ═══════════════════════════ TAB 2: USER ONBOARDING ═══════════════════════════ */
const ONBOARDING_INIT = [
  { id: 'OB-2026-014', name: 'Ibrahim K. Musa', dept: 'Finance', role: 'Finance Officer', startDate: '07 Apr 2026', status: 'active', tasks: { ad: true, email: true, erp: true, hardware: true, orientation: true, doorAccess: false } },
  { id: 'OB-2026-013', name: 'Fatima A. Suleiman', dept: 'Research & Statistics', role: 'Research Analyst', startDate: '07 Apr 2026', status: 'active', tasks: { ad: true, email: true, erp: false, hardware: false, orientation: false, doorAccess: false } },
  { id: 'OB-2026-012', name: 'Chukwudi E. Obi', dept: 'ICT', role: 'ICT Officer', startDate: '01 Mar 2026', status: 'completed', tasks: { ad: true, email: true, erp: true, hardware: true, orientation: true, doorAccess: true } },
]
const OFFBOARDING_INIT = [
  { id: 'OFF-2026-003', name: 'Grace T. Adeyemi', dept: 'Admin', role: 'Admin Officer', departDate: '15 Apr 2026', status: 'pending', tasks: { adDisabled: false, emailForwarded: false, dataBackup: false, hardwareReturned: false, accessRevoked: false } },
]
const TASK_LABELS = { ad: 'AD Account', email: 'Email Account', erp: 'ERP Access', hardware: 'Hardware Assigned', orientation: 'IT Orientation', doorAccess: 'Door Access' }
const OFF_TASK_LABELS = { adDisabled: 'AD Disabled', emailForwarded: 'Email Forwarded', dataBackup: 'Data Backed Up', hardwareReturned: 'Hardware Returned', accessRevoked: 'All Access Revoked' }

function UserOnboardingTab({ toast }) {
  const [onboarding, setOnboarding] = useState(ONBOARDING_INIT)
  const [offboarding, setOffboarding] = useState(OFFBOARDING_INIT)
  const [view, setView] = useState('onboarding')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', dept: '', role: '', startDate: '' })

  const handleStartOnboarding = (employeeId) => {
    setOnboarding(p => p.map(o => o.id === employeeId ? { ...o, tasks: { ...o.tasks, ad: true, email: true, erp: true } } : o))
    toast.show('Accounts created: Active Directory, Email, ERP. Hardware assignment pending.')
  }
  const handleTaskToggle = (employeeId, task) => {
    setOnboarding(p => p.map(o => {
      if (o.id !== employeeId) return o
      const newTasks = { ...o.tasks, [task]: !o.tasks[task] }
      const allDone = Object.values(newTasks).every(Boolean)
      return { ...o, tasks: newTasks, status: allDone ? 'completed' : 'active' }
    }))
    toast.show(`Task updated.`)
  }
  const handleOffTask = (employeeId, task) => {
    setOffboarding(p => p.map(o => {
      if (o.id !== employeeId) return o
      const newTasks = { ...o.tasks, [task]: !o.tasks[task] }
      const allDone = Object.values(newTasks).every(Boolean)
      return { ...o, tasks: newTasks, status: allDone ? 'completed' : 'in-progress' }
    }))
    toast.show('Offboarding task updated.')
  }
  const handleCreate = () => {
    if (!form.name || !form.dept || !form.startDate) { toast.show('Name, department and start date are required.'); return }
    const id = `OB-2026-${String(onboarding.length + 15).padStart(3, '0')}`
    setOnboarding(p => [...p, { id, ...form, status: 'pending', tasks: { ad: false, email: false, erp: false, hardware: false, orientation: false, doorAccess: false } }])
    toast.show(`${id} created. ICT notified — onboarding starts 2 days before ${form.startDate}.`)
    setShowModal(false); setForm({ name: '', dept: '', role: '', startDate: '' })
  }

  const taskPct = (tasks) => { const vals = Object.values(tasks); return Math.round(vals.filter(Boolean).length / vals.length * 100) }

  return (
    <div className="space-y-4">
      {showModal && (
        <Modal title="New Onboarding Request" onClose={() => setShowModal(false)}>
          <Fld label="Employee Name" required><input className="np-input w-full text-sm" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></Fld>
          <Fld label="Department" required><input className="np-input w-full text-sm" placeholder="e.g. Finance" value={form.dept} onChange={e => setForm(p => ({ ...p, dept: e.target.value }))} /></Fld>
          <Fld label="Job Role"><input className="np-input w-full text-sm" placeholder="e.g. Finance Officer" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} /></Fld>
          <Fld label="Start Date" required><input type="date" className="np-input w-full text-sm" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} /></Fld>
          <p className="text-[10px] text-slate-400">ICT will auto-provision AD, email, and ERP accounts based on department role mapping.</p>
          <div className="flex justify-end gap-2"><button className="btn-secondary text-sm" onClick={() => setShowModal(false)}>Cancel</button><button className="btn-primary text-sm" onClick={handleCreate}>Create Onboarding Record</button></div>
        </Modal>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1">
          {['onboarding', 'offboarding'].map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === v ? 'bg-[#006838] text-white' : 'text-slate-500 bg-white border border-slate-200 hover:bg-slate-50'}`}>{v === 'onboarding' ? 'Onboarding' : 'Offboarding'}</button>
          ))}
        </div>
        {view === 'onboarding' && <button className="btn-primary text-sm" onClick={() => setShowModal(true)}><UserCheck size={14} /> New Onboarding</button>}
      </div>

      {view === 'onboarding' && (
        <div className="space-y-4">
          {onboarding.map((o, i) => (
            <div key={i} className="card space-y-3">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1"><SBadge label={o.status === 'completed' ? 'Completed' : o.status === 'pending' ? 'Pending' : 'In Progress'} color={o.status === 'completed' ? 'green' : o.status === 'pending' ? 'slate' : 'blue'} /><span className="text-[10px] text-slate-400">{o.id}</span></div>
                  <p className="text-sm font-bold text-slate-800">{o.name}</p>
                  <p className="text-[11px] text-slate-400">{o.role} · {o.dept} · Starts: {o.startDate}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-extrabold text-[#006838]">{taskPct(o.tasks)}%</p>
                  <p className="text-[10px] text-slate-400">Complete</p>
                  {o.status === 'pending' && <button className="mt-1 text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-semibold hover:bg-blue-200" onClick={() => handleStartOnboarding(o.id)}>Start Onboarding</button>}
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-[#006838] transition-all" style={{ width: `${taskPct(o.tasks)}%` }} /></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(o.tasks).map(([task, done]) => (
                  <button key={task} onClick={() => o.status !== 'completed' && handleTaskToggle(o.id, task)} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border font-medium transition-all text-left ${done ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                    {done ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {TASK_LABELS[task]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'offboarding' && (
        <div className="space-y-4">
          {offboarding.map((o, i) => (
            <div key={i} className="card space-y-3">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1"><SBadge label="Offboarding" color="amber" /><span className="text-[10px] text-slate-400">{o.id}</span></div>
                  <p className="text-sm font-bold text-slate-800">{o.name}</p>
                  <p className="text-[11px] text-slate-400">{o.role} · {o.dept} · Departing: {o.departDate}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-extrabold text-red-600">{taskPct(o.tasks)}%</p>
                  <p className="text-[10px] text-slate-400">Revoked</p>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-red-500 transition-all" style={{ width: `${taskPct(o.tasks)}%` }} /></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(o.tasks).map(([task, done]) => (
                  <button key={task} onClick={() => handleOffTask(o.id, task)} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border font-medium transition-all text-left ${done ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                    {done ? <UserX size={12} /> : <Clock size={12} />}
                    {OFF_TASK_LABELS[task]}
                  </button>
                ))}
              </div>
              {taskPct(o.tasks) === 100 && <p className="text-xs text-green-700 font-semibold flex items-center gap-1"><CheckCircle2 size={12} /> Offboarding certificate generated. HR file updated.</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════ TAB 3: ASSET & LICENSE ═══════════════════════════ */
const ASSETS_INIT = [
  { id: 'AST-2026-0441', tag: 'NAPTIN-NB-0441', type: 'Laptop', make: 'Dell Latitude 5540', serial: 'DL54-XK229', user: 'I.K. Musa — Finance', dept: 'Finance', status: 'Active', purchase: '22 Jan 2024', warranty: '22 Jan 2027', value: 950000 },
  { id: 'AST-2026-0218', tag: 'NAPTIN-DT-0218', type: 'Desktop', make: 'HP ProDesk 600 G9', serial: 'HPP60-0218', user: 'A. Sule — Internal Audit', dept: 'Audit', status: 'Active', purchase: '10 Mar 2023', warranty: '10 Mar 2026', value: 720000 },
  { id: 'AST-2026-0440', tag: 'NAPTIN-NB-0440', type: 'Laptop', make: 'Dell Latitude 5540', serial: 'DL54-XP883', user: 'Unassigned', dept: 'ICT Pool', status: 'Available', purchase: '22 Jan 2024', warranty: '22 Jan 2027', value: 950000 },
  { id: 'AST-2026-0091', tag: 'NAPTIN-PR-0091', type: 'Printer', make: 'HP LaserJet MFP M438', serial: 'HPLJ-0091', user: 'Block B — HR', dept: 'HR', status: 'In Repair', purchase: '15 Jun 2022', warranty: '15 Jun 2024', value: 185000 },
]
const LICENSES_INIT = [
  { id: 'LIC-001', product: 'Microsoft 365 Business', vendor: 'Microsoft', seats: 250, used: 218, expiry: '31 Dec 2026', costPerSeat: 45000, status: 'Active', renewalAlert: false },
  { id: 'LIC-002', product: 'Kaspersky Endpoint Security', vendor: 'Kaspersky', seats: 300, used: 261, expiry: '30 Apr 2026', costPerSeat: 12000, status: 'Expiring Soon', renewalAlert: true },
  { id: 'LIC-003', product: 'SAP ERP Concurrent Licenses', vendor: 'SAP', seats: 50, used: 48, expiry: '31 Mar 2027', costPerSeat: 850000, status: 'Active', renewalAlert: false },
  { id: 'LIC-004', product: 'AutoCAD LT 2025', vendor: 'Autodesk', seats: 5, used: 5, expiry: '15 May 2025', costPerSeat: 120000, status: 'Expired', renewalAlert: true },
]

function AssetLicenseTab({ toast }) {
  const [assets, setAssets] = useState(ASSETS_INIT)
  const [licenses, setLicenses] = useState(LICENSES_INIT)
  const [assetView, setAssetView] = useState('assets')
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [showDisposeModal, setShowDisposeModal] = useState(null)
  const [disposeForm, setDisposeForm] = useState({ method: 'Scrapped', notes: '' })
  const [assetForm, setAssetForm] = useState({ type: 'Laptop', make: '', serial: '', purchase: '', warranty: '', value: '' })

  const handleRegisterAsset = () => {
    if (!assetForm.make || !assetForm.serial) { toast.show('Make/model and serial number required.'); return }
    const count = String(assets.length + 442).padStart(4, '0')
    const tag = `NAPTIN-${assetForm.type === 'Laptop' ? 'NB' : assetForm.type === 'Desktop' ? 'DT' : assetForm.type === 'Server' ? 'SV' : 'OT'}-${count}`
    const id = `AST-2026-${count}`
    setAssets(p => [...p, { id, tag, ...assetForm, user: 'Unassigned', dept: 'ICT Pool', status: 'Available', value: parseInt(assetForm.value) || 0 }])
    toast.show(`Asset ${tag} registered. Barcode label generated.`)
    setShowAssetModal(false); setAssetForm({ type: 'Laptop', make: '', serial: '', purchase: '', warranty: '', value: '' })
  }

  const handleDispose = (id) => {
    setAssets(p => p.map(a => a.id === id ? { ...a, status: 'Disposed', disposalMethod: disposeForm.method, disposalNotes: disposeForm.notes } : a))
    toast.show(`Asset disposal approved. Asset register updated. Finance write-off initiated.`)
    setShowDisposeModal(null)
  }

  const handleRenew = (id) => {
    setLicenses(p => p.map(l => l.id === id ? { ...l, status: 'Active', renewalAlert: false, expiry: '31 Dec 2027' } : l))
    toast.show('Renewal initiated. Procurement request raised. IT team notified.')
  }

  const STATUS_COLOR_A = { Active: 'green', Available: 'blue', 'In Repair': 'amber', Disposed: 'slate' }
  const LIC_COLOR = { Active: 'green', 'Expiring Soon': 'amber', Expired: 'red' }

  return (
    <div className="space-y-4">
      {showAssetModal && (
        <Modal title="Register New Asset" onClose={() => setShowAssetModal(false)}>
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Asset Type"><select className="np-input w-full text-sm" value={assetForm.type} onChange={e => setAssetForm(p => ({ ...p, type: e.target.value }))}><option>Laptop</option><option>Desktop</option><option>Server</option><option>Printer</option><option>Switch</option><option>UPS</option><option>Other</option></select></Fld>
            <Fld label="Value (₦)"><input type="number" className="np-input w-full text-sm" value={assetForm.value} onChange={e => setAssetForm(p => ({ ...p, value: e.target.value }))} /></Fld>
          </div>
          <Fld label="Make / Model" required><input className="np-input w-full text-sm" placeholder="e.g. Dell Latitude 5540" value={assetForm.make} onChange={e => setAssetForm(p => ({ ...p, make: e.target.value }))} /></Fld>
          <Fld label="Serial Number" required><input className="np-input w-full text-sm" placeholder="e.g. SN-12345" value={assetForm.serial} onChange={e => setAssetForm(p => ({ ...p, serial: e.target.value }))} /></Fld>
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Purchase Date"><input type="date" className="np-input w-full text-sm" value={assetForm.purchase} onChange={e => setAssetForm(p => ({ ...p, purchase: e.target.value }))} /></Fld>
            <Fld label="Warranty Expiry"><input type="date" className="np-input w-full text-sm" value={assetForm.warranty} onChange={e => setAssetForm(p => ({ ...p, warranty: e.target.value }))} /></Fld>
          </div>
          <div className="flex justify-end gap-2"><button className="btn-secondary text-sm" onClick={() => setShowAssetModal(false)}>Cancel</button><button className="btn-primary text-sm" onClick={handleRegisterAsset}><Tag size={14} /> Register &amp; Print Label</button></div>
        </Modal>
      )}
      {showDisposeModal && (
        <Modal title={`Dispose Asset — ${showDisposeModal}`} onClose={() => setShowDisposeModal(null)}>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">Disposal requires ICT Head → Finance → DG approval for high-value assets.</div>
          <Fld label="Disposal Method"><select className="np-input w-full text-sm" value={disposeForm.method} onChange={e => setDisposeForm(p => ({ ...p, method: e.target.value }))}><option>Scrapped</option><option>Donated</option><option>Sold</option><option>Returned to Vendor</option></select></Fld>
          <Fld label="Notes"><textarea className="np-input w-full text-sm h-16" value={disposeForm.notes} onChange={e => setDisposeForm(p => ({ ...p, notes: e.target.value }))} /></Fld>
          <div className="flex justify-end gap-2"><button className="btn-secondary text-sm" onClick={() => setShowDisposeModal(null)}>Cancel</button><button className="text-sm px-3 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center gap-1.5" onClick={() => handleDispose(showDisposeModal)}><Archive size={14} /> Initiate Disposal</button></div>
        </Modal>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1">
          {['assets', 'licenses'].map(v => <button key={v} onClick={() => setAssetView(v)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${assetView === v ? 'bg-[#006838] text-white' : 'text-slate-500 bg-white border border-slate-200 hover:bg-slate-50'}`}>{v === 'assets' ? 'Hardware Assets' : 'Software Licenses'}</button>)}
        </div>
        {assetView === 'assets' && <button className="btn-primary text-sm" onClick={() => setShowAssetModal(true)}><Plus size={14} /> Register Asset</button>}
      </div>

      {assetView === 'assets' && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-xs">
            <thead><tr className="bg-slate-50">{['Tag', 'Type', 'Make / Model', 'Assigned To', 'Status', 'Warranty', 'Actions'].map(h => <th key={h} className="px-4 py-2.5 text-left font-semibold text-slate-500 whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>
              {assets.map((a, i) => (
                <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/70">
                  <td className="px-4 py-2.5 font-mono text-[10px] text-slate-500">{a.tag}</td>
                  <td className="px-4 py-2.5 text-slate-600">{a.type}</td>
                  <td className="px-4 py-2.5 font-semibold text-slate-700">{a.make}</td>
                  <td className="px-4 py-2.5 text-slate-500 max-w-[140px] truncate">{a.user}</td>
                  <td className="px-4 py-2.5"><SBadge label={a.status} color={STATUS_COLOR_A[a.status] || 'slate'} /></td>
                  <td className="px-4 py-2.5 text-slate-400">{a.warranty}</td>
                  <td className="px-4 py-2.5">
                    {a.status !== 'Disposed' && (
                      <button className="text-[10px] px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-md font-semibold hover:bg-red-100" onClick={() => setShowDisposeModal(a.id)}>Dispose</button>
                    )}
                    {a.status === 'Disposed' && <span className="text-[10px] text-slate-400 italic">Disposed</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {assetView === 'licenses' && (
        <div className="space-y-3">
          {licenses.filter(l => l.renewalAlert).length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
              <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
              <div><strong>Renewal alerts:</strong> {licenses.filter(l => l.renewalAlert).map(l => l.product).join(', ')} — action required.</div>
            </div>
          )}
          {licenses.map((l, i) => (
            <div key={i} className={`card ${l.renewalAlert ? 'border border-amber-200' : ''}`}>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1"><SBadge label={l.status} color={LIC_COLOR[l.status]} /><span className="text-[10px] text-slate-400">{l.id}</span></div>
                  <p className="text-sm font-bold text-slate-800">{l.product}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Vendor: {l.vendor} · Seats: {l.used}/{l.seats} used · Expires: {l.expiry}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Annual cost: ₦{(l.seats * l.costPerSeat).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {(l.status === 'Expiring Soon' || l.status === 'Expired') && (
                    <button className="text-[10px] px-2 py-1 bg-[#006838] text-white rounded-md font-semibold hover:bg-[#005230]" onClick={() => handleRenew(l.id)}>Renew</button>
                  )}
                </div>
              </div>
              <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${Math.min(l.used / l.seats * 100, 100)}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{Math.round(l.used / l.seats * 100)}% of seats in use</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════ TAB 4: CYBERSECURITY INCIDENTS ═══════════════════════════ */
const INCIDENTS_INIT = [
  { id: 'CSEC-2026-007', title: 'Phishing email — single Finance user', level: 1, status: 'Closed', source: 'User report', date: '03 Apr 2026', affected: 'F. Adamu (Finance)', containment: ['User advised to delete email', 'Password reset completed'], rootCause: 'Targeted spear-phishing from spoofed NAPTIN domain', breachNotified: false },
  { id: 'CSEC-2026-006', title: 'Failed brute-force on VPN portal', level: 2, status: 'Contained', source: 'Firewall IDS alert', date: '01 Apr 2026', affected: 'VPN Portal (HQ)', containment: ['Source IP 185.234.x.x geo-blocked', 'MFA enforced on all VPN accounts'], rootCause: 'Automated credential stuffing from botnet', breachNotified: false },
  { id: 'CSEC-2026-005', title: 'Malware detected on admin workstation', level: 2, status: 'Resolved', source: 'Kaspersky AV alert', date: '15 Mar 2026', affected: 'Workstation NAPTIN-DT-0104', containment: ['Workstation isolated and re-imaged', 'Credentials rotated', 'Kaspersky SOC report filed'], rootCause: 'Malicious USB attachment introduced by contractor', breachNotified: false },
]
const INCIDENT_LEVEL = { 1: { label: 'Level 1 — Low', color: 'blue' }, 2: { label: 'Level 2 — Medium', color: 'amber' }, 3: { label: 'Level 3 — High / Critical', color: 'red' } }
const SLA_INCIDENT = { 1: '4 hours', 2: '1 hour', 3: '15 minutes' }

function CyberSecurityTab({ toast }) {
  const { addNotification } = useNotifications()
  const [incidents, setIncidents] = useState(INCIDENTS_INIT)
  const [expanded, setExpanded] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [form, setForm] = useState({ title: '', level: 2, source: 'User report', affected: '' })

  const STATUS_COLOR = { Open: 'red', Contained: 'amber', Resolved: 'green', Closed: 'slate', Investigating: 'blue' }

  const handleCreate = () => {
    if (!form.title || !form.affected) { toast.show('Title and affected system are required.'); return }
    const id = `CSEC-2026-${String(incidents.length + 8).padStart(3, '0')}`
    const autoContainment = form.level >= 2 ? ['Isolate affected systems from network — PENDING', 'Revoke compromised user credentials — PENDING', 'Block malicious IP addresses — PENDING'] : []
    setIncidents(p => [{ id, title: form.title, level: parseInt(form.level), status: 'Open', source: form.source, date: '07 Apr 2026', affected: form.affected, containment: autoContainment, rootCause: null, breachNotified: false }, ...p])
    toast.show(`${id} created. ${form.level >= 3 ? 'LEVEL 3 — DG notified. Containment tasks auto-generated.' : form.level === 2 ? 'Level 2 — ICT Head notified. Containment tasks generated.' : 'Level 1 logged. ICT Security Officer assigned.'}`)
    addNotification({ title: `Security Incident: ${id}`, sub: `Level ${form.level} — ${form.title}. Affected: ${form.affected}.`, type: form.level >= 3 ? 'breach' : 'error', link: '/app/ict-workbench', module: 'ICT Workbench' })
    setShowCreateModal(false); setForm({ title: '', level: 2, source: 'User report', affected: '' })
  }

  const handleContain = (id, step) => {
    setIncidents(p => p.map(inc => inc.id === id ? {
      ...inc,
      containment: inc.containment.map(c => c.includes(step) ? c.replace(' — PENDING', ' — DONE') : c),
      status: inc.containment.every(c => !c.includes('PENDING') || c.includes(step)) ? 'Contained' : 'Investigating',
    } : inc))
    toast.show(`Containment action completed: ${step}.`)
  }

  const handleResolve = (id) => {
    setIncidents(p => p.map(inc => inc.id === id ? { ...inc, status: 'Resolved' } : inc))
    toast.show('Incident resolved. Incident report auto-generated and routed to ICT Head.')
  }

  const handleClose = (id) => {
    setIncidents(p => p.map(inc => inc.id === id ? { ...inc, status: 'Closed' } : inc))
    toast.show('Incident closed. Post-incident review scheduled in 7 days.')
  }

  const handleBreachNotify = (id) => {
    setIncidents(p => p.map(inc => inc.id === id ? { ...inc, breachNotified: true } : inc))
    toast.show('NDPR/GDPR breach notification initiated. DPO notified. Regulatory notification window: 72 hours.')
  }

  return (
    <div className="space-y-4">
      {showCreateModal && (
        <Modal title="Log Security Incident" onClose={() => setShowCreateModal(false)}>
          <Fld label="Incident Title" required><input className="np-input w-full text-sm" placeholder="e.g. Ransomware alert on server" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></Fld>
          <Fld label="Classification Level">
            <select className="np-input w-full text-sm" value={form.level} onChange={e => setForm(p => ({ ...p, level: parseInt(e.target.value) }))}>
              <option value={1}>Level 1 — Low (single user, contained)</option>
              <option value={2}>Level 2 — Medium (multiple users / data exposure)</option>
              <option value={3}>Level 3 — High (system compromise / ransomware / breach)</option>
            </select>
          </Fld>
          <Fld label="Detection Source"><select className="np-input w-full text-sm" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}><option>User report</option><option>Antivirus alert</option><option>Firewall IDS</option><option>Failed login alert</option><option>IDS/IPS system</option><option>External notification</option></select></Fld>
          <Fld label="Affected System / User" required><input className="np-input w-full text-sm" placeholder="e.g. Finance workstation or VPN portal" value={form.affected} onChange={e => setForm(p => ({ ...p, affected: e.target.value }))} /></Fld>
          {parseInt(form.level) >= 2 && <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">Level {form.level} — ICT Head {parseInt(form.level) >= 3 ? '+ DG' : ''} auto-notified. Containment tasks auto-generated. SLA: {SLA_INCIDENT[form.level]} initial response.</div>}
          <div className="flex justify-end gap-2"><button className="btn-secondary text-sm" onClick={() => setShowCreateModal(false)}>Cancel</button><button className="btn-primary text-sm" onClick={handleCreate}>Log Incident</button></div>
        </Modal>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[['Open / Active', incidents.filter(i => !['Closed', 'Resolved'].includes(i.status)).length, 'text-red-600'], ['Resolved This Month', incidents.filter(i => i.status === 'Resolved').length, 'text-green-700'], ['Avg Response SLA', '98%', 'text-blue-700']].map(([label, val, cls]) => (
          <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
            <p className={`text-lg font-extrabold ${cls}`}>{val}</p><p className="text-[10px] text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-400">All security incidents — level classification, containment, and resolution tracking.</p>
        <button className="btn-primary text-sm" onClick={() => setShowCreateModal(true)}><Plus size={14} /> Log Incident</button>
      </div>

      <div className="space-y-3">
        {incidents.map((inc, i) => (
          <div key={i} className={`card ${inc.level >= 3 ? 'border border-red-200' : inc.level === 2 ? 'border border-amber-200' : ''}`}>
            <button className="w-full flex items-start gap-3 text-left" onClick={() => setExpanded(expanded === inc.id ? null : inc.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <SBadge label={INCIDENT_LEVEL[inc.level]?.label} color={INCIDENT_LEVEL[inc.level]?.color} />
                  <SBadge label={inc.status} color={STATUS_COLOR[inc.status] || 'slate'} />
                  <span className="text-[10px] text-slate-400">{inc.id}</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{inc.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Source: {inc.source} · Affected: {inc.affected} · {inc.date}</p>
              </div>
              {expanded === inc.id ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
            </button>
            {expanded === inc.id && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                {inc.rootCause && <div className="bg-slate-50 rounded-xl p-3"><p className="text-[10px] font-bold text-slate-500 mb-1">Root Cause</p><p className="text-xs text-slate-700">{inc.rootCause}</p></div>}
                {inc.containment.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 mb-2">Containment Actions</p>
                    <div className="space-y-1.5">
                      {inc.containment.map((c, ci) => {
                        const done = c.includes('DONE') || !c.includes('PENDING')
                        const action = c.replace(' — PENDING', '').replace(' — DONE', '')
                        return (
                          <div key={ci} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border ${done ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                            {done ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            <span className="flex-1">{action}</span>
                            {!done && <button className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-md font-semibold hover:bg-green-200" onClick={() => handleContain(inc.id, action)}>Done</button>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  {inc.status === 'Contained' && <button className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50" onClick={() => handleResolve(inc.id)}>Mark Resolved</button>}
                  {inc.status === 'Resolved' && <button className="text-xs text-slate-600 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50" onClick={() => handleClose(inc.id)}>Close Incident</button>}
                  {inc.status === 'Resolved' && !inc.breachNotified && <button className="text-xs font-bold text-red-600 border border-red-200 px-3 py-1 rounded-xl hover:bg-red-50 flex items-center gap-1" onClick={() => handleBreachNotify(inc.id)}><AlertTriangle size={10} />NDPR Breach Notification</button>}
                  {inc.breachNotified && <span className="text-[10px] text-red-600 font-semibold">NDPR notification filed</span>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════ TAB 5: BACKUP & DR ═══════════════════════════ */
const BACKUP_JOBS_INIT = [
  { id: 'BKP-001', name: 'ERP Oracle Database — Full', frequency: 'Daily', source: 'ERP-PROD-01', dest: 'BKP-NAS-01 + Azure Blob', retentionDays: 30, lastRun: '07 Apr 2026 03:00', lastStatus: 'Success', successRate: 99, lastRestoreTest: '01 Apr 2026', nextTest: '01 Jul 2026', sizeMB: 22400 },
  { id: 'BKP-002', name: 'Active Directory — System State', frequency: 'Daily', source: 'DC-01', dest: 'BKP-NAS-01', retentionDays: 90, lastRun: '07 Apr 2026 03:30', lastStatus: 'Success', successRate: 100, lastRestoreTest: '15 Mar 2026', nextTest: '15 Jun 2026', sizeMB: 8200 },
  { id: 'BKP-003', name: 'Exchange Mailboxes — BKP', frequency: 'Daily', source: 'MAIL-01', dest: 'BKP-NAS-01', retentionDays: 365, lastRun: '06 Apr 2026 04:00', lastStatus: 'Failed', successRate: 94, lastRestoreTest: '10 Jan 2026', nextTest: 'OVERDUE', sizeMB: 0 },
  { id: 'BKP-004', name: 'File Server (User Shares)', frequency: 'Daily', source: 'FS-01', dest: 'BKP-NAS-01', retentionDays: 30, lastRun: '07 Apr 2026 02:00', lastStatus: 'Success', successRate: 97, lastRestoreTest: '01 Feb 2026', nextTest: '01 May 2026', sizeMB: 195000 },
]

function BackupDRTab({ toast }) {
  const [jobs, setJobs] = useState(BACKUP_JOBS_INIT)
  const [expanded, setExpanded] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [jobForm, setJobForm] = useState({ name: '', frequency: 'Daily', source: '', dest: '', retentionDays: 30 })

  const handleRetry = (id) => {
    setJobs(p => p.map(j => j.id === id ? { ...j, lastStatus: 'Success', lastRun: '07 Apr 2026 09:55', successRate: Math.min(j.successRate + 1, 100), sizeMB: 22400 } : j))
    toast.show('Manual backup initiated successfully. Verification checksum passed.')
  }
  const handleRestoreTest = (id) => {
    setJobs(p => p.map(j => j.id === id ? { ...j, lastRestoreTest: '07 Apr 2026', nextTest: '07 Jul 2026' } : j))
    toast.show('Restore test completed successfully. Recovery time: 38 minutes. Results logged.')
  }
  const handleAddJob = () => {
    if (!jobForm.name || !jobForm.source) { toast.show('Job name and source are required.'); return }
    const id = `BKP-${String(jobs.length + 5).padStart(3, '0')}`
    setJobs(p => [...p, { id, ...jobForm, lastRun: 'Never', lastStatus: 'Pending', successRate: 100, lastRestoreTest: 'Never', nextTest: 'Pending', sizeMB: 0 }])
    toast.show(`Backup job ${id} created and scheduled.`); setShowAddModal(false)
    setJobForm({ name: '', frequency: 'Daily', source: '', dest: '', retentionDays: 30 })
  }

  const failedJobs = jobs.filter(j => j.lastStatus === 'Failed').length
  const overdueTests = jobs.filter(j => j.nextTest === 'OVERDUE').length

  return (
    <div className="space-y-4">
      {showAddModal && (
        <Modal title="Add Backup Job" onClose={() => setShowAddModal(false)}>
          <Fld label="Job Name" required><input className="np-input w-full text-sm" placeholder="e.g. LMS PostgreSQL — Full" value={jobForm.name} onChange={e => setJobForm(p => ({ ...p, name: e.target.value }))} /></Fld>
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Frequency"><select className="np-input w-full text-sm" value={jobForm.frequency} onChange={e => setJobForm(p => ({ ...p, frequency: e.target.value }))}><option>Hourly</option><option>Daily</option><option>Weekly</option><option>Monthly</option></select></Fld>
            <Fld label="Retention (days)"><input type="number" className="np-input w-full text-sm" value={jobForm.retentionDays} onChange={e => setJobForm(p => ({ ...p, retentionDays: parseInt(e.target.value) }))} /></Fld>
          </div>
          <Fld label="Data Source (host/system)" required><input className="np-input w-full text-sm" placeholder="e.g. LMS-PROD" value={jobForm.source} onChange={e => setJobForm(p => ({ ...p, source: e.target.value }))} /></Fld>
          <Fld label="Destination"><input className="np-input w-full text-sm" placeholder="e.g. BKP-NAS-01 + Azure Blob" value={jobForm.dest} onChange={e => setJobForm(p => ({ ...p, dest: e.target.value }))} /></Fld>
          <div className="flex justify-end gap-2"><button className="btn-secondary text-sm" onClick={() => setShowAddModal(false)}>Cancel</button><button className="btn-primary text-sm" onClick={handleAddJob}>Create Job</button></div>
        </Modal>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[['Failed Jobs', failedJobs, failedJobs > 0 ? 'text-red-600' : 'text-green-700'], ['Overdue Tests', overdueTests, overdueTests > 0 ? 'text-amber-600' : 'text-green-700'], ['Backup Jobs', jobs.length, 'text-blue-700']].map(([label, val, cls]) => (
          <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
            <p className={`text-lg font-extrabold ${cls}`}>{val}</p><p className="text-[10px] text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {(failedJobs > 0 || overdueTests > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 flex items-start gap-2">
          <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
          <div>{failedJobs} backup job(s) failed last run. {overdueTests} restore test(s) overdue. Immediate action required.</div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-400">{jobs.length} configured backup jobs.</p>
        <button className="btn-primary text-sm" onClick={() => setShowAddModal(true)}><Plus size={14} /> Add Backup Job</button>
      </div>

      <div className="space-y-3">
        {jobs.map((j, i) => (
          <div key={i} className={`card ${j.lastStatus === 'Failed' ? 'border border-red-200' : j.nextTest === 'OVERDUE' ? 'border border-amber-200' : ''}`}>
            <button className="w-full flex items-start gap-3 text-left" onClick={() => setExpanded(expanded === j.id ? null : j.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <SBadge label={j.lastStatus === 'Success' ? 'Success' : j.lastStatus === 'Failed' ? 'Failed' : 'Pending'} color={j.lastStatus === 'Success' ? 'green' : j.lastStatus === 'Failed' ? 'red' : 'slate'} />
                  <span className="text-[10px] text-slate-400">{j.frequency}</span>
                  {j.nextTest === 'OVERDUE' && <SBadge label="Restore Test Overdue" color="amber" />}
                </div>
                <p className="text-sm font-bold text-slate-800">{j.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Source: {j.source} · Dest: {j.dest} · Last run: {j.lastRun}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-slate-800">{j.successRate}%</p>
                <p className="text-[10px] text-slate-400">30d success</p>
              </div>
              {expanded === j.id ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
            </button>
            {expanded === j.id && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 rounded-xl p-3"><p className="text-[10px] text-slate-400">Retention</p><p className="font-bold text-slate-800">{j.retentionDays} days</p></div>
                  <div className="bg-slate-50 rounded-xl p-3"><p className="text-[10px] text-slate-400">Last Restore Test</p><p className="font-bold text-slate-800">{j.lastRestoreTest}</p></div>
                  <div className="bg-slate-50 rounded-xl p-3"><p className="text-[10px] text-slate-400">Next Test Due</p><p className={`font-bold ${j.nextTest === 'OVERDUE' ? 'text-amber-600' : 'text-slate-800'}`}>{j.nextTest}</p></div>
                  <div className="bg-slate-50 rounded-xl p-3"><p className="text-[10px] text-slate-400">Size (last)</p><p className="font-bold text-slate-800">{j.sizeMB > 0 ? `${(j.sizeMB / 1024).toFixed(1)} GB` : 'n/a'}</p></div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {j.lastStatus === 'Failed' && <button className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1" onClick={() => handleRetry(j.id)}><RefreshCw size={11} />Manual Retry</button>}
                  <button className="text-xs text-blue-700 border border-blue-200 px-3 py-1 rounded-xl hover:bg-blue-50 flex items-center gap-1" onClick={() => handleRestoreTest(j.id)}><Activity size={11} />Run Restore Test</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════ TAB 6: CHANGE MANAGEMENT ═══════════════════════════ */
const CHANGES_INIT = [
  { id: 'RFC-2026-018', title: 'Apply security patches — ERP database server', type: 'Normal', risk: 'High', status: 'Approved', submittedBy: 'E. Bello', cabVotes: { approve: 4, reject: 0 }, implDate: 'Sat 11 Apr 2026 22:00', rollback: true, postReviewDue: '18 Apr 2026', postReviewDone: false },
  { id: 'RFC-2026-017', title: 'Firewall rule — Finance BI gateway inbound', type: 'Normal', risk: 'Low', status: 'Completed', submittedBy: 'E. Bello', cabVotes: null, implDate: '05 Apr 2026', rollback: true, postReviewDue: '12 Apr 2026', postReviewDone: false },
  { id: 'RFC-2026-016', title: 'Active Directory GPO hardening baseline', type: 'Standard', risk: 'Medium', status: 'Under Review', submittedBy: 'ICT Admin', cabVotes: { approve: 2, reject: 0 }, implDate: 'TBD', rollback: false, postReviewDue: null, postReviewDone: false },
]
const RISK_COLOR = { High: 'red', Medium: 'amber', Low: 'blue' }
const TYPE_COLOR = { Major: 'red', Normal: 'amber', Standard: 'slate', Minor: 'green' }

function ChangeManagementTab({ toast }) {
  const [changes, setChanges] = useState(CHANGES_INIT)
  const [expanded, setExpanded] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'Normal', risk: 'Medium', systems: '', implDate: '', rollback: '' })

  const STATUS_COLOR = { 'Draft': 'slate', 'Under Review': 'blue', Approved: 'green', 'In Progress': 'amber', Completed: 'green', Rejected: 'red' }

  const handleSubmit = () => {
    if (!form.title || !form.systems) { toast.show('Title and systems affected are required.'); return }
    const id = `RFC-2026-${String(changes.length + 19).padStart(3, '0')}`
    const routeToCAB = form.risk === 'High'
    setChanges(p => [{ id, title: form.title, type: form.type, risk: form.risk, status: routeToCAB ? 'Under Review' : 'Approved', submittedBy: 'Current User', cabVotes: routeToCAB ? { approve: 0, reject: 0 } : null, implDate: form.implDate || 'TBD', rollback: !!form.rollback, postReviewDue: null, postReviewDone: false }, ...p])
    toast.show(`${id} created. ${routeToCAB ? 'High-risk change — routed to CAB for review.' : 'Low-risk — ICT Head auto-approved.'}`)
    setShowModal(false); setForm({ title: '', type: 'Normal', risk: 'Medium', systems: '', implDate: '', rollback: '' })
  }

  const handleCABVote = (id, vote) => {
    setChanges(p => p.map(c => {
      if (c.id !== id) return c
      const newVotes = { ...c.cabVotes, [vote]: c.cabVotes[vote] + 1 }
      const approved = newVotes.approve >= 3
      return { ...c, cabVotes: newVotes, status: approved ? 'Approved' : 'Under Review' }
    }))
    toast.show(vote === 'approve' ? 'CAB vote recorded — Approve.' : 'CAB vote recorded — Reject.')
  }

  const handlePostReview = (id) => {
    setChanges(p => p.map(c => c.id === id ? { ...c, postReviewDone: true, status: 'Completed' } : c))
    toast.show('Post-implementation review completed. Change closed successfully.')
  }

  return (
    <div className="space-y-4">
      {showModal && (
        <Modal title="Submit Change Request (RFC)" onClose={() => setShowModal(false)} wide>
          <Fld label="Change Title" required><input className="np-input w-full text-sm" placeholder="e.g. Upgrade ERP to v4.2" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></Fld>
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Change Type"><select className="np-input w-full text-sm" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}><option>Standard</option><option>Normal</option><option>Major</option><option>Emergency</option></select></Fld>
            <Fld label="Risk Level"><select className="np-input w-full text-sm" value={form.risk} onChange={e => setForm(p => ({ ...p, risk: e.target.value }))}><option>Low</option><option>Medium</option><option>High</option></select></Fld>
          </div>
          <Fld label="Systems Affected" required><input className="np-input w-full text-sm" placeholder="e.g. ERP-PROD-01, SQL Server DB" value={form.systems} onChange={e => setForm(p => ({ ...p, systems: e.target.value }))} /></Fld>
          <Fld label="Planned Implementation Date"><input type="date" className="np-input w-full text-sm" value={form.implDate} onChange={e => setForm(p => ({ ...p, implDate: e.target.value }))} /></Fld>
          <Fld label="Rollback Plan"><textarea className="np-input w-full text-sm h-16" placeholder="Describe rollback procedure if change fails..." value={form.rollback} onChange={e => setForm(p => ({ ...p, rollback: e.target.value }))} /></Fld>
          {form.risk === 'High' && <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">High-risk change — will be routed to Change Advisory Board (CAB) for minimum 3 approvals before implementation.</div>}
          <div className="flex justify-end gap-2"><button className="btn-secondary text-sm" onClick={() => setShowModal(false)}>Cancel</button><button className="btn-primary text-sm" onClick={handleSubmit}>Submit RFC</button></div>
        </Modal>
      )}

      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-400">{changes.filter(c => c.status !== 'Completed').length} active changes.</p>
        <button className="btn-primary text-sm" onClick={() => setShowModal(true)}><Plus size={14} /> Submit RFC</button>
      </div>

      <div className="space-y-3">
        {changes.map((c, i) => (
          <div key={i} className="card">
            <button className="w-full flex items-start gap-3 text-left" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <SBadge label={c.type} color={TYPE_COLOR[c.type] || 'slate'} />
                  <SBadge label={`Risk: ${c.risk}`} color={RISK_COLOR[c.risk]} />
                  <SBadge label={c.status} color={STATUS_COLOR[c.status] || 'slate'} />
                  <span className="text-[10px] text-slate-400">{c.id}</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{c.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">By: {c.submittedBy} · Planned: {c.implDate}</p>
              </div>
              {expanded === c.id ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
            </button>
            {expanded === c.id && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-3 flex-wrap text-xs">
                  <span className={`flex items-center gap-1 ${c.rollback ? 'text-green-700' : 'text-red-500'}`}>{c.rollback ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}Rollback plan {c.rollback ? 'documented' : 'missing'}</span>
                </div>
                {c.cabVotes && c.status === 'Under Review' && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-500 mb-2">CAB Voting — need 3 approvals</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-green-700">{c.cabVotes.approve} approve</span>
                      <span className="text-xs font-bold text-red-600">{c.cabVotes.reject} reject</span>
                      <button className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-md font-semibold hover:bg-green-200" onClick={() => handleCABVote(c.id, 'approve')}>Vote Approve</button>
                      <button className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-md font-semibold hover:bg-red-200" onClick={() => handleCABVote(c.id, 'reject')}>Vote Reject</button>
                    </div>
                    {c.cabVotes.approve >= 3 && <p className="text-xs text-green-700 font-semibold mt-2">Threshold reached — Change auto-approved.</p>}
                  </div>
                )}
                {c.status === 'Approved' && c.postReviewDue && !c.postReviewDone && (
                  <div className="flex gap-2">
                    <button className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50" onClick={() => handlePostReview(c.id)}>Complete Post-Implementation Review</button>
                  </div>
                )}
                {c.status === 'Completed' && c.postReviewDone && <p className="text-xs text-green-700 font-semibold flex items-center gap-1"><CheckCircle2 size={12} /> Post-implementation review completed. Change closed.</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════ TAB 7: INTEGRATION MONITORING ═══════════════════════════ */
const INTEGRATIONS_INIT = [
  { id: 'INT-001', name: 'ERP → Banking Payment API', source: 'SAP ERP', target: 'Access Bank Payment Gateway', purpose: 'Automated payroll disbursement', frequency: 'Real-time', auth: 'API Key + TLS mutual auth', status: 'healthy', lastRun: '07 Apr 2026 09:30', responseMs: 245, uptime30d: 99.5, lastError: null },
  { id: 'INT-002', name: 'HR → Payroll System', source: 'HRIS (SAP HCM)', target: 'Sage Payroll Cloud', purpose: 'Monthly staff data sync', frequency: 'Monthly (28th)', auth: 'OAuth 2.0', status: 'healthy', lastRun: '28 Mar 2026', responseMs: 1230, uptime30d: 100, lastError: null },
  { id: 'INT-003', name: 'Finance BI → SQL Data Warehouse', source: 'Power BI Gateway', target: 'SQL Server DW', purpose: 'Dashboard data refresh', frequency: 'Every 2 hours', auth: 'Service account + Windows Auth', status: 'degraded', lastRun: '07 Apr 2026 07:00', responseMs: 8400, uptime30d: 97.1, lastError: 'Slow query: rpt_expenditure_ytd timed out after 8s' },
  { id: 'INT-004', name: 'LMS → Email (Notification)', source: 'LMS Platform', target: 'Exchange SMTP Relay', purpose: 'Course enrolment & cert emails', frequency: 'Real-time', auth: 'SMTP Auth + TLS', status: 'healthy', lastRun: '07 Apr 2026 09:15', responseMs: 312, uptime30d: 99.8, lastError: null },
  { id: 'INT-005', name: 'Website → CRM Lead Capture', source: 'NAPTIN Website', target: 'CRM (HubSpot)', purpose: 'Auto-populate enquiry leads', frequency: 'Real-time webhook', auth: 'HMAC signature + API key', status: 'down', lastRun: '05 Apr 2026 16:12', responseMs: null, uptime30d: 88.4, lastError: 'Webhook: 401 Unauthorized — API key may have rotated' },
]
const STATUS_DOT = { healthy: 'bg-green-500', degraded: 'bg-amber-400', down: 'bg-red-500' }

function IntegrationMonitoringTab({ toast }) {
  const [integrations, setIntegrations] = useState(INTEGRATIONS_INIT)
  const [expanded, setExpanded] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', source: '', target: '', purpose: '', frequency: 'Real-time', auth: '' })

  const handleRemediate = (id) => {
    setIntegrations(p => p.map(int => int.id === id ? { ...int, status: 'healthy', lastRun: '07 Apr 2026 10:05', responseMs: 280, lastError: null } : int))
    toast.show('Integration restored. Root cause logged. Health check passed. Status: Green.')
  }

  const handleRefreshCheck = () => {
    toast.show('Health checks initiated for all 5 integrations. Results updated 09:55.')
  }

  const handleAdd = () => {
    if (!form.name || !form.source || !form.target) { toast.show('Name, source and target are required.'); return }
    const id = `INT-${String(integrations.length + 6).padStart(3, '0')}`
    setIntegrations(p => [...p, { id, ...form, status: 'healthy', lastRun: 'Never', responseMs: null, uptime30d: 100, lastError: null }])
    toast.show(`Integration ${id} registered. Health checks will begin at next scheduled interval.`)
    setShowModal(false); setForm({ name: '', source: '', target: '', purpose: '', frequency: 'Real-time', auth: '' })
  }

  const healthCounts = { healthy: integrations.filter(i => i.status === 'healthy').length, degraded: integrations.filter(i => i.status === 'degraded').length, down: integrations.filter(i => i.status === 'down').length }

  return (
    <div className="space-y-4">
      {showModal && (
        <Modal title="Register Integration" onClose={() => setShowModal(false)} wide>
          <Fld label="Integration Name" required><input className="np-input w-full text-sm" placeholder="e.g. ERP → Logistics API" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></Fld>
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Source System" required><input className="np-input w-full text-sm" placeholder="e.g. SAP ERP" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} /></Fld>
            <Fld label="Target System" required><input className="np-input w-full text-sm" placeholder="e.g. Vendor API" value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} /></Fld>
          </div>
          <Fld label="Purpose"><input className="np-input w-full text-sm" placeholder="e.g. Automated payment reconciliation" value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} /></Fld>
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Frequency"><select className="np-input w-full text-sm" value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}><option>Real-time</option><option>Hourly</option><option>Daily</option><option>Weekly</option><option>Monthly</option></select></Fld>
            <Fld label="Authentication Method"><input className="np-input w-full text-sm" placeholder="e.g. API Key + TLS" value={form.auth} onChange={e => setForm(p => ({ ...p, auth: e.target.value }))} /></Fld>
          </div>
          <div className="flex justify-end gap-2"><button className="btn-secondary text-sm" onClick={() => setShowModal(false)}>Cancel</button><button className="btn-primary text-sm" onClick={handleAdd}><Link size={14} /> Register Integration</button></div>
        </Modal>
      )}

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-3">
        {[['Healthy', healthCounts.healthy, 'text-green-700'], ['Degraded', healthCounts.degraded, 'text-amber-600'], ['Down', healthCounts.down, 'text-red-600']].map(([label, val, cls]) => (
          <div key={label} className="bg-slate-50 rounded-xl p-3 text-center"><p className={`text-lg font-extrabold ${cls}`}>{val}</p><p className="text-[10px] text-slate-400">{label}</p></div>
        ))}
      </div>

      {healthCounts.down > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 flex items-start gap-2">
          <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
          <div><strong>{healthCounts.down} integration(s) down.</strong> Affected: {integrations.filter(i => i.status === 'down').map(i => i.name).join(', ')}. Immediate remediation required.</div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-400">{integrations.length} registered integrations.</p>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm" onClick={handleRefreshCheck}><RefreshCw size={14} /> Refresh All</button>
          <button className="btn-primary text-sm" onClick={() => setShowModal(true)}><Plus size={14} /> Register</button>
        </div>
      </div>

      <div className="space-y-3">
        {integrations.map((int, i) => (
          <div key={i} className={`card ${int.status === 'down' ? 'border border-red-200' : int.status === 'degraded' ? 'border border-amber-200' : ''}`}>
            <button className="w-full flex items-start gap-3 text-left" onClick={() => setExpanded(expanded === int.id ? null : int.id)}>
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${STATUS_DOT[int.status]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <SBadge label={int.status.charAt(0).toUpperCase() + int.status.slice(1)} color={int.status === 'healthy' ? 'green' : int.status === 'degraded' ? 'amber' : 'red'} />
                  <span className="text-[10px] text-slate-400">{int.id}</span>
                  <span className="text-[10px] text-slate-400">{int.frequency}</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{int.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{int.source} → {int.target}</p>
                {int.responseMs && <p className="text-[10px] text-slate-400 mt-0.5">{int.responseMs}ms avg · {int.uptime30d}% uptime (30d)</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold text-slate-800">{int.uptime30d}%</p>
                <p className="text-[10px] text-slate-400">Uptime</p>
              </div>
              {expanded === int.id ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
            </button>
            {expanded === int.id && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 rounded-xl p-3"><p className="text-[10px] text-slate-400">Purpose</p><p className="font-semibold text-slate-700">{int.purpose}</p></div>
                  <div className="bg-slate-50 rounded-xl p-3"><p className="text-[10px] text-slate-400">Auth Method</p><p className="font-semibold text-slate-700">{int.auth}</p></div>
                  <div className="bg-slate-50 rounded-xl p-3"><p className="text-[10px] text-slate-400">Last Successful Run</p><p className="font-semibold text-slate-700">{int.lastRun}</p></div>
                  <div className="bg-slate-50 rounded-xl p-3"><p className="text-[10px] text-slate-400">Response Time</p><p className="font-semibold text-slate-700">{int.responseMs ? `${int.responseMs}ms` : 'n/a'}</p></div>
                </div>
                {int.lastError && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700"><strong>Last error:</strong> {int.lastError}</div>}
                {int.status !== 'healthy' && <button className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1" onClick={() => handleRemediate(int.id)}><Zap size={11} />Remediate &amp; Retest</button>}
                {int.status === 'healthy' && <p className="text-xs text-green-700 font-semibold flex items-center gap-1"><CheckCircle2 size={12} /> Integration healthy — all checks passing.</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════ TAB 8: ROLES & SCHEMA ═══════════════════════════ */
function ICTRolesTab() {
  const ROLES = [
    { role: 'ICT Support Officer', desk: 'Create, resolve, update tickets', onboard: 'Execute provisioning tasks', asset: 'Register, assign, update assets', security: 'View incidents', backup: 'View job status', change: 'Submit RFCs', integration: 'View status' },
    { role: 'ICT Administrator', desk: 'View all tickets', onboard: 'Full onboard/offboard', asset: 'Full asset + license mgmt', security: 'Triage & investigate', backup: 'Manage jobs', change: 'Submit + approve (low-risk)', integration: 'Register + remediate' },
    { role: 'ICT Security Officer', desk: 'View access issues', onboard: 'Verify offboarding access revocation', asset: 'View licenses', security: 'Full incident management + breach notify', backup: 'View', change: 'CAB vote', integration: 'View security posture' },
    { role: 'ICT Head', desk: 'Full view + SLA alerts', onboard: 'Approve onboarding', asset: 'Approve disposal', security: 'Receive all Level 2/3 alerts', backup: 'Escalation target', change: 'CAB chair + approve all', integration: 'Full dashboard' },
    { role: 'Director General', desk: 'View SLA dashboard', onboard: 'None', asset: 'Approve high-value disposal', security: 'Receive Level 3 notifications', backup: 'View DR dashboard', change: 'View major changes', integration: 'View uptime dashboard' },
  ]
  const MODULES = ['desk', 'onboard', 'asset', 'security', 'backup', 'change', 'integration']
  const MODULE_LABELS = { desk: 'Help Desk', onboard: 'Onboarding', asset: 'Assets/Licenses', security: 'Cybersecurity', backup: 'Backup & DR', change: 'Change Mgmt', integration: 'Integrations' }

  const DB_TABLES = [
    { name: 'ict_tickets', cols: 'id, ticket_ref, title, category (hardware|software|network|email|access|security), priority (Critical|High|Medium|Low), status, description, assignee_id (FK→users), requester_id (FK→users), sla_response_by, sla_resolution_by, sla_breached, resolved_at, resolution_notes, satisfaction_score, created_at' },
    { name: 'ict_onboarding', cols: 'id, onboard_ref, employee_id (FK→hr.employees), type (onboarding|offboarding), start_or_depart_date, status, task_ad, task_email, task_erp, task_hardware, task_orientation, task_door_access, assigned_ict_officer, completed_at' },
    { name: 'ict_assets', cols: 'id, asset_tag, asset_type (laptop|desktop|server|printer|network|other), make_model, serial_number, purchase_date, warranty_expiry, purchase_value, current_status (Active|Available|In Repair|Disposed), assigned_user_id (FK→users), assigned_dept, assigned_date, disposal_method, disposal_date, disposal_approved_by' },
    { name: 'ict_licenses', cols: 'id, license_ref, product_name, vendor, seats_total, seats_used, license_key_encrypted, expiry_date, cost_per_seat, status (Active|Expiring Soon|Expired), renewal_requested, renewal_approved_by' },
    { name: 'ict_security_incidents', cols: 'id, incident_ref, title, level (1|2|3), status (Open|Investigating|Contained|Resolved|Closed), source, affected_systems, reported_by, date_detected, containment_actions_json, root_cause, breach_with_personal_data (bool), ndpr_notified_at, closed_at, report_pdf_url' },
    { name: 'ict_backup_jobs', cols: 'id, job_name, frequency, source_system, destination, retention_days, last_run_at, last_run_status (Success|Failed|Pending), last_run_size_mb, success_rate_30d, last_restore_test_at, restore_test_result, next_test_due' },
    { name: 'ict_change_requests', cols: 'id, rfc_ref, title, change_type (Standard|Normal|Major|Emergency), risk_level, systems_affected, proposed_impl_date, rollback_plan, status, submitted_by, cab_votes_approve, cab_votes_reject, implemented_at, post_review_done, post_review_notes, closed_at' },
    { name: 'ict_integrations', cols: 'id, integration_ref, name, source_system, target_system, purpose, frequency, auth_method, api_endpoint_encrypted, status (healthy|degraded|down), last_check_at, last_success_at, avg_response_ms, uptime_30d_pct, last_error_message, remediation_notes' },
  ]

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <p className="text-xs font-bold text-slate-700 mb-3">User Role &amp; Permission Matrix</p>
        <table className="w-full text-xs">
          <thead><tr className="text-left border-b border-slate-100">
            <th className="pb-2 pr-4 text-slate-500 font-semibold whitespace-nowrap">Role</th>
            {MODULES.map(m => <th key={m} className="pb-2 pr-4 text-slate-500 font-semibold whitespace-nowrap">{MODULE_LABELS[m]}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {ROLES.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-2.5 pr-4 font-semibold text-slate-800 whitespace-nowrap">{r.role}</td>
                {MODULES.map(m => <td key={m} className="py-2.5 pr-4 text-[10px] text-slate-600 min-w-[120px]">{r[m] || '—'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-700 mb-3">Database Schema — ICT Workbench ({DB_TABLES.length} tables)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DB_TABLES.map(t => (
            <div key={t.name} className="bg-slate-50 rounded-xl p-3">
              <p className="text-[11px] font-bold text-slate-700 mb-1 font-mono">{t.name}</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">{t.cols}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-700 mb-3">Integration Specifications — HRIS, Procurement &amp; Security Tools</p>
        <div className="space-y-2">
          {[
            { name: 'HRIS → ICT Onboarding', trigger: 'New employee record created with start_date ≥ today+14', payload: 'employee_id, name, dept, role, start_date', action: 'Auto-create onboarding record, notify ICT Officer', auth: 'Internal event bus / webhook' },
            { name: 'HRIS → ICT Offboarding', trigger: 'departure_date field set in HRIS', payload: 'employee_id, name, dept, departure_date', action: 'Auto-schedule AD disable at EOD on departure_date', auth: 'Internal event bus / webhook' },
            { name: 'Procurement → Asset Registry', trigger: 'Purchase order for ICT assets marked "Received"', payload: 'item_description, quantity, serial_numbers, value, PO_ref', action: 'Pre-populate asset registration form in ICT module', auth: 'REST API + JWT service token' },
            { name: 'Active Directory → ICT Onboarding', trigger: 'User creation event in AD', payload: 'sAMAccountName, email, groups_assigned, created_at', action: 'Mark task_ad + task_email = done in onboarding record', auth: 'LDAP event listener / AD management API' },
            { name: 'Antivirus / IDS → Security Incidents', trigger: 'Malware detected or intrusion alert raised', payload: 'alert_type, severity, source_ip, affected_host, timestamp', action: 'Auto-create security incident with auto-classification', auth: 'Syslog / SIEM webhook' },
            { name: 'Backup Tool (Veeam) → Backup Jobs', trigger: 'Backup job completion event', payload: 'job_name, status, size_mb, duration_mins, checksum', action: 'Update last_run_status and successrate in ict_backup_jobs', auth: 'Veeam REST API + service account' },
          ].map((spec, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-3 space-y-1">
              <p className="text-[11px] font-bold text-slate-700">{spec.name}</p>
              <p className="text-[10px] text-slate-500"><span className="font-semibold">Trigger:</span> {spec.trigger}</p>
              <p className="text-[10px] text-slate-500"><span className="font-semibold">Payload:</span> {spec.payload}</p>
              <p className="text-[10px] text-slate-500"><span className="font-semibold">Action:</span> {spec.action}</p>
              <p className="text-[10px] text-slate-400"><span className="font-semibold">Auth:</span> {spec.auth}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── MAIN PAGE ─── */
export default function ICTWorkbenchPage() {
  const toast = useToast()
  const TABS = [
    { label: 'Help Desk', icon: Headphones },
    { label: 'User Onboarding', icon: Users },
    { label: 'Asset & License', icon: HardDrive },
    { label: 'Cybersecurity', icon: Shield },
    { label: 'Backup & DR', icon: Server },
    { label: 'Change Management', icon: Wrench },
    { label: 'Integrations', icon: Link },
    { label: 'Roles & Schema', icon: Database },
  ]
  const [activeTab, setActiveTab] = useState(0)

  const SUMMARY = [
    { label: 'Open Tickets', value: '5', sub: '1 Critical · 2 High', color: 'text-red-600' },
    { label: 'Integrations Up', value: '3/5', sub: '1 degraded · 1 down', color: 'text-amber-600' },
    { label: 'Backup Health', value: '75%', sub: '1 job failed last night', color: 'text-amber-600' },
    { label: 'Security Posture', value: 'Amber', sub: 'Brute-force contained', color: 'text-amber-600' },
    { label: 'Active Onboardings', value: '2', sub: 'Starting 07 Apr 2026', color: 'text-blue-700' },
    { label: 'License Alerts', value: '2', sub: '1 expiring · 1 expired', color: 'text-red-600' },
    { label: 'Pending RFCs', value: '1', sub: 'CAB review in progress', color: 'text-purple-700' },
    { label: 'Asset Register', value: '2,841', sub: '4 types tracked', color: 'text-[#006838]' },
  ]

  return (
    <div className="animate-fade-up">
      <Toast msg={toast.msg} clear={() => toast.show(null)} />

      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">ICT Workbench</h1>
          <p className="text-sm text-slate-400">Help desk · Onboarding · Assets · Cybersecurity · Backup &amp; DR · Change management · Integration monitoring</p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {SUMMARY.slice(0, 4).map((s, i) => (
          <div key={i} className="stat-card">
            <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">{s.label}</p>
            <p className="text-[10px] text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {SUMMARY.slice(4).map((s, i) => (
          <div key={i} className="stat-card">
            <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">{s.label}</p>
            <p className="text-[10px] text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap mb-5">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === i ? 'bg-[#006838] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-white border border-slate-100 hover:bg-slate-50'}`}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {activeTab === 0 && <HelpDeskTab toast={toast} />}
      {activeTab === 1 && <UserOnboardingTab toast={toast} />}
      {activeTab === 2 && <AssetLicenseTab toast={toast} />}
      {activeTab === 3 && <CyberSecurityTab toast={toast} />}
      {activeTab === 4 && <BackupDRTab toast={toast} />}
      {activeTab === 5 && <ChangeManagementTab toast={toast} />}
      {activeTab === 6 && <IntegrationMonitoringTab toast={toast} />}
      {activeTab === 7 && <ICTRolesTab />}
    </div>
  )
}
