import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export default async function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?error=auth-error')

  const adminClient = createAdminClient()
  const { data: admin } = await adminClient
    .from('admins')
    .select('is_active')
    .eq('id', user.id)
    .single()

  if (!admin?.is_active) redirect('/login?error=no-access')

  return <>{children}</>
}
