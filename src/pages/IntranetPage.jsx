import { useEffect, useReducer, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { NAPTIN_LOGO } from '../assets/images'
import { Heart, MessageCircle, Share2, Image, Paperclip, Megaphone, Send, Hash, TrendingUp } from 'lucide-react'

const STORAGE_KEY = 'naptin.intranet.feed.v1'

const BASE_POSTS = [
  { id: 1, author: 'Director General Office', initials: 'DG', dept: 'Corporate Services', time: '2 hours ago', type: 'Announcement', typeBg: 'bg-[#006838]/10', typeColor: 'text-[#006838]', avatarBg: 'bg-[#006838]', content: "We are pleased to announce that NAPTIN's Q1 training targets have been exceeded by 12% across all key performance indicators. A full report will be circulated by Monday. Thank you all for your dedication! 🎉", likes: 84, comments: 2 },
  { id: 2, author: 'Training Unit', initials: 'TU', dept: 'Training Department', time: '5 hours ago', type: 'Training', typeBg: 'bg-blue-50', typeColor: 'text-blue-700', avatarBg: 'bg-blue-600', content: 'Reminder: The Cybersecurity Awareness Training is mandatory for all ICT and Admin staff. Sessions run every Tuesday 2–4 PM in Conference Room B. 35 seats available for next week. Register via the Training module.', likes: 41, comments: 1, image: true },
  { id: 3, author: 'Procurement Department', initials: 'PC', dept: 'Procurement', time: 'Yesterday', type: 'Update', typeBg: 'bg-amber-50', typeColor: 'text-amber-700', avatarBg: 'bg-amber-500', content: 'New vendor registration portal is now LIVE! All departments requiring supplier onboarding should use the new digital form accessible from the Procurement module. Paper submissions will no longer be accepted from 1 April 2026. 🚀', likes: 29, comments: 1 },
  { id: 4, author: 'ICT Department', initials: 'ICT', dept: 'ICT', time: 'Yesterday', type: 'Alert', typeBg: 'bg-red-50', typeColor: 'text-red-600', avatarBg: 'bg-red-500', content: 'Planned server maintenance tonight between 11 PM and 2 AM. Please save all work and log out before 10:45 PM. Email, File Server and Payroll System will be unavailable during this window.', likes: 12, comments: 1 },
]

/** Seed comment threads for default posts (shown when user expands Comments). */
const SEED_THREADS = {
  1: [
    { id: '1a', author: 'Head of Training', initials: 'HT', text: 'Excellent results — well done to all RTCs.', time: '1h ago' },
    { id: '1b', author: 'Staff Rep', initials: 'SR', text: 'Will the full report be published on the intranet?', time: '45m ago' },
  ],
  2: [{ id: '2a', author: 'ICT Admin', initials: 'IA', text: 'Calendar invite sent for next Tuesday.', time: '3h ago' }],
  3: [{ id: '3a', author: 'HOD Procurement', initials: 'HP', text: 'Please cascade to your teams this week.', time: 'Yesterday' }],
  4: [{ id: '4a', author: 'Helpdesk', initials: 'HD', text: 'Backup reminder posted to all staff mail.', time: 'Yesterday' }],
}

function seedPostsWithThreads() {
  return BASE_POSTS.map((p) => {
    const thread = SEED_THREADS[p.id] ? [...SEED_THREADS[p.id]] : []
    return { ...p, thread, comments: thread.length }
  })
}

const SEED_LIST = seedPostsWithThreads()
const SEED_BY_ID = new Map(SEED_LIST.map((s) => [s.id, s]))

/** Use fallback only when value is missing or not a finite number (fixes bad / legacy localStorage). */
function finiteOr(value, fallback) {
  if (value === null || value === undefined) return fallback
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function normalizePostId(id) {
  if (typeof id === 'number' && Number.isFinite(id)) return id
  const n = Number(id)
  return Number.isFinite(n) ? n : id
}

function normalizePost(p) {
  if (!p || typeof p.id === 'undefined') return null
  const id = normalizePostId(p.id)
  const seed = SEED_BY_ID.get(id)
  const thread = Array.isArray(p.thread) ? p.thread : []
  const likes = finiteOr(p.likes, seed?.likes ?? 0)
  const commentsRaw = finiteOr(p.comments, seed?.comments ?? thread.length)
  const comments = Math.max(commentsRaw, thread.length)
  return {
    ...p,
    id,
    thread,
    likes,
    comments,
  }
}

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || !Array.isArray(data.posts) || data.posts.length === 0) return null
    let posts = data.posts.map(normalizePost).filter(Boolean)
    /** One-time repair: older saves sometimes stored seed posts with 0 likes / empty threads. */
    const needsRepair = !data.feedVersion || data.feedVersion < 2
    if (needsRepair) {
      posts = posts.map((p) => {
        const seed = SEED_BY_ID.get(p.id)
        if (!seed) return p
        const thread = p.thread || []
        if (thread.length === 0 && p.likes === 0 && p.comments === 0) {
          return { ...p, likes: seed.likes, comments: seed.comments, thread: [...seed.thread] }
        }
        return p
      })
    }
    return { posts, liked: data.liked && typeof data.liked === 'object' ? data.liked : {} }
  } catch {
    return null
  }
}

const initialPersisted = loadPersisted()

const initialState = {
  posts: initialPersisted?.posts || seedPostsWithThreads(),
  liked: initialPersisted?.liked || {},
  expandedComments: {},
}

function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_LIKE': {
      const id = normalizePostId(action.id)
      const was = !!state.liked[id]
      return {
        ...state,
        liked: { ...state.liked, [id]: !was },
        posts: state.posts.map((p) =>
          normalizePostId(p.id) === id ? { ...p, likes: Math.max(0, p.likes + (was ? -1 : 1)) } : p
        ),
      }
    }
    case 'ADD_POST': {
      const { user, text } = action
      const newPost = {
        id: Date.now(),
        author: user.name,
        initials: user.initials,
        dept: user.department,
        time: 'Just now',
        type: 'Post',
        typeBg: 'bg-slate-50',
        typeColor: 'text-slate-600',
        avatarBg: 'bg-[#006838]',
        content: text,
        likes: 0,
        comments: 0,
        thread: [],
      }
      return { ...state, posts: [newPost, ...state.posts] }
    }
    case 'TOGGLE_COMMENTS': {
      const id = normalizePostId(action.id)
      const open = !!state.expandedComments[id]
      return {
        ...state,
        expandedComments: { ...state.expandedComments, [id]: !open },
      }
    }
    case 'ADD_COMMENT': {
      const { postId, user, text } = action
      const pid = normalizePostId(postId)
      const reply = {
        id: `${pid}-c-${Date.now()}`,
        author: user.name,
        initials: user.initials,
        text,
        time: 'Just now',
      }
      return {
        ...state,
        posts: state.posts.map((p) => {
          if (normalizePostId(p.id) !== pid) return p
          const thread = [...(p.thread || []), reply]
          return {
            ...p,
            thread,
            comments: thread.length,
          }
        }),
      }
    }
    default:
      return state
  }
}

const TRENDING = ['#Q1Results', '#StaffWelfare', '#ComplianceWeek', '#VendorPortal', '#CyberSecurity']
const ONLINE = [
  { name: 'Grace Okafor', dept: 'Finance', initials: 'GO', bg: 'bg-blue-500' },
  { name: 'Emmanuel Bello', dept: 'ICT', initials: 'EB', bg: 'bg-emerald-500' },
  { name: 'Fatima Adamu', dept: 'Legal', initials: 'FA', bg: 'bg-pink-500' },
  { name: 'Miriam Ibrahim', dept: 'Procurement', initials: 'MI', bg: 'bg-amber-500' },
  { name: 'Tunde Ajayi', dept: 'Training', initials: 'TA', bg: 'bg-teal-500' },
]

export default function IntranetPage() {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialState)
  const { posts, liked, expandedComments } = state
  const [newPost, setNewPost] = useState('')
  const [commentDrafts, setCommentDrafts] = useState({})
  const [toast, setToast] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          feedVersion: 2,
          posts: state.posts,
          liked: state.liked,
        })
      )
    } catch {
      /* quota / private mode */
    }
  }, [state.posts, state.liked])

  const showToast = (msg) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2500)
  }

  const submitPost = () => {
    if (!user?.name) {
      showToast('Please sign in to post.')
      return
    }
    if (!newPost.trim()) return
    dispatch({ type: 'ADD_POST', user, text: newPost.trim() })
    setNewPost('')
    showToast('Your post was published to the feed.')
  }

  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return true
      }
    } catch {
      /* HTTP / blocked clipboard */
    }
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      if (ok) return true
    } catch {
      /* ignore */
    }
    return false
  }

  const shareFeed = async (postId) => {
    const base = `${window.location.origin}${window.location.pathname}`
    const url = postId != null ? `${base}#post-${postId}` : base
    const copied = await copyToClipboard(url)
    if (copied) {
      showToast('Link copied — paste it anywhere to share')
      return
    }
    window.prompt('Copy this link (Ctrl+C), then OK:', url)
    showToast('Copy the link from the box above if your browser blocked auto-copy (common on HTTP).')
  }

  const submitComment = (postId) => {
    const text = (commentDrafts[postId] || '').trim()
    if (!text || !user?.name) {
      showToast(user ? 'Write a comment first.' : 'Please sign in to comment.')
      return
    }
    dispatch({ type: 'ADD_COMMENT', postId, user, text })
    setCommentDrafts((d) => ({ ...d, [postId]: '' }))
  }

  return (
    <div className="animate-fade-up relative">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-[#006838] text-white text-sm font-medium px-4 py-2 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src={NAPTIN_LOGO} alt="" className="w-9 h-9 object-contain hidden sm:block" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Company Intranet</h1>
            <p className="text-sm text-slate-400">Stay connected with colleagues across all departments</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#006838] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.initials ?? '—'}
              </div>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows={3}
                className="flex-1 resize-none text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 focus:border-[#006838]/30 focus:ring-2 focus:ring-[#006838]/5 transition-all"
                placeholder="Share an update, announcement or idea with your colleagues..."
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[
                  { icon: Image, label: 'Photo' },
                  { icon: Paperclip, label: 'File' },
                  { icon: Megaphone, label: 'Announce' },
                ].map(({ icon: Icon, label }, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => showToast(`${label}: attach flow coming in a future update.`)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-[#006838] text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={submitPost} className="btn-primary text-sm py-2 px-4">
                <Send size={13} />
                Post
              </button>
            </div>
          </div>

          {posts.map((post) => (
            <article key={post.id} id={`post-${post.id}`} className="card scroll-mt-24">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${post.avatarBg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                  >
                    {post.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{post.author}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${post.typeBg} ${post.typeColor}`}>
                        {post.type}
                      </span>
                      <span className="text-[10px] text-slate-400">{post.time}</span>
                      {post.dept && <span className="text-[10px] text-slate-400">{post.dept}</span>}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
              {post.image && (
                <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl h-36 flex items-center justify-center mb-3 border border-slate-100">
                  <span className="text-slate-400 text-sm font-medium">📷 Training Schedule — Q2 2026</span>
                </div>
              )}
              <div className="flex items-center gap-4 pt-3 border-t border-slate-50 flex-wrap">
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'TOGGLE_LIKE', id: post.id })}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                    liked[post.id] ? 'text-red-500' : 'text-slate-400 hover:text-red-400'
                  }`}
                >
                  <Heart size={14} fill={liked[post.id] ? 'currentColor' : 'none'} />
                  {post.likes} Likes
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'TOGGLE_COMMENTS', id: post.id })}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                    expandedComments[post.id] ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'
                  }`}
                >
                  <MessageCircle size={14} />
                  {post.comments} Comments
                </button>
                <button
                  type="button"
                  onClick={() => shareFeed(post.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  <Share2 size={14} />
                  Share
                </button>
              </div>

              {expandedComments[post.id] && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  {(post.thread || []).length === 0 ? (
                    <p className="text-xs text-slate-400">No comments yet — be the first.</p>
                  ) : (
                    <ul className="space-y-3">
                      {(post.thread || []).map((c) => (
                        <li key={c.id} className="flex gap-2 text-sm">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 flex-shrink-0">
                            {c.initials}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              {c.author}
                              <span className="font-normal text-slate-400 ml-2">{c.time}</span>
                            </p>
                            <p className="text-slate-600 text-sm mt-0.5">{c.text}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={commentDrafts[post.id] || ''}
                      onChange={(e) => setCommentDrafts((d) => ({ ...d, [post.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                      placeholder="Write a comment…"
                      className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-[#006838]/40 outline-none"
                    />
                    <button type="button" onClick={() => submitComment(post.id)} className="btn-primary text-xs py-2 px-3">
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="space-y-4">
          <div className="card text-center">
            <div className="w-14 h-14 rounded-full bg-[#006838] flex items-center justify-center text-white text-lg font-bold mx-auto mb-3">
              {user?.initials ?? '—'}
            </div>
            <p className="text-sm font-bold text-slate-800">{user?.name ?? 'Guest'}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.role ?? '—'} · {user?.department ?? '—'}
            </p>
            <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-slate-100">
              {[
                { v: String(Math.max(0, posts.filter((p) => p.author === user?.name).length)), l: 'Posts' },
                { v: '186', l: 'Connections' },
                { v: '12', l: 'Groups' },
              ].map(({ v, l }, i) => (
                <div key={i} className="text-center">
                  <div className="text-base font-extrabold text-slate-900">{v}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-[#006838]" />
              <p className="text-sm font-bold text-slate-800">Trending</p>
            </div>
            <div className="space-y-2.5">
              {TRENDING.map((tag, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-xl px-2 py-1.5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Hash size={12} className="text-[#006838]" />
                    <span className="text-sm font-semibold text-[#006838]">{tag.replace('#', '')}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{[142, 89, 67, 45, 38][i]} posts</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-sm font-bold text-slate-800">Online Now</p>
            </div>
            <div className="space-y-3">
              {ONLINE.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className={`w-8 h-8 rounded-full ${p.bg} flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {p.initials}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.dept}</p>
                  </div>
                  <Link
                    to="/app/chat"
                    className="ml-auto text-[10px] text-[#006838] font-bold hover:underline"
                  >
                    Message
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
