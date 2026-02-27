import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { parsePDF, parseDOCX, parseTXT, parseXLSX } from '@/lib/parsers'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    try {
        let parsed
        if (file.type === 'application/pdf') {
            parsed = await parsePDF(file)
        } else if (file.type.includes('wordprocessingml')) {
            parsed = await parseDOCX(file)
        } else if (file.type.includes('sheet') || file.type.includes('excel')) {
            parsed = await parseXLSX(file)
        } else {
            parsed = await parseTXT(file)
        }

        const wordCount = parsed.text.split(/\s+/).filter(Boolean).length

        return NextResponse.json({ text: parsed.text, wordCount, metadata: parsed.metadata })
    } catch (error) {
        console.error('[parse] error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to parse file' },
            { status: 500 }
        )
    }
}
