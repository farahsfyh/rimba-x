import React from 'react'
import { cn } from '@/lib/utils'

type Role = 'user' | 'ai'

interface ChatBubbleProps {
  role: Role
  content: string
  timestamp?: string
  isTyping?: boolean
  className?: string
}

export function ChatBubble({ role, content, timestamp, isTyping = false, className }: ChatBubbleProps) {
  const isUser = role === 'user'

  return (
    <div className={cn('flex gap-3 w-full', isUser && 'flex-row-reverse', className)}>
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
          isUser ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
        )}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
        )}
      >
        {isTyping ? (
          <TypingIndicator />
        ) : (
          <div className="whitespace-pre-wrap wrap-break-word">{content}</div>
        )}
        {timestamp && (
          <p
            className={cn(
              'mt-1 text-right text-[10px]',
              isUser ? 'text-blue-200' : 'text-gray-400'
            )}
          >
            {timestamp}
          </p>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}
