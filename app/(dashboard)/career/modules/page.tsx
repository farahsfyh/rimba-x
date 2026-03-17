'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, List, LayoutGrid } from 'lucide-react'
import { ModuleCard } from '@/components/career/ModuleCard'
import { Button } from '@/components/ui/Button'
import type { LearningModule } from '@/types'

const STATUSES: { key: string; label: string; color: string }[] = [
  { key: 'not_started', label: 'Not Started', color: 'text-gray-500' },
  { key: 'in_progress', label: 'In Progress',  color: 'text-blue-500' },
  { key: 'completed',   label: 'Completed',    color: 'text-green-600' },
]

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

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-6 md:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6" suppressHydrationWarning>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={20} className="text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Learning Modules</h1>
        </div>
        <p className="text-sm text-gray-500">AI-curated resources for your skill gaps</p>
      </motion.div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        {/* Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all
              ${filter === 'all' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary'}`}
          >
            All ({modules.length})
          </button>
          {STATUSES.map(s => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all
                ${filter === s.key ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary'}`}
            >
              {s.label} ({byStatus(s.key).length})
            </button>
          ))}
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => setView('kanban')}
            className={`p-1.5 rounded-md transition-all ${view === 'kanban' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-40 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && modules.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-sm mx-auto flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
              <BookOpen size={24} className="text-green-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No modules yet</h3>
            <p className="text-sm text-gray-500 text-center">Run a skill gap analysis to generate personalised learning modules.</p>
            <Button size="sm" onClick={() => window.location.href = '/career/analyse'}>Go to Analysis →</Button>
          </div>
        </div>
      )}

      {/* KANBAN VIEW */}
      {!loading && modules.length > 0 && view === 'kanban' && filter === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATUSES.map(col => (
            <div key={col.key}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold uppercase ${col.color}`}>{col.label}</span>
                <span className="text-xs text-gray-400">({byStatus(col.key).length})</span>
              </div>
              <div className="flex flex-col gap-3">
                {byStatus(col.key).length === 0 ? (
                  <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-300">
                    Empty
                  </div>
                ) : (
                  byStatus(col.key).map((mod, i) => (
                    <motion.div
                      key={mod.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ModuleCard module={mod} onUpdate={updated => handleUpdate(mod.id, updated)} />
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {!loading && modules.length > 0 && (view === 'list' || filter !== 'all') && (
        <div className="flex flex-col gap-4">
          {displayed.map((mod, i) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <ModuleCard module={mod} onUpdate={updated => handleUpdate(mod.id, updated)} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
