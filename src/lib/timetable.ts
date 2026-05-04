export interface FacultyConstraint {
  id: string
  name: string
  subjects: string[]
  maxHoursPerWeek: number
  color: string
}

export interface TimetableSlot {
  day: string
  startTime: string
  endTime: string
  subject: string
  faculty: string
  facultyId: string
  room: string
  color: string
}

export interface TimetableGrid {
  [day: string]: TimetableSlot[]
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const ROOMS = ['101', '102', '103', '104', '201', '202', '203', 'Lab-1', 'Lab-2']
const COLORS = [
  '#4F8EF7', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899',
  '#06B6D4', '#84CC16', '#F97316', '#EF4444', '#6366F1'
]

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export function generateTimeSlots(startTime: string, endTime: string, classDuration: number) {
  const startMin = timeToMinutes(startTime)
  const endMin = timeToMinutes(endTime)
  const slots: { start: string; end: string }[] = []
  let classesSinceBreak = 0
  let t = startMin
  
  while (t + classDuration <= endMin) {
    const slotStart = minutesToTime(t)
    const slotEnd = minutesToTime(t + classDuration)
    slots.push({ start: slotStart, end: slotEnd })
    
    t += classDuration
    classesSinceBreak += 1
    
    // Add 30 min break after every 2 classes
    if (classesSinceBreak >= 2 && t + 30 <= endMin) {
      t += 30 // Skip 30 mins for break
      classesSinceBreak = 0
    }
  }
  return slots
}

export function generateTimetable(
  faculties: FacultyConstraint[],
  startTime = '09:00',
  endTime = '17:00',
  classDuration = 60,
  workingDays = DAYS,
  dayEndTimes: Record<string, string> = {}
): TimetableGrid {
  const grid: TimetableGrid = {}
  for (const day of workingDays) {
    grid[day] = []
  }

  // Track hours used per faculty
  const hoursUsed: Record<string, number> = {}
  for (const f of faculties) {
    hoursUsed[f.id] = 0
  }

  // Assign colors to faculties
  const facultyColorMap: Record<string, string> = {}
  faculties.forEach((f, i) => {
    facultyColorMap[f.id] = f.color || COLORS[i % COLORS.length]
  })

  // Build time slots per day (respects half-day end times)
  const daySlotsMap: Record<string, string[]> = {}
  for (const day of workingDays) {
    const dayEnd = dayEndTimes[day] || endTime
    const slots = generateTimeSlots(startTime, dayEnd, classDuration)
    daySlotsMap[day] = slots.map(s => s.start)
  }

  // Build a list of all subject-faculty assignments to schedule
  const assignments: Array<{ faculty: FacultyConstraint; subject: string }> = []
  for (const faculty of faculties) {
    for (const subject of faculty.subjects) {
      for (let i = 0; i < 3; i++) {
        assignments.push({ faculty, subject })
      }
    }
  }

  // Shuffle
  for (let i = assignments.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [assignments[i], assignments[j]] = [assignments[j], assignments[i]]
  }

  // Greedy placement
  for (const { faculty, subject } of assignments) {
    if ((hoursUsed[faculty.id] + classDuration / 60) > faculty.maxHoursPerWeek) continue

    let placed = false
    for (const day of workingDays) {
      if (placed) break
      for (const slot of daySlotsMap[day]) {
        if (placed) break

        const slotEnd = minutesToTime(timeToMinutes(slot) + classDuration)

        const conflict = grid[day].some(
          s => timeToMinutes(s.startTime) < timeToMinutes(slotEnd) &&
            timeToMinutes(s.endTime) > timeToMinutes(slot)
        )

        if (!conflict) {
          const room = ROOMS[Math.floor(Math.random() * ROOMS.length)]
          grid[day].push({
            day, startTime: slot, endTime: slotEnd,
            subject, faculty: faculty.name, facultyId: faculty.id,
            room, color: facultyColorMap[faculty.id],
          })
          hoursUsed[faculty.id] += classDuration / 60
          placed = true
        }
      }
    }
  }

  // Sort each day by start time
  for (const day of workingDays) {
    grid[day].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
  }

  return grid
}

export function detectConflicts(grid: TimetableGrid): string[] {
  const conflicts: string[] = []

  for (const [day, slots] of Object.entries(grid)) {
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const a = slots[i]
        const b = slots[j]
        if (
          a.facultyId === b.facultyId &&
          timeToMinutes(a.startTime) < timeToMinutes(b.endTime) &&
          timeToMinutes(a.endTime) > timeToMinutes(b.startTime)
        ) {
          conflicts.push(
            `Conflict on ${day}: ${a.faculty} has both ${a.subject} (${a.startTime}-${a.endTime}) and ${b.subject} (${b.startTime}-${b.endTime})`
          )
        }
      }
    }
  }

  return conflicts
}
