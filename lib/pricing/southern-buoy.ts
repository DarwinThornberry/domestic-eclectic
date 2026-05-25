/**
 * Pricing — Single source of truth for all Southern Buoy cost tables.
 *
 * Customer price = Southern Buoy wholesale cost × markup (+ optional rounding)
 *
 * Three size bands (Small / Medium / Large) each have their own markup multiplier
 * and rounding increment. Per-artwork overrides take priority over the global tiers.
 *
 * All money values returned in AUD cents (integers).
 * Display only: divide by 100 and format as "$X AUD".
 */

import type { Framing, Material } from '@/types'

// Keep for backward compat — used as the ultimate fallback
export const MARKUP_MULTIPLIER = 2.2

// ─── Size bands ───────────────────────────────────────────────────────────────

export type SizeBand = 'small' | 'medium' | 'large'

/**
 * Maps every available size string to its tier.
 * Small = up to ~A3 / 400 mm square
 * Medium = A2–A1 range / 500–700 mm square
 * Large = A0 and above / 800 mm+ square
 */
export const SIZE_BAND_MAP: Record<string, SizeBand> = {
  '210x297': 'small',
  '297x420': 'small',
  '300x300': 'small',
  '400x400': 'small',
  '300x400': 'small',
  '420x594': 'medium',
  '594x841': 'medium',
  '500x500': 'medium',
  '600x600': 'medium',
  '700x700': 'medium',
  '450x600': 'medium',
  '600x800': 'medium',
  '841x1189': 'large',
  '800x800':  'large',
  '900x900':  'large',
  '1000x1000':'large',
  '1100x1100':'large',
  '760x1000': 'large',
}

export function getSizeBand(size: string): SizeBand {
  return SIZE_BAND_MAP[size] ?? 'large'
}

// ─── Global tier config ───────────────────────────────────────────────────────

export interface PricingTiers {
  markupSmall:    number  // e.g. 3.5
  markupMedium:   number  // e.g. 2.8
  markupLarge:    number  // e.g. 2.2
  roundingSmall:  number  // nearest $N, e.g. 5 = round to nearest $5
  roundingMedium: number
  roundingLarge:  number
}

export const DEFAULT_TIERS: PricingTiers = {
  markupSmall:    3.5,
  markupMedium:   2.8,
  markupLarge:    2.2,
  roundingSmall:  5,
  roundingMedium: 5,
  roundingLarge:  10,
}

// ─── Per-artwork overrides ────────────────────────────────────────────────────

export interface ArtworkPricingOverrides {
  /** 'default' | 'custom_markup' (legacy) | 'fixed_prices' (legacy) | 'custom_band_markups' */
  pricingMode: string
  /** Legacy: single custom markup (applies to all bands) */
  customMarkup?: number | null
  /** New: per-band custom markups */
  customMarkupSmall?:  number | null
  customMarkupMedium?: number | null
  customMarkupLarge?:  number | null
  /** Legacy: per-combo fixed prices (checked before band markups) */
  fixedPrices?: Record<string, number> | null
  /** New: per-combo price overrides — checked before any markup calculation */
  priceOverrides?: Record<string, number> | null
}

// ─── Southern Buoy cost tables (AUD dollars, before markup) ───────────────────

/** Cotton Rag (both smooth and textured share the same cost) — print only */
const COTTON_RAG_PRINT: Record<string, number> = {
  '210x297': 13,
  '297x420': 23,
  '420x594': 40,
  '594x841': 75,
  '841x1189': 142,
  '300x300': 27,
  '400x400': 36,
  '500x500': 45,
  '600x600': 54,
  '700x700': 84,
  '800x800': 96,
  '900x900': 108,
  '1000x1000': 160,
  '1100x1100': 176,
  '300x400': 27,
  '450x600': 41,
  '600x800': 72,
  '760x1000': 122,
}

/** Cotton Rag — print + standard frame (Flooded Gum or American Ash) */
const COTTON_RAG_STANDARD_FRAME: Record<string, number> = {
  '210x297': 70,
  '297x420': 108,
  '420x594': 173,
  '594x841': 290,
  '841x1189': 495,
  '300x300': 97,
  '400x400': 136,
  '500x500': 178,
  '600x600': 224,
  '700x700': 294,
  '800x800': 349,
  '900x900': 408,
  '1000x1000': 510,
  '1100x1100': 580,
  '300x400': 111,
  '450x600': 181,
  '600x800': 280,
  '760x1000': 410,
}

/** Canvas (satin and lustre share the same cost) — print only */
const CANVAS_PRINT: Record<string, number> = {
  // A4 not available for canvas
  '297x420': 35,
  '420x594': 77,
  '594x841': 136,
  '841x1189': 228,
  '300x300': 44,
  '400x400': 55,
  '500x500': 66,
  '600x600': 102,
  '700x700': 116,
  '800x800': 131,
  '900x900': 175,
  '1000x1000': 193,
  '1100x1100': 330,
  '300x400': 44,
  '450x600': 80,
  '600x800': 102,
  '760x1000': 151,
}

/** Canvas — print + standard frame */
const CANVAS_STANDARD_FRAME: Record<string, number> = {
  // A4 not available for canvas
  '297x420': 157,
  '420x594': 249,
  '594x841': 380,
  '841x1189': 573,
  '300x300': 146,
  '400x400': 191,
  '500x500': 236,
  '600x600': 306,
  '700x700': 354,
  '800x800': 403,
  '900x900': 481,
  '1000x1000': 533,
  '1100x1100': 704,
  '300x400': 163,
  '450x600': 258,
  '600x800': 340,
  '760x1000': 450,
}

/** Premium frame upcharge (added pre-markup for stained colours) */
const PREMIUM_FRAME_UPCHARGE = 25

// ─── Internal helpers ─────────────────────────────────────────────────────────

function framingFlags(framing: Framing) {
  const isPremium =
    framing === 'premium_white' ||
    framing === 'premium_mahogany' ||
    framing === 'premium_walnut' ||
    framing === 'premium_black'
  const isStandard =
    framing === 'standard_flooded_gum' || framing === 'standard_american_ash'
  return { isPremium, isStandard, isFramed: isPremium || isStandard }
}

function applyRounding(priceCents: number, roundingDollars: number): number {
  if (!roundingDollars) return priceCents
  const step = roundingDollars * 100
  return Math.round(priceCents / step) * step
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the Southern Buoy wholesale cost in AUD dollars (before markup),
 * or null if the combination is not available (e.g. A4 canvas).
 */
export function getWholesaleCostDollars(
  material: Material,
  size: string,
  framing: Framing,
): number | null {
  const isCanvas = material === 'canvas_satin' || material === 'canvas_lustre'
  const { isPremium, isFramed } = framingFlags(framing)

  let cost: number | undefined

  if (isCanvas) {
    cost = isFramed ? CANVAS_STANDARD_FRAME[size] : CANVAS_PRINT[size]
  } else {
    cost = isFramed ? COTTON_RAG_STANDARD_FRAME[size] : COTTON_RAG_PRINT[size]
  }

  if (cost === undefined) return null
  return isPremium ? cost + PREMIUM_FRAME_UPCHARGE : cost
}

/**
 * Returns the customer-facing price in AUD cents.
 *
 * Priority order:
 * 1. artworkOverrides.priceOverrides[combo] — per-artwork exact price
 * 2. artworkOverrides.fixedPrices[combo]    — per-artwork exact price (legacy)
 * 3. globalPriceOverrides[combo]            — global default from Settings > Costs
 * 4. custom_band_markups mode               — per-artwork band markup
 * 5. custom_markup mode (legacy)            — per-artwork single markup
 * 6. Global tier markup for the size band + rounding (engine fallback)
 * 7. Wholesale combination unavailable → null
 */
export function calculatePrice(
  material: Material,
  size: string,
  framing: Framing,
  tiers: PricingTiers = DEFAULT_TIERS,
  artworkOverrides?: ArtworkPricingOverrides,
  globalPriceOverrides?: Record<string, number> | null,
): number | null {
  // Step 7: check availability
  const cost = getWholesaleCostDollars(material, size, framing)
  if (cost === null) return null

  const comboKey = `${material}:${size}:${framing}`
  const band = getSizeBand(size)

  // Step 1: per-artwork exact price override
  if (artworkOverrides?.priceOverrides?.[comboKey] !== undefined) {
    return artworkOverrides.priceOverrides[comboKey]
  }

  // Step 2: per-artwork fixed price (legacy)
  if (artworkOverrides?.fixedPrices?.[comboKey] !== undefined) {
    return artworkOverrides.fixedPrices[comboKey]
  }

  // Step 3: global default from Settings > Costs
  if (globalPriceOverrides?.[comboKey] !== undefined) {
    return globalPriceOverrides[comboKey]
  }

  // Step 4: per-band custom markup on this artwork
  if (artworkOverrides?.pricingMode === 'custom_band_markups') {
    const bandMarkup =
      band === 'small'  ? artworkOverrides.customMarkupSmall  :
      band === 'medium' ? artworkOverrides.customMarkupMedium :
                          artworkOverrides.customMarkupLarge
    if (bandMarkup != null) {
      const tieredRounding =
        band === 'small'  ? tiers.roundingSmall  :
        band === 'medium' ? tiers.roundingMedium :
                            tiers.roundingLarge
      return applyRounding(Math.round(cost * bandMarkup * 100), tieredRounding)
    }
  }

  // Step 5: legacy single custom markup (no per-band rounding for backward compat)
  if (artworkOverrides?.pricingMode === 'custom_markup' && artworkOverrides.customMarkup != null) {
    return Math.round(cost * artworkOverrides.customMarkup * 100)
  }

  // Step 6: global tier markup for the size band + rounding (engine fallback)
  const tierMarkup =
    band === 'small'  ? tiers.markupSmall  :
    band === 'medium' ? tiers.markupMedium :
                        tiers.markupLarge
  const tieredRounding =
    band === 'small'  ? tiers.roundingSmall  :
    band === 'medium' ? tiers.roundingMedium :
                        tiers.roundingLarge

  return applyRounding(Math.round(cost * tierMarkup * 100), tieredRounding)
}

/**
 * Convenience wrapper used by site components that still hold per-artwork
 * pricing fields from the database row.
 */
export function calculatePriceForArtwork(
  pricingMode: string,
  customMarkup: number | null,
  fixedPrices: Record<string, number> | null,
  material: Material,
  size: string,
  framing: Framing,
  tiers: PricingTiers | number = DEFAULT_TIERS,
  artworkCustomMarkupSmall?: number | null,
  artworkCustomMarkupMedium?: number | null,
  artworkCustomMarkupLarge?: number | null,
  priceOverrides?: Record<string, number> | null,
  globalPriceOverrides?: Record<string, number> | null,
): number | null {
  // Accept legacy number (markup multiplier) for backward compat
  const resolvedTiers: PricingTiers =
    typeof tiers === 'number'
      ? { ...DEFAULT_TIERS, markupSmall: tiers, markupMedium: tiers, markupLarge: tiers }
      : tiers

  return calculatePrice(material, size, framing, resolvedTiers, {
    pricingMode,
    customMarkup,
    fixedPrices,
    customMarkupSmall:  artworkCustomMarkupSmall,
    customMarkupMedium: artworkCustomMarkupMedium,
    customMarkupLarge:  artworkCustomMarkupLarge,
    priceOverrides,
  }, globalPriceOverrides)
}

// ─── Shipping ─────────────────────────────────────────────────────────────────

function longestEdge(size: string): number {
  const parts = size.split('x').map(Number)
  return Math.max(...parts)
}

function tubeLengthMm(size: string): number {
  return Math.max(...size.split('x').map(Number)) + 50
}

type Country = 'AU' | 'INTL'

function getCountryZone(countryCode: string): Country {
  if (countryCode === 'AU') return 'AU'
  return 'INTL'
}

interface CartItemForShipping {
  size: string
  framing: string
  quantity: number
}

export function calculateShipping(
  items: CartItemForShipping[],
  countryCode: string,
): number | null {
  const zone = getCountryZone(countryCode)
  let maxShippingCents = 0

  for (const item of items) {
    const isFramed = item.framing !== 'unframed'
    const longest = longestEdge(item.size)
    if (isFramed) {
      const rate = framedRate(zone, longest)
      if (rate === null) return null
      maxShippingCents = Math.max(maxShippingCents, Math.round(rate * 100))
    } else {
      maxShippingCents = Math.max(maxShippingCents, Math.round(rolledRate(zone, tubeLengthMm(item.size)) * 100))
    }
  }

  return maxShippingCents
}

export function rolledRate(zone: Country, tubeMm: number): number {
  const tubeCm = tubeMm / 10

  if (zone === 'AU') {
    if (tubeCm <= 90) return 11.95
    if (tubeCm <= 120) return 28.70
    return 45.90
  }

  // International — single tier (2026 info pack)
  if (tubeCm <= 45) return 72.00
  if (tubeCm <= 70) return 114.95
  if (tubeCm <= 100) return 130.00
  if (tubeCm <= 120) return 173.00
  return 246.00
}

export function framedRate(zone: Country, longestEdgeMm: number): number | null {
  const cm = longestEdgeMm / 10

  if (zone === 'AU') {
    if (cm <= 90) return 45.90
    if (cm <= 120) return 103.45
    if (cm <= 150) return 137.95
    if (cm <= 190) return 237.95
    return 340.34
  }

  // International framed: available on request (2026 info pack)
  return null
}

// ─── Shipping reference data (for admin cost table) ───────────────────────────

export interface ShippingReferenceRow {
  label: string
  size: string
  rolled: { AU: number; INTL: number }              // cents
  framed: { AU: number; INTL: number | null }       // cents; null = available on request
}

export function getShippingReference(): ShippingReferenceRow[] {
  const sizes: Array<{ label: string; size: string }> = [
    { label: 'A4',       size: '210x297'   },
    { label: 'A3',       size: '297x420'   },
    { label: 'A2',       size: '420x594'   },
    { label: 'A1',       size: '594x841'   },
    { label: 'A0',       size: '841x1189'  },
    { label: '300×300',  size: '300x300'   },
    { label: '600×600',  size: '600x600'   },
    { label: '1000×1000',size: '1000x1000' },
    { label: '600×800',  size: '600x800'   },
    { label: '760×1000', size: '760x1000'  },
  ]

  return sizes.map(({ label, size }) => {
    const tube    = Math.max(...size.split('x').map(Number)) + 50
    const longest = Math.max(...size.split('x').map(Number))
    const framedIntl = framedRate('INTL', longest)
    return {
      label,
      size,
      rolled: {
        AU:   Math.round(rolledRate('AU',   tube) * 100),
        INTL: Math.round(rolledRate('INTL', tube) * 100),
      },
      framed: {
        AU:   Math.round(framedRate('AU', longest)! * 100),
        INTL: framedIntl !== null ? Math.round(framedIntl * 100) : null,
      },
    }
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatPrice(cents: number): string {
  const dollars = cents / 100
  return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)} AUD`
}

export function formatDollars(cents: number): string {
  const dollars = cents / 100
  return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`
}

export function availableSizes(material: Material): string[] {
  const isCanvas = material === 'canvas_satin' || material === 'canvas_lustre'
  const base = Object.keys(COTTON_RAG_PRINT)
  if (!isCanvas) return base
  return Object.keys(CANVAS_PRINT)
}

// ─── Size groups (for configurator UI) ───────────────────────────────────────

export interface SizeOption {
  key: string
  label: string
  dims: string
  w: number
  h: number
}

export const SIZE_GROUPS: { standard: SizeOption[]; square: SizeOption[]; rectangular: SizeOption[] } = {
  standard: [
    { key: '210x297',  label: 'A4', dims: '210 × 297 mm',   w: 210,  h: 297  },
    { key: '297x420',  label: 'A3', dims: '297 × 420 mm',   w: 297,  h: 420  },
    { key: '420x594',  label: 'A2', dims: '420 × 594 mm',   w: 420,  h: 594  },
    { key: '594x841',  label: 'A1', dims: '594 × 841 mm',   w: 594,  h: 841  },
    { key: '841x1189', label: 'A0', dims: '841 × 1189 mm',  w: 841,  h: 1189 },
  ],
  square: [
    { key: '300x300',   label: '300 × 300 mm',   dims: '300 × 300 mm',   w: 300,  h: 300  },
    { key: '400x400',   label: '400 × 400 mm',   dims: '400 × 400 mm',   w: 400,  h: 400  },
    { key: '500x500',   label: '500 × 500 mm',   dims: '500 × 500 mm',   w: 500,  h: 500  },
    { key: '600x600',   label: '600 × 600 mm',   dims: '600 × 600 mm',   w: 600,  h: 600  },
    { key: '700x700',   label: '700 × 700 mm',   dims: '700 × 700 mm',   w: 700,  h: 700  },
    { key: '800x800',   label: '800 × 800 mm',   dims: '800 × 800 mm',   w: 800,  h: 800  },
    { key: '900x900',   label: '900 × 900 mm',   dims: '900 × 900 mm',   w: 900,  h: 900  },
    { key: '1000x1000', label: '1000 × 1000 mm', dims: '1000 × 1000 mm', w: 1000, h: 1000 },
    { key: '1100x1100', label: '1100 × 1100 mm', dims: '1100 × 1100 mm', w: 1100, h: 1100 },
  ],
  rectangular: [
    { key: '300x400',  label: '300 × 400 mm',  dims: '300 × 400 mm',  w: 300, h: 400  },
    { key: '450x600',  label: '450 × 600 mm',  dims: '450 × 600 mm',  w: 450, h: 600  },
    { key: '600x800',  label: '600 × 800 mm',  dims: '600 × 800 mm',  w: 600, h: 800  },
    { key: '760x1000', label: '760 × 1000 mm', dims: '760 × 1000 mm', w: 760, h: 1000 },
  ],
}

export function getSizeOptions(material: Material): SizeOption[] {
  const isCanvas = material === 'canvas_satin' || material === 'canvas_lustre'
  const all = [
    ...SIZE_GROUPS.standard,
    ...SIZE_GROUPS.square,
    ...SIZE_GROUPS.rectangular,
  ]
  return isCanvas ? all.filter((s) => s.key !== '210x297') : all
}
