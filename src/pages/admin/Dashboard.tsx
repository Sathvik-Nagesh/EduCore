import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Brain, TrendingUp, AlertTriangle } from 'lucide-react'
import {
  ResponsiveContainer, Treemap, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, LineChart, Line, Brush, ZAxis, Cell,
} from 'recharts'
import PageWrapper from '../../components/layout/PageWrapper'
import AnimatedCounter from '../../components/charts/AnimatedCounter'
import { getAllAttendance, getAIStats } from '../../lib/supabase'
import { CustomTooltip, GRID_STYLE, AXIS_STYLE, SUBJECT_COLOR_MAP } from '../../lib/chartUtils'
import { ADMIN_STATS } from '../../lib/mockData'

interface Props { onLogout: () => void }

// Risk treemap cell with dept colour
const DEPT_COLORS: Record<string, string> = { CSE: '#4F8EF7', ECE: '#10B981', MECH: '#F59E0B', CIVIL: '#8B5CF6' }

const TreemapContent = (props: any) => {
  const { x, y, width, height, name, pct, dept } = props
  if (width < 30 || height < 20) return null
  const col = DEPT_COLORS[dept] || '#4F8EF7'
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={8}
        style={{ fill: `${col}20`, stroke: col, strokeWidth: 1, strokeOpacity: 0.4 }} />
      {width > 50 && height > 30 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle"
            style={{ fill: '#fff', fontSize: 11, fontWeight: 700 }}>{name}</text>
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle"
            style={{ fill: col, fontSize: 10 }}>{pct}%</text>
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
    <div style={{ background:'rgba(26,29,46,0.92)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 12px' }}>
      <p style={{ color:'#fff', fontWeight:700, fontSize:12 }}>{d?.name}</p>
      <p style={{ color:'#4F8EF7', fontSize:11 }}>AI Queries: {d?.ai}</p>
      <p style={{ color:'#10B981', fontSize:11 }}>Attendance: {d?.attendance}%</p>
    </div>
  )
}

export default function AdminDashboard({ onLogout }: Props) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const stats = ADMIN_STATS
  const [aiData, setAIData] = useState<any[]>([])

  useEffect(() => {
    getAIStats().then(d => { if (d.length > 0) setAIData(d) }).catch(() => {})
  }, [])

  const kpis = [
    { label: 'Total Students', value: stats.totalStudents,   unit: '',  color: '#4F8EF7', icon: Users },
    { label: 'At Risk',        value: AT_RISK.length,        unit: '',  color: '#EF4444', icon: AlertTriangle },
    { label: 'AI Queries',     value: aiData.length || stats.aiInteractions, unit: '', color: '#8B5CF6', icon: Brain },
    { label: 'Campus Avg',     value: stats.campusAttendance, unit: '%', color: '#10B981', icon: TrendingUp },
  ]

  return (
    <PageWrapper role="admin" userName={user.name || 'Admin'} onLogout={onLogout}
      title="Command Center" subtitle="Campus-wide analytics and oversight">

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

        {/* ── At-Risk Treemap ───────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }} className="card p-5 lg:col-span-2">
          <h3 className="font-heading text-sm font-semibold text-white mb-1">At-Risk Students</h3>
          <p className="text-xs text-white/30 mb-3">Larger block = further below 75% · hover for name</p>
          <ResponsiveContainer width="100%" height={230}>
            <Treemap
              data={AT_RISK.map(s => ({ ...s, size: 75 - s.pct }))}
              dataKey="size"
              content={<TreemapContent />}
            >
              <Tooltip content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null
                const d = payload[0]?.payload
                return (
                  <div style={{ background:'rgba(26,29,46,0.92)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'8px 12px' }}>
                    <p style={{ color:'#fff', fontWeight:700, fontSize:12 }}>{d?.name}</p>
                    <p style={{ color:'#EF4444', fontSize:11 }}>{d?.pct}% attendance</p>
                    <p style={{ color:'rgba(255,255,255,0.4)', fontSize:10 }}>{75 - d?.pct}% below threshold</p>
                  </div>
                )
              }} />
            </Treemap>
          </ResponsiveContainer>
        </motion.div>

        {/* ── Campus Activity Line + Brush ─────────────────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }} className="card p-5 lg:col-span-3">
          <h3 className="font-heading text-sm font-semibold text-white mb-1">Campus Activity (30 days)</h3>
          <p className="text-xs text-white/30 mb-4">Drag the brush to zoom in on a date range</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ACTIVITY} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="day" {...AXIS_STYLE} tick={{ ...AXIS_STYLE.tick, fontSize: 9 }} interval={4} />
              <YAxis {...AXIS_STYLE} />
              <Tooltip content={<CustomTooltip unit="%" />} />
              <Line type="monotone" dataKey="active" name="Active Students"
                stroke="#4F8EF7" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ai" name="AI Queries"
                stroke="#8B5CF6" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              <Brush dataKey="day" height={20} travellerWidth={6}
                stroke="rgba(255,255,255,0.1)"
                fill="rgba(26,29,46,0.8)" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── AI Usage Scatter ───────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }} className="card p-5">
        <h3 className="font-heading text-sm font-semibold text-white mb-1">AI Usage vs Attendance Correlation</h3>
        <p className="text-xs text-white/30 mb-4">Do students who use the AI more attend less? Hover a dot to find out.</p>
        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid {...GRID_STYLE} />
            <XAxis type="number" dataKey="ai" name="AI Queries" {...AXIS_STYLE}
              label={{ value: 'AI Queries', position: 'insideBottom', offset: -2, fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} />
            <YAxis type="number" dataKey="attendance" name="Attendance" {...AXIS_STYLE}
              domain={[45, 100]} />
            <ZAxis range={[60, 160]} />
            <Tooltip content={<ScatterTip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
            <Scatter data={SCATTER_DATA}>
              {SCATTER_DATA.map((d, i) => (
                <Cell key={i}
                  fill={d.attendance >= 75 ? '#10B981' : d.attendance >= 60 ? '#F59E0B' : '#EF4444'}
                  fillOpacity={0.8} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-xs text-white/30">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Above 75%</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 60–75%</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Below 60%</span>
        </div>
      </motion.div>
    </PageWrapper>
  )
}
