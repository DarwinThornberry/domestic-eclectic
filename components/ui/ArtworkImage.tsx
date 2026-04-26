'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ArtworkImageProps {
  src: string | null | undefined
  alt: string
  sizes?: string
  priority?: boolean
  className?: string
  /** Dominant hue shown as placeholder background while the image loads or if missing */
  blurColor?: string
}

/**
 * Wrapper around next/image for artwork images.
 *
 * Always used inside a `relative`-positioned container with explicit dimensions
 * (via aspect-ratio or fixed height) — it fills that container with object-cover.
 *
 * Falls back gracefully to a coloured placeholder when the image file hasn't
 * been added yet. Drop the real file into /public/artworks/web/ and the
 * placeholder disappears automatically.
 */
export function ArtworkImage({
  src,
  alt,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  className = '',
  blurColor = '#EDE8DF',
}: ArtworkImageProps) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor: blurColor }}
        aria-label={alt}
      >
        <span
          className="font-display text-[8rem] leading-none italic select-none"
          style={{ color: blurColor, filter: 'brightness(0.85)', opacity: 0.25 }}
        >
          {alt.charAt(0)}
        </span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
      onError={() => setHasError(true)}
    />
  )
}
