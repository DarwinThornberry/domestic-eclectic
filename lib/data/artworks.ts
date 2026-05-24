/**
 * Artwork data — single source of truth for Phase 1–3.
 * In Phase 4 this is replaced by Supabase queries; the shape stays the same.
 *
 * All copy marked [PLACEHOLDER] should be reviewed and updated by Lara
 * before the site goes live. Search for "[PLACEHOLDER]" to find everything.
 */

export interface ArtworkData {
  /** DB UUID — populated when loaded from Supabase; undefined for static fallback data */
  id?: string
  slug: string
  title: string
  year: number
  /** [PLACEHOLDER] — Lara to supply final one-line taglines */
  tagline: string
  /** [PLACEHOLDER] — Lara to supply final artwork descriptions */
  description: string
  /** Dimensions of the original work */
  originalDims: string
  /** Web-optimised image in /public/artworks/web/ */
  heroImage: string
  /** Thumbnail for grid views — same file, Next.js resizes via sizes prop */
  thumbnailImage: string
  /** Additional detail images in /public/artworks/web/ */
  galleryImages: string[]
  /** width ÷ height — used to pre-size containers and avoid layout shift */
  aspectRatio: number
  /** Dominant hue — shown as placeholder background while image loads */
  blurColor: string
  /** Whether prints are available to order */
  isAvailable: boolean
  /** Per-artwork pricing overrides — undefined means use global tiers */
  pricingMode?: 'default' | 'custom_markup' | 'fixed_prices' | 'custom_band_markups'
  customMarkup?: number | null
  fixedPrices?: Record<string, number> | null
  customMarkupSmall?:  number | null
  customMarkupMedium?: number | null
  customMarkupLarge?:  number | null
  priceOverrides?: Record<string, number> | null
  /** When set, only these size codes are shown in the configurator size picker */
  allowedSizes?: string[] | null
}

// ─── Artwork catalogue ────────────────────────────────────────────────────────

export const ARTWORKS: ArtworkData[] = [
  {
    slug: 'flora-bewildered',
    title: 'Flora, Bewildered',
    year: 2024,
    tagline: 'The garden as portrait, the portrait as garden.', // [PLACEHOLDER]
    description:
      'A Botticelli Venus transformed — the classical figure disappears into a cascade of pink florals and hovering butterflies. The portrait becomes indistinguishable from the garden it inhabits, each element borrowing beauty from the other.', // [PLACEHOLDER]
    originalDims: '900 × 1200 mm',
    heroImage: '/artworks/web/flora-bewildered.png',
    thumbnailImage: '/artworks/web/flora-bewildered.png',
    galleryImages: [],
    aspectRatio: 1844 / 1376, // 1.34 — landscape (actual screenshot dimensions)
    blurColor: '#E8D4C8',
    isAvailable: true,
  },
  {
    slug: 'frida-and-the-pomegranate',
    title: 'Frida & The Pomegranate',
    year: 2024,
    tagline: 'Devotional fragments arranged into bloom.', // [PLACEHOLDER]
    description:
      'Frida Kahlo at the centre of a vivid altar — surrounded by tropical fruits, bold reds, and the accumulated imagery of a life lived in full colour. Part devotional, part still life, entirely her own.', // [PLACEHOLDER]
    originalDims: '900 × 1200 mm',
    heroImage: '/artworks/web/frida-and-the-pomegranate.png',
    thumbnailImage: '/artworks/web/frida-and-the-pomegranate.png',
    galleryImages: [],
    aspectRatio: 2022 / 1384, // 1.46 — landscape
    blurColor: '#C4553A',
    isAvailable: true,
  },
  {
    slug: 'quietude-in-lemon',
    title: 'Quietude in Lemon',
    year: 2024,
    tagline: 'A study of stillness, citrus, and the slow afternoon.', // [PLACEHOLDER]
    description:
      'A Delft blue vase, a lemon, a butterfly at rest. The composition holds the quality of a long afternoon — Dutch interior light refracted through Lara\'s layering process into something utterly still.', // [PLACEHOLDER]
    originalDims: '760 × 1000 mm',
    heroImage: '/artworks/web/quietude-in-lemon.png',
    thumbnailImage: '/artworks/web/quietude-in-lemon.png',
    galleryImages: [],
    aspectRatio: 2072 / 1374, // 1.51 — landscape
    blurColor: '#D4B94A',
    isAvailable: true,
  },
  {
    slug: 'cabinet-of-wonders',
    title: 'Cabinet of Wonders',
    year: 2024,
    tagline: 'Tattoos, marigolds, and the company we keep.', // [PLACEHOLDER]
    description:
      'A tattooed figure presides over a cabinet of gathered wonders — cascading marigolds, a blue bird, pendulous grapes. The body as collector; the collection as self-portrait.', // [PLACEHOLDER]
    originalDims: '800 × 800 mm',
    heroImage: '/artworks/web/cabinet-of-wonders.png',
    thumbnailImage: '/artworks/web/cabinet-of-wonders.png',
    galleryImages: [],
    aspectRatio: 2082 / 1376, // 1.51 — landscape
    blurColor: '#9B7B3A',
    isAvailable: true,
  },
  {
    slug: 'the-crimson-sitter',
    title: 'The Crimson Sitter',
    year: 2025,
    tagline: 'An eclectic court, observed.', // [PLACEHOLDER]
    description:
      'A Renaissance noblewoman sits within an improvised court of leopard print, scattered butterflies, and rich red drapery. The historical and the domestic collide with the absurd dignity they both deserve.', // [PLACEHOLDER]
    originalDims: '600 × 800 mm',
    heroImage: '/artworks/web/the-crimson-sitter.png',
    thumbnailImage: '/artworks/web/the-crimson-sitter.png',
    galleryImages: [],
    aspectRatio: 2076 / 1370, // 1.52 — landscape
    blurColor: '#C45050',
    isAvailable: true,
  },
  {
    slug: 'devotionals',
    title: 'Devotionals',
    year: 2025,
    tagline: 'Small altars to small things.', // [PLACEHOLDER]
    description:
      'Frida Kahlo\'s self-portrait meets a Byzantine Madonna icon in an arrangement of mushrooms, flowers, and tender curiosities. A secular altar to the things that matter quietly.', // [PLACEHOLDER]
    originalDims: '600 × 800 mm',
    heroImage: '/artworks/web/devotionals.png',
    thumbnailImage: '/artworks/web/devotionals.png',
    galleryImages: [],
    aspectRatio: 1842 / 1378, // 1.34 — landscape
    blurColor: '#7A4A3A',
    isAvailable: true,
  },
  {
    slug: 'statuary',
    title: 'Statuary',
    year: 2025,
    tagline: 'The body as museum, the museum as body.', // [PLACEHOLDER]
    description:
      'A profile portrait flanked by a classical white statue and an anatomical figure. Three representations of the body in dialogue — the living, the carved, and the diagrammatic — each observing the others.', // [PLACEHOLDER]
    originalDims: '760 × 1000 mm',
    heroImage: '/artworks/web/statuary.png',
    thumbnailImage: '/artworks/web/statuary.png',
    galleryImages: [],
    aspectRatio: 2066 / 1374, // 1.50 — landscape
    blurColor: '#D4CBC0',
    isAvailable: true,
  },
]

export function getArtwork(slug: string): ArtworkData | undefined {
  return ARTWORKS.find((a) => a.slug === slug)
}

export const FEATURED_ARTWORK = ARTWORKS[0] // Flora, Bewildered

export const SELECTED_WORKS_SLUGS = [
  'frida-and-the-pomegranate',
  'quietude-in-lemon',
  'the-crimson-sitter',
  'statuary',
]

export function getSelectedWorks(): ArtworkData[] {
  return SELECTED_WORKS_SLUGS.map((slug) => ARTWORKS.find((a) => a.slug === slug)!).filter(Boolean)
}
