import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { workbenchApi } from '../clientOps/api'

const TABS = [
  ['onboarding', 'Onboarding'],
  ['health', 'Health & Risk'],
  ['opportunities', 'Upsell / Cross-sell'],
  ['markets', 'Market Prioritization'],
  ['pilots', 'Pilot Management'],
  ['feedback', 'Feedback Loop'],
  ['renewals', 'Renewals & Pricing'],
]

export default function ClientOpsMarketsPage() {
  const [tab, setTab] = useState('onboarding')
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [clients, setClients] = useState([])
  const [onboarding, setOnboarding] = useState([])
  const [health, setHealth] = useState([])
  const [opps, setOpps] = useState([])
  const [markets, setMarkets] = useState([])
  const [deepDiveTasks, setDeepDiveTasks] = useState([])
  const [pilots, setPilots] = useState([])
  const [feedback, setFeedback] = useState([])
  const [renewals, setRenewals] = useState([])

  const [newClient, setNewClient] = useState({ clientName: '', specialistEmail: 'go@naptin.gov.ng', productType: 'Software Implementation' })
  const [newOpp, setNewOpp] = useState({ clientId: '', type: 'Upsell', suggestedProduct: '', estimatedValue: 0 })
  const [newMarket, setNewMarket] = useState({ name: '', marketSizeScore: 70, growthScore: 70, competitionScore: 60, regulationScore: 60, fitScore: 70, entryCostScore: 55, estimatedRoi: 28, entryCostUsd: 250000 })
  const [newPilot, setNewPilot] = useState({ marketName: '', durationDays: 90, budgetUsd: 200000, successCustomerTarget: 50, successConversionTarget: 20, successCacTarget: 100 })
  const [newFeedback, setNewFeedback] = useState({ clientId: '', source: 'QBR', category: 'Feature request', summary: '' })
  const [newRenewal, setNewRenewal] = useState({ clientId: '', termStart: '', termEnd: '', currentAmount: 0, proposedAmount: 0, recommendedAction: 'Renew + upsell' })

  const clientMap = useMemo(() => Object.fromEntries(clients.map((c) => [String(c.id), c.name])), [clients])

  const refresh = async () => {
    setLoading(true)
    try {
      const [
        s, c, o, h, op, m, d, p, f, r,
      ] = await Promise.all([
        workbenchApi.summary(),
        workbenchApi.clients(),
        workbenchApi.onboarding(),
        workbenchApi.healthScores(),
        workbenchApi.opportunities(),
        workbenchApi.marketCandidates(),
        workbenchApi.deepDiveTasks(),
        workbenchApi.pilots(),
        workbenchApi.feedback(),
        workbenchApi.renewals(),
      ])
      setSummary(s); setClients(c); setOnboarding(o); setHealth(h); setOpps(op); setMarkets(m); setDeepDiveTasks(d); setPilots(p); setFeedback(f); setRenewals(r)
    } catch (error) {
      toast.error(`Workbench API unavailable: ${error?.message || 'network error'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const call = async (fn) => {
    try {
      await fn()
      await refresh()
    } catch (error) {
      toast.error(error?.response?.data?.error || error?.message || 'Request failed')
    }
  }

  if (loading) return <div className="card">Loading Client Operations & New Markets workbench...</div>

  return (
    <div className="animate-fade-up space-y-4">
      <div className="card">
        <h1 className="text-xl font-extrabold text-slate-900">Client Operations & New Markets Workbench</h1>
        <p className="text-sm text-slate-500 mt-1">Integrated workflows across onboarding, health risk, expansion, pilots, feedback, and renewals.</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
          <Stat label="Clients" value={summary?.clients || 0} />
          <Stat label="Onboarding Active" value={summary?.onboarding || 0} />
          <Stat label="At Risk (Yellow)" value={summary?.health?.yellow_count || 0} />
          <Stat label="Critical (Red)" value={summary?.health?.red_count || 0} />
          <Stat label="Open Opportunities" value={summary?.opportunities || 0} />
        </div>
      </div>

      <div className="flex flex-wrap gap-1 bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-3 py-2 rounded-xl text-xs font-semibold ${tab === id ? 'bg-[#006838] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'onboarding' && (
        <div className="space-y-3">
          <FormCard title="Create onboarding record">
            <div className="grid md:grid-cols-4 gap-2">
              <input className="input" placeholder="Client name" value={newClient.clientName} onChange={(e) => setNewClient((s) => ({ ...s, clientName: e.target.value }))} />
              <input className="input" placeholder="Specialist email" value={newClient.specialistEmail} onChange={(e) => setNewClient((s) => ({ ...s, specialistEmail: e.target.value }))} />
              <input className="input" placeholder="Product type" value={newClient.productType} onChange={(e) => setNewClient((s) => ({ ...s, productType: e.target.value }))} />
              <button className="btn-primary" onClick={() => call(() => workbenchApi.createOnboarding(newClient))}>Create</button>
            </div>
          </FormCard>
          <Table headers={['Client', 'Specialist', 'Milestone', 'Progress', 'Status']}>
            {onboarding.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="table-td">{r.client_name}</td><td className="table-td">{r.specialist_email}</td><td className="table-td">{r.milestone}</td><td className="table-td">{r.progress_pct}%</td><td className="table-td">{r.status}</td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {tab === 'health' && (
        <Table headers={['Client', 'Score', 'Band', 'Trend', 'Action']}>
          {health.map((h) => (
            <tr key={h.id} className="border-b border-slate-100">
              <td className="table-td">{h.client_name}</td><td className="table-td">{h.total_score}</td><td className="table-td">{h.band}</td><td className="table-td">{h.trend}</td>
              <td className="table-td"><button className="text-[#006838] text-xs font-semibold" onClick={() => call(() => workbenchApi.recalcHealth(h.client_id, { usageScore: 70, supportScore: 65, paymentScore: 80, npsScore: 72, engagementScore: 68, trend: 'up' }))}>Recalc</button></td>
            </tr>
          ))}
        </Table>
      )}

      {tab === 'opportunities' && (
        <div className="space-y-3">
          <FormCard title="Create upsell / cross-sell opportunity">
            <div className="grid md:grid-cols-5 gap-2">
              <select className="select" value={newOpp.clientId} onChange={(e) => setNewOpp((s) => ({ ...s, clientId: e.target.value }))}>
                <option value="">Select client</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select className="select" value={newOpp.type} onChange={(e) => setNewOpp((s) => ({ ...s, type: e.target.value }))}><option>Upsell</option><option>Cross-sell</option><option>Renewal-Upsell</option></select>
              <input className="input" placeholder="Suggested product" value={newOpp.suggestedProduct} onChange={(e) => setNewOpp((s) => ({ ...s, suggestedProduct: e.target.value }))} />
              <input className="input" type="number" placeholder="Est. value" value={newOpp.estimatedValue} onChange={(e) => setNewOpp((s) => ({ ...s, estimatedValue: Number(e.target.value) }))} />
              <button className="btn-primary" onClick={() => call(() => workbenchApi.createOpportunity(newOpp))}>Create</button>
            </div>
          </FormCard>
          <Table headers={['Client', 'Type', 'Product', 'Est. Value', 'Status', 'Action']}>
            {opps.map((o) => (
              <tr key={o.id} className="border-b border-slate-100">
                <td className="table-td">{o.client_name}</td><td className="table-td">{o.type}</td><td className="table-td">{o.suggested_product}</td><td className="table-td">${o.estimated_value}</td><td className="table-td">{o.status}</td>
                <td className="table-td"><button className="text-[#006838] text-xs font-semibold" onClick={() => call(() => workbenchApi.setOpportunity(o.id, { status: 'Closed Won' }))}>Close Won</button></td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {tab === 'markets' && (
        <div className="space-y-3">
          <FormCard title="Add candidate market">
            <div className="grid md:grid-cols-6 gap-2">
              <input className="input" placeholder="Market" value={newMarket.name} onChange={(e) => setNewMarket((s) => ({ ...s, name: e.target.value }))} />
              <input className="input" type="number" placeholder="TAM score" value={newMarket.marketSizeScore} onChange={(e) => setNewMarket((s) => ({ ...s, marketSizeScore: Number(e.target.value) }))} />
              <input className="input" type="number" placeholder="Growth score" value={newMarket.growthScore} onChange={(e) => setNewMarket((s) => ({ ...s, growthScore: Number(e.target.value) }))} />
              <input className="input" type="number" placeholder="Fit score" value={newMarket.fitScore} onChange={(e) => setNewMarket((s) => ({ ...s, fitScore: Number(e.target.value) }))} />
              <input className="input" type="number" placeholder="ROI %" value={newMarket.estimatedRoi} onChange={(e) => setNewMarket((s) => ({ ...s, estimatedRoi: Number(e.target.value) }))} />
              <button className="btn-primary" onClick={() => call(() => workbenchApi.createMarketCandidate(newMarket))}>Add</button>
            </div>
          </FormCard>
          <Table headers={['Market', 'Score', 'ROI', 'Entry Cost', 'Stage', 'Action']}>
            {markets.map((m) => (
              <tr key={m.id} className="border-b border-slate-100">
                <td className="table-td">{m.name}</td><td className="table-td">{m.weighted_score}</td><td className="table-td">{m.estimated_roi}%</td><td className="table-td">${m.entry_cost_usd}</td><td className="table-td">{m.stage}</td>
                <td className="table-td"><button className="text-[#006838] text-xs font-semibold" onClick={() => call(() => workbenchApi.startDeepDive(m.id))}>Start deep-dive</button></td>
              </tr>
            ))}
          </Table>
          <div className="card"><h3 className="text-sm font-bold mb-2">Deep-dive tasks</h3>{deepDiveTasks.slice(0, 8).map((t) => <p key={t.id} className="text-xs text-slate-600">{t.market_name} - {t.title} ({t.status})</p>)}</div>
        </div>
      )}

      {tab === 'pilots' && (
        <div className="space-y-3">
          <FormCard title="Create market pilot">
            <div className="grid md:grid-cols-5 gap-2">
              <input className="input" placeholder="Market name" value={newPilot.marketName} onChange={(e) => setNewPilot((s) => ({ ...s, marketName: e.target.value }))} />
              <input className="input" type="number" placeholder="Duration days" value={newPilot.durationDays} onChange={(e) => setNewPilot((s) => ({ ...s, durationDays: Number(e.target.value) }))} />
              <input className="input" type="number" placeholder="Budget USD" value={newPilot.budgetUsd} onChange={(e) => setNewPilot((s) => ({ ...s, budgetUsd: Number(e.target.value) }))} />
              <input className="input" type="number" placeholder="Target customers" value={newPilot.successCustomerTarget} onChange={(e) => setNewPilot((s) => ({ ...s, successCustomerTarget: Number(e.target.value) }))} />
              <button className="btn-primary" onClick={() => call(() => workbenchApi.createPilot(newPilot))}>Create</button>
            </div>
          </FormCard>
          <Table headers={['Market', 'Duration', 'Budget', 'Status', 'Decision']}>
            {pilots.map((p) => (
              <tr key={p.id} className="border-b border-slate-100">
                <td className="table-td">{p.market_name}</td><td className="table-td">{p.duration_days}d</td><td className="table-td">${p.budget_usd}</td><td className="table-td">{p.status}</td>
                <td className="table-td space-x-2">
                  <button className="text-[#006838] text-xs font-semibold" onClick={() => call(() => workbenchApi.setPilotDecision(p.id, 'Scale'))}>Scale</button>
                  <button className="text-amber-600 text-xs font-semibold" onClick={() => call(() => workbenchApi.setPilotDecision(p.id, 'Iterate'))}>Iterate</button>
                  <button className="text-red-600 text-xs font-semibold" onClick={() => call(() => workbenchApi.setPilotDecision(p.id, 'Abort'))}>Abort</button>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {tab === 'feedback' && (
        <div className="space-y-3">
          <FormCard title="Submit client feedback">
            <div className="grid md:grid-cols-5 gap-2">
              <select className="select" value={newFeedback.clientId} onChange={(e) => setNewFeedback((s) => ({ ...s, clientId: e.target.value }))}>
                <option value="">No client</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input className="input" placeholder="Source" value={newFeedback.source} onChange={(e) => setNewFeedback((s) => ({ ...s, source: e.target.value }))} />
              <input className="input" placeholder="Category" value={newFeedback.category} onChange={(e) => setNewFeedback((s) => ({ ...s, category: e.target.value }))} />
              <input className="input md:col-span-2" placeholder="Summary" value={newFeedback.summary} onChange={(e) => setNewFeedback((s) => ({ ...s, summary: e.target.value }))} />
            </div>
            <button className="btn-primary mt-2" onClick={() => call(() => workbenchApi.createFeedback(newFeedback))}>Submit</button>
          </FormCard>
          <Table headers={['Client', 'Category', 'Priority', 'Status', 'Route', 'Action']}>
            {feedback.map((f) => (
              <tr key={f.id} className="border-b border-slate-100">
                <td className="table-td">{f.client_name || 'General'}</td><td className="table-td">{f.category}</td><td className="table-td">{f.priority}</td><td className="table-td">{f.status}</td><td className="table-td">{f.routed_to}</td>
                <td className="table-td"><button className="text-[#006838] text-xs font-semibold" onClick={() => call(() => workbenchApi.setFeedback(f.id, { status: 'Accepted', roadmapEta: 'Q3 2026' }))}>Accept</button></td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {tab === 'renewals' && (
        <div className="space-y-3">
          <FormCard title="Create renewal proposal">
            <div className="grid md:grid-cols-6 gap-2">
              <select className="select" value={newRenewal.clientId} onChange={(e) => setNewRenewal((s) => ({ ...s, clientId: e.target.value }))}><option value="">Select client</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <input className="input" type="date" value={newRenewal.termStart} onChange={(e) => setNewRenewal((s) => ({ ...s, termStart: e.target.value }))} />
              <input className="input" type="date" value={newRenewal.termEnd} onChange={(e) => setNewRenewal((s) => ({ ...s, termEnd: e.target.value }))} />
              <input className="input" type="number" placeholder="Current amount" value={newRenewal.currentAmount} onChange={(e) => setNewRenewal((s) => ({ ...s, currentAmount: Number(e.target.value) }))} />
              <input className="input" type="number" placeholder="Proposed amount" value={newRenewal.proposedAmount} onChange={(e) => setNewRenewal((s) => ({ ...s, proposedAmount: Number(e.target.value) }))} />
              <button className="btn-primary" onClick={() => call(() => workbenchApi.createRenewal(newRenewal))}>Create</button>
            </div>
          </FormCard>
          <Table headers={['Client', 'Term End', 'Current', 'Proposed', 'Increase %', 'Status', 'Actions']}>
            {renewals.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="table-td">{r.client_name || clientMap[String(r.client_id)]}</td><td className="table-td">{r.term_end || '-'}</td><td className="table-td">${r.current_amount}</td><td className="table-td">${r.proposed_amount || '-'}</td><td className="table-td">{r.increase_pct || '-'}</td><td className="table-td">{r.status}</td>
                <td className="table-td space-x-2">
                  <button className="text-[#006838] text-xs font-semibold" onClick={() => call(() => workbenchApi.setRenewalStatus(r.id, { status: 'Signed', approvedBy: 'go@naptin.gov.ng' }))}>Sign</button>
                  <button className="text-amber-600 text-xs font-semibold" onClick={() => call(() => workbenchApi.setRenewalStatus(r.id, { status: 'Countered', counterAmount: r.current_amount, approvedBy: 'go@naptin.gov.ng' }))}>Counter</button>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <div className="text-lg font-extrabold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}

function FormCard({ title, children }) {
  return (
    <div className="card">
      <h3 className="text-sm font-bold text-slate-800 mb-2">{title}</h3>
      {children}
    </div>
  )
}

function Table({ headers, children }) {
  return (
    <div className="card p-0 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">{headers.map((h) => <th key={h} className="table-th">{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

