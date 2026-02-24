import React from 'react'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

type Role = 'user' | 'ai'

interface ChatBubbleProps {
  role: Role
  content: string
  timestamp?: string
  isTyping?: boolean
  userInitial?: string
  className?: string
}

export function ChatBubble({ role, content, timestamp, isTyping = false, userInitial = 'U', className }: ChatBubbleProps) {
  const isUser = role === 'user'

  return (
    <div className={cn('flex gap-3 w-full', isUser && 'flex-row-reverse', className)}>
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm',
          isUser
            ? 'bg-primary text-white'
            : 'bg-linear-to-br from-primary to-accent text-white'
        )}
      >
        {isUser ? userInitial : <Sparkles size={14} />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-white rounded-tr-sm shadow-sm shadow-primary/20'
            : 'bg-white text-secondary border border-gray-100 rounded-tl-sm shadow-sm'
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
              'mt-1.5 text-right text-[10px]',
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
          className="h-2 w-2 rounded-full bg-primary/40 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}
