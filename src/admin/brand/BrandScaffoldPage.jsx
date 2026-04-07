import { Link } from 'react-router-dom'

const BRAND_LINKS = [
  { to: '/admin/brand/assets', label: 'Assets' },
  { to: '/admin/brand/compliance', label: 'Compliance' },
  { to: '/admin/brand/architecture', label: 'Architecture' },
  { to: '/admin/brand/health', label: 'Health' },
  { to: '/admin/brand/crisis', label: 'Crisis' },
  { to: '/admin/brand/competitors', label: 'Competitors' },
  { to: '/admin/brand/usage', label: 'Usage' },
  { to: '/admin/brand/approvals', label: 'Approvals' },
]

export default function BrandScaffoldPage({ title, description, points }) {
  return (
    <div className="animate-fade-up max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">{description}</p>
      </div>

      <div className="card mb-6">
        <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest mb-3">Brand module</p>
        <div className="flex flex-wrap gap-2">
          {BRAND_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="text-sm font-bold text-slate-800 mb-3">Scaffold checklist</p>
        <ul className="space-y-2">
          {points.map((point) => (
            <li key={point} className="text-sm text-slate-600">• {point}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
