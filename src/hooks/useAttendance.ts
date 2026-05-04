import { useState, useEffect } from 'react'
import { STUDENT_ATTENDANCE, HEATMAP_DATA, calculateStreak } from '../lib/mockData'
import { getAttendanceStatus, calculateSkippableClasses, generatePredictionMessage } from '../lib/predictions'

export interface SubjectAttendanceSummary {
  subjectId: string
  subjectName: string
  code: string
  attended: number
  total: number
  percentage: number
  status: 'safe' | 'warning' | 'danger'
  skippable: number
  prediction: string
}

export function useAttendance() {
  const [attendance, setAttendance] = useState<SubjectAttendanceSummary[]>([])
  const [overallPercentage, setOverallPercentage] = useState(0)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  const SUBJECT_MAP: Record<string, { name: string; code: string }> = {
    sub1: { name: 'Database Management Systems', code: 'DBMS' },
    sub2: { name: 'Data Structures & Algorithms', code: 'DSA' },
    sub3: { name: 'Operating Systems', code: 'OS' },
    sub4: { name: 'Computer Networks', code: 'CN' },
    sub5: { name: 'Machine Learning', code: 'ML' },
  }

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      const summaries: SubjectAttendanceSummary[] = STUDENT_ATTENDANCE.map(record => {
        const subject = SUBJECT_MAP[record.subjectId] || { name: 'Unknown', code: '???' }
        const status = getAttendanceStatus(record.percentage)
        const skippable = calculateSkippableClasses(record.attended, record.total)
        const prediction = generatePredictionMessage(subject.code, record.attended, record.total)

        return {
          subjectId: record.subjectId,
          subjectName: subject.name,
          code: subject.code,
          attended: record.attended,
          total: record.total,
          percentage: record.percentage,
          status,
          skippable,
          prediction,
        }
      })

      setAttendance(summaries)

      const totalAttended = STUDENT_ATTENDANCE.reduce((sum, r) => sum + r.attended, 0)
      const totalClasses = STUDENT_ATTENDANCE.reduce((sum, r) => sum + r.total, 0)
      setOverallPercentage(Math.round((totalAttended / totalClasses) * 100))

      setStreak(calculateStreak(HEATMAP_DATA))
      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  return { attendance, overallPercentage, streak, heatmapData: HEATMAP_DATA, loading }
}
