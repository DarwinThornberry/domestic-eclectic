'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        setError('Incorrect email or password.')
        return
      }

      // Check the admins table — only active admins get through
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Sign in failed. Please try again.')
        return
      }

      const { data: admin } = await supabase
        .from('admins')
        .select('id, is_active')
        .eq('id', user.id)
        .single()

      if (!admin?.is_active) {
        await supabase.auth.signOut()
        setError("This account doesn't have studio access.")
        return
      }

      router.push(next)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="caption text-terracotta tracking-[0.16em] mb-3">STUDIO ACCESS</p>
          <h1 className="font-display text-4xl italic text-ink leading-tight">
            Studio Sign In
          </h1>
        </div>

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
              className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-ink transition-colors"
              placeholder="your@email.com"
            />
          </div>

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
              autoComplete="current-password"
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
            className="w-full py-4 bg-ink text-bone text-sm hover:bg-terracotta transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Signing in…</>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link
            href="/forgot-password"
            className="text-xs text-ink-muted hover:text-ink transition-colors"
          >
            Forgot your password?
          </Link>
        </div>

        <p className="text-xs text-ink-muted text-center mt-8">
          For studio access only.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center">
        <div className="animate-pulse h-8 w-32 bg-bone-dark rounded" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
