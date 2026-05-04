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
          ? 'bg-red-50 text-red-500 border border-red-200 shadow-lg shadow-red-100'
          : 'bg-white text-slate-400 border border-slate-200 hover:text-slate-900 hover:border-slate-900 shadow-sm'
        }
      `}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  )
}
