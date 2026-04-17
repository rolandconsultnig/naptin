import { useEffect, useMemo, useState } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import { STAFF } from '../data/mock'
import { Search, Mail, Building2, Hash } from 'lucide-react'
import { hrmsApi } from '../services/hrmsService'

const BADGE_COLORS = ['bg-[#006838]', 'bg-blue-600', 'bg-purple-600', 'bg-amber-600', 'bg-rose-600']

function toInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'NA'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function toStatus(employmentStatus = '') {
  const v = String(employmentStatus || '').toLowerCase()
  if (v === 'active') return 'active'
  if (v === 'leave' || v === 'on_leave') return 'leave'
  if (v === 'probation') return 'probation'
  return 'pending'
}

function mapEmployeeToCard(e, index, managerLookup = {}) {
  const fullName = e.full_name || e.name || [e.firstName, e.lastName].filter(Boolean).join(' ')
  const managerName = managerLookup[e.id] || e.manager_name || e.supervisorName || 'Unassigned'
  return {
    id: e.employee_number || e.employeeId || `EMP-${e.id}`,
    name: fullName || 'Unknown Employee',
    initials: toInitials(fullName),
    role: e.job_title || e.positionTitle || 'Staff',
    dept: e.department || e.departmentName || 'HR',
    email: e.email || '—',
    grade: e.grade_level || e.gradeLevel || e.employment_status || 'active',
    status: toStatus(e.employment_status || e.employmentStatus),
    manager: managerName,
    color: BADGE_COLORS[index % BADGE_COLORS.length],
  }
}

export default function DirectoryPage() {
  const [q, setQ] = useState('')
  const [dept, setDept] = useState('All')
  const [rows, setRows] = useState(STAFF)
  const [isLoading, setIsLoading] = useState(false)
  const [note, setNote] = useState('')

  const loadDirectory = async () => {
    setIsLoading(true)
    try {
      const employeesData = await hrmsApi.getEmployees({ limit: 200 })
      const items = Array.isArray(employeesData?.employees) ? employeesData.employees : []
      if (!items.length) {
        setRows(STAFF)
        setNote('No HRMS records found. Showing sample directory.')
      } else {
        setRows(items.map((item, i) => mapEmployeeToCard(item, i, {})))
        setNote('Synced from HRMS API (same client as workbench).')
      }
    } catch {
      setRows(STAFF)
      setNote('Directory is temporarily unavailable. Showing saved sample listings.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDirectory()
  }, [])

  const depts = useMemo(() => ['All', ...new Set(rows.map((s) => s.dept))], [rows])
  const filtered = useMemo(() => {
    return rows.filter((s) => {
      const matchD = dept === 'All' || s.dept === dept
      const needle = q.trim().toLowerCase()
      const matchQ =
        !needle ||
        s.name.toLowerCase().includes(needle) ||
        s.email.toLowerCase().includes(needle) ||
        s.role.toLowerCase().includes(needle) ||
        s.id.toLowerCase().includes(needle)
      return matchD && matchQ
    })
  }, [q, dept, rows])

  const statusBadge = (st) => {
    const map = {
      active: 'badge-green',
      leave: 'badge-amber',
      probation: 'badge-blue',
      pending: 'badge-red',
    }
    return map[st] || 'badge-blue'
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Organisation directory</h1>
          <p className="text-sm text-slate-400">Search people, roles, and units across the organisation.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
          <Search size={16} className="text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, role, or staff ID..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {depts.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDept(d)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                dept === d ? 'bg-[#006838] text-white border-[#006838]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#006838]/40'
              }`}
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={loadDirectory}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-full text-xs font-bold border bg-white text-slate-600 border-slate-200 hover:border-[#006838]/40 disabled:opacity-50"
          >
            {isLoading ? 'Syncing…' : 'Sync'}
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-4">{note}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div key={s.id} className="card flex gap-3">
            <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
              {s.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">{s.name}</p>
              <p className="text-xs text-slate-500 truncate">{s.role}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2 font-medium">
                <Building2 size={10} /> {s.dept}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                <Mail size={10} className="flex-shrink-0" />
                <span className="truncate">{s.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 font-mono">
                <Hash size={10} /> {s.id} · {s.grade}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Manager: {s.manager || 'Unassigned'}</div>
              <span className={`badge ${statusBadge(s.status)} text-[9px] mt-2`}>{s.status}</span>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-sm text-slate-400 text-center py-12">No matches.</p>}
    </div>
  )
}
