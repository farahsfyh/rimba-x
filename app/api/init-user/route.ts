import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role client for writes
    const service = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if user already has progress (idempotent)
    const { data: existing } = await service
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (existing) {
        return NextResponse.json({ message: 'Already initialized' })
    }

    // Create user_progress row
    const { error: progressError } = await service.from('user_progress').insert({
        user_id: user.id,
        level: 1,
        xp: 0,
        streak: 0,
        last_active_date: new Date().toISOString(),
    })

    if (progressError) {
        console.error('[init-user] progress error:', progressError)
        return NextResponse.json({ error: progressError.message }, { status: 500 })
    }

    // Create user_stats row
    const { error: statsError } = await service.from('user_stats').insert({
        user_id: user.id,
        total_sessions: 0,
        total_questions: 0,
        topics_completed: 0,
        study_time: 0,
    })

    if (statsError) {
        console.error('[init-user] stats error:', statsError)
        return NextResponse.json({ error: statsError.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'User initialized successfully' })
}
