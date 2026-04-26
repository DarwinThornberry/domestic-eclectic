import { createAdminClient } from '@/lib/supabase/server'
import { StudioClient } from '@/components/admin/settings/StudioClient'

export const metadata = { title: 'Studio Profile' }

export default async function StudioPage() {
  let studioName = 'Domestic Eclectic'
  let contactEmail = ''
  let instagramUrl = ''

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('settings')
      .select('studio_name, contact_email, instagram_url')
      .eq('id', 1)
      .single()
    studioName = data?.studio_name ?? 'Domestic Eclectic'
    contactEmail = data?.contact_email ?? ''
    instagramUrl = data?.instagram_url ?? ''
  }

  return (
    <div className="px-6 lg:px-10 py-10 max-w-2xl">
      <div className="mb-10">
        <p className="caption text-terracotta tracking-[0.16em] mb-2">SETTINGS</p>
        <h1 className="font-display text-4xl italic text-ink">Studio Profile</h1>
        <p className="text-sm text-ink-muted mt-2">Your studio's public-facing details.</p>
      </div>
      <StudioClient studioName={studioName} contactEmail={contactEmail} instagramUrl={instagramUrl} />
    </div>
  )
}
