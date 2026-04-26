'use client'

import { Download } from 'lucide-react'

interface Subscriber {
  id: string
  email: string
  source: string | null
  created_at: string
}

interface Props {
  subscribers: Subscriber[]
}

export function NewsletterClient({ subscribers }: Props) {
  function handleExport() {
    const rows = [
      ['Email', 'Date'].join(','),
      ...subscribers.map((s) =>
        [
          `"${s.email}"`,
          `"${new Date(s.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}"`,
        ].join(','),
      ),
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `studio-notes-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (subscribers.length === 0) {
    return (
      <div className="border border-border px-6 py-10 text-center">
        <p className="font-display text-xl italic text-ink-muted">No subscribers yet.</p>
        <p className="text-sm text-ink-muted mt-2">
          Emails collected via the Studio Notes footer form will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          <strong className="text-ink">{subscribers.length}</strong>{' '}
          {subscribers.length === 1 ? 'subscriber' : 'subscribers'}
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
              <th className="text-left px-5 py-3 text-xs text-ink-muted font-normal tracking-wide">
                Email
              </th>
              <th className="text-left px-5 py-3 text-xs text-ink-muted font-normal tracking-wide">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-t border-border hover:bg-bone-dark/40 transition-colors">
                <td className="px-5 py-3 text-ink font-mono text-xs">{s.email}</td>
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
    </div>
  )
}
