import { useState, useMemo, useCallback } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import {
  WORKSPACES, WIKI_ARTICLES,
} from '../data/mock'
import {
  FolderKanban, CalendarDays, FolderOpen, ListTodo, MessagesSquare, BookOpen, Users, FileText,
  Plus, Lock, X, ChevronLeft, ChevronRight, Plug2,
} from 'lucide-react'
import useFetch from '../hooks/useFetch'
import useMutation from '../hooks/useMutation'
import { useAuth } from '../context/AuthContext'
import { collabApi } from '../services/collaborationService'
import { openMicrosoftOfficeDesktop, openWithSystemDefaultApp } from '../lib/officeAppLinks'

const TABS = [
  { id: 'workspaces', label: 'Workspaces', icon: FolderKanban },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'office', label: 'Office & WPS', icon: Plug2 },
  { id: 'projects', label: 'Projects & tasks', icon: ListTodo },
  { id: 'forums', label: 'Forums', icon: MessagesSquare },
  { id: 'knowledge', label: 'Knowledge / Wiki', icon: BookOpen },
]

function formatUpdated(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

function formatForumLast(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  } catch {
    return '—'
  }
}

function authorShort(email) {
  if (!email) return '—'
  const local = String(email).split('@')[0] || email
  const parts = local.split(/[._-]+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return local.slice(0, 2).toUpperCase()
}

function mapApiWorkspace(w) {
  return {
    _src: 'api',
    id: String(w.id),
    name: w.name,
    dept: w.department || 'General',
    description: w.description || '',
    members: w.memberCount ?? 0,
    files: w.docCount ?? 0,
    posts: 0,
    updated: formatUpdated(w.updatedAt),
  }
}

export default function CollaborationPage() {
  const { user } = useAuth()
  const userEmail = user?.email || ''

  const [tab, setTab] = useState('workspaces')
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [selectedWsId, setSelectedWsId] = useState(null)
  const [showNewWs, setShowNewWs] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newDept, setNewDept] = useState('General')
  const [newDocTitle, setNewDocTitle] = useState('')
  const [newDocBody, setNewDocBody] = useState('')
  const [newDocWebUrl, setNewDocWebUrl] = useState('')
  const [calendarDate, setCalendarDate] = useState(() => new Date(2026, 2, 1))
  const [selectedDay, setSelectedDay] = useState(null)
  const [showNewEvent, setShowNewEvent] = useState(false)
  const [eventForm, setEventForm] = useState({
    title: '',
    day: '',
    time: '09:00',
    location: '',
    type: 'meeting',
  })

  const [selectedForumId, setSelectedForumId] = useState(null)
  const [showNewForum, setShowNewForum] = useState(false)
  const [newForumTitle, setNewForumTitle] = useState('')
  const [newForumTag, setNewForumTag] = useState('General')
  const [newForumBody, setNewForumBody] = useState('')
  const [replyBody, setReplyBody] = useState('')

  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectOwner, setNewProjectOwner] = useState('')
  const [newProjectDue, setNewProjectDue] = useState('')
  const [newProjectStatus, setNewProjectStatus] = useState('on-track')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskAssignee, setNewTaskAssignee] = useState('')
  const [newTaskDue, setNewTaskDue] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')

  const [showNewFile, setShowNewFile] = useState(false)
  const [newFileTitle, setNewFileTitle] = useState('')
  const [newFileShared, setNewFileShared] = useState('Shared library')
  const [newFileNotes, setNewFileNotes] = useState('')
  const [newFileWebUrl, setNewFileWebUrl] = useState('')
  const [newFileLocked, setNewFileLocked] = useState(false)
  const [fileWebUrlModal, setFileWebUrlModal] = useState(null)

  const { data: apiWorkspaces, loading: wsLoading, refetch: refetchWs } = useFetch(
    () => collabApi.getWorkspaces(userEmail ? { userEmail } : {}),
    [userEmail]
  )

  const workspaces = useMemo(() => {
    const list = apiWorkspaces || []
    if (list.length) return list.map(mapApiWorkspace)
    return WORKSPACES.map((w) => ({ ...w, _src: 'mock' }))
  }, [apiWorkspaces])

  const wsIdNum = useMemo(() => {
    const n = Number(selectedWsId)
    return Number.isFinite(n) && n > 0 ? n : null
  }, [selectedWsId])

  const { data: wsMembers = [] } = useFetch(
    () => (wsIdNum ? collabApi.getWorkspaceMembers(wsIdNum) : Promise.resolve([])),
    [wsIdNum]
  )
  const { data: wsDocuments = [], refetch: refetchDocs } = useFetch(
    () => (wsIdNum ? collabApi.getWorkspaceDocuments(wsIdNum) : Promise.resolve([])),
    [wsIdNum]
  )
  const wsMembersList = Array.isArray(wsMembers) ? wsMembers : []
  const wsDocumentsList = Array.isArray(wsDocuments) ? wsDocuments : []

  const createWsMut = useMutation((payload) => collabApi.createWorkspace(payload), {
    onSuccess: () => {
      refetchWs()
      setShowNewWs(false)
      setNewName('')
      setNewDesc('')
      setNewDept('General')
    },
    successMsg: 'Workspace created',
  })

  const addDocMut = useMutation(
    useCallback(
      (payload) => collabApi.createWorkspaceDocument(wsIdNum, payload),
      [wsIdNum]
    ),
    {
      onSuccess: () => {
        refetchDocs()
        setNewDocTitle('')
        setNewDocBody('')
        setNewDocWebUrl('')
      },
      successMsg: 'Document added',
    }
  )

  const selectedRow = workspaces.find((w) => w.id === selectedWsId)

  const calYear = calendarDate.getFullYear()
  const calMonth = calendarDate.getMonth()
  const calMonthShort = calendarDate.toLocaleDateString('en-GB', { month: 'short' })
  const calLabel = calendarDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDow = (new Date(calYear, calMonth, 1).getDay() + 6) % 7
  const monthCells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const moveCalendar = (delta) => {
    setCalendarDate((prev) => {
      const next = new Date(prev)
      next.setMonth(next.getMonth() + delta)
      return next
    })
    setSelectedDay(null)
  }

  const { data: apiCalendarEvents = [], error: calendarError, refetch: refetchCalendar } = useFetch(
    () =>
      tab === 'calendar'
        ? collabApi.getCalendarEvents({ year: calYear, month: calMonth + 1 })
        : Promise.resolve([]),
    [tab, calYear, calMonth]
  )

  const monthEvents = Array.isArray(apiCalendarEvents) ? apiCalendarEvents : []
  const selectedDayEvents = monthEvents.filter((e) => e.day === selectedDay)

  const createEventMut = useMutation((payload) => collabApi.createCalendarEvent(payload), {
    onSuccess: (created) => {
      refetchCalendar()
      if (created?.day) setSelectedDay(created.day)
      setShowNewEvent(false)
      setEventForm({
        title: '',
        day: '',
        time: '09:00',
        location: '',
        type: 'meeting',
      })
    },
    successMsg: 'Event added',
  })

  const { data: apiForumThreads, loading: forumListLoading, error: forumListError, refetch: refetchForumThreads } = useFetch(
    () => (tab === 'forums' ? collabApi.getForumThreads() : Promise.resolve([])),
    [tab]
  )
  const forumThreadsList = Array.isArray(apiForumThreads) ? apiForumThreads : []

  const { data: forumDetail, loading: forumDetailLoading, refetch: refetchForumDetail } = useFetch(
    () =>
      tab === 'forums' && selectedForumId
        ? collabApi.getForumThread(selectedForumId)
        : Promise.resolve(null),
    [tab, selectedForumId]
  )

  const createForumThreadMut = useMutation((payload) => collabApi.createForumThread(payload), {
    onSuccess: (created) => {
      refetchForumThreads()
      setShowNewForum(false)
      setNewForumTitle('')
      setNewForumTag('General')
      setNewForumBody('')
      if (created?.id) setSelectedForumId(created.id)
    },
    successMsg: 'Thread created',
  })

  const createForumPostMut = useMutation(
    useCallback(
      ({ threadId, body }) =>
        collabApi.createForumPost(threadId, { body, authorEmail: userEmail || 'staff@naptin.gov.ng' }),
      [userEmail]
    ),
    {
      onSuccess: () => {
        refetchForumDetail()
        refetchForumThreads()
        setReplyBody('')
      },
      successMsg: 'Reply posted',
    }
  )

  const { data: apiProjects, loading: projectsLoading, error: projectsError, refetch: refetchProjects } = useFetch(
    () => (tab === 'projects' ? collabApi.getProjects() : Promise.resolve([])),
    [tab]
  )
  const projectsList = Array.isArray(apiProjects) ? apiProjects : []

  const activeProjectId = useMemo(() => {
    if (!projectsList.length) return null
    if (selectedProjectId != null && projectsList.some((p) => p.id === selectedProjectId)) return selectedProjectId
    return projectsList[0].id
  }, [projectsList, selectedProjectId])

  const { data: apiTasks, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useFetch(
    () => (tab === 'projects' && activeProjectId ? collabApi.getProjectTasks(activeProjectId) : Promise.resolve([])),
    [tab, activeProjectId]
  )
  const tasksList = Array.isArray(apiTasks) ? apiTasks : []

  const createProjectMut = useMutation((payload) => collabApi.createProject(payload), {
    onSuccess: (created) => {
      refetchProjects()
      setShowNewProject(false)
      setNewProjectName('')
      setNewProjectOwner('')
      setNewProjectDue('')
      setNewProjectStatus('on-track')
      if (created?.id) setSelectedProjectId(created.id)
    },
    successMsg: 'Project created',
  })

  const createTaskMut = useMutation((payload) => {
    const { projectId, ...body } = payload
    const pid = Number(projectId)
    if (!Number.isFinite(pid) || pid < 1) return Promise.reject(new Error('Invalid project'))
    return collabApi.createProjectTask(pid, body)
  }, {
    onSuccess: () => {
      refetchTasks()
      refetchProjects()
      setNewTaskTitle('')
      setNewTaskAssignee('')
      setNewTaskDue('')
      setNewTaskPriority('medium')
    },
    successMsg: 'Task added',
  })

  const updateTaskStatusMut = useMutation(
    (args) => collabApi.updateProjectTask(args.taskId, { status: args.status }),
    {
      onSuccess: () => {
        refetchTasks()
        refetchProjects()
      },
    }
  )

  const { data: apiSharedFiles, loading: filesLoading, error: filesError, refetch: refetchSharedFiles } = useFetch(
    () => (tab === 'files' ? collabApi.getSharedFiles() : Promise.resolve([])),
    [tab]
  )
  const sharedFilesList = Array.isArray(apiSharedFiles) ? apiSharedFiles : []

  const createSharedFileMut = useMutation((payload) => collabApi.createSharedFile(payload), {
    onSuccess: () => {
      refetchSharedFiles()
      setShowNewFile(false)
      setNewFileTitle('')
      setNewFileShared('Shared library')
      setNewFileNotes('')
      setNewFileWebUrl('')
      setNewFileLocked(false)
    },
    successMsg: 'File registered',
  })

  const updateSharedFileWebUrlMut = useMutation(
    ({ id, webUrl }) =>
      collabApi.updateDocument(id, {
        webUrl: webUrl === '' ? null : webUrl,
        editedBy: userEmail || 'staff@naptin.gov.ng',
      }),
    {
      onSuccess: () => {
        refetchSharedFiles()
        setFileWebUrlModal(null)
      },
      successMsg: 'Cloud link saved',
    }
  )

  const toggleSharedFileLockMut = useMutation(
    ({ id, isLocked }) =>
      collabApi.updateDocument(id, {
        isLocked,
        editedBy: userEmail || 'staff@naptin.gov.ng',
      }),
    {
      onSuccess: () => refetchSharedFiles(),
    }
  )

  const { data: officeHints, loading: officeHintsLoading, error: officeHintsError } = useFetch(
    () => (tab === 'office' ? collabApi.getOfficeIntegrationHints() : Promise.resolve(null)),
    [tab]
  )

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Collaboration</h1>
            <p className="text-sm text-slate-400">
              Workspaces, calendar, forums, projects, shared files, Microsoft Office / WPS links, and knowledge articles.
            </p>
          </div>
        </div>
        <button type="button" className="btn-primary self-start" onClick={() => setShowNewWs(true)}>
          <Plus size={15} /> New workspace
        </button>
      </div>

      {showNewWs && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowNewWs(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800">Create workspace</p>
              <button type="button" className="text-slate-400 hover:text-slate-600" onClick={() => setShowNewWs(false)}>
                <X size={16} />
              </button>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Name</label>
              <input
                className="np-input mt-0.5 w-full text-sm"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Q2 Audit workspace"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Description</label>
              <textarea
                className="np-input mt-0.5 w-full text-sm min-h-[72px]"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Short purpose statement"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Department label</label>
              <input
                className="np-input mt-0.5 w-full text-sm"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                placeholder="e.g. Finance"
              />
            </div>
            <p className="text-[10px] text-slate-400">Owner will be set to your signed-in email ({userEmail || 'use directory login'}).</p>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" className="btn-secondary text-sm" onClick={() => setShowNewWs(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary text-sm disabled:opacity-40"
                disabled={!newName.trim() || createWsMut.loading}
                onClick={() =>
                  createWsMut.run({
                    name: newName.trim(),
                    description: newDesc.trim(),
                    department: newDept.trim() || 'General',
                    ownerEmail: userEmail || 'staff@naptin.gov.ng',
                  })
                }
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewEvent && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowNewEvent(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800">Add calendar event</p>
              <button type="button" className="text-slate-400 hover:text-slate-600" onClick={() => setShowNewEvent(false)}>
                <X size={16} />
              </button>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Title</label>
              <input
                className="np-input mt-0.5 w-full text-sm"
                value={eventForm.title}
                onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Budget review meeting"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Day ({calMonthShort})</label>
                <input
                  type="number"
                  min={1}
                  max={daysInMonth}
                  className="np-input mt-0.5 w-full text-sm"
                  value={eventForm.day}
                  onChange={(e) => setEventForm((f) => ({ ...f, day: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Time</label>
                <input
                  type="time"
                  className="np-input mt-0.5 w-full text-sm"
                  value={eventForm.time}
                  onChange={(e) => setEventForm((f) => ({ ...f, time: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Location</label>
              <input
                className="np-input mt-0.5 w-full text-sm"
                value={eventForm.location}
                onChange={(e) => setEventForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Conference Room A"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Type</label>
              <select
                className="np-input mt-0.5 w-full text-sm"
                value={eventForm.type}
                onChange={(e) => setEventForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="meeting">meeting</option>
                <option value="internal">internal</option>
                <option value="board">board</option>
                <option value="procurement">procurement</option>
                <option value="maintenance">maintenance</option>
                <option value="training">training</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" className="btn-secondary text-sm" onClick={() => setShowNewEvent(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary text-sm disabled:opacity-40"
                disabled={!eventForm.title.trim() || !eventForm.day || createEventMut.loading}
                onClick={() => {
                  const day = Number(eventForm.day)
                  if (!eventForm.title.trim() || !day || day < 1 || day > daysInMonth) return
                  const eventDate = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  createEventMut.run({
                    title: eventForm.title.trim(),
                    eventDate,
                    time: eventForm.time || '09:00',
                    location: eventForm.location.trim() || 'TBD',
                    type: eventForm.type || 'meeting',
                    createdBy: userEmail || 'staff@naptin.gov.ng',
                  })
                }}
              >
                Add event
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1 mb-6 bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              tab === t.id ? 'bg-[#006838] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'workspaces' && (
        <div className="space-y-5">
          {!wsLoading && !apiWorkspaces?.length && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              Live workspaces are unavailable — showing sample cards. Try again later or contact ICT if this persists.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspaces.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedWsId(w.id)}
                className={`text-left card hover:shadow-md transition-shadow cursor-pointer ring-offset-2 ${
                  selectedWsId === w.id ? 'ring-2 ring-[#006838]/50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800">{w.name}</h3>
                  <span className="badge badge-blue text-[10px]">{w.dept}</span>
                </div>
                {w.description ? <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">{w.description}</p> : null}
                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {w.members} members
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={12} /> {w.files} files
                  </span>
                  {w.posts ? <span>{w.posts} discussions</span> : null}
                </div>
                <p className="text-[10px] text-slate-400 mt-3">Updated {w.updated}</p>
              </button>
            ))}
          </div>

          {selectedRow && wsIdNum && (
            <div className="card space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Workspace detail</p>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-1">{selectedRow.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-1">{selectedRow.description || 'No description.'}</p>
                </div>
                <button type="button" className="text-xs text-slate-500 hover:text-slate-800" onClick={() => setSelectedWsId(null)}>
                  Clear selection
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Members</p>
                  <ul className="space-y-1.5 text-xs">
                    {wsMembersList.map((m) => (
                      <li key={m.id} className="flex justify-between gap-2 py-1.5 border-b border-slate-50 last:border-0">
                        <span className="font-mono text-slate-700 truncate">{m.userEmail || m.userId}</span>
                        <span className="text-slate-400 flex-shrink-0">{m.role}</span>
                      </li>
                    ))}
                    {!wsMembersList.length && <li className="text-slate-400">No members returned.</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Documents</p>
                  <ul className="space-y-1.5 text-xs max-h-40 overflow-y-auto">
                    {wsDocumentsList.map((d) => (
                      <li key={d.id} className="py-1.5 border-b border-slate-50 last:border-0">
                        <span className="font-semibold text-slate-800">{d.title}</span>
                        <span className="text-slate-400 ml-2">v{d.version}</span>
                        {d.webUrl ? (
                          <div className="mt-1 flex flex-wrap gap-1 items-center">
                            <button
                              type="button"
                              className="text-[10px] font-semibold text-[#006838] hover:underline"
                              onClick={() => openMicrosoftOfficeDesktop(d.webUrl)}
                            >
                              MS Office
                            </button>
                            <button
                              type="button"
                              className="text-[10px] font-semibold text-slate-600 hover:underline"
                              onClick={() => openWithSystemDefaultApp(d.webUrl)}
                            >
                              Open link
                            </button>
                          </div>
                        ) : null}
                        {d.content ? (
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{d.content}</p>
                        ) : null}
                      </li>
                    ))}
                    {!wsDocumentsList.length && <li className="text-slate-400">No documents yet.</li>}
                  </ul>
                  <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Add text document</p>
                    <input
                      className="np-input w-full text-xs"
                      placeholder="Title"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                    />
                    <textarea
                      className="np-input w-full text-xs min-h-[60px]"
                      placeholder="Body (stored as workspace text)"
                      value={newDocBody}
                      onChange={(e) => setNewDocBody(e.target.value)}
                    />
                    <input
                      className="np-input w-full text-xs font-mono"
                      placeholder="Optional SharePoint / OneDrive https://…"
                      value={newDocWebUrl}
                      onChange={(e) => setNewDocWebUrl(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-primary text-xs disabled:opacity-40"
                      disabled={!newDocTitle.trim() || addDocMut.loading}
                      onClick={() => {
                        const payload = {
                          title: newDocTitle.trim(),
                          content: newDocBody,
                          createdBy: userEmail || 'staff@naptin.gov.ng',
                        }
                        const w = newDocWebUrl.trim()
                        if (w) payload.webUrl = w
                        addDocMut.run(payload)
                      }}
                    >
                      Save document
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedRow && !wsIdNum && (
            <p className="text-xs text-slate-500 border border-slate-100 rounded-xl px-3 py-2 bg-slate-50">
              This is a sample workspace. Choose a workspace from the list above to load members and documents.
            </p>
          )}
        </div>
      )}

      {tab === 'calendar' && (
        <div className="space-y-3">
          {calendarError && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              Calendar could not be loaded. Check your connection and try again.
            </p>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-800">{calLabel} — key dates</p>
              <div className="flex items-center gap-1">
                <button type="button" className="btn-secondary text-xs" onClick={() => setShowNewEvent(true)}>
                  <Plus size={12} /> Add event
                </button>
                <button type="button" className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => moveCalendar(-1)}>
                  <ChevronLeft size={14} />
                </button>
                <button type="button" className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => moveCalendar(1)}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 font-bold mb-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthCells.map((d, i) => {
                if (!d) return <div key={`blank-${i}`} className="aspect-square" />
                const has = monthEvents.some((e) => e.day === d)
                const active = d === selectedDay
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDay((prev) => (prev === d ? null : d))}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold border ${
                      active ? 'bg-[#006838] text-white border-[#006838]' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                    } ${has && !active ? 'ring-2 ring-amber-400/80' : ''}`}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-3">Click a date to filter events. Amber ring means at least one event.</p>
          </div>
          <div className="card">
            <p className="text-sm font-bold text-slate-800 mb-4">
              {selectedDay ? `Events on ${selectedDay} ${calMonthShort}` : `Upcoming (${calMonthShort})`}
            </p>
            <div className="space-y-3">
              {(selectedDay ? selectedDayEvents : monthEvents).map((e) => (
                <div key={e.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{e.title}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {e.day} {e.month} · {e.time} · {e.location}
                  </p>
                  <span className="badge badge-green text-[9px] mt-2 inline-block">{e.type}</span>
                </div>
              ))}
              {!(selectedDay ? selectedDayEvents : monthEvents).length && (
                <p className="text-xs text-slate-400">No events for this month or day yet.</p>
              )}
            </div>
          </div>
          </div>
        </div>
      )}

      {tab === 'files' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              Organisation-wide file register. Workspace-specific files are under <strong>Workspaces</strong>.
            </p>
            <button type="button" className="btn-primary text-xs" onClick={() => setShowNewFile(true)}>
              <Plus size={14} /> Register file
            </button>
          </div>
          {filesError && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              Shared files could not be loaded. Check your connection and try again.
            </p>
          )}
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-th text-left">
                  <th className="table-th">Document</th>
                  <th className="table-th">Owner</th>
                  <th className="table-th">Size</th>
                  <th className="table-th">Shared in</th>
                  <th className="table-th">Modified</th>
                  <th className="table-th">Open</th>
                  <th className="table-th w-24">Lock</th>
                </tr>
              </thead>
              <tbody>
                {filesLoading && (
                  <tr>
                    <td colSpan={7} className="table-td text-xs text-slate-400">
                      Loading…
                    </td>
                  </tr>
                )}
                {!filesLoading &&
                  !filesError &&
                  sharedFilesList.map((f) => (
                    <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50/80">
                      <td className="table-td font-semibold text-slate-800">
                        <span className="flex items-center gap-2">
                          {f.lock && <Lock size={12} className="text-amber-500 flex-shrink-0" aria-hidden />}
                          <span>{f.name}</span>
                          <span className="text-[10px] font-normal text-slate-400">.{f.fileType}</span>
                        </span>
                      </td>
                      <td className="table-td font-mono text-xs" title={f.uploadedBy}>
                        {authorShort(f.uploadedBy)}
                      </td>
                      <td className="table-td text-slate-500">{f.size}</td>
                      <td className="table-td text-slate-600">{f.shared}</td>
                      <td className="table-td text-slate-400 text-xs">{f.modified}</td>
                      <td className="table-td">
                        <div className="flex flex-wrap items-center gap-1">
                          {f.webUrl ? (
                            <>
                              <button
                                type="button"
                                className="text-[10px] font-semibold text-[#006838] hover:underline"
                                title="Open in Microsoft Office desktop (Windows)"
                                onClick={() => openMicrosoftOfficeDesktop(f.webUrl)}
                              >
                                MS Office
                              </button>
                              <span className="text-slate-200">|</span>
                              <button
                                type="button"
                                className="text-[10px] font-semibold text-slate-600 hover:underline"
                                title="Open the HTTPS link (browser; WPS may open if configured)"
                                onClick={() => openWithSystemDefaultApp(f.webUrl)}
                              >
                                Open link
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400">—</span>
                          )}
                          <button
                            type="button"
                            className="text-[10px] font-semibold text-slate-500 hover:underline ml-1"
                            onClick={() =>
                              setFileWebUrlModal({ id: f.id, name: f.name, url: f.webUrl || '' })
                            }
                          >
                            {f.webUrl ? 'Edit link' : 'Add link'}
                          </button>
                        </div>
                      </td>
                      <td className="table-td">
                        <button
                          type="button"
                          className="text-[10px] font-semibold text-[#006838] hover:underline disabled:opacity-50"
                          disabled={toggleSharedFileLockMut.loading}
                          onClick={() =>
                            toggleSharedFileLockMut.run({ id: f.id, isLocked: !f.lock })
                          }
                        >
                          {f.lock ? 'Unlock' : 'Lock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                {!filesLoading && !filesError && sharedFilesList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="table-td text-xs text-slate-400">
                      No shared files yet — use Register file to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {showNewFile && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowNewFile(false)}>
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">Register shared file</p>
                  <button type="button" className="text-slate-400 hover:text-slate-600" onClick={() => setShowNewFile(false)}>
                    <X size={16} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Add a catalogue entry and optional notes. For full document workflow, use Workspaces.
                </p>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">File name</label>
                  <input
                    className="np-input mt-0.5 w-full text-sm"
                    value={newFileTitle}
                    onChange={(e) => setNewFileTitle(e.target.value)}
                    placeholder="e.g. Policy_v2.pdf"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Shared in (label)</label>
                  <input
                    className="np-input mt-0.5 w-full text-sm"
                    value={newFileShared}
                    onChange={(e) => setNewFileShared(e.target.value)}
                    placeholder="e.g. Finance workspace"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Notes (optional)</label>
                  <textarea
                    className="np-input mt-0.5 w-full text-sm min-h-[72px]"
                    value={newFileNotes}
                    onChange={(e) => setNewFileNotes(e.target.value)}
                    placeholder="Short description or link text"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">
                    SharePoint / OneDrive URL (optional)
                  </label>
                  <input
                    className="np-input mt-0.5 w-full text-xs font-mono"
                    value={newFileWebUrl}
                    onChange={(e) => setNewFileWebUrl(e.target.value)}
                    placeholder="https://… (opens in MS Office or browser / WPS)"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={newFileLocked}
                    onChange={(e) => setNewFileLocked(e.target.checked)}
                  />
                  Mark as locked
                </label>
                <button
                  type="button"
                  className="btn-primary w-full text-sm"
                  disabled={createSharedFileMut.loading || !newFileTitle.trim()}
                  onClick={() => {
                    const ext = newFileTitle.includes('.') ? newFileTitle.split('.').pop() : 'document'
                    createSharedFileMut.run({
                      title: newFileTitle.trim(),
                      fileType: ext?.slice(0, 32) || 'document',
                      content: newFileNotes.trim(),
                      sharedLabel: newFileShared.trim() || 'Shared library',
                      isLocked: newFileLocked,
                      uploadedBy: userEmail || 'staff@naptin.gov.ng',
                      ...(newFileWebUrl.trim() ? { webUrl: newFileWebUrl.trim() } : {}),
                    })
                  }}
                >
                  {createSharedFileMut.loading ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          )}

          {fileWebUrlModal && (
            <div
              className="fixed inset-0 z-[95] flex items-center justify-center bg-black/40 p-4"
              onClick={() => setFileWebUrlModal(null)}
            >
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">Cloud document link</p>
                  <button type="button" className="text-slate-400 hover:text-slate-600" onClick={() => setFileWebUrlModal(null)}>
                    <X size={16} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Use a full <code className="text-[10px] bg-slate-100 px-1 rounded">https://</code> URL from SharePoint,
                  OneDrive, or your organisation&apos;s WPS cloud. Leave empty and save to remove the link.
                </p>
                <p className="text-xs font-semibold text-slate-700 truncate" title={fileWebUrlModal.name}>
                  {fileWebUrlModal.name}
                </p>
                <input
                  className="np-input w-full text-xs font-mono"
                  value={fileWebUrlModal.url}
                  onChange={(e) => setFileWebUrlModal((m) => (m ? { ...m, url: e.target.value } : m))}
                  placeholder="https://…"
                />
                <button
                  type="button"
                  className="btn-primary w-full text-sm"
                  disabled={updateSharedFileWebUrlMut.loading}
                  onClick={() =>
                    updateSharedFileWebUrlMut.run({
                      id: fileWebUrlModal.id,
                      webUrl: fileWebUrlModal.url.trim(),
                    })
                  }
                >
                  {updateSharedFileWebUrlMut.loading ? 'Saving…' : 'Save link'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'office' && (
        <div className="space-y-4">
          <div className="card space-y-3">
            <h2 className="text-sm font-bold text-slate-800">Microsoft Office and WPS</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Register <strong>https</strong> links to files that already live in Microsoft 365 (SharePoint / OneDrive) or
              your WPS cloud. From the <strong>Files</strong> tab, use <em>MS Office</em> to launch the desktop suite on
              Windows via standard Office URI schemes, or <em>Open link</em> to open the URL in the browser (WPS may take
              over if it is the default handler).
            </p>
            <p className="text-xs text-slate-500">
              Inline notes stored only in this portal are not Office documents; for full co-authoring, keep the master file
              in M365 or WPS and paste its link here.
            </p>
            <p className="text-[10px] text-slate-400">
              Technical reference:{' '}
              <a
                className="text-[#006838] underline"
                href="https://learn.microsoft.com/office/client-developer/office-url-schemes"
                target="_blank"
                rel="noreferrer"
              >
                Office URL schemes (Microsoft Learn)
              </a>
              .
            </p>
          </div>

          <div className="card space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Organisation shortcuts</h3>
            {officeHintsError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                Could not load integration hints.
              </p>
            )}
            {officeHintsLoading && <p className="text-xs text-slate-400">Loading…</p>}
            {!officeHintsLoading && !officeHintsError && officeHints && (
              <ul className="text-xs space-y-2">
                <li className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-700 w-28 shrink-0">SharePoint</span>
                  {officeHints.sharePointHomeUrl ? (
                    <a
                      href={officeHints.sharePointHomeUrl}
                      className="text-[#006838] underline break-all"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {officeHints.sharePointHomeUrl}
                    </a>
                  ) : (
                    <span className="text-slate-400">Not configured (set COLLAB_SHAREPOINT_HOME_URL on the API server).</span>
                  )}
                </li>
                <li className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-700 w-28 shrink-0">WPS</span>
                  {officeHints.wpsHomeUrl ? (
                    <a href={officeHints.wpsHomeUrl} className="text-[#006838] underline break-all" target="_blank" rel="noreferrer">
                      {officeHints.wpsHomeUrl}
                    </a>
                  ) : (
                    <span className="text-slate-400">Not configured (set COLLAB_WPS_HOME_URL on the API server).</span>
                  )}
                </li>
                <li className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-700 w-28 shrink-0">Teams</span>
                  {officeHints.teamsDeepLinkBase ? (
                    <a
                      href={officeHints.teamsDeepLinkBase}
                      className="text-[#006838] underline break-all"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {officeHints.teamsDeepLinkBase}
                    </a>
                  ) : (
                    <span className="text-slate-400">Optional: COLLAB_TEAMS_DEEP_LINK</span>
                  )}
                </li>
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === 'projects' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">Track initiatives and tasks by project.</p>
            <button type="button" className="btn-primary text-xs" onClick={() => setShowNewProject(true)}>
              <Plus size={14} /> New project
            </button>
          </div>
          {projectsError && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              Projects could not be loaded. Check your connection and try again.
            </p>
          )}
          {tasksError && activeProjectId && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              Could not load tasks for this project.
            </p>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-3">
              {projectsLoading && <p className="text-xs text-slate-400 px-1">Loading projects…</p>}
              {!projectsLoading && !projectsError && projectsList.length === 0 && (
                <p className="text-xs text-slate-400 card p-4">No projects yet. Create one with &quot;New project&quot;.</p>
              )}
              {projectsList.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`w-full text-left card transition-all ${
                    activeProjectId === p.id ? 'ring-2 ring-[#006838]/40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-slate-800">{p.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'at-risk' || p.status === 'delayed'
                          ? 'bg-amber-100 text-amber-800'
                          : p.status === 'completed'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-[#006838] rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Owner {p.owner} · Due {p.due} · {p.tasksDone}/{p.tasksOpen + p.tasksDone} tasks closed
                  </p>
                </button>
              ))}
            </div>
            <div className="card space-y-4">
              <p className="text-sm font-bold text-slate-800">Tasks for selected project</p>
              {!activeProjectId && <p className="text-xs text-slate-400">Select or create a project.</p>}
              {activeProjectId && tasksLoading && <p className="text-xs text-slate-400">Loading tasks…</p>}
              {activeProjectId && !tasksLoading && !tasksError && (
                <>
                  <div className="space-y-2">
                    {tasksList.map((t) => (
                      <div
                        key={t.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800">{t.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {t.assignee} · Due {t.due} · {t.priority}
                          </p>
                        </div>
                        <select
                          className="np-input text-[10px] py-1 max-w-[140px] self-start sm:self-center"
                          value={t.status}
                          disabled={updateTaskStatusMut.loading}
                          onChange={(e) =>
                            updateTaskStatusMut.run({ taskId: t.id, status: e.target.value })
                          }
                        >
                          <option value="todo">todo</option>
                          <option value="in-progress">in-progress</option>
                          <option value="blocked">blocked</option>
                          <option value="done">done</option>
                        </select>
                      </div>
                    ))}
                    {tasksList.length === 0 && (
                      <p className="text-xs text-slate-400">No tasks yet — add one below.</p>
                    )}
                  </div>
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Add task</p>
                    <input
                      className="np-input w-full text-xs"
                      placeholder="Title"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        className="np-input w-full text-xs"
                        placeholder="Assignee (e.g. initials)"
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                      />
                      <input
                        className="np-input w-full text-xs"
                        type="date"
                        value={newTaskDue}
                        onChange={(e) => setNewTaskDue(e.target.value)}
                      />
                    </div>
                    <select
                      className="np-input w-full text-xs"
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                    >
                      <option value="high">high</option>
                      <option value="medium">medium</option>
                      <option value="low">low</option>
                    </select>
                    <button
                      type="button"
                      className="btn-primary text-xs"
                      disabled={createTaskMut.loading || !newTaskTitle.trim() || !activeProjectId}
                      onClick={() =>
                        createTaskMut.run({
                          projectId: activeProjectId,
                          title: newTaskTitle.trim(),
                          assigneeLabel: newTaskAssignee.trim(),
                          dueDate: newTaskDue ? newTaskDue : null,
                          priority: newTaskPriority,
                        })
                      }
                    >
                      Add task
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {showNewProject && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowNewProject(false)}>
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">New project</p>
                  <button type="button" className="text-slate-400 hover:text-slate-600" onClick={() => setShowNewProject(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Name</label>
                  <input
                    className="np-input mt-0.5 w-full text-sm"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project name"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Owner label</label>
                  <input
                    className="np-input mt-0.5 w-full text-sm"
                    value={newProjectOwner}
                    onChange={(e) => setNewProjectOwner(e.target.value)}
                    placeholder="e.g. BA or team lead initials"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Due date</label>
                  <input
                    className="np-input mt-0.5 w-full text-sm"
                    type="date"
                    value={newProjectDue}
                    onChange={(e) => setNewProjectDue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Status</label>
                  <select
                    className="np-input mt-0.5 w-full text-sm"
                    value={newProjectStatus}
                    onChange={(e) => setNewProjectStatus(e.target.value)}
                  >
                    <option value="on-track">on-track</option>
                    <option value="at-risk">at-risk</option>
                    <option value="delayed">delayed</option>
                    <option value="completed">completed</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="btn-primary w-full text-sm"
                  disabled={createProjectMut.loading || !newProjectName.trim()}
                  onClick={() =>
                    createProjectMut.run({
                      name: newProjectName.trim(),
                      ownerLabel: newProjectOwner.trim() || authorShort(userEmail || 'staff@naptin.gov.ng'),
                      dueDate: newProjectDue || null,
                      status: newProjectStatus,
                      createdBy: userEmail || 'staff@naptin.gov.ng',
                    })
                  }
                >
                  {createProjectMut.loading ? 'Creating…' : 'Create project'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'forums' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">Discussion threads across the organisation.</p>
            <button type="button" className="btn-primary text-xs" onClick={() => setShowNewForum(true)}>
              <Plus size={14} /> New thread
            </button>
          </div>
          {forumListError && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              Forums could not be loaded. Check your connection and try again.
            </p>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              {forumListLoading && <p className="text-xs text-slate-400 px-1">Loading threads…</p>}
              {!forumListLoading && !forumListError && forumThreadsList.length === 0 && (
                <p className="text-xs text-slate-400 card p-4">No threads yet. Start one with &quot;New thread&quot;.</p>
              )}
              {forumThreadsList.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => {
                    setSelectedForumId(th.id)
                    setReplyBody('')
                  }}
                  className={`card w-full text-left flex items-start justify-between gap-4 hover:shadow-md transition-shadow border ${
                    selectedForumId === th.id ? 'border-[#006838]/40 ring-1 ring-[#006838]/15' : 'border-slate-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {th.pinned && <span className="badge badge-green text-[9px]">Pinned</span>}
                      <span className="badge badge-blue text-[9px]">{th.tag}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">{th.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Started by {authorShort(th.authorEmail)} · {th.replies} replies · {th.views} views · Last{' '}
                      {formatForumLast(th.lastActivity)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="card min-h-[280px]">
              {!selectedForumId && (
                <p className="text-sm text-slate-400">Select a thread to read posts and reply.</p>
              )}
              {selectedForumId && forumDetailLoading && <p className="text-xs text-slate-400">Loading thread…</p>}
              {selectedForumId && !forumDetailLoading && forumDetail?.thread && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {forumDetail.thread.pinned && <span className="badge badge-green text-[9px]">Pinned</span>}
                        <span className="badge badge-blue text-[9px]">{forumDetail.thread.tag}</span>
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">{forumDetail.thread.title}</h3>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {authorShort(forumDetail.thread.authorEmail)} · {forumDetail.thread.views} views ·{' '}
                        {formatUpdated(forumDetail.thread.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-slate-500 hover:text-slate-800"
                      onClick={() => setSelectedForumId(null)}
                    >
                      Close
                    </button>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {forumDetail.thread.body}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Replies</p>
                    <ul className="space-y-3 max-h-56 overflow-y-auto">
                      {(Array.isArray(forumDetail.posts) ? forumDetail.posts : []).map((p) => (
                        <li key={p.id} className="text-xs border-b border-slate-100 pb-2 last:border-0">
                          <span className="font-semibold text-slate-800">{authorShort(p.authorEmail)}</span>
                          <span className="text-slate-400 ml-2">{formatForumLast(p.createdAt)}</span>
                          <p className="text-slate-600 mt-1 whitespace-pre-wrap">{p.body}</p>
                        </li>
                      ))}
                    </ul>
                    {!(Array.isArray(forumDetail.posts) && forumDetail.posts.length) && (
                      <p className="text-xs text-slate-400">No replies yet — be the first.</p>
                    )}
                  </div>
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <textarea
                      className="np-input w-full text-xs min-h-[72px]"
                      placeholder="Write a reply…"
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-primary text-xs"
                      disabled={createForumPostMut.loading || !replyBody.trim()}
                      onClick={() =>
                        createForumPostMut.run({ threadId: selectedForumId, body: replyBody.trim() })
                      }
                    >
                      Post reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {showNewForum && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowNewForum(false)}>
              <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">New forum thread</p>
                  <button type="button" className="text-slate-400 hover:text-slate-600" onClick={() => setShowNewForum(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Title</label>
                  <input
                    className="np-input mt-0.5 w-full text-sm"
                    value={newForumTitle}
                    onChange={(e) => setNewForumTitle(e.target.value)}
                    placeholder="Topic title"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Tag</label>
                  <input
                    className="np-input mt-0.5 w-full text-sm"
                    value={newForumTag}
                    onChange={(e) => setNewForumTag(e.target.value)}
                    placeholder="e.g. HR, ICT"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Opening post</label>
                  <textarea
                    className="np-input mt-0.5 w-full text-sm min-h-[100px]"
                    value={newForumBody}
                    onChange={(e) => setNewForumBody(e.target.value)}
                    placeholder="What do you want to discuss?"
                  />
                </div>
                <button
                  type="button"
                  className="btn-primary w-full text-sm"
                  disabled={createForumThreadMut.loading || !newForumTitle.trim()}
                  onClick={() =>
                    createForumThreadMut.run({
                      title: newForumTitle.trim(),
                      tag: newForumTag.trim() || 'General',
                      body: newForumBody.trim(),
                      authorEmail: userEmail || 'staff@naptin.gov.ng',
                    })
                  }
                >
                  {createForumThreadMut.loading ? 'Creating…' : 'Create thread'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'knowledge' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WIKI_ARTICLES.map((a) => (
            <div key={a.id} className="card hover:border-[#006838]/30 transition-colors cursor-pointer">
              <span className="badge badge-green text-[9px] mb-2">{a.category}</span>
              <h3 className="text-sm font-bold text-slate-800">{a.title}</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{a.excerpt}</p>
              <p className="text-[10px] text-slate-400 mt-3">Updated {a.updated}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
