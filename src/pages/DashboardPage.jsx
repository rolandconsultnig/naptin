import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { canAccessNavPath } from '../auth/access'
import { NAPTIN_LOGO } from '../assets/images'
import { SPEND_DATA, ATTEND_DATA, DEPT_HEADCOUNT } from '../data/mock'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { Users, TrendingUp, ClipboardList, Wallet, ArrowUpRight, Calendar, Zap, Bell, FileText } from 'lucide-react'

const KPIS = [
  { label:'Total Staff', value:'1,248', sub:'+14 this month', icon:Users, color:'text-[#006838]', bg:'bg-green-50', trend:'up' },
  { label:'Attendance Today', value:'94.2%', sub:'Above 90% target', icon:TrendingUp, color:'text-emerald-600', bg:'bg-emerald-50', trend:'up' },
  { label:'Pending Approvals', value:'37', sub:'+8 since yesterday', icon:ClipboardList, color:'text-amber-600', bg:'bg-amber-50', trend:'down' },
  { label:'Budget Utilised', value:'68%', sub:'₦2.1B of ₦3.1B', icon:Wallet, color:'text-blue-600', bg:'bg-blue-50', trend:'up' },
]

const ACTIVITIES = [
  { text:'Grace Okafor submitted annual leave request (5 days)', time:'2 mins ago', dept:'HR', dot:'bg-[#006838]' },
  { text:'Finance Q1 Report uploaded — pending director review', time:'18 mins ago', dept:'Finance', dot:'bg-amber-500' },
  { text:'Board Meeting confirmed for Monday — 14 attendees', time:'1 hr ago', dept:'Corporate Services', dot:'bg-emerald-500' },
  { text:'ICT: Server maintenance window tonight 11 PM – 2 AM', time:'2 hrs ago', dept:'ICT', dot:'bg-red-400' },
  { text:'Emmanuel Bello completed Compliance Training Module 3', time:'3 hrs ago', dept:'Training', dot:'bg-blue-500' },
  { text:'New vendor registration portal is now live', time:'4 hrs ago', dept:'Procurement', dot:'bg-purple-500' },
]

const QUICK_ACTIONS = [
  { label:'Apply Leave', icon:'🏖️', to:'/app/human-resource/self-service' },
  { label:'Join Meeting', icon:'📹', to:'/app/meetings' },
  { label:'Send Message', icon:'💬', to:'/app/chat' },
  { label:'Post Update', icon:'📢', to:'/app/intranet' },
  { label:'View Payslip', icon:'💳', to:'/app/human-resource/self-service?tab=payslips' },
  { label:'Collaboration', icon:'🤝', to:'/app/collaboration' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const quickActions = useMemo(
    () => QUICK_ACTIONS.filter((q) => canAccessNavPath(q.to.split('?')[0], user)),
    [user]
  )
  const today = new Date().toLocaleDateString('en-NG', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Welcome banner */}
      <div className="relative bg-[#006838] rounded-2xl px-6 py-5 overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
        <div className="absolute right-6 top-4 w-32 h-32 rounded-full bg-[#FFD700]/10 blur-2xl pointer-events-none" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-green-200 text-sm mb-1">Good morning 👋</p>
            <h1 className="text-2xl font-extrabold text-white mb-1 tracking-tight">{user?.name}</h1>
            <p className="text-green-200 text-sm">{user?.role} · {user?.department} · <span className="font-mono text-xs text-green-300">{user?.staffId}</span></p>
            <div className="flex items-center gap-1.5 mt-3 text-[#FFD700] text-xs font-semibold">
              <Calendar size={12} />{today}
            </div>
          </div>
          <img src={NAPTIN_LOGO} alt="NAPTIN" className="w-14 h-14 object-contain bg-white rounded-xl p-1.5 opacity-90 hidden sm:block" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((k,i) => (
          <div key={i} className="stat-card animate-fade-up" style={{animationDelay:`${i*0.08}s`}}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${k.bg} ${k.color} flex items-center justify-center`}><k.icon size={16}/></div>
              <ArrowUpRight size={14} className={k.trend==='up'?'text-emerald-500':'text-red-400'} />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mb-0.5 tracking-tight">{k.value}</div>
            <div className="text-xs text-slate-400 font-medium">{k.label}</div>
            <div className={`text-xs mt-1 font-semibold ${k.trend==='up'?'text-emerald-600':'text-red-500'}`}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-800">Monthly Expenditure</p>
              <p className="text-xs text-slate-400">₦ Millions · FY 2026</p>
            </div>
            <span className="badge badge-green text-xs">On Track</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={SPEND_DATA} barSize={28}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:11,fill:'#94a3b8'}} />
              <YAxis hide />
              <Tooltip formatter={v=>[`₦${v}M`,'Spend']} contentStyle={{fontSize:12,borderRadius:12,border:'1px solid #e2e8f0',boxShadow:'0 4px 24px rgba(0,0,0,0.08)'}} />
              <Bar dataKey="amount" fill="#006838" radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-800">Weekly Attendance Rate</p>
              <p className="text-xs text-slate-400">This week · %</p>
            </div>
            <span className="badge badge-green text-xs">94.2% avg</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={ATTEND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize:11,fill:'#94a3b8'}} />
              <YAxis domain={[50,100]} hide />
              <Tooltip formatter={v=>[`${v}%`,'Attendance']} contentStyle={{fontSize:12,borderRadius:12,border:'1px solid #e2e8f0'}} />
              <Line type="monotone" dataKey="rate" stroke="#006838" strokeWidth={2.5} dot={{fill:'#006838',r:3}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Activity */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-[#006838]" />
              <p className="text-sm font-bold text-slate-800">Recent Activity</p>
            </div>
            <button className="text-xs text-[#006838] font-semibold hover:underline">View all →</button>
          </div>
          <div className="space-y-0">
            {ACTIVITIES.map((a,i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
                <span className={`w-2 h-2 rounded-full ${a.dot} mt-1.5 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 leading-snug">{a.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-400">{a.time}</span>
                    <span className="text-[10px] text-slate-300">·</span>
                    <span className="text-[10px] text-slate-400 font-medium">{a.dept}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={14} className="text-[#FFD700]" />
              <p className="text-sm font-bold text-slate-800">Quick Actions</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map((q,i) => (
                <button key={i} onClick={() => navigate(q.to)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-slate-50 hover:bg-green-50 hover:text-[#006838] transition-colors cursor-pointer group">
                  <span className="text-xl">{q.icon}</span>
                  <span className="text-[10px] font-semibold text-slate-500 group-hover:text-[#006838] leading-tight text-center">{q.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={14} className="text-[#006838]" />
              <p className="text-sm font-bold text-slate-800">Dept. Headcount</p>
            </div>
            <div className="space-y-2.5">
              {DEPT_HEADCOUNT.slice(0,6).map((d,i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-24 truncate font-medium">{d.dept}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                    <div className={`${d.color} h-1.5 rounded-full transition-all`} style={{width:`${d.pct}%`}} />
                  </div>
                  <span className="text-xs text-slate-400 w-8 text-right font-mono">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
