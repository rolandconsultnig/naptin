import { useState, useMemo } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import {
  TNA_GAP_ITEMS, TRAINING_COURSES, CONTENT_BLOCKS,
  TRAINING_SESSIONS, TRAINING_PARTICIPANTS, EVALUATION_RESPONSES,
  COMPLIANCE_HEAT_MAP, TRAINERS, KNOWLEDGE_BASE,
  LEARNING_PATHS, MANDATORY_ASSIGNMENTS, DIGITAL_CERTIFICATES,
  TEAM_PROGRESS, MODULE_TIME_TRACKING, SKILLS_INVENTORY,
} from '../data/mock'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Brain, CalendarDays, BookOpen, BarChart2, ShieldCheck, TrendingUp,
  Users, MessageSquare, Plus, Send, CheckCircle2, RotateCcw, Edit3,
  Trash2, X, AlertTriangle, Star, Award, RefreshCw, ChevronDown,
  ChevronRight, PlayCircle, ThumbsUp, BookMarked, Bell, Zap, Layers,
  UserCheck, Archive, Copy, Download, Clock, GraduationCap, Briefcase,
  Gift, Route,
} from 'lucide-react'

// ── helpers ────────────────────────────────────────────────────────
function SubTabBar({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-1 mb-5 flex-wrap">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            active === t.id
              ? 'bg-[#006838] text-white border-[#006838] shadow-sm'
              : 'text-slate-500 border-slate-200 hover:border-[#006838]/30 hover:text-slate-700 bg-white'
          }`}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

const STATUS_MAP = {
  open:       'bg-red-50 text-red-700 border border-red-200',
  assigned:   'bg-blue-50 text-blue-700 border border-blue-200',
  resolved:   'bg-green-50 text-[#006838] border border-green-200',
  active:     'bg-green-50 text-[#006838] border border-green-200',
  draft:      'bg-slate-50 text-slate-600 border border-slate-200',
  completed:  'bg-purple-50 text-purple-700 border border-purple-200',
  scheduled:  'bg-blue-50 text-blue-700 border border-blue-200',
  confirmed:  'bg-teal-50 text-teal-700 border border-teal-200',
  pending:    'bg-amber-50 text-amber-700 border border-amber-200',
  partly:     'bg-amber-50 text-amber-700 border border-amber-200',
  current:    'bg-green-50 text-[#006838] border border-green-200',
  expiring:   'bg-amber-50 text-amber-700 border border-amber-200',
  expired:    'bg-red-50 text-red-700 border border-red-200',
}

function StatusBadge({ status }) {
  return (
    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${STATUS_MAP[status] ?? 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
      {status}
    </span>
  )
}

function SeverityDot({ severity }) {
  const c = severity === 'High' ? 'bg-red-500' : severity === 'Medium' ? 'bg-amber-400' : 'bg-slate-300'
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${c}`} title={severity} />
}

// ── MAIN ───────────────────────────────────────────────────────────
export default function TrainingPage() {
  const [mainTab, setMainTab] = useState('tna')

  // ── TNA state ────────────────────────────────────────────────────
  const [tnaSub, setTnaSub] = useState('gaps')
  const [gaps, setGaps]     = useState(TNA_GAP_ITEMS)
  const [gapNote, setGapNote] = useState({})

  function tnaAction(id, action) {
    setGaps(prev => prev.map(g => {
      if (g.id !== id) return g
      if (action === 'flag')   return { ...g, severity: 'High' }
      if (action === 'assign') return { ...g, status: 'assigned', assignedCourse: gapNote[id] || 'TBD' }
      if (action === 'resolve') return { ...g, status: 'resolved' }
      return g
    }))
  }

  // ── Design / Content Builder state ───────────────────────────────
  const [designSub, setDesignSub] = useState('courses')
  const [courses, setCourses]     = useState(TRAINING_COURSES)
  const [blocks, setBlocks]       = useState(CONTENT_BLOCKS)
  const [blockNote, setBlockNote] = useState({})
  const [showNewCourse, setShowNewCourse] = useState(false)
  const [newCourse, setNewCourse] = useState({ title:'', format:'Classroom', duration:'', facilitator:'', maxParticipants:20, costPerHead:'' })

  function addCourse() {
    if (!newCourse.title.trim()) return
    setCourses(prev => [...prev, { ...newCourse, id:`C${String(Date.now()).slice(-3)}`, status:'draft', enrolled:0, scheduled:'TBD' }])
    setNewCourse({ title:'', format:'Classroom', duration:'', facilitator:'', maxParticipants:20, costPerHead:'' })
    setShowNewCourse(false)
  }
  function blockAction(id, action) {
    setBlocks(prev => prev.map(b => {
      if (b.id !== id) return b
      if (action === 'validate')  return { ...b, validated: true }
      if (action === 'archive')   return { ...b, version: '[archived]' }
      if (action === 'newver')    return { ...b, version: (parseFloat(b.version) + 0.1).toFixed(1), lastUpdated: '07 Apr 2026' }
      if (action === 'push') {
        alert(`Update pushed to all ${b.usedInCourses} courses using "${b.title}". Trainers notified.`)
        return { ...b, lastUpdated: '07 Apr 2026' }
      }
      return b
    }))
  }

  // ── Delivery state ───────────────────────────────────────────────
  const [deliverySub, setDeliverySub] = useState('sessions')
  const [sessions, setSessions]       = useState(TRAINING_SESSIONS)
  const [participants]                = useState(TRAINING_PARTICIPANTS)
  const [pulseResults, setPulseResults] = useState({})
  const [adaptScore, setAdaptScore]   = useState('')

  function sessionAction(id, action) {
    setSessions(prev => prev.map(s => {
      if (s.id !== id) return s
      if (action === 'confirm')  return { ...s, status: 'confirmed' }
      if (action === 'complete') return { ...s, status: 'completed' }
      if (action === 'cancel')   return { ...s, status: 'cancelled' }
      return s
    }))
  }
  function launchPulse(sId) {
    setPulseResults(prev => ({
      ...prev,
      [sId]: { launched: true, wrongPct: Math.floor(Math.random() * 60), timestamp: '07 Apr 2026 10:32' }
    }))
  }

  // ── Evaluation state ─────────────────────────────────────────────
  const [evalSub, setEvalSub]   = useState('l1')
  const [evals, setEvals]       = useState(EVALUATION_RESPONSES)
  const [l4Note, setL4Note]     = useState({})

  function evalAction(id, action, extra) {
    setEvals(prev => prev.map(e => {
      if (e.id !== id) return e
      if (action === 'l3confirm') return { ...e, l3Status: 'confirmed', l3ConfirmedBy: 'Manager (via system)' }
      if (action === 'l3partly')  return { ...e, l3Status: 'partly', l3ConfirmedBy: 'Manager (via system)' }
      if (action === 'l3no')      return { ...e, l3Status: 'no', l3ConfirmedBy: 'Manager (via system)' }
      if (action === 'l4impact')  return { ...e, l4Impact: l4Note[id] || 'Recorded' }
      return e
    }))
  }

  // ── Compliance state ─────────────────────────────────────────────
  const [compSub, setCompSub]   = useState('heatmap')
  const [heatMap, setHeatMap]   = useState(COMPLIANCE_HEAT_MAP)

  function certAction(empId, certName, action) {
    setHeatMap(prev => prev.map(emp => {
      if (emp.employeeId !== empId) return emp
      return {
        ...emp,
        certifications: emp.certifications.map(c => {
          if (c.name !== certName) return c
          if (action === 'enroll')  return { ...c, status: 'current', expiry: '2027-04-07' }
          if (action === 'exempt')  return { ...c, status: 'current', expiry: 'Exempt' }
          return c
        })
      }
    }))
  }
  function autoRemediate() {
    setHeatMap(prev => prev.map(emp => ({
      ...emp,
      certifications: emp.certifications.map(c =>
        c.status === 'expired' || c.status === 'expiring'
          ? { ...c, status: 'current', expiry: '2027-04-07' }
          : c
      )
    })))
    alert('Auto-remediation complete: recertification sessions booked and invites sent.')
  }

  // ── ROI state ────────────────────────────────────────────────────
  const [roiSub, setRoiSub]   = useState('trainers')
  const [trainers, setTrainers] = useState(TRAINERS)

  const costTable = useMemo(() => courses.map(c => {
    const tr = trainers.find(t => t.name === c.facilitator)
    const trainerCost = tr ? tr.booked * 18000 : 0
    const totalCost   = (trainerCost + 45000 + 20000) // venue + materials flat
    const completions = c.enrolled || 1
    return { ...c, totalCost, costPerGraduate: Math.round(totalCost / completions), trainerCost }
  }), [courses, trainers])

  function reassignLoad(tid) {
    const spare = trainers.find(t => t.id !== tid && t.utilisation < 60)
    if (!spare) { alert('No available trainer with capacity below 60%.'); return }
    alert(`Load reassigned from ${trainers.find(t=>t.id===tid)?.name} → ${spare.name}`)
    setTrainers(prev => prev.map(t => {
      if (t.id === tid)    return { ...t, utilisation: Math.max(0, t.utilisation - 15) }
      if (t.id === spare.id) return { ...t, utilisation: t.utilisation + 15 }
      return t
    }))
  }

  // ── Analytics state ─────────────────────────────────────────────
  const [analyticsSub, setAnalyticsSub] = useState('manager')
  const [teamProgress]   = useState(TEAM_PROGRESS)
  const [timeTracking]   = useState(MODULE_TIME_TRACKING)

  // ── HR Integration state ──────────────────────────────────────────
  const [hrSub, setHrSub] = useState('skills')
  const [skillsInv, setSkillsInv] = useState(SKILLS_INVENTORY)
  const [mandatoryAssignments, setMandatoryAssignments] = useState(MANDATORY_ASSIGNMENTS)
  const [certificates, setCertificates] = useState(DIGITAL_CERTIFICATES)
  const [learningPaths] = useState(LEARNING_PATHS)

  function linkSkill(empId, skillName) {
    setSkillsInv(prev => prev.map(e => e.employeeId !== empId ? e : {
      ...e,
      skills: e.skills.map(s => s.skill === skillName ? { ...s, linked: true } : s)
    }))
  }
  function toggleIncentive(empId, field) {
    setSkillsInv(prev => prev.map(e => e.employeeId !== empId ? e : { ...e, [field]: !e[field] }))
  }
  function issueCert(courseTitle, employee) {
    const id = `CERT${String(Date.now()).slice(-3)}`
    const certNo = `NAPTIN-2026-${Math.floor(Math.random()*9000)+1000}`
    setCertificates(prev => [...prev, {
      id, employeeId:'NEW', employee, course: courseTitle,
      issuedDate:'07 Apr 2026', expiryDate:'07 Apr 2028',
      certNo, status:'valid'
    }])
  }
  function triggerMandatory(id) {
    setMandatoryAssignments(prev => prev.map(m => m.id !== id ? m : {
      ...m, assignedCount: m.assignedCount + 1
    }))
    alert('Mandatory enrollment triggered — all in-scope staff have been notified.')
  }

  // ── Social / Peer state ──────────────────────────────────────────
  const [socialSub, setSocialSub] = useState('qa')
  const [kb, setKb]               = useState(KNOWLEDGE_BASE)
  const [answerDraft, setAnswerDraft] = useState({})
  const [newQuestion, setNewQuestion] = useState('')

  function kbAction(id, action) {
    setKb(prev => prev.map(k => {
      if (k.id !== id) return k
      if (action === 'answer') return { ...k, answeredBy: 'Training Officer', answer: answerDraft[id] || '' }
      if (action === 'kb')    return { ...k, isKBArticle: true }
      if (action === 'endorse') return { ...k, endorsements: k.endorsements + 1 }
      return k
    }))
  }
  function postQuestion() {
    if (!newQuestion.trim()) return
    setKb(prev => [...prev, {
      id: `K${String(Date.now()).slice(-3)}`, question: newQuestion,
      askedBy: 'Current User', answeredBy: null, answer: null,
      isKBArticle: false, endorsements: 0, datAsked: '07 Apr 2026'
    }])
    setNewQuestion('')
  }

  // ── computed stats ───────────────────────────────────────────────
  const openGaps    = gaps.filter(g => g.status === 'open').length
  const expiredCerts = heatMap.flatMap(e => e.certifications).filter(c => c.status === 'expired').length
  const avgL1       = evals.length ? (evals.reduce((s,e) => s + e.l1Overall, 0) / evals.length).toFixed(1) : '-'
  const avgGain     = evals.length ? Math.round(evals.reduce((s,e) => s + (e.l2Post - e.l2Pre), 0) / evals.length) : 0

  const MAIN_TABS = [
    { id:'tna',        icon:Brain,         label:'TNA' },
    { id:'design',     icon:Layers,        label:'Design' },
    { id:'delivery',   icon:CalendarDays,  label:'Delivery' },
    { id:'evaluation', icon:BarChart2,     label:'Evaluation' },
    { id:'compliance', icon:ShieldCheck,   label:'Compliance' },
    { id:'roi',        icon:TrendingUp,    label:'ROI' },
    { id:'analytics',  icon:Users,         label:'Analytics' },
    { id:'hr',         icon:Briefcase,     label:'HR & Payroll' },
    { id:'social',     icon:MessageSquare, label:'Social' },
  ]

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block"/>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Training Unit</h1>
            <p className="text-sm text-slate-400">TNA · Design · Delivery · Evaluation · Compliance · ROI</p>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label:'Open Skill Gaps', value: openGaps,     icon:Brain,       bg:'bg-red-50',    color:'text-red-600' },
          { label:'Expired Certs',   value: expiredCerts, icon:ShieldCheck, bg:'bg-amber-50',  color:'text-amber-600' },
          { label:'Avg. L1 Score',   value: `${avgL1}/5`, icon:Star,        bg:'bg-blue-50',   color:'text-blue-600' },
          { label:'Avg. Knowledge Gain', value: `+${avgGain}%`, icon:TrendingUp, bg:'bg-green-50', color:'text-[#006838]' },
        ].map((k,i) => (
          <div key={i} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${k.bg} ${k.color} flex items-center justify-center flex-shrink-0`}><k.icon size={18}/></div>
            <div><div className="text-xl font-extrabold text-slate-900">{k.value}</div><div className="text-xs text-slate-400 font-medium">{k.label}</div></div>
          </div>
        ))}
      </div>

      {/* Main tab bar */}
      <div className="flex items-center gap-1 mb-5 flex-wrap">
        {MAIN_TABS.map(t => (
          <button key={t.id} onClick={() => setMainTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mainTab === t.id ? 'bg-[#006838] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 bg-white border border-slate-100'
            }`}>
            <t.icon size={14}/>{t.label}
          </button>
        ))}
      </div>

      {/* ── 1. TNA ── */}
      {mainTab === 'tna' && (
        <div>
          <SubTabBar
            tabs={[{ id:'gaps', label:'Gap Detection' }, { id:'map', label:'Competency Map' }]}
            active={tnaSub} onChange={setTnaSub}
          />
          {tnaSub === 'gaps' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-700">Skill Gap Register</h3>
                <span className="text-xs text-slate-400">{openGaps} open gaps requiring action</span>
              </div>
              {gaps.map(g => (
                <div key={g.id} className="card">
                  <div className="flex flex-wrap items-start gap-3 justify-between">
                    <div className="flex items-start gap-3">
                      <SeverityDot severity={g.severity}/>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-800">{g.competency}</span>
                          <StatusBadge status={g.status}/>
                          <span className="text-[10px] text-slate-400 font-medium">{g.role} · {g.dept}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5">
                          <span className="text-xs text-slate-500">Required: <span className="font-bold text-slate-700">L{g.requiredLevel}</span></span>
                          <span className="text-xs text-slate-500">Current: <span className="font-bold text-slate-700">L{g.currentLevel}</span></span>
                          <span className="text-xs text-slate-500">Gap: <span className="font-bold text-red-600">{g.requiredLevel - g.currentLevel} levels</span></span>
                          {g.assignedCourse && <span className="text-xs text-blue-600 font-medium">→ {g.assignedCourse}</span>}
                        </div>
                      </div>
                    </div>
                    {g.status !== 'resolved' && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {g.status === 'open' && (
                          <>
                            <input value={gapNote[g.id]||''} onChange={e=>setGapNote(p=>({...p,[g.id]:e.target.value}))}
                              placeholder="Assign course name…" className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-[#006838] w-44"/>
                            <button onClick={() => tnaAction(g.id,'assign')}
                              className="flex items-center gap-1 text-[10px] font-bold text-blue-700 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50">
                              <Plus size={10}/>Assign Training
                            </button>
                            <button onClick={() => tnaAction(g.id,'flag')}
                              className="flex items-center gap-1 text-[10px] font-bold text-red-700 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50">
                              <AlertTriangle size={10}/>Flag High
                            </button>
                          </>
                        )}
                        {g.status === 'assigned' && (
                          <button onClick={() => tnaAction(g.id,'resolve')}
                            className="flex items-center gap-1 text-[10px] font-bold text-[#006838] border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50">
                            <CheckCircle2 size={10}/>Mark Resolved
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {tnaSub === 'map' && (
            <div className="card">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Role–Competency Gap Map</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-3 py-2 font-semibold text-slate-600 rounded-l-xl">Role / Dept</th>
                      {['Relay Coord.','Cybersec.','IPSAS','Instructional Design','HV Switchgear','SAP HCM','Econometrics'].map(c => (
                        <th key={c} className="px-3 py-2 font-semibold text-slate-500 text-center whitespace-nowrap">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gaps.map(g => (
                      <tr key={g.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-3 py-2 font-semibold text-slate-700">{g.role}<span className="text-slate-400 font-normal ml-1">· {g.dept}</span></td>
                        {['Relay Coordination','Cybersecurity Forensics','IPSAS Reporting','Instructional Design','HV Switchgear O&M','SAP HCM Administration','Econometric Modelling'].map(comp => {
                          const match = g.competency === comp
                          const color = !match ? 'bg-slate-100' : g.status === 'resolved' ? 'bg-green-100 text-[#006838]' : g.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          return (
                            <td key={comp} className="px-3 py-2 text-center">
                              {match ? (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>
                                  {g.status === 'resolved' ? '✓' : `L${g.currentLevel}/L${g.requiredLevel}`}
                                </span>
                              ) : <span className="text-slate-200">—</span>}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 2. Design ── */}
      {mainTab === 'design' && (
        <div>
          <SubTabBar
            tabs={[{ id:'courses', label:'Course Library' }, { id:'content', label:'Content Blocks' }, { id:'paths', label:'Learning Paths' }, { id:'adaptive', label:'Adaptive Pathways' }]}
            active={designSub} onChange={setDesignSub}
          />
          {designSub === 'courses' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700">Course Library ({courses.length})</h3>
                <button onClick={() => setShowNewCourse(v=>!v)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#006838] border border-green-200 px-3 py-1.5 rounded-xl hover:bg-green-50">
                  <Plus size={12}/>New Course
                </button>
              </div>
              {showNewCourse && (
                <div className="card mb-4 bg-green-50/50 border border-green-100">
                  <h4 className="text-xs font-bold text-slate-700 mb-3">Add New Course</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <input value={newCourse.title} onChange={e=>setNewCourse(p=>({...p,title:e.target.value}))} placeholder="Course title *" className="col-span-2 lg:col-span-3 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]"/>
                    <select value={newCourse.format} onChange={e=>setNewCourse(p=>({...p,format:e.target.value}))} className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]">
                      {['Classroom','Online','Blended','Practical'].map(f=><option key={f}>{f}</option>)}
                    </select>
                    <input value={newCourse.duration} onChange={e=>setNewCourse(p=>({...p,duration:e.target.value}))} placeholder="Duration (e.g. 3 days)" className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]"/>
                    <input value={newCourse.facilitator} onChange={e=>setNewCourse(p=>({...p,facilitator:e.target.value}))} placeholder="Lead facilitator" className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]"/>
                    <input value={newCourse.costPerHead} onChange={e=>setNewCourse(p=>({...p,costPerHead:e.target.value}))} placeholder="Cost per head (₦)" type="number" className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]"/>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={addCourse} className="flex items-center gap-1.5 text-xs font-bold bg-[#006838] text-white px-3 py-1.5 rounded-xl hover:bg-[#005530]"><CheckCircle2 size={12}/>Save Course</button>
                    <button onClick={()=>setShowNewCourse(false)} className="text-xs text-slate-500 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50"><X size={12}/></button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {courses.map(c => (
                  <div key={c.id} className="card hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-sm font-bold text-slate-800">{c.title}</span>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <StatusBadge status={c.status}/>
                          <span className="text-[10px] text-slate-400">{c.format} · {c.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 mb-3">
                      <span><span className="font-semibold text-slate-700">{c.enrolled}</span>/{c.maxParticipants} enrolled</span>
                      <span>{c.scheduled}</span>
                      <span>₦{Number(c.costPerHead).toLocaleString()} /head</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] flex-wrap">
                      <span className="text-slate-400">{c.facilitator}</span>
                      <div className="ml-auto flex gap-2">
                        {c.status === 'draft' && (
                          <button onClick={() => setCourses(prev=>prev.map(x=>x.id===c.id?{...x,status:'active'}:x))}
                            className="flex items-center gap-1 font-bold text-[#006838] border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50">
                            <PlayCircle size={10}/>Activate
                          </button>
                        )}
                        {c.status === 'active' && (
                          <button onClick={() => setCourses(prev=>prev.map(x=>x.id===c.id?{...x,status:'completed'}:x))}
                            className="flex items-center gap-1 font-bold text-purple-700 border border-purple-200 px-2 py-1 rounded-lg hover:bg-purple-50">
                            <CheckCircle2 size={10}/>Mark Completed
                          </button>
                        )}
                        <button onClick={() => setCourses(prev=>prev.filter(x=>x.id!==c.id))}
                          className="text-red-400 hover:text-red-600 p-1"><Trash2 size={11}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {designSub === 'content' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700">Content Block Library ({blocks.length})</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {blocks.map(b => (
                  <div key={b.id} className="card">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <BookMarked size={14} className="text-[#006838]"/>
                          <span className="text-sm font-bold text-slate-800">{b.title}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-[10px]">
                          <span className="bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5 text-slate-600 font-semibold">{b.type}</span>
                          <span className="text-slate-400">v{b.version}</span>
                          <span className="text-slate-400">Updated {b.lastUpdated}</span>
                          <span className="text-slate-400">Used in {b.usedInCourses} course{b.usedInCourses!==1?'s':''}</span>
                          {b.validated
                            ? <span className="text-[#006838] font-bold flex items-center gap-0.5"><CheckCircle2 size={9}/>Validated</span>
                            : <span className="text-amber-600 font-bold flex items-center gap-0.5"><AlertTriangle size={9}/>Unvalidated</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <button onClick={() => blockAction(b.id,'newver')}
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-700 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50">
                        <Copy size={9}/>New Version
                      </button>
                      {!b.validated && (
                        <button onClick={() => blockAction(b.id,'validate')}
                          className="flex items-center gap-1 text-[10px] font-bold text-[#006838] border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50">
                          <CheckCircle2 size={9}/>Validate
                        </button>
                      )}
                      {b.usedInCourses > 0 && (
                        <button onClick={() => blockAction(b.id,'push')}
                          className="flex items-center gap-1 text-[10px] font-bold text-purple-700 border border-purple-200 px-2 py-1 rounded-lg hover:bg-purple-50">
                          <Send size={9}/>Push Update
                        </button>
                      )}
                      <button onClick={() => blockAction(b.id,'archive')}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-500 border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50 ml-auto">
                        <Archive size={9}/>Archive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {designSub === 'paths' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700">Learning Paths by Job Role</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {learningPaths.map(lp => (
                  <div key={lp.id} className="card">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-[#006838]/10 flex items-center justify-center flex-shrink-0">
                        <Route size={16} className="text-[#006838]"/>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{lp.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{lp.role} · {lp.dept} · {lp.totalHours}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div className="bg-[#006838] h-2 rounded-full" style={{width:`${lp.completionRate}%`}}/>
                      </div>
                      <span className="text-xs font-bold text-slate-700">{lp.completionRate}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{lp.enrolled} enrolled · {lp.courses.length} course{lp.courses.length!==1?'s':''}</span>
                      <button className="flex items-center gap-1 text-[10px] font-bold text-blue-700 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50">
                        <Plus size={9}/>Enrol Staff
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {designSub === 'adaptive' && (
            <div className="card max-w-xl">
              <h3 className="text-sm font-bold text-slate-700 mb-1 flex items-center gap-2"><Zap size={14} className="text-[#006838]"/>Adaptive Pathway Config</h3>
              <p className="text-xs text-slate-400 mb-4">Set a pre-test cut-score to auto-route learners to the right module entry point.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-slate-600 w-40">Pre-test score entered</label>
                  <input value={adaptScore} onChange={e=>setAdaptScore(e.target.value)} type="number" min="0" max="100"
                    placeholder="e.g. 72" className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838] w-32"/>
                  <span className="text-xs text-slate-400">%</span>
                </div>
                {adaptScore && (
                  <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700">
                    {Number(adaptScore) >= 75
                      ? <span className="text-[#006838] font-bold">✓ Skip to Module 3 — learner exceeds threshold (75%)</span>
                      : Number(adaptScore) >= 50
                      ? <span className="text-amber-700 font-bold">→ Enter at Module 2 — partial proficiency detected</span>
                      : <span className="text-red-700 font-bold">↓ Start from Module 1 — foundational gaps identified</span>}
                  </div>
                )}
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  {[
                    { range:'75–100%', action:'Skip to Module 3', color:'bg-green-50 text-[#006838]' },
                    { range:'50–74%', action:'Enter at Module 2', color:'bg-amber-50 text-amber-700' },
                    { range:'0–49%', action:'Start from Module 1', color:'bg-red-50 text-red-700' },
                  ].map((r,i)=>(
                    <div key={i} className={`flex items-center justify-between px-4 py-2.5 ${i>0?'border-t border-slate-100':''}`}>
                      <span className="text-xs font-semibold text-slate-600">{r.range}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${r.color}`}>{r.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 3. Delivery ── */}
      {mainTab === 'delivery' && (
        <div>
          <SubTabBar
            tabs={[{ id:'sessions', label:'Sessions' }, { id:'mandatory', label:'Mandatory Assignments' }, { id:'certs', label:'Certificates' }, { id:'pulse', label:'Pulse Check' }, { id:'roster', label:'Participant Roster' }]}
            active={deliverySub} onChange={setDeliverySub}
          />
          {deliverySub === 'sessions' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 mb-2">Scheduled & Confirmed Sessions</h3>
              {sessions.map(s => (
                <div key={s.id} className="card">
                  <div className="flex flex-wrap items-start gap-4 justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarDays size={13} className="text-[#006838]"/>
                        <span className="text-sm font-bold text-slate-800">{s.courseTitle}</span>
                        <StatusBadge status={s.status}/>
                      </div>
                      <div className="text-xs text-slate-400 space-x-3">
                        <span>{s.date}</span>
                        <span>{s.venue}</span>
                        <span>{s.facilitator}</span>
                        <span className="font-semibold text-slate-600">{s.enrolled.length}/{s.capacity} enrolled</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {s.status === 'scheduled' && (
                        <button onClick={() => sessionAction(s.id,'confirm')}
                          className="flex items-center gap-1 text-[10px] font-bold text-teal-700 border border-teal-200 px-2 py-1 rounded-lg hover:bg-teal-50">
                          <CheckCircle2 size={10}/>Confirm
                        </button>
                      )}
                      {(s.status === 'scheduled' || s.status === 'confirmed') && (
                        <>
                          <button onClick={() => sessionAction(s.id,'complete')}
                            className="flex items-center gap-1 text-[10px] font-bold text-purple-700 border border-purple-200 px-2 py-1 rounded-lg hover:bg-purple-50">
                            <Award size={10}/>Mark Completed
                          </button>
                          <button onClick={() => sessionAction(s.id,'cancel')}
                            className="flex items-center gap-1 text-[10px] font-bold text-red-600 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50">
                            <X size={10}/>Cancel
                          </button>
                        </>
                      )}
                      {s.status === 'completed' && <span className="text-[10px] text-[#006838] font-bold flex items-center gap-1"><CheckCircle2 size={10}/>Session closed</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {deliverySub === 'mandatory' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-700">Mandatory Training Assignments</h3>
                <button className="flex items-center gap-1.5 text-xs font-bold text-[#006838] border border-green-200 px-3 py-1.5 rounded-xl hover:bg-green-50">
                  <Plus size={12}/>New Mandate
                </button>
              </div>
              {mandatoryAssignments.map(m => (
                <div key={m.id} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-sm font-bold text-slate-800">{m.courseTitle}</span>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <StatusBadge status={m.status}/>
                        <span className="text-[10px] text-slate-400">{m.trigger}</span>
                        <span className="text-[10px] text-slate-400">Scope: {m.deptScope}</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Due {m.deadline}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${(m.completedCount/m.assignedCount)>=0.8?'bg-[#006838]':'bg-amber-400'}`}
                        style={{width:`${Math.round((m.completedCount/m.assignedCount)*100)}%`}}/>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{m.completedCount}/{m.assignedCount}</span>
                  </div>
                  {m.status === 'active' && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => triggerMandatory(m.id)}
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-700 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50">
                        <Bell size={9}/>Re-trigger Enrollment
                      </button>
                      <span className="text-[10px] text-slate-400 ml-auto">
                        {Math.round((m.completedCount/m.assignedCount)*100)}% complete
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {deliverySub === 'certs' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700">Digital Certificates ({certificates.length})</h3>
                <button
                  onClick={() => issueCert('Ad-hoc Certificate', 'New Recipient')}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#006838] border border-green-200 px-3 py-1.5 rounded-xl hover:bg-green-50">
                  <Award size={12}/>Issue Certificate
                </button>
              </div>
              <div className="space-y-3">
                {certificates.map(c => (
                  <div key={c.id} className="card">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Award size={18} className="text-amber-500"/>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-bold text-slate-800">{c.employee}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{c.course}</div>
                          </div>
                          <StatusBadge status={c.status}/>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                          <span>Issued {c.issuedDate}</span>
                          <span>Expires {c.expiryDate}</span>
                          <span className="font-mono text-slate-500">{c.certNo}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button className="flex items-center gap-1 text-[10px] font-bold text-[#006838] border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50">
                            <Download size={9}/>Download PDF
                          </button>
                          {c.status === 'expiring' && (
                            <button className="flex items-center gap-1 text-[10px] font-bold text-amber-700 border border-amber-200 px-2 py-1 rounded-lg hover:bg-amber-50">
                              <Bell size={9}/>Send Expiry Alert
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {deliverySub === 'pulse' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">Live Pulse Checks</h3>
              {sessions.filter(s=>s.status!=='cancelled').map(s => (
                <div key={s.id} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-sm font-bold text-slate-800">{s.courseTitle}</span>
                      <div className="text-xs text-slate-400 mt-0.5">{s.date} · {s.facilitator}</div>
                    </div>
                    <StatusBadge status={s.status}/>
                  </div>
                  {!pulseResults[s.id] ? (
                    <button onClick={() => launchPulse(s.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#006838] px-3 py-1.5 rounded-xl hover:bg-[#005530]">
                      <PlayCircle size={13}/>Launch Pulse Poll
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${pulseResults[s.id].wrongPct > 30 ? 'bg-red-500' : 'bg-[#006838]'}`}
                            style={{width:`${pulseResults[s.id].wrongPct}%`}}/>
                        </div>
                        <span className="text-xs font-bold text-slate-700 w-16 text-right">{pulseResults[s.id].wrongPct}% incorrect</span>
                      </div>
                      {pulseResults[s.id].wrongPct > 30 && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                          <AlertTriangle size={13} className="text-red-500"/>
                          <span className="text-xs text-red-700 font-semibold">Over 30% of participants answered incorrectly — consider re-teaching this topic</span>
                          <button className="ml-auto flex items-center gap-1 text-[10px] font-bold text-red-700 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-100">
                            <RefreshCw size={9}/>Re-teach Flag
                          </button>
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400">Launched: {pulseResults[s.id].timestamp}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {deliverySub === 'roster' && (
            <div className="card">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Participant Roster ({participants.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50">
                      {['ID','Name','Department','Role','Email'].map(h=>(
                        <th key={h} className="text-left px-3 py-2 font-semibold text-slate-600 first:rounded-l-xl last:rounded-r-xl">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map(p=>(
                      <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50/60 transition-colors">
                        <td className="px-3 py-2 text-slate-400 font-mono">{p.id}</td>
                        <td className="px-3 py-2 font-semibold text-slate-700">{p.name}</td>
                        <td className="px-3 py-2 text-slate-500">{p.dept}</td>
                        <td className="px-3 py-2 text-slate-500">{p.role}</td>
                        <td className="px-3 py-2 text-slate-400">{p.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 4. Evaluation ── */}
      {mainTab === 'evaluation' && (
        <div>
          <SubTabBar
            tabs={[
              { id:'l1', label:'L1 Reaction' },
              { id:'l2', label:'L2 Learning' },
              { id:'l3', label:'L3 Behaviour' },
              { id:'l4', label:'L4 Results' },
            ]}
            active={evalSub} onChange={setEvalSub}
          />
          {evalSub === 'l1' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">Reaction Surveys (post-session ratings)</h3>
              {evals.map(e=>(
                <div key={e.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-sm font-bold text-slate-800">{e.participant}</span>
                      <div className="text-xs text-slate-400 mt-0.5">{e.sessionTitle}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s=>(
                        <Star key={s} size={13} className={s<=Math.round(e.l1Overall)?'text-amber-400 fill-amber-400':'text-slate-200'}/>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1">{e.l1Overall}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {Object.entries(e.l1Dimensions).map(([dim,score])=>(
                      <div key={dim} className="bg-slate-50 rounded-xl p-2 text-center">
                        <div className="text-[10px] text-slate-400 capitalize mb-1">{dim}</div>
                        <div className="text-sm font-extrabold text-slate-700">{score}/5</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {evalSub === 'l2' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">Pre/Post Knowledge Test Scores</h3>
              {evals.map(e=>(
                <div key={e.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-sm font-bold text-slate-800">{e.participant}</span>
                      <div className="text-xs text-slate-400">{e.sessionTitle}</div>
                    </div>
                    <div className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${(e.l2Post-e.l2Pre)>=15?'bg-green-50 text-[#006838] border border-green-200':'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      +{e.l2Post - e.l2Pre}% gain
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Pre-test</span><span className="font-bold text-slate-700">{e.l2Pre}%</span></div>
                      <div className="bg-slate-100 rounded-full h-1.5"><div className="bg-slate-400 h-1.5 rounded-full" style={{width:`${e.l2Pre}%`}}/></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Post-test</span><span className="font-bold text-slate-700">{e.l2Post}%</span></div>
                      <div className="bg-slate-100 rounded-full h-1.5"><div className="bg-[#006838] h-1.5 rounded-full" style={{width:`${e.l2Post}%`}}/></div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="card bg-slate-50">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={evals.map(e=>({name:e.participant.split(' ')[0], pre:e.l2Pre, post:e.l2Post}))}>
                    <XAxis dataKey="name" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{fontSize:11}}/>
                    <Bar dataKey="pre" fill="#e2e8f0" name="Pre" radius={[4,4,0,0]}/>
                    <Bar dataKey="post" fill="#006838" name="Post" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {evalSub === 'l3' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">30-Day Manager Follow-Up (Behaviour Transfer)</h3>
              {evals.map(e=>(
                <div key={e.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-sm font-bold text-slate-800">{e.participant}</span>
                      <div className="text-xs text-slate-400">{e.sessionTitle}</div>
                    </div>
                    <StatusBadge status={e.l3Status}/>
                  </div>
                  {e.l3Status === 'pending' ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-500">Has the employee demonstrated the skill?</span>
                      <button onClick={() => evalAction(e.id,'l3confirm')}
                        className="flex items-center gap-1 text-[10px] font-bold text-[#006838] border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50">
                        <CheckCircle2 size={10}/>Yes
                      </button>
                      <button onClick={() => evalAction(e.id,'l3partly')}
                        className="flex items-center gap-1 text-[10px] font-bold text-amber-700 border border-amber-200 px-2 py-1 rounded-lg hover:bg-amber-50">
                        <ChevronRight size={10}/>Partly
                      </button>
                      <button onClick={() => evalAction(e.id,'l3no')}
                        className="flex items-center gap-1 text-[10px] font-bold text-red-600 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50">
                        <X size={10}/>No
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">Confirmed by: <span className="font-semibold text-slate-700">{e.l3ConfirmedBy}</span></div>
                  )}
                </div>
              ))}
            </div>
          )}
          {evalSub === 'l4' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">Business Impact & ROI (Results Level)</h3>
              {evals.map(e=>(
                <div key={e.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-sm font-bold text-slate-800">{e.participant}</span>
                      <div className="text-xs text-slate-400">{e.sessionTitle}</div>
                    </div>
                  </div>
                  {e.l4Impact ? (
                    <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 text-xs text-[#006838] font-semibold flex items-start gap-2">
                      <TrendingUp size={12} className="mt-0.5 flex-shrink-0"/>
                      {e.l4Impact}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input value={l4Note[e.id]||''} onChange={ev=>setL4Note(p=>({...p,[e.id]:ev.target.value}))}
                        placeholder="Record business impact…"
                        className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]"/>
                      <button onClick={() => evalAction(e.id,'l4impact')}
                        className="flex items-center gap-1 text-[10px] font-bold text-[#006838] border border-green-200 px-2 py-1.5 rounded-lg hover:bg-green-50">
                        <CheckCircle2 size={10}/>Record
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 5. Compliance ── */}
      {mainTab === 'compliance' && (
        <div>
          <SubTabBar
            tabs={[{ id:'heatmap', label:'Cert. Heat Map' }, { id:'summary', label:'Summary' }]}
            active={compSub} onChange={setCompSub}
          />
          {compSub === 'heatmap' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700">Competency & Certification Status</h3>
                <button onClick={autoRemediate}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#006838] px-3 py-1.5 rounded-xl hover:bg-[#005530]">
                  <Zap size={12}/>Auto-Remediate All
                </button>
              </div>
              <div className="flex items-center gap-3 mb-4 text-xs">
                {[['bg-green-100 border-green-300','Current'],['bg-amber-100 border-amber-300','Expiring <90 days'],['bg-red-100 border-red-300','Expired']].map(([cls,label])=>(
                  <span key={label} className={`flex items-center gap-1.5 border px-2.5 py-1 rounded-full font-medium ${cls}`}>{label}</span>
                ))}
              </div>
              <div className="space-y-4">
                {heatMap.map(emp => (
                  <div key={emp.employeeId} className="card">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#006838]/10 flex items-center justify-center text-[#006838] font-extrabold text-xs">
                        {emp.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{emp.name}</div>
                        <div className="text-xs text-slate-400">{emp.dept}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {emp.certifications.map(cert=>(
                        <div key={cert.name} className={`rounded-xl border px-3 py-2 text-xs ${
                          cert.status==='current'   ? 'bg-green-50 border-green-200' :
                          cert.status==='expiring'  ? 'bg-amber-50 border-amber-200' :
                                                      'bg-red-50 border-red-200'
                        }`}>
                          <div className="font-semibold text-slate-700 mb-0.5">{cert.name}</div>
                          <div className={`text-[10px] font-medium ${
                            cert.status==='current' ? 'text-[#006838]' :
                            cert.status==='expiring' ? 'text-amber-700' : 'text-red-600'
                          }`}>
                            {cert.status === 'current' ? `Valid to ${cert.expiry}` :
                             cert.status === 'expiring' ? `Expiring ${cert.expiry}` : `Expired ${cert.expiry}`}
                          </div>
                          {cert.status !== 'current' && (
                            <div className="flex gap-1.5 mt-2">
                              <button onClick={() => certAction(emp.employeeId, cert.name, 'enroll')}
                                className="text-[9px] font-bold text-[#006838] border border-green-300 px-1.5 py-0.5 rounded-lg hover:bg-green-100">
                                Enroll
                              </button>
                              <button onClick={() => certAction(emp.employeeId, cert.name, 'exempt')}
                                className="text-[9px] font-bold text-slate-500 border border-slate-300 px-1.5 py-0.5 rounded-lg hover:bg-slate-100">
                                Exempt
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {compSub === 'summary' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[
                { label:'Current',  count: heatMap.flatMap(e=>e.certifications).filter(c=>c.status==='current').length,  color:'text-[#006838]', bg:'bg-green-50' },
                { label:'Expiring', count: heatMap.flatMap(e=>e.certifications).filter(c=>c.status==='expiring').length, color:'text-amber-700', bg:'bg-amber-50' },
                { label:'Expired',  count: heatMap.flatMap(e=>e.certifications).filter(c=>c.status==='expired').length,  color:'text-red-700',   bg:'bg-red-50' },
              ].map(s=>(
                <div key={s.label} className={`card ${s.bg} text-center py-8`}>
                  <div className={`text-4xl font-extrabold ${s.color} mb-1`}>{s.count}</div>
                  <div className="text-xs font-semibold text-slate-500">{s.label} Certifications</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Analytics ── */}
      {mainTab === 'analytics' && (
        <div>
          <SubTabBar
            tabs={[{ id:'manager', label:'Manager Dashboard' }, { id:'time', label:'Time Tracking' }]}
            active={analyticsSub} onChange={setAnalyticsSub}
          />
          {analyticsSub === 'manager' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-700 mb-2">Team Completion — Manager View</h3>
              {teamProgress.map(mgr => (
                <div key={mgr.managerId} className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#006838]/10 flex items-center justify-center text-[#006838] font-extrabold text-xs">
                      {mgr.manager.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{mgr.manager}</div>
                      <div className="text-xs text-slate-400">{mgr.dept} — {mgr.team.length} direct reports</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {mgr.team.map((m,i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <span className="text-xs font-semibold text-slate-700">{m.name}</span>
                            <span className="text-[10px] text-slate-400 ml-2">{m.role}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-slate-400 flex items-center gap-1"><Clock size={9}/>{m.timeSpent}h</span>
                            <span className={`font-bold ${m.pct===100?'text-[#006838]':m.pct>=50?'text-amber-600':'text-red-600'}`}>
                              {m.completed}/{m.total} ({m.pct}%)
                            </span>
                          </div>
                        </div>
                        <div className="bg-slate-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full transition-all ${
                            m.pct===100?'bg-[#006838]':m.pct>=50?'bg-amber-400':'bg-red-400'
                          }`} style={{width:`${m.pct}%`}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {analyticsSub === 'time' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">Module Time-on-Task Analysis</h3>
              <p className="text-xs text-slate-400 mb-3">Identifies modules where learners spend significantly more or less time than expected — a proxy for difficulty or content clarity.</p>
              {timeTracking.map(course => (
                <div key={course.courseId} className="card">
                  <h4 className="text-sm font-bold text-slate-800 mb-3">{course.courseTitle}</h4>
                  <div className="space-y-2">
                    {course.modules.map((mod,i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600 font-medium">{mod.name}</span>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-slate-400">Expected {mod.expectedMinutes}min</span>
                              <span className="font-bold text-slate-700">Actual avg {mod.avgMinutes}min</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                mod.flag==='hard' ? 'bg-red-50 text-red-700 border border-red-200' :
                                mod.flag==='easy' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                    'bg-green-50 text-[#006838] border border-green-200'
                              }`}>
                                {mod.flag==='hard'?'Too Hard':mod.flag==='easy'?'Too Easy':'On Track'}
                              </span>
                            </div>
                          </div>
                          <div className="bg-slate-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${
                              mod.flag==='hard'?'bg-red-400':mod.flag==='easy'?'bg-blue-400':'bg-[#006838]'
                            }`} style={{width:`${Math.min(100,(mod.avgMinutes/mod.expectedMinutes)*100)}%`}}/>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── HR & Payroll Integration ── */}
      {mainTab === 'hr' && (
        <div>
          <SubTabBar
            tabs={[{ id:'skills', label:'Skills Inventory' }, { id:'incentives', label:'Incentive Linking' }]}
            active={hrSub} onChange={setHrSub}
          />
          {hrSub === 'skills' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 mb-2">
                Skills are automatically added to an employee's digital profile when they pass a course. Unlinked skills can be manually verified and linked below.
              </div>
              {skillsInv.map(emp => (
                <div key={emp.employeeId} className="card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-[#006838]/10 flex items-center justify-center text-[#006838] font-extrabold text-xs">
                      {emp.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{emp.name}</div>
                      <div className="text-xs text-slate-400">{emp.role} · {emp.dept}</div>
                    </div>
                    {emp.promotionEligible && (
                      <span className="ml-auto text-[10px] font-bold bg-green-50 text-[#006838] border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <GraduationCap size={9}/>Promotion Eligible
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {emp.skills.map((s,i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-slate-700">{s.skill}</span>
                          <span className="text-[10px] text-slate-400 ml-2">L{s.level} · {s.source} · {s.date}</span>
                        </div>
                        {s.linked
                          ? <span className="text-[10px] text-[#006838] font-bold flex items-center gap-0.5"><CheckCircle2 size={9}/>Linked to Profile</span>
                          : <button onClick={() => linkSkill(emp.employeeId, s.skill)}
                              className="flex items-center gap-1 text-[10px] font-bold text-blue-700 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50">
                              <Plus size={9}/>Link to Profile
                            </button>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {hrSub === 'incentives' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700 mb-2">
                Connect course completion milestones to performance bonuses and promotion eligibility in the ERP/HR system.
              </div>
              {skillsInv.map(emp => (
                <div key={emp.employeeId} className="card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-[#006838]/10 flex items-center justify-center text-[#006838] font-extrabold text-xs">
                      {emp.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{emp.name}</div>
                      <div className="text-xs text-slate-400">{emp.role} · {emp.dept} · {emp.skills.length} skills recorded</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${
                      emp.promotionEligible ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <GraduationCap size={13} className={emp.promotionEligible?'text-[#006838]':'text-slate-400'}/>
                      <span className={`font-semibold ${emp.promotionEligible?'text-[#006838]':'text-slate-500'}`}>
                        Promotion Eligible
                      </span>
                      <button onClick={() => toggleIncentive(emp.employeeId,'promotionEligible')}
                        className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          emp.promotionEligible
                            ? 'text-red-600 border-red-200 hover:bg-red-50'
                            : 'text-[#006838] border-green-200 hover:bg-green-50'
                        }`}>
                        {emp.promotionEligible ? 'Revoke' : 'Approve'}
                      </button>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${
                      emp.bonusLinked ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <Gift size={13} className={emp.bonusLinked?'text-amber-600':'text-slate-400'}/>
                      <span className={`font-semibold ${emp.bonusLinked?'text-amber-700':'text-slate-500'}`}>
                        Performance Bonus Linked
                      </span>
                      <button onClick={() => toggleIncentive(emp.employeeId,'bonusLinked')}
                        className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          emp.bonusLinked
                            ? 'text-red-600 border-red-200 hover:bg-red-50'
                            : 'text-amber-700 border-amber-200 hover:bg-amber-50'
                        }`}>
                        {emp.bonusLinked ? 'Unlink' : 'Link Bonus'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 6. ROI ── */}
      {mainTab === 'roi' && (
        <div>
          <SubTabBar
            tabs={[{ id:'trainers', label:'Trainer Capacity' }, { id:'costs', label:'Cost per Graduate' }]}
            active={roiSub} onChange={setRoiSub}
          />
          {roiSub === 'trainers' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 mb-2">Trainer Utilisation</h3>
              {trainers.map(t => (
                <div key={t.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-sm font-bold text-slate-800">{t.name}</span>
                      <div className="text-xs text-slate-400 mt-0.5">{t.specialization}</div>
                    </div>
                    <div className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      t.utilisation >= 85 ? 'bg-red-50 text-red-700 border-red-200' :
                      t.utilisation >= 70 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            'bg-green-50 text-[#006838] border-green-200'
                    }`}>{t.utilisation}% utilised</div>
                  </div>
                  <div className="bg-slate-100 rounded-full h-2 mb-3">
                    <div className={`h-2 rounded-full ${t.utilisation>=85?'bg-red-500':t.utilisation>=70?'bg-amber-400':'bg-[#006838]'}`}
                      style={{width:`${t.utilisation}%`}}/>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    <span><span className="font-bold text-slate-700">{t.booked}</span> days booked</span>
                    <span><span className="font-bold text-slate-700">{t.available}</span> days available</span>
                    <span><span className="font-bold text-slate-700">{t.admin}</span> admin days</span>
                  </div>
                  {t.utilisation >= 80 && (
                    <button onClick={() => reassignLoad(t.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl hover:bg-amber-50">
                      <RefreshCw size={12}/>Reassign Load
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {roiSub === 'costs' && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">Cost per Graduate Analysis</h3>
              <div className="card overflow-x-auto mb-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50">
                      {['Course','Format','Enrolled','Trainer Cost','Total Cost','Cost / Graduate'].map(h=>(
                        <th key={h} className="text-left px-3 py-2 font-semibold text-slate-600 first:rounded-l-xl last:rounded-r-xl">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {costTable.map(c=>(
                      <tr key={c.id} className="border-t border-slate-50 hover:bg-slate-50/60 transition-colors">
                        <td className="px-3 py-2 font-semibold text-slate-700 max-w-[180px]">{c.title}</td>
                        <td className="px-3 py-2 text-slate-500">{c.format}</td>
                        <td className="px-3 py-2 text-slate-500">{c.enrolled}</td>
                        <td className="px-3 py-2 text-slate-500">₦{c.trainerCost.toLocaleString()}</td>
                        <td className="px-3 py-2 text-slate-500">₦{c.totalCost.toLocaleString()}</td>
                        <td className="px-3 py-2 font-bold text-[#006838]">₦{c.costPerGraduate.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card bg-slate-50">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={costTable.map(c=>({name:c.title.split(' ').slice(0,2).join(' '), cpg:c.costPerGraduate}))}>
                    <XAxis dataKey="name" tick={{fontSize:9}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>`₦${(v/1000).toFixed(0)}k`}/>
                    <Tooltip formatter={v=>`₦${Number(v).toLocaleString()}`} contentStyle={{fontSize:11}}/>
                    <Bar dataKey="cpg" fill="#006838" radius={[4,4,0,0]} name="Cost / Graduate"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 7. Social / Peer ── */}
      {mainTab === 'social' && (
        <div>
          <SubTabBar
            tabs={[{ id:'qa', label:'Ask an Expert' }, { id:'endorse', label:'Skill Endorsement' }]}
            active={socialSub} onChange={setSocialSub}
          />
          {socialSub === 'qa' && (
            <div>
              <div className="card mb-4">
                <h4 className="text-xs font-bold text-slate-700 mb-2">Post a Question</h4>
                <div className="flex items-center gap-2">
                  <input value={newQuestion} onChange={e=>setNewQuestion(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&postQuestion()}
                    placeholder="Ask the training team or a subject-matter expert…"
                    className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#006838]"/>
                  <button onClick={postQuestion}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#006838] px-3 py-2 rounded-xl hover:bg-[#005530]">
                    <Send size={12}/>Post
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {kb.map(k=>(
                  <div key={k.id} className="card">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {k.isKBArticle && <span className="text-[9px] font-bold bg-[#006838] text-white px-2 py-0.5 rounded-full">KB Article</span>}
                          <span className="text-sm font-semibold text-slate-800">{k.question}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Asked by {k.askedBy} · {k.datAsked}</div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 ml-3">
                        <ThumbsUp size={10}/>{k.endorsements}
                      </div>
                    </div>
                    {k.answer ? (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs text-slate-700 mb-2">
                        <span className="font-semibold text-[#006838]">{k.answeredBy}: </span>{k.answer}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-2">
                        <input value={answerDraft[k.id]||''} onChange={e=>setAnswerDraft(p=>({...p,[k.id]:e.target.value}))}
                          placeholder="Write an answer…"
                          className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-[#006838]"/>
                        <button onClick={() => kbAction(k.id,'answer')}
                          className="flex items-center gap-1 text-[10px] font-bold text-[#006838] border border-green-200 px-2 py-1.5 rounded-lg hover:bg-green-50">
                          <Send size={9}/>Answer
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {k.answer && !k.isKBArticle && (
                        <button onClick={() => kbAction(k.id,'kb')}
                          className="flex items-center gap-1 text-[10px] font-bold text-blue-700 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50">
                          <BookMarked size={9}/>Mark as KB Article
                        </button>
                      )}
                      <button onClick={() => kbAction(k.id,'endorse')}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-600 border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50 ml-auto">
                        <ThumbsUp size={9}/>Endorse ({k.endorsements})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {socialSub === 'endorse' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 mb-2">Peer & Manager Skill Endorsements</h3>
              {gaps.filter(g=>g.status!=='open').map(g=>(
                <div key={g.id} className="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-800">{g.competency}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{g.role} · {g.dept}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={g.status}/>
                      {g.status === 'resolved' && (
                        <button onClick={() => setGaps(prev=>prev.map(x=>x.id===g.id?{...x}:x))}
                          className="flex items-center gap-1 text-[10px] font-bold text-[#006838] border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50">
                          <UserCheck size={10}/>Endorse Skill
                        </button>
                      )}
                      {g.status === 'assigned' && (
                        <button
                          className="flex items-center gap-1 text-[10px] font-bold text-amber-700 border border-amber-200 px-2 py-1 rounded-lg hover:bg-amber-50">
                          <Bell size={10}/>Request Endorsement
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
