'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const STORAGE_KEY = 'de_launch_banner_dismissed'

export function LaunchBanner() {
  const [visible, setVisible] = useState(false)

  // Check localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="border-b border-border bg-bone">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-2.5 flex items-center justify-center gap-4 relative">
        <p className="text-xs text-ink text-center">
          The store is launching soon.{' '}
          <a
            href="/cart"
            className="text-ink underline underline-offset-2 hover:text-terracotta transition-colors"
          >
            Sign up to be notified.
          </a>
        </p>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-4 lg:right-10 text-ink hover:text-terracotta transition-colors p-1 touch-manipulation"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
