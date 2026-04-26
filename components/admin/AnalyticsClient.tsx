'use client'

import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { formatDollars } from '@/lib/pricing/southern-buoy'

interface MonthlyPoint {
  month: string  // "Jan", "Feb", etc.
  revenue: number  // cents
  orders: number
}

interface TopArtwork {
  title: string
  revenue: number  // cents
  units: number
}

interface MaterialBreakdown {
  material: string
  unframed: number
  standard: number
  premium: number
}

interface DiscountPerf {
  name: string
  code: string | null
  redemptions: number
  total_order_revenue: number  // cents
  total_discounted: number     // cents
}

interface HeadlineStats {
  revenueThisMonth: number
  revenueLastMonth: number
  ordersThisMonth: number
  ordersLastMonth: number
  avgOrderValue: number
}

interface Props {
  headline: HeadlineStats
  monthly: MonthlyPoint[]
  topArtworks: TopArtwork[]
  materials: MaterialBreakdown[]
  discountPerf: DiscountPerf[]
}

function pct(a: number, b: number): string {
  if (b === 0) return '—'
  const diff = ((a - b) / b) * 100
  return `${diff >= 0 ? '+' : ''}${diff.toFixed(0)}%`
}

function StatCard({ label, value, sub, positive }: {
  label: string
  value: string
  sub?: string
  positive?: boolean
}) {
  return (
    <div className="border border-border p-5">
      <p className="text-xs text-ink-muted mb-2 tracking-wide">{label}</p>
      <p className="font-display text-3xl italic text-ink mb-1">{value}</p>
      {sub && (
        <p className={`text-xs ${positive === true ? 'text-olive' : positive === false ? 'text-terracotta' : 'text-ink-muted'}`}>
          {sub} vs last month
        </p>
      )}
    </div>
  )
}

const CHART_COLORS = {
  ink: '#1a1814',
  terracotta: '#c2694f',
  olive: '#6b7c4d',
  border: '#e8e4de',
  muted: '#9b9189',
}

export function AnalyticsClient({ headline, monthly, topArtworks, materials, discountPerf }: Props) {
  const [revenueToggle, setRevenueToggle] = useState<'revenue' | 'orders'>('revenue')

  const revChange = pct(headline.revenueThisMonth, headline.revenueLastMonth)
  const orderChange = pct(headline.ordersThisMonth, headline.ordersLastMonth)

  const chartData = monthly.map((m) => ({
    ...m,
    revenueDisplay: m.revenue / 100,
  }))

  return (
    <div className="flex flex-col gap-12">

      {/* Headline stats */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Revenue this month"
            value={formatDollars(headline.revenueThisMonth)}
            sub={revChange}
            positive={headline.revenueThisMonth >= headline.revenueLastMonth}
          />
          <StatCard
            label="Orders this month"
            value={String(headline.ordersThisMonth)}
            sub={orderChange}
            positive={headline.ordersThisMonth >= headline.ordersLastMonth}
          />
          <StatCard
            label="Average order value"
            value={formatDollars(headline.avgOrderValue)}
          />
          <StatCard
            label="Conversion rate"
            value="—"
            sub="Needs analytics integration"
          />
        </div>
      </section>

      {/* Revenue over time */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="caption text-ink tracking-[0.12em]">REVENUE OVER TIME</h2>
          <div className="flex gap-0 border border-border">
            <button
              onClick={() => setRevenueToggle('revenue')}
              className={`px-4 py-1.5 text-xs transition-colors ${revenueToggle === 'revenue' ? 'bg-ink text-bone' : 'text-ink-muted hover:text-ink'}`}
            >
              Revenue
            </button>
            <button
              onClick={() => setRevenueToggle('orders')}
              className={`px-4 py-1.5 text-xs border-l border-border transition-colors ${revenueToggle === 'orders' ? 'bg-ink text-bone' : 'text-ink-muted hover:text-ink'}`}
            >
              Orders
            </button>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="border border-border py-16 text-center">
            <p className="text-sm text-ink-muted">No order data yet.</p>
          </div>
        ) : (
          <div className="border border-border p-4">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={revenueToggle === 'revenue' ? (v) => `$${v}` : undefined}
                />
                <Tooltip
                  contentStyle={{ border: `1px solid ${CHART_COLORS.border}`, background: '#f9f7f4', borderRadius: 0, fontSize: 12 }}
                  formatter={(v: unknown) => {
                    const n = Number(v)
                    return revenueToggle === 'revenue' ? [`$${n.toLocaleString()}`, 'Revenue'] : [n, 'Orders']
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={revenueToggle === 'revenue' ? 'revenueDisplay' : 'orders'}
                  stroke={CHART_COLORS.ink}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.ink, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Best sellers */}
      <section>
        <h2 className="caption text-ink tracking-[0.12em] mb-5">BEST SELLERS</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* By revenue */}
          <div>
            <p className="text-xs text-ink-muted mb-3">By revenue (this period)</p>
            {topArtworks.length === 0 ? (
              <div className="border border-border py-10 text-center">
                <p className="text-sm text-ink-muted">No sales data yet.</p>
              </div>
            ) : (
              <div className="border border-border p-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topArtworks.slice(0, 5).map((a) => ({ name: a.title.slice(0, 20), revenue: a.revenue / 100 }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip
                      contentStyle={{ border: `1px solid ${CHART_COLORS.border}`, background: '#f9f7f4', borderRadius: 0, fontSize: 12 }}
                      formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill={CHART_COLORS.ink} radius={0} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* By units */}
          <div>
            <p className="text-xs text-ink-muted mb-3">By units sold</p>
            {topArtworks.length === 0 ? (
              <div className="border border-border py-10 text-center">
                <p className="text-sm text-ink-muted">No sales data yet.</p>
              </div>
            ) : (
              <div className="border border-border">
                <table className="w-full text-sm">
                  {topArtworks.slice(0, 5).map((a, i) => (
                    <tr key={a.title} className={i > 0 ? 'border-t border-border' : ''}>
                      <td className="px-4 py-3 text-ink-muted text-xs">{i + 1}</td>
                      <td className="px-4 py-3 text-ink">{a.title}</td>
                      <td className="px-4 py-3 text-right text-ink-muted text-xs">{a.units} sold</td>
                    </tr>
                  ))}
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Material & framing popularity */}
      <section>
        <h2 className="caption text-ink tracking-[0.12em] mb-5">MATERIAL & FRAMING</h2>
        <p className="text-xs text-ink-muted mb-4">What your customers actually buy.</p>
        {materials.length === 0 ? (
          <div className="border border-border py-10 text-center">
            <p className="text-sm text-ink-muted">No order data yet.</p>
          </div>
        ) : (
          <div className="border border-border p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={materials}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
                <XAxis dataKey="material" tick={{ fontSize: 10, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: `1px solid ${CHART_COLORS.border}`, background: '#f9f7f4', borderRadius: 0, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: CHART_COLORS.muted }} />
                <Bar dataKey="unframed" name="Unframed" stackId="a" fill={CHART_COLORS.muted} />
                <Bar dataKey="standard" name="Standard frame" stackId="a" fill={CHART_COLORS.ink} />
                <Bar dataKey="premium" name="Premium frame" stackId="a" fill={CHART_COLORS.terracotta} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Discount performance */}
      <section>
        <h2 className="caption text-ink tracking-[0.12em] mb-5">DISCOUNT PERFORMANCE</h2>
        {discountPerf.length === 0 ? (
          <div className="border border-border px-6 py-8">
            <p className="text-sm text-ink-muted leading-relaxed">
              No discount codes have been used yet. Once customers start using codes, you'll see
              redemption counts and revenue here.
            </p>
          </div>
        ) : (
          <div className="border border-border max-w-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bone-dark">
                  <th className="text-left px-5 py-3 text-xs text-ink-muted font-normal">Discount</th>
                  <th className="text-right px-5 py-3 text-xs text-ink-muted font-normal">Uses</th>
                  <th className="text-right px-5 py-3 text-xs text-ink-muted font-normal">Order revenue</th>
                  <th className="text-right px-5 py-3 text-xs text-ink-muted font-normal">Discounted</th>
                </tr>
              </thead>
              <tbody>
                {discountPerf.map((d) => (
                  <tr key={d.name} className="border-t border-border">
                    <td className="px-5 py-3">
                      <p className="text-ink">{d.name}</p>
                      {d.code && <p className="text-xs font-mono text-ink-muted">{d.code}</p>}
                    </td>
                    <td className="px-5 py-3 text-right text-ink">{d.redemptions}</td>
                    <td className="px-5 py-3 text-right text-ink">{formatDollars(d.total_order_revenue)}</td>
                    <td className="px-5 py-3 text-right text-terracotta">−{formatDollars(d.total_discounted)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
