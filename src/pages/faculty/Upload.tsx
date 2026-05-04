import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, Check, Bot, X } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import toast from 'react-hot-toast'
import { SUBJECTS } from '../../lib/mockData'

interface UploadPageProps {
  onLogout: () => void
}

export default function UploadPage({ onLogout }: UploadPageProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0].id)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.pdf')) {
      toast.error('Please upload a PDF file')
      return
    }
    setFile(f)
    setDone(null)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)

    // Simulate PDF parsing (in real app would use pdfjs-dist)
    await new Promise(res => setTimeout(res, 2000))

    const subjectName = SUBJECTS.find(s => s.id === selectedSubject)?.name || 'Subject'
    setDone(subjectName)
    setFile(null)
    setUploading(false)
    toast.success(`AI Agent is now trained on your ${subjectName} material! 🤖`)
  }

  const subject = SUBJECTS.find(s => s.id === selectedSubject)

  return (
    <PageWrapper
      role="faculty"
      userName={user.name || 'Faculty'}
      onLogout={onLogout}
      title="Upload Course Material"
      subtitle="Feed your syllabus to the AI Study Agent"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Subject Selector */}
        <div className="card p-6">
          <label className="section-label block mb-3">Select Subject</label>
          <div className="grid grid-cols-2 gap-3">
            {SUBJECTS.map(s => (
              <button
                key={s.id}
                onClick={() => { setSelectedSubject(s.id); setDone(null) }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedSubject === s.id
                    ? 'border-blue-200 bg-blue-50 shadow-sm'
                    : 'border-navy-100 hover:border-navy-200 bg-navy-50/30'
                }`}
              >
                <div className={`font-bold text-sm ${selectedSubject === s.id ? 'text-blue-700' : 'text-navy-800'}`}>{s.code}</div>
                <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${selectedSubject === s.id ? 'text-blue-500' : 'text-navy-400'}`}>{s.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Zone */}
        <div className="card p-6">
          <label className="section-label block mb-4">Upload PDF Syllabus</label>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
            className={`
              border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
              ${isDragOver
                ? 'border-blue-400 bg-blue-50 shadow-inner'
                : file
                  ? 'border-emerald-300 bg-emerald-50 shadow-inner'
                  : 'border-navy-100 hover:border-navy-200 bg-navy-50/50 hover:bg-white hover:shadow-card'
              }
            `}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            <AnimatePresence mode="wait">
              {file ? (
                <motion.div
                  key="file"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-sm">
                    <File className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-navy-800 font-bold text-lg">{file.name}</p>
                    <p className="text-navy-400 font-bold text-xs">{(file.size / 1024).toFixed(0)} KB · Ready to train</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null) }}
                    className="text-red-500 hover:text-red-600 text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50"
                  >
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center border border-navy-100 shadow-sm">
                    <Upload className="w-8 h-8 text-navy-300" />
                  </div>
                  <div>
                    <p className="text-navy-800 font-bold text-lg">Drop your PDF here</p>
                    <p className="text-navy-400 font-bold text-xs uppercase tracking-widest">or click to browse</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {file && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2 py-3"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Parsing PDF & Training AI...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" />
                  Upload & Train AI Agent
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Success State */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card p-6 flex items-center gap-4 border-emerald-200 bg-emerald-50"
            >
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-heading text-emerald-700 font-bold">AI Agent Updated!</h3>
                <p className="text-emerald-800/60 text-sm font-medium mt-0.5">
                  AI Agent is now trained on your <strong className="text-navy-800">{done}</strong> material.
                  Students can now ask questions grounded in this content.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  )
}
