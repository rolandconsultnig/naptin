import { NAPTIN_LOGO } from '../assets/images'
import { INTEGRATION_CONNECTORS } from '../data/mock'
import { Plug, CheckCircle, Clock, AlertCircle } from 'lucide-react'

function StatusIcon({ status }) {
  if (status === 'connected') return <CheckCircle size={16} className="text-emerald-500" />
  if (status === 'pilot') return <Clock size={16} className="text-amber-500" />
  return <AlertCircle size={16} className="text-slate-400" />
}

export default function IntegrationsPage() {
  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Integrations</h1>
          <p className="text-sm text-slate-400">CRM, ERP, identity, and analytics connectors — UI prototype; configure secrets & scopes in a secure vault.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {INTEGRATION_CONNECTORS.map((c, i) => (
          <div key={i} className="card flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Plug size={18} className="text-[#006838]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-slate-800">{c.name}</h3>
                <StatusIcon status={c.status} />
                <span className="text-[10px] font-bold uppercase text-slate-400">{c.status}</span>
              </div>
              <p className="text-[10px] font-semibold text-[#006838] mb-1">{c.type}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
              <button type="button" className="text-xs font-bold text-[#006838] mt-3 hover:underline">
                Configure (mock)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
