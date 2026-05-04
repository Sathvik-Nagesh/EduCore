import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'

type Role = 'student' | 'faculty' | 'admin'

interface PageWrapperProps {
  children: ReactNode
  role: Role
  userName: string
  onLogout: () => void
  title?: string
  subtitle?: string
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
}

const pageTransition: any = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.3,
}

export default function PageWrapper({
  children,
  role,
  userName,
  onLogout,
  title,
  subtitle,
}: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-navy flex">
      <Sidebar role={role} userName={userName} onLogout={onLogout} />

      <main className="flex-1 ml-64 min-h-screen bg-grid-faint bg-[length:60px_60px]">
        {/* Top bar */}
        {title && (
          <div
            className="sticky top-0 z-20 px-8 py-4 flex items-center justify-between"
            style={{
              background: 'rgba(15,17,23,0.85)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div>
              <h1 className="font-heading text-xl font-semibold text-white">{title}</h1>
              {subtitle && <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-white/30 hidden md:block">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <motion.div
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
