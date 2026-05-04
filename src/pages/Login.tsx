import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, Eye, EyeOff, GraduationCap, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

const DEMO_CREDENTIALS: Record<string, { role: string; name: string; dept: string }> = {
  'student@educore.in': { role: 'student', name: 'Rahul Verma', dept: 'CSE · Year 3' },
  'faculty@educore.in': { role: 'faculty', name: 'Dr. Priya Sharma', dept: 'Database Systems' },
  'admin@educore.in':   { role: 'admin',   name: 'Admin Kumar',      dept: 'Main Campus' },
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(res => setTimeout(res, 1000))
    const creds = DEMO_CREDENTIALS[email.toLowerCase()]
    if (!creds || password !== 'demo123') {
      setError('Invalid credentials. Use one of the demo accounts below.')
      setLoading(false)
      return
    }
    localStorage.setItem('educore_user', JSON.stringify({ email, role: creds.role, name: creds.name }))
    toast.success(`Welcome, ${creds.name.split(' ')[0]}!`)
    setLoading(false)
    navigate(`/${creds.role}`)
  }

  const quickLogin = (em: string) => { setEmail(em); setPassword('demo123'); setError('') }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-electric-blue/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-electric-blue to-emerald-500 shadow-xl shadow-electric-blue/20 mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-black text-white">EduCore AI</h1>
          <p className="text-white/40 text-sm mt-1">Your intelligent campus platform</p>
        </div>

        {/* Card */}
        <div className="card px-7 py-6 border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/35">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-electric-blue transition-colors" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required
                  className="w-full h-11 bg-white/[0.05] border border-white/10 rounded-xl pl-10 pr-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-electric-blue/50 focus:bg-white/[0.08] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/35">Password</label>
                <button type="button" className="text-[10px] text-electric-blue hover:underline">Forgot?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-electric-blue transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full h-11 bg-white/[0.05] border border-white/10 rounded-xl pl-10 pr-10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-electric-blue/50 focus:bg-white/[0.08] transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer group w-fit">
              <div onClick={() => setRememberMe(!rememberMe)}
                className={`w-4.5 h-4.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-electric-blue border-electric-blue' : 'border-white/15 group-hover:border-white/30'}`}>
                {rememberMe && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <span className="text-xs text-white/40">Stay signed in</span>
            </label>

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading}
              className="w-full h-11 bg-electric-blue hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-electric-blue/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-5">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-white/20 font-bold">
                <span className="bg-[#1a1d2e] px-3">Demo Access</span>
              </div>
            </div>
            <div className="space-y-2">
              {Object.entries(DEMO_CREDENTIALS).map(([em, info]) => (
                <button key={em} onClick={() => quickLogin(em)}
                  className="group w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.05] transition-all text-left">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0
                    ${info.role === 'student' ? 'bg-blue-500/20 text-blue-400' : info.role === 'faculty' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {info.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white group-hover:text-electric-blue transition-colors truncate">{info.name}</p>
                    <p className="text-[10px] text-white/25 truncate">{info.dept}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-4 flex justify-center gap-5 text-[10px] text-white/20">
          <a href="/privacy" className="hover:text-white/50 transition-colors">Privacy</a>
          <a href="/terms" className="hover:text-white/50 transition-colors">Terms</a>
        </div>
      </motion.div>
    </div>
  )
}
