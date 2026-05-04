import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Users, Check, ChevronDown, ChevronUp } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import toast from 'react-hot-toast'
import { TODAYS_CLASSES } from '../../lib/mockData'
import type { ClassStudent } from '../../lib/mockData'

interface MarkAttendanceProps {
  onLogout: () => void
}

export default function MarkAttendance({ onLogout }: MarkAttendanceProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const [selectedClass, setSelectedClass] = useState(TODAYS_CLASSES[0].id)
  const [attendance, setAttendance] = useState<Record<string, Record<string, boolean>>>(() => {
    const init: Record<string, Record<string, boolean>> = {}
    for (const cls of TODAYS_CLASSES) {
      init[cls.id] = {}
      for (const s of cls.students) {
        init[cls.id][s.id] = s.present
      }
    }
    return init
  })
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)

  const currentClass = TODAYS_CLASSES.find(c => c.id === selectedClass)!
  const classAttendance = attendance[selectedClass] || {}

  const presentCount = Object.values(classAttendance).filter(Boolean).length
  const totalCount = currentClass.students.length

  const toggle = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [selectedClass]: {
        ...prev[selectedClass],
        [studentId]: !prev[selectedClass][studentId],
      },
    }))
  }

  const markAll = (value: boolean) => {
    const updated: Record<string, boolean> = {}
    for (const s of currentClass.students) updated[s.id] = value
    setAttendance(prev => ({ ...prev, [selectedClass]: updated }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    await new Promise(res => setTimeout(res, 1200))
    setSubmitted(prev => ({ ...prev, [selectedClass]: true }))
    setSubmitting(false)
    toast.success(`Attendance marked for ${currentClass.subjectFull}! ✅`)
  }

  return (
    <PageWrapper
      role="faculty"
      userName={user.name || 'Faculty'}
      onLogout={onLogout}
      title="Mark Attendance"
      subtitle="Record attendance for today's classes"
    >
      {/* Class Selector */}
      <div className="flex gap-3 mb-6">
        {TODAYS_CLASSES.map(cls => (
          <button
            key={cls.id}
            onClick={() => setSelectedClass(cls.id)}
            className={`flex-1 p-4 rounded-2xl border text-left transition-all ${
              selectedClass === cls.id
                ? 'border-electric-blue/40 bg-electric-blue/10'
                : 'border-white/8 hover:border-white/20 bg-white/3'
            }`}
          >
            <div className="font-semibold text-white text-sm">{cls.subjectFull}</div>
            <div className="text-white/40 text-xs mt-0.5">{cls.time} · Room {cls.room}</div>
          </button>
        ))}
      </div>

      <div className="card p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-white/50" />
            <div>
              <h2 className="font-heading text-lg font-semibold text-white">{currentClass.subjectFull}</h2>
              <p className="text-white/40 text-sm">{currentClass.section} · {currentClass.time}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Counter */}
            <div className="text-right">
              <span className="font-heading text-2xl font-bold text-emerald-400">{presentCount}</span>
              <span className="text-white/30 text-sm">/{totalCount}</span>
              <p className="text-xs text-white/30">present</p>
            </div>

            {/* Bulk Actions */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => markAll(true)}
                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
              >
                Mark All Present
              </button>
              <button
                onClick={() => markAll(false)}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                Mark All Absent
              </button>
            </div>
          </div>
        </div>

        {/* Attendance progress bar */}
        <div className="h-2 rounded-full bg-white/10 mb-6">
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            animate={{ width: `${(presentCount / totalCount) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Student List */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {currentClass.students.map((student, i) => {
            const isPresent = classAttendance[student.id] ?? student.present
            return (
              <motion.button
                key={student.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => toggle(student.id)}
                className={`
                  p-3 rounded-xl border text-left transition-all duration-200
                  ${isPresent
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-white/3 border-white/8 hover:border-white/20'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <div className={`
                    w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0
                    ${isPresent ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}
                  `}>
                    {isPresent && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium truncate">{student.name}</p>
                    <p className="text-white/30 text-[10px]">{student.rollNo}</p>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <AnimatePresence mode="wait">
            {submitted[selectedClass] ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-semibold"
              >
                <Check className="w-5 h-5" />
                Attendance Submitted!
              </motion.div>
            ) : (
              <motion.button
                key="submit"
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary flex items-center gap-2 px-8 py-3 text-sm font-semibold"
              >
                {submitting ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <CheckSquare className="w-4 h-4" />
                )}
                {submitting ? 'Submitting...' : 'Submit Attendance'}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  )
}
