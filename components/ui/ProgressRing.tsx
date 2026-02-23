'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  value: number   // current value
  max: number     // maximum value
  size?: number   // diameter in px
  strokeWidth?: number
  color?: string
  label?: string
  sublabel?: string
  className?: string
}

export function ProgressRing({
  value,
  max,
  size = 100,
  strokeWidth = 8,
  color = '#3b82f6',
  label,
  sublabel,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  const offset = circumference * (1 - pct)

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#e5e7eb"
          fill="none"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        {label && (
          <span className="text-base font-bold text-gray-900 leading-none">{label}</span>
        )}
        {sublabel && (
          <span className="text-[10px] text-gray-500 mt-0.5">{sublabel}</span>
        )}
      </div>
    </div>
  )
}
