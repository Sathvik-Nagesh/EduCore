import { Mic, MicOff } from 'lucide-react'

interface VoiceInputProps {
  isListening: boolean
  transcript: string
  supported: boolean
  onStart: () => void
  onStop: () => void
}

/** Stripped-down button — transcript now lives in the parent's textarea */
export default function VoiceInput({
  isListening,
  supported,
  onStart,
  onStop,
}: VoiceInputProps) {
  if (!supported) return null

  return (
    <button
      type="button"
      onClick={isListening ? onStop : onStart}
      title={isListening ? 'Stop recording' : 'Start voice input'}
      className={`
        p-3 rounded-xl flex-shrink-0 transition-all
        ${isListening
          ? 'bg-red-500/20 text-red-400 border border-red-500/40 recording-active'
          : 'bg-white/[0.04] text-white/30 border border-white/8 hover:text-white/60 hover:border-white/20'
        }
      `}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  )
}
