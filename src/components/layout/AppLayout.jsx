import { useState, useMemo } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications, relativeTime, TYPE_DOT } from '../../context/NotificationContext'
import { canAccessNavPath } from '../../auth/access'
import { usePolicySync } from '../../admin/usePolicySync'
import { NAPTIN_LOGO } from '../../assets/images'
import {
  LayoutDashboard, Radio, Users, Wallet, Video, MessageSquare,
  Monitor, ShoppingCart, BarChart2, GraduationCap,
  Building2, Briefcase, Bell, Search, Menu, X, LogOut,
  Settings, ChevronDown, User, FolderKanban, FileStack, Plug, Shield,
  Landmark, TrendingUp, FlaskConical, Crown, Workflow,
  Megaphone, BadgeCheck, ScanLine, Cpu, Target, Server, GitBranch,
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: "Office of the DG",
    items: [
      { to: '/app/dg-portal', icon: Crown, label: "DG's Portal" },
    ]
  },
  {
    label: 'Workspace',
    items: [
      { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/app/intranet', icon: Radio, label: 'Intranet Feed', badge: 'New' },
      { to: '/app/collaboration', icon: FolderKanban, label: 'Collaboration' },
      { to: '/app/chat', icon: MessageSquare, label: 'Messages', openInNewWindow: true },
      { to: '/app/meetings', icon: Video, label: 'Meetings' },
      { to: '/app/profile', icon: User, label: 'My profile' },
    ]
  },
  {
    label: 'Departments',
    items: [
      { to: '/app/human-resource', icon: Users, label: 'Human Resource Mgmt' },
      { to: '/app/finance', icon: Wallet, label: 'Finance & Accounts' },
      { to: '/app/planning', icon: BarChart2, label: 'Planning, Research & Stats' },
      { to: '/app/planning-workbench', icon: Target, label: 'PRS Workbench' },
      { to: '/app/research-stats', icon: FlaskConical, label: 'Research & Statistics' },
      { to: '/app/training', icon: GraduationCap, label: 'Training' },
      { to: '/app/corporate', icon: Landmark, label: 'Corporate & Consultancy' },
      { to: '/app/marketing', icon: TrendingUp, label: 'Marketing & Business Dev' },
      { to: '/app/client-ops-markets', icon: Workflow, label: 'Client Ops & New Markets' },
    ]
  },
  {
    label: 'Units',
    items: [
      { to: '/app/legal', icon: Briefcase, label: 'Legal / Board Secretariat' },
      { to: '/app/documents', icon: FileStack, label: 'Internal Audit' },
      { to: '/app/procurement', icon: ShoppingCart, label: 'Procurement' },
      { to: '/app/public-affairs', icon: Megaphone, label: 'Public Affairs' },
      { to: '/app/servicom', icon: BadgeCheck, label: 'SERVICOM' },
      { to: '/app/actu', icon: ScanLine, label: 'ACTU' },
      { to: '/app/ict', icon: Monitor, label: 'ICT' },
      { to: '/app/ict-workbench', icon: Cpu, label: 'ICT Workbench' },
      { to: '/app/process-maker', icon: GitBranch, label: 'Process Maker' },
      { to: '/admin', icon: Building2, label: 'Admin & Services' },
    ]
  },
  {
    label: 'Platform',
    items: [
      { to: '/app/integrations', icon: Plug, label: 'Integrations' },
      { to: '/app/security', icon: Shield, label: 'Security & access' },
    ]
  },
]

const NOTIFS = [
  { title: 'Leave request approved', sub: 'Annual leave for April approved', time: '2m', dot: 'bg-emerald-500' },
  { title: 'Board Meeting Monday 9AM', sub: '14 attendees confirmed', time: '18m', dot: 'bg-[#006838]' },
  { title: 'Document pending review', sub: 'BSc Certificate awaiting verification', time: '1h', dot: 'bg-amber-500' },
  { title: 'ICT Maintenance tonight', sub: 'Server downtime 11 PM – 2 AM', time: '2h', dot: 'bg-slate-400' },
  { title: 'Training Module 3 available', sub: 'Cybersecurity Awareness — enroll now', time: '3h', dot: 'bg-blue-500' },
]

export default function AppLayout() {
  usePolicySync()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const chatUnread = useMemo(
    () => notifications.filter((n) => n.link === '/app/chat' && !n.read).length,
    [notifications]
  )
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <img src={NAPTIN_LOGO} alt="NAPTIN" className="w-9 h-9 object-contain rounded-lg bg-white p-0.5 border border-slate-100" />
          <div>
            <div className="font-bold text-[#006838] text-sm leading-tight">NAPTIN</div>
            <div className="text-[9px] text-slate-400 font-medium leading-tight">Enterprise Portal</div>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-3 space-y-4">
        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter((item) => canAccessNavPath(item.to, user))
          if (items.length === 0) return null
          return (
            <div key={section.label}>
              <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-1">{section.label}</p>
              {items.map((item, i) => {
                const badge =
                  item.to === '/app/chat'
                    ? (chatUnread > 0 ? String(chatUnread) : null)
                    : item.badge
                if (item.openInNewWindow) {
                  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || ''
                  const href = `${window.location.origin}${base}${item.to}`
                  return (
                    <button
                      key={`${item.to}-${i}`}
                      type="button"
                      className="sidebar-link w-full text-left"
                      onClick={() => {
                        setSidebarOpen(false)
                        window.open(href, '_blank', 'noopener,noreferrer')
                      }}
                    >
                      <item.icon size={15} className="flex-shrink-0" />
                      <span className="flex-1 text-sm">{item.label}</span>
                      {badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            badge === 'New' ? 'bg-[#006838] text-white' : 'bg-red-500 text-white'
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </button>
                  )
                }
                return (
                  <NavLink
                    key={`${item.to}-${i}`}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => 'sidebar-link ' + (isActive ? 'active' : '')}
                  >
                    <item.icon size={15} className="flex-shrink-0" />
                    <span className="flex-1 text-sm">{item.label}</span>
                    {badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          badge === 'New' ? 'bg-[#006838] text-white' : 'bg-red-500 text-white'
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* User footer */}
      <div className="border-t border-slate-100 p-3 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-slate-50 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-[#006838] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.department ?? '—'}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#F7FAF8] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-slate-100 flex-shrink-0 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 h-full shadow-2xl z-10">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center px-4 lg:px-6 gap-4 flex-shrink-0 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700">
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-sm hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 hover:border-[#006838]/30 transition-colors">
            <Search size={14} className="text-slate-400" />
            <input
              placeholder="Search staff, documents, modules..."
              className="flex-1 bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
            />
            <kbd className="text-[10px] text-slate-300 border border-slate-200 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
                className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 relative transition-colors"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">
                      Notifications
                      {unreadCount > 0 && <span className="ml-2 text-xs bg-red-100 text-red-600 font-semibold px-1.5 py-0.5 rounded-full">{unreadCount} unread</span>}
                    </span>
                    {unreadCount > 0 && (
                      <button className="text-xs text-[#006838] font-semibold cursor-pointer hover:underline" onClick={markAllRead}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-sm text-slate-400">No notifications</div>
                    ) : (
                      notifications.slice(0, 20).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markRead(n.id)
                            if (n.link) { navigate(n.link); setNotifOpen(false) }
                          }}
                          className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-slate-50 last:border-0 transition-colors
                            ${n.read ? 'hover:bg-slate-50' : 'bg-green-50/60 hover:bg-green-50'}`}
                        >
                          <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${TYPE_DOT[n.type] || 'bg-slate-400'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${n.read ? 'font-medium text-slate-600' : 'font-semibold text-slate-800'}`}>{n.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{n.sub}</p>
                            {n.module && <p className="text-[10px] text-[#006838] font-medium mt-0.5">{n.module}</p>}
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-[10px] text-slate-400">{relativeTime(n.ts)}</span>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-[#006838]" />}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2.5 text-center border-t border-slate-100">
                    <span className="text-xs text-slate-400">{notifications.length} total notifications</span>
                  </div>
                </div>
              )}
            </div>

            <button className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
              <Settings size={16} />
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#006838] flex items-center justify-center text-white text-xs font-bold">
                  {user?.initials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name?.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-400">{user?.role}</p>
                </div>
                <ChevronDown size={12} className="text-slate-400 hidden md:block" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-fade-in">
                  <div className="px-4 py-4 bg-[#006838]/5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#006838] flex items-center justify-center text-white font-bold">{user?.initials}</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500">{user?.department}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{user?.staffId}</p>
                      </div>
                    </div>
                  </div>
                  {[
                    { label: 'My Profile', icon: User, path: '/app/profile' },
                    { label: 'Settings', icon: Settings, path: null },
                  ].map((item, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        if (item.path) {
                          navigate(item.path)
                          setProfileOpen(false)
                        }
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
                    >
                      <item.icon size={14} className="text-slate-400" />
                      {item.label}
                    </div>
                  ))}
                  <div
                    onClick={() => { logout(); navigate('/') }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 cursor-pointer text-sm text-red-500 border-t border-slate-100"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-6" onClick={() => { setNotifOpen(false); setProfileOpen(false) }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
