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
    color: '#4F8EF7'
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

const testimonials = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Dean of Engineering',
    text: 'EduCore has reduced our administrative overhead by 40% while significantly improving student engagement through the AI agent.'
  },
  {
    name: 'Arjun Mehta',
    role: 'Final Year Student',
    text: 'The attendance prediction feature is a lifesaver. It takes the stress out of managing my schedule during placement season.'
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
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])

  return (
    <div className="min-h-screen bg-navy text-white selection:bg-electric-blue/30 selection:text-white">
      {/* Background Layer */}
      <div className="fixed inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-navy/50 to-navy pointer-events-none" />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/5 bg-navy/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-blue to-emerald-500 flex items-center justify-center shadow-lg shadow-electric-blue/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">EduCore</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors">Features</a>
            <a href="#roles" className="text-sm text-white/50 hover:text-white transition-colors">Roles</a>
            <button 
              onClick={() => navigate('/login')}
              className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={targetRef} className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex flex-col justify-center">
        <motion.div style={{ opacity, scale }} className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-blue/10 border border-electric-blue/20 text-[10px] font-bold uppercase tracking-widest text-electric-blue mb-8"
          >
            <Sparkles className="w-3 h-3" />
            Now with Mistral-3.5 Study Agent
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight"
          >
            The Operating System for <span className="gradient-text">Modern Campus.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            A comprehensive, AI-integrated management platform for students, faculty, and administrators. Attendance, analytics, and intelligent study help — unified.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button 
              onClick={() => navigate('/login')}
              className="btn-primary px-8 py-4 text-base w-full sm:w-auto flex items-center justify-center gap-2 group"
            >
              Launch Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-semibold hover:bg-white/10 transition-all w-full sm:w-auto">
              View Case Study
            </button>
          </motion.div>
        </motion.div>

        {/* Floating elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-electric-blue/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 inset-x-0 flex flex-col items-center gap-2 opacity-30 pointer-events-none"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest">Scroll to explore</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">Intelligent from the ground up</h2>
            <p className="text-white/40 max-w-xl mx-auto">Leveraging state-of-the-art AI to transform every aspect of campus management and academic success.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-8 group hover:border-white/20 transition-all"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: `${feature.color}20`, border: `1px solid ${feature.color}40` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="font-heading text-lg font-bold mb-3">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Showcase */}
      <section id="roles" className="py-32 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="font-heading text-4xl md:text-6xl font-black mb-8">One Platform. <br/><span className="text-white/40">Different Perspectives.</span></h2>
              
              <div className="space-y-12">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-heading text-xl font-bold mb-2 text-blue-400">For Students</h4>
                    <p className="text-white/50 text-sm leading-relaxed">Stay safe with attendance prediction, use the study agent to prep for exams, and track your streaks to stay motivated.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-heading text-xl font-bold mb-2 text-emerald-400">For Faculty</h4>
                    <p className="text-white/50 text-sm leading-relaxed">Mark attendance in seconds, manage schedules without conflicts, and train the AI on your specific course material.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-heading text-xl font-bold mb-2 text-amber-400">For Administrators</h4>
                    <p className="text-white/50 text-sm leading-relaxed">Gain deep insights into campus engagement, automate timetable generation, and proactively support at-risk students.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/login')}
                className="btn-primary mt-12 px-8 py-4"
              >
                Choose Your Role
              </button>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/20 to-emerald-500/20" />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="w-full h-full rounded-2xl bg-navy/80 backdrop-blur-md border border-white/10 p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                      <div className="w-3 h-3 rounded-full bg-red-400/50" />
                      <div className="w-3 h-3 rounded-full bg-amber-400/50" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400/50" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="h-4 bg-white/5 rounded-full w-3/4" />
                      <div className="h-4 bg-white/5 rounded-full w-1/2" />
                      <div className="h-32 bg-white/5 rounded-2xl w-full" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-20 bg-white/5 rounded-2xl" />
                        <div className="h-20 bg-white/5 rounded-2xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-electric-blue/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* AI Deep Dive */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto card p-12 relative overflow-hidden border-electric-blue/20">
          <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/10 to-transparent -z-10" />
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-12 h-12 rounded-xl bg-electric-blue/20 flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-electric-blue" />
              </div>
              <h2 className="font-heading text-3xl font-bold mb-4">Meet your Study Partner.</h2>
              <p className="text-white/50 mb-8 leading-relaxed">
                EduCore AI isn't just a chatbot. It's an intelligent engine that understands your specific curriculum. Faculty upload PDFs, and the agent becomes a subject matter expert for that course instantly.
              </p>
              <ul className="space-y-3">
                {['24/7 Academic Support', 'Context-Aware Questioning', 'Instant Quiz Generation', 'Voice Command Support'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-navy/50 rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
                <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 text-xs text-white/70">
                  "Can you explain B-Trees and where they are used?"
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="bg-electric-blue/20 border border-electric-blue/30 rounded-2xl rounded-tr-none p-3 text-xs text-white/90 max-w-[80%]">
                  "B-Trees are self-balancing search trees. They are primarily used in **databases** and **file systems** because they handle large amounts of data efficiently with fewer disk reads..."
                </div>
                <div className="w-8 h-8 rounded-full bg-electric-blue flex-shrink-0 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-10 bg-white/5 border-white/5">
                <p className="text-xl italic text-white/80 mb-8 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-xl font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-white">{t.name}</h5>
                    <p className="text-xs text-white/30 uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 px-6 bg-white/[0.01]">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-center mb-16">Common Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How does the AI agent handle different subjects?', a: 'Faculty can upload PDF course materials for each subject. The AI agent uses RAG (Retrieval Augmented Generation) to ground its answers specifically in that content.' },
              { q: 'Is the attendance tracking real-time?', a: 'Yes. Once faculty marks attendance, the student and admin dashboards update instantly with new metrics and predictions.' },
              { q: 'Can we integrate with existing biometric systems?', a: 'EduCore is designed with an API-first approach, making it easy to sync with RFID, fingerprint, or facial recognition hardware.' }
            ].map((faq, i) => (
              <details key={i} className="group card p-6 cursor-pointer border-white/5 hover:border-white/10 transition-colors">
                <summary className="flex items-center justify-between font-semibold list-none">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 text-white/20 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-sm text-white/40 mt-4 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center card p-20 bg-gradient-to-br from-electric-blue/10 via-navy to-navy border-electric-blue/20">
          <h2 className="font-heading text-4xl md:text-6xl font-black mb-6">Ready to digitize <br/>your campus?</h2>
          <p className="text-white/40 mb-10 max-w-xl mx-auto text-lg">Join 20+ institutions already using EduCore to streamline their operations and empower their students.</p>
          <button 
            onClick={() => navigate('/login')}
            className="btn-primary px-12 py-5 text-lg shadow-2xl shadow-electric-blue/40"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-navy/80">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-electric-blue flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="font-heading font-bold text-xl text-white">EduCore</span>
              </div>
              <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                The next generation of campus management. Built with AI to empower educators and inspire students.
              </p>
            </div>
            <div>
              <h6 className="font-heading text-sm font-bold text-white mb-6 uppercase tracking-widest">Platform</h6>
              <ul className="space-y-4 text-sm text-white/40">
                <li><a href="#" className="hover:text-white transition-colors">Student Portal</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Faculty Suite</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Admin Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Study Agent</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-heading text-sm font-bold text-white mb-6 uppercase tracking-widest">Legal</h6>
              <ul className="space-y-4 text-sm text-white/40">
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/20">
            <p>© 2025 EduCore AI. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
