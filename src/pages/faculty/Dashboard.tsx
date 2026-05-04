import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Clock, Calendar, TrendingUp, FileText, Brain } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import AnimatedCounter from '../../components/charts/AnimatedCounter'
import { TODAYS_CLASSES, FACULTIES } from '../../lib/mockData'

interface FacultyDashboardProps {
  onLogout: () => void
}

export default function FacultyDashboard({ onLogout }: FacultyDashboardProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const faculty = FACULTIES[0] // Demo: always Dr. Priya Sharma

  const stats = [
    { label: 'Classes Today', value: TODAYS_CLASSES.length, icon: Calendar, color: '#4F8EF7' },
    { label: 'Classes This Month', value: faculty.classesTaken, icon: CheckSquare, color: '#10B981' },
    { label: 'Leave Days Used', value: faculty.leaveDays, icon: FileText, color: '#F59E0B' },
    { label: 'Marking Rate', value: Math.round((faculty.classesTaken / faculty.classesScheduled) * 100), icon: TrendingUp, color: '#8B5CF6', suffix: '%' },
  ]

  return (
    <PageWrapper
      role="faculty"
      userName={user.name || 'Faculty'}
      onLogout={onLogout}
      title="Faculty Dashboard"
      subtitle={`Welcome back, ${user.name?.split(' ')[0] || 'Professor'}`}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              <span className="text-white/40 text-xs">{stat.label}</span>
            </div>
            <div className="font-heading text-3xl font-bold" style={{ color: stat.color }}>
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Today's Classes */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="font-heading text-lg font-semibold text-white">Today's Classes</h2>
        </div>
        <div className="space-y-3">
          {TODAYS_CLASSES.map((cls, i) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.1)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #4F8EF7, #6366F1)' }}
              >
                {cls.subject}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{cls.subjectFull}</p>
                <p className="text-white/40 text-xs">{cls.section} · Room {cls.room}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-white/50 text-xs mb-1">
                  <Clock className="w-3 h-3" />
                  {cls.time}
                </div>
                <span className="text-xs text-white/30">{cls.students.length} students</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Subjects */}
      <div className="card p-6">
        <h2 className="font-heading text-lg font-semibold text-white mb-4">My Subjects</h2>
        <div className="flex gap-3">
          {faculty.subjects.map(subject => (
            <div
              key={subject}
              className="flex-1 p-4 rounded-xl text-center"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
            >
              <div className="font-heading text-lg font-bold text-emerald-400">{subject}</div>
              <div className="text-xs text-white/30 mt-1">Active Subject</div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
