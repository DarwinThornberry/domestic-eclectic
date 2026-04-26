import { Nav } from '@/components/site/Nav'

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
    </>
  )
}
