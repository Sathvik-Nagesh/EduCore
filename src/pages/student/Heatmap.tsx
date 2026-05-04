import { motion } from 'framer-motion'
import PageWrapper from '../../components/layout/PageWrapper'
import AttendanceHeatmap from '../../components/charts/AttendanceHeatmap'
import { useAttendance } from '../../hooks/useAttendance'

interface HeatmapPageProps {
  onLogout: () => void
}

export default function HeatmapPage({ onLogout }: HeatmapPageProps) {
  const { attendance, heatmapData, loading } = useAttendance()
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')

  const statusColor: Record<string, string> = {
    safe: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  }

  return (
    <PageWrapper
      role="student"
      userName={user.name || 'Student'}
      onLogout={onLogout}
      title="Attendance Heatmap"
      subtitle="Visualize your attendance patterns"
    >
      {/* Weekly Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-lg font-black text-slate-900 uppercase tracking-tight">
            Daily Attendance — Last 12 Weeks
          </h2>
          <div className="flex items-center gap-4 text-xs text-slate-400 font-black uppercase tracking-widest">
            <span>Engagement patterns</span>
          </div>
        </div>
        {loading ? (
          <div className="skeleton h-48 rounded-xl" />
        ) : (
          <AttendanceHeatmap data={heatmapData} />
        )}
      </motion.div>

      {/* Subject Weakness Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h2 className="font-heading text-lg font-black text-slate-900 mb-6">
          Subject Attendance Breakdown
        </h2>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-12 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {[...attendance].sort((a, b) => a.percentage - b.percentage).map((subject, i) => (
              <motion.div
                key={subject.subjectId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4"
              >
                {/* Label */}
                <div className="w-12 text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subject.code}</span>
                </div>

                {/* Bar */}
                <div className="flex-1 h-6 rounded-lg overflow-hidden bg-slate-100 relative shadow-inner">
                  <motion.div
                    className="h-full rounded-lg flex items-center pl-2"
                    style={{ background: statusColor[subject.status] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${subject.percentage}%` }}
                    transition={{ duration: 1, delay: i * 0.1 + 0.2, ease: 'easeOut' }}
                  >
                    <span className="text-slate-900 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                      {subject.attended}/{subject.total} classes
                    </span>
                  </motion.div>
                </div>

                {/* Percentage */}
                <div className="w-14 text-right">
                  <span
                    className="text-sm font-bold font-heading"
                    style={{ color: statusColor[subject.status] }}
                  >
                    {subject.percentage.toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            Safe
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            Warning
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            Danger
          </span>
        </div>
      </motion.div>
    </PageWrapper>
  )
}
