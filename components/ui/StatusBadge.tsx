import React from 'react'
import { cn } from '@/lib/utils'

type Status = 'processed' | 'processing' | 'pending' | 'error'
type Size = 'sm' | 'md'

interface StatusBadgeProps {
  status: Status
  label?: string
  size?: Size
  className?: string
}

const config: Record<Status, { bg: string; text: string; dot: string; defaultLabel: string }> = {
  processed: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
    defaultLabel: 'Processed',
  },
  processing: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    defaultLabel: 'Processing...',
  },
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
    defaultLabel: 'Pending',
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500',
    defaultLabel: 'Error',
  },
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}

export function StatusBadge({ status, label, size = 'sm', className }: StatusBadgeProps) {
  const c = config[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        c.bg,
        c.text,
        sizeStyles[size],
        className
      )}
    >
      <span
        className={cn(
          'rounded-full',
          c.dot,
          size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
          status === 'processing' && 'animate-pulse'
        )}
      />
      {label ?? c.defaultLabel}
    </span>
  )
}
