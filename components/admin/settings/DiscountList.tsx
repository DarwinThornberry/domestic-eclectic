'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Plus, ToggleLeft, ToggleRight, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { toggleDiscountActive, deleteDiscount } from '@/app/admin/actions'
import type { Discount } from '@/types'

interface DiscountWithRedemptions extends Discount {
  redemption_count: number
}

interface Props {
  discounts: DiscountWithRedemptions[]
  nowMs: number
}

function statusLabel(d: Discount, nowMs: number): 'active' | 'scheduled' | 'expired' | 'paused' {
  if (!d.is_active) return 'paused'
  if (d.starts_at && new Date(d.starts_at).getTime() > nowMs) return 'scheduled'
  if (d.ends_at && new Date(d.ends_at).getTime() < nowMs) return 'expired'
  return 'active'
}

function discountValueLabel(d: Discount): string {
  if (d.discount_type === 'percentage') return `${d.value}% off`
  return `$${(d.value / 100).toFixed(0)} off`
}

function StatusBadge({ status }: { status: ReturnType<typeof statusLabel> }) {
  const styles = {
    active:    'bg-olive/15 text-olive',
    scheduled: 'bg-terracotta/15 text-terracotta',
    expired:   'bg-border text-ink-muted',
    paused:    'bg-border text-ink-muted',
  }
  return (
    <span className={`caption text-[10px] tracking-[0.12em] px-2 py-0.5 ${styles[status]}`}>
      {status.toUpperCase()}
    </span>
  )
}

function DiscountRow({ d, nowMs, onToggle, onDelete }: {
  d: DiscountWithRedemptions
  nowMs: number
  onToggle: (id: string, current: boolean) => void
  onDelete: (id: string) => void
}) {
  const status = statusLabel(d, nowMs)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <div className="border-t border-border first:border-t-0 px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <Link
              href={`/admin/settings/pricing/discounts/${d.id}`}
              className="font-medium text-sm text-ink hover:text-terracotta transition-colors"
            >
              {d.name}
            </Link>
            <StatusBadge status={status} />
          </div>
          <div className="flex items-center gap-4 text-xs text-ink-muted flex-wrap">
            <span>{d.code ? <strong className="text-ink font-mono">{d.code}</strong> : 'Automatic'}</span>
            <span>{discountValueLabel(d)}</span>
            <span>{d.redemption_count} {d.redemption_count === 1 ? 'use' : 'uses'}</span>
            {d.max_total_uses && <span>/ {d.max_total_uses} max</span>}
            {d.ends_at && (
              <span>Ends {new Date(d.ends_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onToggle(d.id, d.is_active)}
            title={d.is_active ? 'Pause' : 'Activate'}
            className="text-ink-muted hover:text-ink transition-colors"
          >
            {d.is_active ? <ToggleRight size={18} className="text-olive" /> : <ToggleLeft size={18} />}
          </button>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete"
              className="text-ink-muted hover:text-terracotta transition-colors"
            >
              <Trash2 size={14} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted">Delete?</span>
              <button onClick={() => onDelete(d.id)} className="text-xs text-terracotta hover:underline">Yes</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-xs text-ink-muted hover:underline">No</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function DiscountList({ discounts, nowMs }: Props) {
  const [isPending, startTransition] = useTransition()
  const [expiredOpen, setExpiredOpen] = useState(false)

  const active = discounts.filter((d) => statusLabel(d, nowMs) === 'active')
  const scheduled = discounts.filter((d) => statusLabel(d, nowMs) === 'scheduled')
  const expired = discounts.filter((d) => ['expired', 'paused'].includes(statusLabel(d, nowMs)))

  function handleToggle(id: string, current: boolean) {
    startTransition(() => toggleDiscountActive(id, !current))
  }

  function handleDelete(id: string) {
    startTransition(() => deleteDiscount(id))
  }

  if (discounts.length === 0) {
    return (
      <div className="border border-border px-8 py-12 text-center max-w-lg">
        <p className="font-display text-xl italic text-ink-muted mb-3">No discounts yet.</p>
        <p className="text-sm text-ink-muted leading-relaxed mb-6">
          Discounts are a great way to run sales, reward subscribers, or create urgency. Create
          your first discount to get started.
        </p>
        <Link
          href="/admin/settings/pricing/discounts/new"
          className="inline-flex items-center gap-2 bg-ink text-bone px-5 py-3 text-sm hover:bg-terracotta transition-colors"
        >
          <Plus size={13} /> Create discount
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl" style={{ opacity: isPending ? 0.7 : 1 }}>

      {/* Active */}
      {active.length > 0 && (
        <section>
          <p className="caption text-ink tracking-[0.12em] text-xs mb-3">ACTIVE</p>
          <div className="border border-border">
            {active.map((d) => (
              <DiscountRow key={d.id} d={d} nowMs={nowMs} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      )}

      {/* Scheduled */}
      {scheduled.length > 0 && (
        <section>
          <p className="caption text-ink tracking-[0.12em] text-xs mb-3">SCHEDULED</p>
          <div className="border border-border">
            {scheduled.map((d) => (
              <DiscountRow key={d.id} d={d} nowMs={nowMs} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      )}

      {/* Expired / Paused */}
      {expired.length > 0 && (
        <section>
          <button
            onClick={() => setExpiredOpen((v) => !v)}
            className="flex items-center gap-2 caption text-ink-muted tracking-[0.12em] text-xs mb-3 hover:text-ink transition-colors"
          >
            {expiredOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            EXPIRED / PAUSED ({expired.length})
          </button>
          {expiredOpen && (
            <div className="border border-border">
              {expired.map((d) => (
                <DiscountRow key={d.id} d={d} nowMs={nowMs} onToggle={handleToggle} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
