'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const DATE_FILTERS = [
  { value: 'month',  label: 'This month' },
  { value: '30days', label: 'Last 30 days' },
  { value: 'year',   label: 'This year' },
  { value: 'all',    label: 'All time' },
]

function FiltersBarInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const date = searchParams.get('date') ?? 'all'
  const filter = searchParams.get('filter') ?? 'all'
  const search = searchParams.get('search') ?? ''

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams({ filter, date, search, page: '1', ...overrides })
    return `/admin/orders?${p}`
  }

  return (
    <div className="flex items-center gap-3 sm:ml-auto">
      <select
        value={date}
        className="border border-border bg-bone px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-ink"
        onChange={(e) => router.push(buildUrl({ date: e.target.value }))}
      >
        {DATE_FILTERS.map((d) => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </select>

      <form method="GET" action="/admin/orders">
        <input type="hidden" name="filter" value={filter} />
        <input type="hidden" name="date" value={date} />
        <input
          name="search"
          defaultValue={search}
          placeholder="Search order or name…"
          className="border border-border bg-transparent px-3 py-1.5 text-xs text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-ink w-48"
        />
      </form>
    </div>
  )
}

export function OrderFiltersBar() {
  return (
    <Suspense fallback={<div className="h-8 w-64 animate-pulse bg-bone-dark rounded" />}>
      <FiltersBarInner />
    </Suspense>
  )
}
