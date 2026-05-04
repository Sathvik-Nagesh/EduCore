import { useState, useCallback, useRef } from 'react'
import type { ChatMessage } from '../lib/types'
import { callAI, buildStudySystemPrompt } from '../lib/nvidia'
import { COURSE_MATERIALS } from '../lib/mockData'
import { insertAIInteraction } from '../lib/supabase'

// ─── Mock Fallback Answers ────────────────────────────────────────────────────
const MOCK_ANSWERS = [
  "That's a great question! Based on your course material, this topic covers the fundamental principles that form the backbone of the subject. The key idea is to understand how components interact with each other in a systematic way.\n\n**Key Points:**\n- Each element serves a specific purpose within the larger system\n- Understanding the flow helps in solving complex problems\n- Practice with examples solidifies conceptual understanding\n\nWould you like me to elaborate on any particular aspect or give you a quick quiz?",
  "Let me break this down for you step by step:\n\n**Concept Overview:**\nThis is one of the most important topics in your curriculum. It involves understanding how data is structured, processed, and managed.\n\n**Simplified Explanation:**\nThink of it like a library system — every book (data) has a specific location (structure) and a cataloging system (algorithm) that makes retrieval efficient.\n\n**For your exam, remember:**\n1. The definition and purpose\n2. Common use cases\n3. Advantages and limitations\n\nShall I generate some MCQs on this?",
  "Great question — here's a concise summary:\n\nThis concept is fundamental to understanding how systems work at a deeper level. In essence, it defines the relationship between inputs and outputs in a controlled environment.\n\n**Real-world example:**\nConsider how a search engine works — it takes your query (input), processes it using complex algorithms, and returns ranked results (output). The same principle applies here.\n\n**Remember for exams:**\n- Time complexity matters\n- Space efficiency is secondary but important\n- Edge cases are always tested\n\nWant a practice problem?",
  "Here are **5 MCQs** to test your understanding:\n\n**Q1.** What is the primary purpose of this concept?\na) To store data  b) To process data efficiently  c) To visualize information  d) To communicate between systems\n**Answer: B**\n\n**Q2.** Which data structure is most commonly associated with this topic?\na) Array  b) Stack  c) Tree  d) Graph\n**Answer: C**\n\n**Q3.** What is the time complexity of the optimal algorithm?\na) O(n)  b) O(n²)  c) O(log n)  d) O(n log n)\n**Answer: C**\n\n**Q4.** Which of the following is NOT a characteristic of this system?\na) Scalability  b) Redundancy  c) Infinite loops  d) Fault tolerance\n**Answer: C**\n\n**Q5.** When is this approach NOT recommended?\na) Large datasets  b) Real-time systems  c) Static data  d) Distributed environments\n**Answer: C**",
]

// ─── Gemini Fallback ──────────────────────────────────────────────────────────
async function callGeminiFallback(
  messages: ChatMessage[],
  systemPrompt: string,
  onToken: (t: string) => void
): Promise<void> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) throw new Error('No Gemini API key')

  // Use systemInstruction for the system prompt (Gemini 2.0+ supports this)
  const contents = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))

  const body = {
    contents,
    systemInstruction: {
      role: 'user',
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    }
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const errText = await res.text()
    console.error('[Gemini] Error response:', errText)
    throw new Error(`Gemini error ${res.status}: ${errText}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let hasOutput = false

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('data: ')) {
        try {
          const jsonStr = trimmed.slice(6)
          if (jsonStr === '[DONE]') continue
          const json = JSON.parse(jsonStr)
          const token = json?.candidates?.[0]?.content?.parts?.[0]?.text
          if (token) { onToken(token); hasOutput = true }
        } catch { /* skip malformed chunks */ }
      }
    }
  }

  if (!hasOutput) throw new Error('Gemini returned empty response')
}

// ─── Mock Fallback ────────────────────────────────────────────────────────────
function callMockFallback(onToken: (t: string) => void): Promise<void> {
  const answer = MOCK_ANSWERS[Math.floor(Math.random() * MOCK_ANSWERS.length)]
  return new Promise(resolve => {
    let i = 0
    const CHUNK = 3
    const tick = () => {
      if (i < answer.length) {
        onToken(answer.slice(i, i + CHUNK))
        i += CHUNK
        setTimeout(tick, 18)
      } else {
        resolve()
      }
    }
    setTimeout(tick, 300)
  })
}

// ─── Fallback Chain ───────────────────────────────────────────────────────────
async function callWithFallback(
  messages: ChatMessage[],
  systemPrompt: string,
  onToken: (t: string) => void
): Promise<{ provider: string }> {
  // 1. Gemini (Now primary as it has better CORS support)
  try {
    await callGeminiFallback(messages, systemPrompt, onToken)
    return { provider: 'gemini' }
  } catch (e) {
    console.warn('[AI] Gemini failed, trying NVIDIA…', e)
  }

  // 2. NVIDIA (Secondary)
  try {
    await callAI(messages, systemPrompt, onToken)
    return { provider: 'nvidia' }
  } catch (e) {
    console.warn('[AI] NVIDIA failed, using mock…', e)
  }

  // 3. Mock (final fallback)
  await callMockFallback(onToken)
  return { provider: 'mock' }
}

// ─── Topic Tracker ────────────────────────────────────────────────────────────
interface TopicTracker { [topic: string]: number }

const TOPICS = [
  'normalization', 'recursion', 'deadlock', 'sql', 'joins', 'trees',
  'sorting', 'osi model', 'tcp', 'routing', 'neural network', 'gradient',
  'scheduling', 'paging', 'transactions', 'acid', 'er diagram',
]

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [repeatedTopic, setRepeatedTopic] = useState<string | null>(null)
  const [lastProvider, setLastProvider] = useState<string>('')
  const topicTracker = useRef<TopicTracker>({})

  const sendMessage = useCallback(async (content: string, subject: string, subjectId: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = { role: 'user', content }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setStreamingText('')

    // Topic tracking
    const topic = TOPICS.find(t => content.toLowerCase().includes(t))
    if (topic) {
      topicTracker.current[topic] = (topicTracker.current[topic] || 0) + 1
      if (topicTracker.current[topic] >= 3) setRepeatedTopic(topic)
    }

    const courseMaterial = COURSE_MATERIALS[subjectId] || ''
    const systemPrompt = buildStudySystemPrompt(subject, courseMaterial)

    let fullResponse = ''

    try {
      const allMessages: ChatMessage[] = [...messages, userMessage]
      const { provider } = await callWithFallback(allMessages, systemPrompt, (token) => {
        fullResponse += token
        setStreamingText(prev => prev + token)
      })
      setLastProvider(provider)

      // Log to Supabase
      const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
      if (user.id) {
        await insertAIInteraction({
          student_id: user.id,
          subject_id: subjectId,
          query: content,
          response_length: fullResponse.length,
          provider: provider as 'nvidia' | 'gemini' | 'mock'
        })
      }
    } catch {
      fullResponse = "I'm unable to respond right now. Please try again in a moment."
    }

    setMessages(prev => [...prev, { role: 'assistant', content: fullResponse }])
    setStreamingText('')
    setIsLoading(false)
  }, [messages])

  const clearChat = useCallback(() => {
    setMessages([])
    setStreamingText('')
    topicTracker.current = {}
    setRepeatedTopic(null)
  }, [])

  const dismissRepeatedTopic = useCallback(() => setRepeatedTopic(null), [])

  return { messages, isLoading, streamingText, sendMessage, clearChat, repeatedTopic, dismissRepeatedTopic, lastProvider }
}
