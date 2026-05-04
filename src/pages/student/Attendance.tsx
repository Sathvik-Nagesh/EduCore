import { motion } from 'framer-motion'
import PageWrapper from '../../components/layout/PageWrapper'
import { useAttendance } from '../../hooks/useAttendance'
import { calculateSkippableClasses, classesNeededToReach } from '../../lib/predictions'
import AnimatedCounter from '../../components/charts/AnimatedCounter'
import { Shield, TrendingUp } from 'lucide-react'

interface AttendancePageProps {
  onLogout: () => void
}

export default function AttendancePage({ onLogout }: AttendancePageProps) {
  const { attendance, loading } = useAttendance()
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')

  const statusColor: Record<string, string> = {
    safe: '#10B981', warning: '#F59E0B', danger: '#EF4444',
  }

  return (
    <PageWrapper
      role="student"
      userName={user.name || 'Student'}
      onLogout={onLogout}
      title="Attendance Details"
      subtitle="Subject-wise breakdown and predictions"
    >
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {attendance.map((subject, i) => {
            const skippable = calculateSkippableClasses(subject.attended, subject.total)
            const needed = classesNeededToReach(subject.attended, subject.total, 20)
            const color = statusColor[subject.status]

            return (
              <motion.div
                key={subject.subjectId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card p-6"
                style={{ borderColor: `${color}20` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-white text-lg">{subject.code}</span>
                      <span className={`badge-${subject.status}`}>
                        {subject.status === 'safe' ? '🟢' : subject.status === 'warning' ? '🟡' : '🔴'} {subject.status}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">{subject.subjectName}</p>
                  </div>
                  <span className="font-heading text-3xl font-bold" style={{ color }}>
                    <AnimatedCounter value={subject.percentage} suffix="%" decimals={1} />
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-white/10 mb-4">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${subject.percentage}%` }}
                    transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 rounded-xl bg-white/3">
                    <div className="font-semibold text-white">{subject.attended}</div>
                    <div className="text-xs text-white/30">Attended</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/3">
                    <div className="font-semibold text-white">{subject.total}</div>
                    <div className="text-xs text-white/30">Total</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/3">
                    <div className="font-semibold text-white">{subject.total - subject.attended}</div>
                    <div className="text-xs text-white/30">Absent</div>
                  </div>
                </div>

                {/* Prediction */}
                <div className="rounded-xl p-3 text-xs" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
                  <p className="text-white/70">{subject.prediction}</p>
                </div>

                {/* Action stats */}
                <div className="flex gap-3 mt-3">
                  {subject.status === 'safe' && skippable > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <Shield className="w-3 h-3" />
                      Can skip {skippable} more class{skippable !== 1 ? 'es' : ''}
                    </div>
                  )}
                  {subject.status !== 'safe' && needed > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400">
                      <TrendingUp className="w-3 h-3" />
                      Need {needed} consecutive classes to reach 75%
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </PageWrapper>
  )
}
