'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export function NewsletterForm() {
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
        body: JSON.stringify({ email: email.trim(), source: 'footer' }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setDone(true)
      }
    } catch {
      setError('Could not save your email. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return <p className="text-sm text-olive">Thank you — we&apos;ll be in touch.</p>
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null) }}
          placeholder="your@email.com"
          required
          className="flex-1 text-sm border border-border bg-transparent px-3 py-2 text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-terracotta transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="caption text-ink-muted border border-border px-4 py-2 hover:bg-ink hover:text-bone hover:border-ink transition-colors disabled:opacity-60 flex items-center gap-1.5"
        >
          {loading && <Loader2 size={11} className="animate-spin" />}
          Join
        </button>
      </div>
      {error && <p className="text-xs text-terracotta">{error}</p>}
    </form>
  )
}
