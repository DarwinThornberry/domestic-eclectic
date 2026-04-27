'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ArtworkMonogram } from './ArtworkMonogram'

interface ArtworkImageProps {
  src: string | null | undefined
  alt: string
  sizes?: string
  priority?: boolean
  className?: string
  /** Dominant hue shown as placeholder background while the image loads or if missing */
  blurColor?: string
}

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

  // Wrapper div fills the caller's relative container and acts as an explicit
  // stacking root so ArtworkMonogram is reliably positioned on top of the image.
  return (
    <div className="absolute inset-0">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover select-none artwork-img ${className}`}
        onError={() => setHasError(true)}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
      />
      <ArtworkMonogram />
    </div>
  )
}
