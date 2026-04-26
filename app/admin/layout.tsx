import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { AdminShell } from '@/components/admin/AdminShell'

export const metadata = { title: { default: 'Studio — Domestic Eclectic', template: '%s — Studio' } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <AdminShell userInitials="LS" userName="Lara Stocco">
        {children}
      </AdminShell>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: admin } = await supabase
    .from('admins')
    .select('email, is_active')
    .eq('id', user.id)
    .single()

  if (!admin?.is_active) {
    await supabase.auth.signOut()
    redirect('/login?error=no-access')
  }

  const email = admin?.email ?? user.email ?? ''
  const nameParts = email.split('@')[0].split('.')
  const initials = nameParts
    .slice(0, 2)
    .map((p: string) => p[0]?.toUpperCase() ?? '')
    .join('')

  // Fetch unread message count for the nav badge
  let unreadMessages = 0
  try {
    const adminClient = createAdminClient()
    const { count } = await adminClient
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)
    unreadMessages = count ?? 0
  } catch {
    // contact_messages table may not exist yet — badge just won't show
  }

  return (
    <AdminShell
      userInitials={initials || 'LS'}
      userName={email}
      unreadMessages={unreadMessages}
    >
      {children}
    </AdminShell>
  )
}
