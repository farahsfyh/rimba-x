import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { parsePDF, parseDOCX, parseTXT, parseXLSX } from '@/lib/parsers'
import { generateEmbedding } from '@/lib/ai/embeddings'
import { checkRateLimit, getClientIp, UPLOAD_LIMIT } from '@/lib/security/rate-limit'
import { verifyFileSignature } from '@/lib/security/validation'

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  // 20 MB
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/plain',
])

export const runtime = 'nodejs'

function chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const chunks: string[] = []
  let i = 0
  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    chunks.push(chunk)
    i += chunkSize - overlap
    if (i >= words.length && chunks[chunks.length - 1] !== chunk) break
  }
  return chunks.filter(c => c.trim().length > 0)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const subject = (formData.get('subject') as string | null) || null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  // Rate limit by IP (formData parsed before auth check, so use IP here)
  const ip = getClientIp(request)
  const { allowed } = checkRateLimit(ip, UPLOAD_LIMIT)
  if (!allowed) return NextResponse.json({ error: 'Too many uploads. Please try again later.' }, { status: 429 })

  // Validate file size before reading into memory
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: `File too large. Maximum size is 20 MB.` }, { status: 400 })
  }

  // Validate MIME type against allowlist
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: `File type '${file.type}' is not supported.` }, { status: 400 })
  }

  // Verify file magic numbers match claimed MIME type (prevents content-type spoofing)
  const signatureValid = await verifyFileSignature(file)
  if (!signatureValid) {
    return NextResponse.json({ error: 'File content does not match the expected file type.' }, { status: 400 })
  }

  try {
    // 1. Upload raw file to Supabase Storage
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${user.id}/${timestamp}-${safeName}`
    const arrayBuffer = await file.arrayBuffer()

    const { error: storageError } = await serviceClient.storage
      .from('documents')
      .upload(storagePath, arrayBuffer, { contentType: file.type, upsert: false })

    if (storageError) throw new Error(`Storage upload failed: ${storageError.message}`)

    // 2. Parse the file content
    // Re-create File from arrayBuffer since it was already consumed
    const fileForParse = new File([arrayBuffer], file.name, { type: file.type })

    let parsed
    if (file.type === 'application/pdf') {
      parsed = await parsePDF(fileForParse)
    } else if (file.type.includes('wordprocessingml')) {
      parsed = await parseDOCX(fileForParse)
    } else if (file.type.includes('sheet') || file.type.includes('excel')) {
      parsed = await parseXLSX(fileForParse)
    } else {
      parsed = await parseTXT(fileForParse)
    }

    // 3. Insert document record (unprocessed)
    const { data: doc, error: docError } = await serviceClient
      .from('documents')
      .insert({
        user_id: user.id,
        filename: file.name,
        file_path: storagePath,
        file_type: file.type,
        file_size: file.size,
        title: parsed.metadata?.title || file.name.replace(/\.[^/.]+$/, ''),
        subject: subject,
        language: 'en',
        processed: false,
      })
      .select()
      .single()

    if (docError) throw new Error(`Database insert failed: ${docError.message}`)

    // 4. Chunk text and generate embeddings for RAG
    const chunks = chunkText(parsed.text)
    let embeddingErrors = 0

    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await generateEmbedding(chunks[i])
        await serviceClient.from('document_embeddings').insert({
          user_id: user.id,
          document_id: doc.id,
          chunk_index: i,
          content: chunks[i],
          embedding,
        })
      } catch (err) {
        console.error(`[upload] embedding chunk ${i} failed:`, err)
        embeddingErrors++
      }
      // Avoid rate-limiting Gemini embedding API
      if (i < chunks.length - 1) {
        await new Promise(r => setTimeout(r, 150))
      }
    }

    // 5. Mark document as processed
    await serviceClient
      .from('documents')
      .update({ processed: true })
      .eq('id', doc.id)

    return NextResponse.json({
      document: { ...doc, processed: true },
      chunkCount: chunks.length - embeddingErrors,
      wordCount: parsed.text.split(/\s+/).filter(Boolean).length,
    })
  } catch (error) {
    console.error('[upload] error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
