import { useState } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import {
  BOARD_MEETINGS_DATA, BOARD_RESOLUTIONS_TRACKER,
  LEGAL_ENTITIES, COMPLIANCE_OBLIGATIONS, COMPLIANCE_LICENSES,
  CONTRACTS_CLM, LITIGATION_MATTERS,
  GOVERNANCE_KPIS_DATA, DATA_ROOMS,
} from '../data/mock'
import {
  Landmark, ScrollText, Building2, ShieldCheck, FileSignature,
  Gavel, BarChart3, FolderLock, Plus, ChevronDown, ChevronRight,
  AlertTriangle, CheckCircle2, Clock, FileText, Upload, Users,
  ExternalLink, TrendingUp, TrendingDown, Minus, Eye, Download,
  Calendar, XCircle, RefreshCw, TriangleAlert,
} from 'lucide-react'
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts'

// ── role matrix ──────────────────────────────────────────────────
export const ROLE_MATRIX = {
  'Board Secretary': {
    'Board Meetings':   ['create','edit','distribute','minutes'],
    'Resolutions':      ['view','update-status','notes'],
    'Entities':         ['view'],
    'Compliance':       ['view'],
    'Contracts':        ['view'],
    'Litigation':       ['view'],
    'Governance KPIs':  ['view','export'],
    'Data Rooms':       ['create','manage'],
  },
  'Legal Officer': {
    'Board Meetings':   ['view'],
    'Resolutions':      ['view'],
    'Entities':         ['create','edit','file'],
    'Compliance':       ['create','edit','upload-evidence','run-audit'],
    'Contracts':        ['create','draft','negotiate','route'],
    'Litigation':       ['create','edit','upload','log-costs'],
    'Governance KPIs':  ['view'],
    'Data Rooms':       ['create','manage'],
  },
  'Board Member': {
    'Board Meetings':   ['view-pack','vote'],
    'Resolutions':      ['view'],
    'Entities':         ['view'],
    'Compliance':       ['view-summary'],
    'Contracts':        ['approve'],
    'Litigation':       ['view-summary'],
    'Governance KPIs':  ['view','export'],
    'Data Rooms':       ['view'],
  },
  'HOD / Director': {
    'Board Meetings':   ['view'],
    'Resolutions':      ['view','update-status'],
    'Entities':         ['view'],
    'Compliance':       ['upload-evidence'],
    'Contracts':        ['request','approve'],
    'Litigation':       ['report'],
    'Governance KPIs':  ['view'],
    'Data Rooms':       ['view'],
  },
  'Finance / CFO': {
    'Board Meetings':   ['view'],
    'Resolutions':      ['view'],
    'Entities':         ['view'],
    'Compliance':       ['view'],
    'Contracts':        ['approve'],
    'Litigation':       ['view-costs','export'],
    'Governance KPIs':  ['view'],
    'Data Rooms':       ['view'],
  },
}

// ── integration points ────────────────────────────────────────────
export const INTEGRATION_POINTS = [
  { system:'DocuSign / Adobe Sign',   purpose:'E-signature execution for contracts & board resolutions', status:'connected' },
  { system:'CAC eFiling Portal',      purpose:'Annual return, beneficial ownership, and director/change filings', status:'configured' },
  { system:'FIRS TaxPro-Max',         purpose:'VAT, WHT, and CIT filing verification', status:'configured' },
  { system:'DMS (SharePoint)',         purpose:'Document repository, board packs, versioning', status:'connected' },
  { system:'Regulatory Calendar API', purpose:'NERC, NESREA, PenCom, ICPC deadline feeds', status:'partial' },
  { system:'MS Calendar / Google Cal',purpose:'Board meeting invitations, hearing reminders', status:'connected' },
  { system:'NERC E-portal',           purpose:'Accreditation renewal and regulatory submissions', status:'configured' },
]

// ── db schema (displayed in UI) ───────────────────────────────────
export const DB_SCHEMA_SUMMARY = [
  { table:'board_meetings',        cols:'id, title, date, type, status, quorum, attendees, pack_status, minutes_status' },
  { table:'agenda_items',          cols:'id, meeting_id, no, title, owner, doc_uploaded, status' },
  { table:'resolutions',           cols:'id, meeting_id, title, assignee, deadline, status, progress' },
  { table:'resolution_actions',    cols:'id, resolution_id, date, note, by' },
  { table:'legal_entities',        cols:'id, name, type, jurisdiction, reg_number, tax_id, incorporated, status' },
  { table:'entity_directors',      cols:'id, entity_id, name, role, appointed, expires, signing_limit' },
  { table:'compliance_obligations',cols:'id, obligation, regulation, dept, frequency, deadline, status, evidence_status' },
  { table:'compliance_licenses',   cols:'id, name, authority, number, issued, expires, days_left, status' },
  { table:'contracts',             cols:'id, title, type, counterparty, value, dept, stage, risk, effective, expires, approval_chain' },
  { table:'contract_obligations',  cols:'id, contract_id, obligation' },
  { table:'litigation_matters',    cols:'id, title, type, stage, severity, exposure, court, case_no, status' },
  { table:'litigation_timeline',   cols:'id, matter_id, date, event, by' },
  { table:'data_rooms',            cols:'id, name, purpose, created_by, created, expires, status, nda, watermark' },
  { table:'data_room_accessors',   cols:'id, room_id, name, permissions, last_access, docs_viewed' },
  { table:'governance_kpis',       cols:'id, metric, value, target, unit, period, trend, status' },
]

// ── shared helpers ────────────────────────────────────────────────
const STATUS_PILL = {
  'scheduled':        'bg-blue-50 text-blue-700 border-blue-200',
  'completed':        'bg-slate-50 text-slate-500 border-slate-200',
  'in-progress':      'bg-blue-50 text-blue-700 border-blue-200',
  'overdue':          'bg-red-50 text-red-700 border-red-200',
  'pending-approval': 'bg-amber-50 text-amber-700 border-amber-200',
  'not-started':      'bg-slate-50 text-slate-400 border-slate-200',
  'approved':         'bg-green-50 text-[#006838] border-green-200',
  'active':           'bg-green-50 text-[#006838] border-green-200',
  'expired':          'bg-red-50 text-red-700 border-red-200',
  'expiring-soon':    'bg-amber-50 text-amber-700 border-amber-200',
  'upcoming':         'bg-blue-50 text-blue-700 border-blue-200',
  'compliant':        'bg-green-50 text-[#006838] border-green-200',
  'partial':          'bg-amber-50 text-amber-700 border-amber-200',
  'non-compliant':    'bg-red-50 text-red-700 border-red-200',
  'open':             'bg-amber-50 text-amber-700 border-amber-200',
  'negotiation':      'bg-purple-50 text-purple-700 border-purple-200',
  'approval':         'bg-amber-50 text-amber-700 border-amber-200',
  'expiring':         'bg-amber-50 text-amber-700 border-amber-200',
  'litigation':       'bg-red-50 text-red-700 border-red-200',
  'pre-litigation':   'bg-amber-50 text-amber-700 border-amber-200',
  'resolved':         'bg-slate-50 text-slate-500 border-slate-200',
  'on-track':         'bg-green-50 text-[#006838] border-green-200',
  'at-risk':          'bg-amber-50 text-amber-700 border-amber-200',
  'watch':            'bg-blue-50 text-blue-700 border-blue-200',
  'info':             'bg-slate-50 text-slate-500 border-slate-200',
  'incomplete':       'bg-amber-50 text-amber-700 border-amber-200',
  'complete':         'bg-green-50 text-[#006838] border-green-200',
  'high':             'bg-red-50 text-red-700 border-red-200',
  'medium':           'bg-amber-50 text-amber-700 border-amber-200',
  'low':              'bg-green-50 text-[#006838] border-green-200',
  'awaiting-docs':    'bg-orange-50 text-orange-700 border-orange-200',
  'pending':          'bg-amber-50 text-amber-700 border-amber-200',
  'resolved-item':    'bg-slate-50 text-slate-400 border-slate-200',
}

function Pill({ label, override }) {
  const cls = override ?? STATUS_PILL[label] ?? 'bg-slate-50 text-slate-500 border-slate-200'
  return (
    <span className={`inline-flex text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${cls}`}>
      {label}
    </span>
  )
}

function ProgressBar({ value, color = '#006838', thin }) {
  const pct = Math.min(value, 100)
  const h = thin ? 'h-1.5' : 'h-2'
  return (
    <div className={`w-full bg-slate-100 rounded-full ${h}`}>
      <div className={`${h} rounded-full`} style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}

function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">{title}</h4>
      {action}
    </div>
  )
}

function AddBtn({ label, onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-bold bg-[#006838] text-white px-3 py-1.5 rounded-xl hover:bg-[#005530] transition-colors">
      <Plus size={12} />{label}
    </button>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 1 — BOARD MEETINGS
// ════════════════════════════════════════════════════════════════
function BoardMeetingsTab() {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Board meeting schedule · agenda management · pack compilation</p>
        <AddBtn label="Schedule Meeting" />
      </div>

      {BOARD_MEETINGS_DATA.map((m) => (
        <div key={m.id} className="card">
          <button className="w-full flex items-start justify-between"
            onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
            <div className="text-left flex-1 mr-3">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-[10px] text-slate-400">{m.id}</span>
                <Pill label={m.type.toLowerCase()} />
                <Pill label={m.status} />
                <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">Pack: <span className="font-semibold">{m.packStatus}</span></span>
              </div>
              <p className="text-sm font-bold text-slate-800">{m.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{m.date} at {m.time} · {m.location} · Quorum: {m.quorum}</p>
            </div>
            {expanded === m.id
              ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" />
              : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
          </button>

          {expanded === m.id && (
            <div className="mt-4 pt-4 border-t border-slate-50 space-y-4">
              {/* Agenda Items */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Agenda Items</p>
                <div className="space-y-1">
                  {m.agendaItems.map((item) => (
                    <div key={item.no} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{item.no}</span>
                      <span className="text-xs font-semibold text-slate-700 flex-1">{item.title}</span>
                      <span className="text-[10px] text-slate-400 hidden md:block">{item.owner}</span>
                      <div className="flex items-center gap-1.5">
                        {item.docUploaded
                          ? <CheckCircle2 size={12} className="text-[#006838]" />
                          : <Upload size={12} className="text-amber-500" />}
                        <Pill label={item.status === 'resolved' ? 'resolved-item' : item.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pack deadline */}
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <span>Pack deadline: <span className="font-bold text-slate-700">{m.packDeadline}</span></span>
                <span>Minutes: <span className="font-bold text-slate-700">{m.minutesStatus}</span></span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {m.status === 'scheduled' && (
                  <>
                    <button className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors">
                      <Upload size={11} />Upload Document
                    </button>
                    <button className="text-xs font-bold text-blue-700 border border-blue-200 px-3 py-1 rounded-xl hover:bg-blue-50 flex items-center gap-1 transition-colors">
                      <FileText size={11} />Compile Board Pack
                    </button>
                    <button className="text-xs font-bold text-indigo-700 border border-indigo-200 px-3 py-1 rounded-xl hover:bg-indigo-50 flex items-center gap-1 transition-colors">
                      <Calendar size={11} />Send Invitations
                    </button>
                  </>
                )}
                {m.status === 'completed' && m.minutesStatus !== 'approved' && (
                  <button className="text-xs font-bold text-amber-700 border border-amber-200 px-3 py-1 rounded-xl hover:bg-amber-50 flex items-center gap-1 transition-colors">
                    <ScrollText size={11} />Route Minutes for Approval
                  </button>
                )}
                {m.status === 'completed' && m.minutesStatus === 'approved' && (
                  <button className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 flex items-center gap-1 transition-colors">
                    <Download size={11} />Download Approved Minutes
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 2 — RESOLUTIONS TRACKER
// ════════════════════════════════════════════════════════════════
function ResolutionsTab() {
  const [expanded, setExpanded] = useState(null)

  const resChartData = [
    { name:'Completed',   value: BOARD_RESOLUTIONS_TRACKER.filter(r=>r.status==='completed').length,   fill:'#006838' },
    { name:'In Progress', value: BOARD_RESOLUTIONS_TRACKER.filter(r=>r.status==='in-progress').length, fill:'#3b82f6' },
    { name:'Overdue',     value: BOARD_RESOLUTIONS_TRACKER.filter(r=>r.status==='overdue').length,     fill:'#ef4444' },
  ]

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {resChartData.map((s, i) => (
          <div key={i} className="card text-center py-3">
            <div className="text-2xl font-extrabold" style={{ color: s.fill }}>{s.value}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">{s.name}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400">Resolution implementation tracking — follow-up report auto-generated at next meeting.</p>

      {BOARD_RESOLUTIONS_TRACKER.map((r) => (
        <div key={r.id} className={`card border-l-4 ${r.status==='completed'?'border-l-[#006838]':r.status==='overdue'?'border-l-red-400':'border-l-blue-400'}`}>
          <button className="w-full flex items-start justify-between"
            onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
            <div className="text-left flex-1 mr-3">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-[10px] text-slate-400">{r.ref}</span>
                <Pill label={r.status} />
              </div>
              <p className="text-sm font-bold text-slate-800">{r.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Assignee: {r.assignee} · Deadline: {r.deadline}</p>
              <div className="mt-2">
                <ProgressBar value={r.progress}
                  color={r.status==='completed'?'#006838':r.status==='overdue'?'#ef4444':'#3b82f6'} />
                <span className="text-[10px] text-slate-500 mt-0.5 block">{r.progress}% complete</span>
              </div>
            </div>
            {expanded === r.id
              ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" />
              : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
          </button>

          {expanded === r.id && (
            <div className="mt-3 pt-3 border-t border-slate-50 space-y-3">
              {r.notes && <p className="text-xs text-slate-600">{r.notes}</p>}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Action Log</p>
                <div className="space-y-1.5">
                  {r.actions.map((a, i) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <span className="text-slate-400 whitespace-nowrap flex-shrink-0">{a.date}</span>
                      <span className="text-slate-600">{a.note}</span>
                      <span className="text-slate-400 ml-auto flex-shrink-0">{a.by}</span>
                    </div>
                  ))}
                </div>
              </div>
              {r.status !== 'completed' && (
                <div className="flex gap-2 pt-1">
                  <button className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 transition-colors">+ Add Update</button>
                  {r.status !== 'overdue' && (
                    <button className="text-xs text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 font-semibold transition-colors">
                      <CheckCircle2 size={11} />Mark Complete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 3 — ENTITIES & SUBSIDIARIES
// ════════════════════════════════════════════════════════════════
function EntitiesTab() {
  const [expanded, setExpanded] = useState(null)

  const expiringDirectors = LEGAL_ENTITIES.flatMap(e =>
    e.directors.filter(d => d.daysToExpiry <= 90)
      .map(d => ({ ...d, entityName: e.name }))
  )

  return (
    <div className="space-y-4">
      {expiringDirectors.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex items-start gap-3">
          <TriangleAlert size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-800 mb-1">Director Mandate Alerts</p>
            {expiringDirectors.map((d, i) => (
              <p key={i} className="text-xs text-amber-700">
                <strong>{d.name}</strong> ({d.entityName}) — term {d.daysToExpiry < 0 ? <span className="font-bold text-red-700">expired {Math.abs(d.daysToExpiry)} days ago</span> : `expires in ${d.daysToExpiry} days`}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{LEGAL_ENTITIES.length} entities registered · Jurisdiction tracking · Mandate monitoring</p>
        <AddBtn label="Add Entity" />
      </div>

      {LEGAL_ENTITIES.map((ent) => (
        <div key={ent.id} className="card">
          <button className="w-full flex items-start justify-between"
            onClick={() => setExpanded(expanded === ent.id ? null : ent.id)}>
            <div className="text-left flex-1 mr-3">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-[10px] text-slate-400">{ent.id}</span>
                <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">{ent.type}</span>
                <Pill label={ent.status} />
              </div>
              <p className="text-sm font-bold text-slate-800">{ent.name}</p>
              <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap gap-3">
                <span>Reg: {ent.regNumber}</span>
                <span>Jurisdiction: {ent.jurisdiction}</span>
                <span>Inc: {ent.incorporated}</span>
              </div>
            </div>
            {expanded === ent.id
              ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" />
              : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
          </button>

          {expanded === ent.id && (
            <div className="mt-4 pt-4 border-t border-slate-50 space-y-4">
              {/* Directors */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Directors & Officers</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50">
                        {['Name','Role','Appointed','Expires','Signing Limit','Status'].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ent.directors.map((d, i) => (
                        <tr key={i} className="border-t border-slate-50">
                          <td className="px-3 py-2 font-semibold text-slate-800">{d.name}</td>
                          <td className="px-3 py-2 text-slate-500">{d.role}</td>
                          <td className="px-3 py-2 text-slate-400">{d.appointed}</td>
                          <td className="px-3 py-2 text-slate-400">{d.expires}</td>
                          <td className="px-3 py-2 text-slate-600">{d.signingLimit}</td>
                          <td className="px-3 py-2">
                            {d.daysToExpiry < 0
                              ? <Pill label="expired" />
                              : d.daysToExpiry <= 90
                                ? <Pill label="expiring-soon" />
                                : <Pill label="active" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Compliance calendar */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Jurisdiction Compliance Calendar</p>
                <div className="space-y-1.5">
                  {ent.complianceItems.map((ci, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                      <span className="text-slate-700 font-semibold">{ci.obligation}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">Due: {ci.due}</span>
                        <Pill label={ci.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors">
                  <Upload size={11} />Upload Filing
                </button>
                <button className="text-xs text-blue-700 border border-blue-200 px-3 py-1 rounded-xl hover:bg-blue-50 flex items-center gap-1 transition-colors font-semibold">
                  <RefreshCw size={11} />Reappointment Workflow
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 4 — COMPLIANCE & LICENCES
// ════════════════════════════════════════════════════════════════
function ComplianceTab() {
  const [view, setView] = useState('obligations')

  const compliantCount = COMPLIANCE_OBLIGATIONS.filter(o => o.status === 'compliant').length
  const totalCount = COMPLIANCE_OBLIGATIONS.length
  const score = Math.round((compliantCount / totalCount) * 100)

  const scoreData = [{ name:'Score', value: score, fill: score >= 90 ? '#006838' : score >= 75 ? '#f59e0b' : '#ef4444' }]

  return (
    <div className="space-y-4">
      {/* Score + mini chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4 col-span-1">
          <ResponsiveContainer width={80} height={80}>
            <RadialBarChart innerRadius={28} outerRadius={40} data={scoreData} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#f1f5f9' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{score}%</div>
            <div className="text-xs text-slate-400 font-medium">Overall Compliance Score</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Q1 2026 · {compliantCount}/{totalCount} obligations</div>
          </div>
        </div>

        {[
          { label:'Non-Compliant', value: COMPLIANCE_OBLIGATIONS.filter(o=>o.status==='non-compliant').length, color:'text-red-600 bg-red-50' },
          { label:'Partial / Open', value: COMPLIANCE_OBLIGATIONS.filter(o=>['partial','open'].includes(o.status)).length, color:'text-amber-600 bg-amber-50' },
        ].map((s, i) => (
          <div key={i} className={`card flex items-center gap-4 ${s.color} border-0`}>
            <div className="text-3xl font-extrabold">{s.value}</div>
            <div className="text-xs font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sub-view toggle */}
      <div className="flex items-center gap-1">
        {[{id:'obligations',label:'Obligations'},{id:'licences',label:'Licences'}].map(v => (
          <button key={v.id} onClick={() => setView(v.id)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${
              view === v.id ? 'bg-[#006838] text-white' : 'text-slate-500 bg-white border border-slate-100 hover:bg-slate-50'
            }`}>{v.label}</button>
        ))}
      </div>

      {view === 'obligations' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">Compliance Obligation Library</h3>
            <AddBtn label="Add Obligation" />
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50">
                {['ID','Obligation','Regulation','Dept','Frequency','Deadline','Status','Evidence'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPLIANCE_OBLIGATIONS.map((o, i) => (
                <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400">{o.id}</td>
                  <td className="px-4 py-2.5 font-semibold text-slate-800 max-w-[180px]">{o.obligation}</td>
                  <td className="px-4 py-2.5 text-slate-500 hidden lg:table-cell">{o.regulation}</td>
                  <td className="px-4 py-2.5 text-slate-500 hidden md:table-cell">{o.dept}</td>
                  <td className="px-4 py-2.5 text-slate-400 hidden lg:table-cell">{o.frequency}</td>
                  <td className="px-4 py-2.5 text-slate-600 font-semibold whitespace-nowrap">{o.deadline}</td>
                  <td className="px-4 py-2.5"><Pill label={o.status} /></td>
                  <td className="px-4 py-2.5">
                    {o.evidenceStatus
                      ? <span className="text-[10px] text-slate-500 capitalize">{o.evidenceStatus}</span>
                      : <button className="text-[10px] text-[#006838] font-bold hover:underline flex items-center gap-0.5"><Upload size={10} />Upload</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'licences' && (
        <div className="space-y-3">
          {COMPLIANCE_LICENSES.map((lic, i) => (
            <div key={i} className={`card border-l-4 ${
              lic.status === 'expired'        ? 'border-l-red-400' :
              lic.status === 'expiring-soon'  ? 'border-l-amber-400' :
                                               'border-l-[#006838]'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-[10px] text-slate-400">{lic.id}</span>
                    <Pill label={lic.status} />
                    {lic.daysLeft < 0
                      ? <span className="text-[10px] font-bold text-red-600">Expired {Math.abs(lic.daysLeft)}d ago</span>
                      : lic.daysLeft <= 90
                        ? <span className="text-[10px] font-bold text-amber-600">{lic.daysLeft} days left</span>
                        : null}
                  </div>
                  <p className="text-sm font-bold text-slate-800">{lic.name}</p>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap gap-3">
                    <span>Authority: {lic.authority}</span>
                    <span>No: {lic.number}</span>
                    <span>Expires: {lic.expires}</span>
                    <span>Owner: {lic.owner}</span>
                  </div>
                  {lic.renewalStatus && (
                    <p className="text-[11px] text-amber-700 font-semibold mt-1">Renewal: {lic.renewalStatus}</p>
                  )}
                </div>
                {(lic.status === 'expired' || lic.status === 'expiring-soon') && (
                  <button className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex-shrink-0 transition-colors flex items-center gap-1">
                    <RefreshCw size={11} />Initiate Renewal
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 5 — CONTRACT LIFECYCLE MANAGEMENT
// ════════════════════════════════════════════════════════════════
function ContractsCLMTab() {
  const [expanded, setExpanded] = useState(null)

  const stageOrder = ['negotiation','approval','active','expiring','expired']
  const sorted = [...CONTRACTS_CLM].sort((a, b) => stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage))

  const byRisk = [
    { name:'High',   count: CONTRACTS_CLM.filter(c=>c.risk==='high').length,   fill:'#ef4444' },
    { name:'Medium', count: CONTRACTS_CLM.filter(c=>c.risk==='medium').length, fill:'#f59e0b' },
    { name:'Low',    count: CONTRACTS_CLM.filter(c=>c.risk==='low').length,    fill:'#006838' },
  ]

  return (
    <div className="space-y-4">
      {/* Risk heatmap summary */}
      <div className="grid grid-cols-3 gap-3">
        {byRisk.map((r, i) => (
          <div key={i} className="card text-center py-3">
            <div className="text-2xl font-extrabold" style={{ color: r.fill }}>{r.count}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">{r.name} Risk</div>
          </div>
        ))}
      </div>

      {/* Renewal alerts */}
      {sorted.filter(c => c.renewalAlert).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex items-start gap-3">
          <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-800 mb-1">Renewal Alerts</p>
            {sorted.filter(c => c.renewalAlert).map((c, i) => (
              <p key={i} className="text-xs text-amber-700">
                <strong>{c.id}:</strong> {c.title} — {c.daysToExpiry !== null ? `expires in ${c.daysToExpiry} days` : 'renewal due'}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Full contract lifecycle: request → draft → negotiate → approve → sign → archive → renew</p>
        <AddBtn label="New Contract Request" />
      </div>

      {sorted.map((c) => (
        <div key={c.id} className={`card border-l-4 ${
          c.risk === 'high'   ? 'border-l-red-400' :
          c.risk === 'medium' ? 'border-l-amber-400' :
                               'border-l-[#006838]'
        }`}>
          <button className="w-full flex items-start justify-between"
            onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
            <div className="text-left flex-1 mr-3">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-[10px] text-slate-400">{c.id}</span>
                <Pill label={c.stage} />
                <Pill label={c.risk} />
                <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{c.type}</span>
              </div>
              <p className="text-sm font-bold text-slate-800">{c.title}</p>
              <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap gap-3">
                <span>Counterparty: {c.counterparty}</span>
                <span>Value: <span className="font-semibold text-slate-700">{c.value}</span></span>
                <span>Dept: {c.dept}</span>
                {c.daysToExpiry !== null && <span>Days to expiry: <span className={`font-semibold ${c.daysToExpiry<=30?'text-red-600':c.daysToExpiry<=90?'text-amber-600':'text-slate-700'}`}>{c.daysToExpiry}</span></span>}
              </div>
            </div>
            {expanded === c.id
              ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" />
              : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
          </button>

          {expanded === c.id && (
            <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
              {/* Approval chain */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Approval Chain</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {c.approvalChain.map((step, i) => (
                    <span key={i} className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${
                      step.includes('✓') ? 'bg-green-50 text-[#006838] border-green-200' :
                      step.includes('pending') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                  'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>{step}</span>
                  ))}
                </div>
              </div>

              {/* Obligations */}
              {c.obligations.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Key Obligations</p>
                  <ul className="space-y-1">
                    {c.obligations.map((ob, i) => (
                      <li key={i} className="text-xs text-slate-600 flex gap-2">
                        <span className="text-[#006838] flex-shrink-0">•</span>{ob}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-1">
                {c.stage === 'negotiation' && (
                  <button className="text-xs font-bold text-purple-700 border border-purple-200 px-3 py-1 rounded-xl hover:bg-purple-50 flex items-center gap-1 transition-colors">
                    <ScrollText size={11} />View Redlines
                  </button>
                )}
                {['negotiation','approval'].includes(c.stage) && (
                  <button className="text-xs font-bold text-amber-700 border border-amber-200 px-3 py-1 rounded-xl hover:bg-amber-50 flex items-center gap-1 transition-colors">
                    <FileSignature size={11} />Route for Approval
                  </button>
                )}
                {c.stage === 'approval' && (
                  <button className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors">
                    <FileSignature size={11} />Send for e-Signature
                  </button>
                )}
                {c.renewalAlert && (
                  <button className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors">
                    <RefreshCw size={11} />Initiate Renewal
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 6 — LITIGATION & DISPUTES
// ════════════════════════════════════════════════════════════════
function LitigationTab() {
  const [expanded, setExpanded] = useState(null)

  const totalExposure = LITIGATION_MATTERS
    .filter(m => m.status === 'active')
    .reduce((sum, m) => sum + parseFloat(m.exposure.replace(/[₦,]/g,'')), 0)

  const totalCosts = LITIGATION_MATTERS
    .reduce((sum, m) => sum + m.costsToDate, 0)

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'Active Matters', value: LITIGATION_MATTERS.filter(m=>m.status==='active').length, color:'text-red-600 bg-red-50' },
          { label:'Total Exposure', value:`₦${(totalExposure/1000000).toFixed(1)}M`, color:'text-amber-600 bg-amber-50' },
          { label:'Costs to Date',  value:`₦${(totalCosts/1000000).toFixed(2)}M`,    color:'text-slate-700 bg-slate-50' },
          { label:'Resolved',       value: LITIGATION_MATTERS.filter(m=>m.status==='resolved').length, color:'text-[#006838] bg-green-50' },
        ].map((s, i) => (
          <div key={i} className={`card flex items-center gap-3 ${s.color}`}>
            <div>
              <div className="text-xl font-extrabold">{s.value}</div>
              <div className="text-xs font-medium mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Dispute intake · timeline tracking · costs · precedent library</p>
        <AddBtn label="Report Dispute" />
      </div>

      {LITIGATION_MATTERS.map((m) => (
        <div key={m.id} className={`card border-l-4 ${
          m.severity === 'high'   ? 'border-l-red-400' :
          m.severity === 'medium' ? 'border-l-amber-400' :
                                   'border-l-slate-300'
        }`}>
          <button className="w-full flex items-start justify-between"
            onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
            <div className="text-left flex-1 mr-3">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-[10px] text-slate-400">{m.id}</span>
                <Pill label={m.stage} />
                <Pill label={m.severity} />
                <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{m.type}</span>
              </div>
              <p className="text-sm font-bold text-slate-800">{m.title}</p>
              <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap gap-3">
                <span>Exposure: <span className="font-semibold text-slate-700">{m.exposure}</span></span>
                {m.court && <span>Court: {m.court}</span>}
                {m.nextHearing && <span>Next hearing: <span className="font-semibold text-amber-700">{m.nextHearing}</span></span>}
                {m.responseDeadline && m.status === 'active' && (
                  <span>Response due: <span className="font-semibold text-red-600">{m.responseDeadline}</span></span>
                )}
              </div>
            </div>
            {expanded === m.id
              ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" />
              : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
          </button>

          {expanded === m.id && (
            <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
              <div className="text-xs text-slate-500 flex flex-wrap gap-4">
                <span>Assignee: <span className="font-semibold text-slate-700">{m.assignee}</span></span>
                {m.caseNo && <span>Case no: <span className="font-mono text-slate-700">{m.caseNo}</span></span>}
                <span>Costs to date: <span className="font-semibold text-slate-700">₦{m.costsToDate.toLocaleString()}</span></span>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Matter Timeline</p>
                <div className="space-y-2">
                  {m.timeline.map((ev, i) => (
                    <div key={i} className="flex gap-3 text-xs items-start">
                      <span className="text-slate-400 whitespace-nowrap flex-shrink-0 w-24">{ev.date}</span>
                      <span className="text-slate-600 flex-1">{ev.event}</span>
                      <span className="text-slate-400 flex-shrink-0">{ev.by}</span>
                    </div>
                  ))}
                </div>
              </div>

              {m.outcome && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                  <p className="text-[10px] font-bold text-[#006838] uppercase tracking-wide mb-0.5">Outcome</p>
                  <p className="text-xs text-slate-700">{m.outcome}</p>
                </div>
              )}

              {m.precedentNote && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
                  <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-0.5">Precedent Note</p>
                  <p className="text-xs text-slate-700">{m.precedentNote}</p>
                </div>
              )}

              {m.status === 'active' && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors">
                    <Plus size={11} />Log Update
                  </button>
                  <button className="text-xs text-blue-700 border border-blue-200 px-3 py-1 rounded-xl hover:bg-blue-50 flex items-center gap-1 font-semibold transition-colors">
                    <Upload size={11} />Upload Court Document
                  </button>
                  <button className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 flex items-center gap-1 transition-colors">
                    + Add Precedent Note
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 7 — GOVERNANCE KPI DASHBOARD
// ════════════════════════════════════════════════════════════════
function GovernanceKPIsTab() {
  const [drillItem, setDrillItem] = useState(null)

  const trendIcon = (t) => {
    if (t === 'improving') return <TrendingUp size={12} className="text-[#006838]" />
    if (t === 'declining') return <TrendingDown size={12} className="text-red-500" />
    return <Minus size={12} className="text-slate-400" />
  }

  const barData = GOVERNANCE_KPIS_DATA.filter(k => typeof k.value === 'number' && k.target).map(k => ({
    name: k.metric.length > 20 ? k.metric.slice(0, 20) + '…' : k.metric,
    value: k.value, target: k.target,
  }))

  return (
    <div className="space-y-5">
      {/* Bar chart — numeric KPIs */}
      {barData.length > 0 && (
        <div className="card">
          <p className="text-sm font-bold text-slate-800 mb-4">KPI vs Target (numeric indicators)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} layout="vertical" margin={{ left: 8 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 9, fill:'#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="target" fill="#e2e8f0" name="Target" radius={[0,4,4,0]} />
              <Bar dataKey="value"  fill="#006838" name="Actual" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Traffic-light KPI grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {GOVERNANCE_KPIS_DATA.map((k, i) => (
          <button key={i} onClick={() => setDrillItem(drillItem === i ? null : i)}
            className="card text-left hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Pill label={k.status} />
                  {trendIcon(k.trend)}
                </div>
                <div className="text-xl font-extrabold text-slate-900">{k.value}{k.unit}</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">{k.metric}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{k.period}{k.target ? ` · Target: ${k.target}${k.unit}` : ''}</div>
              </div>
              {drillItem === i ? <ChevronDown size={13} className="text-slate-300 flex-shrink-0 mt-1" /> : <ChevronRight size={13} className="text-slate-300 flex-shrink-0 mt-1" />}
            </div>
            {drillItem === i && (
              <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-600">{k.drill}</div>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button className="flex items-center gap-1.5 text-xs font-bold bg-[#006838] text-white px-3 py-1.5 rounded-xl hover:bg-[#005530] transition-colors">
          <FileText size={12} />Generate Governance Report
        </button>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 bg-white px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
          <Download size={12} />Export to PDF
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 8 — DATA ROOMS
// ════════════════════════════════════════════════════════════════
function DataRoomsTab() {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Secure document sharing · access-controlled · audit-trailed · auto-expiring</p>
        <AddBtn label="Create Data Room" />
      </div>

      {DATA_ROOMS.map((dr) => (
        <div key={dr.id} className="card">
          <button className="w-full flex items-start justify-between"
            onClick={() => setExpanded(expanded === dr.id ? null : dr.id)}>
            <div className="text-left flex-1 mr-3">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-[10px] text-slate-400">{dr.id}</span>
                <Pill label={dr.status} />
                {dr.nda && <span className="text-[10px] bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-full font-medium">NDA Required</span>}
                {dr.watermark && <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">Watermarked</span>}
              </div>
              <p className="text-sm font-bold text-slate-800">{dr.name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{dr.purpose}</p>
              <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-3">
                <span>Created: {dr.created}</span>
                <span>Expires: {dr.expires}</span>
                <span className={`font-semibold ${dr.daysLeft < 0 ? 'text-red-600' : dr.daysLeft <= 14 ? 'text-amber-600' : 'text-slate-500'}`}>
                  {dr.daysLeft < 0 ? `Expired ${Math.abs(dr.daysLeft)}d ago` : `${dr.daysLeft} days remaining`}
                </span>
                <span>Docs: {dr.docs}</span>
              </div>
            </div>
            {expanded === dr.id
              ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" />
              : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
          </button>

          {expanded === dr.id && (
            <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Accessor Activity Log</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    {['Accessor','Permissions','Last Access','Docs Viewed'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dr.accessors.map((a, i) => (
                    <tr key={i} className="border-t border-slate-50">
                      <td className="px-3 py-2 font-semibold text-slate-700">{a.name}</td>
                      <td className="px-3 py-2 text-slate-400">{a.permissions}</td>
                      <td className="px-3 py-2 text-slate-400">{a.lastAccess}</td>
                      <td className="px-3 py-2 font-bold text-slate-800">{a.docsViewed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {dr.status === 'active' && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors">
                    <Upload size={11} />Upload Document
                  </button>
                  <button className="text-xs text-blue-700 border border-blue-200 px-3 py-1 rounded-xl hover:bg-blue-50 flex items-center gap-1 font-semibold transition-colors">
                    <Users size={11} />Manage Access
                  </button>
                  <button className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 flex items-center gap-1 transition-colors">
                    <Eye size={11} />Full Audit Trail
                  </button>
                  <button className="text-xs text-red-600 border border-red-200 px-3 py-1 rounded-xl hover:bg-red-50 flex items-center gap-1 transition-colors">
                    <XCircle size={11} />Close Data Room
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Integration & Schema info panel */}
      <div className="mt-2">
        <div className="card">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">System Integrations</p>
          <div className="space-y-2">
            {INTEGRATION_POINTS.map((int, i) => (
              <div key={i} className="flex items-start justify-between gap-3 py-1 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-xs font-bold text-slate-700">{int.system}</p>
                  <p className="text-[10px] text-slate-400">{int.purpose}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                  int.status === 'connected'   ? 'bg-green-50 text-[#006838] border-green-200' :
                  int.status === 'configured'  ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>{int.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// ROLE MATRIX TAB
// ════════════════════════════════════════════════════════════════
function RoleMatrixTab() {
  const roles = Object.keys(ROLE_MATRIX)
  const modules = Object.keys(ROLE_MATRIX[roles[0]])

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">Permission matrix across all roles for the Legal & Board Secretariat module.</p>
      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-500 sticky left-0 bg-slate-50">Module</th>
              {roles.map(r => (
                <th key={r} className="px-4 py-3 text-center font-semibold text-slate-500 whitespace-nowrap">{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((mod, i) => (
              <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-2.5 font-bold text-slate-700 sticky left-0 bg-white">{mod}</td>
                {roles.map(role => (
                  <td key={role} className="px-4 py-2.5 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {ROLE_MATRIX[role][mod]?.map((perm, j) => (
                        <span key={j} className="text-[9px] font-semibold bg-green-50 text-[#006838] border border-green-200 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                          {perm}
                        </span>
                      ))}
                    </div>
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

// ════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════
const TABS = [
  { id:'meetings',    label:'Board Meetings',       icon: Landmark       },
  { id:'resolutions', label:'Resolutions',           icon: ScrollText     },
  { id:'entities',    label:'Entities',              icon: Building2      },
  { id:'compliance',  label:'Compliance & Licences', icon: ShieldCheck    },
  { id:'contracts',   label:'Contracts (CLM)',        icon: FileSignature  },
  { id:'litigation',  label:'Litigation',            icon: Gavel          },
  { id:'governance',  label:'Gov. KPIs',             icon: BarChart3      },
  { id:'datarooms',   label:'Data Rooms',            icon: FolderLock     },
  { id:'roles',       label:'Roles & Schema',        icon: Users          },
]

export default function LegalBoardPage() {
  const [tab, setTab] = useState('meetings')

  const expiringCount = COMPLIANCE_LICENSES.filter(l => ['expired','expiring-soon'].includes(l.status)).length
  const overdueRes    = BOARD_RESOLUTIONS_TRACKER.filter(r => r.status === 'overdue').length
  const activeLit     = LITIGATION_MATTERS.filter(m => m.status === 'active').length

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Legal &amp; Board Secretariat</h1>
            <p className="text-sm text-slate-400">Board meetings · Resolutions · Entities · Compliance · CLM · Litigation · Governance · Data rooms</p>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label:'Overdue Resolutions',   value: overdueRes,    icon: AlertTriangle,  bg:'bg-red-50',    color:'text-red-600'   },
          { label:'Active Litigation',      value: activeLit,     icon: Gavel,          bg:'bg-amber-50',  color:'text-amber-600' },
          { label:'Licence Alerts',         value: expiringCount, icon: ShieldCheck,    bg:'bg-amber-50',  color:'text-amber-600' },
          { label:'Contracts in Pipeline', value: CONTRACTS_CLM.filter(c=>['negotiation','approval'].includes(c.stage)).length, icon: FileSignature, bg:'bg-blue-50', color:'text-blue-600' },
        ].map((k, i) => (
          <div key={i} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${k.bg} ${k.color} flex items-center justify-center flex-shrink-0`}>
              <k.icon size={18} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{k.value}</div>
              <div className="text-xs text-slate-400 font-medium">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="flex items-center gap-1 mb-5 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              tab === t.id
                ? 'bg-[#006838] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 bg-white border border-slate-100 hover:bg-slate-50'
            }`}>
            <t.icon size={13} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'meetings'    && <BoardMeetingsTab />}
      {tab === 'resolutions' && <ResolutionsTab />}
      {tab === 'entities'    && <EntitiesTab />}
      {tab === 'compliance'  && <ComplianceTab />}
      {tab === 'contracts'   && <ContractsCLMTab />}
      {tab === 'litigation'  && <LitigationTab />}
      {tab === 'governance'  && <GovernanceKPIsTab />}
      {tab === 'datarooms'   && <DataRoomsTab />}
      {tab === 'roles'       && <RoleMatrixTab />}
    </div>
  )
}
