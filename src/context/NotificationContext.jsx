import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'

const NotificationContext = createContext(null)

const STORAGE_KEY = 'naptin_notifications'
const MAX_STORED = 60

/** Generates a human-readable relative time string from an epoch ms timestamp */
export function relativeTime(ts) {
  const diff = Date.now() - ts
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

/** Colour dot class by type */
export const TYPE_DOT = {
  success: 'bg-emerald-500',
  info:    'bg-blue-500',
  warning: 'bg-amber-500',
  error:   'bg-red-500',
  task:    'bg-[#006838]',
  breach:  'bg-red-600',
}

function seedNotifications() {
  const now = Date.now()
  return [
    {
      id: 'n-seed-1',
      title: 'Leave request approved',
      sub: 'Your annual leave for April has been approved by HR',
      ts: now - 2 * 60_000,
      type: 'success',
      read: false,
      link: '/app/human-resource/self-service',
      module: 'HR',
    },
    {
      id: 'n-seed-2',
      title: 'Board Meeting — Monday 9AM',
      sub: '14 attendees confirmed for Board Strategy Session',
      ts: now - 18 * 60_000,
      type: 'info',
      read: false,
      link: '/app/meetings',
      module: 'Meetings',
    },
    {
      id: 'n-seed-3',
      title: 'Document pending review',
      sub: 'BSc Certificate awaiting verification in Staff Records',
      ts: now - 60 * 60_000,
      type: 'warning',
      read: false,
      link: '/app/human-resource/people',
      module: 'HR',
    },
    {
      id: 'n-seed-4',
      title: 'ICT Maintenance tonight',
      sub: 'Server downtime 11 PM – 2 AM. Save your work.',
      ts: now - 2 * 3_600_000,
      type: 'warning',
      read: true,
      link: '/app/ict',
      module: 'ICT',
    },
    {
      id: 'n-seed-5',
      title: 'Training Module 3 available',
      sub: 'Cybersecurity Awareness — enroll now before 14 Apr',
      ts: now - 3 * 3_600_000,
      type: 'info',
      read: true,
      link: '/app/training',
      module: 'Training',
    },
    {
      id: 'n-seed-6',
      title: 'SLA Breach — CASE-2026-0309',
      sub: 'Corrective Action task exceeded 24-hr SLA. Escalated.',
      ts: now - 4 * 3_600_000,
      type: 'breach',
      read: true,
      link: '/app/process-maker',
      module: 'Process Maker',
    },
    {
      id: 'n-seed-7',
      title: 'Budget Circular 2026/001 published',
      sub: 'All HODs: submit departmental budget estimates by 30 Apr',
      ts: now - 6 * 3_600_000,
      type: 'task',
      read: true,
      link: '/app/finance',
      module: 'Finance',
    },
  ]
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

function saveToStorage(notifications) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_STORED)))
  } catch {
    // storage full — ignore
  }
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    return loadFromStorage() || seedNotifications()
  })

  // Persist on every change
  useEffect(() => {
    saveToStorage(notifications)
  }, [notifications])

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  )

  /** Add a new notification; auto-assigns id and ts */
  const addNotification = useCallback(({ title, sub, type = 'info', link = null, module = '' }) => {
    const id = `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setNotifications(prev => [
      { id, title, sub, ts: Date.now(), type, read: false, link, module },
      ...prev,
    ].slice(0, MAX_STORED))
  }, [])

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const remove = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    addNotification,
    markRead,
    markAllRead,
    remove,
    clearAll,
  }), [notifications, unreadCount, addNotification, markRead, markAllRead, remove, clearAll])

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider')
  return ctx
}
