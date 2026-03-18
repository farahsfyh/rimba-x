'use client'

import { ExternalLink, Clock, AlertCircle, AlertTriangle, Lightbulb } from 'lucide-react'
import { motion } from 'framer-motion'
import type { SkillGap } from '@/types'

const importanceConfig = {
  critical: {
    label: 'Critical',
    badge: 'bg-red-100 text-red-700',
    border: 'border-red-100',
    bg: 'from-red-50/80 to-rose-50/60',
    icon: AlertCircle,
    iconColor: 'text-red-500',
    dot: 'bg-red-400',
  },
  important: {
    label: 'Important',
    badge: 'bg-amber-100 text-amber-700',
    border: 'border-amber-100',
    bg: 'from-amber-50/80 to-orange-50/60',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    dot: 'bg-amber-400',
  },
  nice: {
    label: 'Nice to have',
    badge: 'bg-teal-100 text-teal-700',
    border: 'border-teal-100',
    bg: 'from-teal-50/80 to-cyan-50/60',
    icon: Lightbulb,
    iconColor: 'text-teal-500',
    dot: 'bg-teal-400',
  },
}

interface SkillGapCardProps {
  gap: SkillGap
}

export function SkillGapCard({ gap }: SkillGapCardProps) {
  const cfg = importanceConfig[gap.importance] ?? importanceConfig.nice
  const Icon = cfg.icon

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(0,0,0,0.09)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      suppressHydrationWarning
      className={`bg-gradient-to-br ${cfg.bg} rounded-2xl border ${cfg.border} p-4 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-2.5">
          <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg flex items-center justify-center bg-white/70`}>
            <Icon size={13} className={cfg.iconColor} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm leading-tight">{gap.skill}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{gap.category}</p>
          </div>
        </div>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs bg-white/60 rounded-xl px-2.5 py-1.5 mb-3">
        <Clock size={11} className="text-gray-400" />
        <span className="text-gray-600 font-medium">~{gap.estimatedHours}h to learn</span>
      </div>

      {gap.resources.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Free Resources</p>
          {gap.resources.slice(0, 3).map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-primary hover:text-primary-hover transition-colors group bg-white/60 rounded-lg px-2.5 py-1.5"
            >
              <ExternalLink size={10} className="shrink-0 opacity-60 group-hover:opacity-100" />
              <span className="truncate font-medium">{r.title}</span>
            </a>
          ))}
        </div>
      )}
    </motion.div>
  )
}
