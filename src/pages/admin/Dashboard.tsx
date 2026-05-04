import { motion } from 'framer-motion'
import { Users, TrendingUp, UserCheck, Bot, Brain, ShieldAlert } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import AnimatedCounter from '../../components/charts/AnimatedCounter'
import TrendChart from '../../components/charts/TrendChart'
import EngagementBar from '../../components/charts/EngagementBar'
import { CAMPUS_METRICS, TREND_DATA, getAIEngagementBySubject, AT_RISK_STUDENTS } from '../../lib/mockData'
import { getAttendanceStatus, getStatusColor } from '../../lib/predictions'

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const engagementData = getAIEngagementBySubject()

  const metrics = [
    { label: 'Total Students', value: CAMPUS_METRICS.totalStudents, icon: Users, color: '#4F8EF7', suffix: '' },
    { label: 'Campus Attendance', value: CAMPUS_METRICS.campusAttendanceToday, icon: TrendingUp, color: '#10B981', suffix: '%' },
    { label: 'Faculty Present', value: CAMPUS_METRICS.facultyPresentToday, icon: UserCheck, color: '#F59E0B', suffix: '' },
    { label: 'AI Sessions Today', value: CAMPUS_METRICS.aiSessionsToday, icon: Bot, color: '#8B5CF6', suffix: '' },
  ]

  const atRiskCount = AT_RISK_STUDENTS.length

  return (
    <PageWrapper
      role="admin"
      userName={user.name || 'Admin'}
      onLogout={onLogout}
      title="Admin Dashboard"
      subtitle="Campus-wide overview and analytics"
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-6 relative overflow-hidden group"
          >
            {/* Background glow */}
            <div
              className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
              style={{ background: metric.color }}
            />
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <metric.icon className="w-4 h-4" style={{ color: metric.color }} />
              <span className="text-white/40 text-xs">{metric.label}</span>
            </div>
            <div className="font-heading text-4xl font-bold relative z-10" style={{ color: metric.color }}>
              <AnimatedCounter value={metric.value} suffix={metric.suffix} duration={1800} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* At-Risk Alert */}
      {atRiskCount > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 p-4 rounded-2xl flex items-center gap-3"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">
            <strong className="text-red-400">{atRiskCount} students</strong> are below 75% attendance and may face detention.
            <a href="/admin/at-risk" className="ml-2 underline text-red-400/70 hover:text-red-400">View list →</a>
          </p>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <h2 className="font-heading text-base font-semibold text-white mb-4">30-Day Attendance Trend</h2>
          <TrendChart data={TREND_DATA} height={200} />
        </motion.div>

        {/* AI Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-purple-400" />
            <h2 className="font-heading text-base font-semibold text-white">AI Engagement by Subject</h2>
          </div>
          <EngagementBar data={engagementData} height={200} />
        </motion.div>

        {/* Recent At-Risk Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-6 md:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-base font-semibold text-white">At-Risk Students Preview</h2>
            <a href="/admin/at-risk" className="text-xs text-electric-blue hover:underline">View all →</a>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {AT_RISK_STUDENTS.slice(0, 4).map((student, i) => {
              const status = getAttendanceStatus(student.attendance)
              const color = getStatusColor(status)
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                    style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{student.name}</p>
                    <p className="text-white/40 text-xs">{student.subject}</p>
                  </div>
                  <span className="font-heading font-bold text-sm" style={{ color }}>
                    {student.attendance}%
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
