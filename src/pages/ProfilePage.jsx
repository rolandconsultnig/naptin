import { useAuth } from '../context/AuthContext'
import { NAPTIN_LOGO } from '../assets/images'
import { User, Mail, Phone, MapPin, Briefcase, Hash, Shield } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="animate-fade-up max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">My profile</h1>
          <p className="text-sm text-slate-400">Employee portal view — connect to HR master data for edits and documents.</p>
        </div>
      </div>

      <div className="card flex flex-col sm:flex-row gap-6">
        <div className="flex flex-col items-center text-center sm:w-40 flex-shrink-0">
          <div className="w-24 h-24 rounded-2xl bg-[#006838] flex items-center justify-center text-white text-2xl font-extrabold mb-3">
            {user?.initials}
          </div>
          <p className="text-sm font-bold text-slate-900">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.role}</p>
          <span className="badge badge-green text-[9px] mt-2">Active</span>
        </div>
        <div className="flex-1 space-y-4">
          {[
            { icon: Mail, label: 'Work email', value: user?.email },
            { icon: Phone, label: 'Phone', value: user?.phone },
            { icon: MapPin, label: 'Location', value: user?.location },
            { icon: Briefcase, label: 'Department', value: user?.department },
            { icon: Hash, label: 'Staff ID', value: user?.staffId, mono: true },
          ].map((row, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <row.icon size={16} className="text-[#006838] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{row.label}</p>
                <p className={`text-sm text-slate-800 ${row.mono ? 'font-mono' : ''}`}>{row.value}</p>
              </div>
            </div>
          ))}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
            <Shield size={16} className="text-amber-600 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Access (prototype)</p>
              <p className="text-sm text-amber-900">
                Role key: <span className="font-mono font-bold">{user?.roleKey ?? '—'}</span> · MFA optional in this demo.
              </p>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" className="btn-primary text-xs py-2">
              <User size={14} /> Request profile update
            </button>
            <button type="button" className="btn-secondary text-xs py-2">
              View org chart (mock)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
