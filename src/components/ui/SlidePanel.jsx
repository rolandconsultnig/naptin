import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

/**
 * Slide-over modal panel. Used for form drawers across modules.
 */
export default function SlidePanel({ open, onClose, title, children, width = 'max-w-lg' }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        ref={panelRef}
        className={`relative ${width} w-full bg-white shadow-xl flex flex-col animate-slide-in-right overflow-hidden`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100">
            <X size={16} className="text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
