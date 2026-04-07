import { useEffect, useState } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import { STAFF } from '../data/mock'
import { Users, UserPlus, TrendingUp, Briefcase, Search, Filter, MoreHorizontal, Eye, X } from 'lucide-react'

const StatusBadge = ({ status }) => {
  const map = { active:'badge-green', leave:'badge-amber', probation:'badge-blue', pending:'badge-red' }
  const labels = { active:'Active', leave:'On Leave', probation:'Probation', pending:'Pending Doc' }
  return <span className={`badge ${map[status]||'badge-slate'}`}>{labels[status]||status}</span>
}
const DEPTS = ['All Departments','HR','Finance','ICT','Legal','Procurement','M&E','Training','Admin','Corporate Services']

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

function mapEmployeeToStaff(e, index) {
  return {
    recordId: e.id || null,
    id: e.employee_number || `EMP-${e.id}`,
    name: e.full_name || 'Unknown Employee',
    initials: toInitials(e.full_name),
    email: e.email || '—',
    dept: e.department || 'HR',
    role: e.job_title || 'Staff',
    grade: e.employment_status || 'active',
    status: toStatus(e.employment_status),
    joined: e.hire_date || '—',
    color: BADGE_COLORS[index % BADGE_COLORS.length],
  }
}

export default function HRPage() {
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All Departments')
  const [selected, setSelected] = useState(null)
  const [staffRows, setStaffRows] = useState(STAFF)
  const [isLoading, setIsLoading] = useState(false)
  const [syncNote, setSyncNote] = useState('')
  const [summary, setSummary] = useState(null)
  const [orgManagers, setOrgManagers] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newStaffName, setNewStaffName] = useState('')
  const [newStaffEmail, setNewStaffEmail] = useState('')
  const [newStaffDept, setNewStaffDept] = useState('HR')
  const [newStaffRole, setNewStaffRole] = useState('Staff')
  const [newStaffStatus, setNewStaffStatus] = useState('active')
  const [isCreatingStaff, setIsCreatingStaff] = useState(false)
  const [isUpdatingStaff, setIsUpdatingStaff] = useState(false)

  const defaultStats = {
    active_employees: 1189,
    leave_employees: 43,
    total_employees: 1248,
    open_jobs: 22,
  }

  const loadEmployees = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/hrms/employees', { credentials: 'include' })
      const text = await response.text()
      const data = text ? JSON.parse(text) : {}
      if (!response.ok) throw new Error(data?.error || `Request failed: ${response.status}`)

      const items = Array.isArray(data.items) ? data.items : []
      if (!items.length) {
        setStaffRows(STAFF)
        setSyncNote('No employee records yet. Showing demo data.')
      } else {
        setStaffRows(items.map(mapEmployeeToStaff))
        setSyncNote('Synced from HRMS employee records.')
      }
    } catch {
      setStaffRows(STAFF)
      setSyncNote('HRMS API unavailable. Showing demo staff list.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateEmployeeStatus = async (employee, nextStatus) => {
    if (!employee?.recordId) {
      setSyncNote('Status updates require HRMS-backed employee records.')
      return
    }

    setIsUpdatingStaff(true)
    try {
      const response = await fetch(`/api/hrms/employees/${employee.recordId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employment_status: nextStatus }),
      })
      const text = await response.text()
      const data = text ? JSON.parse(text) : {}
      if (!response.ok) throw new Error(data?.error || `Request failed: ${response.status}`)

      setSelected((prev) => (prev ? { ...prev, status: toStatus(nextStatus), grade: nextStatus } : prev))
      setSyncNote('Employee status updated successfully.')
      await Promise.all([loadEmployees(), loadHrSummary()])
    } catch (err) {
      setSyncNote(err.message || 'Failed to update employee status.')
    } finally {
      setIsUpdatingStaff(false)
    }
  }

  const loadHrSummary = async () => {
    try {
      const [summaryRes, orgRes] = await Promise.all([
        fetch('/api/hrms/summary', { credentials: 'include' }),
        fetch('/api/hrms/org-chart', { credentials: 'include' }),
      ])

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json()
        setSummary(summaryData.summary || null)
      } else {
        setSummary(null)
      }

      if (orgRes.ok) {
        const orgData = await orgRes.json()
        setOrgManagers((orgData.managers || []).filter((m) => m.manager_name !== 'Unassigned').length)
      } else {
        setOrgManagers(0)
      }
    } catch {
      setSummary(null)
      setOrgManagers(0)
    }
  }

  const createEmployee = async (e) => {
    e.preventDefault()
    if (!newStaffName.trim()) return

    setIsCreatingStaff(true)
    try {
      const employeeNumber = `EMP-${Date.now()}`
      const response = await fetch('/api/hrms/employees', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_number: employeeNumber,
          full_name: newStaffName.trim(),
          email: newStaffEmail.trim() || undefined,
          department: newStaffDept,
          job_title: newStaffRole,
          employment_status: newStaffStatus,
        }),
      })

      const text = await response.text()
      const data = text ? JSON.parse(text) : {}
      if (!response.ok) throw new Error(data?.error || `Request failed: ${response.status}`)

      setNewStaffName('')
      setNewStaffEmail('')
      setNewStaffDept('HR')
      setNewStaffRole('Staff')
      setNewStaffStatus('active')
      setShowAddForm(false)
      setSyncNote('Employee record created successfully.')
      await Promise.all([loadEmployees(), loadHrSummary()])
    } catch (err) {
      setSyncNote(err.message || 'Failed to create employee record.')
    } finally {
      setIsCreatingStaff(false)
    }
  }

  useEffect(() => {
    loadEmployees()
    loadHrSummary()
  }, [])

  const stats = summary || defaultStats

  const filtered = staffRows.filter(s => {
    const matchDept = dept === 'All Departments' || s.dept === dept
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.dept.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
    return matchDept && matchSearch
  })
  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Human Resource Management</h1>
            <p className="text-sm text-slate-400">1,248 staff · 9 departments · Onboarding & performance live under HR operations</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm((v) => !v)}>
          <UserPlus size={15}/>
          {showAddForm ? 'Close' : 'Add Staff'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={createEmployee} className="card mb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
          <input
            className="input xl:col-span-2"
            placeholder="Full name"
            value={newStaffName}
            onChange={(e) => setNewStaffName(e.target.value)}
          />
          <input
            className="input xl:col-span-2"
            placeholder="Email"
            value={newStaffEmail}
            onChange={(e) => setNewStaffEmail(e.target.value)}
          />
          <select className="select" value={newStaffDept} onChange={(e) => setNewStaffDept(e.target.value)}>
            {DEPTS.filter((d) => d !== 'All Departments').map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Role"
            value={newStaffRole}
            onChange={(e) => setNewStaffRole(e.target.value)}
          />
          <select className="select" value={newStaffStatus} onChange={(e) => setNewStaffStatus(e.target.value)}>
            <option value="active">active</option>
            <option value="leave">leave</option>
            <option value="probation">probation</option>
          </select>
          <button type="submit" className="btn-primary md:col-span-2 xl:col-span-1" disabled={isCreatingStaff}>
            {isCreatingStaff ? 'Creating...' : 'Save Staff'}
          </button>
        </form>
      )}
      <div className="mb-4 flex items-center gap-3">
        <button className="btn-secondary text-xs py-1.5" onClick={loadEmployees} disabled={isLoading}>
          {isLoading ? 'Syncing...' : 'Sync employee records'}
        </button>
        <span className="text-xs text-slate-400">{syncNote}</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          {label:'Active Staff',value:String(stats.active_employees ?? 0),icon:Users,bg:'bg-green-50',color:'text-[#006838]'},
          {label:'On Leave',value:String(stats.leave_employees ?? 0),icon:Briefcase,bg:'bg-amber-50',color:'text-amber-600'},
          {label:'Managers',value:String(orgManagers || 0),icon:UserPlus,bg:'bg-blue-50',color:'text-blue-600'},
          {label:'Open Positions',value:String(stats.open_jobs ?? 0),icon:TrendingUp,bg:'bg-purple-50',color:'text-purple-600'},
        ].map((k,i)=>(
          <div key={i} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${k.bg} ${k.color} flex items-center justify-center flex-shrink-0`}><k.icon size={18}/></div>
            <div><div className="text-xl font-extrabold text-slate-900">{k.value}</div><div className="text-xs text-slate-400 font-medium">{k.label}</div></div>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 flex-1 max-w-sm">
          <Search size={14} className="text-slate-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search staff..." className="bg-transparent text-sm outline-none flex-1 text-slate-700 placeholder:text-slate-400"/>
        </div>
        <button className="btn-secondary text-sm"><Filter size={13}/>Filter</button>
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        {DEPTS.map(d=>(
          <button key={d} onClick={()=>setDept(d)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${dept===d?'bg-[#006838] text-white':'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{d}</button>
        ))}
      </div>
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-slate-100">
            <th className="table-th">Staff</th>
            <th className="table-th hidden md:table-cell">Department</th>
            <th className="table-th hidden lg:table-cell">Role</th>
            <th className="table-th hidden lg:table-cell">Grade</th>
            <th className="table-th">Status</th>
            <th className="table-th">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map((s,i)=>(
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="table-td">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${s.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{s.initials}</div>
                    <div><p className="text-sm font-semibold text-slate-800">{s.name}</p><p className="text-xs text-slate-400">{s.email}</p></div>
                  </div>
                </td>
                <td className="table-td hidden md:table-cell text-slate-600">{s.dept}</td>
                <td className="table-td hidden lg:table-cell text-slate-600 text-xs">{s.role}</td>
                <td className="table-td hidden lg:table-cell"><span className="text-xs font-mono font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">{s.grade}</span></td>
                <td className="table-td"><StatusBadge status={s.status}/></td>
                <td className="table-td">
                  <div className="flex items-center gap-2">
                    <button onClick={()=>setSelected(s)} className="flex items-center gap-1 text-xs text-[#006838] font-semibold hover:underline"><Eye size={12}/>View</button>
                    <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={15}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">Showing {filtered.length} of {staffRows.length} staff</span>
          <div className="flex items-center gap-1.5">
            {['Previous','1','2','Next'].map((l,i)=>(
              <button key={i} className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${l==='1'?'bg-[#006838] text-white border-[#006838]':'text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={()=>setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-up" onClick={e=>e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full ${selected.color} flex items-center justify-center text-white text-lg font-bold`}>{selected.initials}</div>
                <div><h3 className="text-base font-extrabold text-slate-900">{selected.name}</h3><p className="text-sm text-slate-500">{selected.role}</p></div>
              </div>
              <button onClick={()=>setSelected(null)} className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"><X size={16}/></button>
            </div>
            <div className="space-y-3 border-t border-slate-100 pt-4">
              {[['Staff ID',selected.id],['Email',selected.email],['Department',selected.dept],['Grade Level',selected.grade],['Date Joined',selected.joined]].map(([l,v],i)=>(
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">{l}</span>
                  <span className="text-sm font-semibold text-slate-700 font-mono text-xs">{v}</span>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Status</span>
                <StatusBadge status={selected.status}/>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <select
                className="flex-1 select text-sm"
                value={selected.status}
                disabled={isUpdatingStaff}
                onChange={(e) => updateEmployeeStatus(selected, e.target.value)}
              >
                <option value="active">active</option>
                <option value="leave">leave</option>
                <option value="probation">probation</option>
              </select>
              <button className="flex-1 btn-secondary justify-center text-sm py-2.5">Send Message</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
