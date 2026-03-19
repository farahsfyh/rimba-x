'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, RefreshCw, Loader2, AlertCircle, Zap, Sparkles, TrendingUp, ArrowRight, Compass, BookOpen } from 'lucide-react'
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
      const json = await res.json()
      if (res.status === 400 && json.error?.includes('profile')) {
        setNoProfile(true); 
        toast.error('Complete your career profile first.'); 
        return;
      }
      if (!res.ok) { 
        toast.error(json.error || 'Analysis failed. Try again.'); 
        return;
      }
      setAnalysis(json.data)
      toast.success('Analysis complete! +75 XP')
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setRunning(false)
    }
  }

  const critical = analysis?.gap_skills.filter(s => s.importance === 'critical') ?? []
  const startHere = critical.slice(0, 2)
  const remainingCritical = critical.slice(2)
  const important = analysis?.gap_skills.filter(s => s.importance === 'important') ?? []
  const nice = analysis?.gap_skills.filter(s => s.importance === 'nice') ?? []

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* HERO */}
      <div className="relative overflow-hidden gradient-hero mx-6 mt-6 rounded-2xl px-6 py-8">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, white 0, white 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, white 0, white 1px, transparent 1px, transparent 28px)' }} />
        <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10">
          <motion.div variants={fadeUp} suppressHydrationWarning className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <BarChart2 size={18} className="!text-white" />
            </div>
            <span className="!text-white/80 text-sm font-semibold">Skill Gap Intelligence</span>
          </motion.div>
          <motion.h1 variants={fadeUp} suppressHydrationWarning className="text-3xl md:text-4xl font-extrabold !text-white mb-2">
            How Ready Are You?
          </motion.h1>
          <motion.p variants={fadeUp} suppressHydrationWarning className="text-white/80 text-sm">
            Compare your skills with your target career to identify gaps and get your path forward
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
            {/* 2-Panel Dense Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
              
              {/* 📊 LEFT PANEL (1/3 width) - Score & Breakdown */}
              <motion.div
                variants={fadeUp}
                suppressHydrationWarning
                className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between h-full"
              >
                {/* Score section */}
                <div className="flex flex-col items-center justify-center pt-4 pb-6 flex-1">
                  <SkillMatchScore score={analysis.match_score} size={150} targetRole={analysis.target_career} />
                  <div className="mt-6 text-center w-full">
                    <p className="text-red-500 font-bold text-sm mb-1 px-4">
                      You need +{Math.max(0, 100 - analysis.match_score)}% to reach {analysis.target_career}
                    </p>
                    <p className="text-gray-500 text-[10px] font-medium">Focus on {critical.length} critical gaps to improve fastest</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-4" />

                {/* Breakdown section */}
                <div>
                  <div className="flex items-center gap-2 mb-4 shrink-0">
                    <TrendingUp size={14} className="text-primary" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Skill Breakdown</p>
                  </div>
                  <div className="w-full space-y-4">
                     <div className="flex justify-between items-center text-xs"><span className="font-semibold text-gray-600 uppercase tracking-wider">Technical</span><span className="font-bold text-gray-900">{Math.min(95, analysis.match_score + 15)}%</span></div>
                     <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(95, analysis.match_score + 15)}%` }} /></div>
                     
                     <div className="flex justify-between items-center text-xs"><span className="font-semibold text-gray-600 uppercase tracking-wider">Analytical</span><span className="font-bold text-gray-900">{Math.min(90, analysis.match_score + 5)}%</span></div>
                     <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2"><div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min(90, analysis.match_score + 5)}%` }} /></div>
                     
                     <div className="flex justify-between items-center text-xs"><span className="font-semibold text-gray-600 uppercase tracking-wider">Practical</span><span className="font-bold text-gray-900">{Math.max(10, analysis.match_score - 10)}%</span></div>
                     <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.max(10, analysis.match_score - 10)}%` }} /></div>
                  </div>
                </div>
              </motion.div>

              {/* 🧠 RIGHT PANEL (2/3 width) - AI Summary & Required Skills */}
              <motion.div
                variants={fadeUp}
                suppressHydrationWarning
                className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full"
              >
                {/* Summary Section */}
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2 shrink-0 mb-4">
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Sparkles size={15} className="text-purple-500" />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Summary</p>
                  </div>
                  
                  <div className="space-y-3 text-sm text-gray-700 leading-relaxed overflow-hidden py-1 mb-6">
                    {analysis.ai_summary.split('\n').map((line, i) => {
                      const t = line.trim();
                      if (!t) return null;
                      const isHeader = t.includes('🔍') || t.includes('⚠️') || t.includes('🎯') || t.startsWith('**');
                      return (
                        <p key={i} className={isHeader ? "font-bold text-gray-900 mt-4 text-base flex items-center gap-2" : "pl-4 border-l-2 border-purple-500/20 ml-2 py-1 text-gray-600 block"}>
                          {t.replace(/\*\*/g, '')}
                        </p>
                      )
                    })}
                  </div>

                  {/* 🚨 Critical Gaps - Added to Fill space creatively with high utility */}
                  {critical.length > 0 && (
                    <div className="mb-6">
                      <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <AlertCircle size={12} className="text-red-500" /> Critical Gaps to Focus On
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {critical.map(g => (
                          <span key={g.skill} className="text-xs bg-red-50 text-red-700 border border-red-100/60 px-2.5 py-1 rounded-lg font-medium">
                            {g.skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-2 pt-2 shrink-0 pb-4 mt-auto">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100/80">
                      <AlertCircle size={11} className="text-red-400" />
                      <strong className="text-gray-700">{critical.length}</strong> critical gaps
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100/80">
                      <TrendingUp size={11} className="text-blue-400" />
                      <strong className="text-gray-700">{analysis.gap_skills.length}</strong> total gaps
                    </span>
                    <span className="ml-auto text-[10px] text-gray-300">
                      {new Date(analysis.created_at).toLocaleDateString('en-MY')}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-4" />

                {/* Required Skills Section */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 shrink-0">
                    <Zap size={14} className="text-violet-500" /> Required for{' '}
                    <span className="text-violet-600 font-bold">{analysis.target_career}</span>
                  </p>
                  {analysis.required_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysis.required_skills.map(s => (
                        <span
                          key={s.skill}
                          className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-3 py-1.5 rounded-xl font-medium hover:bg-violet-100 transition-colors cursor-default"
                        >
                          {s.skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                     <p className="text-sm text-gray-500">No specific required skills documented.</p>
                  )}
                </div>
              </motion.div>

            </div>

            {/* FASTEST PATH TO 70% */}
            {analysis.match_score < 70 && critical.length > 0 && (
              <motion.div variants={fadeUp} suppressHydrationWarning className="gradient-hero rounded-2xl p-6 md:p-8 !text-white shadow-xl shadow-blue-900/10 mb-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <TrendingUp size={120} />
                </div>
                <div className="relative z-10 w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-2 rounded-xl">
                      <Zap className="text-yellow-300" size={20} />
                    </div>
                    <h3 className="font-extrabold text-xl text-white">Your Fastest Path to 70%</h3>
                  </div>
                  <p className="text-blue-100 text-sm mb-6 max-w-xl">
                    Complete these {Math.min(3, critical.length)} skills to reach 70% readiness in ~{critical.slice(0,3).reduce((a,b) => a+(b.estimatedHours||0), 0)} hours. High impact guaranteed.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {critical.slice(0,3).map((gap, i) => (
                       <div key={i} className="bg-white/10 border border-white/20 rounded-xl p-4 flex flex-col justify-between hover:bg-white/20 transition-colors">
                          <div className="w-full truncate">
                            <span className="text-[10px] font-bold tracking-wider text-blue-200 uppercase mb-1 block">Impact: High</span>
                            <h4 className="font-bold !text-white mb-2 truncate" title={gap.skill}>{gap.skill}</h4>
                          </div>
                          <Link href="/career/modules" className="mt-3">
                            <Button className="w-full text-xs font-bold py-1.5 h-auto rounded-lg flex items-center justify-center gap-2 shadow-sm" variant="secondary">
                              Focus Now <ArrowRight size={12} />
                            </Button>
                          </Link>
                       </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* START HERE (Highest Gap) */}
            {startHere.length > 0 && (
              <motion.div variants={fadeUp} suppressHydrationWarning className="mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🔥</span>
                  <p className="text-xl font-extrabold text-gray-900">Start Here</p>
                  <span className="text-[10px] bg-red-100/80 text-red-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ml-1 border border-red-200">Highest Impact</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 drop-shadow-sm">
                  {startHere.map((gap, i) => (
                    <motion.div
                      key={gap.skill}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      suppressHydrationWarning
                    >
                      <SkillGapCard gap={gap} featured={true} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Critical gaps */}
            {remainingCritical.length > 0 && (
              <motion.div variants={fadeUp} suppressHydrationWarning className="mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={15} className="text-red-500" />
                  <p className="text-sm font-bold text-red-600">Other Critical Gaps</p>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">{remainingCritical.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {remainingCritical.map((gap, i) => (
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

            {/* RECOMMENDED NEXT STEP CTA */}
            <motion.div variants={fadeUp} suppressHydrationWarning className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex-1 w-full text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                   <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Compass size={16} />
                   </div>
                   <h3 className="font-extrabold text-gray-900 text-lg">Recommended Next Step</h3>
                </div>
                <p className="text-sm text-gray-500 max-w-md mx-auto lg:mx-0">
                  We suggest tackling <strong className="text-gray-800">{startHere[0]?.skill || critical[0]?.skill || "your weakest skills"}</strong> first. How would you like to proceed?
                </p>
              </div>

              <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                <Link href="/career/modules?guided=true" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 !text-white font-bold h-11 px-6 transition-all">
                    <Zap size={15} /> Follow Recommended Path
                  </Button>
                </Link>
                <Link href="/career/modules" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold h-11 px-6 transition-colors bg-white relative">
                    Explore Modules
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div variants={fadeUp} suppressHydrationWarning className="flex justify-center pt-8 pb-4">
              <Button onClick={runAnalysis} disabled={running} className="text-gray-400 text-xs hover:text-gray-600 bg-transparent shadow-none" variant="outline">
                {running ? <Loader2 size={12} className="animate-spin mr-1.5" /> : <RefreshCw size={12} className="mr-1.5" />}
                Update My Progress
              </Button>
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
                  : <><Zap size={16} className="mr-2" /> Reveal My Readiness</>}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
