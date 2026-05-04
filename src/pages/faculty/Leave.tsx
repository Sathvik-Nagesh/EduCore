import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Plus, Send } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import toast from 'react-hot-toast'
import { LEAVE_REQUESTS } from '../../lib/mockData'
import type { LeaveRequest } from '../../lib/mockData'

interface LeavePageProps {
  onLogout: () => void
}

export default function LeavePage({ onLogout }: LeavePageProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const [showForm, setShowForm] = useState(false)
  const [leaves, setLeaves] = useState<LeaveRequest[]>(LEAVE_REQUESTS)
  const [form, setForm] = useState({
    fromDate: '',
    toDate: '',
    reason: '',
    type: 'Medical' as 'Medical' | 'Personal' | 'Official',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await new Promise(res => setTimeout(res, 1000))

    const newLeave: LeaveRequest = {
      id: `lr${Date.now()}`,
      facultyId: 'fac1',
      facultyName: user.name || 'Faculty',
      ...form,
      status: 'Pending',
    }
    setLeaves(prev => [newLeave, ...prev])
    setForm({ fromDate: '', toDate: '', reason: '', type: 'Medical' })
    setShowForm(false)
    setSubmitting(false)
    toast.success('Leave request submitted! ✅')
  }

  const myLeaves = leaves.filter(l => l.facultyId === 'fac1' || l.facultyName === user.name)

  return (
    <PageWrapper
      role="faculty"
      userName={user.name || 'Faculty'}
      onLogout={onLogout}
      title="Leave Management"
      subtitle="Apply for and track your leave requests"
    >
      {/* Apply button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {/* Application Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="card p-6" style={{ border: '1px solid rgba(79,142,247,0.2)' }}>
              <h2 className="font-heading text-lg font-semibold text-white mb-5">New Leave Application</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="section-label mb-2 block">From Date</label>
                    <input
                      type="date"
                      value={form.fromDate}
                      onChange={e => setForm({ ...form, fromDate: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="section-label mb-2 block">To Date</label>
                    <input
                      type="date"
                      value={form.toDate}
                      onChange={e => setForm({ ...form, toDate: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="section-label mb-2 block">Leave Type</label>
                    <select
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="Medical" style={{ background: '#1A1D2E' }}>Medical</option>
                      <option value="Personal" style={{ background: '#1A1D2E' }}>Personal</option>
                      <option value="Official" style={{ background: '#1A1D2E' }}>Official</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="section-label mb-2 block">Reason</label>
                  <textarea
                    value={form.reason}
                    onChange={e => setForm({ ...form, reason: e.target.value })}
                    placeholder="Briefly describe the reason for leave..."
                    rows={3}
                    className="input-field resize-none"
                    required
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 text-sm">
                    {submitting ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave History */}
      <div className="card p-6">
        <h2 className="font-heading text-lg font-semibold text-white mb-5">Leave History</h2>
        <div className="space-y-3">
          {myLeaves.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">No leave requests yet</p>
          ) : (
            myLeaves.map((leave, i) => (
              <motion.div
                key={leave.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <FileText className="w-5 h-5 text-white/30 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{leave.reason}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {leave.fromDate} → {leave.toDate} · <span className="text-white/60">{leave.type}</span>
                  </p>
                </div>
                <span className={`badge-${leave.status.toLowerCase()}`}>
                  {leave.status === 'Pending' ? '🟡' : leave.status === 'Approved' ? '🟢' : '🔴'} {leave.status}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
