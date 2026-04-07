import { useState, useMemo } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import { useNotifications, relativeTime, TYPE_DOT } from '../context/NotificationContext'
import {
  X, CheckCircle, Plus, Trash2, ChevronDown, ChevronRight,
  AlertTriangle, Clock, Users, Settings, Database, Bell,
  BarChart2, Play, Pause, RotateCcw, Edit2, Eye,
  ArrowRight, GitBranch, Zap, List, Shield, Activity,
  User, Group, Timer, Flag, Send, Filter, Download,
  CheckSquare, XCircle, AlertCircle, RefreshCw, Layers,
  Workflow, FileText, ArrowDown, Info, TrendingUp,
  UserCheck, Inbox, BookOpen, Cpu,
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
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button onClick={onClose}><X size={16} className="text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">{children}</div>
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
function SBadge({ label, color }) {
  const map = {
    green: 'bg-green-100 text-green-700 border-green-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    slate: 'bg-slate-100 text-slate-500 border-slate-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    teal: 'bg-teal-100 text-teal-700 border-teal-200',
  }
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[color] || map.slate}`}>{label}</span>
}

/* ═══════════════════════════════ MOCK DATA ═══════════════════════════════ */

const PROCESSES_INIT = [
  {
    id: 'PROC-001',
    name: 'Purchase Requisition',
    category: 'Procurement',
    status: 'Active',
    version: '2.1',
    tasks: 5,
    activeCases: 12,
    completedCases: 87,
    avgDuration: '3.2 days',
    manager: 'Emmanuel Bello',
    created: '12 Jan 2026',
    sla: '5 days',
    description: 'End-to-end purchase requisition from department to DG approval and PO generation.',
  },
  {
    id: 'PROC-002',
    name: 'Leave Approval',
    category: 'HR',
    status: 'Active',
    version: '1.4',
    tasks: 3,
    activeCases: 8,
    completedCases: 214,
    avgDuration: '1.5 days',
    manager: 'Emmanuel Bello',
    created: '03 Feb 2026',
    sla: '3 days',
    description: 'Employee leave request routed through Department Head and HR.',
  },
  {
    id: 'PROC-003',
    name: 'Contract Review',
    category: 'Legal',
    status: 'Active',
    version: '1.0',
    tasks: 4,
    activeCases: 3,
    completedCases: 29,
    avgDuration: '5.8 days',
    manager: 'Emmanuel Bello',
    created: '20 Feb 2026',
    sla: '7 days',
    description: 'Legal review of vendor contracts with compliance and DG sign-off.',
  },
  {
    id: 'PROC-004',
    name: 'Travel Authorization',
    category: 'Finance',
    status: 'Draft',
    version: '0.9',
    tasks: 4,
    activeCases: 0,
    completedCases: 0,
    avgDuration: '—',
    manager: 'Emmanuel Bello',
    created: '01 Apr 2026',
    sla: '48 hrs',
    description: 'Travel request with cost approval and DG gate for international trips.',
  },
  {
    id: 'PROC-005',
    name: 'Incident Escalation',
    category: 'ICT',
    status: 'Active',
    version: '1.2',
    tasks: 4,
    activeCases: 5,
    completedCases: 41,
    avgDuration: '0.9 days',
    manager: 'Emmanuel Bello',
    created: '14 Mar 2026',
    sla: '24 hrs',
    description: 'ICT incident triage, assignment, investigation and corrective action.',
  },
]

const TASKS_PROC001 = [
  { seq: 1, name: 'Submit Requisition', type: 'Form Task', assign: 'Requester (Self)', dueHrs: 24, priority: 3, routing: 'On submit → Dept Head', status: 'Active' },
  { seq: 2, name: 'Department Head Approval', type: 'Approval Task', assign: 'Reports To', dueHrs: 48, priority: 4, routing: 'If Approved → Procurement; If Rejected → Requester', status: 'Active' },
  { seq: 3, name: 'Procurement Review', type: 'Form Task', assign: 'Cyclical (Procurement Officers)', dueHrs: 72, priority: 3, routing: 'On complete → Finance', status: 'Active' },
  { seq: 4, name: 'Finance Approval', type: 'Approval Task', assign: 'Value-Based (Amount > N1M → Finance Mgr)', dueHrs: 48, priority: 4, routing: 'On Approve → DG if >N5M else Complete', status: 'Active' },
  { seq: 5, name: 'DG Final Approval', type: 'Approval Task', assign: 'Specific User (DG)', dueHrs: 24, priority: 5, routing: 'On Approve → Complete', status: 'Conditional' },
]

const CASES_INIT = [
  { id: 'CASE-2026-0312', process: 'Purchase Requisition', initiator: 'Amaka Nwosu', currentTask: 'Finance Approval', currentAssignee: 'I. Abdullahi', started: '04 Apr 2026', slaDeadline: '09 Apr 2026', status: 'In Progress', slaStatus: 'green', priority: 4, progress: 64 },
  { id: 'CASE-2026-0311', process: 'Leave Approval', initiator: 'Chidi Okafor', currentTask: 'HR Review', currentAssignee: 'HR Officer', started: '05 Apr 2026', slaDeadline: '08 Apr 2026', status: 'Overdue', slaStatus: 'red', priority: 3, progress: 66 },
  { id: 'CASE-2026-0310', process: 'Purchase Requisition', initiator: 'Fatima Aliyu', currentTask: 'Dept Head Approval', currentAssignee: 'Dr. Sule', started: '06 Apr 2026', slaDeadline: '11 Apr 2026', status: 'In Progress', slaStatus: 'green', priority: 3, progress: 20 },
  { id: 'CASE-2026-0309', process: 'Incident Escalation', initiator: 'System Alert', currentTask: 'Corrective Action', currentAssignee: 'Emmanuel Bello', started: '03 Apr 2026', slaDeadline: '04 Apr 2026', status: 'Overdue', slaStatus: 'red', priority: 5, progress: 75 },
  { id: 'CASE-2026-0308', process: 'Contract Review', initiator: 'Abubakar Musa', currentTask: 'Legal Review', currentAssignee: 'A. Nwosu (Legal)', started: '02 Apr 2026', slaDeadline: '09 Apr 2026', status: 'In Progress', slaStatus: 'amber', priority: 3, progress: 50 },
  { id: 'CASE-2026-0307', process: 'Leave Approval', initiator: 'Ngozi Eze', currentTask: '—', currentAssignee: '—', started: '01 Apr 2026', slaDeadline: '04 Apr 2026', status: 'Completed', slaStatus: 'green', priority: 2, progress: 100 },
]

const SLA_POLICIES = [
  { id: 'SLA-001', name: 'Purchase Requisition — Full', process: 'Purchase Requisition', type: 'Entire Process', duration: '5 days', penaltyPer: 'N500/hr', activePenalty: true, cases: 99, exceeded: 7, compRate: '93%' },
  { id: 'SLA-002', name: 'Leave — 3-Day SLA', process: 'Leave Approval', type: 'Entire Process', duration: '3 days', penaltyPer: '—', activePenalty: false, cases: 222, exceeded: 12, compRate: '95%' },
  { id: 'SLA-003', name: 'Dept Head — 48 Hr', process: 'Purchase Requisition', type: 'Task-Level', duration: '48 hours', penaltyPer: 'N200/hr', activePenalty: true, cases: 99, exceeded: 18, compRate: '82%' },
  { id: 'SLA-004', name: 'Finance — 48 Hr', process: 'Purchase Requisition', type: 'Task-Level', duration: '48 hours', penaltyPer: 'N200/hr', activePenalty: true, cases: 62, exceeded: 9, compRate: '85%' },
  { id: 'SLA-005', name: 'ICT Incident Response', process: 'Incident Escalation', type: 'Entire Process', duration: '24 hours', penaltyPer: '—', activePenalty: false, cases: 46, exceeded: 4, compRate: '91%' },
]

const ASSIGNMENT_RULES = [
  { rule: 'Specific User', desc: 'Task always goes to one named individual.', example: 'DG final approval', icon: User },
  { rule: 'Role / Group', desc: 'Task goes to a group; rule selects the member.', example: 'Procurement Officers pool', icon: Users },
  { rule: 'Cyclical (Round-Robin)', desc: 'Cycles through group members in order.', example: 'Helpdesk ticket assignment', icon: RefreshCw },
  { rule: 'Manual Assignment', desc: 'Previous assignee picks the next user.', example: 'Ad-hoc legal consulting', icon: Edit2 },
  { rule: 'Value-Based', desc: 'A case variable determines the assignee (@@NextUser).', example: 'Amount > N5M → DG', icon: GitBranch },
  { rule: 'Reports To', desc: 'Routes to the supervisor of the previous assignee.', example: 'All leave approvals', icon: ArrowDown },
  { rule: 'Self Service', desc: 'Any eligible group member may claim the task.', example: 'Shared support queue', icon: UserCheck },
]

const NOTIF_EVENTS = [
  { event: 'Task Assigned', who: 'Assignee', channel: 'In-App + Email', purpose: '"You have a new task"' },
  { event: 'Task Due Soon (12 hr)', who: 'Assignee', channel: 'In-App', purpose: 'Reminder before deadline' },
  { event: 'Task Overdue', who: 'Assignee + Manager', channel: 'In-App + Email', purpose: 'Escalation alert' },
  { event: 'Request Started', who: 'Requester', channel: 'In-App', purpose: 'Confirmation of submission' },
  { event: 'Request Completed', who: 'Requester + Participants', channel: 'In-App + Email', purpose: 'Closure notification' },
  { event: 'Request Cancelled', who: 'Requester + Participants', channel: 'In-App', purpose: 'Process terminated' },
  { event: 'Request Error', who: 'Process Manager', channel: 'Email', purpose: 'Troubleshooting needed' },
  { event: 'SLA Breach Imminent', who: 'Assignee + Process Manager', channel: 'Email + SMS', purpose: 'Urgent escalation' },
]

const AUDIT_LOG = [
  { ts: '07 Apr 2026 09:14', case: 'CASE-2026-0312', action: 'Task Approved', by: 'I. Abdullahi', detail: 'Finance Approval approved. Routed to DG.', type: 'approve' },
  { ts: '07 Apr 2026 08:50', case: 'CASE-2026-0309', action: 'SLA Breached', by: 'System', detail: 'Corrective Action task exceeded 24-hr SLA. Escalation sent.', type: 'breach' },
  { ts: '06 Apr 2026 17:22', case: 'CASE-2026-0311', action: 'Task Reassigned', by: 'Emmanuel Bello', detail: 'Reassigned from absent officer to HR Officer.', type: 'reassign' },
  { ts: '06 Apr 2026 14:05', case: 'CASE-2026-0310', action: 'Case Opened', by: 'Fatima Aliyu', detail: 'Purchase Requisition CASE-2026-0310 created.', type: 'open' },
  { ts: '05 Apr 2026 11:30', case: 'CASE-2026-0311', action: 'Task Rejected', by: 'Dr. Sule', detail: 'Leave rejected — insufficient cover. Returned to requester.', type: 'reject' },
  { ts: '04 Apr 2026 16:00', case: 'CASE-2026-0307', action: 'Case Completed', by: 'System', detail: 'Leave Approval process completed successfully.', type: 'complete' },
  { ts: '04 Apr 2026 10:15', case: 'CASE-2026-0312', action: 'Task Assigned', by: 'System', detail: 'Finance Approval auto-assigned to I. Abdullahi (Cyclical).', type: 'assign' },
  { ts: '03 Apr 2026 09:00', case: 'CASE-2026-0308', action: 'Case Opened', by: 'Abubakar Musa', detail: 'Contract Review process initiated.', type: 'open' },
]

/* ═══════════════════════════════ TAB 1: PROCESS DESIGNER ═══════════════════════════════ */

function ProcessDesignerTab({ toast }) {
  const { addNotification } = useNotifications()
  const [processes, setProcesses] = useState(PROCESSES_INIT)
  const [selected, setSelected] = useState('PROC-001')
  const [showCreate, setShowCreate] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(null)
  const [filter, setFilter] = useState('All')
  const [form, setForm] = useState({ name: '', category: 'Procurement', status: 'Draft', sla: '', description: '' })
  const [taskForm, setTaskForm] = useState({ name: '', type: 'Form Task', assign: 'Self', dueHrs: 48, priority: 3, routing: '' })

  const proc = processes.find(p => p.id === selected)
  const tasks = proc?.id === 'PROC-001' ? TASKS_PROC001 : []

  const visible = filter === 'All' ? processes : processes.filter(p => p.status === filter)

  const PRIORITY_LABEL = { 1: 'Very Low', 2: 'Low', 3: 'Normal', 4: 'High', 5: 'Very High' }
  const PRIORITY_COLOR = { 1: 'slate', 2: 'blue', 3: 'teal', 4: 'amber', 5: 'red' }
  const TYPE_ICON = { 'Form Task': FileText, 'Approval Task': CheckSquare, 'Service Task': Zap, 'Script Task': Cpu, 'Sub-Process': Layers }

  function handleCreate() {
    if (!form.name.trim()) return toast.show('Process name is required.')
    const newP = {
      id: 'PROC-0' + String(processes.length + 1).padStart(2, '0'),
      name: form.name, category: form.category, status: 'Draft',
      version: '0.1', tasks: 0, activeCases: 0, completedCases: 0,
      avgDuration: '—', manager: 'Emmanuel Bello',
      created: '07 Apr 2026', sla: form.sla || 'TBD',
      description: form.description,
    }
    setProcesses(prev => [newP, ...prev])
    setSelected(newP.id)
    setShowCreate(false)
    setForm({ name: '', category: 'Procurement', status: 'Draft', sla: '', description: '' })
    toast.show(`Process "${newP.name}" created as Draft.`)
    addNotification({ title: 'New Process Created', sub: `"${newP.name}" has been created as a Draft in the Process Maker.`, type: 'info', link: '/app/process-maker', module: 'Process Maker' })
  }

  function handleActivate(id) {
    const proc = processes.find(p => p.id === id)
    setProcesses(prev => prev.map(p => p.id === id ? { ...p, status: 'Active' } : p))
    toast.show('Process published and set to Active.')
    addNotification({ title: 'Process Published', sub: `"${proc?.name || id}" is now Active and available to all users.`, type: 'success', link: '/app/process-maker', module: 'Process Maker' })
  }

  function handleAddTask() {
    if (!taskForm.name.trim()) return toast.show('Task name is required.')
    toast.show(`Task "${taskForm.name}" added to process.`)
    setShowTaskModal(null)
    setTaskForm({ name: '', type: 'Form Task', assign: 'Self', dueHrs: 48, priority: 3, routing: '' })
  }

  return (
    <div className="flex gap-5 h-[calc(100vh-220px)] min-h-0">
      {/* Process list */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <select className="input text-xs flex-1" value={filter} onChange={e => setFilter(e.target.value)}>
            {['All', 'Active', 'Draft', 'Archived'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="btn-primary text-xs flex items-center gap-1 whitespace-nowrap" onClick={() => setShowCreate(true)}>
            <Plus size={13} /> New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
          {visible.map(p => (
            <button key={p.id} onClick={() => setSelected(p.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${selected === p.id ? 'border-[#006838] bg-green-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <div className="font-semibold text-slate-800 truncate">{p.name}</div>
              <div className="text-slate-400 text-[10px] mt-0.5">{p.category} · {p.tasks} tasks</div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <SBadge label={p.status} color={p.status === 'Active' ? 'green' : p.status === 'Draft' ? 'amber' : 'slate'} />
                <span className="text-[10px] text-slate-400">v{p.version}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Process canvas */}
      {proc && (
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <div className="card mb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-slate-900">{proc.name}</h3>
                  <SBadge label={proc.status} color={proc.status === 'Active' ? 'green' : 'amber'} />
                  <span className="text-[10px] text-slate-400">v{proc.version}</span>
                </div>
                <p className="text-xs text-slate-500">{proc.description}</p>
                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                  <span>Category: <b className="text-slate-700">{proc.category}</b></span>
                  <span>SLA: <b className="text-slate-700">{proc.sla}</b></span>
                  <span>Manager: <b className="text-slate-700">{proc.manager}</b></span>
                  <span>Created: <b className="text-slate-700">{proc.created}</b></span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {proc.status === 'Draft' && (
                  <button className="btn-primary text-xs flex items-center gap-1" onClick={() => handleActivate(proc.id)}>
                    <Play size={12} /> Publish
                  </button>
                )}
                <button className="btn-secondary text-xs flex items-center gap-1" onClick={() => setShowTaskModal(true)}>
                  <Plus size={12} /> Add Task
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
              <div className="text-center"><div className="text-lg font-bold text-[#006838]">{proc.activeCases}</div><div className="text-[10px] text-slate-500">Active Cases</div></div>
              <div className="text-center"><div className="text-lg font-bold text-slate-800">{proc.completedCases}</div><div className="text-[10px] text-slate-500">Completed</div></div>
              <div className="text-center"><div className="text-lg font-bold text-blue-600">{proc.avgDuration}</div><div className="text-[10px] text-slate-500">Avg Duration</div></div>
            </div>
          </div>

          {/* Task flow visualization */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-700">Task Flow ({tasks.length} steps)</h4>
              <span className="text-[10px] text-slate-400">Click task to view config</span>
            </div>
            {tasks.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">No tasks defined yet. Click "Add Task" to begin.</div>
            ) : (
              <div className="flex flex-wrap items-center gap-0">
                {tasks.map((t, i) => {
                  const TypeIcon = TYPE_ICON[t.type] || FileText
                  return (
                    <div key={t.seq} className="flex items-center gap-0">
                      <div className={`relative group border-2 rounded-xl p-3 w-44 cursor-pointer hover:shadow-md transition-all
                        ${t.status === 'Conditional' ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white hover:border-[#006838]'}`}>
                        <div className={`absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white
                          ${t.priority >= 5 ? 'bg-red-500' : t.priority >= 4 ? 'bg-amber-500' : 'bg-slate-400'}`}>{t.seq}</div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <TypeIcon size={12} className="text-[#006838]" />
                          <span className="text-[10px] font-semibold text-slate-700 truncate">{t.name}</span>
                        </div>
                        <div className="text-[9px] text-slate-400">{t.type}</div>
                        <div className="text-[9px] text-slate-400 truncate mt-0.5">{t.assign}</div>
                        <div className="text-[9px] text-amber-600 mt-0.5"><Clock size={8} className="inline mr-0.5" />{t.dueHrs}h SLA</div>
                        {t.status === 'Conditional' && <div className="text-[9px] text-amber-700 font-semibold mt-0.5">⚡ Conditional</div>}
                      </div>
                      {i < tasks.length - 1 && (
                        <div className="flex flex-col items-center px-1">
                          <ArrowRight size={16} className="text-slate-300" />
                          {i === 1 && <span className="text-[8px] text-green-600 font-semibold">IF APPROVED</span>}
                        </div>
                      )}
                    </div>
                  )
                })}
                <div className="flex items-center gap-0">
                  <ArrowRight size={16} className="text-slate-300 mx-1" />
                  <div className="border-2 border-green-300 bg-green-50 rounded-xl p-3 w-20 text-center">
                    <CheckCircle size={18} className="text-green-500 mx-auto mb-1" />
                    <div className="text-[9px] font-bold text-green-700">Complete</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Task detail table */}
          {tasks.length > 0 && (
            <div className="card mt-4">
              <h4 className="text-xs font-bold text-slate-700 mb-3">Task Configuration</h4>
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    {['#', 'Task Name', 'Type', 'Assignment', 'SLA', 'Priority', 'Routing Rule'].map(h => (
                      <th key={h} className="table-th text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t.seq} className="hover:bg-slate-50">
                      <td className="table-td font-bold text-slate-400">{t.seq}</td>
                      <td className="table-td font-semibold text-slate-800">{t.name}</td>
                      <td className="table-td"><SBadge label={t.type} color="blue" /></td>
                      <td className="table-td text-slate-500 max-w-[160px]">{t.assign}</td>
                      <td className="table-td"><span className="text-amber-600 font-semibold">{t.dueHrs}h</span></td>
                      <td className="table-td"><SBadge label={PRIORITY_LABEL[t.priority]} color={PRIORITY_COLOR[t.priority]} /></td>
                      <td className="table-td text-slate-500 max-w-[180px] text-[10px]">{t.routing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Process Modal */}
      {showCreate && (
        <Modal title="New Process Definition" onClose={() => setShowCreate(false)}>
          <Fld label="Process Name" required><input className="input w-full text-xs" placeholder="e.g. Purchase Requisition" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></Fld>
          <Fld label="Category">
            <select className="input w-full text-xs" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {['Procurement', 'HR', 'Finance', 'Legal', 'ICT', 'Admin', 'Operations'].map(c => <option key={c}>{c}</option>)}
            </select>
          </Fld>
          <Fld label="Process SLA (e.g. 5 days)"><input className="input w-full text-xs" placeholder="e.g. 5 days" value={form.sla} onChange={e => setForm(f => ({ ...f, sla: e.target.value }))} /></Fld>
          <Fld label="Description"><textarea className="input w-full text-xs" rows={3} placeholder="Brief description of this process…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></Fld>
          <button className="btn-primary w-full text-xs" onClick={handleCreate}>Create Process</button>
        </Modal>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <Modal title="Add Task to Process" onClose={() => setShowTaskModal(null)}>
          <Fld label="Task Name" required><input className="input w-full text-xs" placeholder="e.g. Manager Approval" value={taskForm.name} onChange={e => setTaskForm(f => ({ ...f, name: e.target.value }))} /></Fld>
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Task Type">
              <select className="input w-full text-xs" value={taskForm.type} onChange={e => setTaskForm(f => ({ ...f, type: e.target.value }))}>
                {['Form Task', 'Approval Task', 'Service Task', 'Script Task', 'Sub-Process'].map(t => <option key={t}>{t}</option>)}
              </select>
            </Fld>
            <Fld label="Priority (1–5)">
              <select className="input w-full text-xs" value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: Number(e.target.value) }))}>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} — {['Very Low', 'Low', 'Normal', 'High', 'Very High'][n - 1]}</option>)}
              </select>
            </Fld>
          </div>
          <Fld label="Assignment Rule">
            <select className="input w-full text-xs" value={taskForm.assign} onChange={e => setTaskForm(f => ({ ...f, assign: e.target.value }))}>
              {['Self (Requester)', 'Specific User', 'Role / Group', 'Cyclical (Round-Robin)', 'Manual Assignment', 'Value-Based (@@NextUser)', 'Reports To', 'Self Service'].map(r => <option key={r}>{r}</option>)}
            </select>
          </Fld>
          <Fld label="Due In (hours)"><input className="input w-full text-xs" type="number" min={1} value={taskForm.dueHrs} onChange={e => setTaskForm(f => ({ ...f, dueHrs: Number(e.target.value) }))} /></Fld>
          <Fld label="Routing Rule / Condition"><input className="input w-full text-xs" placeholder="e.g. On Approve → Finance; On Reject → Requester" value={taskForm.routing} onChange={e => setTaskForm(f => ({ ...f, routing: e.target.value }))} /></Fld>
          <button className="btn-primary w-full text-xs" onClick={handleAddTask}>Add Task</button>
        </Modal>
      )}
    </div>
  )
}

/* ═══════════════════════════════ TAB 2: ACTIVE CASES ═══════════════════════════════ */

function ActiveCasesTab({ toast }) {
  const { addNotification } = useNotifications()
  const [cases, setCases] = useState(CASES_INIT)
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterProcess, setFilterProcess] = useState('All')
  const [showReassign, setShowReassign] = useState(null)
  const [newAssignee, setNewAssignee] = useState('')

  const SLA_DOT = { green: 'bg-green-400', amber: 'bg-amber-400', red: 'bg-red-500' }
  const STATUS_COLOR = { 'In Progress': 'blue', Overdue: 'red', Completed: 'green', Cancelled: 'slate' }

  const visible = cases.filter(c => {
    const ms = filterStatus === 'All' || c.status === filterStatus
    const mp = filterProcess === 'All' || c.process === filterProcess
    return ms && mp
  })

  const processes = [...new Set(cases.map(c => c.process))]

  function handleReassign() {
    if (!newAssignee.trim()) return toast.show('Enter a new assignee name.')
    setCases(prev => prev.map(c => c.id === showReassign.id ? { ...c, currentAssignee: newAssignee, status: 'In Progress', slaStatus: 'amber' } : c))
    toast.show(`Case ${showReassign.id} reassigned to ${newAssignee}.`)
    addNotification({ title: 'Task Reassigned', sub: `${showReassign.id} has been reassigned to ${newAssignee}.`, type: 'task', link: '/app/process-maker', module: 'Process Maker' })
    setShowReassign(null)
    setNewAssignee('')
  }

  function handleCancel(id) {
    setCases(prev => prev.map(c => c.id === id ? { ...c, status: 'Cancelled', slaStatus: 'slate', currentTask: '—', currentAssignee: '—' } : c))
    toast.show(`Case ${id} has been cancelled.`)
    addNotification({ title: 'Case Cancelled', sub: `Case ${id} has been cancelled by the Process Manager.`, type: 'warning', link: '/app/process-maker', module: 'Process Maker' })
    setSelected(null)
  }

  const selCase = cases.find(c => c.id === selected)

  return (
    <div className="space-y-4">
      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Active', value: cases.filter(c => c.status === 'In Progress').length, color: 'text-[#006838]' },
          { label: 'Overdue', value: cases.filter(c => c.status === 'Overdue').length, color: 'text-red-600' },
          { label: 'Completed Today', value: cases.filter(c => c.status === 'Completed').length, color: 'text-blue-600' },
          { label: 'SLA Compliance', value: '88%', color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <select className="input text-xs w-44" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {['All', 'In Progress', 'Overdue', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="input text-xs w-52" value={filterProcess} onChange={e => setFilterProcess(e.target.value)}>
          <option>All</option>
          {processes.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Cases table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>{['Case ID', 'Process', 'Initiated By', 'Current Task', 'Assignee', 'SLA Deadline', 'Progress', 'Status', 'Actions'].map(h => <th key={h} className="table-th text-left">{h}</th>)}</tr>
          </thead>
          <tbody>
            {visible.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelected(c.id === selected ? null : c.id)}>
                <td className="table-td font-mono font-semibold text-[#006838]">{c.id}</td>
                <td className="table-td text-slate-700">{c.process}</td>
                <td className="table-td text-slate-600">{c.initiator}</td>
                <td className="table-td font-semibold text-slate-800">{c.currentTask}</td>
                <td className="table-td text-slate-600">{c.currentAssignee}</td>
                <td className="table-td text-slate-600">{c.slaDeadline}</td>
                <td className="table-td">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${c.progress === 100 ? 'bg-green-500' : 'bg-[#006838]'}`} style={{ width: `${c.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400">{c.progress}%</span>
                  </div>
                </td>
                <td className="table-td">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${SLA_DOT[c.slaStatus]}`} />
                    <SBadge label={c.status} color={STATUS_COLOR[c.status]} />
                  </div>
                </td>
                <td className="table-td">
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button className="text-[10px] text-blue-600 hover:underline" onClick={() => setShowReassign(c)}>Reassign</button>
                    {c.status !== 'Completed' && c.status !== 'Cancelled' && (
                      <button className="text-[10px] text-red-500 hover:underline ml-1" onClick={() => handleCancel(c.id)}>Cancel</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Case drill-down */}
      {selCase && (
        <div className="card border-l-4 border-[#006838]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-800">Case Detail — {selCase.id}</h4>
            <button onClick={() => setSelected(null)}><X size={14} className="text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div><span className="text-slate-400">Process:</span> <b>{selCase.process}</b></div>
            <div><span className="text-slate-400">Initiator:</span> <b>{selCase.initiator}</b></div>
            <div><span className="text-slate-400">Started:</span> <b>{selCase.started}</b></div>
            <div><span className="text-slate-400">Current Task:</span> <b>{selCase.currentTask}</b></div>
            <div><span className="text-slate-400">Assignee:</span> <b>{selCase.currentAssignee}</b></div>
            <div><span className="text-slate-400">SLA Deadline:</span> <b className={selCase.slaStatus === 'red' ? 'text-red-600' : ''}>{selCase.slaDeadline}</b></div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 bg-slate-100 rounded-full h-2">
              <div className="h-2 rounded-full bg-[#006838]" style={{ width: `${selCase.progress}%` }} />
            </div>
            <span className="text-xs font-semibold text-[#006838]">{selCase.progress}%</span>
          </div>
          {selCase.slaStatus === 'red' && (
            <div className="mt-3 flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200 text-xs text-red-700">
              <AlertTriangle size={13} /> SLA BREACHED — escalation notification sent to Process Manager.
            </div>
          )}
        </div>
      )}

      {/* Reassign Modal */}
      {showReassign && (
        <Modal title={`Reassign — ${showReassign.id}`} onClose={() => setShowReassign(null)}>
          <p className="text-xs text-slate-500">Current assignee: <b>{showReassign.currentAssignee}</b></p>
          <Fld label="New Assignee" required>
            <input className="input w-full text-xs" placeholder="Enter staff name or email" value={newAssignee} onChange={e => setNewAssignee(e.target.value)} />
          </Fld>
          <Fld label="Reason for Reassignment">
            <select className="input w-full text-xs">
              {['User inactive / on leave', 'Workload balancing', 'Subject matter change', 'User request', 'Other'].map(r => <option key={r}>{r}</option>)}
            </select>
          </Fld>
          <button className="btn-primary w-full text-xs" onClick={handleReassign}>Confirm Reassignment</button>
        </Modal>
      )}
    </div>
  )
}

/* ═══════════════════════════════ TAB 3: ASSIGNMENT RULES ═══════════════════════════════ */

function AssignmentRulesTab({ toast }) {
  const [showDemo, setShowDemo] = useState('Cyclical (Round-Robin)')

  const DEMO = {
    'Cyclical (Round-Robin)': {
      title: 'Round-Robin: Procurement Officers',
      steps: [
        { case: 'CASE-0312', assignee: 'Officer A (USR001)', note: 'Auto-assigned — 1st in cycle' },
        { case: 'CASE-0313', assignee: 'Officer B (USR002)', note: 'Auto-assigned — 2nd in cycle' },
        { case: 'CASE-0314', assignee: 'Officer C (USR003)', note: 'Auto-assigned — 3rd in cycle' },
        { case: 'CASE-0315', assignee: 'Officer A (USR001)', note: 'Cycle restarts from 1st' },
      ],
    },
    'Value-Based': {
      title: 'Value-Based: Amount → Approver',
      steps: [
        { case: 'N50,000', assignee: 'Local Manager', note: 'Amount < N100k' },
        { case: 'N800,000', assignee: 'Department Head', note: 'N100k – N1M' },
        { case: 'N3,500,000', assignee: 'Director of Finance', note: 'N1M – N10M' },
        { case: 'N15,000,000', assignee: 'Director General', note: 'Amount > N10M' },
      ],
    },
    'Reports To': {
      title: 'Reports-To: Leave Approval Hierarchy',
      steps: [
        { case: 'Amaka Nwosu (Analyst)', assignee: 'Dr. Sule (HOD, Procurement)', note: 'Requester\'s direct supervisor' },
        { case: 'Dr. Sule (HOD)', assignee: 'Dir. A. Musa (Director)', note: 'HOD\'s supervisor' },
        { case: 'Dir. A. Musa', assignee: 'DG', note: 'Director\'s supervisor' },
      ],
    },
  }

  return (
    <div className="space-y-5">
      <div className="card">
        <h3 className="text-xs font-bold text-slate-800 mb-4">Assignment Rule Types</h3>
        <div className="grid grid-cols-2 gap-3">
          {ASSIGNMENT_RULES.map(r => (
            <div key={r.rule} className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-[#006838] hover:bg-green-50 transition-all">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                <r.icon size={15} className="text-[#006838]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-800">{r.rule}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{r.desc}</div>
                <div className="text-[10px] text-[#006838] mt-0.5 font-medium">e.g. {r.example}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-xs font-bold text-slate-800">Live Rule Demo</h3>
          <select className="input text-xs w-56" value={showDemo} onChange={e => setShowDemo(e.target.value)}>
            {Object.keys(DEMO).map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-700 mb-3">{DEMO[showDemo].title}</div>
          <div className="space-y-2">
            {DEMO[showDemo].steps.map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <div className="w-6 h-6 bg-[#006838] rounded-full flex items-center justify-center text-[9px] text-white font-bold flex-shrink-0">{i + 1}</div>
                <ArrowRight size={12} className="text-slate-300 flex-shrink-0" />
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex-1">
                  <span className="font-medium text-slate-500">{s.case}</span>
                  <ArrowRight size={10} className="inline mx-2 text-slate-300" />
                  <span className="font-semibold text-[#006838]">{s.assignee}</span>
                </div>
                <span className="text-[10px] text-slate-400 w-40 text-right">{s.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xs font-bold text-slate-800 mb-3">Routing Rules</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { type: 'Sequential', icon: ArrowRight, desc: 'Tasks execute one after another. Each must complete before next begins.', eg: 'Requester → HOD → Finance → DG', color: 'blue' },
            { type: 'Parallel', icon: GitBranch, desc: 'Multiple tasks run simultaneously. Process waits for all to complete.', eg: 'Legal Review + Compliance Review (both required)', color: 'purple' },
            { type: 'Conditional', icon: ChevronRight, desc: 'Routing path depends on a field value or condition.', eg: 'If Amount > N5M → DG; else → Complete', color: 'amber' },
            { type: 'Dynamic (Ad Hoc)', icon: Edit2, desc: 'Assignee manually selects the next user from an eligible list.', eg: 'Manager picks consultant for specialized review', color: 'teal' },
          ].map(r => (
            <div key={r.type} className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 mb-1.5">
                <r.icon size={14} className="text-[#006838]" />
                <span className="text-xs font-semibold text-slate-800">{r.type}</span>
                <SBadge label={r.type} color={r.color} />
              </div>
              <p className="text-[10px] text-slate-500">{r.desc}</p>
              <p className="text-[10px] text-[#006838] mt-1 font-medium">e.g. {r.eg}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════ TAB 4: SLA ENGINE ═══════════════════════════════ */

function SLAEngineTab({ toast }) {
  const [policies, setPolicies] = useState(SLA_POLICIES)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', process: 'Purchase Requisition', type: 'Entire Process', duration: '', penaltyPer: '', activePenalty: false })

  function handleCreate() {
    if (!form.name.trim() || !form.duration.trim()) return toast.show('SLA Name and Duration are required.')
    const newSLA = {
      id: 'SLA-0' + String(policies.length + 1).padStart(2, '0'),
      name: form.name, process: form.process, type: form.type,
      duration: form.duration, penaltyPer: form.activePenalty ? form.penaltyPer : '—',
      activePenalty: form.activePenalty, cases: 0, exceeded: 0, compRate: '—',
    }
    setPolicies(prev => [...prev, newSLA])
    setShowCreate(false)
    setForm({ name: '', process: 'Purchase Requisition', type: 'Entire Process', duration: '', penaltyPer: '', activePenalty: false })
    toast.show(`SLA policy "${newSLA.name}" created.`)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Active SLA Policies', value: policies.length, color: 'text-[#006838]' },
          { label: 'Total Cases Tracked', value: policies.reduce((a, p) => a + p.cases, 0), color: 'text-blue-600' },
          { label: 'Total Breaches', value: policies.reduce((a, p) => a + p.exceeded, 0), color: 'text-red-600' },
          { label: 'Avg Compliance', value: '89%', color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-800">SLA Policies</h3>
          <button className="btn-primary text-xs flex items-center gap-1" onClick={() => setShowCreate(true)}><Plus size={12} /> New SLA</button>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr>{['SLA Name', 'Process', 'Type', 'Duration', 'Penalty', 'Cases', 'Breaches', 'Compliance'].map(h => <th key={h} className="table-th text-left">{h}</th>)}</tr>
          </thead>
          <tbody>
            {policies.map(s => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="table-td font-semibold text-slate-800">{s.name}</td>
                <td className="table-td text-slate-600">{s.process}</td>
                <td className="table-td"><SBadge label={s.type} color={s.type === 'Entire Process' ? 'blue' : 'purple'} /></td>
                <td className="table-td font-semibold text-amber-600">{s.duration}</td>
                <td className="table-td">{s.activePenalty ? <SBadge label={s.penaltyPer} color="red" /> : <span className="text-slate-300">—</span>}</td>
                <td className="table-td text-slate-600">{s.cases}</td>
                <td className="table-td"><span className={s.exceeded > 10 ? 'text-red-600 font-semibold' : 'text-slate-600'}>{s.exceeded}</span></td>
                <td className="table-td">
                  <span className={`font-semibold ${parseFloat(s.compRate) >= 90 ? 'text-green-600' : parseFloat(s.compRate) >= 80 ? 'text-amber-600' : 'text-red-600'}`}>{s.compRate}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SLA monitoring flow */}
      <div className="card">
        <h3 className="text-xs font-bold text-slate-800 mb-4">SLA Monitoring Lifecycle</h3>
        <div className="flex flex-wrap items-center gap-0">
          {[
            { step: '1', label: 'Task Assigned', sub: 'SLA timer starts', color: 'bg-blue-500' },
            { step: '2', label: 'Tracking Active', sub: 'Elapsed vs duration', color: 'bg-teal-500' },
            { step: '3', label: '12hr Warning', sub: 'Reminder notification', color: 'bg-amber-500' },
            { step: '4', label: 'SLA Expiry', sub: 'Mark as Overdue', color: 'bg-orange-500' },
            { step: '5', label: 'Escalation', sub: 'Manager notified', color: 'bg-red-500' },
            { step: '6', label: 'Penalty Calc', sub: 'Per-hour rate applied', color: 'bg-red-700' },
          ].map((s, i) => (
            <div key={s.step} className="flex items-center">
              <div className="text-center">
                <div className={`w-10 h-10 rounded-full ${s.color} text-white flex items-center justify-center text-xs font-bold mx-3`}>{s.step}</div>
                <div className="text-[10px] font-semibold text-slate-700 mt-1 w-20 text-center">{s.label}</div>
                <div className="text-[9px] text-slate-400 w-20 text-center">{s.sub}</div>
              </div>
              {i < 5 && <ArrowRight size={14} className="text-slate-300 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* SLA report */}
      <div className="card">
        <h3 className="text-xs font-bold text-slate-800 mb-3">SLA Report Summary</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { title: 'SLA Summary', items: ['Total cases executed', 'Total SLA duration used', 'Time exceeded across all', 'Average exceeded per case', 'Estimated penalty total'] },
            { title: 'SLA Detailed (per case)', items: ['Case ID + initiator', 'SLA duration allocated', 'Actual duration taken', 'Time exceeded (if any)', 'Status: On-time / Breached'] },
            { title: 'SLA Case Timeline', items: ['Per-task elapsed time', 'Bottleneck identification', 'Longest step highlighted', 'Reassignment events', 'Export: PDF / CSV'] },
          ].map(r => (
            <div key={r.title} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-700 mb-2">{r.title}</div>
              <ul className="space-y-1">
                {r.items.map(item => (
                  <li key={item} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                    <CheckCircle size={10} className="text-green-500 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {showCreate && (
        <Modal title="New SLA Policy" onClose={() => setShowCreate(false)}>
          <Fld label="SLA Name" required><input className="input w-full text-xs" placeholder="e.g. 48-Hour Approval SLA" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></Fld>
          <div className="grid grid-cols-2 gap-3">
            <Fld label="Process">
              <select className="input w-full text-xs" value={form.process} onChange={e => setForm(f => ({ ...f, process: e.target.value }))}>
                {PROCESSES_INIT.map(p => <option key={p.id}>{p.name}</option>)}
              </select>
            </Fld>
            <Fld label="Type">
              <select className="input w-full text-xs" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {['Entire Process', 'Task-Level', 'Multiple Tasks'].map(t => <option key={t}>{t}</option>)}
              </select>
            </Fld>
          </div>
          <Fld label="Duration (e.g. 48 hours, 5 days)" required><input className="input w-full text-xs" placeholder="e.g. 48 hours" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} /></Fld>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="penalty" checked={form.activePenalty} onChange={e => setForm(f => ({ ...f, activePenalty: e.target.checked }))} />
            <label htmlFor="penalty" className="text-xs text-slate-600">Activate penalty</label>
          </div>
          {form.activePenalty && (
            <Fld label="Penalty Rate (e.g. N500/hr)"><input className="input w-full text-xs" placeholder="N500/hr" value={form.penaltyPer} onChange={e => setForm(f => ({ ...f, penaltyPer: e.target.value }))} /></Fld>
          )}
          <button className="btn-primary w-full text-xs" onClick={handleCreate}>Create SLA Policy</button>
        </Modal>
      )}
    </div>
  )
}

/* ═══════════════════════════════ TAB 5: NOTIFICATIONS ═══════════════════════════════ */

function NotificationsTab({ toast }) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [showTemplate, setShowTemplate] = useState(false)
  const [template, setTemplate] = useState({ event: 'Task Assigned', subject: 'New Task Assigned: @@TASK', body: 'Dear @#requesterName,\n\nYou have a new task on Case #@@APPLICATION:\n\nTask: @@TASK\nDue In: @#dueHours hours\n\nPlease log in to act on this task.\n\nRegards,\nNAPTIN Process Engine' })

  const TYPE_ICON_MAP = { success: CheckCircle, info: Bell, warning: AlertTriangle, error: XCircle, task: UserCheck, breach: AlertTriangle }

  function handleMarkAllRead() {
    markAllRead()
    toast.show('All notifications marked as read.')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-5">
        {/* Live notification feed from shared context */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">
              In-App Notifications
              {unreadCount > 0 && <span className="ml-1 bg-red-500 text-white text-[9px] rounded-full px-1.5 py-0.5">{unreadCount}</span>}
            </h3>
            {unreadCount > 0 && <button className="text-[10px] text-[#006838] hover:underline" onClick={handleMarkAllRead}>Mark all read</button>}
          </div>
          {notifications.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">No notifications yet.</div>
          )}
          {notifications.slice(0, 12).map(n => {
            const NIcon = TYPE_ICON_MAP[n.type] || Bell
            return (
              <div key={n.id} onClick={() => markRead(n.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${!n.read ? 'border-[#006838] bg-green-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${!n.read ? 'bg-[#006838]' : 'bg-slate-100'}`}>
                  <NIcon size={13} className={!n.read ? 'text-white' : 'text-slate-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-700">{n.title}</span>
                    <span className="text-[9px] text-slate-400">{relativeTime(n.ts)}</span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5 leading-relaxed">{n.sub}</p>
                  {n.module && <span className="text-[9px] font-medium text-[#006838]">{n.module}</span>}
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-[#006838] flex-shrink-0 mt-1" />}
              </div>
            )
          })}
        </div>

        {/* Notification config */}
        <div className="space-y-3">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800">Notification Triggers</h3>
              <button className="text-[10px] text-[#006838] hover:underline" onClick={() => setShowTemplate(true)}>Edit Templates</button>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr>{['Event', 'Recipients', 'Channel'].map(h => <th key={h} className="table-th text-left">{h}</th>)}</tr>
              </thead>
              <tbody>
                {NOTIF_EVENTS.map(e => (
                  <tr key={e.event} className="hover:bg-slate-50">
                    <td className="table-td font-semibold text-slate-700">{e.event}</td>
                    <td className="table-td text-slate-500 text-[10px]">{e.who}</td>
                    <td className="table-td"><SBadge label={e.channel} color="blue" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3 className="text-xs font-bold text-slate-800 mb-3">Notification Status Indicators</h3>
            <div className="space-y-2">
              {[
                { label: 'Unread', dot: 'bg-[#006838]', desc: 'Notification not yet viewed — shown with green dot' },
                { label: 'Read', dot: 'bg-slate-300', desc: 'Notification has been opened' },
                { label: 'Action Required', dot: 'bg-red-500', desc: 'Task assignment — click to open task form' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3 text-xs">
                  <span className={`w-3 h-3 rounded-full ${s.dot}`} />
                  <span className="font-semibold text-slate-700 w-28">{s.label}</span>
                  <span className="text-slate-500">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showTemplate && (
        <Modal title="Email Notification Template" onClose={() => setShowTemplate(false)} wide>
          <Fld label="Trigger Event">
            <select className="input w-full text-xs" value={template.event} onChange={e => setTemplate(f => ({ ...f, event: e.target.value }))}>
              {NOTIF_EVENTS.map(e => <option key={e.event}>{e.event}</option>)}
            </select>
          </Fld>
          <Fld label="Subject"><input className="input w-full text-xs font-mono" value={template.subject} onChange={e => setTemplate(f => ({ ...f, subject: e.target.value }))} /></Fld>
          <Fld label="Body (supports @@VARIABLE and @#variable)">
            <textarea className="input w-full text-xs font-mono" rows={8} value={template.body} onChange={e => setTemplate(f => ({ ...f, body: e.target.value }))} />
          </Fld>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold text-slate-600 mb-2">Available Variables</div>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              {[['@@APPLICATION', 'Case / Request ID'], ['@@TASK', 'Task name'], ['@@USER_LOGGED', 'Current user name'], ['@#requesterName', 'Requester full name'], ['@#approverName', 'Approver name'], ['@#dueHours', 'Hours until SLA deadline']].map(([v, d]) => (
                <div key={v}><code className="bg-white border border-slate-200 px-1 rounded text-[9px]">{v}</code> <span className="text-slate-500">{d}</span></div>
              ))}
            </div>
          </div>
          <button className="btn-primary w-full text-xs" onClick={() => { setShowTemplate(false); toast.show('Email template saved.') }}>Save Template</button>
        </Modal>
      )}
    </div>
  )
}

/* ═══════════════════════════════ TAB 6: PROCESS MANAGER ═══════════════════════════════ */

function ProcessManagerTab({ toast }) {
  const { addNotification } = useNotifications()
  const [exceptions, setExceptions] = useState([
    { id: 'EX-001', case: 'CASE-2026-0311', task: 'HR Review', issue: 'Assignee on leave with no delegate', assignee: 'HR Officer (absent)', status: 'Open', raised: '05 Apr 2026' },
    { id: 'EX-002', case: 'CASE-2026-0309', task: 'Corrective Action', issue: 'SLA breached — 48hr overdue', assignee: 'Emmanuel Bello', status: 'Escalated', raised: '03 Apr 2026' },
    { id: 'EX-003', case: 'CASE-2026-0305', task: 'DG Final Approval', issue: 'Routing error — DG user account inactive', assignee: 'DG (inactive)', status: 'Open', raised: '01 Apr 2026' },
  ])
  const [showResolve, setShowResolve] = useState(null)
  const [resolveForm, setResolveForm] = useState({ action: 'Reassign', newAssignee: '', notes: '' })

  function handleResolve() {
    if (!resolveForm.notes.trim()) return toast.show('Please add resolution notes.')
    setExceptions(prev => prev.map(e => e.id === showResolve.id ? { ...e, status: 'Resolved' } : e))
    toast.show(`Exception ${showResolve.id} resolved.`)
    addNotification({ title: 'Exception Resolved', sub: `${showResolve.id}: ${showResolve.issue} — resolved by Process Manager.`, type: 'success', link: '/app/process-maker', module: 'Process Maker' })
    setShowResolve(null)
    setResolveForm({ action: 'Reassign', newAssignee: '', notes: '' })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Open Exceptions', value: exceptions.filter(e => e.status === 'Open').length, color: 'text-red-600' },
          { label: 'Escalated', value: exceptions.filter(e => e.status === 'Escalated').length, color: 'text-amber-600' },
          { label: 'Resolved Today', value: 4, color: 'text-green-600' },
          { label: 'Avg Resolution', value: '2.1h', color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-3">
          <div className="card">
            <h3 className="text-xs font-bold text-slate-800 mb-3">Open Exceptions</h3>
            {exceptions.filter(e => e.status !== 'Resolved').map(e => (
              <div key={e.id} className="p-3 rounded-xl border border-amber-200 bg-amber-50 mb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">{e.issue}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{e.case} → {e.task}</div>
                    <div className="text-[10px] text-slate-500">Assignee: {e.assignee}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Raised: {e.raised}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <SBadge label={e.status} color={e.status === 'Escalated' ? 'red' : 'amber'} />
                    <button className="text-[10px] text-[#006838] hover:underline mt-1" onClick={() => setShowResolve(e)}>Resolve</button>
                  </div>
                </div>
              </div>
            ))}
            {exceptions.filter(e => e.status !== 'Resolved').length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400">No open exceptions.</div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="card">
            <h3 className="text-xs font-bold text-slate-800 mb-3">Intervention Scenarios</h3>
            <div className="space-y-2">
              {[
                { scenario: 'Assignee account is inactive', action: 'Manually reassign to active user', icon: UserCheck },
                { scenario: 'Reports-To rule but no manager configured', action: 'Identify manager and reassign', icon: Users },
                { scenario: 'User on leave without delegate', action: 'Reassign to available colleague', icon: User },
                { scenario: 'Task stuck — configuration error', action: 'Cancel request or fix routing rules', icon: Settings },
                { scenario: 'SLA breached — excessive delay', action: 'Escalate to Director + force-complete', icon: AlertTriangle },
              ].map(s => (
                <div key={s.scenario} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <s.icon size={13} className="text-[#006838] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-semibold text-slate-700">{s.scenario}</div>
                    <div className="text-[10px] text-slate-500">→ {s.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-xs font-bold text-slate-800 mb-3">Delegation Settings</h3>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-700 mb-3 flex items-start gap-2">
              <Info size={13} className="flex-shrink-0 mt-0.5" />
              When a manager goes on leave, they can delegate approval authority to a named deputy for a specified period. Delegated tasks are marked with a "D" badge.
            </div>
            <button className="btn-secondary w-full text-xs" onClick={() => toast.show('Delegation setup saved.')}>Configure Delegation</button>
          </div>
        </div>
      </div>

      {showResolve && (
        <Modal title={`Resolve Exception — ${showResolve.id}`} onClose={() => setShowResolve(null)}>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-700">
            <b>Issue:</b> {showResolve.issue}<br />
            <b>Case:</b> {showResolve.case} · <b>Task:</b> {showResolve.task}
          </div>
          <Fld label="Resolution Action">
            <select className="input w-full text-xs" value={resolveForm.action} onChange={e => setResolveForm(f => ({ ...f, action: e.target.value }))}>
              {['Reassign to Active User', 'Cancel Request', 'Force-Complete Task', 'Fix Routing & Retry', 'Escalate to Director'].map(a => <option key={a}>{a}</option>)}
            </select>
          </Fld>
          {resolveForm.action === 'Reassign to Active User' && (
            <Fld label="New Assignee"><input className="input w-full text-xs" placeholder="Staff name or email" value={resolveForm.newAssignee} onChange={e => setResolveForm(f => ({ ...f, newAssignee: e.target.value }))} /></Fld>
          )}
          <Fld label="Resolution Notes" required>
            <textarea className="input w-full text-xs" rows={3} placeholder="Document what was done and why…" value={resolveForm.notes} onChange={e => setResolveForm(f => ({ ...f, notes: e.target.value }))} />
          </Fld>
          <button className="btn-primary w-full text-xs" onClick={handleResolve}>Confirm Resolution</button>
        </Modal>
      )}
    </div>
  )
}

/* ═══════════════════════════════ TAB 7: AUDIT LOG ═══════════════════════════════ */

function AuditLogTab({ toast }) {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const TYPE_CONFIG = {
    approve: { label: 'Approved', color: 'green', icon: CheckCircle },
    reject: { label: 'Rejected', color: 'red', icon: XCircle },
    breach: { label: 'SLA Breach', color: 'red', icon: AlertTriangle },
    reassign: { label: 'Reassigned', color: 'amber', icon: RefreshCw },
    open: { label: 'Opened', color: 'blue', icon: Play },
    complete: { label: 'Completed', color: 'teal', icon: CheckCircle2 },
    assign: { label: 'Assigned', color: 'blue', icon: UserCheck },
  }

  const visible = AUDIT_LOG.filter(l => {
    const mf = filter === 'All' || l.type === filter
    const ms = !search || l.case.includes(search) || l.action.toLowerCase().includes(search.toLowerCase()) || l.by.toLowerCase().includes(search.toLowerCase())
    return mf && ms
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input className="input text-xs flex-1" placeholder="Search by case ID, action, or user…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input text-xs w-44" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="All">All Types</option>
          {Object.keys(TYPE_CONFIG).map(k => <option key={k} value={k}>{TYPE_CONFIG[k].label}</option>)}
        </select>
        <button className="btn-secondary text-xs flex items-center gap-1" onClick={() => toast.show('Audit log exported to CSV.')}><Download size={12} /> Export</button>
      </div>

      <div className="card">
        <div className="flex items-start text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-3 gap-4 px-1">
          <span className="w-36">Timestamp</span>
          <span className="w-32">Case ID</span>
          <span className="w-32">Action</span>
          <span className="w-32">By</span>
          <span className="flex-1">Detail</span>
        </div>
        <div className="space-y-1">
          {visible.map((l, i) => {
            const cfg = TYPE_CONFIG[l.type] || { label: l.type, color: 'slate', icon: Activity }
            return (
              <div key={i} className="flex items-start gap-4 px-1 py-2 rounded-lg hover:bg-slate-50 text-xs">
                <span className="w-36 text-slate-400 font-mono text-[10px] flex-shrink-0">{l.ts}</span>
                <span className="w-32 font-mono text-[#006838] font-semibold flex-shrink-0">{l.case}</span>
                <span className="w-32 flex-shrink-0"><SBadge label={cfg.label} color={cfg.color} /></span>
                <span className="w-32 text-slate-600 flex-shrink-0">{l.by}</span>
                <span className="flex-1 text-slate-500 text-[10px]">{l.detail}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <h3 className="text-xs font-bold text-slate-800 mb-3">Audit Log Policy</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Immutability', desc: 'All log entries are append-only. No record can be edited or deleted.' },
            { label: 'Retention', desc: 'Logs retained for 7 years in compliance with Nigerian financial regulations.' },
            { label: 'Export', desc: 'Full log exportable to CSV or PDF by Process Manager and Auditor role only.' },
          ].map(p => (
            <div key={p.label} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 mb-1"><Shield size={12} className="text-[#006838]" /><span className="text-[10px] font-bold text-slate-700">{p.label}</span></div>
              <p className="text-[10px] text-slate-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════ TAB 8: SCHEMA & API ═══════════════════════════════ */

function SchemaAPITab({ toast }) {
  const tables = [
    { name: 'processes', cols: ['id PK', 'name', 'category', 'status', 'version', 'sla_hours', 'manager_id FK→users', 'created_at'] },
    { name: 'process_tasks', cols: ['id PK', 'process_id FK', 'seq', 'name', 'type', 'assignment_rule', 'due_hours', 'priority', 'routing_rule', 'is_conditional', 'condition_expr'] },
    { name: 'cases', cols: ['id PK', 'process_id FK', 'initiator_id FK→users', 'status', 'started_at', 'completed_at', 'sla_deadline'] },
    { name: 'case_tasks', cols: ['id PK', 'case_id FK', 'task_id FK', 'assignee_id FK→users', 'status', 'assigned_at', 'due_at', 'completed_at', 'sla_breached BOOL'] },
    { name: 'approvals', cols: ['id PK', 'case_task_id FK', 'approver_id FK→users', 'decision ENUM(approve,reject,changes)', 'comments', 'decided_at'] },
    { name: 'sla_policies', cols: ['id PK', 'process_id FK', 'task_id FK nullable', 'name', 'type ENUM', 'duration_hours', 'penalty_per_hour', 'active_penalty BOOL'] },
    { name: 'notifications', cols: ['id PK', 'user_id FK', 'case_id FK', 'event_type', 'message', 'channel', 'read BOOL', 'created_at'] },
    { name: 'audit_log', cols: ['id PK', 'case_id FK', 'case_task_id FK nullable', 'actor_id FK→users', 'action', 'detail JSON', 'ts TIMESTAMP'] },
    { name: 'delegations', cols: ['id PK', 'delegator_id FK→users', 'delegate_id FK→users', 'start_date', 'end_date', 'active BOOL'] },
  ]

  const endpoints = [
    { method: 'GET', path: '/api/processes', desc: 'List all process definitions' },
    { method: 'POST', path: '/api/processes', desc: 'Create a new process definition' },
    { method: 'GET', path: '/api/processes/:id/tasks', desc: 'Get all tasks for a process' },
    { method: 'POST', path: '/api/cases', desc: 'Open a new case (start a process)' },
    { method: 'GET', path: '/api/cases', desc: 'List cases (filter by status, process, user)' },
    { method: 'GET', path: '/api/cases/:id', desc: 'Get full case detail with task history' },
    { method: 'POST', path: '/api/cases/:id/tasks/:taskId/approve', desc: 'Approve a task in a case' },
    { method: 'POST', path: '/api/cases/:id/tasks/:taskId/reject', desc: 'Reject a task with reason' },
    { method: 'POST', path: '/api/cases/:id/tasks/:taskId/reassign', desc: 'Reassign a task to a different user' },
    { method: 'POST', path: '/api/cases/:id/cancel', desc: 'Cancel a case (Process Manager only)' },
    { method: 'GET', path: '/api/sla/report', desc: 'SLA summary and detailed breach report' },
    { method: 'GET', path: '/api/audit/:caseId', desc: 'Full audit trail for a case' },
  ]

  const roles = [
    { role: 'Requester', create: '✓', view_own: '✓', view_all: '✗', approve: '✗', reassign: '✗', admin: '✗' },
    { role: 'Approver', create: '✓', view_own: '✓', view_all: '✗', approve: '✓', reassign: '✗', admin: '✗' },
    { role: 'Process Manager', create: '✓', view_own: '✓', view_all: '✓', approve: '✓', reassign: '✓', admin: '✗' },
    { role: 'Auditor', create: '✗', view_own: '✓', view_all: '✓', approve: '✗', reassign: '✗', admin: '✗' },
    { role: 'System Admin', create: '✓', view_own: '✓', view_all: '✓', approve: '✓', reassign: '✓', admin: '✓' },
  ]

  const METHOD_COLOR = { GET: 'green', POST: 'blue', PUT: 'amber', DELETE: 'red' }

  return (
    <div className="space-y-5">
      <div className="card">
        <h3 className="text-xs font-bold text-slate-800 mb-3">Database Schema ({tables.length} tables)</h3>
        <div className="grid grid-cols-3 gap-3">
          {tables.map(t => (
            <div key={t.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 mb-2">
                <Database size={12} className="text-[#006838]" />
                <span className="text-[10px] font-bold text-slate-800 font-mono">{t.name}</span>
              </div>
              <ul className="space-y-0.5">
                {t.cols.map(c => (
                  <li key={c} className="text-[9px] font-mono text-slate-500 truncate">{c}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-800">API Endpoints ({endpoints.length})</h3>
          <button className="btn-secondary text-xs flex items-center gap-1" onClick={() => toast.show('OpenAPI spec downloaded.')}><Download size={12} /> OpenAPI</button>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr>{['Method', 'Endpoint', 'Description'].map(h => <th key={h} className="table-th text-left">{h}</th>)}</tr>
          </thead>
          <tbody>
            {endpoints.map(e => (
              <tr key={e.path} className="hover:bg-slate-50">
                <td className="table-td"><SBadge label={e.method} color={METHOD_COLOR[e.method] || 'slate'} /></td>
                <td className="table-td font-mono text-[10px] text-slate-700">{e.path}</td>
                <td className="table-td text-slate-500">{e.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 className="text-xs font-bold text-slate-800 mb-3">Role Permission Matrix</h3>
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="table-th text-left">Role</th>
              {['Create Case', 'View Own', 'View All', 'Approve/Reject', 'Reassign Tasks', 'Admin Config'].map(h => <th key={h} className="table-th text-center">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {roles.map(r => (
              <tr key={r.role} className="hover:bg-slate-50">
                <td className="table-td font-semibold text-slate-800">{r.role}</td>
                {[r.create, r.view_own, r.view_all, r.approve, r.reassign, r.admin].map((v, i) => (
                  <td key={i} className="table-td text-center">
                    {v === '✓' ? <CheckCircle size={13} className="text-green-500 mx-auto" /> : <XCircle size={13} className="text-slate-300 mx-auto" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ═══════════════════════════════ TABS CONFIG ═══════════════════════════════ */

const TABS = [
  { id: 'designer', label: 'Process Designer', icon: Workflow },
  { id: 'cases', label: 'Active Cases', icon: List },
  { id: 'assignment', label: 'Assignment Rules', icon: Users },
  { id: 'sla', label: 'SLA Engine', icon: Timer },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'manager', label: 'Process Manager', icon: Shield },
  { id: 'audit', label: 'Audit Log', icon: Activity },
  { id: 'schema', label: 'Schema & API', icon: Database },
]

/* ═══════════════════════════════ MAIN PAGE ═══════════════════════════════ */

export default function ProcessMakerPage() {
  const [activeTab, setActiveTab] = useState('designer')
  const toast = useToast()

  const tab = TABS.find(t => t.id === activeTab)

  return (
    <div className="min-h-screen bg-[#F7FAF8]">
      <Toast msg={toast.msg} clear={() => toast.show(null)} />

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={NAPTIN_LOGO} alt="NAPTIN" className="w-9 h-9 object-contain rounded-lg bg-white p-0.5 border border-slate-100" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">Process Maker</h1>
                <SBadge label="ICT Admin" color="purple" />
              </div>
              <p className="text-[11px] text-slate-500">Workflow engine — create, assign, route and track processes with SLAs across the organisation</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Activity size={13} className="text-green-500" />
            <span className="text-green-600 font-semibold">5 processes active</span>
            <span className="mx-1 text-slate-300">|</span>
            <AlertTriangle size={13} className="text-red-400" />
            <span className="text-red-600 font-semibold">2 SLA breaches</span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-slate-100 px-6 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? 'border-[#006838] text-[#006838]'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5">
        {activeTab === 'designer' && <ProcessDesignerTab toast={toast} />}
        {activeTab === 'cases' && <ActiveCasesTab toast={toast} />}
        {activeTab === 'assignment' && <AssignmentRulesTab toast={toast} />}
        {activeTab === 'sla' && <SLAEngineTab toast={toast} />}
        {activeTab === 'notifications' && <NotificationsTab toast={toast} />}
        {activeTab === 'manager' && <ProcessManagerTab toast={toast} />}
        {activeTab === 'audit' && <AuditLogTab toast={toast} />}
        {activeTab === 'schema' && <SchemaAPITab toast={toast} />}
      </div>
    </div>
  )
}
