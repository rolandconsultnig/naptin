import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NAPTIN_LOGO } from '../assets/images'
import {
  Shield, Lock, Eye, EyeOff, AlertTriangle, CheckCircle2,
  Upload, ChevronRight, ChevronLeft, Send, Phone, Mail,
  FileText, Clock, RefreshCw, ArrowLeft, Copy, Check,
  User, EyeOff as AnonymousIcon, Info, ExternalLink,
} from 'lucide-react'

/* ──────────────────────────────────────────────────────────────
   CONSTANTS
────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { value: 'financial-fraud',        label: 'Financial Fraud / Embezzlement' },
  { value: 'procurement-fraud',      label: 'Procurement Fraud / Contract Splitting' },
  { value: 'bribery-extortion',      label: 'Bribery / Extortion / Gratification' },
  { value: 'hr-abuse',               label: 'HR Abuse / Nepotism / Ghost Workers' },
  { value: 'asset-misappropriation', label: 'Asset Misappropriation / Theft' },
  { value: 'conflict-of-interest',   label: 'Conflict of Interest' },
  { value: 'falsification',          label: 'Falsification of Records / Documents' },
  { value: 'other',                  label: 'Other (describe below)' },
]

const DEPARTMENTS = [
  'Office of the DG', 'Planning, Research & Statistics', 'Finance & Accounts',
  'Human Resources', 'Procurement', 'ICT', 'Training Department',
  'SERVICOM Unit', 'Public Affairs', 'Legal / Board Secretariat',
  'ACTU', 'Admin & Services', 'Other / Unknown',
]

const WITNESS_TYPES = [
  { value: 'direct',    label: 'I directly witnessed the incident' },
  { value: 'documents', label: 'I obtained supporting documents' },
  { value: 'informed',  label: 'I was informed by a credible third party' },
  { value: 'pattern',   label: 'I observed a suspicious pattern over time' },
]

const STATUS_MAP = {
  'ACTU-2026-0001': { status: 'under-investigation', risk: 'High',   update: 'Case assigned to ACTU Investigator. Preliminary fact-finding ongoing.' , sla: 22 },
  'ACTU-2026-0002': { status: 'referred-to-icpc',    risk: 'High',   update: 'Case file transmitted to ICPC. Awaiting acknowledgement number.',          sla: 30 },
  'ACTU-2026-0003': { status: 'closed',              risk: 'Medium', update: 'Investigation concluded. Findings forwarded to HOD for disciplinary action.', sla: 60 },
  'ACTU-2026-0004': { status: 'received',            risk: 'Medium', update: 'Report received. Triage under way by ACTU Chair (SLA: 30 days).',            sla: 4  },
}

const STATUS_LABELS = {
  'received':            { label: 'Report Received',         color: 'bg-blue-100   text-blue-800   border-blue-200'   },
  'under-investigation': { label: 'Under Investigation',     color: 'bg-amber-100  text-amber-800  border-amber-200'  },
  'referred-to-icpc':    { label: 'Referred to ICPC',        color: 'bg-purple-100 text-purple-800 border-purple-200' },
  'closed':              { label: 'Closed',                  color: 'bg-slate-100  text-slate-600  border-slate-200'  },
}

const RISK_KEYWORDS = {
  High:   ['million', 'billion', 'contract', 'tender', 'award', 'bribe', 'splitting', 'kickback', 'embezzle', 'siphon', 'fraud'],
  Medium: ['gift', 'favour', 'favorit', 'skip', 'bypass', 'ghost', 'inflate', 'overstate'],
}

function autoRiskScore(text) {
  const low = text.toLowerCase()
  if (RISK_KEYWORDS.High.some(k => low.includes(k)))   return 'High'
  if (RISK_KEYWORDS.Medium.some(k => low.includes(k))) return 'Medium'
  return 'Low'
}

function genTicketId() {
  const num = String(Math.floor(Math.random() * 9000) + 1000)
  return `ACTU-2026-${num}`
}

function genPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/* ──────────────────────────────────────────────────────────────
   SMALL REUSABLE COMPONENTS
────────────────────────────────────────────────────────────── */
function StepDot({ n, active, done }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all ${
      done   ? 'bg-[#006838] border-[#006838] text-white' :
      active ? 'bg-white border-[#006838] text-[#006838]' :
               'bg-white border-slate-200 text-slate-400'
    }`}>
      {done ? <Check size={13} /> : n}
    </div>
  )
}

function Label({ children, required }) {
  return (
    <label className="block text-xs font-bold text-slate-700 mb-1">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  )
}

function Input({ ...p }) {
  return (
    <input
      {...p}
      className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#006838]/30 focus:border-[#006838] bg-white placeholder:text-slate-300 transition"
    />
  )
}

function Select({ children, ...p }) {
  return (
    <select
      {...p}
      className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#006838]/30 focus:border-[#006838] bg-white appearance-none transition"
    >
      {children}
    </select>
  )
}

function Textarea({ ...p }) {
  return (
    <textarea
      {...p}
      className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#006838]/30 focus:border-[#006838] bg-white placeholder:text-slate-300 transition resize-none"
    />
  )
}

function CopyBtn({ value }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy}
      className="ml-2 p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-[#006838] hover:border-[#006838] transition">
      {copied ? <Check size={13} className="text-[#006838]" /> : <Copy size={13} />}
    </button>
  )
}

/* ──────────────────────────────────────────────────────────────
   MAIN PAGE
────────────────────────────────────────────────────────────── */
export default function WhistleblowerPortalPage() {
  const navigate = useNavigate()
  const [view, setView]   = useState('home')   // home | submit | status
  const [step, setStep]   = useState(1)        // 1..4

  // Step 1
  const [submType, setSubmType]     = useState('anonymous')  // anonymous | identified
  const [category, setCategory]     = useState('')
  const [consent, setConsent]       = useState(false)

  // Step 2
  const [incidentDate, setIncidentDate] = useState('')
  const [dept, setDept]                 = useState('')
  const [witness, setWitness]           = useState('')
  const [involved, setInvolved]         = useState('')
  const [description, setDescription]   = useState('')
  const [files, setFiles]               = useState([])
  const [showId, setShowId]             = useState(false)
  const [reporterName, setReporterName] = useState('')
  const [reporterEmail, setReporterEmail] = useState('')
  const [reporterPhone, setReporterPhone] = useState('')

  // Step 3 (review) — no extra state

  // Step 4 (confirmation)
  const [ticket, setTicket]   = useState('')
  const [pwd, setPwd]         = useState('')
  const [riskScore, setRiskScore] = useState('Low')

  // Status check
  const [checkId, setCheckId]     = useState('')
  const [checkPwd, setCheckPwd]   = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [statusResult, setStatusResult] = useState(null)
  const [statusError, setStatusError]   = useState('')

  // Validation helpers
  const step1Valid = category && consent
  const step2Valid = incidentDate && dept && witness && description.length >= 50
  const step3Valid = true

  // ── Submit handler ──
  function handleSubmit() {
    const t   = genTicketId()
    const p   = genPassword()
    const rs  = autoRiskScore(description)
    setTicket(t)
    setPwd(p)
    setRiskScore(rs)
    setStep(4)
  }

  // ── Status check handler ──
  function handleStatusCheck() {
    setStatusError('')
    setStatusResult(null)
    const key = checkId.trim().toUpperCase()
    if (!checkId || !checkPwd) {
      setStatusError('Please enter both your Ticket ID and the access password.')
      return
    }
    if (STATUS_MAP[key]) {
      setStatusResult(STATUS_MAP[key])
    } else {
      setStatusError('No report found with that Ticket ID. Please check and try again.')
    }
  }

  // ── File handler ──
  function handleFile(e) {
    const accepted = Array.from(e.target.files).filter(f =>
      ['application/pdf', 'image/jpeg', 'image/png',
       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(f.type)
      && f.size <= 5 * 1024 * 1024
    )
    setFiles(prev => [...prev, ...accepted].slice(0, 3))
  }

  // ── Progress timeline step labels ──
  const STEPS = ['Submission Type', 'Incident Details', 'Review', 'Confirmation']

  /* ─────── HOME LANDING ─────── */
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F7FAF8] to-slate-50 flex flex-col">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={NAPTIN_LOGO} alt="NAPTIN" className="w-9 h-9 object-contain" />
            <div>
              <p className="text-[11px] font-bold text-[#006838] tracking-widest uppercase">NAPTIN</p>
              <p className="text-xs text-slate-500 font-medium">Anti-Corruption Transparency Unit</p>
            </div>
          </div>
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#006838] font-semibold transition">
            <ArrowLeft size={13} />Back to ACTU Workbench
          </button>
        </header>

        {/* Hero */}
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-[#006838] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-900/20">
              <Shield size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Whistleblower Submission Portal</h1>
            <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              Report corruption, fraud, or misconduct in confidence. Every report is handled with strict confidentiality
              under the ICPC Act 2000, the Corrupt Practices (Amendment) Act, and the Whistleblower Protection Policy.
            </p>
          </div>

          {/* Commitment strip */}
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-8 flex items-start gap-3">
            <Shield size={16} className="text-[#006838] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#006838] mb-1">Your Protection is Guaranteed</p>
              <p className="text-xs text-green-800 leading-relaxed">
                NAPTIN is committed to protecting reporters from retaliation. Anonymous reports contain no identifying metadata.
                Identified reports are encrypted at rest (AES-256) and accessible only to the ACTU Chair.
                This system does not log IP addresses or browsing fingerprints.
              </p>
            </div>
          </div>

          {/* Action cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <button onClick={() => { setView('submit'); setStep(1) }}
              className="bg-white border-2 border-[#006838] rounded-2xl p-6 text-left hover:bg-green-50 transition group shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#006838] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Send size={18} className="text-white" />
              </div>
              <p className="text-sm font-extrabold text-slate-900 mb-1">Submit a New Report</p>
              <p className="text-xs text-slate-500">
                Report corrupt practices, financial fraud, procurement irregularities, or abuse of office.
                You can submit anonymously or with your identity protected.
              </p>
              <div className="flex items-center gap-1 text-[#006838] text-xs font-bold mt-4">
                Start Report <ChevronRight size={12} />
              </div>
            </button>

            <button onClick={() => setView('status')}
              className="bg-white border border-slate-200 rounded-2xl p-6 text-left hover:border-[#006838] hover:bg-green-50 transition group shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Clock size={18} className="text-slate-600" />
              </div>
              <p className="text-sm font-extrabold text-slate-900 mb-1">Check Report Status</p>
              <p className="text-xs text-slate-500">
                Track the progress of your existing report using your Ticket ID and the access password
                that was issued when you submitted.
              </p>
              <div className="flex items-center gap-1 text-slate-500 text-xs font-bold mt-4">
                Check Status <ChevronRight size={12} />
              </div>
            </button>
          </div>

          {/* Contacts */}
          <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Alternative Report Channels</p>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <Phone size={13} className="text-[#006838] flex-shrink-0" />
              <span>ACTU Confidential Hotline: <strong>0800-NAPTIN-ACTU</strong> (toll-free)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <Mail size={13} className="text-[#006838] flex-shrink-0" />
              <span>Email: <strong>actu-confidential@naptin.gov.ng</strong> (encrypted inbox)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <ExternalLink size={13} className="text-[#006838] flex-shrink-0" />
              <span>ICPC Direct Portal: <strong>icpc.gov.ng/report</strong></span>
            </div>
          </div>
        </main>

        <footer className="text-center text-[11px] text-slate-400 py-4 border-t border-slate-100">
          NAPTIN Anti-Corruption Transparency Unit · Reports are protected under ICPC Act 2000 § 64 & Whistleblower Protection Policy
        </footer>
      </div>
    )
  }

  /* ─────── STATUS CHECK VIEW ─────── */
  if (view === 'status') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F7FAF8] to-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={NAPTIN_LOGO} alt="NAPTIN" className="w-9 h-9 object-contain" />
            <div>
              <p className="text-[11px] font-bold text-[#006838] tracking-widest uppercase">NAPTIN · ACTU</p>
              <p className="text-xs text-slate-500 font-medium">Report Status Check</p>
            </div>
          </div>
          <button onClick={() => { setView('home'); setStatusResult(null); setStatusError('') }}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#006838] font-semibold transition">
            <ArrowLeft size={13} />Back
          </button>
        </header>

        <main className="flex-1 max-w-lg mx-auto w-full px-6 py-12">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Clock size={22} className="text-slate-600" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Check Your Report Status</h2>
            <p className="text-xs text-slate-400 mt-1">Enter your Ticket ID and access password from your confirmation page.</p>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
            <div>
              <Label required>Ticket ID</Label>
              <Input
                placeholder="e.g. ACTU-2026-0001"
                value={checkId}
                onChange={e => setCheckId(e.target.value)}
              />
            </div>
            <div>
              <Label required>Access Password</Label>
              <div className="relative">
                <Input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="8-character password"
                  value={checkPwd}
                  onChange={e => setCheckPwd(e.target.value)}
                  className="pr-10"
                />
                <button type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {statusError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle size={13} className="flex-shrink-0" />{statusError}
              </div>
            )}

            <button onClick={handleStatusCheck}
              className="w-full bg-[#006838] text-white text-sm font-bold py-2.5 rounded-xl hover:bg-[#005530] transition">
              Check Status
            </button>
          </div>

          {/* Status result */}
          {statusResult && (
            <div className="mt-6 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Report Status</p>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_LABELS[statusResult.status].color}`}>
                  {STATUS_LABELS[statusResult.status].label}
                </span>
              </div>

              {/* Status pipeline */}
              <div className="flex items-center gap-0">
                {['received', 'under-investigation', 'referred-to-icpc', 'closed'].map((s, i, arr) => {
                  const stages = ['received', 'under-investigation', 'referred-to-icpc', 'closed']
                  const currentIdx = stages.indexOf(statusResult.status)
                  const isActive = i <= currentIdx
                  return (
                    <div key={s} className="flex items-center flex-1 min-w-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold flex-shrink-0 border-2 ${
                        isActive ? 'bg-[#006838] border-[#006838] text-white' : 'bg-white border-slate-200 text-slate-300'
                      }`}>{i + 1}</div>
                      {i < arr.length - 1 && (
                        <div className={`flex-1 h-0.5 ${isActive && i < currentIdx ? 'bg-[#006838]' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                <span>Received</span>
                <span>Investigating</span>
                <span>ICPC Referral</span>
                <span>Closed</span>
              </div>

              <div className="bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-[11px] font-bold text-slate-500 mb-1">Latest Update</p>
                <p className="text-xs text-slate-700">{statusResult.update}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Risk Classification: <strong className={`${statusResult.risk === 'High' ? 'text-red-600' : statusResult.risk === 'Medium' ? 'text-amber-600' : 'text-green-700'}`}>{statusResult.risk}</strong></span>
                <span>SLA: <strong>{statusResult.sla} days remaining</strong></span>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-start gap-2">
                <Shield size={12} className="text-[#006838] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-green-800">
                  Your identity remains protected. ACTU Officers handling this report are bound by confidentiality obligations.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    )
  }

  /* ─────── SUBMISSION FORM VIEW ─────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7FAF8] to-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="NAPTIN" className="w-9 h-9 object-contain" />
          <div>
            <p className="text-[11px] font-bold text-[#006838] tracking-widest uppercase">NAPTIN · ACTU</p>
            <p className="text-xs text-slate-500 font-medium">Whistleblower Submission Portal</p>
          </div>
        </div>
        <button
          onClick={() => step > 1 ? setStep(s => s - 1) : setView('home')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#006838] font-semibold transition">
          <ArrowLeft size={13} />{step > 1 ? 'Previous Step' : 'Back'}
        </button>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        {/* Progress tracker */}
        <div className="mb-8">
          <div className="flex items-start gap-0">
            {STEPS.map((label, i) => {
              const n = i + 1
              const active = step === n
              const done   = step > n
              const last   = i === STEPS.length - 1
              return (
                <div key={n} className="flex items-start flex-1 min-w-0">
                  <div className="flex flex-col items-center">
                    <StepDot n={n} active={active} done={done} />
                    <span className={`text-[9px] font-bold mt-1 text-center whitespace-nowrap ${active ? 'text-[#006838]' : done ? 'text-slate-400' : 'text-slate-300'}`}>
                      {label}
                    </span>
                  </div>
                  {!last && (
                    <div className={`flex-1 h-0.5 mt-4 mx-1 ${done ? 'bg-[#006838]' : 'bg-slate-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── STEP 1: Submission Type ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 mb-0.5">How would you like to submit?</h2>
              <p className="text-xs text-slate-400">Choose your submission type and report category.</p>
            </div>

            {/* Submission type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  val: 'anonymous',
                  icon: Lock,
                  title: 'Anonymous',
                  desc: 'No identity stored. Your report will be handled purely on its merit. You cannot receive direct feedback but can check status using your Ticket ID.',
                  badge: 'Recommended',
                },
                {
                  val: 'identified',
                  icon: User,
                  title: 'Identified (Confidential)',
                  desc: 'Your contact details are encrypted and accessible only to the ACTU Chair. Enables richer investigation follow-up and formal witness statement.',
                  badge: null,
                },
              ].map(opt => (
                <button key={opt.val} onClick={() => setSubmType(opt.val)}
                  className={`relative text-left rounded-2xl border-2 p-4 transition ${
                    submType === opt.val
                      ? 'border-[#006838] bg-green-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}>
                  {opt.badge && (
                    <span className="absolute top-3 right-3 text-[9px] font-extrabold text-[#006838] bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
                      {opt.badge}
                    </span>
                  )}
                  <opt.icon size={18} className={`mb-2 ${submType === opt.val ? 'text-[#006838]' : 'text-slate-400'}`} />
                  <p className={`text-xs font-extrabold mb-1 ${submType === opt.val ? 'text-[#006838]' : 'text-slate-700'}`}>{opt.title}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>

            {/* Category */}
            <div>
              <Label required>Type of Misconduct</Label>
              <Select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">— Select a category —</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </div>

            {/* Consent */}
            <label className="flex items-start gap-3 cursor-pointer bg-white border border-slate-100 rounded-xl p-4">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                className="mt-0.5 accent-[#006838] w-4 h-4 flex-shrink-0 cursor-pointer" />
              <span className="text-xs text-slate-600 leading-relaxed">
                I confirm that the information I am submitting is accurate to the best of my knowledge.
                I understand that NAPTIN/ACTU may refer this matter to ICPC or other relevant agencies as required by law.
                I consent to this report being handled under the terms of NAPTIN's Whistleblower Protection Policy.
              </span>
            </label>

            {/* Legal notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <Info size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800">
                Deliberately false reports may attract liability under Section 18 of the ICPC Act.
                This portal is for genuine good-faith disclosures only.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => step1Valid && setStep(2)}
                disabled={!step1Valid}
                className={`flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition ${
                  step1Valid
                    ? 'bg-[#006838] text-white hover:bg-[#005530]'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}>
                Continue <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Incident Details ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 mb-0.5">Incident Details</h2>
              <p className="text-xs text-slate-400">Provide as much detail as you can. All fields marked * are required.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>Date of Incident (approx.)</Label>
                <Input type="date" value={incidentDate} onChange={e => setIncidentDate(e.target.value)} />
              </div>
              <div>
                <Label required>Department / Unit Involved</Label>
                <Select value={dept} onChange={e => setDept(e.target.value)}>
                  <option value="">— Select department —</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
              </div>
            </div>

            <div>
              <Label required>How did you witness this?</Label>
              <Select value={witness} onChange={e => setWitness(e.target.value)}>
                <option value="">— Select witness type —</option>
                {WITNESS_TYPES.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
              </Select>
            </div>

            <div>
              <Label>Persons / Parties Involved (optional — will be encrypted)</Label>
              <Input
                placeholder="Name(s), title(s), or designation — leave blank if unknown"
                value={involved}
                onChange={e => setInvolved(e.target.value)}
              />
            </div>

            <div>
              <Label required>Full Description of the Incident</Label>
              <Textarea
                rows={6}
                placeholder="Describe what happened in detail. Include dates, amounts, contract/tender numbers, or any other specifics you know. Minimum 50 characters."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-slate-400">{description.length} characters {description.length < 50 ? `— ${50 - description.length} more needed` : '✓'}</p>
                {description.length >= 50 && (
                  <p className="text-[10px] font-bold text-[#006838]">
                    Auto risk: {autoRiskScore(description)}
                  </p>
                )}
              </div>
            </div>

            {/* File attachment */}
            <div>
              <Label>Supporting Documents (optional — max 3 files, 5 MB each)</Label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-5 cursor-pointer hover:border-[#006838] hover:bg-green-50 transition">
                <Upload size={18} className="text-slate-400 mb-2" />
                <p className="text-xs text-slate-500 font-semibold">Click to attach files</p>
                <p className="text-[10px] text-slate-400 mt-0.5">PDF, JPG, PNG, DOCX · Max 5 MB each</p>
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.docx" className="hidden" onChange={handleFile} />
              </label>
              {files.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <FileText size={12} className="text-[#006838]" />
                      {f.name} <span className="text-slate-400">({(f.size / 1024).toFixed(0)} KB)</span>
                      <button onClick={() => setFiles(files.filter((_, j) => j !== i))}
                        className="ml-auto text-red-400 hover:text-red-600 text-[10px]">Remove</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Identified fields */}
            {submType === 'identified' && (
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
                <div className="flex items-center gap-2">
                  <Lock size={13} className="text-[#006838]" />
                  <p className="text-xs font-bold text-slate-700">Your Contact Details (encrypted — ACTU Chair only)</p>
                </div>
                <div>
                  <Label required>Full Name</Label>
                  <Input placeholder="Your name" value={reporterName} onChange={e => setReporterName(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Email Address</Label>
                    <Input type="email" placeholder="you@example.com" value={reporterEmail} onChange={e => setReporterEmail(e.target.value)} />
                  </div>
                  <div>
                    <Label>Phone (optional)</Label>
                    <Input placeholder="+234 …" value={reporterPhone} onChange={e => setReporterPhone(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#006838] transition">
                <ChevronLeft size={13} />Back
              </button>
              <button
                onClick={() => step2Valid && setStep(3)}
                disabled={!step2Valid}
                className={`flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition ${
                  step2Valid
                    ? 'bg-[#006838] text-white hover:bg-[#005530]'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}>
                Review Report <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 mb-0.5">Review Your Report</h2>
              <p className="text-xs text-slate-400">Please review all details carefully before submitting. This is your final chance to edit.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-50 overflow-hidden shadow-sm">
              {[
                { label: 'Submission Type',         value: submType === 'anonymous' ? 'Anonymous' : 'Identified (Confidential)' },
                { label: 'Category',                value: CATEGORIES.find(c => c.value === category)?.label ?? category },
                { label: 'Date of Incident',        value: incidentDate },
                { label: 'Department',              value: dept },
                { label: 'Witness Type',            value: WITNESS_TYPES.find(w => w.value === witness)?.label ?? witness },
                { label: 'Parties Involved',        value: involved || '(Not specified)' },
                { label: 'Attachments',             value: files.length > 0 ? `${files.length} file(s)` : 'None' },
              ].map(row => (
                <div key={row.label} className="flex items-start px-5 py-3">
                  <span className="text-[11px] font-bold text-slate-400 w-40 flex-shrink-0">{row.label}</span>
                  <span className="text-xs text-slate-700">{row.value}</span>
                </div>
              ))}
              <div className="px-5 py-3">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">Description</span>
                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{description}</p>
              </div>
            </div>

            {/* Auto risk preview */}
            <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${
              autoRiskScore(description) === 'High'   ? 'bg-red-50    border-red-200'    :
              autoRiskScore(description) === 'Medium' ? 'bg-amber-50  border-amber-200'  :
                                                        'bg-green-50  border-green-200'
            }`}>
              <AlertTriangle size={14} className={`flex-shrink-0 mt-0.5 ${
                autoRiskScore(description) === 'High' ? 'text-red-500' : autoRiskScore(description) === 'Medium' ? 'text-amber-500' : 'text-green-600'
              }`} />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Estimated Risk Score: <span className={`${autoRiskScore(description) === 'High' ? 'text-red-600' : autoRiskScore(description) === 'Medium' ? 'text-amber-600' : 'text-[#006838]'}`}>{autoRiskScore(description)}</span>
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {autoRiskScore(description) === 'High'
                    ? 'SLA: 30 days for preliminary assessment. ACTU Chair will be notified immediately.'
                    : autoRiskScore(description) === 'Medium'
                    ? 'SLA: 60 days. Will be triaged by ACTU Investigator within 5 working days.'
                    : 'SLA: 60 days. Report will be reviewed in the next triage cycle.'}
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(2)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#006838] transition">
                <ChevronLeft size={13} />Edit Details
              </button>
              <button onClick={handleSubmit}
                className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl bg-[#006838] text-white hover:bg-[#005530] transition">
                <Send size={14} />Submit Report
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Confirmation ── */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-[#006838]" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 mb-1">Report Submitted Successfully</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Your report has been received and securely encrypted. The ACTU Chair will be notified for triage.
                Save your Ticket ID and access password — they are the only way you can check the status of your report.
              </p>
            </div>

            {/* Ticket credentials */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Report Credentials — Save These Now</p>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-500 mb-1">Ticket ID</p>
                <div className="flex items-center">
                  <p className="font-mono text-base font-extrabold text-[#006838] tracking-wider">{ticket}</p>
                  <CopyBtn value={ticket} />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-500 mb-1">Access Password</p>
                <div className="flex items-center">
                  <p className="font-mono text-base font-extrabold text-slate-800 tracking-widest">{pwd}</p>
                  <CopyBtn value={pwd} />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
                <AlertTriangle size={12} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800">
                  <strong>Important:</strong> These credentials are not sent via email or stored in retrievable form.
                  If lost, there is no recovery process. Please write them down or store securely offline.
                </p>
              </div>
            </div>

            {/* SLA info */}
            <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">What Happens Next</p>
              {[
                { n: 1, text: 'ACTU Chair reviews your report within 5 working days of receipt.' },
                { n: 2, text: `Risk classification: ${riskScore}. ${riskScore === 'High' ? '30-day' : '60-day'} preliminary assessment SLA now running.` },
                { n: 3, text: 'An ACTU Investigator may be assigned for fact-finding. You will not be contacted unless you submitted as Identified.' },
                { n: 4, text: 'If evidence warrants, a referral letter will be transmitted to ICPC with a full encrypted case file.' },
                { n: 5, text: 'You can check status at any time using your Ticket ID and password.' },
              ].map(item => (
                <div key={item.n} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 text-[#006838] flex items-center justify-center text-[9px] font-extrabold flex-shrink-0 mt-0.5">
                    {item.n}
                  </div>
                  <p className="text-xs text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setView('status')}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl border border-[#006838] text-[#006838] hover:bg-green-50 transition">
                <Clock size={14} />Check Report Status
              </button>
              <button onClick={() => navigate(-1)}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
                Return to ACTU Workbench
              </button>
            </div>
          </div>
        )}
      </main>

      {step < 4 && (
        <footer className="text-center text-[11px] text-slate-400 py-4 border-t border-slate-100">
          NAPTIN Anti-Corruption Transparency Unit · All data encrypted in transit (TLS 1.3) and at rest (AES-256)
        </footer>
      )}
    </div>
  )
}
