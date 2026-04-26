import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About',
  description: 'About Lara Stocco — Melbourne-based artist and creator of Domestic Eclectic.',
}

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        {/* Image placeholder */}
        <div className="relative aspect-[3/4] bg-bone-dark overflow-hidden order-1 lg:order-none">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <p className="font-display text-7xl italic text-ink select-none">LS</p>
          </div>
        </div>

        {/* Text */}
        <div className="order-2 lg:order-none">
          <p className="caption text-terracotta mb-4">About</p>
          <h1 className="font-display text-4xl md:text-5xl italic text-ink mb-8 leading-tight">
            Lara Stocco
          </h1>

          <div className="flex flex-col gap-5 text-ink-muted leading-relaxed">
            <p>
              Lara Stocco is a Melbourne-based mixed-media artist whose work draws
              from the deep archives of art history — Botticelli&apos;s gilded
              figures, Vermeer&apos;s interior light, Frida Kahlo&apos;s
              unflinching self-regard — and layers them against botanical
              illustration, Victorian shell taxonomy, and vintage portraiture.
            </p>
            <p>
              The result is dense, maximalist collage: compositions that reward
              close looking, where a butterfly wing might brush against a Flemish
              interior, and a shell from a 19th-century natural history catalogue
              sits beside a Renaissance Venus.
            </p>
            <p>
              Her work is made entirely by hand in her Melbourne studio. Each
              piece begins with the accumulation of source material — books,
              prints, found images — and proceeds through a process of
              tearing, cutting, painting, and layering until the image arrives
              at something that feels both inevitable and strange.
            </p>
            <p>
              Domestic Eclectic is the home for archival fine art prints of her
              work, produced by Southern Buoy in Mornington, Victoria, on
              materials chosen to last.
            </p>
          </div>

          <Link
            href="/works"
            className="inline-flex items-center gap-2 caption text-ink border-b border-ink pb-px mt-10 hover:text-terracotta hover:border-terracotta transition-colors"
          >
            Browse the collection <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}
