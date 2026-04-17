import { useState, useMemo, useCallback } from 'react'

/**
 * Re-usable filtering + search state for table data.
 * Usage: const { filtered, search, setSearch, filters, setFilter } = useFilter(rows, config)
 *
 * config = {
 *   searchFields: ['title', 'name'],
 *   filterDefs: { status: 'all', priority: 'all' }
 * }
 */
export default function useFilter(rows, config = {}) {
  const { searchFields = [], filterDefs = {} } = config
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(() => ({ ...filterDefs }))

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setSearch('')
    setFilters({ ...filterDefs })
  }, [filterDefs])

  const filtered = useMemo(() => {
    let result = rows || []
    const q = search.toLowerCase().trim()

    if (q && searchFields.length) {
      result = result.filter((row) =>
        searchFields.some((field) => {
          const val = row[field]
          return val && String(val).toLowerCase().includes(q)
        })
      )
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (!value || value === 'all' || value === 'All') return
      result = result.filter((row) => row[key] === value)
    })

    return result
  }, [rows, search, filters, searchFields])

  return { filtered, search, setSearch, filters, setFilter, resetFilters }
}
