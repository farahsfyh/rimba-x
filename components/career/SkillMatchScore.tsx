'use client'

interface SkillMatchScoreProps {
  score: number
  size?: number
}

export function SkillMatchScore({ score, size = 120 }: SkillMatchScoreProps) {
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const progress = circumference - (score / 100) * circumference

  const color =
    score >= 70 ? '#10b981' :
    score >= 40 ? '#f59e0b' :
    '#ef4444'

  const label =
    score >= 70 ? 'Strong Match' :
    score >= 40 ? 'Developing' :
    'Early Stage'

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={10} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="flex flex-col items-center -mt-[calc(var(--size,120px)/2+28px)]" style={{ marginTop: `-${size / 2 + 28}px` }}>
        <span className="text-2xl font-bold text-gray-900">{score}%</span>
        <span className="text-xs font-medium" style={{ color }}>{label}</span>
      </div>
    </div>
  )
}
