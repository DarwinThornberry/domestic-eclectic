import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ClearCart } from '@/components/site/ClearCart'

export const metadata: Metadata = {
  title: 'Order confirmed — Domestic Eclectic',
}

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams

  // Read the real order number from the DB — the Stripe webhook assigns it
  // when payment completes. Stripe metadata only holds the placeholder used
  // at session-creation time, so we go to the source of truth instead.
  let orderNumber: string | null = null

  if (session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const { getStripe } = await import('@/lib/stripe')
      const stripe = getStripe()
      const session = await stripe.checkout.sessions.retrieve(session_id)
      const orderId = session.metadata?.order_id

      if (orderId && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const { createClient } = await import('@/lib/supabase/server')
        const supabase = await createClient()
        const { data: order } = await supabase
          .from('orders')
          .select('order_number')
          .eq('id', orderId)
          .single()

        const num = order?.order_number
        // Only surface the number once the webhook has replaced the placeholder
        if (num && !num.includes('TEMP')) {
          orderNumber = num
        }
      }
    } catch {
      // Stripe or DB not reachable — show generic confirmation without number
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-24">
      {/* Clear the cart client-side */}
      <ClearCart />

      <div className="max-w-xl">
        <p className="caption text-terracotta mb-4 tracking-[0.16em]">ORDER CONFIRMED</p>

        <h1 className="font-display text-4xl md:text-5xl italic text-ink mb-6 leading-tight">
          Thank you. Your order is confirmed.
        </h1>

        {orderNumber && (
          <p className="caption text-ink-muted mb-6 tracking-[0.1em]">
            Order {orderNumber}
          </p>
        )}

        <div className="flex flex-col gap-5 text-ink leading-relaxed mb-10">
          <p>
            A confirmation email is on its way to you with your order summary.
          </p>
          <p>
            Your print will be produced on archival materials by Southern Buoy
            in Mornington, Victoria. Australian orders typically arrive within
            7–14 business days of dispatch. You will receive a shipping
            notification once your order leaves the studio.
          </p>
          <p>
            Questions? Reply to your confirmation email or{' '}
            <Link href="/contact" className="text-ink border-b border-border hover:border-ink transition-colors">
              get in touch
            </Link>
            .
          </p>
        </div>

        <hr className="mb-10" />

        <Link
          href="/works"
          className="inline-flex items-center gap-2 caption text-ink border-b border-ink pb-px hover:text-terracotta hover:border-terracotta transition-colors"
        >
          Continue browsing works <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )
}
