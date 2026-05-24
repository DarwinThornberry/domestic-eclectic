import { redirect } from 'next/navigation'

export const metadata = { title: 'Pricing Strategy' }

export default function PricingStrategyPage() {
  redirect('/admin/settings/pricing/costs')
}
