'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Reorder } from 'framer-motion'
import { GripVertical, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { reorderArtworks, deleteArtwork } from '@/app/admin/actions'
import { DeleteArtworkModal } from '@/components/admin/DeleteArtworkModal'

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

  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<ArtworkRow | null>(null)
  const [deleteIsPending, setDeleteIsPending] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  function handleReorder(newOrder: ArtworkRow[]) {
    setItems(newOrder)
    startTransition(async () => {
      await reorderArtworks(newOrder.map((a) => a.id))
    })
  }

  async function handleDelete() {
    if (!pendingDelete) return
    setDeleteIsPending(true)
    setDeleteError(null)
    try {
      await deleteArtwork(pendingDelete.id)
      setItems((prev) => prev.filter((a) => a.id !== pendingDelete.id))
      setSuccessMessage(`${pendingDelete.title} has been removed.`)
      setPendingDelete(null)
    } catch (e: any) {
      setDeleteError(e.message ?? 'Could not delete. Please try again.')
    } finally {
      setDeleteIsPending(false)
    }
  }

  return (
    <>
      {pendingDelete && (
        <DeleteArtworkModal
          artworkTitle={pendingDelete.title}
          onConfirm={handleDelete}
          onCancel={() => { setPendingDelete(null); setDeleteError(null) }}
          isPending={deleteIsPending}
          error={deleteError}
        />
      )}

      {successMessage && (
        <div className="border border-olive/30 bg-olive/5 px-4 py-3 mb-4 flex items-center justify-between">
          <p className="text-sm text-ink">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-ink-muted hover:text-ink transition-colors ml-4 text-xs"
          >
            ✕
          </button>
        </div>
      )}

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

              {/* "..." menu */}
              <div
                className="relative shrink-0"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenMenuId(openMenuId === artwork.id ? null : artwork.id)
                  }}
                  className="flex items-center justify-center w-7 h-7 text-ink-muted hover:text-ink hover:bg-bone-dark transition-colors"
                  aria-label="More options"
                >
                  <MoreHorizontal size={14} />
                </button>

                {openMenuId === artwork.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setOpenMenuId(null)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-20 bg-bone border border-border shadow-sm w-32 py-1">
                      <Link
                        href={`/admin/artworks/${artwork.id}/edit`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-bone-dark transition-colors"
                        onClick={() => setOpenMenuId(null)}
                      >
                        <Pencil size={12} /> Edit
                      </Link>
                      <button
                        onClick={() => {
                          setPendingDelete(artwork)
                          setOpenMenuId(null)
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-terracotta hover:bg-bone-dark transition-colors w-full text-left"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {isPending && (
          <p className="text-xs text-ink-muted px-4 py-2 border-t border-border">Saving order…</p>
        )}
      </div>
    </>
  )
}
