'use client'

import { useState, useTransition } from 'react'
import { Loader2, ChevronDown } from 'lucide-react'
import type { OrderWithItems } from '@/types'
import { updateOrderStatus, addOrderNote, refundOrder, sendToPrinter, markShipped } from '@/app/admin/actions'

interface Props {
  order: OrderWithItems & {
    sent_to_printer_at: string | null
    shipped_at: string | null
    delivered_at: string | null
    cancelled_at: string | null
    tracking_number: string | null
    notes: string | null
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD`
}

function ActionRow({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="py-4">
      <p className="text-sm text-ink font-medium mb-0.5">{title}</p>
      <p className="text-xs text-ink-muted mb-3 leading-relaxed">{description}</p>
      {children}
    </div>
  )
}

function ConfirmModal({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
  danger,
}: {
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/30" onClick={onCancel} />
      <div className="relative bg-bone border border-border p-6 w-full max-w-sm shadow-lg">
        <h3 className="font-display text-xl italic text-ink mb-3">{title}</h3>
        <p className="text-sm text-ink-muted leading-relaxed mb-6">{body}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 text-sm ${danger ? 'bg-terracotta text-bone hover:bg-ink' : 'bg-ink text-bone hover:bg-terracotta'} transition-colors`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm border border-border text-ink hover:bg-bone-dark transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export function OrderActions({ order }: Props) {
  const [isPending, startTransition] = useTransition()
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number ?? '')
  const [note, setNote] = useState(order.notes ?? '')
  const [noteSaved, setNoteSaved] = useState(false)
  const [showRefundConfirm, setShowRefundConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function run(fn: () => Promise<void>) {
    setError(null)
    startTransition(async () => {
      try { await fn() }
      catch (e: any) { setError(e.message ?? 'Something went wrong. Please try again.') }
    })
  }

  return (
    <div className="border border-border p-5 flex flex-col">
      <p className="caption text-ink tracking-[0.12em] mb-1">ACTIONS</p>

      {error && (
        <p className="text-xs text-terracotta border border-terracotta/30 bg-terracotta/5 px-3 py-2 mt-3">
          {error}
        </p>
      )}

      <div className="divide-y divide-border">

        {/* Send to printer */}
        {order.status === 'paid' && (
          <ActionRow
            title="Send to printer"
            description="Email the artwork file and order details to Southern Buoy. They will print, frame, and ship directly to your customer."
          >
            <button
              onClick={() => run(() => sendToPrinter(order.id))}
              disabled={isPending}
              className="w-full py-3 bg-ink text-bone text-sm hover:bg-terracotta transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 size={13} className="animate-spin" /> : null}
              Send to Southern Buoy
            </button>
          </ActionRow>
        )}

        {/* Sent confirmation */}
        {order.status === 'sent_to_printer' && order.sent_to_printer_at && (
          <ActionRow
            title="Sent to printer"
            description={`Sent to Southern Buoy on ${formatDate(order.sent_to_printer_at)}.`}
          >
            <button
              onClick={() => run(() => sendToPrinter(order.id))}
              disabled={isPending}
              className="text-xs text-ink-muted hover:text-ink transition-colors underline underline-offset-2"
            >
              Resend email
            </button>
          </ActionRow>
        )}

        {/* Mark as shipped */}
        {order.status === 'sent_to_printer' && (
          <ActionRow
            title="Mark as shipped"
            description="Update the customer that their order is on its way. They will receive a notification email."
          >
            <input
              type="text"
              placeholder="Tracking number (optional)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full border border-border bg-transparent px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink transition-colors mb-3"
            />
            <button
              onClick={() => run(() => markShipped(order.id, trackingNumber || undefined))}
              disabled={isPending}
              className="w-full py-3 bg-ink text-bone text-sm hover:bg-terracotta transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 size={13} className="animate-spin" /> : null}
              Mark as shipped
            </button>
          </ActionRow>
        )}

        {/* Mark as delivered */}
        {order.status === 'shipped' && (
          <ActionRow
            title="Mark as delivered"
            description="Confirm the order has been received by the customer."
          >
            <button
              onClick={() => run(() => updateOrderStatus(order.id, 'delivered'))}
              disabled={isPending}
              className="w-full py-3 bg-ink text-bone text-sm hover:bg-terracotta transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 size={13} className="animate-spin" /> : null}
              Mark as delivered
            </button>
          </ActionRow>
        )}

        {/* Internal note */}
        <ActionRow
          title="Add a note"
          description="Private notes on this order. The customer never sees these."
        >
          <textarea
            value={note}
            onChange={(e) => { setNote(e.target.value); setNoteSaved(false) }}
            rows={3}
            placeholder="e.g. Customer requested special packaging"
            className="w-full border border-border bg-transparent px-3 py-2 text-xs text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-ink transition-colors resize-none mb-2"
          />
          <button
            onClick={() => run(async () => { await addOrderNote(order.id, note); setNoteSaved(true) })}
            disabled={isPending}
            className="text-xs border border-border px-3 py-1.5 text-ink hover:bg-bone-dark transition-colors"
          >
            {noteSaved ? '✓ Saved' : 'Save note'}
          </button>
        </ActionRow>

        {/* Divider for destructive actions */}
        <div className="pt-4">
          {/* Cancel order */}
          {order.status === 'paid' && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-xs text-ink-muted hover:text-ink transition-colors mb-3 block"
            >
              Cancel order
            </button>
          )}

          {/* Refund */}
          {(['paid', 'sent_to_printer', 'shipped', 'delivered'] as const).includes(order.status as any) && (
            <button
              onClick={() => setShowRefundConfirm(true)}
              className="text-xs text-ink-muted hover:text-terracotta transition-colors block"
            >
              Issue a refund
            </button>
          )}
        </div>
      </div>

      {/* Confirm modals */}
      {showRefundConfirm && (
        <ConfirmModal
          title="Issue a refund?"
          body={`Refund ${formatCents(order.total_aud)} to ${order.customer_name}? The customer will be notified by Stripe. This cannot be undone.`}
          confirmLabel="Yes, refund"
          danger
          onConfirm={() => { setShowRefundConfirm(false); run(() => refundOrder(order.id)) }}
          onCancel={() => setShowRefundConfirm(false)}
        />
      )}

      {showCancelConfirm && (
        <ConfirmModal
          title="Cancel this order?"
          body="The order will be marked as cancelled. If you also want to refund the customer, you'll need to issue a refund as a separate step."
          confirmLabel="Cancel order"
          onConfirm={() => { setShowCancelConfirm(false); run(() => updateOrderStatus(order.id, 'cancelled')) }}
          onCancel={() => setShowCancelConfirm(false)}
        />
      )}
    </div>
  )
}
