import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, TrendingUp, AlertTriangle, CheckCircle, Brain } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import AttendanceRing from '../../components/charts/AttendanceRing'
import AnimatedCounter from '../../components/charts/AnimatedCounter'
import AIAgentModal from '../../components/ai/AIAgentModal'
import { useAttendance } from '../../hooks/useAttendance'
import { getMotivationalMessage } from '../../lib/predictions'

interface StudentDashboardProps {
  onLogout: () => void
}

function SkeletonCard() {
  return (
    <div className="card p-6 space-y-3">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-8 w-1/2" />
      <div className="skeleton h-3 w-full" />
    </div>
  )
}

export default function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const { attendance, overallPercentage, streak, loading } = useAttendance()
  const [aiOpen, setAiOpen] = useState(false)
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')

  const dangerSubjects = attendance.filter(s => s.status === 'danger')
  const warningSubjects = attendance.filter(s => s.status === 'warning')

  const statusColor: Record<string, string> = {
    safe: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  }

  const statusBg: Record<string, string> = {
    safe: 'rgba(16,185,129,0.08)',
    warning: 'rgba(245,158,11,0.08)',
    danger: 'rgba(239,68,68,0.08)',
  }

  return (
    <PageWrapper
      role="student"
      userName={user.name || 'Student'}
      onLogout={onLogout}
      title="Student Dashboard"
      subtitle="Track your attendance and academic progress"
    >
      {/* Motivational Banner */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl flex items-center gap-3"
          style={{
            background: overallPercentage >= 75
              ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))'
              : 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))',
            border: `1px solid ${overallPercentage >= 75 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}
        >
          {overallPercentage >= 75
            ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            : <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          }
          <p className="text-sm text-white/80">{getMotivationalMessage(overallPercentage)}</p>
        </motion.div>
      )}

      {/* Top Section: Ring + Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Overall Ring */}
        <div className="card p-8 flex items-center justify-center md:col-span-1">
          {loading ? (
            <div className="skeleton w-44 h-44 rounded-full" />
          ) : (
            <AttendanceRing percentage={overallPercentage} />
          )}
        </div>

        {/* Quick Stats */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              {/* Streak */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="text-white/50 text-sm">Current Streak</span>
                </div>
                <div className="font-heading text-4xl font-bold text-white">
                  <AnimatedCounter value={streak} suffix=" 🔥" />
                </div>
                <p className="text-xs text-white/30 mt-1">consecutive days</p>
              </motion.div>

              {/* Safe Subjects */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-white/50 text-sm">Safe Subjects</span>
                </div>
                <div className="font-heading text-4xl font-bold text-emerald-400">
                  <AnimatedCounter value={attendance.filter(s => s.status === 'safe').length} />
                </div>
                <p className="text-xs text-white/30 mt-1">above 75%</p>
              </motion.div>

              {/* At Risk */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-white/50 text-sm">At Risk</span>
                </div>
                <div className="font-heading text-4xl font-bold text-red-400">
                  <AnimatedCounter value={dangerSubjects.length} />
                </div>
                <p className="text-xs text-white/30 mt-1">below 65%</p>
              </motion.div>

              {/* Classes Attended */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card p-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-white/50 text-sm">Classes Attended</span>
                </div>
                <div className="font-heading text-4xl font-bold text-blue-400">
                  <AnimatedCounter
                    value={attendance.reduce((s, a) => s + a.attended, 0)}
                  />
                </div>
                <p className="text-xs text-white/30 mt-1">
                  of {attendance.reduce((s, a) => s + a.total, 0)} total
                </p>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Subject Attendance Table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-lg font-semibold text-white">Subject-wise Attendance</h2>
          <span className="text-xs text-white/30">Remaining classes: 20</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {attendance.map((subject, i) => (
              <motion.div
                key={subject.subjectId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl p-4 flex items-center gap-4"
                style={{
                  background: statusBg[subject.status],
                  border: `1px solid ${statusColor[subject.status]}20`,
                }}
              >
                {/* Subject info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{subject.code}</span>
                    <span className="text-white/30 text-xs truncate">{subject.subjectName}</span>
                  </div>
                  <p className="text-xs text-white/40 truncate">{subject.prediction}</p>
                </div>

                {/* Progress bar */}
                <div className="hidden md:block w-32">
                  <div className="h-1.5 rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: statusColor[subject.status] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${subject.percentage}%` }}
                      transition={{ duration: 0.8, delay: i * 0.08 + 0.2 }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div
                    className="font-heading text-xl font-bold"
                    style={{ color: statusColor[subject.status] }}
                  >
                    {subject.percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-white/30">
                    {subject.attended}/{subject.total}
                  </div>
                </div>

                {/* Badge */}
                <span className={`badge-${subject.status} flex-shrink-0`}>
                  {subject.status === 'safe' ? '🟢 Safe' : subject.status === 'warning' ? '🟡 Warning' : '🔴 Danger'}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* AI Agent Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setAiOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white font-semibold text-sm shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #4F8EF7, #10B981)',
          boxShadow: '0 0 30px rgba(79,142,247,0.5)',
        }}
      >
        <Brain className="w-5 h-5" />
        Ask EduCore AI
      </motion.button>

      <AIAgentModal isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </PageWrapper>
  )
}
