'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, List, LayoutGrid, Sparkles, CheckCircle, Zap, ArrowRight, RefreshCw } from 'lucide-react'
import { ModuleCard } from '@/components/career/ModuleCard'
import { Button } from '@/components/ui/Button'
import type { LearningModule } from '@/types'
import Link from 'next/link'

const STATUSES: { key: string; label: string; color: string; dot: string }[] = [
  { key: 'not_started', label: 'Not Started', color: 'text-gray-500', dot: 'bg-gray-300' },
  { key: 'in_progress', label: 'In Progress', color: 'text-blue-600', dot: 'bg-blue-400' },
  { key: 'completed',   label: 'Completed',   color: 'text-emerald-600', dot: 'bg-emerald-400' },
]

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }

export default function CareerModulesPage() {
  const [modules, setModules] = useState<LearningModule[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [filter, setFilter] = useState<string>('all')

  const load = useCallback(async () => {
    try {
      const url = filter === 'all' ? '/api/career/modules' : `/api/career/modules?status=${filter}`
      const res = await fetch(url)
      if (res.ok) {
        const json = await res.json()
        setModules(Array.isArray(json) ? json : (json.modules ?? []))
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  function handleUpdate(id: string, updated: LearningModule) {
    setModules(prev => prev.map(m => m.id === id ? updated : m))
  }

  const byStatus = (status: string) => modules.filter(m => m.status === status)
  const displayed = filter === 'all' ? modules : modules.filter(m => m.status === filter)
  const completedPct = modules.length > 0 ? Math.round((byStatus('completed').length / modules.length) * 100) : 0

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* HERO */}
      <div className="relative overflow-hidden bg-teal-600 mx-6 mt-6 rounded-2xl px-6 py-8">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, white 0, white 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, white 0, white 1px, transparent 1px, transparent 28px)' }} />
        <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10">
          <motion.div variants={fadeUp} suppressHydrationWarning className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="text-white/80 text-sm font-semibold">Learning Modules</span>
            <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
              <Sparkles size={9} /> AI-Curated
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} suppressHydrationWarning className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Your Learning Path
          </motion.h1>
          <motion.p variants={fadeUp} suppressHydrationWarning className="text-teal-100 text-sm mb-5">
            Skill-targeted resources personalised from your gap analysis
          </motion.p>

          {/* Progress summary */}
          {!loading && modules.length > 0 && (
            <motion.div
              variants={fadeUp}
              suppressHydrationWarning
              className="bg-white/10 rounded-2xl p-4 max-w-md flex items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-xs font-semibold">Completion</span>
                  <span className="text-white font-extrabold">{completedPct}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completedPct}%` }}
                    transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                    suppressHydrationWarning
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 text-white bg-white/20 rounded-xl px-3 py-2">
                <CheckCircle size={14} />
                <span className="text-sm font-extrabold">{byStatus('completed').length}/{modules.length}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="px-6 md:px-8 pt-5 pb-12">
        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          suppressHydrationWarning
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-3 mb-6 flex items-center justify-between flex-wrap gap-3"
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all
                ${filter === 'all' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-300'}`}
            >
              All ({modules.length})
            </button>
            {STATUSES.map(s => (
              <button
                key={s.key}
                onClick={() => setFilter(s.key)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5
                  ${filter === s.key ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-300'}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${filter === s.key ? 'bg-white' : s.dot}`} />
                {s.label} ({byStatus(s.key).length})
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/career/analyse"
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-all"
            >
              <RefreshCw size={11} />
              Re-run Analysis
            </Link>
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setView('kanban')}
              className={`p-2 rounded-lg transition-all ${view === 'kanban' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={14} />
            </button>
            </div>
          </div>
        </motion.div>

        {/* Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-44 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && modules.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-10 max-w-sm mx-auto flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl flex items-center justify-center">
                <BookOpen size={32} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-1">No modules yet</h3>
                <p className="text-sm text-gray-500 text-center">Run a skill gap analysis to generate your personalised learning path.</p>
              </div>
              <Link href="/career/analyse" className="w-full">
                <Button className="w-full flex items-center justify-center gap-1.5">
                  <Zap size={14} /> Go to Analysis <ArrowRight size={13} />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* KANBAN */}
        {!loading && modules.length > 0 && view === 'kanban' && filter === 'all' && (
          <motion.div
            initial="hidden" animate="visible" variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {STATUSES.map(col => (
              <motion.div key={col.key} variants={fadeUp} suppressHydrationWarning>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${col.color}`}>{col.label}</span>
                  <span className="text-xs text-gray-300 ml-1">({byStatus(col.key).length})</span>
                </div>
                <div className="flex flex-col gap-3">
                  {byStatus(col.key).length === 0 ? (
                    <div className="bg-white/60 rounded-2xl border border-dashed border-gray-200 p-5 text-center text-xs text-gray-300">
                      Empty
                    </div>
                  ) : (
                    byStatus(col.key).map((mod, i) => (
                      <motion.div
                        key={mod.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        suppressHydrationWarning
                      >
                        <ModuleCard module={mod} onUpdate={updated => handleUpdate(mod.id, updated)} />
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* LIST VIEW */}
        {!loading && modules.length > 0 && (view === 'list' || filter !== 'all') && (
          <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col gap-3">
            {displayed.map((mod, i) => (
              <motion.div
                key={mod.id}
                variants={fadeUp}
                suppressHydrationWarning
              >
                <ModuleCard module={mod} onUpdate={updated => handleUpdate(mod.id, updated)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
