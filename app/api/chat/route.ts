import { createClient } from '@/lib/supabase/server'
import { generateStreamingResponse, DEFAULT_TUTOR_SETTINGS, type TutorSettings } from '@/lib/ai/gemini'
import { assembleContext } from '@/lib/ai/rag'
import { NextRequest } from 'next/server'
import { checkRateLimit, CHAT_LIMIT } from '@/lib/security/rate-limit'

const MAX_MESSAGE_LENGTH = 4000

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    // Verify user is authenticated
    let user = null
    try {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.getUser()
        if (error) console.error('[chat] supabase.auth.getUser error:', error.message)
        user = data?.user ?? null
    } catch (e) {
        console.error('[chat] Failed to create supabase client:', e)
    }

    if (!user) {
        return new Response(
            JSON.stringify({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
    }

    const body = await request.json()
    const { message } = body
    // Validate and sanitize history: cap entries + per-entry length to prevent token abuse
    const MAX_HISTORY_ENTRIES = 20
    const MAX_HISTORY_ENTRY_LENGTH = 2000
    const rawHistory: unknown[] = Array.isArray(body.history) ? body.history : []
    const history = rawHistory
        .slice(-MAX_HISTORY_ENTRIES)
        .filter(
            (e): e is { role: 'user' | 'model'; content: string } =>
                typeof e === 'object' &&
                e !== null &&
                (e as Record<string, unknown>).role === 'user' ||
                (typeof e === 'object' &&
                e !== null &&
                (e as Record<string, unknown>).role === 'model')
        )
        .map((e) => ({
            role: e.role,
            content: typeof e.content === 'string'
                ? e.content.slice(0, MAX_HISTORY_ENTRY_LENGTH)
                : '',
        }))

    if (!message || typeof message !== 'string') {
        return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400 })
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
        return new Response(JSON.stringify({ error: 'Message too long' }), { status: 400 })
    }

    // Extract and validate tutor settings (safe defaults for anything invalid/missing)
    const VALID_MODES = ['focused', 'balanced', 'exploratory'] as const
    const VALID_TONES = ['warm', 'professional', 'casual'] as const
    const rawSettings = body.settings as Record<string, unknown> | undefined
    const teachingMode = VALID_MODES.includes(rawSettings?.teachingMode as never)
        ? rawSettings!.teachingMode as TutorSettings['teachingMode']
        : DEFAULT_TUTOR_SETTINGS.teachingMode
    const voiceTone = VALID_TONES.includes(rawSettings?.voiceTone as never)
        ? rawSettings!.voiceTone as TutorSettings['voiceTone']
        : DEFAULT_TUTOR_SETTINGS.voiceTone
    const rawFocusTitles: unknown[] = Array.isArray(body.focusDocumentTitles) ? body.focusDocumentTitles : []
    const focusDocumentTitles = rawFocusTitles
        .filter((t): t is string => typeof t === 'string' && t.length <= 200)
        .slice(0, 20)
    const tutorSettings: TutorSettings = {
        teachingMode,
        voiceTone,
        focusDocumentTitles: focusDocumentTitles.length > 0 ? focusDocumentTitles : undefined,
    }

    // Rate limit per authenticated user
    const { allowed, resetInMs } = await checkRateLimit(user.id, CHAT_LIMIT)
    if (!allowed) {
        return new Response(
            JSON.stringify({ error: 'Too many messages. Please wait a moment before sending more.' }),
            { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(resetInMs / 1000)) } }
        )
    }

    // Retrieve relevant context from the user's uploaded documents via RAG
    let context = ''
    let ragError: string | null = null
    try {
        context = await assembleContext(user.id, message, 6)
    } catch (e) {
        ragError = e instanceof Error ? e.message : String(e)
        console.error('[chat] RAG context retrieval failed:', ragError)
    }

    const encoder = new TextEncoder()

    // --- Hard guard: no context = no AI call ---
    if (!context && !ragError) {
        const noContextMsg =
            "I couldn't find relevant information in your uploaded materials to answer this question.\n\n" +
            "Please make sure you have uploaded a document that covers this topic, or rephrase your question " +
            "to match the content in your materials."
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(noContextMsg))
                controller.close()
            },
        })
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'X-Content-Type-Options': 'nosniff',
            },
        })
    }

    // RAG failed (DB/network error) — log for server, show friendly message to user
    if (ragError) {
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(
                    "I'm having trouble accessing your uploaded materials right now. " +
                    "Please try again in a moment."
                ))
                controller.close()
            },
        })
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'X-Content-Type-Options': 'nosniff',
            },
        })
    }

    // Stream the AI response — context is guaranteed non-empty here
    const stream = new ReadableStream({
        async start(controller) {
            try {
                const generator = generateStreamingResponse(message, context, history, tutorSettings)
                for await (const chunk of generator) {
                    controller.enqueue(encoder.encode(chunk))
                }
            } catch (error) {
                console.error('Chat error:', error)
                controller.enqueue(encoder.encode('\n\nSorry, I encountered an error. Please try again.'))
            } finally {
                controller.close()
            }
        },
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'X-Content-Type-Options': 'nosniff',
        },
    })
}
