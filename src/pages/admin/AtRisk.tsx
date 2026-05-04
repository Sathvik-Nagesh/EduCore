import { ShieldAlert, Download, ArrowUpDown } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import { AT_RISK_STUDENTS as MOCK_STUDENTS } from '../../lib/mockData'
import { getAttendanceStatus, getStatusColor } from '../../lib/predictions'
import { getAllAttendance } from '../../lib/supabase'
import { useEffect } from 'react'

interface AtRiskPageProps {
  onLogout: () => void
}

export default function AtRiskPage({ onLogout }: AtRiskPageProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const [students, setStudents] = useState<any[]>(MOCK_STUDENTS)
  const [sortBy, setSortBy] = useState<'attendance' | 'name' | 'subject'>('attendance')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getAllAttendance().then(records => {
      if (!records || records.length === 0) {
        setIsLoading(false)
        return
      }

      // Group by Student + Subject
      const riskMap: Record<string, any> = {}
      records.forEach(r => {
        const key = `${r.student_id}_${r.subject_id}`
        if (!riskMap[key]) {
          riskMap[key] = {
            id: key,
            name: r.profiles?.name || 'Unknown',
            rollNo: r.profiles?.roll_no || 'N/A',
            subject: r.subjects?.name || 'Subject',
            department: r.profiles?.department || 'Gen',
            attended: 0,
            total: 0
          }
        }
        riskMap[key].total++
        if (r.is_present) riskMap[key].attended++
      })

      const realRisk = Object.values(riskMap)
        .map(s => ({ ...s, attendance: Math.round((s.attended / s.total) * 100) }))
        .filter(s => s.attendance < 75)

      if (realRisk.length > 0) setStudents(realRisk)
      setIsLoading(false)
    }).catch(() => setIsLoading(false))
  }, [])

  const sorted = [...students].sort((a, b) => {
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
      subtitle={`${students.length} students below 75% attendance`}
    >
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Below 65%', count: students.filter(s => s.attendance < 65).length, color: '#EF4444' },
          { label: '65–74%', count: students.filter(s => s.attendance >= 65 && s.attendance < 75).length, color: '#F59E0B' },
          { label: 'Total At-Risk', count: students.length, color: '#2563EB' },
        ].map(stat => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5 border-slate-100 shadow-sm"
          >
            <div className="font-heading text-3xl font-black" style={{ color: stat.color }}>{stat.count}</div>
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h2 className="font-heading text-lg font-bold text-slate-800">At-Risk Student List</h2>
          </div>
          <button
            onClick={exportCSV}
            className="text-[10px] font-black text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-2xl transition-all flex items-center gap-2 shadow-xl hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest"
          >
            <Download className="w-3.5 h-3.5" /> Export Data
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
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shadow-sm"
                          style={{ background: `${color}15`, color: color, border: `1px solid ${color}30` }}
                        >
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800">{student.name}</span>
                      </div>
                    </td>
                    <td className="text-slate-500 font-bold text-xs">{student.subject}</td>
                    <td>
                      <span className="font-heading font-black text-lg" style={{ color }}>
                        {student.attendance}%
                      </span>
                    </td>
                    <td className="text-slate-500 font-bold text-xs">{student.department}</td>
                    <td className="text-slate-300 font-bold text-[10px] uppercase tracking-wider">{student.rollNo}</td>
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
