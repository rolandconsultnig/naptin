import { useCallback, useEffect, useState } from 'react'
import { createBrandAssetApi, fetchBrandAssetsApi } from '../../brandApi'

export function useBrandAssets(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters)
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (nextFilters = filters) => {
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchBrandAssetsApi(nextFilters)
      setItems(Array.isArray(data?.items) ? data.items : [])
    } catch (err) {
      setError(err?.message || 'Unable to load brand assets')
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

  const createAsset = useCallback(async (payload) => {
    const created = await createBrandAssetApi(payload)
    await load(filters)
    return created
  }, [filters, load])

  return {
    items,
    isLoading,
    error,
    filters,
    applyFilters,
    reload: () => load(filters),
    createAsset,
  }
}
