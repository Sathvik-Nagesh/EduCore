import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, ArrowRight, BookOpen, Users, Shield } from 'lucide-react'

const roles = [
  {
    title: 'Student',
    description: 'Track attendance, get AI-powered study help, monitor your academic progress',
    icon: BookOpen,
    color: '#4F8EF7',
    glow: 'rgba(79,142,247,0.3)',
    gradient: 'from-blue-500/20 to-blue-600/5',
    border: 'border-blue-500/20',
  },
  {
    title: 'Faculty',
    description: 'Mark attendance, manage your schedule, apply for leaves, upload course material',
    icon: Users,
    color: '#10B981',
    glow: 'rgba(16,185,129,0.3)',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    border: 'border-emerald-500/20',
  },
  {
    title: 'Admin',
    description: 'Campus analytics, at-risk monitoring, AI engagement, and timetable generation',
    icon: Shield,
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.3)',
    gradient: 'from-amber-500/20 to-amber-600/5',
    border: 'border-amber-500/20',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen bg-navy relative overflow-hidden flex flex-col"
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-grid opacity-100" />

      {/* Glow orbs */}
      <div
        className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4F8EF7 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-8 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }}
      />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4F8EF7, #10B981)' }}
          >
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading text-white font-bold text-xl">EduCore</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="btn-primary text-sm"
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20"
      >
        <motion.div variants={itemVariants} className="mb-4">
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-full border"
            style={{
              color: '#4F8EF7',
              borderColor: 'rgba(79,142,247,0.3)',
              background: 'rgba(79,142,247,0.08)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            🎓 Campus Management Platform
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-heading text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6"
        >
          Your Campus.{' '}
          <span className="gradient-text">Reimagined.</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-white/50 max-w-2xl leading-relaxed mb-10"
        >
          AI-powered attendance tracking, real-time analytics, and an intelligent
          study agent — all in one unified platform built for the modern campus.
        </motion.p>

        <motion.div variants={itemVariants} className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => navigate('/login')}
            className="btn-primary flex items-center gap-2 text-base px-8 py-3"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-ghost text-base px-8 py-3"
          >
            Explore Roles
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="mt-16 flex gap-12 text-center"
        >
          {[
            { value: '847', label: 'Students' },
            { value: '23', label: 'Faculty' },
            { value: '95%', label: 'Satisfaction' },
            { value: 'AI', label: 'Powered' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="font-heading text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/30 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Role Cards */}
      <div id="roles" className="relative z-10 px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-heading text-3xl font-bold text-white mb-3">Three Roles, One Platform</h2>
          <p className="text-white/40">Tailored experiences for every campus stakeholder</p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {roles.map((role, i) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => navigate('/login')}
              className={`card cursor-pointer p-8 relative overflow-hidden group`}
              style={{
                background: `linear-gradient(135deg, var(--charcoal), #13162A)`,
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ background: `radial-gradient(circle at top left, ${role.glow}, transparent 60%)` }}
              />

              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 relative z-10"
                style={{ background: `rgba(${role.color.replace('#', '').match(/.{2}/g)?.map(h => parseInt(h, 16)).join(',')},0.15)`, border: `1px solid ${role.color}30` }}
              >
                <role.icon className="w-6 h-6" style={{ color: role.color }} />
              </div>

              <h3 className="font-heading text-xl font-bold text-white mb-2 relative z-10">{role.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed relative z-10">{role.description}</p>

              <div
                className="mt-6 flex items-center gap-2 text-sm font-medium relative z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: role.color }}
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-6 border-t border-white/5">
        <p className="text-xs text-white/20">EduCore © 2025 · Built for the future of education</p>
      </div>
    </div>
  )
}
