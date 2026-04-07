import { useState } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import {
  Newspaper, SendHorizonal, MessageSquare, CalendarDays, TrendingUp,
  Shield, Plus, ChevronDown, ChevronRight, CheckCircle2, Clock,
  AlertTriangle, Download, Users, TriangleAlert, Bell, Star,
  Send, Twitter, Instagram, Linkedin, Facebook, X,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'

// ── Role Matrix ────────────────────────────────────────────────
const PA_ROLE_MATRIX = {
  'PA Officer':    { 'Press Releases':['draft','manage-list','log-coverage'], 'Social Media':['draft-posts','schedule-posts'], 'Media Inquiries':['log','draft-response'], 'Event Mgmt':['prepare','task-mgmt'], 'Sentiment':['monitor','tag'] },
  'PA Head':       { 'Press Releases':['review','approve','distribute','override-list'], 'Social Media':['review-approve','publish'], 'Media Inquiries':['assign','respond'], 'Event Mgmt':['plan','invite','post-event'], 'Sentiment':['flag-crisis','release-statement'] },
  'Legal Officer': { 'Press Releases':['legal-review'], 'Social Media':['review-flag'], 'Media Inquiries':['advise'], 'Event Mgmt':['review'], 'Sentiment':['advise'] },
  'Director General':{ 'Press Releases':['final-sign-off'], 'Social Media':['see-summary'], 'Media Inquiries':['see-summary'], 'Event Mgmt':['attend','keynote'], 'Sentiment':['receive-alert','authorize-statement'] },
}

const PA_INTEGRATIONS = [
  { system:'Meltwater Media Monitoring', purpose:'Real-time tracking of NAPTIN mentions across 10,000+ news sources and social media', status:'connected' },
  { system:'Google Alerts',             purpose:'Keyword-based monitoring supplements Meltwater for long-tail mentions',            status:'connected' },
  { system:'Hootsuite / Buffer',         purpose:'Social media scheduling, analytics, team collaboration for 6 platforms',         status:'configured' },
  { system:'Mailchimp',                  purpose:'Stakeholder newsletters, event invites, post-event reports to subscriber base',   status:'connected' },
  { system:'Zoom / MS Teams',            purpose:'Virtual press briefings, staff media training sessions, webinar hosting',        status:'connected' },
  { system:'SMS & WhatsApp Gateway',     purpose:'Bulk stakeholder alerts for events, crisis comms; 2-way media response line',    status:'configured' },
  { system:'Eventbrite',                 purpose:'Event registration portal, RSVP tracking, check-in management, post-event reports', status:'partial' },
]

// ── Data ───────────────────────────────────────────────────────
const PRESS_RELEASES_INIT = [
  {
    id:'PR-2026-014', title:'NAPTIN Launches Renewable Energy Technician Programme Nationwide', date:'07 Apr 2026',
    status:'approved', author:'Chioma Eze', mediaTypes:['news agencies','TV stations','online newspapers'],
    sentiment:'positive', coverage:['The Punch','NAN','Channels TV'], checkedMedia:['news agencies','TV stations'],
  },
  {
    id:'PR-2026-013', title:'NAPTIN Signs MoU with State Electricity Boards for Decentralised Training', date:'02 Apr 2026',
    status:'pending-legal', author:'Kola Balogun', mediaTypes:['news agencies','online newspapers'],
    sentiment:'neutral', coverage:[], checkedMedia:[],
  },
  {
    id:'PR-2026-012', title:'Q1 2026 Training Enrolment Surpasses 15,000 Participants', date:'28 Mar 2026',
    status:'draft', author:'Amaka Osei', mediaTypes:['online newspapers'],
    sentiment:'positive', coverage:[], checkedMedia:[],
  },
  {
    id:'PR-2026-011', title:'NAPTIN Celebrates 15 Years of Power Sector Capacity Development', date:'15 Mar 2026',
    status:'distributed', author:'Chioma Eze', mediaTypes:['news agencies','TV stations','online newspapers','radio'],
    sentiment:'positive', coverage:['The Punch','Vanguard','Channels TV','TVC News','NAN'],
    checkedMedia:['news agencies','TV stations','online newspapers','radio'],
  },
]

const SOCIAL_POSTS_INIT = [
  { id:'SP-045', platform:'Twitter/X',   content:'Proud to announce our Renewable Energy Technician Programme is live in all 6 geo-political zones! 🇳🇬⚡', scheduledDate:'08 Apr 2026 10:00', status:'approved',   likes:null, impressions:null, flagReason:null },
  { id:'SP-044', platform:'LinkedIn',    content:'𝗡𝗔𝗣𝗧𝗜𝗡 𝗤𝟭 𝗛𝗶𝗴𝗵𝗹𝗶𝗴𝗵𝘁𝘀: 15,000+ participants trained, ₦400M deployed, 12 new partner institutions onboarded.', scheduledDate:'07 Apr 2026 09:00', status:'published',  likes:312, impressions:8400, flagReason:null },
  { id:'SP-043', platform:'Instagram',   content:`It's graduation day at NAPTIN Abuja RTC! Swipe to see our newest batch of certified power technicians.`, scheduledDate:'05 Apr 2026 14:00', status:'published',  likes:891, impressions:12300, flagReason:null },
  { id:'SP-042', platform:'Twitter/X',   content:'NAPTIN is not affiliated with "Certified Power Pro" seminars — do not pay unauthorised training fees! Official enrolment: naptin.gov.ng', scheduledDate:null, status:'flagged',   likes:null, impressions:null, flagReason:'Misinformation response — needs legal review before publishing' },
  { id:'SP-041', platform:'Facebook',    content:'Join our upcoming webinar: "Preparing for the Energy Transition" — free for all registered alumni. Register now! 👇', scheduledDate:'10 Apr 2026 08:00', status:'scheduled', likes:null, impressions:null, flagReason:null },
]

const MEDIA_INQUIRIES_INIT = [
  { id:'MI-2026-031', outlet:'The Punch', reporter:'Emeka Okafor', topic:'NAPTIN budget cuts — FY2026', received:'04 Apr 2026', deadline:'07 Apr 2026', status:'draft-ready', assignedTo:'PA Head',  response:null },
  { id:'MI-2026-030', outlet:'NAN (News Agency)', reporter:'Hajiya Amina Sule', topic:'Partnership between NAPTIN and AEDC on distribution-level apprenticeship', received:'02 Apr 2026', deadline:'06 Apr 2026', status:'responded', assignedTo:'PA Head', response:'NAPTIN confirms active discussions with AEDC re: distribution-level technician apprenticeship programme. Formal MoU expected Q3 2026.' },
  { id:'MI-2026-029', outlet:'Channels TV', reporter:'Adaeze Nwosu', topic:'Request for Managing Director interview — Power Week special', received:'28 Mar 2026', deadline:'08 Apr 2026', status:'new', assignedTo:null, response:null },
]

const EVENTS_INIT = [
  {
    id:'EVT-2026-003', title:'Power Week 2026: National Electricity Workforce Summit', type:'conference',
    date:'21–23 May 2026', venue:'International Conference Centre, Abuja', expectedAttendees:800,
    status:'planning', rsvpCount:243, goals:['Showcase 2026 training impact','Launch 2027 curriculum roadmap','MoU signing with 3 new partners'],
    tasks:[
      { name:'Confirm venue and AV vendor',       done:true  },
      { name:'Send save-the-date to 1,200 contacts', done:true  },
      { name:'Confirm keynote speaker (Min. of Power)', done:false },
      { name:'Design and print programme booklets',  done:false },
      { name:'Set up virtual attendance link',       done:false },
      { name:'Prepare post-event impact report template', done:false },
    ],
  },
  {
    id:'EVT-2026-002', title:'Media Appreciation Dinner — Q1 2026', type:'stakeholder',
    date:'30 Apr 2026', venue:'Transcorp Hilton, Abuja', expectedAttendees:80,
    status:'invitations-sent', rsvpCount:67, goals:['Strengthen media relations','Brief media on Q2 programmes'],
    tasks:[
      { name:'Book venue and catering',              done:true  },
      { name:'Curate guest list and send invitations', done:true  },
      { name:'Prepare event runsheet',                done:false },
      { name:'Brief DG on media talking points',     done:false },
    ],
  },
]

const SENTIMENT_DATA = {
  timeline: [
    { date:'Jan', positive:72, neutral:22, negative:6  },
    { date:'Feb', positive:68, neutral:24, negative:8  },
    { date:'Mar', positive:75, neutral:18, negative:7  },
    { date:'Apr', positive:71, neutral:20, negative:9  },
  ],
  keywords: ['renewable energy','power sector','NAPTIN training','capacity building','blackout','NERC','DisCo','GenCo','apprenticeship'],
  crisisDetected: true,
  crisisKeyword: 'NAPTIN budget cut',
  crisisVolume: 127,
  crisisSourcesTopics: ['Twitter/X: 88 mentions — linking budget cut to planned training halt','The Punch: 3 news articles — "NAPTIN funding crisis may derail 2026 targets"','Facebook: 22 comments — alumni expressing concern'],
  currentScore: { positive:71, neutral:20, negative:9 },
}

// ── Utilities ──────────────────────────────────────────────────
const PILL_STYLES = {
  approved:'bg-green-50 text-[#006838] border-green-200', published:'bg-green-50 text-[#006838] border-green-200',
  draft:'bg-slate-50 text-slate-500 border-slate-200', scheduled:'bg-blue-50 text-blue-700 border-blue-200',
  'pending-legal':'bg-amber-50 text-amber-700 border-amber-200', distributed:'bg-purple-50 text-purple-700 border-purple-200',
  flagged:'bg-red-50 text-red-700 border-red-200', new:'bg-blue-50 text-blue-700 border-blue-200',
  'draft-ready':'bg-amber-50 text-amber-700 border-amber-200', responded:'bg-green-50 text-[#006838] border-green-200',
  planning:'bg-amber-50 text-amber-700 border-amber-200', 'invitations-sent':'bg-blue-50 text-blue-700 border-blue-200',
  conference:'bg-slate-100 text-slate-600 border-slate-200', stakeholder:'bg-purple-50 text-purple-600 border-purple-200',
  connected:'bg-green-50 text-[#006838] border-green-200', configured:'bg-blue-50 text-blue-700 border-blue-200',
  partial:'bg-amber-50 text-amber-700 border-amber-200', positive:'bg-green-50 text-[#006838] border-green-200',
  neutral:'bg-slate-50 text-slate-500 border-slate-200', negative:'bg-red-50 text-red-700 border-red-200',
  closed:'bg-slate-50 text-slate-500 border-slate-200',
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

const PLATFORM_ICONS = { 'Twitter/X': Twitter, LinkedIn: Linkedin, Instagram: Instagram, Facebook: Facebook }

// ════════════════════════════════════════════════════════════════
// TAB 1 — PRESS RELEASES
// ════════════════════════════════════════════════════════════════
function PressReleasesTab() {
  const [releases, setReleases] = useState(PRESS_RELEASES_INIT)
  const [expanded, setExpanded] = useState(null)
  const [toastMsg, clearToast, flash] = useToast()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title:'', author:'' })
  const [coverageInput, setCoverageInput] = useState({})

  function submitForApproval(id) {
    setReleases(prev => prev.map(r => r.id === id ? { ...r, status:'pending-legal' } : r))
    flash('Press release submitted — legal review workflow started, team notified')
  }
  function distribute(id) {
    setReleases(prev => prev.map(r => r.id === id ? { ...r, status:'distributed' } : r))
    flash('Press release distributed — email blast sent to all selected media contacts')
  }
  function remindApprovers(id) {
    flash(`Reminder sent to legal officer and PA Head for ${id} — pending review since submission`)
  }
  function logCoverage(id) {
    const outlet = coverageInput[id]
    if (!outlet) return
    setReleases(prev => prev.map(r => r.id === id ? { ...r, coverage: [...r.coverage, outlet] } : r))
    setCoverageInput(ci => ({ ...ci, [id]:'' }))
    flash(`Coverage logged: "${outlet}"`)
  }
  function createRelease() {
    if (!form.title) return
    const newR = {
      id:`PR-2026-${String(releases.length + 15).padStart(3,'0')}`,
      title:form.title, date:new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),
      status:'draft', author:form.author||'PA Officer',
      mediaTypes:[], sentiment:'neutral', coverage:[], checkedMedia:[],
    }
    setReleases(prev => [...prev, newR])
    setForm({ title:'', author:'' })
    setShowModal(false)
    flash('Press release draft created — ready for content authoring')
  }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />
      {showModal && (
        <Modal title="New Press Release" onClose={() => setShowModal(false)}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Title / Headline <span className="text-red-500">*</span></label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="e.g. NAPTIN launches ..." value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Author Name</label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="PA Officer name" value={form.author} onChange={e => setForm(f=>({...f,author:e.target.value}))} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowModal(false)} className="text-xs text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={createRelease} disabled={!form.title}
              className="text-xs font-bold bg-[#006838] text-white px-4 py-2 rounded-xl hover:bg-[#005530] disabled:opacity-40">Create Draft</button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'Distributed',       value: releases.filter(r=>r.status==='distributed').length,    color:'text-purple-600' },
          { label:'Approved',          value: releases.filter(r=>r.status==='approved').length,        color:'text-[#006838]'  },
          { label:'Pending Legal',     value: releases.filter(r=>r.status==='pending-legal').length,   color:'text-amber-600'  },
          { label:'Draft',             value: releases.filter(r=>r.status==='draft').length,           color:'text-slate-400'  },
        ].map((s,i) => (
          <div key={i} className="card py-3 text-center">
            <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{releases.length} press releases · Dual approval required (Legal + PA Head)</p>
        <AddBtn label="New Press Release" onClick={() => setShowModal(true)} />
      </div>

      {releases.map(r => (
        <div key={r.id} className="card">
          <button className="w-full flex items-start justify-between" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
            <div className="text-left flex-1 mr-3">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-mono text-[10px] text-slate-400">{r.id}</span>
                <Pill s={r.status} />
                <Pill s={r.sentiment} />
              </div>
              <p className="text-sm font-bold text-slate-800 leading-snug">{r.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{r.date} · {r.author}</p>
            </div>
            {expanded === r.id ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
          </button>

          {expanded === r.id && (
            <div className="mt-4 pt-4 border-t border-slate-50 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Distribution List</p>
                <div className="flex flex-wrap gap-1.5">
                  {['News Agencies','TV Stations','Online Newspapers','Radio Stations','Industry Publications'].map((m,i) => (
                    <span key={i} className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border ${
                      r.checkedMedia?.includes(m.toLowerCase().replace(' ','-')) || r.mediaTypes.some(mt => mt.toLowerCase().includes(m.toLowerCase().split(' ')[0]))
                        ? 'bg-green-50 text-[#006838] border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}>{m}</span>
                  ))}
                </div>
              </div>
              {r.coverage.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Coverage Logged ({r.coverage.length})</p>
                  <div className="flex flex-wrap gap-1.5">{r.coverage.map((c,i) => <span key={i} className="text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-xl">{c}</span>)}</div>
                </div>
              )}
              {r.status === 'distributed' && (
                <div className="flex items-center gap-2">
                  <input value={coverageInput[r.id]||''} onChange={e => setCoverageInput(ci=>({...ci,[r.id]:e.target.value}))}
                    placeholder="Enter media outlet that covered this release" className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#006838]" />
                  <button onClick={() => logCoverage(r.id)} className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-2 rounded-xl hover:bg-green-50 transition-colors">Log Coverage</button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {r.status === 'draft'         && <button onClick={() => submitForApproval(r.id)} className="text-xs font-bold text-amber-700 border border-amber-200 px-3 py-1 rounded-xl hover:bg-amber-50 flex items-center gap-1 transition-colors"><Send size={11} />Submit for Approval</button>}
                {r.status === 'pending-legal' && <button onClick={() => remindApprovers(r.id)} className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 flex items-center gap-1 font-semibold transition-colors"><Bell size={11} />Remind Approvers</button>}
                {r.status === 'approved'      && <button onClick={() => distribute(r.id)} className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors"><SendHorizonal size={11} />Distribute</button>}
                <button onClick={() => flash(`PDF export of ${r.id} — ${r.title} queued for download`)} className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 flex items-center gap-1 font-semibold transition-colors"><Download size={11} />Download PDF</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 2 — SOCIAL MEDIA
// ════════════════════════════════════════════════════════════════
function SocialTab() {
  const [posts, setPosts] = useState(SOCIAL_POSTS_INIT)
  const [toastMsg, clearToast, flash] = useToast()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ platform:'Twitter/X', content:'', scheduledDate:'' })

  function assignFlagged(id) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, flagReason: p.flagReason + ' [Assigned to Legal for review]' } : p))
    flash('Flagged post assigned to Legal Officer for review — response deadline set')
  }
  function reschedule(id) {
    const newDate = '12 Apr 2026 10:00'
    setPosts(prev => prev.map(p => p.id === id ? { ...p, scheduledDate: newDate } : p))
    flash(`Post ${id} rescheduled to ${newDate}`)
  }
  function viewAnalytics(id) {
    const p = posts.find(x => x.id === id)
    flash(`${id} analytics — ${p.likes} likes · ${p.impressions?.toLocaleString()} impressions`)
  }
  function createPost() {
    if (!form.content) return
    const newP = {
      id:`SP-${String(46 + posts.length - SOCIAL_POSTS_INIT.length).padStart(3,'0')}`,
      platform:form.platform, content:form.content,
      scheduledDate:form.scheduledDate||null,
      status: form.scheduledDate ? 'scheduled' : 'draft',
      likes:null, impressions:null, flagReason:null,
    }
    setPosts(prev => [...prev, newP])
    setForm({ platform:'Twitter/X', content:'', scheduledDate:'' })
    setShowModal(false)
    flash('Post created — queued for PA Head review before publishing')
  }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />
      {showModal && (
        <Modal title="Create Social Media Post" onClose={() => setShowModal(false)}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Platform</label>
            <select className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              value={form.platform} onChange={e => setForm(f=>({...f,platform:e.target.value}))}>
              {['Twitter/X','LinkedIn','Instagram','Facebook'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Content <span className="text-red-500">*</span></label>
            <textarea rows={4} className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838] resize-none"
              placeholder="Write your post..." value={form.content} onChange={e => setForm(f=>({...f,content:e.target.value}))} />
            <p className="text-[10px] text-slate-400 mt-0.5 text-right">{form.content.length} chars</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Schedule Date/Time (optional)</label>
            <input type="datetime-local" className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              value={form.scheduledDate} onChange={e => setForm(f=>({...f,scheduledDate:e.target.value}))} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowModal(false)} className="text-xs text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={createPost} disabled={!form.content}
              className="text-xs font-bold bg-[#006838] text-white px-4 py-2 rounded-xl hover:bg-[#005530] disabled:opacity-40">Save Post</button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'Published', value: posts.filter(p=>p.status==='published').length, color:'text-[#006838]'  },
          { label:'Scheduled', value: posts.filter(p=>p.status==='scheduled').length, color:'text-blue-600'   },
          { label:'Flagged',   value: posts.filter(p=>p.status==='flagged').length,   color:'text-red-600'    },
          { label:'Draft',     value: posts.filter(p=>p.status==='draft'||p.status==='approved').length,      color:'text-slate-400'  },
        ].map((s,i) => (
          <div key={i} className="card py-3 text-center">
            <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {posts.filter(p => p.status === 'flagged').map(p => (
        <div key={p.id} className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3 flex items-start gap-3">
          <TriangleAlert size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-800 flex-1"><strong>Flagged post {p.id}</strong> on {p.platform}: {p.flagReason}</p>
          <button onClick={() => assignFlagged(p.id)} className="flex-shrink-0 text-xs font-bold text-red-700 border border-red-300 px-3 py-1 rounded-xl hover:bg-red-100 transition-colors">Assign</button>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">All posts require PA Head review before publishing</p>
        <AddBtn label="Create Post" onClick={() => setShowModal(true)} />
      </div>

      {posts.map(p => {
        const PIcon = PLATFORM_ICONS[p.platform] ?? Star
        return (
          <div key={p.id} className={`card border ${p.status === 'flagged' ? 'border-red-200 bg-red-50/50' : 'border-slate-100'}`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <PIcon size={14} className="text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-bold text-slate-500">{p.platform}</span>
                  <Pill s={p.status} />
                  {p.scheduledDate && <span className="text-[10px] text-slate-400">📅 {p.scheduledDate}</span>}
                  {p.likes !== null && <span className="text-[10px] text-slate-400">❤️ {p.likes?.toLocaleString()} · 👁️ {p.impressions?.toLocaleString()}</span>}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{p.content}</p>
                {p.flagReason && <p className="text-[10px] text-red-700 mt-1 font-semibold">{p.flagReason}</p>}
              </div>
            </div>
            {(p.status === 'published' || p.status === 'scheduled') && (
              <div className="flex flex-wrap gap-2 mt-3">
                {p.status === 'published' && <button onClick={() => viewAnalytics(p.id)} className="text-xs text-blue-700 border border-blue-200 px-3 py-1 rounded-xl hover:bg-blue-50 flex items-center gap-1 font-semibold transition-colors"><TrendingUp size={11} />View Analytics</button>}
                {p.status === 'scheduled' && <button onClick={() => reschedule(p.id)} className="text-xs text-amber-700 border border-amber-200 px-3 py-1 rounded-xl hover:bg-amber-50 flex items-center gap-1 font-semibold transition-colors"><Clock size={11} />Reschedule</button>}
                <button onClick={() => flash(`Preview generated for ${p.id}`)} className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 font-semibold transition-colors flex items-center gap-1">Preview</button>
              </div>
            )}
          </div>
        )
      })}

      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-slate-600">Engagement Report</p>
          <button onClick={() => flash('Social media engagement report exported (CSV)')} className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 flex items-center gap-1 font-semibold transition-colors">
            <Download size={10} />Export Report
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-lg font-extrabold text-slate-800">{(posts.reduce((a,p)=>a+(p.likes||0),0)).toLocaleString()}</div>
            <div className="text-[10px] text-slate-400">Total Likes</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-lg font-extrabold text-slate-800">{(posts.reduce((a,p)=>a+(p.impressions||0),0)/1000).toFixed(1)}K</div>
            <div className="text-[10px] text-slate-400">Impressions</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-lg font-extrabold text-[#006838]">{posts.filter(p=>p.status==='published').length}</div>
            <div className="text-[10px] text-slate-400">Published Posts</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 3 — MEDIA INQUIRIES
// ════════════════════════════════════════════════════════════════
function MediaInquiriesTab() {
  const [inquiries, setInquiries] = useState(MEDIA_INQUIRIES_INIT)
  const [expanded, setExpanded] = useState(null)
  const [toastMsg, clearToast, flash] = useToast()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ outlet:'', reporter:'', topic:'', deadline:'' })
  const [responseText, setResponseText] = useState({})

  function draftResponse(id) {
    setInquiries(prev => prev.map(q => q.id === id ? { ...q, status:'draft-ready', assignedTo:'PA Head' } : q))
    flash('Response drafted — routed to PA Head for review and sign-off')
  }
  function submitResponse(id) {
    const text = responseText[id]
    if (!text) return
    setInquiries(prev => prev.map(q => q.id === id ? { ...q, status:'responded', response:text } : q))
    setResponseText(rt => ({...rt, [id]:''}))
    flash('Response submitted to media outlet — notes filed in DMS')
  }
  function logCoverage(id) {
    flash(`Coverage noted for ${id} — article link logged in media monitoring system`)
  }
  function logInquiry() {
    if (!form.outlet || !form.topic) return
    const newQ = {
      id:`MI-2026-${String(32 + inquiries.length - MEDIA_INQUIRIES_INIT.length).padStart(3,'0')}`,
      outlet:form.outlet, reporter:form.reporter||'—', topic:form.topic,
      received:new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),
      deadline:form.deadline||'TBD', status:'new', assignedTo:null, response:null,
    }
    setInquiries(prev => [...prev, newQ])
    setForm({ outlet:'', reporter:'', topic:'', deadline:'' })
    setShowModal(false)
    flash('Inquiry logged — assigned to PA Head for response within the deadline')
  }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />
      {showModal && (
        <Modal title="Log Media Inquiry" onClose={() => setShowModal(false)}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Media Outlet <span className="text-red-500">*</span></label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="e.g. The Punch" value={form.outlet} onChange={e=>setForm(f=>({...f,outlet:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reporter Name</label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="Reporter name" value={form.reporter} onChange={e=>setForm(f=>({...f,reporter:e.target.value}))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Topic <span className="text-red-500">*</span></label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="What are they asking about?" value={form.topic} onChange={e=>setForm(f=>({...f,topic:e.target.value}))} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Response Deadline</label>
            <input type="date" className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              value={form.deadline} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowModal(false)} className="text-xs text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={logInquiry} disabled={!form.outlet||!form.topic}
              className="text-xs font-bold bg-[#006838] text-white px-4 py-2 rounded-xl hover:bg-[#005530] disabled:opacity-40">Log Inquiry</button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'New',          value: inquiries.filter(q=>q.status==='new').length,            color:'text-blue-600' },
          { label:'Draft-Ready',  value: inquiries.filter(q=>q.status==='draft-ready').length,    color:'text-amber-600' },
          { label:'Responded',    value: inquiries.filter(q=>q.status==='responded').length,      color:'text-[#006838]' },
        ].map((s,i) => (
          <div key={i} className="card py-3 text-center">
            <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{inquiries.length} logged inquiries · 24-hr initial response target</p>
        <AddBtn label="Log Inquiry" onClick={() => setShowModal(true)} />
      </div>

      {inquiries.map(q => (
        <div key={q.id} className="card">
          <button className="w-full flex items-start justify-between" onClick={() => setExpanded(expanded === q.id ? null : q.id)}>
            <div className="text-left flex-1 mr-3">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-mono text-[10px] text-slate-400">{q.id}</span>
                <Pill s={q.status} />
              </div>
              <p className="text-sm font-bold text-slate-800">{q.topic}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{q.outlet} · {q.reporter} · Deadline: <strong>{q.deadline}</strong></p>
            </div>
            {expanded === q.id ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
          </button>

          {expanded === q.id && (
            <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
              {q.response && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-xs text-slate-700">
                  <p className="font-bold text-[#006838] mb-1">Official Response:</p>
                  <p>{q.response}</p>
                </div>
              )}
              {q.status !== 'responded' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Compose Response</label>
                  <textarea rows={3} className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838] resize-none"
                    placeholder="Type official response..." value={responseText[q.id]||''} onChange={e => setResponseText(rt=>({...rt,[q.id]:e.target.value}))} />
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {q.status === 'new'        && <button onClick={() => draftResponse(q.id)} className="text-xs font-bold text-amber-700 border border-amber-200 px-3 py-1 rounded-xl hover:bg-amber-50 flex items-center gap-1 transition-colors"><MessageSquare size={11} />Draft Response</button>}
                {q.status === 'draft-ready'&& <button onClick={() => submitResponse(q.id)} disabled={!responseText[q.id]} className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 disabled:opacity-40 transition-colors"><Send size={11} />Submit Response</button>}
                {q.status === 'responded'  && <button onClick={() => logCoverage(q.id)} className="text-xs text-purple-700 border border-purple-200 px-3 py-1 rounded-xl hover:bg-purple-50 flex items-center gap-1 font-semibold transition-colors"><Newspaper size={11} />Log Coverage</button>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 4 — EVENT MANAGEMENT
// ════════════════════════════════════════════════════════════════
function EventsTab() {
  const [events, setEvents] = useState(EVENTS_INIT)
  const [expanded, setExpanded] = useState(null)
  const [toastMsg, clearToast, flash] = useToast()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title:'', venue:'', date:'', expectedAttendees:'' })

  function toggleTask(evtId, taskIdx) {
    setEvents(prev => prev.map(e => e.id !== evtId ? e : {
      ...e,
      tasks: e.tasks.map((t,i) => i === taskIdx ? { ...t, done: !t.done } : t)
    }))
  }
  function sendInvitations(id) {
    flash('Event invitations sent — 1,200 contacts notified via email + SMS')
  }
  function previewRSVP(id) {
    const evt = events.find(e => e.id === id)
    flash(`RSVP Dashboard: ${evt.rsvpCount} confirmed / ${evt.expectedAttendees} expected`)
  }
  function downloadReport(id) {
    flash(`Post-event report for ${id} queued for PDF download`)
  }
  function createEvent() {
    if (!form.title) return
    const newE = {
      id:`EVT-2026-${String(events.length + 4).padStart(3,'0')}`,
      title:form.title, type:'conference',
      date:form.date||'TBD', venue:form.venue||'TBD',
      expectedAttendees:parseInt(form.expectedAttendees)||0,
      status:'planning', rsvpCount:0, goals:[],
      tasks:[{ name:'Create event brief', done:false }],
    }
    setEvents(prev => [...prev, newE])
    setForm({ title:'', venue:'', date:'', expectedAttendees:'' })
    setShowModal(false)
    flash('Event created — planning checklist initialised, team notified')
  }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />
      {showModal && (
        <Modal title="Create New Event" onClose={() => setShowModal(false)}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Event Title <span className="text-red-500">*</span></label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="e.g. Annual Training Summit" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="e.g. 10–12 Jun 2026" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Attendees</label>
              <input type="number" className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="0" value={form.expectedAttendees} onChange={e=>setForm(f=>({...f,expectedAttendees:e.target.value}))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Venue</label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="e.g. ICC Abuja" value={form.venue} onChange={e=>setForm(f=>({...f,venue:e.target.value}))} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowModal(false)} className="text-xs text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={createEvent} disabled={!form.title}
              className="text-xs font-bold bg-[#006838] text-white px-4 py-2 rounded-xl hover:bg-[#005530] disabled:opacity-40">Create Event</button>
          </div>
        </Modal>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{events.length} active events · Task-based planning with RSVP tracking</p>
        <AddBtn label="Create Event" onClick={() => setShowModal(true)} />
      </div>

      {events.map(evt => {
        const doneCount = evt.tasks.filter(t => t.done).length
        const progress = Math.round((doneCount / evt.tasks.length) * 100)
        return (
          <div key={evt.id} className="card">
            <button className="w-full flex items-start justify-between" onClick={() => setExpanded(expanded === evt.id ? null : evt.id)}>
              <div className="text-left flex-1 mr-3">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-mono text-[10px] text-slate-400">{evt.id}</span>
                  <Pill s={evt.status} /><Pill s={evt.type} />
                </div>
                <p className="text-sm font-bold text-slate-800">{evt.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{evt.date} · {evt.venue} · {evt.rsvpCount}/{evt.expectedAttendees} RSVPs</p>
                <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-[#006838] h-1.5 rounded-full transition-all" style={{ width:`${progress}%` }} />
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5">{doneCount}/{evt.tasks.length} tasks complete ({progress}%)</p>
              </div>
              {expanded === evt.id ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
            </button>

            {expanded === evt.id && (
              <div className="mt-4 pt-4 border-t border-slate-50 space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Planning Checklist</p>
                  <div className="space-y-1.5">
                    {evt.tasks.map((task, ti) => (
                      <button key={ti} onClick={() => toggleTask(evt.id, ti)}
                        className={`w-full flex items-center gap-2.5 text-xs text-left px-3 py-2 rounded-xl border transition-all ${task.done ? 'bg-green-50 border-green-200 text-[#006838]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                        <span className={`w-4 h-4 rounded-md border flex-shrink-0 flex items-center justify-center ${task.done ? 'bg-[#006838] border-[#006838]' : 'border-slate-300 bg-white'}`}>
                          {task.done && <CheckCircle2 size={10} className="text-white" />}
                        </span>
                        <span className={task.done ? 'line-through opacity-60' : ''}>{task.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {evt.goals.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Event Goals</p>
                    {evt.goals.map((g,i) => <p key={i} className="text-xs text-slate-600">• {g}</p>)}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => sendInvitations(evt.id)} className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors"><Send size={11} />Send Invitations</button>
                  <button onClick={() => previewRSVP(evt.id)} className="text-xs text-blue-700 border border-blue-200 px-3 py-1 rounded-xl hover:bg-blue-50 flex items-center gap-1 font-semibold transition-colors"><Users size={11} />Preview RSVP Dashboard</button>
                  {evt.status !== 'planning' && <button onClick={() => downloadReport(evt.id)} className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 flex items-center gap-1 font-semibold transition-colors"><Download size={11} />Download Post-Event Report</button>}
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
// TAB 5 — SENTIMENT MONITOR
// ════════════════════════════════════════════════════════════════
function SentimentTab() {
  const data = SENTIMENT_DATA
  const [crisisMode, setCrisisMode] = useState(data.crisisDetected)
  const [statementSent, setStatementSent] = useState(false)
  const [crisisTeamNotified, setCrisisTeamNotified] = useState(false)
  const [keywords, setKeywords] = useState(data.keywords)
  const [newKeyword, setNewKeyword] = useState('')
  const [toastMsg, clearToast, flash] = useToast()

  function releaseStatement() {
    setStatementSent(true)
    setCrisisMode(false)
    flash('Holding statement released — distributed to all media contacts + social media + website banner updated')
  }
  function notifyCrisisTeam() {
    setCrisisTeamNotified(true)
    flash('Crisis committee notified — DG, Legal, PA Head, Corporate Secretary alerted via SMS + email')
  }
  function addKeyword() {
    const kw = newKeyword.trim()
    if (!kw || keywords.includes(kw)) return
    setKeywords(prev => [...prev, kw])
    setNewKeyword('')
    flash(`Keyword "${kw}" added to monitoring list`)
  }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />

      {crisisMode && !statementSent && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl px-5 py-4">
          <div className="flex items-start gap-3 mb-3">
            <TriangleAlert size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-extrabold text-red-800">Crisis Alert — Negative Spike Detected</p>
              <p className="text-xs text-red-700 mt-0.5">Keyword: <strong>"{data.crisisKeyword}"</strong> — {data.crisisVolume} mentions in last 24 hours</p>
            </div>
          </div>
          <div className="space-y-1 mb-4">
            {data.crisisSourcesTopics.map((s,i) => <p key={i} className="text-xs text-red-700">• {s}</p>)}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={releaseStatement} disabled={statementSent}
              className="text-xs font-bold text-red-700 bg-red-100 border border-red-300 px-3 py-1.5 rounded-xl hover:bg-red-200 flex items-center gap-1 transition-colors disabled:opacity-40">
              <SendHorizonal size={11} />Release Holding Statement
            </button>
            <button onClick={notifyCrisisTeam} disabled={crisisTeamNotified}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1 transition-colors ${
                crisisTeamNotified ? 'bg-green-50 text-[#006838] border-green-200' : 'text-red-700 border-red-300 bg-white hover:bg-red-50'
              }`}>
              <Bell size={11} />{crisisTeamNotified ? 'Crisis Team Notified ✓' : 'Notify Crisis Team'}
            </button>
          </div>
        </div>
      )}

      {statementSent && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3 text-xs text-[#006838] font-semibold">
          ✓ Holding statement released — crisis communications workflow active. Monitor for sentiment recovery.
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Positive',  value:`${data.currentScore.positive}%`, color:'text-[#006838] bg-green-50' },
          { label:'Neutral',   value:`${data.currentScore.neutral}%`,  color:'text-slate-500 bg-slate-50' },
          { label:'Negative',  value:`${data.currentScore.negative}%`, color:'text-red-600 bg-red-50'     },
        ].map((s,i) => (
          <div key={i} className={`card py-3 text-center ${s.color}`}>
            <div className="text-xl font-extrabold">{s.value}</div>
            <div className="text-[10px] font-medium mt-0.5">{s.label} sentiment</div>
          </div>
        ))}
      </div>

      <Card>
        <p className="text-xs font-bold text-slate-700 mb-3">Sentiment Trend — Last 4 Months</p>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={data.timeline}>
            <XAxis dataKey="date" tick={{ fontSize:9, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0,100]} tick={{ fontSize:9, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v,n) => [`${v}%`,n]} />
            <Line type="monotone" dataKey="positive" stroke="#006838" strokeWidth={2} dot={false} name="Positive" />
            <Line type="monotone" dataKey="neutral"  stroke="#94a3b8" strokeWidth={1.5} dot={false} name="Neutral" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} dot={false} name="Negative" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <p className="text-xs font-bold text-slate-700 mb-2">Monitored Keywords</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {keywords.map((kw,i) => (
            <span key={i} className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">{kw}</span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newKeyword} onChange={e => setNewKeyword(e.target.value)}
            onKeyDown={e => e.key==='Enter' && addKeyword()}
            placeholder="Add keyword to monitor..." className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#006838]" />
          <button onClick={addKeyword} disabled={!newKeyword.trim()}
            className="text-xs font-bold text-blue-700 border border-blue-200 px-3 py-2 rounded-xl hover:bg-blue-50 disabled:opacity-40 transition-colors flex items-center gap-1">
            <Plus size={11} />Add
          </button>
        </div>
      </Card>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 6 — ROLES & INTEGRATIONS
// ════════════════════════════════════════════════════════════════
function RolesTab() {
  const roles = Object.keys(PA_ROLE_MATRIX)
  const modules = Object.keys(PA_ROLE_MATRIX[roles[0]])
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
            {modules.map((mod) => (
              <tr key={mod} className="border-t border-slate-50">
                <td className="px-4 py-2.5 font-bold text-slate-700 sticky left-0 bg-white">{mod}</td>
                {roles.map(role => (
                  <td key={role} className="px-4 py-2.5 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {PA_ROLE_MATRIX[role][mod]?.map((p,j) => (
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
          {PA_INTEGRATIONS.map((int,i) => (
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
  { id:'press',     label:'Press Releases',     icon: Newspaper      },
  { id:'social',    label:'Social Media',        icon: SendHorizonal  },
  { id:'media',     label:'Media Inquiries',     icon: MessageSquare  },
  { id:'events',    label:'Event Management',    icon: CalendarDays   },
  { id:'sentiment', label:'Sentiment Monitor',   icon: TrendingUp     },
  { id:'roles',     label:'Roles & Integrations',icon: Shield         },
]

export default function PublicAffairsPage() {
  const [tab, setTab] = useState('press')

  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Public Affairs Workbench</h1>
            <p className="text-sm text-slate-400">Press Releases · Social Media · Media Inquiries · Events · Sentiment Monitoring</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label:'Distributed Releases',   value: PRESS_RELEASES_INIT.filter(r=>r.status==='distributed').length, icon: Newspaper,      bg:'bg-purple-50', color:'text-purple-600' },
          { label:'Pending Legal Review',   value: PRESS_RELEASES_INIT.filter(r=>r.status==='pending-legal').length,icon:Clock,           bg:'bg-amber-50',  color:'text-amber-600'  },
          { label:'Flagged Social Posts',   value: SOCIAL_POSTS_INIT.filter(p=>p.status==='flagged').length,        icon: AlertTriangle,  bg:'bg-red-50',    color:'text-red-600'    },
          { label:'Active Events',          value: EVENTS_INIT.filter(e=>['planning','invitations-sent'].includes(e.status)).length, icon: CalendarDays, bg:'bg-blue-50', color:'text-blue-600' },
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

      {tab === 'press'     && <PressReleasesTab />}
      {tab === 'social'    && <SocialTab />}
      {tab === 'media'     && <MediaInquiriesTab />}
      {tab === 'events'    && <EventsTab />}
      {tab === 'sentiment' && <SentimentTab />}
      {tab === 'roles'     && <RolesTab />}
    </div>
  )
}
