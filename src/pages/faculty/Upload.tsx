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
                    ? 'border-electric-blue/40 bg-electric-blue/10'
                    : 'border-white/8 hover:border-white/20 bg-white/3'
                }`}
              >
                <div className="font-semibold text-white text-sm">{s.code}</div>
                <div className="text-white/40 text-xs truncate">{s.name}</div>
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
                ? 'border-electric-blue/60 bg-electric-blue/5'
                : file
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/3'
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
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                    <File className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-white/30 text-sm">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null) }}
                    className="text-red-400/60 hover:text-red-400 text-xs flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Upload className="w-7 h-7 text-white/30" />
                  </div>
                  <div>
                    <p className="text-white/70 font-medium">Drop your PDF here</p>
                    <p className="text-white/30 text-sm">or click to browse</p>
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
              className="card p-6 flex items-center gap-4"
              style={{ border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-heading text-emerald-400 font-semibold">AI Agent Updated!</h3>
                <p className="text-white/60 text-sm mt-0.5">
                  AI Agent is now trained on your <strong className="text-white">{done}</strong> material.
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
