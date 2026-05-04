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
        <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-2xl bg-blue-50 border border-blue-200 w-fit shadow-sm">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-700 font-bold uppercase tracking-wider">Today is {TODAY}</span>
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
                    ? 'border-blue-500'
                    : 'border-navy-100'
                }`}>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isToday ? 'text-blue-600' : 'text-navy-300'}`}>
                    {day.slice(0, 3)}
                  </p>
                  {isToday && (
                    <div className="mx-auto mt-1 w-1.5 h-1.5 rounded-full bg-blue-600" />
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
                          className="rounded-xl p-2.5 text-[11px]"
                          style={{
                            background: isToday ? `${color}15` : `${color}08`,
                            border: `1px solid ${isToday ? color + '40' : color + '20'}`,
                            boxShadow: isToday ? `0 2px 8px ${color}10` : 'none',
                          }}
                        >
                          <p className="font-black text-navy-800 mb-1 truncate leading-tight">{slot.subject}</p>
                          <div className="flex items-center gap-1 text-navy-400 font-bold">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{slot.startTime}</span>
                          </div>
                          <div className="flex items-center gap-1 text-navy-300 font-bold mt-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            <span className="truncate">{slot.room}</span>
                          </div>
                        </motion.div>
                    )
                  })}
                  {daySlots.length === 0 && (
                    <div className="rounded-xl h-14 flex items-center justify-center bg-navy-50/50 border border-dashed border-navy-100">
                      <span className="text-[10px] font-black uppercase tracking-wider text-navy-200">Free</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap gap-4 border-t border-navy-100 pt-4">
          {Object.entries(SUBJECT_COLORS).map(([subject, color]) => (
            <div key={subject} className="flex items-center gap-2 text-[10px] text-navy-400 font-bold uppercase tracking-wider">
              <div className="w-2.5 h-2.5 rounded-sm shadow-sm" style={{ background: color }} />
              {subject}
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
