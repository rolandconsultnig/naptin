import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { canUserAccessAppPath } from './access'

export default function RequireRole({ children }) {
  const { user, roleKey, bootstrapped } = useAuth()
  const location = useLocation()

  if (!bootstrapped) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-400 text-sm font-medium">
        Loading session…
      </div>
    )
  }

  if (!user || !roleKey) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!canUserAccessAppPath(user, location.pathname)) {
    return <Navigate to="/app/forbidden" replace state={{ path: location.pathname }} />
  }

  return children
}
