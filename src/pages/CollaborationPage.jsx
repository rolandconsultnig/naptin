import { useState } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import {
  WORKSPACES, SHARED_FILES, PROJECTS, PROJECT_TASKS, FORUM_THREADS, WIKI_ARTICLES, CALENDAR_EVENTS,
} from '../data/mock'
import {
  FolderKanban, CalendarDays, FolderOpen, ListTodo, MessagesSquare, BookOpen, Users, FileText,
  Plus, Lock,
} from 'lucide-react'

const TABS = [
  { id: 'workspaces', label: 'Workspaces', icon: FolderKanban },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'projects', label: 'Projects & tasks', icon: ListTodo },
  { id: 'forums', label: 'Forums', icon: MessagesSquare },
  { id: 'knowledge', label: 'Knowledge / Wiki', icon: BookOpen },
]

export default function CollaborationPage() {
  const [tab, setTab] = useState('workspaces')
  const [projFilter, setProjFilter] = useState('p1')

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Collaboration</h1>
            <p className="text-sm text-slate-400">
              Workspaces, shared files, projects, forums, knowledge base, and scheduling — prototype UI (connect backend for real-time co-editing).
            </p>
          </div>
        </div>
        <button type="button" className="btn-primary self-start">
          <Plus size={15} /> New workspace
        </button>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WORKSPACES.map((w) => (
            <div key={w.id} className="card hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">{w.name}</h3>
                <span className="badge badge-blue text-[10px]">{w.dept}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Users size={12} /> {w.members} members
                </span>
                <span className="flex items-center gap-1">
                  <FileText size={12} /> {w.files} files
                </span>
                <span>{w.posts} discussions</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-3">Updated {w.updated}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 card">
            <p className="text-sm font-bold text-slate-800 mb-4">March 2026 — key dates</p>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 font-bold mb-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                const has = CALENDAR_EVENTS.some((e) => e.day === d)
                const isToday = d === 28
                return (
                  <div
                    key={d}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold border ${
                      isToday ? 'bg-[#006838] text-white border-[#006838]' : 'bg-slate-50 text-slate-600 border-slate-100'
                    } ${has && !isToday ? 'ring-2 ring-amber-400/80' : ''}`}
                  >
                    {d}
                  </div>
                )
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-3">Amber ring = scheduled event (prototype).</p>
          </div>
          <div className="card">
            <p className="text-sm font-bold text-slate-800 mb-4">Upcoming</p>
            <div className="space-y-3">
              {CALENDAR_EVENTS.map((e) => (
                <div key={e.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{e.title}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {e.day} {e.month} · {e.time} · {e.location}
                  </p>
                  <span className="badge badge-green text-[9px] mt-2 inline-block">{e.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'files' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-th text-left">
                <th className="table-th">Document</th>
                <th className="table-th">Owner</th>
                <th className="table-th">Size</th>
                <th className="table-th">Shared in</th>
                <th className="table-th">Modified</th>
              </tr>
            </thead>
            <tbody>
              {SHARED_FILES.map((f, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/80">
                  <td className="table-td font-semibold text-slate-800 flex items-center gap-2">
                    {f.lock && <Lock size={12} className="text-amber-500 flex-shrink-0" />}
                    {f.name}
                  </td>
                  <td className="table-td font-mono text-xs">{f.owner}</td>
                  <td className="table-td text-slate-500">{f.size}</td>
                  <td className="table-td text-slate-600">{f.shared}</td>
                  <td className="table-td text-slate-400 text-xs">{f.modified}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'projects' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-3">
            {PROJECTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProjFilter(p.id)}
                className={`w-full text-left card transition-all ${projFilter === p.id ? 'ring-2 ring-[#006838]/40' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-slate-800">{p.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === 'at-risk' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
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
          <div className="card">
            <p className="text-sm font-bold text-slate-800 mb-4">Tasks for selected project</p>
            <div className="space-y-2">
              {PROJECT_TASKS.filter((t) => t.project === projFilter).map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{t.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {t.assignee} · Due {t.due}
                    </p>
                  </div>
                  <span className="badge badge-amber text-[9px]">{t.status}</span>
                </div>
              ))}
              {PROJECT_TASKS.filter((t) => t.project === projFilter).length === 0 && (
                <p className="text-xs text-slate-400">No tasks for this project in the mock set.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'forums' && (
        <div className="space-y-3">
          {FORUM_THREADS.map((th) => (
            <div key={th.id} className="card flex items-start justify-between gap-4 hover:shadow-md transition-shadow cursor-pointer">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {th.pinned && <span className="badge badge-green text-[9px]">Pinned</span>}
                  <span className="badge badge-blue text-[9px]">{th.tag}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-800">{th.title}</h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Started by {th.author} · {th.replies} replies · {th.views} views · Last {th.last}
                </p>
              </div>
            </div>
          ))}
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
