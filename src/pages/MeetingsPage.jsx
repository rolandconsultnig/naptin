import { useState, useEffect, useRef } from 'react'
import { NAPTIN_LOGO } from '../assets/images'
import { MEETINGS, STAFF } from '../data/mock'
import { Video, VideoOff, Users, Calendar, Clock, Plus, CheckCircle, ExternalLink, MonitorUp, Mic, MicOff, PhoneOff, ScreenShare, ScreenShareOff, MessageSquare, X, Copy, Check } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'

const COLORS = ['bg-blue-500','bg-emerald-500','bg-pink-500','bg-purple-500','bg-amber-500','bg-teal-500']

/* ── In-App Meeting Room Modal ───────────────────────────────────── */
function MeetingRoomModal({ meeting, onClose, addNotification }) {
  const [muted, setMuted] = useState(false)
  const [videoOn, setVideoOn] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMsg, setChatMsg] = useState('')
  const [chatLog, setChatLog] = useState([
    { from: 'System', text: `You joined "${meeting.title}"`, ts: new Date() },
  ])
  const [duration, setDuration] = useState(0)
  const [stream, setStream] = useState(null)
  const [cameraError, setCameraError] = useState(false)
  const videoRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    // Camera / mic
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(s => {
          setStream(s)
          if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.muted = true }
        })
        .catch(() => setCameraError(true))
    } else {
      setCameraError(true)
    }
    // Timer
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
    // Global notification
    addNotification({
      title: `Joined: ${meeting.title}`,
      sub: `${meeting.dept} \u2014 live meeting in progress.`,
      type: 'success', link: '/app/meetings', module: 'Meetings',
    })
    return () => {
      clearInterval(timerRef.current)
    }
  }, [])

  // Cleanup stream on close
  const handleLeave = () => {
    if (stream) stream.getTracks().forEach(t => t.stop())
    addNotification({ title: `Left: ${meeting.title}`, sub: `Duration: ${fmt(duration)}`, type: 'info', link: '/app/meetings', module: 'Meetings' })
    onClose()
  }

  const toggleMute = () => {
    if (stream) stream.getAudioTracks().forEach(t => { t.enabled = muted; })
    setMuted(m => !m)
  }
  const toggleVideo = () => {
    if (stream) stream.getVideoTracks().forEach(t => { t.enabled = !videoOn; })
    setVideoOn(v => !v)
  }
  const toggleShare = async () => {
    if (!sharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        if (videoRef.current) videoRef.current.srcObject = screenStream
        screenStream.getVideoTracks()[0].onended = () => { setSharing(false); if (stream && videoRef.current) videoRef.current.srcObject = stream }
        setSharing(true)
      } catch {
        setSharing(false)
      }
    } else {
      setSharing(false)
      if (stream && videoRef.current) videoRef.current.srcObject = stream
    }
  }
  const sendChat = (e) => {
    e.preventDefault()
    if (!chatMsg.trim()) return
    setChatLog(l => [...l, { from: 'You', text: chatMsg.trim(), ts: new Date() }])
    setChatMsg('')
  }
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const now = new Date()

  // Simulated remote participants
  const participants = meeting.avatars.map((av, i) => ({ av, color: COLORS[i % COLORS.length] }))

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col" style={{ minHeight: 0 }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-800 shrink-0">
        <div>
          <p className="text-white font-bold text-sm">{meeting.title}</p>
          <p className="text-slate-400 text-xs">{meeting.dept} &middot; {fmt(duration)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
          <div className="flex -space-x-1.5">
            {participants.map((p, i) => (
              <div key={i} className={`w-7 h-7 rounded-full ${p.color} border-2 border-slate-800 flex items-center justify-center text-white text-[9px] font-bold`}>{p.av}</div>
            ))}
            {meeting.attendees > participants.length && (
              <div className="w-7 h-7 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center text-white text-[9px] font-bold">+{meeting.attendees - participants.length}</div>
            )}
          </div>
          <span className="text-xs text-slate-400">{meeting.attendees} attendees</span>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 min-h-0 gap-0">
        {/* Video grid */}
        <div className={`flex-1 flex flex-col ${chatOpen ? 'mr-72' : ''} relative min-h-0`}>
          <div className="flex-1 grid gap-2 p-4" style={{ gridTemplateColumns: `repeat(${Math.min(participants.length + 1, 3)}, 1fr)` }}>
            {/* Your tile */}
            <div className="relative rounded-xl overflow-hidden bg-slate-700 flex items-center justify-center aspect-video">
              {cameraError || !videoOn ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-[#006838] flex items-center justify-center text-white text-2xl font-bold">You</div>
                  {!videoOn && <span className="text-xs text-slate-400">Camera off</span>}
                </div>
              ) : (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                You {muted && <span className="text-red-400 ml-1">&#x1F507;</span>}
              </div>
              {sharing && <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">Sharing</div>}
            </div>
            {/* Remote participant tiles */}
            {participants.map((p, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden bg-slate-700 flex items-center justify-center aspect-video">
                <div className={`w-16 h-16 rounded-full ${p.color} flex items-center justify-center text-white text-xl font-bold`}>{p.av}</div>
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">{p.av}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-slate-800 flex flex-col border-l border-slate-700">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <p className="text-white text-sm font-semibold">Meeting Chat</p>
              <button onClick={() => setChatOpen(false)}><X size={15} className="text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatLog.map((c, i) => (
                <div key={i}>
                  <p className="text-xs text-slate-400 font-semibold">{c.from} &middot; {c.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-sm text-white bg-slate-700 rounded-lg px-3 py-1.5 mt-0.5">{c.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={sendChat} className="p-3 border-t border-slate-700 flex gap-2">
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Message..." className="flex-1 rounded-lg bg-slate-700 text-white text-sm px-3 py-2 outline-none" />
              <button type="submit" className="bg-[#006838] text-white px-3 py-2 rounded-lg text-xs font-semibold">Send</button>
            </form>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-center gap-4 py-4 bg-slate-800 shrink-0">
        <button onClick={toggleMute} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${muted ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 hover:bg-slate-600'}`}>
          {muted ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
          <span className="text-white text-[10px]">{muted ? 'Unmute' : 'Mute'}</span>
        </button>
        <button onClick={toggleVideo} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${!videoOn ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 hover:bg-slate-600'}`}>
          {videoOn ? <Video size={20} className="text-white" /> : <VideoOff size={20} className="text-white" />}
          <span className="text-white text-[10px]">{videoOn ? 'Stop Video' : 'Start Video'}</span>
        </button>
        <button onClick={toggleShare} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${sharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-600'}`}>
          {sharing ? <ScreenShareOff size={20} className="text-white" /> : <ScreenShare size={20} className="text-white" />}
          <span className="text-white text-[10px]">{sharing ? 'Stop Share' : 'Share Screen'}</span>
        </button>
        <button onClick={() => setChatOpen(c => !c)} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${chatOpen ? 'bg-[#006838]' : 'bg-slate-700 hover:bg-slate-600'}`}>
          <MessageSquare size={20} className="text-white" />
          <span className="text-white text-[10px]">Chat</span>
        </button>
        <button onClick={handleLeave} className="flex flex-col items-center gap-1 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition-colors ml-4">
          <PhoneOff size={20} className="text-white" />
          <span className="text-white text-[10px] font-semibold">Leave</span>
        </button>
      </div>
    </div>
  )
}

function MeetingCard({ m, onJoin }) {
  const [joining, setJoining] = useState(false)
  const cfg = {
    live:      { badge:'bg-red-500 text-white', label:'● Live',     btn:'bg-red-500 hover:bg-red-600 text-white',              btnLabel:'Join Now' },
    upcoming:  { badge:'bg-blue-50 text-blue-700', label:'Upcoming', btn:'bg-[#006838] hover:bg-[#004D28] text-white',          btnLabel:'Join When Live' },
    ended:     { badge:'bg-slate-100 text-slate-500', label:'Ended', btn:'bg-slate-100 text-slate-400 cursor-not-allowed',      btnLabel:'Ended' },
    scheduled: { badge:'bg-green-50 text-[#006838]', label:'Scheduled', btn:'bg-emerald-600 hover:bg-emerald-700 text-white',  btnLabel:'View Details' },
  }
  const c = cfg[m.status]
  const join = () => {
    if (m.status === 'ended') return
    setJoining(true)
    setTimeout(() => { setJoining(false); onJoin(m) }, 600)
  }
  return (
    <div className={`card transition-all ${m.status==='live' ? 'border-red-200 shadow-red-50 shadow-md' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badge}`}>{c.label}</span>
            <span className="text-[10px] text-slate-400 font-medium">{m.dept}</span>
          </div>
          <h3 className="text-sm font-bold text-slate-800">{m.title}</h3>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1"><Clock size={11}/>{m.time}</span>
        <span className="flex items-center gap-1"><Calendar size={11}/>{m.duration}</span>
        <span className="flex items-center gap-1"><Video size={11}/>{m.location}</span>
        <span className="flex items-center gap-1"><Users size={11}/>{m.attendees} attendees</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center">
          {m.avatars.map((av,i) => (
            <div key={i} className={`w-7 h-7 rounded-full ${COLORS[i%COLORS.length]} flex items-center justify-center text-white text-[9px] font-bold border-2 border-white ${i>0?'-ml-1.5':''}`}>{av}</div>
          ))}
          {m.attendees > m.avatars.length && (
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[9px] font-bold border-2 border-white -ml-1.5">+{m.attendees-m.avatars.length}</div>
          )}
        </div>
        <button onClick={join} disabled={m.status==='ended'||joining}
          className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-colors ${c.btn}`}>
          {joining ? '...' : <><ExternalLink size={11}/>{c.btnLabel}</>}
        </button>
      </div>
    </div>
  )
}

export default function MeetingsPage() {
  const { addNotification } = useNotifications()
  const [tab, setTab] = useState('today')
  const [meetings, setMeetings] = useState(MEETINGS)
  const [joinRoom, setJoinRoom] = useState(null)
  const [form, setForm] = useState({ title:'', dept:'', type:'Virtual (Video Call)', date:'', time:'', notes:'' })
  const [scheduled, setScheduled] = useState(false)

  const today = new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
  const liveCount = meetings.filter(m => m.status === 'live').length

  const handleSchedule = e => {
    e.preventDefault()
    const newMeeting = {
      id: meetings.length + 1,
      title: form.title,
      dept: form.dept || 'General',
      time: form.time,
      duration: '1h',
      location: form.type,
      attendees: 1,
      status: 'scheduled',
      avatars: [],
    }
    setMeetings(prev => [...prev, newMeeting])
    setScheduled(true)
    addNotification({
      title: `Meeting Scheduled: ${form.title}`,
      sub: `${form.dept || 'General'} \u2014 ${form.date} at ${form.time}. Invitations sent.`,
      type: 'task', link: '/app/meetings', module: 'Meetings',
    })
    setTimeout(() => setScheduled(false), 4000)
    setForm({ title:'', dept:'', type:'Virtual (Video Call)', date:'', time:'', notes:'' })
    setTimeout(() => setTab('today'), 1000)
  }

  return (
    <>
    {joinRoom && (
      <MeetingRoomModal
        meeting={joinRoom}
        onClose={() => setJoinRoom(null)}
        addNotification={addNotification}
      />
    )}
    <div className="animate-fade-up">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block"/>
          <div><h1 className="text-xl font-extrabold text-slate-900">Meetings &amp; Collaboration</h1><p className="text-sm text-slate-400">{today}</p></div>
        </div>
        <button onClick={()=>setTab('schedule')} className="btn-primary"><Plus size={15}/>Schedule Meeting</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {label:'Live Now',value:String(liveCount),icon:Video,bg:'bg-red-50',color:'text-red-500'},
          {label:"Today's Meetings",value:String(meetings.filter(m=>m.status!=='scheduled').length),icon:Calendar,bg:'bg-blue-50',color:'text-blue-600'},
          {label:'Total Invitees',value:String(meetings.reduce((a,m)=>a+(m.attendees||0),0)),icon:Users,bg:'bg-purple-50',color:'text-purple-600'},
          {label:'This Week',value:String(meetings.length),icon:Clock,bg:'bg-green-50',color:'text-[#006838]'},
        ].map((k,i)=>(
          <div key={i} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${k.bg} ${k.color} flex items-center justify-center`}><k.icon size={18}/></div>
            <div><div className="text-2xl font-extrabold text-slate-900">{k.value}</div><div className="text-xs text-slate-400 font-medium">{k.label}</div></div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 mb-6 bg-white border border-slate-100 rounded-2xl p-1 w-fit shadow-sm">
        {[{id:'today',label:"Today's Meetings"},{id:'schedule',label:'Schedule New'},{id:'all',label:'All Meetings'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab===t.id?'bg-[#006838] text-white shadow-sm':'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab==='today' && (
        <div>
          <div className="flex items-center gap-2 mb-3"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/><p className="text-sm font-bold text-slate-700">Live Now</p></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {meetings.filter(m=>m.status==='live').map(m=><MeetingCard key={m.id} m={m} onJoin={setJoinRoom}/>)}
          </div>
          <p className="text-sm font-bold text-slate-700 mb-3">Today's Schedule</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {meetings.filter(m=>m.status!=='scheduled').map(m=><MeetingCard key={m.id} m={m} onJoin={setJoinRoom}/>)}
          </div>
        </div>
      )}

      {tab==='schedule' && (
        <div className="max-w-2xl">
          <div className="card">
            <h2 className="text-sm font-extrabold text-slate-800 mb-5">Schedule a New Meeting</h2>
            {scheduled && (
              <div className="mb-4 p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-[#006838] text-sm font-semibold">
                <CheckCircle size={16}/>Meeting scheduled! Invitations sent to all attendees.
              </div>
            )}
            <form onSubmit={handleSchedule} className="space-y-4">
              <div><label className="label">Meeting Title *</label><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Q2 Planning Session" className="input"/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Department</label>
                  <select value={form.dept} onChange={e=>setForm({...form,dept:e.target.value})} className="select">
                    <option value="">Select Department</option>
                    {['Human Resource Management','Finance & Accounts','Planning, Research & Statistics','Training','Corporate & Consultancy Services','Marketing & Business Development','Legal / Board Secretariat','Procurement','ICT','All Departments'].map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
                <div><label className="label">Meeting Type</label>
                  <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="select">
                    {['Virtual (Video Call)','Conference Room A','Conference Room B','Boardroom','Hybrid'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Date *</label><input required type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="input"/></div>
                <div><label className="label">Time *</label><input required type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} className="input"/></div>
              </div>
              <div><label className="label">Invite Attendees</label><input placeholder="Search staff by name or department..." className="input"/></div>
              <div><label className="label">Agenda / Notes</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={3} placeholder="Meeting agenda..." className="input resize-none"/></div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="flex-1 btn-primary justify-center py-2.5">Schedule Meeting</button>
                <button type="button" onClick={()=>setTab('today')} className="flex-1 btn-secondary justify-center py-2.5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tab==='all' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {meetings.map(m=><MeetingCard key={m.id} m={m} onJoin={setJoinRoom}/>)}
        </div>
      )}
    </div>
    </>
  )
}
