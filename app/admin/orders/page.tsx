import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { StatusPill } from '@/components/admin/StatusPill'
import { OrderFiltersBar } from '@/components/admin/OrderFiltersBar'
import type { OrderStatus } from '@/types'

export const metadata = { title: 'Orders' }

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all',              label: 'All' },
  { value: 'paid',             label: 'Awaiting Action' },
  { value: 'sent_to_printer',  label: 'Sent to Printer' },
  { value: 'shipped',          label: 'Shipped' },
  { value: 'delivered',        label: 'Delivered' },
  { value: 'cancelled',        label: 'Cancelled' },
  { value: 'refunded',         label: 'Refunded' },
]

// Shown separately — incomplete checkouts that never reached payment
const INCOMPLETE_FILTER = { value: 'pending', label: 'Incomplete' }


function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 2 })}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getDateFilter(range: string): string | null {
  const now = new Date()
  switch (range) {
    case 'month':  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    case '30days': return new Date(Date.now() - 30 * 86400000).toISOString()
    case 'year':   return new Date(now.getFullYear(), 0, 1).toISOString()
    default: return null
  }
}

interface Props {
  searchParams: Promise<{ filter?: string; date?: string; search?: string; page?: string }>
}

const PAGE_SIZE = 20

export default async function OrdersPage({ searchParams }: Props) {
  const params = await searchParams
  const filter = params.filter ?? 'all'
  const date = params.date ?? 'all'
  const search = params.search ?? ''
  const page = Math.max(1, parseInt(params.page ?? '1'))

  let orders: any[] = []
  let total = 0

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createAdminClient()
    let query = supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_email, status, total_aud, created_at, order_items(quantity, artwork_title_snapshot)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (filter === 'all') {
      query = query.neq('status', 'pending')
    } else {
      query = query.eq('status', filter as OrderStatus)
    }

    const since = getDateFilter(date)
    if (since) query = query.gte('created_at', since)

    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%`)
    }

    const { data, count } = await query
    orders = data ?? []
    total = count ?? 0
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams({ filter, date, search, page: String(page), ...overrides })
    return `/admin/orders?${p}`
  }

  return (
    <div className="px-6 lg:px-10 py-10 max-w-6xl">
      <div className="mb-8">
        <p className="caption text-terracotta tracking-[0.16em] mb-2">STUDIO</p>
        <h1 className="font-display text-4xl italic text-ink">Orders</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Status filter */}
        <div className="flex flex-wrap items-center gap-1">
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={buildUrl({ filter: f.value, page: '1' })}
              className={`px-3 py-1.5 text-xs border transition-colors ${
                filter === f.value
                  ? 'bg-ink text-bone border-ink'
                  : 'border-border text-ink-muted hover:border-ink hover:text-ink'
              }`}
            >
              {f.label}
            </Link>
          ))}
          <span className="text-border text-xs px-1 select-none">·</span>
          <Link
            href={buildUrl({ filter: INCOMPLETE_FILTER.value, page: '1' })}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              filter === INCOMPLETE_FILTER.value
                ? 'bg-ink text-bone border-ink'
                : 'border-border border-dashed text-ink-muted hover:border-ink hover:text-ink'
            }`}
          >
            {INCOMPLETE_FILTER.label}
          </Link>
        </div>

        {/* Date + search (client component — needs onChange) */}
        <OrderFiltersBar />
      </div>

      {/* Table */}
      {!process.env.NEXT_PUBLIC_SUPABASE_URL ? (
        <div className="border border-border p-8">
          <p className="text-sm text-ink-muted">Connect Supabase to see orders.</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="border border-border p-12 text-center">
          <p className="font-display text-2xl italic text-ink-muted">No orders found.</p>
        </div>
      ) : (
        <>
          <div className="border border-border">
            {/* Header */}
            <div className="hidden lg:grid grid-cols-[140px_1fr_2fr_100px_130px_100px] gap-4 px-5 py-3 border-b border-border">
              {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date'].map((h) => (
                <p key={h} className="caption text-ink-muted text-[10px] tracking-[0.1em]">{h}</p>
              ))}
            </div>

            {/* Rows */}
            {orders.map((order, idx) => {
              const items = order.order_items ?? []
              const itemCount = items.reduce((s: number, i: any) => s + i.quantity, 0)
              const first = items[0]?.artwork_title_snapshot ?? ''
              const summary = items.length > 1 ? `${itemCount} works · ${first}…` : first

              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className={`flex flex-col lg:grid lg:grid-cols-[140px_1fr_2fr_100px_130px_100px] gap-2 lg:gap-4 px-5 py-4 hover:bg-bone-dark transition-colors cursor-pointer ${idx > 0 ? 'border-t border-border' : ''}`}
                >
                  <span className="text-sm text-ink font-medium">{order.order_number}</span>
                  <span className="text-sm text-ink">{order.customer_name}</span>
                  <span className="text-sm text-ink-muted truncate hidden lg:block">{summary}</span>
                  <span className="font-display italic text-ink text-sm">{formatCents(order.total_aud)}</span>
                  <StatusPill status={order.status} size="sm" />
                  <span className="text-xs text-ink-muted hidden lg:block">{formatDate(order.created_at)}</span>
                </Link>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5">
              <p className="text-xs text-ink-muted">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link href={buildUrl({ page: String(page - 1) })} className="text-xs text-ink border border-border px-3 py-1.5 hover:bg-bone-dark transition-colors">
                    ← Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={buildUrl({ page: String(page + 1) })} className="text-xs text-ink border border-border px-3 py-1.5 hover:bg-bone-dark transition-colors">
                    Next →
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
