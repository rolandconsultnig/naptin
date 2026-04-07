import { useState } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import {
  ClipboardCheck, MessageSquare, Search, BarChart2, TrendingUp,
  FileText, Shield, Plus, ChevronDown, ChevronRight, CheckCircle2,
  Clock, AlertTriangle, Download, QrCode, Send, RefreshCw,
  TriangleAlert, Users, Star, X,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts'

// ── Role Matrix ────────────────────────────────────────────────
const SVC_ROLE_MATRIX = {
  'SERVICOM Officer': { 'Service Charter':['update-draft','generate-qr'], 'Complaints':['log','respond','send-csat'], 'Mystery Shopping':['review-reports'], 'CSAT':['view-data','export'], 'SIP':['create','update','export'], 'Reg. Reporting':['populate','submit'] },
  'SERVICOM Manager': { 'Service Charter':['approve-publish','manage-standards'], 'Complaints':['escalate','override-resolve'], 'Mystery Shopping':['plan-audit','review'], 'CSAT':['configure','analyse'], 'SIP':['approve','verify-close'], 'Reg. Reporting':['review','route-dg'] },
  'Dept Head':        { 'Service Charter':['view'], 'Complaints':['receive-escalation','resolve'], 'Mystery Shopping':['view'], 'CSAT':['view'], 'SIP':['implement-actions'], 'Reg. Reporting':['view'] },
  'Director General': { 'Service Charter':['final-approve'], 'Complaints':['view-summary'], 'Mystery Shopping':['view-summary'], 'CSAT':['view-summary'], 'SIP':['view-approve'], 'Reg. Reporting':['sign-off','submit-national'] },
}

const SVC_INTEGRATIONS = [
  { system:'SMS / Twilio',              purpose:'Complaint acknowledgement, status updates, CSAT survey delivery via SMS',  status:'connected'  },
  { system:'Email / SendGrid',          purpose:'Formal complaint responses, CSAT surveys, SIP closure notifications',       status:'connected'  },
  { system:'QR Code Generator',         purpose:'Auto-generate printable QR sheets linking to feedback portal',             status:'configured' },
  { system:'SERVICOM National Portal',  purpose:'Submit quarterly compliance reports; receive national benchmarks',          status:'partial'    },
  { system:'HR / Staff Directory',      purpose:'Route escalated complaints to correct Dept Head; map staff to SIP actions', status:'configured' },
  { system:'Analytics Dashboard',       purpose:'CSAT trend charts, SIP completion rates, complaint resolution KPIs',       status:'connected'  },
  { system:'Document Management',       purpose:'Archive mystery shopping reports, SIP evidence, audit trails',              status:'connected'  },
]

// ── Data ───────────────────────────────────────────────────────
const SERVICE_CHARTER_INIT = [
  { id:'SC-001', service:'Training Enrolment & Registration',    dept:'Training', sla:'5 business days', channels:['Online','In-person'], version:'v2.3', draft:false, qrCode:true  },
  { id:'SC-002', service:'Certificate Issuance',                dept:'Training', sla:'10 business days',channels:['Online'],            version:'v1.8', draft:false, qrCode:true  },
  { id:'SC-003', service:'Complaint Resolution',                dept:'SERVICOM', sla:'3 business days', channels:['Online','Phone'],    version:'v3.1', draft:false, qrCode:true  },
  { id:'SC-004', service:'Staff Identification (ID Cards)',     dept:'HR',       sla:'15 business days',channels:['In-person'],         version:'v1.2', draft:false, qrCode:false },
  { id:'SC-005', service:'Official Documents & Letters',        dept:'Admin',    sla:'7 business days', channels:['In-person'],         version:'v2.0', draft:false, qrCode:true  },
  { id:'SC-006', service:'Venue & Conference Room Booking',     dept:'Admin',    sla:'2 business days', channels:['Online','Phone'],    version:'v1.5', draft:false, qrCode:false },
  { id:'SC-007', service:'Technical Assistance & Helpdesk',    dept:'ICT',      sla:'4 hours (critical)',channels:['Online','Phone'],  version:'v2.2', draft:false, qrCode:true  },
  { id:'SC-008', service:'Procurement Enquiry & Vendor Reg.', dept:'Procurement',sla:'5 business days',channels:['Online'],            version:'v1.1', draft:false, qrCode:false },
]

const COMPLAINTS_INIT = [
  { id:'CMP-2026-087', citizen:'Emeka Okonkwo',     service:'Certificate Issuance',       channel:'Online', received:'03 Apr 2026', sla:'06 Apr 2026', status:'open',     priority:'high',   dept:'Training', note:'Certificate delayed 3 weeks past SLA — applicant attended training Nov 2025' },
  { id:'CMP-2026-085', citizen:'Fatima Abdullahi',  service:'Training Enrolment',         channel:'Phone',  received:'01 Apr 2026', sla:'04 Apr 2026', status:'resolved', priority:'medium', dept:'Training', note:'Resolved — enrolment conflict corrected, confirmation email sent' },
  { id:'CMP-2026-082', citizen:'James Oluwaseun',   service:'Official Documents & Letters',channel:'In-person',received:'28 Mar 2026',sla:'04 Apr 2026',status:'escalated',priority:'high',  dept:'Admin',    note:'Letter of attestation requested 3× — DG Office not responding to routing' },
  { id:'CMP-2026-079', citizen:'Ngozi Eze',         service:'Staff Identification (ID Cards)',channel:'Email',received:'25 Mar 2026',sla:'09 Apr 2026',status:'open',    priority:'low',    dept:'HR',       note:'ID card requested for new staff member — pending HR clearance' },
]

const MYSTERY_AUDITS_INIT = [
  {
    id:'MA-2026-Q1-02', title:'Q1 2026 Citizen Service Experience Audit', scope:'Abuja HQ Customer Service, ICT Helpdesk, Training Enrolment Counter',
    date:'22 Mar 2026', status:'report-ready', overallScore:3.2, findings:[
      { service:'Training Enrolment Counter', score:3.8, flags:['Wait time exceeded 45 min (SLA 20 min)','Staff unable to answer scholarship query correctly'] },
      { service:'ICT Helpdesk',               score:2.9, flags:['Helpdesk phone not answered 3 of 5 test calls','No complaint log given to citizen'] },
      { service:'Customer Service Desk',      score:3.1, flags:['Charter not displayed visibly','Staff helpful once engaged'] },
    ],
    sipCreated: false,
  },
  {
    id:'MA-2026-Q1-01', title:'Q4 2025 Follow-Up Spot-Check — Certificate Issuance', scope:'Training Dept, Certificates Unit',
    date:'15 Feb 2026', status:'sip-in-progress', overallScore:3.6, findings:[
      { service:'Certificate Processing', score:3.6, flags:['Improved from Q3 (2.8 → 3.6)','Backlog cleared','Digital delivery not yet active'] },
    ],
    sipCreated: true,
  },
]

const CSAT_DATA = {
  overallScore: 3.5,
  responseRate: 62,
  totalResponses: 847,
  monthly: [
    { month:'Jan', avg:3.2 }, { month:'Feb', avg:3.4 }, { month:'Mar', avg:3.5 },
  ],
  byService:[
    { service:'Training Enrolment',    score:3.8, responses:312, fill:'#006838' },
    { service:'Certificate Issuance',  score:3.2, responses:241, fill:'#f59e0b' },
    { service:'ICT Helpdesk',          score:2.9, responses:158, fill:'#ef4444' },
    { service:'Admin / Documents',     score:3.4, responses:136, fill:'#3b82f6' },
  ],
  surveyConfig:{ method:'SMS + Email', triggerPoint:'48h post-service', scale:'1–5 stars', channels:['Online portal','SMS short code','QR feedback card'] },
  sipAlert:{ triggered:true, service:'ICT Helpdesk', score:2.9, threshold:3.0 },
}

const SIPS_INIT = [
  {
    id:'SIP-2026-003', title:'ICT Helpdesk — Service Improvement Plan', source:'CSAT trigger', triggerScore:2.9, threshold:3.0,
    status:'in-progress', owner:'Head of ICT', dueDate:'30 May 2026', dgSignOff:false, reportSent:false,
    actions:[
      { action:'Hire 2 additional helpdesk staff',                    owner:'HR Dept',   deadline:'30 Apr 2026', done:false },
      { action:'Implement mandatory call logging within 30 min',       owner:'ICT Head',  deadline:'15 Apr 2026', done:true  },
      { action:'Install call tracking software',                       owner:'ICT Head',  deadline:'30 Apr 2026', done:false },
      { action:'Re-launch complaint escalation matrix',                owner:'SERVICOM',  deadline:'20 Apr 2026', done:false },
    ],
  },
  {
    id:'SIP-2026-002', title:'Certificate Issuance — Backlog Clearance Plan', source:'Mystery shopping', triggerScore:null, threshold:null,
    status:'closed', owner:'Head of Training', dueDate:'28 Feb 2026', dgSignOff:true, reportSent:true,
    actions:[
      { action:'Assign 3 staff to backlog clearing on Fri afternoons', owner:'Training',  deadline:'14 Feb 2026', done:true  },
      { action:'Implement digital delivery for graduates post-2024',    owner:'ICT',       deadline:'28 Feb 2026', done:true  },
      { action:'Update SLA from 15 to 10 business days',               owner:'SERVICOM',  deadline:'28 Feb 2026', done:true  },
    ],
  },
]

const REGULATORY_REPORTS_INIT = [
  {
    id:'REP-Q1-2026', title:'Q1 2026 SERVICOM Compliance Report', period:'Jan–Mar 2026', status:'draft',
    dueDate:'15 Apr 2026', submittedDate:null, dgSignOff:false, submittedToPortal:false,
    sections:[
      { title:'Complaints Summary',        status:'complete', count:23, resolved:19, escalated:3, open:1 },
      { title:'CSAT Analysis',             status:'complete', overallScore:3.5, responsesCollected:847 },
      { title:'Mystery Shopping Results',  status:'complete', auditsCompleted:2, avgScore:3.4 },
      { title:'SIP Progress Summary',      status:'complete', activeSIPs:1, closedSIPs:1, avgCompletion:75 },
      { title:'Service Charter Adherence', status:'draft',    overallCompliance:null },
    ],
  },
  {
    id:'REP-Q4-2025', title:'Q4 2025 SERVICOM Compliance Report', period:'Oct–Dec 2025', status:'submitted',
    dueDate:'15 Jan 2026', submittedDate:'14 Jan 2026', dgSignOff:true, submittedToPortal:true,
    sections:null,
  },
]

// ── Utilities ──────────────────────────────────────────────────
const PILL_STYLES = {
  approved:'bg-green-50 text-[#006838] border-green-200', active:'bg-green-50 text-[#006838] border-green-200',
  open:'bg-blue-50 text-blue-700 border-blue-200', resolved:'bg-green-50 text-[#006838] border-green-200',
  escalated:'bg-red-50 text-red-700 border-red-200', submitted:'bg-purple-50 text-purple-700 border-purple-200',
  draft:'bg-slate-50 text-slate-500 border-slate-200', 'in-progress':'bg-amber-50 text-amber-700 border-amber-200',
  closed:'bg-slate-100 text-slate-500 border-slate-200', 'report-ready':'bg-blue-50 text-blue-700 border-blue-200',
  'sip-in-progress':'bg-amber-50 text-amber-700 border-amber-200', connected:'bg-green-50 text-[#006838] border-green-200',
  configured:'bg-blue-50 text-blue-700 border-blue-200', partial:'bg-amber-50 text-amber-700 border-amber-200',
  high:'bg-red-50 text-red-700 border-red-200', medium:'bg-amber-50 text-amber-700 border-amber-200',
  low:'bg-slate-50 text-slate-400 border-slate-200', complete:'bg-green-50 text-[#006838] border-green-200',
}

function Pill({ s }) {
  return <span className={`inline-flex text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${PILL_STYLES[s] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>{s}</span>
}
function AddBtn({ label, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-xs font-bold bg-[#006838] text-white px-3 py-1.5 rounded-xl hover:bg-[#005530] transition-colors">
      <Plus size={12} />{label}
    </button>
  )
}
function Card({ children, className='' }) {
  return <div className={`card ${className}`}>{children}</div>
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
function useToast() {
  const [msg, setMsg] = useState(null)
  function flash(m) { setMsg(m); setTimeout(() => setMsg(null), 3200) }
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

// ════════════════════════════════════════════════════════════════
// TAB 1 — SERVICE CHARTER
// ════════════════════════════════════════════════════════════════
function ServiceCharterTab() {
  const [charter, setCharter] = useState(SERVICE_CHARTER_INIT)
  const [charterPublished, setCharterPublished] = useState(false)
  const [toastMsg, clearToast, flash] = useToast()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ service:'', dept:'', sla:'' })

  function approvePublish() {
    setCharterPublished(true)
    flash('Service charter approved and published — QR codes regenerated, website updated, printed sheets dispatched to all SERVICOM boards')
  }
  function generateQR(id) {
    setCharter(prev => prev.map(s => s.id === id ? { ...s, qrCode:true } : s))
    flash(`QR code sheet generated for ${id} — printable PDF ready for lobby display`)
  }
  function addStandard() {
    if (!form.service) return
    const newS = {
      id:`SC-${String(charter.length + 1).padStart(3,'0')}`,
      service:form.service, dept:form.dept||'General',
      sla:form.sla||'5 business days', channels:['Online'],
      version:'v1.0', draft:true, qrCode:false,
    }
    setCharter(prev => [...prev, newS])
    setForm({ service:'', dept:'', sla:'' })
    setShowModal(false)
    flash('Service standard added as draft — review and publish via charter approval')
  }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />
      {showModal && (
        <Modal title="Add Service Standard" onClose={() => setShowModal(false)}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Service Name <span className="text-red-500">*</span></label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="e.g. Procurement Query Resolution" value={form.service} onChange={e=>setForm(f=>({...f,service:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="e.g. Admin" value={form.dept} onChange={e=>setForm(f=>({...f,dept:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SLA</label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="e.g. 5 business days" value={form.sla} onChange={e=>setForm(f=>({...f,sla:e.target.value}))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowModal(false)} className="text-xs text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={addStandard} disabled={!form.service}
              className="text-xs font-bold bg-[#006838] text-white px-4 py-2 rounded-xl hover:bg-[#005530] disabled:opacity-40">Add Standard</button>
          </div>
        </Modal>
      )}

      {!charterPublished && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex items-start gap-3">
          <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 flex-1">2026 Service Charter amendment pending DG approval — publish to activate QR feedback links and update SERVICOM noticeboard.</p>
          <button onClick={approvePublish} className="flex-shrink-0 text-xs font-bold text-amber-700 border border-amber-300 px-3 py-1 rounded-xl hover:bg-amber-100 transition-colors">
            Approve & Publish Charter
          </button>
        </div>
      )}
      {charterPublished && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3 text-xs text-[#006838] font-semibold">
          ✓ Charter published — all {charter.length} service standards active, QR sheets live
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{charter.length} service standards · SERVICOM Framework 2022 compliant</p>
        <div className="flex gap-2">
          <button onClick={() => flash('QR code sheet for all services queued for PDF download')} className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors">
            <QrCode size={12} /> QR Code Sheet
          </button>
          <AddBtn label="Add Service Standard" onClick={() => setShowModal(true)} />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50">
              {['ID','Service','Dept','SLA','Channels','Version','QR','Actions'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left font-semibold text-slate-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {charter.map(s => (
              <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50/60">
                <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400">{s.id}</td>
                <td className="px-4 py-2.5 font-semibold text-slate-800">{s.service}{s.draft && <span className="ml-1.5 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">draft</span>}</td>
                <td className="px-4 py-2.5 text-slate-500">{s.dept}</td>
                <td className="px-4 py-2.5 font-semibold text-[#006838]">{s.sla}</td>
                <td className="px-4 py-2.5 text-slate-400">{s.channels.join(', ')}</td>
                <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400">{s.version}</td>
                <td className="px-4 py-2.5">
                  {s.qrCode
                    ? <span className="text-[10px] text-[#006838] font-bold">✓ Active</span>
                    : <button onClick={() => generateQR(s.id)} className="text-[10px] text-blue-600 hover:underline font-semibold">Generate</button>}
                </td>
                <td className="px-4 py-2.5">
                  <button onClick={() => flash(`Service standard ${s.id} viewed — SLA: ${s.sla}, Version: ${s.version}`)} className="text-[10px] text-slate-400 hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 2 — COMPLAINTS MANAGEMENT
// ════════════════════════════════════════════════════════════════
function ComplaintsTab() {
  const [complaints, setComplaints] = useState(COMPLAINTS_INIT)
  const [expanded, setExpanded] = useState(null)
  const [toastMsg, clearToast, flash] = useToast()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ citizen:'', service:'', channel:'Online', priority:'medium', note:'' })

  function markResolved(id) {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status:'resolved' } : c))
    flash(`${id} marked resolved — CSAT survey triggered automatically`)
  }
  function escalate(id) {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status:'escalated' } : c))
    flash(`${id} escalated — Dept Head and SERVICOM Manager notified`)
  }
  function sendCSAT(id) {
    flash(`CSAT survey sent to citizen for ${id} — SMS + email link dispatched`)
  }
  function logComplaint() {
    if (!form.citizen || !form.service) return
    const today = new Date()
    const slaDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
    const fmt = d => d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})
    const newC = {
      id:`CMP-2026-${String(100 + complaints.length - COMPLAINTS_INIT.length).padStart(3,'0')}`,
      citizen:form.citizen, service:form.service, channel:form.channel,
      received:fmt(today), sla:fmt(slaDate),
      status:'open', priority:form.priority, dept:'General', note:form.note||'—',
    }
    setComplaints(prev => [...prev, newC])
    setForm({ citizen:'', service:'', channel:'Online', priority:'medium', note:'' })
    setShowModal(false)
    flash('Complaint logged — acknowledgment SMS sent, SLA clock started')
  }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />
      {showModal && (
        <Modal title="Log New Complaint" onClose={() => setShowModal(false)}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Citizen Name <span className="text-red-500">*</span></label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="Complainant name" value={form.citizen} onChange={e=>setForm(f=>({...f,citizen:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Service <span className="text-red-500">*</span></label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="e.g. Certificate Issuance" value={form.service} onChange={e=>setForm(f=>({...f,service:e.target.value}))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Channel</label>
              <select className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                value={form.channel} onChange={e=>setForm(f=>({...f,channel:e.target.value}))}>
                {['Online','Phone','In-person','Email'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
              <select className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}>
                {['high','medium','low'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
            <textarea rows={2} className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838] resize-none"
              placeholder="Brief description of the complaint..." value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowModal(false)} className="text-xs text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={logComplaint} disabled={!form.citizen||!form.service}
              className="text-xs font-bold bg-[#006838] text-white px-4 py-2 rounded-xl hover:bg-[#005530] disabled:opacity-40">Log Complaint</button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'Open',      value: complaints.filter(c=>c.status==='open').length,      color:'text-blue-600'   },
          { label:'Escalated', value: complaints.filter(c=>c.status==='escalated').length, color:'text-red-600'    },
          { label:'Resolved',  value: complaints.filter(c=>c.status==='resolved').length,  color:'text-[#006838]'  },
          { label:'Avg SLA',   value: '3 days',                                                color:'text-slate-700' },
        ].map((s,i) => (
          <div key={i} className="card py-3 text-center">
            <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{complaints.length} complaints · SLA tracked automatically · CSAT auto-triggered on resolution</p>
        <AddBtn label="Log Complaint" onClick={() => setShowModal(true)} />
      </div>

      {complaints.map(c => (
        <div key={c.id} className={`card border ${c.status === 'escalated' ? 'border-red-200 bg-red-50/30' : 'border-slate-100'}`}>
          <button className="w-full flex items-start justify-between" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
            <div className="text-left flex-1 mr-3">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-mono text-[10px] text-slate-400">{c.id}</span>
                <Pill s={c.status} /><Pill s={c.priority} />
              </div>
              <p className="text-sm font-bold text-slate-800">{c.service}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{c.citizen} · {c.channel} · SLA: <strong className={new Date() > new Date(c.sla) && c.status==='open' ? 'text-red-600' : ''}>{c.sla}</strong></p>
            </div>
            {expanded === c.id ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
          </button>
          {expanded === c.id && (
            <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
              <div className="bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-700"><strong>Notes:</strong> {c.note}</div>
              <div className="flex flex-wrap gap-2">
                {c.status === 'open'      && <><button onClick={() => markResolved(c.id)} className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors"><CheckCircle2 size={11} />Mark Resolved</button><button onClick={() => escalate(c.id)} className="text-xs font-bold text-red-700 border border-red-200 px-3 py-1 rounded-xl hover:bg-red-50 flex items-center gap-1 transition-colors"><AlertTriangle size={11} />Escalate</button></>}
                {c.status === 'resolved'  && <button onClick={() => sendCSAT(c.id)} className="text-xs text-blue-700 border border-blue-200 px-3 py-1 rounded-xl hover:bg-blue-50 flex items-center gap-1 font-semibold transition-colors"><Star size={11} />Send CSAT Survey</button>}
                {c.status === 'escalated' && <button onClick={() => markResolved(c.id)} className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors"><CheckCircle2 size={11} />Mark Resolved</button>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 3 — MYSTERY SHOPPING
// ════════════════════════════════════════════════════════════════
function MysteryShoppingTab() {
  const [audits, setAudits] = useState(MYSTERY_AUDITS_INIT)
  const [expanded, setExpanded] = useState(null)
  const [toastMsg, clearToast, flash] = useToast()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title:'', scope:'' })

  function createSIP(auditId) {
    setAudits(prev => prev.map(a => a.id === auditId ? { ...a, sipCreated:true } : a))
    flash('SIP created from audit findings — routed to relevant Dept Head for action plan')
  }
  function downloadReport(id) {
    flash(`Audit report ${id} queued for PDF download`)
  }
  function planAudit() {
    if (!form.title) return
    const newA = {
      id:`MA-2026-Q2-${String(audits.length + 1).padStart(2,'0')}`,
      title:form.title, scope:form.scope||'To be defined',
      date:new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),
      status:'sip-in-progress', overallScore:0, findings:[], sipCreated:false,
    }
    setAudits(prev => [...prev, newA])
    setForm({ title:'', scope:'' })
    setShowModal(false)
    flash('Audit plan created — shopping team assigned, date confirmation pending')
  }

  const SCORE_COLOR = (s) => s >= 4 ? '#006838' : s >= 3 ? '#f59e0b' : '#ef4444'

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />
      {showModal && (
        <Modal title="Plan Mystery Audit" onClose={() => setShowModal(false)}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Audit Title <span className="text-red-500">*</span></label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="e.g. Q2 2026 Service Experience Audit" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Scope</label>
            <textarea rows={2} className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838] resize-none"
              placeholder="Which services / departments will be audited?" value={form.scope} onChange={e=>setForm(f=>({...f,scope:e.target.value}))} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowModal(false)} className="text-xs text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={planAudit} disabled={!form.title}
              className="text-xs font-bold bg-[#006838] text-white px-4 py-2 rounded-xl hover:bg-[#005530] disabled:opacity-40">Plan Audit</button>
          </div>
        </Modal>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{audits.length} audits · Unannounced visits · 1–5 star scoring</p>
        <AddBtn label="Plan Audit" onClick={() => setShowModal(true)} />
      </div>

      {audits.map(a => (
        <div key={a.id} className="card">
          <button className="w-full flex items-start justify-between" onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
            <div className="text-left flex-1 mr-3">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-mono text-[10px] text-slate-400">{a.id}</span>
                <Pill s={a.status} />
                {a.overallScore > 0 && (
                  <span className="text-[10px] font-bold" style={{ color: SCORE_COLOR(a.overallScore) }}>
                    Overall: {a.overallScore}/5
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-slate-800">{a.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{a.date} · {a.scope}</p>
            </div>
            {expanded === a.id ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
          </button>
          {expanded === a.id && a.findings.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
              {a.findings.map((f,i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold text-slate-700">{f.service}</p>
                    <span className="text-xs font-bold" style={{ color: SCORE_COLOR(f.score) }}>{f.score}/5</span>
                  </div>
                  {f.flags.map((flag,j) => <p key={j} className="text-[11px] text-slate-500">• {flag}</p>)}
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                {!a.sipCreated && <button onClick={() => createSIP(a.id)} className="text-xs font-bold text-amber-700 border border-amber-200 px-3 py-1 rounded-xl hover:bg-amber-50 flex items-center gap-1 transition-colors"><TrendingUp size={11} />Create SIP</button>}
                {a.sipCreated  && <span className="text-xs text-[#006838] font-semibold bg-green-50 border border-green-200 px-3 py-1 rounded-xl flex items-center gap-1"><CheckCircle2 size={11} />SIP Created</span>}
                <button onClick={() => downloadReport(a.id)} className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 flex items-center gap-1 font-semibold transition-colors"><Download size={11} />Download Report</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 4 — CSAT
// ════════════════════════════════════════════════════════════════
function CSATTab() {
  const data = CSAT_DATA
  const [configEditing, setConfigEditing] = useState(false)
  const [config, setConfig] = useState(data.surveyConfig)
  const [sipCreated, setSIPCreated] = useState(false)
  const [toastMsg, clearToast, flash] = useToast()

  function saveConfig() {
    setConfigEditing(false)
    flash('CSAT survey configuration saved — changes take effect for next trigger cycle')
  }
  function createSIP() {
    setSIPCreated(true)
    flash('SIP created for ICT Helpdesk (score 2.9) — routed to Head of ICT with 30-day improvement mandate')
  }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />

      {data.sipAlert.triggered && !sipCreated && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex items-start gap-3">
          <TriangleAlert size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 flex-1">
            <strong>SIP Trigger:</strong> {data.sipAlert.service} CSAT score ({data.sipAlert.score}) fell below threshold ({data.sipAlert.threshold}) — a Service Improvement Plan is required within 5 business days.
          </p>
          <button onClick={createSIP}
            className="flex-shrink-0 text-xs font-bold text-amber-700 border border-amber-300 px-3 py-1 rounded-xl hover:bg-amber-100 transition-colors">
            Create SIP
          </button>
        </div>
      )}
      {sipCreated && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3 text-xs text-[#006838] font-semibold">
          ✓ SIP created for {data.sipAlert.service} — ICT Head notified, 30-day improvement window started
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Overall CSAT Score',   value:`${data.overallScore}/5.0`, color:'text-[#006838]' },
          { label:'Response Rate',         value:`${data.responseRate}%`,   color:'text-blue-600'  },
          { label:'Total Responses',       value:data.totalResponses,       color:'text-slate-700' },
        ].map((s,i) => (
          <div key={i} className="card py-3 text-center">
            <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <Card>
        <p className="text-xs font-bold text-slate-700 mb-3">Score by Service</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data.byService} layout="vertical">
            <XAxis type="number" domain={[0,5]} tick={{ fontSize:9, fill:'#94a3b8' }} />
            <YAxis type="category" dataKey="service" width={130} tick={{ fontSize:9, fill:'#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => [`${v}/5`,'Score']} />
            <Bar dataKey="score" name="Score" radius={[0,4,4,0]}>
              {data.byService.map((e,i) => <Cell key={i} fill={e.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-slate-700">Survey Configuration</p>
          {!configEditing
            ? <button onClick={() => setConfigEditing(true)} className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 font-semibold transition-colors flex items-center gap-1"><RefreshCw size={10} />Edit Survey Config</button>
            : <button onClick={saveConfig} className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 transition-colors">Save Changes</button>}
        </div>
        {configEditing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Method</label>
                <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#006838]"
                  value={config.method} onChange={e=>setConfig(c=>({...c,method:e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trigger Point</label>
                <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#006838]"
                  value={config.triggerPoint} onChange={e=>setConfig(c=>({...c,triggerPoint:e.target.value}))} />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { label:'Delivery Method',  value:config.method        },
              { label:'Trigger Point',    value:config.triggerPoint  },
              { label:'Scale',            value:config.scale         },
              { label:'Channels',         value:config.channels.join(', ') },
            ].map((item,i) => (
              <div key={i}><span className="text-slate-400 font-semibold">{item.label}: </span><span className="text-slate-700 font-semibold">{item.value}</span></div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 5 — SERVICE IMPROVEMENT PLANS
// ════════════════════════════════════════════════════════════════
function SIPTab() {
  const [sips, setSIPs] = useState(SIPS_INIT)
  const [expanded, setExpanded] = useState(null)
  const [toastMsg, clearToast, flash] = useToast()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title:'', source:'CSAT trigger', owner:'' })

  function toggleAction(sipId, actionIdx) {
    setSIPs(prev => prev.map(s => s.id !== sipId ? s : {
      ...s,
      actions: s.actions.map((a,i) => i === actionIdx ? { ...a, done:!a.done } : a)
    }))
  }
  function verifyClose(sipId) {
    setSIPs(prev => prev.map(s => s.id === sipId ? { ...s, status:'closed', dgSignOff:true } : s))
    flash(`${sipId} — SIP verified and closed. Final report sent to DG for sign-off.`)
  }
  function exportSIP(sipId) {
    flash(`SIP ${sipId} exported — PDF report queued for download`)
  }
  function createSIP() {
    if (!form.title) return
    const newS = {
      id:`SIP-2026-${String(sips.length + 4).padStart(3,'0')}`,
      title:form.title, source:form.source, triggerScore:null, threshold:null,
      status:'in-progress', owner:form.owner||'TBD', dueDate:'TBD', dgSignOff:false, reportSent:false,
      actions:[{ action:'Define corrective actions', owner:'Dept Head', deadline:'TBD', done:false }],
    }
    setSIPs(prev => [...prev, newS])
    setForm({ title:'', source:'CSAT trigger', owner:'' })
    setShowModal(false)
    flash('SIP created — routed to department head for action plan completion')
  }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />
      {showModal && (
        <Modal title="Create Service Improvement Plan" onClose={() => setShowModal(false)}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">SIP Title <span className="text-red-500">*</span></label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="e.g. Admin — Document Turnaround Plan" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Source</label>
              <select className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                value={form.source} onChange={e=>setForm(f=>({...f,source:e.target.value}))}>
                {['CSAT trigger','Mystery shopping','Complaint escalation','DG directive'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Owner</label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="e.g. Head of ICT" value={form.owner} onChange={e=>setForm(f=>({...f,owner:e.target.value}))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowModal(false)} className="text-xs text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={createSIP} disabled={!form.title}
              className="text-xs font-bold bg-[#006838] text-white px-4 py-2 rounded-xl hover:bg-[#005530] disabled:opacity-40">Create SIP</button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Active',   value: sips.filter(s=>s.status==='in-progress').length, color:'text-amber-600' },
          { label:'Closed',   value: sips.filter(s=>s.status==='closed').length,      color:'text-[#006838]' },
          { label:'Overdue',  value: 0,                                                color:'text-red-600'   },
        ].map((s,i) => (
          <div key={i} className="card py-3 text-center">
            <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{sips.length} plans · Action-item level tracking · DG sign-off required for closure</p>
        <AddBtn label="Create SIP" onClick={() => setShowModal(true)} />
      </div>

      {sips.map(s => {
        const doneCount = s.actions.filter(a=>a.done).length
        const progress = Math.round((doneCount / s.actions.length) * 100)
        return (
          <div key={s.id} className="card">
            <button className="w-full flex items-start justify-between" onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
              <div className="text-left flex-1 mr-3">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-mono text-[10px] text-slate-400">{s.id}</span>
                  <Pill s={s.status} />
                </div>
                <p className="text-sm font-bold text-slate-800">{s.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Source: {s.source} · Owner: {s.owner} · Due: {s.dueDate}</p>
                <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-[#006838] h-1.5 rounded-full transition-all" style={{ width:`${progress}%` }} />
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5">{doneCount}/{s.actions.length} actions complete ({progress}%)</p>
              </div>
              {expanded === s.id ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
            </button>
            {expanded === s.id && (
              <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Action Items</p>
                {s.actions.map((action, ai) => (
                  <button key={ai} onClick={() => toggleAction(s.id, ai)}
                    className={`w-full flex items-center gap-2.5 text-xs text-left px-3 py-2 rounded-xl border transition-all ${action.done ? 'bg-green-50 border-green-200 text-[#006838]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                    <span className={`w-4 h-4 rounded-md border flex-shrink-0 flex items-center justify-center ${action.done ? 'bg-[#006838] border-[#006838]' : 'border-slate-300 bg-white'}`}>
                      {action.done && <CheckCircle2 size={10} className="text-white" />}
                    </span>
                    <div className="flex-1">
                      <span className={action.done ? 'line-through opacity-60' : ''}>{action.action}</span>
                      <span className="ml-2 text-[9px] text-slate-400">({action.owner} · {action.deadline})</span>
                    </div>
                  </button>
                ))}
                <div className="flex flex-wrap gap-2">
                  {s.status === 'in-progress' && progress === 100 && <button onClick={() => verifyClose(s.id)} className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors"><CheckCircle2 size={11} />Verify & Close SIP</button>}
                  <button onClick={() => exportSIP(s.id)} className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 flex items-center gap-1 font-semibold transition-colors"><Download size={11} />Export SIP</button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 6 — REGULATORY REPORTING
// ════════════════════════════════════════════════════════════════
function RegulatoryReportingTab() {
  const [reports, setReports] = useState(REGULATORY_REPORTS_INIT)
  const [toastMsg, clearToast, flash] = useToast()
  const [showModal, setShowModal] = useState(false)

  function routeToDG(id) {
    setReports(prev => prev.map(r => r.id === id ? { ...r, dgSignOff:true } : r))
    flash(`${id} routed to DG — sign-off request sent via internal workflow + email`)
  }
  function submitToPortal(id) {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status:'submitted', submittedToPortal:true, submittedDate:new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) } : r))
    flash(`${id} submitted to SERVICOM National Portal — confirmation receipt expected within 24 hours`)
  }
  function downloadPDF(id) {
    flash(`${id} PDF report queued for download`)
  }
  function startQ2Report() {
    const newR = {
      id:'REP-Q2-2026', title:'Q2 2026 SERVICOM Compliance Report', period:'Apr–Jun 2026',
      status:'draft', dueDate:'15 Jul 2026', submittedDate:null, dgSignOff:false, submittedToPortal:false,
      sections:[
        { title:'Complaints Summary',        status:'draft', count:0, resolved:0, escalated:0, open:0 },
        { title:'CSAT Analysis',             status:'draft', overallScore:null },
        { title:'Mystery Shopping Results',  status:'draft', auditsCompleted:0 },
        { title:'SIP Progress Summary',      status:'draft', activeSIPs:0 },
        { title:'Service Charter Adherence', status:'draft', overallCompliance:null },
      ],
    }
    setReports(prev => {
      const exists = prev.some(r => r.id === 'REP-Q2-2026')
      return exists ? prev : [newR, ...prev]
    })
    setShowModal(false)
    flash('Q2 2026 report started — sections seeded from live system data, ready for review')
  }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{reports.length} compliance reports · Quarterly SERVICOM mandate</p>
        <AddBtn label="Start Q2 Report" onClick={startQ2Report} />
      </div>

      <Card>
        <p className="text-xs font-bold text-slate-700 mb-2">Reporting Calendar</p>
        <div className="space-y-0.5">
          {['Q1: Deadline 15 Apr → 15 Apr 2026','Q2: Deadline 15 Jul → 15 Jul 2026','Q3: Deadline 15 Oct → 15 Oct 2026','Q4: Deadline 15 Jan → 15 Jan 2027'].map((row,i) => (
            <div key={i} className="flex items-center gap-3 text-xs py-1 border-b border-slate-50 last:border-0">
              <span className="font-bold text-slate-500 w-28">{row.split(':')[0]}</span>
              <span className="text-slate-400">{row.split('→')[1]?.trim()}</span>
            </div>
          ))}
        </div>
      </Card>

      {reports.map(r => (
        <div key={r.id} className="card space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-[10px] text-slate-400">{r.id}</span>
                <Pill s={r.status} />
                {r.dgSignOff && <span className="text-[10px] font-bold text-[#006838] bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">DG Signed ✓</span>}
              </div>
              <p className="text-sm font-bold text-slate-800">{r.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Period: {r.period} · Due: {r.dueDate}{r.submittedDate ? ` · Submitted: ${r.submittedDate}` : ''}</p>
            </div>
          </div>

          {r.sections && (
            <div className="space-y-1">
              {r.sections.map((sec,i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                  <span className="font-semibold text-slate-700">{sec.title}</span>
                  <Pill s={sec.status} />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {r.status === 'draft' && !r.dgSignOff    && <button onClick={() => routeToDG(r.id)} className="text-xs font-bold text-amber-700 border border-amber-200 px-3 py-1 rounded-xl hover:bg-amber-50 flex items-center gap-1 transition-colors"><Send size={11} />Route to DG for Sign-off</button>}
            {r.dgSignOff && !r.submittedToPortal      && <button onClick={() => submitToPortal(r.id)} className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors"><CheckCircle2 size={11} />Submit to SERVICOM Portal</button>}
            <button onClick={() => downloadPDF(r.id)} className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 flex items-center gap-1 font-semibold transition-colors"><Download size={11} />Download PDF</button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 7 — ROLES & INTEGRATIONS
// ════════════════════════════════════════════════════════════════
function RolesTab() {
  const roles = Object.keys(SVC_ROLE_MATRIX)
  const modules = Object.keys(SVC_ROLE_MATRIX[roles[0]])
  return (
    <div className="space-y-5">
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
                      {SVC_ROLE_MATRIX[role][mod]?.map((p,j) => (
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
      <Card>
        <p className="text-sm font-bold text-slate-800 mb-3">System Integration Points</p>
        <div className="space-y-2">
          {SVC_INTEGRATIONS.map((int,i) => (
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
  { id:'charter',    label:'Service Charter',     icon: ClipboardCheck },
  { id:'complaints', label:'Complaints',           icon: MessageSquare  },
  { id:'mystery',    label:'Mystery Shopping',     icon: Search         },
  { id:'csat',       label:'CSAT',                 icon: Star           },
  { id:'sip',        label:'SIP',                  icon: TrendingUp     },
  { id:'reporting',  label:'Regulatory Reporting', icon: FileText       },
  { id:'roles',      label:'Roles & Integrations', icon: Shield         },
]

export default function SERVICOMPage() {
  const [tab, setTab] = useState('charter')

  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">SERVICOM Workbench</h1>
            <p className="text-sm text-slate-400">Service Charter · Complaints · Mystery Shopping · CSAT · SIP · Regulatory Reporting</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label:'Open Complaints',   value: COMPLAINTS_INIT.filter(c=>c.status==='open').length,   icon:MessageSquare,  bg:'bg-blue-50',   color:'text-blue-600'   },
          { label:'Escalated',         value: COMPLAINTS_INIT.filter(c=>c.status==='escalated').length,icon:AlertTriangle,bg:'bg-red-50',    color:'text-red-600'    },
          { label:'Active SIPs',       value: SIPS_INIT.filter(s=>s.status==='in-progress').length,   icon:TrendingUp,    bg:'bg-amber-50',  color:'text-amber-600'  },
          { label:'CSAT Score',        value:`${CSAT_DATA.overallScore}/5`,                           icon:Star,          bg:'bg-green-50',  color:'text-[#006838]'  },
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

      {tab === 'charter'    && <ServiceCharterTab />}
      {tab === 'complaints' && <ComplaintsTab />}
      {tab === 'mystery'    && <MysteryShoppingTab />}
      {tab === 'csat'       && <CSATTab />}
      {tab === 'sip'        && <SIPTab />}
      {tab === 'reporting'  && <RegulatoryReportingTab />}
      {tab === 'roles'      && <RolesTab />}
    </div>
  )
}
