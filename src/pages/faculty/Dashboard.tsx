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
              transition={{ delay: i * 0.07 }} className="card p-6 hover:shadow-2xl transition-all group bg-white border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: `${k.color}10` }}>
                  <Icon className="w-5 h-5" style={{ color: k.color }} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{k.label}</span>
              </div>
              <div className="font-heading text-3xl font-black text-slate-900 tracking-tight">
                <AnimatedCounter value={k.value} /><span className="text-sm text-slate-300 ml-1 font-medium">{k.unit}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-5 mb-5">

        {/* ── Radar: Subject Engagement ──────────────────────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }} className="card p-8 lg:col-span-2 border-slate-100 shadow-xl">
          <h3 className="font-heading text-lg font-black text-slate-900 mb-1 uppercase tracking-tight">Subject Engagement Index</h3>
          <p className="text-[10px] text-slate-400 font-black mb-6 uppercase tracking-[0.2em]">DBMS vs OS Performance Vectors</p>
          <div className="w-full" style={{ height: '240px', minHeight: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius={80}>
              <PolarGrid stroke="#F1F5F9" />
              <PolarAngleAxis dataKey="metric"
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} />
              <Radar name="DBMS" dataKey="DBMS" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeWidth={3} />
              <Radar name="OS"   dataKey="OS"   stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.05} strokeWidth={3} />
              <Tooltip content={<CustomTooltip unit="" />} />
            </RadarChart>
          </ResponsiveContainer>
          </div>
          <div className="flex gap-4 justify-center mt-1">
            <div className="flex items-center gap-1.5 text-xs text-navy-400 font-bold"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />DBMS</div>
            <div className="flex items-center gap-1.5 text-xs text-navy-400 font-bold"><div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />OS</div>
          </div>
        </motion.div>

        {/* ── Section Attendance Bars ────────────────────────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }} className="card p-8 lg:col-span-3 border-slate-100 shadow-xl">
          <h3 className="font-heading text-lg font-black text-slate-900 mb-1 uppercase tracking-tight">Active Section Distribution</h3>
          <p className="text-[10px] text-slate-400 font-black mb-6 uppercase tracking-[0.2em]">Verified Attendance Percentages by cohort</p>
          <div className="w-full" style={{ height: '220px', minHeight: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectionData} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="#F8FAFC" />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis type="category" dataKey="section" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} width={45} />
              <Tooltip cursor={{ fill: '#F8FAFC' }} content={<CustomTooltip />} />
              <Bar dataKey="pct" name="Attendance" radius={[0, 12, 12, 0]} barSize={24}>
                {sectionData.map((d, i) => (
                  <Cell key={i} fill={d.pct >= 75 ? '#10B981' : d.pct >= 60 ? '#F59E0B' : '#EF4444'} fillOpacity={0.9} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
          {/* 75% marker */}
          <div className="flex items-center gap-2 mt-2 text-xs text-amber-600 font-bold">
            <div className="w-3 h-0.5 border-t border-dashed border-amber-600" />
            75% threshold
          </div>
        </motion.div>
      </div>

      {/* ── Today's Schedule + Leave Status ──────────────────────── */}
      <div className="grid md:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }} className="card p-8 border-slate-100 shadow-xl">
          <h3 className="font-heading text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">Today's Academic Schedule</h3>
          {timetable.slice(0, 3).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
               <Clock className="w-8 h-8 text-slate-200 mb-2" />
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No Active Slots Found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timetable.slice(0, 3).map((slot: any, i: number) => {
                const code = slot.subjects?.code || 'SUB'
                const color = SUBJECT_COLOR_MAP[code] || '#4F8EF7'
                return (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-3xl border transition-all hover:shadow-md hover:bg-white bg-slate-50/50"
                    style={{ borderColor: `${color}10` }}>
                    <div className="w-1.5 h-10 rounded-full flex-shrink-0" style={{ background: color }} />
                    <div className="flex-1">
                      <p className="text-slate-900 text-sm font-black uppercase tracking-tight">{slot.subjects?.name || code}</p>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">{slot.start_time.slice(0,5)} — {slot.end_time.slice(0,5)} · RM {slot.room}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  </div>
                )
              })}
            </div>
          )}
          <button onClick={() => navigate('/faculty/schedule')}
            className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 mt-6 py-4 rounded-2xl bg-slate-50/50 transition-all">Expand Full Matrix</button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }} className="card p-8 border-slate-100 shadow-xl">
          <h3 className="font-heading text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">Rapid Command Hub</h3>
          <div className="space-y-3">
            {[
              { label: 'Mark Attendance', sub: 'Record current classroom presence', path: '/faculty/attendance', color: '#10B981' },
              { label: 'Leave Request',  sub: leaveCount > 0 ? `${leaveCount} Pending Approval` : 'No active requests', path: '/faculty/leave', color: '#F59E0B' },
              { label: 'Ingest Material',  sub: 'Train AI Study Agent', path: '/faculty/upload', color: '#8B5CF6' },
            ].map((a, i) => (
              <button key={i} onClick={() => navigate(a.path)}
                className="w-full flex items-center gap-4 p-4 rounded-3xl text-left transition-all hover:bg-white border border-slate-50 hover:border-slate-200 hover:shadow-xl group bg-slate-50/30">
                <div className="w-2 h-2 rounded-full flex-shrink-0 group-hover:scale-150 transition-transform" style={{ background: a.color }} />
                <div>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{a.label}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{a.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
