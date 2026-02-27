import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const getServiceClient = () =>
  createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) console.error('[documents] auth error:', authError.message)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const serviceClient = getServiceClient()
    const { data, error } = await serviceClient
      .from('documents')
      .select('id, filename, title, subject, file_type, file_size, processed, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[documents] GET error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ documents: data })
  } catch (e) {
    console.error('[documents] GET uncaught:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serviceClient = getServiceClient()
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'No document ID provided' }, { status: 400 })

  // Verify ownership and get file path
  const { data: doc } = await serviceClient
    .from('documents')
    .select('file_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

  // Delete embeddings, storage file, and DB record
  await serviceClient.from('document_embeddings').delete().eq('document_id', id)
  await serviceClient.storage.from('documents').remove([doc.file_path])
  const { error: deleteError } = await serviceClient.from('documents').delete().eq('id', id)

  if (deleteError) {
    console.error('[documents] DELETE error:', JSON.stringify(deleteError))
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
