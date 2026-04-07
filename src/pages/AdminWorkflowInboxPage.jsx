import { useEffect, useMemo, useState } from 'react'
import { useWorkflowInbox } from '../admin/workflow/hooks/useWorkflowInbox'

const STATUS_OPTIONS = ['pending', 'claimed', 'completed', 'overdue']

export default function AdminWorkflowInboxPage() {
  const {
    tasks,
    loading,
    actingTaskId,
    error,
    loadMyTasks,
    claimTask,
    completeTask,
  } = useWorkflowInbox()
  const [statusFilter, setStatusFilter] = useState('pending')

  useEffect(() => {
    loadMyTasks({ status: statusFilter }).catch(() => {})
  }, [statusFilter])

  const summary = useMemo(() => {
    const pending = tasks.filter((task) => (task.status || '').toLowerCase() === 'pending').length
    const overdue = tasks.filter((task) => (task.status || '').toLowerCase() === 'overdue').length
    const completed = tasks.filter((task) => (task.status || '').toLowerCase() === 'completed').length
    return { pending, overdue, completed }
  }, [tasks])

  return (
    <div className="animate-fade-up max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Workflow Inbox</h1>
        <p className="text-sm text-slate-500 mt-1">Claim, action, and complete workflow tasks with SLA visibility.</p>
      </div>

      {error && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="card">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">Pending</p>
          <p className="text-3xl font-extrabold text-slate-900">{summary.pending}</p>
        </div>
        <div className="card">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">Overdue</p>
          <p className="text-3xl font-extrabold text-red-700">{summary.overdue}</p>
        </div>
        <div className="card">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">Completed</p>
          <p className="text-3xl font-extrabold text-emerald-700">{summary.completed}</p>
        </div>
      </div>

      <div className="card mb-5">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="select max-w-[220px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-secondary text-xs"
            onClick={() => loadMyTasks({ status: statusFilter })}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="table-th text-left">Task</th>
              <th className="table-th text-left">Case</th>
              <th className="table-th text-left">Status</th>
              <th className="table-th text-left">Due</th>
              <th className="table-th text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && tasks.length === 0 && (
              <tr>
                <td className="table-td text-slate-500" colSpan={5}>No tasks in this view.</td>
              </tr>
            )}
            {tasks.map((task) => {
              const status = (task.status || 'pending').toLowerCase()
              const due = task.dueAt || task.due_at || '—'
              return (
                <tr key={task.id} className="border-b border-slate-50 last:border-0">
                  <td className="table-td font-semibold text-slate-800">{task.title || task.taskRef || task.task_ref || `Task #${task.id}`}</td>
                  <td className="table-td text-slate-600">{task.caseRef || task.case_ref || task.caseId || task.case_id || '—'}</td>
                  <td className="table-td capitalize text-slate-700">{status}</td>
                  <td className="table-td text-slate-600">{due}</td>
                  <td className="table-td">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary text-xs"
                        onClick={() => claimTask(task.id)}
                        disabled={actingTaskId === task.id || status !== 'pending'}
                      >
                        Claim
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary text-xs"
                        onClick={() => completeTask(task.id, { decision: 'approved' })}
                        disabled={actingTaskId === task.id || !['pending', 'claimed', 'overdue'].includes(status)}
                      >
                        Complete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
