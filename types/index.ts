// Core database types — mirrors the Supabase schema exactly.
// All monetary values are integers (cents AUD).

export type ArtworkStatus = 'published' | 'draft'

export type PricingMode = 'default' | 'custom_markup' | 'fixed_prices' | 'custom_band_markups'

export interface Artwork {
  id: string
  slug: string
  title: string
  year: number
  tagline: string | null
  description: string | null
  original_dims: string | null
  hi_res_file_url: string | null
  thumbnail_url: string | null
  gallery_images: string[]
  gallery_image_urls: string[]   // Phase 4: storage URLs for gallery images
  is_published: boolean
  sort_order: number
  aspect_ratio: number | null    // Phase 4: width ÷ height stored in DB
  blur_color: string | null      // Phase 4: dominant hue hex
  // Phase 5: per-artwork pricing
  pricing_mode: PricingMode
  custom_markup: number | null
  fixed_prices: Record<string, number> | null      // legacy: "material:size:framing" → cents
  custom_markup_small:  number | null              // per-band custom markups
  custom_markup_medium: number | null
  custom_markup_large:  number | null
  price_overrides: Record<string, number> | null   // "material:size:framing" → cents (takes priority)
  created_at: string
  updated_at: string
  // Client-facing image fields (resolved from storage URLs or /public paths)
  heroImage?: string
  thumbnailImage?: string
  aspectRatio?: number // width ÷ height — pre-sized to avoid CLS
  blurColor?: string  // dominant hue for placeholder background
}

export interface OrderActivity {
  id: string
  order_id: string
  activity: string
  created_at: string
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'sent_to_printer'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type Material = 'cotton_rag_smooth' | 'cotton_rag_textured' | 'canvas_satin' | 'canvas_lustre'

export type Framing =
  | 'unframed'
  | 'standard_flooded_gum'
  | 'standard_american_ash'
  | 'premium_white'
  | 'premium_mahogany'
  | 'premium_walnut'
  | 'premium_black'

export interface ShippingAddress {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface Order {
  id: string
  order_number: string
  stripe_session_id: string | null
  stripe_payment_intent: string | null
  status: OrderStatus
  customer_email: string
  customer_name: string
  shipping_address: ShippingAddress
  subtotal_aud: number
  shipping_aud: number
  discount_aud: number
  total_aud: number
  discount_id: string | null
  discount_code: string | null
  notes: string | null
  sent_to_printer_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  refunded_at: string | null
  tracking_number: string | null
  created_at: string
}

export interface Discount {
  id: string
  name: string
  code: string | null
  discount_type: 'percentage' | 'fixed'
  value: number
  applies_to: 'order' | 'specific_artworks' | 'material'
  applies_to_data: string[] | string | null
  minimum_spend_aud: number | null
  max_total_uses: number | null
  max_uses_per_customer: number
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DiscountRedemption {
  id: string
  discount_id: string
  order_id: string
  customer_email: string
  amount_discounted_aud: number
  created_at: string
}

export interface Settings {
  id: 1
  markup_multiplier: number
  markup_small:    number
  markup_medium:   number
  markup_large:    number
  rounding_small:  number
  rounding_medium: number
  rounding_large:  number
  admin_email: string
  printer_email: string
  studio_name: string
  contact_email: string
  instagram_url: string | null
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  artwork_id: string
  artwork_title_snapshot: string
  material: Material
  size: string
  framing: Framing
  quantity: number
  unit_price_aud: number
  line_total_aud: number
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { artworks: Pick<Artwork, 'slug' | 'thumbnail_url'> | null })[]
}

// Cart types (client-side, localStorage)
export interface CartItem {
  id: string            // local uuid for cart management
  artwork_id: string    // DB UUID (falls back to slug only for static dev data without Supabase)
  artwork_slug: string
  artwork_title: string
  artwork_thumbnail: string | null
  material: Material
  size: string
  framing: Framing
  quantity: number
  unit_price_aud: number  // in cents
  line_total_aud: number  // unit_price_aud × quantity, in cents
}
