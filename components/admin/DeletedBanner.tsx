'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { X } from 'lucide-react'

export function DeletedBanner({ title }: { title: string }) {
  const [visible, setVisible] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    router.replace(pathname)
  }, [])

  if (!visible) return null

  return (
    <div className="border border-olive/30 bg-olive/5 px-4 py-3 mb-6 flex items-center justify-between">
      <p className="text-sm text-ink">
        <strong>{title}</strong> has been removed.
      </p>
      <button
        onClick={() => setVisible(false)}
        className="text-ink-muted hover:text-ink transition-colors ml-4 shrink-0"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}
