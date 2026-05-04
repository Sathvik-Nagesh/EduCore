import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, Trash2, Volume2, VolumeX, BookOpen, AlertCircle } from 'lucide-react'
import { useAIChat } from '../../hooks/useAIChat'
import { useVoice, speakText, stopSpeaking } from '../../hooks/useVoice'
import { SUBJECTS } from '../../lib/mockData'
import ChatBubble from './ChatBubble'
import VoiceInput from './VoiceInput'

interface AIAgentModalProps {
  isOpen: boolean
  onClose: () => void
}

const SUGGESTED_PROMPTS = [
  'Summarize Chapter 3',
  'Quiz me on this topic',
  'Explain this concept simply',
  'What are the most important topics for exams?',
  'Give me 5 MCQs with answers',
  'Explain with an example',
]

export default function AIAgentModal({ isOpen, onClose }: AIAgentModalProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState('sub1')
  const [inputValue, setInputValue] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, isLoading, streamingText, sendMessage, clearChat, repeatedTopic, dismissRepeatedTopic } = useAIChat()
  const { transcript, isListening, startListening, stopListening, resetTranscript, supported } = useVoice()

  const selectedSubject = SUBJECTS.find(s => s.id === selectedSubjectId)

  // Use transcript as input when voice is done
  useEffect(() => {
    if (transcript && !isListening) {
      setInputValue(transcript)
    }
  }, [transcript, isListening])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return
    const msg = inputValue.trim()
    setInputValue('')
    resetTranscript()
    await sendMessage(msg, selectedSubject?.name || 'General', selectedSubjectId)
  }

  const handlePrompt = (prompt: string) => {
    setInputValue(prompt)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stopSpeaking()
      setIsSpeaking(false)
    } else {
      setIsSpeaking(true)
      speakText(text, () => setIsSpeaking(false))
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full md:w-[700px] h-[90vh] md:h-[80vh] flex flex-col rounded-t-3xl md:rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1A1D2E 0%, #13162A 100%)',
              border: '1px solid rgba(79,142,247,0.2)',
              boxShadow: '0 0 60px rgba(79,142,247,0.15)',
            }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #4F8EF7, #10B981)' }}>
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-heading text-white font-semibold">EduCore AI</h2>
                <p className="text-xs text-white/40">Powered by Mistral · Grounded in course material</p>
              </div>

              {/* Subject Selector */}
              <select
                value={selectedSubjectId}
                onChange={(e) => { setSelectedSubjectId(e.target.value); clearChat() }}
                className="text-sm text-white bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-electric-blue/50"
              >
                {SUBJECTS.map(s => (
                  <option key={s.id} value={s.id} style={{ background: '#1A1D2E' }}>
                    {s.code}
                  </option>
                ))}
              </select>

              {/* Clear */}
              <button onClick={clearChat} className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors" title="Clear chat">
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Close */}
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Repeated Topic Banner */}
            <AnimatePresence>
              {repeatedTopic && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 py-3 flex items-center gap-3"
                  style={{ background: 'rgba(245,158,11,0.1)', borderBottom: '1px solid rgba(245,158,11,0.2)' }}
                >
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-sm text-amber-300 flex-1">
                    Looks like you're revisiting <strong>{repeatedTopic}</strong> a lot — want a quick summary?
                  </p>
                  <button
                    onClick={() => { setInputValue(`Give me a quick summary of ${repeatedTopic}`); dismissRepeatedTopic() }}
                    className="text-xs text-amber-400 hover:text-amber-300 border border-amber-500/30 rounded-lg px-2 py-1"
                  >
                    Summarize
                  </button>
                  <button onClick={dismissRepeatedTopic} className="text-white/30 hover:text-white/60">
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.2), rgba(16,185,129,0.2))', border: '1px solid rgba(79,142,247,0.2)' }}>
                    <BookOpen className="w-8 h-8 text-electric-blue" />
                  </div>
                  <div>
                    <h3 className="font-heading text-white font-semibold text-lg mb-1">
                      Ask about {selectedSubject?.name}
                    </h3>
                    <p className="text-white/40 text-sm max-w-xs">
                      I'm grounded in your course material. Ask anything, get quizzed, or request summaries.
                    </p>
                  </div>

                  {/* Suggested Prompts */}
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handlePrompt(prompt)}
                        className="text-xs px-3 py-2 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-electric-blue/40 hover:bg-electric-blue/5 transition-all"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i}>
                  <ChatBubble role={msg.role} content={msg.content} index={i} />
                  {msg.role === 'assistant' && (
                    <div className="flex justify-start ml-11 mt-1">
                      <button
                        onClick={() => handleSpeak(msg.content)}
                        className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors"
                      >
                        {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                        {isSpeaking ? 'Stop' : 'Listen'}
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming text */}
              {isLoading && (
                <div className="flex gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                  {streamingText ? (
                    <div className="chat-bubble-ai max-w-[85%]">
                      <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{streamingText}</p>
                      <span className="inline-block w-0.5 h-4 bg-electric-blue ml-0.5 animate-pulse" />
                    </div>
                  ) : (
                    <div className="chat-bubble-ai">
                      <div className="flex gap-1.5 items-center">
                        {[0, 1, 2].map(i => <div key={i} className="typing-dot" />)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts (shown when chat is active) */}
            {messages.length > 0 && !isLoading && (
              <div className="px-6 py-2 flex gap-2 overflow-x-auto scrollbar-none">
                {SUGGESTED_PROMPTS.slice(0, 4).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handlePrompt(prompt)}
                    className="text-xs px-3 py-1.5 rounded-full border border-white/8 text-white/40 hover:text-white hover:border-electric-blue/30 transition-all whitespace-nowrap flex-shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="px-6 py-4 border-t border-white/5">
              <div className="flex gap-3 items-end">
                <VoiceInput
                  isListening={isListening}
                  transcript={transcript}
                  supported={supported}
                  onStart={startListening}
                  onStop={stopListening}
                />

                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Ask about ${selectedSubject?.code}...`}
                    rows={1}
                    className="input-field resize-none pr-12"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="btn-primary px-4 py-2.5 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-white/20 mt-2 text-center">
                Press Enter to send · Shift+Enter for new line · 🎙️ for voice input
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
