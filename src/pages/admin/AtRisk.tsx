import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, Download, ArrowUpDown } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import { AT_RISK_STUDENTS } from '../../lib/mockData'
import { getAttendanceStatus, getStatusColor } from '../../lib/predictions'

interface AtRiskPageProps {
  onLogout: () => void
}

export default function AtRiskPage({ onLogout }: AtRiskPageProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const [sortBy, setSortBy] = useState<'attendance' | 'name' | 'subject'>('attendance')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const sorted = [...AT_RISK_STUDENTS].sort((a, b) => {
    let va = a[sortBy] as string | number
    let vb = b[sortBy] as string | number
    if (typeof va === 'string') va = va.toLowerCase()
    if (typeof vb === 'string') vb = vb.toLowerCase()
    return sortDir === 'asc' ? (va < vb ? -1 : 1) : (va > vb ? -1 : 1)
  })

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  const exportCSV = () => {
    const headers = 'Name,Roll No,Subject,Attendance %,Department'
    const rows = sorted.map(s => `${s.name},${s.rollNo},${s.subject},${s.attendance},${s.department}`)
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'at-risk-students.csv'
    a.click()
  }

  return (
    <PageWrapper
      role="admin"
      userName={user.name || 'Admin'}
      onLogout={onLogout}
      title="At-Risk Students"
      subtitle={`${AT_RISK_STUDENTS.length} students below 75% attendance`}
    >
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Below 65%', count: AT_RISK_STUDENTS.filter(s => s.attendance < 65).length, color: '#EF4444' },
          { label: '65–74%', count: AT_RISK_STUDENTS.filter(s => s.attendance >= 65 && s.attendance < 75).length, color: '#F59E0B' },
          { label: 'Total At-Risk', count: AT_RISK_STUDENTS.length, color: '#8B5CF6' },
        ].map(stat => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5"
          >
            <div className="font-heading text-3xl font-bold" style={{ color: stat.color }}>{stat.count}</div>
            <div className="text-white/40 text-xs mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h2 className="font-heading text-base font-semibold text-white">At-Risk Student List</h2>
          </div>
          <button
            onClick={exportCSV}
            className="btn-ghost text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {[
                  { key: 'name', label: 'Student' },
                  { key: 'subject', label: 'Subject' },
                  { key: 'attendance', label: 'Attendance' },
                ].map(col => (
                  <th key={col.key} className="cursor-pointer select-none" onClick={() => handleSort(col.key as any)}>
                    <span className="flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown className="w-3 h-3 opacity-50" />
                    </span>
                  </th>
                ))}
                <th>Department</th>
                <th>Roll No</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((student, i) => {
                const status = getAttendanceStatus(student.attendance)
                const color = getStatusColor(status)
                return (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                          style={{ background: `${color}20` }}
                        >
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-medium text-white">{student.name}</span>
                      </div>
                    </td>
                    <td className="text-white/60">{student.subject}</td>
                    <td>
                      <span className="font-heading font-bold" style={{ color }}>
                        {student.attendance}%
                      </span>
                    </td>
                    <td className="text-white/50">{student.department}</td>
                    <td className="text-white/40 text-xs">{student.rollNo}</td>
                    <td>
                      <span className={status === 'danger' ? 'badge-danger' : 'badge-warning'}>
                        {status === 'danger' ? '🔴' : '🟡'} {status === 'danger' ? 'Danger' : 'Warning'}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  )
}
