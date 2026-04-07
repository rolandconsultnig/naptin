import { useEffect, useState } from 'react'
import { loadPolicy, savePolicy, subscribePolicy } from './policyStore'
import { getCurrentTenantId, setCurrentTenantId, subscribeTenant } from './tenantStore'
import { fetchCurrentUserTenantPolicyApi } from './tenantPolicyApi'

/** Re-render when portal policy or user role overrides change. */
export function usePolicySync() {
  const [n, setN] = useState(0)
  const [tenantId, setTenantId] = useState(getCurrentTenantId())

  useEffect(() => {
    const onChange = () => setN((x) => x + 1)
    const unsubPolicy = subscribePolicy(onChange)
    const unsubTenant = subscribeTenant(() => {
      setTenantId(getCurrentTenantId())
      onChange()
    })
    return () => {
      unsubPolicy()
      unsubTenant()
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const hydrateTenantPolicy = async () => {
      try {
        const data = await fetchCurrentUserTenantPolicyApi()
        const backendTenantId = data?.tenant?.key
        if (!backendTenantId || !mounted) return

        if (backendTenantId !== getCurrentTenantId()) {
          setCurrentTenantId(backendTenantId)
          return
        }

        const current = loadPolicy(backendTenantId)
        const disabled = { ...(current.disabled || {}) }

        for (const item of data.items || []) {
          disabled[item.segment] = !item.is_enabled
        }

        savePolicy({ ...current, disabled }, backendTenantId)
      } catch {
      }
    }

    hydrateTenantPolicy()
    return () => {
      mounted = false
    }
  }, [tenantId])

  return n
}
