import { useEffect, useState } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import {
  JOB_OPENINGS,
  PAYROLL_RUNS,
  TALENT_CYCLES,
  TALENT_ACTIONS,
  ATTENDANCE_DAILY,
  ONBOARDING_CASES,
  PERFORMANCE_GOALS,
  PERFORMANCE_REVIEWS,
} from '../data/mock'
import { Link } from 'react-router-dom'
import { Briefcase, Banknote, TrendingUp, Clock, UserPlus, Target, RefreshCw } from 'lucide-react'

const TABS = [
  { id: 'recruitment', label: 'Recruitment', icon: Briefcase },
  { id: 'onboarding', label: 'Onboarding', icon: UserPlus },
  { id: 'payroll', label: 'Payroll', icon: Banknote },
  { id: 'talent', label: 'Talent', icon: TrendingUp },
  { id: 'performance', label: 'Performance', icon: Target },
  { id: 'attendance', label: 'Attendance', icon: Clock },
]

const ONBOARD_STAGES = ['Offer accepted', 'Pre-joining', 'Day 1 complete', '90-day review']
const PIPELINE_STATUS_OPTIONS = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']
const TASK_STATUS_OPTIONS = ['pending', 'in_progress', 'completed', 'blocked']
const JOB_STATUS_OPTIONS = ['open', 'paused', 'closed']
const LEAVE_STATUS_OPTIONS = ['pending', 'approved', 'rejected']

export default function HRErpPage() {
  const [tab, setTab] = useState('recruitment')
  const [hrmsJobs, setHrmsJobs] = useState([])
  const [recruitmentRows, setRecruitmentRows] = useState(JOB_OPENINGS)
  const [onboardingRows, setOnboardingRows] = useState(ONBOARDING_CASES)
  const [isHrmsLoading, setIsHrmsLoading] = useState(false)
  const [hrmsMessage, setHrmsMessage] = useState('')
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newJobDept, setNewJobDept] = useState('')
  const [isCreatingJob, setIsCreatingJob] = useState(false)
  const [candidateJobId, setCandidateJobId] = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [isCreatingCandidate, setIsCreatingCandidate] = useState(false)
  const [candidateOptions, setCandidateOptions] = useState([])
  const [taskCandidateId, setTaskCandidateId] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskOwner, setTaskOwner] = useState('')
  const [taskDueAt, setTaskDueAt] = useState('')
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [interviewCandidateId, setInterviewCandidateId] = useState('')
  const [interviewerName, setInterviewerName] = useState('')
  const [interviewAt, setInterviewAt] = useState('')
  const [isSchedulingInterview, setIsSchedulingInterview] = useState(false)
  const [interviewRows, setInterviewRows] = useState([])
  const [taskRows, setTaskRows] = useState([])
  const [isHiringCandidate, setIsHiringCandidate] = useState(false)
  const [analytics, setAnalytics] = useState(null)
  const [recruitmentSearch, setRecruitmentSearch] = useState('')
  const [recruitmentStatusFilter, setRecruitmentStatusFilter] = useState('all')
  const [decisionStatus, setDecisionStatus] = useState('applied')
  const [decisionNotes, setDecisionNotes] = useState('')
  const [decisionScore, setDecisionScore] = useState('')
  const [isSavingDecision, setIsSavingDecision] = useState(false)
  const [isBulkUpdatingTasks, setIsBulkUpdatingTasks] = useState(false)
  const [selectedInterviewId, setSelectedInterviewId] = useState('')
  const [interviewFeedbackDraft, setInterviewFeedbackDraft] = useState('')
  const [isSavingInterviewFeedback, setIsSavingInterviewFeedback] = useState(false)
  const [payrollRows, setPayrollRows] = useState(PAYROLL_RUNS)
  const [attendanceRows, setAttendanceRows] = useState(ATTENDANCE_DAILY)
  const [payrollPeriodLabel, setPayrollPeriodLabel] = useState('')
  const [payrollStartDate, setPayrollStartDate] = useState('')
  const [payrollEndDate, setPayrollEndDate] = useState('')
  const [payrollPayDate, setPayrollPayDate] = useState('')
  const [payrollStaffPaid, setPayrollStaffPaid] = useState('')
  const [payrollGross, setPayrollGross] = useState('')
  const [payrollDeductions, setPayrollDeductions] = useState('')
  const [payrollNet, setPayrollNet] = useState('')
  const [isCreatingPayrollRun, setIsCreatingPayrollRun] = useState(false)
  const [attendanceEmployeeName, setAttendanceEmployeeName] = useState('')
  const [attendanceDepartment, setAttendanceDepartment] = useState('HR')
  const [attendanceWorkDate, setAttendanceWorkDate] = useState(new Date().toISOString().slice(0, 10))
  const [attendanceStatus, setAttendanceStatus] = useState('present')
  const [isLoggingAttendance, setIsLoggingAttendance] = useState(false)
  const [workforceAnalytics, setWorkforceAnalytics] = useState(null)
  const [leaveRows, setLeaveRows] = useState([])
  const [isUpdatingLeaveStatus, setIsUpdatingLeaveStatus] = useState(false)
  const [isUpdatingPayrollStatus, setIsUpdatingPayrollStatus] = useState(false)
  const [leaveBalanceRows, setLeaveBalanceRows] = useState([])
  const [attendanceOvertimeHours, setAttendanceOvertimeHours] = useState(0)
  const [isClockingAttendance, setIsClockingAttendance] = useState(false)
  const [isRollingUpPayroll, setIsRollingUpPayroll] = useState(false)
  const [leavePolicy, setLeavePolicy] = useState(null)
  const [leaveAccrualRows, setLeaveAccrualRows] = useState([])
  const [isSavingLeavePolicy, setIsSavingLeavePolicy] = useState(false)
  const [postingConfig, setPostingConfig] = useState({ posting_mode: 'manual', auto_post_on_publish: false, journal_target: 'general-ledger' })
  const [isSavingPostingConfig, setIsSavingPostingConfig] = useState(false)
  const [isPostingPayrollRun, setIsPostingPayrollRun] = useState(false)
  const [isExportingPayrollReport, setIsExportingPayrollReport] = useState(false)
  const [auditTrailRows, setAuditTrailRows] = useState([])

  const fetchJson = async (url, options = {}) => {
    const response = await fetch(url, { ...options, credentials: 'include' })
    const text = await response.text()
    const data = text ? JSON.parse(text) : {}
    if (!response.ok) throw new Error(data?.error || `Request failed: ${response.status}`)
    return data
  }

  const handlePayrollRollup = async () => {
    if (!payrollPeriodLabel.trim() || !payrollStartDate || !payrollEndDate || !payrollPayDate) {
      setHrmsMessage('Set period label, start/end dates, and pay date before auto rollup.')
      return
    }

    setIsRollingUpPayroll(true)
    try {
      await fetchJson('/api/hrms/payroll-runs/rollup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period_label: payrollPeriodLabel.trim(),
          period_start: payrollStartDate,
          period_end: payrollEndDate,
          pay_date: payrollPayDate,
        }),
      })
      setHrmsMessage('Payroll auto-rollup completed and saved as draft run.')
      await loadStage3Ops()
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to auto-rollup payroll run.')
    } finally {
      setIsRollingUpPayroll(false)
    }
  }

  const handleSaveLeavePolicy = async () => {
    if (!leavePolicy) return
    setIsSavingLeavePolicy(true)
    try {
      await fetchJson('/api/hrms/leave-policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leavePolicy),
      })
      setHrmsMessage('Leave policy updated.')
      await loadStage3Ops()
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to update leave policy.')
    } finally {
      setIsSavingLeavePolicy(false)
    }
  }

  const handleSavePostingConfig = async () => {
    setIsSavingPostingConfig(true)
    try {
      await fetchJson('/api/hrms/payroll-posting-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postingConfig),
      })
      setHrmsMessage('Payroll posting config updated.')
      await loadStage3Ops()
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to update posting config.')
    } finally {
      setIsSavingPostingConfig(false)
    }
  }

  const handlePostPayrollRun = async (payrollRunId) => {
    if (!payrollRunId) return
    setIsPostingPayrollRun(true)
    try {
      await fetchJson(`/api/hrms/payroll-runs/${payrollRunId}/post`, { method: 'POST' })
      setHrmsMessage('Payroll run posted to configured journal.')
      await loadStage3Ops()
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to post payroll run.')
    } finally {
      setIsPostingPayrollRun(false)
    }
  }

  const handleExportPayrollReport = async (format = 'csv') => {
    setIsExportingPayrollReport(true)
    try {
      const response = await fetch(`/api/hrms/payroll-runs/report?format=${format}`, { credentials: 'include' })
      if (!response.ok) {
        const text = await response.text()
        const data = text ? JSON.parse(text) : {}
        throw new Error(data?.error || `Report export failed: ${response.status}`)
      }
      if (format === 'csv') {
        const blob = await response.blob()
        const link = document.createElement('a')
        const url = window.URL.createObjectURL(blob)
        link.href = url
        link.download = `payroll_report_${new Date().toISOString().slice(0, 10)}.csv`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      }
      setHrmsMessage(`Payroll report export (${format.toUpperCase()}) ready.`)
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to export payroll report.')
    } finally {
      setIsExportingPayrollReport(false)
    }
  }

  const loadStage3Ops = async () => {
    try {
      const [
        payrollData,
        attendanceData,
        leaveData,
        workforceData,
        leaveBalanceData,
        leavePolicyData,
        leaveAccrualData,
        postingConfigData,
        auditData,
      ] = await Promise.all([
        fetchJson('/api/hrms/payroll-runs'),
        fetchJson('/api/hrms/attendance-summary'),
        fetchJson('/api/hrms/leave-requests'),
        fetchJson('/api/hrms/workforce-analytics'),
        fetchJson('/api/hrms/leave-balances'),
        fetchJson('/api/hrms/leave-policy'),
        fetchJson('/api/hrms/leave-accrual-preview'),
        fetchJson('/api/hrms/payroll-posting-config'),
        fetchJson('/api/hrms/audit-trail?limit=20'),
      ])

      const payrollItems = (payrollData.items || []).map((row) => {
        const gross = Number(row.gross_total || 0)
        const deductions = Number(row.deductions_total || 0)
        const variance = gross > 0 ? `${((deductions / gross) * 100).toFixed(2)}%` : '0.00%'
        return {
          id: row.id,
          statusKey: row.status,
          period: row.period_label,
          status: row.status ? `${row.status.charAt(0).toUpperCase()}${row.status.slice(1)}` : 'Processed',
          payDate: row.pay_date ? new Date(row.pay_date).toLocaleDateString() : '—',
          staffPaid: row.staff_paid ?? 0,
          net: `₦${Number(row.net_total || 0).toLocaleString()}`,
          variance,
        }
      })

      const attendanceItems = (attendanceData.items || []).map((row) => ({
        site: row.site,
        present: row.present,
        expected: row.expected,
        rate: row.rate,
      }))

      const leaveBalanceItems = (leaveBalanceData.items || []).map((row) => ({
        employeeId: row.employee_id,
        employeeName: row.employee_name,
        department: row.department,
        annualRemaining: row?.remaining?.annual ?? 0,
        sickRemaining: row?.remaining?.sick ?? 0,
        studyRemaining: row?.remaining?.study ?? 0,
        totalUsed: row.total_used ?? 0,
      }))

      const leaveItems = (leaveData.items || []).map((row) => ({
        id: row.id,
        leaveType: row.leave_type,
        status: row.status,
        startDate: row.start_date,
        endDate: row.end_date,
        durationDays: row.duration_days,
      }))

      setPayrollRows(payrollItems.length ? payrollItems : PAYROLL_RUNS)
      setAttendanceRows(attendanceItems.length ? attendanceItems : ATTENDANCE_DAILY)
      setLeaveRows(leaveItems)
      setLeaveBalanceRows(leaveBalanceItems)
      setAttendanceOvertimeHours(attendanceData.overtime_hours ?? 0)
      setLeavePolicy(leavePolicyData.policy || null)
      setLeaveAccrualRows(leaveAccrualData.items || [])
      setPostingConfig(postingConfigData.config || { posting_mode: 'manual', auto_post_on_publish: false, journal_target: 'general-ledger' })
      setAuditTrailRows(auditData.items || [])
      setWorkforceAnalytics(workforceData.analytics || null)
    } catch {
      setPayrollRows(PAYROLL_RUNS)
      setAttendanceRows(ATTENDANCE_DAILY)
      setLeaveRows([])
      setLeaveBalanceRows([])
      setAttendanceOvertimeHours(0)
      setLeavePolicy(null)
      setLeaveAccrualRows([])
      setPostingConfig({ posting_mode: 'manual', auto_post_on_publish: false, journal_target: 'general-ledger' })
      setAuditTrailRows([])
      setWorkforceAnalytics(null)
    }
  }

  const handleClockAttendance = async (mode) => {
    if (!attendanceEmployeeName.trim() || !attendanceWorkDate) return
    const endpoint = mode === 'out' ? '/api/hrms/attendance-records/clock-out' : '/api/hrms/attendance-records/clock-in'
    setIsClockingAttendance(true)
    try {
      await fetchJson(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_name: attendanceEmployeeName.trim(),
          department: attendanceDepartment.trim() || undefined,
          work_date: attendanceWorkDate,
        }),
      })
      setHrmsMessage(mode === 'out' ? 'Clock-out recorded.' : 'Clock-in recorded.')
      await loadStage3Ops()
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to update attendance clock event.')
    } finally {
      setIsClockingAttendance(false)
    }
  }

  const handleUpdateLeaveStatus = async (leaveRequestId, nextStatus) => {
    if (!leaveRequestId || !LEAVE_STATUS_OPTIONS.includes(nextStatus)) return
    setIsUpdatingLeaveStatus(true)
    try {
      await fetchJson(`/api/hrms/leave-requests/${leaveRequestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      setHrmsMessage(`Leave request ${nextStatus}.`)
      await loadStage3Ops()
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to update leave request.')
    } finally {
      setIsUpdatingLeaveStatus(false)
    }
  }

  const handlePayrollStatusTransition = async (payrollRunId, nextStatus) => {
    if (!payrollRunId || !nextStatus) return
    setIsUpdatingPayrollStatus(true)
    try {
      await fetchJson(`/api/hrms/payroll-runs/${payrollRunId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      setHrmsMessage(`Payroll run moved to ${nextStatus}.`)
      await loadStage3Ops()
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to transition payroll run.')
    } finally {
      setIsUpdatingPayrollStatus(false)
    }
  }

  const handleCreatePayrollRun = async (e) => {
    e.preventDefault()
    if (!payrollPeriodLabel.trim() || !payrollStartDate || !payrollEndDate || !payrollPayDate) return

    setIsCreatingPayrollRun(true)
    try {
      await fetchJson('/api/hrms/payroll-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period_label: payrollPeriodLabel.trim(),
          period_start: payrollStartDate,
          period_end: payrollEndDate,
          pay_date: payrollPayDate,
          status: 'processed',
          staff_paid: payrollStaffPaid === '' ? 0 : Number(payrollStaffPaid),
          gross_total: payrollGross === '' ? 0 : Number(payrollGross),
          deductions_total: payrollDeductions === '' ? 0 : Number(payrollDeductions),
          net_total: payrollNet === '' ? 0 : Number(payrollNet),
        }),
      })

      setPayrollPeriodLabel('')
      setPayrollStartDate('')
      setPayrollEndDate('')
      setPayrollPayDate('')
      setPayrollStaffPaid('')
      setPayrollGross('')
      setPayrollDeductions('')
      setPayrollNet('')
      setHrmsMessage('Payroll run created.')
      await loadStage3Ops()
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to create payroll run.')
    } finally {
      setIsCreatingPayrollRun(false)
    }
  }

  const handleLogAttendance = async (e) => {
    e.preventDefault()
    if (!attendanceEmployeeName.trim() || !attendanceWorkDate) return

    setIsLoggingAttendance(true)
    try {
      await fetchJson('/api/hrms/attendance-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_name: attendanceEmployeeName.trim(),
          department: attendanceDepartment.trim() || undefined,
          work_date: attendanceWorkDate,
          status: attendanceStatus,
          source: 'manual',
        }),
      })
      setAttendanceEmployeeName('')
      setHrmsMessage('Attendance record logged.')
      await loadStage3Ops()
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to log attendance record.')
    } finally {
      setIsLoggingAttendance(false)
    }
  }

  const handleJobStatusUpdate = async (jobId, nextStatus) => {
    if (!jobId) return
    try {
      await fetchJson(`/api/hrms/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      setHrmsMessage(`Job status updated to ${nextStatus}.`)
      await loadHrmsOps()
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to update job status.')
    }
  }

  const handleSaveInterviewFeedback = async () => {
    if (!selectedInterviewId) return
    setIsSavingInterviewFeedback(true)
    try {
      await fetchJson(`/api/hrms/interviews/${selectedInterviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: interviewFeedbackDraft.trim() || null }),
      })
      setHrmsMessage('Interview feedback saved.')
      await loadCandidateDetails(interviewCandidateId)
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to save interview feedback.')
    } finally {
      setIsSavingInterviewFeedback(false)
    }
  }

  const handleSaveCandidateDecision = async (nextStatus = null) => {
    if (!interviewCandidateId) return
    const statusToSave = nextStatus || decisionStatus
    const trimmedScore = String(decisionScore ?? '').trim()
    if (trimmedScore !== '') {
      const parsedScore = Number(trimmedScore)
      if (Number.isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
        setHrmsMessage('Candidate score must be between 0 and 100.')
        return
      }
    }

    setIsSavingDecision(true)
    try {
      await fetchJson(`/api/hrms/candidates/${interviewCandidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusToSave,
          notes: decisionNotes.trim() || undefined,
          score: trimmedScore === '' ? null : Number(trimmedScore),
        }),
      })
      setDecisionStatus(statusToSave)
      setHrmsMessage(`Candidate decision saved (${humanizeCandidateStage(statusToSave)}).`)
      await loadHrmsOps()
      await loadCandidateDetails(interviewCandidateId)
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to save candidate decision.')
    } finally {
      setIsSavingDecision(false)
    }
  }

  const handleBulkTaskAction = async (action) => {
    if (!interviewCandidateId) return
    setIsBulkUpdatingTasks(true)
    try {
      await fetchJson(`/api/hrms/candidates/${interviewCandidateId}/onboarding-tasks/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const messageMap = {
        complete_all: 'All onboarding tasks marked complete.',
        complete_pending: 'Pending onboarding tasks marked complete.',
        reset_all: 'Onboarding tasks reset to pending.',
      }
      setHrmsMessage(messageMap[action] || 'Onboarding tasks updated.')
      await loadCandidateDetails(interviewCandidateId)
      await loadHrmsOps()
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to update onboarding tasks.')
    } finally {
      setIsBulkUpdatingTasks(false)
    }
  }

  const filteredRecruitmentRows = recruitmentRows.filter((row) => {
    const q = recruitmentSearch.trim().toLowerCase()
    const matchesSearch =
      !q ||
      String(row.title || '').toLowerCase().includes(q) ||
      String(row.dept || '').toLowerCase().includes(q) ||
      String(row.ref || '').toLowerCase().includes(q)
    const matchesStatus = recruitmentStatusFilter === 'all' || row.jobStatus === recruitmentStatusFilter
    return matchesSearch && matchesStatus
  })

  const loadAnalytics = async () => {
    try {
      const data = await fetchJson('/api/hrms/recruitment-analytics')
      setAnalytics(data.analytics || null)
    } catch {
      setAnalytics(null)
    }
  }

  const handleHireCandidate = async (candidateId) => {
    if (!candidateId) return
    setIsHiringCandidate(true)
    try {
      await fetchJson(`/api/hrms/candidates/${candidateId}/hire`, {
        method: 'POST',
      })
      setHrmsMessage('Candidate hired and onboarding initialized.')
      await loadHrmsOps()
      await loadCandidateDetails(interviewCandidateId)
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to hire candidate.')
    } finally {
      setIsHiringCandidate(false)
    }
  }

  const handleInterviewFeedback = async (interviewId, patch) => {
    try {
      await fetchJson(`/api/hrms/interviews/${interviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      setHrmsMessage('Interview feedback updated.')
      await loadCandidateDetails(interviewCandidateId)
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to update interview feedback.')
    }
  }

  const handleTaskStatusUpdate = async (taskId, nextStatus) => {
    try {
      await fetchJson(`/api/hrms/onboarding-tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      setHrmsMessage(`Onboarding task updated to ${nextStatus}.`)
      await loadCandidateDetails(interviewCandidateId)
      await loadHrmsOps()
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to update onboarding task status.')
    }
  }

  const loadCandidateDetails = async (candidateId) => {
    if (!candidateId) {
      setInterviewRows([])
      setTaskRows([])
      setSelectedInterviewId('')
      setInterviewFeedbackDraft('')
      return
    }

    const id = String(candidateId)

    try {
      const [interviewData, taskData] = await Promise.all([
        fetchJson(`/api/hrms/candidates/${id}/interviews`),
        fetchJson(`/api/hrms/candidates/${id}/onboarding-tasks`),
      ])
      setInterviewRows(interviewData.items || [])
      setTaskRows(taskData.items || [])
    } catch {
      setInterviewRows([])
      setTaskRows([])
      setSelectedInterviewId('')
      setInterviewFeedbackDraft('')
    }
  }

  const handleScheduleInterview = async (e) => {
    e.preventDefault()
    if (!interviewCandidateId || !interviewerName.trim() || !interviewAt) return

    setIsSchedulingInterview(true)
    try {
      await fetchJson(`/api/hrms/candidates/${interviewCandidateId}/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewer_name: interviewerName.trim(),
          scheduled_at: new Date(interviewAt).toISOString(),
        }),
      })
      setInterviewerName('')
      setInterviewAt('')
      setHrmsMessage('Interview scheduled successfully.')
      await loadHrmsOps()
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to schedule interview.')
    } finally {
      setIsSchedulingInterview(false)
    }
  }

  const handleCreateOnboardingTask = async (e) => {
    e.preventDefault()
    if (!taskCandidateId || !taskTitle.trim()) return

    setIsCreatingTask(true)
    try {
      await fetchJson(`/api/hrms/candidates/${taskCandidateId}/onboarding-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle.trim(),
          owner: taskOwner.trim() || undefined,
          due_date: taskDueAt ? new Date(taskDueAt).toISOString() : undefined,
          status: 'pending',
        }),
      })
      setTaskTitle('')
      setTaskOwner('')
      setTaskDueAt('')
      setHrmsMessage('Onboarding task created.')
      await loadHrmsOps()
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to create onboarding task.')
    } finally {
      setIsCreatingTask(false)
    }
  }

  const handleUpdatePipeline = async (row, nextStatus) => {
    if (!row?.candidateId) return
    try {
      await fetchJson(`/api/hrms/candidates/${row.candidateId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      setHrmsMessage(`Candidate status updated to ${humanizeCandidateStage(nextStatus)}.`)
      await loadHrmsOps()
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to update candidate status.')
    }
  }

  const humanizeCandidateStage = (status) => {
    const map = {
      applied: 'Applied',
      screening: 'Screening',
      interview: 'Interviewing',
      offer: 'Offer',
      hired: 'Hired',
      rejected: 'Rejected',
    }
    return map[status] || 'Open'
  }

  const loadHrmsOps = async () => {
    setIsHrmsLoading(true)
    try {
      const jobsData = await fetchJson('/api/hrms/jobs')
      const jobs = jobsData.items || []
      setHrmsJobs(jobs)
      if (!jobs.length) {
        setRecruitmentRows(JOB_OPENINGS)
        setOnboardingRows(ONBOARDING_CASES)
        setHrmsMessage('No HRMS jobs found yet. Showing starter demo data.')
        return
      }

      const jobWithCandidates = await Promise.all(
        jobs.map(async (job) => {
          try {
            const candData = await fetchJson(`/api/hrms/jobs/${job.id}/candidates`)
            return { job, candidates: candData.items || [] }
          } catch {
            return { job, candidates: [] }
          }
        })
      )

      const nextRecruitmentRows = jobWithCandidates.map(({ job, candidates }) => {
        const stageSource = candidates.find((c) => c.status && c.status !== 'applied') || candidates[0]
        return {
          jobId: job.id,
          jobStatus: job.status || 'open',
          candidateId: stageSource?.id || null,
          stageKey: stageSource?.status || 'applied',
          ref: `HR-${String(job.id).padStart(4, '0')}`,
          title: job.title,
          dept: job.department || 'HR',
          grade: job.employment_type || 'Open',
          closes: job.updated_at ? new Date(job.updated_at).toLocaleDateString() : '—',
          applicants: candidates.length,
          stage: humanizeCandidateStage(stageSource?.status),
        }
      })

      const flattened = jobWithCandidates.flatMap(({ job, candidates }) =>
        candidates.map((candidate) => ({
          candidate,
          job,
        }))
      )

      setCandidateOptions(
        flattened.map(({ candidate, job }) => ({
          id: candidate.id,
          label: `${candidate.full_name} — ${job.title}`,
          status: candidate.status || 'applied',
          notes: candidate.notes || '',
          score: candidate.score ?? '',
        }))
      )

      const nextOnboardingRows = await Promise.all(
        flattened.slice(0, 20).map(async ({ candidate, job }) => {
          let tasks = []
          try {
            const taskData = await fetchJson(`/api/hrms/candidates/${candidate.id}/onboarding-tasks`)
            tasks = taskData.items || []
          } catch {
            tasks = []
          }

          const tasksDone = tasks.filter((t) => t.status === 'completed').length
          const tasksTotal = tasks.length || 1
          return {
            id: `ONB-${candidate.id}`,
            candidateId: candidate.id,
            name: candidate.full_name,
            role: job.title,
            dept: job.department || 'HR',
            startDate: candidate.updated_at ? new Date(candidate.updated_at).toLocaleDateString() : '—',
            stage: humanizeCandidateStage(candidate.status),
            owner: tasks[0]?.owner || 'HR Ops',
            tasksDone,
            tasksTotal,
          }
        })
      )

      setRecruitmentRows(nextRecruitmentRows.length ? nextRecruitmentRows : JOB_OPENINGS)
      setOnboardingRows(nextOnboardingRows.length ? nextOnboardingRows : ONBOARDING_CASES)
      await loadStage3Ops()
      setHrmsMessage('Synced from HRMS API.')
      await loadAnalytics()
    } catch {
      setHrmsJobs([])
      setCandidateOptions([])
      setRecruitmentRows(JOB_OPENINGS)
      setOnboardingRows(ONBOARDING_CASES)
      setPayrollRows(PAYROLL_RUNS)
      setAttendanceRows(ATTENDANCE_DAILY)
      setHrmsMessage('HRMS API unavailable. Showing demo data.')
      setAnalytics(null)
    } finally {
      setIsHrmsLoading(false)
    }
  }

  useEffect(() => {
    loadHrmsOps()
  }, [])

  useEffect(() => {
    if (!candidateJobId && hrmsJobs.length) {
      setCandidateJobId(String(hrmsJobs[0].id))
    }
  }, [hrmsJobs, candidateJobId])

  useEffect(() => {
    if (!taskCandidateId && onboardingRows.length) {
      const first = onboardingRows.find((row) => row.candidateId)
      if (first) setTaskCandidateId(String(first.candidateId))
    }
  }, [onboardingRows, taskCandidateId])

  useEffect(() => {
    if (!interviewCandidateId && candidateOptions.length) {
      setInterviewCandidateId(String(candidateOptions[0].id))
    }
  }, [candidateOptions, interviewCandidateId])

  useEffect(() => {
    const selectedOption = candidateOptions.find((opt) => String(opt.id) === String(interviewCandidateId))
    if (selectedOption) {
      setDecisionStatus(selectedOption.status || 'applied')
      setDecisionNotes(selectedOption.notes || '')
      setDecisionScore(selectedOption.score === '' ? '' : String(selectedOption.score))
    } else {
      setDecisionStatus('applied')
      setDecisionNotes('')
      setDecisionScore('')
    }
  }, [candidateOptions, interviewCandidateId])

  useEffect(() => {
    loadCandidateDetails(interviewCandidateId)
  }, [interviewCandidateId])

  useEffect(() => {
    if (!interviewRows.length) {
      setSelectedInterviewId('')
      setInterviewFeedbackDraft('')
      return
    }

    const hasSelected = interviewRows.some((row) => String(row.id) === String(selectedInterviewId))
    const target = hasSelected
      ? interviewRows.find((row) => String(row.id) === String(selectedInterviewId))
      : interviewRows[0]

    if (!hasSelected) {
      setSelectedInterviewId(String(target.id))
    }
    setInterviewFeedbackDraft(target?.feedback || '')
  }, [interviewRows])

  const handleCreateJob = async (e) => {
    e.preventDefault()
    if (!newJobTitle.trim()) return

    setIsCreatingJob(true)
    try {
      await fetchJson('/api/hrms/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newJobTitle.trim(),
          department: newJobDept.trim() || undefined,
          status: 'open',
        }),
      })
      setNewJobTitle('')
      setNewJobDept('')
      setHrmsMessage('Job posting created.')
      await loadHrmsOps()
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to create job posting.')
    } finally {
      setIsCreatingJob(false)
    }
  }

  const handleCreateCandidate = async (e) => {
    e.preventDefault()
    if (!candidateJobId || !candidateName.trim()) return

    setIsCreatingCandidate(true)
    try {
      await fetchJson(`/api/hrms/jobs/${candidateJobId}/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: candidateName.trim(),
          email: candidateEmail.trim() || undefined,
          status: 'applied',
        }),
      })
      setCandidateName('')
      setCandidateEmail('')
      setHrmsMessage('Candidate added to pipeline.')
      await loadHrmsOps()
    } catch (err) {
      setHrmsMessage(err.message || 'Failed to create candidate.')
    } finally {
      setIsCreatingCandidate(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">HR operations</h1>
          <p className="text-sm text-slate-400">
            Recruitment, onboarding, payroll runs, talent, performance cycles, and attendance — connect each area to your HRIS / payroll engine when ready.
          </p>
          <p className="text-xs mt-1">
            <Link to="/app/human-resource/enterprise" className="font-semibold text-[#006838] hover:underline">
              Enterprise HRMS suite
            </Link>{' '}
            — full 12-module map (dashboard, departments, benefits, compliance, integrations, and more).
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-6 bg-white border border-slate-100 rounded-2xl p-1 shadow-sm w-fit max-w-full">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              tab === t.id ? 'bg-[#006838] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={loadHrmsOps} className="btn-secondary text-xs py-1.5 px-3" disabled={isHrmsLoading}>
          <span className="inline-flex items-center gap-1.5">
            <RefreshCw size={13} />
            {isHrmsLoading ? 'Syncing...' : 'Sync HRMS data'}
          </span>
        </button>
        <p className="text-xs text-slate-400">{hrmsMessage}</p>
      </div>

      {tab === 'recruitment' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Open jobs', value: String(analytics?.open_jobs ?? hrmsJobs.length), tone: 'text-[#006838] bg-green-50' },
              { label: 'Candidates', value: String(analytics?.total_candidates ?? recruitmentRows.reduce((sum, row) => sum + (row.applicants || 0), 0)), tone: 'text-blue-600 bg-blue-50' },
              { label: 'Hired', value: String(analytics?.pipeline?.hired ?? 0), tone: 'text-purple-600 bg-purple-50' },
              { label: 'Onboarding %', value: `${analytics?.onboarding_completion_rate ?? 0}%`, tone: 'text-amber-600 bg-amber-50' },
            ].map((k) => (
              <div key={k.label} className="stat-card">
                <div className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold ${k.tone}`}>{k.label}</div>
                <p className="mt-2 text-xl font-extrabold text-slate-900">{k.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <form className="card space-y-3" onSubmit={handleCreateJob}>
              <h3 className="text-sm font-bold text-slate-800">Create vacancy</h3>
              <input
                className="input"
                placeholder="Role title"
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
              />
              <input
                className="input"
                placeholder="Department"
                value={newJobDept}
                onChange={(e) => setNewJobDept(e.target.value)}
              />
              <button type="submit" className="btn-primary text-xs py-2" disabled={isCreatingJob || isHrmsLoading}>
                {isCreatingJob ? 'Creating...' : 'Create vacancy'}
              </button>
            </form>

            <form className="card space-y-3" onSubmit={handleCreateCandidate}>
              <h3 className="text-sm font-bold text-slate-800">Add candidate</h3>
              <select className="select" value={candidateJobId} onChange={(e) => setCandidateJobId(e.target.value)}>
                {hrmsJobs.length ? (
                  hrmsJobs.map((job) => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))
                ) : (
                  <option value="">No HRMS jobs loaded</option>
                )}
              </select>
              <input
                className="input"
                placeholder="Candidate full name"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
              <input
                className="input"
                placeholder="Candidate email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
              />
              <button type="submit" className="btn-primary text-xs py-2" disabled={isCreatingCandidate || !hrmsJobs.length || isHrmsLoading}>
                {isCreatingCandidate ? 'Adding...' : 'Add candidate'}
              </button>
            </form>
          </div>

          <form className="card space-y-3" onSubmit={handleScheduleInterview}>
            <h3 className="text-sm font-bold text-slate-800">Schedule interview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select className="select" value={interviewCandidateId} onChange={(e) => setInterviewCandidateId(e.target.value)}>
                {candidateOptions.length ? (
                  candidateOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))
                ) : (
                  <option value="">No candidates loaded</option>
                )}
              </select>
              <input
                className="input"
                placeholder="Interviewer name"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
              />
              <input
                className="input"
                type="datetime-local"
                value={interviewAt}
                onChange={(e) => setInterviewAt(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn-primary text-xs py-2"
              disabled={isSchedulingInterview || !candidateOptions.length || isHrmsLoading}
            >
              {isSchedulingInterview ? 'Scheduling...' : 'Schedule interview'}
            </button>
            <button
              type="button"
              className="btn-secondary text-xs py-2"
              disabled={isHiringCandidate || !interviewCandidateId || isHrmsLoading}
              onClick={() => handleHireCandidate(interviewCandidateId)}
            >
              {isHiringCandidate ? 'Hiring...' : 'Mark Candidate as Hired'}
            </button>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <h4 className="text-xs font-bold text-slate-700">Candidate decision & notes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <select className="select" value={decisionStatus} onChange={(e) => setDecisionStatus(e.target.value)}>
                  {PIPELINE_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{humanizeCandidateStage(status)}</option>
                  ))}
                </select>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Score (0-100)"
                  value={decisionScore}
                  onChange={(e) => setDecisionScore(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  type="button"
                  className="btn-primary text-xs py-2"
                  onClick={() => handleSaveCandidateDecision()}
                  disabled={isSavingDecision || !interviewCandidateId || isHrmsLoading}
                >
                  {isSavingDecision ? 'Saving...' : 'Save decision'}
                </button>
              </div>
              <textarea
                className="input min-h-[80px]"
                placeholder="Candidate notes (panel feedback, concerns, strengths)"
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-secondary text-[11px] py-1.5"
                  onClick={() => handleSaveCandidateDecision('interview')}
                  disabled={isSavingDecision || !interviewCandidateId || isHrmsLoading}
                >
                  Move to Interview
                </button>
                <button
                  type="button"
                  className="btn-secondary text-[11px] py-1.5"
                  onClick={() => handleSaveCandidateDecision('offer')}
                  disabled={isSavingDecision || !interviewCandidateId || isHrmsLoading}
                >
                  Move to Offer
                </button>
                <button
                  type="button"
                  className="btn-secondary text-[11px] py-1.5"
                  onClick={() => handleSaveCandidateDecision('rejected')}
                  disabled={isSavingDecision || !interviewCandidateId || isHrmsLoading}
                >
                  Reject
                </button>
              </div>
            </div>
          </form>

          {candidateOptions.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="card overflow-x-auto">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Upcoming interviews</h3>
                {interviewRows.length === 0 ? (
                  <p className="text-xs text-slate-400">No interviews yet for selected candidate.</p>
                ) : (
                  <div className="space-y-3">
                    <select
                      className="select"
                      value={selectedInterviewId}
                      onChange={(e) => {
                        const nextId = e.target.value
                        setSelectedInterviewId(nextId)
                        const nextRow = interviewRows.find((row) => String(row.id) === String(nextId))
                        setInterviewFeedbackDraft(nextRow?.feedback || '')
                      }}
                    >
                      {interviewRows.map((row) => (
                        <option key={row.id} value={row.id}>
                          {row.interviewer_name} — {row.scheduled_at ? new Date(row.scheduled_at).toLocaleString() : '—'}
                        </option>
                      ))}
                    </select>

                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="table-th text-left">Interviewer</th>
                          <th className="table-th text-left">Scheduled</th>
                          <th className="table-th text-left">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {interviewRows.map((row) => (
                          <tr key={row.id} className="border-b border-slate-50 last:border-0">
                            <td className="table-td font-semibold text-slate-800">{row.interviewer_name}</td>
                            <td className="table-td text-slate-500">{row.scheduled_at ? new Date(row.scheduled_at).toLocaleString() : '—'}</td>
                            <td className="table-td text-slate-500">
                              <select
                                className="text-[10px] font-semibold border border-slate-200 rounded-lg px-2 py-1 bg-white"
                                value={row.rating ?? ''}
                                onChange={(e) => handleInterviewFeedback(row.id, { rating: e.target.value ? Number(e.target.value) : null })}
                              >
                                <option value="">—</option>
                                {[1, 2, 3, 4, 5].map((r) => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="space-y-2">
                      <textarea
                        className="input min-h-[72px]"
                        placeholder="Interview feedback notes"
                        value={interviewFeedbackDraft}
                        onChange={(e) => setInterviewFeedbackDraft(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-secondary text-xs py-2"
                        onClick={handleSaveInterviewFeedback}
                        disabled={isSavingInterviewFeedback || !selectedInterviewId || isHrmsLoading}
                      >
                        {isSavingInterviewFeedback ? 'Saving feedback...' : 'Save interview feedback'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="card overflow-x-auto">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Onboarding checklist</h3>
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-secondary text-[11px] py-1.5"
                    onClick={() => handleBulkTaskAction('complete_all')}
                    disabled={isBulkUpdatingTasks || !interviewCandidateId || isHrmsLoading}
                  >
                    Mark all complete
                  </button>
                  <button
                    type="button"
                    className="btn-secondary text-[11px] py-1.5"
                    onClick={() => handleBulkTaskAction('complete_pending')}
                    disabled={isBulkUpdatingTasks || !interviewCandidateId || isHrmsLoading}
                  >
                    Complete pending only
                  </button>
                  <button
                    type="button"
                    className="btn-secondary text-[11px] py-1.5"
                    onClick={() => handleBulkTaskAction('reset_all')}
                    disabled={isBulkUpdatingTasks || !interviewCandidateId || isHrmsLoading}
                  >
                    Reset all to pending
                  </button>
                </div>
                {taskRows.length === 0 ? (
                  <p className="text-xs text-slate-400">No onboarding tasks yet for selected candidate.</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="table-th text-left">Task</th>
                        <th className="table-th text-left">Owner</th>
                        <th className="table-th text-left">Due</th>
                        <th className="table-th text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taskRows.map((row) => (
                        <tr key={row.id} className="border-b border-slate-50 last:border-0">
                          <td className="table-td font-semibold text-slate-800">{row.title}</td>
                          <td className="table-td text-slate-500">{row.owner || '—'}</td>
                          <td className="table-td text-slate-500">{row.due_date ? new Date(row.due_date).toLocaleString() : '—'}</td>
                          <td className="table-td">
                            <select
                              className="text-[10px] font-semibold border border-slate-200 rounded-lg px-2 py-1 bg-white"
                              value={row.status}
                              onChange={(e) => handleTaskStatusUpdate(row.id, e.target.value)}
                              disabled={isHrmsLoading}
                            >
                              {TASK_STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          <div className="card overflow-x-auto">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Open vacancies</h2>
            <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                className="input"
                placeholder="Search by role, dept, or ref"
                value={recruitmentSearch}
                onChange={(e) => setRecruitmentSearch(e.target.value)}
              />
              <select className="select" value={recruitmentStatusFilter} onChange={(e) => setRecruitmentStatusFilter(e.target.value)}>
                <option value="all">All vacancy statuses</option>
                {JOB_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-th text-left">Ref</th>
                  <th className="table-th text-left">Role</th>
                  <th className="table-th text-left">Dept</th>
                  <th className="table-th text-left">Vacancy</th>
                  <th className="table-th text-left">Grade</th>
                  <th className="table-th text-left">Closes</th>
                  <th className="table-th text-left">Applicants</th>
                  <th className="table-th text-left">Stage</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecruitmentRows.map((j, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/80">
                    <td className="table-td font-mono text-xs">{j.ref}</td>
                    <td className="table-td font-semibold text-slate-800">{j.title}</td>
                    <td className="table-td">{j.dept}</td>
                    <td className="table-td">
                      <select
                        className="text-[10px] font-semibold border border-slate-200 rounded-lg px-2 py-1 bg-white"
                        value={j.jobStatus}
                        onChange={(e) => handleJobStatusUpdate(j.jobId, e.target.value)}
                        disabled={isHrmsLoading}
                      >
                        {JOB_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="table-td">{j.grade}</td>
                    <td className="table-td text-slate-500 text-xs">{j.closes}</td>
                    <td className="table-td">{j.applicants}</td>
                    <td className="table-td">
                      {j.candidateId ? (
                        <select
                          className="text-[10px] font-semibold border border-slate-200 rounded-lg px-2 py-1 bg-white"
                          value={j.stageKey}
                          onChange={(e) => handleUpdatePipeline(j, e.target.value)}
                          disabled={isHrmsLoading}
                        >
                          {PIPELINE_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>{humanizeCandidateStage(status)}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="badge badge-blue text-[10px]">{j.stage}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!filteredRecruitmentRows.length && (
                  <tr>
                    <td className="table-td text-slate-400 text-xs" colSpan={8}>
                      No vacancies match the current search/filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400">
            Full ATS features (requisition approval, interview panels, offer letters) plug in via API. Use the <strong>Onboarding</strong> tab for post-offer tasks.
          </p>
        </div>
      )}

      {tab === 'onboarding' && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {ONBOARD_STAGES.map((s) => (
              <span key={s} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {s}
              </span>
            ))}
          </div>
          <form className="card space-y-3" onSubmit={handleCreateOnboardingTask}>
            <h3 className="text-sm font-bold text-slate-800">Create onboarding task</h3>
            <select className="select" value={taskCandidateId} onChange={(e) => setTaskCandidateId(e.target.value)}>
              {onboardingRows.filter((row) => row.candidateId).length ? (
                onboardingRows
                  .filter((row) => row.candidateId)
                  .map((row) => (
                    <option key={row.id} value={row.candidateId}>
                      {row.name} — {row.role}
                    </option>
                  ))
              ) : (
                <option value="">No candidates loaded</option>
              )}
            </select>
            <input
              className="input"
              placeholder="Task title (e.g. Contract signed)"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <input
              className="input"
              placeholder="Task owner"
              value={taskOwner}
              onChange={(e) => setTaskOwner(e.target.value)}
            />
            <input
              className="input"
              type="datetime-local"
              value={taskDueAt}
              onChange={(e) => setTaskDueAt(e.target.value)}
            />
            <button
              type="submit"
              className="btn-primary text-xs py-2"
              disabled={isCreatingTask || !taskCandidateId || isHrmsLoading}
            >
              {isCreatingTask ? 'Creating...' : 'Create onboarding task'}
            </button>
          </form>
          <div className="card overflow-x-auto">
            <h2 className="text-sm font-bold text-slate-800 mb-4">New starters & pipeline</h2>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-th text-left">Case</th>
                  <th className="table-th text-left">Name</th>
                  <th className="table-th text-left">Role / Dept</th>
                  <th className="table-th text-left">Start</th>
                  <th className="table-th text-left">Stage</th>
                  <th className="table-th text-left">HR owner</th>
                  <th className="table-th text-left">Checklist</th>
                </tr>
              </thead>
              <tbody>
                {onboardingRows.map((o) => (
                  <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/80">
                    <td className="table-td font-mono text-xs">{o.id}</td>
                    <td className="table-td font-semibold text-slate-800">{o.name}</td>
                    <td className="table-td">
                      <span className="block text-xs">{o.role}</span>
                      <span className="text-[10px] text-slate-400">{o.dept}</span>
                    </td>
                    <td className="table-td text-slate-500 text-xs">{o.startDate}</td>
                    <td className="table-td">
                      <span className="badge badge-green text-[10px]">{o.stage}</span>
                    </td>
                    <td className="table-td font-mono text-xs">{o.owner}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[48px]">
                          <div
                            className="h-full bg-[#006838] rounded-full"
                            style={{ width: `${(o.tasksDone / o.tasksTotal) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          {o.tasksDone}/{o.tasksTotal}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400">
            Typical checklist items: contract signed, ICT account, ID card, induction, benefits enrolment — wire to task service in production.
          </p>
        </div>
      )}

      {tab === 'payroll' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Payroll runs', value: String(workforceAnalytics?.payroll?.runs_count ?? payrollRows.length), tone: 'text-[#006838] bg-green-50' },
              { label: 'Draft', value: String(workforceAnalytics?.payroll?.draft_runs ?? 0), tone: 'text-amber-600 bg-amber-50' },
              { label: 'Processed', value: String(workforceAnalytics?.payroll?.processed_runs ?? 0), tone: 'text-blue-600 bg-blue-50' },
              { label: 'Published', value: String(workforceAnalytics?.payroll?.published_runs ?? 0), tone: 'text-purple-600 bg-purple-50' },
            ].map((k) => (
              <div key={k.label} className="stat-card">
                <div className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold ${k.tone}`}>{k.label}</div>
                <p className="mt-2 text-xl font-extrabold text-slate-900">{k.value}</p>
              </div>
            ))}
          </div>

          <form className="card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3" onSubmit={handleCreatePayrollRun}>
            <input className="input" placeholder="Period label (e.g. April 2026)" value={payrollPeriodLabel} onChange={(e) => setPayrollPeriodLabel(e.target.value)} />
            <input className="input" type="date" value={payrollStartDate} onChange={(e) => setPayrollStartDate(e.target.value)} />
            <input className="input" type="date" value={payrollEndDate} onChange={(e) => setPayrollEndDate(e.target.value)} />
            <input className="input" type="date" value={payrollPayDate} onChange={(e) => setPayrollPayDate(e.target.value)} />
            <input className="input" type="number" min="0" placeholder="Staff paid" value={payrollStaffPaid} onChange={(e) => setPayrollStaffPaid(e.target.value)} />
            <input className="input" type="number" min="0" placeholder="Gross total" value={payrollGross} onChange={(e) => setPayrollGross(e.target.value)} />
            <input className="input" type="number" min="0" placeholder="Deductions total" value={payrollDeductions} onChange={(e) => setPayrollDeductions(e.target.value)} />
            <div className="flex gap-2">
              <input className="input" type="number" min="0" placeholder="Net total" value={payrollNet} onChange={(e) => setPayrollNet(e.target.value)} />
              <button type="submit" className="btn-primary text-xs py-2 px-3" disabled={isCreatingPayrollRun || isHrmsLoading}>
                {isCreatingPayrollRun ? 'Creating...' : 'Create run'}
              </button>
              <button type="button" className="btn-secondary text-xs py-2 px-3" disabled={isRollingUpPayroll || isHrmsLoading} onClick={handlePayrollRollup}>
                {isRollingUpPayroll ? 'Rolling up...' : 'Auto rollup'}
              </button>
            </div>
          </form>

          <div className="card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div>
              <p className="text-xs text-slate-500 mb-1">Posting mode</p>
              <select
                className="select"
                value={postingConfig.posting_mode || 'manual'}
                onChange={(e) => setPostingConfig((prev) => ({ ...prev, posting_mode: e.target.value }))}
              >
                <option value="manual">manual</option>
                <option value="auto">auto</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Journal target</p>
              <input
                className="input"
                value={postingConfig.journal_target || ''}
                onChange={(e) => setPostingConfig((prev) => ({ ...prev, journal_target: e.target.value }))}
                placeholder="general-ledger"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(postingConfig.auto_post_on_publish)}
                onChange={(e) => setPostingConfig((prev) => ({ ...prev, auto_post_on_publish: e.target.checked }))}
              />
              Auto-post when published
            </label>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary text-xs py-2 px-3" disabled={isSavingPostingConfig || isHrmsLoading} onClick={handleSavePostingConfig}>
                {isSavingPostingConfig ? 'Saving...' : 'Save posting config'}
              </button>
              <button type="button" className="btn-secondary text-xs py-2 px-3" disabled={isExportingPayrollReport || isHrmsLoading} onClick={() => handleExportPayrollReport('csv')}>
                {isExportingPayrollReport ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>

          <div className="card overflow-x-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800">Recent HRMS audit trail</h3>
              <span className="text-[11px] text-slate-500">{auditTrailRows.length} entries</span>
            </div>
            {!auditTrailRows.length ? (
              <p className="text-xs text-slate-400">No HRMS audit entries yet.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="table-th text-left">When</th>
                    <th className="table-th text-left">Action</th>
                    <th className="table-th text-left">Actor</th>
                    <th className="table-th text-left">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {auditTrailRows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-50 last:border-0 align-top">
                      <td className="table-td text-slate-500 whitespace-nowrap">{row.created_at ? new Date(row.created_at).toLocaleString() : '—'}</td>
                      <td className="table-td font-mono text-[11px] text-[#006838]">{row.action}</td>
                      <td className="table-td text-slate-500">{row.actor_email || row.actor_username || 'system'}</td>
                      <td className="table-td text-slate-500 break-words">{row.detail_json ? JSON.stringify(row.detail_json) : row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {payrollRows.map((p, i) => (
            <div key={i} className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-800">{p.period}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Pay date {p.payDate} · {p.staffPaid} staff · Net {p.net}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge badge-green">{p.status}</span>
                <span className="text-xs font-mono text-slate-500">Variance {p.variance}</span>
                {p.statusKey === 'draft' && (
                  <button
                    type="button"
                    className="btn-secondary text-[11px] py-1.5"
                    disabled={isUpdatingPayrollStatus || isHrmsLoading}
                    onClick={() => handlePayrollStatusTransition(p.id, 'processed')}
                  >
                    Mark Processed
                  </button>
                )}
                {p.statusKey === 'processed' && (
                  <button
                    type="button"
                    className="btn-secondary text-[11px] py-1.5"
                    disabled={isUpdatingPayrollStatus || isHrmsLoading}
                    onClick={() => handlePayrollStatusTransition(p.id, 'published')}
                  >
                    Publish
                  </button>
                )}
                {p.statusKey === 'published' && (
                  <button
                    type="button"
                    className="btn-secondary text-[11px] py-1.5"
                    disabled={isPostingPayrollRun || isHrmsLoading}
                    onClick={() => handlePostPayrollRun(p.id)}
                  >
                    Post Run
                  </button>
                )}
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-400">
            Staff view individual payslips under <strong>Self-Service → Payslips</strong>. Oracle / SAP payroll bridges would post runs here.
          </p>
        </div>
      )}

      {tab === 'talent' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Review cycles</h2>
            <div className="space-y-4">
              {TALENT_CYCLES.map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">{c.name}</span>
                    <span className="text-slate-400">{c.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#006838] rounded-full" style={{ width: `${c.progress}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {c.completed}/{c.total} forms · Due {c.due}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Talent actions</h2>
            <div className="space-y-2">
              {TALENT_ACTIONS.map((a, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{a.staff}</p>
                  <p className="text-xs text-slate-600 mt-1">{a.action}</p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Owner {a.owner} · Due {a.due}
                  </p>
                  <span className={`badge text-[9px] mt-2 ${a.status === 'at-risk' ? 'badge-red' : a.status === 'done' ? 'badge-green' : 'badge-amber'}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Goals & OKRs (sample)</h2>
            <div className="space-y-4">
              {PERFORMANCE_GOALS.map((g, i) => (
                <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs font-bold text-slate-800">{g.staff}</p>
                    <span className={`badge text-[9px] ${g.status === 'at-risk' ? 'badge-amber' : 'badge-green'}`}>{g.status}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{g.goal}</p>
                  <p className="text-[10px] text-slate-400 mt-2">{g.cycle} · Due {g.due}</p>
                  <div className="h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-[#006838] rounded-full" style={{ width: `${g.progress}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{g.progress}% complete</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card overflow-x-auto">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Review calendar</h2>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-th text-left">Staff</th>
                  <th className="table-th text-left">Type</th>
                  <th className="table-th text-left">Reviewer</th>
                  <th className="table-th text-left">Due</th>
                  <th className="table-th text-left">Status</th>
                  <th className="table-th text-left">Last rating</th>
                </tr>
              </thead>
              <tbody>
                {PERFORMANCE_REVIEWS.map((r, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="table-td font-semibold text-slate-800">{r.staff}</td>
                    <td className="table-td text-xs">{r.type}</td>
                    <td className="table-td text-xs text-slate-600">{r.reviewer}</td>
                    <td className="table-td text-slate-500 text-xs">{r.due}</td>
                    <td className="table-td">
                      <span className="badge badge-blue text-[10px]">{r.status}</span>
                    </td>
                    <td className="table-td text-xs text-slate-500">{r.lastRating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-slate-400 mt-4 px-1">
              Supports 360°, calibration workshops, and competency libraries when integrated with performance software.
            </p>
          </div>
        </div>
      )}

      {tab === 'attendance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Attendance today', value: `${workforceAnalytics?.attendance?.attendance_rate_today ?? 0}%`, tone: 'text-[#006838] bg-green-50' },
              { label: 'Leave pending', value: String(workforceAnalytics?.leave?.pending_requests ?? 0), tone: 'text-amber-600 bg-amber-50' },
              { label: 'Leave approved', value: String(workforceAnalytics?.leave?.approved_requests ?? 0), tone: 'text-blue-600 bg-blue-50' },
              { label: 'Overtime hours', value: String(attendanceOvertimeHours ?? 0), tone: 'text-purple-600 bg-purple-50' },
            ].map((k) => (
              <div key={k.label} className="stat-card">
                <div className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold ${k.tone}`}>{k.label}</div>
                <p className="mt-2 text-xl font-extrabold text-slate-900">{k.value}</p>
              </div>
            ))}
          </div>

          <form className="card grid grid-cols-1 md:grid-cols-5 gap-3" onSubmit={handleLogAttendance}>
            <input className="input md:col-span-2" placeholder="Employee full name" value={attendanceEmployeeName} onChange={(e) => setAttendanceEmployeeName(e.target.value)} />
            <input className="input" placeholder="Department" value={attendanceDepartment} onChange={(e) => setAttendanceDepartment(e.target.value)} />
            <input className="input" type="date" value={attendanceWorkDate} onChange={(e) => setAttendanceWorkDate(e.target.value)} />
            <div className="flex gap-2">
              <select className="select" value={attendanceStatus} onChange={(e) => setAttendanceStatus(e.target.value)}>
                <option value="present">present</option>
                <option value="late">late</option>
                <option value="absent">absent</option>
                <option value="remote">remote</option>
              </select>
              <button type="submit" className="btn-primary text-xs py-2 px-3" disabled={isLoggingAttendance || isHrmsLoading}>
                {isLoggingAttendance ? 'Saving...' : 'Log'}
              </button>
              <button type="button" className="btn-secondary text-xs py-2 px-3" disabled={isClockingAttendance || isHrmsLoading} onClick={() => handleClockAttendance('in')}>
                {isClockingAttendance ? 'Saving...' : 'Clock In'}
              </button>
              <button type="button" className="btn-secondary text-xs py-2 px-3" disabled={isClockingAttendance || isHrmsLoading} onClick={() => handleClockAttendance('out')}>
                {isClockingAttendance ? 'Saving...' : 'Clock Out'}
              </button>
            </div>
          </form>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-th text-left">Site</th>
                  <th className="table-th text-left">Present</th>
                  <th className="table-th text-left">Expected</th>
                  <th className="table-th text-left">Rate</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRows.map((r, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="table-td font-semibold text-slate-800">{r.site}</td>
                    <td className="table-td">{r.present}</td>
                    <td className="table-td">{r.expected}</td>
                    <td className="table-td">
                      <span className={r.rate >= 94 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{r.rate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-slate-400 mt-4">Biometric / gate integrations would feed this dashboard.</p>
          </div>

          <div className="card overflow-x-auto">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Leave approvals</h3>
            {leaveRows.length === 0 ? (
              <p className="text-xs text-slate-400">No leave requests yet.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="table-th text-left">Type</th>
                    <th className="table-th text-left">Dates</th>
                    <th className="table-th text-left">Days</th>
                    <th className="table-th text-left">Status</th>
                    <th className="table-th text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-50 last:border-0">
                      <td className="table-td font-semibold text-slate-800">{row.leaveType}</td>
                      <td className="table-td text-slate-500">
                        {row.startDate ? new Date(row.startDate).toLocaleDateString() : '—'} - {row.endDate ? new Date(row.endDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="table-td text-slate-500">{row.durationDays}</td>
                      <td className="table-td">
                        <span className="badge badge-blue text-[10px]">{row.status}</span>
                      </td>
                      <td className="table-td">
                        <select
                          className="text-[10px] font-semibold border border-slate-200 rounded-lg px-2 py-1 bg-white"
                          value={row.status}
                          onChange={(e) => handleUpdateLeaveStatus(row.id, e.target.value)}
                          disabled={isUpdatingLeaveStatus || isHrmsLoading}
                        >
                          {LEAVE_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card overflow-x-auto">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Leave balances</h3>
            {leaveBalanceRows.length === 0 ? (
              <p className="text-xs text-slate-400">No employee leave balances available yet.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="table-th text-left">Employee</th>
                    <th className="table-th text-left">Department</th>
                    <th className="table-th text-left">Annual left</th>
                    <th className="table-th text-left">Sick left</th>
                    <th className="table-th text-left">Study left</th>
                    <th className="table-th text-left">Used days</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveBalanceRows.slice(0, 20).map((row) => (
                    <tr key={row.employeeId} className="border-b border-slate-50 last:border-0">
                      <td className="table-td font-semibold text-slate-800">{row.employeeName}</td>
                      <td className="table-td text-slate-500">{row.department || '—'}</td>
                      <td className="table-td text-slate-500">{row.annualRemaining}</td>
                      <td className="table-td text-slate-500">{row.sickRemaining}</td>
                      <td className="table-td text-slate-500">{row.studyRemaining}</td>
                      <td className="table-td text-slate-500">{row.totalUsed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card overflow-x-auto space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Leave policy & accrual schedule</h3>
              <button type="button" className="btn-secondary text-xs py-1.5 px-3" disabled={isSavingLeavePolicy || isHrmsLoading} onClick={handleSaveLeavePolicy}>
                {isSavingLeavePolicy ? 'Saving...' : 'Save policy'}
              </button>
            </div>
            {!leavePolicy ? (
              <p className="text-xs text-slate-400">Leave policy unavailable.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(leavePolicy.leave_types || {}).map(([leaveKey, cfg]) => (
                  <div key={leaveKey} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2">
                    <p className="text-xs font-bold text-slate-800 capitalize">{leaveKey}</p>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={cfg.entitlement_days ?? 0}
                      onChange={(e) => setLeavePolicy((prev) => ({
                        ...prev,
                        leave_types: {
                          ...prev.leave_types,
                          [leaveKey]: { ...prev.leave_types[leaveKey], entitlement_days: Number(e.target.value || 0) },
                        },
                      }))}
                    />
                    <select
                      className="select"
                      value={cfg.accrual_schedule || 'monthly'}
                      onChange={(e) => setLeavePolicy((prev) => ({
                        ...prev,
                        leave_types: {
                          ...prev.leave_types,
                          [leaveKey]: { ...prev.leave_types[leaveKey], accrual_schedule: e.target.value },
                        },
                      }))}
                    >
                      <option value="monthly">monthly</option>
                      <option value="quarterly">quarterly</option>
                      <option value="yearly">yearly</option>
                    </select>
                  </div>
                ))}
              </div>
            )}

            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="table-th text-left">Employee</th>
                  <th className="table-th text-left">Annual avail.</th>
                  <th className="table-th text-left">Sick avail.</th>
                  <th className="table-th text-left">Study avail.</th>
                </tr>
              </thead>
              <tbody>
                {leaveAccrualRows.slice(0, 12).map((row) => (
                  <tr key={row.employee_id} className="border-b border-slate-50 last:border-0">
                    <td className="table-td font-semibold text-slate-800">{row.employee_name}</td>
                    <td className="table-td text-slate-500">{row?.accrual?.annual?.available ?? 0}</td>
                    <td className="table-td text-slate-500">{row?.accrual?.sick?.available ?? 0}</td>
                    <td className="table-td text-slate-500">{row?.accrual?.study?.available ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
