'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Loader2, ExternalLink } from 'lucide-react'
import { saveSettings } from '@/app/admin/actions'
import { formatDollars, type PricingTiers } from '@/lib/pricing/southern-buoy'

const ROUNDING_OPTIONS = [
  { value: 0,  label: 'No rounding' },
  { value: 1,  label: 'Nearest $1'  },
  { value: 5,  label: 'Nearest $5'  },
  { value: 10, label: 'Nearest $10' },
]

interface CustomPricingArtwork {
  id: string
  title: string
  pricing_mode: string
  custom_markup: number | null
  custom_markup_small: number | null
  custom_markup_medium: number | null
  custom_markup_large: number | null
}

interface Props {
  initialTiers: PricingTiers
  customPricingArtworks: CustomPricingArtwork[]
}

function BandInput({
  label,
  band,
  description,
  markup,
  rounding,
  exampleCostDollars,
  onMarkupChange,
  onRoundingChange,
}: {
  label: string
  band: 'small' | 'medium' | 'large'
  description: string
  markup: string
  rounding: number
  exampleCostDollars: number
  onMarkupChange: (v: string) => void
  onRoundingChange: (v: number) => void
}) {
  const markupNum = parseFloat(markup) || 0
  const rawCents = Math.round(exampleCostDollars * markupNum * 100)
  const step = rounding * 100
  const roundedCents = step > 0 ? Math.round(rawCents / step) * step : rawCents
  const profitCents = roundedCents - exampleCostDollars * 100
  const margin = roundedCents > 0 ? Math.round((profitCents / roundedCents) * 100) : 0

  return (
    <div className="border border-border p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-ink">{label}</p>
          <p className="text-xs text-ink-muted mt-0.5">{description}</p>
        </div>
        <span className={`caption text-[10px] px-2 py-0.5 shrink-0 ${
          band === 'small'  ? 'bg-terracotta/10 text-terracotta' :
          band === 'medium' ? 'bg-olive/10 text-olive' :
                              'bg-ink/10 text-ink-muted'
        }`}>
          {band.toUpperCase()}
        </span>
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="text-xs text-ink-muted block mb-1.5">Markup multiplier</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={markup}
              onChange={(e) => onMarkupChange(e.target.value)}
              min="1"
              max="10"
              step="0.1"
              className="w-24 border border-border bg-transparent px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
            />
            <span className="text-sm text-ink-muted">×</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-ink-muted block mb-1.5">Price rounding</label>
          <select
            value={rounding}
            onChange={(e) => onRoundingChange(Number(e.target.value))}
            className="border border-border bg-transparent px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
          >
            {ROUNDING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {markupNum >= 1 && (
        <div className="mt-4 bg-bone-dark px-4 py-3 text-xs leading-relaxed text-ink-muted">
          A piece that costs <strong className="text-ink">{formatDollars(exampleCostDollars * 100)}</strong> wholesale
          sells for{' '}
          <strong className="text-ink">{formatDollars(roundedCents)}</strong>
          {rounding > 0 && rawCents !== roundedCents && (
            <span className="text-ink-muted"> (rounded from {formatDollars(rawCents)})</span>
          )}
          {' '}— earning{' '}
          <strong className="text-ink">{formatDollars(profitCents)}</strong> profit ({margin}% margin).
        </div>
      )}
    </div>
  )
}

export function PricingStrategyClient({ initialTiers, customPricingArtworks }: Props) {
  const [markupSmall,    setMarkupSmall]    = useState(String(initialTiers.markupSmall))
  const [markupMedium,   setMarkupMedium]   = useState(String(initialTiers.markupMedium))
  const [markupLarge,    setMarkupLarge]    = useState(String(initialTiers.markupLarge))
  const [roundingSmall,  setRoundingSmall]  = useState(initialTiers.roundingSmall)
  const [roundingMedium, setRoundingMedium] = useState(initialTiers.roundingMedium)
  const [roundingLarge,  setRoundingLarge]  = useState(initialTiers.roundingLarge)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    const small  = parseFloat(markupSmall)  || 0
    const medium = parseFloat(markupMedium) || 0
    const large  = parseFloat(markupLarge)  || 0
    if (small < 1 || medium < 1 || large < 1) {
      setError('All markups must be at least 1× (at 1× you break even).')
      return
    }
    setError(null)
    setSaved(false)
    startTransition(async () => {
      try {
        await saveSettings({
          markup_small:    small,
          markup_medium:   medium,
          markup_large:    large,
          rounding_small:  roundingSmall,
          rounding_medium: roundingMedium,
          rounding_large:  roundingLarge,
        })
        setSaved(true)
      } catch (e: any) {
        setError(e.message ?? 'Could not save. Please try again.')
      }
    })
  }

  function onChange() {
    setSaved(false)
  }

  return (
    <div className="flex flex-col gap-10">

      {/* Section 1: Three-tier markups */}
      <section>
        <h2 className="caption text-ink tracking-[0.12em] mb-1">TIER MARKUPS</h2>
        <p className="text-sm text-ink-muted mb-6 leading-relaxed max-w-xl">
          Prices are calculated as wholesale cost × markup. Smaller works have a higher markup
          to reflect the fixed framing and handling costs as a larger proportion of the sale price.
          Rounding makes prices look intentional rather than arbitrary.
        </p>

        <div className="flex flex-col gap-3 max-w-2xl">
          <BandInput
            label="Small"
            band="small"
            description="A4, A3 · up to 400 mm square · 300×400 mm"
            markup={markupSmall}
            rounding={roundingSmall}
            exampleCostDollars={25}
            onMarkupChange={(v) => { setMarkupSmall(v); onChange() }}
            onRoundingChange={(v) => { setRoundingSmall(v); onChange() }}
          />
          <BandInput
            label="Medium"
            band="medium"
            description="A2, A1 · 500–700 mm square · 450×600, 600×800 mm"
            markup={markupMedium}
            rounding={roundingMedium}
            exampleCostDollars={80}
            onMarkupChange={(v) => { setMarkupMedium(v); onChange() }}
            onRoundingChange={(v) => { setRoundingMedium(v); onChange() }}
          />
          <BandInput
            label="Large"
            band="large"
            description="A0 · 800–1100 mm square · 760×1000 mm"
            markup={markupLarge}
            rounding={roundingLarge}
            exampleCostDollars={180}
            onMarkupChange={(v) => { setMarkupLarge(v); onChange() }}
            onRoundingChange={(v) => { setRoundingLarge(v); onChange() }}
          />
        </div>

        {error && (
          <p className="text-sm text-terracotta border border-terracotta/30 bg-terracotta/5 px-4 py-3 mt-4 max-w-2xl">
            {error}
          </p>
        )}

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-ink text-bone px-5 py-3 text-sm hover:bg-terracotta transition-colors disabled:opacity-60"
          >
            {isPending && <Loader2 size={12} className="animate-spin" />}
            Save
          </button>
          {saved && <p className="text-xs text-olive">Saved.</p>}
        </div>

        <p className="text-xs text-ink-muted leading-relaxed mt-4 max-w-xl">
          See how these markups flow through every size and material on the{' '}
          <Link href="/admin/settings/pricing/costs" className="text-ink underline underline-offset-2 hover:text-terracotta transition-colors">
            Print Costs
          </Link>{' '}
          page.
        </p>
      </section>

      {/* Section 2: Per-work custom pricing summary */}
      <section className="border-t border-border pt-10">
        <h2 className="caption text-ink tracking-[0.12em] mb-1">CUSTOM PRICING FOR INDIVIDUAL WORKS</h2>
        <p className="text-sm text-ink-muted mb-6 leading-relaxed max-w-xl">
          By default every work uses the tier markups above. You can override pricing per work
          on that work's edit page — either with custom per-band markups, specific price overrides,
          or both.
        </p>

        {customPricingArtworks.length === 0 ? (
          <div className="border border-border px-6 py-8 max-w-xl">
            <p className="text-sm text-ink-muted leading-relaxed">
              No works are using custom pricing yet. Open a work's edit page and turn on{' '}
              <strong>Customise pricing</strong> to set different rates for that work.
            </p>
          </div>
        ) : (
          <div className="border border-border max-w-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs text-ink-muted font-normal tracking-wide">Work</th>
                  <th className="text-left px-5 py-3 text-xs text-ink-muted font-normal tracking-wide">Custom rule</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {customPricingArtworks.map((art) => {
                  let rule = ''
                  if (art.pricing_mode === 'custom_band_markups') {
                    const parts = []
                    if (art.custom_markup_small  != null) parts.push(`S:${art.custom_markup_small}×`)
                    if (art.custom_markup_medium != null) parts.push(`M:${art.custom_markup_medium}×`)
                    if (art.custom_markup_large  != null) parts.push(`L:${art.custom_markup_large}×`)
                    rule = parts.length ? parts.join(' · ') : 'Custom band markups'
                  } else if (art.pricing_mode === 'custom_markup' && art.custom_markup != null) {
                    rule = `${art.custom_markup}× (all bands)`
                  } else {
                    rule = 'Fixed prices'
                  }
                  return (
                    <tr key={art.id} className="border-t border-border first:border-t-0">
                      <td className="px-5 py-3 text-ink">{art.title}</td>
                      <td className="px-5 py-3 text-ink-muted">{rule}</td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/artworks/${art.id}/edit`}
                          className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors"
                        >
                          Edit <ExternalLink size={11} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
