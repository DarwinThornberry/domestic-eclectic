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

  // Try to fetch order details from Stripe to show the order number.
  // Falls back gracefully if Stripe isn't configured yet.
  let orderNumber: string | null = null

  if (session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const { getStripe } = await import('@/lib/stripe')
      const stripe = getStripe()
      const session = await stripe.checkout.sessions.retrieve(session_id)
      orderNumber = session.metadata?.order_number ?? null
    } catch {
      // Stripe not reachable — show generic confirmation
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
