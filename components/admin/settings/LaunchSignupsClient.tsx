'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

interface Signup {
  id: string
  email: string
  source: string | null
  created_at: string
}

interface Props {
  signups: Signup[]
}

const SOURCE_LABELS: Record<string, string> = {
  cart:   'Launch (cart)',
  footer: 'Studio Notes',
}

type Filter = 'all' | 'cart' | 'footer'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',    label: 'All' },
  { key: 'cart',   label: 'Launch (cart)' },
  { key: 'footer', label: 'Studio Notes' },
]

function formatSource(source: string | null) {
  if (!source) return '—'
  return SOURCE_LABELS[source] ?? source
}

export function LaunchSignupsClient({ signups }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const visible = filter === 'all' ? signups : signups.filter((s) => s.source === filter)

  function handleExport() {
    const rows = [
      ['Email', 'Source', 'Date'].join(','),
      ...visible.map((s) =>
        [
          `"${s.email}"`,
          `"${formatSource(s.source)}"`,
          `"${new Date(s.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}"`,
        ].join(','),
      ),
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const suffix = filter === 'all' ? 'all' : filter
    a.download = `signups-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const cartCount   = signups.filter((s) => s.source === 'cart').length
  const footerCount = signups.filter((s) => s.source === 'footer').length

  return (
    <div className="flex flex-col gap-5">
      {/* Tabs */}
      <div className="flex items-center gap-0 border border-border w-fit">
        {FILTERS.map(({ key, label }) => {
          const count = key === 'all' ? signups.length : key === 'cart' ? cartCount : footerCount
          const active = filter === key
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 text-xs border-r last:border-r-0 border-border transition-colors ${
                active ? 'bg-bone-dark text-ink' : 'text-ink-muted hover:text-ink hover:bg-bone-dark/50'
              }`}
            >
              {label}
              <span className={`ml-1.5 ${active ? 'text-ink-muted' : 'text-ink-muted/60'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <div className="border border-border px-6 py-10 text-center">
          <p className="font-display text-xl italic text-ink-muted">No signups yet.</p>
          <p className="text-sm text-ink-muted mt-2">
            {filter === 'cart'
              ? 'Emails from the pre-launch cart form will appear here.'
              : filter === 'footer'
              ? 'Emails from the Studio Notes footer form will appear here.'
              : 'Emails will appear here once people sign up.'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-muted">
              <strong className="text-ink">{visible.length}</strong>{' '}
              {visible.length === 1 ? 'signup' : 'signups'}
              {filter !== 'all' && <span> in this view</span>}
            </p>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm text-ink-muted hover:text-ink hover:border-ink transition-colors"
            >
              <Download size={13} />
              Export CSV
            </button>
          </div>

          <div className="border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bone-dark border-b border-border">
                  <th className="text-left px-5 py-3 text-xs text-ink-muted font-normal tracking-wide">Email</th>
                  <th className="text-left px-5 py-3 text-xs text-ink-muted font-normal tracking-wide">Source</th>
                  <th className="text-left px-5 py-3 text-xs text-ink-muted font-normal tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => (
                  <tr key={s.id} className="border-t border-border hover:bg-bone-dark/40 transition-colors">
                    <td className="px-5 py-3 text-ink font-mono text-xs">{s.email}</td>
                    <td className="px-5 py-3 text-ink-muted">{formatSource(s.source)}</td>
                    <td className="px-5 py-3 text-ink-muted whitespace-nowrap">
                      {new Date(s.created_at).toLocaleDateString('en-AU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
