import { useEffect, useMemo, useState } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import { Briefcase, RefreshCw, UserPlus, Users, PlusCircle } from 'lucide-react'
import { hrmsApi } from '../services/hrmsService'

const STAGE_OPTIONS = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected']

function humanStage(v) {
  const map = {
    applied: 'Applied',
    screening: 'Screening',
    interview: 'Interview',
    assessment: 'Assessment',
    offer: 'Offer',
    hired: 'Hired',
    rejected: 'Rejected',
  }
  return map[v] || 'Applied'
}

export default function RecruitmentPortalPage() {
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [candidates, setCandidates] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingJob, setIsCreatingJob] = useState(false)
  const [isCreatingCandidate, setIsCreatingCandidate] = useState(false)
  const [isCreatingStarter, setIsCreatingStarter] = useState(false)
  const [message, setMessage] = useState('')
  const [jobForm, setJobForm] = useState({ title: '', department: '' })
  const [candidateForm, setCandidateForm] = useState({ name: '', email: '' })

  const loadJobs = async () => {
    setIsLoading(true)
    try {
      const rows = await hrmsApi.getJobOpenings()
      const list = Array.isArray(rows) ? rows : []
      setJobs(list)
      if (!list.length) {
        setSelectedJobId('')
        setCandidates([])
        setMessage('No vacancies yet. Create one or use starter vacancy.')
      } else {
        setSelectedJobId((prev) => (prev && list.some((j) => String(j.id) === String(prev)) ? prev : String(list[0].id)))
        setMessage('Recruitment portal synced with HRMS.')
      }
    } catch (e) {
      setMessage(e?.response?.data?.error || 'Failed to load recruitment data.')
      setJobs([])
      setCandidates([])
      setSelectedJobId('')
    } finally {
      setIsLoading(false)
    }
  }

  const loadCandidates = async (jobId) => {
    if (!jobId) {
      setCandidates([])
      return
    }
    try {
      const rows = await hrmsApi.getCandidates(jobId)
      setCandidates(Array.isArray(rows) ? rows : [])
    } catch {
      setCandidates([])
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  useEffect(() => {
    loadCandidates(selectedJobId)
  }, [selectedJobId])

  const selectedJob = useMemo(() => jobs.find((j) => String(j.id) === String(selectedJobId)), [jobs, selectedJobId])

  const createVacancy = async (e) => {
    e.preventDefault()
    if (!jobForm.title.trim()) return
    setIsCreatingJob(true)
    setMessage('')
    try {
      await hrmsApi.createJobOpening({
        title: jobForm.title.trim(),
        description: jobForm.department.trim() ? `Department: ${jobForm.department.trim()}` : '',
        vacancies: 1,
      })
      setJobForm({ title: '', department: '' })
      setMessage('Vacancy created.')
      await loadJobs()
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Failed to create vacancy.')
    } finally {
      setIsCreatingJob(false)
    }
  }

  const createStarterVacancy = async () => {
    setIsCreatingStarter(true)
    setMessage('')
    try {
      await hrmsApi.createJobOpening({
        title: `Starter Vacancy — HR Officer (${new Date().toLocaleDateString()})`,
        description: 'Starter vacancy created from Recruitment Portal quick action.',
        vacancies: 1,
      })
      setMessage('Starter vacancy created.')
      await loadJobs()
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Failed to create starter vacancy.')
    } finally {
      setIsCreatingStarter(false)
    }
  }

  const createCandidate = async (e) => {
    e.preventDefault()
    if (!selectedJobId || !candidateForm.name.trim()) return
    setIsCreatingCandidate(true)
    setMessage('')
    try {
      const parts = candidateForm.name.trim().split(/\s+/).filter(Boolean)
      const firstName = parts[0] || 'Candidate'
      const lastName = parts.slice(1).join(' ') || 'Applicant'
      const email = candidateForm.email.trim() || `candidate.${Date.now()}@naptin.gov.ng`
      await hrmsApi.addCandidate(selectedJobId, { firstName, lastName, email, source: 'portal' })
      setCandidateForm({ name: '', email: '' })
      setMessage('Candidate added.')
      await loadCandidates(selectedJobId)
      await loadJobs()
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Failed to add candidate.')
    } finally {
      setIsCreatingCandidate(false)
    }
  }

  const updateStage = async (candidateId, stage) => {
    try {
      await hrmsApi.updateCandidateStage(candidateId, { stage })
      setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, pipelineStage: stage } : c)))
      setMessage(`Candidate moved to ${humanStage(stage)}.`)
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Failed to update candidate stage.')
    }
  }

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex items-center gap-3">
        <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Recruitment Portal</h1>
          <p className="text-sm text-slate-400">Live vacancies, candidate pipeline, and hiring flow wired to HRMS API.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-secondary text-xs py-1.5 px-3" onClick={loadJobs} disabled={isLoading}>
          <RefreshCw size={13} /> {isLoading ? 'Syncing…' : 'Sync recruitment data'}
        </button>
        <button type="button" className="btn-primary text-xs py-1.5 px-3" onClick={createStarterVacancy} disabled={isCreatingStarter || isLoading}>
          <PlusCircle size={13} /> {isCreatingStarter ? 'Creating…' : 'Create starter vacancy'}
        </button>
        <span className="text-xs text-slate-400">{message}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <form className="card space-y-3" onSubmit={createVacancy}>
          <h3 className="text-sm font-bold text-slate-800">Create vacancy</h3>
          <input
            className="input"
            placeholder="Role title"
            value={jobForm.title}
            onChange={(e) => setJobForm((p) => ({ ...p, title: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Department"
            value={jobForm.department}
            onChange={(e) => setJobForm((p) => ({ ...p, department: e.target.value }))}
          />
          <button type="submit" className="btn-primary text-xs py-2" disabled={isCreatingJob || isLoading || !jobForm.title.trim()}>
            <Briefcase size={13} /> {isCreatingJob ? 'Creating…' : 'Create vacancy'}
          </button>
        </form>

        <form className="card space-y-3" onSubmit={createCandidate}>
          <h3 className="text-sm font-bold text-slate-800">Add candidate</h3>
          <select className="select" value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
            {jobs.length ? jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>) : <option value="">No vacancies loaded</option>}
          </select>
          <input
            className="input"
            placeholder="Candidate full name"
            value={candidateForm.name}
            onChange={(e) => setCandidateForm((p) => ({ ...p, name: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Candidate email (optional)"
            value={candidateForm.email}
            onChange={(e) => setCandidateForm((p) => ({ ...p, email: e.target.value }))}
          />
          <button type="submit" className="btn-primary text-xs py-2" disabled={isCreatingCandidate || !selectedJobId || !candidateForm.name.trim() || isLoading}>
            <UserPlus size={13} /> {isCreatingCandidate ? 'Adding…' : 'Add candidate'}
          </button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">Candidate pipeline</h3>
          <span className="text-xs text-slate-400 inline-flex items-center gap-1"><Users size={12} /> {candidates.length} candidates</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="table-th text-left">Candidate</th>
              <th className="table-th text-left">Email</th>
              <th className="table-th text-left">Stage</th>
              <th className="table-th text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/80">
                <td className="table-td">
                  <span className="font-semibold text-slate-800">{c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim()}</span>
                </td>
                <td className="table-td text-xs text-slate-500">{c.email || '—'}</td>
                <td className="table-td">
                  <select
                    className="select py-1 text-xs min-w-[140px]"
                    value={c.pipelineStage || 'applied'}
                    onChange={(e) => updateStage(c.id, e.target.value)}
                  >
                    {STAGE_OPTIONS.map((s) => <option key={s} value={s}>{humanStage(s)}</option>)}
                  </select>
                </td>
                <td className="table-td text-xs text-slate-500">{selectedJob?.title || '—'}</td>
              </tr>
            ))}
            {!candidates.length && (
              <tr>
                <td className="table-td text-xs text-slate-400" colSpan={4}>
                  No candidates for this vacancy yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
