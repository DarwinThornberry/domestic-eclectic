import { createAdminClient } from '@/lib/supabase/server'
import { LaunchSignupsClient } from '@/components/admin/settings/LaunchSignupsClient'

export const metadata = { title: 'Email Signups' }

export default async function LaunchSignupsPage() {
  let signups: { id: string; email: string; source: string | null; created_at: string }[] = []

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('launch_signups')
      .select('id, email, source, created_at')
      .order('created_at', { ascending: false })
    signups = data ?? []
  }

  const storeLive = process.env.STORE_LIVE === 'true'

  return (
    <div className="px-6 lg:px-10 py-10 max-w-2xl">
      <div className="mb-8">
        <p className="caption text-terracotta tracking-[0.16em] mb-2">SETTINGS</p>
        <h1 className="font-display text-4xl italic text-ink">Email Signups</h1>
        <p className="text-sm text-ink-muted mt-2">
          Pre-launch cart signups and Studio Notes subscribers from the footer.
        </p>
      </div>

      {!storeLive && (
        <div className="border border-terracotta/30 bg-terracotta/5 px-5 py-3 text-sm text-terracotta mb-8">
          Store is currently in pre-launch mode. Set <code className="font-mono text-xs">STORE_LIVE=true</code> to enable checkout.
        </div>
      )}

      <LaunchSignupsClient signups={signups} />
    </div>
  )
}
