import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Users, Check, Search, X, UserX } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import toast from 'react-hot-toast'
import { TODAYS_CLASSES } from '../../lib/mockData'
import { addToQueue } from '../../lib/offlineSync'

interface MarkAttendanceProps {
  onLogout: () => void
}

export default function MarkAttendance({ onLogout }: MarkAttendanceProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const [selectedClass, setSelectedClass] = useState(TODAYS_CLASSES[0].id)
  const [search, setSearch] = useState('')

  // All students start as PRESENT by default — faculty only marks absents
  const [absentIds, setAbsentIds] = useState<Record<string, Set<string>>>(() => {
    const init: Record<string, Set<string>> = {}
    for (const cls of TODAYS_CLASSES) init[cls.id] = new Set()
    return init
  })

  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)

  const currentClass = TODAYS_CLASSES.find(c => c.id === selectedClass)!
  const absent = absentIds[selectedClass] ?? new Set()

  const presentCount = currentClass.students.length - absent.size
  const totalCount = currentClass.students.length

  // Fuzzy search — match name or roll number
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return currentClass.students
    return currentClass.students.filter(s =>
      s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q)
    )
  }, [search, currentClass.students])

  const toggleAbsent = (studentId: string) => {
    setAbsentIds(prev => {
      const next = new Set(prev[selectedClass])
      if (next.has(studentId)) next.delete(studentId)
      else next.add(studentId)
      return { ...prev, [selectedClass]: next }
    })
  }

  const markAllPresent = () =>
    setAbsentIds(prev => ({ ...prev, [selectedClass]: new Set() }))

  const handleSubmit = async () => {
    setSubmitting(true)
    await new Promise(res => setTimeout(res, 800))
    
    if (!navigator.onLine) {
      await addToQueue(selectedClass, Array.from(absent));
      toast.success('Offline mode: Attendance queued for sync 🔄');
    } else {
      // Simulate API call
      await new Promise(res => setTimeout(res, 400))
      toast.success(`Attendance submitted! ${presentCount}/${totalCount} present ✅`)
    }
    
    setSubmitted(prev => ({ ...prev, [selectedClass]: true }))
    setSubmitting(false)
  }

  return (
    <PageWrapper role="faculty" userName={user.name || 'Faculty'} onLogout={onLogout}
      title="Mark Attendance" subtitle="All students are present by default — tap to mark absent">

      {/* Class selector */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {TODAYS_CLASSES.map(cls => (
          <button key={cls.id} onClick={() => setSelectedClass(cls.id)}
            className={`flex-1 min-w-[140px] p-4 rounded-2xl border text-left transition-all ${
              selectedClass === cls.id
                ? 'border-electric-blue/40 bg-electric-blue/10'
                : 'border-white/8 hover:border-white/20 bg-white/[0.02]'
            }`}>
            <div className="font-semibold text-white text-sm">{cls.subjectFull}</div>
            <div className="text-white/40 text-xs mt-0.5">{cls.time} · Room {cls.room}</div>
          </button>
        ))}
      </div>

      <div className="card p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-white/40" />
            <div>
              <h2 className="font-heading text-lg font-semibold text-white">{currentClass.subjectFull}</h2>
              <p className="text-white/40 text-sm">{currentClass.section} · {currentClass.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Present count */}
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-2xl font-bold text-emerald-400">{presentCount}</span>
                <span className="text-white/30 text-sm">/{totalCount}</span>
              </div>
              <p className="text-xs text-white/30">present</p>
            </div>
            {/* Absent count */}
            {absent.size > 0 && (
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-2xl font-bold text-red-400">{absent.size}</span>
                </div>
                <p className="text-xs text-white/30">absent</p>
              </div>
            )}
            <button onClick={markAllPresent}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
              All Present
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-white/8 mb-5">
          <motion.div className="h-full rounded-full bg-emerald-500"
            animate={{ width: `${(presentCount / totalCount) * 100}%` }}
            transition={{ duration: 0.4 }} />
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search student name or roll no…"
            className="w-full h-10 bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-electric-blue/40 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Info hint */}
        <div className="flex items-center gap-2 mb-4 text-xs text-amber-400/70 bg-amber-400/5 border border-amber-400/10 rounded-xl px-3 py-2">
          <UserX className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Tap a student to mark them <strong>absent</strong>. Everyone is present by default.</span>
        </div>

        {/* Student grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-white/25 text-sm">No students match "{search}"</div>
            ) : (
              filtered.map((student, i) => {
                const isAbsent = absent.has(student.id)
                return (
                  <motion.button
                    key={student.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.2) }}
                    onClick={() => toggleAbsent(student.id)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                      isAbsent
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-emerald-500/8 border-emerald-500/20 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                        isAbsent ? 'bg-red-500/20 border-red-500/50' : 'bg-emerald-500 border-emerald-500'
                      }`}>
                        {isAbsent
                          ? <X className="w-2.5 h-2.5 text-red-400" />
                          : <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">{student.name}</p>
                        <p className={`text-[10px] ${isAbsent ? 'text-red-400/60' : 'text-white/30'}`}>
                          {student.rollNo}{isAbsent ? ' · Absent' : ''}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                )
              })
            )}
          </AnimatePresence>
        </div>

        {/* Submit */}
        <div className="mt-5 flex justify-end">
          <AnimatePresence mode="wait">
            {submitted[selectedClass] ? (
              <motion.div key="done"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-semibold text-sm">
                <Check className="w-4 h-4" /> Attendance Submitted!
              </motion.div>
            ) : (
              <motion.button key="submit"
                onClick={handleSubmit} disabled={submitting}
                className="btn-primary flex items-center gap-2 px-8 py-3 text-sm font-semibold">
                {submitting
                  ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <CheckSquare className="w-4 h-4" />}
                {submitting ? 'Submitting…' : `Submit · ${absent.size} absent`}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  )
}
