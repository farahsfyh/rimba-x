import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { parsePDF, parseDOCX, parseTXT, parseXLSX } from '@/lib/parsers'
import { checkRateLimit, getClientIp, UPLOAD_LIMIT } from '@/lib/security/rate-limit'
import { verifyFileSignature } from '@/lib/security/validation'

export const runtime = 'nodejs'

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  // 20 MB
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/plain',
])

export async function POST(request: NextRequest) {
    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit by IP (same budget as uploads — both are file operations)
    const ip = getClientIp(request)
    const { allowed, resetInMs } = await checkRateLimit(ip, UPLOAD_LIMIT)
    if (!allowed) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429, headers: { 'Retry-After': String(Math.ceil(resetInMs / 1000)) } }
        )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size before reading into memory
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: 'File too large. Maximum size is 20 MB.' }, { status: 400 })
    }

    // Validate MIME type against allowlist
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json({ error: `File type '${file.type}' is not supported.` }, { status: 400 })
    }

    // Verify file magic numbers match claimed MIME type
    const signatureValid = await verifyFileSignature(file)
    if (!signatureValid) {
        return NextResponse.json({ error: 'File content does not match the expected file type.' }, { status: 400 })
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
        return NextResponse.json({ error: 'Failed to parse file.' }, { status: 500 })
    }
}
