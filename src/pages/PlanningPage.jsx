import { useState, useMemo } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import {
  PLANNING_INSTRUMENTS, PLANNING_APPROVALS, PLANNING_WORKPLAN_TASKS,
  RESEARCH_PUBLICATIONS, RESEARCH_APPROVAL_REQUESTS,
  STATISTICS_SNAPSHOTS, MANDE_KPIS, MANDE_TRACKED_PROJECTS,
  MANDE_APPROVAL_REQUESTS, MANDE_FIELD_VISITS, COMPLIANCE_CHECKS,
  STRATEGIC_OBJECTIVES, BUDGET_LINES, DATA_REQUESTS,
  DATA_LINEAGE, RESEARCH_TEMPLATES, PREDICTIVE_ALERTS, EVALUATION_REPORTS,
} from '../data/mock'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import {
  BarChart2, BookOpen, Target, ClipboardCheck, CheckCircle2,
  RotateCcw, Plus, AlertCircle, MapPin, Filter, FileText,
  TrendingUp, Sliders, Database, Activity, AlertTriangle,
  ChevronRight, Mail, Layers, Edit3, Trash2, PlayCircle,
  X, RefreshCw, Bell, ArrowUpCircle, Send,
} from 'lucide-react'

// ─── helpers ────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:              'bg-amber-100 text-amber-700',
    approved:             'bg-emerald-100 text-emerald-700',
    returned:             'bg-red-100 text-red-600',
    active:               'bg-blue-100 text-blue-700',
    published:            'bg-emerald-100 text-emerald-700',
    draft:                'bg-slate-100 text-slate-500',
    'draft review':       'bg-purple-100 text-purple-700',
    'under review':       'bg-amber-100 text-amber-700',
    'data collection':    'bg-blue-100 text-blue-700',
    planned:              'bg-blue-100 text-blue-700',
    completed:            'bg-emerald-100 text-emerald-700',
    'in-progress':        'bg-blue-100 text-blue-700',
    'pending approval':   'bg-amber-100 text-amber-700',
    improving:            'bg-emerald-100 text-emerald-700',
    green:                'bg-emerald-100 text-emerald-700',
    'on-track':           'bg-emerald-100 text-emerald-700',
    'at risk':            'bg-red-100 text-red-600',
    fulfilled:            'bg-emerald-100 text-emerald-700',
    cancelled:            'bg-red-100 text-red-600',
    analysis:             'bg-purple-100 text-purple-700',
  }
  const cls = map[status?.toLowerCase()] || 'bg-slate-100 text-slate-500'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cls}`}>
      {status}
    </span>
  )
}

function PriorityDot({ priority }) {
  const map = { high: 'bg-red-500', medium: 'bg-amber-400', low: 'bg-slate-300' }
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${map[priority?.toLowerCase()] || 'bg-slate-300'}`} />
}

function ApprovalCard({ item, onApprove, onReturn }) {
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote]         = useState('')
  return (
    <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <PriorityDot priority={item.priority?.toLowerCase()} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.type || item.ref}</span>
          </div>
          <p className="text-sm font-bold text-slate-800 leading-snug">{item.title}</p>
          <p className="text-xs text-slate-500 mt-1">
            Submitted by: {item.submittedBy || item.requestedBy} · {item.submittedDate || item.date}
          </p>
          {item.notes && <p className="text-xs text-slate-500 mt-1 italic">Note: {item.notes}</p>}
        </div>
        <StatusBadge status={item.status} />
      </div>
      {item.status === 'pending' && (
        <div className="mt-3 space-y-2">
          {noteOpen ? (
            <div className="space-y-2">
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                placeholder="Add a note (optional)…"
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838] resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { onApprove(item.id, note); setNoteOpen(false) }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#006838] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#005a30] transition-colors"
                >
                  <CheckCircle2 size={13} /> Approve
                </button>
                <button
                  onClick={() => { onReturn(item.id, note); setNoteOpen(false) }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 text-xs font-bold py-2 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <RotateCcw size={13} /> Return
                </button>
                <button onClick={() => setNoteOpen(false)} className="px-3 py-2 text-xs text-slate-400 hover:text-slate-600">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setNoteOpen(true)}
              className="w-full text-xs font-semibold text-[#006838] border border-[#006838]/30 rounded-xl py-1.5 hover:bg-[#006838]/5 transition-colors"
            >
              Review &amp; action →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Sub-tab bar ────────────────────────────────────────────────────────────
function SubTabBar({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 mb-5 border-b border-slate-100 pb-3">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
            active === t.id ? 'bg-[#006838]/10 text-[#006838]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ─── Scenario engine ────────────────────────────────────────────────────────
const SCENARIO_BASE = { trainees: 15000, budget: 850, staff: 420, programmes: 150, rtcUtil: 85 }
function calcScenario({ budgetChange = 0, demandChange = 0, staffingChange = 0 }) {
  const bF    = 1 + budgetChange / 100
  const dF    = 1 + demandChange / 100
  const sF    = 1 + staffingChange / 100
  const capF  = 0.45 + 0.55 * bF
  const trainees   = Math.round(SCENARIO_BASE.trainees * dF * capF)
  const programmes = Math.round(SCENARIO_BASE.programmes * capF)
  const budget     = +(SCENARIO_BASE.budget * bF).toFixed(1)
  const costPerT   = trainees > 0 ? Math.round((budget * 1e6) / trainees) : 0
  const staff      = Math.round(SCENARIO_BASE.staff * sF)
  const rtcUtil    = Math.min(100, Math.round(SCENARIO_BASE.rtcUtil * dF * (capF * 0.5 + 0.5)))
  const riskScore  = Math.max(0, Math.min(10, Math.round(3 + (-budgetChange / 10) + (demandChange / 20) + (-staffingChange / 15))))
  const delta      = trainees - SCENARIO_BASE.trainees
  const deltaPct   = ((delta / SCENARIO_BASE.trainees) * 100).toFixed(1)
  return { trainees, programmes, budget, costPerT, staff, rtcUtil, riskScore, delta, deltaPct }
}
const PRESET_SCENARIOS = [
  { id:'baseline',     name:'Baseline',     color:'#64748b', budgetChange:0,   demandChange:0,   staffingChange:0   },
  { id:'optimistic',   name:'Optimistic',   color:'#006838', budgetChange:10,  demandChange:25,  staffingChange:5   },
  { id:'conservative', name:'Conservative', color:'#d97706', budgetChange:-15, demandChange:0,   staffingChange:-5  },
  { id:'highdemand',   name:'High demand',  color:'#3b82f6', budgetChange:20,  demandChange:40,  staffingChange:10  },
  { id:'austerity',    name:'Austerity',    color:'#ef4444', budgetChange:-30, demandChange:-10, staffingChange:-15 },
]
function RiskBadge({ score }) {
  const cls   = score >= 7 ? 'bg-red-100 text-red-700' : score >= 4 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
  const label = score >= 7 ? 'High risk' : score >= 4 ? 'Moderate' : 'Low risk'
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${cls}`}>{score}/10 · {label}</span>
}

const trendData = [
  { month: 'Oct', trained: 4200 }, { month: 'Nov', trained: 4800 },
  { month: 'Dec', trained: 3900 }, { month: 'Jan', trained: 5100 },
  { month: 'Feb', trained: 5800 }, { month: 'Mar', trained: 6240 },
]

const TABS = [
  { id: 'overview',   label: 'Overview',               icon: BarChart2  },
  { id: 'planning',   label: 'Planning',                icon: FileText   },
  { id: 'research',   label: 'Research & Statistics',   icon: BookOpen   },
  { id: 'mande',      label: 'Monitoring & Evaluation', icon: Target     },
  { id: 'scenarios',  label: 'Scenarios',               icon: Sliders    },
]

const chartData = MANDE_TRACKED_PROJECTS.map((p) => ({
  name: p.name.split(' ').slice(0, 3).join(' '),
  current: p.current,
  baseline: p.baseline,
}))

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function PlanningPage() {
  const [tab, setTab]                             = useState('overview')
  const [planSubTab, setPlanSubTab]               = useState('strategic')
  const [resSubTab, setResSubTab]                 = useState('repository')
  const [mandeSubTab, setMandeSubTab]             = useState('indicators')
  const [approvals, setApprovals]                 = useState(PLANNING_APPROVALS)
  const [researchApprovals, setResearchApprovals] = useState(RESEARCH_APPROVAL_REQUESTS)
  const [mandeApprovals, setMandeApprovals]       = useState(MANDE_APPROVAL_REQUESTS)
  const [fieldVisits, setFieldVisits]             = useState(MANDE_FIELD_VISITS)
  const [tasks, setTasks]                         = useState(PLANNING_WORKPLAN_TASKS)
  const [publications, setPublications]           = useState(RESEARCH_PUBLICATIONS)
  const [dataRequests, setDataRequests]           = useState(DATA_REQUESTS)
  const [expandedEval, setExpandedEval]           = useState(null)
  const [selectedLineage, setSelectedLineage]     = useState(DATA_LINEAGE[0])
  const [drillObj, setDrillObj]                   = useState(null)
  const [scenario, setScenario]                   = useState({ budgetChange: 0, demandChange: 0, staffingChange: 0 })
  const [activePreset, setActivePreset]           = useState('baseline')
  const [approvalFilter, setApprovalFilter]       = useState('all')
  const [newTaskOpen, setNewTaskOpen]             = useState(false)
  const [newTask, setNewTask]                     = useState({ title: '', unit: 'Planning', assignee: '', due: '', priority: 'medium' })
  const [newPubOpen, setNewPubOpen]               = useState(false)
  const [newPub, setNewPub]                       = useState({ title: '', authors: '', date: '' })
  const [visitOpen, setVisitOpen]                 = useState(false)
  const [newVisit, setNewVisit]                   = useState({ site: '', purpose: '', officer: '', date: '' })
  const [newRequestOpen, setNewRequestOpen]       = useState(false)
  const [newRequest, setNewRequest]               = useState({ title: '', requestedBy: '', dept: '', deadline: '', priority: 'medium' })

  // ── editable data ─────────────────────────────────────────────────────────
  const [objectives, setObjectives]           = useState(STRATEGIC_OBJECTIVES)
  const [instruments, setInstruments]         = useState(PLANNING_INSTRUMENTS)
  const [budgetLines, setBudgetLines]         = useState(BUDGET_LINES)
  const [templates, setTemplates]             = useState(RESEARCH_TEMPLATES)
  const [kpis, setKpis]                       = useState(MANDE_KPIS)
  const [trackedProjects, setTrackedProjects] = useState(MANDE_TRACKED_PROJECTS)
  const [evalReports, setEvalReports]         = useState(EVALUATION_REPORTS)
  const [alertsList, setAlertsList]           = useState(PREDICTIVE_ALERTS)
  const [dataLineages, setDataLineages]       = useState(DATA_LINEAGE)
  // ── inline edit cursor ────────────────────────────────────────────────────
  const [inlineEdit, setInlineEdit]           = useState({ type: null, id: null, value: '' })

  const liveScenario  = useMemo(() => calcScenario(scenario), [scenario])
  const pendingCount  = approvals.filter(a => a.status === 'pending').length
  const resPending    = researchApprovals.filter(a => a.status === 'pending').length
  const mandePending  = mandeApprovals.filter(a => a.status === 'pending').length
  const totalPending  = pendingCount + resPending + mandePending

  function handleApproval(id, note, verdict, list, setList) {
    setList(list.map(a => a.id === id ? { ...a, status: verdict, notes: note || a.notes } : a))
  }

  const filteredApprovals = approvalFilter === 'all'
    ? approvals
    : approvals.filter(a => a.status === approvalFilter)

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold text-slate-900">Planning, Research &amp; Statistics</h1>
          <p className="text-sm text-slate-400">Sub-units: Planning · Research &amp; Statistics · Monitoring &amp; Evaluation</p>
        </div>
        {totalPending > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-xl">
            <AlertCircle size={13} />
            {totalPending} pending approval{totalPending > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 mb-6 bg-white border border-slate-100 rounded-2xl p-1 shadow-sm w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              tab === t.id ? 'bg-[#006838] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <t.icon size={15} />
            {t.label}
            {t.id === 'planning' && pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{pendingCount}</span>
            )}
            {t.id === 'research' && resPending > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{resPending}</span>
            )}
            {t.id === 'mande' && mandePending > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{mandePending}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-5">
          {/* Predictive alerts */}
          {alertsList.filter(a => a.severity === 'critical' && !a.acknowledged).length > 0 && (
            <div className="space-y-2">
              {alertsList.filter(a => a.severity === 'critical' && !a.acknowledged).map((alert, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-red-200 bg-red-50">
                  <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-red-800">{alert.kpi} — critical alert</p>
                    <p className="text-[11px] text-red-700 truncate">{alert.predictedOutcome}</p>
                  </div>
                  <button onClick={() => setTab('mande')} className="text-[10px] font-bold text-red-700 hover:underline flex-shrink-0">View →</button>
                </div>
              ))}
            </div>
          )}

          {/* KPI stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATISTICS_SNAPSHOTS.map((s, i) => (
              <div key={i} className="stat-card">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-2">{s.metric}</p>
                <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                <p className="text-[11px] text-slate-400 mt-1">{s.year}</p>
              </div>
            ))}
          </div>

          {/* Pending approvals + strategic progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {totalPending > 0 && (
              <div className="card border-l-4 border-l-amber-400">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={16} className="text-amber-500" />
                  <p className="text-sm font-bold text-slate-800">Pending approvals</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Planning',          count: pendingCount, tab: 'planning' },
                    { label: 'Research & Stats',  count: resPending,   tab: 'research' },
                    { label: 'M&E',               count: mandePending, tab: 'mande'    },
                  ].map((u, i) => (
                    <button key={i} onClick={() => setTab(u.tab)}
                      className="flex flex-col items-center p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-[#006838]/5 hover:border-[#006838]/20 transition-colors">
                      <p className="text-xl font-extrabold text-slate-900">{u.count}</p>
                      <p className="text-[10px] text-slate-500 text-center mt-1">{u.label}</p>
                      {u.count > 0 && <span className="text-[9px] text-[#006838] font-bold mt-1">Review →</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="card">
              <p className="text-sm font-bold text-slate-800 mb-3">Strategic objectives</p>
              <div className="space-y-2">
                {objectives.slice(0, 3).map((obj, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[11px] font-semibold text-slate-700 truncate max-w-[75%]">{obj.goal}</p>
                      <span className="text-[11px] font-extrabold text-[#006838]">{obj.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#006838] rounded-full" style={{ width: `${obj.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setTab('planning')} className="text-xs text-[#006838] font-semibold hover:underline mt-3 block">All objectives →</button>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card">
              <p className="text-sm font-bold text-slate-800 mb-4">Trainees trend (6 months)</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="trained" stroke="#006838" strokeWidth={2.5} dot={{ r: 4, fill: '#006838' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <p className="text-sm font-bold text-slate-800 mb-4">M&amp;E indicator progress</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="baseline" fill="#e2e8f0" name="Baseline" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="current"  fill="#006838" name="Current"  radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Work plan snapshot */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-800">Active work plan tasks</p>
              <button onClick={() => setTab('planning')} className="text-xs text-[#006838] font-semibold hover:underline">View all →</button>
            </div>
            <div className="space-y-2">
              {tasks.filter(t => t.status !== 'done').slice(0, 4).map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/60">
                  <PriorityDot priority={t.priority} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{t.title}</p>
                    <p className="text-[10px] text-slate-400">{t.unit} · {t.assignee} · Due {t.due}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#006838] rounded-full" style={{ width: `${t.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 w-7 text-right">{t.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PLANNING TAB ──────────────────────────────────────────────────────── */}
      {tab === 'planning' && (
        <div className="space-y-5">
          <SubTabBar
            tabs={[
              { id:'strategic',   label:'Strategic Objectives' },
              { id:'operational', label:'Operational Plans'     },
              { id:'budget',      label:'Budget Reconciliation' },
              { id:'approvals',   label:`Approval Queue${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
            ]}
            active={planSubTab} onChange={setPlanSubTab}
          />

          {/* Strategic Objectives */}
          {planSubTab === 'strategic' && (
            <div className="space-y-4">
              {objectives.map((obj, i) => (
                <div key={i} className="card">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-md">{obj.pillar}</span>
                        <StatusBadge status={obj.status} />
                      </div>
                      <p className="text-sm font-bold text-slate-900 mt-1">{obj.goal}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Owner: {obj.owner} · Deadline: {obj.deadline}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-extrabold text-[#006838]">{obj.progress}%</p>
                      <p className="text-[9px] text-slate-400">overall</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-[#006838] rounded-full transition-all" style={{ width: `${obj.progress}%` }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {obj.kpis.map((kpi, j) => (
                      <div key={j} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <span className="text-[10px] text-slate-500">{kpi.label}</span>
                        <span className="text-xs font-bold text-slate-900">{kpi.current}{kpi.unit} / {kpi.target}{kpi.unit}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Database size={10} /> Linked to: {obj.dataSource}
                    </span>
                    <button onClick={() => setDrillObj(drillObj?.id === obj.id ? null : obj)}
                      className="text-[10px] text-[#006838] font-bold hover:underline">
                      {drillObj?.id === obj.id ? 'Hide evidence ↑' : 'Drill to evidence ↓'}
                    </button>
                  </div>
                  {drillObj?.id === obj.id && (
                    <div className="mt-3 p-3 bg-[#006838]/5 rounded-xl space-y-1 text-xs text-slate-700">
                      <p><span className="font-bold">Data source:</span> {obj.dataSource}</p>
                      <p><span className="font-bold">Collection method:</span> Automated extract from {obj.dataSource}</p>
                      <p><span className="font-bold">Refresh frequency:</span> Monthly</p>
                      <p><span className="font-bold">Last updated:</span> 01 Apr 2026</p>
                      <p><span className="font-bold">Data owner:</span> {obj.owner}</p>
                    </div>
                  )}
                  {/* ── objective actions ── */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-50">
                    {inlineEdit.type === 'obj-progress' && inlineEdit.id === obj.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input type="range" min={0} max={100} value={inlineEdit.value}
                          onChange={e => setInlineEdit(s => ({ ...s, value: e.target.value }))}
                          className="flex-1 accent-[#006838]" />
                        <span className="text-xs font-bold text-[#006838] w-8">{inlineEdit.value}%</span>
                        <button onClick={() => {
                          setObjectives(prev => prev.map(o => o.id === obj.id ? { ...o, progress: Number(inlineEdit.value) } : o))
                          setInlineEdit({ type: null, id: null, value: '' })
                        }} className="text-[10px] font-bold text-white bg-[#006838] px-2 py-1 rounded-lg">Save</button>
                        <button onClick={() => setInlineEdit({ type: null, id: null, value: '' })}><X size={12} className="text-slate-400" /></button>
                      </div>
                    ) : (
                      <button onClick={() => setInlineEdit({ type: 'obj-progress', id: obj.id, value: obj.progress })}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-600 border border-slate-200 px-2 py-1 rounded-lg hover:border-[#006838]/40 hover:text-[#006838]">
                        <Edit3 size={10} /> Update progress
                      </button>
                    )}
                    {obj.status !== 'approved' && obj.status !== 'under review' && inlineEdit.id !== obj.id && (
                      <button onClick={() => setObjectives(prev => prev.map(o => o.id === obj.id ? { ...o, status: 'under review' } : o))}
                        className="flex items-center gap-1 text-[10px] font-bold text-amber-700 border border-amber-200 px-2 py-1 rounded-lg hover:bg-amber-50">
                        <Send size={10} /> Submit for review
                      </button>
                    )}
                    {obj.status === 'under review' && (
                      <>
                        <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1"><Bell size={10} /> Awaiting review</span>
                        <button onClick={() => setObjectives(prev => prev.map(o => o.id === obj.id ? { ...o, status: 'approved' } : o))}
                          className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-50">
                          <CheckCircle2 size={10} /> Approve
                        </button>
                      </>
                    )}
                    {obj.status === 'approved' && <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Approved</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Operational Plans */}
          {planSubTab === 'operational' && (
            <div className="space-y-5">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck size={16} className="text-[#006838]" />
                    <p className="text-sm font-bold text-slate-800">Work plan tasks</p>
                  </div>
                  <button onClick={() => setNewTaskOpen(!newTaskOpen)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#006838] border border-[#006838]/30 px-3 py-1.5 rounded-xl hover:bg-[#006838]/5 transition-colors">
                    <Plus size={12} /> Add task
                  </button>
                </div>
                {newTaskOpen && (
                  <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                        placeholder="Task title *" className="col-span-2 w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]" />
                      <select value={newTask.unit} onChange={e => setNewTask(p => ({ ...p, unit: e.target.value }))}
                        className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]">
                        <option>Planning</option><option>Research &amp; Statistics</option><option>M&amp;E</option>
                      </select>
                      <input value={newTask.assignee} onChange={e => setNewTask(p => ({ ...p, assignee: e.target.value }))}
                        placeholder="Assignee" className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]" />
                      <input type="date" value={newTask.due} onChange={e => setNewTask(p => ({ ...p, due: e.target.value }))}
                        className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]" />
                      <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                        className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]">
                        <option value="high">High priority</option><option value="medium">Medium priority</option><option value="low">Low priority</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        if (!newTask.title.trim()) return
                        setTasks(prev => [...prev, { ...newTask, id:`WP-${String(Date.now()).slice(-4)}`, status:'pending', progress:0 }])
                        setNewTask({ title:'', unit:'Planning', assignee:'', due:'', priority:'medium' })
                        setNewTaskOpen(false)
                      }} className="px-4 py-2 bg-[#006838] text-white text-xs font-bold rounded-xl hover:bg-[#005a30] transition-colors">Save task</button>
                      <button onClick={() => setNewTaskOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {tasks.map((t, i) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <PriorityDot priority={t.priority} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800">{t.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{t.unit} · {t.assignee} · Due {t.due}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="items-center gap-1.5 hidden sm:flex">
                            <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-[#006838] rounded-full" style={{ width: `${t.progress}%` }} />
                            </div>
                            <span className="text-[10px] text-slate-400 w-7">{t.progress}%</span>
                          </div>
                          <StatusBadge status={t.status} />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-50">
                        {t.status === 'pending' && (
                          <button onClick={() => setTasks(p => p.map(x => x.id===t.id ? {...x, status:'in-progress'} : x))}
                            className="flex items-center gap-1 text-[10px] font-bold text-blue-700 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50">
                            <PlayCircle size={10} /> Start
                          </button>
                        )}
                        {t.status === 'in-progress' && (
                          <button onClick={() => setTasks(p => p.map(x => x.id===t.id ? {...x, status:'done', progress:100} : x))}
                            className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-50">
                            <CheckCircle2 size={10} /> Mark done
                          </button>
                        )}
                        {t.status === 'done' && (
                          <button onClick={() => setTasks(p => p.map(x => x.id===t.id ? {...x, status:'in-progress'} : x))}
                            className="flex items-center gap-1 text-[10px] font-bold text-slate-500 border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50">
                            <RefreshCw size={10} /> Reopen
                          </button>
                        )}
                        {inlineEdit.type === 'task-progress' && inlineEdit.id === t.id ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <input type="range" min={0} max={100} value={inlineEdit.value}
                              onChange={e => setInlineEdit(s => ({ ...s, value: e.target.value }))}
                              className="flex-1 accent-[#006838]" />
                            <span className="text-[10px] font-bold w-7">{inlineEdit.value}%</span>
                            <button onClick={() => {
                              setTasks(p => p.map(x => x.id===t.id ? {...x, progress: Number(inlineEdit.value)} : x))
                              setInlineEdit({ type: null, id: null, value: '' })
                            }} className="text-[10px] font-bold text-white bg-[#006838] px-2 py-1 rounded-lg">OK</button>
                            <button onClick={() => setInlineEdit({ type: null, id: null, value: '' })}><X size={11} className="text-slate-400" /></button>
                          </div>
                        ) : (
                          <button onClick={() => setInlineEdit({ type: 'task-progress', id: t.id, value: t.progress })}
                            className="flex items-center gap-1 text-[10px] font-bold text-slate-500 border border-slate-200 px-2 py-1 rounded-lg hover:border-[#006838]/40">
                            <Edit3 size={10} /> Update %
                          </button>
                        )}
                        <div className="flex-1" />
                        <button onClick={() => setTasks(p => p.filter(x => x.id !== t.id))}
                          className="text-red-400 hover:text-red-600 p-1"><Trash2 size={11} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 size={16} className="text-[#006838]" />
                  <p className="text-sm font-bold text-slate-800">Planning instruments &amp; documents</p>
                </div>
                <div className="space-y-3">
                  {instruments.map((inst, i) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <p className="text-[10px] font-mono text-slate-400">{inst.ref}</p>
                          <h3 className="text-sm font-bold text-slate-800 mt-0.5">{inst.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">Owner: {inst.owner} · Review: {inst.review}</p>
                        </div>
                        <StatusBadge status={inst.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                        {inst.status === 'active' && (
                          <button onClick={() => setInstruments(prev => prev.map(x => x.ref===inst.ref ? {...x, status:'under review'} : x))}
                            className="flex items-center gap-1 text-[10px] font-bold text-amber-700 border border-amber-200 px-2 py-1 rounded-lg hover:bg-amber-50">
                            <Send size={10} /> Start review
                          </button>
                        )}
                        {inst.status === 'under review' && (
                          <button onClick={() => setInstruments(prev => prev.map(x => x.ref===inst.ref ? {...x, status:'draft review'} : x))}
                            className="flex items-center gap-1 text-[10px] font-bold text-purple-700 border border-purple-200 px-2 py-1 rounded-lg hover:bg-purple-50">
                            <Edit3 size={10} /> Upload draft
                          </button>
                        )}
                        {(inst.status === 'draft review' || inst.status === 'draft') && (
                          <button onClick={() => setInstruments(prev => prev.map(x => x.ref===inst.ref ? {...x, status:'published'} : x))}
                            className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-50">
                            <CheckCircle2 size={10} /> Publish
                          </button>
                        )}
                        {inst.status === 'published' && (
                          <button onClick={() => setInstruments(prev => prev.map(x => x.ref===inst.ref ? {...x, status:'under review'} : x))}
                            className="flex items-center gap-1 text-[10px] font-bold text-blue-700 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50">
                            <RefreshCw size={10} /> Revise
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Budget Reconciliation */}
          {planSubTab === 'budget' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[{
                  label:'Total planned',      value:`₦${(budgetLines.reduce((s,b)=>s+b.planned,0)/1000000).toFixed(1)}M`, color:'text-slate-900'
                },{
                  label:'Total actual spend', value:`₦${(budgetLines.reduce((s,b)=>s+b.actual,0)/1000000).toFixed(1)}M`,  color:'text-slate-900'
                },{
                  label:'Deferred / Unfunded',value:`${budgetLines.filter(b=>b.status==='unfunded'||b.status==='deferred').length} items`, color:'text-red-600'
                }].map((c, i) => (
                  <div key={i} className="stat-card">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">{c.label}</p>
                    <p className={`text-xl font-extrabold ${c.color}`}>{c.value}</p>
                  </div>
                ))}
              </div>
              <div className="card overflow-x-auto">
                <p className="text-sm font-bold text-slate-800 mb-4">Budget line reconciliation</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[10px] text-slate-400 uppercase">
                      <th className="pb-3 font-bold">Activity</th>
                      <th className="pb-3 font-bold">Dept</th>
                      <th className="pb-3 font-bold text-right">Planned (₦M)</th>
                      <th className="pb-3 font-bold text-right">Actual (₦M)</th>
                      <th className="pb-3 font-bold w-24">Utilisation</th>
                      <th className="pb-3 font-bold">Status</th>
                      <th className="pb-3 font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {budgetLines.map((b, i) => {
                      const pct = b.planned > 0 ? Math.round((b.actual / b.planned) * 100) : 0
                      const bar = b.status === 'overspend' ? 'bg-red-500' : b.status === 'underspend' ? 'bg-amber-400' : b.status === 'unfunded' || b.status === 'deferred' ? 'bg-slate-300' : 'bg-[#006838]'
                      const isEditing = inlineEdit.type === 'budget-spend' && inlineEdit.id === b.id
                      return (
                        <tr key={i} className="hover:bg-slate-50/60">
                          <td className="py-3 pr-3 font-medium text-slate-800">{b.activity}</td>
                          <td className="py-3 pr-3 text-slate-500 text-[10px]">{b.department}</td>
                          <td className="py-3 pr-3 text-right">{(b.planned/1000000).toFixed(1)}</td>
                          <td className="py-3 pr-3 text-right">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400">₦</span>
                                <input type="number" value={inlineEdit.value}
                                  onChange={e => setInlineEdit(s => ({ ...s, value: e.target.value }))}
                                  className="w-16 text-xs border border-[#006838] rounded px-1.5 py-0.5 outline-none"
                                  placeholder="M" />
                                <button onClick={() => {
                                  const val = parseFloat(inlineEdit.value) * 1_000_000
                                  if (!isNaN(val)) setBudgetLines(p => p.map(x => x.id===b.id ? {
                                    ...x, actual: val,
                                    status: val > x.planned ? 'overspend' : val < x.planned * 0.85 ? 'underspend' : 'on-track'
                                  } : x))
                                  setInlineEdit({ type: null, id: null, value: '' })
                                }} className="text-[10px] font-bold text-white bg-[#006838] px-1.5 py-0.5 rounded">OK</button>
                                <button onClick={() => setInlineEdit({ type: null, id: null, value: '' })}><X size={10} className="text-slate-400" /></button>
                              </div>
                            ) : (
                              <span>{b.actual > 0 ? (b.actual/1000000).toFixed(1) : '—'}</span>
                            )}
                          </td>
                          <td className="py-3 pr-3">
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${bar}`} style={{ width:`${Math.min(pct,100)}%` }} />
                              </div>
                              <span className="text-[10px] text-slate-400 w-7">{pct}%</span>
                            </div>
                          </td>
                          <td className="py-3 pr-2"><StatusBadge status={b.status} /></td>
                          <td className="py-3">
                            {!isEditing && (
                              <button onClick={() => setInlineEdit({ type: 'budget-spend', id: b.id, value: b.actual > 0 ? String((b.actual/1_000_000).toFixed(1)) : '' })}
                                className="text-[10px] font-bold text-[#006838] border border-[#006838]/20 px-2 py-0.5 rounded-lg hover:bg-[#006838]/5 whitespace-nowrap">
                                <Edit3 size={9} className="inline mr-0.5" />Record
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Approval Queue */}
          {planSubTab === 'approvals' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#006838]" />
                  <p className="text-sm font-bold text-slate-800">Approval queue</p>
                  {pendingCount > 0 && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingCount} pending</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  <Filter size={12} className="text-slate-400" />
                  {['all','pending','approved','returned'].map(f => (
                    <button key={f} onClick={() => setApprovalFilter(f)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg capitalize transition-colors ${approvalFilter===f?'bg-[#006838] text-white':'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {filteredApprovals.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No items match this filter.</p>}
                {filteredApprovals.map(item => (
                  <ApprovalCard key={item.id} item={item}
                    onApprove={(id,note) => handleApproval(id,note,'approved',approvals,setApprovals)}
                    onReturn={(id,note)  => handleApproval(id,note,'returned', approvals,setApprovals)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── RESEARCH & STATISTICS TAB ─────────────────────────────────────────── */}
      {tab === 'research' && (
        <div className="space-y-5">
          <SubTabBar
            tabs={[
              { id:'repository', label:'Repository' },
              { id:'quality',    label:'Data Quality & Lineage' },
              { id:'requests',   label:'Request Manager' },
              { id:'approvals',  label:`Approvals${resPending > 0 ? ` (${resPending})` : ''}` },
            ]}
            active={resSubTab} onChange={setResSubTab}
          />

          {/* Repository: Publications + Templates */}
          {resSubTab === 'repository' && (
            <div className="space-y-5">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-[#006838]" />
                    <p className="text-sm font-bold text-slate-800">Research publications</p>
                  </div>
                  <button onClick={() => setNewPubOpen(!newPubOpen)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#006838] border border-[#006838]/30 px-3 py-1.5 rounded-xl hover:bg-[#006838]/5 transition-colors">
                    <Plus size={12} /> Register
                  </button>
                </div>
                {newPubOpen && (
                  <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                    <input value={newPub.title} onChange={e => setNewPub(p => ({ ...p, title: e.target.value }))}
                      placeholder="Publication title *" className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]" />
                    <div className="grid grid-cols-2 gap-3">
                      <input value={newPub.authors} onChange={e => setNewPub(p => ({ ...p, authors: e.target.value }))}
                        placeholder="Authors / unit" className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]" />
                      <input type="month" value={newPub.date} onChange={e => setNewPub(p => ({ ...p, date: e.target.value }))}
                        className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        if (!newPub.title.trim()) return
                        setPublications(prev => [...prev, { id:`RES-${String(Date.now()).slice(-3)}`, ...newPub, status:'Data collection', downloads:0, pages:0 }])
                        setNewPub({ title:'', authors:'', date:'' })
                        setNewPubOpen(false)
                      }} className="px-4 py-2 bg-[#006838] text-white text-xs font-bold rounded-xl hover:bg-[#005a30] transition-colors">Save</button>
                      <button onClick={() => setNewPubOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {publications.map((r, i) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <p className="text-[10px] font-mono text-slate-400">{r.id}</p>
                          <h3 className="text-sm font-bold text-slate-800 mt-0.5">{r.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">{r.authors} · {r.date}{r.downloads > 0 ? ` · ${r.downloads} downloads` : ''}</p>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                        {r.status === 'Data collection' && (
                          <button onClick={() => setPublications(p => p.map(x => x.id===r.id ? {...x, status:'analysis'} : x))}
                            className="flex items-center gap-1 text-[10px] font-bold text-blue-700 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50">
                            <PlayCircle size={10} /> Begin analysis
                          </button>
                        )}
                        {r.status === 'analysis' && (
                          <button onClick={() => setPublications(p => p.map(x => x.id===r.id ? {...x, status:'draft review'} : x))}
                            className="flex items-center gap-1 text-[10px] font-bold text-purple-700 border border-purple-200 px-2 py-1 rounded-lg hover:bg-purple-50">
                            <Edit3 size={10} /> Submit draft
                          </button>
                        )}
                        {r.status === 'draft review' && (
                          <button onClick={() => setPublications(p => p.map(x => x.id===r.id ? {...x, status:'pending approval'} : x))}
                            className="flex items-center gap-1 text-[10px] font-bold text-amber-700 border border-amber-200 px-2 py-1 rounded-lg hover:bg-amber-50">
                            <Send size={10} /> Submit for approval
                          </button>
                        )}
                        {r.status === 'pending approval' && (
                          <button onClick={() => setPublications(p => p.map(x => x.id===r.id ? {...x, status:'published'} : x))}
                            className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-50">
                            <CheckCircle2 size={10} /> Approve &amp; publish
                          </button>
                        )}
                        {r.status === 'published' && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Published</span>
                        )}
                        <div className="flex-1" />
                        <button onClick={() => setPublications(p => p.filter(x => x.id !== r.id))}
                          className="text-red-400 hover:text-red-600 p-1"><Trash2 size={11} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Layers size={16} className="text-[#006838]" />
                  <p className="text-sm font-bold text-slate-800">Reusable research templates &amp; scripts</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {templates.map((t, i) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md">{t.category}</span>
                          {t.validated && <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md">Validated</span>}
                        </div>
                        <p className="text-xs font-bold text-slate-800">{t.name}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {t.questions > 0 ? `${t.questions} questions · ` : ''}{t.usageCount}× used · Last: {t.lastUsed}
                        </p>
                      </div>
                      <button onClick={() => setTemplates(p => p.map(x => x.id===t.id ? {...x, usageCount: x.usageCount+1} : x))}
                        className="text-[10px] font-bold text-[#006838] border border-[#006838]/30 px-2 py-1 rounded-lg hover:bg-[#006838]/5 flex-shrink-0">Use</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATISTICS_SNAPSHOTS.map((s, i) => (
                  <div key={i} className="stat-card">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-2">{s.metric}</p>
                    <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{s.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Quality & Lineage */}
          {resSubTab === 'quality' && (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-3 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">KPI lineages</p>
                {dataLineages.map((dl, i) => (
                  <div key={i} className={`rounded-xl border transition-colors ${
                    selectedLineage.id === dl.id ? 'border-[#006838] bg-[#006838]/5' : 'border-slate-100 bg-white'
                  }`}>
                    <button onClick={() => setSelectedLineage(dl)}
                      className="w-full text-left p-3">
                      <p className="text-xs font-semibold text-slate-800">{dl.kpi}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${dl.qualityScore >= 95 ? 'bg-emerald-500' : dl.qualityScore >= 85 ? 'bg-amber-400' : 'bg-red-500'}`} />
                        <span className="text-[10px] text-slate-400">Quality: {dl.qualityScore}%</span>
                      </div>
                    </button>
                    <div className="flex items-center gap-1.5 px-3 pb-2">
                      {!dl.flagged ? (
                        <button onClick={() => {
                          const upd = { ...dl, qualityScore: Math.max(0, dl.qualityScore - 15), flagged: true }
                          setDataLineages(p => p.map(x => x.id===dl.id ? upd : x))
                          if (selectedLineage.id === dl.id) setSelectedLineage(upd)
                        }} className="flex items-center gap-1 text-[10px] font-bold text-red-600 hover:text-red-700">
                          <AlertTriangle size={9} /> Flag issue
                        </button>
                      ) : (
                        <button onClick={() => {
                          const upd = { ...dl, flagged: false, qualityScore: Math.min(100, dl.qualityScore + 10) }
                          setDataLineages(p => p.map(x => x.id===dl.id ? upd : x))
                          if (selectedLineage.id === dl.id) setSelectedLineage(upd)
                        }} className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700">
                          <CheckCircle2 size={9} /> Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="col-span-12 md:col-span-9 card">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-slate-800">
                    Data lineage — <span className="text-[#006838]">{selectedLineage.kpi}</span>
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <div className={`w-2 h-2 rounded-full ${selectedLineage.qualityScore >= 95 ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    Quality score: <span className="font-bold text-slate-800">{selectedLineage.qualityScore}%</span>
                    <span className="text-slate-300">·</span>
                    Updated {selectedLineage.lastUpdated}
                  </div>
                </div>
                <div className="flex items-start gap-2 overflow-x-auto pb-2">
                  {selectedLineage.stages.map((stage, i) => {
                    const colors = {
                      source:    'bg-blue-50 border-blue-200 text-blue-800',
                      clean:     'bg-amber-50 border-amber-200 text-amber-800',
                      merge:     'bg-purple-50 border-purple-200 text-purple-800',
                      transform: 'bg-slate-50 border-slate-200 text-slate-700',
                      output:    'bg-emerald-50 border-emerald-200 text-emerald-800',
                    }
                    return (
                      <div key={i} className="flex items-center gap-2 flex-shrink-0">
                        <div className={`p-3 rounded-xl border w-44 ${colors[stage.type] || colors.source}`}>
                          <p className="text-[9px] font-bold uppercase mb-1.5 opacity-60">{stage.type}</p>
                          <p className="text-xs font-semibold leading-snug">{stage.step}</p>
                          {stage.rule && <p className="text-[10px] mt-1.5 opacity-70 font-mono">{stage.rule}</p>}
                          {stage.source && <p className="text-[10px] mt-1 opacity-70">↳ {stage.source}</p>}
                        </div>
                        {i < selectedLineage.stages.length - 1 && (
                          <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Request Manager */}
          {resSubTab === 'requests' && (
            <div className="space-y-4">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-[#006838]" />
                    <p className="text-sm font-bold text-slate-800">Data &amp; report request portal</p>
                  </div>
                  <button onClick={() => setNewRequestOpen(!newRequestOpen)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#006838] border border-[#006838]/30 px-3 py-1.5 rounded-xl hover:bg-[#006838]/5 transition-colors">
                    <Plus size={12} /> New request
                  </button>
                </div>
                {newRequestOpen && (
                  <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                    <input value={newRequest.title} onChange={e => setNewRequest(p => ({ ...p, title: e.target.value }))}
                      placeholder="Request description *" className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]" />
                    <div className="grid grid-cols-2 gap-3">
                      <input value={newRequest.requestedBy} onChange={e => setNewRequest(p => ({ ...p, requestedBy: e.target.value }))}
                        placeholder="Requested by" className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]" />
                      <input value={newRequest.dept} onChange={e => setNewRequest(p => ({ ...p, dept: e.target.value }))}
                        placeholder="Department" className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]" />
                      <input type="date" value={newRequest.deadline} onChange={e => setNewRequest(p => ({ ...p, deadline: e.target.value }))}
                        className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]" />
                      <select value={newRequest.priority} onChange={e => setNewRequest(p => ({ ...p, priority: e.target.value }))}
                        className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]">
                        <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        if (!newRequest.title.trim()) return
                        setDataRequests(prev => [...prev, { id:`DR-2026-${String(Date.now()).slice(-2)}`, ...newRequest, date:'07 Apr 2026', status:'pending', assignee:null, matchedReport:null }])
                        setNewRequest({ title:'', requestedBy:'', dept:'', deadline:'', priority:'medium' })
                        setNewRequestOpen(false)
                      }} className="px-4 py-2 bg-[#006838] text-white text-xs font-bold rounded-xl hover:bg-[#005a30] transition-colors">Submit</button>
                      <button onClick={() => setNewRequestOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {dataRequests.map((req, i) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-100 bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <PriorityDot priority={req.priority} />
                            <span className="text-[10px] font-mono text-slate-400">{req.id}</span>
                            <StatusBadge status={req.status} />
                            {req.matchedReport && (
                              <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md">Auto-match: {req.matchedReport}</span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-800">{req.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{req.requestedBy} · {req.dept} · Due {req.deadline}</p>
                        </div>
                        {req.status === 'pending' && (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button onClick={() => setDataRequests(p => p.map(r => r.id===req.id ? {...r, status:'in-progress', assignee:'Statistics Analyst'} : r))}
                              className="text-[10px] font-bold text-[#006838] border border-[#006838]/30 px-2 py-1 rounded-lg hover:bg-[#006838]/5">Accept</button>
                            <button onClick={() => setDataRequests(p => p.map(r => r.id===req.id ? {...r, status:'deferred'} : r))}
                              className="text-[10px] font-bold text-slate-500 border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50">Defer</button>
                          </div>
                        )}
                        {req.status === 'in-progress' && (
                          <button onClick={() => setDataRequests(p => p.map(r => r.id===req.id ? {...r, status:'fulfilled'} : r))}
                            className="text-[10px] font-bold text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-50 flex-shrink-0">Mark fulfilled</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Approvals */}
          {resSubTab === 'approvals' && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={16} className="text-[#006838]" />
                <p className="text-sm font-bold text-slate-800">Research approval requests</p>
                {resPending > 0 && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{resPending} pending</span>}
              </div>
              <div className="space-y-3">
                {researchApprovals.map(item => (
                  <ApprovalCard key={item.id} item={item}
                    onApprove={(id,note) => handleApproval(id,note,'approved',researchApprovals,setResearchApprovals)}
                    onReturn={(id,note)  => handleApproval(id,note,'returned', researchApprovals,setResearchApprovals)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MONITORING & EVALUATION TAB ──────────────────────────────────────── */}
      {tab === 'mande' && (
        <div className="space-y-5">
          <SubTabBar
            tabs={[
              { id:'indicators',  label:'KPI Tracking' },
              { id:'evaluations', label:'Evaluations' },
              { id:'fieldvisits', label:'Field Visits' },
              { id:'alerts',      label:`Predictive Alerts (${PREDICTIVE_ALERTS.length})` },
              { id:'approvals',   label:`Approvals${mandePending > 0 ? ` (${mandePending})` : ''}` },
            ]}
            active={mandeSubTab} onChange={setMandeSubTab}
          />

          {/* KPI Tracking */}
          {mandeSubTab === 'indicators' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {kpis.map((k, i) => (
                  <div key={i} className="stat-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={14} className="text-[#006838]" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{k.label}</span>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900">{k.value}</p>
                    <p className="text-xs text-slate-500 mt-1">Target: {k.target}{k.unit}</p>
                    {inlineEdit.type === 'kpi-reading' && inlineEdit.id === k.label ? (
                      <div className="flex items-center gap-1.5 mt-2">
                        <input type="text" value={inlineEdit.value}
                          onChange={e => setInlineEdit(s => ({ ...s, value: e.target.value }))}
                          placeholder={`New value`}
                          className="flex-1 min-w-0 text-xs border border-[#006838] rounded px-1.5 py-0.5 outline-none" />
                        <button onClick={() => {
                          setKpis(p => p.map(x => x.label===k.label ? {...x, value: inlineEdit.value} : x))
                          setInlineEdit({ type: null, id: null, value: '' })
                        }} className="text-[10px] font-bold text-white bg-[#006838] px-1.5 py-0.5 rounded">OK</button>
                        <button onClick={() => setInlineEdit({ type: null, id: null, value: '' })}><X size={11} className="text-slate-400" /></button>
                      </div>
                    ) : (
                      <button onClick={() => setInlineEdit({ type: 'kpi-reading', id: k.label, value: k.value })}
                        className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#006838] border border-[#006838]/20 px-2 py-1 rounded-lg hover:bg-[#006838]/5 w-full justify-center">
                        <Edit3 size={9} /> Record reading
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="card">
                  <p className="text-sm font-bold text-slate-800 mb-4">Indicator progress vs baseline</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="baseline" fill="#e2e8f0" name="Baseline" radius={[0,4,4,0]} />
                      <Bar dataKey="current"  fill="#006838" name="Current"  radius={[0,4,4,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="card">
                  <p className="text-sm font-bold text-slate-800 mb-4">Tracked programmes</p>
                  <div className="space-y-3">
                    {trackedProjects.map((proj, i) => (
                      <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50/80">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800">{proj.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{proj.indicator}</p>
                            <p className="text-xs text-slate-600 mt-1">Baseline <span className="font-bold">{proj.baseline}</span> → Current <span className="font-bold text-[#006838]">{proj.current}</span></p>
                          </div>
                          <StatusBadge status={proj.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                          {inlineEdit.type === 'proj-value' && inlineEdit.id === proj.name ? (
                            <div className="flex items-center gap-1.5 flex-1">
                              <input type="text" value={inlineEdit.value}
                                onChange={e => setInlineEdit(s => ({ ...s, value: e.target.value }))}
                                placeholder="New current value"
                                className="flex-1 text-xs border border-[#006838] rounded px-1.5 py-0.5 outline-none" />
                              <button onClick={() => {
                                setTrackedProjects(prev => prev.map(x => x.name===proj.name ? {...x, current: Number(inlineEdit.value) || inlineEdit.value} : x))
                                setInlineEdit({ type: null, id: null, value: '' })
                              }} className="text-[10px] font-bold text-white bg-[#006838] px-1.5 py-0.5 rounded">OK</button>
                              <button onClick={() => setInlineEdit({ type: null, id: null, value: '' })}><X size={11} className="text-slate-400" /></button>
                            </div>
                          ) : (
                            <button onClick={() => setInlineEdit({ type: 'proj-value', id: proj.name, value: String(proj.current) })}
                              className="flex items-center gap-1 text-[10px] font-bold text-slate-600 border border-slate-200 px-2 py-1 rounded-lg hover:border-[#006838]/40">
                              <Edit3 size={10} /> Update value
                            </button>
                          )}
                          <select value={proj.status}
                            onChange={e => setTrackedProjects(prev => prev.map(x => x.name===proj.name ? {...x, status: e.target.value} : x))}
                            className="ml-auto text-[10px] border border-slate-200 rounded px-1.5 py-0.5 outline-none focus:border-[#006838]">
                            <option value="improving">Improving</option>
                            <option value="on-track">On track</option>
                            <option value="at risk">At risk</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Evaluations */}
          {mandeSubTab === 'evaluations' && (
            <div className="space-y-4">
              {evalReports.map((ev, i) => (
                <div key={i} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md uppercase">{ev.type}</span>
                        <StatusBadge status={ev.status} />
                        {ev.rating !== '—' && <span className="text-[10px] font-bold text-slate-500">{ev.rating}</span>}
                      </div>
                      <p className="text-sm font-bold text-slate-800">{ev.title}</p>
                      <p className="text-xs text-slate-500 mt-1">Programme: {ev.programme} · Evaluator: {ev.evaluator} · {ev.date}</p>
                    </div>
                    {ev.findings.length > 0 && (
                      <button onClick={() => setExpandedEval(expandedEval === i ? null : i)}
                        className="text-xs text-[#006838] font-semibold hover:underline flex-shrink-0">
                        {expandedEval === i ? 'Collapse ↑' : `${ev.findings.length} findings ↓`}
                      </button>
                    )}
                  </div>
                  {expandedEval === i && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                      {ev.findings.map((f, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <span className="text-[#006838] font-bold mt-0.5 flex-shrink-0">•</span>
                          <p className="text-xs text-slate-700">{f}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* evaluation actions */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-50">
                    {ev.status === 'planned' && (
                      <button onClick={() => setEvalReports(p => p.map(x => x.id===ev.id ? {...x, status:'in-progress'} : x))}
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-700 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50">
                        <PlayCircle size={10} /> Begin evaluation
                      </button>
                    )}
                    {ev.status === 'in-progress' && (
                      <>
                        <button onClick={() => setEvalReports(p => p.map(x => x.id===ev.id ? {...x, status:'pending approval'} : x))}
                          className="flex items-center gap-1 text-[10px] font-bold text-amber-700 border border-amber-200 px-2 py-1 rounded-lg hover:bg-amber-50">
                          <Send size={10} /> Submit for review
                        </button>
                        <button onClick={() => setEvalReports(p => p.map(x => x.id===ev.id ? {...x, status:'completed'} : x))}
                          className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-50">
                          <CheckCircle2 size={10} /> Mark complete
                        </button>
                      </>
                    )}
                    {ev.status === 'pending approval' && (
                      <>
                        <button onClick={() => setEvalReports(p => p.map(x => x.id===ev.id ? {...x, status:'completed'} : x))}
                          className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-50">
                          <CheckCircle2 size={10} /> Approve
                        </button>
                        <button onClick={() => setEvalReports(p => p.map(x => x.id===ev.id ? {...x, status:'in-progress'} : x))}
                          className="flex items-center gap-1 text-[10px] font-bold text-purple-700 border border-purple-200 px-2 py-1 rounded-lg hover:bg-purple-50">
                          <RotateCcw size={10} /> Request revision
                        </button>
                      </>
                    )}
                    {ev.status === 'completed' && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Evaluation complete</span>
                    )}
                  </div>
                </div>
              ))}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardCheck size={16} className="text-[#006838]" />
                  <p className="text-sm font-bold text-slate-800">Compliance &amp; assurance</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {COMPLIANCE_CHECKS.map((c, i) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800">{c.standard}</p>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5">Last: {c.lastAudit || c.lastReview} · Next: {c.nextDue}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Field Visits */}
          {mandeSubTab === 'fieldvisits' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#006838]" />
                  <p className="text-sm font-bold text-slate-800">Field visit schedule</p>
                </div>
                <button onClick={() => setVisitOpen(!visitOpen)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#006838] border border-[#006838]/30 px-3 py-1.5 rounded-xl hover:bg-[#006838]/5 transition-colors">
                  <Plus size={12} /> New visit
                </button>
              </div>
              {visitOpen && (
                <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input value={newVisit.site} onChange={e => setNewVisit(p => ({ ...p, site: e.target.value }))} placeholder="Site / RTC *" className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]" />
                    <input value={newVisit.purpose} onChange={e => setNewVisit(p => ({ ...p, purpose: e.target.value }))} placeholder="Purpose" className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]" />
                    <input value={newVisit.officer} onChange={e => setNewVisit(p => ({ ...p, officer: e.target.value }))} placeholder="Lead officer" className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]" />
                    <input type="date" value={newVisit.date} onChange={e => setNewVisit(p => ({ ...p, date: e.target.value }))} className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      if (!newVisit.site.trim()) return
                      setFieldVisits(prev => [...prev, { ...newVisit, id:`FV-2026-${String(Date.now()).slice(-2)}`, status:'planned' }])
                      setNewVisit({ site:'', purpose:'', officer:'', date:'' })
                      setVisitOpen(false)
                    }} className="px-4 py-2 bg-[#006838] text-white text-xs font-bold rounded-xl hover:bg-[#005a30] transition-colors">Save visit</button>
                    <button onClick={() => setVisitOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {fieldVisits.map((v, i) => (
                  <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="text-[10px] font-mono text-slate-400">{v.id}</p>
                        <h3 className="text-sm font-bold text-slate-800 mt-0.5">{v.site}</h3>
                        <p className="text-xs text-slate-500 mt-1">{v.purpose} · {v.officer} · {v.date}</p>
                        {v.notes && <p className="text-[10px] italic text-[#006838] mt-1">Notes: {v.notes}</p>}
                      </div>
                      <StatusBadge status={v.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                      {v.status === 'planned' && (
                        <>
                          <button onClick={() => setFieldVisits(p => p.map(x => x.id===v.id ? {...x, status:'in-progress'} : x))}
                            className="flex items-center gap-1 text-[10px] font-bold text-blue-700 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50">
                            <PlayCircle size={10} /> Begin visit
                          </button>
                          <button onClick={() => setFieldVisits(p => p.map(x => x.id===v.id ? {...x, status:'cancelled'} : x))}
                            className="flex items-center gap-1 text-[10px] font-bold text-red-500 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50">
                            <X size={10} /> Cancel
                          </button>
                        </>
                      )}
                      {v.status === 'in-progress' && (
                        <button onClick={() => setFieldVisits(p => p.map(x => x.id===v.id ? {...x, status:'completed'} : x))}
                          className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-50">
                          <CheckCircle2 size={10} /> Mark complete
                        </button>
                      )}
                      {inlineEdit.type === 'visit-note' && inlineEdit.id === v.id ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input type="text" value={inlineEdit.value}
                            onChange={e => setInlineEdit(s => ({ ...s, value: e.target.value }))}
                            placeholder="Add field notes…"
                            className="flex-1 text-xs border border-[#006838] rounded px-1.5 py-0.5 outline-none" />
                          <button onClick={() => {
                            setFieldVisits(p => p.map(x => x.id===v.id ? {...x, notes: inlineEdit.value} : x))
                            setInlineEdit({ type: null, id: null, value: '' })
                          }} className="text-[10px] font-bold text-white bg-[#006838] px-1.5 py-0.5 rounded">Save</button>
                          <button onClick={() => setInlineEdit({ type: null, id: null, value: '' })}><X size={11} className="text-slate-400" /></button>
                        </div>
                      ) : (
                        <button onClick={() => setInlineEdit({ type: 'visit-note', id: v.id, value: v.notes || '' })}
                          className="flex items-center gap-1 text-[10px] font-bold text-slate-500 border border-slate-200 px-2 py-1 rounded-lg hover:border-[#006838]/40">
                          <Edit3 size={10} /> {v.notes ? 'Edit notes' : 'Add notes'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Predictive Alerts */}
          {mandeSubTab === 'alerts' && (
            <div className="space-y-4">
              {alertsList.map((alert, i) => (
                <div key={i} className={`card border-l-4 transition-opacity ${alert.acknowledged ? 'border-l-slate-300 opacity-60' : alert.severity === 'critical' ? 'border-l-red-500' : 'border-l-amber-400'}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={14} className={alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'} />
                        <span className={`text-[10px] font-bold uppercase ${alert.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>
                          {alert.severity === 'critical' ? 'Critical alert' : 'Warning'}
                        </span>
                        <span className="text-[10px] text-slate-400">{alert.consecutiveMonths} consecutive months below target</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{alert.kpi}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                        <span>Current: <span className="font-bold text-slate-800">{alert.currentValue}</span></span>
                        <span>Target: <span className="font-bold text-slate-800">{alert.target}</span></span>
                        <span className="flex items-center gap-1"><TrendingUp size={10} className="text-red-500" />{alert.trend}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <p className="font-bold text-slate-700 mb-0.5">Predicted outcome</p>
                      <p className="text-slate-600">{alert.predictedOutcome}</p>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-xl">
                      <p className="font-bold text-amber-700 mb-0.5">Lead indicator</p>
                      <p className="text-amber-700">{alert.leadIndicator}</p>
                    </div>
                    <div className="p-2.5 bg-[#006838]/5 rounded-xl">
                      <p className="font-bold text-[#006838] mb-0.5">Recommended action</p>
                      <p className="text-slate-700">{alert.recommendation}</p>
                    </div>
                  </div>
                  {/* alert actions */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-50">
                    {!alert.acknowledged ? (
                      <>
                        <button onClick={() => setAlertsList(p => p.map(x => x.id===alert.id ? {...x, acknowledged:true} : x))}
                          className="flex items-center gap-1 text-[10px] font-bold text-slate-600 border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50">
                          <CheckCircle2 size={10} /> Acknowledge
                        </button>
                        <button onClick={() => setAlertsList(p => p.map(x => x.id===alert.id ? {...x, severity:'critical', escalated:true} : x))}
                          className="flex items-center gap-1 text-[10px] font-bold text-red-700 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50">
                          <ArrowUpCircle size={10} /> Escalate to Director
                        </button>
                        {alert.escalated && (
                          <span className="text-[9px] font-bold text-red-600 flex items-center gap-1"><Bell size={9} /> Escalated</span>
                        )}
                        <button onClick={() => setAlertsList(p => p.filter(x => x.id !== alert.id))}
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 ml-auto">
                          <X size={10} /> Dismiss
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Acknowledged — monitoring
                        <button onClick={() => setAlertsList(p => p.map(x => x.id===alert.id ? {...x, acknowledged:false} : x))}
                          className="ml-2 text-[10px] text-[#006838] hover:underline">Reopen</button>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* M&E Approvals */}
          {mandeSubTab === 'approvals' && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={16} className="text-[#006838]" />
                <p className="text-sm font-bold text-slate-800">M&amp;E approval queue</p>
                {mandePending > 0 && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{mandePending} pending</span>}
              </div>
              <div className="space-y-3">
                {mandeApprovals.map(item => (
                  <ApprovalCard key={item.id}
                    item={{ ...item, submittedDate: item.date, priority: item.type === 'KPI Revision' ? 'high' : 'medium' }}
                    onApprove={(id,note) => handleApproval(id,note,'approved',mandeApprovals,setMandeApprovals)}
                    onReturn={(id,note)  => handleApproval(id,note,'returned', mandeApprovals,setMandeApprovals)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SCENARIOS TAB ────────────────────────────────────────────────────── */}
      {tab === 'scenarios' && (
        <div className="space-y-5">
          <p className="text-sm text-slate-500">Adjust planning assumptions and see the impact on all KPIs in real time. Pick a preset or use the sliders.</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Controls */}
            <div className="card space-y-5">
              <p className="text-sm font-bold text-slate-800">Quick-start: pick a preset</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_SCENARIOS.map(p => (
                  <button key={p.id} onClick={() => { setActivePreset(p.id); setScenario({ budgetChange: p.budgetChange, demandChange: p.demandChange, staffingChange: p.staffingChange }) }}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      activePreset === p.id ? 'border-[#006838] bg-[#006838]/5' : 'border-slate-100 hover:border-slate-200'
                    }`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                      <p className="text-[10px] font-bold text-slate-800">{p.name}</p>
                    </div>
                    <p className="text-[9px] text-slate-400">
                      Budget {p.budgetChange >= 0 ? '+' : ''}{p.budgetChange}% · Demand {p.demandChange >= 0 ? '+' : ''}{p.demandChange}%
                    </p>
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <p className="text-xs font-bold text-slate-500">— or adjust manually (creates custom scenario) —</p>
                {[
                  { key:'budgetChange',   label:'Budget change (%)',   min:-50, max:50,  color:'#006838' },
                  { key:'demandChange',   label:'Demand change (%)',   min:-30, max:50,  color:'#3b82f6' },
                  { key:'staffingChange', label:'Staffing change (%)', min:-20, max:20,  color:'#8b5cf6' },
                ].map(({ key, label, min, max, color }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-700">{label}</span>
                      <span className="text-xs font-extrabold" style={{ color: scenario[key] < 0 ? '#ef4444' : '#006838' }}>
                        {scenario[key] >= 0 ? '+' : ''}{scenario[key]}%
                      </span>
                    </div>
                    <input type="range" min={min} max={max} value={scenario[key]}
                      onChange={e => { setActivePreset('custom'); setScenario(s => ({ ...s, [key]: Number(e.target.value) })) }}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: color }} />
                    <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                      <span>{min}%</span><span>0%</span><span>+{max}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live outcomes */}
            <div className="card space-y-3">
              <p className="text-sm font-bold text-slate-800">
                Live outcomes
                {activePreset !== 'custom' && (
                  <span className="ml-2 text-[11px] text-slate-400 font-normal">({PRESET_SCENARIOS.find(p => p.id === activePreset)?.name})</span>
                )}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:'Projected trainees',  value: liveScenario.trainees.toLocaleString(),        delta: `${Number(liveScenario.deltaPct) >= 0 ? '+' : ''}${liveScenario.deltaPct}%`, positive: liveScenario.delta >= 0 },
                  { label:'Programmes',          value: liveScenario.programmes,                       delta: null },
                  { label:'Total budget',        value: `₦${liveScenario.budget}M`,                   delta: null },
                  { label:'Cost per trainee',    value: `₦${liveScenario.costPerT.toLocaleString()}`, delta: null },
                  { label:'RTC utilisation',     value: `${liveScenario.rtcUtil}%`,                   delta: null },
                  { label:'Staff count',         value: liveScenario.staff,                            delta: null },
                ].map((m, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold mb-1">{m.label}</p>
                    <p className="text-lg font-extrabold text-slate-900">{m.value}</p>
                    {m.delta && (
                      <p className={`text-[10px] font-bold mt-0.5 ${m.positive ? 'text-emerald-600' : 'text-red-600'}`}>{m.delta} vs baseline</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-700">Risk score</p>
                  <RiskBadge score={liveScenario.riskScore} />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {liveScenario.riskScore >= 7
                    ? 'High risk — review assumptions and escalate to leadership.'
                    : liveScenario.riskScore >= 4
                    ? 'Moderate risk — monitor KPIs closely and prepare mitigation plan.'
                    : 'Low risk — scenario falls within acceptable planning envelope.'}
                </p>
              </div>
              {liveScenario.riskScore >= 4 && liveScenario.delta < 0 && (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800">
                  <AlertTriangle size={11} className="inline mr-1" />
                  Service reach drops {Math.abs(liveScenario.deltaPct)}% ({Math.abs(liveScenario.delta).toLocaleString()} fewer trainees) — consider reallocating from lower-priority budget lines.
                </div>
              )}
            </div>
          </div>

          {/* Comparison matrix */}
          <div className="card overflow-x-auto">
            <p className="text-sm font-bold text-slate-800 mb-4">Scenario comparison matrix</p>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[10px] text-slate-400 uppercase">
                  <th className="pb-3 font-bold">Scenario</th>
                  <th className="pb-3 font-bold text-right">Budget</th>
                  <th className="pb-3 font-bold text-right">Trainees</th>
                  <th className="pb-3 font-bold text-right">Programmes</th>
                  <th className="pb-3 font-bold text-right">RTC util.</th>
                  <th className="pb-3 font-bold text-right">Cost/trainee</th>
                  <th className="pb-3 font-bold">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {PRESET_SCENARIOS.map((p, i) => {
                  const r = calcScenario(p)
                  return (
                    <tr key={i} className={`${activePreset === p.id ? 'bg-[#006838]/5 font-semibold' : 'hover:bg-slate-50/60'}`}>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                          {p.name}
                          {activePreset === p.id && <span className="text-[9px] text-[#006838] font-bold">active</span>}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-right">₦{r.budget}M</td>
                      <td className="py-2.5 pr-3 text-right">{r.trainees.toLocaleString()}</td>
                      <td className="py-2.5 pr-3 text-right">{r.programmes}</td>
                      <td className="py-2.5 pr-3 text-right">{r.rtcUtil}%</td>
                      <td className="py-2.5 pr-3 text-right">₦{r.costPerT.toLocaleString()}</td>
                      <td className="py-2.5"><RiskBadge score={r.riskScore} /></td>
                    </tr>
                  )
                })}
                {activePreset === 'custom' && (
                  <tr className="bg-purple-50/50 font-semibold">
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        Custom <span className="text-[9px] text-purple-600 font-bold">active</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-right">₦{liveScenario.budget}M</td>
                    <td className="py-2.5 pr-3 text-right">{liveScenario.trainees.toLocaleString()}</td>
                    <td className="py-2.5 pr-3 text-right">{liveScenario.programmes}</td>
                    <td className="py-2.5 pr-3 text-right">{liveScenario.rtcUtil}%</td>
                    <td className="py-2.5 pr-3 text-right">₦{liveScenario.costPerT.toLocaleString()}</td>
                    <td className="py-2.5"><RiskBadge score={liveScenario.riskScore} /></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
