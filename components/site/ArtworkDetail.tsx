'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ZoomIn } from 'lucide-react'
import { Lightbox } from '@/components/ui/Lightbox'
import { ArtworkMonogram } from '@/components/ui/ArtworkMonogram'
import { Configurator } from '@/components/site/Configurator'
import type { ArtworkData } from '@/lib/data/artworks'
import type { PricingTiers } from '@/lib/pricing/southern-buoy'

export function ArtworkDetail({ artwork, tiers }: { artwork: ArtworkData; tiers: PricingTiers }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-8 pb-16">

        {/* Back link */}
        <Link
          href="/works"
          className="inline-flex items-center gap-2 caption text-ink-muted hover:text-ink transition-colors mb-8"
        >
          <ArrowLeft size={13} /> Works
        </Link>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-16 items-start">

          {/* Left: artwork image */}
          <div>
            <button
              className="group relative w-full overflow-hidden border border-border bg-canvas focus:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
              style={{
                aspectRatio: String(artwork.aspectRatio),
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.35)',
              }}
              onClick={() => artwork.heroImage && setLightboxOpen(true)}
              aria-label="Click to zoom"
            >
              {artwork.heroImage ? (
                <div className="absolute inset-0">
                  <Image
                    src={artwork.heroImage}
                    alt={artwork.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover select-none artwork-img"
                    priority
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                  />
                  <ArtworkMonogram />
                </div>
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: artwork.blurColor }}
                >
                  <span className="font-display text-7xl italic opacity-10 text-ink select-none">
                    {artwork.title.charAt(0)}
                  </span>
                </div>
              )}

              {artwork.heroImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-canvas/90 px-4 py-2 flex items-center gap-2">
                    <ZoomIn size={14} style={{ color: '#1A1814' }} />
                    <span className="caption text-[11px]" style={{ color: '#1A1814' }}>CLICK TO ZOOM</span>
                  </div>
                </div>
              )}
            </button>

            {artwork.galleryImages.length > 0 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                {artwork.galleryImages.map((img, i) => (
                  <div
                    key={i}
                    className="relative shrink-0 w-20 h-20 border border-border overflow-hidden bg-canvas cursor-pointer hover:border-ink transition-colors"
                  >
                    <Image
                      src={img}
                      alt={`${artwork.title} detail ${i + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover select-none artwork-img"
                      onContextMenu={(e) => e.preventDefault()}
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: configurator */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Configurator artwork={artwork} tiers={tiers} />
          </div>
        </div>

        {/* Artwork description */}
        <div className="mt-16 pt-12 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12">
            <div>
              <p className="caption text-terracotta mb-4 tracking-[0.14em]">ABOUT THIS WORK</p>
              <p className="text-ink leading-relaxed max-w-xl">{artwork.description}</p>
            </div>
            <div className="flex flex-col gap-4 md:border-l md:border-border md:pl-12">
              <div>
                <p className="caption text-ink-muted mb-1">ORIGINAL DIMENSIONS</p>
                <p className="text-ink text-sm">{artwork.originalDims}</p>
              </div>
              <div>
                <p className="caption text-ink-muted mb-1">YEAR</p>
                <p className="text-ink text-sm">{artwork.year}</p>
              </div>
              <div>
                <p className="caption text-ink-muted mb-1">ARTIST</p>
                <p className="text-ink text-sm">Lara Stocco</p>
              </div>
              <div>
                <p className="caption text-ink-muted mb-1">FULFILMENT</p>
                <p className="text-ink text-sm">
                  Printed and fulfilled by Southern Buoy, Mornington VIC
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && artwork.heroImage && (
        <Lightbox
          src={artwork.heroImage}
          alt={artwork.title}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
