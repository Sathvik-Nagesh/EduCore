import { motion } from 'framer-motion'
import { format, parseISO, getDay } from 'date-fns'
import type { DailyAttendance } from '../../lib/mockData'


interface AttendanceHeatmapProps {
  data: DailyAttendance[]
}

function getHeatColor(percentage: number): string {
  if (percentage === 0) return 'rgba(255,255,255,0.04)'
  if (percentage >= 80) return 'rgba(16,185,129,0.85)'
  if (percentage >= 65) return 'rgba(245,158,11,0.75)'
  if (percentage >= 40) return 'rgba(239,68,68,0.6)'
  return 'rgba(239,68,68,0.3)'
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AttendanceHeatmap({ data }: AttendanceHeatmapProps) {
  // Build grid: week columns, day rows (Mon-Sat)
  const weeks: DailyAttendance[][] = []
  let currentWeek: DailyAttendance[] = []

  // Pad start
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
    <div>
      <div className="flex gap-1 mb-2">
        <div className="w-7" />
        {weeks.map((_, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-white/20">
            {weeks[i][1]?.date ? format(parseISO(weeks[i][1].date), 'MMM dd') : ''}
          </div>
        ))}
      </div>

      {DAY_LABELS.map((day, dayIndex) => (
        <div key={day} className="flex gap-1 mb-1 items-center">
          <div className="w-7 text-[10px] text-white/30 text-right pr-1">{day}</div>
          {weeks.map((week, weekIndex) => {
            const cell = week[dayIndex]
            if (!cell || cell.percentage === -1) {
              return <div key={weekIndex} className="flex-1 h-5 rounded-sm" style={{ background: 'transparent' }} />
            }
            return (
              <motion.div
                key={weekIndex}
                className="flex-1 h-5 rounded-sm heatmap-cell"
                style={{ background: getHeatColor(cell.percentage) }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01, duration: 0.2 }}
                title={cell.date ? `${format(parseISO(cell.date), 'MMM dd')} — ${cell.percentage}%` : ''}
              />
            )
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 justify-end">
        <span className="text-xs text-white/30">Less</span>
        {[0, 40, 65, 80, 95].map(p => (
          <div key={p} className="w-4 h-4 rounded-sm" style={{ background: getHeatColor(p) }} />
        ))}
        <span className="text-xs text-white/30">More</span>
      </div>
    </div>
  )
}
