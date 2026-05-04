import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, AlertTriangle, CheckCircle, BookOpen, Brain, Calendar, Clock, Bell, ArrowRight } from 'lucide-react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Area, AreaChart,
} from 'recharts'
import PageWrapper from '../../components/layout/PageWrapper'
import AnimatedCounter from '../../components/charts/AnimatedCounter'
import { useAttendance } from '../../hooks/useAttendance'
import { getAttendanceSummary } from '../../lib/supabase'
import { CustomTooltip, GRID_STYLE, AXIS_STYLE, ATTENDANCE_GRADIENT, SUBJECT_COLOR_MAP } from '../../lib/chartUtils'
import { getMotivationalMessage } from '../../lib/predictions'
import { useNavigate } from 'react-router-dom'
import { ASSIGNMENTS, ANNOUNCEMENTS } from '../../lib/mockData'

interface Props { onLogout: () => void }

export default function StudentDashboard({ onLogout }: Props) {
  const { attendance, overallPercentage, streak, loading } = useAttendance()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')

  const [dbSummary, setDbSummary] = useState<any[]>([])
  const [ringHover, setRingHover] = useState<string | null>(null)

  useEffect(() => {
    const userId = user.supabase_id || '00000000-0000-0000-0000-000000000010'
    getAttendanceSummary(userId).then(d => { if (d.length > 0) setDbSummary(d) })
  }, [])

  const summary = dbSummary.length > 0 ? dbSummary : attendance.map(a => ({
    code: a.code, name: a.subjectName,
    attended: a.attended, total: a.total, percentage: a.percentage,
  }))

  const ringData = summary.map(s => ({
    name: s.code, value: s.attended, total: s.total, pct: s.percentage,
  }))

  const RING_COLORS = Object.values(SUBJECT_COLOR_MAP)

  const trendData = Array.from({ length: 8 }, (_, i) => ({
    week: `W${i + 1}`,
    pct: Math.max(50, Math.min(100, overallPercentage + (Math.random() - 0.5) * 18)),
    target: 75,
  }))

  const barData = summary.map(s => ({
    name: s.code,
    Attended: s.attended,
    Total: s.total,
    pct: s.percentage,
  }))

  const dangerSubjects = summary.filter((s: any) => s.percentage < 65)
  const warningSubjects = summary.filter((s: any) => s.percentage >= 65 && s.percentage < 75)
  
  const hoveredSubj = summary.find((s: any) => s.code === ringHover)
  const classesTo75 = hoveredSubj
    ? Math.max(0, Math.ceil((0.75 * hoveredSubj.total - hoveredSubj.attended) / 0.25))
    : null

  const kpis = [
    { label: 'Overall',  value: overallPercentage, unit: '%', color: overallPercentage >= 75 ? '#10B981' : '#EF4444', icon: CheckCircle },
    { label: 'Streak',   value: streak,            unit: ' days', color: '#F59E0B', icon: Flame },
    { label: 'At Risk',  value: dangerSubjects.length, unit: ' subj', color: '#EF4444', icon: AlertTriangle },
    { label: 'Materials',value: 14,                unit: ' files', color: '#3B82F6', icon: BookOpen },
  ]

  return (
    <PageWrapper role="student" userName={user.name || 'Student'} onLogout={onLogout}
      title="Academic Pulse" subtitle={getMotivationalMessage(overallPercentage)}>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }} className="card p-5 hover:shadow-card-hover group">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg" style={{ background: `${kpi.color}10` }}>
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">{kpi.label}</span>
              </div>
              <div className="font-heading text-3xl font-black text-slate-900">
                <AnimatedCounter value={kpi.value} /><span className="text-base text-slate-200 ml-1">{kpi.unit}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-5 mb-5">
        {/* Attendance Ring */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }} className="card p-5 lg:col-span-2 relative group flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-4">
            <h3 className="font-heading text-lg font-bold text-slate-800">Attendance Ring</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Live Pulse</span>
            </div>
          </div>
          
          <div className="relative h-[240px] w-full flex items-center justify-center">
            {/* Center Content - Absolutely Centered */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <AnimatePresence mode="wait">
                {ringHover ? (
                  <motion.div key="hover" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-1">{ringHover}</p>
                    <p className="text-3xl font-black text-slate-900 leading-none mb-2">{hoveredSubj?.percentage}%</p>
                    <p className={`text-[9px] font-black px-2.5 py-1 rounded-full border shadow-sm ${
                      classesTo75 && classesTo75 > 0 
                        ? 'bg-amber-50 border-amber-200 text-amber-600' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                    }`}>
                      {classesTo75 && classesTo75 > 0 ? `+${classesTo75} Classes needed` : 'Target Achieved'}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="normal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-center">
                    <p className="text-4xl font-black text-slate-900 leading-none">{overallPercentage}%</p>
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 font-black mt-2">Overall</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ringData} cx="50%" cy="50%" innerRadius={78} outerRadius={105}
                  dataKey="value" paddingAngle={2} stroke="none"
                  onMouseEnter={(_, idx) => setRingHover(ringData[idx]?.name ?? null)}
                  onMouseLeave={() => setRingHover(null)}>
                  {ringData.map((d, i) => (
                    <Cell key={i} fill={RING_COLORS[i % RING_COLORS.length]}
                      fillOpacity={ringHover && d.name !== ringHover ? 0.15 : 0.85}
                      style={{ 
                        filter: ringHover === d.name ? `drop-shadow(0 0 8px ${RING_COLORS[i % RING_COLORS.length]}40)` : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6 justify-center">
            {ringData.map((d, i) => {
              const subjectStats = attendance.find(a => a.code === d.name);
              const pct = subjectStats ? Math.round((subjectStats.attended / subjectStats.total) * 100) : 0;
              return (
                <div key={i} className={`flex items-center gap-2 transition-all duration-300 ${ringHover && d.name !== ringHover ? 'opacity-30 blur-[1px]' : 'opacity-100'}`}>
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: RING_COLORS[i % RING_COLORS.length] }} />
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-tight">{d.name} <span className="text-slate-800 ml-1">{pct}%</span></span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Attendance Trend */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }} className="card p-6 lg:col-span-3">
          <h3 className="font-heading text-lg font-bold text-slate-800 mb-4">Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              {ATTENDANCE_GRADIENT()}
              <CartesianGrid {...GRID_STYLE} vertical={false} strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="week" {...AXIS_STYLE} tick={{ ...AXIS_STYLE.tick, fill: '#94A3B8' }} />
              <YAxis domain={[40, 100]} {...AXIS_STYLE} tick={{ ...AXIS_STYLE.tick, fill: '#94A3B8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="pct" name="Attendance"
                stroke="#3B82F6" strokeWidth={3} fill="url(#colorAttendance)" dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="target" name="Target 75%"
                stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="6 3" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Subject Breakdown */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }} className="card p-6 mb-5">
        <h3 className="font-heading text-lg font-bold text-slate-800 mb-4">Subject Breakdown</h3>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid {...GRID_STYLE} vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="name" {...AXIS_STYLE} />
            <YAxis {...AXIS_STYLE} />
            <Tooltip content={<CustomTooltip unit=" classes" />} />
            <Bar dataKey="Attended" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={SUBJECT_COLOR_MAP[entry.name] || '#3B82F6'} fillOpacity={0.8} />
              ))}
            </Bar>
            <Line type="monotone" dataKey="Total" stroke="#E2E8F0"
              strokeWidth={2} strokeDasharray="4 4" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Critical Focus */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }} className="card p-6">
          <h3 className="font-heading text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Critical Focus
          </h3>
          {dangerSubjects.length === 0 && warningSubjects.length === 0 ? (
            <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-5 rounded-2xl border border-emerald-100 font-bold text-sm">
              <CheckCircle className="w-6 h-6" /> Perfect Standing! All subjects above 75%.
            </div>
          ) : (
            <div className="space-y-3">
              {[...dangerSubjects, ...warningSubjects].map((s: any, i: number) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border text-sm transition-all hover:translate-x-1 shadow-sm ${
                  s.percentage < 65
                    ? 'bg-red-50 border-red-100 text-red-700'
                    : 'bg-amber-50 border-amber-100 text-amber-700'
                }`}>
                  <span className="font-black uppercase tracking-tight">{s.code || s.subjectCode}</span>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-20 bg-black/5 rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full rounded-full" style={{ width: `${s.percentage}%`, background: 'currentColor' }} />
                    </div>
                    <span className="font-black w-10 text-right">{s.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Launch */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }} className="card p-6 flex flex-col gap-4">
          <h3 className="font-heading text-lg font-bold text-slate-800 mb-1">Learning Hub</h3>
          <button onClick={() => navigate('/student/ai')}
            className="flex items-center gap-4 p-5 rounded-2xl bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all text-left group shadow-sm">
            <div className="p-3 rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">AI Study Agent</p>
              <p className="text-[11px] text-slate-500 font-bold mt-0.5">Instant syllabus insights & custom quizzes</p>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button onClick={() => navigate('/student/materials')}
            className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 transition-all text-left group shadow-sm">
            <div className="p-3 rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Resource Library</p>
              <p className="text-[11px] text-slate-500 font-bold mt-0.5">14 new academic files & chapter notes</p>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </motion.div>
      </div>

      {/* Assignments */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-5 card p-6">
        <h3 className="font-heading text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" /> Pending Assignments
        </h3>
        <div className="space-y-3">
          {ASSIGNMENTS.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-xs text-purple-600 shadow-sm">
                  {task.subject.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-black text-blue-600 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 uppercase tracking-widest">{task.subject}</span>
                    <span className="font-black text-slate-900 text-sm tracking-tight">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold">
                    <Clock className="w-3.5 h-3.5" /> Due {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border ${
                  task.status === 'Submitted' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                  task.status === 'Late' ? 'bg-red-50 border-red-100 text-red-600' :
                  'bg-amber-50 border-amber-100 text-amber-600'
                }`}>
                  {task.status}
                </span>
                <button className="text-[11px] font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100">View</button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Announcements */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-5 card p-6 mb-8">
        <h3 className="font-heading text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-600" /> Recent Announcements
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {ANNOUNCEMENTS.map((ann) => (
            <div key={ann.id} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{ann.title}</h4>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${
                  ann.priority === 'High' ? 'bg-red-50 border-red-100 text-red-600' :
                  ann.priority === 'Medium' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                  'bg-emerald-50 border-emerald-100 text-emerald-600'
                }`}>{ann.priority}</span>
              </div>
              <p className="text-xs text-slate-500 font-bold leading-relaxed mb-4">{ann.content}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-black uppercase tracking-tighter">
                <Clock className="w-3 h-3" /> {new Date(ann.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </PageWrapper>
  )
}
