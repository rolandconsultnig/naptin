import { Link, useSearchParams } from 'react-router-dom'
import { NAPTIN_LOGO } from '../assets/images'
import {
  STAFF,
  JOB_OPENINGS,
  PAYROLL_RUNS,
  ATTENDANCE_DAILY,
  PERFORMANCE_GOALS,
  PERFORMANCE_REVIEWS,
} from '../data/mock'
import {
  HRMS_DASHBOARD,
  HRMS_ACTIVITIES,
  HRMS_DEPARTMENTS,
  HRMS_CANDIDATES,
  HRMS_INTERVIEWS,
  HRMS_CLOCK_LOG,
  HRMS_LEAVE_ADMIN,
  HRMS_BENEFITS,
  HRMS_LEARNING_PROGRAMS,
  HRMS_ANALYTICS_REPORTS,
  HRMS_WORKFORCE_PLANS,
  HRMS_EXPERIENCE,
  HRMS_COMPLIANCE,
  HRMS_MOBILE_CAPS,
  HRMS_INTEGRATIONS,
  HRMS_WORKFLOWS,
} from '../data/hrmsEnterprise'
import {
  LayoutDashboard,
  Users,
  Building2,
  UserPlus,
  Clock,
  CalendarDays,
  Banknote,
  TrendingUp,
  GraduationCap,
  Heart,
  BarChart3,
  Smile,
  Shield,
  Smartphone,
  Plug,
} from 'lucide-react'

const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'departments', label: 'Departments', icon: Building2 },
  { id: 'recruitment', label: 'Recruitment', icon: UserPlus },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'leave', label: 'Leave', icon: CalendarDays },
  { id: 'payroll', label: 'Payroll', icon: Banknote },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'learning', label: 'Learning', icon: GraduationCap },
  { id: 'benefits', label: 'Benefits', icon: Heart },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'experience', label: 'Employee experience', icon: Smile },
  { id: 'compliance', label: 'Compliance & risk', icon: Shield },
  { id: 'mobile', label: 'Mobile & self-service', icon: Smartphone },
  { id: 'integration', label: 'Integration hub', icon: Plug },
]

function StatCard({ title, value, accent }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</p>
      <p className={`text-3xl font-extrabold mt-1 ${accent}`}>{value}</p>
    </div>
  )
}

export default function EnterpriseHRMSPage() {
  const [search, setSearch] = useSearchParams()
  const raw = search.get('section')
  const active = SECTIONS.some((s) => s.id === raw) ? raw : 'dashboard'

  function goTo(id) {
    setSearch({ section: id }, { replace: true })
  }

  return (
    <div className="animate-fade-up flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      <aside className="w-full lg:w-56 flex-shrink-0">
        <div className="lg:sticky lg:top-4 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/80">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enterprise HRMS</p>
            <p className="text-xs text-slate-500 mt-0.5">12 capability areas (reference suite)</p>
          </div>
          <nav className="p-2 max-h-[60vh] lg:max-h-[calc(100vh-12rem)] overflow-y-auto">
            {SECTIONS.map((s) => {
              const Icon = s.icon
              const on = active === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition-all mb-0.5 ${
                    on ? 'bg-[#006838] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={17} className={on ? 'opacity-95' : 'opacity-70'} />
                  <span className="truncate">{s.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-3 mb-6">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-slate-900">Enterprise HRMS</h1>
            <p className="text-sm text-slate-400">
              Mirrors the standalone <code className="text-xs bg-slate-100 px-1 rounded">Enterprise HRMS</code> module map.
              Data is prototype mock; set <code className="text-xs bg-slate-100 px-1 rounded">VITE_HRMS_API</code> to point at that
              Node API when you run it (port 5050 by default).
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Link to="/app/human-resource/people" className="text-xs font-semibold text-[#006838] hover:underline">
                People
              </Link>
              <span className="text-slate-300">·</span>
              <Link to="/app/human-resource/operations" className="text-xs font-semibold text-[#006838] hover:underline">
                HR operations
              </Link>
              <span className="text-slate-300">·</span>
              <Link to="/app/human-resource/self-service" className="text-xs font-semibold text-[#006838] hover:underline">
                Self-service
              </Link>
            </div>
          </div>
        </div>

        {active === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard title="Total employees" value={HRMS_DASHBOARD.totalEmployees} accent="text-blue-600" />
              <StatCard title="Active" value={HRMS_DASHBOARD.activeEmployees} accent="text-emerald-600" />
              <StatCard title="On leave" value={HRMS_DASHBOARD.onLeave} accent="text-amber-600" />
              <StatCard title="New hires (90d)" value={HRMS_DASHBOARD.newHires} accent="text-purple-600" />
            </div>
            <div className="card p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Recent activities</h2>
              <ul className="space-y-3">
                {HRMS_ACTIVITIES.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                    <span className="text-[10px] font-mono text-slate-400 w-16 flex-shrink-0">{a.time}</span>
                    <span className="text-slate-700">{a.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-3">HR workflows (open)</h2>
              <div className="grid md:grid-cols-3 gap-3">
                {HRMS_WORKFLOWS.map((w) => (
                  <div key={w.name} className="rounded-xl border border-slate-100 p-4 bg-slate-50/50">
                    <p className="text-sm font-bold text-slate-800">{w.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{w.steps}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      Avg {w.avgDays}d · <span className="font-semibold text-slate-600">{w.open} open</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {active === 'employees' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                Directory sample: <strong>{STAFF.length}</strong> records in prototype; enterprise total{' '}
                <strong>{HRMS_DASHBOARD.totalEmployees}</strong> in dashboard KPIs.
              </p>
              <Link to="/app/human-resource/people" className="btn-primary text-xs py-2 px-4">
                Open People
              </Link>
            </div>
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-th text-left">ID</th>
                    <th className="table-th text-left">Name</th>
                    <th className="table-th text-left">Dept</th>
                    <th className="table-th text-left">Role</th>
                    <th className="table-th text-left">Grade</th>
                    <th className="table-th text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {STAFF.map((s) => (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/80">
                      <td className="table-td font-mono text-xs">{s.id}</td>
                      <td className="table-td font-semibold text-slate-800">{s.name}</td>
                      <td className="table-td">{s.dept}</td>
                      <td className="table-td">{s.role}</td>
                      <td className="table-td">{s.grade}</td>
                      <td className="table-td">
                        <span className="badge badge-blue text-[10px]">{s.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {active === 'departments' && (
          <div className="card overflow-x-auto">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Departments & cost centres</h2>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-th text-left">Code</th>
                  <th className="table-th text-left">Name</th>
                  <th className="table-th text-left">Location</th>
                  <th className="table-th text-left">Headcount</th>
                  <th className="table-th text-left">Budget (FY)</th>
                </tr>
              </thead>
              <tbody>
                {HRMS_DEPARTMENTS.map((d) => (
                  <tr key={d.code} className="border-b border-slate-50 hover:bg-slate-50/80">
                    <td className="table-td font-mono text-xs">{d.code}</td>
                    <td className="table-td font-semibold text-slate-800">{d.name}</td>
                    <td className="table-td">{d.location}</td>
                    <td className="table-td">{d.headcount}</td>
                    <td className="table-td">{d.budget}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {active === 'recruitment' && (
          <div className="space-y-6">
            <div className="card overflow-x-auto">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Open vacancies</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-th text-left">Ref</th>
                    <th className="table-th text-left">Role</th>
                    <th className="table-th text-left">Dept</th>
                    <th className="table-th text-left">Stage</th>
                    <th className="table-th text-left">Applicants</th>
                  </tr>
                </thead>
                <tbody>
                  {JOB_OPENINGS.map((j, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/80">
                      <td className="table-td font-mono text-xs">{j.ref}</td>
                      <td className="table-td font-semibold">{j.title}</td>
                      <td className="table-td">{j.dept}</td>
                      <td className="table-td">
                        <span className="badge badge-blue text-[10px]">{j.stage}</span>
                      </td>
                      <td className="table-td">{j.applicants}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card overflow-x-auto">
                <h2 className="text-sm font-bold text-slate-800 mb-4">Candidate pipeline</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="table-th text-left">ID</th>
                      <th className="table-th text-left">Name</th>
                      <th className="table-th text-left">Role</th>
                      <th className="table-th text-left">Stage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HRMS_CANDIDATES.map((c) => (
                      <tr key={c.id} className="border-b border-slate-50">
                        <td className="table-td font-mono text-xs">{c.id}</td>
                        <td className="table-td font-semibold">{c.name}</td>
                        <td className="table-td">{c.role}</td>
                        <td className="table-td">{c.stage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card overflow-x-auto">
                <h2 className="text-sm font-bold text-slate-800 mb-4">Interviews</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="table-th text-left">ID</th>
                      <th className="table-th text-left">Candidate</th>
                      <th className="table-th text-left">When</th>
                      <th className="table-th text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HRMS_INTERVIEWS.map((n) => (
                      <tr key={n.id} className="border-b border-slate-50">
                        <td className="table-td font-mono text-xs">{n.id}</td>
                        <td className="table-td">{n.candidate}</td>
                        <td className="table-td text-xs text-slate-500">{n.when}</td>
                        <td className="table-td">{n.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {active === 'attendance' && (
          <div className="space-y-6">
            <div className="card overflow-x-auto">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Today — clock log</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-th text-left">Staff</th>
                    <th className="table-th text-left">Site</th>
                    <th className="table-th text-left">In</th>
                    <th className="table-th text-left">Out</th>
                    <th className="table-th text-left">Hours</th>
                    <th className="table-th text-left">Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {HRMS_CLOCK_LOG.map((r, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="table-td font-medium">{r.staff}</td>
                      <td className="table-td">{r.site}</td>
                      <td className="table-td font-mono text-xs">{r.in}</td>
                      <td className="table-td font-mono text-xs">{r.out}</td>
                      <td className="table-td">{r.hours}</td>
                      <td className="table-td text-xs">{r.flag}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card overflow-x-auto">
              <h2 className="text-sm font-bold text-slate-800 mb-4">RTC / site summary (prototype)</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-th text-left">Site</th>
                    <th className="table-th text-left">Present</th>
                    <th className="table-th text-left">Expected</th>
                    <th className="table-th text-left">%</th>
                  </tr>
                </thead>
                <tbody>
                  {ATTENDANCE_DAILY.map((a, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="table-td font-semibold">{a.site}</td>
                      <td className="table-td">{a.present}</td>
                      <td className="table-td">{a.expected}</td>
                      <td className="table-td">{a.rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {active === 'leave' && (
          <div className="card overflow-x-auto">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Leave administration queue</h2>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-th text-left">Ref</th>
                  <th className="table-th text-left">Staff</th>
                  <th className="table-th text-left">Type</th>
                  <th className="table-th text-left">Dates</th>
                  <th className="table-th text-left">Status</th>
                  <th className="table-th text-left">Approver</th>
                </tr>
              </thead>
              <tbody>
                {HRMS_LEAVE_ADMIN.map((l) => (
                  <tr key={l.ref} className="border-b border-slate-50 hover:bg-slate-50/80">
                    <td className="table-td font-mono text-xs">{l.ref}</td>
                    <td className="table-td font-medium">{l.staff}</td>
                    <td className="table-td">{l.type}</td>
                    <td className="table-td text-xs">{l.dates}</td>
                    <td className="table-td">
                      <span className="badge badge-blue text-[10px]">{l.status}</span>
                    </td>
                    <td className="table-td text-xs">{l.approver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-slate-400 mt-4">
              Staff self-service leave history lives under{' '}
              <Link to="/app/human-resource/self-service" className="text-[#006838] font-semibold">Self-service</Link>.
            </p>
          </div>
        )}

        {active === 'payroll' && (
          <div className="card overflow-x-auto">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Payroll runs</h2>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-th text-left">Period</th>
                  <th className="table-th text-left">Staff paid</th>
                  <th className="table-th text-left">Net</th>
                  <th className="table-th text-left">Variance</th>
                  <th className="table-th text-left">Status</th>
                  <th className="table-th text-left">Pay date</th>
                </tr>
              </thead>
              <tbody>
                {PAYROLL_RUNS.map((p, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/80">
                    <td className="table-td font-semibold">{p.period}</td>
                    <td className="table-td">{p.staffPaid}</td>
                    <td className="table-td">{p.net}</td>
                    <td className="table-td text-xs">{p.variance}</td>
                    <td className="table-td">
                      <span className="badge badge-blue text-[10px]">{p.status}</span>
                    </td>
                    <td className="table-td text-xs text-slate-500">{p.payDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-slate-400 mt-4">
              Payslips:{' '}
              <Link to="/app/human-resource/self-service?tab=payslips" className="text-[#006838] font-semibold">
                Self-service → Payslips
              </Link>
              .
            </p>
          </div>
        )}

        {active === 'performance' && (
          <div className="space-y-6">
            <div className="card overflow-x-auto">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Goals</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-th text-left">Staff</th>
                    <th className="table-th text-left">Cycle</th>
                    <th className="table-th text-left">Goal</th>
                    <th className="table-th text-left">Due</th>
                    <th className="table-th text-left">Progress</th>
                    <th className="table-th text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {PERFORMANCE_GOALS.map((g, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="table-td">{g.staff}</td>
                      <td className="table-td text-xs">{g.cycle}</td>
                      <td className="table-td font-medium">{g.goal}</td>
                      <td className="table-td text-xs">{g.due}</td>
                      <td className="table-td">{g.progress}%</td>
                      <td className="table-td">
                        <span className="badge badge-blue text-[10px]">{g.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card overflow-x-auto">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Reviews</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-th text-left">Staff</th>
                    <th className="table-th text-left">Reviewer</th>
                    <th className="table-th text-left">Type</th>
                    <th className="table-th text-left">Due</th>
                    <th className="table-th text-left">Status</th>
                    <th className="table-th text-left">Last rating</th>
                  </tr>
                </thead>
                <tbody>
                  {PERFORMANCE_REVIEWS.map((r, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="table-td">{r.staff}</td>
                      <td className="table-td text-xs">{r.reviewer}</td>
                      <td className="table-td">{r.type}</td>
                      <td className="table-td text-xs">{r.due}</td>
                      <td className="table-td">
                        <span className="badge badge-blue text-[10px]">{r.status}</span>
                      </td>
                      <td className="table-td text-xs">{r.lastRating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {active === 'learning' && (
          <div className="space-y-6">
            <div className="card overflow-x-auto">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Learning catalogue (mandatory & optional)</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-th text-left">Code</th>
                    <th className="table-th text-left">Programme</th>
                    <th className="table-th text-left">Mandatory</th>
                    <th className="table-th text-left">Completions</th>
                    <th className="table-th text-left">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {HRMS_LEARNING_PROGRAMS.map((p) => (
                    <tr key={p.code} className="border-b border-slate-50">
                      <td className="table-td font-mono text-xs">{p.code}</td>
                      <td className="table-td font-medium">{p.title}</td>
                      <td className="table-td">{p.mandatory ? 'Yes' : 'No'}</td>
                      <td className="table-td">{p.completions}</td>
                      <td className="table-td text-xs">{p.due}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link to="/app/training" className="text-sm font-semibold text-[#006838] hover:underline inline-block">
              Open Training department module →
            </Link>
          </div>
        )}

        {active === 'benefits' && (
          <div className="card overflow-x-auto">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Benefits administration</h2>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-th text-left">Plan</th>
                  <th className="table-th text-left">Type</th>
                  <th className="table-th text-left">Provider</th>
                  <th className="table-th text-left">Employer</th>
                  <th className="table-th text-left">Employee</th>
                  <th className="table-th text-left">Enrollees</th>
                </tr>
              </thead>
              <tbody>
                {HRMS_BENEFITS.map((b) => (
                  <tr key={b.name} className="border-b border-slate-50 hover:bg-slate-50/80">
                    <td className="table-td font-semibold">{b.name}</td>
                    <td className="table-td">{b.type}</td>
                    <td className="table-td text-xs">{b.provider}</td>
                    <td className="table-td">{b.employer}</td>
                    <td className="table-td">{b.employee}</td>
                    <td className="table-td">{b.enrollees}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {active === 'analytics' && (
          <div className="space-y-6">
            <div className="card overflow-x-auto">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Analytics & reports</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-th text-left">Report</th>
                    <th className="table-th text-left">Owner</th>
                    <th className="table-th text-left">Last run</th>
                    <th className="table-th text-left">Schedule</th>
                    <th className="table-th text-left">Format</th>
                  </tr>
                </thead>
                <tbody>
                  {HRMS_ANALYTICS_REPORTS.map((r) => (
                    <tr key={r.name} className="border-b border-slate-50">
                      <td className="table-td font-medium">{r.name}</td>
                      <td className="table-td text-xs">{r.owner}</td>
                      <td className="table-td text-xs">{r.lastRun}</td>
                      <td className="table-td">{r.schedule}</td>
                      <td className="table-td text-xs">{r.format}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Workforce plans</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {HRMS_WORKFORCE_PLANS.map((w) => (
                  <div key={w.scenario} className="rounded-xl border border-slate-100 p-4">
                    <p className="text-sm font-bold text-slate-800">{w.scenario}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      FY {w.fy} · {w.delta} · Risk: {w.risk}
                    </p>
                    <span className="badge badge-blue text-[10px] mt-2 inline-block">{w.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {active === 'experience' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="eNPS (rolling)" value={HRMS_EXPERIENCE.eNps} accent="text-emerald-600" />
            <StatCard title="Recognition (month)" value={HRMS_EXPERIENCE.recognitionThisMonth} accent="text-blue-600" />
            <div className="card p-5 sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Pulse survey</p>
              <p className="text-sm font-semibold text-slate-800 mt-2">{HRMS_EXPERIENCE.openPulse}</p>
              <p className="text-xs text-slate-500 mt-3">
                HR chatbot / assistant queries this month: <strong>{HRMS_EXPERIENCE.chatbotQueries}</strong>
              </p>
            </div>
          </div>
        )}

        {active === 'compliance' && (
          <div className="card overflow-x-auto">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Compliance & risk register</h2>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-th text-left">ID</th>
                  <th className="table-th text-left">Title</th>
                  <th className="table-th text-left">Owner</th>
                  <th className="table-th text-left">Due</th>
                  <th className="table-th text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {HRMS_COMPLIANCE.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/80">
                    <td className="table-td font-mono text-xs">{c.id}</td>
                    <td className="table-td font-medium">{c.title}</td>
                    <td className="table-td text-xs">{c.owner}</td>
                    <td className="table-td text-xs">{c.due}</td>
                    <td className="table-td">
                      <span className="badge badge-blue text-[10px]">{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {active === 'mobile' && (
          <div className="card overflow-x-auto">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Mobile & self-service capabilities</h2>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-th text-left">Capability</th>
                  <th className="table-th text-left">Status</th>
                  <th className="table-th text-left">Platform</th>
                </tr>
              </thead>
              <tbody>
                {HRMS_MOBILE_CAPS.map((m) => (
                  <tr key={m.feature} className="border-b border-slate-50">
                    <td className="table-td font-medium">{m.feature}</td>
                    <td className="table-td">{m.status}</td>
                    <td className="table-td text-xs">{m.platform}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {active === 'integration' && (
          <div className="space-y-6">
            <div className="card overflow-x-auto">
              <h2 className="text-sm font-bold text-slate-800 mb-4">HR integration hub</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-th text-left">Connector</th>
                    <th className="table-th text-left">Flow</th>
                    <th className="table-th text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {HRMS_INTEGRATIONS.map((x) => (
                    <tr key={x.name} className="border-b border-slate-50">
                      <td className="table-td font-semibold">{x.name}</td>
                      <td className="table-td text-xs text-slate-600">{x.direction}</td>
                      <td className="table-td">
                        <span className="badge badge-blue text-[10px]">{x.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link to="/app/integrations" className="text-sm font-semibold text-[#006838] hover:underline inline-block">
              Platform-wide integrations →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
