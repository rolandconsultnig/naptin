import { useCallback, useEffect, useState } from 'react'
import { decideBrandApprovalApi, fetchBrandApprovalsApi } from '../../brandApi'

export function useBrandApprovals(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters)
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDeciding, setIsDeciding] = useState(false)

  const load = useCallback(async (nextFilters = filters) => {
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchBrandApprovalsApi(nextFilters)
      setItems(Array.isArray(data?.items) ? data.items : [])
    } catch (err) {
      setError(err?.message || 'Unable to load approvals inbox')
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    load(filters)
  }, [load, filters])

  const applyFilters = useCallback((nextFilters) => {
    setFilters(nextFilters)
  }, [])

  const decide = useCallback(async (approvalId, decision, comment = '') => {
    setIsDeciding(true)
    try {
      await decideBrandApprovalApi(approvalId, { decision, comment })
      await load(filters)
    } finally {
      setIsDeciding(false)
    }
  }, [filters, load])

  return {
    items,
    isLoading,
    isDeciding,
    error,
    filters,
    applyFilters,
    reload: () => load(filters),
    decide,
  }
}
