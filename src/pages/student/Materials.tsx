import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Presentation, Download, Search, BookOpen, Calendar, User, Eye, Filter, ArrowRight } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import { STUDY_MATERIALS, SUBJECTS, type StudyMaterial } from '../../lib/mockData'
import toast from 'react-hot-toast'

interface MaterialsPageProps { onLogout: () => void }

const FILE_ICONS: Record<StudyMaterial['fileType'], { icon: typeof FileText; color: string; bg: string }> = {
  pdf:   { icon: FileText,     color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
  ppt:   { icon: Presentation, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  doc:   { icon: FileText,     color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
  video: { icon: Eye,          color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
  link:  { icon: BookOpen,     color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
}

export default function MaterialsPage({ onLogout }: MaterialsPageProps) {
  const user = JSON.parse(localStorage.getItem('educore_user') || '{}')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const filtered = useMemo(() => {
    let items = STUDY_MATERIALS
    if (selectedSubject !== 'all') items = items.filter(m => m.subjectId === selectedSubject)
    if (filterType !== 'all') items = items.filter(m => m.fileType === filterType)
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.chapter.toLowerCase().includes(q)
      )
    }
    return items
  }, [selectedSubject, filterType, search])

  const handleDownload = (m: StudyMaterial) => {
    toast.success(`Downloading "${m.title}"…`)
  }

  return (
    <PageWrapper role="student" userName={user.name || 'Student'} onLogout={onLogout}
      title="Study Library" subtitle="High-quality resources for your academic growth">

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Quick search..."
              className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" 
            />
          </div>

          {/* Subject Select */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Filter by Subject</h3>
            <div className="flex flex-col gap-1.5">
              <button 
                onClick={() => setSelectedSubject('all')}
                className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-left flex items-center justify-between group ${selectedSubject === 'all' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300'}`}
              >
                All Modules
                {selectedSubject === 'all' && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
              {SUBJECTS.map(s => (
                <button 
                  key={s.id} onClick={() => setSelectedSubject(s.id)}
                  className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-left flex items-center justify-between group ${selectedSubject === s.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300'}`}
                >
                  {s.code}
                  {selectedSubject === s.id && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Resource Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'pdf', 'ppt', 'video', 'link'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filterType === type ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">
              <span>{filtered.length} resources found</span>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <span>Sorted by Recency</span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200"
            >
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm mb-6">
                <BookOpen className="w-10 h-10 text-slate-200" />
              </div>
              <h4 className="text-slate-900 font-black uppercase tracking-widest text-sm mb-2">No matches found</h4>
              <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto">Try adjusting your filters or search query to find what you're looking for.</p>
            </motion.div>
          ) : (
            <div className="grid gap-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((m, i) => {
                  const meta = FILE_ICONS[m.fileType]
                  const Icon = meta.icon
                  return (
                    <motion.div
                      layout
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="group bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-xl hover:shadow-slate-100 transition-all flex items-center gap-6"
                    >
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
                        style={{ background: meta.bg, border: `1px solid ${meta.color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: meta.color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            {m.subjectCode}
                          </span>
                          <h4 className="text-slate-900 font-black text-sm truncate group-hover:text-blue-600 transition-colors">
                            {m.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-black uppercase tracking-tight">
                           <span>{m.chapter}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-200" />
                           <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {m.uploadedBy}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{m.fileSize}</span>
                        <button 
                          onClick={() => handleDownload(m)}
                          className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
