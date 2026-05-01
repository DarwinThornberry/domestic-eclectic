import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ArtworkImage } from '@/components/ui/ArtworkImage'
import { getPublishedArtworks } from '@/lib/data/artworks-db'
import { SITE_DESCRIPTION } from '@/lib/constants'
import type { ArtworkData } from '@/lib/data/artworks'

export const metadata: Metadata = {
  title: 'Domestic Eclectic — Fine Art Prints by Lara Stocco',
  description: SITE_DESCRIPTION,
}

const SELECTED_WORKS_SLUGS = [
  'frida-and-the-pomegranate',
  'quietude-in-lemon',
  'the-crimson-sitter',
  'statuary',
]

export default async function HomePage() {
  const artworks = await getPublishedArtworks()

  // Featured: first by sort_order (flora-bewildered)
  const featured = artworks[0]
  // Selected grid: specific slugs in order
  const selected = SELECTED_WORKS_SLUGS
    .map((slug) => artworks.find((a) => a.slug === slug))
    .filter((a): a is ArtworkData => Boolean(a))
  // Studio section
  const studioArtwork = artworks.find((a) => a.slug === 'devotionals') ?? artworks[artworks.length - 1]

  if (!featured) return null  // Should not happen — data layer falls back to static

  return (
    <>
      {/* ─── Hero — letterbox treatment ─────────────────────────────────────
          The artwork sits as a contained rectangle on the bone background,
          like a work hanging in a gallery. No overlaid text, no scrims.
          Caption sits below in clean negative space.
      ──────────────────────────────────────────────────────────────────── */}
      <section className="pt-10 pb-0">
        <div className="max-w-[1440px] mx-auto px-8 md:px-14 lg:px-20">

          {/* Contained artwork — hairline border + subtle shadow */}
          <div
            className="relative w-full overflow-hidden border border-border bg-canvas"
            style={{
              height: 'clamp(320px, 70vh, 820px)',
              boxShadow: '0 8px 48px rgba(0, 0, 0, 0.30)',
            }}
          >
            <ArtworkImage
              src={featured.heroImage}
              alt={featured.title}
              sizes="(max-width: 768px) 100vw, 95vw"
              priority
              blurColor={featured.blurColor}
              className="object-cover object-center"
            />
          </div>

          {/* Wall-label caption — below the image, left-aligned, ~half the width */}
          <div className="mt-7 max-w-lg">
            {/* Kicker */}
            <p className="caption text-terracotta mb-3 tracking-[0.2em]">FEATURED WORK</p>

            {/* Title */}
            <h1 className="font-display text-3xl md:text-4xl italic text-ink leading-tight mb-2">
              {featured.title}
            </h1>

            {/* Tagline — [PLACEHOLDER] Lara to review */}
            <p className="text-ink-muted leading-relaxed mb-4">
              {featured.tagline}
            </p>

            {/* Metadata */}
            <p className="caption text-ink-muted tracking-[0.12em] mb-6">
              {featured.originalDims.toUpperCase()} · {featured.year}
            </p>

            <Link
              href={`/works/${featured.slug}`}
              className="inline-flex items-center gap-2 text-sm text-ink border-b border-ink pb-px hover:text-terracotta hover:border-terracotta transition-colors"
            >
              View Work <ArrowRight size={13} />
            </Link>
          </div>

        </div>
      </section>

      {/* ─── Introduction strip ─────────────────────────────────────────────── */}
      {/* [PLACEHOLDER] — Lara to review and update this paragraph */}
      <section className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
          <p className="font-display text-2xl md:text-3xl lg:text-[2.25rem] italic text-ink leading-snug max-w-3xl">
            Domestic Eclectic is the studio practice of Lara Stocco — collages built
            from art history, botany, and the quiet mythology of the everyday.
          </p>
        </div>
      </section>

      {/* ─── Selected Works ────────────────────────────────────────────────── */}
      {selected.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-20 lg:pb-28">
          <div className="flex items-end justify-between mb-10 lg:mb-14">
            <div>
              <p className="caption text-terracotta mb-2 tracking-[0.16em]">SELECTED WORKS</p>
              <h2 className="font-display text-3xl md:text-4xl italic text-ink">Index</h2>
            </div>
            <Link
              href="/works"
              className="hidden md:inline-flex items-center gap-2 caption text-ink-muted hover:text-ink transition-colors"
            >
              All works <ArrowRight size={12} />
            </Link>
          </div>

          {/*
            Asymmetric editorial grid — all images are landscape.
            Row 1: Frida large (7 col) | Quietude smaller (5 col, nudged down)
            Row 2: Crimson offset right (5 col from col 4) | Statuary (6 col)
          */}
          <div className="grid grid-cols-12 gap-3 lg:gap-5 items-start">
            {selected[0] && (
              <Link href={`/works/${selected[0].slug}`} className="group col-span-12 lg:col-span-7">
                <WorkThumb artwork={selected[0]} sizes="(max-width: 1024px) 100vw, 58vw" aspectClass="aspect-[4/3]" />
              </Link>
            )}
            {selected[1] && (
              <Link href={`/works/${selected[1].slug}`} className="group col-span-12 sm:col-span-8 lg:col-span-5 lg:mt-14">
                <WorkThumb artwork={selected[1]} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 67vw, 42vw" aspectClass="aspect-[3/2]" />
              </Link>
            )}
            {selected[2] && (
              <Link href={`/works/${selected[2].slug}`} className="group col-span-12 sm:col-span-6 lg:col-span-5 lg:col-start-4">
                <WorkThumb artwork={selected[2]} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 42vw" aspectClass="aspect-[3/2]" />
              </Link>
            )}
            {selected[3] && (
              <Link href={`/works/${selected[3].slug}`} className="group col-span-12 sm:col-span-6 lg:col-span-6 lg:mt-6">
                <WorkThumb artwork={selected[3]} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw" aspectClass="aspect-[3/2]" />
              </Link>
            )}
          </div>

          <div className="mt-10 flex justify-end md:hidden">
            <Link href="/works" className="inline-flex items-center gap-2 caption text-ink hover:text-terracotta transition-colors">
              All works <ArrowRight size={12} />
            </Link>
          </div>
        </section>
      )}

      {/* ─── Divider ─────────────────────────────────────────────────────────── */}
      <hr />

      {/* ─── From the Studio ────────────────────────────────────────────────── */}
      {studioArtwork && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Artwork — contained with hairline border + shadow */}
            <div
              className="relative aspect-[4/3] overflow-hidden border border-border bg-canvas"
              style={{ boxShadow: '0 6px 32px rgba(0, 0, 0, 0.25)' }}
            >
              <ArtworkImage
                src={studioArtwork.heroImage}
                alt={studioArtwork.title}
                blurColor={studioArtwork.blurColor}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Text */}
            <div>
              <p className="caption text-terracotta mb-4 tracking-[0.16em]">FROM THE STUDIO</p>
              <h2 className="font-display text-3xl md:text-4xl italic text-ink mb-8 leading-tight">
                Art-historical fragments,<br />
                assembled into something new
              </h2>

              {/* [PLACEHOLDER] — Lara to update this text */}
              <div className="flex flex-col gap-5 text-ink-muted leading-relaxed">
                <p>
                  Lara Stocco&apos;s practice begins in the archive — art books opened
                  to Botticelli, Vermeer, Frida Kahlo; botanical illustration
                  folios; Victorian shell catalogues; faded portrait photography.
                  These fragments are torn, cut, painted over, layered, and
                  reassembled into dense, maximalist compositions that feel
                  simultaneously ancient and entirely contemporary.
                </p>
                <p>
                  Each collage is made by hand in her Melbourne studio. Every
                  print is produced on archival cotton rag or canvas by Southern
                  Buoy in Mornington, Victoria — a studio that shares her
                  commitment to materials that last.
                </p>
              </div>

              <Link
                href="/about"
                className="inline-flex items-center gap-2 caption text-ink border-b border-ink pb-px mt-10 hover:text-terracotta hover:border-terracotta transition-colors"
              >
                About Lara <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  )
}

// ─── Shared thumbnail component ───────────────────────────────────────────────

function WorkThumb({
  artwork,
  sizes,
  aspectClass,
}: {
  artwork: ArtworkData
  sizes: string
  aspectClass: string
}) {
  return (
    <div
      className={`relative overflow-hidden border border-border bg-canvas ${aspectClass}`}
      style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.20)' }}
    >
      <ArtworkImage
        src={artwork.heroImage}
        alt={artwork.title}
        blurColor={artwork.blurColor}
        sizes={sizes}
        className="transition-transform duration-700 group-hover:scale-[1.025]"
      />
      {/* Hover overlay — title + year fade in */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex flex-col justify-end p-5">
        <div className="translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="font-display text-xl italic text-[#F2EBD9] leading-tight">{artwork.title}</p>
          <p className="caption text-[#F2EBD9]/65 mt-1">{artwork.year}</p>
        </div>
      </div>
    </div>
  )
}
