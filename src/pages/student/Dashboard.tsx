import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, AlertTriangle, CheckCircle, BookOpen, Brain } from 'lucide-react'
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
import { Calendar, Clock, Bell } from 'lucide-react'

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

  return (
    <PageWrapper role="student" userName={user.name || 'Student'} onLogout={onLogout}
      title="Academic Pulse" subtitle={getMotivationalMessage(overallPercentage)}>

      {/* Top KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Overall',  value: overallPercentage, unit: '%', color: overallPercentage >= 75 ? '#10B981' : '#EF4444', icon: CheckCircle },
          { label: 'Streak',   value: streak,            unit: ' days', color: '#F59E0B', icon: Flame },
          { label: 'At Risk',  value: dangerSubjects.length, unit: ' subj', color: '#EF4444', icon: AlertTriangle },
          { label: 'Materials',value: 14,                unit: ' files', color: '#4F8EF7', icon: BookOpen },
        ].map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }} className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                <span className="text-xs text-white/40 font-medium">{kpi.label}</span>
              </div>
              <div className="font-heading text-3xl font-black text-white">
                <AnimatedCounter value={kpi.value} /><span className="text-base text-white/30">{kpi.unit}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-5 mb-5">

        {/* ── Glowing Attendance Ring with Center Label ────────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }} className="card p-5 lg:col-span-2 relative group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-sm font-semibold text-white">Attendance Ring</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-wider text-white/30 font-bold">Live Pulse</span>
            </div>
          </div>
          
          <div className="relative h-[220px] w-full flex items-center justify-center">
            {/* Absolute Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <AnimatePresence mode="wait">
                {ringHover ? (
                  <motion.div key="hover" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                    className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-0.5">{ringHover}</p>
                    <p className="text-2xl font-black text-white leading-none mb-1">{hoveredSubj?.percentage}%</p>
                    <p className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      classesTo75 && classesTo75 > 0 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                    }`}>
                      {classesTo75 && classesTo75 > 0 ? `+${classesTo75} to reach 75%` : 'Target Achieved'}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="normal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-center">
                    <p className="text-3xl font-black text-white leading-none">{overallPercentage}%</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mt-1">Overall</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ringData} cx="50%" cy="50%" innerRadius={70} outerRadius={92}
                  dataKey="value" paddingAngle={4} stroke="none"
                  onMouseEnter={(_, idx) => setRingHover(ringData[idx]?.name ?? null)}
                  onMouseLeave={() => setRingHover(null)}>
                  {ringData.map((d, i) => (
                    <Cell key={i} fill={RING_COLORS[i % RING_COLORS.length]}
                      opacity={ringHover && d.name !== ringHover ? 0.2 : 1}
                      style={{ 
                        filter: ringHover === d.name ? `drop-shadow(0 0 12px ${RING_COLORS[i % RING_COLORS.length]}80)` : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
            {ringData.map((d, i) => {
              const subjectStats = attendance.find(a => a.code === d.name);
              const pct = subjectStats ? Math.round((subjectStats.attended / subjectStats.total) * 100) : 0;
              return (
                <div key={i} className={`flex items-center gap-1.5 transition-opacity ${ringHover && d.name !== ringHover ? 'opacity-30' : 'opacity-100'}`}>
                  <div className="w-2 h-2 rounded-full" style={{ background: RING_COLORS[i % RING_COLORS.length] }} />
                  <span className="text-[11px] font-bold text-white/50">{d.name} <span className="text-white/80">{pct}%</span></span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Attendance Trend Area ────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }} className="card p-5 lg:col-span-3">
          <h3 className="font-heading text-sm font-semibold text-white mb-4">Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              {ATTENDANCE_GRADIENT()}
              <CartesianGrid {...GRID_STYLE} vertical={false} />
              <XAxis dataKey="week" {...AXIS_STYLE} />
              <YAxis domain={[40, 100]} {...AXIS_STYLE} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="pct" name="Attendance"
                stroke="#4F8EF7" strokeWidth={3} fill="url(#colorAttendance)" dot={{ r: 4, fill: '#4F8EF7', strokeWidth: 2, stroke: '#0F1117' }} />
              <Line type="monotone" dataKey="target" name="Target 75%"
                stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="6 3" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Per-subject Bar Chart ──────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }} className="card p-5 mb-5">
        <h3 className="font-heading text-sm font-semibold text-white mb-4">Subject Breakdown</h3>
        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid {...GRID_STYLE} vertical={false} />
            <XAxis dataKey="name" {...AXIS_STYLE} />
            <YAxis {...AXIS_STYLE} />
            <Tooltip content={<CustomTooltip unit=" classes" />} />
            <Bar dataKey="Attended" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={SUBJECT_COLOR_MAP[entry.name] || '#4F8EF7'} fillOpacity={0.8} />
              ))}
            </Bar>
            <Line type="monotone" dataKey="Total" stroke="rgba(255,255,255,0.15)"
              strokeWidth={2} strokeDasharray="4 4" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }} className="card p-5">
          <h3 className="font-heading text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Critical Focus
          </h3>
          {dangerSubjects.length === 0 && warningSubjects.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-400 text-sm py-4">
              <CheckCircle className="w-5 h-5" /> Perfect Standing! No subjects at risk.
            </div>
          ) : (
            <div className="space-y-2">
              {[...dangerSubjects, ...warningSubjects].map((s: any, i: number) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all hover:translate-x-1 ${
                  s.percentage < 65
                    ? 'bg-red-500/10 border-red-500/20 text-red-300'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                }`}>
                  <span className="font-bold tracking-tight">{s.code || s.subjectCode}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.percentage}%`, background: 'currentColor' }} />
                    </div>
                    <span className="font-black w-10 text-right">{s.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }} className="card p-5 flex flex-col gap-3">
          <h3 className="font-heading text-sm font-semibold text-white mb-1">Quick Launch</h3>
          <button onClick={() => navigate('/student/ai')}
            className="flex items-center gap-4 p-4 rounded-xl bg-electric-blue/10 border border-electric-blue/20 hover:bg-electric-blue/15 hover:border-electric-blue/40 transition-all text-left group">
            <div className="p-2.5 rounded-lg bg-electric-blue/20 group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5 text-electric-blue" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">AI Study Agent</p>
              <p className="text-[11px] text-white/40">Ask questions or take subject quizzes</p>
            </div>
          </button>
          <button onClick={() => navigate('/student/materials')}
            className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 hover:border-emerald-500/40 transition-all text-left group">
            <div className="p-2.5 rounded-lg bg-emerald-500/20 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Resource Library</p>
              <p className="text-[11px] text-white/40">Access 14 new files and chapter notes</p>
            </div>
          </button>
        </motion.div>
      </div>

      {/* ── Assignments & Deadlines ──────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-5 card p-5">
        <h3 className="font-heading text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" /> Pending Assignments
        </h3>
        <div className="space-y-3">
          {ASSIGNMENTS.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-electric-blue px-2 py-0.5 rounded-full border border-electric-blue/20 bg-electric-blue/10">{task.subject}</span>
                  <span className="font-semibold text-white text-sm">{task.title}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <Clock className="w-3.5 h-3.5" /> Due {new Date(task.dueDate).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  task.status === 'Submitted' ? 'bg-emerald-500/20 text-emerald-400' :
                  task.status === 'Late' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {task.status}
                </span>
                <button className="text-xs font-semibold text-electric-blue hover:text-white transition-colors">View</button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Campus Announcements ──────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-5 card p-5">
        <h3 className="font-heading text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-400" /> Recent Announcements
        </h3>
        <div className="space-y-3">
          {ANNOUNCEMENTS.map((ann) => (
            <div key={ann.id} className="p-4 rounded-xl border border-white/8 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white text-sm">{ann.title}</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  ann.priority === 'High' ? 'border-red-500/30 text-red-400' :
                  ann.priority === 'Medium' ? 'border-amber-500/30 text-amber-400' :
                  'border-emerald-500/30 text-emerald-400'
                }`}>{ann.priority} Priority</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed mb-2">{ann.content}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-white/30">
                <Clock className="w-3 h-3" /> {new Date(ann.date).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </PageWrapper>
  )
}
