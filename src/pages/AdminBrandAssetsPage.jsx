import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBrandAssets } from '../admin/brand/hooks/useBrandAssets'

const DEFAULT_FORM = {
  title: '',
  assetType: 'template',
  watermarkMode: 'none',
}

export default function AdminBrandAssetsPage() {
  const { items, isLoading, error, reload, applyFilters, createAsset } = useBrandAssets()
  const [assetTypeFilter, setAssetTypeFilter] = useState('')
  const [form, setForm] = useState(DEFAULT_FORM)
  const [submitError, setSubmitError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const onFilter = () => {
    applyFilters(assetTypeFilter ? { type: assetTypeFilter } : {})
  }

  const onCreate = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setIsSaving(true)
    try {
      await createAsset(form)
      setForm(DEFAULT_FORM)
    } catch (err) {
      setSubmitError(err?.message || 'Unable to create asset')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="animate-fade-up max-w-6xl">
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Brand Asset Repository</h1>
          <p className="text-sm text-slate-500 mt-1">Manage approved brand assets, versions, and access with one source of truth.</p>
        </div>
        <Link to="/admin/brand/approvals" className="btn btn-secondary text-xs">Open approvals inbox</Link>
      </div>

      <div className="card mb-6">
        <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest mb-3">Filters</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={assetTypeFilter}
            onChange={(e) => setAssetTypeFilter(e.target.value)}
            className="select w-full sm:w-56"
          >
            <option value="">All asset types</option>
            <option value="logo">Logo</option>
            <option value="template">Template</option>
            <option value="photography">Photography</option>
            <option value="video">Video</option>
            <option value="font">Font</option>
            <option value="guideline">Guideline</option>
          </select>
          <button type="button" onClick={onFilter} className="btn btn-secondary text-xs">Apply</button>
          <button type="button" onClick={reload} className="btn btn-secondary text-xs">Refresh</button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="card mb-6 overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="table-th text-left">Title</th>
              <th className="table-th text-left">Type</th>
              <th className="table-th text-left">Status</th>
              <th className="table-th text-left">Watermark</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && items.length === 0 && (
              <tr>
                <td className="table-td text-slate-500" colSpan={4}>No assets yet or backend endpoint is not populated.</td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td className="table-td text-slate-500" colSpan={4}>Loading assets...</td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id || item.title} className="border-b border-slate-50 last:border-0">
                <td className="table-td font-semibold text-slate-800">{item.title || 'Untitled asset'}</td>
                <td className="table-td text-slate-600">{item.assetType || item.asset_type || '—'}</td>
                <td className="table-td text-slate-600">{item.status || 'draft'}</td>
                <td className="table-td text-slate-600">{item.watermarkMode || item.watermark_mode || 'none'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="card" onSubmit={onCreate}>
        <p className="text-sm font-bold text-slate-800 mb-3">Quick create asset</p>
        {submitError && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{submitError}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="input"
            placeholder="Asset title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
          <select
            className="select"
            value={form.assetType}
            onChange={(e) => setForm((prev) => ({ ...prev, assetType: e.target.value }))}
          >
            <option value="logo">Logo</option>
            <option value="template">Template</option>
            <option value="photography">Photography</option>
            <option value="video">Video</option>
            <option value="font">Font</option>
            <option value="guideline">Guideline</option>
          </select>
          <select
            className="select"
            value={form.watermarkMode}
            onChange={(e) => setForm((prev) => ({ ...prev, watermarkMode: e.target.value }))}
          >
            <option value="none">No watermark</option>
            <option value="draft">Draft</option>
            <option value="internal_only">Internal only</option>
          </select>
        </div>
        <div className="mt-4">
          <button type="submit" className="btn btn-primary text-xs" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Create asset'}
          </button>
        </div>
      </form>
    </div>
  )
}
