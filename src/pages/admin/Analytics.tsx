import { motion } from 'framer-motion'
import PageWrapper from '../../components/layout/PageWrapper'
import TrendChart from '../../components/charts/TrendChart'
import { TREND_DATA, DEPARTMENT_ATTENDANCE, getAIEngagementBySubject } from '../../lib/mockData'
import { ResponsiveContainer, ComposedChart, Scatter, XAxis, YAxis, Tooltip, Cell, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'
import { AlertCircle, TrendingDown, Clock, Search, Activity } from 'lucide-react'

const ATTENDANCE_PATTERNS = [
  { id: 1, type: 'Time-based', pattern: 'Monday First Hour Avoidance', description: '42% drop in attendance for CSE-A Monday 9:00 AM slots over the last 4 weeks.', severity: 'High', action: 'Notify Faculty' },
  { id: 2, type: 'Subject-specific', pattern: 'Compiler Design Friday Afternoons', description: 'Consistent 30% absence rate for Friday 3:00 PM labs.', severity: 'Medium', action: 'Investigate' },
  { id: 3, type: 'Cohort', pattern: 'Lateral Entry Students', description: 'Overall 15% lower attendance rate compared to regular cohort in Mathematics IV.', severity: 'Medium', action: 'Schedule Mentorship' }
]

interface AnalyticsPageProps {
  onLogout: () => void
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card px-5 py-4 border-slate-100 shadow-2xl bg-white/90 backdrop-blur-md">
        <p className="text-slate-400 font-black text-[9px] uppercase tracking-widest mb-1">{label}</p>
        <p className="font-black text-slate-900 text-lg">{payload[0].value}% <span className="text-[10px] text-slate-400 font-medium">Participation</span></p>
      </div>
    )
  }
  return null
}

export default function AnalyticsPage({ onLogout }: AnalyticsPageProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const engagementData = getAIEngagementBySubject()

  return (
    <PageWrapper
      role="admin"
      userName={user.name || 'Admin'}
      onLogout={onLogout}
      title="Analytics"
      subtitle="Campus-wide attendance analytics and insights"
    >
      <div className="space-y-6">
        {/* Trend Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8 shadow-xl border-slate-100">
          <h2 className="font-heading text-lg font-black text-slate-900 uppercase tracking-tight mb-6">
            Campus Participation Trend
          </h2>
          <TrendChart data={TREND_DATA} height={280} />
        </motion.div>

        {/* Attendance Pattern Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-8 shadow-xl border-slate-100">
          <h2 className="font-heading text-lg font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-900" /> Pattern Intelligence
          </h2>
          <p className="text-[10px] text-slate-400 font-black mb-6 uppercase tracking-[0.2em]">Neural detection of behavioral anomalies across cohorts.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {ATTENDANCE_PATTERNS.map((pattern) => (
              <div key={pattern.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/30 flex flex-col gap-4 group hover:bg-white hover:shadow-xl transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  pattern.severity === 'High' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
                }`}>
                  {pattern.type === 'Time-based' ? <Clock className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight leading-tight">{pattern.pattern}</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">{pattern.description}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                    pattern.severity === 'High' ? 'border-red-100 text-red-500 bg-red-50/50' : 'border-amber-100 text-amber-500 bg-amber-50/50'
                  }`}>{pattern.severity} Priority</span>
                  <button className="text-[10px] font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 hover:text-slate-400 hover:border-slate-400 transition-all">
                    {pattern.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Department Cohort Radar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-8 shadow-xl border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-black text-slate-900 uppercase tracking-tight">Cohort Pulse Radar</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Departmental performance vectors across 6 divisions</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 items-center">
            <div className="w-full" style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={DEPARTMENT_ATTENDANCE.map(d => ({ ...d, target: 80 }))} cx="50%" cy="50%" outerRadius={90}>
                  <PolarGrid stroke="#F1F5F9" />
                  <PolarAngleAxis dataKey="department" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} />
                  <Radar name="Attendance" dataKey="attendance" stroke="#10B981" fill="#10B981" fillOpacity={0.12} strokeWidth={3} />
                  <Radar name="Target" dataKey="target" stroke="#F59E0B" fill="none" strokeDasharray="5 3" strokeWidth={2} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #F1F5F9', borderRadius: 12, fontSize: 11, fontWeight: 800 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {DEPARTMENT_ATTENDANCE.map((dept, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider w-10">{dept.department}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${dept.attendance}%`,
                        background: dept.attendance >= 75 ? '#10B981' : dept.attendance >= 65 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </div>
                  <span className="text-xs font-black w-8 text-right" style={{ color: dept.attendance >= 75 ? '#10B981' : dept.attendance >= 65 ? '#F59E0B' : '#EF4444' }}>{dept.attendance}%</span>
                </div>
              ))}
              <div className="flex gap-4 pt-2 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />≥75%</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />65-74%</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />&lt;65%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Subject Interaction Scatter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-8 shadow-xl border-slate-100">
          <h2 className="font-heading text-lg font-black text-slate-900 uppercase tracking-tight mb-1">Subject Intelligence Spectrum</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-8">AI query volume mapped against subject engagement depth</p>
          <div className="space-y-4">
            {engagementData.map((item, i) => {
              const max = engagementData[0]?.count || 1
              const pct = Math.round((item.count / max) * 100)
              const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']
              const col = colors[i % colors.length]
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight w-28 truncate">{item.subject}</span>
                  <div className="flex-1 relative h-8 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.7, ease: 'easeOut' }}
                      className="absolute inset-y-0 left-0 rounded-xl flex items-center justify-end pr-3"
                      style={{ background: `${col}15`, borderRight: `3px solid ${col}` }}
                    >
                      <span className="text-[10px] font-black" style={{ color: col }}>{item.count}</span>
                    </motion.div>
                  </div>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col }} />
                </div>
              )
            })}
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-6 text-right">
            Total verified interactions: {engagementData.reduce((s, d) => s + d.count, 0)}
          </p>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
