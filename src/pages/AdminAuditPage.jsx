import { useEffect, useMemo, useState } from 'react'
import { ScrollText } from 'lucide-react'
import { getPolicyAuditEvents } from '../admin/policyAuditStore'
import { fetchTenantAuditApi } from '../admin/tenantPolicyApi'
import { fetchRbacAudit } from '../admin/rbacApi'
import { getCurrentTenantId, subscribeTenant } from '../admin/tenantStore'

const FALLBACK_EVENTS = [
  { when: '28 Mar 2026 09:42', actor: 'ict@naptin.gov.ng', action: 'policy.save', detail: 'Access matrix updated (finance.staff → view)' },
  { when: '28 Mar 2026 09:18', actor: 'director@naptin.gov.ng', action: 'module.disable', detail: 'Segment mande disabled' },
  { when: '27 Mar 2026 16:02', actor: 'system', action: 'integration.token_rotate', detail: 'Microsoft 365' },
  { when: '27 Mar 2026 11:30', actor: 'hod@naptin.gov.ng', action: 'admin.login', detail: 'Admin console from 127.0.0.1' },
]

export default function AdminAuditPage() {
  const [tenantId, setTenantId] = useState(getCurrentTenantId())
  const [serverEvents, setServerEvents] = useState([])

  useEffect(() => {
    return subscribeTenant(() => setTenantId(getCurrentTenantId()))
  }, [])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const rbac = await fetchRbacAudit(150)
        const rbacItems = (rbac.items || []).map((e) => ({
          when: new Date(e.created_at).toLocaleString(),
          actor: e.actor_email || 'system',
          action: e.action_code,
          detail: e.detail || `${e.entity_type} ${e.entity_id || ''}`.trim(),
        }))
        if (rbacItems.length) {
          if (mounted) setServerEvents(rbacItems)
          return
        }

        const data = await fetchTenantAuditApi(tenantId, 100)
        const items = (data.items || []).map((e) => ({
          when: new Date(e.created_at).toLocaleString(),
          actor: e.actor_email || e.actor_username || 'system',
          action: e.action,
          detail: `${e.detail}${data?.tenant?.key ? ` (tenant: ${data.tenant.key})` : ''}`,
        }))
        if (mounted) setServerEvents(items)
      } catch {
        if (mounted) setServerEvents([])
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [tenantId])

  const events = useMemo(() => {
    if (serverEvents.length) return serverEvents

    const dynamic = getPolicyAuditEvents()
      .filter((e) => !e.tenantId || e.tenantId === tenantId)
      .map((e) => ({
        ...e,
        when: new Date(e.when).toLocaleString(),
        detail: `${e.detail}${e.tenantId ? ` (tenant: ${e.tenantId})` : ''}`,
      }))

    return dynamic.length ? dynamic : FALLBACK_EVENTS
  }, [serverEvents, tenantId])

  return (
    <div className="animate-fade-up max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
          <ScrollText size={20} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Administrative audit</h1>
          <p className="text-sm text-slate-500">Recent administrative actions on the portal.</p>
        </div>
      </div>

      <div className="card divide-y divide-slate-100 p-0">
        {events.map((e, i) => (
          <div key={i} className="px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-2">
            <span className="text-[10px] font-mono text-slate-400 w-40 flex-shrink-0">{e.when}</span>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-mono text-[#006838] font-bold">{e.action}</span>
              <span className="text-xs text-slate-500 block mt-0.5">{e.detail}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">{e.actor}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
