import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const { allowed } = await checkRateLimit(ip, { name: 'career', max: 100, windowMs: 15 * 60 * 1000 })
  if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  let query = supabase
    .from('learning_modules')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (status && ['not_started', 'in_progress', 'completed'].includes(status)) {
    query = query.eq('status', status)
  }

  const { data: modules, error } = await query
  if (error) return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })

  return NextResponse.json({ modules: modules ?? [] })
}
