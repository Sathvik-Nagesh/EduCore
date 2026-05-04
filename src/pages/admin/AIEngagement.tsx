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
          { label: 'Total AI Queries', value: totalInteractions, color: '#7C3AED' },
          { label: 'Unique Students', value: uniqueStudents, color: '#2563EB' },
          { label: 'Top Subject', value: engagementData[0]?.count || 0, color: '#059669', suffix: ' queries' },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-6 border-slate-100 shadow-xl bg-white"
          >
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{metric.label}</div>
            <div className="font-heading text-3xl font-black tracking-tight" style={{ color: metric.color }}>
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
        className="card p-8 mb-6 border-slate-100 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center shadow-sm">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-black text-slate-900 uppercase tracking-tight">AI Diffusion Analytics</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Queries distributed by subject volume</p>
          </div>
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
        <h2 className="font-heading text-lg font-bold text-navy-800 mb-4">Recent AI Interactions</h2>
        <div className="space-y-2">
          {AI_INTERACTIONS.slice(-8).reverse().map((interaction, i) => (
            <motion.div
              key={interaction.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.04 }}
              className="flex items-center gap-4 p-4 rounded-3xl border border-slate-50 hover:border-slate-200 transition-all hover:shadow-xl bg-slate-50/30 hover:bg-white group"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Brain className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 text-sm font-black italic tracking-tight truncate leading-tight">"{interaction.query}"</p>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mt-1">{interaction.subjectName}</p>
              </div>
              <span className="text-slate-300 font-black text-[10px] uppercase tracking-[0.2em]">{new Date(interaction.createdAt).toLocaleDateString()}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </PageWrapper>
  )
}
