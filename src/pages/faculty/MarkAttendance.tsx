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
                ? 'border-blue-200 bg-blue-50 shadow-sm'
                : 'border-navy-100 hover:border-navy-200 bg-navy-50/30'
            }`}>
            <div className={`font-bold text-sm ${selectedClass === cls.id ? 'text-blue-700' : 'text-navy-800'}`}>{cls.subjectFull}</div>
            <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${selectedClass === cls.id ? 'text-blue-500' : 'text-navy-400'}`}>{cls.time} · Room {cls.room}</div>
          </button>
        ))}
      </div>

      <div className="card p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-navy-300" />
            <div>
              <h2 className="font-heading text-lg font-bold text-navy-800">{currentClass.subjectFull}</h2>
              <p className="text-navy-400 text-xs font-bold uppercase tracking-wider">{currentClass.section} · {currentClass.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Present count */}
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-2xl font-bold text-emerald-600">{presentCount}</span>
                <span className="text-navy-300 text-sm font-bold">/{totalCount}</span>
              </div>
              <p className="text-[10px] text-navy-400 font-bold uppercase tracking-wider">present</p>
            </div>
            {/* Absent count */}
            {absent.size > 0 && (
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-2xl font-bold text-red-600">{absent.size}</span>
                </div>
                <p className="text-[10px] text-navy-400 font-bold uppercase tracking-wider">absent</p>
              </div>
            )}
            <button onClick={markAllPresent}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold hover:bg-emerald-200 transition-colors">
              All Present
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-navy-100 mb-5">
          <motion.div className="h-full rounded-full bg-emerald-500"
            animate={{ width: `${(presentCount / totalCount) * 100}%` }}
            transition={{ duration: 0.4 }} />
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search student name or roll no…"
            className="w-full h-11 bg-navy-50/50 border border-navy-100 rounded-xl pl-10 pr-10 text-sm text-navy-800 font-bold placeholder:text-navy-300 focus:outline-none focus:border-blue-500/40 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-500">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Info hint */}
        <div className="flex items-center gap-2 mb-4 text-xs text-amber-700 font-bold bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
          <UserX className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Tap a student to mark them <strong>absent</strong>. Everyone is present by default.</span>
        </div>

        {/* Student grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-navy-300 font-bold text-sm bg-navy-50/50 rounded-2xl border border-dashed border-navy-100">No students match "{search}"</div>
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
                        ? 'bg-red-50 border-red-200 shadow-sm'
                        : 'bg-emerald-50 border-emerald-200 hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                        isAbsent ? 'bg-red-500 border-red-500' : 'bg-emerald-500 border-emerald-500'
                      }`}>
                        {isAbsent
                          ? <X className="w-3 h-3 text-white" />
                          : <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-navy-800 text-xs font-bold truncate">{student.name}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${isAbsent ? 'text-red-500/60' : 'text-navy-400'}`}>
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
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm border border-emerald-200">
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
