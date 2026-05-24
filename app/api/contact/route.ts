import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendContactConfirmation, sendContactNotification } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json()

    if (!name?.trim())
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 })

    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })

    if (!message?.trim())
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 })

    const cleanName    = name.trim()
    const cleanEmail   = email.trim().toLowerCase()
    const cleanMessage = message.trim()

    const supabase = createAdminClient()
    const { error } = await supabase.from('contact_messages').insert({
      name:    cleanName,
      email:   cleanEmail,
      message: cleanMessage,
    })

    if (error) throw error

    // Fire both emails; log failures but don't block the response
    if (process.env.RESEND_API_KEY) {
      await Promise.allSettled([
        sendContactConfirmation(cleanName, cleanEmail),
        sendContactNotification(cleanName, cleanEmail, cleanMessage),
      ])
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[api/contact]', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
