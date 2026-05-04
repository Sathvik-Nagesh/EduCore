import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Send, Trash2, Volume2, VolumeX,
  AlertCircle, X, Sparkles, Cpu, Zap, Boxes, Trophy, MessageSquare
} from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import ChatBubble from '../../components/ai/ChatBubble'
import VoiceInput from '../../components/ai/VoiceInput'
import QuizMode from '../../components/ai/QuizMode'
import { useAIChat } from '../../hooks/useAIChat'
import { useVoice, speakText, stopSpeaking } from '../../hooks/useVoice'
import { SUBJECTS } from '../../lib/mockData'

interface AIPageProps {
  onLogout: () => void
}

const SUGGESTED_PROMPTS = [
  'Summarize this chapter',
  'Quiz me with 5 MCQs',
  'Explain with a real example',
  'Important exam topics',
  'Simplify this concept',
  'What are key differences?',
]

const PROVIDER_META: Record<string, { label: string; color: string; icon: typeof Cpu }> = {
  nvidia:  { label: 'NVIDIA Mistral', color: '#76b900', icon: Cpu },
  gemini:  { label: 'Google Gemini', color: '#4F8EF7', icon: Zap },
  mock:    { label: 'Offline Mode',  color: '#F59E0B', icon: Boxes },
}

export default function AIPage({ onLogout }: AIPageProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const [selectedSubjectId, setSelectedSubjectId] = useState('sub1')
  const [inputValue, setInputValue] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [mode, setMode] = useState<'chat' | 'quiz'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, isLoading, streamingText, sendMessage, clearChat, repeatedTopic, dismissRepeatedTopic, lastProvider } = useAIChat()
  const { transcript, isListening, startListening, stopListening, resetTranscript, supported } = useVoice()

  const selectedSubject = SUBJECTS.find(s => s.id === selectedSubjectId)

  // Live voice transcript → textarea (both interim and final)
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript)
      textareaRef.current?.focus()
    }
  }, [transcript])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px'
    }
  }, [inputValue])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return
    const msg = inputValue.trim()
    setInputValue('')
    resetTranscript()
    await sendMessage(msg, selectedSubject?.name || 'General', selectedSubjectId)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSpeak = (text: string) => {
    if (isSpeaking) { stopSpeaking(); setIsSpeaking(false) }
    else { setIsSpeaking(true); speakText(text, () => setIsSpeaking(false)) }
  }

  const hasMessages = messages.length > 0 || isLoading
  const provider = PROVIDER_META[lastProvider]

  return (
    <PageWrapper
      role="student"
      userName={user.name || 'Student'}
      onLogout={onLogout}
      title="AI Study Agent"
      subtitle="Powered by Mistral · Grounded in your course material"
    >
      <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] gap-4">

        {/* Subject Tabs + Status */}
        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/8 rounded-2xl overflow-x-auto flex-1 min-w-0" style={{ scrollbarWidth: 'none' }}>
            {SUBJECTS.map(s => (
              <button key={s.id} onClick={() => { setSelectedSubjectId(s.id); clearChat() }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedSubjectId === s.id ? 'bg-electric-blue text-white shadow-lg shadow-electric-blue/20' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}>
                {s.code}
              </button>
            ))}
          </div>

          {/* Chat / Quiz toggle */}
          <div className="flex items-center bg-white/[0.04] border border-white/8 rounded-xl p-1">
            <button onClick={() => setMode('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'chat' ? 'bg-electric-blue text-white' : 'text-white/40 hover:text-white'
              }`}>
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </button>
            <button onClick={() => setMode('quiz')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'quiz' ? 'bg-amber-500 text-white' : 'text-white/40 hover:text-white'
              }`}>
              <Trophy className="w-3.5 h-3.5" /> Quiz
            </button>
          </div>

          {provider && mode === 'chat' && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/8 bg-white/[0.03] flex-shrink-0">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: provider.color }} />
              <span className="text-xs text-white/40">{provider.label}</span>
            </div>
          )}

          {mode === 'chat' && (
            <button onClick={clearChat} title="Clear chat"
              className="p-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-white/30 hover:text-red-400 hover:border-red-400/30 transition-all flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quiz Mode */}
        {mode === 'quiz' && (
          <div className="flex-1 overflow-y-auto rounded-2xl border border-white/8 p-4"
            style={{ background: 'linear-gradient(180deg, rgba(26,29,46,0.9) 0%, rgba(15,17,23,0.95) 100%)' }}>
            <QuizMode subjectName={selectedSubject?.name ?? 'General'} onClose={() => setMode('chat')} />
          </div>
        )}

        {/* Chat Container */}
        {mode === 'chat' && <div
          className="flex-1 overflow-hidden rounded-2xl border border-white/8 flex flex-col"
          style={{ background: 'linear-gradient(180deg, rgba(26,29,46,0.9) 0%, rgba(15,17,23,0.95) 100%)' }}
        >
          {/* Repeated Topic Banner */}
          <AnimatePresence>
            {repeatedTopic && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 py-3 flex items-center gap-3 border-b border-amber-400/10 bg-amber-400/5 flex-shrink-0"
              >
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <p className="text-sm text-amber-300 flex-1">
                  You've asked about <strong>{repeatedTopic}</strong> several times — want a quick summary?
                </p>
                <button
                  onClick={() => { setInputValue(`Give me a quick summary of ${repeatedTopic}`); dismissRepeatedTopic() }}
                  className="text-xs text-amber-400 border border-amber-500/30 rounded-lg px-2.5 py-1 hover:bg-amber-500/10 flex-shrink-0"
                >
                  Summarize
                </button>
                <button onClick={dismissRepeatedTopic} className="text-white/20 hover:text-white/50 flex-shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {!hasMessages ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center gap-6 py-12"
              >
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(79,142,247,0.15), rgba(16,185,129,0.15))',
                    border: '1px solid rgba(79,142,247,0.25)',
                    boxShadow: '0 0 40px rgba(79,142,247,0.1)',
                  }}
                >
                  <Bot className="w-10 h-10 text-electric-blue" />
                </div>
                <div>
                  <h3 className="font-heading text-white font-bold text-xl mb-2">Ask me about {selectedSubject?.name}</h3>
                  <p className="text-white/40 text-sm max-w-sm leading-relaxed">
                    I'm trained on your course material. Ask anything, get quizzed, or request a concept explained simply.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => { setInputValue(p); textareaRef.current?.focus() }}
                      className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-electric-blue/40 hover:bg-electric-blue/5 transition-all"
                    >
                      <Sparkles className="w-3 h-3" />{p}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i}>
                    <ChatBubble
                      role={msg.role}
                      content={msg.content}
                      index={i}
                      typewrite={msg.role === 'assistant' && i === messages.length - 1}
                    />
                    {msg.role === 'assistant' && (
                      <div className="flex mt-1.5 ml-11">
                        <button
                          onClick={() => handleSpeak(msg.content)}
                          className="text-xs text-white/25 hover:text-white/60 flex items-center gap-1 transition-colors"
                        >
                          {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                          {isSpeaking ? 'Stop' : 'Listen'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 mt-0.5">
                      <Bot className="w-4 h-4 text-emerald-400" />
                    </div>
                    {streamingText ? (
                      <div className="chat-bubble-ai max-w-[85%]">
                        <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                          {streamingText}
                          <span className="inline-block w-[2px] h-4 bg-electric-blue ml-0.5 animate-pulse align-middle" />
                        </p>
                      </div>
                    ) : (
                      <div className="chat-bubble-ai">
                        <div className="flex gap-1.5 items-center py-0.5">
                          {[0,1,2].map(i => <div key={i} className="typing-dot" />)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompt chips (after chat starts) */}
          {hasMessages && !isLoading && (
            <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-white/5 flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setInputValue(p); textareaRef.current?.focus() }}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/8 text-white/35 hover:text-white hover:border-electric-blue/30 transition-all whitespace-nowrap flex-shrink-0"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="px-4 py-4 border-t border-white/5 flex-shrink-0">
            {/* Live voice indicator */}
            {isListening && (
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="flex gap-1">
                  {[0,1,2].map(i => <div key={i} className="typing-dot" style={{ animationDelay: `${i*0.15}s` }} />)}
                </div>
                <span className="text-xs text-white/40 italic">
                  {transcript ? `"${transcript}"` : 'Listening…'}
                </span>
              </div>
            )}

            <div className="flex gap-2 items-end">
              <VoiceInput
                isListening={isListening}
                transcript={transcript}
                supported={supported}
                onStart={startListening}
                onStop={stopListening}
              />

              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? 'Speak now…' : `Ask about ${selectedSubject?.name ?? 'your subject'}…`}
                  rows={1}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-electric-blue/40 focus:bg-white/[0.07] transition-all resize-none"
                  style={{ minHeight: '48px', maxHeight: '140px' }}
                />
              </div>

              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="p-3 rounded-xl bg-electric-blue text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-500 transition-all shadow-lg shadow-electric-blue/20 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-white/20 mt-2 text-center tracking-wide">
              Enter to send · Shift+Enter for new line{supported ? ' · 🎙 for voice' : ''}
            </p>
          </div>
        </div>}
      </div>
    </PageWrapper>
  )
}
