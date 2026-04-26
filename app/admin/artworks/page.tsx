import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { ArtworkList } from '@/components/admin/ArtworkList'

export const metadata = { title: 'Works' }

export default async function ArtworksPage() {
  let artworks: any[] = []

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('artworks')
      .select('id, slug, title, year, original_dims, thumbnail_url, is_published, sort_order')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    artworks = data ?? []
  }

  return (
    <div className="px-6 lg:px-10 py-10 max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="caption text-terracotta tracking-[0.16em] mb-2">STUDIO</p>
          <h1 className="font-display text-4xl italic text-ink">Works</h1>
          <p className="text-sm text-ink-muted mt-1">Manage the artwork available in your store.</p>
        </div>
        <Link
          href="/admin/artworks/new"
          className="inline-flex items-center gap-2 bg-ink text-bone px-4 py-2.5 text-sm hover:bg-terracotta transition-colors"
        >
          <Plus size={13} /> Add new work
        </Link>
      </div>

      {!process.env.NEXT_PUBLIC_SUPABASE_URL ? (
        <div className="border border-border p-8">
          <p className="text-sm text-ink-muted">Connect Supabase to manage your works.</p>
        </div>
      ) : artworks.length === 0 ? (
        <div className="border border-border p-12 text-center">
          <p className="font-display text-2xl italic text-ink-muted mb-4">No works yet.</p>
          <Link
            href="/admin/artworks/new"
            className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-sm text-ink hover:bg-bone-dark transition-colors"
          >
            <Plus size={13} /> Add your first work
          </Link>
        </div>
      ) : (
        <>
          <p className="text-xs text-ink-muted mb-4">
            Drag the handle on the left to reorder. The order here is the order they appear on your site.
          </p>
          <ArtworkList artworks={artworks} />
        </>
      )}
    </div>
  )
}
