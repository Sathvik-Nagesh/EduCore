import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, RotateCcw, Trophy, ChevronRight, Loader2 } from 'lucide-react'

interface QuizQuestion {
  question: string
  options: string[]
  answer: number // index of correct option
  explanation: string
}

interface QuizModeProps {
  subjectName: string
  onClose: () => void
}

// Parse quiz from AI text response
function parseQuizFromText(text: string): QuizQuestion[] {
  const questions: QuizQuestion[] = []
  // Match blocks like: Q1. ... a) ... b) ... Answer: B ... Explanation: ...
  const blocks = text.split(/Q\d+\.|(?=\*\*Q\d+)/).filter(b => b.trim().length > 10)

  for (const block of blocks.slice(0, 5)) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length < 4) continue

    const question = lines[0].replace(/^\*+/, '').trim()
    const opts: string[] = []
    let answerIdx = 0

    for (const line of lines.slice(1)) {
      const optMatch = line.match(/^[a-dA-D][.)]\s+(.+)/)
      if (optMatch) opts.push(optMatch[1].trim())
      const ansMatch = line.match(/[Aa]nswer[:\s]+([A-Da-d])/)
      if (ansMatch) answerIdx = 'abcd'.indexOf(ansMatch[1].toLowerCase())
    }

    const expLine = lines.find(l => /[Ee]xplanation[:\s]/.test(l))
    const explanation = expLine ? expLine.replace(/.*[Ee]xplanation[:\s]+/, '').trim() : ''

    if (question && opts.length >= 2) {
      questions.push({ question, options: opts, answer: Math.max(0, answerIdx), explanation })
    }
  }

  // Fallback hardcoded if parse fails
  if (questions.length === 0) {
    return [
      { question: `Which of the following best describes a key concept in ${subjectName}?`, options: ['It manages data flow', 'It controls memory allocation', 'It optimizes algorithms', 'It structures programs'], answer: 0, explanation: 'This is the fundamental purpose of this concept.' },
      { question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], answer: 1, explanation: 'Binary search halves the search space each step — O(log n).' },
      { question: 'Which data structure follows LIFO?', options: ['Queue', 'Linked List', 'Stack', 'Tree'], answer: 2, explanation: 'Stack = Last In First Out (LIFO).' },
    ]
  }

  return questions

  // reference to avoid TS unused
  void subjectName
}

// Mock quiz generator
const MOCK_QUIZ_RESPONSE = `
Q1. What is the primary purpose of normalization in DBMS?
a) To increase database size
b) To eliminate redundancy and update anomalies
c) To speed up queries
d) To add more tables
Answer: B
Explanation: Normalization reduces data redundancy and prevents update, insert, and delete anomalies.

Q2. Which normal form eliminates partial dependencies?
a) 1NF
b) 2NF
c) 3NF
d) BCNF
Answer: B
Explanation: Second Normal Form (2NF) removes partial dependencies on the primary key.

Q3. ACID stands for?
a) Atomicity, Consistency, Isolation, Durability
b) Access, Control, Index, Data
c) Allocation, Concurrency, Integrity, Design
d) None of the above
Answer: A
Explanation: ACID properties ensure reliable database transactions.

Q4. Which SQL command removes all rows from a table without logging?
a) DELETE
b) DROP
c) TRUNCATE
d) REMOVE
Answer: C
Explanation: TRUNCATE removes all rows faster than DELETE and cannot be rolled back.

Q5. A foreign key ensures what type of integrity?
a) Domain integrity
b) Entity integrity
c) Referential integrity
d) User-defined integrity
Answer: C
Explanation: Foreign keys enforce referential integrity between related tables.
`

export default function QuizMode({ subjectName, onClose }: QuizModeProps) {
  const [phase, setPhase] = useState<'intro' | 'loading' | 'quiz' | 'results'>('intro')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [showExplanation, setShowExplanation] = useState(false)

  const startQuiz = async () => {
    setPhase('loading')
    // Simulate AI generating quiz (use mock)
    await new Promise(r => setTimeout(r, 1400))
    const parsed = parseQuizFromText(MOCK_QUIZ_RESPONSE)
    setQuestions(parsed)
    setCurrent(0)
    setSelected(null)
    setAnswers([])
    setShowExplanation(false)
    setPhase('quiz')
  }

  const handleSelect = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    setShowExplanation(true)
  }

  const handleNext = () => {
    if (selected === null) return
    const newAnswers = [...answers, selected]
    setAnswers(newAnswers)
    if (current + 1 >= questions.length) {
      setPhase('results')
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setShowExplanation(false)
    }
  }

  const score = answers.filter((a, i) => a === questions[i]?.answer).length
  const q = questions[current]

  return (
    <div className="flex flex-col h-full">
      <AnimatePresence mode="wait">

        {/* Intro */}
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full text-center gap-6 py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-electric-blue/20 border border-amber-500/20 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white mb-2">Quiz: {subjectName}</h3>
              <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                5 AI-generated multiple choice questions based on your course material. Choose wisely!
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={startQuiz}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm">
                <Trophy className="w-4 h-4" /> Start Quiz
              </button>
              <button onClick={onClose}
                className="btn-ghost px-4 py-2.5 text-sm">Cancel</button>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {phase === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="w-8 h-8 text-electric-blue animate-spin" />
            <p className="text-white/40 text-sm">Generating quiz questions…</p>
          </motion.div>
        )}

        {/* Quiz */}
        {phase === 'quiz' && q && (
          <motion.div key={`q-${current}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full px-2 py-4 gap-4">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-white/8">
                <div className="h-full rounded-full bg-electric-blue transition-all duration-500"
                  style={{ width: `${((current) / questions.length) * 100}%` }} />
              </div>
              <span className="text-xs text-white/30 flex-shrink-0">{current + 1}/{questions.length}</span>
            </div>

            {/* Question */}
            <div className="card p-4 border-white/10">
              <p className="text-white font-semibold text-sm leading-relaxed">{q.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-2 flex-1">
              {q.options.map((opt, i) => {
                const isSelected = selected === i
                const isCorrect = i === q.answer
                const showResult = selected !== null
                let style = 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25'
                if (showResult) {
                  if (isCorrect) style = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                  else if (isSelected) style = 'border-red-500/40 bg-red-500/10 text-red-300'
                  else style = 'border-white/5 bg-white/[0.01] text-white/30'
                } else if (isSelected) {
                  style = 'border-electric-blue/50 bg-electric-blue/10 text-white'
                }

                return (
                  <button key={i} onClick={() => handleSelect(i)}
                    className={`w-full p-3 rounded-xl border text-left text-sm flex items-center gap-3 transition-all ${style}`}>
                    <span className="w-6 h-6 rounded-lg border border-current/30 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {showResult && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && q.explanation && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-3 rounded-xl bg-electric-blue/8 border border-electric-blue/15 text-xs text-white/60 leading-relaxed">
                  <strong className="text-electric-blue">Explanation: </strong>{q.explanation}
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={handleNext} disabled={selected === null}
              className="btn-primary flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-30">
              {current + 1 >= questions.length ? 'See Results' : 'Next'} <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Results */}
        {phase === 'results' && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center gap-5 py-8">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black
              ${score >= 4 ? 'bg-emerald-500/20 border border-emerald-500/30' : score >= 2 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
              {score >= 4 ? '🏆' : score >= 2 ? '📚' : '💪'}
            </div>
            <div>
              <p className="text-5xl font-black font-heading text-white mb-1">{score}<span className="text-white/30 text-2xl">/{questions.length}</span></p>
              <p className={`text-sm font-semibold ${score >= 4 ? 'text-emerald-400' : score >= 2 ? 'text-amber-400' : 'text-red-400'}`}>
                {score >= 4 ? 'Excellent! 🎉' : score >= 2 ? 'Good effort! Keep practicing.' : 'Review this topic again.'}
              </p>
            </div>
            {/* Per-question summary */}
            <div className="flex gap-2">
              {answers.map((a, i) => (
                <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                  ${a === questions[i]?.answer ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={startQuiz}
                className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">
                <RotateCcw className="w-4 h-4" /> Retry
              </button>
              <button onClick={onClose} className="btn-primary px-6 py-2 text-sm">Back to Chat</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
