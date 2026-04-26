'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'

export function ContactForm() {
  const [form, setForm]     = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone]     = useState(false)
  const [error, setError]   = useState<string | null>(null)

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setDone(true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col gap-3 py-2">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full border border-olive/60 flex items-center justify-center shrink-0">
            <Check size={13} className="text-olive" strokeWidth={2} />
          </div>
          <p className="font-display text-2xl italic text-ink">
            Thank you, {form.name.split(' ')[0]}.
          </p>
        </div>
        <p className="text-ink-muted text-sm leading-relaxed pl-10">
          Lara will be in touch shortly.
        </p>
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="caption text-ink">
          Your name
        </label>
        <input
          id="name"
          type="text"
          required
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          className="border border-border bg-transparent px-4 py-3 text-ink placeholder:text-ink-muted/40 focus:outline-none focus:border-terracotta transition-colors"
          placeholder="Full name"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="caption text-ink">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          className="border border-border bg-transparent px-4 py-3 text-ink placeholder:text-ink-muted/40 focus:outline-none focus:border-terracotta transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="caption text-ink">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={6}
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          className="border border-border bg-transparent px-4 py-3 text-ink placeholder:text-ink-muted/40 focus:outline-none focus:border-terracotta transition-colors resize-none"
          placeholder="Your message…"
        />
      </div>

      {error && <p className="text-sm text-terracotta -mt-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="self-start caption text-bone bg-ink px-8 py-3 hover:bg-terracotta transition-colors disabled:opacity-60 flex items-center gap-2"
      >
        {loading && <Loader2 size={12} className="animate-spin" />}
        {loading ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
