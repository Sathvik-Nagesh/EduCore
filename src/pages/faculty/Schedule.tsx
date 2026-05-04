import { motion } from 'framer-motion'
import PageWrapper from '../../components/layout/PageWrapper'
import { FACULTY_SCHEDULE } from '../../lib/mockData'
import { Clock, MapPin, Sparkles } from 'lucide-react'

interface SchedulePageProps { onLogout: () => void }

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SUBJECT_COLORS: Record<string, string> = {
  'DBMS': '#4F8EF7',
  'OS': '#10B981',
  'Data Structures': '#F59E0B',
  'Machine Learning': '#8B5CF6',
  'Computer Networks': '#EC4899',
}

// Get today's day name
const TODAY = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date())

export default function SchedulePage({ onLogout }: SchedulePageProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')

  return (
    <PageWrapper role="faculty" userName={user.name || 'Faculty'} onLogout={onLogout}
      title="My Schedule" subtitle="Weekly timetable — current semester">

      {/* Today banner */}
      {DAYS.includes(TODAY) && (
        <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-2xl bg-electric-blue/10 border border-electric-blue/20 w-fit">
          <Sparkles className="w-4 h-4 text-electric-blue" />
          <span className="text-sm text-electric-blue font-semibold">Today is {TODAY}</span>
        </div>
      )}

      <div className="card p-6">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {DAYS.map((day, i) => {
            const daySlots = FACULTY_SCHEDULE.filter(s => s.day === day)
            const isToday = day === TODAY
            return (
              <motion.div key={day}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                {/* Day header */}
                <div className={`text-center mb-3 pb-2 border-b transition-all ${
                  isToday
                    ? 'border-electric-blue/40'
                    : 'border-white/5'
                }`}>
                  <p className={`text-xs font-bold uppercase tracking-widest ${isToday ? 'text-electric-blue' : 'text-white/30'}`}>
                    {day.slice(0, 3)}
                  </p>
                  {isToday && (
                    <div className="mx-auto mt-1 w-1.5 h-1.5 rounded-full bg-electric-blue" />
                  )}
                </div>

                <div className="space-y-2 min-h-28">
                  {daySlots.map((slot, j) => {
                    const color = SUBJECT_COLORS[slot.subject] || '#4F8EF7'
                    return (
                      <motion.div key={j}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.07 + j * 0.04 }}
                        className="rounded-xl p-2.5 text-xs"
                        style={{
                          background: isToday ? `${color}25` : `${color}14`,
                          border: `1px solid ${isToday ? color + '50' : color + '28'}`,
                          boxShadow: isToday ? `0 0 12px ${color}18` : 'none',
                        }}
                      >
                        <p className="font-bold text-white mb-1 truncate">{slot.subject}</p>
                        <div className="flex items-center gap-1 text-white/40">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{slot.startTime}</span>
                        </div>
                        <div className="flex items-center gap-1 text-white/40 mt-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          <span className="truncate">{slot.room}</span>
                        </div>
                      </motion.div>
                    )
                  })}
                  {daySlots.length === 0 && (
                    <div className="rounded-xl h-14 flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.05)' }}>
                      <span className="text-[10px] text-white/15">Free</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap gap-4 border-t border-white/5 pt-4">
          {Object.entries(SUBJECT_COLORS).map(([subject, color]) => (
            <div key={subject} className="flex items-center gap-2 text-xs text-white/40">
              <div className="w-2.5 h-2.5 rounded" style={{ background: color }} />
              {subject}
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
