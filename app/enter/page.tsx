'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function EnterPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        setError('Incorrect password.')
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-xs">
        <div className="mb-10 text-center">
          <p className="font-display text-3xl italic text-ink leading-tight mb-1">
            Domestic Eclectic
          </p>
          <p className="text-xs text-ink-muted tracking-[0.14em]">
            FINE ART PRINTS BY LARA STOCCO
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="password" className="text-xs text-ink-muted block mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              autoComplete="current-password"
              className="w-full border border-border-dark bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-terracotta border border-terracotta/30 bg-terracotta/5 px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-ink text-bone text-sm hover:bg-terracotta transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Entering…</>
            ) : (
              'Enter'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
