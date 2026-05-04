import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileText, Presentation, Download, Search, BookOpen, Calendar, User, Eye, Filter } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import { STUDY_MATERIALS, SUBJECTS, type StudyMaterial } from '../../lib/mockData'
import toast from 'react-hot-toast'

interface MaterialsPageProps { onLogout: () => void }

const FILE_ICONS: Record<StudyMaterial['fileType'], { icon: typeof FileText; color: string; bg: string }> = {
  pdf:   { icon: FileText,     color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  ppt:   { icon: Presentation, color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  doc:   { icon: FileText,     color: '#4F8EF7', bg: 'rgba(79,142,247,0.15)' },
  video: { icon: Eye,          color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
  link:  { icon: BookOpen,     color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
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

  const groupedByChapter = useMemo(() => {
    const groups: Record<string, StudyMaterial[]> = {}
    for (const m of filtered) {
      const key = `${m.subjectCode} · ${m.chapter}`
      if (!groups[key]) groups[key] = []
      groups[key].push(m)
    }
    return groups
  }, [filtered])

  return (
    <PageWrapper role="student" userName={user.name || 'Student'} onLogout={onLogout}
      title="Study Materials" subtitle="All uploaded resources from your faculty">

      {/* Subject Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/8 rounded-2xl overflow-x-auto mb-5 flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
        <button onClick={() => setSelectedSubject('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${selectedSubject === 'all' ? 'bg-electric-blue text-white shadow-lg shadow-electric-blue/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
          All Subjects
        </button>
        {SUBJECTS.map(s => (
          <button key={s.id} onClick={() => setSelectedSubject(s.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${selectedSubject === s.id ? 'bg-electric-blue text-white shadow-lg shadow-electric-blue/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
            {s.code}
          </button>
        ))}
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search materials, topics, chapters…"
            className="w-full h-10 bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-electric-blue/40 transition-all" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="h-10 bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-4 text-sm text-white focus:outline-none focus:border-electric-blue/40 appearance-none">
            <option value="all" style={{ background: '#1A1D2E' }}>All Types</option>
            <option value="pdf" style={{ background: '#1A1D2E' }}>PDF</option>
            <option value="ppt" style={{ background: '#1A1D2E' }}>PPT</option>
            <option value="doc" style={{ background: '#1A1D2E' }}>DOC</option>
            <option value="video" style={{ background: '#1A1D2E' }}>Video</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-6 text-xs text-white/30">
        <span>{filtered.length} materials</span>
        <span>·</span>
        <span>{Object.keys(groupedByChapter).length} chapters</span>
        {search && <span>· Results for "<strong className="text-white/50">{search}</strong>"</span>}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="w-12 h-12 text-white/10 mb-4" />
          <p className="text-white/30">No materials match your filters</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByChapter).map(([group, items], gi) => (
            <div key={group}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3 px-1">{group}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((m, i) => {
                  const meta = FILE_ICONS[m.fileType]
                  const Icon = meta.icon
                  return (
                    <motion.div key={m.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (gi * 0.05) + (i * 0.04) }}
                      className="card p-4 flex items-start gap-4 group hover:border-white/15 transition-all">

                      {/* File icon */}
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: meta.bg, border: `1px solid ${meta.color}25` }}>
                        <Icon className="w-5 h-5" style={{ color: meta.color }} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm mb-1 truncate">{m.title}</h4>
                        <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2">{m.description}</p>

                        <div className="flex items-center gap-3 text-[10px] text-white/25 flex-wrap">
                          <span className="flex items-center gap-1"><User className="w-2.5 h-2.5" />{m.uploadedBy.split(' ').pop()}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />{new Date(m.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          <span>{m.fileSize}</span>
                          {m.pages && <span>{m.pages} pages</span>}
                          <span className="flex items-center gap-1"><Download className="w-2.5 h-2.5" />{m.downloads}</span>
                        </div>
                      </div>

                      {/* Download button */}
                      <button onClick={() => handleDownload(m)}
                        className="p-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-white/30 hover:text-electric-blue hover:border-electric-blue/30 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100">
                        <Download className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
