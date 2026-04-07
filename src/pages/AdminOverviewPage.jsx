import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PORTAL_MODULES } from '../admin/portalModules'
import { loadPolicy } from '../admin/policyStore'
import {
  LayoutGrid, Building2, Shield, Users, ScrollText, ArrowRight,
} from 'lucide-react'

export default function AdminOverviewPage() {
  const { roleKey } = useAuth()
  const location = useLocation()
  const policy = loadPolicy()
  const canEdit = ['director', 'ict_admin'].includes(roleKey)

  return (
    <div className="animate-fade-up max-w-5xl">
      {location.state?.policyDenied && (
        <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
          Only <strong>director</strong> or <strong>ICT admin</strong> may open that section. Use an account with those roles to manage modules and permissions.
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin portal</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Configure every staff module, role-based access, and directory roles. Changes to the access matrix apply immediately to the main portal for signed-in users (module toggles and navigation).
        </p>
        {policy.updatedAt && (
          <p className="text-xs text-slate-400 mt-2 font-mono">Policy last saved: {new Date(policy.updatedAt).toLocaleString()}</p>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Modules', value: String(PORTAL_MODULES.length), sub: 'in staff portal', icon: LayoutGrid, color: 'text-[#006838]', bg: 'bg-green-50' },
          { label: 'Roles', value: '5', sub: 'RBAC keys', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Your role', value: roleKey || '—', sub: 'this session', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Operations', value: 'RTC + fleet', sub: 'estates', icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((k, i) => (
          <div key={i} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${k.bg} ${k.color} flex items-center justify-center mb-3`}>
              <k.icon size={18} />
            </div>
            <div className="text-lg font-extrabold text-slate-900 truncate">{k.value}</div>
            <div className="text-xs text-slate-400 font-medium">{k.label}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-extrabold text-slate-800 mb-4">Quick links</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/admin/operations"
          className="card flex items-center gap-4 hover:border-[#006838]/40 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-[#006838]/10 group-hover:text-[#006838]">
            <Building2 size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900">Operations & estates</p>
            <p className="text-xs text-slate-500">Regional centres, facility tickets, fleet, service catalogue</p>
          </div>
          <ArrowRight size={18} className="text-slate-300 group-hover:text-[#006838] flex-shrink-0" />
        </Link>

        {canEdit && (
          <>
            <Link
              to="/admin/modules"
              className="card flex items-center gap-4 hover:border-[#006838]/40 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-[#006838]/10 group-hover:text-[#006838]">
                <LayoutGrid size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">Module registry</p>
                <p className="text-xs text-slate-500">Enable or disable staff-facing modules (navigation + route guard)</p>
              </div>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-[#006838] flex-shrink-0" />
            </Link>
            <Link
              to="/admin/access"
              className="card flex items-center gap-4 hover:border-[#006838]/40 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-[#006838]/10 group-hover:text-[#006838]">
                <Shield size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">Access matrix</p>
                <p className="text-xs text-slate-500">Who can access which module (view → full admin)</p>
              </div>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-[#006838] flex-shrink-0" />
            </Link>
            <Link
              to="/admin/users"
              className="card flex items-center gap-4 hover:border-[#006838]/40 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-[#006838]/10 group-hover:text-[#006838]">
                <Users size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">Users & roles</p>
                <p className="text-xs text-slate-500">Assign portal role per account (applies on next sign-in)</p>
              </div>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-[#006838] flex-shrink-0" />
            </Link>
            <Link
              to="/admin/audit"
              className="card flex items-center gap-4 hover:border-[#006838]/40 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-[#006838]/10 group-hover:text-[#006838]">
                <ScrollText size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">Audit log</p>
                <p className="text-xs text-slate-500">Administrative actions (prototype — wire to SIEM)</p>
              </div>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-[#006838] flex-shrink-0" />
            </Link>
          </>
        )}
      </div>

      {!canEdit && (
        <p className="text-xs text-slate-400 mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
          Signed in as <span className="font-mono">{roleKey}</span>. Module registry, access matrix, users, and audit are limited to <strong>director</strong> and <strong>ICT admin</strong> demo accounts.
        </p>
      )}
    </div>
  )
}
