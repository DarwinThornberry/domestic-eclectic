import { NextRequest, NextResponse } from 'next/server'

const COOKIE = 'site_pass'
const TOKEN  = 'unlocked'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/enter') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  if (request.cookies.get(COOKIE)?.value === TOKEN) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = '/enter'
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
