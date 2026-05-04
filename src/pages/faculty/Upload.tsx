import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, Check, Bot, X, History, Trash2 } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import toast from 'react-hot-toast'
import { uploadStudyMaterial, getSubjects } from '../../lib/supabase'

interface UploadPageProps {
  onLogout: () => void
}

export default function UploadPage({ onLogout }: UploadPageProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [history, setHistory] = useState<{name: string, date: string, id: string}[]>([])

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

  useEffect(() => {
    getSubjects().then(data => {
      setSubjects(data)
      if (data.length > 0) setSelectedSubject(data[0].id)
    })
  }, [])

  const handleUpload = async () => {
    if (!file || !selectedSubject) return
    setUploading(true)
    setDone(null)

    const steps = ['Analyzing Document Structure', 'Extracting Text and Tables', 'Vectorizing for RAG', 'Syncing with Knowledge Base']
    for (const step of steps) {
      setUploadStep(step)
      await new Promise(res => setTimeout(res, 600))
    }

    const { error } = await uploadStudyMaterial({
      subject_id: selectedSubject,
      title: file.name.replace('.pdf', ''),
      description: `Course material for ${file.name}`,
      file_type: 'pdf',
      file_size: `${(file.size / 1024).toFixed(0)} KB`,
      uploaded_by: user.id
    })

    if (error) {
      toast.error('Failed to sync material with AI')
    } else {
      const subName = subjects.find(s => s.id === selectedSubject)?.name || 'Subject'
      setHistory(prev => [{ name: file.name, date: new Date().toLocaleDateString(), id: Math.random().toString() }, ...prev])
      setDone(subName)
      setFile(null)
      toast.success(`AI Agent is now trained on ${subName}! 🤖`)
    }

    setUploading(false)
    setUploadStep('')
  }

  return (
    <PageWrapper
      role="faculty"
      userName={user.name || 'Faculty'}
      onLogout={onLogout}
      title="Upload Course Material"
      subtitle="Feed your syllabus to the AI Study Agent"
    >
      <div className="grid lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
        <div className="lg:col-span-3 space-y-6">
          {/* Subject Selector */}
          <div className="card p-8 border-slate-100 shadow-xl">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4">Target Course Discipline</label>
            <div className="grid grid-cols-2 gap-3">
              {subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSubject(s.id); setDone(null) }}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                    selectedSubject === s.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                      : 'border-slate-200 hover:border-slate-400 bg-white shadow-sm'
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-5">Syllabus Ingestion</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
              className={`
                border-2 border-dashed rounded-[32px] p-16 text-center cursor-pointer transition-all duration-500
                ${isDragOver
                  ? 'border-blue-500 bg-blue-50/50 shadow-2xl scale-[1.01]'
                  : file
                    ? 'border-emerald-500 bg-emerald-50/20 shadow-inner'
                    : 'border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/5'
                }
              `}
            >
              <input id="file-input" type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-[28px] bg-emerald-100 flex items-center justify-center shadow-xl shadow-emerald-100/50">
                      <File className="w-10 h-10 text-emerald-600" />
                    </div>
                    <div className="mt-2">
                      <p className="text-slate-900 font-black text-xl uppercase tracking-tight">{file.name}</p>
                      <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mt-2">{(file.size / 1024).toFixed(0)} KB · Verified Payload</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null) }} className="text-red-500 hover:text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-50 mt-4 transition-all">
                      <X className="w-4 h-4" /> Discard
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5">
                    <div className="w-24 h-24 rounded-[40px] bg-gradient-to-br from-white to-slate-50 flex items-center justify-center border border-slate-100 shadow-2xl group-hover:rotate-6 transition-transform">
                      <Upload className="w-10 h-10 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                      <p className="text-slate-900 font-black text-2xl uppercase tracking-tight">Sync New Knowledge</p>
                      <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mt-3">Drag & drop syllabus PDF or tap to explore</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {file && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
                {uploading && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest animate-pulse">{uploadStep}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase">Processing...</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-slate-900" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 4 }} />
                    </div>
                  </div>
                )}
                <button onClick={handleUpload} disabled={uploading} className="w-full bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 py-5 shadow-xl shadow-slate-200 hover:bg-black transition-all disabled:opacity-50">
                  {uploading ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><Bot className="w-5 h-5" /> Ingest & Sync AI Agent</>}
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* History / Status */}
          <div className="card p-8 border-slate-100 shadow-xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-heading text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <History className="w-5 h-5" /> Sync Log
              </h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{history.length} Files</span>
            </div>

            {history.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
                <Bot className="w-12 h-12 text-slate-200 mb-4" />
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] max-w-[140px]">No documents ingested yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400">
                      <File className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900 uppercase truncate tracking-tight">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{item.date}</p>
                    </div>
                    <button className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {done && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 p-6 rounded-3xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-200/50">
                    <Check className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Training Complete</h4>
                    <p className="text-slate-500 text-[11px] font-medium mt-1 leading-relaxed">AI Study Agent is now grounded in {done} courseware.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
