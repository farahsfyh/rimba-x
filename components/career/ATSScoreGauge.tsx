'use client'

interface ATSScoreGaugeProps {
  score: number
  size?: number
}

export function ATSScoreGauge({ score, size = 140 }: ATSScoreGaugeProps) {
  // Semi-circle gauge (180 degrees)
  const cx = size / 2
  const cy = size * 0.6
  const radius = size * 0.4
  const circumference = Math.PI * radius  // half circle
  const progress = circumference - (score / 100) * circumference

  const color =
    score >= 75 ? '#10b981' :
    score >= 50 ? '#f59e0b' :
    '#ef4444'

  const label =
    score >= 75 ? 'ATS Friendly' :
    score >= 50 ? 'Needs Work' :
    'Low Match'

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={cy + 10} overflow="visible">
        {/* Background track */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none" stroke="#f1f5f9" strokeWidth={12} strokeLinecap="round"
        />
        {/* Filled progress */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize={22} fontWeight="700" fill="#0f172a">{score}</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize={11} fill={color} fontWeight="600">{label}</text>
        <text x={cx - radius} y={cy + 18} textAnchor="middle" fontSize={9} fill="#94a3b8">0</text>
        <text x={cx + radius} y={cy + 18} textAnchor="middle" fontSize={9} fill="#94a3b8">100</text>
      </svg>
      <p className="text-xs text-gray-400 mt-1">ATS Compatibility Score</p>
    </div>
  )
}
