'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, BarChart2, BookOpen, FileText, ArrowRight, Loader2, User, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface HubStats {
  profile_complete: boolean
  match_score: number | null
  active_modules: number
  resume_count: number
  total_modules: number
  completed_modules: number
}

const QUICK_ACTIONS = [
  {
    href: '/career/profile',
    icon: User,
    title: 'Career Profile',
    desc: 'Set your education, skills & goals',
    color: 'bg-blue-50 text-primary',
    badge: 'Step 1',
  },
  {
    href: '/career/analyse',
    icon: BarChart2,
    title: 'Skill Gap Analysis',
    desc: 'See how far you are from your dream role',
    color: 'bg-indigo-50 text-indigo-600',
    badge: 'Step 2',
  },
  {
    href: '/career/modules',
    icon: BookOpen,
    title: 'Learning Modules',
    desc: 'Track progress on recommended resources',
    color: 'bg-green-50 text-green-600',
    badge: 'Step 3',
  },
  {
    href: '/career/resume',
    icon: FileText,
    title: 'Resume Builder',
    desc: 'Generate an ATS-optimised resume with AI',
    color: 'bg-purple-50 text-purple-600',
    badge: 'Step 4',
  },
]

function StatCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

export default function CareerHubPage() {
  const [stats, setStats] = useState<HubStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, modulesRes, resumeRes] = await Promise.allSettled([
          fetch('/api/career/profile'),
          fetch('/api/career/modules'),
          fetch('/api/career/resume'),
        ])

        const profile = profileRes.status === 'fulfilled' && profileRes.value.ok
          ? await profileRes.value.json()
          : null
        const modulesJson = modulesRes.status === 'fulfilled' && modulesRes.value.ok
          ? await modulesRes.value.json()
          : {}
        const modules: { status: string }[] = Array.isArray(modulesJson) ? modulesJson : (modulesJson.modules ?? [])
        const resumesJson = resumeRes.status === 'fulfilled' && resumeRes.value.ok
          ? await resumeRes.value.json()
          : {}
        const resumes: unknown[] = Array.isArray(resumesJson) ? resumesJson : (resumesJson.resumes ?? [])

        setStats({
          profile_complete: !!profile?.data,
          match_score: profile?.data?.match_score ?? null,
          active_modules: Array.isArray(modules) ? modules.filter((m) => m.status === 'in_progress').length : 0,
          resume_count: Array.isArray(resumes) ? resumes.length : 0,
          total_modules: Array.isArray(modules) ? modules.length : 0,
          completed_modules: Array.isArray(modules) ? modules.filter((m) => m.status === 'completed').length : 0,
        })
      } catch {
        setStats({ profile_complete: false, match_score: null, active_modules: 0, resume_count: 0, total_modules: 0, completed_modules: 0 })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-6 md:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8" suppressHydrationWarning>
        <div className="flex items-center gap-2 mb-1">
          <Briefcase size={22} className="text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Career Hub</h1>
          <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
            <Sparkles size={9} /> AI-Powered
          </span>
        </div>
        <p className="text-sm text-gray-500">Your personalised career readiness journey</p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" suppressHydrationWarning>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-24 animate-pulse" />
          ))
        ) : (
          <>
            <StatCard label="Profile" value={stats?.profile_complete ? '✓' : '—'} sub={stats?.profile_complete ? 'Complete' : 'Not set up'} />
            <StatCard
              label="Skill Match"
              value={stats?.match_score != null ? `${stats.match_score}%` : '—'}
              sub="vs target role"
            />
            <StatCard
              label="Modules"
              value={stats?.total_modules ?? 0}
              sub={`${stats?.completed_modules ?? 0} completed`}
            />
            <StatCard label="Resumes" value={stats?.resume_count ?? 0} sub="AI-generated" />
          </>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} suppressHydrationWarning>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Get Started</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.3 }}
              >
                <Link
                  href={action.href}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color}`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-gray-900">{action.title}</h3>
                      <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{action.badge}</span>
                    </div>
                    <p className="text-xs text-gray-500">{action.desc}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Banner if no profile */}
      {!loading && !stats?.profile_complete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-linear-to-r from-primary/10 to-indigo-50 border border-primary/20 rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <Loader2 size={20} className="text-primary animate-spin" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Start by completing your Career Profile</p>
            <p className="text-xs text-gray-500">Takes only 2 minutes — earn 50 XP!</p>
          </div>
          <Link href="/career/profile" className="text-xs font-bold text-primary hover:underline whitespace-nowrap">
            Start now →
          </Link>
        </motion.div>
      )}
    </div>
  )
}
