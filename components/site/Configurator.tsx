'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Minus, Plus, ChevronDown, Check } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import {
  calculatePriceForArtwork,
  formatPrice,
  SIZE_GROUPS,
  getSizeOptions,
  type PricingTiers,
} from '@/lib/pricing/southern-buoy'
import type { ArtworkData } from '@/lib/data/artworks'
import type { Material, Framing } from '@/types'

// ─── Frame data ────────────────────────────────────────────────────────────────

const STANDARD_COLOURS = [
  { key: 'standard_flooded_gum',  label: 'Flooded Gum',      hex: '#8B6355' },
  { key: 'standard_american_ash', label: 'American Ash',     hex: '#C8B89A' },
]

const PREMIUM_COLOURS = [
  { key: 'premium_white',    label: 'White',             hex: '#F0ECE8' },
  { key: 'premium_mahogany', label: 'Native Mahogany',   hex: '#5C3825' },
  { key: 'premium_walnut',   label: 'Walnut',            hex: '#4A3728' },
  { key: 'premium_black',    label: 'Black',             hex: '#1A1814' },
]

const MATERIALS: { key: Material; name: string; subtitle: string; description: string }[] = [
  {
    key: 'cotton_rag_smooth',
    name: 'Cotton Rag Smooth',
    subtitle: 'Hot Pressed',
    description: '100% cotton, hot-pressed. A natural matte surface with no optical brighteners.',
  },
  {
    key: 'cotton_rag_textured',
    name: 'Cotton Rag Textured',
    subtitle: 'Cold Pressed',
    description: '100% cotton, cold-pressed. Subtle texture, ideal for fine-art reproduction.',
  },
  {
    key: 'canvas_satin',
    name: 'Canvas Satin',
    subtitle: 'Heavyweight',
    description: 'Heavyweight poly-cotton. Subtle texture, low-sheen satin finish.',
  },
  {
    key: 'canvas_lustre',
    name: 'Canvas Lustre',
    subtitle: 'Premium',
    description: 'Premium semi-gloss canvas. Deep colour, vibrant blacks, water-resistant.',
  },
]

// ─── Size indicator — tiny proportional rectangle ─────────────────────────────

function SizeBox({ w, h, selected }: { w: number; h: number; selected: boolean }) {
  const maxPx = 22
  const scale = maxPx / Math.max(w, h)
  return (
    <div
      className={`border shrink-0 transition-colors ${selected ? 'border-ink' : 'border-border-dark'}`}
      style={{
        width: `${Math.max(8, Math.round(w * scale))}px`,
        height: `${Math.max(8, Math.round(h * scale))}px`,
      }}
    />
  )
}

// ─── Step heading ─────────────────────────────────────────────────────────────

function StepHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="caption text-ink tracking-[0.14em] mb-4">{children}</p>
  )
}

// ─── Main configurator ────────────────────────────────────────────────────────

interface Props {
  artwork: ArtworkData
  tiers: PricingTiers
}

type FramingCategory = 'unframed' | 'standard' | 'premium'

interface Config {
  material: Material | null
  size: string | null
  framingCategory: FramingCategory | null
  frameColour: string | null
  quantity: number
}

export function Configurator({ artwork, tiers }: Props) {
  const { addItem } = useCart()

  const [config, setConfig] = useState<Config>({
    material: null,
    size: null,
    framingCategory: null,
    frameColour: null,
    quantity: 1,
  })

  const [sizeOpen, setSizeOpen] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const sizeDropdownRef = useRef<HTMLDivElement>(null)

  // Close size dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(e.target as Node)) {
        setSizeOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Derived framing value ───────────────────────────────────────────────────
  const framing = useMemo((): Framing | null => {
    if (!config.framingCategory) return null
    if (config.framingCategory === 'unframed') return 'unframed'
    // Standard or premium: need a colour selected
    const colour = config.frameColour
    if (!colour) return null
    return colour as Framing
  }, [config.framingCategory, config.frameColour])

  // ── Live price ──────────────────────────────────────────────────────────────
  const price = useMemo(() => {
    if (!config.material || !config.size || !framing) return null
    return calculatePriceForArtwork(
      artwork.pricingMode ?? 'default',
      artwork.customMarkup ?? null,
      artwork.fixedPrices ?? null,
      config.material,
      config.size,
      framing,
      tiers,
      artwork.customMarkupSmall  ?? null,
      artwork.customMarkupMedium ?? null,
      artwork.customMarkupLarge  ?? null,
      artwork.priceOverrides ?? null,
    )
  }, [config.material, config.size, framing, tiers, artwork.pricingMode, artwork.customMarkup, artwork.fixedPrices, artwork.customMarkupSmall, artwork.customMarkupMedium, artwork.customMarkupLarge, artwork.priceOverrides])

  // ── Validation ─────────────────────────────────────────────────────────────
  const isReady = config.material !== null && config.size !== null && framing !== null

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleMaterialChange(material: Material) {
    setConfig((prev) => {
      // Canvas doesn't have A4 — clear size if it was A4
      const isCanvas = material === 'canvas_satin' || material === 'canvas_lustre'
      const sizeInvalid = isCanvas && prev.size === '210x297'
      return { ...prev, material, size: sizeInvalid ? null : prev.size }
    })
  }

  function handleFramingCategory(cat: FramingCategory) {
    setConfig((prev) => ({
      ...prev,
      framingCategory: cat,
      // Reset colour when switching framing type
      frameColour: cat === 'unframed' ? null : prev.frameColour,
    }))
  }

  function handleAddToCart() {
    if (!isReady || !price || !config.material || !config.size || !framing) return

    addItem({
      artwork_id: artwork.id ?? artwork.slug,
      artwork_slug: artwork.slug,
      artwork_title: artwork.title,
      artwork_thumbnail: artwork.thumbnailImage,
      material: config.material,
      size: config.size,
      framing,
      quantity: config.quantity,
      unit_price_aud: price,
      line_total_aud: price * config.quantity,
    })

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 3500)
  }

  const sizeOptions = config.material ? getSizeOptions(config.material) : []

  const selectedSizeLabel = config.size
    ? sizeOptions.find((s) => s.key === config.size)?.dims ?? config.size
    : null

  return (
    <div className="flex flex-col gap-8">

      {/* Artwork title + original dims */}
      <div className="pb-6 border-b border-border">
        <h1 className="font-display text-2xl md:text-3xl italic text-ink leading-tight mb-1">
          {artwork.title}
        </h1>
        <p className="caption text-ink-muted tracking-[0.1em]">
          Original: {artwork.originalDims} · {artwork.year}
        </p>
      </div>

      {/* ── Step 1: Material ─────────────────────────────────────────────── */}
      <div className="border-b border-border pb-8">
        <StepHeading>1 · MATERIAL</StepHeading>
        <div className="grid grid-cols-2 gap-2">
          {MATERIALS.map((m) => {
            const selected = config.material === m.key
            return (
              <button
                key={m.key}
                onClick={() => handleMaterialChange(m.key)}
                className={`text-left p-4 border transition-all ${
                  selected
                    ? 'border-ink bg-ink/[0.07]'
                    : 'border-border hover:border-ink-muted'
                }`}
              >
                <p className={`font-display italic text-base leading-tight mb-0.5 ${selected ? 'text-ink' : 'text-ink-muted'}`}>
                  {m.name}
                </p>
                <p className="caption text-ink-muted text-[11px] mb-2">{m.subtitle}</p>
                <p className="text-xs text-ink-muted leading-snug">{m.description}</p>
                {selected && (
                  <div className="mt-2 flex justify-end">
                    <Check size={13} className="text-terracotta" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Step 2: Size ─────────────────────────────────────────────────── */}
      <div className="border-b border-border pb-8">
        <StepHeading>2 · SIZE</StepHeading>

        {/* Custom grouped dropdown */}
        <div className="relative" ref={sizeDropdownRef}>
          <button
            onClick={() => {
              if (config.material) setSizeOpen((v) => !v)
            }}
            disabled={!config.material}
            className={`w-full flex items-center justify-between border px-4 py-3 text-sm transition-colors ${
              config.material
                ? 'border-ink/[0.35] bg-ink/[0.08] hover:border-ink/60 cursor-pointer'
                : 'border-ink/[0.25] bg-ink/[0.04] opacity-40 cursor-not-allowed'
            }`}
          >
            <span className={selectedSizeLabel ? 'text-ink' : 'text-ink-muted'}>
              {selectedSizeLabel ?? (config.material ? 'Select a size' : 'Select a material first')}
            </span>
            <ChevronDown
              size={15}
              className={`shrink-0 text-ink-muted transition-transform ${sizeOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {sizeOpen && (
            <div className="absolute top-full left-0 right-0 z-30 bg-bone-dark border border-ink/[0.35] border-t-0 max-h-72 overflow-y-auto shadow-lg">
              {(['standard', 'square', 'rectangular'] as const).map((group) => {
                const isCanvas = config.material === 'canvas_satin' || config.material === 'canvas_lustre'
                const opts = SIZE_GROUPS[group].filter((s) => {
                  if (isCanvas && s.key === '210x297') return false
                  if (artwork.allowedSizes?.length && !artwork.allowedSizes.includes(s.key)) return false
                  return true
                })
                if (!opts.length) return null
                return (
                  <div key={group}>
                    <p className="caption text-ink px-4 py-2 bg-bone text-[10px] tracking-[0.12em]">
                      {group === 'standard' ? 'A-SERIES' : group === 'square' ? 'SQUARE' : 'RECTANGULAR'}
                    </p>
                    {opts.map((size) => {
                      const selected = config.size === size.key
                      return (
                        <button
                          key={size.key}
                          onClick={() => {
                            setConfig((p) => ({ ...p, size: size.key }))
                            setSizeOpen(false)
                          }}
                          className={`w-full flex items-center gap-4 px-4 py-2.5 text-sm text-left transition-colors hover:bg-bone-dark ${
                            selected ? 'text-ink' : 'text-ink-muted'
                          }`}
                        >
                          <SizeBox w={size.w} h={size.h} selected={selected} />
                          <span className="flex-1">
                            {size.label !== size.dims ? (
                              <>
                                <span className="font-medium">{size.label}</span>
                                <span className="text-ink-muted ml-2 text-xs">{size.dims}</span>
                              </>
                            ) : (
                              size.dims
                            )}
                          </span>
                          {selected && <Check size={12} className="text-terracotta shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <p className="text-xs text-ink-muted leading-relaxed mt-3">
          All sizes are offered in the same proportions as the original artwork — your print is never cropped or distorted.
        </p>
      </div>

      {/* ── Step 3: Framing ──────────────────────────────────────────────── */}
      <div className="border-b border-border pb-8">
        <StepHeading>3 · FRAMING</StepHeading>

        {/* Framing type cards */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {(
            [
              { cat: 'unframed' as const, label: 'Unframed', sub: 'Rolled in tube' },
              { cat: 'standard' as const, label: 'Standard', sub: 'Flooded Gum or American Ash' },
              { cat: 'premium' as const, label: 'Premium', sub: 'Stained finish' },
            ] as const
          ).map(({ cat, label, sub }) => {
            const selected = config.framingCategory === cat
            return (
              <button
                key={cat}
                onClick={() => handleFramingCategory(cat)}
                className={`text-left p-3 border transition-all ${
                  selected ? 'border-ink bg-ink/[0.03]' : 'border-border hover:border-ink-muted'
                }`}
              >
                <p className={`text-sm font-medium leading-tight ${selected ? 'text-ink' : 'text-ink-muted'}`}>
                  {label}
                </p>
                <p className="text-[11px] text-ink-muted mt-0.5 leading-snug">{sub}</p>
              </button>
            )
          })}
        </div>

        {/* Colour sub-selector */}
        {config.framingCategory === 'standard' && (
          <div>
            <p className="text-xs text-ink-muted mb-3">Frame colour</p>
            <div className="flex flex-wrap gap-2">
              {STANDARD_COLOURS.map(({ key: swatchKey, ...rest }) => (
                <ColourSwatch
                  key={swatchKey}
                  {...rest}
                  selected={config.frameColour === swatchKey}
                  onClick={() => setConfig((p) => ({ ...p, frameColour: swatchKey }))}
                />
              ))}
            </div>
          </div>
        )}

        {config.framingCategory === 'premium' && (
          <div>
            <p className="text-xs text-ink-muted mb-3">Frame colour (premium finish)</p>
            <div className="flex flex-wrap gap-2">
              {PREMIUM_COLOURS.map(({ key: swatchKey, ...rest }) => (
                <ColourSwatch
                  key={swatchKey}
                  {...rest}
                  selected={config.frameColour === swatchKey}
                  onClick={() => setConfig((p) => ({ ...p, frameColour: swatchKey }))}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Step 4: Quantity + price + add to cart ────────────────────────── */}
      <div>
        {/* Quantity */}
        <div className="flex items-center gap-4 mb-6">
          <p className="caption text-ink-muted">QTY</p>
          <div className="flex items-center border border-border">
            <button
              onClick={() => setConfig((p) => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
              className="w-9 h-9 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={13} />
            </button>
            <span className="w-9 text-center text-sm text-ink">{config.quantity}</span>
            <button
              onClick={() => setConfig((p) => ({ ...p, quantity: p.quantity + 1 }))}
              className="w-9 h-9 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* Live price */}
        <div className="mb-6">
          {price !== null ? (
            <>
              <p className="font-display text-4xl italic text-ink">
                {formatPrice(price * config.quantity)}
              </p>
              <p className="text-xs text-ink-muted mt-1">
                incl. printing & framing · shipping calculated at checkout
              </p>
            </>
          ) : (
            <p className="font-display text-4xl italic text-ink-muted/40">—</p>
          )}
        </div>

        {/* Add to cart */}
        {addedToCart ? (
          <div className="w-full py-4 bg-olive text-bone text-center text-sm flex items-center justify-center gap-2">
            <Check size={14} />
            Added to cart —{' '}
            <Link href="/cart" className="underline underline-offset-2">
              View cart
            </Link>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={!isReady}
            className={`w-full py-4 text-sm transition-colors ${
              isReady
                ? 'bg-ink text-bone hover:bg-terracotta cursor-pointer'
                : 'bg-ink/20 text-ink-muted cursor-not-allowed'
            }`}
          >
            {isReady ? 'Add to Cart' : 'Select material, size & framing'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Frame colour swatch ──────────────────────────────────────────────────────

function ColourSwatch({
  label,
  hex,
  selected,
  onClick,
}: {
  label: string
  hex: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 group"
      title={label}
    >
      <div
        className={`w-8 h-8 border-2 transition-all ${
          selected ? 'border-ink scale-110' : 'border-transparent group-hover:border-ink-muted'
        }`}
        style={{ backgroundColor: hex }}
      />
      <p className={`text-[10px] leading-none ${selected ? 'text-ink' : 'text-ink-muted'}`}>
        {label.split(' ').pop()}
      </p>
    </button>
  )
}
