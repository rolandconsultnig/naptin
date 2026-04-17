import { NavLink, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { NAPTIN_LOGO } from '../../assets/images'
import { FINANCE_NAV } from '../../data/financeAccounting'
import { FinanceProvider } from '../../context/FinanceContext'

export default function FinanceLayout() {
  return (
    <FinanceProvider>
    <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
    <div className="animate-fade-up space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold text-slate-900">Finance &amp; accounting suite</h1>
          <p className="text-sm text-slate-400">
            Live workspace: data persists in this browser (local storage). Use <strong className="text-slate-600">Reset module</strong> in
            Overview to restore defaults.
          </p>
        </div>
      </div>

      <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1 shadow-sm overflow-x-auto max-w-full scrollbar-thin">
        {FINANCE_NAV.map((t) => (
          <NavLink
            key={t.to}
            to={t.to === 'overview' ? '/app/finance' : `/app/finance/${t.to}`}
            end={t.to === 'overview'}
            className={({ isActive }) =>
              `flex-shrink-0 px-2.5 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all ${
                isActive ? 'bg-[#006838] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
    </FinanceProvider>
  )
}
