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
function parseQuizFromText(text: string, subjectName: string): QuizQuestion[] {
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
    const parsed = parseQuizFromText(MOCK_QUIZ_RESPONSE, subjectName)
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
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Quiz: {subjectName}</h3>
              <p className="text-slate-400 text-sm max-w-xs leading-relaxed font-medium">
                5 AI-generated multiple choice questions based on your course material. Choose wisely!
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={startQuiz}
                className="w-full bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Start Quiz
              </button>
              <button onClick={onClose}
                className="px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] text-slate-400 hover:text-slate-900 transition-all">Cancel</button>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {phase === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Generating quiz questions…</p>
          </motion.div>
        )}

        {/* Quiz */}
        {phase === 'quiz' && q && (
          <motion.div key={`q-${current}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full px-2 py-4 gap-4">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${((current) / questions.length) * 100}%` }} />
              </div>
              <span className="text-[10px] font-black text-slate-300 flex-shrink-0 uppercase tracking-widest">{current + 1}/{questions.length}</span>
            </div>

            {/* Question */}
            <div className="card p-5 border-slate-100 bg-slate-50/50 shadow-sm">
              <p className="text-slate-900 font-black text-sm leading-relaxed tracking-tight">{q.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-2 flex-1">
              {q.options.map((opt, i) => {
                const isSelected = selected === i
                const isCorrect = i === q.answer
                const showResult = selected !== null
                let style = 'border-slate-100 bg-white text-slate-900 hover:border-slate-300 shadow-sm'
                if (showResult) {
                  if (isCorrect) style = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-emerald-100/50'
                  else if (isSelected) style = 'border-red-500 bg-red-50 text-red-900 font-bold'
                  else style = 'border-slate-50 bg-slate-50/30 text-slate-400 grayscale opacity-50'
                } else if (isSelected) {
                  style = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-black shadow-lg shadow-indigo-100'
                }

                return (
                  <button key={i} onClick={() => handleSelect(i)}
                    className={`w-full p-4 rounded-2xl border text-left text-sm flex items-center gap-3 transition-all ${style}`}>
                    <span className="w-8 h-8 rounded-xl border border-current/20 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1 font-black uppercase tracking-tight text-[13px]">{opt}</span>
                    {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && q.explanation && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="px-5 py-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-[11px] text-slate-600 leading-relaxed font-medium">
                  <strong className="text-blue-600 font-black uppercase tracking-widest text-[9px] block mb-1">Explanation</strong>
                  {q.explanation}
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={handleNext} disabled={selected === null}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl disabled:opacity-20 transition-all flex items-center justify-center gap-2">
              {current + 1 >= questions.length ? 'See Results' : 'Next Question'} <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Results */}
        {phase === 'results' && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center gap-6 py-8">
            <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center text-4xl shadow-xl
              ${score >= 4 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : score >= 2 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              {score >= 4 ? '🏆' : score >= 2 ? '📚' : '💪'}
            </div>
            <div>
              <p className="text-6xl font-black font-heading text-slate-900 mb-1 tracking-tight">{score}<span className="text-slate-200 text-3xl">/{questions.length}</span></p>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${score >= 4 ? 'text-emerald-600' : score >= 2 ? 'text-amber-600' : 'text-red-600'}`}>
                {score >= 4 ? 'Mastery Achieved! 🎉' : score >= 2 ? 'Solid Effort! Keep practicing.' : 'Needs Review & Study.'}
              </p>
            </div>
            {/* Per-question summary */}
            <div className="flex gap-2.5">
              {answers.map((a, i) => (
                <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm border
                  ${a === questions[i]?.answer ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4">
              <button onClick={startQuiz}
                className="px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Retry
              </button>
              <button onClick={onClose} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:-translate-y-0.5 transition-all">Back to Chat</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
