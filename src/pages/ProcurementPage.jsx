import { useState } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import {
  ShoppingCart, Package, FileText, ClipboardList, Star,
  Plus, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2,
  Clock, Upload, Users, Download, FileSignature, RefreshCw,
  TrendingUp, Shield, Search, XCircle, TriangleAlert, X,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

// ── Role Matrix ────────────────────────────────────────────────
const PROC_ROLE_MATRIX = {
  'Procurement Officer': { 'Proc. Plan':['submit','review','consolidate'], 'Vendor Mgmt':['register','vet','score','suspend'], 'Tendering':['create','publish','evaluate','award'], 'Purchase Orders':['create','submit'], 'Perf. Scorecard':['evaluate','report'] },
  'Requisitioner':       { 'Proc. Plan':['submit-request'], 'Vendor Mgmt':['view'], 'Tendering':['view'], 'Purchase Orders':['create','track'], 'Perf. Scorecard':['submit-rating'] },
  'Finance Manager':     { 'Proc. Plan':['approve'], 'Vendor Mgmt':['view'], 'Tendering':['view'], 'Purchase Orders':['approve','3-way-match'], 'Perf. Scorecard':['view','export'] },
  'Department Head':     { 'Proc. Plan':['submit-request','approve'], 'Vendor Mgmt':['view'], 'Tendering':['view'], 'Purchase Orders':['approve'], 'Perf. Scorecard':['view'] },
  'Director General':    { 'Proc. Plan':['approve-final'], 'Vendor Mgmt':['view'], 'Tendering':['view','approve-award'], 'Purchase Orders':['approve-high-value'], 'Perf. Scorecard':['view','export'] },
  'Tender Board':        { 'Proc. Plan':['view'], 'Vendor Mgmt':['view'], 'Tendering':['final-award'], 'Purchase Orders':['approve-major'], 'Perf. Scorecard':['view'] },
}

const PROC_INTEGRATIONS = [
  { system:'BPP E-Procurement Portal',  purpose:'Publish open tenders; submit annual plans to federal oversight',           status:'configured' },
  { system:'Finance / ERP Module',      purpose:'Budget validation on PO creation; 3-way invoice matching',                  status:'connected'  },
  { system:'CAC / FIRS Portal',         purpose:'Automated validation of vendor tax clearance and incorporation cert',       status:'partial'    },
  { system:'E-Signature (DocuSign)',    purpose:'Contract and PO countersignature workflow',                                  status:'connected'  },
  { system:'Logistics / Warehouse',     purpose:'Goods receipt confirmation; auto stock update post-delivery',               status:'configured' },
  { system:'Document Center (DMS)',     purpose:'Store tender packs, evaluation reports, signed contracts',                  status:'connected'  },
  { system:'Email / SMS Gateway',       purpose:'Vendor notifications: bid alerts, PO dispatch, blacklist notices',          status:'connected'  },
]

// ── Embedded Mock Data ─────────────────────────────────────────
const APP_ITEMS_INIT = [
  { id:'APP-001', dept:'ICT',       item:'Laptops & accessories',          total:'₦22,500,000', budgetCode:'ICT-CAP-26',  status:'approved',  consolidation:null },
  { id:'APP-002', dept:'Admin',     item:'Office furniture — Block C',      total:'₦9,600,000',  budgetCode:'ADM-CAP-26',  status:'approved',  consolidation:null },
  { id:'APP-003', dept:'Training',  item:'Training laptops — RTCs',         total:'₦13,500,000', budgetCode:'TRN-CAP-26',  status:'pending',   consolidation:'Merge with ICT APP-001? Save ~12% on bulk purchase' },
  { id:'APP-004', dept:'Finance',   item:'Accounting software licence',     total:'₦3,500,000',  budgetCode:'FIN-REC-26',  status:'approved',  consolidation:null },
  { id:'APP-005', dept:'HR',        item:'Office stationery & consumables', total:'₦800,000',    budgetCode:'HR-REC-26',   status:'flagged',   consolidation:'3 departments requested stationery — consolidate for bulk discount (est. 18% saving)' },
  { id:'APP-006', dept:'Admin',     item:'Office stationery & consumables', total:'₦950,000',    budgetCode:'ADM-REC-26',  status:'flagged',   consolidation:'3 departments requested stationery — consolidate for bulk discount (est. 18% saving)' },
  { id:'APP-007', dept:'ICT',       item:'Office stationery & consumables', total:'₦400,000',    budgetCode:'ICT-REC-26',  status:'flagged',   consolidation:'3 departments requested stationery — consolidate for bulk discount (est. 18% saving)' },
  { id:'APP-008', dept:'Training',  item:'Renewable energy lab equipment',  total:'₦120,000,000',budgetCode:'TRN-CAP-26',  status:'approved',  consolidation:null },
]

const VENDORS_INIT = [
  { id:'VND001', name:'PowerTech Nigeria Ltd',    category:'Equipment Supply',  tier:'Tier 1',  score:4.8, status:'active',     contracts:12, value:'₦45.2M', taxExp:'31 Dec 2026', cacDate:'01 Jan 2025', lastReq:'01 Jan 2026' },
  { id:'VND002', name:'Abuja Office Solutions',   category:'Office Supplies',   tier:'Tier 2',  score:4.5, status:'active',     contracts:8,  value:'₦8.7M',  taxExp:'31 Mar 2026', cacDate:'01 Jun 2023', lastReq:'15 Mar 2026' },
  { id:'VND003', name:'TransNet Engineering',     category:'Civil Works',       tier:'Tier 1',  score:4.2, status:'active',     contracts:5,  value:'₦120.5M',taxExp:'30 Jun 2026', cacDate:'01 Jan 2020', lastReq:'01 Jun 2025' },
  { id:'VND004', name:'DataSoft Systems',         category:'ICT Services',      tier:'Tier 2',  score:0,   status:'pending',    contracts:0,  value:'—',      taxExp:'pending',     cacDate:'pending',     lastReq:'—'           },
  { id:'VND005', name:'SafeGuard Security',       category:'Security Services', tier:'Tier 2',  score:4.6, status:'active',     contracts:3,  value:'₦15.3M', taxExp:'31 Dec 2026', cacDate:'01 Mar 2022', lastReq:'01 Dec 2025' },
  { id:'VND006', name:'BuildRight Construction',  category:'Civil Works',       tier:'Tier 1',  score:1.6, status:'show-cause', contracts:3,  value:'₦38.0M', taxExp:'31 Oct 2026', cacDate:'01 Jul 2019', lastReq:'01 Jul 2025' },
  { id:'VND007', name:'QuickPrint Nigeria',       category:'Printing',          tier:'Tier 3',  score:3.2, status:'suspended',  contracts:2,  value:'₦4.1M',  taxExp:'31 Dec 2026', cacDate:'01 Jan 2022', lastReq:'15 Feb 2026' },
]

const TENDERS_INIT = [
  {
    id:'TDR-2026-009', title:'Renewable energy lab equipment — 3 RTCs', dept:'Training', budget:'₦120,000,000',
    published:'01 Apr 2026', deadline:'30 Apr 2026', preBidDate:'12 Apr 2026', status:'open', type:'ITB',
    techWeight:70, priceWeight:30, evalPhase:'technical', awardeeName:null,
    bids:[
      { vendor:'PowerTech Nigeria Ltd', techScore:82,  price:'₦108,000,000', combined:null, status:'submitted'   },
      { vendor:'EnergyGen West Africa', techScore:78,  price:'₦115,000,000', combined:null, status:'submitted'   },
      { vendor:'GreenTech Solutions',   techScore:91,  price:'₦121,000,000', combined:null, status:'submitted'   },
      { vendor:'SolarPro Ltd',          techScore:55,  price:'₦99,000,000',  combined:null, status:'disqualified'},
    ],
    qaThread:[
      { from:'EnergyGen West Africa', question:'Can the equipment be split into separate lots?', answered:false },
      { from:'PowerTech Nigeria Ltd', question:'Is ISO 9001 certification required?',            answered:true,  answer:'Yes — ISO 9001 required for all lab equipment suppliers.' },
    ],
  },
  {
    id:'TDR-2026-008', title:'Cleaning & janitorial services 2026–2027', dept:'Admin', budget:'₦18,000,000',
    published:'28 Mar 2026', deadline:'25 Apr 2026', preBidDate:null, status:'evaluation', type:'RFQ',
    techWeight:60, priceWeight:40, evalPhase:'financial', awardeeName:null,
    bids:[
      { vendor:'CleanPro Services',  techScore:88, price:'₦14,500,000', combined:(88*0.6+100*0.4).toFixed(1), status:'qualified' },
      { vendor:'HygienePlus Ltd',    techScore:75, price:'₦13,800,000', combined:(75*0.6+105*0.4).toFixed(1), status:'qualified' },
      { vendor:'SpotlessPro NG',     techScore:91, price:'₦16,200,000', combined:(91*0.6+90*0.4).toFixed(1),  status:'qualified' },
    ],
    qaThread:[],
  },
  {
    id:'TDR-2026-005', title:'Training manuals printing — Q2 cohort', dept:'Training', budget:'₦4,500,000',
    published:'10 Mar 2026', deadline:'07 Apr 2026', preBidDate:null, status:'awarded', type:'RFQ',
    techWeight:50, priceWeight:50, evalPhase:'complete', awardeeName:'QuickPrint Nigeria',
    bids:[
      { vendor:'QuickPrint Nigeria', techScore:72, price:'₦3,900,000', combined:'86.0', status:'winner'   },
      { vendor:'PrintFirst Abuja',   techScore:80, price:'₦4,200,000', combined:'80.0', status:'notified' },
    ],
    qaThread:[],
  },
]

const PURCHASE_ORDERS_INIT = [
  {
    ref:'PO-2026-0142', desc:'Server hardware replacement — ICT Dept', vendor:'DataSoft Systems',
    amount:'₦8,750,000', amountRaw:8750000, dept:'ICT', planRef:'APP-001',
    date:'27 Mar 2026', status:'approved',
    approvals:[
      { role:'Dept Head',       name:'Adamu Bello',       action:'approved', date:'28 Mar 2026' },
      { role:'Procurement',     name:'Amina Salaudeen',   action:'approved', date:'28 Mar 2026' },
      { role:'Finance Manager', name:'Chidi Okafor',      action:'approved', date:'29 Mar 2026' },
    ],
    vendorAccepted:true, goodsReceived:true, invoiceSubmitted:true, matchStatus:'matched',
  },
  {
    ref:'PO-2026-0141', desc:'Office furniture — Admin Block C', vendor:'Abuja Office Solutions',
    amount:'₦2,100,000', amountRaw:2100000, dept:'Admin', planRef:'APP-002',
    date:'25 Mar 2026', status:'pending',
    approvals:[
      { role:'Dept Head',   name:'Fatima Idris',     action:'approved', date:'26 Mar 2026' },
      { role:'Procurement', name:'Amina Salaudeen',  action:'pending',  date:'' },
    ],
    vendorAccepted:false, goodsReceived:false, invoiceSubmitted:false, matchStatus:null,
  },
  {
    ref:'PO-2026-0140', desc:'Transformer spare parts — Training Lab', vendor:'PowerTech Nigeria Ltd',
    amount:'₦15,400,000', amountRaw:15400000, dept:'Training', planRef:'APP-008',
    date:'22 Mar 2026', status:'approved',
    approvals:[
      { role:'Dept Head',        name:'Dr. Uche Eze',       action:'approved', date:'23 Mar 2026' },
      { role:'Procurement',      name:'Amina Salaudeen',    action:'approved', date:'23 Mar 2026' },
      { role:'Finance Manager',  name:'Chidi Okafor',       action:'approved', date:'24 Mar 2026' },
      { role:'Director General', name:'Engr. M. Lawal',     action:'approved', date:'25 Mar 2026' },
    ],
    vendorAccepted:true, goodsReceived:false, invoiceSubmitted:false, matchStatus:null,
  },
]

const SCORECARDS_INIT = [
  { vendorId:'VND001', vendor:'PowerTech Nigeria Ltd',   poCount:3, avgScore:4.8, timeliness:5, quality:5, support:4, priceComp:5, trend:'stable',    status:'active'     },
  { vendorId:'VND002', vendor:'Abuja Office Solutions',  poCount:1, avgScore:4.5, timeliness:4, quality:5, support:4, priceComp:5, trend:'stable',    status:'active'     },
  { vendorId:'VND003', vendor:'TransNet Engineering',    poCount:2, avgScore:4.2, timeliness:4, quality:4, support:4, priceComp:5, trend:'improving', status:'active'     },
  { vendorId:'VND006', vendor:'BuildRight Construction', poCount:3, avgScore:1.6, timeliness:1, quality:2, support:2, priceComp:2, trend:'declining', status:'show-cause' },
  { vendorId:'VND007', vendor:'QuickPrint Nigeria',      poCount:2, avgScore:3.2, timeliness:3, quality:3, support:3, priceComp:4, trend:'declining', status:'suspended'  },
]

// ── Helpers ────────────────────────────────────────────────────
const PILL_STYLES = {
  approved:'bg-green-50 text-[#006838] border-green-200', active:'bg-green-50 text-[#006838] border-green-200',
  pending:'bg-amber-50 text-amber-700 border-amber-200', flagged:'bg-orange-50 text-orange-700 border-orange-200',
  open:'bg-blue-50 text-blue-700 border-blue-200', evaluation:'bg-purple-50 text-purple-700 border-purple-200',
  awarded:'bg-green-50 text-[#006838] border-green-200', matched:'bg-green-50 text-[#006838] border-green-200',
  'show-cause':'bg-red-50 text-red-700 border-red-200', suspended:'bg-red-50 text-red-700 border-red-200',
  submitted:'bg-blue-50 text-blue-700 border-blue-200', qualified:'bg-green-50 text-[#006838] border-green-200',
  winner:'bg-green-50 text-[#006838] border-green-200', notified:'bg-slate-50 text-slate-500 border-slate-200',
  disqualified:'bg-red-50 text-red-700 border-red-200', improving:'bg-green-50 text-[#006838] border-green-200',
  stable:'bg-slate-50 text-slate-500 border-slate-200', declining:'bg-red-50 text-red-700 border-red-200',
  configured:'bg-blue-50 text-blue-700 border-blue-200', connected:'bg-green-50 text-[#006838] border-green-200',
  partial:'bg-amber-50 text-amber-700 border-amber-200', blacklisted:'bg-red-100 text-red-800 border-red-300',
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

function StarRating({ score }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={10} className={score >= i ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
      ))}
      <span className="ml-1 text-[10px] text-slate-500 font-semibold">{score > 0 ? score.toFixed(1) : 'N/A'}</span>
    </span>
  )
}

function ApprovalChain({ steps }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {steps.map((s, i) => (
        <span key={i} className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
          s.action === 'approved' ? 'bg-green-50 text-[#006838] border-green-200' :
          s.action === 'pending'  ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-slate-50 text-slate-400 border-slate-200'
        }`}>
          {s.action === 'approved' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
          {s.role}
        </span>
      ))}
    </div>
  )
}

function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>
}

function Accordion({ id, expanded, toggle, header, children }) {
  return (
    <Card>
      <button className="w-full flex items-start justify-between" onClick={() => toggle(id === expanded ? null : id)}>
        <div className="text-left flex-1 mr-3">{header}</div>
        {expanded === id ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />}
      </button>
      {expanded === id && <div className="mt-4 pt-4 border-t border-slate-50 space-y-4">{children}</div>}
    </Card>
  )
}

// ── Toast ──────────────────────────────────────────────────────
function Toast({ msg, clear }) {
  if (!msg) return null
  return (
    <div className="fixed bottom-6 right-6 z-[99] bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-fade-up">
      <CheckCircle2 size={13} className="text-green-400" />{msg}
      <button onClick={clear} className="ml-1 text-slate-400 hover:text-white"><X size={11} /></button>
    </div>
  )
}

function useToast() {
  const [msg, setMsg] = useState(null)
  function flash(m) { setMsg(m); setTimeout(() => setMsg(null), 3000) }
  return [msg, () => setMsg(null), flash]
}

// ── Modal ──────────────────────────────────────────────────────
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
// TAB 1 — ANNUAL PROCUREMENT PLAN
// ════════════════════════════════════════════════════════════════
function APPTab() {
  const [items, setItems] = useState(APP_ITEMS_INIT)
  const [toastMsg, clearToast, flash] = useToast()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ dept:'', item:'', total:'', budgetCode:'' })

  const flagged = items.filter(i => i.consolidation)
  const uniqueAlerts = [...new Set(flagged.map(f => f.consolidation))]

  function consolidate() {
    setItems(prev => prev.map(i => i.status === 'flagged' ? { ...i, status:'pending', consolidation:null } : i))
    flash('Consolidation applied — items merged into single requisition, status set to Pending')
  }

  function routeForApproval(id) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status:'pending' } : i))
    flash(`${id} routed for approval — Procurement review workflow started`)
  }

  function addRequest() {
    if (!form.dept || !form.item) return
    const newItem = {
      id: `APP-${String(items.length + 1).padStart(3,'0')}`,
      dept: form.dept, item: form.item,
      total: form.total || '—', budgetCode: form.budgetCode || 'TBD',
      status: 'pending', consolidation: null,
    }
    setItems(prev => [...prev, newItem])
    setForm({ dept:'', item:'', total:'', budgetCode:'' })
    setShowModal(false)
    flash('Department request added — awaiting procurement review')
  }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />
      {showModal && (
        <Modal title="Add Department Request" onClose={() => setShowModal(false)}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department <span className="text-red-500">*</span></label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="e.g. ICT" value={form.dept} onChange={e => setForm(f => ({...f, dept:e.target.value}))} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Item Description <span className="text-red-500">*</span></label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="What is being requested?" value={form.item} onChange={e => setForm(f => ({...f, item:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Value</label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="₦0" value={form.total} onChange={e => setForm(f => ({...f, total:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Budget Code</label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="e.g. ICT-CAP-26" value={form.budgetCode} onChange={e => setForm(f => ({...f, budgetCode:e.target.value}))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowModal(false)} className="text-xs text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={addRequest} disabled={!form.dept || !form.item}
              className="text-xs font-bold bg-[#006838] text-white px-4 py-2 rounded-xl hover:bg-[#005530] disabled:opacity-40">Submit Request</button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'Approved Items',        value: items.filter(i=>i.status==='approved').length, color:'text-[#006838]'  },
          { label:'Pending / Routing',     value: items.filter(i=>i.status==='pending').length,  color:'text-amber-600' },
          { label:'Consolidation Alerts',  value: items.filter(i=>i.status==='flagged').length,  color:'text-orange-600'},
          { label:'Total Plan Value',      value:'₦170.3M',                                      color:'text-slate-900' },
        ].map((s,i) => (
          <div key={i} className="card py-3 text-center">
            <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {uniqueAlerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-3.5 flex items-start gap-3">
          <TriangleAlert size={14} className="text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-orange-800 mb-1.5">Consolidation Opportunities Detected</p>
            {uniqueAlerts.map((msg, i) => <p key={i} className="text-xs text-orange-700">• {msg}</p>)}
          </div>
          <button onClick={consolidate}
            className="flex-shrink-0 text-xs font-bold text-orange-700 border border-orange-300 px-3 py-1 rounded-xl hover:bg-orange-100 transition-colors">
            Apply Consolidation
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Annual Procurement Plan 2026 · {items.length} line items</p>
        <AddBtn label="Add Department Request" onClick={() => setShowModal(true)} />
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50">
              {['ID','Department','Item','Total Value','Budget Code','Status','Action'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left font-semibold text-slate-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-50 hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400">{item.id}</td>
                <td className="px-4 py-2.5 font-semibold text-slate-700">{item.dept}</td>
                <td className="px-4 py-2.5 text-slate-800 max-w-[180px]">
                  <div>{item.item}</div>
                  {item.consolidation && <div className="text-[9px] text-orange-600 font-semibold mt-0.5 leading-snug">{item.consolidation.split('—')[0]}</div>}
                </td>
                <td className="px-4 py-2.5 font-semibold text-slate-700">{item.total}</td>
                <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400">{item.budgetCode}</td>
                <td className="px-4 py-2.5"><Pill s={item.status} /></td>
                <td className="px-4 py-2.5">
                  {item.status === 'flagged'
                    ? <button onClick={consolidate} className="text-[10px] font-bold text-orange-600 hover:underline">Consolidate</button>
                    : item.status === 'pending'
                      ? <button onClick={() => routeForApproval(item.id)} className="text-[10px] font-bold text-amber-600 hover:underline">Route for Approval</button>
                      : <button onClick={() => flash(`${item.id} — ${item.item} (${item.dept}): Budget code ${item.budgetCode}, value ${item.total}`)} className="text-[10px] text-slate-400 hover:underline">View</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">APP Approval Workflow</p>
        <div className="flex flex-wrap gap-3 text-[11px] text-slate-600 font-semibold">
          {['Dept Submission','Procurement Review & Consolidation','Finance Approval','DG Sign-off','Published'].map((s, i, arr) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="bg-[#006838] text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[9px] flex-shrink-0">{i+1}</span>
              <span>{s}</span>
              {i < arr.length-1 && <ChevronRight size={10} className="text-slate-300" />}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-3">Once published, system blocks PO creation for line items not in the plan — a variance approval is required.</p>
      </Card>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 2 — VENDOR MANAGEMENT
// ════════════════════════════════════════════════════════════════
function VendorTab() {
  const [expanded, setExpanded] = useState(null)
  const [vendors, setVendors] = useState(VENDORS_INIT)
  const [toastMsg, clearToast, flash] = useToast()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name:'', category:'', tier:'Tier 2' })

  function approveVendor(id) {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status:'active', score:0, contracts:0 } : v))
    flash('Vendor approved & categorized — access to bid portal granted')
  }
  function escalateSuspend(id) {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status:'suspended' } : v))
    flash('Vendor escalated to suspended — bidding access revoked + blacklist notice sent')
  }
  function requestDocUpdate(id) {
    flash(`Document update request sent to ${vendors.find(v=>v.id===id)?.name} — 14-day deadline set`)
  }
  function registerVendor() {
    if (!form.name) return
    const newV = {
      id:`VND${String(vendors.length+1).padStart(3,'0')}`, name:form.name, category:form.category||'General',
      tier:form.tier, score:0, status:'pending', contracts:0, value:'—',
      taxExp:'pending', cacDate:'pending', lastReq:'—',
    }
    setVendors(prev => [...prev, newV])
    setForm({ name:'', category:'', tier:'Tier 2' })
    setShowModal(false)
    flash('Vendor registered — pending vetting and document verification')
  }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />
      {showModal && (
        <Modal title="Register New Vendor" onClose={() => setShowModal(false)}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Name <span className="text-red-500">*</span></label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="e.g. ABC Services Ltd" value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="e.g. ICT Services" value={form.category} onChange={e => setForm(f => ({...f, category:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tier</label>
              <select className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                value={form.tier} onChange={e => setForm(f => ({...f, tier:e.target.value}))}>
                {['Tier 1','Tier 2','Tier 3'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-[11px] text-amber-800">
            Vendor must upload Tax Clearance, CAC Certificate and past performance docs within 14 days.
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowModal(false)} className="text-xs text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={registerVendor} disabled={!form.name}
              className="text-xs font-bold bg-[#006838] text-white px-4 py-2 rounded-xl hover:bg-[#005530] disabled:opacity-40">Register Vendor</button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'Active',         value: vendors.filter(v=>v.status==='active').length,                                              color:'text-[#006838]'  },
          { label:'Pending Vetting',value: vendors.filter(v=>v.status==='pending').length,                                             color:'text-amber-600'  },
          { label:'Show-Cause',     value: vendors.filter(v=>v.status==='show-cause').length,                                          color:'text-red-600'    },
          { label:'Suspended',      value: vendors.filter(v=>v.status==='suspended').length,                                           color:'text-red-700'    },
        ].map((s,i) => (
          <div key={i} className="card py-3 text-center">
            <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{vendors.length} vendors registered · Self-registration portal active</p>
        <AddBtn label="Register Vendor" onClick={() => setShowModal(true)} />
      </div>

      <div className="space-y-3">
        {vendors.map((v) => (
          <Accordion key={v.id} id={v.id} expanded={expanded} toggle={setExpanded}
            header={
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-[10px] text-slate-400">{v.id}</span>
                  <Pill s={v.status} />
                  <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{v.tier}</span>
                  <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{v.category}</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{v.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  {v.score > 0 && <StarRating score={v.score} />}
                  <span className="text-[10px] text-slate-400">{v.contracts} contracts · {v.value}</span>
                </div>
              </div>
            }>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Document Status</p>
                {[
                  { doc:'Tax Clearance Cert.', val:v.taxExp   },
                  { doc:'CAC Certificate',      val:v.cacDate  },
                  { doc:'Last Re-qualified',    val:v.lastReq  },
                ].map((d,i) => (
                  <div key={i} className="flex justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-slate-600 font-semibold">{d.doc}</span>
                    <span className={`font-semibold ${d.val === 'pending' ? 'text-amber-600' : 'text-slate-500'}`}>{d.val}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Tier & Eligibility</p>
                <p className="text-xs text-slate-600">Tier: <strong>{v.tier}</strong></p>
                <p className="text-xs text-slate-400 mt-1.5">Re-qualification cycle: every 2 years or on document expiry.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {v.status === 'pending'    && <button onClick={() => approveVendor(v.id)} className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors"><CheckCircle2 size={11} />Approve & Categorize</button>}
              {v.status === 'active'     && <button onClick={() => requestDocUpdate(v.id)} className="text-xs text-blue-700 border border-blue-200 px-3 py-1 rounded-xl hover:bg-blue-50 flex items-center gap-1 font-semibold transition-colors"><RefreshCw size={11} />Request Doc Update</button>}
              {v.status === 'show-cause' && <button onClick={() => escalateSuspend(v.id)} className="text-xs font-bold text-red-700 border border-red-200 px-3 py-1 rounded-xl hover:bg-red-50 flex items-center gap-1 transition-colors"><AlertTriangle size={11} />Escalate to Suspension</button>}
              <button onClick={() => flash(`${v.name}: ${v.contracts} POs · ${v.value} total value · Score ${v.score}`)} className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 flex items-center gap-1 transition-colors"><FileText size={11} />View Evaluation History</button>
            </div>
          </Accordion>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 3 — TENDERING
// ════════════════════════════════════════════════════════════════
function TenderingTab() {
  const [expanded, setExpanded] = useState(null)
  const [tenders, setTenders] = useState(TENDERS_INIT)
  const [toastMsg, clearToast, flash] = useToast()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title:'', dept:'', budget:'', type:'ITB' })

  function openTechBids(id) {
    setTenders(prev => prev.map(t => t.id === id ? { ...t, evalPhase:'technical' } : t))
    flash('Technical bids unsealed — evaluation committee notified, scoring now active')
  }
  function openFinancialBids(id) {
    setTenders(prev => prev.map(t => t.id === id ? { ...t, evalPhase:'financial' } : t))
    flash('Financial envelopes opened — combined scores calculating automatically')
  }
  function scoreBids(id) {
    setTenders(prev => prev.map(t => t.id === id ? {
      ...t,
      bids: t.bids.map(b => b.status === 'qualified' ? {
        ...b,
        combined: (b.techScore * (t.techWeight/100) + 95 * (t.priceWeight/100)).toFixed(1)
      } : b)
    } : t))
    flash('Bid scores calculated and saved — evaluation report generated')
  }
  function generatePO(id) {
    flash(`Purchase Order draft created from award ${id} — routed to Procurement Officer for review`)
  }
  function createTender() {
    if (!form.title) return
    const newT = {
      id:`TDR-2026-${String(tenders.length + 10).padStart(3,'0')}`,
      title:form.title, dept:form.dept||'General', budget:form.budget||'TBD',
      published: new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),
      deadline:'TBD', preBidDate:null, status:'open', type:form.type,
      techWeight:70, priceWeight:30, evalPhase:'awaiting-open', awardeeName:null,
      bids:[], qaThread:[],
    }
    setTenders(prev => [...prev, newT])
    setForm({ title:'', dept:'', budget:'', type:'ITB' })
    setShowModal(false)
    flash('Tender created — published to BPP portal and vendor notifications sent')
  }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />
      {showModal && (
        <Modal title="Create New Tender" onClose={() => setShowModal(false)}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="e.g. Office cleaning services 2026" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="e.g. Admin" value={form.dept} onChange={e => setForm(f=>({...f,dept:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
              <select className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                {['ITB','RFQ','EOI','RFP'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Approved Budget</label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="₦0" value={form.budget} onChange={e => setForm(f=>({...f,budget:e.target.value}))} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowModal(false)} className="text-xs text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={createTender} disabled={!form.title}
              className="text-xs font-bold bg-[#006838] text-white px-4 py-2 rounded-xl hover:bg-[#005530] disabled:opacity-40">Publish Tender</button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Open Tenders',   value: tenders.filter(t=>t.status==='open').length,       color:'text-blue-600 bg-blue-50'     },
          { label:'In Evaluation',  value: tenders.filter(t=>t.status==='evaluation').length, color:'text-purple-600 bg-purple-50' },
          { label:'Awarded',        value: tenders.filter(t=>t.status==='awarded').length,    color:'text-[#006838] bg-green-50'   },
        ].map((s,i) => (
          <div key={i} className={`card py-3 text-center ${s.color}`}>
            <div className="text-xl font-extrabold">{s.value}</div>
            <div className="text-[10px] font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Two-envelope system · Automated scoring · Full audit trail</p>
        <AddBtn label="Create Tender" onClick={() => setShowModal(true)} />
      </div>

      {tenders.map((t) => (
        <Accordion key={t.id} id={t.id} expanded={expanded} toggle={setExpanded}
          header={
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-[10px] text-slate-400">{t.id}</span>
                <Pill s={t.status} />
                <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{t.type}</span>
              </div>
              <p className="text-sm font-bold text-slate-800">{t.title}</p>
              <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap gap-3">
                <span>Budget: <strong className="text-slate-700">{t.budget}</strong></span>
                <span>Dept: {t.dept}</span>
                <span>Deadline: <strong>{t.deadline}</strong></span>
                <span>{t.bids.length} bids</span>
              </div>
            </div>
          }>

          <div className="flex gap-3 flex-wrap text-xs">
            <span className="bg-slate-100 rounded-xl px-3 py-1 font-semibold text-slate-700">Technical: {t.techWeight}%</span>
            <span className="bg-slate-100 rounded-xl px-3 py-1 font-semibold text-slate-700">Price: {t.priceWeight}%</span>
            <span className="bg-slate-100 rounded-xl px-3 py-1 font-semibold text-slate-700">Phase: {t.evalPhase}</span>
            {t.preBidDate && <span className="bg-blue-50 text-blue-700 rounded-xl px-3 py-1 font-semibold">Pre-bid: {t.preBidDate}</span>}
          </div>

          {t.bids.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Bid Register</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    {['Vendor','Tech Score','Bid Price','Combined Score','Status'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.bids.map((b,i) => (
                    <tr key={i} className="border-t border-slate-50">
                      <td className="px-3 py-2 font-semibold text-slate-700">{b.vendor}</td>
                      <td className="px-3 py-2 text-slate-600">{b.techScore > 0 ? `${b.techScore}%` : '—'}</td>
                      <td className="px-3 py-2 text-slate-600">{b.price}</td>
                      <td className="px-3 py-2 font-bold text-slate-800">
                        {b.combined ? `${b.combined}%`
                         : t.evalPhase === 'technical' ? <span className="text-[10px] text-slate-400 italic">Financial sealed</span>
                         : '—'}
                      </td>
                      <td className="px-3 py-2"><Pill s={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {t.qaThread.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Q&A Thread</p>
              {t.qaThread.map((q,i) => (
                <div key={i} className="border border-slate-100 rounded-xl p-3 mb-2 text-xs space-y-1">
                  <p className="font-semibold text-slate-700">{q.from}: <span className="font-normal text-slate-600">{q.question}</span></p>
                  {q.answered
                    ? <p className="text-[#006838] font-semibold text-[11px]">✓ Response: {q.answer}</p>
                    : <span className="text-amber-600 text-[10px] font-bold">Awaiting procurement response</span>}
                </div>
              ))}
            </div>
          )}

          {t.awardeeName && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-xs">
              <span className="font-bold text-[#006838]">Awarded to: </span><span className="text-slate-700">{t.awardeeName}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {t.status === 'open'       && <><button onClick={() => openTechBids(t.id)} className="text-xs font-bold text-blue-700 border border-blue-200 px-3 py-1 rounded-xl hover:bg-blue-50 flex items-center gap-1 transition-colors"><FileText size={11} />Open Technical Bids</button><button onClick={() => flash(`Addendum upload for ${t.id} — file picker would open here`)} className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 flex items-center gap-1 transition-colors"><Upload size={11} />Upload Addendum</button></>}
            {t.status === 'evaluation' && <><button onClick={() => scoreBids(t.id)} className="text-xs font-bold text-purple-700 border border-purple-200 px-3 py-1 rounded-xl hover:bg-purple-50 flex items-center gap-1 transition-colors"><FileText size={11} />Score Bids</button><button onClick={() => openFinancialBids(t.id)} className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors"><CheckCircle2 size={11} />Open Financial Bids</button></>}
            {t.status === 'awarded'    && <button onClick={() => generatePO(t.id)} className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors"><FileSignature size={11} />Generate PO from Award</button>}
          </div>
        </Accordion>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 4 — PURCHASE ORDERS
// ════════════════════════════════════════════════════════════════
function POTab() {
  const [expanded, setExpanded] = useState(null)
  const [pos, setPOs] = useState(PURCHASE_ORDERS_INIT)
  const [toastMsg, clearToast, flash] = useToast()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ desc:'', vendor:'', amount:'', dept:'', planRef:'' })

  function approvePO(ref) {
    setPOs(prev => prev.map(p => p.ref === ref ? {
      ...p, status:'approved',
      approvals: p.approvals.map((a,i) => i === p.approvals.findIndex(x=>x.action==='pending') ? {...a, action:'approved', date:'07 Apr 2026'} : a)
    } : p))
    flash(`${ref} approved — vendor dispatch email sent`)
  }
  function sendToVendor(ref) {
    setPOs(prev => prev.map(p => p.ref === ref ? { ...p, vendorAccepted:true } : p))
    flash(`${ref} sent to vendor — awaiting acceptance and delivery confirmation`)
  }
  function confirmDelivery(ref) {
    setPOs(prev => prev.map(p => {
      if (p.ref !== ref) return p
      const newP = { ...p, goodsReceived:true, invoiceSubmitted:true }
      if (newP.vendorAccepted && newP.goodsReceived && newP.invoiceSubmitted) {
        newP.matchStatus = 'matched'
      }
      return newP
    }))
    flash(`${ref} — goods received confirmed. Three-way match complete. Payment request forwarded to Finance.`)
  }
  function createPO() {
    if (!form.desc) return
    const newPO = {
      ref:`PO-2026-${String(pos.length + 143).padStart(4,'0')}`,
      desc:form.desc, vendor:form.vendor||'TBD', amount:form.amount||'₦0', amountRaw:0,
      dept:form.dept||'General', planRef:form.planRef||'—',
      date:new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),
      status:'pending',
      approvals:[{ role:'Dept Head', name:'Pending', action:'pending', date:'' }],
      vendorAccepted:false, goodsReceived:false, invoiceSubmitted:false, matchStatus:null,
    }
    setPOs(prev => [...prev, newPO])
    setForm({ desc:'', vendor:'', amount:'', dept:'', planRef:'' })
    setShowModal(false)
    flash('Purchase Order created — routed to Dept Head for first-level approval')
  }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />
      {showModal && (
        <Modal title="Create Purchase Order" onClose={() => setShowModal(false)}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="What is being purchased?" value={form.desc} onChange={e => setForm(f=>({...f,desc:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vendor</label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="Vendor name" value={form.vendor} onChange={e => setForm(f=>({...f,vendor:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount</label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="₦0" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="e.g. ICT" value={form.dept} onChange={e => setForm(f=>({...f,dept:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">APP Ref</label>
              <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
                placeholder="e.g. APP-001" value={form.planRef} onChange={e => setForm(f=>({...f,planRef:e.target.value}))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowModal(false)} className="text-xs text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={createPO} disabled={!form.desc}
              className="text-xs font-bold bg-[#006838] text-white px-4 py-2 rounded-xl hover:bg-[#005530] disabled:opacity-40">Create PO</button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Approved',     value: pos.filter(p=>p.status==='approved').length,           color:'text-[#006838]' },
          { label:'Pending',      value: pos.filter(p=>p.status==='pending').length,            color:'text-amber-600' },
          { label:'3-Way Matched',value: pos.filter(p=>p.matchStatus==='matched').length,       color:'text-blue-600' },
        ].map((s,i) => (
          <div key={i} className="card py-3 text-center">
            <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <Card>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">PO Approval Matrix (by value)</p>
        <div className="space-y-1.5">
          {[
            { range:'< ₦1M',        approvers:'Dept Head → Procurement Officer' },
            { range:'₦1M – ₦10M',   approvers:'Dept Head → Procurement → Finance Manager' },
            { range:'₦10M – ₦50M',  approvers:'Dept Head → Procurement → Finance → Director General' },
            { range:'> ₦50M',       approvers:'Dept Head → Procurement → Finance → DG → Tender Board' },
          ].map((t,i) => (
            <div key={i} className="flex items-center gap-4 text-xs py-1 border-b border-slate-50 last:border-0">
              <span className="font-mono font-bold text-slate-700 w-32 flex-shrink-0">{t.range}</span>
              <span className="text-slate-500">{t.approvers}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Value-based routing · 3-way match · Auto payment release to Finance</p>
        <AddBtn label="Create PO" onClick={() => setShowModal(true)} />
      </div>

      {pos.map((po) => (
        <Accordion key={po.ref} id={po.ref} expanded={expanded} toggle={setExpanded}
          header={
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-[10px] text-slate-400">{po.ref}</span>
                <Pill s={po.status} />
                {po.matchStatus && <Pill s={po.matchStatus} />}
              </div>
              <p className="text-sm font-bold text-slate-800">{po.desc}</p>
              <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap gap-3">
                <span>Vendor: <strong className="text-slate-700">{po.vendor}</strong></span>
                <span>Amount: <strong className="text-slate-700">{po.amount}</strong></span>
                <span>Dept: {po.dept}</span>
                <span>Plan: <span className="font-mono">{po.planRef}</span></span>
              </div>
              <ApprovalChain steps={po.approvals} />
            </div>
          }>

          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Three-Way Match Checklist</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { label:'PO Approved',       done: po.status === 'approved' },
                { label:'Vendor Accepted',   done: po.vendorAccepted        },
                { label:'Goods Received',    done: po.goodsReceived         },
                { label:'Invoice Submitted', done: po.invoiceSubmitted      },
                { label:'Invoice Matched',   done: po.matchStatus === 'matched' },
              ].map((step,i) => (
                <span key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold ${
                  step.done ? 'bg-green-50 text-[#006838] border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  <CheckCircle2 size={11} />{step.label}
                </span>
              ))}
            </div>
            {po.matchStatus === 'matched' && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-xs text-[#006838] font-semibold">
                ✓ Three-way match complete — payment request automatically forwarded to Finance
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {po.status === 'pending'                          && <button onClick={() => approvePO(po.ref)} className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors"><CheckCircle2 size={11} />Approve PO</button>}
            {po.status === 'approved' && !po.vendorAccepted   && <button onClick={() => sendToVendor(po.ref)} className="text-xs font-bold text-blue-700 border border-blue-200 px-3 py-1 rounded-xl hover:bg-blue-50 flex items-center gap-1 transition-colors"><FileText size={11} />Send to Vendor</button>}
            {po.vendorAccepted && !po.goodsReceived            && <button onClick={() => confirmDelivery(po.ref)} className="text-xs text-amber-700 border border-amber-200 px-3 py-1 rounded-xl hover:bg-amber-50 flex items-center gap-1 font-semibold transition-colors"><Package size={11} />Confirm Delivery</button>}
          </div>
        </Accordion>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 5 — VENDOR PERFORMANCE SCORECARD
// ════════════════════════════════════════════════════════════════
function ScorecardTab() {
  const [expanded, setExpanded] = useState(null)
  const [scorecards, setScorecards] = useState(SCORECARDS_INIT)
  const [toastMsg, clearToast, flash] = useToast()
  const [showModal, setShowModal] = useState(false)
  const [rateForm, setRateForm] = useState({ vendor:'', timeliness:5, quality:5, support:4, priceComp:4, poRef:'' })

  const chartData = scorecards.filter(s => s.avgScore > 0).map(s => ({
    name: s.vendor.split(' ')[0], score: s.avgScore,
    fill: s.avgScore >= 4 ? '#006838' : s.avgScore >= 3 ? '#f59e0b' : '#ef4444',
  }))

  function blacklistVendor(vendorId) {
    setScorecards(prev => prev.map(s => s.vendorId === vendorId ? { ...s, status:'blacklisted' } : s))
    flash('Vendor blacklisted — removed from all active tenders. Procurement & DG notified.')
  }

  function submitRating() {
    const avg = ((rateForm.timeliness + rateForm.quality + rateForm.support + rateForm.priceComp) / 4).toFixed(1)
    setScorecards(prev => prev.map(s => s.vendor === rateForm.vendor ? {
      ...s, avgScore: parseFloat(avg), poCount: s.poCount + 1,
      timeliness: rateForm.timeliness, quality: rateForm.quality,
      support: rateForm.support, priceComp: rateForm.priceComp,
    } : s))
    setShowModal(false)
    flash(`Rating submitted for ${rateForm.vendor} — new avg score: ${avg}/5.0`)
  }

  return (
    <div className="space-y-4">
      <Toast msg={toastMsg} clear={clearToast} />
      {showModal && (
        <Modal title="Submit Vendor Rating" onClose={() => setShowModal(false)}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Vendor <span className="text-red-500">*</span></label>
            <select className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              value={rateForm.vendor} onChange={e => setRateForm(f=>({...f,vendor:e.target.value}))}>
              <option value="">— Select vendor —</option>
              {scorecards.filter(s=>s.status==='active').map(s => <option key={s.vendorId} value={s.vendor}>{s.vendor}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">PO Reference</label>
            <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#006838]"
              placeholder="e.g. PO-2026-0142" value={rateForm.poRef} onChange={e => setRateForm(f=>({...f,poRef:e.target.value}))} />
          </div>
          {[
            { key:'timeliness', label:'Delivery Timeliness (30%)' },
            { key:'quality',    label:'Product/Service Quality (30%)' },
            { key:'support',    label:'After-Sales Support (20%)' },
            { key:'priceComp',  label:'Price Competitiveness (20%)' },
          ].map(cr => (
            <div key={cr.key}>
              <label className="block text-xs font-bold text-slate-700 mb-1">{cr.label}</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(v => (
                  <button key={v} type="button" onClick={() => setRateForm(f=>({...f,[cr.key]:v}))}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition ${rateForm[cr.key]===v ? 'bg-[#006838] text-white border-[#006838]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{v}</button>
                ))}
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowModal(false)} className="text-xs text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={submitRating} disabled={!rateForm.vendor}
              className="text-xs font-bold bg-[#006838] text-white px-4 py-2 rounded-xl hover:bg-[#005530] disabled:opacity-40">Submit Rating</button>
          </div>
        </Modal>
      )}

      <Card>
        <p className="text-sm font-bold text-slate-700 mb-3">Vendor Performance Ranking</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} layout="vertical" margin={{ left:8 }}>
            <XAxis type="number" domain={[0,5]} tick={{ fontSize:9, fill:'#94a3b8' }} />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize:9, fill:'#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => [`${v}/5`,'Score']} />
            <Bar dataKey="score" name="Score" radius={[0,4,4,0]}>
              {chartData.map((e,i) => <Cell key={i} fill={e.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {scorecards.filter(s => s.avgScore > 0 && s.avgScore < 2).map((s,i) => (
        <div key={i} className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3 flex items-start gap-3">
          <TriangleAlert size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-800 flex-1"><strong>{s.vendor}</strong> — score {s.avgScore}/5 across {s.poCount} POs. Show-cause initiated. Unsatisfactory response → blacklisting recommended.</p>
          <button onClick={() => blacklistVendor(s.vendorId)} className="flex-shrink-0 text-xs font-bold text-red-700 border border-red-300 px-3 py-1 rounded-xl hover:bg-red-100 transition-colors">Blacklist</button>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Criteria: Timeliness 30% · Quality 30% · Support 20% · Price Competitiveness 20%</p>
        <AddBtn label="Submit Rating" onClick={() => setShowModal(true)} />
      </div>

      {scorecards.map((sc) => (
        <Accordion key={sc.vendorId} id={sc.vendorId} expanded={expanded} toggle={setExpanded}
          header={
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Pill s={sc.status} />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  sc.trend === 'improving' ? 'bg-green-50 text-[#006838] border-green-200' :
                  sc.trend === 'declining' ? 'bg-red-50 text-red-700 border-red-200' :
                                             'bg-slate-50 text-slate-500 border-slate-200'
                }`}>{sc.trend}</span>
              </div>
              <p className="text-sm font-bold text-slate-800">{sc.vendor}</p>
              <div className="flex items-center gap-3 mt-1">
                <StarRating score={sc.avgScore} />
                <span className="text-[10px] text-slate-400">{sc.poCount} POs evaluated</span>
              </div>
            </div>
          }>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { key:'timeliness', label:'Delivery Timeliness',    weight:'30%' },
              { key:'quality',    label:'Product/Service Quality', weight:'30%' },
              { key:'support',    label:'After-Sales Support',     weight:'20%' },
              { key:'priceComp',  label:'Price Competitiveness',   weight:'20%' },
            ].map((cr) => (
              <div key={cr.key} className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-lg font-extrabold text-slate-800">{sc[cr.key]}/5</div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">{cr.label}</div>
                <div className="text-[9px] text-slate-400">weight: {cr.weight}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowModal(true)} className="text-xs font-bold text-[#006838] border border-green-200 px-3 py-1 rounded-xl hover:bg-green-50 flex items-center gap-1 transition-colors"><Star size={11} />Rate Another PO</button>
            {sc.status === 'show-cause' && <button onClick={() => blacklistVendor(sc.vendorId)} className="text-xs font-bold text-red-700 border border-red-200 px-3 py-1 rounded-xl hover:bg-red-50 flex items-center gap-1 transition-colors"><AlertTriangle size={11} />Blacklist Vendor</button>}
            {sc.status === 'active' && sc.avgScore >= 4 && <button onClick={() => flash(`Preference points (+5%) applied to ${sc.vendor} — will be factored in next tender evaluation`)} className="text-xs text-blue-700 border border-blue-200 px-3 py-1 rounded-xl hover:bg-blue-50 flex items-center gap-1 font-semibold transition-colors"><TrendingUp size={11} />Apply Preference Points (+5%)</button>}
          </div>
        </Accordion>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// TAB 6 — ROLES & INTEGRATIONS
// ════════════════════════════════════════════════════════════════
function RolesTab() {
  const roles = Object.keys(PROC_ROLE_MATRIX)
  const modules = Object.keys(PROC_ROLE_MATRIX[roles[0]])
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
                      {PROC_ROLE_MATRIX[role][mod]?.map((p,j) => (
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
          {PROC_INTEGRATIONS.map((int,i) => (
            <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-xs font-bold text-slate-700">{int.system}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{int.purpose}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${PILL_STYLES[int.status] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>{int.status}</span>
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
  { id:'app',       label:'Proc. Plan (APP)',     icon: ClipboardList },
  { id:'vendors',   label:'Vendor Management',    icon: Users         },
  { id:'tendering', label:'Tendering',            icon: FileSignature },
  { id:'pos',       label:'Purchase Orders',      icon: ShoppingCart  },
  { id:'scorecard', label:'Perf. Scorecard',      icon: Star          },
  { id:'roles',     label:'Roles & Integrations', icon: Shield        },
]

export default function ProcurementPage() {
  const [tab, setTab] = useState('app')

  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Procurement Workbench</h1>
            <p className="text-sm text-slate-400">Annual Plan · Vendor Management · Tendering · Purchase Orders · Scorecards</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label:'Open Tenders',           value: TENDERS_INIT.filter(t=>t.status==='open').length,                                                  icon: FileText,     bg:'bg-blue-50',   color:'text-blue-600'   },
          { label:'POs Pending Approval',   value: PURCHASE_ORDERS_INIT.filter(p=>p.status==='pending').length,                                       icon: ClipboardList,bg:'bg-amber-50',  color:'text-amber-600'  },
          { label:'Vendor Issues',          value: VENDORS_INIT.filter(v=>['show-cause','suspended'].includes(v.status)).length,                      icon: AlertTriangle,bg:'bg-red-50',    color:'text-red-600'    },
          { label:'APP Consolidation Flags',value: APP_ITEMS_INIT.filter(i=>i.status==='flagged').length,                                             icon: Package,      bg:'bg-orange-50', color:'text-orange-600' },
        ].map((k,i) => (
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

      {tab === 'app'       && <APPTab />}
      {tab === 'vendors'   && <VendorTab />}
      {tab === 'tendering' && <TenderingTab />}
      {tab === 'pos'       && <POTab />}
      {tab === 'scorecard' && <ScorecardTab />}
      {tab === 'roles'     && <RolesTab />}
    </div>
  )
}
