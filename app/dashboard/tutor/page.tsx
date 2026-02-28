'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useUser } from '@/lib/hooks/useUser'
import {
  Send,
  Sparkles,
  Brain,
  BookOpen,
  Lightbulb,
  RotateCcw,
  ChevronDown,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FileText,
  MoreVertical,
  X,
  Settings,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────── */
interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: string
}
interface DocumentInfo { id: string; filename: string; title?: string | null }
type TeachingMode = 'focused' | 'balanced' | 'exploratory'
type VoiceTone    = 'warm' | 'professional' | 'casual'
interface TutorSettings { teachingMode: TeachingMode; voiceTone: VoiceTone; focusDocumentIds: string[] }
const DEFAULT_SETTINGS: TutorSettings = { teachingMode: 'balanced', voiceTone: 'warm', focusDocumentIds: [] }

/* ─── Constants ─────────────────────────────────────────── */
const SUGGESTED_PROMPTS = [
  { icon: BookOpen,  label: 'Summarise materials', prompt: 'Summarise the key points from my uploaded materials.' },
  { icon: Lightbulb, label: 'Explain a concept',   prompt: 'Explain the main concepts covered in my uploaded documents.' },
  { icon: Brain,     label: 'Quiz me',              prompt: 'Create 5 quiz questions based strictly on my uploaded materials.' },
  { icon: Sparkles,  label: 'Key terms',            prompt: 'List and define the important terms found in my uploaded documents.' },
]

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/* Strip markdown syntax for clean TTS audio — no "asterisk asterisk" read aloud */
function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')           // headings
    .replace(/\*\*(.+?)\*\*/g, '$1')      // bold
    .replace(/\*(.+?)\*/g, '$1')          // italic
    .replace(/__(.+?)__/g, '$1')          // bold alt
    .replace(/_(.+?)_/g, '$1')            // italic alt
    .replace(/`{1,3}[^`]*`{1,3}/g, '')   // code
    .replace(/^[-*+]\s+/gm, '')          // unordered list bullets
    .replace(/^\d+\.\s+/gm, '')          // ordered list numbers
    .replace(/^>\s+/gm, '')              // blockquotes
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/\n{3,}/g, '\n\n')          // collapse excess newlines
    .trim()
}

/* Find first speech-ready boundary in a text chunk.
 * Prefers sentence ends (.!?) at ≥15 chars; falls back to clause breaks (,;:) at ≥35 chars. */
function findSpeechBoundary(text: string): number {
  for (let i = 15; i < text.length; i++) {
    if ('.!?'.includes(text[i])) {
      const next = text[i + 1]
      if (!next || /\s/.test(next)) return i + 1
    }
  }
  if (text.length > 35) {
    for (let i = 30; i < text.length; i++) {
      if (',;:'.includes(text[i])) {
        const next = text[i + 1]
        if (next && /\s/.test(next)) return i + 1
      }
    }
  }
  return -1
}

/* ─── Animated Maya Avatar ──────────────────────────────── */
function MayaAvatar({ isSpeaking, isThinking, isListening }: { isSpeaking: boolean; isThinking: boolean; isListening: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow */}
      <motion.div
        animate={{ scale: isSpeaking ? [1, 1.06, 1] : isListening ? [1, 1.08, 1] : isThinking ? [1, 1.03, 1] : 1, opacity: isSpeaking ? [0.4, 0.7, 0.4] : isListening ? [0.3, 0.6, 0.3] : isThinking ? [0.25, 0.45, 0.25] : 0.25 }}
        transition={{ duration: isSpeaking ? 1.6 : isListening ? 1.2 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-52 h-52 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${isListening ? 'rgba(74,222,128,0.3)' : 'rgba(99,102,241,0.35)'} 0%, transparent 70%)`, transition: 'background 0.4s' }}
      />
      {/* Idle bob */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-44 h-44"
      >
        <div
          className="w-44 h-44 rounded-full flex items-center justify-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 60%, #1e1b4b 100%)',
            boxShadow: '0 0 50px rgba(139,92,246,0.5), 0 0 100px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.12)',
            border: '2px solid rgba(139,92,246,0.5)',
          }}
        >
          {/* SVG illustrated avatar */}
          <svg viewBox="0 0 180 200" className="w-40 h-40" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Shoulders / body base */}
            <ellipse cx="90" cy="185" rx="55" ry="35" fill="#4c1d95" />
            <ellipse cx="90" cy="170" rx="42" ry="28" fill="#5b21b6" />
            {/* Hijab outer (large dark wrap) */}
            <ellipse cx="90" cy="88" rx="52" ry="58" fill="#6d28d9" />
            {/* Head / hijab top */}
            <ellipse cx="90" cy="72" rx="50" ry="50" fill="#7c3aed" />
            {/* Face skin */}
            <ellipse cx="90" cy="95" rx="33" ry="36" fill="#fcd5b4" />
            {/* Hijab side folds */}
            <path d="M38 80 Q40 30 90 25 Q140 30 142 80 Q130 60 90 58 Q50 60 38 80Z" fill="#6d28d9" />
            <path d="M38 80 Q35 110 38 140 Q55 165 90 168 Q60 160 50 130 Q42 105 38 80Z" fill="#7c3aed" />
            <path d="M142 80 Q145 110 142 140 Q125 165 90 168 Q120 160 130 130 Q138 105 142 80Z" fill="#7c3aed" />
            {/* Glasses */}
            <rect x="62" y="88" width="22" height="14" rx="5" fill="rgba(196,181,253,0.15)" stroke="#c4b5fd" strokeWidth="2" />
            <rect x="92" y="88" width="22" height="14" rx="5" fill="rgba(196,181,253,0.15)" stroke="#c4b5fd" strokeWidth="2" />
            <line x1="84" y1="95" x2="92" y2="95" stroke="#c4b5fd" strokeWidth="2" />
            <motion.ellipse cx="73" cy="95" rx="4" ry="4" fill="#3d1a00"
              animate={{ ry: [4, 0.5, 4] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }} />
            <motion.ellipse cx="103" cy="95" rx="4" ry="4" fill="#3d1a00"
              animate={{ ry: [4, 0.5, 4] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }} />
            <circle cx="74" cy="93" r="1.5" fill="white" opacity="0.9" />
            <circle cx="104" cy="93" r="1.5" fill="white" opacity="0.9" />
            <path d="M88 104 Q90 108 92 104" stroke="#b06040" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <motion.path
              d="M80 117 Q90 122 100 117"
              stroke="#e07050" strokeWidth="2" fill="none" strokeLinecap="round"
              animate={{ d: isSpeaking ? ['M80 116 Q90 125 100 116', 'M80 117 Q90 120 100 117', 'M80 116 Q90 125 100 116'] : isListening ? ['M80 117 Q90 124 100 117', 'M80 118 Q90 122 100 118', 'M80 117 Q90 124 100 117'] : isThinking ? ['M80 117 Q90 122 100 117', 'M81 118 Q90 120 99 118', 'M80 117 Q90 122 100 117'] : 'M80 117 Q90 122 100 117' }}
              transition={{ duration: isSpeaking ? 0.4 : isListening ? 0.8 : 1.2, repeat: isSpeaking || isThinking || isListening ? Infinity : 0 }} />
          </svg>
        </div>
        {(isSpeaking || isThinking || isListening) && (
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: isListening ? 1.0 : isSpeaking ? 0.8 : 1.6, repeat: Infinity }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: `2px solid ${isListening ? '#4ade80' : isSpeaking ? '#818cf8' : '#a78bfa'}` }}
          />
        )}
      </motion.div>
    </div>
  )
}

/* ─── Avatar Panel ───────────────────────────────────────── */
function AvatarPanel({ micOn, voiceOn, isSpeaking, isThinking, isListening, liveMode, onToggleMic, onToggleVoice, onStartLive, onStopLive, activeFile }: {
  micOn: boolean; voiceOn: boolean; isSpeaking: boolean; isThinking: boolean; isListening: boolean; liveMode: boolean
  onToggleMic: () => void; onToggleVoice: () => void; onStartLive: () => void; onStopLive: () => void; activeFile: string | null
}) {
  const liveStatusLabel = isListening ? 'Listening…' : isThinking ? 'Thinking…' : isSpeaking ? 'Speaking…' : 'Ready'
  const liveStatusColor = isListening ? '#4ade80' : isThinking ? '#fbbf24' : isSpeaking ? '#818cf8' : '#94a3b8'
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-6 py-8">
      <MayaAvatar isSpeaking={isSpeaking} isThinking={isThinking} isListening={isListening} />
      <div className="text-center">
        <h2 className="text-lg font-bold text-white tracking-wide">Maya</h2>
        <motion.p
          key={liveMode ? liveStatusLabel : 'static'}
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="text-sm mt-0.5 font-medium"
          style={{ color: liveMode ? liveStatusColor : '#c4b5fd', transition: 'color 0.3s' }}>
          {liveMode ? liveStatusLabel : (isThinking ? 'Thinking…' : isSpeaking ? 'Speaking…' : 'Your AI Tutor')}
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {liveMode ? (
          <motion.div key="live"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-4 w-full">
            {/* Waveform bars when listening; status hint otherwise */}
            <div className="h-9 flex items-center justify-center">
              {isListening ? (
                <div className="flex items-end gap-1">
                  {[10, 22, 30, 18, 26, 14, 20].map((h, i) => (
                    <motion.div key={i}
                      className="w-1.5 rounded-full"
                      style={{ background: '#4ade80', height: h }}
                      animate={{ height: [h * 0.4 + 4, h, h * 0.4 + 4] }}
                      transition={{ duration: 0.45 + i * 0.06, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  {isThinking ? 'Processing your question…' : isSpeaking ? 'Tap mic below to interrupt' : 'Say something…'}
                </p>
              )}
            </div>
            <button onClick={onStopLive}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', minHeight: 44 }}>
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              End Live
            </button>
          </motion.div>
        ) : (
          <motion.div key="normal"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-3 w-full">
            {/* Start Live button */}
            <motion.button
              onClick={onStartLive}
              className="flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-semibold w-full justify-center transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2))', border: '1px solid rgba(139,92,246,0.5)', color: '#c4b5fd', minHeight: 48 }}
              animate={{ boxShadow: ['0 0 16px rgba(99,102,241,0.12)','0 0 28px rgba(139,92,246,0.28)','0 0 16px rgba(99,102,241,0.12)'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
              <Mic size={15} />
              Start Live Conversation
            </motion.button>
            {/* Manual mic + voice toggles */}
            <div className="flex gap-2">
              <button onClick={onToggleMic}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200"
                style={{ background: micOn ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)', border: micOn ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.12)', color: micOn ? '#6ee7b7' : '#94a3b8', minHeight: 36 }}>
                {micOn ? <Mic size={13} /> : <MicOff size={13} />}
                <span>Mic {micOn ? 'ON' : 'OFF'}</span>
              </button>
              <button onClick={onToggleVoice}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200"
                style={{ background: voiceOn ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.06)', border: voiceOn ? '1px solid rgba(14,165,233,0.5)' : '1px solid rgba(255,255,255,0.12)', color: voiceOn ? '#7dd3fc' : '#94a3b8', minHeight: 36 }}>
                {voiceOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
                <span>Voice {voiceOn ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs text-slate-300 max-w-[220px]"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
        <FileText size={12} className="text-indigo-400 shrink-0" />
        <span className="truncate">{activeFile ?? 'No resources loaded'}</span>
      </div>
    </div>
  )
}

/* ─── Dark Chat Bubble ───────────────────────────────────── */
function DarkChatBubble({ msg, userInitial, isStreamingThis }: {
  msg: Message; userInitial: string; isStreamingThis: boolean
}) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex gap-3 w-full ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
        style={{
          background: isUser ? 'linear-gradient(135deg,#FF6B6B,#ee5555)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          boxShadow: isUser ? '0 2px 8px rgba(255,107,107,0.4)' : '0 2px 8px rgba(99,102,241,0.4)',
        }}>
        {isUser ? userInitial : <Sparkles size={14} />}
      </div>
      <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
        style={isUser
          ? { background: 'linear-gradient(135deg,#FF6B6B,#ee5555)', color: 'white', borderRadius: '18px 4px 18px 18px', boxShadow: '0 4px 16px rgba(255,107,107,0.25)' }
          : { background: '#252548', color: '#e2e8f0', borderRadius: '4px 18px 18px 18px', border: '1px solid rgba(139,92,246,0.25)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }
        }>
        {isStreamingThis && msg.content === '' ? (
          <div className="flex items-center gap-1 py-0.5">
            {[0,1,2].map(i => (
              <span key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        ) : (
          isUser ? (
            <div className="whitespace-pre-wrap break-words">{msg.content}</div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none
              [&>p]:mb-2 [&>p:last-child]:mb-0
              [&>ol]:mt-1 [&>ol]:mb-2 [&>ol]:pl-4 [&>ol>li]:mb-1
              [&>ul]:mt-1 [&>ul]:mb-2 [&>ul]:pl-4 [&>ul>li]:mb-1
              [&>h2]:text-sm [&>h2]:font-semibold [&>h2]:text-indigo-300 [&>h2]:mt-2 [&>h2]:mb-1
              [&>h3]:text-xs [&>h3]:font-semibold [&>h3]:text-slate-300 [&>h3]:mt-1.5 [&>h3]:mb-0.5
              [&_strong]:text-white [&_strong]:font-semibold
              [&_em]:text-slate-300 [&_em]:not-italic [&_em]:font-medium">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )
        )}
        {msg.timestamp && (
          <p className={`mt-1.5 text-right text-[10px] ${isUser ? 'text-red-200' : 'text-slate-500'}`}>
            {msg.timestamp}
          </p>
        )}
      </div>
    </motion.div>
  )
}

/* ─── Settings Modal ────────────────────────────────────── */
function SettingsModal({
  open, onClose, settings, onSettings, documents,
}: {
  open: boolean
  onClose: () => void
  settings: TutorSettings
  onSettings: (s: TutorSettings) => void
  documents: DocumentInfo[]
}) {
  const modeOptions: Array<{ value: TeachingMode; label: string; desc: string }> = [
    { value: 'focused',     label: 'Focused',     desc: 'Strictly from your materials' },
    { value: 'balanced',    label: 'Balanced',    desc: 'Materials + helpful analogies when stuck' },
    { value: 'exploratory', label: 'Exploratory', desc: 'Broader context & real-world bridging' },
  ]
  const toneOptions: Array<{ value: VoiceTone; label: string; desc: string }> = [
    { value: 'warm',         label: 'Warm',         desc: 'Encouraging & collaborative' },
    { value: 'professional', label: 'Professional', desc: 'Direct & measured, like a lecturer' },
    { value: 'casual',       label: 'Casual',       desc: 'Relaxed, like a smart study buddy' },
  ]
  const allSelected = settings.focusDocumentIds.length === 0
  const toggleDoc = (id: string) => {
    const cur = settings.focusDocumentIds
    onSettings({ ...settings, focusDocumentIds: cur.includes(id) ? cur.filter(d => d !== id) : [...cur, id] })
  }
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: '#1a1836', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-sm font-semibold text-white">Tutor Settings</h3>
              <button onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <X size={14} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-5 overflow-y-auto" style={{ maxHeight: '70vh' }}>
              {/* Teaching Mode */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Teaching Mode</p>
                <div className="space-y-2">
                  {modeOptions.map(opt => (
                    <button key={opt.value} onClick={() => onSettings({ ...settings, teachingMode: opt.value })}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all"
                      style={{
                        background: settings.teachingMode === opt.value ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${settings.teachingMode === opt.value ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: settings.teachingMode === opt.value ? '#c4b5fd' : '#e2e8f0' }}>{opt.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                      </div>
                      {settings.teachingMode === opt.value && <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
              {/* Voice Tone */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Voice Tone</p>
                <div className="space-y-2">
                  {toneOptions.map(opt => (
                    <button key={opt.value} onClick={() => onSettings({ ...settings, voiceTone: opt.value })}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all"
                      style={{
                        background: settings.voiceTone === opt.value ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${settings.voiceTone === opt.value ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: settings.voiceTone === opt.value ? '#ddd6fe' : '#e2e8f0' }}>{opt.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                      </div>
                      {settings.voiceTone === opt.value && <div className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
              {/* Material Focus */}
              {documents.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Focus Materials</p>
                  <div className="space-y-2">
                    <button onClick={() => onSettings({ ...settings, focusDocumentIds: [] })}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all"
                      style={{
                        background: allSelected ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${allSelected ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      }}>
                      <p className="text-sm font-medium" style={{ color: allSelected ? '#6ee7b7' : '#e2e8f0' }}>All Materials</p>
                      {allSelected && <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />}
                    </button>
                    {documents.map(doc => {
                      const sel = settings.focusDocumentIds.includes(doc.id)
                      return (
                        <button key={doc.id} onClick={() => toggleDoc(doc.id)}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all"
                          style={{
                            background: sel ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${sel ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)'}`,
                          }}>
                          <p className="text-sm font-medium truncate pr-2" style={{ color: sel ? '#6ee7b7' : '#e2e8f0' }}>{doc.title || doc.filename}</p>
                          {sel && <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                  {settings.focusDocumentIds.length > 0 && (
                    <p className="text-[10px] text-slate-500 mt-2">Maya will prioritise these documents. Search still covers all your materials.</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function TutorRoomPage() {
  const { user, loading } = useUser()
  const router = useRouter()

  const [messages, setMessages]           = useState<Message[]>([])
  const [input, setInput]                 = useState('')
  const [isStreaming, setIsStreaming]      = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [micOn, setMicOn]                 = useState(false)
  const [voiceOn, setVoiceOn]             = useState(false)
  const [activeFile, setActiveFile]       = useState<string | null>(null)
  const [showMobileAvatar, setShowMobileAvatar]   = useState(false)
  const [tabletExpanded, setTabletExpanded]       = useState(false)
  const [showMobileMenu, setShowMobileMenu]       = useState(false)
  const [isSpeaking, setIsSpeaking]               = useState(false)
  const [isListening, setIsListening]             = useState(false)
  const [isThinking, setIsThinking]               = useState(false)
  const [liveMode, setLiveMode]                   = useState(false)
  const [tutorSettings, setTutorSettings]         = useState<TutorSettings>(DEFAULT_SETTINGS)
  const [documents, setDocuments]                 = useState<DocumentInfo[]>([])
  const [showSettings, setShowSettings]           = useState(false)

  const bottomRef      = useRef<HTMLDivElement>(null)
  const scrollRef      = useRef<HTMLDivElement>(null)
  const textareaRef    = useRef<HTMLTextAreaElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const transcriptRef  = useRef('')
  const sendMessageRef = useRef<(text: string) => void>(() => {})
  const voiceOnRef          = useRef(voiceOn)
  const speakQueueRef       = useRef<string[]>([])
  const isProcessingQueue   = useRef(false)
  const liveModeRef         = useRef(false)
  const isStreamingRef      = useRef(false)
  const isSpeakingRef       = useRef(false)
  const currentSourceRef    = useRef<AudioBufferSourceNode | null>(null)
  const activeSourcesRef    = useRef<AudioBufferSourceNode[]>([])
  const scheduleEndTimeRef  = useRef<number>(0)
  const lastAudioStopTimeRef = useRef<number>(0)   // ms timestamp — for echo-decay cooldown
  const startLiveListenRef  = useRef<() => void>(() => {})
  const bargeInAnalyserRef  = useRef<AnalyserNode | null>(null)
  const bargeInStreamRef    = useRef<MediaStream | null>(null)
  const bargeInFrameRef     = useRef<number>(0)
  const settingsRef         = useRef<TutorSettings>(DEFAULT_SETTINGS)
  const documentsRef        = useRef<DocumentInfo[]>([])

  const userInitial = (user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()

  /* Keep refs in sync */
  useEffect(() => { voiceOnRef.current = voiceOn }, [voiceOn])
  useEffect(() => { liveModeRef.current = liveMode }, [liveMode])
  useEffect(() => { isStreamingRef.current = isStreaming }, [isStreaming])
  useEffect(() => { isSpeakingRef.current = isSpeaking }, [isSpeaking])
  useEffect(() => { settingsRef.current = tutorSettings }, [tutorSettings])
  useEffect(() => { documentsRef.current = documents }, [documents])

  /* Cancel TTS when voice is turned off */
  useEffect(() => {
    if (!voiceOn) {
      setLiveMode(false)
      liveModeRef.current = false
      stopBargeInMonitor()   // kill AEC watcher
      recognitionRef.current?.stop()
      recognitionRef.current = null
      setIsListening(false)
      speakQueueRef.current = []
      isProcessingQueue.current = false
      window.speechSynthesis?.cancel()
      audioRef.current?.pause()
      audioRef.current = null
      activeSourcesRef.current.forEach(s => { try { s.stop(0) } catch {} })
      activeSourcesRef.current = []
      currentSourceRef.current = null
      if (audioCtxRef.current) scheduleEndTimeRef.current = audioCtxRef.current.currentTime
      lastAudioStopTimeRef.current = Date.now()
      try { audioCtxRef.current?.suspend() } catch {}
      setIsSpeaking(false)
      setIsThinking(false)
    }
  }, [voiceOn])

  /* Stop listening when mic feature is turned off */
  useEffect(() => {
    if (!micOn) {
      recognitionRef.current?.stop()
      recognitionRef.current = null
      setIsListening(false)
    }
  }, [micOn])

  /* Cleanup TTS + STT on unmount */
  useEffect(() => {
    return () => {
      speakQueueRef.current = []
      isProcessingQueue.current = false
      window.speechSynthesis?.cancel()
      audioRef.current?.pause()
      audioCtxRef.current?.close()
      recognitionRef.current?.stop()
      cancelAnimationFrame(bargeInFrameRef.current)
      bargeInStreamRef.current?.getTracks().forEach(t => t.stop())
      try { currentSourceRef.current?.stop() } catch {}
    }
  }, [])

  /* Pre-fill input from URL params (e.g. ?topic=X&context=Y from Notes page) */
  const searchParams = useSearchParams()
  useEffect(() => {
    const topic = searchParams.get('topic')
    const context = searchParams.get('context')
    if (topic) {
      const prefill = context
        ? `Let's revisit "${topic}". I was working on: ${context}`
        : `Can you explain "${topic}" again?`
      setInput(prefill)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Load documents for material selector */
  useEffect(() => {
    fetch('/api/documents')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.documents?.length) {
          setDocuments(d.documents)
          setActiveFile(d.documents[0].filename)
        }
      })
      .catch(() => {})
  }, [])

  /* Auto scroll */
  useEffect(() => {
    if (!showScrollBtn) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, showScrollBtn])

  /* Auto-resize textarea */
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`
  }, [input])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 180)
  }

  /* ── TTS ─────────────────────────────────────────────── */
  const audioRef    = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Unlock AudioContext on first user interaction (needed for autoplay policy)
  const unlockAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    } else if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
  }, [])

  /* Fetch and decode TTS audio — no playback */
  const fetchTTSAudio = useCallback(async (text: string): Promise<AudioBuffer | null> => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text }),
      })
      if (!res.ok) return null
      const arrayBuf = await res.arrayBuffer()
      const ctx = audioCtxRef.current
      if (!ctx) return null
      if (ctx.state === 'suspended') await ctx.resume()
      return await ctx.decodeAudioData(arrayBuf)
    } catch {
      return null
    }
  }, [])

  /* Play a decoded AudioBuffer — resolves when done, gapless via scheduled start time */
  const playAudioBuffer = useCallback((decoded: AudioBuffer): Promise<void> => {
    return new Promise<void>(resolve => {
      const ctx = audioCtxRef.current
      if (!ctx) { resolve(); return }
      const source = ctx.createBufferSource()
      source.buffer = decoded
      source.playbackRate.value = 1.12  // slight speedup — keeps natural cadence without dead air
      source.connect(ctx.destination)

      // Schedule gaplessly: if a previous buffer is still playing, start right after it
      const now = ctx.currentTime
      const startAt = Math.max(now, scheduleEndTimeRef.current)
      const scaledDuration = decoded.duration / 1.12
      scheduleEndTimeRef.current = startAt + scaledDuration

      currentSourceRef.current = source
      activeSourcesRef.current.push(source)
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source)
        if (currentSourceRef.current === source) currentSourceRef.current = null
        resolve()
      }
      source.start(startAt)
    })
  }, [])

  /* Drain speak queue — prefetch N+1 while N is playing */
  const processSpeakQueue = useCallback(async () => {
    if (isProcessingQueue.current) return
    isProcessingQueue.current = true
    setIsSpeaking(true)

    // Use a wrapper object so TypeScript doesn't lose track of type through closures
    const slot: { prefetch: { text: string; promise: Promise<AudioBuffer | null> } | null } = { prefetch: null }

    const kickPrefetch = () => {
      if (speakQueueRef.current.length > 0 && voiceOnRef.current) {
        const next = speakQueueRef.current[0]
        if (!slot.prefetch || slot.prefetch.text !== next) {
          slot.prefetch = { text: next, promise: fetchTTSAudio(next) }
        }
      }
    }

    while (speakQueueRef.current.length > 0) {
      if (!voiceOnRef.current) break
      const chunk = speakQueueRef.current.shift()!

      // Get audio: use matched prefetch (instant resolve) or fetch now
      let audioPromise: Promise<AudioBuffer | null>
      const p = slot.prefetch
      if (p && p.text === chunk) {
        audioPromise = p.promise
        slot.prefetch = null
      } else {
        audioPromise = fetchTTSAudio(chunk)
      }

      // Start prefetching next chunk in parallel before awaiting current
      kickPrefetch()

      const audioBuffer = await audioPromise
      if (!voiceOnRef.current) break

      if (audioBuffer) {
        await playAudioBuffer(audioBuffer)
        kickPrefetch() // may have new items after playback
      } else {
        await new Promise<void>(resolve => {
          const utt = new SpeechSynthesisUtterance(chunk)
          utt.onend = () => resolve(); utt.onerror = () => resolve()
          window.speechSynthesis.speak(utt)
        })
      }
    }

    isProcessingQueue.current = false
    if (speakQueueRef.current.length === 0) {
      lastAudioStopTimeRef.current = Date.now()   // record when Maya finishes speaking
      setIsSpeaking(false)
      // In live mode, auto-restart listening.
      // startLiveListen enforces the 550ms echo-decay cooldown internally via retry.
      if (liveModeRef.current && !isStreamingRef.current) {
        setTimeout(() => startLiveListenRef.current(), 600)
      }
    }
  }, [fetchTTSAudio, playAudioBuffer])

  const enqueueSpeech = useCallback((text: string) => {
    if (!text.trim()) return
    speakQueueRef.current.push(text)
    processSpeakQueue()
  }, [processSpeakQueue])

  /* One-shot speak: clear queue then enqueue */
  const speakText = useCallback((text: string) => {
    speakQueueRef.current = []
    isProcessingQueue.current = false
    window.speechSynthesis?.cancel()
    enqueueSpeech(text)
  }, [enqueueSpeech])

  /* ── Barge-In Volume Monitor ─────────────────────────────────────────────────
   * Runs a getUserMedia stream with OS-level echo cancellation so the analyser
   * sees only the user's real voice — not the speaker output.
   * When the user speaks above the threshold while Maya is playing, we stop all
   * Maya audio FIRST and then start SpeechRecognition (which now hears silence
   * from the speaker, not Maya's voice). This prevents the microphone from
   * picking up Maya and triggering false barge-ins. ─────────────────────────── */
  const stopBargeInMonitor = useCallback(() => {
    cancelAnimationFrame(bargeInFrameRef.current)
    bargeInStreamRef.current?.getTracks().forEach(t => t.stop())
    bargeInStreamRef.current = null
    bargeInAnalyserRef.current = null
  }, [])

  const startBargeInMonitor = useCallback(() => {
    if (bargeInStreamRef.current) return  // already running
    navigator.mediaDevices?.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    }).then(stream => {
      bargeInStreamRef.current = stream
      const ctx = audioCtxRef.current
      if (!ctx) { stream.getTracks().forEach(t => t.stop()); bargeInStreamRef.current = null; return }
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.4
      source.connect(analyser)
      bargeInAnalyserRef.current = analyser

      const data = new Float32Array(analyser.fftSize)
      const check = () => {
        // Exit loop if live mode ended
        if (!liveModeRef.current) {
          cancelAnimationFrame(bargeInFrameRef.current)
          bargeInStreamRef.current?.getTracks().forEach(t => t.stop())
          bargeInStreamRef.current = null
          bargeInAnalyserRef.current = null
          return
        }

        analyser.getFloatTimeDomainData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) sum += data[i] * data[i]
        const rms = Math.sqrt(sum / data.length)

        // Trigger barge-in only when Maya is speaking AND:
        //   1. User RMS well above echo floor (0.06 — speaker echo is typically <0.03)
        //   2. We aren't already in the echo-decay cooldown window
        const echoFree = Date.now() - lastAudioStopTimeRef.current > 700
        if (isSpeakingRef.current && rms > 0.06 && echoFree && !recognitionRef.current) {
          // Stop all Maya audio immediately, record stop time for cooldown
          speakQueueRef.current = []
          isProcessingQueue.current = false
          window.speechSynthesis?.cancel()
          activeSourcesRef.current.forEach(s => { try { s.stop(0) } catch {} })
          activeSourcesRef.current = []
          currentSourceRef.current = null
          if (audioCtxRef.current) scheduleEndTimeRef.current = audioCtxRef.current.currentTime
          lastAudioStopTimeRef.current = Date.now()
          setIsSpeaking(false)
          // startLiveListen enforces its own 550ms cooldown — no need for extra delay here
          setTimeout(() => startLiveListenRef.current(), 50)
        }

        bargeInFrameRef.current = requestAnimationFrame(check)
      }
      check()
    }).catch(() => {
      // Mic permission denied — live mode still works, barge-in detection just unavailable
    })
  }, [stopBargeInMonitor])

  /* Stop all audio immediately — used for barge-in */
  const stopAllAudio = useCallback(() => {
    speakQueueRef.current = []
    isProcessingQueue.current = false
    window.speechSynthesis?.cancel()
    // Stop every scheduled/playing source, not just the last one
    activeSourcesRef.current.forEach(s => { try { s.stop(0) } catch {} })
    activeSourcesRef.current = []
    currentSourceRef.current = null
    // Reset schedule pointer so next playback starts from now
    if (audioCtxRef.current) scheduleEndTimeRef.current = audioCtxRef.current.currentTime
    lastAudioStopTimeRef.current = Date.now()   // start echo-decay cooldown
    setIsSpeaking(false)
  }, [])

  /* ── Live Conversation Loop ──────────────────── */
  const startLiveListen = useCallback(() => {
    if (!liveModeRef.current) return
    if (recognitionRef.current) return

    // Never start recognition while audio is scheduled/playing — speaker echo would be captured
    const audioActive = activeSourcesRef.current.length > 0 || isSpeakingRef.current
    // Enforce echo-decay cooldown: wait 550 ms after all speaker audio stops
    const inCooldown = Date.now() - lastAudioStopTimeRef.current < 550
    if (audioActive || inCooldown) {
      // Retry automatically once the cooldown expires
      setTimeout(() => startLiveListenRef.current(), 200)
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return

    transcriptRef.current = ''
    setInput('')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SR() as any
    rec.continuous = true      // keep session alive across short pauses
    rec.interimResults = true
    rec.lang = 'en-US'

    // Silence debounce: only send after this many ms of no new speech.
    // Prevents cutting off mid-sentence on a brief pause.
    const SILENCE_BEFORE_SEND_MS = 1100
    let silenceTimer: ReturnType<typeof setTimeout> | null = null

    const clearSilenceTimer = () => {
      if (silenceTimer !== null) { clearTimeout(silenceTimer); silenceTimer = null }
    }
    const resetSilenceTimer = () => {
      clearSilenceTimer()
      silenceTimer = setTimeout(() => {
        silenceTimer = null
        // Stop recognition — triggers onend which sends the transcript
        try { rec.stop() } catch {}
      }, SILENCE_BEFORE_SEND_MS)
    }

    rec.onresult = (event: any) => {
      // Barge-in: cut Maya off immediately — drain queue, stop ALL scheduled sources
      if (isSpeakingRef.current || activeSourcesRef.current.length > 0) {
        speakQueueRef.current = []
        isProcessingQueue.current = false
        window.speechSynthesis?.cancel()
        activeSourcesRef.current.forEach(s => { try { s.stop(0) } catch {} })
        activeSourcesRef.current = []
        currentSourceRef.current = null
        if (audioCtxRef.current) scheduleEndTimeRef.current = audioCtxRef.current.currentTime
        setIsSpeaking(false)
      }
      const transcript = Array.from(event.results as any[])
        .map((r: any) => r[0].transcript)
        .join('')
      setInput(transcript)
      transcriptRef.current = transcript
      // User is still speaking — reset the silence countdown
      resetSilenceTimer()
    }

    rec.onend = () => {
      clearSilenceTimer()
      recognitionRef.current = null
      setIsListening(false)
      const text = transcriptRef.current.trim()
      transcriptRef.current = ''
      if (text && liveModeRef.current) {
        sendMessageRef.current(text)
      } else if (liveModeRef.current && !isStreamingRef.current && !isSpeakingRef.current) {
        // Nothing said and Maya is idle — restart listening after short pause
        setTimeout(() => startLiveListenRef.current(), 300)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (event: any) => {
      clearSilenceTimer()
      recognitionRef.current = null
      setIsListening(false)
      if (liveModeRef.current && event.error !== 'not-allowed') {
        setTimeout(() => startLiveListenRef.current(), 500)
      }
    }

    recognitionRef.current = rec
    setIsListening(true)
    rec.start()
  }, [])

  const startLiveMode = useCallback(() => {
    unlockAudio()
    setVoiceOn(true)
    voiceOnRef.current = true
    setLiveMode(true)
    liveModeRef.current = true
    setInput('')
    startBargeInMonitor()   // start AEC-filtered volume watcher for barge-in
    setTimeout(() => startLiveListenRef.current(), 200)
  }, [unlockAudio, startBargeInMonitor])

  const stopLiveMode = useCallback(() => {
    setLiveMode(false)
    liveModeRef.current = false
    stopBargeInMonitor()   // kill AEC volume watcher
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
    speakQueueRef.current = []
    isProcessingQueue.current = false
    window.speechSynthesis?.cancel()
    activeSourcesRef.current.forEach(s => { try { s.stop(0) } catch {} })
    activeSourcesRef.current = []
    currentSourceRef.current = null
    if (audioCtxRef.current) scheduleEndTimeRef.current = audioCtxRef.current.currentTime
    lastAudioStopTimeRef.current = Date.now()
    setIsSpeaking(false)
  }, [stopBargeInMonitor])
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
  }, [])

  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      alert('Speech recognition is not supported in this browser. Try Chrome or Edge.')
      return
    }
    if (isListening) { stopListening(); return }

    window.speechSynthesis?.cancel() // stop TTS while user speaks
    transcriptRef.current = ''

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SR() as any
    rec.continuous = false
    rec.interimResults = true
    rec.lang = 'en-US'

    rec.onresult = (event: any) => {
      const transcript = Array.from(event.results as any[])
        .map((r: any) => r[0].transcript)
        .join('')
      setInput(transcript)
      transcriptRef.current = transcript
    }

    rec.onend = () => {
      recognitionRef.current = null
      setIsListening(false)
      const text = transcriptRef.current.trim()
      if (text) {
        transcriptRef.current = ''
        sendMessageRef.current(text)
      }
    }

    rec.onerror = () => {
      recognitionRef.current = null
      setIsListening(false)
    }

    recognitionRef.current = rec
    setIsListening(true)
    rec.start()
  }, [isListening, stopListening])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text.trim(), timestamp: formatTime(new Date()) }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    // Stop any active recognition so it doesn't re-trigger
    if (recognitionRef.current) {
      try { (recognitionRef.current as any).abort?.() || recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
      setIsListening(false)
    }
    setIsStreaming(true)
    setIsThinking(true)

    const history = messages.map(m => ({
      role: m.role === 'user' ? 'user' as const : 'model' as const,
      content: m.content,
    }))

    const aiMsgId = crypto.randomUUID()
    setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: '', timestamp: formatTime(new Date()) }])

    try {
      const focusDocumentTitles = settingsRef.current.focusDocumentIds.length > 0
        ? documentsRef.current
            .filter(d => settingsRef.current.focusDocumentIds.includes(d.id))
            .map(d => d.title || d.filename)
        : []
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: text.trim(),
          history,
          settings: { teachingMode: settingsRef.current.teachingMode, voiceTone: settingsRef.current.voiceTone },
          focusDocumentTitles,
        }),
      })
      if (res.status === 401) { router.push('/login?reason=session_expired'); return }
      if (!res.ok || !res.body) throw new Error(`API ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let spokenUpTo = 0
      let firstChunk = true
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          if (voiceOnRef.current) {
            const remaining = accumulated.slice(spokenUpTo).trim()
            if (remaining) enqueueSpeech(stripMarkdown(remaining))
          }
          break
        }
        accumulated += decoder.decode(value, { stream: true })
        if (firstChunk && accumulated.trim()) {
          setIsThinking(false)
          firstChunk = false
        }
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: accumulated } : m))
        if (voiceOnRef.current) {
          const unspoken = accumulated.slice(spokenUpTo)
          const boundary = findSpeechBoundary(unspoken)
          if (boundary > 0) {
            const toSpeak = unspoken.slice(0, boundary).trim()
            if (toSpeak) { enqueueSpeech(stripMarkdown(toSpeak)); spokenUpTo += boundary }
          }
        }
      }
    } catch {
      setIsThinking(false)
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? { ...m, content: 'Sorry, something went wrong. Please try again.' } : m
      ))
    } finally {
      setIsThinking(false)
      setIsStreaming(false)
    }
  }, [isStreaming, messages, router, enqueueSpeech])

  /* Keep sendMessageRef up to date so STT onend can call it */
  useEffect(() => { sendMessageRef.current = sendMessage }, [sendMessage])
  /* Keep startLiveListenRef up to date */
  useEffect(() => { startLiveListenRef.current = startLiveListen }, [startLiveListen])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const endSession = () => { setMessages([]); setInput('') }

  if (loading) return null

  const toggleMic = () => {
    if (micOn) { stopListening(); setMicOn(false) }
    else setMicOn(true)
  }
  const toggleVoice = () => {
    if (!voiceOn) {
      unlockAudio() // unlock AudioContext on the button click (user gesture)
    } else {
      window.speechSynthesis?.cancel()
      audioRef.current?.pause()
      audioRef.current = null
      setIsSpeaking(false)
    }
    setVoiceOn(v => !v)
  }

  const avatarProps = { micOn, voiceOn, isSpeaking, isThinking, isListening, liveMode, onToggleMic: toggleMic, onToggleVoice: toggleVoice, onStartLive: startLiveMode, onStopLive: stopLiveMode, activeFile }

  return (
    <motion.div
      className="flex overflow-hidden rounded-2xl relative"
      style={{ height: 'calc(100vh - 6rem)', background: '#0F0F1A', boxShadow: '0 0 0 1px rgba(99,102,241,0.15), 0 24px 64px rgba(0,0,0,0.5)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* ── LEFT: Avatar panel (desktop only) ── */}
      <motion.div
        className="hidden lg:flex flex-col w-[40%] shrink-0 relative"
        style={{ background: 'linear-gradient(180deg,#13122a 0%,#1a1840 100%)', borderRight: '1px solid rgba(139,92,246,0.25)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 100% 0%,rgba(99,102,241,0.12) 0%,transparent 70%)' }} />
        <AvatarPanel {...avatarProps} />
      </motion.div>

      {/* ── RIGHT: Chat panel ── */}
      <motion.div
        className="flex-1 flex flex-col min-w-0"
        style={{ background: '#16162a' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >

        {/* Tablet avatar bar */}
        <div className="hidden md:flex lg:hidden flex-col">
          <div
            role="button" tabIndex={0}
            onClick={() => setTabletExpanded(v => !v)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setTabletExpanded(v => !v) }}
            className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors cursor-pointer"
            style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
            <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 10px rgba(99,102,241,0.4)' }}>M</div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white leading-tight">Maya – Your AI Tutor</p>
              <p className="text-xs text-indigo-400 truncate">{activeFile ?? 'No resources loaded'}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={e => { e.stopPropagation(); toggleMic() }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{ background: micOn ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)', border: micOn ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)', color: micOn ? '#6ee7b7' : '#94a3b8', minWidth: 44, minHeight: 32 }}>
                {micOn ? <Mic size={12} /> : <MicOff size={12} />}
              </button>
              <button
                onClick={e => { e.stopPropagation(); toggleVoice() }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{ background: voiceOn ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.06)', border: voiceOn ? '1px solid rgba(14,165,233,0.4)' : '1px solid rgba(255,255,255,0.1)', color: voiceOn ? '#7dd3fc' : '#94a3b8', minWidth: 44, minHeight: 32 }}>
                {voiceOn ? <Volume2 size={12} /> : <VolumeX size={12} />}
              </button>
            </div>
            <ChevronDown size={16} className="text-slate-400 transition-transform duration-200"
              style={{ transform: tabletExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
          <AnimatePresence>
            {tabletExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 320, opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
                style={{ background: 'linear-gradient(180deg,#0F0F1A 0%,#12112B 100%)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                <AvatarPanel {...avatarProps} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Tutor Room</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {messages.length === 0
                ? 'Ask anything about your uploaded materials'
                : `${messages.filter(m => m.role === 'user').length} question${messages.filter(m => m.role === 'user').length !== 1 ? 's' : ''} asked`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button onClick={endSession}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', minHeight: 36 }}>
                <RotateCcw size={12} />End Session
              </button>
            )}
            <button onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', minHeight: 36 }}>
              <Settings size={12} />
              <span className="hidden sm:inline">Settings</span>
            </button>
            {/* Mobile ⋮ menu */}
            <div className="relative sm:hidden">
              <button onClick={() => setShowMobileMenu(v => !v)}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                <MoreVertical size={18} />
              </button>
              <AnimatePresence>
                {showMobileMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 z-50 rounded-xl overflow-hidden py-1 min-w-[150px]"
                    style={{ background: '#252545', border: '1px solid rgba(99,102,241,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                    <button onClick={() => { endSession(); setShowMobileMenu(false) }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                      <RotateCcw size={14} />End Session
                    </button>
                    <button onClick={() => { setShowSettings(true); setShowMobileMenu(false) }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                      <Settings size={14} />Settings
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
                  <Sparkles size={24} className="text-white" />
                </div>
                <h2 className="text-lg font-bold text-white mb-1">
                  Hi {user?.user_metadata?.full_name?.split(' ')[0] || 'there'} 👋
                </h2>
                <p className="text-sm text-slate-300 max-w-xs mx-auto mb-1">
                  I only answer from your <span className="text-violet-300 font-semibold">uploaded materials</span>.
                </p>
                <p className="text-xs text-slate-400">Upload a document first, then ask me anything about it.</p>
              </motion.div>
              {/* Chips — horizontal scroll on mobile, grid on md+ */}
              <div className="w-full max-w-lg overflow-x-auto pb-1">
                <div className="flex gap-2 md:grid md:grid-cols-2 md:gap-3 min-w-max md:min-w-0 px-1">
                  {SUGGESTED_PROMPTS.map((s, i) => {
                    const Icon = s.icon
                    return (
                      <motion.button key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut', delay: i * 0.06 }}
                        onClick={() => sendMessage(s.prompt)}
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-left whitespace-nowrap md:whitespace-normal transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#c4b5fd', minHeight: 44 }}>
                        <Icon size={15} className="shrink-0 text-indigo-400" />
                        {s.label}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <DarkChatBubble key={msg.id} msg={msg} userInitial={userInitial}
                    isStreamingThis={isStreaming && msg.id === messages[messages.length - 1]?.id && msg.role === 'ai'} />
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Scroll to bottom */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              onClick={() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); setShowScrollBtn(false) }}
              className="absolute bottom-24 right-6 w-9 h-9 rounded-full flex items-center justify-center z-10 hover:scale-110 transition-transform"
              style={{ background: '#252545', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', color: '#a5b4fc' }}>
              <ChevronDown size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <div className="shrink-0 px-4 md:px-5 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,15,26,0.9)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-end gap-2 rounded-2xl px-3 py-2"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <button
              onClick={liveMode ? () => { stopAllAudio(); setTimeout(() => startLiveListenRef.current(), 100) } : startListening}
              title={liveMode ? (isListening ? 'Listening…' : 'Tap to speak') : !micOn ? 'Start Live or enable Mic' : isListening ? 'Stop recording' : 'Start recording'}
              className="shrink-0 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 relative"
              style={{
                background: isListening ? 'rgba(239,68,68,0.2)' : liveMode ? 'rgba(99,102,241,0.18)' : micOn ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
                color: isListening ? '#fca5a5' : liveMode ? '#a5b4fc' : micOn ? '#6ee7b7' : '#475569',
                border: isListening ? '1px solid rgba(239,68,68,0.4)' : liveMode ? '1px solid rgba(99,102,241,0.45)' : 'none',
                minWidth: 44, minHeight: 44, width: 44, height: 44,
                boxShadow: isListening ? '0 0 12px rgba(239,68,68,0.3)' : liveMode ? '0 0 12px rgba(99,102,241,0.3)' : 'none',
              }}>
              {isListening ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="absolute inset-0 rounded-xl bg-red-500/20 pointer-events-none"
                  />
                  <Mic size={17} />
                </>
              ) : micOn ? <Mic size={17} /> : <MicOff size={17} />}
            </button>
            <textarea
              ref={textareaRef} rows={1} value={input}
              onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Ask a question..." disabled={isStreaming}
              className="flex-1 resize-none bg-transparent text-white placeholder-slate-500 focus:outline-none disabled:opacity-50 leading-relaxed py-2.5"
              style={{ fontSize: 16 }} />
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || isStreaming}
              className="shrink-0 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: input.trim() && !isStreaming ? 'linear-gradient(135deg,#FF6B6B,#ee5555)' : 'rgba(255,255,255,0.06)',
                color: 'white', minWidth: 44, minHeight: 44, width: 44, height: 44,
                boxShadow: input.trim() && !isStreaming ? '0 4px 12px rgba(255,107,107,0.35)' : 'none',
              }}>
              <Send size={16} />
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-slate-400">
            Answers are based solely on your uploaded documents.
          </p>
        </div>
      </motion.div>

      {/* Settings Modal */}
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={tutorSettings}
        onSettings={s => setTutorSettings(s)}
        documents={documents}
      />

      {/* ── Mobile: floating Maya button ── */}
      <motion.button
        className="md:hidden fixed bottom-28 left-4 z-50 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 0 3px rgba(99,102,241,0.25),0 8px 24px rgba(99,102,241,0.5)' }}
        onClick={() => setShowMobileAvatar(true)}
        whileTap={{ scale: 0.92 }}
        animate={{ boxShadow: ['0 0 0 3px rgba(99,102,241,0.25),0 8px 24px rgba(99,102,241,0.5)','0 0 0 7px rgba(99,102,241,0.08),0 8px 24px rgba(99,102,241,0.5)','0 0 0 3px rgba(99,102,241,0.25),0 8px 24px rgba(99,102,241,0.5)'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
        M
      </motion.button>

      {/* ── Mobile: bottom sheet ── */}
      <AnimatePresence>
        {showMobileAvatar && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMobileAvatar(false)}
              className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              drag="y" dragConstraints={{ top: 0 }}
              onDragEnd={(_, info) => { if (info.offset.y > 80) setShowMobileAvatar(false) }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
              style={{ height: '55vh', background: 'linear-gradient(180deg,#0F0F1A 0%,#12112B 100%)', border: '1px solid rgba(99,102,241,0.2)', borderBottom: 'none' }}>
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>
              <button onClick={() => setShowMobileAvatar(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <X size={14} />
              </button>
              <AvatarPanel {...avatarProps} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

