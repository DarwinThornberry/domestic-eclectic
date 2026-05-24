'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Nav } from '@/components/site/Nav'
import { requestPasswordReset } from './actions'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch {
      setError('Something went wrong. Please check the email address and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Nav />
      <main className="flex-1">
        <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-sm">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 caption text-ink-muted hover:text-ink transition-colors mb-8"
            >
              <ArrowLeft size={12} /> Back to sign in
            </Link>

            {sent ? (
              <div>
                <p className="caption text-olive tracking-[0.16em] mb-3">EMAIL SENT</p>
                <h1 className="font-display text-3xl italic text-ink mb-4">
                  Check your inbox.
                </h1>
                <p className="text-ink-muted text-sm leading-relaxed">
                  We sent a password reset link to <strong>{email}</strong>. Click the link in
                  that email to set a new password. If you don't see it, check your spam folder.
                </p>
              </div>
            ) : (
              <>
                <p className="caption text-terracotta tracking-[0.16em] mb-3">STUDIO ACCESS</p>
                <h1 className="font-display text-4xl italic text-ink mb-2">Reset password</h1>
                <p className="text-ink-muted text-sm mb-8">
                  Enter your email and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <label htmlFor="email" className="text-xs text-ink-muted block mb-1.5">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
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
                    className="w-full py-4 bg-ink text-bone text-sm hover:bg-terracotta transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <><Loader2 size={14} className="animate-spin" /> Sending…</>
                    ) : (
                      'Send reset link'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
