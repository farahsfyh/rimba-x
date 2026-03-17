'use client'

interface SkillMatchScoreProps {
  score: number
  size?: number
  targetRole?: string
}

export function SkillMatchScore({ score, size = 160, targetRole }: SkillMatchScoreProps) {
  const strokeWidth = 14
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 70 ? '#10b981' :
    score >= 40 ? '#f59e0b' :
    '#ef4444'

  const bgColor =
    score >= 70 ? '#d1fae5' :
    score >= 40 ? '#fef3c7' :
    '#fee2e2'

  const label =
    score >= 70 ? 'Strong Match' :
    score >= 40 ? 'Developing' :
    'Early Stage'

  const cx = size / 2
  const cy = size / 2

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s ease' }}
          />
        </svg>
        {/* Text overlaid in the center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="text-3xl font-extrabold text-gray-900 leading-none">{score}%</span>
          <span
            className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
            style={{ color, background: bgColor }}
          >
            {label}
          </span>
        </div>
      </div>
      {targetRole && (
        <p className="text-xs text-gray-400 text-center max-w-[180px] leading-snug">
          Match to <span className="font-semibold text-gray-600">{targetRole}</span>
        </p>
      )}
    </div>
  )
}
