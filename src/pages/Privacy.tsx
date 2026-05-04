import { motion } from 'framer-motion'
import { ArrowLeft, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Privacy() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-white text-slate-900 p-6 md:p-20 relative overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      <div className="absolute inset-0 bg-grid-faint opacity-50 pointer-events-none" />
      
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors mb-12"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </motion.button>

      <div className="max-w-3xl mx-auto card bg-white border border-slate-200 shadow-2xl p-8 md:p-12 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="font-heading text-3xl font-bold">Privacy Policy</h1>
        </div>

        <div className="space-y-6 text-slate-600 leading-relaxed font-medium">
          <p>Last Updated: May 2025</p>
          
          <section>
            <h2 className="text-slate-900 font-bold text-xl mb-3">1. Information We Collect</h2>
            <p>EduCore collects basic user information (name, email, role) to provide a personalized campus experience. We also collect attendance data and AI interaction logs to improve our academic support algorithms.</p>
          </section>

          <section>
            <h2 className="text-slate-900 font-bold text-xl mb-3">2. How We Use Data</h2>
            <p>Your data is used to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Track academic progress and attendance.</li>
              <li>Personalize the AI Study Agent's responses.</li>
              <li>Provide administrative analytics for institutional growth.</li>
              <li>Maintain session persistence and security.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-slate-900 font-bold text-xl mb-3">3. AI and Content</h2>
            <p>Interactions with the AI agent are used to improve the model's accuracy but are kept confidential within the institution's scope. We do not sell your academic data to third-party advertisers.</p>
          </section>

          <section>
            <h2 className="text-slate-900 font-bold text-xl mb-3">4. Cookies</h2>
            <p>We use essential cookies to maintain your login session. Analytical cookies are used to track feature engagement and platform performance.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
