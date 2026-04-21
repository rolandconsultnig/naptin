import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireSuperAdminLevel5({ children }) {
  const { roleKey, user, bootstrapped } = useAuth()
  const location = useLocation()

  if (!bootstrapped) {
    return (
      <div className="min-h-[30vh] flex items-center justify-center text-slate-400 text-sm">Loading…</div>
    )
  }

  if (roleKey !== 'super_admin' || Number(user?.roleLevel || 0) < 5) {
    return <Navigate to="/admin" replace state={{ policyDenied: true, from: location.pathname }} />
  }

  return children
}
