import { AlertTriangle, RefreshCw } from 'lucide-react'

/**
 * Shared loading / error / empty states for data pages.
 */
export function LoadingSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-12 bg-slate-100 rounded-lg" />
      ))}
    </div>
  )
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
      <AlertTriangle size={18} className="text-red-500 shrink-0" />
      <p className="text-sm text-red-700 flex-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-red-600 font-medium flex items-center gap-1 hover:underline"
        >
          <RefreshCw size={12} /> Retry
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="text-center py-12">
      {Icon && <Icon size={36} className="mx-auto text-slate-300 mb-3" />}
      <p className="text-sm font-medium text-slate-500">{title || 'No records found'}</p>
      {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
    </div>
  )
}
