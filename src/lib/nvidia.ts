import type { ChatMessage } from './types'
export type { ChatMessage } from './types'

const NVIDIA_API_KEY = import.meta.env.VITE_NVIDIA_API_KEY
const MODEL = import.meta.env.VITE_NVIDIA_MODEL || 'mistralai/mistral-medium-3.5-128b'
const INVOKE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'

/**
 * Call NVIDIA's Mistral API. Supports streaming (SSE) in the browser via fetch.
 * If onToken is provided, streams tokens in real-time.
 */
export async function callAI(
  messages: ChatMessage[],
  systemPrompt: string,
  onToken?: (token: string) => void
): Promise<string> {
  const useStream = !!onToken

  const payload = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    max_tokens: 1024,
    temperature: 0.7,
    top_p: 1.0,
    stream: useStream,
  }

  const response = await fetch(INVOKE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': useStream ? 'text/event-stream' : 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`NVIDIA API error ${response.status}: ${err}`)
  }

  if (useStream && onToken) {
    // Browser streaming via ReadableStream
    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let fullText = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data: ')) continue
        const jsonStr = trimmed.slice(6)
        if (jsonStr === '[DONE]') continue
        try {
          const parsed = JSON.parse(jsonStr)
          const token: string = parsed.choices?.[0]?.delta?.content || ''
          if (token) {
            fullText += token
            onToken(token)
          }
        } catch {
          // skip malformed chunks
        }
      }
    }

    return fullText
  } else {
    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }
}

export function buildStudySystemPrompt(subject: string, courseMaterial: string): string {
  return `You are EduCore AI, an intelligent study assistant for college students.
You are grounded ONLY in the following course material for ${subject}:
---
${courseMaterial || `General knowledge about ${subject} — no specific material uploaded yet.`}
---
Instructions:
- Answer questions based on this material
- If asked to quiz, generate 5 MCQs with options (A/B/C/D) and mark the correct answer
- Keep answers concise and student-friendly
- Use simple language and examples
- Format with markdown (**bold** for key terms, bullet points for lists)
- If no material is uploaded, use general knowledge about the subject`
}
