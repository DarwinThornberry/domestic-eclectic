import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import {
  calculatePrice,
  calculatePriceForArtwork,
  calculateShipping,
  DEFAULT_TIERS,
  type PricingTiers,
} from '@/lib/pricing/southern-buoy'
import { createAdminClient } from '@/lib/supabase/server'
import { MATERIAL_LABELS, FRAMING_LABELS, SIZE_LABELS, SITE_URL } from '@/lib/constants'
import type { CartItem, Material, Framing } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, country, discountCode } = body as {
      items: CartItem[]
      country: string
      discountCode?: string | null
    }

    if (!items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // ── 1. Fetch global settings (tiers) and per-artwork pricing ─────────────
    let globalTiers: PricingTiers = DEFAULT_TIERS
    let artworkPricingMap: Record<string, {
      pricing_mode: string
      custom_markup: number | null
      fixed_prices: Record<string, number> | null
      custom_markup_small: number | null
      custom_markup_medium: number | null
      custom_markup_large: number | null
      price_overrides: Record<string, number> | null
    }> = {}
    let discountData: any = null

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createAdminClient()

      // Fetch tier markups from settings
      const { data: settings } = await supabase
        .from('settings')
        .select('markup_small, markup_medium, markup_large, rounding_small, rounding_medium, rounding_large')
        .eq('id', 1)
        .single()
      if (settings) {
        globalTiers = {
          markupSmall:    Number(settings.markup_small)    || DEFAULT_TIERS.markupSmall,
          markupMedium:   Number(settings.markup_medium)   || DEFAULT_TIERS.markupMedium,
          markupLarge:    Number(settings.markup_large)    || DEFAULT_TIERS.markupLarge,
          roundingSmall:  Number(settings.rounding_small)  ?? DEFAULT_TIERS.roundingSmall,
          roundingMedium: Number(settings.rounding_medium) ?? DEFAULT_TIERS.roundingMedium,
          roundingLarge:  Number(settings.rounding_large)  ?? DEFAULT_TIERS.roundingLarge,
        }
      }

      // Fetch per-artwork pricing for all artworks in cart
      const slugs = [...new Set(items.map((i) => i.artwork_slug))]
      const { data: artworks } = await supabase
        .from('artworks')
        .select('id, slug, pricing_mode, custom_markup, fixed_prices, custom_markup_small, custom_markup_medium, custom_markup_large, price_overrides')
        .in('slug', slugs)

      for (const a of artworks ?? []) {
        artworkPricingMap[a.slug] = {
          pricing_mode:          a.pricing_mode          ?? 'default',
          custom_markup:         a.custom_markup         ?? null,
          fixed_prices:          a.fixed_prices          ?? null,
          custom_markup_small:   (a as any).custom_markup_small   ?? null,
          custom_markup_medium:  (a as any).custom_markup_medium  ?? null,
          custom_markup_large:   (a as any).custom_markup_large   ?? null,
          price_overrides:       (a as any).price_overrides       ?? null,
        }
      }

      // Validate discount code if provided
      if (discountCode) {
        const { data: discount } = await supabase
          .from('discounts')
          .select('*')
          .eq('code', discountCode.trim().toUpperCase())
          .eq('is_active', true)
          .single()

        if (discount) {
          const now = new Date()
          const notStarted = discount.starts_at && new Date(discount.starts_at) > now
          const expired = discount.ends_at && new Date(discount.ends_at) < now

          if (!notStarted && !expired) {
            // Check total uses
            let usageOk = true
            if (discount.max_total_uses !== null) {
              const { count } = await supabase
                .from('discount_redemptions')
                .select('*', { count: 'exact', head: true })
                .eq('discount_id', discount.id)
              if ((count ?? 0) >= discount.max_total_uses) usageOk = false
            }
            if (usageOk) discountData = discount
          }
        }
      }
    }

    // ── 2. Server-side price recalculation ────────────────────────────────────
    const validatedItems = items.map((item) => {
      const ap = artworkPricingMap[item.artwork_slug]
      const serverPrice = ap
        ? calculatePriceForArtwork(
            ap.pricing_mode,
            ap.custom_markup,
            ap.fixed_prices,
            item.material as Material,
            item.size,
            item.framing as Framing,
            globalTiers,
            ap.custom_markup_small,
            ap.custom_markup_medium,
            ap.custom_markup_large,
            ap.price_overrides,
          )
        : null

      const price = serverPrice ??
        calculatePrice(item.material as Material, item.size, item.framing as Framing, globalTiers)

      if (!price) {
        throw new Error(
          `Invalid print configuration for "${item.artwork_title}": ` +
            `${item.material} / ${item.size} / ${item.framing}`,
        )
      }
      return {
        ...item,
        unit_price_aud: price,
        line_total_aud: price * item.quantity,
      }
    })

    // ── 3. Shipping ───────────────────────────────────────────────────────────
    const shippingAud = calculateShipping(
      validatedItems.map((i) => ({ size: i.size, framing: i.framing, quantity: i.quantity })),
      country ?? 'AU',
    )

    const subtotalAud = validatedItems.reduce((sum, i) => sum + i.line_total_aud, 0)

    // ── 4. Compute discount amount server-side ────────────────────────────────
    let discountAud = 0
    if (discountData) {
      discountAud = computeDiscountAmount(discountData, subtotalAud, validatedItems)
    }

    const totalAud = subtotalAud + shippingAud - discountAud

    // ── 5. Create pending order in Supabase ───────────────────────────────────
    let orderId = crypto.randomUUID()
    let orderNumber = `DE-${new Date().getFullYear()}-TEMP-${Date.now().toString().slice(-4)}`
    let orderInDb = false

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = createAdminClient()

        const slugs = [...new Set(validatedItems.map((i) => i.artwork_slug))]
        const { data: artworkRows } = await supabase
          .from('artworks')
          .select('id, slug')
          .in('slug', slugs)

        const slugToId = Object.fromEntries(
          (artworkRows ?? []).map((r: { slug: string; id: string }) => [r.slug, r.id]),
        )

        const { data: numData } = await supabase.rpc('generate_order_number')
        if (numData) orderNumber = numData as string

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            status: 'pending',
            customer_email: '',
            customer_name: '',
            shipping_address: {},
            subtotal_aud: subtotalAud,
            shipping_aud: shippingAud,
            discount_aud: discountAud,
            total_aud: totalAud,
            discount_id: discountData?.id ?? null,
            discount_code: discountData?.code ?? null,
          })
          .select('id')
          .single()

        if (orderError) throw orderError
        orderId = order.id
        orderInDb = true

        const itemsToInsert = validatedItems
          .filter((item) => slugToId[item.artwork_slug])
          .map((item) => ({
            order_id: orderId,
            artwork_id: slugToId[item.artwork_slug],
            artwork_title_snapshot: item.artwork_title,
            material: item.material,
            size: item.size,
            framing: item.framing,
            quantity: item.quantity,
            unit_price_aud: item.unit_price_aud,
            line_total_aud: item.line_total_aud,
          }))

        if (itemsToInsert.length) {
          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsToInsert)
          if (itemsError) {
            console.error('[checkout] order_items insert failed:', itemsError.message, itemsError.details)
            throw itemsError
          }
        } else {
          console.error('[checkout] No items matched slugToId — nothing to insert', {
            cartSlugs: validatedItems.map((i) => i.artwork_slug),
            resolvedSlugs: Object.keys(slugToId),
          })
        }
      } catch (dbErr) {
        console.error('[checkout] DB order creation failed:', dbErr)
        throw dbErr
      }
    }

    // ── 6. Create Stripe Checkout Session ─────────────────────────────────────
    const stripe = getStripe()

    // If there's a discount, create a one-time Stripe coupon so it shows
    // as a visible line item in the Stripe checkout UI.
    let stripeCouponId: string | undefined
    if (discountData && discountAud > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: discountAud,
        currency: 'aud',
        duration: 'once',
        name: discountData.name,
        metadata: { discount_id: discountData.id },
      })
      stripeCouponId = coupon.id
    }

    let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>
    try {
      session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      currency: 'aud',
      line_items: [
        ...validatedItems.map((item) => ({
          price_data: {
            currency: 'aud',
            product_data: {
              name: item.artwork_title,
              description: [
                MATERIAL_LABELS[item.material] ?? item.material,
                SIZE_LABELS[item.size] ?? item.size,
                FRAMING_LABELS[item.framing] ?? item.framing,
              ].join(' · '),
            },
            unit_amount: item.unit_price_aud,
          },
          quantity: item.quantity,
        })),
        {
          price_data: {
            currency: 'aud',
            product_data: { name: 'Shipping & Handling' },
            unit_amount: shippingAud,
          },
          quantity: 1,
        },
      ],
      ...(stripeCouponId ? { discounts: [{ coupon: stripeCouponId }] } : {}),
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['AU', 'NZ', 'US', 'GB', 'CA', 'DE', 'FR', 'NL', 'JP', 'SG'],
      },
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        discount_id: discountData?.id ?? '',
        discount_code: discountData?.code ?? '',
        discount_aud: String(discountAud),
      },
      success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/cart`,
    })
    } catch (stripeErr) {
      // Stripe session failed — delete the pending DB order so it doesn't accumulate as an orphan
      if (orderInDb && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        try {
          const supabase = createAdminClient()
          await supabase.from('orders').delete().eq('id', orderId)
        } catch (cleanupErr) {
          console.warn('[checkout] Could not clean up orphaned order:', cleanupErr)
        }
      }
      throw stripeErr
    }

    // ── 7. Save Stripe session ID ─────────────────────────────────────────────
    if (orderInDb && session.id && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = createAdminClient()
        await supabase.from('orders').update({ stripe_session_id: session.id }).eq('id', orderId)
      } catch (err) {
        console.warn('[checkout] Could not save stripe_session_id:', err)
      }
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed'
    console.error('[checkout] Error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function computeDiscountAmount(discount: any, subtotalAud: number, items: any[]): number {
  let eligibleAud = subtotalAud

  if (discount.applies_to === 'specific_artworks') {
    const ids: string[] = discount.applies_to_data ?? []
    eligibleAud = items
      .filter((i) => ids.includes(i.artwork_id))
      .reduce((sum: number, i: any) => sum + i.line_total_aud, 0)
  } else if (discount.applies_to === 'material') {
    const mat: string = discount.applies_to_data ?? ''
    eligibleAud = items
      .filter((i) => i.material === mat)
      .reduce((sum: number, i: any) => sum + i.line_total_aud, 0)
  }

  if (discount.discount_type === 'percentage') {
    return Math.round(eligibleAud * (discount.value / 100))
  }
  return Math.min(discount.value, eligibleAud)
}
