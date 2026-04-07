import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { NAPTIN_LOGO } from '../assets/images'
import { Heart, MessageCircle, Share2, Image, Paperclip, Megaphone, Send, Hash, TrendingUp } from 'lucide-react'

const POSTS = [
  { id:1, author:'Director General Office', initials:'DG', dept:'Corporate Services', time:'2 hours ago', type:'Announcement', typeBg:'bg-[#006838]/10', typeColor:'text-[#006838]', avatarBg:'bg-[#006838]', content:"We are pleased to announce that NAPTIN's Q1 training targets have been exceeded by 12% across all key performance indicators. A full report will be circulated by Monday. Thank you all for your dedication! 🎉", likes:84, comments:23 },
  { id:2, author:'Training Unit', initials:'TU', dept:'Training Department', time:'5 hours ago', type:'Training', typeBg:'bg-blue-50', typeColor:'text-blue-700', avatarBg:'bg-blue-600', content:"Reminder: The Cybersecurity Awareness Training is mandatory for all ICT and Admin staff. Sessions run every Tuesday 2–4 PM in Conference Room B. 35 seats available for next week. Register via the Training module.", likes:41, comments:8, image:true },
  { id:3, author:'Procurement Department', initials:'PC', dept:'Procurement', time:'Yesterday', type:'Update', typeBg:'bg-amber-50', typeColor:'text-amber-700', avatarBg:'bg-amber-500', content:"New vendor registration portal is now LIVE! All departments requiring supplier onboarding should use the new digital form accessible from the Procurement module. Paper submissions will no longer be accepted from 1 April 2026. 🚀", likes:29, comments:15 },
  { id:4, author:'ICT Department', initials:'ICT', dept:'ICT', time:'Yesterday', type:'Alert', typeBg:'bg-red-50', typeColor:'text-red-600', avatarBg:'bg-red-500', content:"Planned server maintenance tonight between 11 PM and 2 AM. Please save all work and log out before 10:45 PM. Email, File Server and Payroll System will be unavailable during this window.", likes:12, comments:4 },
]
const TRENDING = ['#Q1Results','#StaffWelfare','#ComplianceWeek','#VendorPortal','#CyberSecurity']
const ONLINE = [
  { name:'Grace Okafor', dept:'Finance', initials:'GO', bg:'bg-blue-500' },
  { name:'Emmanuel Bello', dept:'ICT', initials:'EB', bg:'bg-emerald-500' },
  { name:'Fatima Adamu', dept:'Legal', initials:'FA', bg:'bg-pink-500' },
  { name:'Miriam Ibrahim', dept:'Procurement', initials:'MI', bg:'bg-amber-500' },
  { name:'Tunde Ajayi', dept:'Training', initials:'TA', bg:'bg-teal-500' },
]

export default function IntranetPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState(POSTS)
  const [newPost, setNewPost] = useState('')
  const [liked, setLiked] = useState({})

  const toggleLike = id => {
    setLiked(l => ({ ...l, [id]: !l[id] }))
    setPosts(ps => ps.map(p => p.id === id ? { ...p, likes: p.likes + (liked[id] ? -1 : 1) } : p))
  }
  const submitPost = () => {
    if (!newPost.trim()) return
    setPosts(ps => [{ id:Date.now(), author:user.name, initials:user.initials, dept:user.department, time:'Just now', type:'Post', typeBg:'bg-slate-50', typeColor:'text-slate-600', avatarBg:'bg-[#006838]', content:newPost, likes:0, comments:0 }, ...ps])
    setNewPost('')
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block"/>
          <div><h1 className="text-xl font-extrabold text-slate-900">Company Intranet</h1><p className="text-sm text-slate-400">Stay connected with colleagues across all departments</p></div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Compose */}
          <div className="card">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#006838] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{user?.initials}</div>
              <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} rows={3}
                className="flex-1 resize-none text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 focus:border-[#006838]/30 focus:ring-2 focus:ring-[#006838]/5 transition-all"
                placeholder="Share an update, announcement or idea with your colleagues..." />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[{icon:Image,label:'Photo'},{icon:Paperclip,label:'File'},{icon:Megaphone,label:'Announce'}].map(({icon:Icon,label},i)=>(
                  <button key={i} className="flex items-center gap-1.5 text-slate-400 hover:text-[#006838] text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-green-50 transition-colors"><Icon size={13}/>{label}</button>
                ))}
              </div>
              <button onClick={submitPost} className="btn-primary text-sm py-2 px-4"><Send size={13}/>Post</button>
            </div>
          </div>
          {/* Feed */}
          {posts.map(post => (
            <div key={post.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${post.avatarBg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{post.initials}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{post.author}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${post.typeBg} ${post.typeColor}`}>{post.type}</span>
                      <span className="text-[10px] text-slate-400">{post.time}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">{post.content}</p>
              {post.image && (
                <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl h-36 flex items-center justify-center mb-3 border border-slate-100">
                  <span className="text-slate-400 text-sm font-medium">📷 Training Schedule — Q2 2026</span>
                </div>
              )}
              <div className="flex items-center gap-4 pt-3 border-t border-slate-50">
                <button onClick={()=>toggleLike(post.id)} className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${liked[post.id]?'text-red-500':'text-slate-400 hover:text-red-400'}`}>
                  <Heart size={14} fill={liked[post.id]?'currentColor':'none'}/>{post.likes} Likes
                </button>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-blue-500 transition-colors"><MessageCircle size={14}/>{post.comments} Comments</button>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-500 transition-colors"><Share2 size={14}/>Share</button>
              </div>
            </div>
          ))}
        </div>
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card text-center">
            <div className="w-14 h-14 rounded-full bg-[#006838] flex items-center justify-center text-white text-lg font-bold mx-auto mb-3">{user?.initials}</div>
            <p className="text-sm font-bold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.role} · {user?.department}</p>
            <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-slate-100">
              {[{v:'24',l:'Posts'},{v:'186',l:'Connections'},{v:'12',l:'Groups'}].map(({v,l},i)=>(
                <div key={i} className="text-center"><div className="text-base font-extrabold text-slate-900">{v}</div><div className="text-[10px] text-slate-400 font-medium">{l}</div></div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-4"><TrendingUp size={14} className="text-[#006838]"/><p className="text-sm font-bold text-slate-800">Trending</p></div>
            <div className="space-y-2.5">
              {TRENDING.map((tag,i)=>(
                <div key={i} className="flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-xl px-2 py-1.5 transition-colors">
                  <div className="flex items-center gap-2"><Hash size={12} className="text-[#006838]"/><span className="text-sm font-semibold text-[#006838]">{tag.replace('#','')}</span></div>
                  <span className="text-[10px] text-slate-400 font-medium">{[142,89,67,45,38][i]} posts</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-4"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/><p className="text-sm font-bold text-slate-800">Online Now</p></div>
            <div className="space-y-3">
              {ONLINE.map((p,i)=>(
                <div key={i} className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full ${p.bg} flex items-center justify-center text-white text-xs font-bold`}>{p.initials}</div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white"/>
                  </div>
                  <div><p className="text-xs font-semibold text-slate-800">{p.name}</p><p className="text-[10px] text-slate-400">{p.dept}</p></div>
                  <button className="ml-auto text-[10px] text-[#006838] font-bold hover:underline">Message</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
