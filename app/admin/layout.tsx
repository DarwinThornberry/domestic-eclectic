import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminShell } from '@/components/admin/AdminShell'

export const metadata = { title: { default: 'Studio — Domestic Eclectic', template: '%s — Studio' } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // If Supabase isn't wired up yet, render the shell with a placeholder user
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <AdminShell userInitials="LS" userName="Lara Stoco">
        {children}
      </AdminShell>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Verify the user is an active admin
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

  return (
    <AdminShell userInitials={initials || 'LS'} userName={email}>
      {children}
    </AdminShell>
  )
}
