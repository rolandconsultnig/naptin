import { useState, useMemo } from 'react'

/**
 * Client-side pagination for an array. Returns paginated slice + controls.
 */
export default function usePagination(items, pageSize = 10) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const slice = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, safePage, pageSize])

  function goTo(p) {
    setPage(Math.max(1, Math.min(p, totalPages)))
  }

  return {
    page: safePage,
    totalPages,
    total: items.length,
    slice,
    goTo,
    next: () => goTo(safePage + 1),
    prev: () => goTo(safePage - 1),
    canNext: safePage < totalPages,
    canPrev: safePage > 1,
  }
}
