import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { canAccessHRStaffTabs } from '../../auth/departmentAccess'
import { NAPTIN_LOGO } from '../../assets/images'
import { Users, Contact, UsersRound, LayoutGrid, ClipboardList, BriefcaseBusiness } from 'lucide-react'

const STAFF_TABS = [
  { to: '/app/human-resource/people', label: 'People', icon: Users, end: false },
  { to: '/app/human-resource/directory', label: 'Directory', icon: Contact, end: false },
  { to: '/app/human-resource/recruitment', label: 'Recruitment', icon: BriefcaseBusiness, end: false },
  { to: '/app/human-resource/operations', label: 'Operations', icon: UsersRound, end: false },
  { to: '/app/human-resource/enterprise', label: 'Enterprise HRMS', icon: LayoutGrid, end: false },
]

const SELF_TAB = { to: '/app/human-resource/self-service', label: 'Self-service', icon: ClipboardList, end: false }

export function HumanResourceHomeRedirect() {
  const { user } = useAuth()
  if (canAccessHRStaffTabs(user)) {
    return <Navigate to="/app/human-resource/people" replace />
  }
  return <Navigate to="/app/human-resource/self-service" replace />
}

export default function HumanResourceLayout() {
  const { user } = useAuth()
  const staff = canAccessHRStaffTabs(user)
  const tabs = staff ? [...STAFF_TABS, SELF_TAB] : [SELF_TAB]

  return (
    <div className="animate-fade-up space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold text-slate-900">Human Resource Management</h1>
          <p className="text-sm text-slate-400">
            People, directory, HR operations, enterprise suite, and self-service — scoped by your department access.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 bg-white border border-slate-100 rounded-2xl p-1 shadow-sm w-fit max-w-full">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive ? 'bg-[#006838] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            <t.icon size={15} />
            {t.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  )
}
