import { useNavigate } from 'react-router-dom'
import { NAPTIN_LOGO, ENGR_PHOTO } from '../assets/images'
import { ArrowRight, CheckCircle, Zap, Shield, Users, BookOpen, Globe } from 'lucide-react'

const FEATURES = [
  { icon: Users, title: 'Human Resource Management', desc: 'Full staff lifecycle — appointment, promotion, discipline, welfare, and general services.', color: 'bg-green-50 text-green-700' },
  { icon: Zap, title: 'Finance & Accounts', desc: 'Revenue, expenditure, budget management, payment processing and fiscal reporting.', color: 'bg-amber-50 text-amber-700' },
  { icon: BookOpen, title: 'Training Department', desc: 'Generation, transmission, distribution, renewable energy, and non-technical programmes.', color: 'bg-blue-50 text-blue-700' },
  { icon: Shield, title: 'Planning, Research & Statistics', desc: 'Strategic planning, research publications, M&E dashboards, and ICT infrastructure.', color: 'bg-purple-50 text-purple-700' },
  { icon: Globe, title: 'Corporate & Consultancy Services', desc: 'Consultancy, hospitality services, technical research, and enterprise risk management.', color: 'bg-rose-50 text-rose-700' },
  { icon: CheckCircle, title: 'Marketing & Business Development', desc: 'Brand management, client operations, new markets, and business growth strategy.', color: 'bg-teal-50 text-teal-700' },
]
const DEPTS = ['Human Resource Management', 'Finance & Accounts', 'Planning, Research & Statistics', 'Training', 'Corporate & Consultancy Services', 'Marketing & Business Development', 'Legal / Board Secretariat', 'Procurement', 'Internal Audit', 'ICT']
const STATS = [{ v:'15,000+', l:'Professionals Trained' }, { v:'8', l:'Regional Training Centres' }, { v:'ISO 9001:2015', l:'Certified' }, { v:'2009', l:'Established' }]

export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-white font-jakarta">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={NAPTIN_LOGO} alt="NAPTIN" className="w-10 h-10 object-contain" />
            <div>
              <div className="font-bold text-[#006838] text-base leading-tight">NAPTIN</div>
              <div className="text-[9px] text-slate-400 font-medium leading-tight uppercase tracking-wide">Staff Portal</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#features" className="hover:text-[#006838] transition-colors">Features</a>
            <a href="#departments" className="hover:text-[#006838] transition-colors">Departments</a>
            <a href="#about" className="hover:text-[#006838] transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-600 hover:text-[#006838] transition-colors">Sign In</button>
            <button onClick={() => navigate('/login')} className="flex items-center gap-1.5 bg-[#006838] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#004D28] transition-colors">
              Staff Portal <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-28 pb-0 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold mb-6 border border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Nigeria's Premier Power Sector Training Institute
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.1] mb-5 tracking-tight">
                One Platform for<br />
                <span className="text-[#006838]">All NAPTIN</span><br />
                Operations
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-lg">
                The unified enterprise management system connecting every department — from HR and Finance to Training and Procurement — across all 8 regional centres.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => navigate('/login')} className="flex items-center justify-center gap-2 bg-[#006838] text-white px-8 py-3.5 rounded-xl text-base font-bold hover:bg-[#004D28] transition-colors">
                  Access Staff Portal <ArrowRight size={16} />
                </button>
                <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-slate-50 transition-colors">
                  Watch Demo
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-100">
                {STATS.map((s,i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-extrabold text-[#006838]">{s.v}</div>
                    <div className="text-xs text-slate-400 mt-0.5 font-medium">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative animate-fade-up delay-200">
              <div className="absolute inset-0 bg-gradient-to-br from-[#006838]/10 to-transparent rounded-3xl" />
              <img src={ENGR_PHOTO} alt="NAPTIN Engineers" className="w-full h-80 object-cover rounded-3xl shadow-2xl border-4 border-white" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-3.5 flex items-center gap-3 shadow-lg">
                <img src={NAPTIN_LOGO} alt="" className="w-10 h-10 object-contain flex-shrink-0" />
                <div>
                  <div className="text-sm font-bold text-slate-900">NAPTIN-trained engineers</div>
                  <div className="text-xs text-slate-500">132kV substation, Abuja — Nigeria</div>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-green-600">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Everything NAPTIN Needs</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Integrated modules purpose-built for Nigeria's leading power sector training institute.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f,i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-4`}><f.icon size={18}/></div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPARTMENTS */}
      <section id="departments" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Built for Every Department</h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-8">Every unit gets a dedicated workspace with tools and workflows tailored to their function.</p>
            <div className="space-y-3">
              {DEPTS.map((d,i) => (
                <div key={i} className="flex items-center gap-3 text-slate-700 text-sm font-semibold">
                  <CheckCircle size={15} className="text-[#006838] flex-shrink-0" />{d}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-[#006838] rounded-2xl p-5 text-white"><div className="text-2xl font-extrabold">94%</div><div className="text-green-200 text-sm mt-1">Avg. Attendance</div></div>
              <div className="bg-amber-400 rounded-2xl p-5"><div className="text-2xl font-extrabold text-amber-900">₦3.1B</div><div className="text-amber-800 text-sm mt-1">Budget Managed</div></div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="bg-blue-600 rounded-2xl p-5 text-white"><div className="text-2xl font-extrabold">1,248</div><div className="text-blue-200 text-sm mt-1">Staff Records</div></div>
              <div className="bg-emerald-500 rounded-2xl p-5 text-white"><div className="text-2xl font-extrabold">Zero</div><div className="text-emerald-100 text-sm mt-1">Paper Processes</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#006838]">
        <div className="max-w-3xl mx-auto text-center">
          <img src={NAPTIN_LOGO} alt="NAPTIN" className="w-16 h-16 object-contain mx-auto mb-5 bg-white rounded-xl p-1.5" />
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Access Your Portal?</h2>
          <p className="text-green-200 text-lg mb-8">Sign in with your official NAPTIN staff credentials to get started.</p>
          <button onClick={() => navigate('/login')} className="inline-flex items-center gap-2 bg-[#FFD700] text-[#006838] font-bold px-10 py-4 rounded-xl text-base hover:bg-yellow-300 transition-colors">
            Access Your Portal <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={NAPTIN_LOGO} alt="NAPTIN" className="w-8 h-8 object-contain" />
            <span className="font-bold text-sm text-slate-700">NAPTIN Enterprise Portal</span>
          </div>
          <p className="text-slate-400 text-xs">© 2026 National Power Training Institute of Nigeria. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <a href="#" className="hover:text-slate-600">Privacy</a>
            <a href="#" className="hover:text-slate-600">Terms</a>
            <a href="#" className="hover:text-slate-600">ICT Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
