import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { DiscountForm } from '@/components/admin/settings/DiscountForm'

export const metadata = { title: 'Create Discount' }

export default async function NewDiscountPage() {
  let artworks: { id: string; title: string }[] = []

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('artworks')
      .select('id, title')
      .eq('is_published', true)
      .order('title')
    artworks = data ?? []
  }

  return (
    <div className="px-6 lg:px-10 py-10 max-w-2xl">
      <Link
        href="/admin/settings/pricing/discounts"
        className="inline-flex items-center gap-2 caption text-ink-muted hover:text-ink transition-colors mb-8"
      >
        <ArrowLeft size={12} /> Discounts
      </Link>
      <div className="mb-10">
        <p className="caption text-terracotta tracking-[0.16em] mb-2">SETTINGS</p>
        <h1 className="font-display text-4xl italic text-ink">Create discount</h1>
      </div>
      <DiscountForm artworks={artworks} />
    </div>
  )
}
