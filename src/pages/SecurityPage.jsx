import { NAPTIN_LOGO } from '../assets/images'
import { ROLE_POLICIES, AUDIT_SNIPPETS } from '../data/mock'
import { Shield, KeyRound, ScrollText } from 'lucide-react'

export default function SecurityPage() {
  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Security & access</h1>
          <p className="text-sm text-slate-400">
            Enterprise controls overview — enforce MFA, SCIM, and least-privilege in production; this screen is illustrative only.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {[
          { label: 'SSO', value: 'Microsoft Entra ID', sub: 'Primary IdP', icon: KeyRound, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Session policy', value: '8h idle / 12h max', sub: 'Portal session', icon: Shield, bg: 'bg-green-50', color: 'text-[#006838]' },
          { label: 'Classification', value: 'Official / Confidential', sub: 'Document labels', icon: ScrollText, bg: 'bg-amber-50', color: 'text-amber-600' },
        ].map((k, i) => (
          <div key={i} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${k.bg} ${k.color} flex items-center justify-center`}>
              <k.icon size={18} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{k.label}</p>
              <p className="text-lg font-extrabold text-slate-900">{k.value}</p>
              <p className="text-xs text-slate-400">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Role policies (sample)</h2>
          <div className="space-y-3">
            {ROLE_POLICIES.map((r, i) => (
              <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50/80">
                <p className="text-xs font-bold text-[#006838]">{r.role}</p>
                <p className="text-xs text-slate-600 mt-1">{r.modules}</p>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">MFA: {r.mfa}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Recent audit snippets</h2>
          <div className="space-y-3">
            {AUDIT_SNIPPETS.map((a, i) => (
              <div key={i} className="p-3 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-800">{a.action}</p>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">{a.user}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{a.target}</p>
                <p className="text-[10px] text-slate-400 mt-1">{a.when}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
