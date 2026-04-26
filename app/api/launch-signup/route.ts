import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json() as { email?: string; source?: string }

    const trimmed = email?.trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@')) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // Supabase not wired — silently accept so UI still works during local dev
      return NextResponse.json({ ok: true })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('launch_signups')
      .insert({ email: trimmed, source: source ?? null })

    // Unique constraint violation (23505) — already signed up; still return success
    if (error && error.code !== '23505') {
      console.error('[launch-signup]', error.message)
      return NextResponse.json({ error: 'Could not save your email. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[launch-signup]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
