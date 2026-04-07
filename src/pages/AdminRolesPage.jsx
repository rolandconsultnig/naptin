import { useEffect, useMemo, useState } from 'react'
import { createRbacRole, fetchRbacRoles } from '../admin/rbacApi'

export default function AdminRolesPage() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    roleCode: '',
    roleName: '',
    description: '',
    roleLevel: 4,
  })

  async function loadRoles() {
    setLoading(true)
    setError('')
    try {
      const res = await fetchRbacRoles()
      setRoles(res.items || [])
    } catch (e) {
      setError(e.message || 'Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoles()
  }, [])

  const grouped = useMemo(() => {
    const map = new Map()
    for (const row of roles) {
      const key = row.department_name || 'Unassigned'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(row)
    }
    return Array.from(map.entries())
  }, [roles])

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await createRbacRole({
        roleCode: form.roleCode,
        roleName: form.roleName,
        description: form.description,
        roleLevel: Number(form.roleLevel) || 4,
      })
      setForm({ roleCode: '', roleName: '', description: '', roleLevel: 4 })
      await loadRoles()
    } catch (err) {
      setError(err.message || 'Failed to create role')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-up max-w-5xl">
      <h1 className="text-xl font-extrabold text-slate-900">Roles</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">
        Define organizational roles and hierarchy levels used by the permission matrix and workflow task assignment.
      </p>

      <form className="card mb-4 grid md:grid-cols-4 gap-3" onSubmit={onSubmit}>
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
          placeholder="Role code (e.g. FIN_MGR)"
          value={form.roleCode}
          onChange={(e) => setForm((s) => ({ ...s, roleCode: e.target.value.toUpperCase() }))}
          required
        />
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Role name"
          value={form.roleName}
          onChange={(e) => setForm((s) => ({ ...s, roleName: e.target.value }))}
          required
        />
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
        />
        <div className="flex gap-2">
          <input
            className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm"
            type="number"
            min={1}
            max={10}
            value={form.roleLevel}
            onChange={(e) => setForm((s) => ({ ...s, roleLevel: e.target.value }))}
          />
          <button type="submit" disabled={saving} className="btn-primary text-sm py-2 px-4">
            {saving ? 'Saving…' : 'Create role'}
          </button>
        </div>
      </form>

      {error && <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {loading && <div className="mb-3 text-sm text-slate-500">Loading roles…</div>}

      <div className="space-y-4">
        {grouped.map(([department, rows]) => (
          <div key={department} className="card p-0 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-700">{department}</div>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-th text-left">Role</th>
                  <th className="table-th text-left">Code</th>
                  <th className="table-th text-left">Level</th>
                  <th className="table-th text-left">Users</th>
                  <th className="table-th text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-50">
                    <td className="table-td font-semibold text-slate-800">{row.role_name}</td>
                    <td className="table-td font-mono text-xs text-slate-600">{row.role_code}</td>
                    <td className="table-td">{row.role_level}</td>
                    <td className="table-td">{row.user_count || 0}</td>
                    <td className="table-td">
                      <span className={`badge text-[10px] ${row.status === 'active' ? 'badge-green' : 'badge-slate'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
