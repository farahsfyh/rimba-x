import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'
import { SKILL_GAP_PROMPT } from '@/lib/career/prompts'
import { parseGapAnalysis, deriveModulesFromGap } from '@/lib/career/parser'
import { getResourcesForSkill } from '@/lib/career/resources'
import { getGeminiModel } from '@/lib/ai/gemini'
import { awardXP } from '@/lib/gamification'
import type { CareerProfile } from '@/types'

export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data } = await supabase
    .from('skill_gap_analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ data: data ?? null })
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { allowed } = await checkRateLimit(ip, { name: 'career', max: 10, windowMs: 60 * 60 * 1000 })
  if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Fetch career profile
  const { data: profile } = await supabase
    .from('career_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) {
    return NextResponse.json({ error: 'Complete your career profile first' }, { status: 400 })
  }

  // Generate skill gap analysis with Gemini
  const model = getGeminiModel('gemini-2.0-flash')
  const prompt = SKILL_GAP_PROMPT(profile as CareerProfile)

  let rawText = ''
  try {
    const result = await model.generateContent(prompt)
    rawText = result.response.text()
  } catch {
    return NextResponse.json({ error: 'AI analysis failed. Please try again.' }, { status: 500 })
  }

  const gapData = parseGapAnalysis(rawText)
  if (!gapData) {
    return NextResponse.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 })
  }

  // Enrich gap skills with curated resources where AI didn't provide any
  gapData.gap_skills = gapData.gap_skills.map(g => ({
    ...g,
    resources: g.resources?.length ? g.resources : getResourcesForSkill(g.skill),
  }))

  // Save analysis
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: analysis, error: analysisErr } = await supabase
    .from('skill_gap_analyses')
    .insert({
      user_id: user.id,
      target_career: (profile as any).target_career,
      required_skills: gapData.required_skills as any,
      current_skills: (profile as any).skills,
      gap_skills: gapData.gap_skills as any,
      match_score: Math.min(100, Math.max(0, gapData.match_score)),
      ai_summary: gapData.ai_summary,
    } as any)
    .select()
    .single()

  if (analysisErr || !analysis) {
    return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 })
  }

  // Replace stale modules with fresh ones from this analysis
  await supabase.from('learning_modules').delete().eq('user_id', user.id)

  // Auto-generate learning modules  
  const moduleDefs = deriveModulesFromGap(user.id, (analysis as any).id, gapData)
  const { data: modules } = await supabase
    .from('learning_modules')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(moduleDefs as any)
    .select()

  // Award XP
  await awardXP(user.id, 75, 'Skill gap analysis completed')

  return NextResponse.json({ data: analysis, modules: modules ?? [] })
}
