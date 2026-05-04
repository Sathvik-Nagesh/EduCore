import { useState, useCallback, useRef } from 'react'
import type { ChatMessage } from '../lib/types'
import { callAI, buildStudySystemPrompt } from '../lib/nvidia'
import { COURSE_MATERIALS } from '../lib/mockData'


interface TopicTracker {
  [topic: string]: number
}

interface UseAIChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  streamingText: string
  sendMessage: (content: string, subject: string, subjectId: string) => Promise<void>
  clearChat: () => void
  repeatedTopic: string | null
  dismissRepeatedTopic: () => void
}

export function useAIChat(): UseAIChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [repeatedTopic, setRepeatedTopic] = useState<string | null>(null)
  const topicTracker = useRef<TopicTracker>({})

  const detectTopic = (message: string): string | null => {
    const topics = [
      'normalization', 'recursion', 'deadlock', 'sql', 'joins', 'trees',
      'sorting', 'osi model', 'tcp', 'routing', 'neural network', 'gradient',
      'scheduling', 'paging', 'transactions', 'acid', 'er diagram'
    ]
    const lower = message.toLowerCase()
    return topics.find(t => lower.includes(t)) || null
  }

  const sendMessage = useCallback(async (content: string, subject: string, subjectId: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = { role: 'user', content }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setStreamingText('')

    // Track topic repetition
    const topic = detectTopic(content)
    if (topic) {
      topicTracker.current[topic] = (topicTracker.current[topic] || 0) + 1
      if (topicTracker.current[topic] >= 3) {
        setRepeatedTopic(topic)
      }
    }

    const courseMaterial = COURSE_MATERIALS[subjectId] || ''
    const systemPrompt = buildStudySystemPrompt(subject, courseMaterial)

    try {
      const allMessages: ChatMessage[] = [...messages, userMessage]
      let fullResponse = ''

      await callAI(allMessages, systemPrompt, (token) => {
        fullResponse += token
        setStreamingText(prev => prev + token)
      })

      const aiMessage: ChatMessage = { role: 'assistant', content: fullResponse }
      setMessages(prev => [...prev, aiMessage])
      setStreamingText('')
    } catch (error) {
      console.error('AI call failed:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your internet connection and try again.",
      }
      setMessages(prev => [...prev, errorMessage])
      setStreamingText('')
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const clearChat = useCallback(() => {
    setMessages([])
    setStreamingText('')
    topicTracker.current = {}
    setRepeatedTopic(null)
  }, [])

  const dismissRepeatedTopic = useCallback(() => {
    setRepeatedTopic(null)
  }, [])

  return {
    messages,
    isLoading,
    streamingText,
    sendMessage,
    clearChat,
    repeatedTopic,
    dismissRepeatedTopic,
  }
}
