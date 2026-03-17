'use client'

import { useState } from 'react'
import { BookOpen, Clock, ChevronDown, Check, ExternalLink, Loader2 } from 'lucide-react'
import type { LearningModule } from '@/types'
import toast from 'react-hot-toast'

const difficultyConfig = {
  beginner:     { label: 'Beginner',     className: 'bg-green-100 text-green-700' },
  intermediate: { label: 'Intermediate', className: 'bg-amber-100 text-amber-700' },
  advanced:     { label: 'Advanced',     className: 'bg-red-100 text-red-700' },
}

const statusConfig = {
  not_started: { label: 'Not Started', className: 'bg-gray-100 text-gray-500' },
  in_progress: { label: 'In Progress',  className: 'bg-blue-100 text-blue-600' },
  completed:   { label: 'Completed',    className: 'bg-green-100 text-green-700' },
}

interface ModuleCardProps {
  module: LearningModule
  onUpdate?: (updated: LearningModule) => void
}

export function ModuleCard({ module, onUpdate }: ModuleCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const diff = difficultyConfig[module.difficulty as keyof typeof difficultyConfig] ?? difficultyConfig.beginner
  const stat = statusConfig[module.status as keyof typeof statusConfig] ?? statusConfig.not_started

  const updateStatus = async (newStatus: LearningModule['status']) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/career/modules/${module.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (res.ok) {
        onUpdate?.(data.module)
        toast.success(newStatus === 'completed' ? '🎉 Module completed! +150 XP' : '▶️ Module started! +25 XP')
      } else {
        toast.error(data.error ?? 'Failed to update')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all ${module.status === 'completed' ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{module.title}</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{module.skill_target}</p>
          </div>
          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${diff.className}`}>
            {diff.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${stat.className}`}>{stat.label}</span>
            <span className="text-[10px] text-gray-400">{module.completion_pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${module.completion_pct}%`,
                background: module.status === 'completed' ? '#10b981' : 'linear-gradient(90deg, #3b82f6, #6366f1)',
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Clock size={10} />{module.estimated_hours}h</span>
          <span className="flex items-center gap-1"><BookOpen size={10} />{module.resources.length} resources</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 flex items-center gap-2">
        {module.status === 'not_started' && (
          <button
            onClick={() => updateStatus('in_progress')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : '▶ Start'}
          </button>
        )}
        {module.status === 'in_progress' && (
          <button
            onClick={() => updateStatus('completed')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <><Check size={12} /> Mark Complete</>}
          </button>
        )}
        {module.status === 'completed' && (
          <span className="flex-1 flex items-center justify-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold py-1.5 rounded-lg">
            <Check size={12} /> Completed
          </span>
        )}

        <button
          onClick={() => setExpanded(x => !x)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1.5"
        >
          Resources
          <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded resources */}
      {expanded && module.resources.length > 0 && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-1.5">
          {module.resources.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-primary hover:text-primary-hover group transition-colors"
            >
              <ExternalLink size={10} className="opacity-60 group-hover:opacity-100 shrink-0" />
              <span className="truncate">{r.title}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
