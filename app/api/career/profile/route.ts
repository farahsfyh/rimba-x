import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'
import { sanitizeInput } from '@/lib/security/sanitization'
import { z } from 'zod'

const workExpSchema = z.object({
  company: z.string().max(200),
  role: z.string().max(200),
  duration_months: z.number().min(0).max(600).optional().default(0),
  description: z.string().max(1000).optional().default(''),
})

const profileSchema = z.object({
  full_name: z.string().max(200).optional(),
  current_level: z.string().max(100),
  field_of_study: z.string().max(200).optional(),
  institution: z.string().max(200).optional(),
  graduation_year: z.number().min(1950).max(2035).optional().nullable(),
  target_career: z.string().min(1).max(200),
  target_industry: z.string().max(200).optional(),
  work_experience: z.array(workExpSchema).optional().default([]),
  current_skills: z.array(z.string().max(100)).max(100).optional().default([]),
  skills: z.array(z.string().max(100)).max(100).optional().default([]),
  certifications: z.array(z.string().max(200)).max(50).optional().default([]),
  career_goals: z.string().max(2000).optional(),
  location: z.string().max(200).optional().default('Malaysia'),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { allowed } = await checkRateLimit(ip, { name: 'career', max: 20, windowMs: 60 * 60 * 1000 })
  if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })

  const d = parsed.data
  const existing = await supabase.from('career_profiles').select('id, created_at').eq('user_id', user.id).maybeSingle()
  const isNew = !existing.data

  const { data: profile, error } = await supabase
    .from('career_profiles')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert({
      user_id: user.id,
      full_name: d.full_name ? sanitizeInput(d.full_name) : null,
      current_level: d.current_level,
      field_of_study: d.field_of_study ? sanitizeInput(d.field_of_study) : null,
      institution: d.institution ? sanitizeInput(d.institution) : null,
      graduation_year: d.graduation_year ?? null,
      target_career: sanitizeInput(d.target_career),
      target_industry: d.target_industry ? sanitizeInput(d.target_industry) : null,
      work_experience: d.work_experience,
      skills: (d.current_skills?.length ? d.current_skills : d.skills ?? []).map(s => sanitizeInput(s)),
      certifications: (d.certifications ?? []).map(c => sanitizeInput(c)),
      career_goals: d.career_goals ? sanitizeInput(d.career_goals) : null,
      location: sanitizeInput(d.location ?? 'Malaysia'),
      updated_at: new Date().toISOString(),
    } as any, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })

  // Award XP on first creation
  if (isNew) {
    const { awardXP } = await import('@/lib/gamification')
    await awardXP(user.id, 50, 'Career profile completed')
  }

  return NextResponse.json({ success: true, profile })
}

export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('career_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({ profile: profile ?? null })
}
