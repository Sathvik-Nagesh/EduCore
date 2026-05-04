import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, CalendarCheck, BarChart2, Brain, FileText,
  Users, ClipboardList, Calendar, Upload, Settings,
  TrendingUp, UserCheck, ShieldAlert, ChevronLeft,
  GraduationCap, LogOut, BookOpen
} from 'lucide-react'

type Role = 'student' | 'faculty' | 'admin'

interface NavItem {
  label: string
  to: string
  icon: React.ElementType
}

const studentNav: NavItem[] = [
  { label: 'Dashboard',     to: '/student',           icon: LayoutDashboard },
  { label: 'Attendance',    to: '/student/attendance', icon: CalendarCheck },
  { label: 'Heatmap',       to: '/student/heatmap',   icon: BarChart2 },
  { label: 'Materials',     to: '/student/materials', icon: BookOpen },
  { label: 'AI Study Agent',to: '/student/ai',        icon: Brain },
]

const facultyNav: NavItem[] = [
  { label: 'Dashboard', to: '/faculty', icon: LayoutDashboard },
  { label: 'Mark Attendance', to: '/faculty/mark', icon: ClipboardList },
  { label: 'My Schedule', to: '/faculty/schedule', icon: Calendar },
  { label: 'Leave', to: '/faculty/leave', icon: FileText },
  { label: 'Upload Material', to: '/faculty/upload', icon: Upload },
]

const adminNav: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Analytics', to: '/admin/analytics', icon: TrendingUp },
  { label: 'At-Risk Students', to: '/admin/at-risk', icon: ShieldAlert },
  { label: 'Faculty Stats', to: '/admin/faculty', icon: UserCheck },
  { label: 'AI Engagement', to: '/admin/ai', icon: Brain },
  { label: 'Leave Approvals', to: '/admin/leaves', icon: FileText },
  { label: 'Timetable', to: '/admin/timetable', icon: Calendar },
]

const navByRole: Record<Role, NavItem[]> = {
  student: studentNav,
  faculty: facultyNav,
  admin: adminNav,
}

interface SidebarProps {
  role: Role
  userName: string
  onLogout: () => void
}

export default function Sidebar({ role, userName, onLogout }: SidebarProps) {
  const nav = navByRole[role]

  const roleColors: Record<Role, string> = {
    student: 'bg-blue-50 text-blue-700 border-blue-100',
    faculty: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    admin: 'bg-amber-50 text-amber-700 border-amber-100',
  }

  const roleLabel: Record<Role, string> = {
    student: 'Student',
    faculty: 'Faculty',
    admin: 'Administrator',
  }

  return (
    <aside
      className="w-64 h-screen flex flex-col fixed left-0 top-0 z-30"
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        borderRight: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-800 text-navy-800 text-lg leading-none tracking-tight">EduCore</h1>
            <p className="text-[10px] text-navy-400 mt-0.5 font-bold uppercase tracking-widest">Campus Platform</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-black/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-900 text-sm font-bold truncate">{userName}</p>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase border ${roleColors[role]}`}>
              {roleLabel[role]}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <p className="section-label px-3 mb-3">{roleLabel[role]} Menu</p>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/student' || item.to === '/faculty' || item.to === '/admin'}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-black/5 space-y-1">
        <button
          onClick={onLogout}
          className="sidebar-item w-full text-red-500 hover:text-red-600 hover:bg-red-50/50"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
