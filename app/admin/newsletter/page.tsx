import { createAdminClient } from '@/lib/supabase/server'
import { NewsletterClient } from '@/components/admin/NewsletterClient'

export const metadata = { title: 'Studio Notes' }

export default async function NewsletterPage() {
  let subscribers: {
    id: string
    email: string
    source: string | null
    created_at: string
  }[] = []

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, source, created_at')
      .order('created_at', { ascending: false })
    subscribers = data ?? []
  }

  return (
    <div className="px-6 lg:px-10 py-10 max-w-2xl">
      <div className="mb-8">
        <p className="caption text-terracotta tracking-[0.16em] mb-2">STUDIO</p>
        <h1 className="font-display text-4xl italic text-ink">Studio Notes</h1>
        <p className="text-sm text-ink-muted mt-2">
          Subscribers from the Studio Notes footer form.
        </p>
      </div>

      <NewsletterClient subscribers={subscribers} />
    </div>
  )
}
