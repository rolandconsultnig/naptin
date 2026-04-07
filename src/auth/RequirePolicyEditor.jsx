import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Only director + ICT admin may edit platform modules, RBAC matrix, and user roles. */
export default function RequirePolicyEditor({ children }) {
  const { roleKey, bootstrapped } = useAuth()
  const location = useLocation()

  if (!bootstrapped) {
    return (
      <div className="min-h-[30vh] flex items-center justify-center text-slate-400 text-sm">Loading…</div>
    )
  }

  if (!['director', 'ict_admin'].includes(roleKey)) {
    return <Navigate to="/admin" replace state={{ policyDenied: true, from: location.pathname }} />
  }

  return children
}
