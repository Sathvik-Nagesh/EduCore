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
        <h2 className="font-heading text-base font-semibold text-white mb-5">Faculty Overview</h2>
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
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-semibold">
                          {f.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{f.name}</p>
                          <p className="text-white/30 text-xs">{f.department}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {f.subjects.map(s => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/8">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="text-white font-semibold">{f.classesTaken}</td>
                    <td className="text-white/50">{f.classesScheduled}</td>
                    <td className="text-amber-400">{f.leaveDays}</td>
                    <td>
                      <span className="font-heading font-bold" style={{ color: rateColor }}>{rate}%</span>
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
        <h2 className="font-heading text-base font-semibold text-white mb-4">Classes Taken vs Scheduled</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ left: -20 }}>
            <XAxis dataKey="name" tick={{ fill: '#5A6479', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#5A6479', fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#1A1D2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
              labelStyle={{ color: '#8892AA' }}
            />
            <Legend iconType="circle" wrapperStyle={{ color: '#8892AA', fontSize: '12px' }} />
            <Bar dataKey="scheduled" fill="rgba(79,142,247,0.3)" radius={[4, 4, 0, 0]} name="Scheduled" />
            <Bar dataKey="taken" fill="#4F8EF7" radius={[4, 4, 0, 0]} name="Taken" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </PageWrapper>
  )
}
