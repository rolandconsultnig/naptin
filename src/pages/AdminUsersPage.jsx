import { useEffect, useMemo, useState } from 'react'
import {
  approveRbacUserPermissionOverrides,
  assignRbacUserSecondaryRole,
  checkRbacSodForUser,
  createRbacJobDescription,
  createRbacUser,
  disableRbacUser,
  fetchRbacDepartments,
  fetchRbacDepartmentUnits,
  fetchRbacJobDescriptions,
  fetchRbacPendingUserPermissionOverrides,
  fetchRbacRoles,
  fetchRbacUserAccessProfile,
  fetchRbacUsers,
  rejectRbacUserPermissionOverrides,
  removeRbacUserSecondaryRole,
  updateRbacUserPermissionOverrides,
} from '../admin/rbacApi'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [departments, setDepartments] = useState([])
  const [units, setUnits] = useState([])
  const [jobDescriptions, setJobDescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sodChecks, setSodChecks] = useState({})
  const [secondaryDraft, setSecondaryDraft] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [accessProfile, setAccessProfile] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(0)
  const [savingOverrides, setSavingOverrides] = useState(false)
  const [pendingOverrides, setPendingOverrides] = useState([])
  const [newOverride, setNewOverride] = useState({
    permissionCode: '',
    effect: 'allow',
    reason: '',
    approverEmail: '',
    expiresAt: '',
  })
  const [jobSaving, setJobSaving] = useState(false)
  const [jobDraft, setJobDraft] = useState({
    jobCode: '',
    title: '',
    departmentCode: '',
    unitCode: '',
    summary: '',
    responsibilities: '',
    requirements: '',
    status: 'active',
  })
  const [newUser, setNewUser] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    departmentCode: '',
    unitCode: '',
    jobTitle: '',
    jobSummary: '',
    primaryRoleCode: '',
    accountStatus: 'active',
  })

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [u, r, d, jd] = await Promise.all([
        fetchRbacUsers({ q: query, status: statusFilter }),
        fetchRbacRoles(),
        fetchRbacDepartments(),
        fetchRbacJobDescriptions(),
      ])
      setUsers(u.items || [])
      setRoles(r.items || [])
      setDepartments(d.items || [])
      setJobDescriptions(jd.items || [])
    } catch (e) {
      setError(e.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  async function loadUnits(departmentCode) {
    if (!departmentCode) {
      setUnits([])
      return
    }
    try {
      const res = await fetchRbacDepartmentUnits(departmentCode)
      setUnits(res.items || [])
    } catch (e) {
      setError(e.message || 'Failed to load department units')
      setUnits([])
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

  useEffect(() => {
    if (newUser.departmentCode) {
      loadUnits(newUser.departmentCode)
      return
    }
    setUnits([])
  }, [newUser.departmentCode])

  const roleOptions = useMemo(
    () => (roles || []).map((r) => ({ code: r.role_code, name: r.role_name })),
    [roles]
  )

  const overridePermissionChoices = useMemo(() => {
    const rolePerms = accessProfile?.permissions || []
    return rolePerms.map((perm) => perm.permission_code)
  }, [accessProfile])

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
        departmentCode: '',
        unitCode: '',
        jobTitle: '',
        jobSummary: '',
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

  const onSelectJobDescription = (jobCode) => {
    const job = (jobDescriptions || []).find((item) => item.job_code === jobCode)
    if (!job) return
    setNewUser((prev) => ({
      ...prev,
      departmentCode: job.department_code || prev.departmentCode,
      unitCode: job.unit_code || prev.unitCode,
      jobTitle: job.title || prev.jobTitle,
      jobSummary: job.summary || prev.jobSummary,
    }))
  }

  const onLoadAccessProfile = async (userId) => {
    setError('')
    setSelectedUserId(userId)
    try {
      const [profile, pending] = await Promise.all([
        fetchRbacUserAccessProfile(userId),
        fetchRbacPendingUserPermissionOverrides(userId),
      ])
      setAccessProfile(profile)
      setPendingOverrides(pending.items || [])
    } catch (e) {
      setError(e.message || 'Failed to load access profile')
      setAccessProfile(null)
      setPendingOverrides([])
    }
  }

  const onAddOverride = () => {
    if (!newOverride.permissionCode || String(newOverride.reason || '').trim().length < 5) {
      setError('Override reason must be at least 5 characters.')
      return
    }
    setAccessProfile((prev) => {
      if (!prev) return prev
      const existing = prev.overrides || []
      const withoutCurrent = existing.filter((item) => item.permission_code !== newOverride.permissionCode)
      return {
        ...prev,
        overrides: [
          ...withoutCurrent,
          {
            permission_code: newOverride.permissionCode,
            effect: newOverride.effect,
            reason: newOverride.reason || null,
            requested_approver_email: newOverride.approverEmail || null,
            expires_at: newOverride.expiresAt || null,
          },
        ],
      }
    })
    setNewOverride({ permissionCode: '', effect: 'allow', reason: '', approverEmail: '', expiresAt: '' })
  }

  const onRemoveOverride = (permissionCode) => {
    setAccessProfile((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        overrides: (prev.overrides || []).filter((item) => item.permission_code !== permissionCode),
      }
    })
  }

  const onSaveOverrides = async () => {
    if (!selectedUserId || !accessProfile) return
    setSavingOverrides(true)
    setError('')
    try {
      const overrides = (accessProfile.overrides || []).map((item) => ({
        permissionCode: item.permission_code,
        effect: item.effect,
        reason: item.reason || '',
        approverEmail: item.requested_approver_email || '',
        expiresAt: item.expires_at || null,
      }))
      await updateRbacUserPermissionOverrides(selectedUserId, overrides)
      await onLoadAccessProfile(selectedUserId)
    } catch (e) {
      setError(e.message || 'Failed to save permission overrides')
    } finally {
      setSavingOverrides(false)
    }
  }

  const onApproveOverrides = async () => {
    if (!selectedUserId) return
    const approverNote = window.prompt('Approval note (optional):', '')
    setSavingOverrides(true)
    setError('')
    try {
      await approveRbacUserPermissionOverrides(selectedUserId, approverNote || '')
      await onLoadAccessProfile(selectedUserId)
    } catch (e) {
      setError(e.message || 'Failed to approve overrides')
    } finally {
      setSavingOverrides(false)
    }
  }

  const onRejectOverrides = async () => {
    if (!selectedUserId) return
    const approverNote = window.prompt('Rejection note (required for governance):', '')
    if (!approverNote) return
    setSavingOverrides(true)
    setError('')
    try {
      await rejectRbacUserPermissionOverrides(selectedUserId, approverNote)
      await onLoadAccessProfile(selectedUserId)
    } catch (e) {
      setError(e.message || 'Failed to reject overrides')
    } finally {
      setSavingOverrides(false)
    }
  }

  const onCreateJobDescription = async (e) => {
    e.preventDefault()
    setJobSaving(true)
    setError('')
    try {
      await createRbacJobDescription({
        ...jobDraft,
        jobCode: jobDraft.jobCode.toUpperCase(),
      })
      setJobDraft({
        jobCode: '',
        title: '',
        departmentCode: '',
        unitCode: '',
        summary: '',
        responsibilities: '',
        requirements: '',
        status: 'active',
      })
      const jobs = await fetchRbacJobDescriptions()
      setJobDescriptions(jobs.items || [])
    } catch (e) {
      setError(e.message || 'Failed to create job description')
    } finally {
      setJobSaving(false)
    }
  }

  return (
    <div className="animate-fade-up max-w-6xl">
      <h1 className="text-xl font-extrabold text-slate-900">Enterprise user management</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">
        Level-5 super admin workspace for access provisioning, departmental/unit assignment, and permission overrides.
      </p>

      <form className="card mb-4 grid md:grid-cols-4 gap-3" onSubmit={onCreateUser}>
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
          value={newUser.departmentCode}
          onChange={(e) =>
            setNewUser((s) => ({ ...s, departmentCode: e.target.value, unitCode: '' }))
          }
        >
          <option value="">Department</option>
          {departments.map((department) => (
            <option key={department.code} value={department.code}>{department.name}</option>
          ))}
        </select>
        <select
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          value={newUser.unitCode}
          onChange={(e) => setNewUser((s) => ({ ...s, unitCode: e.target.value }))}
          disabled={!newUser.departmentCode}
        >
          <option value="">Unit</option>
          {units.map((unit) => (
            <option key={unit.code} value={unit.code}>{unit.name}</option>
          ))}
        </select>
        <select
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          value=""
          onChange={(e) => onSelectJobDescription(e.target.value)}
        >
          <option value="">Job template</option>
          {jobDescriptions.map((job) => (
            <option key={job.id} value={job.job_code}>
              {job.job_code} — {job.title}
            </option>
          ))}
        </select>
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Job title"
          value={newUser.jobTitle}
          onChange={(e) => setNewUser((s) => ({ ...s, jobTitle: e.target.value }))}
        />
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Job summary"
          value={newUser.jobSummary}
          onChange={(e) => setNewUser((s) => ({ ...s, jobSummary: e.target.value }))}
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
          {submitting ? 'Creating…' : 'Create user'}
        </button>
      </form>

      <form className="card mb-4 grid md:grid-cols-2 gap-3" onSubmit={onCreateJobDescription}>
        <div className="md:col-span-2 text-sm font-semibold text-slate-700">Job description catalog</div>
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
          placeholder="Job code"
          value={jobDraft.jobCode}
          onChange={(e) => setJobDraft((s) => ({ ...s, jobCode: e.target.value.toUpperCase() }))}
          required
        />
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Title"
          value={jobDraft.title}
          onChange={(e) => setJobDraft((s) => ({ ...s, title: e.target.value }))}
          required
        />
        <select
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          value={jobDraft.departmentCode}
          onChange={(e) => setJobDraft((s) => ({ ...s, departmentCode: e.target.value }))}
        >
          <option value="">Department</option>
          {departments.map((department) => (
            <option key={department.code} value={department.code}>{department.name}</option>
          ))}
        </select>
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Unit code (optional)"
          value={jobDraft.unitCode}
          onChange={(e) => setJobDraft((s) => ({ ...s, unitCode: e.target.value.toUpperCase() }))}
        />
        <textarea
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[84px]"
          placeholder="Summary"
          value={jobDraft.summary}
          onChange={(e) => setJobDraft((s) => ({ ...s, summary: e.target.value }))}
          required
        />
        <textarea
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[84px]"
          placeholder="Responsibilities"
          value={jobDraft.responsibilities}
          onChange={(e) => setJobDraft((s) => ({ ...s, responsibilities: e.target.value }))}
          required
        />
        <textarea
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[84px] md:col-span-2"
          placeholder="Requirements"
          value={jobDraft.requirements}
          onChange={(e) => setJobDraft((s) => ({ ...s, requirements: e.target.value }))}
          required
        />
        <button type="submit" disabled={jobSaving} className="btn-secondary text-sm py-2 md:col-span-2">
          {jobSaving ? 'Saving job description…' : 'Save job description'}
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
                  <td className="table-td text-slate-600">
                    {row.departmentName || '—'}
                    <span className="block text-[10px] text-slate-400">{row.unitName || 'No unit'}</span>
                    <span className="block text-[10px] text-slate-500">{row.jobTitle || row.jobDescriptionTitle || 'No job profile'}</span>
                  </td>
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
                      <button type="button" className="btn-secondary text-xs py-1.5" onClick={() => onLoadAccessProfile(row.id)}>
                        Access profile
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

      {accessProfile && (
        <div className="card mt-4">
          <div className="flex items-center justify-between mb-3 gap-3">
            <div>
              <div className="text-sm font-bold text-slate-700">Access profile</div>
              <div className="text-xs text-slate-500">
                {accessProfile.user?.name} · {accessProfile.user?.primaryRoleCode || 'No primary role'}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-secondary text-xs py-1.5" onClick={onSaveOverrides} disabled={savingOverrides}>
                {savingOverrides ? 'Submitting…' : 'Submit for approval'}
              </button>
              <button
                type="button"
                className="btn-secondary text-xs py-1.5"
                onClick={onApproveOverrides}
                disabled={savingOverrides || !(pendingOverrides || []).length}
              >
                Approve pending
              </button>
              <button
                type="button"
                className="btn-secondary text-xs py-1.5"
                onClick={onRejectOverrides}
                disabled={savingOverrides || !(pendingOverrides || []).length}
              >
                Reject pending
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Effective permissions</div>
              <div className="rounded-xl border border-slate-200 max-h-52 overflow-auto">
                {(accessProfile.permissions || []).map((perm) => (
                  <div key={perm.permission_code} className="px-3 py-2 border-b border-slate-100">
                    <div className="text-[11px] font-mono text-slate-700">{perm.permission_code}</div>
                    <div className="text-[10px] text-slate-400">{perm.module_code} / {perm.feature_code} / {perm.action_code}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Permission overrides</div>
              {!!pendingOverrides.length && (
                <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-[11px] text-amber-800">
                  {pendingOverrides.length} pending override{pendingOverrides.length > 1 ? 's' : ''} awaiting checker approval.
                </div>
              )}
              <div className="rounded-xl border border-slate-200 p-2 mb-2">
                <div className="grid grid-cols-1 gap-2">
                  <select
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                    value={newOverride.permissionCode}
                    onChange={(e) => setNewOverride((s) => ({ ...s, permissionCode: e.target.value }))}
                  >
                    <option value="">Permission code</option>
                    {overridePermissionChoices.map((code) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                  <select
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                    value={newOverride.effect}
                    onChange={(e) => setNewOverride((s) => ({ ...s, effect: e.target.value }))}
                  >
                    <option value="allow">Allow</option>
                    <option value="deny">Deny</option>
                  </select>
                  <input
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                    placeholder="Reason (required, min 5 chars)"
                    value={newOverride.reason}
                    onChange={(e) => setNewOverride((s) => ({ ...s, reason: e.target.value }))}
                  />
                  <input
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                    placeholder="Approver email (optional)"
                    type="email"
                    value={newOverride.approverEmail}
                    onChange={(e) => setNewOverride((s) => ({ ...s, approverEmail: e.target.value }))}
                  />
                  <input
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                    type="datetime-local"
                    value={newOverride.expiresAt}
                    onChange={(e) => setNewOverride((s) => ({ ...s, expiresAt: e.target.value }))}
                  />
                  <button type="button" className="btn-secondary text-xs py-1.5" onClick={onAddOverride}>
                    Add override
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {(accessProfile.overrides || []).map((item) => (
                  <div key={item.permission_code} className="rounded-lg border border-slate-200 px-2 py-2 text-xs flex items-center justify-between gap-2">
                    <div>
                      <div className="font-mono text-slate-700">{item.permission_code}</div>
                      <div className="text-slate-500">{item.effect.toUpperCase()} · {item.reason || 'No reason supplied'}</div>
                      <div className="text-[10px] text-slate-400 uppercase">
                        Status: {item.approval_status || 'approved'}
                        {item.requested_by ? ` · Requested by ${item.requested_by}` : ''}
                        {item.requested_approver_email ? ` · Requested approver ${item.requested_approver_email}` : ''}
                        {item.expires_at ? ` · Expires ${new Date(item.expires_at).toLocaleString()}` : ''}
                        {item.approved_by ? ` · Approved by ${item.approved_by}` : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-700 font-semibold"
                      onClick={() => onRemoveOverride(item.permission_code)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {!accessProfile.overrides?.length && (
                  <div className="text-xs text-slate-400">No overrides configured.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
