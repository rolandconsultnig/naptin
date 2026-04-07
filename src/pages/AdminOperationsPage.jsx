import { NAPTIN_LOGO } from '../assets/images'
import { FACILITY_TICKETS, FLEET_ROWS } from '../data/mock'
import { Building2, Car, FileText, Users, Wrench, MapPin, Phone, CheckCircle } from 'lucide-react'

const CENTRES = [
  { name:'Corporate HQ', location:'Abuja, FCT', staff:287, status:'active', phone:'+234 9 291 4800' },
  { name:'Lagos — Ijora', location:'Lagos State', staff:145, status:'active', phone:'+234 1 587 2300' },
  { name:'Lagos — Akangba', location:'Lagos State', staff:98, status:'active', phone:'+234 1 475 3100' },
  { name:'Kainji — Niger', location:'Niger State', staff:112, status:'active', phone:'+234 66 320 4100' },
  { name:'Oji River — Enugu', location:'Enugu State', staff:89, status:'active', phone:'+234 42 771 2400' },
  { name:'Kaduna RTC', location:'Kaduna State', staff:134, status:'active', phone:'+234 62 240 5500' },
  { name:'Kano RTC', location:'Kano State', staff:121, status:'active', phone:'+234 64 630 1200' },
  { name:'Jos — Plateau', location:'Plateau State', staff:76, status:'active', phone:'+234 73 455 8900' },
  { name:'Afam — Rivers', location:'Rivers State', staff:186, status:'active', phone:'+234 84 235 6700' },
]

import { useState } from 'react'

const SERVICE_FORMS = {
  'Vehicle Request': {
    label: 'Vehicle Request',
    fields: [
      { name: 'date', label: 'Date Needed', type: 'date' },
      { name: 'purpose', label: 'Purpose', type: 'text' },
      { name: 'destination', label: 'Destination', type: 'text' },
    ]
  },
  'Room Booking': {
    label: 'Room Booking',
    fields: [
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'room', label: 'Room', type: 'text' },
      { name: 'purpose', label: 'Purpose', type: 'text' },
    ]
  },
  'Maintenance': {
    label: 'Maintenance Request',
    fields: [
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'issue', label: 'Issue Description', type: 'text' },
    ]
  },
  'Asset Request': {
    label: 'Asset Request',
    fields: [
      { name: 'item', label: 'Item Needed', type: 'text' },
      { name: 'quantity', label: 'Quantity', type: 'number' },
      { name: 'reason', label: 'Reason', type: 'text' },
    ]
  },
  'ID Card': {
    label: 'ID Card Request',
    fields: [
      { name: 'type', label: 'Type', type: 'select', options: ['New', 'Replacement'] },
      { name: 'reason', label: 'Reason', type: 'text' },
    ]
  },
  'Records': {
    label: 'Records Request',
    fields: [
      { name: 'document', label: 'Document Name', type: 'text' },
      { name: 'purpose', label: 'Purpose', type: 'text' },
    ]
  },
  'Mail Services': {
    label: 'Mail Service Request',
    fields: [
      { name: 'type', label: 'Type', type: 'select', options: ['Internal', 'External'] },
      { name: 'details', label: 'Details', type: 'text' },
    ]
  },
  'Access Control': {
    label: 'Access Control Request',
    fields: [
      { name: 'area', label: 'Area/Zone', type: 'text' },
      { name: 'reason', label: 'Reason', type: 'text' },
    ]
  },
}

export default function AdminOperationsPage() {
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const handleOpen = (service) => {
    setModal(service)
    setForm({})
    setSubmitted(false)
  }
  const handleClose = () => setModal(null)
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setModal(null), 1200)
  }

  const services = [
    {icon:'🚗',title:'Vehicle Request',desc:'Book official transport'},
    {icon:'🏢',title:'Room Booking',desc:'Conference & meeting rooms'},
    {icon:'🔧',title:'Maintenance',desc:'Submit facility requests'},
    {icon:'📦',title:'Asset Request',desc:'Equipment & supplies'},
    {icon:'🪪',title:'ID Card',desc:'New / replacement ID cards'},
    {icon:'📋',title:'Records',desc:'Official documents & records'},
    {icon:'📬',title:'Mail Services',desc:'Internal & external mail'},
    {icon:'🔐',title:'Access Control',desc:'Building access requests'},
  ]

  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block"/>
          <div><h1 className="text-xl font-extrabold text-slate-900">Operations & estates</h1><p className="text-sm text-slate-400">RTC network, facilities, fleet — day-to-day admin services</p></div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          {label:'Regional Centres',value:'8+HQ',icon:Building2,bg:'bg-green-50',color:'text-[#006838]'},
          {label:'Fleet Vehicles',value:'47',icon:Car,bg:'bg-blue-50',color:'text-blue-600'},
          {label:'Open Requests',value:'18',icon:FileText,bg:'bg-amber-50',color:'text-amber-600'},
          {label:'Facilities Staff',value:'125',icon:Users,bg:'bg-purple-50',color:'text-purple-600'},
        ].map((k,i)=>(
          <div key={i} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${k.bg} ${k.color} flex items-center justify-center`}><k.icon size={18}/></div>
            <div><div className="text-xl font-extrabold text-slate-900">{k.value}</div><div className="text-xs text-slate-400 font-medium">{k.label}</div></div>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2"><MapPin size={14} className="text-[#006838]"/>Regional Training Centres</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {CENTRES.map((c,i)=>(
          <div key={i} className="card hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">{c.name}</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1"><MapPin size={10}/>{c.location}</p>
              </div>
              <span className="badge badge-green"><CheckCircle size={9}/>Active</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"><Users size={11}/>{c.staff} staff</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"><Phone size={11}/>{c.phone}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2"><Wrench size={14} className="text-[#006838]"/>Administrative Services</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((s,i)=>(
          <div key={i} className="card text-center hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
            onClick={()=>handleOpen(s.title)}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <h3 className="text-xs font-extrabold text-slate-800 group-hover:text-[#006838] transition-colors">{s.title}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Modal for service forms */}
      {modal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs relative animate-fade-up">
            <button className="absolute top-2 right-2 text-slate-400 hover:text-slate-700" onClick={handleClose}>&times;</button>
            <h3 className="text-lg font-bold mb-3 text-[#006838]">{SERVICE_FORMS[modal]?.label}</h3>
            {submitted ? (
              <div className="text-green-700 text-center font-semibold py-8">Request submitted!</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {SERVICE_FORMS[modal]?.fields.map((f, idx) => (
                  <div key={idx}>
                    <label className="block text-xs font-bold mb-1 text-slate-700">{f.label}</label>
                    {f.type === 'select' ? (
                      <select name={f.name} value={form[f.name]||''} onChange={handleChange} required className="input w-full">
                        <option value="">Select...</option>
                        {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input name={f.name} type={f.type} value={form[f.name]||''} onChange={handleChange} required className="input w-full" />
                    )}
                  </div>
                ))}
                <button type="submit" className="btn-primary w-full mt-2">Submit</button>
              </form>
            )}
          </div>
        </div>
      )}

      <h2 className="text-sm font-extrabold text-slate-800 mb-4 mt-8 flex items-center gap-2"><Building2 size={14} className="text-[#006838]"/>Facility requests</h2>
      <div className="card overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="table-th text-left">ID</th>
              <th className="table-th text-left">Site</th>
              <th className="table-th text-left">Type</th>
              <th className="table-th text-left">Summary</th>
              <th className="table-th text-left">Status</th>
              <th className="table-th text-left">SLA</th>
            </tr>
          </thead>
          <tbody>
            {FACILITY_TICKETS.map((f) => (
              <tr key={f.id} className="border-b border-slate-50">
                <td className="table-td font-mono text-xs">{f.id}</td>
                <td className="table-td">{f.site}</td>
                <td className="table-td">{f.type}</td>
                <td className="table-td font-medium text-slate-800">{f.summary}</td>
                <td className="table-td"><span className="badge badge-amber text-[10px]">{f.status}</span></td>
                <td className="table-td text-slate-500 text-xs">{f.sla}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2"><Car size={14} className="text-[#006838]"/>Fleet overview</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="table-th text-left">Plate</th>
              <th className="table-th text-left">Vehicle</th>
              <th className="table-th text-left">Driver / pool</th>
              <th className="table-th text-left">Next service</th>
              <th className="table-th text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {FLEET_ROWS.map((v, i) => (
              <tr key={i} className="border-b border-slate-50">
                <td className="table-td font-mono text-xs">{v.plate}</td>
                <td className="table-td font-medium text-slate-800">{v.type}</td>
                <td className="table-td">{v.driver}</td>
                <td className="table-td text-slate-500 text-xs">{v.nextService}</td>
                <td className="table-td">
                  <span className={`badge text-[10px] ${v.status === 'Available' ? 'badge-green' : v.status === 'On trip' ? 'badge-blue' : 'badge-amber'}`}>{v.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
