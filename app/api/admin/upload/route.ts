import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

const ALLOWED_PUBLIC_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Verify the user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const bucket = formData.get('bucket') as string | null

  if (!file || !bucket) {
    return NextResponse.json({ error: 'Missing file or bucket' }, { status: 400 })
  }

  if (bucket !== 'artwork-public') {
    return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
  }

  if (!ALLOWED_PUBLIC_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `File type not allowed. Use: ${ALLOWED_PUBLIC_TYPES.join(', ')}` },
      { status: 400 },
    )
  }

  // Build a unique storage path
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-z0-9.-]/gi, '-').toLowerCase()
  const path = `${timestamp}-${safeName}`

  const buffer = await file.arrayBuffer()

  // Use the admin (service role) client for storage writes
  const adminSupabase = createAdminClient()
  const { error: uploadError } = await adminSupabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    console.error('[upload]', uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data } = adminSupabase.storage.from(bucket).getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl, path })
}
