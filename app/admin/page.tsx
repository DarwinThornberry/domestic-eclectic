import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { StatusPill } from '@/components/admin/StatusPill'
import type { Order, OrderItem } from '@/types'

export const metadata = { title: 'Dashboard' }

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} AUD`
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function itemSummary(items: OrderItem[]): string {
  const count = items.reduce((sum, i) => sum + i.quantity, 0)
  const first = items[0]?.artwork_title_snapshot ?? 'item'
  if (count === 1) return first
  return `${count} works · ${first}${items.length > 1 ? ' and more' : ''}`
}

async function getStats() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null
  const supabase = createAdminClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [awaiting, monthly, revenue, recent] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true })
      .eq('status', 'paid'),
    supabase.from('orders').select('id', { count: 'exact', head: true })
      .in('status', ['paid', 'sent_to_printer', 'shipped', 'delivered'])
      .gte('created_at', startOfMonth),
    supabase.from('orders').select('total_aud')
      .in('status', ['paid', 'sent_to_printer', 'shipped', 'delivered'])
      .gte('created_at', startOfMonth),
    supabase.from('orders')
      .select('id, order_number, customer_name, status, total_aud, created_at, order_items(quantity, artwork_title_snapshot)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const revenueTotal = (revenue.data ?? []).reduce((sum: number, r: { total_aud: number }) => sum + r.total_aud, 0)

  return {
    awaitingCount: awaiting.count ?? 0,
    monthlyCount: monthly.count ?? 0,
    monthlyRevenue: revenueTotal,
    recentOrders: recent.data ?? [],
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <div className="px-6 lg:px-10 py-10 max-w-5xl">
      {/* Heading */}
      <div className="mb-10">
        <p className="caption text-terracotta tracking-[0.16em] mb-2">STUDIO</p>
        <h1 className="font-display text-4xl italic text-ink mb-1">
          {greeting()}, Lara.
        </h1>
        <p className="text-ink-muted text-sm">{formatDate()}</p>
      </div>

      {/* Stats */}
      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <Link href="/admin/orders?filter=awaiting" className="border border-border p-6 hover:border-border-dark transition-colors group">
            <p className="font-display text-5xl italic text-ink mb-2">{stats.awaitingCount}</p>
            <p className="text-xs text-ink-muted leading-relaxed">New orders awaiting action</p>
          </Link>
          <div className="border border-border p-6">
            <p className="font-display text-5xl italic text-ink mb-2">{stats.monthlyCount}</p>
            <p className="text-xs text-ink-muted leading-relaxed">Orders this month</p>
          </div>
          <div className="border border-border p-6">
            <p className="font-display text-4xl italic text-ink mb-2">{formatCents(stats.monthlyRevenue)}</p>
            <p className="text-xs text-ink-muted leading-relaxed">Revenue this month</p>
          </div>
        </div>
      ) : (
        <div className="border border-border p-6 mb-12">
          <p className="text-sm text-ink-muted">
            Connect your Supabase database to see live stats. Add <code className="text-xs bg-bone-dark px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> and related keys to <code className="text-xs bg-bone-dark px-1 py-0.5">.env.local</code>.
          </p>
        </div>
      )}

      {/* Recent orders */}
      <div className="mb-12">
        <p className="caption text-ink tracking-[0.12em] mb-5">RECENT ORDERS</p>

        {stats?.recentOrders.length ? (
          <>
            <div className="border border-border">
              {stats.recentOrders.map((order: any, idx: number) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-4 hover:bg-bone-dark transition-colors ${idx > 0 ? 'border-t border-border' : ''}`}
                >
                  <span className="font-body text-sm text-ink font-medium w-32 shrink-0">
                    {order.order_number}
                  </span>
                  <span className="text-sm text-ink flex-1 min-w-0 truncate">
                    {order.customer_name}
                  </span>
                  <span className="text-xs text-ink-muted flex-1 min-w-0 truncate hidden md:block">
                    {itemSummary(order.order_items ?? [])}
                  </span>
                  <span className="font-display italic text-ink text-sm w-28 shrink-0 hidden sm:block">
                    {formatCents(order.total_aud)}
                  </span>
                  <div className="shrink-0">
                    <StatusPill status={order.status} size="sm" />
                  </div>
                  <span className="text-xs text-ink-muted w-24 shrink-0 text-right hidden lg:block">
                    {relativeDate(order.created_at)}
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 caption text-ink border-b border-ink pb-px hover:text-terracotta hover:border-terracotta transition-colors"
              >
                View all orders <ArrowRight size={11} />
              </Link>
            </div>
          </>
        ) : (
          <div className="border border-border p-8 text-center">
            <p className="font-display text-xl italic text-ink-muted">No orders yet.</p>
            <p className="text-sm text-ink-muted mt-2">Orders will appear here once customers start checking out.</p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap items-center gap-4 pt-8 border-t border-border">
        <Link
          href="/admin/artworks/new"
          className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-sm text-ink hover:bg-bone-dark transition-colors"
        >
          <Plus size={13} /> Add a new work
        </Link>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-ink-muted hover:text-ink transition-colors"
        >
          View store →
        </a>
      </div>
    </div>
  )
}
