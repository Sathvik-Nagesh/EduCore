import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, FileText, Clock } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import { LEAVE_REQUESTS } from '../../lib/mockData'
import type { LeaveRequest } from '../../lib/mockData'
import toast from 'react-hot-toast'

interface LeaveApprovalsPageProps {
  onLogout: () => void
}

export default function LeaveApprovalsPage({ onLogout }: LeaveApprovalsPageProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const [leaves, setLeaves] = useState<LeaveRequest[]>(LEAVE_REQUESTS)
  const [processing, setProcessing] = useState<string | null>(null)

  const pending = leaves.filter(l => l.status === 'Pending')
  const resolved = leaves.filter(l => l.status !== 'Pending')

  const handle = async (id: string, action: 'Approved' | 'Rejected') => {
    setProcessing(id)
    await new Promise(res => setTimeout(res, 800))
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: action } : l))
    setProcessing(null)
    const msg = action === 'Approved' ? 'Leave approved ✅' : 'Leave rejected ❌'
    toast.success(msg)
  }

  return (
    <PageWrapper
      role="admin"
      userName={user.name || 'Admin'}
      onLogout={onLogout}
      title="Leave Approvals"
      subtitle={`${pending.length} pending request${pending.length !== 1 ? 's' : ''}`}
    >
      {/* Pending */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <h2 className="font-heading text-lg font-bold text-navy-800">Pending Requests</h2>
          {pending.length > 0 && (
            <span className="badge-pending">{pending.length}</span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="card p-12 text-center text-navy-300 font-bold text-sm bg-navy-50/50 border-dashed">
            No pending leave requests 🎉
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((leave, i) => (
              <motion.div
                key={leave.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ delay: i * 0.08 }}
                className="card p-5 flex items-center gap-4 border-amber-100 bg-amber-50/30 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-navy-800 font-bold text-sm">{leave.facultyName}</p>
                    <span className="badge-pending">{leave.type}</span>
                  </div>
                  <p className="text-navy-600 font-medium text-xs leading-relaxed">{leave.reason}</p>
                  <div className="flex items-center gap-1 text-navy-400 font-bold text-[10px] uppercase tracking-wider mt-1">
                    <Clock className="w-3 h-3" />
                    {leave.fromDate} → {leave.toDate}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handle(leave.id, 'Approved')}
                    disabled={processing === leave.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all text-xs font-bold shadow-sm"
                  >
                    {processing === leave.id ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-300 border-t-emerald-700 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handle(leave.id, 'Rejected')}
                    disabled={processing === leave.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-all text-xs font-bold shadow-sm"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <h2 className="font-heading text-lg font-bold text-navy-800 mb-4">Leave History</h2>
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Faculty</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {resolved.map((leave, i) => (
                  <motion.tr
                    key={leave.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td className="text-navy-800 font-bold">{leave.facultyName}</td>
                    <td className="text-navy-400 font-bold text-xs">{leave.type}</td>
                    <td className="text-navy-300 font-bold text-[10px] uppercase tracking-wider">{leave.fromDate} → {leave.toDate}</td>
                    <td className="text-navy-400 font-medium text-xs max-w-[200px] truncate">{leave.reason}</td>
                    <td>
                      <span className={leave.status === 'Approved' ? 'badge-approved' : 'badge-rejected'}>
                        {leave.status === 'Approved' ? '🟢' : '🔴'} {leave.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  )
}
