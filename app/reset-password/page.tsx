'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Nav } from '@/components/site/Nav'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      setTimeout(() => router.push('/admin'), 2000)
    } catch {
      setError('Could not update your password. The reset link may have expired — request a new one.')
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
            <p className="caption text-terracotta tracking-[0.16em] mb-3">STUDIO ACCESS</p>
            <h1 className="font-display text-4xl italic text-ink mb-6">
              {done ? 'Password updated.' : 'Set new password'}
            </h1>

            {done ? (
              <p className="text-ink-muted text-sm">
                Your password has been changed. Taking you to the studio…
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label htmlFor="password" className="text-xs text-ink-muted block mb-1.5">
                    New password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="confirm" className="text-xs text-ink-muted block mb-1.5">
                    Confirm new password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
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
                    <><Loader2 size={14} className="animate-spin" /> Updating…</>
                  ) : (
                    'Update password'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
