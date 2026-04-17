/**
 * Reusable pill / badge component used across tables.
 */
const PRESETS = {
  active: 'bg-green-50 text-[#006838] border-green-200',
  approved: 'bg-green-50 text-[#006838] border-green-200',
  completed: 'bg-green-50 text-[#006838] border-green-200',
  resolved: 'bg-green-50 text-[#006838] border-green-200',
  paid: 'bg-green-50 text-[#006838] border-green-200',
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  scheduled: 'bg-purple-50 text-purple-700 border-purple-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
  closed: 'bg-slate-50 text-slate-500 border-slate-200',
  inactive: 'bg-slate-50 text-slate-500 border-slate-200',
  cancelled: 'bg-slate-50 text-slate-500 border-slate-200',
  P1: 'bg-red-50 text-red-700 border-red-200',
  P2: 'bg-amber-50 text-amber-700 border-amber-200',
  P3: 'bg-blue-50 text-blue-700 border-blue-200',
  P4: 'bg-slate-50 text-slate-500 border-slate-200',
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-blue-50 text-blue-700 border-blue-200',
}

const FALLBACK = 'bg-slate-50 text-slate-500 border-slate-200'

export default function StatusPill({ status, className = '' }) {
  if (!status) return null
  const key = status.toLowerCase().replace(/\s+/g, '_')
  const cls = PRESETS[status] || PRESETS[key] || FALLBACK
  return (
    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${cls} ${className}`}>
      {status}
    </span>
  )
}
