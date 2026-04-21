import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { NAPTIN_LOGO } from '../../assets/images'
import {
  LogOut, LayoutDashboard, Shield, LayoutGrid, Building2, Users, ScrollText, Briefcase, Workflow, Menu, X, UserCog,
} from 'lucide-react'
import { useState } from 'react'

const LINKS_ALL = [
  { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/operations', end: false, label: 'Operations', icon: Building2 },
  { to: '/admin/brand/assets', end: false, label: 'Brand', icon: Briefcase },
  { to: '/admin/workflow/inbox', end: false, label: 'Workflow', icon: Workflow },
]

const LINKS_POLICY = [
  { to: '/admin/modules', end: false, label: 'Modules', icon: LayoutGrid },
  { to: '/admin/roles', end: false, label: 'Roles', icon: UserCog },
  { to: '/admin/access', end: false, label: 'Access matrix', icon: Shield },
  { to: '/admin/audit', end: false, label: 'Audit log', icon: ScrollText },
]

const LINKS_SUPER_ADMIN = [
  { to: '/admin/users/dashboard', end: false, label: 'User dashboard', icon: Shield },
  { to: '/admin/users', end: false, label: 'Users', icon: Users },
]

export default function AdminStandaloneLayout() {
  const { user, logout, roleKey } = useAuth()
  const navigate = useNavigate()
  const [mobileNav, setMobileNav] = useState(false)
  const isSuperAdminL5 = roleKey === 'super_admin' && Number(user?.roleLevel || 0) >= 5
  const canEditPolicy = ['director', 'ict_admin'].includes(roleKey) || isSuperAdminL5

  const NavInner = () => (
    <>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Admin portal</p>
      {LINKS_ALL.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setMobileNav(false)}
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isActive ? 'bg-[#006838] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`
          }
        >
          <item.icon size={16} className="flex-shrink-0 opacity-90" />
          {item.label}
        </NavLink>
      ))}
      {canEditPolicy && (
        <>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-5">Platform control</p>
          {LINKS_POLICY.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileNav(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-[#006838] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <item.icon size={16} className="flex-shrink-0 opacity-90" />
              {item.label}
            </NavLink>
          ))}
          {isSuperAdminL5 && LINKS_SUPER_ADMIN.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileNav(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-[#006838] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <item.icon size={16} className="flex-shrink-0 opacity-90" />
              {item.label}
            </NavLink>
          ))}
        </>
      )}
    </>
  )

  return (
    <div className="min-h-screen bg-[#F7FAF8] flex flex-col">
      <header className="h-14 bg-[#0f172a] border-b border-white/10 flex items-center px-4 lg:px-5 gap-3 flex-shrink-0 shadow-md">
        <button
          type="button"
          className="md:hidden text-slate-300 p-2 rounded-lg hover:bg-white/10"
          onClick={() => setMobileNav(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={NAPTIN_LOGO} alt="NAPTIN" className="w-9 h-9 object-contain rounded-lg bg-white p-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-extrabold text-white text-sm truncate">NAPTIN Admin portal</div>
            <div className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1">
              <Shield size={10} className="text-emerald-400 flex-shrink-0" />
              <span className="font-mono">{roleKey}</span>
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden sm:block truncate max-w-[140px]">{user?.email}</span>
          <Link
            to="/app/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <LayoutDashboard size={14} />
            Staff portal
          </Link>
          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-red-300 hover:text-red-200 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="hidden md:flex w-52 border-r border-slate-200 bg-white flex-col py-4 px-2 flex-shrink-0 overflow-y-auto scrollbar-thin">
          <NavInner />
        </aside>

        {mobileNav && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNav(false)} aria-hidden />
            <div className="relative w-64 max-w-[85vw] h-full bg-white shadow-xl flex flex-col pt-4 px-2">
              <div className="flex justify-end px-2 mb-2">
                <button type="button" onClick={() => setMobileNav(false)} className="p-2 text-slate-500">
                  <X size={20} />
                </button>
              </div>
              <NavInner />
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
