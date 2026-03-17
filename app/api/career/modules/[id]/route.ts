import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'
import { sanitizeInput } from '@/lib/security/sanitization'
import { awardXP } from '@/lib/gamification'
import { z } from 'zod'

const patchSchema = z.object({
  status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
  completion_pct: z.number().min(0).max(100).optional(),
  certificate_url: z.string().url().max(500).optional().nullable(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ip = getClientIp(req)
  const { allowed } = await checkRateLimit(ip, { name: 'career', max: 60, windowMs: 15 * 60 * 1000 })
  if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Verify ownership
  const { data: existing } = await supabase
    .from('learning_modules')
    .select('id, status, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existing) return NextResponse.json({ error: 'Module not found' }, { status: 404 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (parsed.data.status !== undefined) updates.status = parsed.data.status
  if (parsed.data.completion_pct !== undefined) updates.completion_pct = parsed.data.completion_pct
  if (parsed.data.certificate_url !== undefined) {
    updates.certificate_url = parsed.data.certificate_url ? sanitizeInput(parsed.data.certificate_url) : null
  }

  const wasCompleted = (existing as any).status === 'completed'
  const nowCompleted = parsed.data.status === 'completed'

  if (nowCompleted && !wasCompleted) {
    updates.completed_at = new Date().toISOString()
    updates.completion_pct = 100
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: module, error } = await (supabase as any)
    .from('learning_modules')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update module' }, { status: 500 })

  // XP awards on completion
  if (nowCompleted && !wasCompleted) {
    await awardXP(user.id, 150, `Completed module: ${(module as any).skill_target}`)

    if (parsed.data.certificate_url) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from('user_certificates').insert({
        user_id: user.id,
        module_id: id,
        cert_name: `${(module as any).skill_target} Certificate`,
        provider: null,
        cert_url: parsed.data.certificate_url,
        verified: false,
      } as any)
      await awardXP(user.id, 200, 'Certificate earned')
    }
  } else if (parsed.data.status === 'in_progress' && (existing as any).status === 'not_started') {
    await awardXP(user.id, 25, `Started module: ${(module as any).skill_target}`)
  }

  return NextResponse.json({ module })
}
