import { Nav } from '@/components/site/Nav'

// Restores original cream tokens so login matches admin styling.
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-bone min-h-screen flex flex-col"
      style={{
        '--color-bone':        '#FAF6EC',
        '--color-bone-dark':   '#EDE8DF',
        '--color-ink':         '#1A1814',
        '--color-ink-muted':   '#4A4540',
        '--color-terracotta':  '#9A6B4F',
        '--color-olive':       '#5B6B47',
        '--color-border':      '#E5DFD5',
        '--color-border-dark': '#C8C0B0',
        '--color-canvas':      '#FFFFFF',
      } as React.CSSProperties}
    >
      <Nav />
      <main className="flex-1">{children}</main>
    </div>
  )
}
