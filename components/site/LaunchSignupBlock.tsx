'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface Props {
  source?: string
}

export function LaunchSignupBlock({ source = 'cart' }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/launch-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setDone(true)
      }
    } catch {
      setError('Could not save your email. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-border p-6 lg:p-8">
      <p className="font-display text-2xl italic text-ink mb-3">Launching soon</p>
      <p className="text-sm text-ink-muted leading-relaxed mb-6">
        The store is opening shortly. Sign up to be notified when prints are available.
      </p>

      {done ? (
        <p className="text-sm text-olive">Thank you — we&apos;ll be in touch.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null) }}
              placeholder="your@email.com"
              required
              className="flex-1 border border-border bg-transparent px-4 py-3 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-ink transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="bg-ink text-bone px-5 py-3 text-sm hover:bg-terracotta transition-colors disabled:opacity-60 flex items-center gap-2 whitespace-nowrap"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              Notify me
            </button>
          </div>
          {error && <p className="text-xs text-terracotta">{error}</p>}
        </form>
      )}
    </div>
  )
}
