import { motion } from 'framer-motion'
import { Brain, Sparkles } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import { AI_INTERACTIONS as MOCK_INTERACTIONS } from '../../lib/mockData'
import { getAIStats } from '../../lib/supabase'
import AnimatedCounter from '../../components/charts/AnimatedCounter'
import { useEffect, useState } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface AIEngagementPageProps {
  onLogout: () => void
}

export default function AIEngagementPage({ onLogout }: AIEngagementPageProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const [interactions, setInteractions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getAIStats().then(data => {
      if (data && data.length > 0) {
        setInteractions(data)
      } else {
        // If DB is empty, show mock data for demo
        setInteractions(MOCK_INTERACTIONS)
      }
      setIsLoading(false)
    }).catch(() => {
      setInteractions(MOCK_INTERACTIONS)
      setIsLoading(false)
    })
  }, [])

  // Process data
  const totalInteractions = interactions.length
  const uniqueStudents = new Set(interactions.map(i => i.student_id || i.studentId)).size
  
  const subjectMap: Record<string, number> = {}
  interactions.forEach(i => {
    // Robust mapping for both real DB objects and mock data
    const sname = i.subjects?.name || i.subjectName || i.subject || 'General'
    subjectMap[sname] = (subjectMap[sname] || 0) + 1
  })
  const engagementData = Object.entries(subjectMap)
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count)

  return (
    <PageWrapper
      role="admin"
      userName={user.name || 'Admin'}
      onLogout={onLogout}
      title="AI Engagement"
      subtitle="Student AI usage analytics across subjects"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-8 h-8 border-4 border-slate-100 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading AI Analytics…</p>
        </div>
      ) : (
        <>
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

          {/* Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-8 mb-6 border-slate-100 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-slate-900 uppercase tracking-tight">Neural Activity Timeline</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Cumulative AI query flow over 7-day window</p>
              </div>
            </div>
            {(() => {
              // Build 7-day timeline from interactions
              const days: Record<string, number> = {}
              for (let i = 6; i >= 0; i--) {
                const d = new Date(); d.setDate(d.getDate() - i)
                const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                days[key] = 0
              }
              interactions.forEach(ix => {
                const d = new Date(ix.created_at || ix.createdAt)
                const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                if (days[key] !== undefined) days[key]++
              })
              const chartData = Object.entries(days).map(([day, count]) => ({ day, count }))
              return (
                <div className="relative" style={{ height: '220px', minHeight: '0' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 900 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 900 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: 'white', border: '1px solid #F1F5F9', borderRadius: 12, fontSize: 11, fontWeight: 800 }} />
                      <Area type="monotone" dataKey="count" name="AI Queries" stroke="#7C3AED" strokeWidth={3}
                        fill="url(#aiGrad)" dot={{ r: 5, fill: '#7C3AED', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )
            })()}
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
              {interactions.slice(0, 8).map((interaction, i) => (
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
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mt-1">{interaction.subjects?.name || interaction.subjectName || 'General'}</p>
                  </div>
                  <span className="text-slate-300 font-black text-[10px] uppercase tracking-[0.2em]">{new Date(interaction.created_at || interaction.createdAt).toLocaleDateString()}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </PageWrapper>
  )
}
