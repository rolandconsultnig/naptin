import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { canAccessAdminConsole } from './adminConsole'

export default function RequireAdminConsoleRole({ children }) {
  const { user, roleKey, bootstrapped } = useAuth()

  if (!bootstrapped) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-slate-400 text-sm">
        Loading…
      </div>
    )
  }

  if (!user || !roleKey) {
    return <Navigate to="/login" replace />
  }

  if (!canAccessAdminConsole(roleKey)) {
    return <Navigate to="/app/forbidden" replace state={{ path: '/admin', reason: 'admin_console_role' }} />
  }

  return children
}
