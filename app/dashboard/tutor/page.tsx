'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatBubble } from '@/components/ui/ChatBubble'
import { useUser } from '@/lib/hooks/useUser'
import {
  Send,
  Sparkles,
  Brain,
  BookOpen,
  Lightbulb,
  RotateCcw,
  ChevronDown,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: string
}

const SUGGESTED_PROMPTS = [
  {
    icon: BookOpen,
    label: 'Explain a concept',
    prompt: 'Can you explain the concept of photosynthesis in simple terms?',
    color: 'text-primary',
    bg: 'bg-primary/5 hover:bg-primary/10',
  },
  {
    icon: Lightbulb,
    label: 'Help me understand',
    prompt: "I'm struggling to understand algebra. Where should I start?",
    color: 'text-accent',
    bg: 'bg-accent/5 hover:bg-accent/10',
  },
  {
    icon: Brain,
    label: 'Quiz me',
    prompt: "Can you quiz me on the materials I've uploaded?",
    color: 'text-success',
    bg: 'bg-success/5 hover:bg-success/10',
  },
  {
    icon: Sparkles,
    label: 'Study plan',
    prompt: 'Help me create a study plan for my upcoming exam.',
    color: 'text-warning',
    bg: 'bg-warning/5 hover:bg-warning/10',
  },
]

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function TutorRoomPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const userInitial = (user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()

  useEffect(() => {
    if (!showScrollBtn) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, showScrollBtn])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBtn(distFromBottom > 200)
  }

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [input])

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShowScrollBtn(false)
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: formatTime(new Date()),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsStreaming(true)

    const history = messages.map(m => ({
      role: m.role === 'user' ? 'user' as const : 'model' as const,
      content: m.content,
    }))

    const aiMsgId = crypto.randomUUID()
    setMessages(prev => [...prev, {
      id: aiMsgId,
      role: 'ai',
      content: '',
      timestamp: formatTime(new Date()),
    }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: text.trim(), history, context: '' }),
      })

      if (res.status === 401) {
        router.push('/login?reason=session_expired')
        return
      }

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => '')
        console.error('[tutor] API error:', res.status, errText)
        throw new Error(`API returned ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages(prev =>
          prev.map(m => m.id === aiMsgId ? { ...m, content: accumulated } : m)
        )
      }
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === aiMsgId
          ? { ...m, content: 'Sorry, something went wrong. Please try again.' }
          : m
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearChat = () => {
    setMessages([])
    setInput('')
  }

  if (loading) return null

  return (
    <div className="relative flex flex-col h-[calc(100vh-7rem)] max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-secondary leading-tight">Tutor Room</h1>
            <p className="text-xs text-gray-400">
              {messages.length === 0
                ? 'Start a conversation'
                : `${messages.filter(m => m.role === 'user').length} question${messages.filter(m => m.role === 'user').length !== 1 ? 's' : ''} asked`}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <RotateCcw size={12} />
            New chat
          </button>
        )}
      </div>

      {/* Chat container */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Messages area */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <div className="w-16 h-16 bg-linear-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
                  <Sparkles size={28} className="text-white" />
                </div>
                <h2 className="text-lg font-bold text-secondary mb-1">
                  Hi {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}, ready to learn? 👋
                </h2>
                <p className="text-sm text-gray-400 max-w-xs mb-8">
                  Ask me anything, or pick a suggestion below to get started.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTED_PROMPTS.map((s, i) => {
                  const Icon = s.icon
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      onClick={() => sendMessage(s.prompt)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 text-left transition-all cursor-pointer ${s.bg}`}
                    >
                      <Icon size={16} className={`${s.color} shrink-0`} />
                      <span className="text-sm font-medium text-secondary">{s.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          ) : (
            <>
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ChatBubble
                      role={msg.role}
                      content={msg.content}
                      timestamp={msg.timestamp}
                      userInitial={userInitial}
                      isTyping={msg.role === 'ai' && msg.content === '' && isStreaming}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              onClick={scrollToBottom}
              className="absolute bottom-24 right-8 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-all z-10"
            >
              <ChevronDown size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your tutor anything… (Enter to send, Shift+Enter for new line)"
              disabled={isStreaming}
              className="flex-1 resize-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50 leading-relaxed"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="shrink-0 w-10 h-10 bg-primary hover:bg-primary-hover disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-all shadow-sm shadow-primary/20 disabled:shadow-none disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="mt-1.5 text-[10px] text-gray-400 text-center">
            AI can make mistakes — always verify important information.
          </p>
        </div>
      </div>
    </div>
  )
}
