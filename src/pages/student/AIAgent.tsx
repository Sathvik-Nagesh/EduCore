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
import { SUBJECTS, QUIZ_ANALYTICS } from '../../lib/mockData'
import { Target } from 'lucide-react'

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
  const [mode, setMode] = useState<'chat' | 'quiz' | 'analytics'>('chat')
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
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl overflow-x-auto flex-1 min-w-0 shadow-sm" style={{ scrollbarWidth: 'none' }}>
            {SUBJECTS.map(s => (
              <button key={s.id} onClick={() => { setSelectedSubjectId(s.id); clearChat() }}
                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedSubjectId === s.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}>
                {s.code}
              </button>
            ))}
          </div>

          {/* Chat / Quiz toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button onClick={() => setMode('chat')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === 'chat' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'
              }`}>
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </button>
            <button onClick={() => setMode('quiz')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === 'quiz' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-slate-900'
              }`}>
              <Trophy className="w-3.5 h-3.5" /> Quiz
            </button>
            <button onClick={() => setMode('analytics')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === 'analytics' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-900'
              }`}>
              <Target className="w-3.5 h-3.5" /> Insights
            </button>
          </div>

          {provider && mode === 'chat' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-sm flex-shrink-0">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: provider.color }} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{provider.label}</span>
            </div>
          )}

          {mode === 'chat' && (
            <button onClick={clearChat} title="Clear chat"
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-300 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all flex-shrink-0 shadow-sm">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quiz Mode */}
        {mode === 'quiz' && (
          <div className="flex-1 overflow-y-auto rounded-3xl border border-slate-200 p-6 bg-white shadow-xl">
            <QuizMode subjectName={selectedSubject?.name ?? 'General'} onClose={() => setMode('chat')} />
          </div>
        )}

        {/* Analytics Mode */}
        {mode === 'analytics' && (
          <div className="flex-1 overflow-y-auto rounded-3xl border border-slate-200 p-8 bg-white shadow-xl">
            <h3 className="text-xl font-heading font-black text-slate-900 mb-6 uppercase tracking-tight">Learning Insights</h3>
            
            <div className="mb-8 p-5 rounded-2xl border border-emerald-100 bg-emerald-50/30">
              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-3">
                <Sparkles className="w-4 h-4" /> Strategic Assessment
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">{QUIZ_ANALYTICS.insights}</p>
            </div>

            <h4 className="text-[10px] font-black text-slate-400 mb-5 uppercase tracking-[0.2em]">Prioritized Weak Topics</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {QUIZ_ANALYTICS.weakTopics.map((topic, i) => (
                <div key={i} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[9px] font-black text-blue-600 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 mr-2 uppercase tracking-widest">{topic.subject}</span>
                      <span className="font-black text-slate-900 uppercase tracking-tight">{topic.topic}</span>
                    </div>
                    <span className="text-[10px] text-red-500 font-black px-2 py-1 bg-red-50 rounded-lg uppercase tracking-widest border border-red-100">{topic.mistakes} Errors</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{topic.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Container */}
        {mode === 'chat' && <div
          className="flex-1 overflow-hidden rounded-3xl border border-slate-200 flex flex-col bg-white shadow-2xl shadow-slate-100"
        >
          {/* Repeated Topic Banner */}
          <AnimatePresence>
            {repeatedTopic && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 py-4 flex items-center gap-4 border-b border-amber-100 bg-amber-50/50 flex-shrink-0"
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                </div>
                <p className="text-sm text-amber-900 font-medium flex-1">
                  You've asked about <strong className="font-black text-amber-600">{repeatedTopic}</strong> several times — want a quick summary?
                </p>
                <button
                  onClick={() => { setInputValue(`Give me a quick summary of ${repeatedTopic}`); dismissRepeatedTopic() }}
                  className="text-[10px] font-black uppercase tracking-widest text-amber-600 border border-amber-200 rounded-lg px-3 py-1.5 hover:bg-amber-100 flex-shrink-0 transition-all"
                >
                  Summarize
                </button>
                <button onClick={dismissRepeatedTopic} className="text-slate-300 hover:text-slate-500 flex-shrink-0">
                  <X className="w-4 h-4" />
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
                className="flex flex-col items-center justify-center h-full text-center gap-8 py-12"
              >
                <div
                  className="w-24 h-24 rounded-[40px] flex items-center justify-center bg-white border border-slate-100 shadow-xl relative"
                >
                  <div className="absolute inset-0 bg-blue-50/50 rounded-[40px] blur-2xl" />
                  <Bot className="w-12 h-12 text-slate-900 relative z-10" />
                </div>
                <div>
                  <h3 className="font-heading text-slate-900 font-black text-2xl mb-2 uppercase tracking-tight">Ask me about {selectedSubject?.name}</h3>
                  <p className="text-slate-400 text-sm max-w-sm leading-relaxed font-medium">
                    I'm trained on your course material. Ask anything, get quizzed, or request a concept explained simply.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => { setInputValue(p); textareaRef.current?.focus() }}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 hover:bg-slate-50 transition-all shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />{p}
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
                          className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-slate-600 flex items-center gap-1.5 transition-colors"
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          {isSpeaking ? 'Stop playback' : 'Listen to AI'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white border border-slate-100 shadow-sm mt-0.5">
                      <Bot className="w-4 h-4 text-slate-900" />
                    </div>
                    {streamingText ? (
                      <div className="chat-bubble-ai max-w-[85%]">
                        <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                          {streamingText}
                          <span className="inline-block w-[2px] h-4 bg-blue-500 ml-1 animate-pulse align-middle" />
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
            <div className="px-6 py-3 flex gap-2 overflow-x-auto border-t border-slate-50 flex-shrink-0 scrollbar-hide">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setInputValue(p); textareaRef.current?.focus() }}
                  className="text-[10px] font-black uppercase tracking-widest px-3.5 py-2 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all whitespace-nowrap flex-shrink-0 bg-slate-50/50"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="px-6 py-6 border-t border-slate-50 flex-shrink-0 bg-slate-50/20">
            {/* Live voice indicator */}
            {isListening && (
              <div className="flex items-center gap-3 mb-3 px-1">
                <div className="flex gap-1">
                  {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                </div>
                <span className="text-xs text-slate-400 font-bold italic">
                  {transcript ? `"${transcript}"` : 'AI is listening to your voice…'}
                </span>
              </div>
            )}

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
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? 'Speak now…' : `Ask about ${selectedSubject?.name ?? 'your subject'}…`}
                  rows={1}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-sm placeholder:text-slate-300 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all resize-none shadow-sm font-medium"
                  style={{ minHeight: '56px', maxHeight: '140px' }}
                />
              </div>

              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="w-14 h-14 rounded-2xl bg-slate-900 text-white disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[10px] text-slate-300 mt-4 text-center font-black uppercase tracking-widest">
              Enter to send · Shift+Enter for new line{supported ? ' · Tap mic for voice' : ''}
            </p>
          </div>
        </div>}
      </div>
    </PageWrapper>
  )
}
