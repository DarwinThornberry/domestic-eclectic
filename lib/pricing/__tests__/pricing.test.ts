import { describe, it, expect } from 'vitest'
import {
  calculatePrice,
  getWholesaleCostDollars,
  getSizeBand,
  DEFAULT_TIERS,
  type PricingTiers,
  type ArtworkPricingOverrides,
} from '../southern-buoy'

// ─── getSizeBand ──────────────────────────────────────────────────────────────

describe('getSizeBand', () => {
  it('assigns small sizes correctly', () => {
    expect(getSizeBand('210x297')).toBe('small')
    expect(getSizeBand('297x420')).toBe('small')
    expect(getSizeBand('300x300')).toBe('small')
    expect(getSizeBand('400x400')).toBe('small')
    expect(getSizeBand('300x400')).toBe('small')
  })
  it('assigns medium sizes correctly', () => {
    expect(getSizeBand('420x594')).toBe('medium')
    expect(getSizeBand('594x841')).toBe('medium')
    expect(getSizeBand('500x500')).toBe('medium')
    expect(getSizeBand('600x600')).toBe('medium')
    expect(getSizeBand('700x700')).toBe('medium')
    expect(getSizeBand('450x600')).toBe('medium')
    expect(getSizeBand('600x800')).toBe('medium')
  })
  it('assigns large sizes correctly', () => {
    expect(getSizeBand('841x1189')).toBe('large')
    expect(getSizeBand('800x800')).toBe('large')
    expect(getSizeBand('1000x1000')).toBe('large')
    expect(getSizeBand('760x1000')).toBe('large')
  })
  it('defaults unknown sizes to large', () => {
    expect(getSizeBand('9999x9999')).toBe('large')
  })
})

// ─── getWholesaleCostDollars ──────────────────────────────────────────────────

describe('getWholesaleCostDollars', () => {
  it('returns null for unavailable combos (A4 canvas)', () => {
    expect(getWholesaleCostDollars('canvas_satin', '210x297', 'unframed')).toBeNull()
  })
  it('returns cost for cotton rag unframed', () => {
    expect(getWholesaleCostDollars('cotton_rag_smooth', '210x297', 'unframed')).toBe(13)
  })
  it('returns same cost for cotton_rag_smooth and cotton_rag_textured', () => {
    const smooth = getWholesaleCostDollars('cotton_rag_smooth', '594x841', 'unframed')
    const textured = getWholesaleCostDollars('cotton_rag_textured', '594x841', 'unframed')
    expect(smooth).toBe(textured)
  })
  it('adds premium frame upcharge of $25', () => {
    const standard = getWholesaleCostDollars('cotton_rag_smooth', '300x300', 'standard_flooded_gum')
    const premium  = getWholesaleCostDollars('cotton_rag_smooth', '300x300', 'premium_white')
    expect(premium).toBe(standard! + 25)
  })
})

// ─── calculatePrice — step 5: global tier markup + rounding ──────────────────

describe('calculatePrice — global tiers (default)', () => {
  it('applies small band markup to A4', () => {
    // A4 cotton_rag_smooth unframed wholesale = $13
    // small markup = 3.5 → raw = 13 × 3.5 × 100 = 4550
    // rounding_small = 5 → nearest $5 = $45 = 4500 cents
    const price = calculatePrice('cotton_rag_smooth', '210x297', 'unframed', DEFAULT_TIERS)
    expect(price).toBe(4500)
  })

  it('applies medium band markup to A2', () => {
    // A2 cotton_rag_smooth unframed wholesale = $40
    // medium markup = 2.8 → raw = 40 × 2.8 × 100 = 11200
    // rounding_medium = 5 → nearest $5 = $110 = 11000 cents
    const price = calculatePrice('cotton_rag_smooth', '420x594', 'unframed', DEFAULT_TIERS)
    expect(price).toBe(11000)
  })

  it('applies large band markup to A0', () => {
    // A0 cotton_rag_smooth unframed wholesale = $142
    // large markup = 2.2 → raw = 142 × 2.2 × 100 = 31240
    // rounding_large = 10 → nearest $10 = $310 = 31000 cents
    const price = calculatePrice('cotton_rag_smooth', '841x1189', 'unframed', DEFAULT_TIERS)
    expect(price).toBe(31000)
  })

  it('returns null for unavailable combo', () => {
    expect(calculatePrice('canvas_satin', '210x297', 'unframed', DEFAULT_TIERS)).toBeNull()
  })
})

// ─── calculatePrice — step 1: priceOverrides ─────────────────────────────────

describe('calculatePrice — priceOverrides (step 1)', () => {
  it('returns the exact override, ignoring markup', () => {
    const overrides: ArtworkPricingOverrides = {
      pricingMode: 'default',
      priceOverrides: { 'cotton_rag_smooth:210x297:unframed': 9900 },
    }
    const price = calculatePrice('cotton_rag_smooth', '210x297', 'unframed', DEFAULT_TIERS, overrides)
    expect(price).toBe(9900)
  })

  it('falls through to tiers when override key is absent', () => {
    const overrides: ArtworkPricingOverrides = {
      pricingMode: 'default',
      priceOverrides: { 'cotton_rag_smooth:297x420:unframed': 5000 },
    }
    // A4 is not in the overrides, should use default tier
    const price = calculatePrice('cotton_rag_smooth', '210x297', 'unframed', DEFAULT_TIERS, overrides)
    expect(price).toBe(4500)
  })
})

// ─── calculatePrice — step 2: fixedPrices (legacy) ───────────────────────────

describe('calculatePrice — fixedPrices legacy (step 2)', () => {
  it('returns legacy fixed price', () => {
    const overrides: ArtworkPricingOverrides = {
      pricingMode: 'fixed_prices',
      fixedPrices: { 'cotton_rag_smooth:210x297:unframed': 8800 },
    }
    const price = calculatePrice('cotton_rag_smooth', '210x297', 'unframed', DEFAULT_TIERS, overrides)
    expect(price).toBe(8800)
  })

  it('priceOverrides beats fixedPrices when both present', () => {
    const overrides: ArtworkPricingOverrides = {
      pricingMode: 'fixed_prices',
      fixedPrices:    { 'cotton_rag_smooth:210x297:unframed': 8800 },
      priceOverrides: { 'cotton_rag_smooth:210x297:unframed': 7700 },
    }
    const price = calculatePrice('cotton_rag_smooth', '210x297', 'unframed', DEFAULT_TIERS, overrides)
    expect(price).toBe(7700)
  })
})

// ─── calculatePrice — step 3: custom_band_markups ────────────────────────────

describe('calculatePrice — custom_band_markups (step 3)', () => {
  it('applies custom small band markup', () => {
    // A4 wholesale = $13, custom markup = 4.0, rounding = 5
    // raw = 13 × 4.0 × 100 = 5200 → nearest $5 = $50 = 5000
    const overrides: ArtworkPricingOverrides = {
      pricingMode: 'custom_band_markups',
      customMarkupSmall: 4.0,
    }
    const price = calculatePrice('cotton_rag_smooth', '210x297', 'unframed', DEFAULT_TIERS, overrides)
    expect(price).toBe(5000)
  })

  it('falls through to global tier when band markup not set', () => {
    // medium band markup not set → should fall through to step 5 (global tiers)
    const overrides: ArtworkPricingOverrides = {
      pricingMode: 'custom_band_markups',
      customMarkupSmall: 4.0,
      // customMarkupMedium intentionally absent
    }
    // A2 = medium band → uses global medium markup (2.8), rounding 5
    // wholesale = $40 → 40 × 2.8 × 100 = 11200 → nearest $5 = $110 = 11000
    const price = calculatePrice('cotton_rag_smooth', '420x594', 'unframed', DEFAULT_TIERS, overrides)
    expect(price).toBe(11000)
  })

  it('priceOverrides beats custom_band_markups', () => {
    const overrides: ArtworkPricingOverrides = {
      pricingMode: 'custom_band_markups',
      customMarkupSmall: 4.0,
      priceOverrides: { 'cotton_rag_smooth:210x297:unframed': 4200 },
    }
    const price = calculatePrice('cotton_rag_smooth', '210x297', 'unframed', DEFAULT_TIERS, overrides)
    expect(price).toBe(4200)
  })
})

// ─── calculatePrice — step 4: legacy custom_markup ───────────────────────────

describe('calculatePrice — legacy custom_markup (step 4)', () => {
  it('applies single custom markup with no rounding', () => {
    // A4 wholesale = $13, custom markup = 3.0
    // raw = 13 × 3.0 × 100 = 3900, no rounding applied
    const overrides: ArtworkPricingOverrides = {
      pricingMode: 'custom_markup',
      customMarkup: 3.0,
    }
    const price = calculatePrice('cotton_rag_smooth', '210x297', 'unframed', DEFAULT_TIERS, overrides)
    expect(price).toBe(3900)
  })
})

// ─── rounding edge cases ──────────────────────────────────────────────────────

describe('rounding', () => {
  it('rounds up when halfway', () => {
    // Test with a custom tier: markup such that result is exactly halfway between $5 steps
    const tiers: PricingTiers = { ...DEFAULT_TIERS, markupSmall: 1.0, roundingSmall: 5 }
    // A4 wholesale = $13, markup = 1.0 → raw = 1300 cents = $13.00
    // nearest $5 = $15 = 1500 cents
    const price = calculatePrice('cotton_rag_smooth', '210x297', 'unframed', tiers)
    expect(price).toBe(1500)
  })

  it('roundingSmall = 0 means no rounding', () => {
    const tiers: PricingTiers = { ...DEFAULT_TIERS, markupSmall: 3.5, roundingSmall: 0 }
    // A4 wholesale = $13, markup = 3.5 → raw = 4550 cents (no rounding)
    const price = calculatePrice('cotton_rag_smooth', '210x297', 'unframed', tiers)
    expect(price).toBe(4550)
  })
})
