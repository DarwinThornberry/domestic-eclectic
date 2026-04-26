import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

// Tell Next.js not to parse the body — Stripe needs the raw bytes to verify the signature
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  // ── Verify signature ─────────────────────────────────────────────────────────
  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── Handle events ────────────────────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.order_id

    if (!orderId) {
      console.error('[webhook] No order_id in session metadata')
      return NextResponse.json({ error: 'No order ID in metadata' }, { status: 400 })
    }

    try {
      const supabase = createAdminClient()

      // ── Idempotency check ─────────────────────────────────────────────────
      // Stripe may deliver the same event more than once — only process once.
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id, status')
        .eq('id', orderId)
        .single()

      if (existingOrder?.status === 'paid') {
        console.log(`[webhook] Order ${orderId} already marked paid — skipping`)
        return NextResponse.json({ received: true })
      }

      // ── Update order ──────────────────────────────────────────────────────
      const shipping = session.collected_information?.shipping_details
      const customer = session.customer_details

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          stripe_payment_intent: session.payment_intent as string,
          customer_email: customer?.email ?? '',
          customer_name: customer?.name ?? shipping?.name ?? '',
          shipping_address: {
            name: shipping?.name ?? customer?.name ?? '',
            line1: shipping?.address?.line1 ?? '',
            line2: shipping?.address?.line2 ?? null,
            city: shipping?.address?.city ?? '',
            state: shipping?.address?.state ?? '',
            postal_code: shipping?.address?.postal_code ?? '',
            country: shipping?.address?.country ?? '',
          },
        })
        .eq('id', orderId)

      if (updateError) {
        console.error('[webhook] Failed to update order:', updateError.message)
      }

      // ── Record activity ───────────────────────────────────────────────────
      await supabase.from('order_activity').insert({
        order_id: orderId,
        activity: 'Payment confirmed',
      })

      // ── Record discount redemption ────────────────────────────────────────
      const discountId = session.metadata?.discount_id
      const discountAud = parseInt(session.metadata?.discount_aud ?? '0', 10)
      const customerEmail = session.customer_details?.email ?? ''

      if (discountId && discountAud > 0 && customerEmail) {
        await supabase.from('discount_redemptions').insert({
          discount_id: discountId,
          order_id: orderId,
          customer_email: customerEmail,
          amount_discounted_aud: discountAud,
        }).then((result: { error: { message: string } | null }) => {
          if (result.error) console.error('[webhook] Could not record discount redemption:', result.error.message)
        })
      }

      // ── Send transactional emails ─────────────────────────────────────────
      if (process.env.RESEND_API_KEY) {
        const { data: fullOrder } = await supabase
          .from('orders')
          .select(`*, order_items(*, artworks(slug, thumbnail_url))`)
          .eq('id', orderId)
          .single()

        if (fullOrder) {
          const {
            sendCustomerConfirmationEmail,
            sendAdminNotificationEmail,
          } = await import('@/lib/email')

          await Promise.allSettled([
            sendCustomerConfirmationEmail(fullOrder as any),
            sendAdminNotificationEmail(fullOrder as any),
          ])
        }
      } else {
        console.log('[webhook] RESEND_API_KEY not set — skipping emails for order', orderId)
      }
    } catch (err) {
      console.error('[webhook] Error processing order:', err)
      // Don't return 4xx/5xx — Stripe would retry, flooding us with duplicate events.
      // Log the error and return 200. Fix the underlying issue manually.
    }
  }

  return NextResponse.json({ received: true })
}
