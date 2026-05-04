import { motion } from 'framer-motion'
import PageWrapper from '../../components/layout/PageWrapper'
import TrendChart from '../../components/charts/TrendChart'
import EngagementBar from '../../components/charts/EngagementBar'
import { TREND_DATA, DEPARTMENT_ATTENDANCE, getAIEngagementBySubject } from '../../lib/mockData'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'

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
