'use client'

import { useState, useTransition } from 'react'
import { Loader2, X } from 'lucide-react'
import { saveArtworkPricing } from '@/app/admin/actions'
import {
  getWholesaleCostDollars,
  calculatePrice,
  formatDollars,
  getSizeBand,
  getSizeOptions,
  SIZE_GROUPS,
  type PricingTiers,
} from '@/lib/pricing/southern-buoy'
import { MATERIAL_LABELS, FRAMING_LABELS } from '@/lib/constants'
import type { Material, Framing, PricingMode } from '@/types'

const MATERIALS: Material[] = ['cotton_rag_smooth', 'cotton_rag_textured', 'canvas_satin', 'canvas_lustre']
const FRAMINGS: Framing[] = [
  'unframed',
  'standard_flooded_gum',
  'standard_american_ash',
  'premium_white',
  'premium_mahogany',
  'premium_walnut',
  'premium_black',
]

// Simplified framing groups for the override table (3 representative framings)
const TABLE_FRAMINGS: Framing[] = ['unframed', 'standard_flooded_gum', 'premium_white']

const BAND_LABEL: Record<string, string> = { small: 'S', medium: 'M', large: 'L' }
const BAND_COLOUR: Record<string, string> = {
  small:  'bg-terracotta/10 text-terracotta',
  medium: 'bg-olive/10 text-olive',
  large:  'bg-ink/10 text-ink-muted',
}

// ─── View pricing modal ───────────────────────────────────────────────────────

function ViewPricingModal({
  tiers,
  onClose,
}: {
  tiers: PricingTiers
  onClose: () => void
}) {
  const [material, setMaterial] = useState<Material>('cotton_rag_smooth')
  const sizes = getSizeOptions(material)
  const isCanvas = material === 'canvas_satin' || material === 'canvas_lustre'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/60 p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-bone border border-border w-full max-w-2xl mt-10 mb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <p className="text-sm font-medium text-ink">Default tier prices — read only</p>
          <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-border">
          <div className="flex flex-wrap gap-2">
            {MATERIALS.map((m) => (
              <button
                key={m}
                onClick={() => setMaterial(m)}
                className={`px-3 py-1.5 text-xs border transition-colors ${
                  material === m ? 'border-ink bg-ink text-bone' : 'border-border text-ink-muted hover:border-ink'
                }`}
              >
                {MATERIAL_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-bone-dark border-b border-border">
                <th className="text-left px-4 py-2.5 text-ink-muted font-normal">Size</th>
                <th className="px-3 py-2.5 text-ink-muted font-normal text-center">Band</th>
                <th className="text-right px-4 py-2.5 text-ink-muted font-normal">Unframed</th>
                <th className="text-right px-4 py-2.5 text-ink-muted font-normal">Standard frame</th>
                <th className="text-right px-4 py-2.5 text-ink-muted font-normal">Premium frame</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((size) => {
                const band = getSizeBand(size.key)
                return (
                  <tr key={size.key} className="border-t border-border">
                    <td className="px-4 py-2 text-ink">{size.label !== size.dims ? `${size.label} (${size.dims})` : size.dims}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`caption text-[10px] px-1.5 py-0.5 ${BAND_COLOUR[band]}`}>
                        {BAND_LABEL[band]}
                      </span>
                    </td>
                    {TABLE_FRAMINGS.map((framing) => {
                      if (isCanvas && size.key === '210x297') return <td key={framing} className="px-4 py-2 text-right text-ink-muted">—</td>
                      const price = calculatePrice(material, size.key, framing, tiers)
                      return (
                        <td key={framing} className="px-4 py-2 text-right text-ink">
                          {price !== null ? formatDollars(price) : '—'}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-ink-muted px-6 py-3 border-t border-border">
          Premium frame column shows White; other premium colours add $25 to the wholesale cost.
        </p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const ALL_SIZES = [
  ...SIZE_GROUPS.standard,
  ...SIZE_GROUPS.square,
  ...SIZE_GROUPS.rectangular,
]

const SIZE_GROUP_LABELS: Record<string, string> = {
  standard: 'A-SERIES',
  square: 'SQUARE',
  rectangular: 'RECTANGULAR',
}

// A size "works well" for an artwork when its long:short ratio is close to the artwork's own —
// orientation-agnostic, since a print can be offered in either orientation.
function isRecommendedSize(size: { w: number; h: number }, aspectRatio: number | null | undefined): boolean {
  if (!aspectRatio) return false
  const artworkRatio = Math.max(aspectRatio, 1 / aspectRatio)
  const sizeRatio = Math.max(size.w, size.h) / Math.min(size.w, size.h)
  return Math.abs(sizeRatio - artworkRatio) / artworkRatio <= 0.1
}

interface Props {
  artworkId: string
  initialPricingMode: PricingMode
  initialFixedPrices: Record<string, number> | null
  initialPriceOverrides: Record<string, number> | null
  initialAllowedSizes?: string[] | null
  aspectRatio?: number | null
  tiers: PricingTiers
}

export function ArtworkPricingSection({
  artworkId,
  initialPricingMode,
  initialFixedPrices,
  initialPriceOverrides,
  initialAllowedSizes,
  aspectRatio,
  tiers,
}: Props) {
  const [useCustomPrices, setUseCustomPrices] = useState(
    (initialPriceOverrides && Object.keys(initialPriceOverrides).length > 0) ||
    (initialFixedPrices   && Object.keys(initialFixedPrices).length > 0) ||
    initialPricingMode !== 'default',
  )

  // Seed from price_overrides (new) or fixed_prices (legacy)
  const [overrides, setOverrides] = useState<Record<string, number>>(
    initialPriceOverrides ?? initialFixedPrices ?? {},
  )

  // Sizes offered — if this artwork has never had a selection saved, start from the
  // aspect-ratio recommendation; otherwise respect exactly what was saved (including "none").
  const [allowedSizes, setAllowedSizes] = useState<string[]>(() => {
    if (initialAllowedSizes == null) {
      return ALL_SIZES.filter((s) => isRecommendedSize(s, aspectRatio)).map((s) => s.key)
    }
    return initialAllowedSizes
  })

  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewOpen, setViewOpen] = useState(false)

  function toggleSize(key: string) {
    setAllowedSizes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    )
    setSaved(false)
  }

  // Only the ticked sizes get a custom-price row
  const sizesToShow = ALL_SIZES.filter((s) => allowedSizes.includes(s.key))

  function commitPrice(key: string, dollars: string) {
    const cents = Math.round(parseFloat(dollars) * 100)
    if (!isNaN(cents) && cents >= 0) {
      setOverrides((prev) => ({ ...prev, [key]: cents }))
      setSaved(false)
    }
  }

  function resetOverride(key: string) {
    setOverrides((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setSaved(false)
  }

  function handleSave() {
    setError(null)
    setSaved(false)
    const priceOverridesData =
      useCustomPrices && Object.keys(overrides).length > 0 ? overrides : null

    startTransition(async () => {
      try {
        await saveArtworkPricing(artworkId, 'default', null, null, null, null, null, priceOverridesData, allowedSizes)
        setSaved(true)
      } catch (e: any) {
        setError(e.message ?? 'Could not save.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-6 pt-4 border-t border-border">

      {/* Sizes offered */}
      <div>
        <h2 className="caption text-ink tracking-[0.12em] mb-1">SIZES OFFERED</h2>
        <p className="text-xs text-ink-muted mb-4 leading-relaxed">
          Every size Southern Buoy prints. Ticked sizes are what customers can buy for this work —
          {aspectRatio ? ' sizes close to its shape are pre-ticked, but tick or untick anything.' : ' upload a web image above to get shape-matched suggestions.'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {(['standard', 'square', 'rectangular'] as const).map((group) => (
            <div key={group}>
              <p className="caption text-ink-muted text-[10px] tracking-[0.12em] mb-2">
                {SIZE_GROUP_LABELS[group]}
              </p>
              <div className="flex flex-col gap-2">
                {SIZE_GROUPS[group].map((size) => {
                  const recommended = isRecommendedSize(size, aspectRatio)
                  return (
                    <label key={size.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowedSizes.includes(size.key)}
                        onChange={() => toggleSize(size.key)}
                        className="accent-ink w-4 h-4 shrink-0"
                      />
                      <span className="text-sm text-ink">{size.dims}</span>
                      {recommended && (
                        <span className="caption text-[9px] text-olive tracking-[0.08em]">SUGGESTED</span>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="text-xs text-ink-muted">
          {useCustomPrices
            ? 'This work uses custom prices.'
            : 'This work uses the default tier pricing.'}
        </p>
        <button
          onClick={() => setViewOpen(true)}
          className="text-xs text-ink-muted hover:text-ink underline underline-offset-2 transition-colors"
        >
          View default prices
        </button>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={useCustomPrices}
          onChange={(e) => { setUseCustomPrices(e.target.checked); setSaved(false) }}
          className="accent-ink w-4 h-4"
        />
        <span className="text-sm text-ink">Set custom prices for this work</span>
      </label>

      {useCustomPrices && sizesToShow.length === 0 && (
        <p className="text-xs text-ink-muted pl-7 border-l-2 border-border py-2">
          Tick at least one size above to set a custom price for it.
        </p>
      )}

      {useCustomPrices && sizesToShow.length > 0 && (
        <div className="flex flex-col gap-7 pl-7 border-l-2 border-border">
          {sizesToShow.map((size) => (
            <div key={size.key}>
              <p className="text-xs font-medium text-ink mb-2">{size.dims}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-border">
                  <thead>
                    <tr className="bg-bone-dark border-b border-border">
                      <th className="text-left px-3 py-2 text-ink-muted font-normal">Material</th>
                      {TABLE_FRAMINGS.map((f) => (
                        <th key={f} className="text-right px-3 py-2 text-ink-muted font-normal whitespace-nowrap">
                          {FRAMING_LABELS[f]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MATERIALS.map((mat) => (
                      <tr key={mat} className="border-t border-border">
                        <td className="px-3 py-2 text-ink whitespace-nowrap">{MATERIAL_LABELS[mat]}</td>
                        {TABLE_FRAMINGS.map((framing) => {
                          const key = `${mat}:${size.key}:${framing}`
                          const wholesale = getWholesaleCostDollars(mat as Material, size.key, framing as Framing)
                          if (wholesale === null) {
                            return <td key={framing} className="px-3 py-2 text-right text-ink-muted">—</td>
                          }
                          const defaultPrice = calculatePrice(mat as Material, size.key, framing as Framing, tiers)!
                          const hasOverride = overrides[key] !== undefined
                          const priceCents = hasOverride ? overrides[key] : defaultPrice
                          const displayVal = (priceCents / 100).toFixed(2)
                          const inputKey = `${key}:${priceCents}`
                          return (
                            <td key={framing} className="px-3 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-ink-muted">$</span>
                                <input
                                  key={inputKey}
                                  type="number"
                                  defaultValue={displayVal}
                                  onBlur={(e) => commitPrice(key, e.target.value)}
                                  min="0"
                                  step="0.01"
                                  className={`w-20 border bg-transparent px-2 py-1 text-xs text-right focus:outline-none focus:border-ink transition-colors ${
                                    hasOverride ? 'border-terracotta text-ink' : 'border-border text-ink-muted'
                                  }`}
                                />
                                {hasOverride && (
                                  <button
                                    onClick={() => resetOverride(key)}
                                    title="Reset to default"
                                    className="text-ink-muted hover:text-terracotta transition-colors"
                                  >
                                    <X size={11} />
                                  </button>
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-ink-muted mt-1.5">
                Highlighted cells have a custom price. Click × to reset to the calculated default.
                Premium frame column shows White; all premium colours share the same upcharge.
              </p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-terracotta border border-terracotta/30 bg-terracotta/5 px-4 py-3">{error}</p>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-ink text-bone px-5 py-3 text-sm hover:bg-terracotta transition-colors disabled:opacity-60"
        >
          {isPending && <Loader2 size={12} className="animate-spin" />}
          Save pricing
        </button>
        {saved && <p className="text-xs text-olive">Saved.</p>}
      </div>

      {viewOpen && (
        <ViewPricingModal tiers={tiers} onClose={() => setViewOpen(false)} />
      )}
    </div>
  )
}
