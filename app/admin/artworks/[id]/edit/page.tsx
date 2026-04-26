import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { ArtworkForm } from '@/components/admin/ArtworkForm'
import { ArtworkPricingSection } from '@/components/admin/ArtworkPricingSection'
import { DEFAULT_TIERS } from '@/lib/pricing/southern-buoy'
import type { PricingTiers } from '@/lib/pricing/southern-buoy'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { title: 'Edit work' }
  const supabase = createAdminClient()
  const { data } = await supabase.from('artworks').select('title').eq('id', id).single()
  return { title: `Edit — ${data?.title ?? 'Work'}` }
}

export default async function EditArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <div className="px-6 lg:px-10 py-10">
        <p className="text-sm text-ink-muted">Connect Supabase to edit works.</p>
      </div>
    )
  }

  const supabase = createAdminClient()
  const [{ data: artwork }, { data: settings }] = await Promise.all([
    supabase.from('artworks').select('*').eq('id', id).single(),
    supabase.from('settings')
      .select('markup_small, markup_medium, markup_large, rounding_small, rounding_medium, rounding_large')
      .eq('id', 1)
      .single(),
  ])

  if (!artwork) notFound()

  const tiers: PricingTiers = settings
    ? {
        markupSmall:    Number(settings.markup_small)    || DEFAULT_TIERS.markupSmall,
        markupMedium:   Number(settings.markup_medium)   || DEFAULT_TIERS.markupMedium,
        markupLarge:    Number(settings.markup_large)    || DEFAULT_TIERS.markupLarge,
        roundingSmall:  Number(settings.rounding_small)  ?? DEFAULT_TIERS.roundingSmall,
        roundingMedium: Number(settings.rounding_medium) ?? DEFAULT_TIERS.roundingMedium,
        roundingLarge:  Number(settings.rounding_large)  ?? DEFAULT_TIERS.roundingLarge,
      }
    : DEFAULT_TIERS

  const a = artwork as any

  return (
    <div className="px-6 lg:px-10 py-10">
      <Link
        href="/admin/artworks"
        className="inline-flex items-center gap-2 caption text-ink-muted hover:text-ink transition-colors mb-8"
      >
        <ArrowLeft size={12} /> Works
      </Link>
      <div className="mb-8">
        <p className="caption text-terracotta tracking-[0.16em] mb-2">STUDIO</p>
        <h1 className="font-display text-4xl italic text-ink">
          Edit — <span className="italic">{artwork.title}</span>
        </h1>
      </div>
      <ArtworkForm artwork={artwork} />

      <div className="max-w-2xl mt-10">
        <div className="mb-6">
          <h2 className="caption text-ink tracking-[0.12em]">PRICING</h2>
          <p className="text-xs text-ink-muted mt-1.5">
            By default this work uses the global tier markups (S:{tiers.markupSmall}× / M:{tiers.markupMedium}× / L:{tiers.markupLarge}×).
            Turn on custom pricing to set different rates for this work.
          </p>
        </div>
        <ArtworkPricingSection
          artworkId={artwork.id}
          initialPricingMode={a.pricing_mode ?? 'default'}
          initialCustomMarkup={a.custom_markup ?? null}
          initialCustomMarkupSmall={a.custom_markup_small ?? null}
          initialCustomMarkupMedium={a.custom_markup_medium ?? null}
          initialCustomMarkupLarge={a.custom_markup_large ?? null}
          initialFixedPrices={a.fixed_prices ?? null}
          initialPriceOverrides={a.price_overrides ?? null}
          tiers={tiers}
        />
      </div>
    </div>
  )
}
