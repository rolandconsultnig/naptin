import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldOff } from 'lucide-react'

export default function ForbiddenPage() {
  const { roleKey, user } = useAuth()
  const location = useLocation()
  const tried = location.state?.path

  return (
    <div className="max-w-lg mx-auto animate-fade-up">
      <div className="card text-center py-10 px-6">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
          <ShieldOff size={28} />
        </div>
        <h1 className="text-lg font-extrabold text-slate-900 mb-2">Access denied</h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-1">
          This module is limited to your directorate. You are signed in as{' '}
          <span className="font-mono text-slate-700">{roleKey || '—'}</span>
          {user?.department ? (
            <>
              {' '}
              · <span className="text-slate-700">{user.department}</span>
            </>
          ) : null}
          {tried ? (
            <>
              {' '}
              (<span className="font-mono text-xs">{tried}</span>)
            </>
          ) : null}
          .
        </p>
        <p className="text-xs text-slate-400 mb-6">
          Use Human Resources → Self-service for leave and payslips. Request wider access through ICT or your directorate if needed.
        </p>
        <Link to="/app/dashboard" className="btn-primary inline-flex">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
