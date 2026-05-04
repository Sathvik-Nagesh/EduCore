import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import EngagementBar from '../../components/charts/EngagementBar'
import { AI_INTERACTIONS, getAIEngagementBySubject } from '../../lib/mockData'
import AnimatedCounter from '../../components/charts/AnimatedCounter'

interface AIEngagementPageProps {
  onLogout: () => void
}

export default function AIEngagementPage({ onLogout }: AIEngagementPageProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const engagementData = getAIEngagementBySubject()
  const totalInteractions = AI_INTERACTIONS.length
  const uniqueStudents = new Set(AI_INTERACTIONS.map(i => i.studentId)).size

  return (
    <PageWrapper
      role="admin"
      userName={user.name || 'Admin'}
      onLogout={onLogout}
      title="AI Engagement"
      subtitle="Student AI usage analytics across subjects"
    >
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total AI Queries', value: totalInteractions, color: '#8B5CF6' },
          { label: 'Unique Students', value: uniqueStudents, color: '#4F8EF7' },
          { label: 'Top Subject', value: engagementData[0]?.count || 0, color: '#10B981', suffix: ' queries' },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-5"
          >
            <div className="text-white/40 text-xs mb-2">{metric.label}</div>
            <div className="font-heading text-3xl font-bold" style={{ color: metric.color }}>
              <AnimatedCounter value={metric.value} suffix={metric.suffix} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-purple-400" />
          <h2 className="font-heading text-base font-semibold text-white">AI Queries by Subject</h2>
        </div>
        <EngagementBar data={engagementData} height={250} />
      </motion.div>

      {/* Recent Interactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-6"
      >
        <h2 className="font-heading text-base font-semibold text-white mb-4">Recent AI Interactions</h2>
        <div className="space-y-2">
          {AI_INTERACTIONS.slice(-8).reverse().map((interaction, i) => (
            <motion.div
              key={interaction.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.04 }}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">"{interaction.query}"</p>
                <p className="text-white/30 text-xs">{interaction.subjectName}</p>
              </div>
              <span className="text-white/20 text-xs">{new Date(interaction.createdAt).toLocaleDateString()}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </PageWrapper>
  )
}
