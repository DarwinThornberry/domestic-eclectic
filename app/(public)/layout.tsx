import { Nav } from '@/components/site/Nav'
import { Footer } from '@/components/site/Footer'
import { LaunchBanner } from '@/components/site/LaunchBanner'

const storeLive = process.env.STORE_LIVE === 'true'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {!storeLive && <LaunchBanner />}
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
