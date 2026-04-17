import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Pagination bar for tables. Works with usePagination hook output.
 */
export default function Pagination({ page, totalPages, total, goTo, canNext, canPrev, next, prev }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
      <p className="text-xs text-slate-400">
        Page {page} of {totalPages} &middot; {total} records
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={prev}
          disabled={!canPrev}
          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNum
          if (totalPages <= 5) {
            pageNum = i + 1
          } else if (page <= 3) {
            pageNum = i + 1
          } else if (page >= totalPages - 2) {
            pageNum = totalPages - 4 + i
          } else {
            pageNum = page - 2 + i
          }
          return (
            <button
              key={pageNum}
              onClick={() => goTo(pageNum)}
              className={`w-7 h-7 rounded text-xs font-medium ${
                pageNum === page
                  ? 'bg-[#006838] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {pageNum}
            </button>
          )
        })}
        <button
          onClick={next}
          disabled={!canNext}
          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
