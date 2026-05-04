import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ── Types matching the DB schema ──────────────────────────────
export type Role = 'student' | 'faculty' | 'admin'

export interface Profile {
  id: string
  role: Role
  name: string
  email: string
  department: string
  year?: number
  roll_no?: string
  avatar_url?: string
  created_at: string
}

export interface Subject {
  id: string
  name: string
  code: string
  department: string
  credits: number
  faculty_id?: string
}

export interface AttendanceRecord {
  id: string
  student_id: string
  subject_id: string
  date: string
  is_present: boolean
}

export interface StudyMaterial {
  id: string
  subject_id: string
  title: string
  description?: string
  file_type: 'pdf' | 'ppt' | 'doc' | 'video' | 'link'
  file_size?: string
  pages?: number
  chapter?: string
  uploaded_by?: string
  downloads: number
  created_at: string
}

export interface LeaveRequest {
  id: string
  faculty_id: string
  from_date: string
  to_date: string
  reason: string
  type: 'medical' | 'personal' | 'official'
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  profiles?: { name: string }
}

export interface AIInteraction {
  id: string
  student_id: string
  subject_id?: string
  query: string
  response_length?: number
  provider: 'nvidia' | 'gemini' | 'mock'
  created_at: string
}

export interface TimetableSlot {
  id: string
  subject_id: string
  day: string
  start_time: string
  end_time: string
  room?: string
  subjects?: Subject
}

export interface Announcement {
  id: string
  title: string
  body: string
  created_at: string
}

// ── Auth helper (demo: match against profiles table) ──────────
export async function signInDemo(email: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single()
  if (error || !data) return null
  return data as Profile
}

// ── Student data fetchers ─────────────────────────────────────
export async function getStudentAttendance(studentId: string) {
  const { data } = await supabase
    .from('attendance_records')
    .select('*, subjects(name, code)')
    .eq('student_id', studentId)
    .order('date', { ascending: false })
  return data ?? []
}

export async function getAttendanceSummary(studentId: string) {
  const { data } = await supabase
    .from('attendance_records')
    .select('subject_id, is_present, subjects(name, code)')
    .eq('student_id', studentId)

  if (!data) return []
  const map: Record<string, { subjectId: string; name: string; code: string; attended: number; total: number }> = {}
  for (const r of data) {
    const sub = r.subjects as unknown as { name: string; code: string }
    if (!map[r.subject_id]) map[r.subject_id] = { subjectId: r.subject_id, name: sub?.name ?? '', code: sub?.code ?? '', attended: 0, total: 0 }
    map[r.subject_id].total++
    if (r.is_present) map[r.subject_id].attended++
  }
  return Object.values(map).map(s => ({ ...s, percentage: s.total > 0 ? Math.round((s.attended / s.total) * 100) : 0 }))
}

export async function getStudyMaterials(subjectId?: string) {
  let q = supabase.from('study_materials').select('*, subjects(name,code), profiles(name)').order('created_at', { ascending: false })
  if (subjectId) q = q.eq('subject_id', subjectId)
  const { data } = await q
  return data ?? []
}

export async function getSubjects() {
  const { data } = await supabase.from('subjects').select('*, profiles(name)').order('code')
  return data ?? []
}

export async function getStudentAIHistory(studentId: string) {
  const { data } = await supabase
    .from('ai_interactions')
    .select('*, subjects(name,code)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(20)
  return data ?? []
}

export async function insertAIInteraction(payload: Omit<AIInteraction, 'id' | 'created_at'>) {
  await supabase.from('ai_interactions').insert(payload)
}

// ── Faculty data fetchers ─────────────────────────────────────
export async function getFacultyLeaves(facultyId: string) {
  const { data } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('faculty_id', facultyId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function submitLeave(payload: Omit<LeaveRequest, 'id' | 'status' | 'created_at'>) {
  const { data, error } = await supabase.from('leave_requests').insert({ ...payload, status: 'pending' }).select().single()
  return { data, error }
}

export async function getTimetable(facultyId?: string) {
  let q = supabase.from('timetable_slots').select('*, subjects(name, code, faculty_id)').order('start_time')
  const { data } = await q
  if (facultyId) return (data ?? []).filter((s: any) => s.subjects?.faculty_id === facultyId)
  return data ?? []
}

// ── Admin data fetchers ───────────────────────────────────────
export async function getAllProfiles() {
  const { data } = await supabase.from('profiles').select('*').order('role')
  return data ?? []
}

export async function getAllLeaves() {
  const { data } = await supabase
    .from('leave_requests')
    .select('*, profiles(name)')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function updateLeaveStatus(id: string, status: 'approved' | 'rejected') {
  const { data, error } = await supabase.from('leave_requests').update({ status }).eq('id', id).select().single()
  return { data, error }
}

export async function getAIStats() {
  const { data } = await supabase
    .from('ai_interactions')
    .select('*, subjects(name,code), profiles(name,department,year)')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getAllAttendance() {
  const { data } = await supabase
    .from('attendance_records')
    .select('*, profiles(name, department, year, roll_no), subjects(name, code)')
  return data ?? []
}
