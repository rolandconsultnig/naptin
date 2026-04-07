import { useCallback, useState } from 'react'
import { runComplianceBatchApi, runComplianceScanApi } from '../../brandApi'

export function useBrandCompliance() {
  const [result, setResult] = useState(null)
  const [batchResult, setBatchResult] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isRunningBatch, setIsRunningBatch] = useState(false)
  const [error, setError] = useState('')
  const [batchError, setBatchError] = useState('')

  const runScan = useCallback(async (payload) => {
    setIsRunning(true)
    setError('')
    try {
      const data = await runComplianceScanApi(payload)
      setResult(data)
      return data
    } catch (err) {
      setError(err?.message || 'Unable to run compliance scan')
      setResult(null)
      throw err
    } finally {
      setIsRunning(false)
    }
  }, [])

  const runBatch = useCallback(async (payload) => {
    setIsRunningBatch(true)
    setBatchError('')
    try {
      const data = await runComplianceBatchApi(payload)
      setBatchResult(data)
      return data
    } catch (err) {
      setBatchError(err?.message || 'Unable to run batch compliance check')
      setBatchResult(null)
      throw err
    } finally {
      setIsRunningBatch(false)
    }
  }, [])

  return {
    result,
    batchResult,
    isRunning,
    isRunningBatch,
    error,
    batchError,
    runScan,
    runBatch,
    clearResult: () => setResult(null),
    clearBatchResult: () => setBatchResult(null),
  }
}
