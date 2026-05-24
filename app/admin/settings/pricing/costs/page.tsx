import { createAdminClient } from '@/lib/supabase/server'
import { PricingCostsClient } from '@/components/admin/settings/PricingCostsClient'
import { DEFAULT_TIERS } from '@/lib/pricing/southern-buoy'
import type { PricingTiers } from '@/lib/pricing/southern-buoy'

export const metadata = { title: 'Print Costs' }

export default async function PrintCostsPage() {
  let tiers: PricingTiers = DEFAULT_TIERS
  let activeSizes: string[] = []

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createAdminClient()

    const [{ data: settings }, { data: artworksData }] = await Promise.all([
      supabase
        .from('settings')
        .select('markup_small, markup_medium, markup_large, rounding_small, rounding_medium, rounding_large')
        .eq('id', 1)
        .single(),
      supabase
        .from('artworks')
        .select('allowed_sizes'),
    ])

    if (settings) {
      tiers = {
        markupSmall:    Number(settings.markup_small)    || DEFAULT_TIERS.markupSmall,
        markupMedium:   Number(settings.markup_medium)   || DEFAULT_TIERS.markupMedium,
        markupLarge:    Number(settings.markup_large)    || DEFAULT_TIERS.markupLarge,
        roundingSmall:  Number(settings.rounding_small)  ?? DEFAULT_TIERS.roundingSmall,
        roundingMedium: Number(settings.rounding_medium) ?? DEFAULT_TIERS.roundingMedium,
        roundingLarge:  Number(settings.rounding_large)  ?? DEFAULT_TIERS.roundingLarge,
      }
    }

    activeSizes = [
      ...new Set(
        (artworksData ?? []).flatMap((a: any) => a.allowed_sizes ?? [])
      ),
    ] as string[]
  }

  return (
    <div className="px-6 lg:px-10 py-10 max-w-3xl">
      <div className="mb-10">
        <p className="caption text-terracotta tracking-[0.16em] mb-2">SETTINGS</p>
        <h1 className="font-display text-4xl italic text-ink">Print Costs</h1>
        <p className="text-sm text-ink-muted mt-2">
          Your wholesale costs from Southern Buoy and your customer prices.
        </p>
      </div>
      <PricingCostsClient tiers={tiers} activeSizes={activeSizes} />
    </div>
  )
}
