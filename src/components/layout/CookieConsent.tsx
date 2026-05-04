import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, X } from 'lucide-react'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('educore_cookie_consent')
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('educore_cookie_consent', 'true')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[400px] z-[100]"
        >
          <div className="card p-6 shadow-2xl border border-white/10 relative overflow-hidden">
            {/* Background blur */}
            <div className="absolute inset-0 bg-navy-dark/40 backdrop-blur-xl -z-10" />
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-electric-blue/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-electric-blue" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-sm font-semibold text-white mb-2 flex items-center justify-between">
                  Cookie Consent
                  <button onClick={() => setIsVisible(false)} className="text-white/20 hover:text-white/40">
                    <X className="w-4 h-4" />
                  </button>
                </h3>
                <p className="text-xs text-white/50 leading-relaxed mb-4">
                  We use cookies and local storage to keep you signed in, personalize your AI agent experience, and analyze our platform's engagement. By continuing to use EduCore, you agree to our <a href="/terms" className="text-electric-blue hover:underline">terms</a>.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleAccept}
                    className="btn-primary py-2 px-6 text-xs flex-1"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="btn-ghost py-2 px-4 text-xs"
                  >
                    Essential Only
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
