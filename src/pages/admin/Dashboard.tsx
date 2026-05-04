import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer, Treemap, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, LineChart, Line, Brush, ZAxis, Cell,
} from 'recharts'
import PageWrapper from '../../components/layout/PageWrapper'
import AnimatedCounter from '../../components/charts/AnimatedCounter'
import { getAllAttendance, getAIStats, getAllLeaves } from '../../lib/supabase'
import { CustomTooltip, GRID_STYLE, AXIS_STYLE, SUBJECT_COLOR_MAP } from '../../lib/chartUtils'
import { ADMIN_STATS } from '../../lib/mockData'

interface Props { onLogout: () => void }

// Risk treemap cell with dept colour
const DEPT_COLORS: Record<string, string> = { CSE: '#4F8EF7', ECE: '#10B981', MECH: '#F59E0B', CIVIL: '#8B5CF6' }

const TreemapContent = (props: any) => {
  const { x, y, width, height, name, pct, dept } = props
  if (width < 30 || height < 20) return null
  const col = DEPT_COLORS[dept] || '#4F8EF7'
  const isTooSmall = width < 60 || height < 40
  
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={12}
        style={{ fill: 'white', stroke: '#F1F5F9', strokeWidth: 2 }} />
      <rect x={x + 4} y={y + 4} width={width - 8} height={height - 8} rx={8}
        style={{ fill: `${col}10`, stroke: col, strokeWidth: 1.5, strokeOpacity: 0.3 }} />
      {!isTooSmall && (
        <>
          <foreignObject x={x + 10} y={y + 10} width={width - 20} height={height - 20}>
            <div className="h-full flex flex-col items-center justify-center text-center overflow-hidden">
              <span className="text-[9px] font-black text-slate-900 uppercase tracking-tight leading-none break-words mb-1 w-full">{name}</span>
              <span className="text-[12px] font-black" style={{ color: col }}>{pct}%</span>
            </div>
          </foreignObject>
        </>
      )}
    </g>
  )
}

// Mock at-risk students
const AT_RISK = [
  { name: 'Rohan Das',     pct: 52, dept: 'CSE', size: 23 },
  { name: 'Kavya Nair',    pct: 56, dept: 'CSE', size: 19 },
  { name: 'Arjun Singh',   pct: 59, dept: 'CSE', size: 16 },
  { name: 'Sneha Iyer',    pct: 61, dept: 'CSE', size: 14 },
  { name: 'Divya Menon',   pct: 63, dept: 'CSE', size: 12 },
  { name: 'Vikram Joshi',  pct: 64, dept: 'CSE', size: 11 },
  { name: 'Meera K.',      pct: 67, dept: 'CSE', size: 8  },
]

// Campus activity brush chart
const ACTIVITY = Array.from({ length: 30 }, (_, i) => ({
  day: `Apr ${i + 1}`,
  active: 80 + Math.round(Math.sin(i * 0.5) * 20 + (Math.random() - 0.5) * 10),
  ai: 20 + Math.round(Math.random() * 30),
}))

// Scatter: AI usage vs attendance
const SCATTER_DATA = [
  { ai: 5, attendance: 82, name: 'Rahul V' },
  { ai: 12, attendance: 61, name: 'Rohan D' },
  { ai: 8, attendance: 74, name: 'Priya P' },
  { ai: 3, attendance: 86, name: 'Sneha I' },
  { ai: 15, attendance: 55, name: 'Kavya N' },
  { ai: 6, attendance: 78, name: 'Arjun S' },
  { ai: 20, attendance: 52, name: 'Divya M' },
  { ai: 9, attendance: 71, name: 'Vikram J' },
  { ai: 4, attendance: 88, name: 'Meera K' },
  { ai: 11, attendance: 65, name: 'Aditya K' },
]

const ScatterTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={{ 
      background:'rgba(255,255,255,0.95)', 
      backdropFilter: 'blur(10px)',
      border:'1px solid rgba(0,0,0,0.08)', 
      borderRadius:14, 
      padding:'10px 14px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
    }}>
      <p style={{ color:'#0F172A', fontWeight:800, fontSize:13 }}>{d?.name}</p>
      <p style={{ color:'#3B82F6', fontSize:11, fontWeight: 600 }}>AI Queries: {d?.ai}</p>
      <p style={{ color:'#10B981', fontSize:11, fontWeight: 600 }}>Attendance: {d?.attendance}%</p>
    </div>
  )
}

export default function AdminDashboard({ onLogout }: Props) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const navigate = useNavigate()
  const stats = ADMIN_STATS
  const [aiData, setAIData] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [leaves, setLeaves] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAIStats(),
      getAllAttendance(),
      getAllLeaves()
    ]).then(([ai, att, lv]) => {
      setAIData(ai && ai.length > 0 ? ai : [])
      setAttendance(att && att.length > 0 ? att : [])
      setLeaves(lv.filter(l => l.status === 'pending'))
      setIsLoading(false)
    }).catch(err => {
      console.error('Error fetching dashboard data:', err)
      setIsLoading(false)
    })
  }, [])

  // Process At-Risk Students
  const studentAttendanceMap: Record<string, { name: string; dept: string; attended: number; total: number }> = {}
  attendance.forEach(record => {
    const studentId = record.student_id
    if (!studentAttendanceMap[studentId]) {
      studentAttendanceMap[studentId] = {
        name: record.profiles?.name || 'Unknown',
        dept: record.profiles?.department || 'Gen',
        attended: 0,
        total: 0
      }
    }
    studentAttendanceMap[studentId].total++
    if (record.is_present) studentAttendanceMap[studentId].attended++
  })

  const realAtRisk = Object.values(studentAttendanceMap)
    .map(s => ({ ...s, pct: Math.round((s.attended / s.total) * 100) }))
    .filter(s => s.pct < 75)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 10)
    .map(s => ({ ...s, size: 75 - s.pct }))

  // Process AI Activity Trend
  const activityMap: Record<string, { day: string; active: number; ai: number }> = {}
  // Last 14 days
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    activityMap[key] = { day: key, active: 0, ai: 0 }
  }

  aiData.forEach(interaction => {
    const d = new Date(interaction.created_at)
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (activityMap[key]) activityMap[key].ai++
  })

  // Attendance density for "active"
  attendance.forEach(record => {
    const d = new Date(record.date)
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (activityMap[key]) activityMap[key].active++
  })

  const realActivity = Object.values(activityMap)

  // Process Scatter Data
  const scatterMap: Record<string, { name: string; ai: number; attendance: number }> = {}
  aiData.forEach(i => {
    if (!scatterMap[i.student_id]) scatterMap[i.student_id] = { name: i.profiles?.name || 'Student', ai: 0, attendance: 0 }
    scatterMap[i.student_id].ai++
  })
  Object.keys(scatterMap).forEach(sid => {
    const att = studentAttendanceMap[sid]
    if (att) scatterMap[sid].attendance = Math.round((att.attended / att.total) * 100)
  })
  const realScatter = Object.values(scatterMap)

  const kpis = [
    { label: 'Enrollments', value: Object.keys(studentAttendanceMap).length || 1420,   unit: '',  color: '#0F172A', icon: Users },
    { label: 'Risk Indices',    value: realAtRisk.length || 7,        unit: '',  color: '#EF4444', icon: AlertTriangle },
    { label: 'AI Synthesis',    value: Math.max(aiData.length, 24), unit: '', color: '#8B5CF6', icon: Brain },
    { label: 'Campus Avg',      value: 82, unit: '%', color: '#10B981', icon: TrendingUp },
  ]

  const PENDING_APPROVALS = leaves.map(l => ({
    id: l.id,
    type: l.type === 'medical' ? 'Medical Leave' : l.type === 'personal' ? 'Personal Leave' : 'Official Duty',
    title: l.profiles?.name || 'Faculty',
    date: new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    status: 'Pending Review'
  }))

  return (
    <PageWrapper role="admin" userName={user.name || 'Admin'} onLogout={onLogout}
      title="Command Center" subtitle="Campus-wide analytics and oversight">

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {kpis.map((k, i) => {
          const Icon = k.icon
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }} className="card p-5 hover:shadow-card-hover group">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg" style={{ background: `${k.color}10` }}>
                  <Icon className="w-4 h-4" style={{ color: k.color }} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">{k.label}</span>
              </div>
              <div className="font-heading text-3xl font-black text-slate-900">
                <AnimatedCounter value={k.value} /><span className="text-base text-slate-200 ml-1">{k.unit}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-5 mb-5">

        {/* ── At-Risk Treemap ───────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }} className="card p-8 lg:col-span-2 shadow-xl border-slate-100">
          <h3 className="font-heading text-lg font-black text-slate-900 uppercase tracking-tight mb-1">Behavioral Risk Matrix</h3>
          <p className="text-[10px] text-slate-400 font-black mb-6 uppercase tracking-[0.2em]">Attendance below 75% threshold</p>
          <div className="w-full relative" style={{ height: '240px', minHeight: '0' }}>
            <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={realAtRisk.length > 0 ? realAtRisk : AT_RISK.map(s => ({ ...s, size: 75 - s.pct }))}
              dataKey="size"
              content={<TreemapContent />}
            >
              <Tooltip content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null
                const d = payload[0]?.payload
                return (
                  <div className="card px-4 py-3 bg-white/90 backdrop-blur-xl border-slate-100 shadow-2xl">
                    <p className="text-slate-900 font-black text-xs uppercase tracking-tight">{d?.name}</p>
                    <p className="text-red-500 font-black text-lg mt-1">{d?.pct}% <span className="text-[10px] text-slate-400 font-medium">Attendance</span></p>
                  </div>
                )
              }} />
            </Treemap>
          </ResponsiveContainer>
        </div>
        </motion.div>

        {/* ── Campus Activity Line + Brush ─────────────────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }} className="card p-8 lg:col-span-3 shadow-xl border-slate-100">
          <h3 className="font-heading text-lg font-black text-slate-900 uppercase tracking-tight mb-1">Campus Activity Synthesis</h3>
          <p className="text-[10px] text-slate-400 font-black mb-6 uppercase tracking-[0.2em]">Live utilization: Active users vs AI synthesized queries</p>
          <div className="w-full relative" style={{ height: '240px', minHeight: '0' }}>
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={realActivity.length > 0 ? realActivity : ACTIVITY} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="day" {...AXIS_STYLE} tick={{ ...AXIS_STYLE.tick, fontSize: 9 }} interval={4} />
              <YAxis {...AXIS_STYLE} hide />
              <Tooltip content={<CustomTooltip unit="%" />} />
              <Line type="stepAfter" dataKey="active" name="Active Students"
                stroke="#0F172A" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="ai" name="AI Queries"
                stroke="#8B5CF6" strokeWidth={2} dot={false} strokeDasharray="6 3" />
              <Brush dataKey="day" height={24} travellerWidth={10}
                stroke="#F1F5F9"
                fill="#F8FAFC" />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-1 gap-5 mb-5">
        {/* AI Correlation Scatter */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }} className="card p-8 shadow-xl border-slate-100">
          <h3 className="font-heading text-lg font-black text-slate-900 uppercase tracking-tight mb-1">Intelligence Correlation</h3>
          <p className="text-[10px] text-slate-400 font-black mb-6 uppercase tracking-[0.2em]">Cross-metric analysis: AI Engagement vs Student Attendance</p>
          <div className="w-full relative" style={{ height: '260px', minHeight: '0' }}>
            <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis type="number" dataKey="ai" name="AI Queries" {...AXIS_STYLE} hide />
              <YAxis type="number" dataKey="attendance" name="Attendance" {...AXIS_STYLE} domain={[45, 100]} hide />
              <ZAxis range={[100, 300]} />
              <Tooltip content={<ScatterTip />} cursor={{ stroke: 'rgba(0,0,0,0.05)' }} />
              <Scatter data={realScatter.length > 0 ? realScatter : SCATTER_DATA}>
                {(realScatter.length > 0 ? realScatter : SCATTER_DATA).map((d, i) => (
                  <Cell key={i}
                    fill={d.attendance >= 75 ? '#10B981' : d.attendance >= 60 ? '#F59E0B' : '#EF4444'}
                    fillOpacity={0.9} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
          <div className="flex gap-6 mt-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 justify-center">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" /> High Perf</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" /> Median</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" /> Critical</span>
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-8 shadow-xl border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-heading text-lg font-black text-slate-900 uppercase tracking-tight">Pending Approval Requests</h3>
            <span className="badge-warning font-black">{PENDING_APPROVALS.length} Pending</span>
          </div>
          {PENDING_APPROVALS.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">All Requests Processed</p>
            </div>
          ) : (
            <div className="space-y-3">
              {PENDING_APPROVALS.slice(0, 4).map((app, i) => (
                <div key={app.id} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50/50 border border-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-xl transition-all group">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm text-amber-500">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{app.title}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{app.type} · {app.date}</p>
                  </div>
                  <button onClick={() => navigate('/admin/leaves')} className="p-2 rounded-xl bg-slate-900 text-white opacity-0 group-hover:opacity-100 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => navigate('/admin/leaves')} className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 mt-6 py-4 rounded-2xl bg-slate-50/50 transition-all">View Administrative Queue</button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card p-8 shadow-xl border-slate-100 flex flex-col justify-center text-center">
           <div className="w-20 h-20 rounded-[32px] bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-indigo-500" />
           </div>
           <h3 className="font-heading text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Neural Insight Report</h3>
           <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 max-w-xs mx-auto">
             AI detects a 12% increase in engagement for subjects using multimodal teaching materials.
           </p>
           <button onClick={() => navigate('/admin/ai')} className="mx-auto bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
             Audit Neural Insights
           </button>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
