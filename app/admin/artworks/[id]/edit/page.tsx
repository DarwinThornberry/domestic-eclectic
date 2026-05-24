import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { ArtworkForm } from '@/components/admin/ArtworkForm'
import { ArtworkPricingSection } from '@/components/admin/ArtworkPricingSection'
import { DEFAULT_TIERS, calculatePrice, formatDollars, SIZE_GROUPS } from '@/lib/pricing/southern-buoy'
import type { PricingTiers } from '@/lib/pricing/southern-buoy'
import { MATERIAL_LABELS } from '@/lib/constants'
import type { Material } from '@/types'

const OVERVIEW_MATERIALS: Material[] = ['cotton_rag_smooth', 'cotton_rag_textured', 'canvas_satin', 'canvas_lustre']
const OVERVIEW_MATERIAL_SHORT: Record<string, string> = {
  cotton_rag_smooth:   'Rag Smooth',
  cotton_rag_textured: 'Rag Textured',
  canvas_satin:        'Canvas Satin',
  canvas_lustre:       'Canvas Lustre',
}
const ALL_SIZE_OPTS = [
  ...SIZE_GROUPS.standard,
  ...SIZE_GROUPS.square,
  ...SIZE_GROUPS.rectangular,
]

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
      .select('markup_small, markup_medium, markup_large, rounding_small, rounding_medium, rounding_large, global_price_overrides')
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
  const globalOverrides = (settings?.global_price_overrides ?? {}) as Record<string, number>
  const artworkOverrides = (a.price_overrides ?? {}) as Record<string, number>
  const allowedSizeKeys = a.allowed_sizes as string[] | null

  // Sizes to show in overview: offered sizes only, or all if none configured
  const overviewSizes = allowedSizeKeys?.length
    ? ALL_SIZE_OPTS.filter((s) => allowedSizeKeys.includes(s.key))
    : ALL_SIZE_OPTS

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

      {/* Price overview */}
      <div className="mt-10 mb-2">
        <h2 className="caption text-ink tracking-[0.12em] mb-1">PRICES AT A GLANCE</h2>
        <p className="text-xs text-ink-muted mb-4">
          Unframed. <span className="text-terracotta font-medium">Terracotta</span> = artwork override · default = global setting · muted = engine fallback.
        </p>
        <div className="overflow-x-auto">
          <table className="text-xs border border-border">
            <thead>
              <tr className="bg-bone-dark border-b border-border">
                <th className="text-left px-4 py-2.5 text-ink-muted font-normal whitespace-nowrap">Size</th>
                {OVERVIEW_MATERIALS.map((m) => (
                  <th key={m} className="text-right px-4 py-2.5 text-ink-muted font-normal whitespace-nowrap">
                    {OVERVIEW_MATERIAL_SHORT[m]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {overviewSizes.map((size) => (
                <tr key={size.key} className="border-t border-border">
                  <td className="px-4 py-2 text-ink whitespace-nowrap">{size.dims}</td>
                  {OVERVIEW_MATERIALS.map((mat) => {
                    const isCanvas = mat === 'canvas_satin' || mat === 'canvas_lustre'
                    if (isCanvas && size.key === '210x297') {
                      return <td key={mat} className="px-4 py-2 text-right text-ink-muted">—</td>
                    }
                    const comboKey = `${mat}:${size.key}:unframed`
                    const hasArtworkOverride = artworkOverrides[comboKey] !== undefined
                    const hasGlobalDefault = !hasArtworkOverride && globalOverrides[comboKey] !== undefined
                    const price =
                      artworkOverrides[comboKey] ??
                      globalOverrides[comboKey] ??
                      calculatePrice(mat, size.key, 'unframed', tiers)
                    return (
                      <td
                        key={mat}
                        className={`px-4 py-2 text-right ${
                          hasArtworkOverride
                            ? 'text-terracotta font-medium'
                            : hasGlobalDefault
                            ? 'text-ink'
                            : 'text-ink-muted'
                        }`}
                      >
                        {price !== null ? formatDollars(price) : '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="max-w-2xl mt-10">
        <div className="mb-6">
          <h2 className="caption text-ink tracking-[0.12em]">PRICING</h2>
          <p className="text-xs text-ink-muted mt-1.5">
            By default this work uses the global prices set in Costs. Turn on custom pricing to set exact prices for this work.
          </p>
        </div>
        <ArtworkPricingSection
          artworkId={artwork.id}
          initialPricingMode={a.pricing_mode ?? 'default'}
          initialFixedPrices={a.fixed_prices ?? null}
          initialPriceOverrides={a.price_overrides ?? null}
          allowedSizes={a.allowed_sizes ?? null}
          tiers={tiers}
        />
      </div>
    </div>
  )
}
