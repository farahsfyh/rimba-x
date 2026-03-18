'use client'

import { TrendingUp, Minus, ArrowRight, Star, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'

interface Recommendation {
  title: string
  fit_score: number
  description: string
  required_skills: string[]
  salary_range_myr: { min: number; max: number }
  growth_outlook: string
  why_good_fit: string
}

interface CareerRecommendCardProps {
  rec: Recommendation
  rank: number
  onSetTarget?: (title: string) => void
}

const RANK_GRADIENTS = [
  'from-amber-400 to-orange-500',
  'from-slate-400 to-slate-500',
  'from-amber-600 to-amber-700',
]
const RANK_LABELS = ['Top Pick', '2nd Choice', '3rd Choice']
const CARD_HEADERS = [
  'from-blue-50 via-indigo-50/60 to-violet-50/40',
  'from-emerald-50 via-teal-50/60 to-cyan-50/40',
  'from-rose-50 via-pink-50/60 to-fuchsia-50/40',
]

const outlookConfig = {
  high:   { label: 'High Growth', color: 'text-emerald-700 bg-emerald-100', icon: TrendingUp },
  medium: { label: 'Steady',      color: 'text-blue-700 bg-blue-100',       icon: TrendingUp },
  stable: { label: 'Stable',      color: 'text-gray-600 bg-gray-100',       icon: Minus },
}

function formatMYR(n: number) {
  return `RM ${(n / 1000).toFixed(0)}k`
}

function FitRing({ score }: { score: number }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={64} height={64}>
      <circle cx={32} cy={32} r={r} fill="none" stroke="#e2e8f0" strokeWidth={5} />
      <circle
        cx={32} cy={32} r={r}
        fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - (score / 100) * circ}
        transform="rotate(-90 32 32)"
        style={{ transition: 'stroke-dashoffset 1.2s ease' }}
      />
      <text x={32} y={36} textAnchor="middle" fontSize={12} fontWeight="800" fill="#0f172a">{score}%</text>
    </svg>
  )
}

export function CareerRecommendCard({ rec, rank, onSetTarget }: CareerRecommendCardProps) {
  const outlook = outlookConfig[rec.growth_outlook as keyof typeof outlookConfig] ?? outlookConfig.stable
  const OutlookIcon = outlook.icon
  const headerGrad = CARD_HEADERS[(rank - 1) % 3]
  const rankGrad = RANK_GRADIENTS[(rank - 1) % 3]
  const rankLabel = RANK_LABELS[Math.min(rank - 1, 2)]

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      suppressHydrationWarning
      className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden flex flex-col"
    >
      {/* Gradient header */}
      <div className={`bg-gradient-to-br ${headerGrad} px-5 pt-5 pb-4`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full text-white bg-gradient-to-r ${rankGrad}`}>
                {rankLabel}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${outlook.color}`}>
                <OutlookIcon size={9} />{outlook.label}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 leading-tight">{rec.title}</h3>
          </div>
          <div className="shrink-0 flex flex-col items-center">
            <FitRing score={rec.fit_score} />
            <p className="text-[9px] text-gray-400 -mt-0.5">fit score</p>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3.5 flex-1">
        <p className="text-sm text-gray-600 leading-relaxed">{rec.description}</p>

        <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-3 py-2.5">
          <Star size={13} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 font-medium leading-relaxed">{rec.why_good_fit}</p>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
          <DollarSign size={13} className="text-gray-400 shrink-0" />
          <span className="text-[11px] font-semibold text-gray-400 uppercase">Monthly Salary</span>
          <span className="ml-auto text-sm font-extrabold text-gray-900">
            {formatMYR(rec.salary_range_myr.min)} – {formatMYR(rec.salary_range_myr.max)}
          </span>
        </div>

        {rec.required_skills.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Key Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {rec.required_skills.slice(0, 6).map(s => (
                <span key={s} className="text-[10px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-semibold">{s}</span>
              ))}
            </div>
          </div>
        )}

        {onSetTarget && (
          <button
            onClick={() => onSetTarget(rec.title)}
            className="mt-auto w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
          >
            Set as Target Career <ArrowRight size={13} />
          </button>
        )}
      </div>
    </motion.div>
  )
}
