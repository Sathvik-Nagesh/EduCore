import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Zap, Download, AlertCircle } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import { generateTimetable, detectConflicts } from '../../lib/timetable'
import type { FacultyConstraint, TimetableSlot, TimetableGrid } from '../../lib/timetable'
import toast from 'react-hot-toast'

interface TimetablePageProps {
  onLogout: () => void
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

const PRESET_FACULTIES: FacultyConstraint[] = [
  { id: 'f1', name: 'Dr. Priya Sharma', subjects: ['DBMS', 'OS'], maxHoursPerWeek: 12, color: '#4F8EF7' },
  { id: 'f2', name: 'Prof. Rahul Mehta', subjects: ['DSA', 'ML'], maxHoursPerWeek: 10, color: '#10B981' },
  { id: 'f3', name: 'Dr. Anita Rao', subjects: ['CN'], maxHoursPerWeek: 8, color: '#F59E0B' },
]

export default function TimetablePage({ onLogout }: TimetablePageProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const [faculties, setFaculties] = useState<FacultyConstraint[]>(PRESET_FACULTIES)
  const [timetable, setTimetable] = useState<TimetableGrid | null>(null)
  const [conflicts, setConflicts] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [duration, setDuration] = useState(60)

  const addFaculty = () => {
    const id = `f${Date.now()}`
    setFaculties(prev => [...prev, {
      id,
      name: 'New Faculty',
      subjects: ['Subject'],
      maxHoursPerWeek: 10,
      color: '#8B5CF6',
    }])
  }

  const updateFaculty = (id: string, updates: Partial<FacultyConstraint>) => {
    setFaculties(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const removeFaculty = (id: string) => {
    setFaculties(prev => prev.filter(f => f.id !== id))
  }

  const handleGenerate = async () => {
    setGenerating(true)
    await new Promise(res => setTimeout(res, 800))

    const grid = generateTimetable(faculties, startTime, endTime, duration)
    const detected = detectConflicts(grid)

    setTimetable(grid)
    setConflicts(detected)
    setGenerating(false)

    if (detected.length === 0) {
      toast.success('Timetable generated with no conflicts! 🎉')
    } else {
      toast.error(`Generated with ${detected.length} conflict(s)`)
    }
  }

  const handleExport = () => {
    if (!timetable) return
    // Simple text export
    let text = 'EduCore Timetable\n\n'
    for (const day of DAYS) {
      text += `${day}:\n`
      for (const slot of timetable[day] || []) {
        text += `  ${slot.startTime}-${slot.endTime}: ${slot.subject} (${slot.faculty}, Room ${slot.room})\n`
      }
      text += '\n'
    }
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'timetable.txt'
    a.click()
    toast.success('Timetable exported!')
  }

  return (
    <PageWrapper
      role="admin"
      userName={user.name || 'Admin'}
      onLogout={onLogout}
      title="Timetable Generator"
      subtitle="Constraint-based greedy timetable generation"
    >
      <div className="grid md:grid-cols-5 gap-6">
        {/* Input Panel */}
        <div className="md:col-span-2 space-y-4">
          {/* Time Settings */}
          <div className="card p-5">
            <h3 className="font-heading text-sm font-semibold text-white mb-4">Schedule Settings</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="section-label mb-1 block">Start Time</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                  className="input-field text-sm" />
              </div>
              <div>
                <label className="section-label mb-1 block">End Time</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                  className="input-field text-sm" />
              </div>
            </div>
            <div>
              <label className="section-label mb-1 block">Class Duration (min)</label>
              <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="input-field text-sm">
                <option value={45} style={{ background: '#1A1D2E' }}>45 minutes</option>
                <option value={60} style={{ background: '#1A1D2E' }}>60 minutes</option>
                <option value={90} style={{ background: '#1A1D2E' }}>90 minutes</option>
              </select>
            </div>
          </div>

          {/* Faculty List */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-sm font-semibold text-white">Faculty</h3>
              <button onClick={addFaculty} className="btn-ghost text-xs flex items-center gap-1 py-1.5 px-3">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {faculties.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-xl border border-white/8 space-y-2"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: f.color }} />
                    <input
                      value={f.name}
                      onChange={e => updateFaculty(f.id, { name: e.target.value })}
                      className="flex-1 bg-transparent text-white text-sm font-medium focus:outline-none"
                    />
                    <button onClick={() => removeFaculty(f.id)} className="text-white/20 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <input
                      value={f.subjects.join(', ')}
                      onChange={e => updateFaculty(f.id, { subjects: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      placeholder="Subjects (comma-separated)"
                      className="input-field text-xs py-1.5"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 text-xs">Max hrs/week:</span>
                    <input
                      type="number"
                      value={f.maxHoursPerWeek}
                      onChange={e => updateFaculty(f.id, { maxHoursPerWeek: Number(e.target.value) })}
                      className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-electric-blue/40"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || faculties.length === 0}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2 text-sm"
            >
              {generating ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {generating ? 'Generating...' : 'Generate Timetable'}
            </button>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="md:col-span-3">
          {/* Conflicts */}
          <AnimatePresence>
            {conflicts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 card p-4"
                style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">{conflicts.length} Conflict(s) Detected</span>
                </div>
                {conflicts.map((c, i) => (
                  <p key={i} className="text-xs text-red-300/70 ml-6">• {c}</p>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {timetable ? (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-sm font-semibold text-white">Generated Timetable</h3>
                <div className="flex items-center gap-2">
                  {conflicts.length === 0 && (
                    <span className="badge-safe">✓ No conflicts</span>
                  )}
                  <button onClick={handleExport} className="btn-ghost text-xs flex items-center gap-1 py-1.5 px-3">
                    <Download className="w-3 h-3" /> Export
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="overflow-x-auto">
                <div className="grid grid-cols-6 gap-2 min-w-[500px]">
                  {DAYS.map((day, di) => (
                    <div key={day}>
                      <div className="text-center text-[10px] font-semibold text-white/40 uppercase mb-2 tracking-wider">
                        {day.slice(0, 3)}
                      </div>
                      <div className="space-y-1.5">
                        {(timetable[day] || []).map((slot, si) => (
                          <motion.div
                            key={si}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: di * 0.05 + si * 0.03 }}
                            className="rounded-lg p-2 text-center text-[10px]"
                            style={{
                              background: `${slot.color}18`,
                              border: `1px solid ${slot.color}30`,
                            }}
                            title={`${slot.faculty} · Room ${slot.room}`}
                          >
                            <div className="font-semibold text-white truncate">{slot.subject}</div>
                            <div style={{ color: slot.color }}>{slot.startTime}</div>
                            <div className="text-white/30 truncate">{slot.room}</div>
                          </motion.div>
                        ))}
                        {(timetable[day] || []).length === 0 && (
                          <div className="rounded-lg h-12 flex items-center justify-center text-[10px] text-white/15"
                            style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.05)' }}>
                            Free
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Faculty Legend */}
              <div className="mt-4 flex flex-wrap gap-3 border-t border-white/5 pt-3">
                {faculties.map(f => (
                  <div key={f.id} className="flex items-center gap-1.5 text-xs text-white/40">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: f.color }} />
                    {f.name.split(' ').slice(-1)[0]}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-12 flex flex-col items-center justify-center text-center h-full min-h-64"
              style={{ border: '1px dashed rgba(255,255,255,0.06)' }}>
              <Zap className="w-10 h-10 text-white/10 mb-4" />
              <p className="text-white/30 text-sm">Configure faculty constraints and click Generate</p>
              <p className="text-white/15 text-xs mt-1">Greedy constraint-based algorithm · Mon–Sat</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
