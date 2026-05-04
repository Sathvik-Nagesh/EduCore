import { Mic, MicOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface VoiceInputProps {
  isListening: boolean
  transcript: string
  supported: boolean
  onStart: () => void
  onStop: () => void
}

export default function VoiceInput({
  isListening,
  transcript,
  supported,
  onStart,
  onStop,
}: VoiceInputProps) {
  if (!supported) return null

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isListening ? onStop : onStart}
        className={`
          w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
          ${isListening
            ? 'bg-red-500 recording-active'
            : 'bg-white/10 hover:bg-white/20'
          }
        `}
        title={isListening ? 'Stop recording' : 'Start voice input'}
      >
        {isListening
          ? <MicOff className="w-4 h-4 text-white" />
          : <Mic className="w-4 h-4 text-white/70" />
        }
      </button>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="typing-dot"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            {transcript && (
              <span className="text-xs text-white/60 truncate max-w-32">{transcript}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
