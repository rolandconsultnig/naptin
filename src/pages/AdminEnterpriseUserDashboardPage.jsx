import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Clock3, ShieldAlert, Users } from 'lucide-react'
import {
  addRbacAccessReviewComment,
  assignRbacAccessReview,
  bulkUpdateRbacAccessReviews,
  completeRbacUserAccessReview,
  createRbacAttestationPack,
  downloadRbacAttestationPackCsvUrl,
  createRbacReportSchedule,
  escalateRbacPerformanceIncidents,
  escalateRbacOverdueReviews,
  fetchRbacDashboardPerformance,
  fetchRbacPerformanceIncidentEvents,
  fetchRbacPerformanceIncidents,
  fetchRbacMfaEnforcementReport,
  fetchRbacAccessReviewComments,
  fetchRbacAccessReviewQueue,
  fetchRbacAccessReviewHistory,
  fetchRbacAttestationPacks,
  fetchRbacEnterpriseDashboard,
  fetchRbacNotificationEvents,
  fetchRbacReportSchedules,
  fetchRbacReviewSlaSummary,
  generateRbacPerformanceIncidents,
  retryRbacNotificationDeliveries,
  refreshRbacEnterpriseDashboardCache,
  refreshRbacRiskViews,
  retuneRbacPerformanceThresholds,
  runRbacMaintenanceAutomation,
  runRbacPerformanceRetention,
  runRbacDueSchedules,
  runRbacOverrideExpiryMaintenance,
  runRbacReportScheduleNow,
  searchRbacEnterpriseDashboard,
  sendRbacReviewReminders,
  updateRbacAccessReviewStatus,
  updateRbacPerformanceIncident,
  updateRbacReportSchedule,
  updateRbacRiskPolicy,
} from '../admin/rbacApi'

function Card({ title, value, sub, icon: Icon, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-50 text-slate-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    blue: 'bg-blue-50 text-blue-700',
  }
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">{title}</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{value}</p>
          <p className="text-[11px] text-slate-400 mt-1">{sub}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone] || tones.slate}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
}

export default function AdminEnterpriseUserDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [staleDays, setStaleDays] = useState(90)
  const [data, setData] = useState(null)
  const [slaSummary, setSlaSummary] = useState(null)
  const [reviewQueue, setReviewQueue] = useState([])
  const [selectedReviewIds, setSelectedReviewIds] = useState([])
  const [bulkAssignee, setBulkAssignee] = useState('superadmin@naptin.gov.ng')
  const [reviewQueueMeta, setReviewQueueMeta] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 })
  const [globalSearch, setGlobalSearch] = useState('')
  const [globalSearchResult, setGlobalSearchResult] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [attestationPacks, setAttestationPacks] = useState([])
  const [mfaReport, setMfaReport] = useState({ totalPrivilegedUsers: 0, mfaEnabled: 0, exceptions: 0, items: [] })
  const [perfWindowHours, setPerfWindowHours] = useState(24)
  const [incidentStatusFilter, setIncidentStatusFilter] = useState('active')
  const [incidentSeverityFilter, setIncidentSeverityFilter] = useState('')
  const [incidentSearch, setIncidentSearch] = useState('')
  const [incidentOwner, setIncidentOwner] = useState('superadmin@naptin.gov.ng')
  const [perfHealth, setPerfHealth] = useState({
    overview: { samples: 0, avgMs: 0, p50Ms: 0, p90Ms: 0, p95Ms: 0, p99Ms: 0, maxMs: 0 },
    queryBreakdown: [],
    regressions: [],
    trend: [],
    slowEvents: [],
    tunedThresholds: [],
    autoTune: { attempted: false, applied: 0, intervalMs: 0, driftAlertRatio: 1.25 },
    incidents: [],
    incidentEval: {
      attempted: false,
      generatedThisRun: false,
      created: 0,
      updated: 0,
      resolved: 0,
      intervalMs: 120000,
      policy: {},
    },
    incidentEscalation: {
      attempted: false,
      processedThisRun: false,
      escalated: 0,
      activeIncidents: 0,
      overdueIncidents: 0,
      criticalOverdue: 0,
      intervalMs: 120000,
      policy: {
        criticalSlaMinutes: 30,
        warningSlaMinutes: 240,
      },
    },
    incidentAnalytics: {
      totalIncidents: 0,
      activeIncidents: 0,
      resolvedIncidents: 0,
      criticalIncidents: 0,
      avgMttaMinutes: 0,
      avgMttrMinutes: 0,
      slaBreaches: 0,
      slaBreachRatePct: 0,
      byType: [],
      timeline: [],
      topOwners: [],
    },
  })
  const [notifications, setNotifications] = useState([])
  const [reviewHistory, setReviewHistory] = useState([])
  const [historyMeta, setHistoryMeta] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 })
  const [reviewTypeFilter, setReviewTypeFilter] = useState('')
  const [reviewerFilter, setReviewerFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [historySortBy, setHistorySortBy] = useState('reviewed_at')
  const [historySortDir, setHistorySortDir] = useState('desc')
  const [reviewingUserId, setReviewingUserId] = useState(0)
  const [workingReviewId, setWorkingReviewId] = useState(0)
  const [runningScheduleId, setRunningScheduleId] = useState(0)
  const [retryingDeliveries, setRetryingDeliveries] = useState(false)
  const [sendingReminders, setSendingReminders] = useState(false)
  const [generatingAttestation, setGeneratingAttestation] = useState(false)
  const [runningDueSchedules, setRunningDueSchedules] = useState(false)
  const [runningExpiryMaintenance, setRunningExpiryMaintenance] = useState(false)
  const [runningAutomation, setRunningAutomation] = useState(false)
  const [refreshingRiskViews, setRefreshingRiskViews] = useState(false)
  const [refreshingDashboardCache, setRefreshingDashboardCache] = useState(false)
  const [retuningPerformance, setRetuningPerformance] = useState(false)
  const [generatingPerfIncidents, setGeneratingPerfIncidents] = useState(false)
  const [runningPerfEscalation, setRunningPerfEscalation] = useState(false)
  const [runningPerfRetention, setRunningPerfRetention] = useState(false)
  const [incidentActionId, setIncidentActionId] = useState(0)
  const [selectedPerfIncidentId, setSelectedPerfIncidentId] = useState(0)
  const [selectedPerfIncidentEvents, setSelectedPerfIncidentEvents] = useState([])
  const [newSchedule, setNewSchedule] = useState({
    scheduleCode: '',
    reportType: 'access_review_summary',
    frequency: 'weekly',
    status: 'active',
    recipients: 'superadmin@naptin.gov.ng',
    nextRunAt: '',
  })
  const [attestationDraft, setAttestationDraft] = useState({
    reviewType: '',
    reviewer: '',
    status: '',
    from: '',
    to: '',
    includeComments: true,
  })
  const [savingPolicy, setSavingPolicy] = useState(false)
  const [riskPolicyDraft, setRiskPolicyDraft] = useState({
    staleOverrideDays: 90,
    weightSodConflict: 5,
    weightStaleOverride: 3,
    weightMissingReason: 2,
    weightOverrideCount: 1,
    inactivityDaysHighPrivilege: 60,
  })

  const load = async (days = staleDays, type = reviewTypeFilter, page = 1) => {
    setLoading(true)
    setError('')
    try {
      const [summary, history, queue, sla, scheduleRows, notificationRows, packsRows, mfa, perf, perfIncidents] = await Promise.all([
        fetchRbacEnterpriseDashboard(days),
        fetchRbacAccessReviewHistory({
          reviewType: type,
          reviewer: reviewerFilter,
          from: fromDate,
          to: toDate,
          q: searchFilter,
          page,
          pageSize: historyMeta.pageSize,
          sortBy: historySortBy,
          sortDir: historySortDir,
        }),
        fetchRbacAccessReviewQueue({ page: reviewQueueMeta.page || 1, pageSize: reviewQueueMeta.pageSize || 10 }),
        fetchRbacReviewSlaSummary(),
        fetchRbacReportSchedules(),
        fetchRbacNotificationEvents({ limit: 20 }),
        fetchRbacAttestationPacks(),
        fetchRbacMfaEnforcementReport(),
        fetchRbacDashboardPerformance(perfWindowHours),
        fetchRbacPerformanceIncidents({
          routeCode: 'users.dashboard-summary',
          status: incidentStatusFilter,
          severity: incidentSeverityFilter || undefined,
          q: incidentSearch || undefined,
          limit: 30,
        }),
      ])
      setData(summary)
      setSlaSummary(sla)
      setReviewQueue(queue.items || [])
      setReviewQueueMeta({
        page: queue.page || 1,
        pageSize: queue.pageSize || reviewQueueMeta.pageSize,
        total: queue.total || 0,
        totalPages: queue.totalPages || 1,
      })
      setSchedules(scheduleRows.items || [])
      setNotifications(notificationRows.items || [])
      setAttestationPacks(packsRows.items || [])
      setMfaReport(mfa || { totalPrivilegedUsers: 0, mfaEnabled: 0, exceptions: 0, items: [] })
      const perfPayload = perf || {
          overview: { samples: 0, avgMs: 0, p50Ms: 0, p90Ms: 0, p95Ms: 0, p99Ms: 0, maxMs: 0 },
          queryBreakdown: [],
          regressions: [],
          trend: [],
          slowEvents: [],
          tunedThresholds: [],
          autoTune: { attempted: false, applied: 0, intervalMs: 0, driftAlertRatio: 1.25 },
          incidents: [],
          incidentEval: {
            attempted: false,
            generatedThisRun: false,
            created: 0,
            updated: 0,
            resolved: 0,
            intervalMs: 120000,
            policy: {},
          },
          incidentEscalation: {
            attempted: false,
            processedThisRun: false,
            escalated: 0,
            activeIncidents: 0,
            overdueIncidents: 0,
            criticalOverdue: 0,
            intervalMs: 120000,
            policy: {
              criticalSlaMinutes: 30,
              warningSlaMinutes: 240,
            },
          },
          incidentAnalytics: {
            totalIncidents: 0,
            activeIncidents: 0,
            resolvedIncidents: 0,
            criticalIncidents: 0,
            avgMttaMinutes: 0,
            avgMttrMinutes: 0,
            slaBreaches: 0,
            slaBreachRatePct: 0,
            byType: [],
            timeline: [],
            topOwners: [],
          },
        }
      setPerfHealth({
        ...perfPayload,
        incidents: perfIncidents?.items || perfPayload.incidents || [],
      })
      if (selectedPerfIncidentId) {
        try {
          const timeline = await fetchRbacPerformanceIncidentEvents(selectedPerfIncidentId, 40)
          setSelectedPerfIncidentEvents(timeline.items || [])
        } catch {
          setSelectedPerfIncidentEvents([])
        }
      }
      setReviewHistory(history.items || [])
      setHistoryMeta({
        page: history.page || 1,
        pageSize: history.pageSize || historyMeta.pageSize,
        total: history.total || 0,
        totalPages: history.totalPages || 1,
      })
      if (summary?.policy) {
        setRiskPolicyDraft({
          staleOverrideDays: Number(summary.policy.staleOverrideDays || 90),
          weightSodConflict: Number(summary.policy.weightSodConflict || 5),
          weightStaleOverride: Number(summary.policy.weightStaleOverride || 3),
          weightMissingReason: Number(summary.policy.weightMissingReason || 2),
          weightOverrideCount: Number(summary.policy.weightOverrideCount || 1),
          inactivityDaysHighPrivilege: Number(summary.policy.inactivityDaysHighPrivilege || 60),
        })
      }
    } catch (e) {
      setError(e.message || 'Failed to load enterprise dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(90)
  }, [])

  const agingMap = useMemo(() => {
    const map = { '0_30_days': 0, '31_90_days': 0, '90_plus_days': 0 }
    for (const row of data?.overrideAging || []) {
      map[row.bucket] = row.count
    }
    return map
  }, [data])

  const kpis = data?.kpis || {}

  const toCsv = (rows) => {
    if (!rows?.length) return ''
    const keys = Object.keys(rows[0])
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    return [keys.join(','), ...rows.map((row) => keys.map((k) => esc(row[k])).join(','))].join('\n')
  }

  const exportCsv = (fileName, rows) => {
    const csv = toCsv(rows)
    if (!csv) return
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const markReviewed = async (userId, reviewType) => {
    const note = window.prompt('Optional review note for audit trail:', '')
    setReviewingUserId(userId)
    setError('')
    try {
      await completeRbacUserAccessReview(userId, {
        reviewType,
        reviewNote: note || '',
        staleDays,
      })
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to mark review as completed')
    } finally {
      setReviewingUserId(0)
    }
  }

  const onSaveRiskPolicy = async () => {
    setSavingPolicy(true)
    setError('')
    try {
      await updateRbacRiskPolicy(riskPolicyDraft)
      await load(riskPolicyDraft.staleOverrideDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to save risk policy')
    } finally {
      setSavingPolicy(false)
    }
  }

  const onUpdateReviewStatus = async (reviewId, status) => {
    const note = window.prompt('Optional note:', '')
    setError('')
    try {
      await updateRbacAccessReviewStatus(reviewId, { status, reviewNote: note || '' })
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to update review status')
    }
  }

  const onAssignReview = async (reviewId) => {
    const assignedTo = window.prompt('Assign to (email):', 'superadmin@naptin.gov.ng')
    if (!assignedTo) return
    const dueAt = window.prompt('Due date/time ISO (optional):', '')
    setWorkingReviewId(reviewId)
    setError('')
    try {
      await assignRbacAccessReview(reviewId, {
        assignedTo,
        dueAt: dueAt || null,
        priority: 'high',
        slaHours: 24,
      })
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to assign review')
    } finally {
      setWorkingReviewId(0)
    }
  }

  const onAddReviewComment = async (reviewId) => {
    const comment = window.prompt('Comment:')
    if (!comment) return
    setWorkingReviewId(reviewId)
    setError('')
    try {
      await addRbacAccessReviewComment(reviewId, comment)
      await fetchRbacAccessReviewComments(reviewId)
    } catch (e) {
      setError(e.message || 'Failed to add comment')
    } finally {
      setWorkingReviewId(0)
    }
  }

  const onEscalateOverdue = async () => {
    setError('')
    try {
      await escalateRbacOverdueReviews()
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to escalate overdue reviews')
    }
  }

  const onSendReviewReminders = async () => {
    setSendingReminders(true)
    setError('')
    try {
      await sendRbacReviewReminders({ hoursAhead: 24, includeOverdue: true })
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to send reminders')
    } finally {
      setSendingReminders(false)
    }
  }

  const onRetryDeliveries = async () => {
    setRetryingDeliveries(true)
    setError('')
    try {
      await retryRbacNotificationDeliveries(100)
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to retry failed deliveries')
    } finally {
      setRetryingDeliveries(false)
    }
  }

  const onRunDueSchedules = async () => {
    setRunningDueSchedules(true)
    setError('')
    try {
      await runRbacDueSchedules()
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to run due schedules')
    } finally {
      setRunningDueSchedules(false)
    }
  }

  const onRunOverrideExpiryMaintenance = async () => {
    setRunningExpiryMaintenance(true)
    setError('')
    try {
      await runRbacOverrideExpiryMaintenance({ daysAhead: 7 })
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to run override expiry maintenance')
    } finally {
      setRunningExpiryMaintenance(false)
    }
  }

  const onRunAutomation = async () => {
    setRunningAutomation(true)
    setError('')
    try {
      await runRbacMaintenanceAutomation({})
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to run governance automation')
    } finally {
      setRunningAutomation(false)
    }
  }

  const onRefreshRiskViews = async () => {
    setRefreshingRiskViews(true)
    setError('')
    try {
      await refreshRbacRiskViews()
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to refresh risk views')
    } finally {
      setRefreshingRiskViews(false)
    }
  }

  const onRefreshDashboardCache = async () => {
    setRefreshingDashboardCache(true)
    setError('')
    try {
      await refreshRbacEnterpriseDashboardCache()
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to refresh dashboard cache')
    } finally {
      setRefreshingDashboardCache(false)
    }
  }

  const onRetunePerformanceThresholds = async () => {
    setRetuningPerformance(true)
    setError('')
    try {
      await retuneRbacPerformanceThresholds({ hours: perfWindowHours })
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to retune performance thresholds')
    } finally {
      setRetuningPerformance(false)
    }
  }

  const onGeneratePerfIncidents = async () => {
    setGeneratingPerfIncidents(true)
    setError('')
    try {
      await generateRbacPerformanceIncidents({ hours: perfWindowHours })
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to generate performance incidents')
    } finally {
      setGeneratingPerfIncidents(false)
    }
  }

  const onEscalatePerfIncidents = async () => {
    setRunningPerfEscalation(true)
    setError('')
    try {
      await escalateRbacPerformanceIncidents({})
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to process performance incident escalations')
    } finally {
      setRunningPerfEscalation(false)
    }
  }

  const onPerfIncidentAction = async (incidentId, action) => {
    setIncidentActionId(Number(incidentId) || 0)
    setError('')
    try {
      await updateRbacPerformanceIncident(incidentId, {
        action,
        ownerEmail: incidentOwner || undefined,
      })
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || `Failed to ${action} incident`)
    } finally {
      setIncidentActionId(0)
    }
  }

  const onRunPerfRetention = async () => {
    setRunningPerfRetention(true)
    setError('')
    try {
      await runRbacPerformanceRetention({})
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to run performance retention')
    } finally {
      setRunningPerfRetention(false)
    }
  }

  const onSelectPerfIncident = async (incidentId) => {
    const id = Number(incidentId) || 0
    setSelectedPerfIncidentId(id)
    if (!id) {
      setSelectedPerfIncidentEvents([])
      return
    }
    try {
      const res = await fetchRbacPerformanceIncidentEvents(id, 40)
      setSelectedPerfIncidentEvents(res.items || [])
    } catch {
      setSelectedPerfIncidentEvents([])
    }
  }

  const onCreateSchedule = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createRbacReportSchedule({
        scheduleCode: newSchedule.scheduleCode,
        reportType: newSchedule.reportType,
        frequency: newSchedule.frequency,
        status: newSchedule.status,
        recipients: newSchedule.recipients
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        nextRunAt: newSchedule.nextRunAt || null,
        config: {},
      })
      setNewSchedule({
        scheduleCode: '',
        reportType: 'access_review_summary',
        frequency: 'weekly',
        status: 'active',
        recipients: 'superadmin@naptin.gov.ng',
        nextRunAt: '',
      })
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to create schedule')
    }
  }

  const onRunScheduleNow = async (scheduleId) => {
    setRunningScheduleId(scheduleId)
    setError('')
    try {
      const res = await runRbacReportScheduleNow(scheduleId)
      if (res?.csv) {
        exportCsv(`${res.scheduleCode || 'report'}.csv`, res.items || [])
      }
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to run schedule')
    } finally {
      setRunningScheduleId(0)
    }
  }

  const onToggleSchedule = async (row) => {
    setError('')
    try {
      await updateRbacReportSchedule(row.id, { status: row.status === 'active' ? 'inactive' : 'active' })
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to update schedule')
    }
  }

  const onGenerateAttestationPack = async (e) => {
    e.preventDefault()
    setGeneratingAttestation(true)
    setError('')
    try {
      await createRbacAttestationPack({
        reviewType: attestationDraft.reviewType || null,
        reviewer: attestationDraft.reviewer || null,
        status: attestationDraft.status || null,
        from: attestationDraft.from || null,
        to: attestationDraft.to || null,
        includeComments: !!attestationDraft.includeComments,
      })
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed to generate attestation pack')
    } finally {
      setGeneratingAttestation(false)
    }
  }

  const onRunGlobalSearch = async () => {
    if (!globalSearch.trim()) {
      setGlobalSearchResult(null)
      return
    }
    setError('')
    try {
      const res = await searchRbacEnterpriseDashboard(globalSearch.trim(), 100)
      setGlobalSearchResult(res)
    } catch (e) {
      setError(e.message || 'Failed to run enterprise dashboard search')
    }
  }

  const onBulkReviewUpdate = async (mode) => {
    if (!selectedReviewIds.length) return
    setError('')
    try {
      if (mode === 'resolve') {
        await bulkUpdateRbacAccessReviews({
          reviewIds: selectedReviewIds,
          status: 'resolved',
          reviewNote: 'Bulk resolved from enterprise dashboard',
        })
      } else if (mode === 'assign') {
        await bulkUpdateRbacAccessReviews({
          reviewIds: selectedReviewIds,
          assignedTo: bulkAssignee,
          status: 'in_review',
        })
      }
      setSelectedReviewIds([])
      await load(staleDays, reviewTypeFilter, historyMeta.page || 1)
    } catch (e) {
      setError(e.message || 'Failed bulk review update')
    }
  }

  return (
    <div className="animate-fade-up max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Enterprise user management dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Access exceptions, SoD conflict exposure, and stale override governance for level-5 super admins.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
            value={staleDays}
            onChange={(e) => setStaleDays(Number(e.target.value))}
          >
            <option value={60}>Stale threshold: 60 days</option>
            <option value={90}>Stale threshold: 90 days</option>
            <option value={120}>Stale threshold: 120 days</option>
          </select>
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
            value={reviewTypeFilter}
            onChange={(e) => setReviewTypeFilter(e.target.value)}
          >
            <option value="">All review types</option>
            <option value="urgent_item">Urgent item</option>
            <option value="access_exception">Access exception</option>
            <option value="sod_conflict">SoD conflict</option>
            <option value="stale_override">Stale override</option>
          </select>
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
            value={perfWindowHours}
            onChange={(e) => setPerfWindowHours(Number(e.target.value) || 24)}
          >
            <option value={6}>Perf window: 6h</option>
            <option value={24}>Perf window: 24h</option>
            <option value={72}>Perf window: 72h</option>
            <option value={168}>Perf window: 7d</option>
          </select>
          <button type="button" className="btn-secondary text-xs py-2" onClick={() => load(staleDays, reviewTypeFilter, 1)}>
            Refresh
          </button>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
            placeholder="Global search (user/email/perm)"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
          <button type="button" className="btn-secondary text-xs py-2" onClick={onRunGlobalSearch}>
            Search
          </button>
          <Link to="/admin/users" className="btn-primary text-xs py-2">
            Open user management
          </Link>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {loading && <div className="mb-4 text-sm text-slate-500">Loading dashboard…</div>}
      {globalSearchResult && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          Search results — urgent: {(globalSearchResult.urgentItems || []).length}, exceptions: {(globalSearchResult.accessExceptions || []).length}, SoD: {(globalSearchResult.sodConflicts || []).length}, stale: {(globalSearchResult.staleOverrides || []).length}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <Card
          title="Access exceptions"
          value={kpis.totalOverrides || 0}
          sub={`${kpis.usersWithOverrides || 0} users with overrides`}
          icon={ShieldAlert}
          tone="amber"
        />
        <Card
          title="SoD risk count"
          value={kpis.usersWithSodConflicts || 0}
          sub={`${kpis.totalSodConflicts || 0} total conflicts`}
          icon={AlertTriangle}
          tone="red"
        />
        <Card
          title="Stale overrides"
          value={kpis.staleOverrides || 0}
          sub={`${kpis.usersWithStaleOverrides || 0} users past ${data?.staleDays || staleDays} days`}
          icon={Clock3}
          tone="blue"
        />
        <Card
          title="Directory coverage"
          value={kpis.totalUsers || 0}
          sub={`${kpis.activeUsers || 0} active users`}
          icon={Users}
          tone="slate"
        />
      </div>

      <div className="card mb-5 p-0 overflow-x-auto">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-800">Performance health</h2>
          <div className="flex items-center gap-2">
            <div className="text-[11px] text-slate-500">
              {perfHealth?.routeCode || 'users.dashboard-summary'} · {perfHealth?.windowHours || perfWindowHours}h
            </div>
            <button
              type="button"
              className="btn-secondary text-[11px] py-1 px-2"
              onClick={onRetunePerformanceThresholds}
              disabled={retuningPerformance}
            >
              {retuningPerformance ? 'Retuning…' : 'Retune thresholds'}
            </button>
            <button
              type="button"
              className="btn-secondary text-[11px] py-1 px-2"
              onClick={onGeneratePerfIncidents}
              disabled={generatingPerfIncidents}
            >
              {generatingPerfIncidents ? 'Generating…' : 'Generate incidents'}
            </button>
            <button
              type="button"
              className="btn-secondary text-[11px] py-1 px-2"
              onClick={onEscalatePerfIncidents}
              disabled={runningPerfEscalation}
            >
              {runningPerfEscalation ? 'Escalating…' : 'Run escalations'}
            </button>
          </div>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 md:grid-cols-6 gap-3 text-xs border-b border-slate-200">
          <div className="rounded-xl border border-slate-200 p-2">
            <div className="text-slate-500">Samples</div>
            <div className="text-lg font-bold text-slate-900">{perfHealth?.overview?.samples || 0}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-2">
            <div className="text-slate-500">Avg</div>
            <div className="text-lg font-bold text-slate-900">{Number(perfHealth?.overview?.avgMs || 0).toFixed(1)}ms</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-2">
            <div className="text-slate-500">P50</div>
            <div className="text-lg font-bold text-slate-900">{Number(perfHealth?.overview?.p50Ms || 0).toFixed(1)}ms</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-2">
            <div className="text-slate-500">P90</div>
            <div className="text-lg font-bold text-amber-700">{Number(perfHealth?.overview?.p90Ms || 0).toFixed(1)}ms</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-2">
            <div className="text-slate-500">P95</div>
            <div className="text-lg font-bold text-red-700">{Number(perfHealth?.overview?.p95Ms || 0).toFixed(1)}ms</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-2">
            <div className="text-slate-500">P99</div>
            <div className="text-lg font-bold text-red-700">{Number(perfHealth?.overview?.p99Ms || 0).toFixed(1)}ms</div>
          </div>
        </div>
        <div className="px-4 py-2 text-[11px] text-slate-500 border-b border-slate-200">
          Trend points: {(perfHealth?.trend || []).length} · Slow events tracked: {(perfHealth?.slowEvents || []).length} · Auto-tuned: {perfHealth?.autoTune?.applied || 0}
        </div>
        <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-3 border-b border-slate-200 bg-slate-50">
          <div className="rounded-xl border border-red-200 bg-red-50 p-2 text-xs">
            <div className="text-red-700 font-semibold">Critical incidents</div>
            <div className="text-lg font-bold text-red-800">
              {(perfHealth?.incidents || []).filter((i) => String(i.severity || '') === 'critical').length}
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-xs">
            <div className="text-amber-700 font-semibold">Warning incidents</div>
            <div className="text-lg font-bold text-amber-800">
              {(perfHealth?.incidents || []).filter((i) => String(i.severity || '') === 'warning').length}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-2 text-xs">
            <div className="text-slate-600 font-semibold">Incident engine</div>
            <div className="text-slate-700 mt-1">
              +{Number(perfHealth?.incidentEval?.created || 0)} new, +{Number(perfHealth?.incidentEval?.updated || 0)} refreshed, {Number(perfHealth?.incidentEval?.resolved || 0)} resolved
            </div>
            <div className="text-slate-700 mt-1">
              Escalated: {Number(perfHealth?.incidentEscalation?.escalated || 0)} this pass
            </div>
          </div>
        </div>
        <div className="px-4 py-2 text-[11px] text-slate-500 border-b border-slate-200">
          Policy: min samples {Number(perfHealth?.incidentEval?.policy?.minSamples || 0)} · drift {Number(perfHealth?.incidentEval?.policy?.driftRatio || 0).toFixed(2)}x · spike {Number(perfHealth?.incidentEval?.policy?.spikeRatio || 0).toFixed(2)}x · newly slow {Number(perfHealth?.incidentEval?.policy?.newlySlowP95Ms || 0).toFixed(0)}ms
        </div>
        <div className="px-4 py-2 text-[11px] text-slate-500 border-b border-slate-200">
          SLA policy: critical {Number(perfHealth?.incidentEscalation?.policy?.criticalSlaMinutes || 0)}m · warning {Number(perfHealth?.incidentEscalation?.policy?.warningSlaMinutes || 0)}m · overdue {Number(perfHealth?.incidentEscalation?.overdueIncidents || 0)} · critical overdue {Number(perfHealth?.incidentEscalation?.criticalOverdue || 0)}
        </div>
        <div className="px-4 py-2 text-[11px] text-slate-500 border-b border-slate-200">
          MTTA: {Number(perfHealth?.incidentAnalytics?.avgMttaMinutes || 0).toFixed(1)}m · MTTR: {Number(perfHealth?.incidentAnalytics?.avgMttrMinutes || 0).toFixed(1)}m · SLA breach rate: {Number(perfHealth?.incidentAnalytics?.slaBreachRatePct || 0).toFixed(1)}%
        </div>
        <div className="px-4 py-2 grid grid-cols-1 md:grid-cols-5 gap-2 border-b border-slate-200 bg-white">
          <select
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
            value={incidentStatusFilter}
            onChange={(e) => setIncidentStatusFilter(e.target.value)}
          >
            <option value="active">Incidents: active</option>
            <option value="open">Incidents: open only</option>
            <option value="acknowledged">Incidents: acknowledged</option>
            <option value="resolved">Incidents: resolved</option>
            <option value="all">Incidents: all</option>
          </select>
          <select
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
            value={incidentSeverityFilter}
            onChange={(e) => setIncidentSeverityFilter(e.target.value)}
          >
            <option value="">Severity: all</option>
            <option value="critical">Severity: critical</option>
            <option value="warning">Severity: warning</option>
          </select>
          <input
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
            placeholder="Find incident query/title"
            value={incidentSearch}
            onChange={(e) => setIncidentSearch(e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
            placeholder="Owner email for actions"
            value={incidentOwner}
            onChange={(e) => setIncidentOwner(e.target.value)}
          />
          <button
            type="button"
            className="btn-secondary text-xs py-1"
            onClick={() => load(staleDays, reviewTypeFilter, historyMeta.page || 1)}
          >
            Apply incident filters
          </button>
        </div>
        <div className="px-4 py-2 text-[11px] text-slate-500 border-b border-slate-200 bg-slate-50">
          Auto-generated incident cards
        </div>
        <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-3 border-b border-slate-200">
          {(perfHealth?.incidents || []).slice(0, 6).map((incident) => (
            <div
              key={`inc-${incident.id}`}
              className={`rounded-xl border p-3 text-xs ${String(incident.severity || '') === 'critical' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-slate-900">{incident.title}</div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${String(incident.severity || '') === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {incident.severity || 'warning'}
                </span>
              </div>
              <div className="text-slate-700 mt-1">{incident.summary}</div>
              <div className="text-[11px] text-slate-500 mt-2 font-mono">
                {incident.query_code} · {incident.incident_type} · status: {incident.status} · detections: {incident.detected_count}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Owner: {incident.owner_email || 'unassigned'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                SLA due: {incident.sla_due_at ? new Date(incident.sla_due_at).toLocaleString() : 'n/a'} · Escalation level: {Number(incident.escalation_level || 0)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  className="btn-secondary text-[11px] py-1 px-2"
                  onClick={() => onPerfIncidentAction(incident.id, 'acknowledge')}
                  disabled={incidentActionId === incident.id}
                >
                  Ack
                </button>
                <button
                  type="button"
                  className="btn-secondary text-[11px] py-1 px-2"
                  onClick={() => onPerfIncidentAction(incident.id, 'resolve')}
                  disabled={incidentActionId === incident.id}
                >
                  Resolve
                </button>
                <button
                  type="button"
                  className="btn-secondary text-[11px] py-1 px-2"
                  onClick={() => onPerfIncidentAction(incident.id, 'reopen')}
                  disabled={incidentActionId === incident.id}
                >
                  Reopen
                </button>
                <button
                  type="button"
                  className="btn-secondary text-[11px] py-1 px-2"
                  onClick={() => onPerfIncidentAction(incident.id, 'assign_owner')}
                  disabled={incidentActionId === incident.id}
                >
                  Assign
                </button>
                <button
                  type="button"
                  className="btn-secondary text-[11px] py-1 px-2"
                  onClick={() => onSelectPerfIncident(incident.id)}
                >
                  Timeline
                </button>
              </div>
            </div>
          ))}
          {!perfHealth?.incidents?.length && (
            <div className="text-xs text-slate-400">No open incidents detected for selected window.</div>
          )}
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="table-th text-left">Query code</th>
              <th className="table-th text-left">Samples</th>
              <th className="table-th text-left">Avg ms</th>
              <th className="table-th text-left">P90 ms</th>
              <th className="table-th text-left">P95 ms</th>
              <th className="table-th text-left">Max ms</th>
            </tr>
          </thead>
          <tbody>
            {(perfHealth?.queryBreakdown || []).slice(0, 12).map((row) => (
              <tr key={row.query_code} className="border-b border-slate-100">
                <td className="table-td font-mono">{row.query_code}</td>
                <td className="table-td">{row.samples}</td>
                <td className="table-td">{Number(row.avg_ms || row.avgMs || 0).toFixed(1)}</td>
                <td className="table-td">{Number(row.p90_ms || row.p90Ms || 0).toFixed(1)}</td>
                <td className="table-td">{Number(row.p95_ms || row.p95Ms || 0).toFixed(1)}</td>
                <td className="table-td">{Number(row.max_ms || row.maxMs || 0).toFixed(1)}</td>
              </tr>
            ))}
            {!perfHealth?.queryBreakdown?.length && (
              <tr><td className="table-td text-slate-400" colSpan={6}>No performance samples yet for selected window.</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-2 text-[11px] text-slate-500 border-y border-slate-200 bg-slate-50">
          Incident timeline {selectedPerfIncidentId ? `· #${selectedPerfIncidentId}` : ''}
        </div>
        <div className="px-4 py-3 border-b border-slate-200 bg-white">
          {!selectedPerfIncidentId && <div className="text-xs text-slate-400">Select an incident card to inspect event timeline.</div>}
          {!!selectedPerfIncidentId && (
            <div className="space-y-2">
              {(selectedPerfIncidentEvents || []).slice(0, 10).map((evt) => (
                <div key={evt.id} className="rounded-lg border border-slate-200 px-3 py-2 text-xs">
                  <div className="font-semibold text-slate-700">{evt.event_type}</div>
                  <div className="text-slate-500">{evt.note || 'No note'}</div>
                  <div className="text-[11px] text-slate-400">{evt.actor_email || 'system'} · {new Date(evt.created_at).toLocaleString()}</div>
                </div>
              ))}
              {!selectedPerfIncidentEvents?.length && <div className="text-xs text-slate-400">No timeline events found.</div>}
            </div>
          )}
        </div>
        <div className="px-4 py-2 text-[11px] text-slate-500 border-y border-slate-200 bg-slate-50">
          Top regressions (current window vs previous window)
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="table-th text-left">Query code</th>
              <th className="table-th text-left">Current P95</th>
              <th className="table-th text-left">Previous P95</th>
              <th className="table-th text-left">Drift</th>
              <th className="table-th text-left">Samples</th>
            </tr>
          </thead>
          <tbody>
            {(perfHealth?.regressions || []).slice(0, 8).map((row) => {
              const drift = Number(row.drift_ratio || row.driftRatio || 0)
              const isRegression = drift >= 1.1
              return (
                <tr key={`reg-${row.query_code}`} className="border-b border-slate-100">
                  <td className="table-td font-mono">{row.query_code}</td>
                  <td className="table-td">{Number(row.current_p95_ms || 0).toFixed(1)}ms</td>
                  <td className="table-td">{Number(row.previous_p95_ms || 0).toFixed(1)}ms</td>
                  <td className={`table-td font-semibold ${isRegression ? 'text-red-700' : 'text-emerald-700'}`}>
                    {drift > 0 ? `${((drift - 1) * 100).toFixed(1)}%` : 'n/a'}
                  </td>
                  <td className="table-td">
                    {Number(row.current_samples || 0)} / {Number(row.previous_samples || 0)}
                  </td>
                </tr>
              )
            })}
            {!perfHealth?.regressions?.length && (
              <tr><td className="table-td text-slate-400" colSpan={5}>No regression comparison data yet.</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-2 text-[11px] text-slate-500 border-y border-slate-200 bg-slate-50">
          Active dynamic thresholds
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="table-th text-left">Query code</th>
              <th className="table-th text-left">Threshold ms</th>
              <th className="table-th text-left">Current P95</th>
              <th className="table-th text-left">Previous P95</th>
              <th className="table-th text-left">Drift</th>
            </tr>
          </thead>
          <tbody>
            {(perfHealth?.tunedThresholds || []).slice(0, 8).map((row) => (
              <tr key={`thr-${row.query_code}`} className="border-b border-slate-100">
                <td className="table-td font-mono">{row.query_code}</td>
                <td className="table-td">{Number(row.dynamic_threshold_ms || 0).toFixed(1)}ms</td>
                <td className="table-td">{Number(row.last_window_p95_ms || 0).toFixed(1)}ms</td>
                <td className="table-td">{Number(row.previous_window_p95_ms || 0).toFixed(1)}ms</td>
                <td className="table-td">{Number(row.drift_ratio || 0).toFixed(2)}x</td>
              </tr>
            ))}
            {!perfHealth?.tunedThresholds?.length && (
              <tr><td className="table-td text-slate-400" colSpan={5}>No tuned thresholds yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card mb-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-bold text-slate-800">SLA and escalation</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary text-xs py-1.5" onClick={onEscalateOverdue}>
              Escalate overdue
            </button>
            <button type="button" className="btn-secondary text-xs py-1.5" onClick={onSendReviewReminders} disabled={sendingReminders}>
              {sendingReminders ? 'Sending…' : 'Send reminders'}
            </button>
            <button type="button" className="btn-secondary text-xs py-1.5" onClick={onRunOverrideExpiryMaintenance} disabled={runningExpiryMaintenance}>
              {runningExpiryMaintenance ? 'Processing…' : 'Run override expiry job'}
            </button>
            <button type="button" className="btn-secondary text-xs py-1.5" onClick={onRetryDeliveries} disabled={retryingDeliveries}>
              {retryingDeliveries ? 'Retrying…' : 'Retry failed deliveries'}
            </button>
            <button type="button" className="btn-secondary text-xs py-1.5" onClick={onRunDueSchedules} disabled={runningDueSchedules}>
              {runningDueSchedules ? 'Running…' : 'Run due schedules'}
            </button>
            <button type="button" className="btn-secondary text-xs py-1.5" onClick={onRunAutomation} disabled={runningAutomation}>
              {runningAutomation ? 'Running…' : 'Run full automation'}
            </button>
            <button type="button" className="btn-secondary text-xs py-1.5" onClick={onRetunePerformanceThresholds} disabled={retuningPerformance}>
              {retuningPerformance ? 'Retuning…' : 'Retune perf thresholds'}
            </button>
            <button type="button" className="btn-secondary text-xs py-1.5" onClick={onGeneratePerfIncidents} disabled={generatingPerfIncidents}>
              {generatingPerfIncidents ? 'Generating…' : 'Generate perf incidents'}
            </button>
            <button type="button" className="btn-secondary text-xs py-1.5" onClick={onEscalatePerfIncidents} disabled={runningPerfEscalation}>
              {runningPerfEscalation ? 'Escalating…' : 'Escalate perf incidents'}
            </button>
            <button type="button" className="btn-secondary text-xs py-1.5" onClick={onRunPerfRetention} disabled={runningPerfRetention}>
              {runningPerfRetention ? 'Pruning…' : 'Run perf retention'}
            </button>
            <button type="button" className="btn-secondary text-xs py-1.5" onClick={onRefreshRiskViews} disabled={refreshingRiskViews}>
              {refreshingRiskViews ? 'Refreshing…' : 'Refresh risk views'}
            </button>
            <button type="button" className="btn-secondary text-xs py-1.5" onClick={onRefreshDashboardCache} disabled={refreshingDashboardCache}>
              {refreshingDashboardCache ? 'Refreshing…' : 'Refresh cache'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-slate-500">Total reviews</div>
            <div className="text-lg font-bold text-slate-900">{slaSummary?.totalReviews || 0}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-slate-500">Open</div>
            <div className="text-lg font-bold text-slate-900">{slaSummary?.openReviews || 0}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-slate-500">Overdue</div>
            <div className="text-lg font-bold text-red-700">{slaSummary?.overdueReviews || 0}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-slate-500">Escalated</div>
            <div className="text-lg font-bold text-amber-700">{slaSummary?.escalatedReviews || 0}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-slate-500">Avg turnaround (hrs)</div>
            <div className="text-lg font-bold text-slate-900">{Number(slaSummary?.avgTurnaroundHours || 0).toFixed(1)}</div>
          </div>
        </div>
      </div>

      <div className="card mb-5">
        <h2 className="text-sm font-bold text-slate-800 mb-3">Override age buckets</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">0-30 days</div>
            <div className="text-lg font-extrabold text-slate-900">{agingMap['0_30_days']}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">31-90 days</div>
            <div className="text-lg font-extrabold text-slate-900">{agingMap['31_90_days']}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">90+ days</div>
            <div className="text-lg font-extrabold text-slate-900">{agingMap['90_plus_days']}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        <div className="card p-0 overflow-x-auto">
          <div className="px-4 py-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-800">Top risky users</h2>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="table-th text-left">User</th>
                <th className="table-th text-left">Risk score</th>
                <th className="table-th text-left">Risk band</th>
                <th className="table-th text-left">Overrides</th>
                <th className="table-th text-left">SoD</th>
              </tr>
            </thead>
            <tbody>
              {(data?.topRiskUsers || []).map((row) => (
                <tr key={row.user_id} className="border-b border-slate-100">
                  <td className="table-td">
                    {row.first_name} {row.last_name}
                    <div className="text-[10px] text-slate-400">{row.email}</div>
                  </td>
                  <td className="table-td font-bold text-red-700">{row.risk_score}</td>
                  <td className="table-td uppercase">{row.risk_band}</td>
                  <td className="table-td">{row.override_count}</td>
                  <td className="table-td">{row.sod_conflicts}</td>
                </tr>
              ))}
              {!data?.topRiskUsers?.length && <tr><td className="table-td text-slate-400" colSpan={5}>No risky users identified.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card p-0 overflow-x-auto">
          <div className="px-4 py-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-800">Critical controls watchlist</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-slate-500">Expiring accounts (30d)</div>
              <div className="text-lg font-bold text-amber-700">{(data?.expiringAccounts || []).length}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-slate-500">Dormant high privilege</div>
              <div className="text-lg font-bold text-red-700">{(data?.dormantHighPrivilege || []).length}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-slate-500">Orphan roles</div>
              <div className="text-lg font-bold text-slate-900">{(data?.orphanRoles || []).length}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-slate-500">MFA exceptions</div>
              <div className="text-lg font-bold text-red-700">{mfaReport?.exceptions || 0}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-bold text-slate-800">Risk policy configuration</h2>
          <button type="button" className="btn-secondary text-xs py-1.5" disabled={savingPolicy} onClick={onSaveRiskPolicy}>
            {savingPolicy ? 'Saving…' : 'Save policy'}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <label className="text-xs text-slate-600">
            Stale override days
            <input
              type="number"
              min={30}
              max={365}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              value={riskPolicyDraft.staleOverrideDays}
              onChange={(e) => setRiskPolicyDraft((s) => ({ ...s, staleOverrideDays: Number(e.target.value) || 90 }))}
            />
          </label>
          <label className="text-xs text-slate-600">
            Weight: SoD conflict
            <input
              type="number"
              min={1}
              max={20}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              value={riskPolicyDraft.weightSodConflict}
              onChange={(e) => setRiskPolicyDraft((s) => ({ ...s, weightSodConflict: Number(e.target.value) || 5 }))}
            />
          </label>
          <label className="text-xs text-slate-600">
            Weight: stale override
            <input
              type="number"
              min={1}
              max={20}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              value={riskPolicyDraft.weightStaleOverride}
              onChange={(e) => setRiskPolicyDraft((s) => ({ ...s, weightStaleOverride: Number(e.target.value) || 3 }))}
            />
          </label>
          <label className="text-xs text-slate-600">
            Weight: missing reason
            <input
              type="number"
              min={1}
              max={20}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              value={riskPolicyDraft.weightMissingReason}
              onChange={(e) => setRiskPolicyDraft((s) => ({ ...s, weightMissingReason: Number(e.target.value) || 2 }))}
            />
          </label>
          <label className="text-xs text-slate-600">
            Weight: override count
            <input
              type="number"
              min={1}
              max={20}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              value={riskPolicyDraft.weightOverrideCount}
              onChange={(e) => setRiskPolicyDraft((s) => ({ ...s, weightOverrideCount: Number(e.target.value) || 1 }))}
            />
          </label>
          <label className="text-xs text-slate-600">
            Inactivity days (high privilege)
            <input
              type="number"
              min={7}
              max={365}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              value={riskPolicyDraft.inactivityDaysHighPrivilege}
              onChange={(e) => setRiskPolicyDraft((s) => ({ ...s, inactivityDaysHighPrivilege: Number(e.target.value) || 60 }))}
            />
          </label>
        </div>
      </div>

      <div className="card mb-5 p-0 overflow-x-auto">
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-800">Urgent access review queue</h2>
            <button
              type="button"
              className="btn-secondary text-[11px] py-1.5"
              onClick={() => exportCsv('urgent-access-review-queue.csv', data?.urgentItems || [])}
            >
              Export CSV
            </button>
          </div>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="table-th text-left">User</th>
              <th className="table-th text-left">Department</th>
              <th className="table-th text-left">SoD conflicts</th>
              <th className="table-th text-left">Overrides</th>
              <th className="table-th text-left">Stale</th>
              <th className="table-th text-left">No reason</th>
              <th className="table-th text-left">Risk score</th>
              <th className="table-th text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {(data?.urgentItems || []).map((item) => (
              <tr key={item.user_id} className="border-b border-slate-100">
                <td className="table-td">
                  <div className="font-semibold text-slate-700">{item.first_name} {item.last_name}</div>
                  <div className="text-[10px] text-slate-400">{item.email}</div>
                </td>
                <td className="table-td">{item.department_name || '—'}</td>
                <td className="table-td">{item.sod_conflicts}</td>
                <td className="table-td">{item.override_count}</td>
                <td className="table-td">{item.stale_overrides}</td>
                <td className="table-td">{item.overrides_without_reason}</td>
                <td className="table-td font-bold text-red-700">{item.risk_score}</td>
                <td className="table-td">
                  <button
                    type="button"
                    className="btn-secondary text-[11px] py-1.5"
                    disabled={reviewingUserId === item.user_id}
                    onClick={() => markReviewed(item.user_id, 'urgent_item')}
                  >
                    {reviewingUserId === item.user_id ? 'Saving…' : 'Mark reviewed'}
                  </button>
                </td>
              </tr>
            ))}
            {!data?.urgentItems?.length && (
              <tr>
                <td className="table-td text-slate-400" colSpan={8}>No urgent review items.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="card p-0 overflow-x-auto">
          <div className="px-4 py-3 border-b border-slate-200">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-800">Department risk breakdown</h2>
              <button
                type="button"
                className="btn-secondary text-[11px] py-1.5"
                onClick={() => exportCsv('department-risk-breakdown.csv', data?.departmentRisk || [])}
              >
                Export CSV
              </button>
            </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="table-th text-left">Department</th>
                <th className="table-th text-left">Users</th>
                <th className="table-th text-left">Overrides</th>
                <th className="table-th text-left">SoD users</th>
              </tr>
            </thead>
            <tbody>
              {(data?.departmentRisk || []).map((row) => (
                <tr key={row.department_code} className="border-b border-slate-100">
                  <td className="table-td">{row.department_name}</td>
                  <td className="table-td">{row.users_count}</td>
                  <td className="table-td">{row.users_with_overrides}</td>
                  <td className="table-td">{row.users_with_sod_conflicts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-0 overflow-x-auto">
          <div className="px-4 py-3 border-b border-slate-200">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-800">Latest access exceptions</h2>
              <button
                type="button"
                className="btn-secondary text-[11px] py-1.5"
                onClick={() => exportCsv('latest-access-exceptions.csv', data?.accessExceptions || [])}
              >
                Export CSV
              </button>
            </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="table-th text-left">User</th>
                <th className="table-th text-left">Permission</th>
                <th className="table-th text-left">Effect</th>
                <th className="table-th text-left">Reason</th>
                <th className="table-th text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {(data?.accessExceptions || []).map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="table-td">
                    {row.first_name} {row.last_name}
                    <div className="text-[10px] text-slate-400">{row.department_name || '—'}</div>
                  </td>
                  <td className="table-td font-mono">{row.permission_code}</td>
                  <td className="table-td uppercase font-semibold">{row.effect}</td>
                  <td className="table-td">{row.reason || 'No reason recorded'}</td>
                  <td className="table-td">
                    <button
                      type="button"
                      className="btn-secondary text-[11px] py-1.5"
                      disabled={reviewingUserId === row.user_id}
                      onClick={() => markReviewed(row.user_id, 'access_exception')}
                    >
                      {reviewingUserId === row.user_id ? 'Saving…' : 'Mark reviewed'}
                    </button>
                  </td>
                </tr>
              ))}
              {!data?.accessExceptions?.length && (
                <tr>
                  <td className="table-td text-slate-400" colSpan={5}>No access exceptions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">
        <div className="card p-0 overflow-x-auto">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-800">SoD conflict details</h2>
            <button type="button" className="btn-secondary text-[11px] py-1.5" onClick={() => exportCsv('sod-conflicts.csv', data?.sodConflicts || [])}>
              Export CSV
            </button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="table-th text-left">User</th>
                <th className="table-th text-left">Code</th>
                <th className="table-th text-left">Severity</th>
                <th className="table-th text-left">Permissions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.sodConflicts || []).map((row, idx) => (
                <tr key={`${row.user_id}-${row.sod_code}-${idx}`} className="border-b border-slate-100">
                  <td className="table-td">{row.first_name} {row.last_name}</td>
                  <td className="table-td font-mono">{row.sod_code}</td>
                  <td className="table-td uppercase">{row.severity}</td>
                  <td className="table-td">
                    <span className="font-mono">{row.left_permission_code}</span>
                    <span className="mx-1 text-slate-400">vs</span>
                    <span className="font-mono">{row.right_permission_code}</span>
                  </td>
                </tr>
              ))}
              {!data?.sodConflicts?.length && (
                <tr><td className="table-td text-slate-400" colSpan={4}>No SoD conflicts found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card p-0 overflow-x-auto">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-800">Stale override details</h2>
            <button type="button" className="btn-secondary text-[11px] py-1.5" onClick={() => exportCsv('stale-overrides.csv', data?.staleOverrides || [])}>
              Export CSV
            </button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="table-th text-left">User</th>
                <th className="table-th text-left">Permission</th>
                <th className="table-th text-left">Effect</th>
                <th className="table-th text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {(data?.staleOverrides || []).map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="table-td">{row.first_name} {row.last_name}</td>
                  <td className="table-td font-mono">{row.permission_code}</td>
                  <td className="table-td uppercase">{row.effect}</td>
                  <td className="table-td">{new Date(row.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {!data?.staleOverrides?.length && (
                <tr><td className="table-td text-slate-400" colSpan={4}>No stale overrides for threshold.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">
        <div className="card p-0 overflow-x-auto">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-800">MFA exceptions (privileged users)</h2>
            <button type="button" className="btn-secondary text-[11px] py-1.5" onClick={() => exportCsv('mfa-exceptions.csv', (mfaReport?.items || []).filter((r) => !r.mfa_enabled))}>
              Export CSV
            </button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="table-th text-left">User</th>
                <th className="table-th text-left">Role</th>
                <th className="table-th text-left">Level</th>
                <th className="table-th text-left">MFA</th>
              </tr>
            </thead>
            <tbody>
              {(mfaReport?.items || []).filter((r) => !r.mfa_enabled).slice(0, 30).map((row) => (
                <tr key={row.user_id} className="border-b border-slate-100">
                  <td className="table-td">{row.first_name} {row.last_name}<div className="text-[10px] text-slate-400">{row.email}</div></td>
                  <td className="table-td">{row.role_code || '—'}</td>
                  <td className="table-td">{row.role_level || '—'}</td>
                  <td className="table-td text-red-700 font-semibold">DISABLED</td>
                </tr>
              ))}
              {!((mfaReport?.items || []).filter((r) => !r.mfa_enabled).length) && <tr><td className="table-td text-slate-400" colSpan={4}>No MFA exceptions.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card p-0 overflow-x-auto">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-800">Permission anomalies / refactor signals</h2>
            <button type="button" className="btn-secondary text-[11px] py-1.5" onClick={() => exportCsv('permission-anomalies.csv', data?.permissionAnomalies || [])}>
              Export CSV
            </button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="table-th text-left">Permission</th>
                <th className="table-th text-left">Users impacted</th>
                <th className="table-th text-left">Override count</th>
              </tr>
            </thead>
            <tbody>
              {(data?.overrideRefactorInsights || []).slice(0, 25).map((row) => (
                <tr key={row.permission_code} className="border-b border-slate-100">
                  <td className="table-td font-mono">{row.permission_code}</td>
                  <td className="table-td">{row.users_impacted}</td>
                  <td className="table-td">{row.override_count}</td>
                </tr>
              ))}
              {!data?.overrideRefactorInsights?.length && <tr><td className="table-td text-slate-400" colSpan={3}>No repeated override patterns yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-5 p-0 overflow-x-auto">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-800">Attestation evidence packs</h2>
          <form className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-2" onSubmit={onGenerateAttestationPack}>
            <select
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
              value={attestationDraft.reviewType}
              onChange={(e) => setAttestationDraft((s) => ({ ...s, reviewType: e.target.value }))}
            >
              <option value="">All review types</option>
              <option value="urgent_item">Urgent item</option>
              <option value="access_exception">Access exception</option>
              <option value="sod_conflict">SoD conflict</option>
              <option value="stale_override">Stale override</option>
            </select>
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
              placeholder="Reviewer email"
              value={attestationDraft.reviewer}
              onChange={(e) => setAttestationDraft((s) => ({ ...s, reviewer: e.target.value }))}
            />
            <select
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
              value={attestationDraft.status}
              onChange={(e) => setAttestationDraft((s) => ({ ...s, status: e.target.value }))}
            >
              <option value="">Any status</option>
              <option value="open">Open</option>
              <option value="in_review">In review</option>
              <option value="resolved">Resolved</option>
              <option value="reversed">Reversed</option>
            </select>
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
              type="date"
              value={attestationDraft.from}
              onChange={(e) => setAttestationDraft((s) => ({ ...s, from: e.target.value }))}
            />
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
              type="date"
              value={attestationDraft.to}
              onChange={(e) => setAttestationDraft((s) => ({ ...s, to: e.target.value }))}
            />
            <button type="submit" className="btn-secondary text-xs py-2" disabled={generatingAttestation}>
              {generatingAttestation ? 'Generating…' : 'Generate pack'}
            </button>
          </form>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="table-th text-left">Pack code</th>
              <th className="table-th text-left">Requested by</th>
              <th className="table-th text-left">Generated</th>
              <th className="table-th text-left">Expires</th>
              <th className="table-th text-left">Status</th>
              <th className="table-th text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {(attestationPacks || []).map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="table-td font-mono">{row.pack_code}</td>
                <td className="table-td">{row.requested_by || '—'}</td>
                <td className="table-td">{row.generated_at ? new Date(row.generated_at).toLocaleString() : '—'}</td>
                <td className="table-td">{row.expires_at ? new Date(row.expires_at).toLocaleDateString() : '—'}</td>
                <td className="table-td uppercase">{row.status || 'ready'}</td>
                <td className="table-td">
                  <a className="text-[#006838] font-semibold hover:underline" href={downloadRbacAttestationPackCsvUrl(row.id)} target="_blank" rel="noreferrer">
                    Download CSV
                  </a>
                </td>
              </tr>
            ))}
            {!attestationPacks.length && <tr><td className="table-td text-slate-400" colSpan={6}>No attestation packs generated yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card mt-5 p-0 overflow-x-auto">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-800">Review assignment queue</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="rounded-xl border border-slate-200 px-2 py-1.5 text-[11px]"
              placeholder="Bulk assignee email"
              value={bulkAssignee}
              onChange={(e) => setBulkAssignee(e.target.value)}
            />
            <button type="button" className="btn-secondary text-[11px] py-1.5" disabled={!selectedReviewIds.length} onClick={() => onBulkReviewUpdate('assign')}>
              Bulk assign
            </button>
            <button type="button" className="btn-secondary text-[11px] py-1.5" disabled={!selectedReviewIds.length} onClick={() => onBulkReviewUpdate('resolve')}>
              Bulk resolve
            </button>
            <button
              type="button"
              className="btn-secondary text-[11px] py-1.5"
              onClick={() => exportCsv('review-assignment-queue.csv', reviewQueue || [])}
            >
              Export CSV
            </button>
          </div>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="table-th text-left">Select</th>
              <th className="table-th text-left">Review</th>
              <th className="table-th text-left">Reviewed user</th>
              <th className="table-th text-left">Assigned to</th>
              <th className="table-th text-left">Priority</th>
              <th className="table-th text-left">Due</th>
              <th className="table-th text-left">Status</th>
              <th className="table-th text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {(reviewQueue || []).map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="table-td">
                  <input
                    type="checkbox"
                    checked={selectedReviewIds.includes(row.id)}
                    onChange={(e) =>
                      setSelectedReviewIds((prev) =>
                        e.target.checked ? [...new Set([...prev, row.id])] : prev.filter((id) => id !== row.id)
                      )
                    }
                  />
                </td>
                <td className="table-td">
                  <div className="font-semibold text-slate-700 uppercase">{row.review_type}</div>
                  <div className="text-[10px] text-slate-400">#{row.id}</div>
                </td>
                <td className="table-td">
                  <div>{row.first_name} {row.last_name}</div>
                  <div className="text-[10px] text-slate-400">{row.email}</div>
                </td>
                <td className="table-td">{row.assigned_to || '—'}</td>
                <td className="table-td uppercase">{row.priority || 'medium'}</td>
                <td className="table-td">{row.due_at ? new Date(row.due_at).toLocaleString() : '—'}</td>
                <td className="table-td">
                  <span className={row.is_overdue ? 'text-red-700 font-semibold uppercase' : 'uppercase'}>{row.status}</span>
                </td>
                <td className="table-td">
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      className="btn-secondary text-[11px] py-1.5"
                      disabled={workingReviewId === row.id}
                      onClick={() => onAssignReview(row.id)}
                    >
                      Assign
                    </button>
                    <button
                      type="button"
                      className="btn-secondary text-[11px] py-1.5"
                      disabled={workingReviewId === row.id}
                      onClick={() => onAddReviewComment(row.id)}
                    >
                      Comment
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!reviewQueue.length && (
              <tr><td className="table-td text-slate-400" colSpan={8}>No review assignments yet.</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Page {reviewQueueMeta.page} of {reviewQueueMeta.totalPages} · {reviewQueueMeta.total} records</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-secondary text-[11px] py-1.5"
              disabled={reviewQueueMeta.page <= 1}
              onClick={async () => {
                const page = Math.max(1, reviewQueueMeta.page - 1)
                const queue = await fetchRbacAccessReviewQueue({ page, pageSize: reviewQueueMeta.pageSize })
                setReviewQueue(queue.items || [])
                setReviewQueueMeta({
                  page: queue.page || 1,
                  pageSize: queue.pageSize || reviewQueueMeta.pageSize,
                  total: queue.total || 0,
                  totalPages: queue.totalPages || 1,
                })
              }}
            >
              Prev
            </button>
            <button
              type="button"
              className="btn-secondary text-[11px] py-1.5"
              disabled={reviewQueueMeta.page >= reviewQueueMeta.totalPages}
              onClick={async () => {
                const page = Math.min(reviewQueueMeta.totalPages, reviewQueueMeta.page + 1)
                const queue = await fetchRbacAccessReviewQueue({ page, pageSize: reviewQueueMeta.pageSize })
                setReviewQueue(queue.items || [])
                setReviewQueueMeta({
                  page: queue.page || 1,
                  pageSize: queue.pageSize || reviewQueueMeta.pageSize,
                  total: queue.total || 0,
                  totalPages: queue.totalPages || 1,
                })
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">
        <div className="card p-0 overflow-x-auto">
          <div className="px-4 py-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-800">Scheduled compliance reports</h2>
            <form className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2" onSubmit={onCreateSchedule}>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                placeholder="Schedule code"
                value={newSchedule.scheduleCode}
                onChange={(e) => setNewSchedule((s) => ({ ...s, scheduleCode: e.target.value }))}
                required
              />
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                value={newSchedule.reportType}
                onChange={(e) => setNewSchedule((s) => ({ ...s, reportType: e.target.value }))}
              >
                <option value="access_review_summary">Access review summary</option>
                <option value="sod_exposure">SoD exposure</option>
                <option value="review_reminder_batch">Review reminder batch</option>
                <option value="delivery_retry_batch">Delivery retry batch</option>
              </select>
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                value={newSchedule.frequency}
                onChange={(e) => setNewSchedule((s) => ({ ...s, frequency: e.target.value }))}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="manual">Manual</option>
              </select>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs md:col-span-2"
                placeholder="Recipients (comma-separated emails)"
                value={newSchedule.recipients}
                onChange={(e) => setNewSchedule((s) => ({ ...s, recipients: e.target.value }))}
              />
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                type="datetime-local"
                value={newSchedule.nextRunAt}
                onChange={(e) => setNewSchedule((s) => ({ ...s, nextRunAt: e.target.value }))}
              />
              <button type="submit" className="btn-secondary text-xs py-2 md:col-span-3">Create schedule</button>
            </form>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="table-th text-left">Schedule</th>
                <th className="table-th text-left">Report</th>
                <th className="table-th text-left">Frequency</th>
                <th className="table-th text-left">Next run</th>
                <th className="table-th text-left">Status</th>
                <th className="table-th text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {(schedules || []).map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="table-td font-mono">{row.schedule_code}</td>
                  <td className="table-td">{row.report_type}</td>
                  <td className="table-td uppercase">{row.frequency}</td>
                  <td className="table-td">{row.next_run_at ? new Date(row.next_run_at).toLocaleString() : '—'}</td>
                  <td className="table-td uppercase">{row.status}</td>
                  <td className="table-td">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        className="btn-secondary text-[11px] py-1.5"
                        disabled={runningScheduleId === row.id}
                        onClick={() => onRunScheduleNow(row.id)}
                      >
                        {runningScheduleId === row.id ? 'Running…' : 'Run now'}
                      </button>
                      <button type="button" className="btn-secondary text-[11px] py-1.5" onClick={() => onToggleSchedule(row)}>
                        {row.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!schedules.length && <tr><td className="table-td text-slate-400" colSpan={6}>No schedules configured yet.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card p-0 overflow-x-auto">
          <div className="px-4 py-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-800">Notification events</h2>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="table-th text-left">Event</th>
                <th className="table-th text-left">Recipient</th>
                <th className="table-th text-left">Channel</th>
                <th className="table-th text-left">Severity</th>
                <th className="table-th text-left">Delivery</th>
                <th className="table-th text-left">Message</th>
                <th className="table-th text-left">When</th>
              </tr>
            </thead>
            <tbody>
              {(notifications || []).map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="table-td font-mono">{row.event_code}</td>
                  <td className="table-td">{row.recipient || '—'}</td>
                  <td className="table-td uppercase">{row.channel}</td>
                  <td className="table-td uppercase">{row.severity}</td>
                  <td className="table-td">
                    <span className="uppercase">{row.delivery_status || 'sent'}</span>
                    <div className="text-[10px] text-slate-400">attempts: {row.delivery_attempts || 0}</div>
                  </td>
                  <td className="table-td">
                    <div className="font-semibold text-slate-700">{row.title}</div>
                    <div className="text-[10px] text-slate-400">{row.body || '—'}</div>
                  </td>
                  <td className="table-td">{new Date(row.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!notifications.length && <tr><td className="table-td text-slate-400" colSpan={7}>No notification events yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-5 p-0 overflow-x-auto">
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-800">Review history</h2>
            <button
              type="button"
              className="btn-secondary text-[11px] py-1.5"
              onClick={() => exportCsv('access-review-history.csv', reviewHistory || [])}
            >
              Export CSV
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-2">
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs md:col-span-2"
              placeholder="Search user/email/note"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
            <input className="rounded-xl border border-slate-200 px-3 py-2 text-xs" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <input className="rounded-xl border border-slate-200 px-3 py-2 text-xs" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
              placeholder="Reviewer email"
              value={reviewerFilter}
              onChange={(e) => setReviewerFilter(e.target.value)}
            />
            <button type="button" className="btn-secondary text-xs py-2" onClick={() => load(staleDays, reviewTypeFilter, 1)}>
              Apply filters
            </button>
          </div>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="table-th text-left">Reviewed user</th>
              <th className="table-th text-left">Review type</th>
              <th className="table-th text-left">Reviewer</th>
              <th className="table-th text-left">Note</th>
              <th className="table-th text-left">
                <button
                  type="button"
                  className="font-semibold"
                  onClick={() => {
                    const nextDir = historySortDir === 'desc' ? 'asc' : 'desc'
                    setHistorySortBy('reviewed_at')
                    setHistorySortDir(nextDir)
                    fetchRbacAccessReviewHistory({
                      reviewType: reviewTypeFilter,
                      reviewer: reviewerFilter,
                      from: fromDate,
                      to: toDate,
                      q: searchFilter,
                      page: historyMeta.page || 1,
                      pageSize: historyMeta.pageSize,
                      sortBy: 'reviewed_at',
                      sortDir: nextDir,
                    })
                      .then((history) => {
                        setReviewHistory(history.items || [])
                        setHistoryMeta({
                          page: history.page || 1,
                          pageSize: history.pageSize || historyMeta.pageSize,
                          total: history.total || 0,
                          totalPages: history.totalPages || 1,
                        })
                      })
                      .catch((e) => setError(e.message || 'Failed to sort review history'))
                  }}
                >
                  When {historySortBy === 'reviewed_at' ? (historySortDir === 'desc' ? '↓' : '↑') : ''}
                </button>
              </th>
              <th className="table-th text-left">Status</th>
              <th className="table-th text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {(reviewHistory || []).map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="table-td">
                  <div className="font-semibold text-slate-700">{row.reviewed_user_name || 'Unknown user'}</div>
                  <div className="text-[10px] text-slate-400">{row.reviewed_user_email || '—'}</div>
                </td>
                <td className="table-td uppercase">{row.review_type}</td>
                <td className="table-td font-mono">{row.actor_email}</td>
                <td className="table-td">{row.review_note || 'No note'}</td>
                <td className="table-td">{new Date(row.created_at).toLocaleString()}</td>
                <td className="table-td uppercase">{row.status}</td>
                <td className="table-td">
                  <button type="button" className="btn-secondary text-[11px] py-1.5" onClick={() => onUpdateReviewStatus(row.id, 'reversed')}>
                    Mark reversed
                  </button>
                </td>
              </tr>
            ))}
            {!reviewHistory.length && (
              <tr>
                <td className="table-td text-slate-400" colSpan={7}>No review history for this filter yet.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Page {historyMeta.page} of {historyMeta.totalPages} · {historyMeta.total} records</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-secondary text-[11px] py-1.5"
              disabled={historyMeta.page <= 1}
              onClick={() => load(staleDays, reviewTypeFilter, Math.max(1, historyMeta.page - 1))}
            >
              Prev
            </button>
            <button
              type="button"
              className="btn-secondary text-[11px] py-1.5"
              disabled={historyMeta.page >= historyMeta.totalPages}
              onClick={() => load(staleDays, reviewTypeFilter, Math.min(historyMeta.totalPages, historyMeta.page + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
