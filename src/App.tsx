import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import CookieConsent from './components/layout/CookieConsent'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

// Student
import StudentDashboard from './pages/student/Dashboard'
import AttendancePage from './pages/student/Attendance'
import HeatmapPage from './pages/student/Heatmap'
import AIPage from './pages/student/AIAgent'
import MaterialsPage from './pages/student/Materials'

// Faculty
import FacultyDashboard from './pages/faculty/Dashboard'
import MarkAttendance from './pages/faculty/MarkAttendance'
import SchedulePage from './pages/faculty/Schedule'
import LeavePage from './pages/faculty/Leave'
import UploadPage from './pages/faculty/Upload'

// Admin
import AdminDashboard from './pages/admin/Dashboard'
import AnalyticsPage from './pages/admin/Analytics'
import AtRiskPage from './pages/admin/AtRisk'
import FacultyStats from './pages/admin/FacultyStats'
import AIEngagementPage from './pages/admin/AIEngagement'
import LeaveApprovalsPage from './pages/admin/LeaveApprovals'
import TimetablePage from './pages/admin/Timetable'

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('educore_user') || 'null')
  } catch {
    return null
  }
}

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole: string }) {
  const user = getUser()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== requiredRole) return <Navigate to={`/${user.role}`} replace />
  return <>{children}</>
}

function RoleRoute() {
  const user = getUser()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={`/${user.role}`} replace />
}

function AppRoutes() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('educore_user')
    navigate('/login')
  }

  return (
    <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/dashboard" element={<RoleRoute />} />

        {/* Student */}
        <Route path="/student" element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/student/attendance" element={
          <ProtectedRoute requiredRole="student">
            <AttendancePage onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/student/heatmap" element={
          <ProtectedRoute requiredRole="student">
            <HeatmapPage onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/student/ai" element={
          <ProtectedRoute requiredRole="student">
            <AIPage onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/student/materials" element={
          <ProtectedRoute requiredRole="student">
            <MaterialsPage onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        {/* Faculty */}
        <Route path="/faculty" element={
          <ProtectedRoute requiredRole="faculty">
            <FacultyDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/faculty/mark" element={
          <ProtectedRoute requiredRole="faculty">
            <MarkAttendance onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/faculty/schedule" element={
          <ProtectedRoute requiredRole="faculty">
            <SchedulePage onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/faculty/leave" element={
          <ProtectedRoute requiredRole="faculty">
            <LeavePage onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/faculty/upload" element={
          <ProtectedRoute requiredRole="faculty">
            <UploadPage onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute requiredRole="admin">
            <AnalyticsPage onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/admin/at-risk" element={
          <ProtectedRoute requiredRole="admin">
            <AtRiskPage onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/admin/faculty" element={
          <ProtectedRoute requiredRole="admin">
            <FacultyStats onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/admin/ai" element={
          <ProtectedRoute requiredRole="admin">
            <AIEngagementPage onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/admin/leaves" element={
          <ProtectedRoute requiredRole="admin">
            <LeaveApprovalsPage onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/admin/timetable" element={
          <ProtectedRoute requiredRole="admin">
            <TimetablePage onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  )
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1D2E',
            color: '#F0F4FF',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: 'white' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: 'white' },
          },
        }}
      />
      <AppRoutes />
    </>
  )
}
