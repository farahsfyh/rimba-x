'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, RefreshCw, Loader2, AlertCircle, Zap } from 'lucide-react'
import { SkillMatchScore } from '@/components/career/SkillMatchScore'
import { SkillGapCard } from '@/components/career/SkillGapCard'
import { Button } from '@/components/ui/Button'
import type { SkillGapAnalysis } from '@/types'
import Link from 'next/link'
import toast from 'react-hot-toast'

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
  const others   = analysis?.gap_skills.filter(s => s.importance !== 'critical') ?? []

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-6 md:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8" suppressHydrationWarning>
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={20} className="text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Skill Gap Analysis</h1>
        </div>
        <p className="text-sm text-gray-500">Compare your skills to your target career</p>
      </motion.div>

      {/* No profile warning */}
      {noProfile && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-4 mb-6">
          <AlertCircle size={20} className="text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Career profile not found</p>
            <p className="text-xs text-gray-500">You need to complete your career profile before running an analysis.</p>
          </div>
          <Link href="/career/profile"><Button size="sm">Set up Profile</Button></Link>
        </div>
      )}

      {/* Loading shimmer */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-48 animate-pulse" />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && analysis && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6" suppressHydrationWarning>
          {/* Top row: score + summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center gap-3">
              <SkillMatchScore score={analysis.match_score} size={120} />
              <p className="text-xs text-gray-400 text-center">Match to {'"'}{analysis.required_skills[0]?.category}{'"'} role</p>
            </div>
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
              <p className="text-xs font-bold text-gray-400 uppercase">AI Summary</p>
              <p className="text-sm text-gray-700 leading-relaxed">{analysis.ai_summary}</p>
              <div className="flex items-center gap-2 mt-auto">
                <span className="text-xs text-gray-400">
                  {analysis.gap_skills.length} gaps identified · {critical.length} critical
                </span>
                <span className="ml-auto text-[10px] text-gray-300">
                  {new Date(analysis.created_at).toLocaleDateString('en-MY')}
                </span>
              </div>
            </div>
          </div>

          {/* Required skills */}
          {analysis.required_skills.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">Required for Target Role</p>
              <div className="flex flex-wrap gap-2">
                {analysis.required_skills.map(s => (
                  <span key={s.skill} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                    {s.skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Critical gaps */}
          {critical.length > 0 && (
            <div>
              <p className="text-sm font-bold text-red-600 mb-3 flex items-center gap-1.5">
                <AlertCircle size={14} /> Critical Gaps ({critical.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {critical.map(gap => <SkillGapCard key={gap.skill} gap={gap} />)}
              </div>
            </div>
          )}

          {/* Other gaps */}
          {others.length > 0 && (
            <div>
              <p className="text-sm font-bold text-gray-600 mb-3">Other Skills to Develop ({others.length})</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {others.map(gap => <SkillGapCard key={gap.skill} gap={gap} />)}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" onClick={runAnalysis} disabled={running}>
              {running ? <Loader2 size={14} className="animate-spin mr-1" /> : <RefreshCw size={14} className="mr-1" />}
              Re-run Analysis
            </Button>
            <Link href="/career/modules">
              <Button>
                <Zap size={14} className="mr-1" /> View Learning Modules →
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* No analysis yet */}
      {!loading && !analysis && !noProfile && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16" suppressHydrationWarning>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md mx-auto flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <BarChart2 size={28} className="text-primary" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No analysis yet</h3>
            <p className="text-sm text-gray-500 text-center">
              Run your first skill gap analysis to see where you stand against your target career.
            </p>
            <Button onClick={runAnalysis} disabled={running} size="lg">
              {running ? <><Loader2 size={16} className="animate-spin mr-2" /> Analysing…</> : '⚡ Run Analysis'}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
