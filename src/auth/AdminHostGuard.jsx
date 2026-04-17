import { Link } from 'react-router-dom'
import { isAdminHostAllowed } from './adminConsole'
import { NAPTIN_LOGO } from '../assets/images'

export default function AdminHostGuard({ children }) {
  if (isAdminHostAllowed()) return children

  const host = typeof window !== 'undefined' ? window.location.hostname : ''
  const port = typeof window !== 'undefined' && window.location.port ? `:${window.location.port}` : ''

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center">
      <img src={NAPTIN_LOGO} alt="" className="w-14 h-14 object-contain bg-white rounded-xl p-1 mb-6 border border-white/10" />
      <h1 className="text-xl font-extrabold text-white mb-2">Admin console — host restricted</h1>
      <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-1">
        This interface is only available when the portal is opened on a loopback host (for example{' '}
        <span className="font-mono text-slate-300">127.0.0.1</span> or <span className="font-mono text-slate-300">localhost</span>
        ).
      </p>
      <p className="text-xs text-slate-500 mb-8 font-mono">
        Current host: {host || '—'}
        {port}
      </p>
      <p className="text-xs text-slate-500 mb-6 max-w-sm">
        In development, open the admin console at <span className="font-mono text-slate-400">http://127.0.0.1{port}/admin</span>.
        Production access is limited to hosts approved by your ICT team.
      </p>
      <Link to="/app/dashboard" className="text-sm font-bold text-[#4ade80] hover:underline">
        ← Back to portal
      </Link>
    </div>
  )
}
