import { CartClient } from '@/components/site/CartClient'

export const metadata = { title: 'Cart — Domestic Eclectic' }

export default function CartPage() {
  const storeLive = process.env.STORE_LIVE === 'true'
  return <CartClient storeLive={storeLive} />
}
