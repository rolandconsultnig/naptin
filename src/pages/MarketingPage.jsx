import { useState } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import { BRAND_CAMPAIGNS, CLIENT_PIPELINE, MARKET_METRICS } from '../data/mock'
import { TrendingUp, Megaphone, Users2 } from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'brand', label: 'Corporate & Brand', icon: Megaphone },
  { id: 'clients', label: 'Clients & New Markets', icon: Users2 },
]

export default function MarketingPage() {
  const [tab, setTab] = useState('overview')

  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Marketing & Business Development</h1>
          <p className="text-sm text-slate-400">Corporate brand management, client operations, and new market development.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-6 bg-white border border-slate-100 rounded-2xl p-1 shadow-sm w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              tab === t.id ? 'bg-[#006838] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MARKET_METRICS.map((m, i) => (
              <div key={i} className="stat-card">
                <p className="text-xs text-slate-400 font-bold uppercase mb-2">{m.label}</p>
                <p className="text-2xl font-extrabold text-slate-900">{m.value}</p>
                <p className="text-[11px] text-slate-400 mt-1">{m.trend}</p>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-[#006838]" />
              <p className="text-sm font-bold text-slate-800">Client pipeline summary</p>
            </div>
            <div className="space-y-3">
              {CLIENT_PIPELINE.map((c, i) => (
                <div key={i} className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                  <div>
                    <p className="text-[10px] font-mono text-slate-400">{c.id}</p>
                    <h3 className="text-sm font-bold text-slate-800 mt-0.5">{c.client}</h3>
                    <p className="text-xs text-slate-500 mt-1">{c.type} · Owner: {c.owner} · Due: {c.due}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-[#006838]">{c.value}</span>
                    <span className="badge badge-blue text-[10px]">{c.stage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Brand & Corporate */}
      {tab === 'brand' && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone size={16} className="text-[#006838]" />
              <p className="text-sm font-bold text-slate-800">Brand & communications campaigns</p>
            </div>
            <div className="space-y-3">
              {BRAND_CAMPAIGNS.map((c, i) => (
                <div key={i} className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                  <div>
                    <p className="text-[10px] font-mono text-slate-400">{c.id}</p>
                    <h3 className="text-sm font-bold text-slate-800 mt-0.5">{c.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">Owner: {c.owner} · Budget: {c.budget} · Due: {c.due}</p>
                  </div>
                  <span className={`badge flex-shrink-0 text-[10px] ${c.status === 'Live' ? 'badge-green' : c.status === 'In progress' ? 'badge-blue' : 'badge-amber'}`}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clients & New Markets */}
      {tab === 'clients' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MARKET_METRICS.map((m, i) => (
              <div key={i} className="stat-card">
                <p className="text-xs text-slate-400 font-bold uppercase mb-2">{m.label}</p>
                <p className="text-2xl font-extrabold text-slate-900">{m.value}</p>
                <p className="text-[11px] text-slate-400 mt-1">{m.trend}</p>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Users2 size={16} className="text-[#006838]" />
              <p className="text-sm font-bold text-slate-800">Client opportunities & markets</p>
            </div>
            <div className="space-y-3">
              {CLIENT_PIPELINE.map((c, i) => (
                <div key={i} className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                  <div>
                    <p className="text-[10px] font-mono text-slate-400">{c.id}</p>
                    <h3 className="text-sm font-bold text-slate-800 mt-0.5">{c.client}</h3>
                    <p className="text-xs text-slate-500 mt-1">{c.type} · Owner: {c.owner} · Due: {c.due}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-[#006838]">{c.value}</span>
                    <span className="badge badge-green text-[10px]">{c.stage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
