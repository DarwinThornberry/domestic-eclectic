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

interface Props {
  artworkId: string
  initialPricingMode: PricingMode
  initialCustomMarkup: number | null
  initialCustomMarkupSmall: number | null
  initialCustomMarkupMedium: number | null
  initialCustomMarkupLarge: number | null
  initialFixedPrices: Record<string, number> | null
  initialPriceOverrides: Record<string, number> | null
  tiers: PricingTiers
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

export function ArtworkPricingSection({
  artworkId,
  initialPricingMode,
  initialCustomMarkup,
  initialCustomMarkupSmall,
  initialCustomMarkupMedium,
  initialCustomMarkupLarge,
  initialFixedPrices,
  initialPriceOverrides,
  tiers,
}: Props) {
  // Option A vs B — whether to use custom band markups
  const [useCustomMarkups, setUseCustomMarkups] = useState(
    initialPricingMode === 'custom_band_markups' || initialPricingMode === 'custom_markup',
  )
  // Option C — whether to have per-combo price overrides
  const [useOverrides, setUseOverrides] = useState(
    (initialPriceOverrides && Object.keys(initialPriceOverrides).length > 0) ||
    (initialFixedPrices   && Object.keys(initialFixedPrices).length > 0) ||
    initialPricingMode === 'fixed_prices',
  )

  const [markupSmall,  setMarkupSmall]  = useState(String(initialCustomMarkupSmall  ?? initialCustomMarkup ?? tiers.markupSmall))
  const [markupMedium, setMarkupMedium] = useState(String(initialCustomMarkupMedium ?? initialCustomMarkup ?? tiers.markupMedium))
  const [markupLarge,  setMarkupLarge]  = useState(String(initialCustomMarkupLarge  ?? initialCustomMarkup ?? tiers.markupLarge))

  // Seed overrides from either price_overrides (new) or fixed_prices (legacy)
  const [overrides, setOverrides] = useState<Record<string, number>>(
    initialPriceOverrides ?? initialFixedPrices ?? {},
  )

  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewOpen, setViewOpen] = useState(false)

  const isCustomised = useCustomMarkups || useOverrides

  function setOverridePrice(key: string, dollars: string) {
    const cents = Math.round(parseFloat(dollars) * 100)
    setOverrides((prev) => ({ ...prev, [key]: isNaN(cents) ? 0 : cents }))
    setSaved(false)
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

    let pricingMode: PricingMode = 'default'
    let customMarkupSmall: number | null = null
    let customMarkupMedium: number | null = null
    let customMarkupLarge: number | null = null
    let priceOverridesData: Record<string, number> | null = null

    if (useCustomMarkups) {
      pricingMode = 'custom_band_markups'
      customMarkupSmall  = parseFloat(markupSmall)  || null
      customMarkupMedium = parseFloat(markupMedium) || null
      customMarkupLarge  = parseFloat(markupLarge)  || null
    }

    if (useOverrides && Object.keys(overrides).length > 0) {
      priceOverridesData = overrides
    }

    startTransition(async () => {
      try {
        await saveArtworkPricing(
          artworkId,
          pricingMode,
          null,
          null,
          customMarkupSmall,
          customMarkupMedium,
          customMarkupLarge,
          priceOverridesData,
        )
        setSaved(true)
      } catch (e: any) {
        setError(e.message ?? 'Could not save.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-6 pt-4 border-t border-border">

      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-muted">
          {isCustomised
            ? 'This work uses custom pricing.'
            : 'This work uses the default tier markups.'}
        </p>
        <button
          onClick={() => setViewOpen(true)}
          className="text-xs text-ink-muted hover:text-ink underline underline-offset-2 transition-colors"
        >
          View default prices
        </button>
      </div>

      {/* Toggle customisation on/off */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isCustomised}
          onChange={(e) => {
            if (!e.target.checked) {
              setUseCustomMarkups(false)
              setUseOverrides(false)
            } else {
              setUseCustomMarkups(true)
            }
            setSaved(false)
          }}
          className="accent-ink w-4 h-4"
        />
        <span className="text-sm text-ink">Customise pricing for this work</span>
      </label>

      {isCustomised && (
        <div className="flex flex-col gap-6 pl-7 border-l-2 border-border">

          {/* Option B: custom band markups */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={useCustomMarkups}
                onChange={(e) => { setUseCustomMarkups(e.target.checked); setSaved(false) }}
                className="accent-ink w-4 h-4"
              />
              <div>
                <span className="text-sm text-ink">Custom markups per size band</span>
                <p className="text-xs text-ink-muted mt-0.5">
                  Override the global markup for Small, Medium, and/or Large sizes.
                </p>
              </div>
            </label>

            {useCustomMarkups && (
              <div className="grid grid-cols-3 gap-3 mt-2">
                {(
                  [
                    { key: 'small',  label: 'Small',  val: markupSmall,  set: setMarkupSmall,  globalVal: tiers.markupSmall  },
                    { key: 'medium', label: 'Medium', val: markupMedium, set: setMarkupMedium, globalVal: tiers.markupMedium },
                    { key: 'large',  label: 'Large',  val: markupLarge,  set: setMarkupLarge,  globalVal: tiers.markupLarge  },
                  ] as const
                ).map(({ key, label, val, set, globalVal }) => (
                  <div key={key}>
                    <label className="text-xs text-ink-muted block mb-1">
                      {label}{' '}
                      <span className={`caption text-[9px] px-1 py-0.5 ml-0.5 ${BAND_COLOUR[key]}`}>
                        {BAND_LABEL[key]}
                      </span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => { set(e.target.value); setSaved(false) }}
                        placeholder={String(globalVal)}
                        min="1"
                        step="0.1"
                        className="w-full border border-border bg-transparent px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
                      />
                      <span className="text-xs text-ink-muted shrink-0">×</span>
                    </div>
                    <p className="text-[11px] text-ink-muted mt-1">Default: {globalVal}×</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Option C: price overrides */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={useOverrides}
                onChange={(e) => { setUseOverrides(e.target.checked); setSaved(false) }}
                className="accent-ink w-4 h-4"
              />
              <div>
                <span className="text-sm text-ink">Override specific prices</span>
                <p className="text-xs text-ink-muted mt-0.5">
                  Set exact dollar amounts for individual size/material/framing combinations.
                  These take priority over any markup.
                </p>
              </div>
            </label>

            {useOverrides && (
              <div className="overflow-x-auto mt-2">
                {MATERIALS.map((mat) => {
                  const sizes = getSizeOptions(mat)
                  return (
                    <details key={mat} className="border border-border mb-2">
                      <summary className="px-4 py-2.5 text-xs text-ink-muted cursor-pointer hover:bg-bone-dark transition-colors select-none">
                        {MATERIAL_LABELS[mat]}
                      </summary>
                      <table className="w-full text-xs border-t border-border">
                        <thead>
                          <tr className="bg-bone-dark">
                            <th className="text-left px-3 py-2 text-ink-muted font-normal">Size</th>
                            <th className="px-2 py-2 text-ink-muted font-normal text-center">Band</th>
                            {TABLE_FRAMINGS.map((f) => (
                              <th key={f} className="text-right px-3 py-2 text-ink-muted font-normal whitespace-nowrap">
                                {FRAMING_LABELS[f]}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sizes.map((size) => {
                            const band = getSizeBand(size.key)
                            return (
                              <tr key={size.key} className="border-t border-border">
                                <td className="px-3 py-2 text-ink whitespace-nowrap">{size.label}</td>
                                <td className="px-2 py-2 text-center">
                                  <span className={`caption text-[9px] px-1 py-0.5 ${BAND_COLOUR[band]}`}>
                                    {BAND_LABEL[band]}
                                  </span>
                                </td>
                                {TABLE_FRAMINGS.map((framing) => {
                                  const key = `${mat}:${size.key}:${framing}`
                                  const wholesale = getWholesaleCostDollars(mat as Material, size.key, framing as Framing)
                                  if (wholesale === null) {
                                    return <td key={framing} className="px-3 py-2 text-right text-ink-muted">—</td>
                                  }
                                  const defaultPrice = calculatePrice(mat as Material, size.key, framing as Framing, tiers)!
                                  const hasOverride = overrides[key] !== undefined
                                  const displayVal = hasOverride
                                    ? (overrides[key] / 100).toFixed(2)
                                    : (defaultPrice / 100).toFixed(2)
                                  return (
                                    <td key={framing} className="px-3 py-2 text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        <span className="text-ink-muted">$</span>
                                        <input
                                          type="number"
                                          value={displayVal}
                                          onChange={(e) => { setOverridePrice(key, e.target.value) }}
                                          min="0"
                                          step="1"
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
                            )
                          })}
                        </tbody>
                      </table>
                      <p className="text-xs text-ink-muted px-4 py-2 border-t border-border">
                        Overridden prices are highlighted. Click × to reset a cell to the calculated default.
                        Premium frame column shows White; all premium colours share the same wholesale upcharge.
                      </p>
                    </details>
                  )
                })}
              </div>
            )}
          </div>
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
