import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Zap, Download, AlertCircle, Calendar, CalendarDays, Sun, MapPin, Settings2, Users } from 'lucide-react'
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
  { id: 'f1', name: 'Dr. Priya Sharma',  subjects: ['DBMS', 'OS'],  maxHoursPerWeek: 12, color: '#3B82F6' },
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
  const [halfDays, setHalfDays] = useState<string[]>([])
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
    await new Promise(res => setTimeout(res, 1200))

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
      ? toast.success('Timetable generated successfully!')
      : toast.error(`Generated with ${detected.length} conflict(s)`)
  }

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!timetable) return
    let text = 'EduCore Smart Timetable\n' + '='.repeat(30) + '\n\n'
    activeDays.forEach(day => {
      const slots = timetable[day] || []
      text += `[ ${day.toUpperCase()}${halfDays.includes(day) ? ' - HALF DAY' : ''} ]\n`
      slots.forEach(s => {
        text += `  ${s.startTime} - ${s.endTime} | ${s.subject.padEnd(10)} | ${s.faculty.padEnd(15)} | Room: ${s.room}\n`
      })
      if (slots.length === 0) text += '  No classes scheduled\n'
      text += '\n'
    })
    const blob = new Blob([text], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `timetable_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    toast.success('Timetable exported!')
  }

  const timeSlots = (() => {
    const slots = []
    const startMin = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1])
    const endMin = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1])
    for (let t = startMin; t + duration <= endMin; t += duration) {
      const h = Math.floor(t / 60)
      const m = t % 60
      const endH = Math.floor((t + duration) / 60)
      const endM = (t + duration) % 60
      slots.push({
        start: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
        end: `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`
      })
    }
    return slots
  })()

  return (
    <PageWrapper role="admin" userName={user.name || 'Admin'} onLogout={onLogout}
      title="Timetable Studio" subtitle="Generate high-performance schedules with automated conflict resolution">
      
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* ── Configuration Sidebar (Sticky) ────────────────────────────── */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-6">
          
          {/* Settings Group */}
          <div className="card p-6 border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-slate-800">
              <Settings2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-heading font-black text-sm uppercase tracking-widest">Global Setup</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Start</label>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">End</label>
                  <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Period Duration</label>
                <div className="flex gap-2">
                  {[45, 60, 90].map(d => (
                    <button key={d} onClick={() => setDuration(d)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all border ${duration === d ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-white'}`}>
                      {d}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Days Group */}
          <div className="card p-6 border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-slate-800">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
              <h3 className="font-heading font-black text-sm uppercase tracking-widest">Active Days</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ALL_DAYS.map(day => {
                const isActive = activeDays.includes(day)
                const isHalf = halfDays.includes(day)
                return (
                  <button key={day} onClick={() => toggleDay(day)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${isActive ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                    <span className={`text-xs font-black uppercase tracking-tighter ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{SHORT_DAYS[day]}</span>
                    {isActive && (
                      <div onClick={(e) => { e.stopPropagation(); toggleHalfDay(day); }}
                        className={`p-1 rounded-lg transition-colors ${isHalf ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400 hover:text-amber-500'}`}>
                        <Sun className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Faculty Group */}
          <div className="card p-6 border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-6 text-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="font-heading font-black text-sm uppercase tracking-widest">Faculty</h3>
              </div>
              <button onClick={addFaculty} className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {faculties.map((f) => (
                <div key={f.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 group relative">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: f.color }} />
                    <input value={f.name} onChange={e => updateFaculty(f.id, { name: e.target.value })} className="flex-1 bg-transparent text-xs font-black text-slate-800 focus:outline-none" />
                    <button onClick={() => removeFaculty(f.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input value={f.subjects.join(', ')} onChange={e => updateFaculty(f.id, { subjects: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Subjects..." className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600" />
                </div>
              ))}
            </div>

            <button onClick={handleGenerate} disabled={generating || faculties.length === 0}
              className="w-full mt-6 bg-slate-900 text-white rounded-2xl py-4 flex items-center justify-center gap-3 font-black uppercase tracking-[0.15em] text-xs hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50">
              {generating ? <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin rounded-full" /> : <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />}
              {generating ? 'Optimizing...' : 'Generate Plan'}
            </button>
          </div>
        </div>

        {/* ── Timetable Output ────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          
          <AnimatePresence>
            {conflicts.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 bg-red-50 border border-red-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700 text-sm font-black uppercase tracking-tight">{conflicts.length} System Conflicts Detected</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 pl-8">
                  {conflicts.map((c, i) => <p key={i} className="text-[11px] text-red-500/80 font-bold">• {c}</p>)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {timetable ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card border-slate-200/60 shadow-xl overflow-hidden">
              
              {/* Toolbar */}
              <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
                  <button onClick={() => setViewMode('week')}
                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'week' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                    Horizontal
                  </button>
                  <button onClick={() => setViewMode('day')}
                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'day' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                    Day View
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {viewMode === 'day' && (
                    <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)}
                      className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20">
                      {activeDays.map(d => <option key={d} value={d}>{d}{halfDays.includes(d) ? ' (Half)' : ''}</option>)}
                    </select>
                  )}
                  <button onClick={handleExport} className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                    <Download className="w-4 h-4" /> Export
                  </button>
                </div>
              </div>

              {/* Responsive Grid */}
              <div className="overflow-x-auto">
                {viewMode === 'week' ? (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-6 text-left bg-slate-50/30 border-b border-slate-100 w-32">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Day \ Time</span>
                        </th>
                        {timeSlots.map(slot => (
                          <th key={slot.start} className="p-4 border-b border-slate-100 text-center bg-slate-50/30 min-w-[160px]">
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{slot.start} - {slot.end}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeDays.map((day) => {
                        const isHalf = halfDays.includes(day)
                        return (
                          <tr key={day} className="group border-b border-slate-50 last:border-0">
                            <td className="p-6 bg-slate-50/10 group-hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-sm">{day}</span>
                                {isHalf && <Sun className="w-4 h-4 text-amber-500" />}
                              </div>
                            </td>
                            {timeSlots.map(slot => {
                              const classSlot = timetable[day]?.find(s => s.startTime === slot.start)
                              const isAfterHalfDay = isHalf && timeToMinutes(slot.start) >= timeToMinutes(halfDayEnd)
                              
                              if (isAfterHalfDay) {
                                return (
                                  <td key={slot.start} className="p-2 bg-slate-50/30">
                                    <div className="h-20 flex items-center justify-center border border-slate-100/50 rounded-3xl opacity-20 bg-slate-100/30 grayscale">
                                      <span className="text-[9px] font-black uppercase tracking-tighter">Off</span>
                                    </div>
                                  </td>
                                )
                              }

                              return (
                                <td key={slot.start} className="p-2">
                                  {classSlot ? (
                                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                                      className="h-24 p-4 rounded-[2rem] border transition-all hover:scale-[1.02] hover:shadow-lg relative overflow-hidden group/item cursor-pointer"
                                      style={{ background: `${classSlot.color}08`, borderColor: `${classSlot.color}20` }}>
                                      <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="font-black text-slate-900 text-sm leading-tight">{classSlot.subject}</div>
                                        <div className="flex items-center justify-between mt-auto">
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{classSlot.faculty.split(' ').pop()}</span>
                                          <div className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-lg border border-slate-100">
                                            <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                            <span className="text-[9px] font-black text-slate-600">{classSlot.room}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="absolute top-0 right-0 w-16 h-16 opacity-10 -mr-4 -mt-4 transition-transform group-hover/item:scale-110" style={{ background: classSlot.color, borderRadius: '100%' }} />
                                    </motion.div>
                                  ) : (
                                    <div className="h-24 border-2 border-dashed border-slate-100 rounded-[2rem] flex items-center justify-center group-hover:border-slate-200 transition-all">
                                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-slate-400">Free</span>
                                    </div>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 grid md:grid-cols-2 gap-8 bg-slate-50/20">
                    {activeDays.map(day => {
                      const slots = timetable[day] || []
                      if (viewMode === 'day' && day !== selectedDay) return null
                      return (
                        <div key={day} className="space-y-4">
                          <div className="flex items-center gap-3">
                            <h4 className="font-black text-slate-900 uppercase tracking-widest">{day}</h4>
                            <div className="h-px flex-1 bg-slate-200" />
                          </div>
                          <div className="space-y-3">
                            {slots.map((s, si) => (
                              <motion.div key={si} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: si * 0.05 }}
                                className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:border-slate-200 transition-all">
                                <div className="w-16 h-16 rounded-[1.5rem] flex flex-col items-center justify-center flex-shrink-0" style={{ background: `${s.color}10`, color: s.color }}>
                                  <span className="text-[10px] font-black leading-none">{s.startTime.split(':')[0]}</span>
                                  <div className="w-6 h-0.5 bg-current my-1 opacity-20" />
                                  <span className="text-[10px] font-black leading-none">{s.startTime.split(':')[1]}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="font-black text-slate-900 text-lg leading-tight mb-1">{s.subject}</div>
                                  <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                    <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {s.faculty}</span>
                                    <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Room {s.room}</span>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="card p-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 bg-slate-50/30">
              <div className="w-20 h-20 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center mb-8">
                <Zap className="w-10 h-10 text-amber-400 fill-amber-400" />
              </div>
              <h4 className="font-heading text-2xl font-black text-slate-900 mb-3 uppercase tracking-tighter">Engine Ready</h4>
              <p className="text-slate-400 text-sm font-bold max-w-xs leading-relaxed uppercase tracking-widest text-[10px]">Configure your parameters on the left to generate an optimized academic schedule.</p>
              <div className="mt-10 grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-xl font-black text-slate-900 mb-1">∞</div>
                  <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Combinations</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-slate-900 mb-1">0</div>
                  <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Conflicts</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-slate-900 mb-1">100%</div>
                  <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Accuracy</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}
