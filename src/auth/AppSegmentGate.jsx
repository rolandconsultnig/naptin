import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { canUserAccessAppPath } from './access'

/**
 * Enforces department + RBAC for every child route under `/app`.
 */
export default function AppSegmentGate() {
  const { user, bootstrapped } = useAuth()
  const location = useLocation()

  if (!bootstrapped) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-400 text-sm font-medium">
        Loading session…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!canUserAccessAppPath(user, location.pathname)) {
    return <Navigate to="/app/forbidden" replace state={{ path: location.pathname }} />
  }

  return <Outlet />
}
