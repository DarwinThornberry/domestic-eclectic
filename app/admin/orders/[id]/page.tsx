import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { StatusPill } from '@/components/admin/StatusPill'
import { OrderActions } from '@/components/admin/OrderActions'
import { MATERIAL_LABELS, FRAMING_LABELS, SIZE_LABELS } from '@/lib/constants'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: `Order — ${id.slice(0, 8)}` }
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD`
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <div className="px-6 lg:px-10 py-10">
        <p className="text-sm text-ink-muted">Connect Supabase to view order details.</p>
      </div>
    )
  }

  const supabase = createAdminClient()
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        artworks(slug, thumbnail_url)
      )
    `)
    .eq('id', id)
    .single()

  if (!order) notFound()

  const address = order.shipping_address as any

  // Build activity log from timestamps
  const events: { label: string; ts: string }[] = [
    { label: 'Order placed', ts: order.created_at },
  ]
  if (order.sent_to_printer_at) events.push({ label: 'Sent to Southern Buoy', ts: order.sent_to_printer_at })
  if (order.shipped_at) events.push({ label: 'Marked as shipped', ts: order.shipped_at })
  if (order.delivered_at) events.push({ label: 'Marked as delivered', ts: order.delivered_at })
  if (order.cancelled_at) events.push({ label: 'Cancelled', ts: order.cancelled_at })
  if (order.refunded_at) events.push({ label: 'Refunded', ts: order.refunded_at })
  events.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())

  return (
    <div className="px-6 lg:px-10 py-10 max-w-6xl">
      {/* Breadcrumb */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 caption text-ink-muted hover:text-ink transition-colors mb-8"
      >
        <ArrowLeft size={12} /> Orders
      </Link>

      {/* Heading */}
      <div className="flex flex-wrap items-center gap-4 mb-2">
        <h1 className="font-display text-3xl italic text-ink">{order.order_number}</h1>
        <StatusPill status={order.status} />
      </div>
      <p className="text-sm text-ink-muted mb-10">{formatDateTime(order.created_at)}</p>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-14 items-start mb-12">

        {/* LEFT: Order details */}
        <div className="flex flex-col gap-8">

          {/* Items */}
          <section>
            <p className="caption text-ink tracking-[0.12em] mb-4">ITEMS</p>
            <div className="border border-border">
              {order.order_items.map((item: any, idx: number) => {
                const material = MATERIAL_LABELS[item.material] ?? item.material
                const size = SIZE_LABELS[item.size] ?? item.size
                const framing = FRAMING_LABELS[item.framing] ?? item.framing
                return (
                  <div
                    key={item.id}
                    className={`flex gap-4 p-4 ${idx > 0 ? 'border-t border-border' : ''}`}
                  >
                    {/* Thumbnail */}
                    <div className="shrink-0 w-14 h-14 border border-border overflow-hidden bg-bone-dark">
                      {item.artworks?.thumbnail_url ? (
                        <img
                          src={item.artworks.thumbnail_url}
                          alt={item.artwork_title_snapshot}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-display text-xl italic text-ink/20">
                            {item.artwork_title_snapshot.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-display italic text-ink text-base leading-tight mb-1">
                        {item.artwork_title_snapshot}
                      </p>
                      <p className="text-xs text-ink-muted leading-relaxed mb-2">
                        {material} · {size} · {framing}
                        {item.quantity > 1 && ` · Qty ${item.quantity}`}
                      </p>
                    </div>
                    <p className="shrink-0 font-display italic text-ink text-sm">
                      {formatCents(item.line_total_aud)}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Customer */}
          <section>
            <p className="caption text-ink tracking-[0.12em] mb-4">CUSTOMER</p>
            <div className="border border-border p-5">
              <p className="text-sm text-ink font-medium mb-0.5">{order.customer_name}</p>
              <p className="text-sm text-ink-muted mb-5">{order.customer_email}</p>

              <p className="text-xs text-ink-muted uppercase tracking-widest mb-2">Shipping address</p>
              <address className="not-italic text-sm text-ink leading-relaxed">
                {address.name}<br />
                {address.line1}{address.line2 && <><br />{address.line2}</>}<br />
                {address.city}{address.state && `, ${address.state}`} {address.postal_code}<br />
                {address.country}
              </address>
            </div>
          </section>

          {/* Payment */}
          <section>
            <p className="caption text-ink tracking-[0.12em] mb-4">PAYMENT</p>
            <div className="border border-border p-5">
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Subtotal</span>
                  <span className="text-ink">{formatCents(order.subtotal_aud)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Shipping</span>
                  <span className="text-ink">{formatCents(order.shipping_aud)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="font-display italic text-ink">Total</span>
                  <span className="font-display italic text-ink">{formatCents(order.total_aud)}</span>
                </div>
              </div>

              {order.stripe_payment_intent && (
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <p className="text-xs text-ink-muted font-mono truncate mr-2">
                    {order.stripe_payment_intent}
                  </p>
                  <a
                    href={`https://dashboard.stripe.com/payments/${order.stripe_payment_intent}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors"
                  >
                    View in Stripe <ExternalLink size={10} />
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT: Actions panel */}
        <div className="lg:sticky lg:top-8">
          <OrderActions order={order as any} />
        </div>
      </div>

      {/* Activity log */}
      <div>
        <p className="caption text-ink tracking-[0.12em] mb-5">ACTIVITY</p>
        <div className="flex flex-col gap-0">
          {events.map((event, idx) => (
            <div key={idx} className="flex items-start gap-4 pb-5">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-terracotta mt-1" />
                {idx < events.length - 1 && <div className="w-px flex-1 bg-border mt-1 min-h-[20px]" />}
              </div>
              <div>
                <p className="text-sm text-ink">{event.label}</p>
                <p className="text-xs text-ink-muted mt-0.5">{formatDateTime(event.ts)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
