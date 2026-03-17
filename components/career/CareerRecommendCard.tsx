'use client'

import { TrendingUp, TrendingUp as Stable, Minus } from 'lucide-react'

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

const outlookConfig = {
  high:   { label: 'High Growth',  icon: TrendingUp, color: 'text-green-600 bg-green-50' },
  medium: { label: 'Steady Growth', icon: Stable,    color: 'text-blue-600 bg-blue-50' },
  stable: { label: 'Stable',        icon: Minus,     color: 'text-gray-500 bg-gray-50' },
}

function formatMYR(n: number) {
  return `RM ${(n / 1000).toFixed(0)}k`
}

export function CareerRecommendCard({ rec, rank, onSetTarget }: CareerRecommendCardProps) {
  const outlook = outlookConfig[rec.growth_outlook as keyof typeof outlookConfig] ?? outlookConfig.stable
  const OutlookIcon = outlook.icon

  const fitColor =
    rec.fit_score >= 70 ? '#10b981' :
    rec.fit_score >= 40 ? '#f59e0b' :
    '#ef4444'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">#{rank}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${outlook.color} flex items-center gap-1`}>
              <OutlookIcon size={9} />
              {outlook.label}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 text-base">{rec.title}</h3>
        </div>
        {/* Fit score circle */}
        <div className="flex flex-col items-center shrink-0">
          <svg width={48} height={48}>
            <circle cx={24} cy={24} r={19} fill="none" stroke="#f1f5f9" strokeWidth={5} />
            <circle
              cx={24} cy={24} r={19}
              fill="none"
              stroke={fitColor}
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 19}
              strokeDashoffset={2 * Math.PI * 19 * (1 - rec.fit_score / 100)}
              transform="rotate(-90 24 24)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
            <text x={24} y={28} textAnchor="middle" fontSize={11} fontWeight="700" fill="#0f172a">{rec.fit_score}%</text>
          </svg>
          <span className="text-[9px] text-gray-400 text-center leading-tight mt-0.5">fit</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed">{rec.description}</p>

      {/* Why good fit */}
      <div className="bg-primary/5 rounded-lg px-3 py-2">
        <p className="text-xs text-primary font-medium">✨ {rec.why_good_fit}</p>
      </div>

      {/* Salary */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-gray-400 uppercase">Avg. Salary (MY)</span>
        <span className="text-sm font-bold text-gray-900">{formatMYR(rec.salary_range_myr.min)} – {formatMYR(rec.salary_range_myr.max)}/mo</span>
      </div>

      {/* Skills needed */}
      {rec.required_skills.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">Key Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {rec.required_skills.slice(0, 6).map(s => (
              <span key={s} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        </div>
      )}

      {onSetTarget && (
        <button
          onClick={() => onSetTarget(rec.title)}
          className="mt-auto w-full bg-primary text-white text-xs font-semibold py-2 rounded-xl hover:bg-primary-hover transition-colors"
        >
          Set as Target Career
        </button>
      )}
    </div>
  )
}
