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

  const [uploadStep, setUploadStep] = useState<string>('')

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setDone(null)

    const steps = ['Analyzing Document Structure', 'Extracting Text and Tables', 'Vectorizing for RAG', 'Syncing with Knowledge Base']
    for (const step of steps) {
      setUploadStep(step)
      await new Promise(res => setTimeout(res, 800 + Math.random() * 700))
    }

    const subjectName = SUBJECTS.find(s => s.id === selectedSubject)?.name || 'Subject'
    setDone(subjectName)
    setFile(null)
    setUploading(false)
    setUploadStep('')
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
        <div className="card p-8 border-slate-100 shadow-xl">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4">Target Course Discipline</label>
          <div className="grid grid-cols-2 gap-3">
            {SUBJECTS.map(s => (
              <button
                key={s.id}
                onClick={() => { setSelectedSubject(s.id); setDone(null) }}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  selectedSubject === s.id
                    ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                    : 'border-slate-200 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                {selectedSubject === s.id && <div className="absolute right-3 top-3"><Check className="w-4 h-4 text-white" /></div>}
                <div className={`font-black text-xs uppercase tracking-widest ${selectedSubject === s.id ? 'text-white' : 'text-slate-900'}`}>{s.code}</div>
                <div className={`text-[10px] font-bold uppercase tracking-tight mt-1 ${selectedSubject === s.id ? 'text-white/60' : 'text-slate-400'}`}>{s.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Zone */}
        <div className="card p-8 border-slate-100 shadow-xl">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-5">Syllabus ingestion (PDF only)</label>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
            className={`
              border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300
              ${isDragOver
                ? 'border-slate-900 bg-slate-50 shadow-inner'
                : file
                  ? 'border-emerald-500 bg-emerald-50/30 shadow-inner'
                  : 'border-slate-200 hover:border-slate-900 bg-slate-50/30 hover:bg-white hover:shadow-2xl'
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
                    <p className="text-slate-900 font-black text-xl uppercase tracking-tight">{file.name}</p>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mt-1">{(file.size / 1024).toFixed(0)} KB · Verified Payload</p>
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
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-20 h-20 rounded-[32px] bg-white flex items-center justify-center border border-slate-100 shadow-xl">
                    <Upload className="w-10 h-10 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-slate-900 font-black text-xl uppercase tracking-tight">Drop your PDF here</p>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">or tap to select from local storage</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {file && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-4"
            >
              {uploading && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest animate-pulse">{uploadStep}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Processing...</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-slate-900"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 4 }}
                    />
                  </div>
                </div>
              )}
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 py-4 shadow-xl shadow-slate-200 hover:bg-black transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <Bot className="w-5 h-5" />
                    Ingest & Sync AI Agent
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>

        {/* Success State */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="card p-8 border-emerald-200 bg-emerald-50/50 flex items-center gap-6 shadow-xl"
            >
              <div className="w-16 h-16 rounded-[24px] bg-white border border-emerald-100 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Check className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-heading text-slate-900 font-black uppercase tracking-tight">AI Knowledge Base Updated</h3>
                <p className="text-slate-500 text-sm font-medium mt-1 leading-relaxed">
                  The study agent is now fully grounded in <strong className="text-slate-900">{done}</strong> material.
                  Students can now access these modules via their dashboards.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  )
}
