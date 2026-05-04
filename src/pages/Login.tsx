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
    toast.success(`Welcome back, ${creds.name.split(' ')[0]}!`)
    setLoading(false)
    navigate(`/${creds.role}`)
  }

  const quickLogin = (em: string) => { setEmail(em); setPassword('demo123'); setError('') }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 bg-grid-faint opacity-50 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-100/30 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 shadow-2xl shadow-blue-200 mb-6">
            <GraduationCap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="font-heading text-4xl font-black text-slate-900 tracking-tight">EduCore AI</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">The intelligence behind your academic success</p>
        </div>

        {/* Auth Card */}
        <div className="card px-8 py-8 bg-white border-slate-200 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors text-slate-300 group-focus-within:text-blue-600">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@university.edu" required
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-slate-900 text-sm placeholder:text-slate-300 focus:outline-none focus:border-blue-500 focus:bg-white transition-all ring-0 focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">Password</label>
                <button type="button" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot Password?</button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors text-slate-300 group-focus-within:text-blue-600">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-12 text-slate-900 text-sm placeholder:text-slate-300 focus:outline-none focus:border-blue-500 focus:bg-white transition-all ring-0 focus:ring-4 focus:ring-blue-50"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer group select-none">
                <div onClick={() => setRememberMe(!rememberMe)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-blue-600 border-blue-600' : 'border-slate-200 group-hover:border-slate-300'}`}>
                  {rememberMe && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </div>
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Stay signed in</span>
              </label>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-center">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-xl shadow-xl shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm uppercase tracking-wider">
              {loading
                ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign In to EduCore</span><ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          {/* Quick Access Grid */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center mb-5">Quick Demo Access</p>
            <div className="grid grid-cols-1 gap-2.5">
              {Object.entries(DEMO_CREDENTIALS).map(([em, info]) => (
                <button key={em} onClick={() => quickLogin(em)}
                  className="group relative flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-left">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 transition-transform group-hover:scale-105
                    ${info.role === 'student' ? 'bg-blue-100 text-blue-600' : info.role === 'faculty' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {info.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate uppercase tracking-tight">{info.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tighter">{info.dept}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-center gap-8">
          <a href="/privacy" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Privacy Policy</a>
          <a href="/terms" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Terms of Service</a>
        </div>
      </motion.div>
    </div>
  )
}
