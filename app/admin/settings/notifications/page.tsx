import { createAdminClient } from '@/lib/supabase/server'
import { NotificationsClient } from '@/components/admin/settings/NotificationsClient'

export const metadata = { title: 'Notifications' }

export default async function NotificationsPage() {
  let adminEmail = ''
  let printerEmail = 'southernbuoy@gmail.com'

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createAdminClient()
    const { data } = await supabase.from('settings').select('admin_email, printer_email').eq('id', 1).single()
    adminEmail = data?.admin_email ?? ''
    printerEmail = data?.printer_email ?? 'southernbuoy@gmail.com'
  }

  return (
    <div className="px-6 lg:px-10 py-10 max-w-2xl">
      <div className="mb-10">
        <p className="caption text-terracotta tracking-[0.16em] mb-2">SETTINGS</p>
        <h1 className="font-display text-4xl italic text-ink">Notifications</h1>
        <p className="text-sm text-ink-muted mt-2">Where order emails and alerts are sent.</p>
      </div>
      <NotificationsClient
        adminEmail={adminEmail}
        printerEmail={printerEmail}
      />
    </div>
  )
}
