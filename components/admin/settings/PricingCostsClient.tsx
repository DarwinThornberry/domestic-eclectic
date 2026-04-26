'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import {
  getWholesaleCostDollars,
  calculatePrice,
  getShippingReference,
  formatDollars,
  getSizeBand,
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
  { key: 'unframed',  label: 'Unframed',                       framing: 'unframed' },
  { key: 'standard',  label: 'Standard Frame (Flooded Gum)',   framing: 'standard_flooded_gum' },
  { key: 'premium',   label: 'Premium Frame (+$25 upcharge)',  framing: 'premium_white' },
]

const ALL_SIZES = [
  ...SIZE_GROUPS.standard,
  ...SIZE_GROUPS.square,
  ...SIZE_GROUPS.rectangular,
]

const BAND_LABEL: Record<string, string> = { small: 'S', medium: 'M', large: 'L' }
const BAND_COLOUR: Record<string, string> = {
  small:  'bg-terracotta/10 text-terracotta',
  medium: 'bg-olive/10 text-olive',
  large:  'bg-ink/10 text-ink-muted',
}

interface Props {
  tiers: PricingTiers
}

export function PricingCostsClient({ tiers }: Props) {
  const [material, setMaterial] = useState<MaterialTab>('cotton_rag_smooth')
  const [framingTab, setFramingTab] = useState<FramingTab>('unframed')
  const [shippingOpen, setShippingOpen] = useState(false)

  const isCanvas = material === 'canvas_satin' || material === 'canvas_lustre'
  const currentFraming = FRAMING_OPTIONS.find((f) => f.key === framingTab)!.framing
  const sizes = isCanvas ? ALL_SIZES.filter((s) => s.key !== '210x297') : ALL_SIZES

  const shippingRef = getShippingReference()

  // Determine which markup applies per band for the explainer
  const bandMarkups = [
    { band: 'small',  markup: tiers.markupSmall,  rounding: tiers.roundingSmall  },
    { band: 'medium', markup: tiers.markupMedium, rounding: tiers.roundingMedium },
    { band: 'large',  markup: tiers.markupLarge,  rounding: tiers.roundingLarge  },
  ]

  return (
    <div className="flex flex-col gap-8">

      {/* Explainer */}
      <div className="border border-border bg-bone-dark px-5 py-4 text-sm text-ink-muted leading-relaxed max-w-2xl">
        <p className="mb-3">
          Prices use three size-band markups. Update these in{' '}
          <a href="/admin/settings/pricing/strategy" className="text-ink underline underline-offset-2 hover:text-terracotta transition-colors">
            Pricing Strategy
          </a>.
        </p>
        <div className="flex flex-wrap gap-3">
          {bandMarkups.map(({ band, markup, rounding }) => (
            <span key={band} className="flex items-center gap-1.5">
              <span className={`caption text-[10px] px-1.5 py-0.5 ${BAND_COLOUR[band]}`}>
                {BAND_LABEL[band]}
              </span>
              <span className="text-ink">{markup}×</span>
              {rounding > 0 && (
                <span className="text-ink-muted text-xs">nearest ${rounding}</span>
              )}
            </span>
          ))}
        </div>
      </div>

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

      {/* Cost table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-border">
          <thead>
            <tr className="bg-bone-dark border-b border-border">
              <th className="text-left px-5 py-3 text-xs text-ink-muted font-normal tracking-wide">Size</th>
              <th className="px-3 py-3 text-xs text-ink-muted font-normal tracking-wide text-center">Band</th>
              <th className="text-right px-5 py-3 text-xs text-ink-muted font-normal tracking-wide">Wholesale</th>
              <th className="text-right px-5 py-3 text-xs text-ink-muted font-normal tracking-wide">Customer price</th>
              <th className="text-right px-5 py-3 text-xs text-ink-muted font-normal tracking-wide">Your profit</th>
              <th className="text-right px-5 py-3 text-xs text-ink-muted font-normal tracking-wide">Margin</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((size) => {
              const wholesale = getWholesaleCostDollars(material as Material, size.key, currentFraming as Framing)
              const band = getSizeBand(size.key)
              if (wholesale === null) {
                return (
                  <tr key={size.key} className="border-t border-border">
                    <td className="px-5 py-3 text-ink">{size.label}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`caption text-[10px] px-1.5 py-0.5 ${BAND_COLOUR[band]}`}>
                        {BAND_LABEL[band]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-ink-muted" colSpan={4}>—</td>
                  </tr>
                )
              }

              const customerCents = calculatePrice(material as Material, size.key, currentFraming as Framing, tiers)!
              const wholesaleCents = wholesale * 100
              const profitCents = customerCents - wholesaleCents
              const margin = ((profitCents / customerCents) * 100).toFixed(0)
              const bandMarkup =
                band === 'small'  ? tiers.markupSmall  :
                band === 'medium' ? tiers.markupMedium :
                                    tiers.markupLarge

              return (
                <tr key={size.key} className="border-t border-border hover:bg-bone-dark/40 transition-colors">
                  <td className="px-5 py-3 text-ink">{size.label}</td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`caption text-[10px] px-1.5 py-0.5 ${BAND_COLOUR[band]}`}
                      title={`${bandMarkup}× markup`}
                    >
                      {BAND_LABEL[band]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-ink-muted">{formatDollars(wholesaleCents)}</td>
                  <td className="px-5 py-3 text-right text-ink font-medium">{formatDollars(customerCents)}</td>
                  <td className="px-5 py-3 text-right text-olive">{formatDollars(profitCents)}</td>
                  <td className="px-5 py-3 text-right text-ink-muted">{margin}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Band legend */}
      <div className="flex gap-4 text-xs text-ink-muted">
        {bandMarkups.map(({ band, markup, rounding }) => (
          <span key={band} className="flex items-center gap-1.5">
            <span className={`caption text-[10px] px-1.5 py-0.5 ${BAND_COLOUR[band]}`}>
              {BAND_LABEL[band]}
            </span>
            {band.charAt(0).toUpperCase() + band.slice(1)} — {markup}×
            {rounding > 0 ? `, rounded to nearest $${rounding}` : ''}
          </span>
        ))}
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
              Southern Buoy's published shipping rates (AUD). Rolled = unframed print in a tube.
              Framed = packaged artwork. International framed rates are estimated — confirm with
              Southern Buoy for exact quotes.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-ink-muted font-normal">Size</th>
                    <th className="text-right py-2 px-3 text-ink-muted font-normal">AU Rolled</th>
                    <th className="text-right py-2 px-3 text-ink-muted font-normal">AU Framed</th>
                    <th className="text-right py-2 px-3 text-ink-muted font-normal">NZ Rolled</th>
                    <th className="text-right py-2 px-3 text-ink-muted font-normal">NZ Framed</th>
                    <th className="text-right py-2 px-3 text-ink-muted font-normal">World Rolled</th>
                    <th className="text-right py-2 pl-3 text-ink-muted font-normal">World Framed</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingRef.map((row) => (
                    <tr key={row.size} className="border-t border-border">
                      <td className="py-2 pr-4 text-ink">{row.label}</td>
                      <td className="py-2 px-3 text-right text-ink-muted">{formatDollars(row.rolled.AU)}</td>
                      <td className="py-2 px-3 text-right text-ink-muted">{formatDollars(row.framed.AU)}</td>
                      <td className="py-2 px-3 text-right text-ink-muted">{formatDollars(row.rolled.NZ)}</td>
                      <td className="py-2 px-3 text-right text-ink-muted">{formatDollars(row.framed.NZ)}</td>
                      <td className="py-2 px-3 text-right text-ink-muted">{formatDollars(row.rolled.WORLD)}</td>
                      <td className="py-2 pl-3 text-right text-ink-muted">{formatDollars(row.framed.WORLD)}</td>
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
