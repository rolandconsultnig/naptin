import { useEffect, useState } from 'react'
import { useBrandCompliance } from '../admin/brand/hooks/useBrandCompliance'

const DEFAULT_SCAN = {
  assetRefType: 'facebook_ad_image',
  assetRefId: '',
  fileUri: '',
}

const DEFAULT_BATCH = {
  campaignRef: '',
  rawItems: 'facebook_ad_image,101\nlinkedin_banner,102\npresentation_slide,103',
}

export default function AdminBrandCompliancePage() {
  const {
    result,
    batchResult,
    isRunning,
    isRunningBatch,
    error,
    batchError,
    runScan,
    runBatch,
    clearResult,
    clearBatchResult,
  } = useBrandCompliance()
  const [form, setForm] = useState(DEFAULT_SCAN)
  const [batchForm, setBatchForm] = useState(DEFAULT_BATCH)
  const [submitError, setSubmitError] = useState('')
  const [batchSubmitError, setBatchSubmitError] = useState('')
  const [rejectionNotes, setRejectionNotes] = useState('')
  const [notesToast, setNotesToast] = useState('')

  useEffect(() => {
    if (!notesToast) return undefined
    const timeoutId = window.setTimeout(() => setNotesToast(''), 2200)
    return () => window.clearTimeout(timeoutId)
  }, [notesToast])

  const onRunScan = async (event) => {
    event.preventDefault()
    setSubmitError('')

    const payload = {
      assetRefType: form.assetRefType,
      ...(form.assetRefId ? { assetRefId: Number(form.assetRefId) } : {}),
      ...(form.fileUri ? { fileUri: form.fileUri } : {}),
    }

    try {
      await runScan(payload)
    } catch (err) {
      setSubmitError(err?.message || 'Scan failed')
    }
  }

  const parseBatchItems = (rawItems) => {
    return rawItems
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [typeRaw, idRaw] = line.split(',').map((part) => part?.trim())
        const item = { assetRefType: typeRaw || 'social_post' }
        if (idRaw && !Number.isNaN(Number(idRaw))) item.assetRefId = Number(idRaw)
        return item
      })
  }

  const parseBatchCsvText = (rawCsv) => {
    const rows = rawCsv
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    if (!rows.length) return []

    const first = rows[0].toLowerCase()
    const hasHeader = first.includes('assetreftype') || first.includes('asset_ref_type')
    const dataRows = hasHeader ? rows.slice(1) : rows

    return dataRows
      .map((line) => line.split(',').map((part) => part.trim()))
      .filter((parts) => parts[0])
      .map((parts) => {
        const [typeRaw, idRaw] = parts
        const item = { assetRefType: typeRaw }
        if (idRaw && !Number.isNaN(Number(idRaw))) item.assetRefId = Number(idRaw)
        return item
      })
  }

  const handleBatchFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const items = parseBatchCsvText(text)
    if (!items.length) {
      setBatchSubmitError('CSV upload parsed no valid rows. Use columns: assetRefType,assetRefId')
      return
    }

    setBatchSubmitError('')
    setBatchForm((prev) => ({
      ...prev,
      rawItems: items
        .map((item) => `${item.assetRefType}${item.assetRefId ? `,${item.assetRefId}` : ''}`)
        .join('\n'),
    }))
  }

  const prepareFailedItemRejectionNotes = () => {
    const failedRows = batchRows.filter((item) => (item.status || '').toLowerCase() === 'fail')
    if (!failedRows.length) {
      setRejectionNotes('No failed items available for rejection notes.')
      setNotesToast('')
      return
    }

    const notes = [
      `Batch compliance review (${batchForm.campaignRef || 'campaign'})`,
      `Failed items: ${failedRows.length}`,
      '',
      ...failedRows.map((item, index) => {
        const idLabel = item.assetRefId || item.asset_ref_id || `row-${index + 1}`
        const typeLabel = item.assetRefType || item.asset_ref_type || 'asset'
        const reason = item.reason || item.message || 'Compliance threshold not met'
        return `- ${typeLabel} (${idLabel}): ${reason}`
      }),
      '',
      'Action required: revise and resubmit failed items for brand approval.',
    ].join('\n')

    setRejectionNotes(notes)
    setNotesToast('')
  }

  const onCopyRejectionNotes = async () => {
    if (!rejectionNotes.trim()) {
      setNotesToast('No notes available to copy yet.')
      return
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(rejectionNotes)
      } else {
        throw new Error('Clipboard API unavailable')
      }
      setNotesToast('Rejection notes copied to clipboard.')
    } catch {
      setNotesToast('Unable to copy notes. Copy manually from the text area.')
    }
  }

  const onDownloadRejectionNotes = () => {
    if (!rejectionNotes.trim()) {
      setNotesToast('No notes available to download yet.')
      return
    }

    const generatedAt = new Date()
    const generatedAtLocal = generatedAt.toLocaleString()
    const generatedAtIso = generatedAt.toISOString()
    const downloadBody = [
      'Brand Compliance Rejection Notes',
      `Campaign: ${batchForm.campaignRef || 'campaign'}`,
      `Generated: ${generatedAtLocal}`,
      `Generated (ISO): ${generatedAtIso}`,
      '',
      rejectionNotes,
      '',
    ].join('\n')

    const campaignLabel = (batchForm.campaignRef || 'campaign').replace(/[^a-z0-9-_]+/gi, '_').toLowerCase()
    const blob = new Blob([downloadBody], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${campaignLabel}-rejection-notes.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    setNotesToast('Rejection notes downloaded as .txt.')
  }

  const onClearRejectionNotes = () => {
    setRejectionNotes('')
    setNotesToast('Rejection notes cleared.')
  }

  const onRunBatch = async (event) => {
    event.preventDefault()
    setBatchSubmitError('')

    const items = parseBatchItems(batchForm.rawItems)
    if (!items.length) {
      setBatchSubmitError('Add at least one batch item before running the check.')
      return
    }

    const payload = {
      campaignRef: batchForm.campaignRef || `campaign-${Date.now()}`,
      items,
    }

    try {
      await runBatch(payload)
    } catch (err) {
      setBatchSubmitError(err?.message || 'Batch check failed')
    }
  }

  const violations = Array.isArray(result?.violations) ? result.violations : []
  const batchRows = Array.isArray(batchResult?.items) ? batchResult.items : []
  const fallbackTotal = typeof batchResult?.totalItems === 'number' ? batchResult.totalItems : batchRows.length
  const passCount = typeof batchResult?.passCount === 'number'
    ? batchResult.passCount
    : batchRows.filter((item) => (item.status || '').toLowerCase() === 'pass').length
  const failCount = typeof batchResult?.failCount === 'number'
    ? batchResult.failCount
    : Math.max(fallbackTotal - passCount, 0)

  return (
    <div className="animate-fade-up max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Brand Compliance Checker</h1>
        <p className="text-sm text-slate-500 mt-1">Run automated checks for logo placement, brand colors, font usage, legal disclaimers, and tagline freshness.</p>
      </div>

      <form className="card mb-6" onSubmit={onRunScan}>
        <p className="text-sm font-bold text-slate-800 mb-3">Single asset scan</p>

        {(error || submitError) && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            {submitError || error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            className="select"
            value={form.assetRefType}
            onChange={(e) => setForm((prev) => ({ ...prev, assetRefType: e.target.value }))}
          >
            <option value="facebook_ad_image">Facebook ad image</option>
            <option value="linkedin_banner">LinkedIn banner</option>
            <option value="presentation_slide">Presentation slide</option>
            <option value="email_header">Email header</option>
            <option value="social_post">Social post</option>
          </select>
          <input
            className="input"
            type="number"
            min="1"
            placeholder="Asset reference ID (optional)"
            value={form.assetRefId}
            onChange={(e) => setForm((prev) => ({ ...prev, assetRefId: e.target.value }))}
          />
          <input
            className="input"
            placeholder="File URI (optional)"
            value={form.fileUri}
            onChange={(e) => setForm((prev) => ({ ...prev, fileUri: e.target.value }))}
          />
        </div>

        <div className="mt-4 flex gap-2">
          <button type="submit" className="btn btn-primary text-xs" disabled={isRunning}>
            {isRunning ? 'Running scan...' : 'Run scan'}
          </button>
          <button type="button" className="btn btn-secondary text-xs" onClick={clearResult} disabled={isRunning}>
            Clear result
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-2">Compliance score</p>
          <p className="text-3xl font-extrabold text-slate-900">{result?.score ?? '—'}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-2">Scan status</p>
          <p className="text-base font-bold text-slate-800">{result?.status || 'No scan yet'}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-2">Violations</p>
          <p className="text-3xl font-extrabold text-slate-900">{violations.length}</p>
        </div>
      </div>

      <div className="card mb-6">
        <p className="text-sm font-bold text-slate-800 mb-3">Violation details</p>
        {violations.length === 0 && <p className="text-sm text-slate-500">No violations to display. Run a scan to see detailed findings.</p>}
        <ul className="space-y-3">
          {violations.map((violation, index) => (
            <li key={violation.id || `${violation.ruleCode || 'rule'}-${index}`} className="rounded-lg border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-800">{violation.ruleCode || violation.rule_code || 'Rule'}</p>
              <p className="text-sm text-slate-600 mt-1">{violation.message || 'Violation detected'}</p>
              {violation.suggestion && <p className="text-xs text-[#006838] mt-2">Suggestion: {violation.suggestion}</p>}
            </li>
          ))}
        </ul>
      </div>

      <div className="card mb-6">
        <p className="text-sm font-bold text-slate-800 mb-3">Batch campaign check</p>

        {(batchError || batchSubmitError) && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            {batchSubmitError || batchError}
          </p>
        )}

        <form onSubmit={onRunBatch} className="space-y-3">
          <input
            className="input"
            placeholder="Campaign reference (e.g. Q4-LAUNCH-2026)"
            value={batchForm.campaignRef}
            onChange={(e) => setBatchForm((prev) => ({ ...prev, campaignRef: e.target.value }))}
          />
          <div>
            <label className="text-[11px] text-slate-500 font-semibold block mb-1">Upload CSV</label>
            <input
              type="file"
              accept=".csv,text/csv"
              className="input"
              onChange={handleBatchFileUpload}
            />
          </div>
          <textarea
            className="input min-h-[110px]"
            value={batchForm.rawItems}
            onChange={(e) => setBatchForm((prev) => ({ ...prev, rawItems: e.target.value }))}
            placeholder="One item per line: assetRefType,assetRefId"
          />
          <p className="text-[11px] text-slate-500">Format: one line per item, example: <span className="font-mono">facebook_ad_image,101</span></p>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary text-xs" disabled={isRunningBatch}>
              {isRunningBatch ? 'Running batch...' : 'Run batch check'}
            </button>
            <button
              type="button"
              className="btn btn-secondary text-xs"
              onClick={clearBatchResult}
              disabled={isRunningBatch}
            >
              Clear batch result
            </button>
            <button
              type="button"
              className="btn btn-secondary text-xs"
              onClick={prepareFailedItemRejectionNotes}
              disabled={isRunningBatch || !batchResult}
            >
              Reject failed items
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-2">Batch total</p>
          <p className="text-3xl font-extrabold text-slate-900">{batchResult ? fallbackTotal : '—'}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-2">Pass</p>
          <p className="text-3xl font-extrabold text-emerald-700">{batchResult ? passCount : '—'}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-2">Fail</p>
          <p className="text-3xl font-extrabold text-red-700">{batchResult ? failCount : '—'}</p>
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="table-th text-left">Item</th>
              <th className="table-th text-left">Type</th>
              <th className="table-th text-left">Status</th>
              <th className="table-th text-left">Reason</th>
            </tr>
          </thead>
          <tbody>
            {!batchResult && (
              <tr>
                <td className="table-td text-slate-500" colSpan={4}>No batch run yet.</td>
              </tr>
            )}
            {batchResult && batchRows.length === 0 && (
              <tr>
                <td className="table-td text-slate-500" colSpan={4}>Batch response did not include per-item rows.</td>
              </tr>
            )}
            {batchRows.map((item, index) => {
              const status = (item.status || '').toLowerCase()
              const statusLabel = status || 'unknown'
              const statusClass = status === 'pass' ? 'text-emerald-700' : status === 'fail' ? 'text-red-700' : 'text-slate-600'
              return (
                <tr key={item.id || `${item.assetRefType || 'item'}-${index}`} className="border-b border-slate-50 last:border-0">
                  <td className="table-td font-semibold text-slate-800">{item.assetRefId || item.asset_ref_id || `#${index + 1}`}</td>
                  <td className="table-td text-slate-600">{item.assetRefType || item.asset_ref_type || '—'}</td>
                  <td className={`table-td font-semibold ${statusClass}`}>{statusLabel}</td>
                  <td className="table-td text-slate-600">{item.reason || item.message || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card mt-6">
        <p className="text-sm font-bold text-slate-800 mb-2">Prefilled rejection notes</p>
        <p className="text-xs text-slate-500 mb-2">Generated from failed items for quick paste into approval comments.</p>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            className="btn btn-secondary text-xs"
            onClick={onCopyRejectionNotes}
            disabled={!rejectionNotes.trim()}
          >
            Copy notes
          </button>
          <button
            type="button"
            className="btn btn-secondary text-xs"
            onClick={onDownloadRejectionNotes}
            disabled={!rejectionNotes.trim()}
          >
            Download rejection notes (.txt)
          </button>
          <button
            type="button"
            className="btn btn-secondary text-xs"
            onClick={onClearRejectionNotes}
            disabled={!rejectionNotes.trim()}
          >
            Clear notes
          </button>
        </div>
        <textarea
          className="input min-h-[120px]"
          value={rejectionNotes}
          onChange={(e) => setRejectionNotes(e.target.value)}
          placeholder="Click 'Reject failed items' to generate notes."
        />
      </div>
      {notesToast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg">
          {notesToast}
        </div>
      )}
    </div>
  )
}
