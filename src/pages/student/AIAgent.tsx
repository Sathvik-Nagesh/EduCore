import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import AIAgentModal from '../../components/ai/AIAgentModal'

interface AIPageProps {
  onLogout: () => void
}

export default function AIPage({ onLogout }: AIPageProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const [aiOpen, setAiOpen] = useState(true)

  return (
    <PageWrapper
      role="student"
      userName={user.name || 'Student'}
      onLogout={onLogout}
      title="AI Study Agent"
      subtitle="Your intelligent study companion"
    >
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-12 text-center max-w-md"
          style={{ border: '1px solid rgba(79,142,247,0.2)' }}
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(79,142,247,0.2), rgba(16,185,129,0.2))',
              border: '1px solid rgba(79,142,247,0.3)',
              boxShadow: '0 0 40px rgba(79,142,247,0.2)',
            }}
          >
            <Brain className="w-10 h-10 text-electric-blue" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-white mb-3">EduCore AI Study Agent</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            Powered by Mistral AI. Ask questions, get quizzed, request summaries —
            all grounded in your course material. Voice enabled.
          </p>
          <button
            onClick={() => setAiOpen(true)}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
            style={{ boxShadow: '0 0 30px rgba(79,142,247,0.4)' }}
          >
            <Brain className="w-5 h-5" />
            Open AI Study Agent
          </button>
        </motion.div>
      </div>

      <AIAgentModal isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </PageWrapper>
  )
}
