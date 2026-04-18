import { useMemo, useState } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import { AlertTriangle, CheckCircle2, FileText, Link2, Plus, RefreshCw, Shield } from 'lucide-react'
import useFetch from '../hooks/useFetch'
import useMutation from '../hooks/useMutation'
import { internalAuditApi } from '../services/internalAuditService'

const IA_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'engagements', label: 'Engagements' },
  { id: 'findings', label: 'Findings' },
  { id: 'remediation', label: 'Remediation' },
  { id: 'links', label: 'Cross-Module Links' },
]

const RISK_BADGE = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-blue-50 text-blue-700 border-blue-200',
  high: 'bg-amber-50 text-amber-700 border-amber-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
}

function Pill({ children, cls }) {
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{children}</span>
}

function currency(n) {
  return `₦${Number(n || 0).toLocaleString()}`
}

function asArray(v) {
  return Array.isArray(v) ? v : []
}

function DashboardTab() {
  const { data, loading, refetch } = useFetch(() => internalAuditApi.getDashboard(), [])
  const totals = data?.totals || {}
  const modules = asArray(data?.modules)
  const overdue = asArray(data?.overdueFindings)
  const signals = data?.crossModuleSignals || {}

  if (loading) return <div className="card text-sm text-slate-500">Loading internal audit dashboard…</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Independent assurance over risk management, governance, and controls.</p>
        <button type="button" onClick={refetch} className="text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 flex items-center gap-1">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Findings', value: totals.findings_total || 0, color: 'text-slate-800' },
          { label: 'Open Findings', value: totals.findings_open || 0, color: 'text-amber-700' },
          { label: 'Resolved Findings', value: totals.findings_resolved || 0, color: 'text-[#006838]' },
          { label: 'High/Critical Open', value: totals.findings_high_open || 0, color: 'text-red-700' },
        ].map((kpi) => (
          <div key={kpi.label} className="card py-3 text-center">
            <div className={`text-xl font-extrabold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Risk by Source Module</p>
          <div className="space-y-2">
            {modules.map((m) => (
              <div key={m.module} className="border border-slate-100 rounded-xl px-3 py-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 capitalize">{m.module}</span>
                  <span className="text-slate-400">{m.department}</span>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Pill cls="bg-slate-50 text-slate-700 border-slate-200">{m.findingCount} findings</Pill>
                  <Pill cls="bg-amber-50 text-amber-700 border-amber-200">{m.openCount} open</Pill>
                  <Pill cls="bg-red-50 text-red-700 border-red-200">{m.highRiskCount} high risk</Pill>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Overdue Remediation</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {overdue.length === 0 && <p className="text-xs text-slate-400">No overdue findings.</p>}
            {overdue.map((f) => (
              <div key={f.findingRef} className="border border-red-100 bg-red-50/40 rounded-xl px-3 py-2">
                <div className="text-xs font-bold text-red-700">{f.findingRef}</div>
                <div className="text-sm font-semibold text-slate-800">{f.title}</div>
                <div className="text-[11px] text-slate-500">{f.sourceModule} · Owner: {f.ownerName || 'Unassigned'} · Due: {f.dueDate || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card">
          <p className="text-xs text-slate-400 mb-1">Accounts Signals</p>
          <p className="text-sm font-semibold text-slate-800">Pending AP invoices: {signals.accounts?.pendingApInvoices || 0}</p>
          <p className="text-sm font-semibold text-slate-800">Draft journals: {signals.accounts?.draftJournals || 0}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-400 mb-1">Procurement Signals</p>
          <p className="text-sm font-semibold text-slate-800">Draft POs: {signals.procurement?.poDraft || 0}</p>
          <p className="text-sm font-semibold text-slate-800">Approved POs: {signals.procurement?.poApproved || 0}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-400 mb-1">Store Signals</p>
          <p className="text-sm font-semibold text-slate-800">GRNs captured: {signals.store?.grnCount || 0}</p>
          <p className="text-sm font-semibold text-slate-800">PO items pending receipt: {signals.store?.poItemsPendingReceipt || 0}</p>
        </div>
      </div>
    </div>
  )
}

function EngagementsTab() {
  const { data, loading, refetch } = useFetch(() => internalAuditApi.getEngagements(), [])
  const engagements = asArray(data)
  const [form, setForm] = useState({ title: '', fiscalYear: new Date().getFullYear(), departmentCode: 'FIN', processArea: 'Accounts Payable', leadAuditor: 'Internal Audit Team' })

  const { run: createEngagement, loading: creating } = useMutation((payload) => internalAuditApi.createEngagement(payload), {
    successMsg: 'Audit engagement created',
    onSuccess: () => {
      setForm({ title: '', fiscalYear: new Date().getFullYear(), departmentCode: 'FIN', processArea: 'Accounts Payable', leadAuditor: 'Internal Audit Team' })
      refetch()
    },
  })

  if (loading) return <div className="card text-sm text-slate-500">Loading engagements…</div>

  return (
    <div className="space-y-4">
      <div className="card grid grid-cols-1 md:grid-cols-5 gap-2">
        <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Engagement title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" type="number" value={form.fiscalYear} onChange={(e) => setForm((f) => ({ ...f, fiscalYear: Number(e.target.value || new Date().getFullYear()) }))} />
        <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Department code" value={form.departmentCode} onChange={(e) => setForm((f) => ({ ...f, departmentCode: e.target.value }))} />
        <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Process area" value={form.processArea} onChange={(e) => setForm((f) => ({ ...f, processArea: e.target.value }))} />
        <button type="button" disabled={!form.title || creating} onClick={() => createEngagement(form)} className="btn-primary justify-center">
          <Plus size={13} /> {creating ? 'Saving…' : 'Add Engagement'}
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {['Ref', 'Title', 'Dept', 'Process', 'Status', 'Findings', 'Lead Auditor'].map((h) => <th key={h} className="table-th text-left">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {engagements.map((e) => (
              <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/70">
                <td className="table-td font-mono text-xs">{e.engagementRef}</td>
                <td className="table-td font-semibold text-slate-800">{e.title}</td>
                <td className="table-td">{e.departmentCode}</td>
                <td className="table-td">{e.processArea}</td>
                <td className="table-td"><Pill cls="bg-slate-50 text-slate-700 border-slate-200">{e.status}</Pill></td>
                <td className="table-td text-slate-600">{e.findingsCount} total · {e.openFindings} open</td>
                <td className="table-td">{e.leadAuditor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FindingsTab() {
  const [filter, setFilter] = useState({ status: 'all', module: 'all', risk: 'all' })
  const { data, loading, refetch } = useFetch(() => internalAuditApi.getFindings(filter), [filter.status, filter.module, filter.risk])
  const findings = asArray(data)
  const [form, setForm] = useState({
    title: '',
    sourceModule: 'accounts',
    departmentCode: 'FIN',
    condition: '',
    recommendation: '',
    riskRating: 'medium',
  })

  const { run: createFinding, loading: creating } = useMutation((payload) => internalAuditApi.createFinding(payload), {
    successMsg: 'Audit finding logged',
    onSuccess: () => {
      setForm({ title: '', sourceModule: 'accounts', departmentCode: 'FIN', condition: '', recommendation: '', riskRating: 'medium' })
      refetch()
    },
  })

  if (loading) return <div className="card text-sm text-slate-500">Loading findings…</div>

  return (
    <div className="space-y-4">
      <div className="card grid grid-cols-1 md:grid-cols-3 gap-2">
        <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm" value={filter.status} onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}>
          {['all', 'open', 'in_progress', 'resolved', 'closed', 'accepted_risk'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm" value={filter.module} onChange={(e) => setFilter((f) => ({ ...f, module: e.target.value }))}>
          {['all', 'accounts', 'procurement', 'store', 'hr', 'ict', 'governance'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm" value={filter.risk} onChange={(e) => setFilter((f) => ({ ...f, risk: e.target.value }))}>
          {['all', 'low', 'medium', 'high', 'critical'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card grid grid-cols-1 md:grid-cols-6 gap-2">
        <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm md:col-span-2" placeholder="Finding title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm" value={form.sourceModule} onChange={(e) => setForm((f) => ({ ...f, sourceModule: e.target.value }))}>
          {['accounts', 'procurement', 'store', 'hr', 'ict', 'governance'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Dept code" value={form.departmentCode} onChange={(e) => setForm((f) => ({ ...f, departmentCode: e.target.value }))} />
        <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm" value={form.riskRating} onChange={(e) => setForm((f) => ({ ...f, riskRating: e.target.value }))}>
          {['low', 'medium', 'high', 'critical'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <button type="button" disabled={!form.title || !form.condition || !form.recommendation || creating} onClick={() => createFinding(form)} className="btn-primary justify-center">
          <Plus size={13} /> {creating ? 'Saving…' : 'Log Finding'}
        </button>
        <textarea className="border border-slate-200 rounded-xl px-3 py-2 text-sm md:col-span-3" rows={2} placeholder="Condition (what was observed)" value={form.condition} onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))} />
        <textarea className="border border-slate-200 rounded-xl px-3 py-2 text-sm md:col-span-3" rows={2} placeholder="Recommendation" value={form.recommendation} onChange={(e) => setForm((f) => ({ ...f, recommendation: e.target.value }))} />
      </div>

      <div className="space-y-2">
        {findings.map((f) => (
          <div key={f.id} className="card">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-[10px] text-slate-400">{f.findingRef}</span>
              <Pill cls={RISK_BADGE[f.riskRating] || RISK_BADGE.medium}>{f.riskRating}</Pill>
              <Pill cls="bg-slate-50 text-slate-700 border-slate-200">{f.status}</Pill>
              <Pill cls="bg-blue-50 text-blue-700 border-blue-200">{f.sourceModule}</Pill>
            </div>
            <div className="text-sm font-bold text-slate-800">{f.title}</div>
            <p className="text-xs text-slate-500 mt-1">{f.condition}</p>
            <p className="text-xs text-slate-700 mt-2"><strong>Recommendation:</strong> {f.recommendation}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function RemediationTab() {
  const { data: findingsData, loading, refetch } = useFetch(() => internalAuditApi.getFindings({ status: 'all' }), [])
  const findings = asArray(findingsData)
  const openRemediation = useMemo(() => findings.filter((f) => ['open', 'in_progress', 'resolved'].includes(f.status)), [findings])
  const [selectedId, setSelectedId] = useState(null)
  const [note, setNote] = useState('')
  const [actionType, setActionType] = useState('remediation')

  const { data: actionsData } = useFetch(
    () => (selectedId ? internalAuditApi.getFindingActions(selectedId) : Promise.resolve([])),
    [selectedId]
  )
  const actions = asArray(actionsData)

  const { run: addAction, loading: adding } = useMutation((payload) => internalAuditApi.addFindingAction(selectedId, payload), {
    successMsg: 'Remediation update logged',
    onSuccess: () => {
      setNote('')
      refetch()
    },
  })

  if (loading) return <div className="card text-sm text-slate-500">Loading remediation tracker…</div>

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-2">
        {openRemediation.map((f) => (
          <button key={f.id} onClick={() => setSelectedId(f.id)} className={`card w-full text-left transition-colors ${selectedId === f.id ? 'ring-2 ring-[#006838]/20 border-[#006838]/30' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">{f.findingRef}</span>
              <Pill cls={RISK_BADGE[f.riskRating] || RISK_BADGE.medium}>{f.riskRating}</Pill>
            </div>
            <p className="text-sm font-semibold text-slate-800 mt-1">{f.title}</p>
            <p className="text-xs text-slate-500 mt-1">Owner: {f.ownerName || 'Unassigned'} · Due: {f.dueDate || 'Not set'}</p>
          </button>
        ))}
      </div>

      <div className="card space-y-3">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Action Workpaper</p>
        {!selectedId && <p className="text-sm text-slate-400">Select a finding to log remediation updates.</p>}
        {selectedId && (
          <>
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" value={actionType} onChange={(e) => setActionType(e.target.value)}>
              {['update', 'remediation', 'evidence', 'closure', 'reopen'].map((a) => <option key={a}>{a}</option>)}
            </select>
            <textarea rows={4} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Action note / evidence summary" value={note} onChange={(e) => setNote(e.target.value)} />
            <button type="button" disabled={!note || adding} onClick={() => addAction({ actionNote: note, actionType, actorName: 'Internal Audit Officer', actorDepartment: 'Internal Audit' })} className="btn-primary w-full justify-center">
              <FileText size={14} /> {adding ? 'Saving…' : 'Record Action'}
            </button>
            <div className="border-t border-slate-100 pt-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Recent Actions</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {actions.map((a) => (
                  <div key={a.id} className="rounded-xl border border-slate-100 px-2.5 py-2">
                    <p className="text-xs font-semibold text-slate-700">{a.actionType} · {a.actorName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{a.actionNote}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function CrossModuleTab() {
  const [module, setModule] = useState('accounts')
  const { data: rowsData, loading, refetch } = useFetch(() => internalAuditApi.getCrossModuleExceptions(module, { limit: 20 }), [module])
  const { data: matrixData } = useFetch(() => internalAuditApi.getCollaborationMatrix(), [])
  const rows = asArray(rowsData)
  const matrix = asArray(matrixData)

  return (
    <div className="space-y-4">
      <div className="card">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Department Collaboration Matrix</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {matrix.map((m) => (
            <div key={m.sourceModule} className="border border-slate-100 rounded-xl p-3">
              <p className="text-sm font-bold text-slate-800 capitalize mb-1">{m.sourceModule}</p>
              <p className="text-[11px] text-slate-500 mb-2">Departments: {m.collaboratingDepartments.join(', ')}</p>
              <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                {m.controls.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            {['accounts', 'procurement', 'store'].map((m) => (
              <button key={m} type="button" onClick={() => setModule(m)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${module === m ? 'bg-[#006838] text-white border-[#006838]' : 'bg-white text-slate-600 border-slate-200'}`}>
                {m}
              </button>
            ))}
          </div>
          <button type="button" onClick={refetch} className="text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 flex items-center gap-1"><RefreshCw size={12} /> Refresh feed</button>
        </div>

        <div className="mt-3 overflow-x-auto">
          {loading && <p className="text-sm text-slate-500">Loading exception feed…</p>}
          {!loading && (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-th text-left">Reference</th>
                  <th className="table-th text-left">Status</th>
                  <th className="table-th text-left">Details</th>
                  <th className="table-th text-left">Observed At</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={`${r.ref}-${idx}`} className="border-b border-slate-50">
                    <td className="table-td font-mono text-xs">{r.ref}</td>
                    <td className="table-td">{r.status || r.poStatus || 'recorded'}</td>
                    <td className="table-td text-slate-600">{r.vendor || r.departmentCode || r.receiver || r.linkedPo || currency(r.amount)}</td>
                    <td className="table-td">{r.observedAt || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DocumentCenterPage() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div className="animate-fade-up space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Internal Audit & Assurance</h1>
            <p className="text-sm text-slate-400">Risk-based internal audit workflows linked to Accounts, Procurement, Store, and collaborating departments.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-[#006838]/10 text-[#006838] font-semibold border border-[#006838]/20 flex items-center gap-1"><Shield size={12} /> Controls Monitoring</span>
          <span className="text-xs px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-semibold border border-blue-200 flex items-center gap-1"><Link2 size={12} /> Cross-Module Linked</span>
        </div>
      </div>

      <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1 overflow-x-auto max-w-full scrollbar-thin">
        {IA_TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap ${tab === t.id ? 'bg-[#006838] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <DashboardTab />}
      {tab === 'engagements' && <EngagementsTab />}
      {tab === 'findings' && <FindingsTab />}
      {tab === 'remediation' && <RemediationTab />}
      {tab === 'links' && <CrossModuleTab />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card text-sm">
          <p className="font-semibold text-slate-800 flex items-center gap-2"><AlertTriangle size={14} className="text-amber-600" /> Fraud Detection & Prevention</p>
          <p className="text-xs text-slate-500 mt-1">Track anomaly signals from high-value AP invoices, unusual procurement drafts, and delayed store receipts.</p>
        </div>
        <div className="card text-sm">
          <p className="font-semibold text-slate-800 flex items-center gap-2"><CheckCircle2 size={14} className="text-[#006838]" /> Compliance Assurance</p>
          <p className="text-xs text-slate-500 mt-1">Capture evidence-backed findings and follow closure dates to ensure policy and regulatory compliance.</p>
        </div>
        <div className="card text-sm">
          <p className="font-semibold text-slate-800 flex items-center gap-2"><Link2 size={14} className="text-blue-600" /> Operational Integration</p>
          <p className="text-xs text-slate-500 mt-1">Internal Audit collaborates with Accounts, Procurement, Store, Legal, and management through action ownership.</p>
        </div>
      </div>
    </div>
  )
}
