import React from 'react'
import { cn } from '@/lib/utils'

type Variant = 'error' | 'warning' | 'info' | 'success'

interface ErrorMessageProps {
  title?: string
  message: string
  variant?: Variant
  onRetry?: () => void
  className?: string
}

const variantConfig: Record<Variant, { bg: string; border: string; icon: string; text: string; iconPath: string }> = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-500',
    text: 'text-red-800',
    iconPath: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-500',
    text: 'text-yellow-800',
    iconPath: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-500',
    text: 'text-blue-800',
    iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-500',
    text: 'text-green-800',
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
}

export function ErrorMessage({
  title,
  message,
  variant = 'error',
  onRetry,
  className,
}: ErrorMessageProps) {
  const config = variantConfig[variant]
  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border p-4',
        config.bg,
        config.border,
        className
      )}
      role="alert"
    >
      <svg
        className={cn('h-5 w-5 shrink-0 mt-0.5', config.icon)}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={config.iconPath} />
      </svg>
      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn('text-sm font-semibold', config.text)}>{title}</p>
        )}
        <p className={cn('text-sm', config.text)}>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className={cn(
              'mt-2 text-sm font-medium underline underline-offset-2 hover:no-underline',
              config.text
            )}
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
