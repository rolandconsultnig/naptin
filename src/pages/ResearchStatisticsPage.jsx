import { useState } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import {
  X, CheckCircle, Plus, Download, Upload, FileText, BarChart2,
  BookOpen, Database, RefreshCw, Send, ChevronDown, ChevronUp,
  AlertTriangle, TrendingUp, Eye, Trash2,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ScatterChart, Scatter,
} from 'recharts'

/* ─── Utilities ─── */
function useToast() {
  const [msg, setMsg] = useState(null)
  const show = (m) => { setMsg(m); setTimeout(() => setMsg(null), 3200) }
  return { msg, show }
}
function Toast({ msg, clear }) {
  if (!msg) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 max-w-sm">
      <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
      <span className="flex-1">{msg}</span>
      <button onClick={clear}><X size={14} /></button>
    </div>
  )
}
function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button onClick={onClose}><X size={16} className="text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
function Fld({ label, children, required }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-slate-500 uppercase">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <div className="mt-0.5">{children}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/*                  TAB 1: SURVEY DESIGNER                           */
/* ═══════════════════════════════════════════════════════════════════ */

const SURVEYS_INIT = [
  {
    id: 'SRV-2026-003', title: 'Q1 2026 Trainee Satisfaction Survey', status: 'active', totalInvited: 2000,
    responded: 1148, deadline: '15 Apr 2026', createdBy: 'Research Officer I', approvedBy: 'Research Head',
    questions: [
      { id: 1, type: 'likert', text: 'The training programme content met my expectations', required: true },
      { id: 2, type: 'likert', text: 'The instructors demonstrated adequate subject matter knowledge', required: true },
      { id: 3, type: 'likert', text: 'The training venue and facilities were adequate', required: true },
      { id: 4, type: 'multiple', text: 'How did you hear about NAPTIN training programmes?', options: ['Ministry referral', 'Company nomination', 'Internet search', 'Peer recommendation', 'Other'], required: false },
      { id: 5, type: 'open', text: 'What improvements would you recommend for future training programmes?', required: false },
    ],
    results: { avgSatisfaction: 4.1, topPositive: 'Instructor quality', topNegative: 'Venue facilities', npsScore: 42 },
  },
  {
    id: 'SRV-2026-002', title: 'Power Sector Skills Gap Assessment 2026', status: 'under-review', totalInvited: 150,
    responded: 0, deadline: '30 Apr 2026', createdBy: 'Research Officer II', approvedBy: null,
    questions: [
      { id: 1, type: 'multiple', text: 'Which technical area has the most acute skills gap in your organisation?', options: ['High voltage operations', 'Smart grid technology', 'Power plant maintenance', 'Distribution engineering', 'Project management'], required: true },
      { id: 2, type: 'numeric', text: 'What percentage of your technical staff require upskilling in the next 12 months?', required: true },
      { id: 3, type: 'likert', text: 'Existing training providers adequately address your workforce development needs', required: true },
      { id: 4, type: 'open', text: 'Please describe the most critical capability your organisation needs to develop', required: false },
    ],
    results: null,
  },
  {
    id: 'SRV-2025-008', title: 'Annual Customer Experience Survey 2025', status: 'completed', totalInvited: 3500,
    responded: 2241, deadline: '31 Dec 2025', createdBy: 'Research Officer I', approvedBy: 'Research Head',
    questions: [],
    results: { avgSatisfaction: 3.8, topPositive: 'Course relevance', topNegative: 'Online booking system', npsScore: 31 },
  },
]

const QUESTION_TYPES = [
  { value: 'likert', label: 'Likert Scale (1–5)' },
  { value: 'multiple', label: 'Multiple Choice' },
  { value: 'open', label: 'Open Text' },
  { value: 'numeric', label: 'Numeric Input' },
  { value: 'date', label: 'Date' },
]

function SurveyDesignerTab({ toast }) {
  const [surveys, setSurveys] = useState(SURVEYS_INIT)
  const [selected, setSelected] = useState(null) // survey id
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showResultsModal, setShowResultsModal] = useState(null)
  const [createForm, setCreateForm] = useState({ title: '', deadline: '', respondents: '' })
  const [addQModal, setAddQModal] = useState(false)
  const [qForm, setQForm] = useState({ type: 'likert', text: '', options: '' })

  const selectedSurvey = surveys.find(s => s.id === selected)

  const statusBadge = (s) => {
    const map = { active: 'bg-green-100 text-green-700', 'under-review': 'bg-amber-100 text-amber-700', completed: 'bg-slate-100 text-slate-500', draft: 'bg-blue-100 text-blue-700' }
    return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[s] || 'bg-slate-100 text-slate-500'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
  }

  const handleCreate = () => {
    if (!createForm.title || !createForm.deadline) { toast.show('Title and deadline are required.'); return }
    const id = `SRV-2026-${String(surveys.length + 4).padStart(3, '0')}`
    setSurveys(p => [{ id, title: createForm.title, status: 'draft', totalInvited: parseInt(createForm.respondents) || 0, responded: 0, deadline: createForm.deadline, createdBy: 'Current User', approvedBy: null, questions: [], results: null }, ...p])
    toast.show(`Survey ${id} created.`); setShowCreateModal(false); setCreateForm({ title: '', deadline: '', respondents: '' })
  }

  const handleApprove = (id) => {
    setSurveys(p => p.map(s => s.id === id ? { ...s, status: 'active', approvedBy: 'Research Head' } : s))
    toast.show('Survey approved and activated. Distribution links generated.')
  }

  const handleAddQuestion = () => {
    if (!qForm.text) { toast.show('Question text is required.'); return }
    setSurveys(p => p.map(s => s.id === selected ? {
      ...s, questions: [...s.questions, {
        id: s.questions.length + 1, type: qForm.type, text: qForm.text,
        options: qForm.options ? qForm.options.split(',').map(o => o.trim()) : undefined, required: true,
      }]
    } : s))
    toast.show('Question added.'); setAddQModal(false); setQForm({ type: 'likert', text: '', options: '' })
  }

  const handleExport = (id) => toast.show(`Survey ${id} responses exported to CSV.`)

  const responseRate = (s) => s.totalInvited > 0 ? Math.round(s.responded / s.totalInvited * 100) : 0

  return (
    <div className="space-y-4">
      {showCreateModal && (
        <Modal title="Create New Survey" onClose={() => setShowCreateModal(false)}>
          <Fld label="Survey Title" required><input className="np-input w-full text-sm" placeholder="e.g. Q2 Trainee Satisfaction Survey" value={createForm.title} onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))} /></Fld>
          <Fld label="Response Deadline" required><input type="date" className="np-input w-full text-sm" value={createForm.deadline} onChange={e => setCreateForm(p => ({ ...p, deadline: e.target.value }))} /></Fld>
          <Fld label="Number of Respondents (invited)"><input type="number" className="np-input w-full text-sm" placeholder="e.g. 2000" value={createForm.respondents} onChange={e => setCreateForm(p => ({ ...p, respondents: e.target.value }))} /></Fld>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary text-sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
            <button className="btn-primary text-sm" onClick={handleCreate}>Create Survey</button>
          </div>
        </Modal>
      )}
      {addQModal && (
        <Modal title="Add Question" onClose={() => setAddQModal(false)}>
          <Fld label="Question Type">
            <select className="np-input w-full text-sm" value={qForm.type} onChange={e => setQForm(p => ({ ...p, type: e.target.value }))}>
              {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Fld>
          <Fld label="Question Text" required><textarea className="np-input w-full text-sm h-16" placeholder="Enter the question..." value={qForm.text} onChange={e => setQForm(p => ({ ...p, text: e.target.value }))} /></Fld>
          {qForm.type === 'multiple' && (
            <Fld label="Options (comma-separated)"><input className="np-input w-full text-sm" placeholder="Option A, Option B, Option C" value={qForm.options} onChange={e => setQForm(p => ({ ...p, options: e.target.value }))} /></Fld>
          )}
          <div className="flex justify-end gap-2">
            <button className="btn-secondary text-sm" onClick={() => setAddQModal(false)}>Cancel</button>
            <button className="btn-primary text-sm" onClick={handleAddQuestion}>Add Question</button>
          </div>
        </Modal>
      )}
      {showResultsModal && (
        <Modal title={`Results — ${showResultsModal.title}`} onClose={() => setShowResultsModal(null)} wide>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[['Response Rate', `${responseRate(showResultsModal)}%`, 'text-blue-700'], ['Avg Satisfaction', `${showResultsModal.results?.avgSatisfaction}/5`, 'text-green-700'], ['NPS Score', showResultsModal.results?.npsScore, 'text-amber-700']].map(([label, val, cls]) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className={`text-lg font-extrabold ${cls}`}>{val}</p><p className="text-[10px] text-slate-400">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600"><span className="font-semibold">Top positive:</span> {showResultsModal.results?.topPositive}</p>
          <p className="text-xs text-slate-600 mt-1"><span className="font-semibold">Top improvement area:</span> {showResultsModal.results?.topNegative}</p>
          <div className="flex justify-end gap-2 mt-4">
            <button className="btn-secondary text-sm" onClick={() => { handleExport(showResultsModal.id); setShowResultsModal(null) }}><Download size={14} /> Export Data</button>
          </div>
        </Modal>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-slate-500">{surveys.length} surveys · Design, deploy, and track response rates.</p>
        <button className="btn-primary text-sm" onClick={() => setShowCreateModal(true)}><Plus size={14} /> New Survey</button>
      </div>

      {/* List */}
      {!selected && (
        <div className="space-y-3">
          {surveys.map((s, i) => (
            <div key={i} className="card cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(s.id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">{statusBadge(s.status)}<span className="text-[10px] text-slate-400">{s.id}</span></div>
                  <p className="text-sm font-bold text-slate-800">{s.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">By: {s.createdBy} · Deadline: {s.deadline} · {s.questions.length} questions</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#006838]">{responseRate(s)}%</p>
                  <p className="text-[10px] text-slate-400">{s.responded}/{s.totalInvited} responded</p>
                  {s.status === 'under-review' && (
                    <button className="text-[10px] mt-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-md font-semibold hover:bg-green-200" onClick={e => { e.stopPropagation(); handleApprove(s.id) }}>Approve</button>
                  )}
                  {s.results && (
                    <button className="text-[10px] mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-semibold hover:bg-blue-200 block ml-auto" onClick={e => { e.stopPropagation(); setShowResultsModal(s) }}>View Results</button>
                  )}
                </div>
              </div>
              {s.status === 'active' && (
                <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-green-500" style={{ width: `${responseRate(s)}%` }} /></div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Question editor */}
      {selected && selectedSurvey && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button className="text-xs text-[#006838] font-semibold hover:underline" onClick={() => setSelected(null)}>← Back to surveys</button>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-700">{selectedSurvey.title}</span>
            {statusBadge(selectedSurvey.status)}
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-700">Questions ({selectedSurvey.questions.length})</p>
              {selectedSurvey.status === 'draft' && <button className="text-[10px] px-2 py-1 bg-blue-100 text-blue-700 rounded-md font-semibold hover:bg-blue-200" onClick={() => setAddQModal(true)}>+ Add Question</button>}
            </div>
            <div className="space-y-2">
              {selectedSurvey.questions.map((q, i) => (
                <div key={q.id} className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 mt-0.5 w-4 flex-shrink-0">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-800">{q.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-medium">{QUESTION_TYPES.find(t => t.value === q.type)?.label || q.type}</span>
                      {q.required && <span className="text-[10px] text-red-500 font-semibold">Required</span>}
                    </div>
                    {q.options && <p className="text-[10px] text-slate-400 mt-0.5">{q.options.join(' · ')}</p>}
                  </div>
                </div>
              ))}
              {selectedSurvey.questions.length === 0 && <p className="text-xs text-slate-400 italic">No questions added yet.</p>}
            </div>
            {selectedSurvey.status === 'draft' && selectedSurvey.questions.length >= 3 && (
              <button className="btn-secondary text-sm mt-3" onClick={() => { setSurveys(p => p.map(s => s.id === selected ? { ...s, status: 'under-review' } : s)); toast.show('Survey submitted for Research Head review.') }}>
                <Send size={14} /> Submit for Review
              </button>
            )}
          </div>
          <details>
            <summary className="text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-700">DB Schema — Surveys</summary>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'surveys', cols: 'id, survey_ref, title, status, total_invited, responded_count, deadline, created_by, reviewed_by, approved_by, approved_at, archived_at' },
                { name: 'survey_questions', cols: 'id, survey_id (FK), question_order, question_type (likert|multiple|open|numeric|date), question_text, required, options_json' },
                { name: 'survey_responses', cols: 'id, survey_id (FK), respondent_token (UUID — anonymous), q_id (FK), answer_text, answer_value, answered_at' },
                { name: 'survey_distributions', cols: 'id, survey_id (FK), respondent_email_hash, unique_link_token, opened_at, completed_at, ip_country' },
              ].map(t => (
                <div key={t.name} className="bg-slate-50 rounded-xl p-3"><p className="text-[11px] font-bold text-slate-700 mb-1">{t.name}</p><p className="text-[10px] text-slate-500 leading-relaxed">{t.cols}</p></div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/*                  TAB 2: STATISTICAL ANALYSIS                      */
/* ═══════════════════════════════════════════════════════════════════ */

const SAMPLE_DATASET = [
  { month: 'Jan', trainees: 720, revenue: 43200000, satisfaction: 3.9, trainingHours: 380 },
  { month: 'Feb', trainees: 810, revenue: 48600000, satisfaction: 4.0, trainingHours: 420 },
  { month: 'Mar', trainees: 954, revenue: 57240000, satisfaction: 4.1, trainingHours: 490 },
  { month: 'Apr', trainees: 880, revenue: 52800000, satisfaction: 3.8, trainingHours: 455 },
  { month: 'May', trainees: 1020, revenue: 61200000, satisfaction: 4.2, trainingHours: 520 },
  { month: 'Jun', trainees: 1150, revenue: 69000000, satisfaction: 4.3, trainingHours: 590 },
  { month: 'Jul', trainees: 870, revenue: 52200000, satisfaction: 4.0, trainingHours: 448 },
  { month: 'Aug', trainees: 790, revenue: 47400000, satisfaction: 3.7, trainingHours: 410 },
  { month: 'Sep', trainees: 1040, revenue: 62400000, satisfaction: 4.1, trainingHours: 530 },
  { month: 'Oct', trainees: 1180, revenue: 70800000, satisfaction: 4.4, trainingHours: 605 },
  { month: 'Nov', trainees: 1220, revenue: 73200000, satisfaction: 4.5, trainingHours: 630 },
  { month: 'Dec', trainees: 985, revenue: 59100000, satisfaction: 4.2, trainingHours: 505 },
]

function desc(arr, key) {
  const vals = arr.map(r => r[key]).filter(v => v != null)
  const n = vals.length
  const mean = vals.reduce((s, v) => s + v, 0) / n
  const sorted = [...vals].sort((a, b) => a - b)
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)]
  const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / n
  const sd = Math.sqrt(variance)
  return { mean: +mean.toFixed(2), median: +median.toFixed(2), sd: +sd.toFixed(2), min: sorted[0], max: sorted[n - 1], n }
}

function StatisticalAnalysisTab({ toast }) {
  const [dataLoaded, setDataLoaded] = useState(false)
  const [analysisType, setAnalysisType] = useState('descriptive')
  const [selectedVar, setSelectedVar] = useState('trainees')
  const [yVar, setYVar] = useState('revenue')
  const [xVar, setXVar] = useState('trainingHours')
  const [results, setResults] = useState(null)
  const [savedModels, setSavedModels] = useState([])

  const numeric_vars = ['trainees', 'revenue', 'satisfaction', 'trainingHours']

  const handleLoad = () => {
    setDataLoaded(true)
    toast.show('Dataset loaded — 12 months of operational data. Variable types auto-detected.')
  }

  const runAnalysis = () => {
    if (analysisType === 'descriptive') {
      setResults({ type: 'descriptive', var: selectedVar, stats: desc(SAMPLE_DATASET, selectedVar) })
      toast.show('Descriptive statistics computed.')
    } else if (analysisType === 'timeseries') {
      setResults({ type: 'timeseries', var: selectedVar })
      toast.show('Time series analysis complete — trend and seasonal components extracted.')
    } else if (analysisType === 'regression') {
      // Simulate regression: trainingHours → revenue has R~0.98
      const n = SAMPLE_DATASET.length
      const xVals = SAMPLE_DATASET.map(r => r[xVar])
      const yVals = SAMPLE_DATASET.map(r => r[yVar])
      const xBar = xVals.reduce((s, v) => s + v, 0) / n
      const yBar = yVals.reduce((s, v) => s + v, 0) / n
      const ssXY = xVals.reduce((s, v, i) => s + (v - xBar) * (yVals[i] - yBar), 0)
      const ssXX = xVals.reduce((s, v) => s + (v - xBar) ** 2, 0)
      const ssYY = yVals.reduce((s, v) => s + (v - yBar) ** 2, 0)
      const b1 = ssXY / ssXX
      const b0 = yBar - b1 * xBar
      const r = ssXY / Math.sqrt(ssXX * ssYY)
      const rSquared = r ** 2
      setResults({ type: 'regression', xVar, yVar, b0: +b0.toFixed(0), b1: +b1.toFixed(2), rSquared: +rSquared.toFixed(4), r: +r.toFixed(4), pValue: rSquared > 0.8 ? '< 0.001' : '< 0.05', n })
      toast.show('Regression analysis complete.')
    }
  }

  const handleSaveModel = () => {
    if (!results) return
    const label = `${analysisType} — ${results.var || `${xVar} → ${yVar}`} — ${new Date().toLocaleDateString()}`
    setSavedModels(p => [...p, label])
    toast.show('Analysis saved to model library.')
  }

  const scatterData = SAMPLE_DATASET.map(r => ({ x: r[xVar], y: r[yVar] }))

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-slate-700">Dataset: NAPTIN Operational Data (Jan–Dec 2025)</p>
          <button className={`text-sm px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 ${dataLoaded ? 'bg-green-100 text-green-700' : 'btn-secondary'}`} onClick={handleLoad}>
            {dataLoaded ? <><CheckCircle size={14} /> Loaded</> : <><Upload size={14} /> Load Dataset</>}
          </button>
        </div>
        {!dataLoaded && <p className="text-xs text-slate-400 italic">Load a dataset to enable analysis tools.</p>}
        {dataLoaded && (
          <div className="flex flex-wrap gap-3 items-end">
            <Fld label="Analysis Type">
              <select className="np-input text-sm" value={analysisType} onChange={e => { setAnalysisType(e.target.value); setResults(null) }}>
                <option value="descriptive">Descriptive Statistics</option>
                <option value="timeseries">Time Series Analysis</option>
                <option value="regression">Linear Regression</option>
              </select>
            </Fld>
            {analysisType !== 'regression' && (
              <Fld label="Variable">
                <select className="np-input text-sm" value={selectedVar} onChange={e => setSelectedVar(e.target.value)}>
                  {numeric_vars.map(v => <option key={v}>{v}</option>)}
                </select>
              </Fld>
            )}
            {analysisType === 'regression' && (
              <>
                <Fld label="X (Predictor)"><select className="np-input text-sm" value={xVar} onChange={e => setXVar(e.target.value)}>{numeric_vars.map(v => <option key={v}>{v}</option>)}</select></Fld>
                <Fld label="Y (Outcome)"><select className="np-input text-sm" value={yVar} onChange={e => setYVar(e.target.value)}>{numeric_vars.map(v => <option key={v}>{v}</option>)}</select></Fld>
              </>
            )}
            <button className="btn-primary text-sm" onClick={runAnalysis}>Run Analysis</button>
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-700">
              {results.type === 'descriptive' && `Descriptive Statistics — ${results.var}`}
              {results.type === 'timeseries' && `Time Series — ${results.var} (Jan–Dec 2025)`}
              {results.type === 'regression' && `Regression: ${results.xVar} → ${results.yVar}`}
            </p>
            <div className="flex gap-2">
              <button className="btn-secondary text-sm" onClick={handleSaveModel}>Save to Library</button>
              <button className="btn-secondary text-sm" onClick={() => toast.show('Results exported.')}><Download size={14} /></button>
            </div>
          </div>

          {results.type === 'descriptive' && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[['Mean', results.stats.mean], ['Median', results.stats.median], ['Std Dev', results.stats.sd], ['Min', results.stats.min], ['Max', results.stats.max], ['n', results.stats.n]].map(([label, val]) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-sm font-extrabold text-slate-800">{typeof val === 'number' && val > 10000 ? `₦${(val / 1000000).toFixed(1)}M` : val}</p>
                  <p className="text-[10px] text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          )}

          {results.type === 'timeseries' && (
            <div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={SAMPLE_DATASET} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey={results.var} stroke="#006838" strokeWidth={2} dot={{ fill: '#006838', r: 3 }} name={results.var} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-slate-500 mt-2"><TrendingUp size={12} className="inline mr-1 text-green-600" />Trend: Upward across the year. Peak month: November. Dip observed in August — consistent with seasonal pattern.</p>
            </div>
          )}

          {results.type === 'regression' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[['R² (Fit)', results.rSquared], ['Pearson R', results.r], ['p-value', results.pValue], ['n', results.n]].map(([label, val]) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className={`text-sm font-extrabold ${label === 'R² (Fit)' && results.rSquared > 0.7 ? 'text-green-700' : 'text-slate-800'}`}>{val}</p>
                    <p className="text-[10px] text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-800">
                <span className="font-bold">Interpretation:</span> For every 1-unit increase in <em>{results.xVar}</em>, <em>{results.yVar}</em> changes by <strong>{results.b1.toLocaleString()}</strong>. The model explains {Math.round(results.rSquared * 100)}% of variance (R² = {results.rSquared}, {results.pValue}).
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <ScatterChart margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="x" name={xVar} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} label={{ value: xVar, position: 'insideBottom', offset: -2, fontSize: 10 }} />
                  <YAxis dataKey="y" name={yVar} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={scatterData} fill="#006838" opacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Saved models */}
      {savedModels.length > 0 && (
        <div className="card">
          <p className="text-xs font-bold text-slate-700 mb-2">Model Library ({savedModels.length})</p>
          <div className="space-y-1">
            {savedModels.map((m, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2">
                <span className="text-slate-700">{m}</span>
                <button className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-semibold hover:bg-blue-200" onClick={() => toast.show('Saved model loaded.')}>Load</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/*                  TAB 3: STATISTICAL BULLETIN                       */
/* ═══════════════════════════════════════════════════════════════════ */

const BULLETIN_TEMPLATES = [
  {
    id: 'TMPL-Q', name: 'Quarterly Statistical Bulletin', sections: [
      { section: 'Training Delivery Performance', type: 'chart', dataKey: 'trainees', note: 'Monthly trainees trained — Q1 2026' },
      { section: 'Revenue Trends', type: 'chart', dataKey: 'revenue', note: 'Monthly revenue (₦) — Q1 2026' },
      { section: 'Customer Satisfaction Index', type: 'kpi', value: '81%', benchmark: '90% target' },
      { section: 'Staff Utilisation Rate', type: 'kpi', value: '78%', benchmark: '85% target' },
      { section: 'RTC Compliance Status', type: 'table', rows: [['Kaduna RTC', 'ISO 9001', 'Compliant'], ['Lagos RTC', 'ISO 9001', 'Compliant'], ['Afam RTC', 'ISO 9001', 'In progress'], ['Abuja HQ', 'ISO 9001', 'In progress'], ['Port Harcourt', 'ISO 9001', 'Planned']] },
    ],
  },
  {
    id: 'TMPL-A', name: 'Annual Statistical Report', sections: [
      { section: 'Annual Training Output', type: 'chart', dataKey: 'trainees', note: 'Trainees by month — FY 2025' },
      { section: 'Revenue & IGR Analysis', type: 'chart', dataKey: 'revenue', note: 'Revenue trend 2025' },
      { section: 'Key Performance Indicators Summary', type: 'kpi', value: '9,300 trainees', benchmark: '15,000 target' },
    ],
  },
]

const SEEDED_NARRATIVES = {
  'Training Delivery Performance': 'Training output in Q1 2026 totalled 9,300 beneficiaries, representing a 12% increase over Q1 2025. The upward trend reflects expanded capacity at the Kaduna and Lagos RTCs.',
  'Revenue Trends': 'Revenue for Q1 2026 reached ₦149,040,000, a 9% improvement year-on-year. IGR as a share of total revenue grew from 15% to 19%, driven by increased certification programme enrolments.',
  'Customer Satisfaction Index': 'The Q1 2026 satisfaction index of 81% remains below the 90% target. Key drivers of dissatisfaction include venue facilities at three RTCs. Facility upgrade plans are underway for Q2.',
  'Staff Utilisation Rate': 'Staff utilisation averaged 78% across Q1, approaching the 85% efficiency target. The shortfall is attributable to two underutilised RTCs with below-capacity intake.',
}

function StatisticalBulletinTab({ toast }) {
  const [selectedTemplate, setSelectedTemplate] = useState(BULLETIN_TEMPLATES[0])
  const [period, setPeriod] = useState('Q1 2026')
  const [bulletinState, setBulletinState] = useState('idle') // idle | generated | routed | approved | distributed
  const [editingSection, setEditingSection] = useState(null)
  const [sectionNarratives, setSectionNarratives] = useState({})
  const [bulletins, setBulletins] = useState([
    { id: 'BULL-2025-Q4', title: 'Q4 2025 Quarterly Statistical Bulletin', date: '15 Jan 2026', status: 'distributed', pages: 18 },
    { id: 'BULL-2025-Q3', title: 'Q3 2025 Quarterly Statistical Bulletin', date: '15 Oct 2025', status: 'distributed', pages: 20 },
  ])

  const chartData = SAMPLE_DATASET.slice(0, 3) // Q1 = Jan, Feb, Mar

  const handleGenerate = () => {
    // Auto-populate narratives
    const auto = {}
    selectedTemplate.sections.forEach(s => { if (SEEDED_NARRATIVES[s.section]) auto[s.section] = SEEDED_NARRATIVES[s.section] })
    setSectionNarratives(auto)
    setBulletinState('generated')
    toast.show(`${period} bulletin generated with ${selectedTemplate.sections.length} sections and auto-populated commentary.`)
  }
  const handleRoute = () => { setBulletinState('routed'); toast.show('Bulletin routed: Research Head → DG for approval.') }
  const handleApprove = () => { setBulletinState('approved'); toast.show('Bulletin approved by DG.') }
  const handleDistribute = () => {
    const id = `BULL-2026-${period.replace(' ', '-')}`
    setBulletins(p => [{ id, title: `${period} ${selectedTemplate.name}`, date: '07 Apr 2026', status: 'distributed', pages: selectedTemplate.sections.length * 3 + 2 }, ...p])
    setBulletinState('distributed')
    toast.show(`Bulletin distributed to 50 stakeholders via email. Archived in repository.`)
  }

  const statusBadge = (s) => {
    const map = { distributed: 'bg-green-100 text-green-700', approved: 'bg-blue-100 text-blue-700', generated: 'bg-amber-100 text-amber-700', idle: 'bg-slate-100 text-slate-500' }
    return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[s] || 'bg-slate-100 text-slate-500'}`}>{s}</span>
  }

  return (
    <div className="space-y-4">
      {/* Template & period selector */}
      <div className="card">
        <div className="flex flex-wrap gap-3 items-end">
          <Fld label="Bulletin Template">
            <select className="np-input text-sm" value={selectedTemplate.id} onChange={e => { setSelectedTemplate(BULLETIN_TEMPLATES.find(t => t.id === e.target.value)); setBulletinState('idle') }}>
              {BULLETIN_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Fld>
          <Fld label="Reporting Period">
            <input className="np-input text-sm" placeholder="e.g. Q1 2026" value={period} onChange={e => setPeriod(e.target.value)} />
          </Fld>
          <button className="btn-secondary text-sm" onClick={handleGenerate} disabled={bulletinState === 'distributed'}><RefreshCw size={14} /> {bulletinState === 'idle' ? 'Generate Bulletin' : 'Regenerate'}</button>
          {bulletinState === 'generated' && <button className="btn-secondary text-sm" onClick={handleRoute}><Send size={14} /> Route for Approval</button>}
          {bulletinState === 'routed' && <button className="btn-primary text-sm" onClick={handleApprove}><CheckCircle size={14} /> Approve</button>}
          {bulletinState === 'approved' && <button className="bg-[#006838] text-white text-sm px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 hover:bg-[#005230]" onClick={handleDistribute}><Send size={14} /> Distribute</button>}
        </div>
      </div>

      {/* Generated bulletin preview */}
      {bulletinState !== 'idle' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm font-bold text-slate-800">{period} — {selectedTemplate.name}</p>
              <div className="flex items-center gap-2 mt-1">{statusBadge(bulletinState)}<span className="text-[10px] text-slate-400">Auto-generated · {selectedTemplate.sections.length} sections</span></div>
            </div>
            <button className="btn-secondary text-sm" onClick={() => toast.show('Bulletin exported as PDF.')}><Download size={14} /> Export PDF</button>
          </div>

          {selectedTemplate.sections.map((sec, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700">{sec.section}</p>
                {editingSection !== i
                  ? <button className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-semibold hover:bg-slate-200" onClick={() => setEditingSection(i)}>Edit narrative</button>
                  : <button className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-md font-semibold hover:bg-green-200" onClick={() => { setEditingSection(null); toast.show('Narrative saved.') }}>Save</button>}
              </div>

              {sec.type === 'chart' && (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData} margin={{ left: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey={sec.dataKey} fill="#006838" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {sec.type === 'kpi' && (
                <div className="flex items-center gap-4 bg-slate-50 rounded-lg px-4 py-3">
                  <p className="text-2xl font-extrabold text-[#006838]">{sec.value}</p>
                  <p className="text-xs text-slate-500">Benchmark: {sec.benchmark}</p>
                </div>
              )}
              {sec.type === 'table' && (
                <table className="w-full text-xs"><tbody>{sec.rows.map((row, ri) => <tr key={ri} className="border-b border-slate-50">{row.map((cell, ci) => <td key={ci} className={`py-1.5 px-2 ${ci === 2 ? (cell === 'Compliant' ? 'text-green-700 font-semibold' : 'text-amber-600 font-semibold') : 'text-slate-600'}`}>{cell}</td>)}</tr>)}</tbody></table>
              )}

              {editingSection === i
                ? <textarea className="np-input w-full text-xs h-20" value={sectionNarratives[sec.section] || ''} onChange={e => setSectionNarratives(p => ({ ...p, [sec.section]: e.target.value }))} placeholder="Write narrative commentary..." />
                : sectionNarratives[sec.section] && <p className="text-xs text-slate-600 italic border-l-2 border-[#006838] pl-3">{sectionNarratives[sec.section]}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Archive */}
      <div>
        <p className="text-xs font-bold text-slate-700 mb-2">Bulletin Archive</p>
        <div className="space-y-2">
          {bulletins.map((b, i) => (
            <div key={i} className="card flex items-center justify-between text-xs">
              <div><p className="font-semibold text-slate-800">{b.title}</p><p className="text-[10px] text-slate-400">{b.date} · {b.pages} pages · {statusBadge(b.status)}</p></div>
              <button className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-semibold hover:bg-slate-200" onClick={() => toast.show(`Downloading ${b.id}.pdf`)}><Download size={10} className="inline mr-0.5" />Download</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Tab 4: Roles & Schema ─── */
const RS_ROLES = [
  { role: 'Research Officer', survey: 'Create, design, deploy', analysis: 'Run all analyses, save models', bulletin: 'Generate, edit narratives', dataQuality: 'Submit quality reports' },
  { role: 'Research Head', survey: 'Review & approve surveys', analysis: 'View all results', bulletin: 'Approve draft bulletin', dataQuality: 'Set quality standards' },
  { role: 'Data Analyst', survey: 'View responses, export', analysis: 'Run all analyses', bulletin: 'Generate & export', dataQuality: 'Validate data' },
  { role: 'Planning Officer', survey: 'View results', analysis: 'View output', bulletin: 'Receive distributed copies', dataQuality: 'View quality scores' },
  { role: 'Director General', survey: 'View summary results', analysis: 'View summary', bulletin: 'Receive & approve final', dataQuality: 'View dashboard' },
]

function RSRolesTab() {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="text-left border-b border-slate-100">
            {['Role', 'Survey Designer', 'Statistical Analysis', 'Statistical Bulletin', 'Data Quality'].map(h => <th key={h} className="pb-2 pr-4 text-slate-500 font-semibold">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {RS_ROLES.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-2.5 pr-4 font-semibold text-slate-800">{r.role}</td>
                <td className="py-2.5 pr-4 text-slate-600">{r.survey}</td>
                <td className="py-2.5 pr-4 text-slate-600">{r.analysis}</td>
                <td className="py-2.5 pr-4 text-slate-600">{r.bulletin}</td>
                <td className="py-2.5 text-slate-600">{r.dataQuality}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { name: 'surveys', cols: 'id, survey_ref, title, status (draft|under-review|active|completed), total_invited, responded_count, deadline, created_by, approved_by, approved_at, archived_at' },
          { name: 'survey_questions', cols: 'id, survey_id (FK), question_order, question_type, question_text, required, options_json, skip_logic_json' },
          { name: 'survey_responses', cols: 'id, survey_id (FK), respondent_token (UUID), question_id (FK), answer_text, answer_value, answered_at' },
          { name: 'statistical_analyses', cols: 'id, analysis_ref, dataset_name, analysis_type (descriptive|timeseries|regression|comparative), variables_json, results_json, r_squared, p_value, created_by, created_at, saved_as_template' },
          { name: 'bulletins', cols: 'id, bulletin_ref, title, template_id, reporting_period, status (generated|routed|approved|distributed), generated_by, approved_by, distributed_at, pages_count, pdf_url' },
          { name: 'bulletin_sections', cols: 'id, bulletin_id (FK), section_order, section_title, section_type, data_json, narrative_text, chart_config_json, edited_by, edited_at' },
        ].map(t => (
          <div key={t.name} className="bg-slate-50 rounded-xl p-3">
            <p className="text-[11px] font-bold text-slate-700 mb-1">{t.name}</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">{t.cols}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── MAIN PAGE ─── */
export default function ResearchStatisticsPage() {
  const toast = useToast()
  const TABS = [
    { label: 'Survey Designer', icon: FileText },
    { label: 'Statistical Analysis', icon: BarChart2 },
    { label: 'Statistical Bulletin', icon: BookOpen },
    { label: 'Roles & Schema', icon: Database },
  ]
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="animate-fade-up">
      <Toast msg={toast.msg} clear={() => toast.show(null)} />

      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Research &amp; Statistics Workbench</h1>
          <p className="text-sm text-slate-400">Survey design · Statistical analysis · Bulletin generation · Evidence → Insights</p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Active Surveys', value: '1', sub: '1,148 / 2,000 responded', color: 'text-green-700' },
          { label: 'Analyses Run', value: '12', sub: 'This quarter', color: 'text-blue-700' },
          { label: 'Bulletins Published', value: '5', sub: 'FY 2025 archive', color: 'text-[#006838]' },
          { label: 'Data Quality Score', value: '94%', sub: 'Across all datasets', color: 'text-amber-600' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">{s.label}</p>
            <p className="text-[10px] text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap mb-5">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === i ? 'bg-[#006838] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-white border border-slate-100 hover:bg-slate-50'}`}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {activeTab === 0 && <SurveyDesignerTab toast={toast} />}
      {activeTab === 1 && <StatisticalAnalysisTab toast={toast} />}
      {activeTab === 2 && <StatisticalBulletinTab toast={toast} />}
      {activeTab === 3 && <RSRolesTab />}
    </div>
  )
}
