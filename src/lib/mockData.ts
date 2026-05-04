import { format, subDays, eachDayOfInterval } from 'date-fns'

// ============================================
// TYPES
// ============================================

export interface Subject {
  id: string
  name: string
  code: string
  facultyId: string
  facultyName: string
  department: string
}

export interface AttendanceRecord {
  subjectId: string
  attended: number
  total: number
  percentage: number
}

export interface DailyAttendance {
  date: string
  percentage: number
  present: boolean
}

export interface Student {
  id: string
  name: string
  email: string
  department: string
  year: number
  rollNo: string
}

export interface Faculty {
  id: string
  name: string
  email: string
  department: string
  subjects: string[]
  classesScheduled: number
  classesTaken: number
  leaveDays: number
}

export interface LeaveRequest {
  id: string
  facultyId: string
  facultyName: string
  fromDate: string
  toDate: string
  reason: string
  type: 'Medical' | 'Personal' | 'Official'
  status: 'Pending' | 'Approved' | 'Rejected'
}

export interface AIInteraction {
  id: string
  studentId: string
  subjectId: string
  subjectName: string
  query: string
  createdAt: string
}

export interface ClassStudent {
  id: string
  name: string
  rollNo: string
  present: boolean
}

// ============================================
// SUBJECTS
// ============================================

export const SUBJECTS: Subject[] = [
  { id: 'sub1', name: 'Database Management Systems', code: 'DBMS', facultyId: 'fac1', facultyName: 'Dr. Priya Sharma', department: 'CSE' },
  { id: 'sub2', name: 'Data Structures & Algorithms', code: 'DSA', facultyId: 'fac2', facultyName: 'Prof. Rahul Mehta', department: 'CSE' },
  { id: 'sub3', name: 'Operating Systems', code: 'OS', facultyId: 'fac1', facultyName: 'Dr. Priya Sharma', department: 'CSE' },
  { id: 'sub4', name: 'Computer Networks', code: 'CN', facultyId: 'fac3', facultyName: 'Dr. Anita Rao', department: 'CSE' },
  { id: 'sub5', name: 'Machine Learning', code: 'ML', facultyId: 'fac2', facultyName: 'Prof. Rahul Mehta', department: 'CSE' },
]

// ============================================
// STUDENT ATTENDANCE (realistic seed data)
// ============================================

export const STUDENT_ATTENDANCE: AttendanceRecord[] = [
  { subjectId: 'sub1', attended: 24, total: 39, percentage: 61.5 }, // DBMS - DANGER
  { subjectId: 'sub2', attended: 35, total: 45, percentage: 77.8 }, // DSA - SAFE
  { subjectId: 'sub3', attended: 30, total: 42, percentage: 71.4 }, // OS - WARNING
  { subjectId: 'sub4', attended: 20, total: 36, percentage: 55.6 }, // CN - DANGER
  { subjectId: 'sub5', attended: 38, total: 44, percentage: 86.4 }, // ML - SAFE
]

// ============================================
// HEATMAP DATA (last 30 days)
// ============================================

function generateHeatmapData(): DailyAttendance[] {
  const today = new Date()
  const days = eachDayOfInterval({
    start: subDays(today, 29),
    end: today,
  })

  return days.map((day, index) => {
    const dayOfWeek = day.getDay()
    // Weekend = no class
    if (dayOfWeek === 0) return { date: format(day, 'yyyy-MM-dd'), percentage: 0, present: false }

    // Simulate some holidays and drops
    const isHoliday = [5, 12, 18].includes(index)
    if (isHoliday) return { date: format(day, 'yyyy-MM-dd'), percentage: 0, present: false }

    // Realistic attendance pattern with some low days
    const basePct = 68 + Math.sin(index * 0.5) * 15
    const noise = (Math.random() - 0.5) * 20
    const pct = Math.min(100, Math.max(20, basePct + noise))

    return {
      date: format(day, 'yyyy-MM-dd'),
      percentage: Math.round(pct),
      present: pct > 50,
    }
  })
}

export const HEATMAP_DATA: DailyAttendance[] = generateHeatmapData()

// ============================================
// STREAK CALCULATION
// ============================================

export function calculateStreak(heatmapData: DailyAttendance[]): number {
  let streak = 0
  const reversed = [...heatmapData].reverse()
  for (const day of reversed) {
    if (day.present && day.percentage > 0) {
      streak++
    } else {
      break
    }
  }
  return streak
}

// ============================================
// CAMPUS METRICS (for admin)
// ============================================

export const CAMPUS_METRICS = {
  totalStudents: 847,
  campusAttendanceToday: 73,
  facultyPresentToday: 18,
  aiSessionsToday: 142,
}

// ============================================
// DEPARTMENT ATTENDANCE (for admin charts)
// ============================================

export const DEPARTMENT_ATTENDANCE = [
  { department: 'CSE', attendance: 71 },
  { department: 'ECE', attendance: 78 },
  { department: 'MECH', attendance: 65 },
  { department: 'CIVIL', attendance: 82 },
  { department: 'IT', attendance: 74 },
  { department: 'MBA', attendance: 69 },
]

// ============================================
// 30-DAY TREND (for admin line chart)
// ============================================

export function generateTrendData() {
  const today = new Date()
  return Array.from({ length: 30 }, (_, i) => {
    const date = subDays(today, 29 - i)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { date: format(date, 'MMM dd'), attendance: null }
    }
    const base = 72
    const noise = (Math.sin(i * 0.8) * 10) + (Math.random() - 0.5) * 8
    return {
      date: format(date, 'MMM dd'),
      attendance: Math.round(Math.min(95, Math.max(45, base + noise))),
    }
  })
}

export const TREND_DATA = generateTrendData()

// ============================================
// AT-RISK STUDENTS (for admin panel)
// ============================================

export const AT_RISK_STUDENTS: Array<{
  id: string; name: string; rollNo: string;
  subject: string; attendance: number; department: string
}> = [
  { id: 's1', name: 'Arjun Nair', rollNo: 'CSE21001', subject: 'Computer Networks', attendance: 45, department: 'CSE' },
  { id: 's2', name: 'Sneha Patel', rollNo: 'CSE21045', subject: 'DBMS', attendance: 58, department: 'CSE' },
  { id: 's3', name: 'Vikram Singh', rollNo: 'CSE21089', subject: 'Computer Networks', attendance: 52, department: 'CSE' },
  { id: 's4', name: 'Priya Menon', rollNo: 'CSE21023', subject: 'Operating Systems', attendance: 63, department: 'CSE' },
  { id: 's5', name: 'Rohan Das', rollNo: 'CSE21067', subject: 'DBMS', attendance: 61, department: 'CSE' },
  { id: 's6', name: 'Kavya Reddy', rollNo: 'ECE21012', subject: 'Computer Networks', attendance: 48, department: 'ECE' },
  { id: 's7', name: 'Aditya Kumar', rollNo: 'CSE21034', subject: 'Operating Systems', attendance: 67, department: 'CSE' },
  { id: 's8', name: 'Divya Sharma', rollNo: 'CSE21078', subject: 'DBMS', attendance: 55, department: 'CSE' },
]

// ============================================
// FACULTY DATA
// ============================================

export const FACULTIES: Faculty[] = [
  { id: 'fac1', name: 'Dr. Priya Sharma', email: 'priya@educore.in', department: 'CSE', subjects: ['DBMS', 'Operating Systems'], classesScheduled: 48, classesTaken: 42, leaveDays: 3 },
  { id: 'fac2', name: 'Prof. Rahul Mehta', email: 'rahul@educore.in', department: 'CSE', subjects: ['Data Structures', 'Machine Learning'], classesScheduled: 52, classesTaken: 50, leaveDays: 1 },
  { id: 'fac3', name: 'Dr. Anita Rao', email: 'anita@educore.in', department: 'CSE', subjects: ['Computer Networks'], classesScheduled: 36, classesTaken: 30, leaveDays: 5 },
]

// ============================================
// LEAVE REQUESTS
// ============================================

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'lr1', facultyId: 'fac3', facultyName: 'Dr. Anita Rao', fromDate: '2025-05-10', toDate: '2025-05-12', reason: 'Medical checkup and recovery', type: 'Medical', status: 'Pending' },
  { id: 'lr2', facultyId: 'fac1', facultyName: 'Dr. Priya Sharma', fromDate: '2025-04-20', toDate: '2025-04-21', reason: 'Family function', type: 'Personal', status: 'Approved' },
  { id: 'lr3', facultyId: 'fac2', facultyName: 'Prof. Rahul Mehta', fromDate: '2025-04-15', toDate: '2025-04-15', reason: 'Conference at IIT Bombay', type: 'Official', status: 'Approved' },
  { id: 'lr4', facultyId: 'fac3', facultyName: 'Dr. Anita Rao', fromDate: '2025-03-28', toDate: '2025-03-29', reason: 'Personal emergency', type: 'Personal', status: 'Rejected' },
]

// ============================================
// AI INTERACTIONS (for admin engagement chart)
// ============================================

export const AI_INTERACTIONS: AIInteraction[] = [
  { id: 'ai1', studentId: 'stu1', subjectId: 'sub1', subjectName: 'DBMS', query: 'Explain normalization', createdAt: '2025-05-01T09:00:00Z' },
  { id: 'ai2', studentId: 'stu2', subjectId: 'sub4', subjectName: 'Computer Networks', query: 'What is OSI model?', createdAt: '2025-05-01T09:15:00Z' },
  { id: 'ai3', studentId: 'stu1', subjectId: 'sub1', subjectName: 'DBMS', query: 'Quiz me on Chapter 2', createdAt: '2025-05-01T10:00:00Z' },
  { id: 'ai4', studentId: 'stu3', subjectId: 'sub2', subjectName: 'Data Structures', query: 'Explain binary trees', createdAt: '2025-05-01T10:30:00Z' },
  { id: 'ai5', studentId: 'stu2', subjectId: 'sub5', subjectName: 'Machine Learning', query: 'What is gradient descent?', createdAt: '2025-05-01T11:00:00Z' },
  { id: 'ai6', studentId: 'stu4', subjectId: 'sub1', subjectName: 'DBMS', query: 'Explain ER diagrams', createdAt: '2025-05-02T09:00:00Z' },
  { id: 'ai7', studentId: 'stu5', subjectId: 'sub4', subjectName: 'Computer Networks', query: 'TCP vs UDP', createdAt: '2025-05-02T09:30:00Z' },
  { id: 'ai8', studentId: 'stu1', subjectId: 'sub3', subjectName: 'Operating Systems', query: 'What is deadlock?', createdAt: '2025-05-02T10:00:00Z' },
  { id: 'ai9', studentId: 'stu6', subjectId: 'sub2', subjectName: 'Data Structures', query: 'Sorting algorithms comparison', createdAt: '2025-05-02T11:00:00Z' },
  { id: 'ai10', studentId: 'stu2', subjectId: 'sub1', subjectName: 'DBMS', query: 'ACID properties', createdAt: '2025-05-02T11:30:00Z' },
  { id: 'ai11', studentId: 'stu7', subjectId: 'sub5', subjectName: 'Machine Learning', query: 'Explain neural networks', createdAt: '2025-05-03T09:00:00Z' },
  { id: 'ai12', studentId: 'stu3', subjectId: 'sub4', subjectName: 'Computer Networks', query: 'IP addressing', createdAt: '2025-05-03T09:30:00Z' },
  { id: 'ai13', studentId: 'stu8', subjectId: 'sub1', subjectName: 'DBMS', query: 'SQL joins explained', createdAt: '2025-05-03T10:00:00Z' },
  { id: 'ai14', studentId: 'stu4', subjectId: 'sub3', subjectName: 'Operating Systems', query: 'Process scheduling', createdAt: '2025-05-03T10:30:00Z' },
  { id: 'ai15', studentId: 'stu5', subjectId: 'sub2', subjectName: 'Data Structures', query: 'Graph traversal BFS DFS', createdAt: '2025-05-03T11:00:00Z' },
  { id: 'ai16', studentId: 'stu9', subjectId: 'sub5', subjectName: 'Machine Learning', query: 'Overfitting and underfitting', createdAt: '2025-05-04T09:00:00Z' },
  { id: 'ai17', studentId: 'stu1', subjectId: 'sub4', subjectName: 'Computer Networks', query: 'Routing protocols', createdAt: '2025-05-04T09:30:00Z' },
  { id: 'ai18', studentId: 'stu6', subjectId: 'sub1', subjectName: 'DBMS', query: 'Transactions and concurrency', createdAt: '2025-05-04T10:00:00Z' },
  { id: 'ai19', studentId: 'stu2', subjectId: 'sub3', subjectName: 'Operating Systems', query: 'Memory management paging', createdAt: '2025-05-04T10:30:00Z' },
  { id: 'ai20', studentId: 'stu3', subjectId: 'sub5', subjectName: 'Machine Learning', query: 'Decision trees', createdAt: '2025-05-04T11:00:00Z' },
]

export function getAIEngagementBySubject() {
  const counts: Record<string, number> = {}
  for (const interaction of AI_INTERACTIONS) {
    counts[interaction.subjectName] = (counts[interaction.subjectName] || 0) + 1
  }
  return Object.entries(counts)
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count)
}

// ============================================
// TODAY'S CLASSES (for faculty)
// ============================================

export const TODAYS_CLASSES = [
  {
    id: 'cls1',
    subject: 'DBMS',
    subjectFull: 'Database Management Systems',
    time: '9:00 AM - 10:00 AM',
    room: '204',
    section: 'CSE-B',
    students: generateClassStudents(35),
  },
  {
    id: 'cls2',
    subject: 'OS',
    subjectFull: 'Operating Systems',
    time: '11:00 AM - 12:00 PM',
    room: '106',
    section: 'CSE-A',
    students: generateClassStudents(38),
  },
]

function generateClassStudents(count: number): ClassStudent[] {
  const names = [
    'Aarav Patel', 'Aditi Sharma', 'Akash Verma', 'Anika Singh', 'Arjun Nair',
    'Deepa Menon', 'Dev Kumar', 'Divya Reddy', 'Gautam Rao', 'Ishaan Malhotra',
    'Kavya Joshi', 'Kiran Pillai', 'Manav Gupta', 'Meera Iyer', 'Nakul Tiwari',
    'Neha Bose', 'Nikhil Sinha', 'Pooja Nambiar', 'Pradeep Pandey', 'Pranav Shah',
    'Priya Chakraborty', 'Rahul Deshpande', 'Riya Kapoor', 'Rohan Mishra', 'Rohini Das',
    'Sanjay Krishnan', 'Shruti Agarwal', 'Smita Banerjee', 'Sourav Mukherjee', 'Swati Jain',
    'Tanvi Saxena', 'Varun Bhatt', 'Vidya Rajan', 'Vikram Kulkarni', 'Vishal Dubey',
    'Yasmin Khan', 'Zara Ahmed', 'Ananya Pillai', 'Bhavesh Mehta', 'Chirag Patel'
  ]

  return Array.from({ length: Math.min(count, names.length) }, (_, i) => ({
    id: `student-${i + 1}`,
    name: names[i],
    rollNo: `CSE21${String(i + 1).padStart(3, '0')}`,
    present: Math.random() > 0.15, // ~85% present by default
  }))
}

// ============================================
// FACULTY SCHEDULE (timetable)
// ============================================

export const FACULTY_SCHEDULE = [
  { day: 'Monday', startTime: '09:00', endTime: '10:00', subject: 'DBMS', room: '204', section: 'CSE-B' },
  { day: 'Monday', startTime: '11:00', endTime: '12:00', subject: 'OS', room: '106', section: 'CSE-A' },
  { day: 'Tuesday', startTime: '10:00', endTime: '11:00', subject: 'DBMS', room: '204', section: 'CSE-A' },
  { day: 'Wednesday', startTime: '09:00', endTime: '10:00', subject: 'OS', room: '106', section: 'CSE-B' },
  { day: 'Wednesday', startTime: '14:00', endTime: '15:00', subject: 'DBMS', room: 'Lab-1', section: 'CSE-B' },
  { day: 'Thursday', startTime: '11:00', endTime: '12:00', subject: 'OS', room: '106', section: 'CSE-A' },
  { day: 'Friday', startTime: '09:00', endTime: '10:00', subject: 'DBMS', room: '204', section: 'CSE-A' },
  { day: 'Friday', startTime: '14:00', endTime: '15:00', subject: 'OS', room: 'Lab-2', section: 'CSE-B' },
  { day: 'Saturday', startTime: '10:00', endTime: '11:00', subject: 'DBMS', room: '204', section: 'CSE-B' },
]

// Course materials (default placeholder for AI agent)
export const COURSE_MATERIALS: Record<string, string> = {
  'sub1': `DBMS Course Material:
Chapter 1: Introduction to Database Systems
- What is a database? A collection of related data organized for easy access.
- DBMS: Software that manages databases (MySQL, PostgreSQL, Oracle)
- Advantages: Data sharing, security, consistency, reduced redundancy

Chapter 2: Entity-Relationship Model
- Entity: A real-world object (Student, Course)
- Attribute: Property of an entity (name, age)
- Relationship: Association between entities
- ER Diagram notation: Rectangles for entities, ellipses for attributes, diamonds for relationships
- Keys: Primary key (unique identifier), Foreign key (references another table)

Chapter 3: Normalization
- 1NF: Atomic values, no repeating groups
- 2NF: 1NF + no partial dependencies
- 3NF: 2NF + no transitive dependencies
- BCNF: Every determinant is a candidate key

Chapter 4: SQL
- DDL: CREATE, ALTER, DROP
- DML: SELECT, INSERT, UPDATE, DELETE
- DCL: GRANT, REVOKE
- TCL: COMMIT, ROLLBACK, SAVEPOINT
- Joins: INNER, LEFT, RIGHT, FULL OUTER
- Aggregate functions: COUNT, SUM, AVG, MIN, MAX
- GROUP BY, HAVING, ORDER BY

Chapter 5: Transactions
- ACID Properties: Atomicity, Consistency, Isolation, Durability
- Concurrency control: Locks, Timestamp ordering
- Deadlock: Detection and prevention strategies`,
  'sub4': `Computer Networks Course Material:
Chapter 1: Network Fundamentals
- Network: Interconnected devices sharing resources
- Types: LAN, WAN, MAN, PAN
- Topologies: Star, Bus, Ring, Mesh, Hybrid

Chapter 2: OSI Model (7 Layers)
- Layer 7 Application: HTTP, FTP, SMTP, DNS
- Layer 6 Presentation: Encryption, compression, translation
- Layer 5 Session: Session management
- Layer 4 Transport: TCP, UDP, port numbers, segmentation
- Layer 3 Network: IP addressing, routing
- Layer 2 Data Link: MAC addresses, framing, error detection
- Layer 1 Physical: Bits, cables, signals

Chapter 3: TCP/IP Protocol Suite
- TCP: Connection-oriented, reliable, ordered delivery, 3-way handshake
- UDP: Connectionless, unreliable, fast, used for streaming
- IP Addressing: IPv4 (32-bit), IPv6 (128-bit)
- Subnetting: CIDR notation, subnet mask calculation

Chapter 4: Routing
- Routing protocols: RIP, OSPF, BGP
- Static vs Dynamic routing
- NAT and PAT

Chapter 5: Network Security
- Firewalls, IDS/IPS
- Encryption: Symmetric (AES), Asymmetric (RSA)
- VPN, SSL/TLS`,
}

// ============================================
// STUDY MATERIALS (uploaded by faculty)
// ============================================

export interface StudyMaterial {
  id: string
  subjectId: string
  subjectCode: string
  title: string
  description: string
  fileType: 'pdf' | 'ppt' | 'doc' | 'video' | 'link'
  fileSize: string
  uploadedBy: string
  uploadedAt: string
  chapter: string
  downloads: number
  pages?: number
}

export const STUDY_MATERIALS: StudyMaterial[] = [
  // DBMS
  { id: 'm1',  subjectId: 'sub1', subjectCode: 'DBMS', title: 'Introduction to Databases', description: 'Overview of DBMS concepts, types of databases, and architecture.', fileType: 'pdf', fileSize: '2.4 MB', uploadedBy: 'Dr. Priya Sharma', uploadedAt: '2026-04-28', chapter: 'Chapter 1', downloads: 142, pages: 38 },
  { id: 'm2',  subjectId: 'sub1', subjectCode: 'DBMS', title: 'Relational Model & SQL', description: 'Relational algebra, SQL queries, joins, and subqueries with examples.', fileType: 'pdf', fileSize: '3.1 MB', uploadedBy: 'Dr. Priya Sharma', uploadedAt: '2026-05-01', chapter: 'Chapter 2', downloads: 215, pages: 52 },
  { id: 'm3',  subjectId: 'sub1', subjectCode: 'DBMS', title: 'Normalization Slides', description: '1NF through BCNF with worked examples for exam preparation.', fileType: 'ppt', fileSize: '1.8 MB', uploadedBy: 'Dr. Priya Sharma', uploadedAt: '2026-05-03', chapter: 'Chapter 3', downloads: 189 },
  { id: 'm4',  subjectId: 'sub1', subjectCode: 'DBMS', title: 'Transaction Management', description: 'ACID properties, concurrency control, deadlock detection.', fileType: 'pdf', fileSize: '2.9 MB', uploadedBy: 'Dr. Priya Sharma', uploadedAt: '2026-05-03', chapter: 'Chapter 4', downloads: 97, pages: 44 },
  // DSA
  { id: 'm5',  subjectId: 'sub2', subjectCode: 'DSA', title: 'Arrays & Linked Lists', description: 'Fundamental data structures with time complexity analysis.', fileType: 'pdf', fileSize: '1.6 MB', uploadedBy: 'Prof. Rahul Mehta', uploadedAt: '2026-04-25', chapter: 'Chapter 1', downloads: 301, pages: 28 },
  { id: 'm6',  subjectId: 'sub2', subjectCode: 'DSA', title: 'Trees & Graphs', description: 'BST, AVL trees, BFS, DFS — complete with animated diagrams.', fileType: 'ppt', fileSize: '4.2 MB', uploadedBy: 'Prof. Rahul Mehta', uploadedAt: '2026-04-30', chapter: 'Chapter 2', downloads: 276 },
  { id: 'm7',  subjectId: 'sub2', subjectCode: 'DSA', title: 'Sorting Algorithms', description: 'QuickSort, MergeSort, HeapSort — derivations and complexity proofs.', fileType: 'pdf', fileSize: '2.0 MB', uploadedBy: 'Prof. Rahul Mehta', uploadedAt: '2026-05-02', chapter: 'Chapter 3', downloads: 198, pages: 34 },
  // OS
  { id: 'm8',  subjectId: 'sub3', subjectCode: 'OS', title: 'Process Scheduling', description: 'FCFS, SJF, Round Robin, Priority — with Gantt chart examples.', fileType: 'pdf', fileSize: '2.2 MB', uploadedBy: 'Dr. Priya Sharma', uploadedAt: '2026-04-27', chapter: 'Chapter 2', downloads: 163, pages: 40 },
  { id: 'm9',  subjectId: 'sub3', subjectCode: 'OS', title: 'Memory Management', description: 'Paging, segmentation, virtual memory, and page replacement policies.', fileType: 'ppt', fileSize: '3.5 MB', uploadedBy: 'Dr. Priya Sharma', uploadedAt: '2026-05-01', chapter: 'Chapter 3', downloads: 144 },
  { id: 'm10', subjectId: 'sub3', subjectCode: 'OS', title: 'Deadlock Avoidance', description: "Banker's algorithm, resource allocation graphs — complete notes.", fileType: 'pdf', fileSize: '1.4 MB', uploadedBy: 'Dr. Priya Sharma', uploadedAt: '2026-05-03', chapter: 'Chapter 4', downloads: 211, pages: 22 },
  // CN
  { id: 'm11', subjectId: 'sub4', subjectCode: 'CN',   title: 'OSI & TCP/IP Models',  description: 'Layer-by-layer breakdown with real-world protocol mapping.', fileType: 'pdf', fileSize: '2.7 MB', uploadedBy: 'Dr. Anita Rao', uploadedAt: '2026-04-26', chapter: 'Chapter 1', downloads: 188, pages: 36 },
  { id: 'm12', subjectId: 'sub4', subjectCode: 'CN',   title: 'Routing Protocols',    description: 'RIP, OSPF, BGP — configuration examples and comparison.', fileType: 'ppt', fileSize: '2.3 MB', uploadedBy: 'Dr. Anita Rao', uploadedAt: '2026-05-02', chapter: 'Chapter 4', downloads: 122 },
  // ML
  { id: 'm13', subjectId: 'sub5', subjectCode: 'ML',   title: 'Linear Regression',   description: 'Gradient descent, cost function, regularization — with Python code.', fileType: 'pdf', fileSize: '3.8 MB', uploadedBy: 'Prof. Rahul Mehta', uploadedAt: '2026-04-29', chapter: 'Chapter 2', downloads: 334, pages: 58 },
  { id: 'm14', subjectId: 'sub5', subjectCode: 'ML',   title: 'Neural Networks Intro', description: 'Perceptron, activation functions, backpropagation explained visually.', fileType: 'ppt', fileSize: '5.1 MB', uploadedBy: 'Prof. Rahul Mehta', uploadedAt: '2026-05-03', chapter: 'Chapter 5', downloads: 412 },
]
