import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

/**
 * Hook wrapping a mutation (POST/PATCH/DELETE). Returns { run, loading }.
 * On success calls `onSuccess` callback. On failure shows toast.
 */
export default function useMutation(mutationFn, { onSuccess, successMsg } = {}) {
  const [loading, setLoading] = useState(false)

  const run = useCallback(async (...args) => {
    setLoading(true)
    try {
      const result = await mutationFn(...args)
      if (successMsg) toast.success(successMsg)
      if (onSuccess) onSuccess(result)
      return result
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Something went wrong'
      toast.error(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [mutationFn, onSuccess, successMsg])

  return { run, loading }
}
