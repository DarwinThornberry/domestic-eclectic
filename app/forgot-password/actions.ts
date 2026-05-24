'use server'

import { cookies } from 'next/headers'
import { createAdminClient, createClient } from '@/lib/supabase/server'

/**
 * Requests a password reset for the given email.
 * Checks the admins table before sending — non-admin addresses silently do nothing.
 * Always returns void so the caller cannot distinguish admin from non-admin.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase()

  // Use the service-role client so RLS doesn't block the lookup
  const adminClient = createAdminClient()
  const { data: admin } = await adminClient
    .from('admins')
    .select('id')
    .eq('email', normalizedEmail)
    .eq('is_active', true)
    .maybeSingle()

  if (!admin) return // Not an active admin — silently do nothing

  // Generate the PKCE verifier server-side (stored as a cookie on this response)
  // and send the reset email via the anon-key client
  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: `${siteUrl}/auth/callback`,
  })

  // Tell the callback where to go after a successful exchange
  const cookieStore = await cookies()
  cookieStore.set('post_auth_dest', '/reset-password', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  })
}
