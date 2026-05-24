import { createClient } from '@/lib/supabase/server'
import { ARTWORKS, type ArtworkData } from './artworks'
import { MARKUP_MULTIPLIER, DEFAULT_TIERS, type PricingTiers } from '@/lib/pricing/southern-buoy'
import type { ArtworkRow } from '@/types/database'

/** Fetches the current markup multiplier from DB settings (legacy single-markup path). */
export async function getMarkup(): Promise<number> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return MARKUP_MULTIPLIER
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('settings').select('markup_multiplier').eq('id', 1).single()
    return data?.markup_multiplier ? Number(data.markup_multiplier) : MARKUP_MULTIPLIER
  } catch {
    return MARKUP_MULTIPLIER
  }
}

/** Fetches the three-tier markup + rounding settings from DB. Safe to call from server components. */
export async function getPricingTiers(): Promise<PricingTiers> {
  const { tiers } = await getPricingSettings()
  return tiers
}

/**
 * Single DB call that returns both pricing tiers and the global per-combo price overrides
 * from Settings > Costs. Use this on the storefront where both are needed.
 */
export async function getPricingSettings(): Promise<{
  tiers: PricingTiers
  globalPriceOverrides: Record<string, number>
}> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { tiers: DEFAULT_TIERS, globalPriceOverrides: {} }
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('settings')
      .select('markup_small, markup_medium, markup_large, rounding_small, rounding_medium, rounding_large, global_price_overrides')
      .eq('id', 1)
      .single()
    if (!data) return { tiers: DEFAULT_TIERS, globalPriceOverrides: {} }
    return {
      tiers: {
        markupSmall:    Number(data.markup_small)    || DEFAULT_TIERS.markupSmall,
        markupMedium:   Number(data.markup_medium)   || DEFAULT_TIERS.markupMedium,
        markupLarge:    Number(data.markup_large)    || DEFAULT_TIERS.markupLarge,
        roundingSmall:  Number(data.rounding_small)  ?? DEFAULT_TIERS.roundingSmall,
        roundingMedium: Number(data.rounding_medium) ?? DEFAULT_TIERS.roundingMedium,
        roundingLarge:  Number(data.rounding_large)  ?? DEFAULT_TIERS.roundingLarge,
      },
      globalPriceOverrides: (data.global_price_overrides as Record<string, number>) ?? {},
    }
  } catch {
    return { tiers: DEFAULT_TIERS, globalPriceOverrides: {} }
  }
}

// Maps a Supabase artworks row to the ArtworkData shape used by all site components.
function toArtworkData(row: ArtworkRow): ArtworkData {
  const fallbackPath = `/artworks/web/${row.slug}.png`
  const r = row as any
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    year: row.year,
    tagline: row.tagline ?? '',
    description: row.description ?? '',
    originalDims: row.original_dims ?? '',
    heroImage: row.thumbnail_url ?? fallbackPath,
    thumbnailImage: row.thumbnail_url ?? fallbackPath,
    galleryImages: row.gallery_image_urls?.length ? row.gallery_image_urls : (row.gallery_images ?? []),
    aspectRatio: row.aspect_ratio ?? 4 / 3,
    blurColor: row.blur_color ?? '#E8D0C0',
    isAvailable: row.is_published,
    pricingMode:        r.pricing_mode ?? 'default',
    customMarkup:       r.custom_markup ?? null,
    fixedPrices:        r.fixed_prices ?? null,
    customMarkupSmall:  r.custom_markup_small ?? null,
    customMarkupMedium: r.custom_markup_medium ?? null,
    customMarkupLarge:  r.custom_markup_large ?? null,
    priceOverrides:     r.price_overrides ?? null,
    allowedSizes:       r.allowed_sizes ?? null,
  }
}

/**
 * Fetches all published artworks ordered by sort_order.
 * Falls back to static placeholder data if Supabase is empty or unavailable —
 * this keeps the site usable before the seed script has run.
 */
export async function getPublishedArtworks(): Promise<ArtworkData[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return ARTWORKS

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('[artworks-db] getPublishedArtworks error:', error.message)
      return ARTWORKS
    }

    // Empty DB (before seed runs) → fall back to static data so the site looks right
    if (!data?.length) return ARTWORKS

    return data.map(toArtworkData)
  } catch (err) {
    console.error('[artworks-db] getPublishedArtworks unexpected error:', err)
    return ARTWORKS
  }
}

/**
 * Fetches a single published artwork by slug.
 * Falls back to static data on error or if not found in DB.
 */
export async function getPublishedArtwork(slug: string): Promise<ArtworkData | undefined> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return ARTWORKS.find((a) => a.slug === slug)
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error || !data) {
      // Fall back to static data — covers the period before the seed runs
      return ARTWORKS.find((a) => a.slug === slug)
    }

    return toArtworkData(data)
  } catch (err) {
    console.error('[artworks-db] getPublishedArtwork unexpected error:', err)
    return ARTWORKS.find((a) => a.slug === slug)
  }
}

/**
 * Returns published slugs for generateStaticParams.
 * Falls back to static slugs so the build works without a live DB.
 */
export async function getPublishedArtworkSlugs(): Promise<string[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return ARTWORKS.map((a) => a.slug)
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('artworks')
      .select('slug')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })

    if (error || !data?.length) return ARTWORKS.map((a) => a.slug)
    return data.map((r) => r.slug)
  } catch {
    return ARTWORKS.map((a) => a.slug)
  }
}
