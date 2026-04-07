import { useState } from 'react'
import {
  claimWorkflowTaskApi,
  completeWorkflowTaskApi,
  fetchMyWorkflowTasksApi,
  fetchRoleWorkflowTasksApi,
} from '../../workflowApi'

export function useWorkflowInbox() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [actingTaskId, setActingTaskId] = useState(null)
  const [error, setError] = useState('')

  const loadMyTasks = async (params = {}) => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchMyWorkflowTasksApi(params)
      setTasks(Array.isArray(data?.items) ? data.items : [])
      return data
    } catch (err) {
      setError(err?.message || 'Failed to load workflow inbox')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const loadRoleTasks = async (roleKey, params = {}) => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchRoleWorkflowTasksApi(roleKey, params)
      setTasks(Array.isArray(data?.items) ? data.items : [])
      return data
    } catch (err) {
      setError(err?.message || 'Failed to load role queue')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const claimTask = async (taskId) => {
    setActingTaskId(taskId)
    setError('')
    try {
      const updated = await claimWorkflowTaskApi(taskId)
      setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...updated } : task)))
      return updated
    } catch (err) {
      setError(err?.message || 'Failed to claim task')
      throw err
    } finally {
      setActingTaskId(null)
    }
  }

  const completeTask = async (taskId, payload = {}) => {
    setActingTaskId(taskId)
    setError('')
    try {
      const result = await completeWorkflowTaskApi(taskId, payload)
      setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: 'completed' } : task)))
      return result
    } catch (err) {
      setError(err?.message || 'Failed to complete task')
      throw err
    } finally {
      setActingTaskId(null)
    }
  }

  return {
    tasks,
    loading,
    actingTaskId,
    error,
    loadMyTasks,
    loadRoleTasks,
    claimTask,
    completeTask,
  }
}
