'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface BarChartProps {
  data: { label: string; value: number }[]
  maxValue?: number
  barColor?: string
  className?: string
  height?: number
}

export function BarChart({
  data,
  maxValue,
  barColor = 'bg-blue-500',
  className,
  height = 80,
}: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1)

  return (
    <div className={cn('w-full', className)}>
      <div
        className="flex items-end justify-between gap-1"
        style={{ height }}
      >
        {data.map((item, i) => {
          const pct = max > 0 ? (item.value / max) * 100 : 0
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1 h-full justify-end">
              <div
                title={`${item.label}: ${item.value}`}
                className={cn(
                  'w-full rounded-t-sm transition-all duration-300',
                  barColor,
                  item.value === 0 && 'opacity-20'
                )}
                style={{ height: `${Math.max(pct, item.value > 0 ? 4 : 0)}%` }}
              />
            </div>
          )
        })}
      </div>
      {/* Labels */}
      <div className="flex justify-between gap-1 mt-1">
        {data.map((item, i) => (
          <p key={i} className="flex-1 text-center text-[10px] text-gray-500 truncate">
            {item.label}
          </p>
        ))}
      </div>
    </div>
  )
}
