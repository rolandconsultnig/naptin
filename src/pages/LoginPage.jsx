import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getHomePathForUser } from '../auth/departmentAccess'
import { NAPTIN_LOGO, ENGR_PHOTO } from '../assets/images'

const STATS = [
  { value: '15,000+', label: 'Professionals Trained' },
  { value: '8', label: 'Regional Training Centres' },
  { value: 'ISO 9001:2015', label: 'Certified Quality' },
  { value: 'ANCEE', label: 'Centre of Excellence Africa' },
]

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('staff@naptin.gov.ng')
  const [password, setPassword] = useState('naptin2026')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [statIdx, setStatIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setStatIdx(i => (i + 1) % STATS.length), 3500)
    return () => clearInterval(t)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) { setError('Please enter your credentials.'); return }
    const res = await login(email, password)
    if (res?.ok) navigate(getHomePathForUser(res.user))
    else setError('Invalid credentials. Please try again.')
  }

  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif", minHeight:'100vh', display:'flex', background:'#fff'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .np-input{width:100%;background:#fff;border:1.5px solid #E2E8E2;border-radius:12px;padding:12px 16px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;color:#1a1a1a;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
        .np-input::placeholder{color:#bbb;}
        .np-input:focus{border-color:#006838;box-shadow:0 0 0 3px rgba(0,104,56,0.08);}
        .np-input.err{border-color:#e04040;}
        .np-sbtn{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:#006838;color:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;font-weight:700;border:none;border-radius:12px;padding:13px;cursor:pointer;transition:all 0.2s;}
        .np-sbtn:hover{background:#004D28;transform:translateY(-1px);}
        .np-sbtn:disabled{opacity:0.55;cursor:not-allowed;transform:none;}
        .np-sso{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:#fff;border:1.5px solid #E2E8E2;border-radius:12px;padding:12px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;color:#555;transition:all 0.2s;}
        .np-sso:hover{border-color:#006838;color:#006838;background:#F0F7F0;}
        .np-pill{display:flex;align-items:center;gap:5px;padding:5px 10px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);border-radius:7px;}
        @keyframes npa{0%,100%{opacity:1;}50%{opacity:0.3;}}
        @keyframes nspin{to{transform:rotate(360deg);}}
        .nspin{animation:nspin 0.8s linear infinite;}
        .npdot{width:5px;height:5px;border-radius:50%;background:#FFD700;display:inline-block;animation:npa 2s ease-in-out infinite;}
        @keyframes nfsu{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        .nfsu{animation:nfsu 0.5s ease both;}
      `}</style>

      {/* LEFT */}
      <div style={{width:'55%',display:'flex',flexDirection:'column',background:'#006838',position:'relative',overflow:'hidden'}} className="hidden lg:flex">
        {/* Deco circles */}
        <div style={{position:'absolute',right:-70,top:-70,width:260,height:260,borderRadius:'50%',border:'1px solid rgba(255,255,255,0.07)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',right:-45,top:-45,width:180,height:180,borderRadius:'50%',border:'1px solid rgba(255,255,255,0.1)',pointerEvents:'none'}}/>
        {/* Grid */}
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%'}} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <defs><pattern id="pg2" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.6"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#pg2)"/>
        </svg>

        {/* Top: Brand + Hero */}
        <div style={{padding:'28px 40px 20px',position:'relative',zIndex:2}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
            <img src={NAPTIN_LOGO} alt="NAPTIN" style={{width:52,height:52,objectFit:'contain',background:'white',borderRadius:10,padding:3,border:'1px solid rgba(255,255,255,0.2)'}}/>
            <div>
              <div style={{fontWeight:800,fontSize:18,color:'#fff',letterSpacing:-0.4}}>NAPTIN</div>
              <div style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,0.5)',letterSpacing:0.5,textTransform:'uppercase',marginTop:2}}>National Power Training Institute of Nigeria</div>
              <div style={{fontSize:8.5,color:'rgba(255,255,255,0.35)',marginTop:1}}>Federal Ministry of Power · Est. 2009</div>
            </div>
          </div>
          <div style={{display:'inline-flex',alignItems:'center',gap:7,background:'rgba(255,255,255,0.13)',border:'1px solid rgba(255,255,255,0.22)',color:'#fff',fontSize:10,fontWeight:700,letterSpacing:0.4,padding:'5px 13px',borderRadius:100,marginBottom:14}}>
            <span className="npdot"/> Staff & Enterprise Portal
          </div>
          <h1 style={{fontSize:30,fontWeight:800,lineHeight:1.18,letterSpacing:-0.8,color:'#fff',marginBottom:10}}>
            Powering Nigeria's<br/><span style={{color:'#FFD700'}}>Energy Workforce</span>
          </h1>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.58)',lineHeight:1.72,maxWidth:360,marginBottom:16}}>
            The unified management platform for all NAPTIN staff — HR, Finance, Training, Procurement, Admin and all 8 regional training centres.
          </p>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {['👥 Human Resource Mgmt','💰 Finance & Accounts','🎓 Training','⚖️ Legal / Board Secretariat','💻 ICT (Planning Dept)','📦 Procurement','📊 Planning & M&E','🏢 Corporate & Consultancy','📣 Marketing & Biz Dev'].map(p=>(
              <div key={p} className="np-pill"><span style={{fontSize:11,color:'#fff',fontWeight:600}}>{p}</span></div>
            ))}
          </div>
        </div>

        {/* Middle: Real engineer photo */}
        <div style={{flex:1,position:'relative',overflow:'hidden',margin:'0 0 0 0'}}>
          <img src={ENGR_PHOTO} alt="NAPTIN Engineers" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 20%'}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom, rgba(0,104,56,0.4) 0%, rgba(0,104,56,0.05) 40%, rgba(0,72,38,0.7) 100%)'}}/>
          <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'10px 20px',display:'flex',alignItems:'center',gap:8}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:'#FFD700',flexShrink:0,animation:'npa 2s ease-in-out infinite',display:'inline-block'}}/>
            <span style={{fontSize:10.5,fontWeight:600,color:'rgba(255,255,255,0.85)'}}>NAPTIN-trained engineers at a 132kV transmission substation — Abuja, Nigeria</span>
          </div>
        </div>

        {/* Bottom: Stats */}
        <div style={{padding:'16px 40px 24px',position:'relative',zIndex:2}}>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.18)',borderRadius:11,marginBottom:10}}>
            <div style={{width:28,height:28,borderRadius:7,background:'#FFD700',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#006838" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:17,fontWeight:800,color:'#FFD700',letterSpacing:-0.4,lineHeight:1,fontFamily:"'JetBrains Mono',monospace"}}>{STATS[statIdx].value}</div>
              <div style={{fontSize:9.5,color:'rgba(255,255,255,0.5)',marginTop:2,fontWeight:500}}>{STATS[statIdx].label}</div>
            </div>
            <div style={{display:'flex',gap:4}}>
              {STATS.map((_,i)=><div key={i} style={{width:4,height:4,borderRadius:'50%',background:i===statIdx?'#FFD700':'rgba(255,255,255,0.2)',transition:'background 0.3s'}}/>)}
            </div>
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {['ISO 9001:2015','ANCEE Centre of Excellence','Fed. Ministry of Power','Est. 2009'].map(b=>(
              <div key={b} style={{fontSize:9,fontWeight:600,padding:'4px 9px',borderRadius:5,border:'1px solid rgba(255,255,255,0.16)',color:'rgba(255,255,255,0.5)'}}>{b}</div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'36px 24px',background:'#FAFAF8',position:'relative'}}>
        <div className="nfsu" style={{width:'100%',maxWidth:360}}>
          {/* Logo header */}
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18,paddingBottom:16,borderBottom:'1.5px solid #EEF2EE'}}>
            <img src={NAPTIN_LOGO} alt="NAPTIN" style={{width:44,height:44,objectFit:'contain'}}/>
            <div>
              <div style={{fontWeight:800,fontSize:13,color:'#0D1F0D',letterSpacing:-0.2}}>NAPTIN</div>
              <div style={{fontSize:9,color:'#888',fontWeight:500,marginTop:1}}>National Power Training Institute of Nigeria</div>
            </div>
          </div>

          {/* Nigerian flag bar */}
          <div style={{display:'flex',height:'2.5px',borderRadius:100,overflow:'hidden',width:40,marginBottom:14}}>
            <div style={{flex:1,background:'#008751'}}/><div style={{flex:1,background:'#ddd'}}/><div style={{flex:1,background:'#008751'}}/>
          </div>

          <h2 style={{fontSize:26,fontWeight:800,letterSpacing:-0.75,color:'#0D1F0D',lineHeight:1.2,marginBottom:6}}>
            Welcome<br/><span style={{color:'#006838'}}>back.</span>
          </h2>
          <p style={{fontSize:12.5,color:'#888',lineHeight:1.65,marginBottom:22}}>
            Sign in with your official NAPTIN staff credentials.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',fontSize:11,fontWeight:700,color:'#555',letterSpacing:0.4,textTransform:'uppercase',marginBottom:7}}>Staff Email Address</label>
              <input type="email" className={`np-input${error?' err':''}`} placeholder="yourname@naptin.gov.ng"
                value={email} onChange={e=>{setEmail(e.target.value);setError('')}} autoComplete="email"/>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}>
                <label style={{fontSize:11,fontWeight:700,color:'#555',letterSpacing:0.4,textTransform:'uppercase'}}>Password</label>
                <a href="#" style={{color:'#006838',fontWeight:700,fontSize:11.5,textDecoration:'none'}}>Forgot password?</a>
              </div>
              <div style={{position:'relative'}}>
                <input type={showPw?'text':'password'} className={`np-input${error?' err':''}`} placeholder="Enter your password"
                  value={password} onChange={e=>{setPassword(e.target.value);setError('')}}
                  style={{paddingRight:44}} autoComplete="current-password"/>
                <button type="button" onClick={()=>setShowPw(v=>!v)}
                  style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#bbb',display:'flex',alignItems:'center'}}>
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>
            {error && (
              <div style={{display:'flex',alignItems:'center',gap:7,background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:10,padding:'10px 13px',fontSize:12,color:'#b91c1c',marginBottom:14}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}
            <button type="submit" className="np-sbtn" disabled={loading}>
              {loading
                ? <><svg className="nspin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Authenticating...</>
                : <>Sign In to Portal <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
              }
            </button>
          </form>

          <div style={{display:'flex',alignItems:'center',gap:10,margin:'16px 0'}}>
            <div style={{flex:1,height:1,background:'#E8EDE8'}}/><div style={{fontSize:10,color:'#aaa',fontWeight:600}}>OR</div><div style={{flex:1,height:1,background:'#E8EDE8'}}/>
          </div>

          <button className="np-sso">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Sign in with SSO (Microsoft / Google)
          </button>

          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:16}}>
            <span style={{fontSize:11.5,color:'#999'}}>Need help? <a href="mailto:ict@naptin.gov.ng" style={{color:'#006838',fontWeight:700,textDecoration:'none'}}>ict@naptin.gov.ng</a></span>
            <span style={{fontSize:11.5,color:'#999'}}>New staff? <a href="#" style={{color:'#006838',fontWeight:700,textDecoration:'none'}}>Request access</a></span>
          </div>

          <div style={{marginTop:16,padding:'11px 15px',background:'#F0F7F0',border:'1px solid #C8E6C8',borderRadius:11}}>
            <div style={{fontSize:9.5,fontWeight:700,color:'#006838',letterSpacing:0.5,textTransform:'uppercase',marginBottom:6}}>Example accounts · password naptin2026</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'#555',lineHeight:1.65}}>
              staff@naptin.gov.ng — staff<br/>
              hod@naptin.gov.ng — HOD<br/>
              director@naptin.gov.ng — director<br/>
              ict@naptin.gov.ng — ICT admin<br/>
              audit@naptin.gov.ng — auditor
            </div>
          </div>
        </div>
        <div style={{borderTop:'1px solid #EEF1EE',padding:'10px',width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:16,marginTop:'auto'}}>
          {['Privacy Policy','Terms of Use','© 2026 NAPTIN','v2.0.0'].map(l=>(
            <span key={l} style={{fontSize:9.5,color:'#bbb',cursor:'pointer'}}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
