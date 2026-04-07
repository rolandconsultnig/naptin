import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NAPTIN_LOGO } from '../assets/images'
import {
  ScanLine, FileText, Search, TrendingDown, Users, Database,
  Plus, ChevronDown, ChevronRight, CheckCircle2, Clock,
  AlertTriangle, Download, Shield, Send, TriangleAlert,
  Megaphone, ClipboardList, X, ExternalLink, Copy,
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts'

// ── Role Matrix ────────────────────────────────────────────────
const ACTU_ROLE_MATRIX = {
  'ACTU Officer':     { 'Whistleblower':['log','assign-officer','update-log'], 'System Studies':['create','populate','send-dg'], 'Procurement Monitor':['log-obs','mark-resolved'], 'Ethics Scorecard':['populate'], 'Sensitization':['create','deliver'], 'DB Schema':['view'] },
  'ACTU Head':        { 'Whistleblower':['assign','escalate-icpc','verify-close'], 'System Studies':['create','approve','send-dg'], 'Procurement Monitor':['escalate-dg','configure-rules'], 'Ethics Scorecard':['chair-signoff','submit-icpc'], 'Sensitization':['approve','export'], 'DB Schema':['view'] },
  'Legal Adviser':    { 'Whistleblower':['advise','legal-review'], 'System Studies':['review'], 'Procurement Monitor':['advise'], 'Ethics Scorecard':['advise'], 'Sensitization':['review'], 'DB Schema':['view'] },
  'Director General': { 'Whistleblower':['see-dashboard'], 'System Studies':['receive-report','action'], 'Procurement Monitor':['receive-escalation','approve-intervention'], 'Ethics Scorecard':['see-summary'], 'Sensitization':['see-summary'], 'DB Schema':['view'] },
  'ICPC Liaison':     { 'Whistleblower':['icpc-interface','update-icpc-status'], 'System Studies':['share-findings'], 'Procurement Monitor':['view'], 'Ethics Scorecard':['submit-ecsc'], 'Sensitization':['view'], 'DB Schema':['view'] },
}

const ACTU_INTEGRATIONS = [
  { system:'Finance ERP',                  purpose:'Flag anomalous transactions for procurement monitor; auto-extract spend data for studies',status:'connected'  },
  { system:'BPP E-Procurement Portal',     purpose:'Cross-check tender awards vs. approved APP; detect split-contract patterns',            status:'configured' },
  { system:'HR / Staff Directory',         purpose:'Assign reported staff to ACTU case; route sensitization attendance to org chart',       status:'connected'  },
  { system:'ICPC ECSC Portal',             purpose:'Submit Ethics Compliance Scorecard data; receive national benchmarks',                  status:'partial'    },
  { system:'Document Management (DMS)',    purpose:'Secure evidence storage, investigation reports, ICPC referral dossiers',               status:'connected'  },
  { system:'SMS / Email Gateway',          purpose:'Anonymous case tracking updates; sensitization reminders to staff',                    status:'connected'  },
  { system:'Anti-Corruption Resource Portal', purpose:'Training materials, ICPC regulatory updates, policy templates',                    status:'configured' },
]

// ── DB Schema ─────────────────────────────────────────────────
const DB_SCHEMA = [
  {
    table: 'actu_reports',
    columns: [
      { column:'id',                        type:'uuid',        constraints:'PK, DEFAULT gen_random_uuid()' },
      { column:'ticket_id',                 type:'varchar(20)', constraints:'UNIQUE, NOT NULL' },
      { column:'category',                  type:'varchar(50)', constraints:'NOT NULL' },
      { column:'risk_score',               type:'varchar(20)', constraints:"CHECK ('Low','Medium','High','Critical')" },
      { column:'status',                    type:'varchar(30)', constraints:"CHECK ('new','under_investigation','referred_to_icpc','closed','unsubstantiated')" },
      { column:'assigned_officer',          type:'varchar(100)',constraints:'NULL' },
      { column:'submitted_at',              type:'timestamptz', constraints:'DEFAULT now()' },
      { column:'resolved_at',               type:'timestamptz', constraints:'NULL' },
    ],
    seedRows: [
      { id:'WB-2026-019', category:'Procurement Fraud', risk_score:'High', status:'under_investigation', assigned_officer:'Inv. Officer A', submitted_at:'2026-03-28 10:15:00+01' },
      { id:'WB-2026-018', category:'Bribery',           risk_score:'Critical', status:'referred_to_icpc', assigned_officer:'Inv. Officer B', submitted_at:'2026-03-12 08:44:00+01' },
      { id:'WB-2026-017', category:'Misappropriation',  risk_score:'Medium',  status:'closed',           assigned_officer:'Inv. Officer A', submitted_at:'2026-02-05 14:20:00+01' },
    ],
  },
  {
    table: 'actu_report_attachments',
    columns: [
      { column:'id',          type:'uuid',          constraints:'PK, DEFAULT gen_random_uuid()' },
      { column:'report_id',   type:'uuid',          constraints:'FK → actu_reports.id ON DELETE CASCADE' },
      { column:'file_name',   type:'varchar(255)',  constraints:'NOT NULL' },
      { column:'file_type',   type:'varchar(50)',   constraints:'NOT NULL' },
      { column:'storage_path',type:'text',          constraints:'NOT NULL (DMS path)' },
      { column:'uploaded_at', type:'timestamptz',   constraints:'DEFAULT now()' },
    ],
    seedRows: [
      { id:'…uuid…', report_id:'WB-2026-019', file_name:'payment_voucher_scan.pdf', file_type:'application/pdf', storage_path:'/dms/actu/WB-2026-019/payment_voucher_scan.pdf', uploaded_at:'2026-03-29 11:00:00+01' },
    ],
  },
  {
    table: 'actu_investigation_log',
    columns: [
      { column:'id',           type:'uuid',          constraints:'PK, DEFAULT gen_random_uuid()' },
      { column:'report_id',    type:'uuid',          constraints:'FK → actu_reports.id' },
      { column:'officer_id',   type:'uuid',          constraints:'FK → users.id' },
      { column:'action',       type:'text',          constraints:'NOT NULL' },
      { column:'logged_at',    type:'timestamptz',   constraints:'DEFAULT now()' },
    ],
    seedRows: [
      { id:'log-001', report_id:'WB-2026-019', officer:'Inv. Officer A', action:'Case assigned and initial review started',              logged_at:'2026-03-28 11:00:00+01' },
      { id:'log-002', report_id:'WB-2026-019', officer:'Inv. Officer A', action:'Finance ERP records retrieved — transaction flagged',    logged_at:'2026-03-30 09:30:00+01' },
      { id:'log-003', report_id:'WB-2026-019', officer:'Inv. Officer A', action:'Interview with procurement officer conducted',           logged_at:'2026-04-02 14:00:00+01' },
    ],
  },
  {
    table: 'actu_sla_config',
    columns: [
      { column:'id',           type:'uuid',          constraints:'PK, DEFAULT gen_random_uuid()' },
      { column:'risk_level',   type:'varchar(20)',   constraints:"CHECK ('Low','Medium','High','Critical')" },
      { column:'sla_days',     type:'integer',       constraints:'NOT NULL' },
      { column:'escalate_days',type:'integer',       constraints:'NOT NULL' },
      { column:'updated_at',   type:'timestamptz',   constraints:'DEFAULT now()' },
    ],
    seedRows: [
      { risk_level:'Critical', sla_days:15, escalate_days:7  },
      { risk_level:'High',     sla_days:30, escalate_days:14 },
      { risk_level:'Medium',   sla_days:60, escalate_days:30 },
      { risk_level:'Low',      sla_days:90, escalate_days:45 },
    ],
  },
  {
    table: 'actu_icpc_referrals',
    columns: [
      { column:'id',              type:'uuid',         constraints:'PK, DEFAULT gen_random_uuid()' },
      { column:'report_id',       type:'uuid',         constraints:'FK → actu_reports.id' },
      { column:'icpc_ref_number', type:'varchar(30)',  constraints:'UNIQUE' },
      { column:'referral_date',   type:'date',         constraints:'NOT NULL' },
      { column:'icpc_status',     type:'varchar(50)',  constraints:"DEFAULT 'received'" },
      { column:'next_review_date',type:'date',         constraints:'NULL' },
    ],
    seedRows: [
      { report_id:'WB-2026-018', icpc_ref_number:'ICPC-2026-441', referral_date:'2026-03-20', icpc_status:'under_investigation', next_review_date:'2026-05-15' },
    ],
  },
]

// ── Mock Data ─────────────────────────────────────────────────
const WHISTLEBLOWER_CASES_INIT = [
  {
    id:'WB-2026-019', category:'Procurement Fraud', riskScore:'High', status:'under_investigation',
    received:'28 Mar 2026', sla:'27 Apr 2026', assignedOfficer:'Inv. Officer A',
    icpcRef:null, icpcStatus:null,
    log:[
      { date:'28 Mar 2026 11:00', action:'Case assigned. Initial review started.' },
      { date:'30 Mar 2026 09:30', action:'Finance ERP records retrieved — suspicious PO split confirmed.' },
      { date:'02 Apr 2026 14:00', action:'Interview with procurement officer conducted.' },
    ],
  },
  {
    id:'WB-2026-018', category:'Bribery — Vendor Kickback', riskScore:'Critical', status:'referred_to_icpc',
    received:'12 Mar 2026', sla:'26 Mar 2026', assignedOfficer:'Inv. Officer B',
    icpcRef:'ICPC-2026-441', icpcStatus:'under_investigation',
    log:[
      { date:'12 Mar 2026 08:44', action:'Case received. Assigned to Inv. Officer B.' },
      { date:'15 Mar 2026 10:00', action:'Preliminary evidence dossier compiled.' },
      { date:'20 Mar 2026 09:00', action:'Referred to ICPC (Ref: ICPC-2026-441).' },
    ],
  },
  {
    id:'WB-2026-017', category:'Asset Misappropriation', riskScore:'Medium', status:'closed',
    received:'05 Feb 2026', sla:'07 Mar 2026', assignedOfficer:'Inv. Officer A',
    icpcRef:null, icpcStatus:null,
    log:[
      { date:'05 Feb 2026 14:20', action:'Case received. Assigned to Inv. Officer A.' },
      { date:'12 Feb 2026 11:00', action:'Internal inquiry concluded — unsubstantiated.' },
      { date:'15 Feb 2026 09:00', action:'Case closed. Complainant notified.' },
    ],
  },
  {
    id:'WB-2026-014', category:'Conflict of Interest', riskScore:'High', status:'new',
    received:'06 Apr 2026', sla:'06 May 2026', assignedOfficer:null,
    icpcRef:null, icpcStatus:null,
    log:[],
  },
]

const SYSTEM_STUDIES_INIT = [
  {
    id:'SS-2026-001', title:'Procurement Process Integrity Study — FY2025 Awards', dept:'Procurement',
    status:'active', lead:'ACTU Officer A', started:'10 Feb 2026', expectedCompletion:'30 Apr 2026',
    reportSentToDG:false,
    findings:[
      'Split-contract pattern detected on 4 awards — all below ₦5M threshold (avoids tender board)',
      'Sole-source procurement used 7× without documented justification',
      'Tender evaluation scores not archived in first 3 quarters',
    ],
    correctionActions:[
      { action:'Enforce mandatory tender board review for all aggregated contracts > ₦5M', done:false },
      { action:'Audit sole-source awards — request retroactive justification documentation',  done:true  },
      { action:'Implement digital evaluation score archiving in ERP (Q2 target)',             done:false },
    ],
  },
  {
    id:'SS-2026-000', title:'Staff Payroll Accuracy Audit — 2025 Cadres', dept:'HR & Finance',
    status:'finalised', lead:'ACTU Officer B', started:'01 Jan 2026', expectedCompletion:'15 Mar 2026',
    reportSentToDG:true,
    findings:[
      '3 ghost workers detected — already removed from payroll',
      'Salary anomalies corrected for 12 staff; refunds scheduled',
    ],
    correctionActions:[
      { action:'Quarterly biometric payroll audit mandatory from Q1 2026', done:true },
      { action:'Finance to recover over-payments via salary deduction',     done:true },
    ],
  },
]

const RED_FLAGS_INIT = [
  { id:'RF-2026-012', tender:'TDR-2026-009', vendor:'PowerTech Nigeria Ltd',   flag:'Bid price 12% below engineer\'s estimate — potential collusion signal', severity:'High',   status:'open',     escalated:false, note:null },
  { id:'RF-2026-011', tender:'TDR-2026-005', vendor:'QuickPrint Nigeria',      flag:'PO value (₦3.9M) plus prior POs from same vendor exceeds ₦5M split-contract threshold', severity:'Critical',status:'escalated',escalated:true, note:null },
  { id:'RF-2026-010', tender:'APP-2026',      vendor:'Multiple vendors',       flag:'3 vendors submitted identical unit prices on stationery (apparent bid-rigging)', severity:'High',   status:'resolved', escalated:false, note:'Contracts cancelled. Re-tender under open competition.' },
  { id:'RF-2026-009', tender:'TDR-2026-008', vendor:'SpotlessPro NG',          flag:'Director of HR is brother of SpotlessPro NG CEO — undisclosed conflict of interest', severity:'Critical',status:'open',    escalated:false, note:null },
]

const ECSC_DATA = {
  year: 2025, maxScore:100, score:72,
  categories:[
    { name:'Leadership Commitment',       score:18, max:20, weight:'20%' },
    { name:'Staff Ethics Training',       score:15, max:20, weight:'20%' },
    { name:'Whistleblower Protection',    score:13, max:15, weight:'15%' },
    { name:'Due Process Compliance',      score:11, max:15, weight:'15%' },
    { name:'Anti-Corruption Initiatives', score: 8, max:15, weight:'15%' },
    { name:'Reporting & Transparency',    score: 7, max:15, weight:'15%' },
  ],
  benchmarks:{ national:68, sectorAvg:65 },
  lastSubmittedDate:'16 Jan 2026',
  icpcPortalStatus:'received',
  actuSignOff:false,
  submittedToICPC:false,
}

const SENSITIZATION_ITEMS_INIT = [
  { id:'SC-2026-001', title:'Ethics & Due Process — All Staff Training', target:'All NAPTIN staff', targetCount:312, completed:267, status:'active', date:'Mar 2026', certIssued:267, reminderSent:false },
  { id:'SC-2026-002', title:'Procurement Integrity Workshop — Procurement Staff', target:'Procurement Dept', targetCount:15, completed:15, status:'done', date:'Feb 2026', certIssued:15, reminderSent:false },
  { id:'SC-2026-003', title:'ICPC Code of Conduct Dissemination — All New Hires', target:'New hires (Q1 2026)', targetCount:28, completed:18, status:'active', date:'Ongoing', certIssued:18, reminderSent:false },
]

// ── Utilities ──────────────────────────────────────────────────
const PILL_STYLES = {
  'under_investigation':'bg-amber-50 text-amber-700 border-amber-200',
  'referred_to_icpc':'bg-purple-50 text-purple-700 border-purple-200',
  closed:'bg-slate-100 text-slate-500 border-slate-200',
  new:'bg-blue-50 text-blue-700 border-blue-200',
  open:'bg-blue-50 text-blue-700 border-blue-200',
  escalated:'bg-red-50 text-red-700 border-red-200',
  resolved:'bg-green-50 text-[#006838] border-green-200',
  active:'bg-green-50 text-[#006838] border-green-200',
  finalised:'bg-purple-50 text-purple-700 border-purple-200',
  done:'bg-slate-100 text-slate-500 border-slate-200',
  High:'bg-red-50 text-red-700 border-red-200',
  Critical:'bg-red-100 text-red-900 border-red-400',
  Medium:'bg-amber-50 text-amber-700 border-amber-200',
  Low:'bg-slate-50 text-slate-400 border-slate-200',
  connected:'bg-green-50 text-[#006838] border-green-200',
  configured:'bg-blue-50 text-blue-700 border-blue-200',
  partial:'bg-amber-50 text-amber-700 border-amber-200',
  received:'bg-blue-50 text-blue-700 border-blue-200',
  'under-investigation':'bg-amber-50 text-amber-700 border-amber-200',
}

function Pill({ s }) {
  return <span className={`inline-flex text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${PILL_STYLES[s] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>{s?.replace(/_/g,' ')}</span>
}
function AddBtn({ label, onClick, icon: Icon = Plus }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-xs font-bold bg-[#006838] text-white px-3 py-1.5 rounded-xl hover:bg-[#005530] transition-colors">
      <Icon size={12} />{label}
    </button>
  )
}
function Card({ children, className='' }) { return <div className={`card ${className}`}>{children}</div> }

function Toast({ msg, clear }) {
  if (!msg) return null
  return (
    <div className="fixed bottom-6 right-6 z-[99] bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2">
      <CheckCircle2 size={13} className="text-green-400" />{msg}
      <button onClick={clear} className="ml-1 text-slate-400 hover:text-white"><X size={11} /></button>
    </div>
  )
}
function useToast() {
  const [msg, setMsg] = useState(null)
  function flash(m) { setMsg(m); setTimeout(() => setMsg(null), 3500) }
  return [msg, () => setMsg(null), flash]
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

const OFFICERS = ['Inv. Officer A','Inv. Officer B','Inv. Officer C','ACTU Head']

// ════════════════════════════════════════════════════════════════
// TAB 1 — WHISTLEBLOWER CASE MANAGEMENT
// ════════════════════════════════════════════════════════════════
function WhistleblowerTab({ navigate }) {
  const [cases, setCases] = useState(WHISTLEBLOWER_CASES_INIT)
  const [expanded, setExpanded] = useState(null)
  const [toastMsg, clearToast, flash] = useToast()
  const [actionInputs, setActionInputs] = useState({})
  const [assignSelects, setAssignSelects] = useState({})
  const [icpcStatusSelects, setICPCStatusSelects] = useState({})

  function assignOfficer(caseId) {
    const officer = assignSelects[caseId]
    if (!officer) return
    setCases(prev => prev.map(c => c.id !== caseId ? c : {
      ...c,
      assignedOfficer:officer,
      status:c.status === 'new' ? 'under_investigation' : c.status,
      log:[...c.log, { date:new Date().toLocaleString('en-GB'), action:`Case assigned to ${officer}` }],
    }))
    flash(`${caseId} assigned to ${officer} — notification sent`)
  }

  function logAction(caseId) {
    const action = actionInputs[caseId]
    if (!action?.trim()) return
    setCases(prev => prev.map(c => c.id !== caseId ? c : {
      ...c,
      log:[...c.log, { date:new Date().toLocaleString('en-GB'), action }],
    }))
    setActionInputs(ai => ({...ai, [caseId]:''}))
    flash(`Action logged on ${caseId}`)
  }

  function initiateICPC(caseId) {
    const ref = `ICPC-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900)+100)}`
    setCases(prev => prev.map(c => c.id !== caseId ? c : {
      ...c,
      status:'referred_to_icpc',
      icpcRef:ref,
      icpcStatus:'received',
      log:[...c.log, { date:new Date().toLocaleString('en-GB'), action:`ICPC referral initiated. Ref: ${ref}` }],
    }))
    flash(`${caseId} referred to ICPC — Ref: ${ref}. Dossier sent via secure channel.`)
  }

  function updateICPCStatus(caseId) {
    const newStatus = icpcStatusSelects[caseId]
    if (!newStatus) return
    setCases(prev => prev.map(c => c.id !== caseId ? c : {
      ...c,
      icpcStatus:newStatus,
      log:[...c.log, { date:new Date().toLocaleString('en-GB'), action:`ICPC status updated to: ${newStatus}` }],
    }))
    flash(`ICPC status for ${caseId} updated to "${newStatus}"`)
  }

  function uploadEvidence(caseId) {
    flash(`Evidence upload dialog opened for ${caseId} — files will be secured in DMS`)
  }

  function exportCase(caseId) {
    flash(`Case file for ${caseId} queued for PDF export — ACTU Head review required`)
  }

  const unassigned = cases.filter(c => !c.assignedOfficer && c.status !== 'closed')

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />

      {unassigned.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 flex items-start gap-3">
          <TriangleAlert size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-800 flex-1"><strong>{unassigned.length} case(s) unassigned</strong> — SLA clock is running. Assign investigative officers immediately.</p>
          <button onClick={() => setExpanded(unassigned[0].id)}
            className="flex-shrink-0 text-xs font-bold text-red-700 border border-red-300 px-3 py-1 rounded-xl hover:bg-red-100 transition-colors">
            Assign Now
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'New / Unassigned',         value: cases.filter(c=>c.status==='new').length,                    color:'text-blue-600'   },
          { label:'Under Investigation',      value: cases.filter(c=>c.status==='under_investigation').length,    color:'text-amber-600'  },
          { label:'Referred to ICPC',         value: cases.filter(c=>c.status==='referred_to_icpc').length,       color:'text-purple-600' },
          { label:'Closed',                   value: cases.filter(c=>c.status==='closed').length,                 color:'text-slate-400'  },
        ].map((s,i) => (
          <div key={i} className="card py-3 text-center">
            <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">All reports are anonymous · End-to-end encrypted · Tamper-proof log</p>
        <button onClick={() => navigate('/whistleblower-portal')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#006838] border border-green-200 bg-green-50 px-3 py-1.5 rounded-xl hover:bg-green-100 transition-colors">
          <ExternalLink size={12} />Open Submission Portal
        </button>
      </div>

      {cases.map(c => (
        <div key={c.id} className="card">
          <button className="w-full flex items-start justify-between" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
            <div className="text-left flex-1 mr-3">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-mono text-[10px] text-slate-400">{c.id}</span>
                <Pill s={c.status} /><Pill s={c.riskScore} />
              </div>
              <p className="text-sm font-bold text-slate-800">{c.category}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Received: {c.received} · SLA: <strong>{c.sla}</strong>
                {c.assignedOfficer ? ` · Officer: ${c.assignedOfficer}` : ' · ⚠ Unassigned'}
                {c.icpcRef && <span className="ml-2 text-purple-600">ICPC: {c.icpcRef}</span>}
              </p>
            </div>
            {expanded === c.id ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
          </button>

          {expanded === c.id && (
            <div className="mt-4 pt-4 border-t border-slate-50 space-y-4">
              {/* Investigation log */}
              {c.log.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Investigation Log</p>
                  <div className="space-y-1.5">
                    {c.log.map((entry,i) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <span className="font-mono text-slate-400 flex-shrink-0 text-[10px]">{entry.date}</span>
                        <span className="text-slate-700">{entry.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Log action input */}
              {c.status !== 'closed' && (
                <div className="flex gap-2">
                  <input value={actionInputs[c.id]||''} onChange={e => setActionInputs(ai=>({...ai,[c.id]:e.target.value}))}
                    placeholder="Log investigation action..." className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#006838]" />
                  <button onClick={() => logAction(c.id)} disabled={!actionInputs[c.id]?.trim()}
                    className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-2 rounded-xl hover:bg-green-50 disabled:opacity-40 transition-colors">
                    Log Action
                  </button>
                </div>
              )}

              {/* Assign officer */}
              {c.status !== 'closed' && (
                <div className="flex gap-2">
                  <select value={assignSelects[c.id]||''} onChange={e => setAssignSelects(as=>({...as,[c.id]:e.target.value}))}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#006838]">
                    <option value="">— Assign officer —</option>
                    {OFFICERS.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <button onClick={() => assignOfficer(c.id)} disabled={!assignSelects[c.id]}
                    className="text-xs font-bold text-amber-700 border border-amber-200 px-3 py-2 rounded-xl hover:bg-amber-50 disabled:opacity-40 transition-colors">
                    Assign Officer
                  </button>
                </div>
              )}

              {/* ICPC status */}
              {c.icpcRef && c.status !== 'closed' && (
                <div className="flex gap-2">
                  <select value={icpcStatusSelects[c.id]||c.icpcStatus||''} onChange={e => setICPCStatusSelects(is=>({...is,[c.id]:e.target.value}))}
                    className="flex-1 border border-purple-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-400 bg-purple-50">
                    <option value="received">received</option>
                    <option value="under_investigation">under investigation</option>
                    <option value="prosecution">prosecution</option>
                    <option value="closed">closed</option>
                  </select>
                  <button onClick={() => updateICPCStatus(c.id)} disabled={!icpcStatusSelects[c.id]}
                    className="text-xs font-bold text-purple-700 border border-purple-200 px-3 py-2 rounded-xl hover:bg-purple-50 disabled:opacity-40 transition-colors">
                    Update ICPC Status
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {!c.icpcRef && c.status !== 'closed' && c.riskScore !== 'Low' && (
                  <button onClick={() => initiateICPC(c.id)} className="text-xs font-bold text-purple-700 border border-purple-200 px-3 py-1 rounded-xl hover:bg-purple-50 flex items-center gap-1 transition-colors">
                    <ExternalLink size={11} />Initiate ICPC Referral
                  </button>
                )}
                <button onClick={() => uploadEvidence(c.id)} className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 flex items-center gap-1 font-semibold transition-colors">
                  <Download size={11} />Upload Evidence
                </button>
                <button onClick={() => exportCase(c.id)} className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 flex items-center gap-1 font-semibold transition-colors">
                  <FileText size={11} />Export Case File
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
// TAB 2 — SYSTEM STUDIES
// ════════════════════════════════════════════════════════════════
function SystemStudiesTab() {
  const [studies, setStudies] = useState(SYSTEM_STUDIES_INIT)
  const [expanded, setExpanded] = useState(null)
  const [toastMsg, clearToast, flash] = useToast()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title:'', dept:'' })

  function toggleCAP(studyId, idx) {
    setStudies(prev => prev.map(s => s.id !== studyId ? s : {
      ...s, correctionActions: s.correctionActions.map((a,i) => i === idx ? {...a, done:!a.done} : a)
    }))
  }
  function sendToDG(studyId) {
    setStudies(prev => prev.map(s => s.id === studyId ? { ...s, reportSentToDG:true, status:'finalised' } : s))
    flash('Study report sent to Director General — executive summary and action plan attached')
  }
  function exportReport(studyId) {
    flash(`Study ${studyId} report exported as PDF`)
  }
  function createStudy() {
    if (!form.title) return
    const newS = {
      id:`SS-2026-${String(studies.length + 2).padStart(3,'0')}`,
      title:form.title, dept:form.dept||'General', status:'active',
      lead:'ACTU Officer', started:new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),
      expectedCompletion:'TBD', reportSentToDG:false, findings:[], correctionActions:[],
    }
    setStudies(prev => [...prev, newS])
    setForm({ title:'', dept:'' })
    setShowModal(false)
    flash('Study plan created — team assigned, objectives pending documentation')
  }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />
      {showModal && (
        <Modal title="Create Study Plan" onClose={() => setShowModal(false)}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Study Title <span className="text-red-500">*</span></label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="e.g. HR Leave Management Integrity Audit" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Department</label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="e.g. Human Resources" value={form.dept} onChange={e=>setForm(f=>({...f,dept:e.target.value}))} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowModal(false)} className="text-xs text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={createStudy} disabled={!form.title}
              className="text-xs font-bold bg-[#006838] text-white px-4 py-2 rounded-xl hover:bg-[#005530] disabled:opacity-40">Create Study Plan</button>
          </div>
        </Modal>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{studies.length} studies · Evidence-based systemic investigations</p>
        <AddBtn label="Create Study Plan" onClick={() => setShowModal(true)} />
      </div>

      {studies.map(s => (
        <div key={s.id} className="card">
          <button className="w-full flex items-start justify-between" onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
            <div className="text-left flex-1 mr-3">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-mono text-[10px] text-slate-400">{s.id}</span>
                <Pill s={s.status} />
                {s.reportSentToDG && <span className="text-[9px] font-bold bg-green-50 text-[#006838] border border-green-200 px-2 py-0.5 rounded-full">DG Report Sent ✓</span>}
              </div>
              <p className="text-sm font-bold text-slate-800">{s.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Dept: {s.dept} · Lead: {s.lead} · Due: {s.expectedCompletion}</p>
            </div>
            {expanded === s.id ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
          </button>
          {expanded === s.id && (
            <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
              {s.findings.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Key Findings</p>
                  {s.findings.map((f,i) => <p key={i} className="text-xs text-slate-700 mb-1">• {f}</p>)}
                </div>
              )}
              {s.correctionActions.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Corrective Action Plan</p>
                  {s.correctionActions.map((action, ai) => (
                    <button key={ai} onClick={() => toggleCAP(s.id, ai)}
                      className={`w-full flex items-center gap-2.5 text-xs text-left px-3 py-2 rounded-xl border mb-1.5 transition-all ${action.done ? 'bg-green-50 border-green-200 text-[#006838]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                      <span className={`w-4 h-4 rounded-md border flex-shrink-0 flex items-center justify-center ${action.done ? 'bg-[#006838] border-[#006838]' : 'border-slate-300 bg-white'}`}>
                        {action.done && <CheckCircle2 size={10} className="text-white" />}
                      </span>
                      <span className={action.done ? 'line-through opacity-60' : ''}>{action.action}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {s.status === 'active' && !s.reportSentToDG && <button onClick={() => sendToDG(s.id)} className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors"><Send size={11} />Send Report to DG</button>}
                <button onClick={() => exportReport(s.id)} className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 flex items-center gap-1 font-semibold transition-colors"><Download size={11} />Export Report</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 3 — PROCUREMENT MONITOR
// ════════════════════════════════════════════════════════════════
function ProcurementMonitorTab() {
  const [flags, setFlags] = useState(RED_FLAGS_INIT)
  const [expanded, setExpanded] = useState(null)
  const [toastMsg, clearToast, flash] = useToast()
  const [showObsModal, setShowObsModal] = useState(false)
  const [selectedFlagId, setSelectedFlagId] = useState(null)
  const [obsText, setObsText] = useState('')

  function escalateToDG(id) {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, escalated:true, status:'escalated' } : f))
    flash('Red flag escalated to DG — executive briefing note sent with supporting evidence')
  }
  function markResolved(id) {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, status:'resolved' } : f))
    flash('Flag marked resolved — outcome recorded in case file')
  }
  function logObs(id) {
    if (!obsText.trim()) return
    setFlags(prev => prev.map(f => f.id === id ? { ...f, note:(f.note ? f.note + ' | ' : '') + obsText } : f))
    setObsText('')
    setShowObsModal(false)
    flash('Observation logged and added to flag file')
  }
  function scheduleSpotCheck(id) {
    flash(`Spot-check scheduled for ${id} — ACTU team notified, date TBD`)
  }

  const SEVER_COLOR = { Critical:'text-red-900 bg-red-100 border-red-400', High:'text-red-700 bg-red-50 border-red-200', Medium:'text-amber-700 bg-amber-50 border-amber-200' }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />
      {showObsModal && (
        <Modal title="Log Observation" onClose={() => { setShowObsModal(false); setSelectedFlagId(null) }}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Observation <span className="text-red-500">*</span></label>
            <textarea rows={3} className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838] resize-none"
              placeholder="Describe your observation..." value={obsText} onChange={e=>setObsText(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => { setShowObsModal(false); setSelectedFlagId(null) }} className="text-xs text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={() => logObs(selectedFlagId)} disabled={!obsText.trim()}
              className="text-xs font-bold bg-[#006838] text-white px-4 py-2 rounded-xl hover:bg-[#005530] disabled:opacity-40">Log Observation</button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Open Flags',     value: flags.filter(f=>f.status==='open').length,      color:'text-blue-600'   },
          { label:'Escalated',      value: flags.filter(f=>f.status==='escalated').length, color:'text-red-600'    },
          { label:'Resolved',       value: flags.filter(f=>f.status==='resolved').length,  color:'text-[#006838]'  },
        ].map((s,i) => (
          <div key={i} className="card py-3 text-center">
            <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">AI-assisted red flag detection · ERP + BPP portal integration</p>
        <button onClick={() => flash('Rule configuration panel — min. split threshold, sole-source limits, conflict rules')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
          <Shield size={12} />Configure Rules
        </button>
      </div>

      {flags.map(f => (
        <div key={f.id} className={`card border ${f.status === 'escalated' ? 'border-red-200 bg-red-50/30' : f.status === 'resolved' ? 'border-slate-100 opacity-70' : 'border-slate-100'}`}>
          <button className="w-full flex items-start justify-between" onClick={() => setExpanded(expanded === f.id ? null : f.id)}>
            <div className="text-left flex-1 mr-3">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-mono text-[10px] text-slate-400">{f.id}</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${SEVER_COLOR[f.severity] ?? ''}`}>{f.severity}</span>
                <Pill s={f.status} />
              </div>
              <p className="text-xs text-slate-700 leading-snug mt-0.5">{f.flag}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Tender: {f.tender} · {f.vendor}</p>
            </div>
            {expanded === f.id ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
          </button>
          {expanded === f.id && (
            <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
              {f.note && <div className="bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-700"><strong>Notes:</strong> {f.note}</div>}
              {f.status !== 'resolved' && (
                <div className="flex flex-wrap gap-2">
                  {!f.escalated && <button onClick={() => escalateToDG(f.id)} className="text-xs font-bold text-red-700 border border-red-200 px-3 py-1 rounded-xl hover:bg-red-50 flex items-center gap-1 transition-colors"><AlertTriangle size={11} />Escalate to DG</button>}
                  <button onClick={() => { setSelectedFlagId(f.id); setShowObsModal(true) }} className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 flex items-center gap-1 font-semibold transition-colors"><ClipboardList size={11} />Log Observation</button>
                  <button onClick={() => markResolved(f.id)} className="text-xs text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 font-semibold transition-colors"><CheckCircle2 size={11} />Mark Resolved</button>
                  <button onClick={() => scheduleSpotCheck(f.id)} className="text-xs text-blue-700 border border-blue-200 px-3 py-1 rounded-xl hover:bg-blue-50 flex items-center gap-1 font-semibold transition-colors"><Search size={11} />Schedule Spot-Check</button>
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
// TAB 4 — ETHICS COMPLIANCE SCORECARD
// ════════════════════════════════════════════════════════════════
function ECSCTab() {
  const data = ECSC_DATA
  const [actuSignedOff, setActuSignedOff] = useState(data.actuSignOff)
  const [submittedToICPC, setSubmittedToICPC] = useState(data.submittedToICPC)
  const [toastMsg, clearToast, flash] = useToast()

  const radarData = data.categories.map(c => ({ subject:c.name.split(' ').slice(0,2).join(' '), A:Math.round((c.score/c.max)*100) }))

  function signOff() {
    setActuSignedOff(true)
    flash('ACTU Chair sign-off recorded — scorecard locked. Ready for ICPC ECSC Portal submission.')
  }
  function submitToICPC() {
    setSubmittedToICPC(true)
    flash('Ethics scorecard submitted to ICPC ECSC Portal — submission reference generated. Acknowledgement expected within 5 working days.')
  }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label:`FY${data.year} Score`,     value:`${data.score}/${data.maxScore}`, color:'text-[#006838]' },
          { label:'National Average',          value:`${data.benchmarks.national}`,     color:'text-slate-700' },
          { label:'Status',                    value: submittedToICPC ? 'Submitted ✓' : actuSignedOff ? 'Signed Off' : 'Pending Sign-Off', color: submittedToICPC ? 'text-[#006838]' : actuSignedOff ? 'text-blue-600' : 'text-amber-600' },
        ].map((s,i) => (
          <div key={i} className="card py-3 text-center">
            <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <Card>
        <p className="text-xs font-bold text-slate-700 mb-3">Category Scores — FY{data.year}</p>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize:9, fill:'#64748b' }} />
            <Radar name="NAPTIN" dataKey="A" stroke="#006838" fill="#006838" fillOpacity={0.25} />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Category Breakdown</p>
        {data.categories.map((cat,i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-slate-700">{cat.name}</span>
                <span className={`font-bold text-xs ${cat.score/cat.max >= 0.8 ? 'text-[#006838]' : cat.score/cat.max >= 0.6 ? 'text-amber-600' : 'text-red-600'}`}>{cat.score}/{cat.max}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full transition-all" style={{ width:`${(cat.score/cat.max)*100}%`, backgroundColor: cat.score/cat.max >= 0.8 ? '#006838' : cat.score/cat.max >= 0.6 ? '#f59e0b' : '#ef4444' }} />
              </div>
            </div>
            <span className="text-[10px] text-slate-400 flex-shrink-0">{cat.weight}</span>
          </div>
        ))}
      </Card>

      <div className="flex flex-wrap gap-2">
        {!actuSignedOff && (
          <button onClick={signOff} className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1.5 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors">
            <Shield size={11} />ACTU Chair Sign-Off
          </button>
        )}
        {actuSignedOff && !submittedToICPC && (
          <button onClick={submitToICPC} className="text-xs font-bold text-purple-700 border border-purple-200 px-3 py-1.5 rounded-xl hover:bg-purple-50 flex items-center gap-1 transition-colors">
            <Send size={11} />Submit to ICPC ECSC Portal
          </button>
        )}
        {submittedToICPC && (
          <span className="text-xs font-bold text-[#006838] bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
            <CheckCircle2 size={11} />Submitted to ICPC ✓
          </span>
        )}
        <button onClick={() => flash('ECSC scorecard PDF queued for download')} className="text-xs text-slate-500 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 flex items-center gap-1 font-semibold transition-colors">
          <Download size={11} />Download Report PDF
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 5 — SENSITIZATION
// ════════════════════════════════════════════════════════════════
function SensitizationTab() {
  const [campaigns, setCampaigns] = useState(SENSITIZATION_ITEMS_INIT)
  const [toastMsg, clearToast, flash] = useToast()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title:'', target:'', targetCount:'' })

  function sendReminder(id) {
    const c = campaigns.find(x => x.id === id)
    const remaining = c.targetCount - c.completed
    setCampaigns(prev => prev.map(x => x.id === id ? { ...x, reminderSent:true } : x))
    flash(`Reminder sent to ${remaining} staff who haven't completed "${c.title}"`)
  }
  function exportCerts(id) {
    const c = campaigns.find(x => x.id === id)
    flash(`${c.certIssued} certificates exported as PDF batch for "${c.title}"`)
  }
  function downloadReport(id) {
    flash(`Campaign report for ${id} exported`)
  }
  function createCampaign() {
    if (!form.title) return
    const newC = {
      id:`SC-${new Date().getFullYear()}-${String(campaigns.length + 4).padStart(3,'0')}`,
      title:form.title, target:form.target||'All Staff',
      targetCount:parseInt(form.targetCount)||0, completed:0,
      status:'active', date:new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),
      certIssued:0, reminderSent:false,
    }
    setCampaigns(prev => [...prev, newC])
    setForm({ title:'', target:'', targetCount:'' })
    setShowModal(false)
    flash('Campaign created — staff invitations and resource packs being distributed')
  }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />
      {showModal && (
        <Modal title="Create Sensitization Campaign" onClose={() => setShowModal(false)}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Title <span className="text-red-500">*</span></label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="e.g. Conflict of Interest Awareness" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="e.g. Finance Dept" value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Head Count</label>
              <input type="number" className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="0" value={form.targetCount} onChange={e=>setForm(f=>({...f,targetCount:e.target.value}))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowModal(false)} className="text-xs text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={createCampaign} disabled={!form.title}
              className="text-xs font-bold bg-[#006838] text-white px-4 py-2 rounded-xl hover:bg-[#005530] disabled:opacity-40">Create Campaign</button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Active Campaigns',   value: campaigns.filter(c=>c.status==='active').length,  color:'text-[#006838]' },
          { label:'Total Staff Reached',value: campaigns.reduce((a,c)=>a+c.completed,0),         color:'text-blue-600' },
          { label:'Certificates Issued',value: campaigns.reduce((a,c)=>a+c.certIssued,0),        color:'text-amber-600' },
        ].map((s,i) => (
          <div key={i} className="card py-3 text-center">
            <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">ICPC-mandated ethics training · Certificate-bearing programmes</p>
        <AddBtn label="Create Campaign" onClick={() => setShowModal(true)} />
      </div>

      {campaigns.map(c => {
        const pct = c.targetCount > 0 ? Math.round((c.completed / c.targetCount) * 100) : 0
        return (
          <div key={c.id} className="card">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-mono text-[10px] text-slate-400">{c.id}</span>
                  <Pill s={c.status} />
                </div>
                <p className="text-sm font-bold text-slate-800">{c.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{c.target} · {c.date}</p>
              </div>
              <div className="text-right text-[10px] text-slate-400 flex-shrink-0">
                <p className="font-extrabold text-lg text-slate-800">{pct}%</p>
                <p>{c.completed}/{c.targetCount} completed</p>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
              <div className="h-1.5 rounded-full transition-all" style={{ width:`${pct}%`, backgroundColor: pct >= 90 ? '#006838' : pct >= 60 ? '#f59e0b' : '#ef4444' }} />
            </div>
            <div className="flex flex-wrap gap-2">
              {c.status === 'active' && <button onClick={() => sendReminder(c.id)} disabled={c.reminderSent} className="text-xs font-semibold text-amber-700 border border-amber-200 px-3 py-1 rounded-xl hover:bg-amber-50 disabled:opacity-40 flex items-center gap-1 transition-colors"><Send size={11} />{c.reminderSent ? 'Reminder Sent ✓' : 'Send Reminder to Incomplete'}</button>}
              {c.certIssued > 0 && <button onClick={() => exportCerts(c.id)} className="text-xs text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 font-semibold transition-colors"><Download size={11} />Export Certificates ({c.certIssued})</button>}
              <button onClick={() => downloadReport(c.id)} className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 flex items-center gap-1 font-semibold transition-colors"><FileText size={11} />Download Report</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 6 — ROLES, DB SCHEMA & INTEGRATIONS
// ════════════════════════════════════════════════════════════════
function RolesSchemaTab() {
  const roles = Object.keys(ACTU_ROLE_MATRIX)
  const modules = Object.keys(ACTU_ROLE_MATRIX[roles[0]])
  const [expandedTable, setExpandedTable] = useState(null)
  const [copiedTable, setCopiedTable] = useState(null)

  function copySQL(table) {
    const insertRows = table.seedRows.map(row => {
      const vals = Object.values(row).map(v => `'${v}'`).join(', ')
      return `INSERT INTO ${table.table} VALUES (${vals});`
    }).join('\n')
    navigator.clipboard?.writeText(insertRows).catch(() => {})
    setCopiedTable(table.table)
    setTimeout(() => setCopiedTable(null), 2000)
  }

  return (
    <div className="space-y-5">
      {/* Role Matrix */}
      <Card className="p-0 overflow-x-auto">
        <div className="px-5 py-4 border-b border-slate-50"><p className="text-sm font-bold text-slate-700">User Role & Permission Matrix</p></div>
        <table className="w-full text-xs">
          <thead><tr className="bg-slate-50">
            <th className="px-4 py-3 text-left font-semibold text-slate-500 sticky left-0 bg-slate-50">Module</th>
            {roles.map(r => <th key={r} className="px-4 py-3 text-center font-semibold text-slate-500 whitespace-nowrap">{r}</th>)}
          </tr></thead>
          <tbody>
            {modules.map(mod => (
              <tr key={mod} className="border-t border-slate-50">
                <td className="px-4 py-2.5 font-bold text-slate-700 sticky left-0 bg-white">{mod}</td>
                {roles.map(role => (
                  <td key={role} className="px-4 py-2.5 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {ACTU_ROLE_MATRIX[role][mod]?.map((p,j) => (
                        <span key={j} className="text-[9px] font-semibold bg-green-50 text-[#006838] border border-green-200 px-1.5 py-0.5 rounded-md whitespace-nowrap">{p}</span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* DB Schema */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Database size={14} className="text-[#006838]" />
          <p className="text-sm font-bold text-slate-800">Database Schema</p>
          <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">{DB_SCHEMA.length} tables</span>
        </div>
        <div className="space-y-3">
          {DB_SCHEMA.map(t => (
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
                  {/* Column definitions */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Column Definitions</p>
                    <table className="w-full text-xs">
                      <thead><tr className="bg-slate-50">
                        {['Column','Type','Constraints'].map(h => <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500">{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {t.columns.map((col,i) => (
                          <tr key={i} className="border-t border-slate-50">
                            <td className="px-3 py-2 font-mono text-[10px] text-[#006838] font-bold">{col.column}</td>
                            <td className="px-3 py-2 font-mono text-[10px] text-blue-700">{col.type}</td>
                            <td className="px-3 py-2 text-[10px] text-slate-500">{col.constraints}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Seed data */}
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

      {/* Integrations */}
      <Card>
        <p className="text-sm font-bold text-slate-800 mb-3">System Integration Points</p>
        <div className="space-y-2">
          {ACTU_INTEGRATIONS.map((int,i) => (
            <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-xs font-bold text-slate-700">{int.system}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{int.purpose}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 whitespace-nowrap ${PILL_STYLES[int.status] ?? ''}`}>{int.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════
const TABS = [
  { id:'whistleblower', label:'Whistleblower', icon: ScanLine     },
  { id:'studies',       label:'System Studies', icon: Search       },
  { id:'procurement',   label:'Procurement Monitor', icon: TrendingDown },
  { id:'ecsc',          label:'Ethics Scorecard', icon: Shield      },
  { id:'sensitization', label:'Sensitization',  icon: Megaphone   },
  { id:'roles',         label:'Roles & Schema', icon: Database     },
]

export default function ACTUPage() {
  const [tab, setTab] = useState('whistleblower')
  const navigate = useNavigate()

  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">ACTU Workbench</h1>
            <p className="text-sm text-slate-400">Anti-Corruption & Transparency Unit · ICPC mandate</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400 font-semibold">ICPC ECSC Portal</p>
            <p className="text-[10px] text-[#006838] font-bold">Score: {ECSC_DATA.score}/{ECSC_DATA.maxScore}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label:'Active Cases',         value: WHISTLEBLOWER_CASES_INIT.filter(c=>['new','under_investigation'].includes(c.status)).length, icon:ScanLine,   bg:'bg-blue-50',   color:'text-blue-600'   },
          { label:'Referred to ICPC',     value: WHISTLEBLOWER_CASES_INIT.filter(c=>c.status==='referred_to_icpc').length,                    icon:ExternalLink,bg:'bg-purple-50', color:'text-purple-600' },
          { label:'Open Red Flags',       value: RED_FLAGS_INIT.filter(f=>f.status==='open').length,                                          icon:TriangleAlert,bg:'bg-red-50',   color:'text-red-600'    },
          { label:'ECSC Score',           value:`${ECSC_DATA.score}/${ECSC_DATA.maxScore}`,                                                   icon:Shield,      bg:'bg-green-50',  color:'text-[#006838]'  },
        ].map((k,i) => (
          <div key={i} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${k.bg} ${k.color} flex items-center justify-center flex-shrink-0`}><k.icon size={18} /></div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{k.value}</div>
              <div className="text-xs text-slate-400 font-medium">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 mb-5 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              tab === t.id ? 'bg-[#006838] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-white border border-slate-100 hover:bg-slate-50'
            }`}>
            <t.icon size={13} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'whistleblower' && <WhistleblowerTab navigate={navigate} />}
      {tab === 'studies'       && <SystemStudiesTab />}
      {tab === 'procurement'   && <ProcurementMonitorTab />}
      {tab === 'ecsc'          && <ECSCTab />}
      {tab === 'sensitization' && <SensitizationTab />}
      {tab === 'roles'         && <RolesSchemaTab />}
    </div>
  )
}
