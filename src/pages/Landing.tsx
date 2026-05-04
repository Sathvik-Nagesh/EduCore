import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  GraduationCap, ArrowRight, BookOpen, Users, Shield, 
  Brain, Zap, BarChart3, Clock, CheckCircle2, 
  MessageSquare, Layout, Sparkles, ChevronDown 
} from 'lucide-react'
import { useRef } from 'react'

const features = [
  {
    title: 'AI Study Agent',
    description: 'Personalized learning assistant trained on your course syllabus. Ask questions, generate quizzes, and simplify complex topics.',
    icon: Brain,
    color: '#8B5CF6'
  },
  {
    title: 'Smart Attendance',
    description: 'Visual tracking with predictive analytics. Know exactly how many classes you can skip while staying above detention limits.',
    icon: Clock,
    color: '#3B82F6'
  },
  {
    title: 'Automated Timetable',
    description: 'Greedy constraint-based scheduling that eliminates faculty conflicts and optimizes classroom utilization automatically.',
    icon: Layout,
    color: '#10B981'
  },
  {
    title: 'Engagement Analytics',
    description: 'Real-time dashboards for admins to monitor campus health, identify at-risk students, and track AI interactions.',
    icon: BarChart3,
    color: '#F59E0B'
  }
]

export default function Landing() {
  const navigate = useNavigate()
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Background Layer */}
      <div className="fixed inset-0 bg-grid-faint opacity-50 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white pointer-events-none" />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-slate-200 bg-white/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-200">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-black text-2xl tracking-tighter text-slate-900">EduCore</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium">
            <a href="#features" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Features</a>
            <a href="#roles" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Roles</a>
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 hover:bg-slate-100 transition-all active:scale-[0.98]"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={targetRef} className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex flex-col justify-center items-center">
        <motion.div style={{ opacity, scale }} className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-10"
          >
            <Sparkles className="w-3 h-3" />
            Next-Gen Campus Intelligence
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="font-heading text-6xl md:text-[92px] font-black mb-10 leading-[1.05] tracking-tight text-slate-900"
          >
            The Operating System for <br/> <span className="gradient-text">Modern Education.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-14 leading-relaxed font-medium"
          >
            A unified platform integrating predictive attendance, automated scheduling, and syllabus-trained AI agents for the smart campus of tomorrow.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
          >
            <button 
              onClick={() => navigate('/login')}
              className="btn-primary px-10 py-5 text-lg w-full sm:w-auto flex items-center justify-center gap-2 group shadow-2xl shadow-blue-200"
            >
              Get Started Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-5 rounded-2xl bg-white border border-slate-200 text-lg font-bold text-slate-900 hover:bg-slate-50 transition-all w-full sm:w-auto shadow-sm">
              Learn More
            </button>
          </motion.div>
        </motion.div>

        {/* Centered Scroll to explore */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4, y: [0, 12, 0] }}
            transition={{ opacity: { delay: 1 }, y: { duration: 2, repeat: Infinity } }}
            className="flex flex-col items-center gap-3"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] ml-1 text-slate-900">Explore</span>
            <ChevronDown className="w-5 h-5 text-slate-900" />
          </motion.div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-100/50 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '3s' }} />
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-40 px-6 relative bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="font-heading text-4xl md:text-6xl font-black mb-6 tracking-tight text-slate-900">Built for Performance.</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">Leveraging state-of-the-art AI and data visualization to transform every aspect of campus management.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-10 group bg-white border-slate-200 hover:border-blue-300 transition-all hover:-translate-y-2 duration-500 shadow-sm"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner"
                  style={{ background: `${feature.color}10`, border: `1px solid ${feature.color}20` }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="font-heading text-xl font-bold mb-4 text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Showcase */}
      <section id="roles" className="py-40 px-6 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="font-heading text-5xl md:text-7xl font-black mb-10 leading-[1.1] text-slate-900">One Solution. <br/><span className="text-slate-200">Three Views.</span></h2>
              
              <div className="space-y-14">
                {[
                  { icon: BookOpen, title: 'For Students', text: 'Stay safe with attendance prediction, use the study agent to prep for exams, and track streaks.', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { icon: Users, title: 'For Faculty', text: 'Mark attendance in seconds, manage schedules without conflicts, and train AI on course material.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { icon: Shield, title: 'For Admins', text: 'Gain deep insights into campus engagement, automate timetable generation, and support at-risk students.', color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((role, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className={`w-14 h-14 rounded-2xl ${role.bg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-500 shadow-sm border border-black/5`}>
                      <role.icon className={`w-7 h-7 ${role.color}`} />
                    </div>
                    <div>
                      <h4 className={`font-heading text-2xl font-black mb-3 ${role.color} tracking-tight`}>{role.title}</h4>
                      <p className="text-slate-500 text-lg leading-relaxed font-medium">{role.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group">
              <div className="aspect-[4/3] rounded-[40px] overflow-hidden border border-slate-200 shadow-2xl relative group-hover:scale-[1.02] transition-transform duration-700">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5" />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <div className="w-full h-full rounded-3xl bg-white border border-slate-100 p-10 flex flex-col gap-6 shadow-2xl">
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
                      <div className="w-4 h-4 rounded-full bg-red-100" />
                      <div className="w-4 h-4 rounded-full bg-amber-100" />
                      <div className="w-4 h-4 rounded-full bg-emerald-100" />
                      <div className="flex-1" />
                      <div className="w-24 h-4 bg-slate-50 rounded-full" />
                    </div>
                    <div className="flex-1 space-y-6">
                      <div className="h-6 bg-slate-100 rounded-full w-3/4 animate-pulse" />
                      <div className="h-6 bg-slate-100 rounded-full w-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
                      <div className="h-48 bg-slate-50 rounded-[32px] w-full" />
                      <div className="grid grid-cols-2 gap-6">
                        <div className="h-28 bg-slate-50 rounded-[32px]" />
                        <div className="h-28 bg-slate-50 rounded-[32px]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-100/50 rounded-full blur-[100px] group-hover:bg-blue-100/80 transition-colors duration-700" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-100/50 rounded-full blur-[100px] group-hover:bg-emerald-100/80 transition-colors duration-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-6 border-t border-slate-100 bg-slate-50 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-8 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading font-black text-3xl text-slate-900 tracking-tighter">EduCore</span>
            </div>
            <p className="text-slate-500 max-w-sm font-medium">The future of campus management is here. Join the movement.</p>
          </div>
          <div className="flex justify-center gap-10 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            <a href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
