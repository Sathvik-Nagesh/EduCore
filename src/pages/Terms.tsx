import { motion } from 'framer-motion'
import { ArrowLeft, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Terms() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-navy text-white p-6 md:p-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </motion.button>

      <div className="max-w-3xl mx-auto card p-8 md:p-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-electric-blue/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-electric-blue" />
          </div>
          <h1 className="font-heading text-3xl font-bold">Terms & Conditions</h1>
        </div>

        <div className="space-y-6 text-white/60 leading-relaxed">
          <p>Last Updated: May 2025</p>
          
          <section>
            <h2 className="text-white font-bold text-xl mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the EduCore platform, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">2. User Accounts</h2>
            <p>Users are responsible for maintaining the confidentiality of their login credentials. Any activity under your account is your responsibility. EduCore reserves the right to suspend accounts for misuse.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">3. AI Usage Policy</h2>
            <p>The AI Study Agent is intended for educational assistance only. It should not be used for academic dishonesty or to generate prohibited content. EduCore is not liable for inaccuracies in AI-generated responses.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">4. Attendance Accuracy</h2>
            <p>While the platform provides predictive analytics, the official attendance record is maintained by the institution's primary database. Use the predictions as a guide, not a final guarantee.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">5. Intellectual Property</h2>
            <p>The platform's code, design, and trademark are the property of EduCore AI. Course materials uploaded remain the property of their respective owners.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
