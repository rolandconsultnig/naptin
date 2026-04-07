import { useState } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import {
  Server, Headphones, Wrench, Activity, Shield, HardDrive,
  Wifi, AlertTriangle, CheckCircle2, Clock, Plus,
  Search, RefreshCw, ChevronDown, ChevronRight,
  Lock, Eye, X,
} from 'lucide-react'

// ── local ICT mock data ────────────────────────────────────────
const ALL_TICKETS = [
  { id:'INC-8832', title:'VPN latency — Kaduna RTC', category:'Network', priority:'P2', status:'In Progress', assignee:'E. Bello', raised:'05 Apr 2026', sla:'4h', description:'Users at Kaduna RTC experiencing >300ms latency on VPN. Impacting RDP sessions and remote training delivery.' },
  { id:'INC-8821', title:'Laptop imaging queue backlog', category:'Hardware', priority:'P3', status:'Queued', assignee:'ICT Service Desk', raised:'04 Apr 2026', sla:'72h', description:'12 new laptops pending OS imaging and software deployment for Q2 recruitment hires.' },
  { id:'INC-8819', title:'Email delivery failure — Finance', category:'Email', priority:'P1', status:'Resolved', assignee:'E. Bello', raised:'03 Apr 2026', sla:'1h', description:'Exchange connector misconfiguration caused outbound mail failure for Finance team. Resolved by adjusting SMTP relay settings.' },
  { id:'INC-8810', title:'Printer offline — Block B HR', category:'Hardware', priority:'P4', status:'Queued', assignee:'ICT Service Desk', raised:'02 Apr 2026', sla:'48h', description:'Network printer in HR Block B not responding. IP conflict suspected.' },
  { id:'CHG-441', title:'Firewall rule update — Finance BI', category:'Security', priority:'P2', status:'Scheduled', assignee:'E. Bello', raised:'06 Apr 2026', sla:'24h', description:'Add inbound rule for Power BI gateway IP. CAB approved. Scheduled for Sat 11 Apr 2026 23:00.' },
  { id:'CHG-439', title:'ERP HCM v3.2 upgrade', category:'Application', priority:'P1', status:'In Progress', assignee:'Applications Team', raised:'01 Apr 2026', sla:'—', description:'Q2 HCM v3.2 upgrade rollout. Data migration 80% complete. Go-live target: 14 Apr 2026.' },
  { id:'INC-8801', title:'CCTV offline — Gate 2', category:'Security', priority:'P2', status:'In Progress', assignee:'ICT Service Desk', raised:'01 Apr 2026', sla:'8h', description:'Main gate camera offline since 1 Apr. Ticket logged with facilities for cable inspection.' },
  { id:'REQ-2201', title:'New user accounts — 3 recruitment hires', category:'Access', priority:'P3', status:'Completed', assignee:'ICT Admin', raised:'06 Apr 2026', sla:'4h', description:'AD accounts, email, and VPN certs provisioned for 3 new staff starting 07 Apr 2026.' },
]

const SYSTEMS = [
  { name:'ERP (SAP)',            status:'operational', uptime:'99.8%', lastCheck:'07 Apr 09:45', host:'ERP-PROD-01',  db:'Oracle 19c'       },
  { name:'Active Directory',     status:'operational', uptime:'100%',  lastCheck:'07 Apr 09:45', host:'DC-01/DC-02', db:'AD DS'             },
  { name:'Exchange Mail Server', status:'operational', uptime:'99.6%', lastCheck:'07 Apr 09:44', host:'MAIL-01',     db:'Exchange 2019'     },
  { name:'Finance BI Gateway',   status:'degraded',    uptime:'97.1%', lastCheck:'07 Apr 09:40', host:'BI-GW-01',    db:'SQL Server 2022'   },
  { name:'LMS Platform',         status:'operational', uptime:'99.9%', lastCheck:'07 Apr 09:45', host:'LMS-PROD',    db:'PostgreSQL 15'     },
  { name:'Backup (Veeam)',        status:'operational', uptime:'100%',  lastCheck:'07 Apr 03:00', host:'BKP-NAS-01',  db:'Veeam B&R'        },
  { name:'Cisco Core Switch',    status:'operational', uptime:'100%',  lastCheck:'07 Apr 09:45', host:'SW-CORE-01',  db:'IOS-XE'           },
  { name:'CCTV NVR',             status:'incident',    uptime:'94.2%', lastCheck:'07 Apr 09:30', host:'NVR-HQ-01',   db:'Hikvision'        },
]

const ASSETS = [
  { tag:'NAPTIN-NB-0441', type:'Laptop',  make:'Dell Latitude 5540',   user:'M. Yusuf — Finance',     dept:'Finance', status:'Active',    warranty:'Jan 2027' },
  { tag:'NAPTIN-NB-0440', type:'Laptop',  make:'Dell Latitude 5540',   user:'Unassigned',              dept:'ICT Pool', status:'Available', warranty:'Jan 2027' },
  { tag:'NAPTIN-DT-0218', type:'Desktop', make:'HP ProDesk 600 G9',    user:'A. Sule — Internal Audit',dept:'Audit',   status:'Active',    warranty:'Mar 2026' },
  { tag:'NAPTIN-SV-0012', type:'Server',  make:'Dell PowerEdge R750',  user:'ICT Infrastructure',      dept:'ICT',     status:'Active',    warranty:'Feb 2026' },
  { tag:'NAPTIN-PR-0091', type:'Printer', make:'HP LaserJet MFP M438', user:'Block B — HR',            dept:'HR',      status:'Fault',     warranty:'Jun 2024' },
  { tag:'NAPTIN-NB-0388', type:'Laptop',  make:'Lenovo ThinkPad T14',  user:'F. Adamu — Legal',        dept:'Legal',   status:'Active',    warranty:'Sep 2026' },
]

const CHANGES = [
  { ref:'CAB-2026-04-003', title:'Firewall rule — Finance BI gateway', type:'Normal', risk:'Low',    status:'Approved',    date:'Sat 11 Apr 23:00', owner:'E. Bello'    },
  { ref:'CAB-2026-04-002', title:'ERP HCM v3.2 upgrade',              type:'Major',  risk:'High',   status:'In Progress', date:'14 Apr 2026',      owner:'Apps Team'   },
  { ref:'CAB-2026-03-011', title:'Active Directory GPO hardening',     type:'Normal', risk:'Medium', status:'Completed',   date:'28 Mar 2026',      owner:'E. Bello'    },
  { ref:'CAB-2026-03-008', title:'LMS v4.1 patch',                    type:'Minor',  risk:'Low',    status:'Completed',   date:'20 Mar 2026',      owner:'Apps Team'   },
]

const PRIORITY_STYLE = {
  P1: 'bg-red-50 text-red-700 border-red-200',
  P2: 'bg-amber-50 text-amber-700 border-amber-200',
  P3: 'bg-blue-50 text-blue-700 border-blue-200',
  P4: 'bg-slate-50 text-slate-500 border-slate-200',
}
const STATUS_STYLE = {
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  'Queued':      'bg-amber-50 text-amber-600 border-amber-200',
  'Resolved':    'bg-green-50 text-[#006838] border-green-200',
  'Completed':   'bg-green-50 text-[#006838] border-green-200',
  'Scheduled':   'bg-purple-50 text-purple-700 border-purple-200',
  'Approved':    'bg-teal-50 text-teal-700 border-teal-200',
}

function Pill({ label, map }) {
  const cls = map[label] ?? 'bg-slate-50 text-slate-500 border-slate-200'
  return <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cls}`}>{label}</span>
}

const SYS_DOT = { operational: 'bg-[#006838]', degraded: 'bg-amber-400', incident: 'bg-red-500' }

// ─────────────────────────────────────────────────────────────────
export default function ICTPage() {
  const [tab, setTab]               = useState('service-desk')
  const [expandedTkt, setExpandedTkt] = useState(null)
  const [filterPri, setFilterPri]     = useState('All')
  const [filterStat, setFilterStat]   = useState('All')
  const [search, setSearch]           = useState('')

  const TABS = [
    { id:'service-desk',   label:'Service Desk',      icon: Headphones },
    { id:'infrastructure', label:'Infrastructure',    icon: Server      },
    { id:'assets',         label:'Asset Register',    icon: HardDrive   },
    { id:'change',         label:'Change Management', icon: Wrench      },
    { id:'security',       label:'Cybersecurity',     icon: Shield      },
  ]

  const visibleTickets = ALL_TICKETS.filter(t => {
    const matchPri    = filterPri  === 'All' || t.priority === filterPri
    const matchStat   = filterStat === 'All' || t.status   === filterStat
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase())
    return matchPri && matchStat && matchSearch
  })

  const openCount = ALL_TICKETS.filter(t => !['Resolved','Completed'].includes(t.status)).length
  const p1Count   = ALL_TICKETS.filter(t => t.priority === 'P1').length

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">ICT Department</h1>
            <p className="text-sm text-slate-400">Service desk · Infrastructure · Assets · Change management · Security</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-bold bg-[#006838] text-white px-3 py-1.5 rounded-xl hover:bg-[#005530] transition-colors">
          <Plus size={13} />New Ticket
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label:'Open Tickets',        value: openCount, icon: Headphones,   bg:'bg-red-50',    color:'text-red-600'   },
          { label:'P1 Incidents',        value: p1Count,   icon: AlertTriangle, bg:'bg-amber-50',  color:'text-amber-600' },
          { label:'System Uptime (30d)', value:'99.4%',    icon: Activity,     bg:'bg-green-50',  color:'text-[#006838]' },
          { label:'Registered Assets',   value:'2,841',    icon: Server,       bg:'bg-blue-50',   color:'text-blue-600'  },
        ].map((k, i) => (
          <div key={i} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${k.bg} ${k.color} flex items-center justify-center flex-shrink-0`}><k.icon size={18} /></div>
            <div>
              <div className="text-xl font-extrabold text-slate-900">{k.value}</div>
              <div className="text-xs text-slate-400 font-medium">{k.label}</div>
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

      {/* ══ SERVICE DESK ══ */}
      {tab === 'service-desk' && (
        <div>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
              <Search size={12} className="text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search tickets…"
                className="text-xs outline-none w-40 placeholder:text-slate-400" />
            </div>
            <select value={filterPri} onChange={e => setFilterPri(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-[#006838] bg-white text-slate-600">
              {['All','P1','P2','P3','P4'].map(p => <option key={p}>{p}</option>)}
            </select>
            <select value={filterStat} onChange={e => setFilterStat(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-[#006838] bg-white text-slate-600">
              {['All','In Progress','Queued','Scheduled','Resolved','Completed'].map(s => <option key={s}>{s}</option>)}
            </select>
            <span className="text-xs text-slate-400 ml-auto">{visibleTickets.length} ticket{visibleTickets.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="space-y-3">
            {visibleTickets.map(t => (
              <div key={t.id} className="card">
                <button className="w-full flex items-start justify-between"
                  onClick={() => setExpandedTkt(expandedTkt === t.id ? null : t.id)}>
                  <div className="flex items-start gap-3 text-left">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-[10px] text-slate-400">{t.id}</span>
                        <Pill label={t.priority} map={PRIORITY_STYLE} />
                        <Pill label={t.status} map={STATUS_STYLE} />
                        <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-medium">{t.category}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-800">{t.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{t.assignee} · Raised {t.raised} · SLA: {t.sla}</div>
                    </div>
                  </div>
                  {expandedTkt === t.id
                    ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" />
                    : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
                </button>
                {expandedTkt === t.id && (
                  <div className="mt-3 border-t border-slate-50 pt-3">
                    <p className="text-xs text-slate-600 leading-relaxed">{t.description}</p>
                    <div className="flex gap-2 mt-3">
                      {!['Resolved','Completed'].includes(t.status) && (
                        <button className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors">
                          <CheckCircle2 size={11} />Mark Resolved
                        </button>
                      )}
                      <button className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 flex items-center gap-1 transition-colors">
                        <Clock size={11} />Add Update
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ INFRASTRUCTURE ══ */}
      {tab === 'infrastructure' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-400">Live system status — Last polled: 07 Apr 2026, 09:45</p>
            <button className="flex items-center gap-1 text-xs text-[#006838] font-semibold hover:underline">
              <RefreshCw size={11} />Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {SYSTEMS.map((s, i) => (
              <div key={i} className="card flex items-start gap-4">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${SYS_DOT[s.status]}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-800">{s.name}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${
                      s.status === 'operational' ? 'bg-green-50 text-[#006838] border-green-200' :
                      s.status === 'degraded'    ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                   'bg-red-50 text-red-700 border-red-200'
                    }`}>{s.status}</span>
                  </div>
                  <div className="text-xs text-slate-400 space-x-3">
                    <span>Host: <span className="font-mono text-slate-600">{s.host}</span></span>
                    <span>· {s.db}</span>
                    <span>· Uptime: <span className="font-bold text-slate-700">{s.uptime}</span></span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Last check: {s.lastCheck}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Wifi size={13} className="text-[#006838]" />Network Overview — NAPTIN HQ
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
              {[
                { label:'Core uptime',  value:'100%',  sub:'Cisco Core Switch' },
                { label:'WAN (SD-WAN)', value:'99.2%', sub:'All 6 RTC links'   },
                { label:'Firewall',     value:'Active', sub:'Fortinet FG-200F' },
                { label:'DNS/DHCP',     value:'OK',     sub:'Windows Server'   },
              ].map((n, i) => (
                <div key={i} className="bg-slate-50 rounded-xl px-3 py-3">
                  <div className="text-base font-extrabold text-slate-800">{n.value}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">{n.label}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{n.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ ASSET REGISTER ══ */}
      {tab === 'assets' && (
        <div className="card overflow-x-auto p-0">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">Asset Register (sample — 2,841 total)</h3>
            <button className="flex items-center gap-1.5 text-xs font-bold bg-[#006838] text-white px-3 py-1.5 rounded-xl hover:bg-[#005530] transition-colors">
              <Plus size={12} />Register Asset
            </button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50">
                {['Asset Tag','Type','Make / Model','Assigned To','Dept','Status','Warranty'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ASSETS.map((a, i) => (
                <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-[10px] text-slate-500">{a.tag}</td>
                  <td className="px-4 py-2.5 text-slate-600">{a.type}</td>
                  <td className="px-4 py-2.5 font-semibold text-slate-700">{a.make}</td>
                  <td className="px-4 py-2.5 text-slate-500">{a.user}</td>
                  <td className="px-4 py-2.5 text-slate-500">{a.dept}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      a.status === 'Active'    ? 'bg-green-50 text-[#006838] border-green-200' :
                      a.status === 'Available' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                 'bg-red-50 text-red-600 border-red-200'
                    }`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-400">{a.warranty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ══ CHANGE MANAGEMENT ══ */}
      {tab === 'change' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-400">CAB-approved changes and upcoming maintenance windows.</p>
            <button className="flex items-center gap-1.5 text-xs font-bold bg-[#006838] text-white px-3 py-1.5 rounded-xl hover:bg-[#005530] transition-colors">
              <Plus size={12} />Submit RFC
            </button>
          </div>
          {CHANGES.map((c, i) => (
            <div key={i} className="card flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-[10px] text-slate-400">{c.ref}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    c.type === 'Major'  ? 'bg-red-50 text-red-700 border-red-200' :
                    c.type === 'Normal' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                         'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>{c.type}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    c.status === 'Completed'   ? 'bg-green-50 text-[#006838] border-green-200' :
                    c.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}>{c.status}</span>
                </div>
                <div className="text-sm font-bold text-slate-800">{c.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Owner: {c.owner} · Scheduled: {c.date} · Risk:{' '}
                  <span className={`font-bold ${c.risk==='High'?'text-red-600':c.risk==='Medium'?'text-amber-600':'text-slate-500'}`}>{c.risk}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ CYBERSECURITY ══ */}
      {tab === 'security' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label:'Patch compliance',    value:'96%',  icon: Shield,        good: true  },
              { label:'Security incidents',  value:'0',    icon: AlertTriangle, good: true  },
              { label:'Failed logins (24h)', value:'14',   icon: Lock,          good: false },
              { label:'AV coverage',         value:'100%', icon: Eye,           good: true  },
            ].map((k, i) => (
              <div key={i} className={`card flex items-center gap-3 border ${k.good ? 'border-green-100' : 'border-amber-100'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${k.good ? 'bg-green-50 text-[#006838]' : 'bg-amber-50 text-amber-600'}`}>
                  <k.icon size={16} />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-slate-900">{k.value}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{k.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Policy & Compliance Status</h4>
            <div className="space-y-2">
              {[
                { policy:'Password Policy (90-day rotation)',  status:'Enforced',     nextDue:'Jul 2026'  },
                { policy:'Data Classification Policy',         status:'Enforced',     nextDue:'Sep 2026'  },
                { policy:'NDPR Data Retention Policy',         status:'In Review',    nextDue:'Apr 2026'  },
                { policy:'Acceptable Use Policy',              status:'Enforced',     nextDue:'Nov 2026'  },
                { policy:'Incident Response Playbook',         status:'Needs Update', nextDue:'Overdue'   },
                { policy:'Business Continuity Plan',           status:'Enforced',     nextDue:'Feb 2027'  },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between flex-wrap gap-2 py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs font-semibold text-slate-700">{p.policy}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400">Next: {p.nextDue}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      p.status === 'Enforced'     ? 'bg-green-50 text-[#006838] border-green-200' :
                      p.status === 'In Review'    ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                    'bg-red-50 text-red-600 border-red-200'
                    }`}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-amber-600" />
              <span className="text-xs font-bold text-amber-800">Security Advisories</span>
            </div>
            <ul className="space-y-1.5 text-xs text-amber-700">
              <li>• <strong>14 failed login attempts</strong> on VPN portal in last 24h — source IP geo-blocked.</li>
              <li>• <strong>NDPR Data Retention Policy</strong> pending DG approval — closes active audit gap.</li>
              <li>• <strong>Incident Response Playbook</strong> last updated Aug 2025 — review overdue by 2 months.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
