import { useState } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import {
  MANDE_KPIS, MANDE_TRACKED_PROJECTS, MANDE_APPROVAL_REQUESTS,
  MANDE_FIELD_VISITS, COMPLIANCE_CHECKS, STRATEGIC_OBJECTIVES,
  EVALUATION_REPORTS, PREDICTIVE_ALERTS,
} from '../data/mock'
import {
  Target, ClipboardCheck, MapPin, FileCheck, CheckCircle2,
  AlertTriangle, Clock, TrendingDown, ChevronDown, ChevronRight,
  Plus, Star, RefreshCw, X, Database, Copy, Send, Download, BookOpen,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts'

const statusStyle = {
  'on-track': 'bg-green-50 text-[#006838] border-green-200',
  'at-risk':  'bg-amber-50 text-amber-700 border-amber-200',
  'delayed':  'bg-red-50 text-red-700 border-red-200',
  'pending':  'bg-amber-50 text-amber-700 border-amber-200',
  'approved': 'bg-green-50 text-[#006838] border-green-200',
  'returned': 'bg-red-50 text-red-700 border-red-200',
  'planned':  'bg-blue-50 text-blue-700 border-blue-200',
  'completed':'bg-slate-50 text-slate-500 border-slate-200',
  'improving':'bg-teal-50 text-teal-700 border-teal-200',
  'in-progress':'bg-blue-50 text-blue-700 border-blue-200',
  'critical':'bg-red-50 text-red-700 border-red-200',
  'warning':'bg-amber-50 text-amber-700 border-amber-200',
  'Satisfactory':'bg-green-50 text-[#006838] border-green-200',
  'Highly satisfactory':'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Moderately satisfactory':'bg-amber-50 text-amber-700 border-amber-200',
}

function Pill({ label }) {
  const cls = statusStyle[label] ?? 'bg-slate-50 text-slate-500 border-slate-200'
  return (
    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${cls}`}>{label}</span>
  )
}

function ProgressBar({ value, target = 100, color = '#006838' }) {
  const pct = Math.min((value / target) * 100, 100)
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}

// ── Utilities ─────────────────────────────────────────────────────
function useToast() {
  const [msg, setMsg] = useState(null)
  function flash(m) { setMsg(m); setTimeout(() => setMsg(null), 3500) }
  return [msg, () => setMsg(null), flash]
}
function Toast({ msg, clear }) {
  if (!msg) return null
  return (
    <div className="fixed bottom-6 right-6 z-[99] bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2">
      <CheckCircle2 size={13} className="text-green-400" />{msg}
      <button onClick={clear} className="ml-1 text-slate-400 hover:text-white"><X size={11} /></button>
    </div>
  )
}
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[98] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={15} /></button>
        </div>
        <div className="px-5 py-4 space-y-3">{children}</div>
      </div>
    </div>
  )
}

// ── DB Schema ─────────────────────────────────────────────────────
const MANDE_DB_SCHEMA = [
  {
    table: 'mande_field_visits',
    columns: [
      { column:'id',          type:'uuid',          constraints:'PK, DEFAULT gen_random_uuid()' },
      { column:'visit_ref',   type:'varchar(20)',   constraints:'UNIQUE, NOT NULL' },
      { column:'site',        type:'varchar(100)',  constraints:'NOT NULL' },
      { column:'purpose',     type:'text',          constraints:'NOT NULL' },
      { column:'officer_id',  type:'uuid',          constraints:'FK → users.id' },
      { column:'visit_date',  type:'date',          constraints:'NOT NULL' },
      { column:'status',      type:'varchar(20)',   constraints:"CHECK ('planned','approved','completed','cancelled')" },
      { column:'findings',    type:'text',          constraints:'NULL' },
      { column:'created_at',  type:'timestamptz',   constraints:'DEFAULT now()' },
    ],
    seedRows: [
      { visit_ref:'FV-2026-08', site:'Kaduna RTC',      purpose:'Q1 data validation',             officer:'M&E Officer I', visit_date:'2026-04-14', status:'planned'   },
      { visit_ref:'FV-2026-07', site:'Afam RTC — Rivers',purpose:'Safety indicator audit',        officer:'M&E Analyst',   visit_date:'2026-04-09', status:'approved'  },
      { visit_ref:'FV-2026-06', site:'Lagos — Ijora',   purpose:'Women in Power cohort 2 assess', officer:'M&E Analyst',   visit_date:'2026-04-03', status:'completed' },
    ],
  },
  {
    table: 'mande_kpi_targets',
    columns: [
      { column:'id',           type:'uuid',          constraints:'PK, DEFAULT gen_random_uuid()' },
      { column:'kpi_code',     type:'varchar(20)',   constraints:'UNIQUE, NOT NULL' },
      { column:'label',        type:'varchar(150)',  constraints:'NOT NULL' },
      { column:'target_value', type:'numeric(12,2)', constraints:'NOT NULL' },
      { column:'unit',         type:'varchar(20)',   constraints:"DEFAULT ''" },
      { column:'period',       type:'varchar(20)',   constraints:"DEFAULT 'annual'" },
      { column:'created_at',   type:'timestamptz',   constraints:'DEFAULT now()' },
    ],
    seedRows: [
      { kpi_code:'KPI-01', label:'Annual trainees (cumulative)',     target_value:15000, unit:'',  period:'annual' },
      { kpi_code:'KPI-02', label:'RTC Utilisation Rate',            target_value:85,    unit:'%', period:'annual' },
      { kpi_code:'KPI-03', label:'Compliance audits closed',        target_value:14,    unit:'',  period:'annual' },
    ],
  },
  {
    table: 'mande_kpi_actuals',
    columns: [
      { column:'id',             type:'uuid',          constraints:'PK, DEFAULT gen_random_uuid()' },
      { column:'kpi_code',       type:'varchar(20)',   constraints:'FK → mande_kpi_targets.kpi_code' },
      { column:'actual_value',   type:'numeric(12,2)', constraints:'NOT NULL' },
      { column:'recorded_date',  type:'date',          constraints:'NOT NULL' },
      { column:'recorded_by',    type:'varchar(100)',  constraints:'NOT NULL' },
      { column:'source_system',  type:'varchar(100)',  constraints:'NULL' },
    ],
    seedRows: [
      { kpi_code:'KPI-01', actual_value:9300, recorded_date:'2026-04-07', recorded_by:'M&E Analyst', source_system:'Training MIS'        },
      { kpi_code:'KPI-02', actual_value:78,   recorded_date:'2026-04-07', recorded_by:'M&E Analyst', source_system:'Facilities Mgmt Log' },
      { kpi_code:'KPI-03', actual_value:12,   recorded_date:'2026-04-07', recorded_by:'M&E Officer', source_system:'Compliance Register'  },
    ],
  },
  {
    table: 'mande_approval_requests',
    columns: [
      { column:'id',           type:'uuid',          constraints:'PK, DEFAULT gen_random_uuid()' },
      { column:'request_ref',  type:'varchar(20)',   constraints:'UNIQUE, NOT NULL' },
      { column:'title',        type:'text',          constraints:'NOT NULL' },
      { column:'type',         type:'varchar(50)',   constraints:'NOT NULL' },
      { column:'submitted_by', type:'varchar(100)',  constraints:'NOT NULL' },
      { column:'status',       type:'varchar(20)',   constraints:"CHECK ('pending','approved','returned')" },
      { column:'submitted_at', type:'timestamptz',   constraints:'DEFAULT now()' },
      { column:'reviewed_by',  type:'varchar(100)',  constraints:'NULL' },
      { column:'reviewed_at',  type:'timestamptz',   constraints:'NULL' },
      { column:'return_notes', type:'text',          constraints:'NULL' },
    ],
    seedRows: [
      { request_ref:'ME-APV-22', title:'Q1 M&E Report — Director Endorsement',           type:'Report',      submitted_by:'M&E Analyst',  status:'pending',  reviewed_by:null },
      { request_ref:'ME-APV-21', title:'Update KPI targets — RTC utilisation 85→90%',    type:'KPI Revision',submitted_by:'M&E Analyst',  status:'pending',  reviewed_by:null },
      { request_ref:'ME-APV-20', title:'Field data collection plan — Northern RTCs',     type:'Data Plan',   submitted_by:'M&E Officer',  status:'approved', reviewed_by:'Director M&E' },
    ],
  },
  {
    table: 'mande_evaluation_reports',
    columns: [
      { column:'id',           type:'uuid',          constraints:'PK, DEFAULT gen_random_uuid()' },
      { column:'eval_ref',     type:'varchar(20)',   constraints:'UNIQUE, NOT NULL' },
      { column:'title',        type:'text',          constraints:'NOT NULL' },
      { column:'eval_type',    type:'varchar(50)',   constraints:'NOT NULL' },
      { column:'programme',    type:'varchar(150)',  constraints:'NOT NULL' },
      { column:'evaluator',    type:'varchar(100)',  constraints:'NOT NULL' },
      { column:'eval_date',    type:'varchar(20)',   constraints:'NOT NULL' },
      { column:'status',       type:'varchar(30)',   constraints:"CHECK ('planned','in-progress','completed')" },
      { column:'rating',       type:'varchar(50)',   constraints:'NULL' },
      { column:'findings',     type:'jsonb',         constraints:'DEFAULT \'[]\'' },
    ],
    seedRows: [
      { eval_ref:'EV-2026-04', title:'Mid-term — Women in Power cohort 2',       eval_type:'Mid-term',       programme:'Women in Power',       evaluator:'M&E Analyst',        status:'completed',  rating:'Satisfactory'      },
      { eval_ref:'EV-2026-03', title:'End-of-project — Digital Skills pilot',    eval_type:'End-of-project', programme:'Digital Skills',       evaluator:'External consultant', status:'completed',  rating:'Highly satisfactory'},
      { eval_ref:'EV-2026-01', title:'Annual Performance Review — 2025',         eval_type:'Annual review',  programme:'All programmes',       evaluator:'Planning / M&E',     status:'in-progress',rating:null                },
    ],
  },
]

const MANDE_ROLE_MATRIX = {
  'M&E Analyst':    { 'Field Visits':['schedule','report'], 'Approvals':['submit'], 'KPI Dashboard':['view','update'], 'Evaluations':['conduct','write-up'], 'Compliance':['view'], 'DB Schema':['view'] },
  'M&E Officer':    { 'Field Visits':['conduct','report'],  'Approvals':['submit'], 'KPI Dashboard':['view'],          'Evaluations':['assist'],             'Compliance':['view'], 'DB Schema':['view'] },
  'M&E Director':   { 'Field Visits':['approve','view'],    'Approvals':['approve','return'], 'KPI Dashboard':['view','configure'], 'Evaluations':['approve','disseminate'], 'Compliance':['configure','view'], 'DB Schema':['view'] },
  'Planning Head':  { 'Field Visits':['view'],              'Approvals':['co-approve'],        'KPI Dashboard':['view','export'],    'Evaluations':['view'],               'Compliance':['view'], 'DB Schema':['view'] },
  'Director General':{ 'Field Visits':['view'],             'Approvals':['endorse'],           'KPI Dashboard':['view'],             'Evaluations':['receive-report'],      'Compliance':['view'], 'DB Schema':['view'] },
}

// ─────────────────────────────────────────────────────────────────
// ══ LESSONS LEARNED DATA & COMPONENT ══
const LESSONS_INIT = [
  { id: 'LL-2026-008', title: 'Community leader engagement is critical for project buy-in', source: 'Evaluation', tags: ['community', 'stakeholder'], approved: true, date: '15 Mar 2026', capturedBy: 'M&E Officer' },
  { id: 'LL-2026-007', title: 'Rainy season planning gap in infrastructure projects', source: 'Site Visit', tags: ['infrastructure', 'scheduling'], approved: true, date: '10 Feb 2026', capturedBy: 'Field Monitor' },
  { id: 'LL-2026-006', title: 'Online pre-training assessments improve completion rates by 12%', source: 'Quarterly Review', tags: ['training', 'digital'], approved: false, date: '01 Apr 2026', capturedBy: 'Research Officer' },
]
const RECOMMENDATIONS_INIT = [
  { id: 'REC-2026-012', text: 'Involve community leaders from project design stage', source: 'Mid-term eval — Women in Power', priority: 'high', responsible: 'Project Director', dueDate: '30 Jun 2026', status: 'in-progress', lessonRef: 'LL-2026-008' },
  { id: 'REC-2026-011', text: 'Build rainy season buffer into all infrastructure project timelines', source: 'Site Visit Report FV-2026-06', priority: 'medium', responsible: 'Admin Manager', dueDate: '30 Apr 2026', status: 'pending', lessonRef: 'LL-2026-007' },
  { id: 'REC-2026-010', text: 'Deploy pre-assessment module in LMS for all new trainees', source: 'End-of-project evaluation EV-2026-03', priority: 'high', responsible: 'ICT Director', dueDate: '15 May 2026', status: 'completed', lessonRef: 'LL-2026-006' },
]

function LessonsTab({ flash }) {
  const [lessons, setLessons] = useState(LESSONS_INIT)
  const [recs, setRecs] = useState(RECOMMENDATIONS_INIT)
  const [showCapture, setShowCapture] = useState(false)
  const [showRecModal, setShowRecModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterSource, setFilterSource] = useState('all')
  const [form, setForm] = useState({ title: '', source: 'Evaluation', tags: '' })
  const [recForm, setRecForm] = useState({ text: '', source: '', priority: 'medium', responsible: '', dueDate: '' })

  const STATUS_ORDER = { pending: 0, 'in-progress': 1, completed: 2 }
  const PRIORITY_COLOR = { high: 'text-red-700 bg-red-50 border-red-200', medium: 'text-amber-700 bg-amber-50 border-amber-200', low: 'text-green-700 bg-green-50 border-green-200' }
  const STATUS_COLOR = { pending: 'text-slate-600 bg-slate-100', 'in-progress': 'text-blue-700 bg-blue-100', completed: 'text-green-700 bg-green-100' }

  const filtered = lessons.filter(l => {
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.tags.join(' ').includes(search.toLowerCase())
    const matchSource = filterSource === 'all' || l.source === filterSource
    return matchSearch && matchSource
  })

  const handleCapture = () => {
    if (!form.title) { flash('Lesson title is required.'); return }
    const id = `LL-2026-${String(lessons.length + 9).padStart(3, '0')}`
    setLessons(p => [{ id, title: form.title, source: form.source, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [], approved: false, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), capturedBy: 'Current User' }, ...p])
    flash(`Lesson ${id} captured. Pending M&E Head review.`); setShowCapture(false); setForm({ title: '', source: 'Evaluation', tags: '' })
  }

  const handleApprove = (id) => {
    setLessons(p => p.map(l => l.id === id ? { ...l, approved: true } : l))
    flash('Lesson approved and published to knowledge base.')
  }

  const handleAddRec = () => {
    if (!recForm.text || !recForm.responsible) { flash('Recommendation text and responsible party are required.'); return }
    const id = `REC-2026-${String(recs.length + 13).padStart(3, '0')}`
    setRecs(p => [{ id, ...recForm, status: 'pending', lessonRef: null }, ...p])
    flash(`Recommendation ${id} created.`); setShowRecModal(false); setRecForm({ text: '', source: '', priority: 'medium', responsible: '', dueDate: '' })
  }

  const handleStatusChange = (id, newStatus) => {
    setRecs(p => p.map(r => r.id === id ? { ...r, status: newStatus } : r))
    flash(`Recommendation ${id} status updated to ${newStatus}.`)
  }

  const handleGenerateReport = () => flash(`Annual Learning Report 2025–2026 generated. ${lessons.filter(l => l.approved).length} lessons, ${recs.filter(r => r.status === 'completed').length} recommendations implemented. Exporting PDF...`)

  return (
    <div className="space-y-5">
      {/* Actions bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-slate-500">{lessons.filter(l => l.approved).length} approved lessons &middot; {recs.filter(r => r.status !== 'completed').length} open recommendations</p>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm" onClick={handleGenerateReport}><Download size={14} /> Annual Report</button>
          <button className="btn-secondary text-sm" onClick={() => setShowRecModal(true)}><Plus size={14} /> Add Recommendation</button>
          <button className="btn-primary text-sm" onClick={() => setShowCapture(true)}><Plus size={14} /> Capture Lesson</button>
        </div>
      </div>

      {/* Capture Lesson Modal */}
      {showCapture && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Capture Lesson Learned</h3>
              <button onClick={() => setShowCapture(false)}><X size={16} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Lesson Title <span className="text-red-500">*</span></label><input className="np-input w-full text-sm mt-0.5" placeholder="e.g. Early stakeholder mapping prevents project delays" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Source</label><select className="np-input w-full text-sm mt-0.5" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}><option>Evaluation</option><option>Site Visit</option><option>Quarterly Review</option><option>Annual Review</option><option>External Audit</option></select></div>
              <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Tags (comma-separated)</label><input className="np-input w-full text-sm mt-0.5" placeholder="e.g. stakeholder, planning, training" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} /></div>
              <div className="flex justify-end gap-2"><button className="btn-secondary text-sm" onClick={() => setShowCapture(false)}>Cancel</button><button className="btn-primary text-sm" onClick={handleCapture}>Submit for Review</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Add Recommendation Modal */}
      {showRecModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Recommendation</h3>
              <button onClick={() => setShowRecModal(false)}><X size={16} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Recommendation <span className="text-red-500">*</span></label><textarea className="np-input w-full text-sm h-16 mt-0.5" placeholder="Describe the action to be taken..." value={recForm.text} onChange={e => setRecForm(p => ({ ...p, text: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Priority</label><select className="np-input w-full text-sm mt-0.5" value={recForm.priority} onChange={e => setRecForm(p => ({ ...p, priority: e.target.value }))}><option>high</option><option>medium</option><option>low</option></select></div>
                <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Due Date</label><input type="date" className="np-input w-full text-sm mt-0.5" value={recForm.dueDate} onChange={e => setRecForm(p => ({ ...p, dueDate: e.target.value }))} /></div>
              </div>
              <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Responsible Party <span className="text-red-500">*</span></label><input className="np-input w-full text-sm mt-0.5" placeholder="e.g. ICT Director" value={recForm.responsible} onChange={e => setRecForm(p => ({ ...p, responsible: e.target.value }))} /></div>
              <div><label className="text-[10px] font-semibold text-slate-500 uppercase">Source (report / visit ref)</label><input className="np-input w-full text-sm mt-0.5" placeholder="e.g. EV-2026-04" value={recForm.source} onChange={e => setRecForm(p => ({ ...p, source: e.target.value }))} /></div>
              <div className="flex justify-end gap-2"><button className="btn-secondary text-sm" onClick={() => setShowRecModal(false)}>Cancel</button><button className="btn-primary text-sm" onClick={handleAddRec}>Add Recommendation</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Knowledge Base — Lessons */}
      <div className="card">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p className="text-sm font-bold text-slate-800">Lessons Knowledge Base</p>
          <div className="flex gap-2 flex-wrap">
            <input className="np-input text-xs w-44" placeholder="Search lessons..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="np-input text-xs" value={filterSource} onChange={e => setFilterSource(e.target.value)}>
              <option value="all">All sources</option>
              <option>Evaluation</option><option>Site Visit</option><option>Quarterly Review</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map((l, i) => (
            <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  {l.approved ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Approved</span> : <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pending review</span>}
                  <span className="text-[10px] text-slate-400">{l.source} &middot; {l.date}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800">{l.title}</p>
                {l.tags.length > 0 && <div className="flex gap-1 mt-1 flex-wrap">{l.tags.map(tag => <span key={tag} className="text-[10px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-medium">{tag}</span>)}</div>}
              </div>
              <div className="flex-shrink-0">
                {!l.approved && <button className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-md font-semibold hover:bg-green-200" onClick={() => handleApprove(l.id)}>Approve</button>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-xs text-slate-400 italic">No lessons match the current filter.</p>}
        </div>
      </div>

      {/* Recommendations Tracker */}
      <div className="card">
        <p className="text-sm font-bold text-slate-800 mb-3">Recommendations Tracker</p>
        <div className="space-y-2">
          {recs.map((r, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_COLOR[r.priority] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>{r.priority}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[r.status] || 'bg-slate-100 text-slate-500'}`}>{r.status}</span>
                    <span className="text-[10px] text-slate-400">{r.id}</span>
                  </div>
                  <p className="text-xs text-slate-800">{r.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Responsible: <strong>{r.responsible}</strong> &middot; Due: {r.dueDate} &middot; Source: {r.source}</p>
                </div>
              </div>
              {r.status !== 'completed' && (
                <div className="flex gap-1.5">
                  {r.status === 'pending' && <button className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-semibold hover:bg-blue-200" onClick={() => handleStatusChange(r.id, 'in-progress')}>Mark In-Progress</button>}
                  {r.status === 'in-progress' && <button className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-md font-semibold hover:bg-green-200" onClick={() => handleStatusChange(r.id, 'completed')}>Mark Completed</button>}
                </div>
              )}
              {r.status === 'completed' && <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1"><CheckCircle2 size={10} /> Implementation verified by M&E Officer</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
export default function MandePage() {
  const [tab, setTab] = useState('kpis')
  const [expandedSO, setExpandedSO] = useState(null)
  const [expandedEval, setExpandedEval] = useState(null)

  // Local mutable state
  const [fieldVisits, setFieldVisits]   = useState(MANDE_FIELD_VISITS)
  const [approvals, setApprovals]       = useState(MANDE_APPROVAL_REQUESTS)
  const [compliance, setCompliance]     = useState(COMPLIANCE_CHECKS)

  const [toastMsg, clearToast, flash]   = useToast()

  // Field visit modal
  const [showVisitModal, setShowVisitModal] = useState(false)
  const [visitForm, setVisitForm] = useState({ site:'', purpose:'', officer:'', date:'' })

  // Return modal
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [returnTarget, setReturnTarget]       = useState(null)
  const [returnNote, setReturnNote]           = useState('')

  // DB schema state
  const [expandedTable, setExpandedTable] = useState(null)
  const [copiedTable, setCopiedTable]     = useState(null)

  function confirmVisit(id) {
    setFieldVisits(prev => prev.map(v =>
      v.id === id ? { ...v, status:'completed' } : v
    ))
    flash('Field visit confirmed as completed — findings report due within 5 working days')
  }

  function scheduleVisit() {
    if (!visitForm.site || !visitForm.date) return
    const newV = {
      id: `FV-${new Date().getFullYear()}-${String(fieldVisits.length + 9).padStart(2,'0')}`,
      site: visitForm.site, purpose: visitForm.purpose || 'M&E data collection',
      officer: visitForm.officer || 'M&E Officer', date: visitForm.date, status: 'planned',
    }
    setFieldVisits(prev => [...prev, newV])
    setVisitForm({ site:'', purpose:'', officer:'', date:'' })
    setShowVisitModal(false)
    flash(`Field visit to "${newV.site}" scheduled — officer notified`)
  }

  function approveRequest(id) {
    setApprovals(prev => prev.map(a =>
      a.id === id ? { ...a, status:'approved' } : a
    ))
    flash('Request approved — submitter notified and document processed')
  }

  function openReturnModal(id) {
    setReturnTarget(id)
    setReturnNote('')
    setShowReturnModal(true)
  }
  function returnRequest() {
    setApprovals(prev => prev.map(a =>
      a.id === returnTarget ? { ...a, status:'returned' } : a
    ))
    setShowReturnModal(false)
    setReturnTarget(null)
    flash('Request returned with comments — submitter notified to revise and resubmit')
  }

  function scheduleAudit(standard) {
    flash(`Audit scheduled for "${standard}" — calendar invite sent to compliance team`)
  }

  function copySQL(t) {
    const sql = t.seedRows.map(row => `INSERT INTO ${t.table} VALUES (${Object.values(row).map(v => v === null ? 'NULL' : `'${v}'`).join(', ')});`).join('\n')
    navigator.clipboard?.writeText(sql).catch(() => {})
    setCopiedTable(t.table)
    setTimeout(() => setCopiedTable(null), 2000)
  }

  const TABS = [
    { id:'kpis',       label:'KPI Dashboard',        icon: Target        },
    { id:'objectives', label:'Strategic Objectives',  icon: TrendingDown  },
    { id:'field',      label:'Field Visits',          icon: MapPin        },
    { id:'approvals',  label:'Approval Requests',     icon: FileCheck     },
    { id:'evaluations',label:'Evaluations',           icon: Star          },
    { id:'compliance', label:'Compliance',            icon: ClipboardCheck},
    { id:'lessons',    label:'Lessons Learned',       icon: BookOpen      },
    { id:'schema',     label:'Roles & Schema',        icon: Database      },
  ]

  const chartData = MANDE_TRACKED_PROJECTS.map(p => ({
    name: p.name.split(' ').slice(0, 3).join(' '),
    current:  p.current,
    baseline: p.baseline,
  }))

  return (
    <div className="animate-fade-up">
      <Toast msg={toastMsg} clear={clearToast} />

      {/* Schedule Visit Modal */}
      {showVisitModal && (
        <Modal title="Schedule Field Visit" onClose={() => setShowVisitModal(false)}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Site / RTC <span className="text-red-500">*</span></label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="e.g. Kano RTC" value={visitForm.site} onChange={e=>setVisitForm(f=>({...f,site:e.target.value}))} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Purpose</label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="e.g. Q2 indicator data validation" value={visitForm.purpose} onChange={e=>setVisitForm(f=>({...f,purpose:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Officer</label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="M&E Officer" value={visitForm.officer} onChange={e=>setVisitForm(f=>({...f,officer:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input type="date" className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                value={visitForm.date} onChange={e=>setVisitForm(f=>({...f,date:e.target.value}))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowVisitModal(false)} className="text-xs text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={scheduleVisit} disabled={!visitForm.site || !visitForm.date}
              className="text-xs font-bold bg-[#006838] text-white px-4 py-2 rounded-xl hover:bg-[#005530] disabled:opacity-40">Schedule Visit</button>
          </div>
        </Modal>
      )}

      {/* Return modal */}
      {showReturnModal && (
        <Modal title="Return with Comments" onClose={() => setShowReturnModal(false)}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Return Note <span className="text-red-500">*</span></label>
            <textarea rows={3} className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838] resize-none"
              placeholder="Describe what needs to be revised..." value={returnNote} onChange={e=>setReturnNote(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowReturnModal(false)} className="text-xs text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={returnRequest} disabled={!returnNote.trim()}
              className="text-xs font-bold bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 disabled:opacity-40">Return Request</button>
          </div>
        </Modal>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Monitoring & Evaluation</h1>
            <p className="text-sm text-slate-400">KPI tracking · Field visits · Strategic objectives · Compliance · Evaluations</p>
          </div>
        </div>
        <button onClick={() => setShowVisitModal(true)} className="flex items-center gap-1.5 text-xs font-bold bg-[#006838] text-white px-3 py-1.5 rounded-xl hover:bg-[#005530] transition-colors">
          <Plus size={13} />New Field Visit
        </button>
      </div>

      {/* Predictive alert strip */}
      {PREDICTIVE_ALERTS.filter(a => a.severity === 'critical').length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-red-800 mb-0.5">Predictive Alert — Action Required</p>
            {PREDICTIVE_ALERTS.filter(a => a.severity === 'critical').map((a, i) => (
              <p key={i} className="text-xs text-red-700">
                <strong>{a.kpi}:</strong> {a.predictedOutcome} — {a.recommendation}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* KPI summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {MANDE_KPIS.map((k, i) => (
          <div key={i} className="stat-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-[#006838] flex items-center justify-center flex-shrink-0">
              <Target size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl font-extrabold text-slate-900">{k.value}</div>
              <div className="text-xs text-slate-400 font-medium truncate">{k.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Target: {k.target}{k.unit}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id
                ? 'bg-[#006838] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 bg-white border border-slate-100 hover:bg-slate-50'
            }`}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* ══ KPI DASHBOARD ══ */}
      {tab === 'kpis' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card">
              <p className="text-sm font-bold text-slate-800 mb-4">Programme indicator progress</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill:"#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="baseline" fill="#e2e8f0" name="Baseline" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="current"  fill="#006838" name="Current"  radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <p className="text-sm font-bold text-slate-800 mb-4">Strategic objectives progress</p>
              <div className="space-y-3">
                {STRATEGIC_OBJECTIVES.map((so, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700 truncate flex-1 mr-3">{so.goal}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-bold text-slate-800">{so.progress}%</span>
                        <Pill label={so.status} />
                      </div>
                    </div>
                    <ProgressBar value={so.progress}
                      color={so.status==='on-track'?'#006838':so.status==='at-risk'?'#f59e0b':'#ef4444'} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Predictive alerts panel */}
          <div className="card">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <AlertTriangle size={13} className="text-amber-500" />Predictive Alerts
            </h4>
            <div className="space-y-3">
              {PREDICTIVE_ALERTS.map((a, i) => (
                <div key={i} className={`rounded-xl border px-4 py-3 ${a.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Pill label={a.severity} />
                    <span className="text-xs font-bold text-slate-800">{a.kpi}</span>
                  </div>
                  <p className="text-xs text-slate-600">{a.predictedOutcome}</p>
                  <p className="text-[11px] text-slate-500 mt-1"><strong>Lead indicator:</strong> {a.leadIndicator}</p>
                  <p className="text-[11px] text-[#006838] font-semibold mt-1"><strong>Recommended action:</strong> {a.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ STRATEGIC OBJECTIVES ══ */}
      {tab === 'objectives' && (
        <div className="space-y-3">
          {STRATEGIC_OBJECTIVES.map((so, i) => (
            <div key={i} className="card">
              <button className="w-full flex items-start justify-between"
                onClick={() => setExpandedSO(expandedSO === so.id ? null : so.id)}>
                <div className="text-left flex-1 mr-3">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-[10px] text-slate-400">{so.id}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">{so.pillar}</span>
                    <Pill label={so.status} />
                  </div>
                  <p className="text-sm font-bold text-slate-800">{so.goal}</p>
                  <div className="text-[11px] text-slate-400 mt-0.5">Owner: {so.owner} · Deadline: {so.deadline}</div>
                  <div className="mt-2">
                    <ProgressBar value={so.progress}
                      color={so.status==='on-track'?'#006838':so.status==='at-risk'?'#f59e0b':'#ef4444'} />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">{so.progress}% complete</span>
                  </div>
                </div>
                {expandedSO === so.id
                  ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" />
                  : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
              </button>
              {expandedSO === so.id && (
                <div className="mt-3 pt-3 border-t border-slate-50 space-y-2">
                  {so.kpis.map((kpi, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">{kpi.label}</span>
                      <span className="text-xs font-bold text-slate-800">{kpi.current}{kpi.unit} / {kpi.target}{kpi.unit}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-slate-400 pt-1">Data source: {so.dataSource}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══ FIELD VISITS ══ */}
      {tab === 'field' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-400">{fieldVisits.length} visits · Scheduled and completed M&amp;E field visits.</p>
            <button onClick={() => setShowVisitModal(true)} className="flex items-center gap-1.5 text-xs font-bold bg-[#006838] text-white px-3 py-1.5 rounded-xl hover:bg-[#005530] transition-colors">
              <Plus size={12} />Schedule Visit
            </button>
          </div>
          {fieldVisits.map((v, i) => (
            <div key={i} className="card flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-[#006838] flex items-center justify-center flex-shrink-0">
                <MapPin size={16} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-[10px] text-slate-400">{v.id}</span>
                  <Pill label={v.status} />
                </div>
                <p className="text-sm font-bold text-slate-800">{v.site}</p>
                <p className="text-xs text-slate-500 mt-0.5">{v.purpose}</p>
                <p className="text-[11px] text-slate-400 mt-1">Officer: {v.officer} · Date: {v.date}</p>
              </div>
              {v.status !== 'completed' && (
                <button onClick={() => confirmVisit(v.id)} className="text-xs text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 font-semibold flex-shrink-0 transition-colors">
                  <CheckCircle2 size={11} />Confirm
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══ APPROVAL REQUESTS ══ */}
      {tab === 'approvals' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 mb-1">M&amp;E documents and KPI revisions requiring director sign-off.</p>
          {approvals.map((a, i) => (
            <div key={i} className="card flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <FileCheck size={16} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-[10px] text-slate-400">{a.id}</span>
                  <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-medium">{a.type}</span>
                  <Pill label={a.status} />
                </div>
                <p className="text-sm font-bold text-slate-800">{a.title}</p>
                <p className="text-[11px] text-slate-400 mt-1">Submitted by: {a.submittedBy} · {a.date}</p>
              </div>
              {a.status === 'pending' && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => approveRequest(a.id)} className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 transition-colors">Approve</button>
                  <button onClick={() => openReturnModal(a.id)} className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 transition-colors">Return</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══ EVALUATIONS ══ */}
      {tab === 'evaluations' && (
        <div className="space-y-3">
          {EVALUATION_REPORTS.map((ev, i) => (
            <div key={i} className="card">
              <button className="w-full flex items-start justify-between"
                onClick={() => setExpandedEval(expandedEval === ev.id ? null : ev.id)}>
                <div className="text-left flex-1 mr-3">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-[10px] text-slate-400">{ev.id}</span>
                    <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{ev.type}</span>
                    <Pill label={ev.status} />
                    {ev.rating !== '—' && <Pill label={ev.rating} />}
                  </div>
                  <p className="text-sm font-bold text-slate-800">{ev.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Evaluator: {ev.evaluator} · {ev.date}</p>
                </div>
                {expandedEval === ev.id
                  ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                  : <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />}
              </button>
              {expandedEval === ev.id && ev.findings.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Key Findings</p>
                  <ul className="space-y-1">
                    {ev.findings.map((f, j) => (
                      <li key={j} className="text-xs text-slate-600 flex gap-2">
                        <span className="text-[#006838] mt-0.5 flex-shrink-0">•</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══ COMPLIANCE ══ */}
      {tab === 'compliance' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 mb-1">Standards assurance and audit posture.</p>
          {compliance.map((c, i) => (
            <div key={i} className="card flex items-start gap-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                c.status === 'Green' ? 'bg-green-50 text-[#006838]' : 'bg-amber-50 text-amber-600'
              }`}>
                <ClipboardCheck size={16} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    c.status === 'Green' ? 'bg-green-50 text-[#006838] border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>{c.status}</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{c.standard}</p>
                <div className="text-[11px] text-slate-400 mt-1 space-x-3">
                  {c.lastAudit && <span>Last audit: {c.lastAudit}</span>}
                  {c.lastReview && <span>Last review: {c.lastReview}</span>}
                  <span>Next due: <span className="font-semibold text-slate-600">{c.nextDue}</span></span>
                </div>
                {c.scope && <p className="text-[11px] text-slate-500 mt-1">{c.scope}</p>}
              </div>
              <button onClick={() => scheduleAudit(c.standard)}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-xl border flex items-center gap-1 transition-colors ${
                  c.status === 'Green' ? 'text-[#006838] border-green-200 hover:bg-green-50' : 'text-amber-700 border-amber-200 hover:bg-amber-50'
                }`}>
                <RefreshCw size={10} />Schedule Audit
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ══ LESSONS LEARNED ══ */}
      {tab === 'lessons' && (
        <LessonsTab flash={flash} />
      )}

      {/* ══ ROLES & DB SCHEMA ══ */}
      {tab === 'schema' && (
        <div className="space-y-5">

          {/* Role Matrix */}
          <div className="card p-0 overflow-x-auto">
            <div className="px-5 py-4 border-b border-slate-50"><p className="text-sm font-bold text-slate-700">User Role & Permission Matrix</p></div>
            <table className="w-full text-xs">
              <thead><tr className="bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold text-slate-500 sticky left-0 bg-slate-50">Module</th>
                {Object.keys(MANDE_ROLE_MATRIX).map(r => <th key={r} className="px-4 py-3 text-center font-semibold text-slate-500 whitespace-nowrap">{r}</th>)}
              </tr></thead>
              <tbody>
                {Object.keys(MANDE_ROLE_MATRIX[Object.keys(MANDE_ROLE_MATRIX)[0]]).map(mod => (
                  <tr key={mod} className="border-t border-slate-50">
                    <td className="px-4 py-2.5 font-bold text-slate-700 sticky left-0 bg-white">{mod}</td>
                    {Object.keys(MANDE_ROLE_MATRIX).map(role => (
                      <td key={role} className="px-4 py-2.5 text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {MANDE_ROLE_MATRIX[role][mod]?.map((p, j) => (
                            <span key={j} className="text-[9px] font-semibold bg-green-50 text-[#006838] border border-green-200 px-1.5 py-0.5 rounded-md whitespace-nowrap">{p}</span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* DB Schema */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Database size={14} className="text-[#006838]" />
              <p className="text-sm font-bold text-slate-800">Database Schema</p>
              <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">{MANDE_DB_SCHEMA.length} tables</span>
            </div>
            <div className="space-y-3">
              {MANDE_DB_SCHEMA.map(t => (
                <div key={t.table} className="card">
                  <button className="w-full flex items-start justify-between" onClick={() => setExpandedTable(expandedTable === t.table ? null : t.table)}>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 font-mono">{t.table}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.columns.length} columns · {t.seedRows.length} seed row{t.seedRows.length !== 1 ? 's' : ''}</p>
                    </div>
                    {expandedTable === t.table ? <ChevronDown size={13} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight size={13} className="text-slate-400 flex-shrink-0 mt-1" />}
                  </button>
                  {expandedTable === t.table && (
                    <div className="mt-4 pt-4 border-t border-slate-50 space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Column Definitions</p>
                        <table className="w-full text-xs">
                          <thead><tr className="bg-slate-50">
                            {['Column','Type','Constraints'].map(h => <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500">{h}</th>)}
                          </tr></thead>
                          <tbody>
                            {t.columns.map((col, ci) => (
                              <tr key={ci} className="border-t border-slate-50">
                                <td className="px-3 py-2 font-mono text-[10px] text-[#006838] font-bold">{col.column}</td>
                                <td className="px-3 py-2 font-mono text-[10px] text-blue-700">{col.type}</td>
                                <td className="px-3 py-2 text-[10px] text-slate-500">{col.constraints}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sample Seed Data ({t.seedRows.length} rows)</p>
                          <button onClick={() => copySQL(t)} className="text-[9px] font-semibold text-slate-500 border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50 flex items-center gap-1 transition-colors">
                            <Copy size={9} />{copiedTable === t.table ? 'Copied!' : 'Copy INSERT SQL'}
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead><tr className="bg-amber-50">
                              {Object.keys(t.seedRows[0]).map(k => <th key={k} className="px-3 py-1.5 text-left font-semibold text-amber-800 text-[9px] font-mono whitespace-nowrap">{k}</th>)}
                            </tr></thead>
                            <tbody>
                              {t.seedRows.map((row, ri) => (
                                <tr key={ri} className="border-t border-amber-100">
                                  {Object.values(row).map((v, vi) => (
                                    <td key={vi} className="px-3 py-1.5 text-[9px] font-mono text-slate-600 whitespace-nowrap">{String(v)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
