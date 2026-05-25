'use client'

import { useState, useTransition } from 'react'
import { Loader2, X, ChevronDown, ChevronRight } from 'lucide-react'
import { saveGlobalPriceOverrides } from '@/app/admin/actions'
import {
  getWholesaleCostDollars,
  calculatePrice,
  getShippingReference,
  formatDollars,
  SIZE_GROUPS,
  type PricingTiers,
} from '@/lib/pricing/southern-buoy'
import type { Material, Framing } from '@/types'

type MaterialTab = 'cotton_rag_smooth' | 'cotton_rag_textured' | 'canvas_satin' | 'canvas_lustre'
type FramingTab = 'unframed' | 'standard' | 'premium'

const MATERIAL_OPTIONS: { key: MaterialTab; label: string }[] = [
  { key: 'cotton_rag_smooth',   label: 'Cotton Rag Smooth' },
  { key: 'cotton_rag_textured', label: 'Cotton Rag Textured' },
  { key: 'canvas_satin',        label: 'Canvas Satin' },
  { key: 'canvas_lustre',       label: 'Canvas Lustre' },
]

const FRAMING_OPTIONS: { key: FramingTab; label: string; framing: Framing }[] = [
  { key: 'unframed',  label: 'Unframed',                      framing: 'unframed' },
  { key: 'standard',  label: 'Standard Frame (Flooded Gum)',  framing: 'standard_flooded_gum' },
  { key: 'premium',   label: 'Premium Frame (+$25 upcharge)', framing: 'premium_white' },
]

const ALL_SIZES = [
  ...SIZE_GROUPS.standard,
  ...SIZE_GROUPS.square,
  ...SIZE_GROUPS.rectangular,
]

interface Props {
  tiers: PricingTiers
  activeSizes?: string[]
  initialGlobalOverrides?: Record<string, number>
}

export function PricingCostsClient({ tiers, activeSizes = [], initialGlobalOverrides = {} }: Props) {
  const [material, setMaterial] = useState<MaterialTab>('cotton_rag_smooth')
  const [framingTab, setFramingTab] = useState<FramingTab>('unframed')
  const [shippingOpen, setShippingOpen] = useState(false)
  const [overrides, setOverrides] = useState<Record<string, number>>(initialGlobalOverrides)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCanvas = material === 'canvas_satin' || material === 'canvas_lustre'
  const currentFraming = FRAMING_OPTIONS.find((f) => f.key === framingTab)!.framing
  const sizes = isCanvas ? ALL_SIZES.filter((s) => s.key !== '210x297') : ALL_SIZES
  const shippingRef = getShippingReference()

  function commitPrice(key: string, dollars: string) {
    const cents = Math.round(parseFloat(dollars) * 100)
    if (!isNaN(cents) && cents >= 0) {
      setOverrides((prev) => ({ ...prev, [key]: cents }))
      setSaved(false)
    }
  }

  function commitMarkup(key: string, pct: string, wholesaleDollars: number) {
    const pctVal = parseFloat(pct)
    if (!isNaN(pctVal)) {
      const cents = Math.round(wholesaleDollars * (1 + pctVal / 100) * 100)
      if (cents >= 0) {
        setOverrides((prev) => ({ ...prev, [key]: cents }))
        setSaved(false)
      }
    }
  }

  function resetPrice(key: string) {
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
    startTransition(async () => {
      try {
        await saveGlobalPriceOverrides(overrides)
        setSaved(true)
      } catch (e: any) {
        setError(e.message ?? 'Could not save.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Material selector */}
      <div>
        <p className="text-xs text-ink-muted mb-3">Material</p>
        <div className="flex flex-wrap gap-2">
          {MATERIAL_OPTIONS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMaterial(m.key)}
              className={`px-4 py-2 text-sm border transition-colors ${
                material === m.key
                  ? 'border-ink bg-ink text-bone'
                  : 'border-border text-ink-muted hover:border-ink hover:text-ink'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Framing tabs */}
      <div>
        <p className="text-xs text-ink-muted mb-3">Framing</p>
        <div className="flex gap-0 border border-border w-fit">
          {FRAMING_OPTIONS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFramingTab(f.key)}
              className={`px-4 py-2.5 text-sm transition-colors border-r last:border-r-0 border-border ${
                framingTab === f.key
                  ? 'bg-ink text-bone'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price table */}
      <div>
        {activeSizes.length > 0 && (
          <p className="text-xs text-ink-muted mb-3">
            <span className="font-medium text-ink">{activeSizes.length}</span> sizes currently offered across your artworks — remaining rows are in the pricing engine but not shown to customers.
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border">
            <thead>
              <tr className="bg-bone-dark border-b border-border">
                <th className="text-left px-5 py-3 text-xs text-ink-muted font-normal tracking-wide">Size</th>
                <th className="text-right px-5 py-3 text-xs text-ink-muted font-normal tracking-wide">Wholesale</th>
                <th className="text-right px-4 py-3 text-xs text-ink-muted font-normal tracking-wide">Price ($)</th>
                <th className="text-right px-4 py-3 text-xs text-ink-muted font-normal tracking-wide">Markup (%)</th>
                <th className="text-right px-5 py-3 text-xs text-ink-muted font-normal tracking-wide">Profit</th>
                <th className="text-right px-5 py-3 text-xs text-ink-muted font-normal tracking-wide">Margin</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((size) => {
                const wholesale = getWholesaleCostDollars(material as Material, size.key, currentFraming as Framing)
                const isActive = activeSizes.length === 0 || activeSizes.includes(size.key)

                if (wholesale === null) {
                  return (
                    <tr key={size.key} className={`border-t border-border ${!isActive ? 'opacity-40' : ''}`}>
                      <td className="px-5 py-3 text-ink">{size.label}</td>
                      <td className="px-5 py-3 text-center text-ink-muted" colSpan={5}>—</td>
                    </tr>
                  )
                }

                const key = `${material}:${size.key}:${currentFraming}`
                const hasOverride = overrides[key] !== undefined
                const enginePrice = calculatePrice(material as Material, size.key, currentFraming as Framing, tiers)!
                const priceCents = hasOverride ? overrides[key] : enginePrice
                const wholesaleCents = Math.round(wholesale * 100)
                const profitCents = priceCents - wholesaleCents
                const margin = priceCents > 0 ? ((profitCents / priceCents) * 100).toFixed(0) : '0'
                const markupPct = wholesaleCents > 0 ? ((priceCents / wholesaleCents - 1) * 100).toFixed(1) : '0'
                const dollarDisplay = (priceCents / 100).toFixed(2)

                // inputKey changes only when the committed price changes, forcing defaultValue remount
                // so that editing one field updates the other after blur
                const inputKey = `${key}:${priceCents}`

                const inputClass = `border bg-transparent px-2 py-1 text-xs text-right focus:outline-none focus:border-ink transition-colors ${
                  hasOverride ? 'border-terracotta text-ink' : 'border-border text-ink-muted'
                }`

                return (
                  <tr
                    key={size.key}
                    className={`border-t border-border transition-colors ${
                      isActive ? 'hover:bg-bone-dark/40' : 'opacity-40'
                    }`}
                  >
                    <td className="px-5 py-3 text-ink">
                      <span className="flex items-center gap-2">
                        {size.label}
                        {!isActive && (
                          <span className="caption text-[9px] px-1.5 py-0.5 border border-border text-ink-muted">
                            not offered
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-ink-muted">{formatDollars(wholesaleCents)}</td>

                    {/* Dollar input */}
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-ink-muted text-xs">$</span>
                        <input
                          key={`d:${inputKey}`}
                          type="number"
                          defaultValue={dollarDisplay}
                          onBlur={(e) => commitPrice(key, e.target.value)}
                          min="0"
                          step="1"
                          className={`w-20 ${inputClass}`}
                        />
                        {hasOverride && (
                          <button
                            onClick={() => resetPrice(key)}
                            title="Reset to engine default"
                            className="text-ink-muted hover:text-terracotta transition-colors"
                          >
                            <X size={11} />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Markup % input */}
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <input
                          key={`m:${inputKey}`}
                          type="number"
                          defaultValue={markupPct}
                          onBlur={(e) => commitMarkup(key, e.target.value, wholesale)}
                          min="0"
                          step="1"
                          className={`w-16 ${inputClass}`}
                        />
                        <span className="text-xs text-ink-muted ml-0.5">%</span>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-right text-olive">{formatDollars(profitCents)}</td>
                    <td className="px-5 py-3 text-right text-ink-muted">{margin}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-ink-muted mt-2">
          Terracotta cells have a custom global price set. Click × to revert to the engine default. Changes apply across all artworks that don't have a per-artwork override.
        </p>
      </div>

      {/* Save */}
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
          Save prices
        </button>
        {saved && <p className="text-xs text-olive">Saved.</p>}
      </div>

      {/* International shipping reference */}
      <div className="border border-border max-w-2xl">
        <button
          onClick={() => setShippingOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm text-ink hover:bg-bone-dark transition-colors"
        >
          <span className="caption tracking-[0.12em] text-xs">INTERNATIONAL SHIPPING REFERENCE</span>
          {shippingOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {shippingOpen && (
          <div className="border-t border-border px-5 py-4">
            <p className="text-xs text-ink-muted mb-4 leading-relaxed">
              Southern Buoy's published shipping rates (AUD) — 2026 info pack. Rolled = unframed
              print in a tube. International framed prints are available on request only; contact
              Southern Buoy for a quote.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-ink-muted font-normal">Size</th>
                    <th className="text-right py-2 px-3 text-ink-muted font-normal">AU Rolled</th>
                    <th className="text-right py-2 px-3 text-ink-muted font-normal">AU Framed</th>
                    <th className="text-right py-2 px-3 text-ink-muted font-normal">Int'l Rolled</th>
                    <th className="text-right py-2 pl-3 text-ink-muted font-normal">Int'l Framed</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingRef.map((row) => (
                    <tr key={row.size} className="border-t border-border">
                      <td className="py-2 pr-4 text-ink">{row.label}</td>
                      <td className="py-2 px-3 text-right text-ink-muted">{formatDollars(row.rolled.AU)}</td>
                      <td className="py-2 px-3 text-right text-ink-muted">{formatDollars(row.framed.AU)}</td>
                      <td className="py-2 px-3 text-right text-ink-muted">{formatDollars(row.rolled.INTL)}</td>
                      <td className="py-2 pl-3 text-right text-ink-muted">
                        {row.framed.INTL !== null ? formatDollars(row.framed.INTL) : <span className="italic">On request</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
