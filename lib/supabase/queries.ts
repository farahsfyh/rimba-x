import { createClient } from '@/lib/supabase/client'

/**
 * Get user documents (study materials)
 */
export async function getUserDocuments(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching documents:', error.message)
        return []
    }
    return data
}

/**
 * Get user study progress and stats
 */
export async function getUserStats(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user stats:', error.message)
    }
    return data
}

/**
 * Get user gamification progress
 */
export async function getUserProgress(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user progress:', error.message)
    }
    return data
}

/**
 * Get user's recent tutoring sessions
 */
export async function getRecentSessions(userId: string, limit = 5) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('tutoring_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching sessions:', error.message)
        return []
    }
    return data
}
