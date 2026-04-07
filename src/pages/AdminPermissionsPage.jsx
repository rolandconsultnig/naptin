import { useEffect, useMemo, useState } from 'react'
import {
  createRbacModule,
  createRbacModuleFeature,
  fetchRbacMatrix,
  fetchRbacModuleFeatures,
  fetchRbacModules,
  fetchRbacRolePermissions,
  updateRbacModule,
  updateRbacModuleFeature,
  updateRbacRolePermissions,
} from '../admin/rbacApi'

export default function AdminPermissionsPage() {
  const [modules, setModules] = useState([])
  const [selectedModule, setSelectedModule] = useState('')
  const [roles, setRoles] = useState([])
  const [matrixRows, setMatrixRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingRoleId, setSavingRoleId] = useState(0)
  const [moduleDraft, setModuleDraft] = useState({ moduleCode: '', moduleName: '', status: 'active', displayOrder: 100 })
  const [activeModuleId, setActiveModuleId] = useState(0)
  const [moduleFeatures, setModuleFeatures] = useState([])
  const [featureDraft, setFeatureDraft] = useState({ featureCode: '', featureName: '', status: 'active' })

  async function loadData(moduleCode = selectedModule) {
    setLoading(true)
    setError('')
    try {
      const [mods, matrix] = await Promise.all([
        fetchRbacModules(),
        fetchRbacMatrix(moduleCode),
      ])
      setModules(mods.items || [])
      setRoles(matrix.roles || [])
      setMatrixRows(matrix.items || [])
    } catch (e) {
      setError(e.message || 'Failed to load matrix')
    } finally {
      setLoading(false)
    }
  }

  const onCreateModule = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createRbacModule({
        moduleCode: moduleDraft.moduleCode,
        moduleName: moduleDraft.moduleName,
        status: moduleDraft.status,
        displayOrder: Number(moduleDraft.displayOrder) || 100,
      })
      setModuleDraft({ moduleCode: '', moduleName: '', status: 'active', displayOrder: 100 })
      await loadData(selectedModule)
    } catch (err) {
      setError(err.message || 'Failed to create module')
    }
  }

  const onToggleModuleStatus = async (module) => {
    setError('')
    try {
      await updateRbacModule(module.id, { status: module.status === 'active' ? 'inactive' : 'active' })
      await loadData(selectedModule)
    } catch (err) {
      setError(err.message || 'Failed to update module')
    }
  }

  const onCreateFeature = async (e) => {
    e.preventDefault()
    const moduleId = Number(activeModuleId)
    if (!moduleId) return
    setError('')
    try {
      await createRbacModuleFeature(moduleId, featureDraft)
      setFeatureDraft({ featureCode: '', featureName: '', status: 'active' })
      const res = await fetchRbacModuleFeatures(moduleId)
      setModuleFeatures(res.items || [])
    } catch (err) {
      setError(err.message || 'Failed to add feature')
    }
  }

  const onToggleFeatureStatus = async (feature) => {
    const moduleId = Number(activeModuleId)
    if (!moduleId) return
    setError('')
    try {
      await updateRbacModuleFeature(moduleId, feature.id, { status: feature.status === 'active' ? 'inactive' : 'active' })
      const res = await fetchRbacModuleFeatures(moduleId)
      setModuleFeatures(res.items || [])
    } catch (err) {
      setError(err.message || 'Failed to update feature')
    }
  }

  useEffect(() => {
    loadData('')
  }, [])

  useEffect(() => {
    const moduleId = Number(activeModuleId)
    if (!moduleId) {
      setModuleFeatures([])
      return
    }
    fetchRbacModuleFeatures(moduleId)
      .then((res) => setModuleFeatures(res.items || []))
      .catch((e) => setError(e.message || 'Failed to load module features'))
  }, [activeModuleId])

  const roleCodes = useMemo(() => roles.map((r) => r.role_code), [roles])

  const onToggle = async (roleId, roleCode, permissionCode, checked) => {
    setSavingRoleId(roleId)
    setError('')
    try {
      const current = await fetchRbacRolePermissions(roleId)
      const granted = (current.items || []).filter((p) => p.granted).map((p) => p.permission_code)
      const next = checked
        ? Array.from(new Set([...granted, permissionCode]))
        : granted.filter((code) => code !== permissionCode)
      await updateRbacRolePermissions(roleId, next)
      setMatrixRows((rows) =>
        rows.map((row) =>
          row.permissionCode === permissionCode
            ? { ...row, roles: { ...row.roles, [roleCode]: checked } }
            : row
        )
      )
    } catch (e) {
      setError(e.message || 'Failed to update role permissions')
    } finally {
      setSavingRoleId(0)
    }
  }

  return (
    <div className="animate-fade-up max-w-[100%]">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 max-w-5xl">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">RBAC permission matrix</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure action-level grants per role. Changes are persisted directly into the RBAC role-permission map.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
            value={selectedModule}
            onChange={(e) => {
              const value = e.target.value
              setSelectedModule(value)
              loadData(value)
            }}
          >
            <option value="">All modules</option>
            {modules.map((module) => (
              <option key={module.module_code} value={module.module_code}>{module.module_name}</option>
            ))}
          </select>
          <button type="button" onClick={() => loadData(selectedModule)} className="btn-secondary text-xs py-2">
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {loading && <div className="mb-3 text-sm text-slate-500">Loading permission matrix…</div>}

      <div className="card mb-4">
        <div className="text-sm font-bold text-slate-700 mb-3">RBAC Modules</div>
        <form className="grid md:grid-cols-5 gap-2 mb-3" onSubmit={onCreateModule}>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono"
            placeholder="Module code"
            value={moduleDraft.moduleCode}
            onChange={(e) => setModuleDraft((s) => ({ ...s, moduleCode: e.target.value.toUpperCase() }))}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
            placeholder="Module name"
            value={moduleDraft.moduleName}
            onChange={(e) => setModuleDraft((s) => ({ ...s, moduleName: e.target.value }))}
            required
          />
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
            value={moduleDraft.status}
            onChange={(e) => setModuleDraft((s) => ({ ...s, status: e.target.value }))}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
            type="number"
            value={moduleDraft.displayOrder}
            onChange={(e) => setModuleDraft((s) => ({ ...s, displayOrder: e.target.value }))}
          />
          <button type="submit" className="btn-secondary text-xs py-2">Add module</button>
        </form>
        <div className="flex flex-wrap gap-2">
          {modules.map((module) => (
            <button
              key={module.id}
              type="button"
              onClick={() => setActiveModuleId(module.id)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${Number(activeModuleId) === module.id ? 'border-[#006838] text-[#006838] bg-[#006838]/5' : 'border-slate-200 text-slate-600'}`}
            >
              {module.module_code}
            </button>
          ))}
        </div>
      </div>

      {!!activeModuleId && (
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-slate-700">Module features</div>
            {modules.filter((m) => m.id === Number(activeModuleId)).map((module) => (
              <button key={module.id} type="button" className="btn-secondary text-xs py-1.5" onClick={() => onToggleModuleStatus(module)}>
                Set module {module.status === 'active' ? 'inactive' : 'active'}
              </button>
            ))}
          </div>
          <form className="grid md:grid-cols-4 gap-2 mb-3" onSubmit={onCreateFeature}>
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono"
              placeholder="Feature code"
              value={featureDraft.featureCode}
              onChange={(e) => setFeatureDraft((s) => ({ ...s, featureCode: e.target.value.toUpperCase() }))}
              required
            />
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
              placeholder="Feature name"
              value={featureDraft.featureName}
              onChange={(e) => setFeatureDraft((s) => ({ ...s, featureName: e.target.value }))}
              required
            />
            <select
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
              value={featureDraft.status}
              onChange={(e) => setFeatureDraft((s) => ({ ...s, status: e.target.value }))}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button type="submit" className="btn-secondary text-xs py-2">Add feature</button>
          </form>
          <div className="space-y-2">
            {moduleFeatures.map((feature) => (
              <div key={feature.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <div>
                  <div className="text-xs font-semibold text-slate-700">{feature.feature_name}</div>
                  <div className="text-[10px] font-mono text-slate-500">{feature.feature_code}</div>
                </div>
                <button type="button" className="btn-secondary text-xs py-1.5" onClick={() => onToggleFeatureStatus(feature)}>
                  Set {feature.status === 'active' ? 'inactive' : 'active'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-0 overflow-x-auto border-slate-200">
        <table className="w-full text-xs min-w-[720px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left p-3 font-bold text-slate-600 sticky left-0 bg-slate-50 z-10 min-w-[210px]">Permission</th>
              {roles.map((role) => (
                <th key={role.id} className="text-center p-2 font-bold text-slate-600 min-w-[120px]">
                  {role.role_code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixRows.map((row) => (
              <tr key={row.permissionCode} className="border-b border-slate-100 hover:bg-slate-50/80">
                <td className="p-3 font-semibold text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-100">
                  {row.permissionCode}
                  <span className="block text-[10px] text-slate-400 font-normal font-mono">
                    {row.moduleCode} / {row.featureCode} / {row.actionCode}
                  </span>
                </td>
                {roleCodes.map((roleCode) => {
                  const role = roles.find((r) => r.role_code === roleCode)
                  const checked = !!row.roles?.[roleCode]
                  return (
                    <td key={roleCode} className="p-1.5 text-center">
                      <label className="inline-flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!role || savingRoleId === role.id}
                          onChange={(e) => onToggle(role.id, roleCode, row.permissionCode, e.target.checked)}
                          className="h-4 w-4 accent-[#006838]"
                        />
                      </label>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
