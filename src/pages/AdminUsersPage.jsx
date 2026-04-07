import { useEffect, useMemo, useState } from 'react'
import {
  assignRbacUserSecondaryRole,
  checkRbacSodForUser,
  createRbacUser,
  disableRbacUser,
  fetchRbacRoles,
  fetchRbacUsers,
  removeRbacUserSecondaryRole,
} from '../admin/rbacApi'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sodChecks, setSodChecks] = useState({})
  const [secondaryDraft, setSecondaryDraft] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [newUser, setNewUser] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    primaryRoleCode: '',
    accountStatus: 'active',
  })

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [u, r] = await Promise.all([
        fetchRbacUsers({ q: query, status: statusFilter }),
        fetchRbacRoles(),
      ])
      setUsers(u.items || [])
      setRoles(r.items || [])
    } catch (e) {
      setError(e.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const onAssignSecondaryRole = async (userId) => {
    const roleCode = secondaryDraft[userId]
    if (!roleCode) return
    setError('')
    try {
      await assignRbacUserSecondaryRole(userId, { roleCode })
      setSecondaryDraft((prev) => ({ ...prev, [userId]: '' }))
      await loadData()
    } catch (e) {
      setError(e.message || 'Failed to assign secondary role')
    }
  }

  const onRemoveSecondaryRole = async (userId, roleCode) => {
    setError('')
    try {
      await removeRbacUserSecondaryRole(userId, roleCode)
      await loadData()
    } catch (e) {
      setError(e.message || 'Failed to remove secondary role')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const roleOptions = useMemo(
    () => (roles || []).map((r) => ({ code: r.role_code, name: r.role_name })),
    [roles]
  )

  const onCreateUser = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await createRbacUser(newUser)
      setNewUser({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        primaryRoleCode: '',
        accountStatus: 'active',
      })
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  const onDisable = async (userId) => {
    if (!window.confirm('Disable this user account?')) return
    setError('')
    try {
      await disableRbacUser(userId)
      await loadData()
    } catch (e) {
      setError(e.message || 'Failed to disable user')
    }
  }

  const onCheckSod = async (userId) => {
    try {
      const res = await checkRbacSodForUser(userId)
      setSodChecks((prev) => ({ ...prev, [userId]: res.items || [] }))
    } catch (e) {
      setError(e.message || 'Failed to run SoD check')
    }
  }

  return (
    <div className="animate-fade-up max-w-5xl">
      <h1 className="text-xl font-extrabold text-slate-900">Users & access assignments</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">
        Manage employee accounts, primary role assignment, and run segregation-of-duty checks for risk combinations.
      </p>

      <form className="card mb-4 grid md:grid-cols-6 gap-3" onSubmit={onCreateUser}>
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Employee ID"
          value={newUser.employeeId}
          onChange={(e) => setNewUser((s) => ({ ...s, employeeId: e.target.value }))}
          required
        />
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="First name"
          value={newUser.firstName}
          onChange={(e) => setNewUser((s) => ({ ...s, firstName: e.target.value }))}
          required
        />
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Last name"
          value={newUser.lastName}
          onChange={(e) => setNewUser((s) => ({ ...s, lastName: e.target.value }))}
          required
        />
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Email"
          type="email"
          value={newUser.email}
          onChange={(e) => setNewUser((s) => ({ ...s, email: e.target.value }))}
          required
        />
        <select
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          value={newUser.primaryRoleCode}
          onChange={(e) => setNewUser((s) => ({ ...s, primaryRoleCode: e.target.value }))}
        >
          <option value="">Primary role</option>
          {roleOptions.map((role) => (
            <option key={role.code} value={role.code}>{role.name}</option>
          ))}
        </select>
        <button type="submit" disabled={submitting} className="btn-primary text-sm py-2">
          {submitting ? 'Creating…' : 'Add user'}
        </button>
      </form>

      <div className="card mb-4 flex flex-wrap items-center gap-2">
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Search name/email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
        <button type="button" className="btn-secondary text-sm py-2" onClick={loadData}>
          Refresh
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {loading && <div className="mb-4 text-sm text-slate-500">Loading users…</div>}

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="table-th text-left">User</th>
              <th className="table-th text-left">Department</th>
              <th className="table-th text-left">Primary role</th>
              <th className="table-th text-left">Status</th>
              <th className="table-th text-left">Secondary roles</th>
              <th className="table-th text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((row) => {
              const conflicts = sodChecks[row.id] || []
              return (
                <tr key={row.id} className="border-b border-slate-50 align-top">
                  <td className="table-td">
                    <span className="font-semibold text-slate-800">{row.name || `${row.firstName} ${row.lastName}`}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">{row.email}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">{row.employeeId}</span>
                  </td>
                  <td className="table-td text-slate-600">{row.departmentName || '—'}</td>
                  <td className="table-td font-mono text-xs">{row.primaryRoleCode || '—'}</td>
                  <td className="table-td">
                    <span className={`badge text-[10px] ${row.accountStatus === 'active' ? 'badge-green' : 'badge-slate'}`}>
                      {row.accountStatus}
                    </span>
                  </td>
                  <td className="table-td text-xs font-mono text-slate-500">
                    {row.secondaryRoleCodes?.length ? row.secondaryRoleCodes.join(', ') : '—'}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(row.secondaryRoleCodes || []).map((roleCode) => (
                        <button
                          key={roleCode}
                          type="button"
                          onClick={() => onRemoveSecondaryRole(row.id, roleCode)}
                          className="text-[10px] font-semibold px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50"
                          title="Remove secondary role"
                        >
                          {roleCode} ×
                        </button>
                      ))}
                    </div>
                    {!!conflicts.length && (
                      <span className="block mt-1 text-[10px] text-red-600">{conflicts.length} SoD conflict(s)</span>
                    )}
                  </td>
                  <td className="table-td">
                    <div className="flex flex-wrap gap-2">
                      <select
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white max-w-[160px]"
                        value={secondaryDraft[row.id] || ''}
                        onChange={(e) => setSecondaryDraft((prev) => ({ ...prev, [row.id]: e.target.value }))}
                      >
                        <option value="">Secondary role</option>
                        {roleOptions
                          .filter((role) => role.code !== row.primaryRoleCode)
                          .map((role) => (
                            <option key={role.code} value={role.code}>{role.name}</option>
                          ))}
                      </select>
                      <button
                        type="button"
                        className="btn-secondary text-xs py-1.5"
                        onClick={() => onAssignSecondaryRole(row.id)}
                        disabled={!secondaryDraft[row.id]}
                      >
                        Add role
                      </button>
                      <button type="button" className="btn-secondary text-xs py-1.5" onClick={() => onCheckSod(row.id)}>
                        Check SoD
                      </button>
                      {row.accountStatus === 'active' && (
                        <button
                          type="button"
                          className="text-xs font-semibold px-2 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => onDisable(row.id)}
                        >
                          Disable
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
