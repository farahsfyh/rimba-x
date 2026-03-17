'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, CheckCircle } from 'lucide-react'
import { CareerProfileForm } from '@/components/career/CareerProfileForm'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface Profile {
  full_name?: string
  current_level?: string
  field_of_study?: string
  institution?: string
  graduation_year?: number
  current_skills?: string[]
  work_experience?: { company: string; role: string; duration_months: number }[]
  certifications?: string[]
  target_career?: string
  target_industry?: string
  career_goals?: string
  location?: string
}

export default function CareerProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/career/profile')
      .then(r => r.ok ? r.json() : { data: null })
      .then(j => {
        setProfile(j.data ?? null)
        if (j.data) setSaved(true)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6" suppressHydrationWarning>
        <div className="flex items-center gap-2 mb-1">
          <User size={20} className="text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Career Profile</h1>
          {saved && <CheckCircle size={16} className="text-green-500" />}
        </div>
        <p className="text-sm text-gray-500">Tell us about yourself so we can personalise your career plan</p>
      </motion.div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="animate-pulse flex flex-col gap-3 items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full" />
            <div className="h-3 bg-gray-100 rounded w-48" />
            <div className="h-3 bg-gray-100 rounded w-32" />
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="max-w-xl" suppressHydrationWarning>
          <CareerProfileForm
            initialData={profile ? {
              full_name: profile.full_name,
              current_level: profile.current_level,
              field_of_study: profile.field_of_study,
              institution: profile.institution,
              graduation_year: profile.graduation_year?.toString(),
              current_skills: profile.current_skills ?? [],
              work_experience: profile.work_experience ?? [],
              certifications: profile.certifications ?? [],
              target_career: profile.target_career,
              target_industry: profile.target_industry,
              career_goals: profile.career_goals,
              location: profile.location,
            } : undefined}
            onSuccess={() => {
              setSaved(true)
            }}
          />
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm font-medium text-green-700">Profile saved! Ready for analysis.</span>
              </div>
              <Link href="/career/analyse">
                <Button size="sm">Run Skill Gap Analysis →</Button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}
