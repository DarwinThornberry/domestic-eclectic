import { createAdminClient } from '@/lib/supabase/server'
import { AnalyticsClient } from '@/components/admin/AnalyticsClient'
import { MATERIAL_LABELS } from '@/lib/constants'

export const metadata = { title: 'Analytics' }

// Cache analytics for 10 minutes — no need for real-time
export const revalidate = 600

export default async function AnalyticsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <div className="px-6 lg:px-10 py-10">
        <div className="mb-10">
          <p className="caption text-terracotta tracking-[0.16em] mb-2">STUDIO</p>
          <h1 className="font-display text-4xl italic text-ink">Analytics</h1>
        </div>
        <p className="text-sm text-ink-muted">Connect Supabase to see analytics.</p>
      </div>
    )
  }

  const supabase = createAdminClient()
  const now = new Date()

  // Month boundaries
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString()

  // Fetch all paid orders in last 12 months with items
  const [
    { data: recentOrders },
    { data: topArtworkRows },
    { data: discountPerfRows },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, total_aud, created_at, order_items(material, framing, quantity, line_total_aud, artwork_title_snapshot)')
      .eq('status', 'paid')
      .gte('created_at', twelveMonthsAgo)
      .order('created_at'),

    supabase
      .from('order_items')
      .select('artwork_title_snapshot, quantity, line_total_aud, orders!inner(status, created_at)')
      .eq('orders.status', 'paid')
      .gte('orders.created_at', twelveMonthsAgo),

    supabase
      .from('discounts')
      .select('id, name, code, discount_redemptions(amount_discounted_aud, orders(total_aud))'),
  ])

  // ── Headline stats ────────────────────────────────────────────────────────

  const orders = recentOrders ?? []
  const thisMonthOrders = orders.filter((o: any) => o.created_at >= thisMonthStart)
  const lastMonthOrders = orders.filter(
    (o: any) => o.created_at >= lastMonthStart && o.created_at < lastMonthEnd,
  )

  const revenueThisMonth = thisMonthOrders.reduce((s: number, o: any) => s + o.total_aud, 0)
  const revenueLastMonth = lastMonthOrders.reduce((s: number, o: any) => s + o.total_aud, 0)
  const allRevenue = orders.reduce((s: number, o: any) => s + o.total_aud, 0)
  const avgOrderValue = recentOrders?.length ? Math.round(allRevenue / recentOrders.length) : 0

  // ── Monthly revenue chart ─────────────────────────────────────────────────

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyMap: Record<string, { revenue: number; orders: number }> = {}

  // Seed 12 empty months
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyMap[key] = { revenue: 0, orders: 0 }
  }

  for (const order of orders) {
    const d = new Date((order as any).created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (monthlyMap[key]) {
      monthlyMap[key].revenue += (order as any).total_aud
      monthlyMap[key].orders += 1
    }
  }

  const monthly = Object.entries(monthlyMap).map(([key, val]) => {
    const month = parseInt(key.split('-')[1], 10) - 1
    return { month: monthNames[month], ...val }
  })

  // ── Top artworks ──────────────────────────────────────────────────────────

  const artworkMap: Record<string, { revenue: number; units: number }> = {}
  for (const row of topArtworkRows ?? []) {
    const title = row.artwork_title_snapshot
    if (!artworkMap[title]) artworkMap[title] = { revenue: 0, units: 0 }
    artworkMap[title].revenue += row.line_total_aud
    artworkMap[title].units += row.quantity
  }

  const topArtworks = Object.entries(artworkMap)
    .map(([title, data]) => ({ title, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // ── Material & framing breakdown ──────────────────────────────────────────

  const matMap: Record<string, { unframed: number; standard: number; premium: number }> = {}
  for (const order of recentOrders ?? []) {
    for (const item of (order.order_items ?? []) as any[]) {
      const mat = MATERIAL_LABELS[item.material] ?? item.material
      if (!matMap[mat]) matMap[mat] = { unframed: 0, standard: 0, premium: 0 }
      const f = item.framing as string
      if (f === 'unframed') matMap[mat].unframed += item.quantity
      else if (f.startsWith('standard_')) matMap[mat].standard += item.quantity
      else matMap[mat].premium += item.quantity
    }
  }

  const materials = Object.entries(matMap).map(([material, data]) => ({ material, ...data }))

  // ── Discount performance ──────────────────────────────────────────────────

  const discountPerf = (discountPerfRows ?? []).map((d: any) => {
    const redemptions: any[] = d.discount_redemptions ?? []
    return {
      name: d.name,
      code: d.code,
      redemptions: redemptions.length,
      total_order_revenue: redemptions.reduce((s: number, r: any) => s + (r.orders?.total_aud ?? 0), 0),
      total_discounted: redemptions.reduce((s: number, r: any) => s + r.amount_discounted_aud, 0),
    }
  }).filter((d: any) => d.redemptions > 0)

  return (
    <div className="px-6 lg:px-10 py-10">
      <div className="mb-10">
        <p className="caption text-terracotta tracking-[0.16em] mb-2">STUDIO</p>
        <h1 className="font-display text-4xl italic text-ink">Analytics</h1>
        <p className="text-sm text-ink-muted mt-2">Last 12 months of paid orders.</p>
      </div>

      <AnalyticsClient
        headline={{
          revenueThisMonth,
          revenueLastMonth,
          ordersThisMonth: thisMonthOrders.length,
          ordersLastMonth: lastMonthOrders.length,
          avgOrderValue,
        }}
        monthly={monthly}
        topArtworks={topArtworks}
        materials={materials}
        discountPerf={discountPerf}
      />
    </div>
  )
}
