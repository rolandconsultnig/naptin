import { useState } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import {
  X, ChevronDown, ChevronUp, Plus, Lock, CheckCircle, Upload,
  Download, FileText, Target, BarChart2, Layers, Database,
  AlertTriangle, TrendingUp, TrendingDown, Minus, RefreshCw,
  Users, Edit3, Send,
} from 'lucide-react'

/* ─── Shared utilities ─── */
function useToast() {
  const [msg, setMsg] = useState(null)
  const show = (m) => { setMsg(m); setTimeout(() => setMsg(null), 3200) }
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
function Field({ label, children, required }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-slate-500 uppercase">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <div className="mt-0.5">{children}</div>
    </div>
  )
}

/* ─── Seeded Data ─── */
const STRATEGIC_PLAN_INIT = {
  version: 'v1.0',
  period: '2024 – 2027',
  status: 'draft', // draft | approved | locked
  vision: 'To be the leading institution for power sector workforce development in Africa.',
  mission: 'Delivering world-class training, research, and technical advisory services that empower the energy sector.',
  goals: [
    {
      id: 'G1', goal: 'Excellence in Training Delivery', status: 'on-track',
      objectives: [
        { id: 'O1.1', text: 'Train 15,000 beneficiaries annually by 2027', kpi: 'Annual trainees', baseline: '9,300', target: '15,000', unit: '', dataSource: 'Training MIS', responsible: 'Training Dept', status: 'on-track', actual: '9,300' },
        { id: 'O1.2', text: 'Achieve 90%+ post-training satisfaction rating', kpi: 'Satisfaction rate', baseline: '72%', target: '90%', unit: '%', dataSource: 'Post-training survey', responsible: 'Training Dept', status: 'at-risk', actual: '81%' },
      ],
    },
    {
      id: 'G2', goal: 'Institutional Capacity & Infrastructure', status: 'at-risk',
      objectives: [
        { id: 'O2.1', text: 'Achieve 85%+ RTC utilisation rate across all centres', kpi: 'RTC utilisation', baseline: '64%', target: '85%', unit: '%', dataSource: 'Facilities Management Log', responsible: 'Admin Dept', status: 'at-risk', actual: '78%' },
        { id: 'O2.2', text: 'Accredit all 5 RTCs with ISO 9001 by 2026', kpi: 'ISO-accredited RTCs', baseline: '1', target: '5', unit: '', dataSource: 'Compliance Register', responsible: 'Corporate Services', status: 'delayed', actual: '2' },
      ],
    },
    {
      id: 'G3', goal: 'Research, Innovation & Knowledge Management', status: 'on-track',
      objectives: [
        { id: 'O3.1', text: 'Publish 4 research reports and 1 statistical bulletin annually', kpi: 'Publications per year', baseline: '2', target: '5', unit: '', dataSource: 'Research Repository', responsible: 'Research & Stats', status: 'on-track', actual: '4' },
      ],
    },
    {
      id: 'G4', goal: 'Financial Sustainability', status: 'on-track',
      objectives: [
        { id: 'O4.1', text: 'Grow IGR to 30% of total revenue by 2027', kpi: 'IGR as % of revenue', baseline: '12%', target: '30%', unit: '%', dataSource: 'Finance ERP', responsible: 'Finance Dept', status: 'on-track', actual: '19%' },
      ],
    },
  ],
  approvalChain: [
    { role: 'Planning Head', status: 'approved', date: '10 Mar 2026', comment: 'Well-structured. Approved.' },
    { role: 'Director General', status: 'pending', date: null, comment: null },
    { role: 'Board', status: 'pending', date: null, comment: null },
  ],
  versions: [
    { version: 'v1.0', date: '01 Jan 2024', description: 'Initial Strategic Plan 2024–2027', lockedBy: null },
  ],
}

const DEPT_WORKPLANS_INIT = [
  {
    dept: 'Training', status: 'submitted', totalCost: 185000000, ceiling: 175000000,
    activities: [
      { id: 'A-TRN-01', text: 'Deliver 80 residential training programmes', objective: 'O1.1', startDate: 'Jan 2026', endDate: 'Dec 2026', responsible: 'HOD Training', cost: 120000000, output: '80 programmes delivered, 6,000 trainees' },
      { id: 'A-TRN-02', text: 'Administration of post-training satisfaction surveys', objective: 'O1.2', startDate: 'Feb 2026', endDate: 'Nov 2026', responsible: 'M&E Analyst', cost: 5000000, output: '6,000 surveys collected, results report' },
      { id: 'A-TRN-03', text: 'Upgrade training curriculum for 12 power sector courses', objective: 'O1.1', startDate: 'Jan 2026', endDate: 'Jun 2026', responsible: 'Curriculum Team', cost: 60000000, output: '12 revised curricula approved' },
    ],
  },
  {
    dept: 'Administration', status: 'submitted', totalCost: 42000000, ceiling: 50000000,
    activities: [
      { id: 'A-ADM-01', text: 'RTC facility maintenance and safety upgrades Q1–Q4', objective: 'O2.1', startDate: 'Jan 2026', endDate: 'Dec 2026', responsible: 'Admin Manager', cost: 28000000, output: '5 RTCs maintained, safety cert renewed' },
      { id: 'A-ADM-02', text: 'Procure training equipment for Kaduna RTC expansion', objective: 'O2.1', startDate: 'Feb 2026', endDate: 'Apr 2026', responsible: 'Procurement Manager', cost: 14000000, output: 'Equipment installed, commissioning report' },
    ],
  },
  {
    dept: 'ICT', status: 'approved', totalCost: 31000000, ceiling: 35000000,
    activities: [
      { id: 'A-ICT-01', text: 'Deploy LMS (Learning Management System) phase 2', objective: 'O1.1', startDate: 'Jan 2026', endDate: 'Jun 2026', responsible: 'ICT Director', cost: 22000000, output: 'LMS live, 500 trainees onboarded online' },
      { id: 'A-ICT-02', text: 'Migrate core systems to cloud infrastructure', objective: 'O2.2', startDate: 'Apr 2026', endDate: 'Sep 2026', responsible: 'Systems Admin', cost: 9000000, output: 'Cloud migration completed, RTO < 4hrs' },
    ],
  },
  {
    dept: 'Research & Stats', status: 'pending', totalCost: null, ceiling: 18000000,
    activities: [],
  },
  {
    dept: 'Finance', status: 'submitted', totalCost: 15800000, ceiling: 20000000,
    activities: [
      { id: 'A-FIN-01', text: 'Implement IGR diversification strategy (new certification fees)', objective: 'O4.1', startDate: 'Jan 2026', endDate: 'Dec 2026', responsible: 'Finance Director', cost: 8000000, output: 'IGR grows by 3 percentage points' },
      { id: 'A-FIN-02', text: 'Complete ISO 9001 readiness assessment for finance processes', objective: 'O2.2', startDate: 'Mar 2026', endDate: 'Jun 2026', responsible: 'Internal Audit', cost: 7800000, output: 'Readiness report, gap-closure plan' },
    ],
  },
]

const KPI_SUBMISSIONS_INIT = [
  { id: 'KS-01', kpi: 'Annual trainees (cumulative)', responsible: 'Training Dept', frequency: 'Quarterly', lastValue: '9,300', target: '15,000', status: 'on-track', lastSubmitted: '07 Apr 2026', trend: 'up', commentary: null },
  { id: 'KS-02', kpi: 'Post-training satisfaction rate', responsible: 'Training Dept', frequency: 'Quarterly', lastValue: '81%', target: '90%', status: 'at-risk', lastSubmitted: '07 Apr 2026', trend: 'up', commentary: 'Some RTCs scored lower due to venue issues. Corrective action: facility upgrade planned Q2.' },
  { id: 'KS-03', kpi: 'RTC utilisation rate', responsible: 'Admin Dept', frequency: 'Monthly', lastValue: '78%', target: '85%', status: 'at-risk', lastSubmitted: '01 Apr 2026', trend: 'stable', commentary: null },
  { id: 'KS-04', kpi: 'ISO-accredited RTCs', responsible: 'Corporate Services', frequency: 'Annual', lastValue: '2', target: '5', status: 'delayed', lastSubmitted: '01 Jan 2026', trend: 'down', commentary: 'Accreditation body visit postponed. New timeline: Q3 2026 for 2 additional RTCs.' },
  { id: 'KS-05', kpi: 'Annual publications', responsible: 'Research & Stats', frequency: 'Quarterly', lastValue: '4', target: '5', status: 'on-track', lastSubmitted: '05 Apr 2026', trend: 'up', commentary: null },
  { id: 'KS-06', kpi: 'IGR as % of total revenue', responsible: 'Finance Dept', frequency: 'Monthly', lastValue: '19%', target: '30%', status: 'on-track', lastSubmitted: '05 Apr 2026', trend: 'up', commentary: null },
]

const PLAN_VERSIONS_INIT = [
  { version: 'v1.0', date: '01 Jan 2024', description: 'Initial Strategic Plan 2024–2027', lockedBy: 'DG', period: '2024–2027' },
]

/* ─── Tab 1: Strategic Plan Builder ─── */
function StrategicPlanTab({ toast }) {
  const [plan, setPlan] = useState(STRATEGIC_PLAN_INIT)
  const [expanded, setExpanded] = useState('G1')
  const [showKpiModal, setShowKpiModal] = useState(null) // { goalId, objId } or null
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [kpiForm, setKpiForm] = useState({ kpi: '', baseline: '', target: '', unit: '', dataSource: '', responsible: '' })
  const [goalForm, setGoalForm] = useState({ goal: '' })
  const [versions, setVersions] = useState(PLAN_VERSIONS_INIT)
  const [showVersionModal, setShowVersionModal] = useState(false)
  const [versionNote, setVersionNote] = useState('')

  const statusBadge = (s) => {
    const map = { 'on-track': 'bg-green-100 text-green-700', 'at-risk': 'bg-amber-100 text-amber-700', delayed: 'bg-red-100 text-red-700', pending: 'bg-slate-100 text-slate-500', approved: 'bg-green-100 text-green-700', locked: 'bg-slate-800 text-white', draft: 'bg-blue-100 text-blue-700' }
    return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[s] || 'bg-slate-100 text-slate-500'}`}>{s}</span>
  }

  const handleApprove = (i) => {
    const chain = [...plan.approvalChain]
    chain[i] = { ...chain[i], status: 'approved', date: '07 Apr 2026', comment: 'Approved.' }
    const allApproved = chain.every(c => c.status === 'approved')
    setPlan(p => ({ ...p, approvalChain: chain, status: allApproved ? 'approved' : p.status }))
    toast.show(`${chain[i].role} approval recorded.`)
  }

  const handleLock = () => {
    if (plan.status !== 'approved') { toast.show('Plan must be fully approved before locking.'); return }
    if (!versionNote.trim()) { toast.show('Enter a version description.'); return }
    const newVersion = { version: `v${versions.length + 1}.0`, date: '07 Apr 2026', description: versionNote, lockedBy: 'DG', period: plan.period }
    setVersions(v => [...v, newVersion])
    setPlan(p => ({ ...p, status: 'locked' }))
    setShowVersionModal(false); setVersionNote('')
    toast.show(`Strategic Plan locked as ${newVersion.version} — master reference set.`)
  }

  const handleAddKPI = () => {
    if (!kpiForm.kpi || !kpiForm.target) { toast.show('KPI name and target are required.'); return }
    setPlan(p => ({
      ...p, goals: p.goals.map(g =>
        g.id === showKpiModal.goalId ? {
          ...g, objectives: g.objectives.map(o =>
            o.id === showKpiModal.objId
              ? o
              : o
          ).concat(showKpiModal.objId === '__new' ? [{
            id: `${showKpiModal.goalId}.${g.objectives.length + 1}`,
            text: kpiForm.kpi, kpi: kpiForm.kpi, baseline: kpiForm.baseline, target: kpiForm.target, unit: kpiForm.unit, dataSource: kpiForm.dataSource, responsible: kpiForm.responsible, status: 'pending', actual: kpiForm.baseline,
          }] : [])
        } : g
      )
    }))
    toast.show('Objective & KPI added.')
    setShowKpiModal(null); setKpiForm({ kpi: '', baseline: '', target: '', unit: '', dataSource: '', responsible: '' })
  }

  const handleAddGoal = () => {
    if (!goalForm.goal.trim()) { toast.show('Goal text is required.'); return }
    const id = `G${plan.goals.length + 1}`
    setPlan(p => ({ ...p, goals: [...p.goals, { id, goal: goalForm.goal, status: 'pending', objectives: [] }] }))
    toast.show(`Goal ${id} added.`)
    setShowGoalModal(false); setGoalForm({ goal: '' })
  }

  return (
    <div className="space-y-4">
      {showVersionModal && (
        <Modal title="Lock Strategic Plan — Create Version" onClose={() => setShowVersionModal(false)}>
          <Field label="Version Description" required>
            <input className="np-input w-full text-sm" placeholder="e.g. Strategic Plan 2024–2027 v2 (mid-term revision)" value={versionNote} onChange={e => setVersionNote(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary text-sm" onClick={() => setShowVersionModal(false)}>Cancel</button>
            <button className="btn-primary text-sm" onClick={handleLock}>Lock & Create Version</button>
          </div>
        </Modal>
      )}
      {showGoalModal && (
        <Modal title="Add Strategic Goal" onClose={() => setShowGoalModal(false)}>
          <Field label="Goal Description" required>
            <input className="np-input w-full text-sm" placeholder="e.g. Stakeholder Engagement & Partnerships" value={goalForm.goal} onChange={e => setGoalForm({ goal: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary text-sm" onClick={() => setShowGoalModal(false)}>Cancel</button>
            <button className="btn-primary text-sm" onClick={handleAddGoal}>Add Goal</button>
          </div>
        </Modal>
      )}
      {showKpiModal && (
        <Modal title="Add Objective & KPI" onClose={() => setShowKpiModal(null)}>
          {[
            { label: 'Objective / KPI Label', key: 'kpi', placeholder: 'e.g. Customer satisfaction rate', required: true },
            { label: 'Baseline Value', key: 'baseline', placeholder: 'e.g. 72%' },
            { label: 'Target Value', key: 'target', placeholder: 'e.g. 90%', required: true },
            { label: 'Unit', key: 'unit', placeholder: 'e.g. %, count, days' },
            { label: 'Data Source', key: 'dataSource', placeholder: 'e.g. Post-training survey' },
            { label: 'Responsible Department', key: 'responsible', placeholder: 'e.g. Training Dept' },
          ].map(f => (
            <Field key={f.key} label={f.label} required={f.required}>
              <input className="np-input w-full text-sm" placeholder={f.placeholder} value={kpiForm[f.key]} onChange={e => setKpiForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </Field>
          ))}
          <div className="flex justify-end gap-2">
            <button className="btn-secondary text-sm" onClick={() => setShowKpiModal(null)}>Cancel</button>
            <button className="btn-primary text-sm" onClick={handleAddKPI}>Add KPI</button>
          </div>
        </Modal>
      )}

      {/* Plan header */}
      <div className="card">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-800">Strategic Plan {plan.period}</span>
              {statusBadge(plan.status)}
              <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">{plan.version}</span>
            </div>
            <p className="text-xs text-slate-600 font-semibold">{plan.vision}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {plan.status !== 'locked' && <button className="btn-secondary text-sm" onClick={() => setShowGoalModal(true)}><Plus size={14} /> Add Goal</button>}
            {plan.status === 'approved' && <button className="btn-primary text-sm" onClick={() => setShowVersionModal(true)}><Lock size={14} /> Lock Plan</button>}
          </div>
        </div>
        {/* Approval chain */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Approval Chain</p>
          <div className="flex flex-wrap gap-3">
            {plan.approvalChain.map((a, i) => (
              <div key={i} className={`text-xs px-3 py-2 rounded-xl border flex items-center gap-2 ${a.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                <span className="font-semibold text-slate-700">{a.role}</span>
                {statusBadge(a.status)}
                {a.date && <span className="text-[10px] text-slate-400">{a.date}</span>}
                {a.status === 'pending' && plan.status !== 'locked' && (
                  <button className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-md font-semibold hover:bg-green-200" onClick={() => handleApprove(i)}>Approve</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goals & Objectives */}
      {plan.goals.map(g => (
        <div key={g.id} className="card">
          <button className="w-full flex items-center justify-between gap-3" onClick={() => setExpanded(expanded === g.id ? null : g.id)}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-mono text-slate-400">{g.id}</span>
              <span className="text-sm font-bold text-slate-800 truncate">{g.goal}</span>
              {statusBadge(g.status)}
              <span className="text-[10px] text-slate-400">{g.objectives.length} KPIs</span>
            </div>
            {expanded === g.id ? <ChevronUp size={14} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />}
          </button>
          {expanded === g.id && (
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
              {g.objectives.map(o => (
                <div key={o.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs bg-slate-50 rounded-xl p-3">
                  <div className="md:col-span-2"><p className="font-semibold text-slate-800">{o.text}</p><p className="text-[10px] text-slate-400 mt-0.5">KPI: {o.kpi} · Owner: {o.responsible}</p></div>
                  <div className="text-center"><p className="font-bold text-slate-600">{o.baseline}</p><p className="text-[10px] text-slate-400">Baseline</p></div>
                  <div className="text-center"><p className="font-bold text-slate-800">{o.actual}</p><p className="text-[10px] text-slate-400">Actual</p></div>
                  <div className="text-center flex flex-col items-center gap-1"><p className="font-bold text-[#006838]">{o.target}</p><p className="text-[10px] text-slate-400">Target</p>{statusBadge(o.status)}</div>
                </div>
              ))}
              {plan.status !== 'locked' && (
                <button className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-semibold hover:bg-slate-200 flex items-center gap-1" onClick={() => setShowKpiModal({ goalId: g.id, objId: '__new' })}>
                  <Plus size={10} /> Add Objective & KPI
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Version history */}
      <details className="mt-2">
        <summary className="text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-700">Plan Version History ({versions.length})</summary>
        <div className="mt-3 space-y-2">
          {versions.map((v, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-3 flex items-center justify-between text-xs">
              <div><span className="font-bold text-slate-800">{v.version}</span> — {v.description}<p className="text-[10px] text-slate-400 mt-0.5">{v.period} · Locked: {v.date} · By: {v.lockedBy}</p></div>
              <button className="text-[10px] px-2 py-1 bg-slate-200 text-slate-600 rounded-md font-semibold hover:bg-slate-300" onClick={() => toast.show(`Viewing ${v.version} — read-only audit copy.`)}>View</button>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}

/* ─── Tab 2: Annual Action Plan (AAP) ─── */
function AAPTab({ toast }) {
  const [workplans, setWorkplans] = useState(DEPT_WORKPLANS_INIT)
  const [expanded, setExpanded] = useState(null)
  const [showActivityModal, setShowActivityModal] = useState(null) // dept index
  const [actForm, setActForm] = useState({ text: '', objective: '', startDate: '', endDate: '', responsible: '', cost: '', output: '' })
  const [aapStatus, setAapStatus] = useState('draft') // draft | routed | approved | locked
  const [showGaps, setShowGaps] = useState(false)

  // Gap detection: strategic objectives not covered
  const allObjectiveIds = ['O1.1', 'O1.2', 'O2.1', 'O2.2', 'O3.1', 'O4.1']
  const coveredObjectives = new Set(workplans.flatMap(d => d.activities.map(a => a.objective)))
  const gaps = allObjectiveIds.filter(id => !coveredObjectives.has(id))

  const handleApproveWP = (i) => {
    setWorkplans(p => p.map((d, idx) => idx === i ? { ...d, status: 'approved' } : d))
    toast.show(`${workplans[i].dept} work plan approved.`)
  }
  const handleReturnWP = (i) => {
    setWorkplans(p => p.map((d, idx) => idx === i ? { ...d, status: 'returned' } : d))
    toast.show(`${workplans[i].dept} work plan returned for revision.`)
  }
  const handleAddActivity = () => {
    if (!actForm.text || !actForm.objective) { toast.show('Activity and objective code are required.'); return }
    const id = `A-NACT-${Date.now().toString().slice(-4)}`
    setWorkplans(p => p.map((d, idx) => idx === showActivityModal ? {
      ...d,
      activities: [...d.activities, { id, text: actForm.text, objective: actForm.objective, startDate: actForm.startDate, endDate: actForm.endDate, responsible: actForm.responsible, cost: parseFloat(actForm.cost) || 0, output: actForm.output }],
      totalCost: (d.totalCost || 0) + (parseFloat(actForm.cost) || 0),
      status: d.status === 'pending' ? 'submitted' : d.status,
    } : d))
    toast.show('Activity added — work plan resubmitted.')
    setShowActivityModal(null); setActForm({ text: '', objective: '', startDate: '', endDate: '', responsible: '', cost: '', output: '' })
  }
  const handleRouteAAP = () => { setAapStatus('routed'); toast.show('Consolidated AAP routed: Planning Head → Finance Director → DG.') }
  const handleApproveAAP = () => { setAapStatus('approved'); toast.show('AAP approved by DG. Activities pushed to departments.') }
  const handleLockAAP = () => { setAapStatus('locked'); toast.show('AAP locked — individual performance targets assigned.') }

  const statusBadge = (s) => {
    const map = { submitted: 'bg-blue-100 text-blue-700', approved: 'bg-green-100 text-green-700', pending: 'bg-slate-100 text-slate-500', returned: 'bg-red-100 text-red-700', over: 'bg-red-50 text-red-600' }
    return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[s] || 'bg-slate-100 text-slate-500'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
  }

  const fmt = (n) => n ? '₦' + n.toLocaleString() : '—'

  return (
    <div className="space-y-4">
      {showActivityModal !== null && (
        <Modal title={`Add Activity — ${workplans[showActivityModal].dept}`} onClose={() => setShowActivityModal(null)} wide>
          {[
            { label: 'Activity Description', key: 'text', placeholder: 'e.g. Conduct 5 residential training programmes', required: true },
            { label: 'Strategic Objective Code', key: 'objective', placeholder: 'e.g. O1.1', required: true },
            { label: 'Expected Output / Deliverable', key: 'output', placeholder: 'e.g. 500 trainees certified' },
            { label: 'Responsible Officer', key: 'responsible', placeholder: 'e.g. HOD Training' },
            { label: 'Estimated Cost (₦)', key: 'cost', placeholder: 'e.g. 5000000', type: 'number' },
          ].map(f => (
            <Field key={f.key} label={f.label} required={f.required}>
              <input type={f.type || 'text'} className="np-input w-full text-sm" placeholder={f.placeholder} value={actForm[f.key]} onChange={e => setActForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </Field>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date"><input type="date" className="np-input w-full text-sm" value={actForm.startDate} onChange={e => setActForm(p => ({ ...p, startDate: e.target.value }))} /></Field>
            <Field label="End Date"><input type="date" className="np-input w-full text-sm" value={actForm.endDate} onChange={e => setActForm(p => ({ ...p, endDate: e.target.value }))} /></Field>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary text-sm" onClick={() => setShowActivityModal(null)}>Cancel</button>
            <button className="btn-primary text-sm" onClick={handleAddActivity}>Add Activity</button>
          </div>
        </Modal>
      )}

      {/* Gap alert */}
      {gaps.length > 0 && showGaps && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs">
          <p className="font-bold text-amber-700 mb-1"><AlertTriangle size={12} className="inline mr-1" />Strategic Objectives with no planned activities: {gaps.join(', ')}</p>
          <p className="text-amber-600">Flag to responsible departments to add activities before AAP approval.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <button className="btn-secondary text-sm" onClick={() => setShowGaps(g => !g)}><AlertTriangle size={14} /> Gap Check ({gaps.length} gaps)</button>
          {aapStatus === 'draft' && <button className="btn-secondary text-sm" onClick={handleRouteAAP}><Send size={14} /> Route for Approval</button>}
          {aapStatus === 'routed' && <button className="btn-primary text-sm" onClick={handleApproveAAP}><CheckCircle size={14} /> Approve AAP</button>}
          {aapStatus === 'approved' && <button className="bg-[#006838] text-white text-sm px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5" onClick={handleLockAAP}><Lock size={14} /> Lock & Push to Depts</button>}
        </div>
        <span className="text-[10px] text-slate-500 font-semibold bg-slate-50 border border-slate-200 px-2 py-1 rounded-full">AAP Status: {aapStatus}</span>
      </div>

      {/* Work plan cards */}
      {workplans.map((wp, i) => (
        <div key={i} className={`card ${wp.totalCost > wp.ceiling ? 'border-l-4 border-l-amber-400' : ''}`}>
          <button className="w-full flex items-center justify-between gap-3" onClick={() => setExpanded(expanded === i ? null : i)}>
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="text-sm font-bold text-slate-800">{wp.dept}</span>
              {statusBadge(wp.status)}
              <span className="text-xs text-slate-500">{fmt(wp.totalCost)} / {fmt(wp.ceiling)} ceiling</span>
              {wp.totalCost > wp.ceiling && <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold">Over budget ceiling</span>}
            </div>
            {expanded === i ? <ChevronUp size={14} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />}
          </button>
          {expanded === i && (
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
              {wp.activities.length === 0 && <p className="text-xs text-slate-400 italic">No activities submitted yet.</p>}
              {wp.activities.map((a, j) => (
                <div key={j} className="text-xs bg-slate-50 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="font-semibold text-slate-800">{a.text}</p><p className="text-[10px] text-slate-400 mt-0.5">Obj: {a.objective} · {a.startDate}–{a.endDate} · {a.responsible}</p><p className="text-[10px] text-slate-500 mt-0.5">Output: {a.output}</p></div>
                    <span className="text-xs font-bold text-slate-700 flex-shrink-0">{fmt(a.cost)}</span>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 flex-wrap">
                {aapStatus === 'draft' && <button className="text-[10px] px-2 py-1 bg-blue-100 text-blue-700 rounded-md font-semibold hover:bg-blue-200" onClick={() => setShowActivityModal(i)}>+ Add Activity</button>}
                {wp.status === 'submitted' && aapStatus === 'draft' && (
                  <>
                    <button className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-md font-semibold hover:bg-green-200" onClick={() => handleApproveWP(i)}>Approve Work Plan</button>
                    <button className="text-[10px] px-2 py-1 bg-red-100 text-red-600 rounded-md font-semibold hover:bg-red-200" onClick={() => handleReturnWP(i)}>Return for Revision</button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── Tab 3: Performance Scorecard ─── */
function PerformanceScorecardTab({ toast }) {
  const [kpis, setKpis] = useState(KPI_SUBMISSIONS_INIT)
  const [commentModal, setCommentModal] = useState(null) // kpi id
  const [commentText, setCommentText] = useState('')
  const [reportGenerated, setReportGenerated] = useState(false)

  const trendIcon = (t) => {
    if (t === 'up') return <TrendingUp size={12} className="text-green-600" />
    if (t === 'down') return <TrendingDown size={12} className="text-red-500" />
    return <Minus size={12} className="text-slate-400" />
  }
  const statusBar = (s) => {
    const map = { 'on-track': 'bg-green-500', 'at-risk': 'bg-amber-400', delayed: 'bg-red-500' }
    return map[s] || 'bg-slate-300'
  }
  const statusBadge = (s) => {
    const map = { 'on-track': 'bg-green-100 text-green-700', 'at-risk': 'bg-amber-100 text-amber-700', delayed: 'bg-red-100 text-red-700' }
    return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[s] || 'bg-slate-100 text-slate-500'}`}>{s}</span>
  }

  const handleSubmitComment = () => {
    if (!commentText.trim()) return
    setKpis(p => p.map(k => k.id === commentModal ? { ...k, commentary: commentText } : k))
    toast.show('Performance commentary saved and routed to management.')
    setCommentModal(null); setCommentText('')
  }

  const green = kpis.filter(k => k.status === 'on-track').length
  const amber = kpis.filter(k => k.status === 'at-risk').length
  const red = kpis.filter(k => k.status === 'delayed').length

  return (
    <div className="space-y-4">
      {commentModal && (
        <Modal title="Performance Commentary" onClose={() => setCommentModal(null)}>
          <Field label="Reason for underperformance & corrective action" required>
            <textarea className="np-input w-full text-sm h-24" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Explain reason and describe corrective action planned..." />
          </Field>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary text-sm" onClick={() => setCommentModal(null)}>Cancel</button>
            <button className="btn-primary text-sm" onClick={handleSubmitComment}>Submit Commentary</button>
          </div>
        </Modal>
      )}

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[['On Track', green, 'text-green-700', 'bg-green-50'], ['At Risk', amber, 'text-amber-700', 'bg-amber-50'], ['Delayed', red, 'text-red-700', 'bg-red-50']].map(([label, count, cls, bg]) => (
          <div key={label} className={`stat-card ${bg} text-center`}>
            <p className={`text-2xl font-extrabold ${cls}`}>{count}</p>
            <p className="text-[11px] text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn-secondary text-sm" onClick={() => { setReportGenerated(true); toast.show('Quarterly Performance Report generated — routed to DG.') }}><FileText size={14} /> Generate QPR</button>
        {reportGenerated && <button className="btn-secondary text-sm" onClick={() => toast.show('QPR exported as PDF.')}><Download size={14} /> Export PDF</button>}
      </div>

      {/* KPI cards */}
      <div className="space-y-3">
        {kpis.map((k, i) => (
          <div key={i} className="card">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold text-slate-800">{k.kpi}</span>
                  {statusBadge(k.status)}
                  {trendIcon(k.trend)}
                </div>
                <div className="flex gap-4 text-xs text-slate-600 mb-2">
                  <span>Actual: <strong>{k.lastValue}</strong></span>
                  <span>Target: <strong>{k.target}</strong></span>
                  <span className="text-[10px] text-slate-400">Owner: {k.responsible} · {k.frequency} · Updated: {k.lastSubmitted}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${statusBar(k.status)}`} style={{ width: `${Math.min(100, parseInt(k.lastValue) / parseInt(k.target) * 100 || 60)}%` }} />
                </div>
                {k.commentary && <p className="text-[10px] text-slate-500 mt-2 italic bg-slate-50 rounded-lg px-2 py-1">{k.commentary}</p>}
              </div>
              {['at-risk', 'delayed'].includes(k.status) && !k.commentary && (
                <button className="text-[10px] px-2 py-1 bg-amber-100 text-amber-700 rounded-md font-semibold hover:bg-amber-200 flex-shrink-0" onClick={() => { setCommentModal(k.id); setCommentText(k.commentary || '') }}>
                  <Edit3 size={10} className="inline mr-0.5" />Add Commentary
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Tab 4: Roles & Schema ─── */
const PLANNING_ROLES = [
  { role: 'Planning Officer', strategic: 'Draft & edit plan, add KPIs', aap: 'Publish guidelines, add activities', scorecard: 'Review KPI submissions, flag issues' },
  { role: 'Department Head', strategic: 'View', aap: 'Submit dept work plan, add activities', scorecard: 'Submit KPI data, add commentary' },
  { role: 'Planning Head', strategic: 'Approve plan', aap: 'Approve consolidated AAP', scorecard: 'Generate quarterly report' },
  { role: 'Finance Director', strategic: 'Review & comment', aap: 'Verify budget feasibility', scorecard: 'View summary' },
  { role: 'Director General', strategic: 'Final approve & lock', aap: 'Final approve AAP', scorecard: 'View full dashboard + reports' },
  { role: 'Board', strategic: 'Receive & endorse', aap: 'View if required', scorecard: 'Receive quarterly report' },
]

function PlanningRolesTab() {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="text-left border-b border-slate-100">
            {['Role', 'Strategic Plan', 'Annual Action Plan', 'Performance Scorecard'].map(h => <th key={h} className="pb-2 pr-4 text-slate-500 font-semibold">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {PLANNING_ROLES.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-2.5 pr-4 font-semibold text-slate-800">{r.role}</td>
                <td className="py-2.5 pr-4 text-slate-600">{r.strategic}</td>
                <td className="py-2.5 pr-4 text-slate-600">{r.aap}</td>
                <td className="py-2.5 text-slate-600">{r.scorecard}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { name: 'strategic_plans', cols: 'id, version, period, vision, mission, status (draft|approved|locked), created_by, approved_by, locked_at, data_json' },
          { name: 'strategic_goals', cols: 'id, plan_id (FK), goal_code, goal_text, status, display_order' },
          { name: 'strategic_objectives', cols: 'id, goal_id (FK), objective_text, kpi_label, baseline_value, target_value, actual_value, unit, data_source, responsible_dept, status (pending|on-track|at-risk|delayed)' },
          { name: 'annual_action_plans', cols: 'id, fiscal_year, plan_id (FK), status (draft|routed|approved|locked), approved_by, locked_at' },
          { name: 'aap_activities', cols: 'id, aap_id (FK), dept_id (FK), activity_text, objective_id (FK), start_date, end_date, responsible_officer, estimated_cost, expected_output, status' },
          { name: 'kpi_submissions', cols: 'id, objective_id (FK), submitted_by_dept, actual_value, period, evidence_url, status (pending|validated|rejected), submitted_at, validated_by, commentary' },
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

/* ─── MAIN PAGE ─── */
export default function PlanningWorkbenchPage() {
  const toast = useToast()
  const TABS = [
    { label: 'Strategic Plan Builder', icon: Layers },
    { label: 'Annual Action Plan', icon: FileText },
    { label: 'Performance Scorecard', icon: BarChart2 },
    { label: 'Roles & Schema', icon: Database },
  ]
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="animate-fade-up">
      <Toast msg={toast.msg} clear={() => toast.show(null)} />

      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Planning Unit Workbench</h1>
          <p className="text-sm text-slate-400">Strategic planning · Annual action plans · Performance scorecard · Strategy → Direction</p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Strategic Goals', value: '4', sub: '15 objectives', color: 'text-[#006838]' },
          { label: 'Active KPIs', value: '6', sub: '4 green · 2 at-risk', color: 'text-blue-700' },
          { label: 'AAP Activities', value: '11', sub: '1 dept pending', color: 'text-amber-600' },
          { label: 'Plan Version', value: 'v1.0', sub: 'Draft — pending DG approval', color: 'text-slate-700' },
        ].map((s, i) => (
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

      {/* Tab content */}
      {activeTab === 0 && <StrategicPlanTab toast={toast} />}
      {activeTab === 1 && <AAPTab toast={toast} />}
      {activeTab === 2 && <PerformanceScorecardTab toast={toast} />}
      {activeTab === 3 && <PlanningRolesTab />}
    </div>
  )
}
