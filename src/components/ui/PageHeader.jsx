/**
 * Reusable page header with title, breadcrumb, and optional actions slot.
 */
export default function PageHeader({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-[#006838]/10 flex items-center justify-center">
            <Icon size={18} className="text-[#006838]" />
          </div>
        )}
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
