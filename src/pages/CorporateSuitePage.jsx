import { useState, useEffect } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import { PR_CAMPAIGNS, BOARD_PACKS, RISK_REGISTER, BRAND_CAMPAIGNS, CLIENT_PIPELINE, MARKET_METRICS } from '../data/mock'
import {
  Scale, Megaphone, Landmark, AlertTriangle, Briefcase,
  TrendingUp, Plus, ChevronDown, ChevronRight,
  FileText, Users, BarChart3, ExternalLink,
} from 'lucide-react'

const EXTENDED_LEGAL = [
  { ref:'LEG-2410', title:'Trademark registration — NAPTIN brand mark 2026', owner:'F. Adeyemi', status:'Filing',           due:'30 Jun 2026', type:'IP' },
  { ref:'LEG-2409', title:'Staff disciplinary panel — admin case',            owner:'F. Adeyemi', status:'Ongoing',          due:'18 Apr 2026', type:'Employment' },
  { ref:'LEG-2408', title:'Power sector training MOU — review',               owner:'F. Adeyemi', status:'In review',        due:'04 Apr 2026', type:'Contract' },
  { ref:'LEG-2407', title:'Vendor NDA — ANCEE consultants',                   owner:'F. Adeyemi', status:'With counterparty',due:'12 Apr 2026', type:'NDA' },
  { ref:'LEG-2405', title:'Land title — Kano RTC extension plot',             owner:'External counsel', status:'Completed',  due:'03 Apr 2026', type:'Property' },
  { ref:'LEG-2401', title:'Regulatory compliance review — Q1',                owner:'F. Adeyemi', status:'Completed',        due:'31 Mar 2026', type:'Compliance' },
]

const BOARD_RESOLUTIONS = [
  { ref:'BR-2026-03', title:'Approval of Q2 2026 operational work plan', meeting:'Board — 31 Mar 2026', date:'31 Mar 2026', status:'passed', votes:'7-0' },
  { ref:'BR-2026-02', title:'ICT infrastructure investment — ₦120M',     meeting:'Board — 31 Mar 2026', date:'31 Mar 2026', status:'passed', votes:'6-1' },
  { ref:'BR-2026-01', title:'Annual performance report 2025 — adoption', meeting:'Board — 31 Mar 2026', date:'31 Mar 2026', status:'passed', votes:'7-0' },
  { ref:'BR-2025-12', title:'Appointment of acting DDG (Admin)',          meeting:'Extraordinary — Dec 2025', date:'05 Dec 2025', status:'passed', votes:'5-0' },
]

const legalTypeStyle = {
  IP:         'bg-purple-50 text-purple-700 border-purple-200',
  Employment: 'bg-amber-50 text-amber-700 border-amber-200',
  Contract:   'bg-blue-50 text-blue-700 border-blue-200',
  NDA:        'bg-slate-50 text-slate-500 border-slate-200',
  Property:   'bg-teal-50 text-teal-700 border-teal-200',
  Compliance: 'bg-green-50 text-[#006838] border-green-200',
}
const legalStatusStyle = {
  'Filing':           'bg-blue-50 text-blue-700 border-blue-200',
  'Ongoing':          'bg-amber-50 text-amber-700 border-amber-200',
  'In review':        'bg-amber-50 text-amber-700 border-amber-200',
  'With counterparty':'bg-purple-50 text-purple-700 border-purple-200',
  'Completed':        'bg-green-50 text-[#006838] border-green-200',
}
const riskStyle = {
  High:   'text-red-600 bg-red-50 border-red-200',
  Medium: 'text-amber-600 bg-amber-50 border-amber-200',
  Low:    'text-[#006838] bg-green-50 border-green-200',
}
const pipelineStageStyle = {
  'Proposal submitted': 'bg-amber-50 text-amber-700 border-amber-200',
  'Contract review':    'bg-blue-50 text-blue-700 border-blue-200',
  'MOU signed':         'bg-teal-50 text-teal-700 border-teal-200',
  'Scoping':            'bg-purple-50 text-purple-700 border-purple-200',
}

function Pill({ label, map }) {
  const cls = (map && map[label]) ? map[label] : 'bg-slate-50 text-slate-500 border-slate-200'
  return <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cls}`}>{label}</span>
}

const TABS = [
  { id: 'legal',        label: 'Legal',           icon: Scale         },
  { id: 'pr',           label: 'PR & Comms',       icon: Megaphone     },
  { id: 'consultancy',  label: 'Consultancy',      icon: Briefcase     },
  { id: 'board',        label: 'Board',            icon: Landmark      },
  { id: 'risk',         label: 'Risk',             icon: AlertTriangle },
]

export default function CorporateSuitePage({ defaultTab = 'legal' }) {
  const [tab, setTab] = useState(defaultTab)
  const [expandedBoard, setExpandedBoard] = useState(null)

  useEffect(() => { setTab(defaultTab) }, [defaultTab])

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Corporate & Consultancy Services</h1>
          <p className="text-sm text-slate-400">Legal · Public relations · Consultancy pipeline · Board · Enterprise risk</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label:'Active Legal Matters',   value: EXTENDED_LEGAL.filter(m => m.status !== 'Completed').length.toString(), icon: Scale,      bg:'bg-blue-50',   color:'text-blue-600'  },
          { label:'Client Pipeline (YTD)',  value: CLIENT_PIPELINE.length.toString(),                                        icon: Briefcase,  bg:'bg-teal-50',   color:'text-teal-600'  },
          { label:'Consultancy Rev. YTD',   value:'₦42M',                                                                   icon: TrendingUp, bg:'bg-green-50',  color:'text-[#006838]' },
          { label:'Open Risks',             value: RISK_REGISTER.length.toString(),                                          icon: AlertTriangle,bg:'bg-amber-50',color:'text-amber-600' },
        ].map((k, i) => (
          <div key={i} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${k.bg} ${k.color} flex items-center justify-center flex-shrink-0`}>
              <k.icon size={18} />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900">{k.value}</div>
              <div className="text-xs text-slate-400 font-medium">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6">
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

      {/* ══ LEGAL ══ */}
      {tab === 'legal' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-400">Active legal matters, filings, and reviews.</p>
            <button className="flex items-center gap-1.5 text-xs font-bold bg-[#006838] text-white px-3 py-1.5 rounded-xl hover:bg-[#005530] transition-colors">
              <Plus size={12} />New Matter
            </button>
          </div>
          {EXTENDED_LEGAL.map((m, i) => (
            <div key={i} className="card flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-[10px] text-slate-400">{m.ref}</span>
                  <Pill label={m.type} map={legalTypeStyle} />
                  <Pill label={m.status} map={legalStatusStyle} />
                </div>
                <p className="text-sm font-bold text-slate-800">{m.title}</p>
                <p className="text-[11px] text-slate-400 mt-1">Owner: {m.owner} · Due: {m.due}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ PR & COMMS ══ */}
      {tab === 'pr' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MARKET_METRICS.map((m, i) => (
              <div key={i} className="stat-card">
                <div className="text-xl font-extrabold text-slate-900">{m.value}</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">{m.label}</div>
                <div className="text-[10px] text-[#006838] font-bold mt-1">{m.trend}</div>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Brand Campaigns</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BRAND_CAMPAIGNS.map((c, i) => (
                <div key={i} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-800">{c.title}</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex-shrink-0 ml-2 ${
                      c.status === 'Live'        ? 'bg-green-50 text-[#006838] border-green-200' :
                      c.status === 'In progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                   'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>{c.status}</span>
                  </div>
                  <p className="text-xs text-slate-500">Owner: {c.owner}</p>
                  <p className="text-xs text-slate-500">Budget: <span className="font-semibold text-slate-700">{c.budget}</span> · Due: {c.due}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">PR Campaigns</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PR_CAMPAIGNS.map((c, i) => (
                <div key={i} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-800">{c.name}</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex-shrink-0 ml-2 ${
                      c.status === 'Live' ? 'bg-green-50 text-[#006838] border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>{c.status}</span>
                  </div>
                  <p className="text-xs text-slate-500">Channels: {c.channel}</p>
                  <p className="text-xs text-slate-500">Est. reach: <span className="font-semibold text-slate-700">{c.reach}</span></p>
                  <p className="text-[10px] text-slate-400 mt-2">Owner: {c.owner}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ CONSULTANCY ══ */}
      {tab === 'consultancy' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MARKET_METRICS.map((m, i) => (
              <div key={i} className="stat-card">
                <div className="text-xl font-extrabold text-slate-900">{m.value}</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">{m.label}</div>
                <div className="text-[10px] text-[#006838] font-bold mt-1">{m.trend}</div>
              </div>
            ))}
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700">Client Pipeline</h3>
              <button className="flex items-center gap-1.5 text-xs font-bold bg-[#006838] text-white px-3 py-1.5 rounded-xl hover:bg-[#005530] transition-colors">
                <Plus size={12} />Add Client
              </button>
            </div>
            <div className="space-y-0">
              {CLIENT_PIPELINE.map((c, i) => (
                <div key={i} className={`px-5 py-4 flex items-start gap-4 ${i < CLIENT_PIPELINE.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-slate-50/50 transition-colors`}>
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                    <Users size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-[10px] text-slate-400">{c.id}</span>
                      <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-medium">{c.type}</span>
                      <Pill label={c.stage} map={pipelineStageStyle} />
                    </div>
                    <p className="text-sm font-bold text-slate-800">{c.client}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Owner: {c.owner} · Due: {c.due} · Value: <span className="font-semibold text-slate-700">{c.value}</span></p>
                  </div>
                  <button className="text-xs text-[#006838] hover:underline flex items-center gap-1 font-semibold flex-shrink-0">
                    <ExternalLink size={11} />View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ BOARD ══ */}
      {tab === 'board' && (
        <div className="space-y-5">
          <div>
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <FileText size={13} className="text-[#006838]" />Board Packs
            </h4>
            <div className="space-y-3">
              {BOARD_PACKS.map((b, i) => (
                <div key={i} className="card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{b.meeting}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{b.sections} sections · Circulated by: {b.circulated}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {b.confidential && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">Confidential</span>
                      )}
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        b.status === 'Locked for circulation' ? 'bg-green-50 text-[#006838] border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>{b.status}</span>
                    </div>
                  </div>
                  <button className="text-xs text-[#006838] font-semibold hover:underline flex items-center gap-1 mt-1">
                    <FileText size={11} />View Pack
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Landmark size={13} className="text-[#006838]" />Board Resolutions
            </h4>
            <div className="space-y-3">
              {BOARD_RESOLUTIONS.map((r, i) => (
                <div key={i} className="card">
                  <button className="w-full flex items-start justify-between"
                    onClick={() => setExpandedBoard(expandedBoard === r.ref ? null : r.ref)}>
                    <div className="text-left flex-1 mr-3">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-[10px] text-slate-400">{r.ref}</span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-green-50 text-[#006838] border-green-200 capitalize">{r.status}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{r.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Meeting: {r.meeting} · Date: {r.date}</p>
                    </div>
                    {expandedBoard === r.ref
                      ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" />
                      : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
                  </button>
                  {expandedBoard === r.ref && (
                    <div className="mt-3 pt-3 border-t border-slate-50">
                      <p className="text-xs text-slate-600">Vote: <span className="font-bold text-slate-800">{r.votes}</span></p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ RISK ══ */}
      {tab === 'risk' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-400">Enterprise risk register — treatment owners assigned.</p>
            <button className="flex items-center gap-1.5 text-xs font-bold bg-[#006838] text-white px-3 py-1.5 rounded-xl hover:bg-[#005530] transition-colors">
              <Plus size={12} />Add Risk
            </button>
          </div>
          {RISK_REGISTER.map((r, i) => (
            <div key={i} className={`card border-l-4 ${r.score === 'High' ? 'border-l-red-400' : r.score === 'Medium' ? 'border-l-amber-400' : 'border-l-green-500'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-[10px] text-slate-400">{r.id}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${riskStyle[r.score]}`}>{r.score} Risk</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{r.title}</p>
                  <p className="text-xs text-slate-500 mt-1">Owner: {r.owner}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Treatment: <span className="font-semibold text-slate-600">{r.treatment}</span></p>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={13} className="text-amber-600" />
              <span className="text-xs font-bold text-amber-800">Risk Review Cycle</span>
            </div>
            <p className="text-xs text-amber-700">Next enterprise risk review: <strong>30 Jun 2026</strong>. Treatment owners to submit updates to Corporate Services by 20 Jun 2026.</p>
          </div>
        </div>
      )}
    </div>
  )
}
