'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Plus, Pencil, Download, X, Check, RefreshCw,
  MessageCircle, ChevronDown, Loader2, AlertCircle, StickyNote,
  FileText, CheckCircle2, Lightbulb,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────
interface DocumentInfo {
  id: string
  filename: string
  title: string | null
  processed: boolean
}

interface NoteCard {
  id: string
  title: string
  resourceFilename: string
  documentId: string
  concepts: string[]   // may contain **term** bold syntax
  keyTerms: string[]   // "TermName: definition" format
  isAiGenerated: boolean
  editContent: string  // populated when user saves an edit
  createdAt: string
}

interface MCQOption { label: string; text: string }

interface ExerciseState {
  documentId: string
  quickCheck: {
    question: string
    options: MCQOption[]
    correctIndex: number
    explanation: string
  }
  guidedPractice: { task: string }
}

interface QCFeedback { right: string; fix: string }
interface GuidedFeedback { qualityLabel: string; feedback: string; suggestion: string }

// ─── Helpers ──────────────────────────────────────────────
function uid() {
  return `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/** Renders concept text: **term** → yellow-highlighted spans */
function HighlightedConcept({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <mark key={i} className="bg-yellow-100 text-gray-900 px-0.5 rounded not-italic font-semibold">
              {part.slice(2, -2)}
            </mark>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

const QUALITY_STYLES: Record<string, string> = {
  Strong:       'text-success bg-success/10 border-success/20',
  Good:         'text-blue-600 bg-blue-50 border-blue-200',
  'Needs Work': 'text-warning bg-warning/10 border-warning/20',
}

// ─── Main Page ─────────────────────────────────────────────
export default function NotesExercisesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId]           = useState<string | null>(null)
  const [documents, setDocuments]     = useState<DocumentInfo[]>([])
  const [docsLoading, setDocsLoading] = useState(true)

  // Notes
  const [notes, setNotes]           = useState<NoteCard[]>([])
  const [activeTab, setActiveTab]   = useState<'ai' | 'my'>('ai')
  const [editingId, setEditingId]   = useState<string | null>(null)

  // Generate notes dropdown
  const [showGenDrop, setShowGenDrop]         = useState(false)
  const [generatingNotes, setGeneratingNotes] = useState(false)
  const [genError, setGenError]               = useState<string | null>(null)

  // Exercises
  const [exercises, setExercises]             = useState<ExerciseState | null>(null)
  const [exercisesLoading, setExercisesLoading] = useState(false)
  const [exercisesError, setExercisesError]   = useState<string | null>(null)
  const [showExDropdown, setShowExDropdown]   = useState(false)

  // MCQ
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [qcFeedback, setQcFeedback]         = useState<QCFeedback | null>(null)
  const [qcLoading, setQcLoading]           = useState(false)

  // Guided practice
  const [guidedText, setGuidedText]           = useState('')
  const [guidedFeedback, setGuidedFeedback]   = useState<GuidedFeedback | null>(null)
  const [guidedLoading, setGuidedLoading]     = useState(false)

  // Bottom bar
  const [lessonComplete, setLessonComplete] = useState(false)

  // Refs for PDF export
  const noteRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // ── Load user + documents + persisted notes ──
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const res = await fetch('/api/documents').then(r => r.ok ? r.json() : null).catch(() => null)
      if (res?.documents) {
        setDocuments(res.documents.filter((d: DocumentInfo) => d.processed))
      }
      setDocsLoading(false)

      const raw = localStorage.getItem(`rimba_notes_${user.id}`)
      if (raw) {
        try { setNotes(JSON.parse(raw)) } catch {}
      }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Persist notes to localStorage ──
  const saveNotes = useCallback((updated: NoteCard[]) => {
    setNotes(updated)
    if (userId) localStorage.setItem(`rimba_notes_${userId}`, JSON.stringify(updated))
  }, [userId])

  // ── Generate notes from a document ──
  const generateNotes = async (docId: string) => {
    setGeneratingNotes(true)
    setGenError(null)
    setShowGenDrop(false)
    try {
      const res = await fetch('/api/notes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId }),
      })
      const data = await res.json()
      if (!res.ok) { setGenError(data.error || 'Failed to generate notes.'); return }
      const newNote: NoteCard = {
        id: uid(),
        title: data.title,
        resourceFilename: data.resourceFilename,
        documentId: data.documentId,
        concepts: data.concepts,
        keyTerms: data.keyTerms,
        isAiGenerated: true,
        editContent: '',
        createdAt: new Date().toISOString(),
      }
      saveNotes([newNote, ...notes])
      setActiveTab('ai')
    } catch {
      setGenError('Network error. Please try again.')
    } finally {
      setGeneratingNotes(false)
    }
  }

  // ── Generate exercises from a document ──
  const generateExercises = async (docId: string) => {
    setExercisesLoading(true)
    setExercisesError(null)
    setShowExDropdown(false)
    setSelectedOption(null)
    setQcFeedback(null)
    setGuidedText('')
    setGuidedFeedback(null)
    try {
      const res = await fetch('/api/exercises/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId }),
      })
      const data = await res.json()
      if (!res.ok) { setExercisesError(data.error || 'Failed to generate exercises.'); return }
      setExercises(data)
    } catch {
      setExercisesError('Network error. Please try again.')
    } finally {
      setExercisesLoading(false)
    }
  }

  // ── MCQ answer ──
  const handleSelectOption = async (idx: number) => {
    if (selectedOption !== null || !exercises) return
    setSelectedOption(idx)
    setQcLoading(true)
    try {
      const qc = exercises.quickCheck
      const res = await fetch('/api/exercises/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'quickcheck',
          question: qc.question,
          correctAnswer: qc.options[qc.correctIndex]?.text || '',
          userAnswer: qc.options[idx]?.text || '',
        }),
      })
      const data = await res.json()
      if (res.ok) setQcFeedback(data)
    } catch {}
    finally { setQcLoading(false) }
  }

  // ── Guided practice submit ──
  const handleGuidedSubmit = async () => {
    if (!guidedText.trim() || !exercises || guidedLoading) return
    setGuidedLoading(true)
    try {
      const res = await fetch('/api/exercises/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'guided',
          task: exercises.guidedPractice.task,
          submission: guidedText,
        }),
      })
      const data = await res.json()
      if (res.ok) setGuidedFeedback(data)
    } catch {}
    finally { setGuidedLoading(false) }
  }

  // ── PDF export (dynamic import keeps bundle lean) ──
  const exportPDF = async (noteId: string) => {
    const el = noteRefs.current[noteId]
    if (!el) return
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const imgW  = pageW - 20
      const imgH  = (canvas.height * imgW) / canvas.width
      pdf.addImage(imgData, 'PNG', 10, 10, imgW, imgH)
      const note = notes.find(n => n.id === noteId)
      pdf.save(`${note?.title || 'notes'}.pdf`)
    } catch (e) {
      console.error('[PDF export]', e)
    }
  }

  // ── Retry exercises ──
  const retryExercises = () => {
    if (!exercises) return
    generateExercises(exercises.documentId)
  }

  // ── Ask tutor (navigates with URL params) ──
  const askTutor = () => {
    const docName = exercises
      ? (documents.find(d => d.id === exercises.documentId)?.title ||
         documents.find(d => d.id === exercises.documentId)?.filename ||
         'my materials')
      : 'my materials'
    const context = qcFeedback
      ? `Quick Check: "${exercises?.quickCheck.question}"`
      : guidedFeedback
      ? `Guided Practice: "${exercises?.guidedPractice.task}"`
      : ''
    const params = new URLSearchParams({ topic: docName })
    if (context) params.set('context', context)
    router.push(`/dashboard/tutor?${params.toString()}`)
  }

  const filteredNotes = notes.filter(n => activeTab === 'ai' ? n.isAiGenerated : !n.isAiGenerated)

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto">
      <div className="space-y-5 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary">Notes & Exercises</h1>
            <p className="text-sm text-muted">Study materials and practice questions</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {(['ai', 'my'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab ? 'bg-white text-secondary shadow-sm' : 'text-muted hover:text-secondary'
              }`}
            >
              {tab === 'ai' ? 'AI-Generated Notes' : 'My Notes'}
            </button>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ── LEFT: Notes ──────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-secondary uppercase tracking-wide">
                {activeTab === 'ai' ? 'AI-Generated Notes' : 'My Notes'}
              </h2>
              <div className="relative">
                <button
                  onClick={() => { setShowGenDrop(v => !v); setGenError(null) }}
                  disabled={generatingNotes}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {generatingNotes ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span className="hidden sm:inline">Generate Lesson Notes</span>
                  <span className="sm:hidden">Generate</span>
                  <ChevronDown size={12} />
                </button>
                <AnimatePresence>
                  {showGenDrop && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl border border-gray-200 shadow-soft-md z-20 overflow-hidden"
                    >
                      <p className="text-xs text-muted px-3 pt-3 pb-2 font-medium border-b border-gray-100">
                        Select a document to generate notes:
                      </p>
                      {docsLoading ? (
                        <div className="px-4 py-4 text-sm text-muted flex items-center gap-2">
                          <Loader2 size={13} className="animate-spin" /> Loading…
                        </div>
                      ) : documents.length === 0 ? (
                        <div className="px-4 py-4 text-sm text-muted">No processed documents yet.</div>
                      ) : (
                        <div className="max-h-52 overflow-y-auto">
                          {documents.map(doc => (
                            <button
                              key={doc.id}
                              onClick={() => generateNotes(doc.id)}
                              className="w-full text-left px-3 py-2.5 text-sm text-secondary hover:bg-primary/5 flex items-center gap-2 transition-colors"
                            >
                              <FileText size={13} className="text-primary shrink-0" />
                              <span className="truncate">{doc.title || doc.filename}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {genError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-sm text-error bg-error/10 border border-error/20 px-3 py-2.5 rounded-xl"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  <span className="flex-1">{genError}</span>
                  <button onClick={() => setGenError(null)} className="text-error hover:opacity-70 shrink-0"><X size={14} /></button>
                </motion.div>
              )}
            </AnimatePresence>

            {filteredNotes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                  <StickyNote size={22} className="text-muted" />
                </div>
                <p className="text-sm font-semibold text-secondary mb-1">
                  {activeTab === 'ai' ? 'No AI notes yet' : 'No personal notes yet'}
                </p>
                <p className="text-xs text-muted max-w-xs leading-relaxed">
                  {activeTab === 'ai'
                    ? 'Click "Generate Lesson Notes" to create structured notes from your uploaded materials.'
                    : 'Notes you edit and save manually will appear here.'}
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredNotes.map((note, i) => (
                  <NoteCardView
                    key={note.id}
                    note={note}
                    isEditing={editingId === note.id}
                    cardRef={el => { noteRefs.current[note.id] = el }}
                    onEdit={() => setEditingId(editingId === note.id ? null : note.id)}
                    onSaveEdit={content => {
                      saveNotes(notes.map(n =>
                        n.id === note.id ? { ...n, editContent: content, isAiGenerated: false } : n
                      ))
                      setEditingId(null)
                    }}
                    onCancelEdit={() => setEditingId(null)}
                    onDelete={() => {
                      saveNotes(notes.filter(n => n.id !== note.id))
                      setEditingId(null)
                    }}
                    onExportPDF={() => exportPDF(note.id)}
                    animDelay={i * 0.06}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Exercises ─────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-secondary uppercase tracking-wide">Exercises</h2>
              <div className="relative">
                <button
                  onClick={() => setShowExDropdown(v => !v)}
                  disabled={exercisesLoading}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {exercisesLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  <span className="hidden sm:inline">Generate Exercises</span>
                  <span className="sm:hidden">Practice</span>
                  <ChevronDown size={12} />
                </button>
                <AnimatePresence>
                  {showExDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl border border-gray-200 shadow-soft-md z-20 overflow-hidden"
                    >
                      <p className="text-xs text-muted px-3 pt-3 pb-2 font-medium border-b border-gray-100">
                        Select a document to practice:
                      </p>
                      {docsLoading ? (
                        <div className="px-4 py-4 text-sm text-muted flex items-center gap-2">
                          <Loader2 size={13} className="animate-spin" /> Loading…
                        </div>
                      ) : documents.length === 0 ? (
                        <div className="px-4 py-4 text-sm text-muted">No processed documents yet.</div>
                      ) : (
                        <div className="max-h-52 overflow-y-auto">
                          {documents.map(doc => (
                            <button
                              key={doc.id}
                              onClick={() => generateExercises(doc.id)}
                              className="w-full text-left px-3 py-2.5 text-sm text-secondary hover:bg-primary/5 flex items-center gap-2 transition-colors"
                            >
                              <FileText size={13} className="text-primary shrink-0" />
                              <span className="truncate">{doc.title || doc.filename}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {exercisesError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-sm text-error bg-error/10 border border-error/20 px-3 py-2.5 rounded-xl"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  <span className="flex-1">{exercisesError}</span>
                  <button onClick={() => setExercisesError(null)} className="text-error hover:opacity-70 shrink-0"><X size={14} /></button>
                </motion.div>
              )}
            </AnimatePresence>

            {exercisesLoading ? (
              <ExerciseSkeleton />
            ) : !exercises ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                  <Lightbulb size={22} className="text-muted" />
                </div>
                <p className="text-sm font-semibold text-secondary mb-1">No exercises yet</p>
                <p className="text-xs text-muted max-w-xs leading-relaxed">
                  Click "Generate Exercises" and pick a document to create a quick check question and guided practice task.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {/* Quick Check MCQ */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4"
                >
                  <h3 className="text-sm font-bold text-secondary">Quick Check Question</h3>
                  <p className="text-sm text-secondary leading-relaxed">{exercises.quickCheck.question}</p>

                  <div className="space-y-2">
                    {exercises.quickCheck.options.map((opt, idx) => {
                      const isCorrect  = idx === exercises.quickCheck.correctIndex
                      const isSelected = selectedOption === idx
                      const revealed   = selectedOption !== null
                      let cls = 'border-gray-200 text-secondary hover:border-primary/40 hover:bg-primary/5'
                      if (revealed && isCorrect)          cls = 'border-success bg-success/10 text-success'
                      else if (revealed && isSelected)    cls = 'border-error bg-error/10 text-error'
                      else if (!revealed && isSelected)   cls = 'border-primary bg-primary/10 text-primary'
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(idx)}
                          disabled={selectedOption !== null}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${cls} disabled:cursor-default`}
                        >
                          <span className="shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                            {opt.label}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {revealed && isCorrect   && <Check size={15} className="shrink-0 text-success" />}
                          {revealed && isSelected && !isCorrect && <X size={15} className="shrink-0 text-error" />}
                        </button>
                      )
                    })}
                  </div>

                  <AnimatePresence>
                    {(qcLoading || qcFeedback) && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="space-y-2 pt-1"
                      >
                        {qcLoading ? (
                          <div className="flex items-center gap-2 text-sm text-muted">
                            <Loader2 size={14} className="animate-spin" /> Getting feedback…
                          </div>
                        ) : qcFeedback && (
                          <>
                            <div className="flex items-start gap-2 bg-success/10 border border-success/20 rounded-xl px-3 py-2.5">
                              <CheckCircle2 size={15} className="text-success shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-bold text-success mb-0.5">What you did right</p>
                                <p className="text-xs text-secondary leading-relaxed">{qcFeedback.right}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 bg-error/10 border border-error/20 rounded-xl px-3 py-2.5">
                              <AlertCircle size={15} className="text-error shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-bold text-error mb-0.5">What to fix</p>
                                <p className="text-xs text-secondary leading-relaxed">{qcFeedback.fix}</p>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Guided Practice */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4"
                >
                  <h3 className="text-sm font-bold text-secondary">Guided Practice</h3>
                  <p className="text-sm text-secondary leading-relaxed">{exercises.guidedPractice.task}</p>

                  <textarea
                    value={guidedText}
                    onChange={e => setGuidedText(e.target.value)}
                    disabled={!!guidedFeedback}
                    placeholder="Type your explanation here..."
                    rows={5}
                    className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted disabled:bg-gray-50 disabled:text-muted"
                  />

                  {!guidedFeedback && (
                    <button
                      onClick={handleGuidedSubmit}
                      disabled={!guidedText.trim() || guidedLoading}
                      className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {guidedLoading
                        ? <><Loader2 size={14} className="animate-spin" />Evaluating…</>
                        : 'Submit'}
                    </button>
                  )}

                  <AnimatePresence>
                    {guidedFeedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="space-y-3 pt-1"
                      >
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${QUALITY_STYLES[guidedFeedback.qualityLabel] || 'text-muted bg-gray-100 border-gray-200'}`}>
                          {guidedFeedback.qualityLabel}
                          {guidedFeedback.qualityLabel === 'Strong' && ' ✅'}
                          {guidedFeedback.qualityLabel === 'Needs Work' && ' ⚠️'}
                        </span>
                        <p className="text-sm text-secondary leading-relaxed">{guidedFeedback.feedback}</p>
                        {guidedFeedback.suggestion && (
                          <div className="flex items-start gap-2 bg-accent/10 border border-accent/20 rounded-xl px-3 py-2.5">
                            <Lightbulb size={14} className="text-accent shrink-0 mt-0.5" />
                            <p className="text-xs text-secondary">
                              <span className="font-semibold text-accent">Suggested review: </span>
                              {guidedFeedback.suggestion}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Action Bar ─────────────────────────────── */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 shadow-soft-md -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setLessonComplete(true)}
          className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm ${
            lessonComplete
              ? 'bg-success text-white cursor-default'
              : 'bg-primary text-white hover:bg-primary-hover'
          }`}
        >
          <Check size={16} />
          {lessonComplete ? 'Lesson Complete!' : 'Mark Lesson as Complete'}
        </button>

        <button
          onClick={retryExercises}
          disabled={!exercises || exercisesLoading}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 text-secondary hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw size={15} />
          Retry Exercises
        </button>

        <button
          onClick={askTutor}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 text-secondary hover:bg-gray-50 transition-colors"
        >
          <MessageCircle size={15} />
          Ask Tutor to Explain Again
        </button>
      </div>
    </div>
  )
}

// ─── NoteCardView component ────────────────────────────────
interface NoteCardViewProps {
  note: NoteCard
  isEditing: boolean
  cardRef: (el: HTMLDivElement | null) => void
  onEdit: () => void
  onSaveEdit: (content: string) => void
  onCancelEdit: () => void
  onDelete: () => void
  onExportPDF: () => void
  animDelay: number
}

function NoteCardView({
  note, isEditing, cardRef, onEdit, onSaveEdit, onCancelEdit, onDelete, onExportPDF, animDelay,
}: NoteCardViewProps) {
  const [editText, setEditText] = useState(() =>
    note.editContent || note.concepts.join('\n')
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animDelay }}
    >
      {/* Captured by html2canvas for PDF */}
      <div ref={cardRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        {/* Title + resource badge */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-secondary">{note.title}</h3>
          <span className="inline-flex items-center gap-1.5 bg-success/10 text-success text-xs font-medium px-2.5 py-1 rounded-full">
            <FileText size={11} />
            Resource-linked: {note.resourceFilename}
          </span>
        </div>

        {/* Inline edit mode */}
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              rows={8}
              className="w-full text-sm border border-primary/30 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSaveEdit(editText)}
                className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-colors"
              >
                <Check size={12} /> Save
              </button>
              <button
                onClick={onCancelEdit}
                className="text-xs font-medium text-muted hover:text-secondary px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                className="text-xs font-medium text-error hover:bg-error/10 px-3 py-1.5 rounded-lg transition-colors ml-auto"
              >
                Delete Note
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Key Concepts */}
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Key Concepts:</p>
              <ul className="space-y-2">
                {note.concepts.map((concept, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-secondary">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <HighlightedConcept text={concept} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Terms */}
            {note.keyTerms.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Key Terms:</p>
                <ul className="space-y-1.5">
                  {note.keyTerms.map((term, i) => {
                    const colonIdx = term.indexOf(':')
                    const name = colonIdx > -1 ? term.slice(0, colonIdx).trim() : term
                    const def  = colonIdx > -1 ? term.slice(colonIdx + 1).trim() : ''
                    return (
                      <li key={i} className="text-sm">
                        <span className="font-semibold text-secondary">{name}</span>
                        {def && <span className="text-muted"> — {def}</span>}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Card actions */}
        {!isEditing && (
          <div className="flex items-center gap-1 pt-1 border-t border-gray-100">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-primary px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <Pencil size={12} /> Edit Notes
            </button>
            <button
              onClick={onExportPDF}
              className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-primary px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <Download size={12} /> Download as PDF
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── ExerciseSkeleton ─────────────────────────────────────
function ExerciseSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <div className="h-4 w-36 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-3 w-full bg-gray-100 rounded-full animate-pulse" />
          <div className="h-3 w-4/5 bg-gray-100 rounded-full animate-pulse" />
          {i === 1 && (
            <div className="space-y-2 pt-1">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          )}
          {i === 2 && <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />}
        </div>
      ))}
    </div>
  )
}
