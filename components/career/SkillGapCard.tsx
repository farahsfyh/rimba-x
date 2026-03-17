'use client'

import { ExternalLink, Clock } from 'lucide-react'
import type { SkillGap } from '@/types'

const importanceConfig = {
  critical: { label: 'Critical', className: 'bg-red-100 text-red-700' },
  important: { label: 'Important', className: 'bg-amber-100 text-amber-700' },
  nice: { label: 'Nice to have', className: 'bg-green-100 text-green-700' },
}

interface SkillGapCardProps {
  gap: SkillGap
}

export function SkillGapCard({ gap }: SkillGapCardProps) {
  const cfg = importanceConfig[gap.importance] ?? importanceConfig.nice

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{gap.skill}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{gap.category}</p>
        </div>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.className}`}>
          {cfg.label}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
        <Clock size={11} />
        <span>~{gap.estimatedHours}h to learn</span>
      </div>

      {gap.resources.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Free Resources</p>
          {gap.resources.slice(0, 3).map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-primary hover:text-primary-hover transition-colors group"
            >
              <ExternalLink size={10} className="shrink-0 opacity-60 group-hover:opacity-100" />
              <span className="truncate">{r.title}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
