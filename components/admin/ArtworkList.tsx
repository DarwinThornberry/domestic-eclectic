'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Reorder } from 'framer-motion'
import { GripVertical, Pencil } from 'lucide-react'
import { reorderArtworks } from '@/app/admin/actions'

interface ArtworkRow {
  id: string
  slug: string
  title: string
  year: number
  original_dims: string | null
  thumbnail_url: string | null
  is_published: boolean
}

interface Props {
  artworks: ArtworkRow[]
}

export function ArtworkList({ artworks: initial }: Props) {
  const [items, setItems] = useState(initial)
  const [isPending, startTransition] = useTransition()

  function handleReorder(newOrder: ArtworkRow[]) {
    setItems(newOrder)
    startTransition(async () => {
      await reorderArtworks(newOrder.map((a) => a.id))
    })
  }

  return (
    <div className="border border-border">
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={handleReorder}
        layoutScroll
        className="divide-y divide-border"
      >
        {items.map((artwork) => (
          <Reorder.Item
            key={artwork.id}
            value={artwork}
            className="flex items-center gap-4 px-4 py-4 bg-bone hover:bg-bone-dark transition-colors cursor-default"
          >
            {/* Drag handle */}
            <button
              className="shrink-0 text-ink-muted/40 hover:text-ink-muted transition-colors cursor-grab active:cursor-grabbing touch-none"
              aria-label="Drag to reorder"
            >
              <GripVertical size={16} />
            </button>

            {/* Thumbnail */}
            <div className="shrink-0 w-12 h-12 border border-border overflow-hidden bg-bone-dark">
              {artwork.thumbnail_url ? (
                <img
                  src={artwork.thumbnail_url}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display text-lg italic text-ink/20">
                    {artwork.title.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Title + year */}
            <div className="flex-1 min-w-0">
              <p className="font-display italic text-ink text-base leading-tight truncate">
                {artwork.title}
              </p>
              <p className="text-xs text-ink-muted">{artwork.year}</p>
            </div>

            {/* Dims */}
            <p className="text-xs text-ink-muted hidden md:block shrink-0 w-32">
              {artwork.original_dims ?? '—'}
            </p>

            {/* Status */}
            <span
              className={`shrink-0 px-2.5 py-1 text-[10px] tracking-wide rounded-sm ${
                artwork.is_published
                  ? 'bg-olive/15 text-ink'
                  : 'bg-bone-dark text-ink-muted'
              }`}
            >
              {artwork.is_published ? 'Published' : 'Draft'}
            </span>

            {/* Edit link */}
            <Link
              href={`/admin/artworks/${artwork.id}/edit`}
              className="shrink-0 flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Pencil size={12} /> Edit
            </Link>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {isPending && (
        <p className="text-xs text-ink-muted px-4 py-2 border-t border-border">Saving order…</p>
      )}
    </div>
  )
}
