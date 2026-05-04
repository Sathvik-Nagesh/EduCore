import { motion } from 'framer-motion'
import PageWrapper from '../../components/layout/PageWrapper'
import TrendChart from '../../components/charts/TrendChart'
import EngagementBar from '../../components/charts/EngagementBar'
import { TREND_DATA, DEPARTMENT_ATTENDANCE, getAIEngagementBySubject } from '../../lib/mockData'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { AlertCircle, TrendingDown, Clock, Search } from 'lucide-react'

const ATTENDANCE_PATTERNS = [
  { id: 1, type: 'Time-based', pattern: 'Monday First Hour Avoidance', description: '42% drop in attendance for CSE-A Monday 9:00 AM slots over the last 4 weeks.', severity: 'High', action: 'Notify Faculty' },
  { id: 2, type: 'Subject-specific', pattern: 'Compiler Design Friday Afternoons', description: 'Consistent 30% absence rate for Friday 3:00 PM labs.', severity: 'Medium', action: 'Investigate' },
  { id: 3, type: 'Cohort', pattern: 'Lateral Entry Students', description: 'Overall 15% lower attendance rate compared to regular cohort in Mathematics IV.', severity: 'Medium', action: 'Schedule Mentorship' }
]

interface AnalyticsPageProps {
  onLogout: () => void
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card px-4 py-3 text-sm">
        <p className="text-white/60 mb-1">{label}</p>
        <p className="font-semibold text-white">{payload[0].value}% attendance</p>
      </div>
    )
  }
  return null
}

export default function AnalyticsPage({ onLogout }: AnalyticsPageProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const engagementData = getAIEngagementBySubject()

  return (
    <PageWrapper
      role="admin"
      userName={user.name || 'Admin'}
      onLogout={onLogout}
      title="Analytics"
      subtitle="Campus-wide attendance analytics and insights"
    >
      <div className="space-y-6">
        {/* Trend Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h2 className="font-heading text-base font-semibold text-white mb-4">
            Campus Attendance — Last 30 Days
          </h2>
          <TrendChart data={TREND_DATA} height={250} />
        </motion.div>

        {/* Attendance Pattern Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
          <h2 className="font-heading text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-purple-400" /> Attendance Pattern Analysis
          </h2>
          <p className="text-sm text-white/50 mb-4">AI-driven anomaly detection across schedules and cohorts.</p>
          <div className="space-y-3">
            {ATTENDANCE_PATTERNS.map((pattern) => (
              <div key={pattern.id} className="p-4 rounded-xl border border-white/8 bg-white/[0.02] flex items-start gap-4">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  pattern.severity === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {pattern.type === 'Time-based' ? <Clock className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white text-sm">{pattern.pattern}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      pattern.severity === 'High' ? 'border-red-500/30 text-red-400' : 'border-amber-500/30 text-amber-400'
                    }`}>{pattern.severity} Priority</span>
                  </div>
                  <p className="text-xs text-white/60 mb-2">{pattern.description}</p>
                </div>
                <button className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg border border-white/10 text-white/70 hover:bg-white/5 transition-colors">
                  {pattern.action}
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Department Comparison */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
          <h2 className="font-heading text-base font-semibold text-white mb-4">
            Department-wise Attendance
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DEPARTMENT_ATTENDANCE} margin={{ left: -20 }}>
              <XAxis dataKey="department" tick={{ fill: '#5A6479', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis domain={[50, 100]} tick={{ fill: '#5A6479', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="attendance" radius={[6, 6, 0, 0]}>
                {DEPARTMENT_ATTENDANCE.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.attendance >= 75 ? '#10B981' : entry.attendance >= 65 ? '#F59E0B' : '#EF4444'}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex gap-4 mt-2 text-xs text-white/40 justify-end">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />≥75%</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />65-74%</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />&lt;65%</span>
          </div>
        </motion.div>

        {/* AI Engagement */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
          <h2 className="font-heading text-base font-semibold text-white mb-4">AI Query Engagement by Subject</h2>
          <EngagementBar data={engagementData} height={200} />
          <p className="text-xs text-white/30 mt-3 text-right">
            Total AI interactions: {engagementData.reduce((s, d) => s + d.count, 0)}
          </p>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
