export type AttendanceStatus = 'safe' | 'warning' | 'danger'

export function getAttendanceStatus(percentage: number): AttendanceStatus {
  if (percentage >= 75) return 'safe'
  if (percentage >= 65) return 'warning'
  return 'danger'
}

export function getStatusColor(status: AttendanceStatus): string {
  switch (status) {
    case 'safe': return '#10B981'
    case 'warning': return '#F59E0B'
    case 'danger': return '#EF4444'
  }
}

export function getStatusLabel(status: AttendanceStatus): string {
  switch (status) {
    case 'safe': return 'Safe'
    case 'warning': return 'Warning'
    case 'danger': return 'Danger'
  }
}

/**
 * Calculate how many more classes a student can skip
 * before dropping below the threshold (default 75%)
 * Formula: floor((attended - threshold * total) / (1 - threshold))
 */
export function calculateSkippableClasses(
  attended: number,
  total: number,
  threshold = 0.75
): number {
  const skippable = Math.floor((attended - threshold * total) / (1 - threshold))
  return Math.max(0, skippable)
}

/**
 * Calculate how many classes needed to attend to reach threshold
 */
export function classesNeededToReach(
  attended: number,
  total: number,
  remainingClasses: number,
  threshold = 0.75
): number {
  // (attended + x) / (total + x) >= threshold
  // attended + x >= threshold * total + threshold * x
  // x(1 - threshold) >= threshold * total - attended
  // x >= (threshold * total - attended) / (1 - threshold)
  const needed = Math.ceil((threshold * total - attended) / (1 - threshold))
  return Math.max(0, Math.min(needed, remainingClasses))
}

export function generatePredictionMessage(
  subject: string,
  attended: number,
  total: number,
  remainingClasses = 20
): string {
  const percentage = (attended / total) * 100
  const status = getAttendanceStatus(percentage)
  const skippable = calculateSkippableClasses(attended, total)
  const needed = classesNeededToReach(attended, total, remainingClasses)

  if (status === 'safe') {
    if (skippable === 0) {
      return `You're right at the 75% threshold in ${subject}. Don't skip any more classes!`
    }
    return `You can skip up to ${skippable} more class${skippable !== 1 ? 'es' : ''} in ${subject} safely.`
  } else if (status === 'warning') {
    return `⚠️ You'll fall below 75% in ${subject} if you skip even 1 more class. Attend the next ${needed} to recover.`
  } else {
    if (needed <= remainingClasses) {
      return `🔴 You need to attend the next ${needed} consecutive classes in ${subject} to reach 75%.`
    }
    return `🚨 Detention risk in ${subject}! You cannot reach 75% even if you attend all remaining ${remainingClasses} classes.`
  }
}

export function getMotivationalMessage(percentage: number): string {
  if (percentage >= 90) return "🏆 Outstanding performance! You're among the top 5% of students."
  if (percentage >= 80) return "✨ Excellent attendance. Keep maintaining this consistency!"
  if (percentage >= 75) return "✅ You are currently safe, but don't let your guard down."
  if (percentage >= 65) return "⚠️ WARNING ZONE: You're close to detention. Attend every class from now on!"
  return "🔴 CRITICAL ALERT: Attendance below 65%. Immediate recovery required!"
}
