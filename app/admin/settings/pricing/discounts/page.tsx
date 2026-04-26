import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { DiscountList } from '@/components/admin/settings/DiscountList'

export const metadata = { title: 'Discounts' }

export default async function DiscountsPage() {
  let discounts: any[] = []

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('discounts')
      .select('*, discount_redemptions(count)')
      .order('created_at', { ascending: false })

    discounts = (data ?? []).map((d: any) => ({
      ...d,
      redemption_count: d.discount_redemptions?.[0]?.count ?? 0,
    }))
  }

  const nowMs = Date.now()

  return (
    <div className="px-6 lg:px-10 py-10">
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="caption text-terracotta tracking-[0.16em] mb-2">SETTINGS</p>
          <h1 className="font-display text-4xl italic text-ink">Discounts</h1>
          <p className="text-sm text-ink-muted mt-2">Discount codes and automatic sales.</p>
        </div>
        <Link
          href="/admin/settings/pricing/discounts/new"
          className="inline-flex items-center gap-2 bg-ink text-bone px-5 py-3 text-sm hover:bg-terracotta transition-colors shrink-0"
        >
          <Plus size={13} /> Create discount
        </Link>
      </div>

      <DiscountList discounts={discounts} nowMs={nowMs} />
    </div>
  )
}
