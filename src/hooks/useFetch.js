import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Generic data-fetching hook. Calls `fetchFn` on mount and whenever `deps` change.
 * Returns { data, loading, error, refetch }.
 * `fetchFn` is read from a ref on each load so `refetch()` always uses the latest closure
 * (avoids stale values when `deps` omits values captured inside an inline `fetchFn`).
 */
export default function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)
  const fetchFnRef = useRef(fetchFn)
  fetchFnRef.current = fetchFn

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFnRef.current()
      if (mountedRef.current) {
        setData(result)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err?.response?.data?.error || err.message || 'Request failed')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true
    load()
    return () => { mountedRef.current = false }
  }, [load])

  return { data, loading, error, refetch: load }
}
