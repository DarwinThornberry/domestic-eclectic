import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json()

    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })

    const supabase = createAdminClient()
    const { error } = await supabase.from('newsletter_subscribers').insert({
      email:  email.trim().toLowerCase(),
      source: source ?? null,
    })

    // Duplicate email → still a success; don't leak whether address is known
    if (error && error.code !== '23505') throw error

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[api/newsletter]', err)
    return NextResponse.json(
      { error: 'Could not save your email. Please try again.' },
      { status: 500 },
    )
  }
}
