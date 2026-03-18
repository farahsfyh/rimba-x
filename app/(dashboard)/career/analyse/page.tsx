'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, RefreshCw, Loader2, AlertCircle, Zap, Sparkles, TrendingUp, ArrowRight } from 'lucide-react'
import { SkillMatchScore } from '@/components/career/SkillMatchScore'
import { SkillGapCard } from '@/components/career/SkillGapCard'
import { Button } from '@/components/ui/Button'
import type { SkillGapAnalysis } from '@/types'
import Link from 'next/link'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function CareerAnalysePage() {
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [noProfile, setNoProfile] = useState(false)

  const loadLatest = useCallback(async () => {
    try {
      const res = await fetch('/api/career/analyse?latest=1')
      if (res.status === 404) { setNoProfile(true); return }
      if (res.ok) {
        const json = await res.json()
        setAnalysis(json.data ?? null)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadLatest() }, [loadLatest])

  async function runAnalysis() {
    setRunning(true)
    try {
      const res = await fetch('/api/career/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (res.status === 404) { setNoProfile(true); toast.error('Complete your career profile first.'); return }
      if (!res.ok) { toast.error('Analysis failed. Try again.'); return }
      const json = await res.json()
      setAnalysis(json.data)
      toast.success('Analysis complete! +75 XP')
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setRunning(false)
    }
  }

  const critical = analysis?.gap_skills.filter(s => s.importance === 'critical') ?? []
  const important = analysis?.gap_skills.filter(s => s.importance === 'important') ?? []
  const nice = analysis?.gap_skills.filter(s => s.importance === 'nice') ?? []

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* HERO */}
      <div className="relative overflow-hidden bg-violet-600 mx-6 mt-6 rounded-2xl px-6 py-8">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, white 0, white 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, white 0, white 1px, transparent 1px, transparent 28px)' }} />
        <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10">
          <motion.div variants={fadeUp} suppressHydrationWarning className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <BarChart2 size={18} className="text-white" />
            </div>
            <span className="text-white/80 text-sm font-semibold">Skill Gap Analysis</span>
            <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
              <Sparkles size={9} /> Gemini AI
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} suppressHydrationWarning className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            How Ready Are You?
          </motion.h1>
          <motion.p variants={fadeUp} suppressHydrationWarning className="text-violet-100 text-sm">
            Compare your current skills against your target career — identify gaps and get a path forward
          </motion.p>
        </motion.div>
      </div>

      <div className="px-6 md:px-8 pt-5 pb-12">
        {/* No profile warning */}
        {noProfile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            suppressHydrationWarning
            className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">Career profile not found</p>
              <p className="text-xs text-gray-500 mt-0.5">You need to complete your career profile before running an analysis.</p>
            </div>
            <Link href="/career/profile"><Button size="sm">Set up Profile</Button></Link>
          </motion.div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 h-52 animate-pulse" />
            ))}
          </div>
        )}

        {/* ── RESULTS ── */}
        {!loading && analysis && (
          <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col gap-6">

            {/* Score + Summary row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Score card */}
              <motion.div
                variants={fadeUp}
                suppressHydrationWarning
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col items-center justify-center"
              >
                <SkillMatchScore score={analysis.match_score} size={180} targetRole={analysis.target_career} />
              </motion.div>

              {/* Summary card */}
              <motion.div
                variants={fadeUp}
                suppressHydrationWarning
                className="md:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col gap-4"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Sparkles size={15} className="text-purple-500" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Summary</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed flex-1">{analysis.ai_summary}</p>
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-50">
                  <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                    <AlertCircle size={11} className="text-red-400" />
                    <strong className="text-gray-700">{critical.length}</strong> critical gaps
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                    <TrendingUp size={11} className="text-blue-400" />
                    <strong className="text-gray-700">{analysis.gap_skills.length}</strong> total gaps
                  </span>
                  <span className="ml-auto text-[10px] text-gray-300">
                    {new Date(analysis.created_at).toLocaleDateString('en-MY')}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Required skills */}
            {analysis.required_skills.length > 0 && (
              <motion.div
                variants={fadeUp}
                suppressHydrationWarning
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
              >
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap size={12} className="text-violet-500" /> Required for{' '}
                  <span className="text-violet-600">{analysis.target_career}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.required_skills.map(s => (
                    <span
                      key={s.skill}
                      className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-3 py-1 rounded-full font-medium"
                    >
                      {s.skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Critical gaps */}
            {critical.length > 0 && (
              <motion.div variants={fadeUp} suppressHydrationWarning>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={15} className="text-red-500" />
                  <p className="text-sm font-bold text-red-600">Critical Gaps</p>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">{critical.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {critical.map((gap, i) => (
                    <motion.div
                      key={gap.skill}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      suppressHydrationWarning
                    >
                      <SkillGapCard gap={gap} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Important gaps */}
            {important.length > 0 && (
              <motion.div variants={fadeUp} suppressHydrationWarning>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm font-bold text-amber-600">Important to Develop</p>
                  <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-semibold">{important.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {important.map((gap, i) => (
                    <motion.div key={gap.skill} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} suppressHydrationWarning>
                      <SkillGapCard gap={gap} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Nice to have */}
            {nice.length > 0 && (
              <motion.div variants={fadeUp} suppressHydrationWarning>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm font-bold text-gray-500">Nice to Have</p>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">{nice.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nice.map((gap, i) => (
                    <motion.div key={gap.skill} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} suppressHydrationWarning>
                      <SkillGapCard gap={gap} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div variants={fadeUp} suppressHydrationWarning className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="outline" onClick={runAnalysis} disabled={running}>
                {running ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <RefreshCw size={14} className="mr-1.5" />}
                Re-run Analysis
              </Button>
              <Link href="/career/modules">
                <Button className="flex items-center gap-1.5">
                  <Zap size={14} /> View Learning Modules <ArrowRight size={13} />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && !analysis && !noProfile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            suppressHydrationWarning
            className="mt-6 text-center py-10"
          >
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-10 max-w-md mx-auto flex flex-col items-center gap-5">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-3xl flex items-center justify-center">
                <BarChart2 size={32} className="text-violet-500" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">No analysis yet</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Run your first skill gap analysis to see where you stand and get a personalised learning plan.
                </p>
              </div>
              <Button onClick={runAnalysis} disabled={running} size="lg" className="w-full">
                {running
                  ? <><Loader2 size={16} className="animate-spin mr-2" /> Analysing…</>
                  : <><Zap size={16} className="mr-2" /> Run AI Analysis</>}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
