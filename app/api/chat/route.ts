import { createClient } from '@/lib/supabase/server'
import { generateStreamingResponse } from '@/lib/ai/gemini'
import { assembleContext } from '@/lib/ai/rag'
import { NextRequest } from 'next/server'

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
    const { message, history = [] } = body

    if (!message || typeof message !== 'string') {
        return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400 })
    }

    // Retrieve relevant context from the user's uploaded documents via RAG
    let context = ''
    try {
        context = await assembleContext(user.id, message, 3)
    } catch (e) {
        console.warn('[chat] RAG context retrieval failed (proceeding without context):', e)
    }

    // Stream the response back to the client
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const generator = generateStreamingResponse(message, context, history)
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
