/**
 * Re-usable stat card shown across dashboards.
 */
export default function StatCard({ label, value, icon: Icon, accent = 'text-[#006838]', subtitle }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
      {Icon && (
        <div className={`p-2 rounded-lg bg-[#E8F5EE] ${accent}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-slate-900 mt-0.5 leading-tight">{value}</p>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
