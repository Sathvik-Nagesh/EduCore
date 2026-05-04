import { motion } from 'framer-motion'
import { format, parseISO, getDay } from 'date-fns'
import type { DailyAttendance } from '../../lib/mockData'

interface AttendanceHeatmapProps {
  data: DailyAttendance[]
}

function getHeatColor(percentage: number): string {
  if (percentage === -1) return 'transparent'
  if (percentage === 0) return '#F1F5F9'
  if (percentage >= 85) return '#10B981'
  if (percentage >= 70) return '#34D399'
  if (percentage >= 50) return '#FCD34D'
  if (percentage >= 30) return '#F87171'
  return '#EF4444'
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AttendanceHeatmap({ data }: AttendanceHeatmapProps) {
  const weeks: DailyAttendance[][] = []
  let currentWeek: DailyAttendance[] = []

  if (data.length > 0) {
    const firstDay = getDay(parseISO(data[0].date))
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push({ date: '', percentage: -1, present: false })
    }
  }

  for (const d of data) {
    currentWeek.push(d)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', percentage: -1, present: false })
    }
    weeks.push(currentWeek)
  }

  return (
    <div className="overflow-x-auto pb-1 scrollbar-hide">
      <div className="inline-block p-2">
        {/* Month Labels */}
        <div className="flex gap-[16px] mb-6 pl-14">
          {weeks.map((week, i) => {
            const date = week.find(d => d.date !== '')?.date
            const currentMonth = date ? format(parseISO(date), 'MMM') : ''
            const prevWeekDate = i > 0 ? weeks[i-1].find(d => d.date !== '')?.date : null
            const prevMonth = prevWeekDate ? format(parseISO(prevWeekDate), 'MMM') : ''
            
            const shouldShow = i === 0 || (currentMonth !== prevMonth && currentMonth !== '')
            
            return (
              <div key={i} className="w-10 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                {shouldShow ? currentMonth : ''}
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-[16px]">
          {DAY_LABELS.map((day, dayIndex) => (
            <div key={day} className="flex gap-[16px] items-center">
              <div className="w-14 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right pr-6">
                {dayIndex % 2 === 1 ? day : ''}
              </div>
              {weeks.map((week, weekIndex) => {
                const cell = week[dayIndex]
                const color = getHeatColor(cell?.percentage ?? -1)
                
                return (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: (weekIndex * 0.005) + (dayIndex * 0.002),
                      duration: 0.2
                    }}
                    className="w-10 h-10 rounded-2xl shadow-sm relative group cursor-help transition-all hover:scale-125 active:scale-90 z-10 border border-slate-100/10"
                    style={{ backgroundColor: color }}
                  >
                    {cell && cell.percentage !== -1 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-5 py-3 bg-white text-slate-900 text-[10px] font-bold rounded-2xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50 pointer-events-none shadow-2xl border border-slate-100 translate-y-1 group-hover:translate-y-0">
                        <div className="text-slate-400 font-black uppercase tracking-widest text-[8px] mb-1.5">{format(parseISO(cell.date), 'EEEE, MMM dd')}</div>
                        <div className="text-sm font-black tracking-tight">{cell.percentage > 0 ? `${cell.percentage}% Participation` : 'No Classes'}</div>
                        {cell.percentage > 0 && <div className={`text-[9px] font-black uppercase mt-1.5 ${cell.present ? 'text-emerald-600' : 'text-red-600'}`}>
                          {cell.present ? 'Status: Verified Present' : 'Status: Recorded Absent'}
                        </div>}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-8 justify-end">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Engagement Low</span>
          <div className="flex gap-[4px]">
            {[0, 30, 50, 70, 90].map(p => (
              <div 
                key={p} 
                className="w-4 h-4 rounded-[3px] shadow-inner" 
                style={{ backgroundColor: getHeatColor(p) }} 
              />
            ))}
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">High</span>
        </div>
      </div>
    </div>
  )
}
