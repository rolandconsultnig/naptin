import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PORTAL_MODULES } from '../admin/portalModules'
import { loadPolicy, savePolicy, setModuleDisabled } from '../admin/policyStore'
import { appendPolicyAuditEvent } from '../admin/policyAuditStore'
import { TENANT_OPTIONS, getCurrentTenantId, setCurrentTenantId, subscribeTenant } from '../admin/tenantStore'
import { fetchTenantsApi, fetchTenantPolicyApi, updateTenantModulePolicyApi } from '../admin/tenantPolicyApi'
import { useAuth } from '../context/AuthContext'
import { ExternalLink, Power } from 'lucide-react'

export default function AdminModulesPage() {
  const { user } = useAuth()
  const [tenantId, setTenantId] = useState(getCurrentTenantId())
  const [policy, setPolicy] = useState(loadPolicy(tenantId))
  const [tenantOptions, setTenantOptions] = useState(TENANT_OPTIONS)
  const [error, setError] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)

  const syncTenantPolicy = async (targetTenantId) => {
    try {
      setIsSyncing(true)
      setError('')

      const data = await fetchTenantPolicyApi(targetTenantId)
      const current = loadPolicy(targetTenantId)
      const disabled = { ...(current.disabled || {}) }

      for (const item of data.items || []) {
        disabled[item.segment] = !item.is_enabled
      }

      const merged = savePolicy({ ...current, disabled }, targetTenantId)
      setPolicy(merged)
      return true
    } catch {
      setPolicy(loadPolicy(targetTenantId))
      return false
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    setTenantId(getCurrentTenantId())
    return subscribeTenant(() => setTenantId(getCurrentTenantId()))
  }, [])

  useEffect(() => {
    setPolicy(loadPolicy(tenantId))
    syncTenantPolicy(tenantId)
  }, [tenantId])

  useEffect(() => {
    let mounted = true

    const loadTenants = async () => {
      try {
        const data = await fetchTenantsApi()
        const items = (data.items || []).map((t) => ({ id: t.key, name: t.name }))
        if (mounted && items.length) setTenantOptions(items)
      } catch {
        if (mounted) setTenantOptions(TENANT_OPTIONS)
      }
    }

    loadTenants()
    return () => {
      mounted = false
    }
  }, [])

  const toggle = async (segment) => {
    const nextDisabled = !policy.disabled?.[segment]
    setModuleDisabled(segment, nextDisabled, tenantId)
    setPolicy(loadPolicy(tenantId))

    try {
      await updateTenantModulePolicyApi({
        tenantKey: tenantId,
        segment,
        isEnabled: !nextDisabled,
      })
      setError('')
    } catch {
      setError('Backend policy sync unavailable. Changes are saved locally for this session.')
    }

    appendPolicyAuditEvent({
      actor: user?.email || user?.name || 'system',
      action: nextDisabled ? 'module.disable' : 'module.enable',
      detail: `Segment ${segment} ${nextDisabled ? 'disabled' : 'enabled'}`,
      tenantId,
    })
  }

  const tenantLabel = useMemo(() => {
    return tenantOptions.find((t) => t.id === tenantId)?.name || tenantId
  }, [tenantId, tenantOptions])

  const handleTenantChange = (value) => {
    setCurrentTenantId(value)
    setTenantId(value)
    appendPolicyAuditEvent({
      actor: user?.email || user?.name || 'system',
      action: 'tenant.switch',
      detail: `Switched policy editor to tenant ${value}`,
      tenantId: value,
    })
    setError('')
  }

  const grouped = PORTAL_MODULES.reduce((acc, m) => {
    acc[m.category] = acc[m.category] || []
    acc[m.category].push(m)
    return acc
  }, {})

  return (
    <div className="animate-fade-up max-w-5xl">
      <h1 className="text-xl font-extrabold text-slate-900">Module registry</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">
        Disabled modules are hidden from the staff sidebar and return “access denied” if opened by URL. Controls apply to the
        selected organisation.
      </p>

      {error && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Active tenant</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{tenantLabel}</p>
          </div>
          <div className="w-full sm:w-72">
            <label htmlFor="tenant" className="text-[11px] text-slate-500 font-semibold block mb-1">Manage modules for tenant</label>
            <select
              id="tenant"
              value={tenantId}
              onChange={(e) => handleTenantChange(e.target.value)}
              className="w-full select"
              disabled={isSyncing}
            >
              {tenantOptions.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {Object.entries(grouped).map(([category, mods]) => (
        <div key={category} className="mb-8">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{category}</h2>
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-th text-left">Module</th>
                  <th className="table-th text-left">Route</th>
                  <th className="table-th text-center w-28">Enabled</th>
                  <th className="table-th text-right w-24">Open</th>
                </tr>
              </thead>
              <tbody>
                {mods.map((m) => {
                  const off = !!policy.disabled?.[m.segment]
                  return (
                    <tr key={m.segment} className="border-b border-slate-50 last:border-0">
                      <td className="table-td">
                        <span className="font-semibold text-slate-800">{m.label}</span>
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{m.segment}</span>
                      </td>
                      <td className="table-td text-slate-500 font-mono text-xs">{m.path}</td>
                      <td className="table-td text-center">
                        <button
                          type="button"
                          onClick={() => toggle(m.segment)}
                          disabled={isSyncing}
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                            off ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          <Power size={12} />
                          {off ? 'Off' : 'On'}
                        </button>
                      </td>
                      <td className="table-td text-right">
                        <Link
                          to={m.path}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#006838] hover:underline"
                        >
                          Portal <ExternalLink size={11} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
