import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Zap, Download, AlertCircle, Calendar, CalendarDays, Sun } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import { generateTimetable, detectConflicts } from '../../lib/timetable'
import type { FacultyConstraint, TimetableGrid } from '../../lib/timetable'
import toast from 'react-hot-toast'

interface TimetablePageProps {
  onLogout: () => void
}

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT_DAYS: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
  Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat',
}

const PRESET_FACULTIES: FacultyConstraint[] = [
  { id: 'f1', name: 'Dr. Priya Sharma',  subjects: ['DBMS', 'OS'],  maxHoursPerWeek: 12, color: '#4F8EF7' },
  { id: 'f2', name: 'Prof. Rahul Mehta', subjects: ['DSA', 'ML'],   maxHoursPerWeek: 10, color: '#10B981' },
  { id: 'f3', name: 'Dr. Anita Rao',     subjects: ['CN'],           maxHoursPerWeek: 8,  color: '#F59E0B' },
]

type ViewMode = 'week' | 'day'

export default function TimetablePage({ onLogout }: TimetablePageProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')

  // Faculty state
  const [faculties, setFaculties] = useState<FacultyConstraint[]>(PRESET_FACULTIES)

  // Schedule settings
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [duration, setDuration] = useState(60)
  const [activeDays, setActiveDays] = useState<string[]>(['Monday','Tuesday','Wednesday','Thursday','Friday'])
  const [halfDays, setHalfDays] = useState<string[]>([])   // e.g. ['Saturday']
  const [halfDayEnd, setHalfDayEnd] = useState('13:00')

  // View & generation state
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [selectedDay, setSelectedDay] = useState('Monday')
  const [timetable, setTimetable] = useState<TimetableGrid | null>(null)
  const [conflicts, setConflicts] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)

  // ── Faculty Helpers ────────────────────────────────────────────────────────
  const addFaculty = () => setFaculties(prev => [...prev, {
    id: `f${Date.now()}`, name: 'New Faculty', subjects: ['Subject'], maxHoursPerWeek: 10, color: '#8B5CF6',
  }])
  const updateFaculty = (id: string, updates: Partial<FacultyConstraint>) =>
    setFaculties(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f))
  const removeFaculty = (id: string) =>
    setFaculties(prev => prev.filter(f => f.id !== id))

  // ── Day Toggles ───────────────────────────────────────────────────────────
  const toggleDay = (day: string) => {
    setActiveDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
    // Remove from half days if deactivated
    setHalfDays(prev => prev.filter(d => d !== day))
  }

  const toggleHalfDay = (day: string) => {
    if (!activeDays.includes(day)) return
    setHalfDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  // ── Generate ──────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (activeDays.length === 0) { toast.error('Select at least one active day'); return }
    setGenerating(true)
    await new Promise(res => setTimeout(res, 900))

    // Build day-specific end times (half days get halfDayEnd)
    const dayEndTimes: Record<string, string> = {}
    for (const day of activeDays) {
      dayEndTimes[day] = halfDays.includes(day) ? halfDayEnd : endTime
    }

    const grid = generateTimetable(faculties, startTime, endTime, duration, activeDays, dayEndTimes)
    const detected = detectConflicts(grid)
    setTimetable(grid)
    setConflicts(detected)
    setGenerating(false)
    setSelectedDay(activeDays[0] || 'Monday')

    detected.length === 0
      ? toast.success('Timetable generated — no conflicts! 🎉')
      : toast.error(`Generated with ${detected.length} conflict(s)`)
  }

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!timetable) return
    let text = 'EduCore Timetable\n\n'
    const days = activeDays.length ? activeDays : ALL_DAYS
    for (const day of days) {
      const slots = timetable[day] || []
      if (!slots.length) continue
      text += `${day}${halfDays.includes(day) ? ' (Half Day)' : ''}:\n`
      slots.forEach(s => { text += `  ${s.startTime}-${s.endTime}: ${s.subject} (${s.faculty}, ${s.room})\n` })
      text += '\n'
    }
    const blob = new Blob([text], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'timetable.txt'
    a.click()
    toast.success('Timetable exported!')
  }

  // ── Render days in grid ───────────────────────────────────────────────────
  const displayDays = viewMode === 'day' ? [selectedDay] : activeDays

  return (
    <PageWrapper role="admin" userName={user.name || 'Admin'} onLogout={onLogout}
      title="Timetable Generator" subtitle="Constraint-based smart timetable with day & half-day support">
      <div className="grid xl:grid-cols-5 gap-6">

        {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-4">

          {/* Duration & Time */}
          <div className="card p-5 space-y-4">
            <h3 className="font-heading text-sm font-semibold text-white">Schedule Settings</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="section-label mb-1 block">Start Time</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="input-field text-sm" />
              </div>
              <div>
                <label className="section-label mb-1 block">Full Day End</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="input-field text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="section-label mb-1 block">Class Duration</label>
                <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="input-field text-sm">
                  {[45,60,90].map(d => <option key={d} value={d} style={{ background: '#1A1D2E' }}>{d} min</option>)}
                </select>
              </div>
              <div>
                <label className="section-label mb-1 block">Half Day End</label>
                <input type="time" value={halfDayEnd} onChange={e => setHalfDayEnd(e.target.value)} className="input-field text-sm" />
              </div>
            </div>
          </div>

          {/* Day Configuration */}
          <div className="card p-5 space-y-3">
            <h3 className="font-heading text-sm font-semibold text-white mb-1">Active Days</h3>
            <p className="text-white/30 text-xs">Toggle days on/off and mark half-days with ☀️</p>

            <div className="space-y-2">
              {ALL_DAYS.map(day => {
                const isActive = activeDays.includes(day)
                const isHalf = halfDays.includes(day)
                return (
                  <div key={day} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                    isActive ? 'border-white/12 bg-white/[0.03]' : 'border-white/5 opacity-40'
                  }`}>
                    {/* Day toggle */}
                    <button
                      onClick={() => toggleDay(day)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold flex-shrink-0 transition-all ${
                        isActive
                          ? 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30'
                          : 'bg-white/5 text-white/30 border border-white/8'
                      }`}
                    >
                      {SHORT_DAYS[day]}
                    </button>

                    <span className={`flex-1 text-sm font-medium ${isActive ? 'text-white' : 'text-white/30'}`}>
                      {day}
                    </span>

                    {/* Half-day toggle */}
                    {isActive && (
                      <button
                        onClick={() => toggleHalfDay(day)}
                        title={isHalf ? 'Mark full day' : 'Mark half day'}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isHalf
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-white/5 text-white/25 border border-white/8 hover:text-amber-400 hover:border-amber-400/30'
                        }`}
                      >
                        <Sun className="w-3 h-3" />
                        {isHalf ? 'Half' : 'Full'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {halfDays.length > 0 && (
              <p className="text-xs text-amber-400/70 flex items-center gap-1.5 mt-1">
                <Sun className="w-3 h-3" />
                Half days end at <strong>{halfDayEnd}</strong>: {halfDays.join(', ')}
              </p>
            )}
          </div>

          {/* Faculty */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-sm font-semibold text-white">Faculty</h3>
              <button onClick={addFaculty} className="btn-ghost text-xs flex items-center gap-1 py-1.5 px-3">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {faculties.map((f, i) => (
                <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-xl border border-white/8 space-y-2 bg-white/[0.02]">
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
                  <input
                    value={f.subjects.join(', ')}
                    onChange={e => updateFaculty(f.id, { subjects: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="Subjects (comma-separated)"
                    className="input-field text-xs py-1.5"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 text-xs">Max hrs/week:</span>
                    <input type="number" value={f.maxHoursPerWeek}
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
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {generating
                ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <Zap className="w-4 h-4" />}
              {generating ? 'Generating…' : 'Generate Timetable'}
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
        <div className="xl:col-span-3 space-y-4">

          {/* Conflicts */}
          <AnimatePresence>
            {conflicts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="card p-4 border-red-500/20 bg-red-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">{conflicts.length} Conflict(s)</span>
                </div>
                {conflicts.map((c, i) => <p key={i} className="text-xs text-red-300/70 ml-6">• {c}</p>)}
              </motion.div>
            )}
          </AnimatePresence>

          {timetable ? (
            <div className="card p-5">
              {/* View Controls */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  {/* Week / Day toggle */}
                  <div className="flex bg-white/[0.04] border border-white/8 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('week')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'week' ? 'bg-electric-blue text-white' : 'text-white/40 hover:text-white'}`}
                    >
                      <CalendarDays className="w-3.5 h-3.5" /> Week
                    </button>
                    <button
                      onClick={() => setViewMode('day')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'day' ? 'bg-electric-blue text-white' : 'text-white/40 hover:text-white'}`}
                    >
                      <Calendar className="w-3.5 h-3.5" /> Day
                    </button>
                  </div>

                  {/* Day selector (day view) */}
                  {viewMode === 'day' && (
                    <select
                      value={selectedDay}
                      onChange={e => setSelectedDay(e.target.value)}
                      className="input-field text-xs py-1.5 w-auto"
                      style={{ background: '#1A1D2E' }}
                    >
                      {activeDays.map(d => (
                        <option key={d} value={d} style={{ background: '#1A1D2E' }}>
                          {d}{halfDays.includes(d) ? ' ☀️' : ''}
                        </option>
                      ))}
                    </select>
                  )}

                  {conflicts.length === 0 && <span className="badge-safe">✓ No conflicts</span>}
                </div>

                <button onClick={handleExport} className="btn-ghost text-xs flex items-center gap-1 py-1.5 px-3">
                  <Download className="w-3 h-3" /> Export
                </button>
              </div>

              {/* Grid */}
              <div className="overflow-x-auto">
                <div
                  className="grid gap-3 min-w-[300px]"
                  style={{ gridTemplateColumns: `repeat(${displayDays.length}, minmax(0,1fr))` }}
                >
                  {displayDays.map((day, di) => {
                    const slots = timetable[day] || []
                    const isHalf = halfDays.includes(day)
                    return (
                      <div key={day}>
                        <div className="text-center text-[10px] font-bold text-white/40 uppercase mb-2 tracking-wider flex items-center justify-center gap-1">
                          {viewMode === 'week' ? SHORT_DAYS[day] : day}
                          {isHalf && <Sun className="w-2.5 h-2.5 text-amber-400" />}
                        </div>
                        <div className="space-y-1.5">
                          {slots.map((slot, si) => (
                            <motion.div
                              key={si}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: di * 0.04 + si * 0.03 }}
                              className="rounded-xl p-2.5 text-center"
                              style={{ background: `${slot.color}18`, border: `1px solid ${slot.color}30` }}
                              title={`${slot.faculty} · ${slot.room}`}
                            >
                              <div className="font-semibold text-white text-[11px] truncate">{slot.subject}</div>
                              <div className="text-[10px] mt-0.5" style={{ color: slot.color }}>{slot.startTime}–{slot.endTime}</div>
                              <div className="text-white/25 text-[9px] truncate">{slot.room}</div>
                            </motion.div>
                          ))}
                          {slots.length === 0 && (
                            <div className="rounded-xl h-16 flex items-center justify-center text-[10px] text-white/15"
                              style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.06)' }}>
                              Free
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap gap-3">
                {faculties.map(f => (
                  <div key={f.id} className="flex items-center gap-1.5 text-xs text-white/40">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: f.color }} />
                    {f.name.split(' ').pop()}
                  </div>
                ))}
                {halfDays.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-400/60">
                    <Sun className="w-2.5 h-2.5" /> Half day: ends {halfDayEnd}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-16 flex flex-col items-center justify-center text-center min-h-64"
              style={{ border: '1px dashed rgba(255,255,255,0.06)' }}>
              <Zap className="w-10 h-10 text-white/10 mb-4" />
              <p className="text-white/30 text-sm">Configure days, faculty, and timings — then generate</p>
              <p className="text-white/15 text-xs mt-1">Supports week view, day view, and half-day scheduling</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
