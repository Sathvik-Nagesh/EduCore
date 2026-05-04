import { motion } from 'framer-motion'
import PageWrapper from '../../components/layout/PageWrapper'
import EngagementBar from '../../components/charts/EngagementBar'
import { FACULTIES } from '../../lib/mockData'
import { getAIEngagementBySubject } from '../../lib/mockData'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

interface FacultyStatsProps {
  onLogout: () => void
}

export default function FacultyStats({ onLogout }: FacultyStatsProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')

  const chartData = FACULTIES.map(f => ({
    name: f.name.split(' ').slice(-1)[0],
    taken: f.classesTaken,
    scheduled: f.classesScheduled,
    rate: Math.round((f.classesTaken / f.classesScheduled) * 100),
  }))

  return (
    <PageWrapper
      role="admin"
      userName={user.name || 'Admin'}
      onLogout={onLogout}
      title="Faculty Statistics"
      subtitle="Faculty productivity and attendance marking metrics"
    >
      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-6"
      >
        <h2 className="font-heading text-lg font-bold text-navy-800 mb-5">Faculty Overview</h2>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Faculty</th>
                <th>Subjects</th>
                <th>Classes Taken</th>
                <th>Scheduled</th>
                <th>Leave Days</th>
                <th>Marking Rate</th>
              </tr>
            </thead>
            <tbody>
              {FACULTIES.map((f, i) => {
                const rate = Math.round((f.classesTaken / f.classesScheduled) * 100)
                const rateColor = rate >= 90 ? '#10B981' : rate >= 75 ? '#F59E0B' : '#EF4444'
                return (
                  <motion.tr
                    key={f.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[13px] font-black shadow-sm">
                          {f.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-navy-800 font-bold text-sm">{f.name}</p>
                          <p className="text-navy-400 font-bold text-[10px] uppercase tracking-wider">{f.department}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-1.5 flex-wrap">
                        {f.subjects.map(s => (
                          <span key={s} className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-tight">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="text-navy-800 font-bold">{f.classesTaken}</td>
                    <td className="text-navy-400 font-bold text-xs">{f.classesScheduled}</td>
                    <td className="text-amber-600 font-bold">{f.leaveDays}</td>
                    <td>
                      <span className="font-heading font-black text-lg" style={{ color: rateColor }}>{rate}%</span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h2 className="font-heading text-lg font-bold text-navy-800 mb-4">Classes Taken vs Scheduled</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ left: -20 }}>
            <XAxis dataKey="name" tick={{ fill: '#718096', fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#718096', fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              itemStyle={{ fontWeight: 700, fontSize: '12px' }}
              labelStyle={{ color: '#64748B', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}
            />
            <Legend iconType="circle" wrapperStyle={{ color: '#475569', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }} />
            <Bar dataKey="scheduled" fill="#E2E8F0" radius={[4, 4, 0, 0]} name="Scheduled" />
            <Bar dataKey="taken" fill="#2563EB" radius={[4, 4, 0, 0]} name="Taken" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </PageWrapper>
  )
}
