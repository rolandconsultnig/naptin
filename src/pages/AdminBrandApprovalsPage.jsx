import { useState } from 'react'
import { useBrandApprovals } from '../admin/brand/hooks/useBrandApprovals'

export default function AdminBrandApprovalsPage() {
  const { items, isLoading, isDeciding, error, applyFilters, reload, decide } = useBrandApprovals()
  const [entityType, setEntityType] = useState('')
  const [decisionError, setDecisionError] = useState('')

  const onApplyFilter = () => {
    applyFilters(entityType ? { entity_type: entityType } : {})
  }

  const onDecision = async (item, action) => {
    setDecisionError('')
    try {
      await decide(item.id, action, `${action} via admin approvals inbox`)
    } catch (err) {
      setDecisionError(err?.message || 'Unable to save decision')
    }
  }

  return (
    <div className="animate-fade-up max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Brand Approvals Inbox</h1>
        <p className="text-sm text-slate-500 mt-1">Central queue for approvals across assets, naming, compliance escalations, and crisis messaging.</p>
      </div>

      <div className="card mb-6">
        <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest mb-3">Filters</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={entityType} onChange={(e) => setEntityType(e.target.value)} className="select w-full sm:w-56">
            <option value="">All entity types</option>
            <option value="brand_asset">Asset</option>
            <option value="product_name_request">Naming request</option>
            <option value="compliance_scan">Compliance escalation</option>
            <option value="crisis_message">Crisis message</option>
          </select>
          <button type="button" onClick={onApplyFilter} className="btn btn-secondary text-xs">Apply</button>
          <button type="button" onClick={reload} className="btn btn-secondary text-xs">Refresh</button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">{error}</p>
      )}
      {decisionError && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{decisionError}</p>
      )}

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="table-th text-left">Entity</th>
              <th className="table-th text-left">Type</th>
              <th className="table-th text-left">Status</th>
              <th className="table-th text-left">Due</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="table-td text-slate-500">Loading approvals...</td>
              </tr>
            )}
            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="table-td text-slate-500">No pending approvals or backend endpoint is not populated.</td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-50 last:border-0">
                <td className="table-td font-semibold text-slate-800">{item.entity_label || item.entity_name || `#${item.entity_id || item.id}`}</td>
                <td className="table-td text-slate-600">{item.entity_type || '—'}</td>
                <td className="table-td text-slate-600">{item.status || 'submitted'}</td>
                <td className="table-td text-slate-600">{item.due_at ? new Date(item.due_at).toLocaleString() : '—'}</td>
                <td className="table-td text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary text-[11px]"
                      onClick={() => onDecision(item, 'request_changes')}
                      disabled={isDeciding}
                    >
                      Changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary text-[11px]"
                      onClick={() => onDecision(item, 'reject')}
                      disabled={isDeciding}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary text-[11px]"
                      onClick={() => onDecision(item, 'approve')}
                      disabled={isDeciding}
                    >
                      Approve
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
