'use client'

import { Loader2 } from 'lucide-react'

interface Props {
  artworkTitle: string
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
  error?: string | null
}

export function DeleteArtworkModal({ artworkTitle, onConfirm, onCancel, isPending, error }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/30" onClick={onCancel} />
      <div className="relative bg-bone border border-border w-full max-w-md p-6">
        <h2 className="font-display text-xl italic text-ink mb-3">
          Delete <span className="italic">{artworkTitle}</span>?
        </h2>
        <p className="text-sm text-ink-muted mb-6 leading-relaxed">
          This will permanently remove this work from your store and your records. This cannot be
          undone. Past orders that included this work will not be affected — they keep their own
          snapshot of the title.
        </p>

        {error && (
          <div className="border border-terracotta/30 bg-terracotta/5 px-3 py-2.5 mb-4">
            <p className="text-xs text-terracotta">{error}</p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="border border-border px-4 py-2.5 text-sm text-ink hover:bg-bone-dark transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="bg-terracotta text-bone px-4 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
          >
            {isPending && <Loader2 size={12} className="animate-spin" />}
            Delete permanently
          </button>
        </div>
      </div>
    </div>
  )
}
