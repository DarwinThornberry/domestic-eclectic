import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // `next` can come from the URL param (OAuth logins) or from the cookie
  // set by the forgot-password server action (password reset flow)
  const next =
    searchParams.get('next') ??
    request.cookies.get('post_auth_dest')?.value ??
    '/admin'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`)
      // Clear the one-time destination cookie now that it's been consumed
      response.cookies.delete('post_auth_dest')
      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-error`)
}
