import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, ClipboardList, TrendingUp, Clock } from 'lucide-react'
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts'
import PageWrapper from '../../components/layout/PageWrapper'
import AnimatedCounter from '../../components/charts/AnimatedCounter'
import { getTimetable, getFacultyLeaves } from '../../lib/supabase'
import { CustomTooltip, GRID_STYLE, AXIS_STYLE, SUBJECT_COLOR_MAP } from '../../lib/chartUtils'
import { FACULTY_STATS } from '../../lib/mockData'
import { useNavigate } from 'react-router-dom'

interface Props { onLogout: () => void }

const RADAR_DATA = [
  { metric: 'Attendance %', DBMS: 82, OS: 74 },
  { metric: 'AI Queries',   DBMS: 68, OS: 45 },
  { metric: 'Submissions',  DBMS: 91, OS: 78 },
  { metric: 'Engagement',   DBMS: 75, OS: 62 },
  { metric: 'Coverage',     DBMS: 88, OS: 80 },
]

export default function FacultyDashboard({ onLogout }: Props) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const navigate = useNavigate()
  const [timetable, setTimetable] = useState<any[]>([])
  const [leaveCount, setLeaveCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const stats = FACULTY_STATS

  useEffect(() => {
    Promise.all([
      getTimetable('00000000-0000-0000-0000-000000000002'),
      getFacultyLeaves('00000000-0000-0000-0000-000000000002'),
    ]).then(([tt, lv]) => {
      setTimetable(tt)
      setLeaveCount(lv.filter((l: any) => l.status === 'pending').length)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Section attendance bar data
  const sectionData = [
    { section: 'CS-A', pct: 84, count: 42 },
    { section: 'CS-B', pct: 71, count: 38 },
    { section: 'CS-C', pct: 58, count: 40 },
  ]

  const kpis = [
    { label: 'Classes Today', value: timetable.filter(t => {
        const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date())
        return t.day === today
      }).length || 3,
      unit: '', color: '#4F8EF7', icon: Clock },
    { label: 'Total Students', value: stats.totalStudents, unit: '', color: '#10B981', icon: Users },
    { label: 'Classes Taken',  value: stats.classesTaken,  unit: '', color: '#8B5CF6', icon: ClipboardList },
    { label: 'Avg Attendance', value: stats.avgAttendance, unit: '%', color: '#F59E0B', icon: TrendingUp },
  ]

  return (
    <PageWrapper role="faculty" userName={user.name || 'Faculty'} onLogout={onLogout}
      title="Classroom Dynamics" subtitle="Your teaching analytics at a glance">

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {kpis.map((k, i) => {
          const Icon = k.icon
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }} className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: k.color }} />
                <span className="text-xs text-white/40">{k.label}</span>
              </div>
              <div className="font-heading text-3xl font-black text-white">
                <AnimatedCounter value={k.value} /><span className="text-base text-white/30">{k.unit}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-5 mb-5">

        {/* ── Radar: Subject Engagement ──────────────────────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }} className="card p-5 lg:col-span-2">
          <h3 className="font-heading text-sm font-semibold text-white mb-1">Subject Engagement Radar</h3>
          <p className="text-xs text-white/30 mb-4">DBMS vs OS across 5 dimensions</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius={80}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="metric"
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
              <Radar name="DBMS" dataKey="DBMS" stroke="#10B981" fill="#10B981" fillOpacity={0.25} strokeWidth={2} />
              <Radar name="OS"   dataKey="OS"   stroke="#4F8EF7" fill="#4F8EF7" fillOpacity={0.15} strokeWidth={2} />
              <Tooltip content={<CustomTooltip unit="" />} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-1">
            <div className="flex items-center gap-1.5 text-xs text-white/40"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />DBMS</div>
            <div className="flex items-center gap-1.5 text-xs text-white/40"><div className="w-2.5 h-2.5 rounded-sm bg-electric-blue" />OS</div>
          </div>
        </motion.div>

        {/* ── Section Attendance Bars ────────────────────────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }} className="card p-5 lg:col-span-3">
          <h3 className="font-heading text-sm font-semibold text-white mb-1">Section Attendance</h3>
          <p className="text-xs text-white/30 mb-4">Attendance % across your sections</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sectionData} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 0 }}>
              <CartesianGrid {...GRID_STYLE} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} {...AXIS_STYLE} />
              <YAxis type="category" dataKey="section" {...AXIS_STYLE} width={45} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pct" name="Attendance" radius={[0, 8, 8, 0]} maxBarSize={32}>
                {sectionData.map((d, i) => (
                  <Cell key={i} fill={d.pct >= 75 ? '#10B981' : d.pct >= 60 ? '#F59E0B' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* 75% marker */}
          <div className="flex items-center gap-2 mt-2 text-xs text-amber-400/60">
            <div className="w-3 h-0.5 border-t border-dashed border-amber-400" />
            75% threshold
          </div>
        </motion.div>
      </div>

      {/* ── Today's Schedule + Leave Status ──────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }} className="card p-5">
          <h3 className="font-heading text-sm font-semibold text-white mb-3">Today's Classes</h3>
          {timetable.slice(0, 3).length === 0 ? (
            <p className="text-white/30 text-sm">No classes data — connect DB for live schedule</p>
          ) : (
            <div className="space-y-2">
              {timetable.slice(0, 3).map((slot: any, i: number) => {
                const code = slot.subjects?.code || 'SUB'
                const color = SUBJECT_COLOR_MAP[code] || '#4F8EF7'
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                    <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: color }} />
                    <div>
                      <p className="text-white text-sm font-semibold">{slot.subjects?.name || code}</p>
                      <p className="text-white/40 text-xs">{slot.start_time.slice(0,5)} – {slot.end_time.slice(0,5)} · {slot.room}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <button onClick={() => navigate('/faculty/schedule')}
            className="btn-ghost text-xs mt-3 w-full py-2">View Full Schedule →</button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }} className="card p-5">
          <h3 className="font-heading text-sm font-semibold text-white mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Mark Attendance', sub: 'Record today\'s class', path: '/faculty/attendance', color: '#10B981' },
              { label: 'Apply for Leave',  sub: leaveCount > 0 ? `${leaveCount} pending` : 'No pending requests', path: '/faculty/leave', color: '#F59E0B' },
              { label: 'Upload Material',  sub: 'Share notes with students', path: '/faculty/upload', color: '#8B5CF6' },
            ].map((a, i) => (
              <button key={i} onClick={() => navigate(a.path)}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-white/[0.04] border border-transparent hover:border-white/8">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.color }} />
                <div>
                  <p className="text-sm font-semibold text-white">{a.label}</p>
                  <p className="text-xs text-white/35">{a.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
