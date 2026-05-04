import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, User } from 'lucide-react'

interface ChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
  index: number
  /** If true, the content is being streamed in real-time – skip typewriter */
  isStreaming?: boolean
  /** If true, animate typewriter on the already-complete content (newest message) */
  typewrite?: boolean
}

function formatContent(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-black">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-600 font-medium">$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600 text-[11px] font-mono border border-slate-200">$1</code>')
    .replace(/\n/g, '<br/>')
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    // Vary speed slightly for natural feel
    const tick = () => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
        setTimeout(tick, i % 7 === 0 ? 28 : 12)
      } else {
        setDone(true)
      }
    }
    const t = setTimeout(tick, 60)
    return () => clearTimeout(t)
  }, [text])

  return (
    <p
      className="text-[13px] text-slate-700 leading-relaxed font-medium"
      dangerouslySetInnerHTML={{
        __html: formatContent(displayed) + (!done ? '<span class="inline-block w-[2px] h-4 bg-blue-500 ml-1 animate-pulse align-middle"></span>' : ''),
      }}
    />
  )
}

export default function ChatBubble({ role, content, index, isStreaming, typewrite }: ChatBubbleProps) {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, x: isUser ? 8 : -8 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.15) }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`
        w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5
        ${isUser
          ? 'bg-slate-900 shadow-lg shadow-slate-200'
          : 'bg-white border border-slate-100 shadow-sm'
        }
      `}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4 text-slate-900" />
        }
      </div>

      {/* Bubble */}
      <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
        {isUser ? (
          <p className="text-[13px] text-white/90 leading-relaxed font-medium">{content}</p>
        ) : typewrite && !isStreaming ? (
          <TypewriterText text={content} />
        ) : (
          <p
            className="text-[13px] text-slate-700 leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: formatContent(content) }}
          />
        )}
      </div>
    </motion.div>
  )
}
