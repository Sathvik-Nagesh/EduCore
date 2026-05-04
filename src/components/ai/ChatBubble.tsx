import { motion } from 'framer-motion'
import { Bot, User } from 'lucide-react'

interface ChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
  index: number
}

export default function ChatBubble({ role, content, index }: ChatBubbleProps) {
  const isUser = role === 'user'

  // Simple markdown-like formatting
  const formatContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded text-electric-blue text-xs">$1</code>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: isUser ? 10 : -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
        ${isUser
          ? 'bg-gradient-to-br from-blue-500 to-blue-700'
          : 'bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10'
        }
      `}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4 text-emerald-400" />
        }
      </div>

      {/* Bubble */}
      <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
        <p className="text-sm text-white/90 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />
      </div>
    </motion.div>
  )
}
