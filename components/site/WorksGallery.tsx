'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArtworkImage } from '@/components/ui/ArtworkImage'
import type { ArtworkData } from '@/lib/data/artworks'

type Filter = 'all' | 'available' | '2025' | '2024'

interface Props {
  artworks: ArtworkData[]
}

// Aspect ratio classes — all images are landscape screenshots.
// Vary the crop to create staggered heights across the grid.
const ASPECT_CLASSES = [
  'aspect-[4/3]',   // Flora, Bewildered      (1.34 actual)
  'aspect-[3/2]',   // Frida & Pomegranate    (1.46 actual)
  'aspect-[3/2]',   // Quietude in Lemon      (1.51 actual)
  'aspect-[4/3]',   // Cabinet of Wonders     (1.51 actual — cropped square-ish for variety)
  'aspect-[3/2]',   // The Crimson Sitter     (1.52 actual)
  'aspect-[4/3]',   // Devotionals            (1.34 actual)
  'aspect-[3/2]',   // Statuary               (1.50 actual)
]

export function WorksGallery({ artworks }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = artworks.filter((a) => {
    if (filter === 'available') return a.isAvailable
    if (filter === '2025') return a.year === 2025
    if (filter === '2024') return a.year === 2024
    return true
  })

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'available', label: 'Available' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
  ]

  return (
    <>
      {/* Filter bar */}
      <div className="flex items-center gap-1 mb-14">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`caption px-4 py-2 border transition-colors ${
              filter === value
                ? 'border-ink bg-ink text-bone'
                : 'border-border text-ink-muted hover:border-ink-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="caption text-ink-muted ml-4">
          {filtered.length} {filtered.length === 1 ? 'work' : 'works'}
        </span>
      </div>

      {/* Gallery grid — 3 columns, varied aspect ratios for staggered feel */}
      {artworks.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-display text-2xl italic text-ink-muted">
            No works available yet.
          </p>
          <p className="text-sm text-ink-muted mt-3">
            Check back soon.
          </p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-14 items-start">
          {filtered.map((artwork, i) => {
            // Find the original index to get the right aspect class
            const originalIndex = artworks.findIndex((a) => a.slug === artwork.slug)
            const aspectClass = ASPECT_CLASSES[originalIndex] ?? 'aspect-[3/4]'

            return (
              <Link
                key={artwork.slug}
                href={`/works/${artwork.slug}`}
                className="group block"
              >
                {/* Image container — hairline border + subtle shadow */}
                <div
                  className={`relative overflow-hidden mb-5 border border-border bg-canvas ${aspectClass}`}
                  style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.20)' }}
                >
                  <ArtworkImage
                    src={artwork.thumbnailImage}
                    alt={artwork.title}
                    blurColor={artwork.blurColor}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>

                {/* Artwork info */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl italic text-ink group-hover:text-terracotta transition-colors leading-tight">
                      {artwork.title}
                    </h2>
                    <p className="caption text-ink-muted mt-1">{artwork.year}</p>
                    {artwork.tagline && (
                      <p className="text-xs text-ink-muted mt-2 leading-relaxed max-w-xs">
                        {artwork.tagline}
                      </p>
                    )}
                  </div>
                  <span className="caption text-ink-muted shrink-0 mt-0.5 group-hover:text-terracotta transition-colors">
                    →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="font-display text-2xl italic text-ink-muted">
            No works match this filter.
          </p>
        </div>
      )}
    </>
  )
}
