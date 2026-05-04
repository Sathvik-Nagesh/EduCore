import { motion } from 'framer-motion'
import PageWrapper from '../../components/layout/PageWrapper'
import { FACULTY_SCHEDULE } from '../../lib/mockData'
import { Clock, MapPin } from 'lucide-react'

interface SchedulePageProps {
  onLogout: () => void
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SUBJECT_COLORS: Record<string, string> = {
  'DBMS': '#4F8EF7',
  'OS': '#10B981',
  'Data Structures': '#F59E0B',
  'Machine Learning': '#8B5CF6',
  'Computer Networks': '#EC4899',
}

export default function SchedulePage({ onLogout }: SchedulePageProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')

  return (
    <PageWrapper
      role="faculty"
      userName={user.name || 'Faculty'}
      onLogout={onLogout}
      title="My Schedule"
      subtitle="Weekly timetable — current semester"
    >
      <div className="card p-6">
        <div className="grid grid-cols-6 gap-3">
          {DAYS.map((day, i) => {
            const daySlots = FACULTY_SCHEDULE.filter(s => s.day === day)
            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="text-center mb-3">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">{day.slice(0, 3)}</p>
                </div>
                <div className="space-y-2 min-h-32">
                  {daySlots.map((slot, j) => {
                    const color = SUBJECT_COLORS[slot.subject] || '#4F8EF7'
                    return (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 + j * 0.05 }}
                        className="rounded-xl p-2.5 text-xs"
                        style={{
                          background: `${color}18`,
                          border: `1px solid ${color}30`,
                        }}
                      >
                        <p className="font-semibold text-white mb-1">{slot.subject}</p>
                        <div className="flex items-center gap-1 text-white/40">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{slot.startTime}</span>
                        </div>
                        <div className="flex items-center gap-1 text-white/40">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{slot.room} · {slot.section}</span>
                        </div>
                      </motion.div>
                    )
                  })}
                  {daySlots.length === 0 && (
                    <div className="rounded-xl h-16 flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.05)' }}>
                      <span className="text-xs text-white/15">Free</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 border-t border-white/5 pt-4">
          {Object.entries(SUBJECT_COLORS).slice(0, 2).map(([subject, color]) => (
            <div key={subject} className="flex items-center gap-2 text-xs text-white/50">
              <div className="w-3 h-3 rounded" style={{ background: color }} />
              {subject}
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
