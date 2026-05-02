import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const correct = process.env.SITE_PASSWORD ?? 'domestic'

  if (password !== correct) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('site_pass', 'unlocked', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
