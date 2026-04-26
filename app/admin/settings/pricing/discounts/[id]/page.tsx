import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { DiscountForm } from '@/components/admin/settings/DiscountForm'

export const metadata = { title: 'Edit Discount' }

export default async function EditDiscountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return <div className="px-6 py-10"><p className="text-sm text-ink-muted">Connect Supabase to edit discounts.</p></div>
  }

  const supabase = createAdminClient()

  const [{ data: discount }, { data: artworks }] = await Promise.all([
    supabase.from('discounts').select('*').eq('id', id).single(),
    supabase.from('artworks').select('id, title').eq('is_published', true).order('title'),
  ])

  if (!discount) notFound()

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
        <h1 className="font-display text-4xl italic text-ink">Edit discount</h1>
      </div>
      <DiscountForm discount={discount} artworks={artworks ?? []} />
    </div>
  )
}
