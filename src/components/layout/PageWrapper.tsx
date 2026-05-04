import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import { Calendar } from 'lucide-react'

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
  initial: { opacity: 0, filter: 'blur(10px)', y: 20 },
  in: { opacity: 1, filter: 'blur(0px)', y: 0 },
  out: { opacity: 0, filter: 'blur(5px)', y: -10 },
}

const pageTransition: any = {
  type: 'spring',
  damping: 25,
  stiffness: 120,
  duration: 0.5,
}

export default function PageWrapper({
  children,
  role,
  userName,
  onLogout,
  title,
  subtitle,
}: PageWrapperProps) {
  const isWarning = subtitle?.toLowerCase().includes('warning zone');
  const currentDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar (fixed width 64) */}
      <Sidebar role={role} userName={userName} onLogout={onLogout} />

      <main className="flex-1 ml-64 min-h-screen bg-slate-50/50 bg-grid-faint">
        {/* Top bar */}
        {title && (
          <div
            className="sticky top-0 z-30 px-8 py-6 flex items-center justify-between border-b border-slate-200"
            style={{
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <div className="flex-1">
              <motion.h1 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-heading text-2xl font-black text-slate-900 tracking-tight"
              >
                {title}
              </motion.h1>
              {subtitle && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-1"
                >
                  {isWarning ? (
                    <span className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-[11px] font-black px-3 py-1 rounded-full border border-red-100 animate-pulse uppercase tracking-widest">
                      {subtitle}
                    </span>
                  ) : (
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{subtitle}</p>
                  )}
                </motion.div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white border border-slate-200 rounded-2xl px-6 py-3 shadow-sm flex items-center gap-5"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Campus Timeline</p>
                  <p className="text-sm font-black text-slate-900">{currentDate}</p>
                </div>
              </motion.div>
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
          className="p-8 pb-16"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
