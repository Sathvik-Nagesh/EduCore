import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

// Demo credentials → role mapping
const DEMO_CREDENTIALS: Record<string, { role: string; name: string }> = {
  'student@educore.in': { role: 'student', name: 'Rahul Verma' },
  'faculty@educore.in': { role: 'faculty', name: 'Dr. Priya Sharma' },
  'admin@educore.in': { role: 'admin', name: 'Admin Kumar' },
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate loading
    await new Promise(res => setTimeout(res, 800))

    const creds = DEMO_CREDENTIALS[email.toLowerCase()]

    if (!creds || password !== 'demo123') {
      setError('Invalid credentials. Use the demo accounts below.')
      setLoading(false)
      return
    }

    // Store session in localStorage for demo
    localStorage.setItem('educore_user', JSON.stringify({ email, role: creds.role, name: creds.name }))

    toast.success(`Welcome back, ${creds.name.split(' ')[0]}! 👋`)
    setLoading(false)

    navigate(`/${creds.role}`)
  }

  const quickLogin = (email: string) => {
    setEmail(email)
    setPassword('demo123')
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-60" />

      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(79,142,247,0.12), transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Back link */}
        <motion.a
          href="/"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-white/30 hover:text-white/70 text-sm mb-8 transition-colors"
        >
          ← Back to Home
        </motion.a>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card p-8"
          style={{ border: '1px solid rgba(79,142,247,0.15)' }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, #4F8EF7, #10B981)', boxShadow: '0 0 30px rgba(79,142,247,0.4)' }}
            >
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-white/40 text-sm mt-1">Sign in to your EduCore account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="input-field pl-10"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="input-field pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6">
            <div className="divider" />
            <p className="section-label text-center mb-3">Demo Accounts</p>
            <div className="space-y-2">
              {Object.entries(DEMO_CREDENTIALS).map(([email, { role, name }]) => (
                <button
                  key={email}
                  onClick={() => quickLogin(email)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-white/5 hover:border-white/10 text-left"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    ${role === 'student' ? 'bg-blue-500/20 text-blue-400' : role === 'faculty' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{name}</p>
                    <p className="text-white/30 text-xs truncate">{email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize
                    ${role === 'student' ? 'badge-safe' : role === 'faculty' ? 'badge-approved' : 'badge-pending'}`}>
                    {role}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-center text-white/20 text-xs mt-3">Password: <span className="text-white/40">demo123</span></p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
