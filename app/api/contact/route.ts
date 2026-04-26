import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json()

    if (!name?.trim())
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 })

    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })

    if (!message?.trim())
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 })

    const supabase = createAdminClient()
    const { error } = await supabase.from('contact_messages').insert({
      name:    name.trim(),
      email:   email.trim().toLowerCase(),
      message: message.trim(),
    })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[api/contact]', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
