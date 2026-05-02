import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PASS_COOKIE = 'site_pass'
const PASS_TOKEN  = 'unlocked'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Site password gate ────────────────────────────────────────────────────
  const gateExcluded =
    pathname.startsWith('/enter') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')

  if (!gateExcluded && request.cookies.get(PASS_COOKIE)?.value !== PASS_TOKEN) {
    const url = request.nextUrl.clone()
    url.pathname = '/enter'
    return NextResponse.redirect(url)
  }

  // ── Supabase session + admin route protection ─────────────────────────────
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  const { response, user } = await updateSession(request)

  if (pathname.startsWith('/admin') && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
