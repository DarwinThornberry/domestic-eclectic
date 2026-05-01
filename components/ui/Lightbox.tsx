'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { ArtworkMonogram } from './ArtworkMonogram'

interface LightboxProps {
  src: string
  alt: string
  onClose: () => void
}

export function Lightbox({ src, alt, onClose }: LightboxProps) {
  // Close on Escape key
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  return (
    // Backdrop — click outside to close
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors"
      >
        <X size={24} strokeWidth={1.5} />
      </button>

      {/* Image — click inside doesn't close */}
      <div
        className="relative max-w-5xl w-full max-h-[90vh]"
        style={{ aspectRatio: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain select-none artwork-img"
            sizes="(max-width: 768px) 95vw, 80vw"
            priority
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
          />
          <ArtworkMonogram />
        </div>
      </div>
    </div>
  )
}
