'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ATSScoreGaugeProps {
  score: number
  size?: number
}

export function ATSScoreGauge({ score, size = 150 }: ATSScoreGaugeProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 250)
    return () => clearTimeout(t)
  }, [score])

  const cx = size / 2
  const cy = size * 0.58
  const radius = size * 0.38
  const circumference = Math.PI * radius
  const progress = circumference - (animated ? (score / 100) : 0) * circumference

  const color =
    score >= 75 ? '#10b981' :
    score >= 50 ? '#f59e0b' :
    '#ef4444'

  const trackColor =
    score >= 75 ? 'rgba(16,185,129,0.12)' :
    score >= 50 ? 'rgba(245,158,11,0.12)' :
    'rgba(239,68,68,0.12)'

  const label =
    score >= 75 ? 'ATS Friendly' :
    score >= 50 ? 'Needs Work' :
    'Low Match'

  const tier =
    score >= 75 ? { emoji: '✅', badge: 'bg-emerald-50 text-emerald-700' } :
    score >= 50 ? { emoji: '⚠️', badge: 'bg-amber-50 text-amber-700' } :
    { emoji: '❌', badge: 'bg-red-50 text-red-600' }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: cy + 20 }}>
        <svg width={size} height={cy + 20} overflow="visible">
          {/* Track */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none" stroke="#f1f5f9" strokeWidth={12} strokeLinecap="round"
          />
          {/* Glow */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth={20}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            opacity={0.18}
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34,1.56,0.64,1)' }}
          />
          {/* Progress */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34,1.56,0.64,1)' }}
          />
          <text x={cx - radius - 2} y={cy + 16} textAnchor="middle" fontSize={9} fill="#94a3b8">0</text>
          <text x={cx + radius + 2} y={cy + 16} textAnchor="middle" fontSize={9} fill="#94a3b8">100</text>
        </svg>
        <div className="absolute text-center" style={{ left: '50%', transform: 'translateX(-50%)', top: cy - 36 }}>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 180 }}
            suppressHydrationWarning
            className="flex flex-col items-center"
          >
            <p className="text-2xl font-extrabold text-gray-900 leading-none">{score}</p>
            <p className="text-[11px] font-bold mt-0.5" style={{ color }}>{label}</p>
          </motion.div>
        </div>
      </div>
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${tier.badge}`}>
        {tier.emoji} ATS Score
      </span>
    </div>
  )
}
