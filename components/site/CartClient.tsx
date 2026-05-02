'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Minus, Plus, X, ArrowRight, Loader2, ChevronDown, ChevronUp, Tag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { calculateShipping, formatPrice } from '@/lib/pricing/southern-buoy'
import { MATERIAL_LABELS, FRAMING_LABELS, SIZE_LABELS } from '@/lib/constants'
import { LaunchSignupBlock } from '@/components/site/LaunchSignupBlock'
import { ArtworkMonogram } from '@/components/ui/ArtworkMonogram'

const COUNTRIES = [
  { code: 'AU', label: 'Australia' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'WORLD', label: 'Rest of World' },
]

interface Props {
  storeLive: boolean
}

export function CartClient({ storeLive }: Props) {
  const { items, totals, updateQuantity, removeItem, mounted } = useCart()
  const [country, setCountry] = useState('AU')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Discount code state
  const [discountOpen, setDiscountOpen] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
  const [discountError, setDiscountError] = useState<string | null>(null)
  const [discountLoading, setDiscountLoading] = useState(false)
  const [discountPreview, setDiscountPreview] = useState<{
    label: string
    amountAud: number
  } | null>(null)

  const shippingAud = mounted && items.length
    ? calculateShipping(
        items.map((i) => ({ size: i.size, framing: i.framing, quantity: i.quantity })),
        country,
      )
    : 0

  const subtotalAud = totals.subtotalAud
  const discountAud = discountPreview?.amountAud ?? 0
  const totalAud = subtotalAud + shippingAud - discountAud

  async function handleApplyCode() {
    if (!discountCode.trim()) return
    setDiscountError(null)
    setDiscountLoading(true)
    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode.trim().toUpperCase(),
          subtotalAud,
          items: items.map((i) => ({
            artwork_id: i.artwork_id,
            material: i.material,
            line_total_aud: i.line_total_aud,
          })),
        }),
      })
      const data = await res.json()
      if (data.error) {
        setDiscountError(data.error)
        setAppliedCode(null)
        setDiscountPreview(null)
      } else {
        setAppliedCode(data.code)
        setDiscountPreview({ label: data.label, amountAud: data.amountAud })
        setDiscountCode('')
        setDiscountOpen(false)
      }
    } catch {
      setDiscountError('Could not validate code. Check your connection.')
    } finally {
      setDiscountLoading(false)
    }
  }

  function handleRemoveCode() {
    setAppliedCode(null)
    setDiscountPreview(null)
    setDiscountError(null)
    setDiscountCode('')
  }

  async function handleCheckout() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, country, discountCode: appliedCode }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Unable to start checkout. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-24">
        <div className="animate-pulse h-8 w-32 bg-bone-dark rounded mb-8" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-24">

      {/* Header */}
      <div className="mb-10">
        <p className="caption text-terracotta mb-2 tracking-[0.16em]">YOUR ORDER</p>
        <h1 className="font-display text-4xl italic text-ink">
          Cart
          {totals.itemCount > 0 && (
            <span className="font-body text-xl not-italic text-ink-muted ml-3">
              ({totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'})
            </span>
          )}
        </h1>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="py-20">
          <p className="font-display text-2xl italic text-ink-muted mb-6">
            No works in your cart yet.
          </p>
          <Link
            href="/works"
            className="inline-flex items-center gap-2 caption text-ink border-b border-ink pb-px hover:text-terracotta hover:border-terracotta transition-colors"
          >
            View Works <ArrowRight size={12} />
          </Link>
          {!storeLive && (
            <div className="mt-16 max-w-md">
              <LaunchSignupBlock source="cart" />
            </div>
          )}
        </div>
      )}

      {/* Cart contents + order summary */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 items-start">

          {/* Line items */}
          <div>
            {items.map((item, idx) => {
              const materialLabel = MATERIAL_LABELS[item.material] ?? item.material
              const sizeLabel = SIZE_LABELS[item.size] ?? item.size
              const framingLabel = FRAMING_LABELS[item.framing] ?? item.framing

              return (
                <div
                  key={item.id}
                  className={`flex gap-5 py-7 ${idx > 0 ? 'border-t border-border' : ''}`}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 border border-border overflow-hidden bg-canvas"
                    style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)' }}
                  >
                    {item.artwork_thumbnail ? (
                      <div className="absolute inset-0">
                        <Image
                          src={item.artwork_thumbnail}
                          alt={item.artwork_title}
                          fill
                          sizes="96px"
                          className="object-cover select-none artwork-img"
                          onContextMenu={(e) => e.preventDefault()}
                          draggable={false}
                        />
                        <ArtworkMonogram />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-bone-dark flex items-center justify-center">
                        <span className="font-display text-2xl italic text-ink/20 select-none">
                          {item.artwork_title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/works/${item.artwork_slug}`}
                          className="font-display text-xl italic text-ink hover:text-terracotta transition-colors leading-tight"
                        >
                          {item.artwork_title}
                        </Link>
                        <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
                          {materialLabel} · {sizeLabel} · {framingLabel}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                        className="shrink-0 text-ink-muted hover:text-ink transition-colors mt-0.5"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    {/* Qty + line total */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
                          aria-label="Decrease"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm text-ink">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
                          aria-label="Increase"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <p className="font-display italic text-ink text-lg">
                        {formatPrice(item.line_total_aud)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order summary */}
          <div className="lg:sticky lg:top-8 flex flex-col gap-4">
            <div className="border border-border p-6">
              <p className="caption text-ink mb-6 tracking-[0.12em]">ORDER SUMMARY</p>

              {/* Country selector */}
              <div className="mb-5">
                <label htmlFor="country" className="text-xs text-ink-muted mb-1.5 block">
                  Shipping to
                </label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-ink/[0.35] bg-ink/[0.08] px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink transition-all"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Totals */}
              <div className="flex flex-col gap-3 py-5 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Subtotal</span>
                  <span className="text-ink">{formatPrice(subtotalAud)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Shipping</span>
                  <span className="text-ink">{formatPrice(shippingAud)}</span>
                </div>

                {discountPreview && (
                  <div className="flex justify-between text-sm items-center">
                    <div className="flex items-center gap-1.5 text-olive">
                      <Tag size={11} />
                      <span>{discountPreview.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-olive">−{formatPrice(discountAud)}</span>
                      <button
                        onClick={handleRemoveCode}
                        className="text-ink-muted hover:text-ink transition-colors"
                        aria-label="Remove discount"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between py-4 border-t border-border">
                <span className="font-display italic text-ink text-lg">Total</span>
                <span className="font-display italic text-ink text-lg">{formatPrice(Math.max(0, totalAud))}</span>
              </div>

              {/* Discount code — only show when store is live */}
              {storeLive && (
                <div className="border-t border-border pt-4 mb-4">
                  {!appliedCode ? (
                    <div>
                      <button
                        onClick={() => setDiscountOpen((v) => !v)}
                        className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
                      >
                        <Tag size={12} />
                        Have a discount code?
                        {discountOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>
                      {discountOpen && (
                        <div className="mt-3 flex flex-col gap-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={discountCode}
                              onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(null) }}
                              onKeyDown={(e) => e.key === 'Enter' && handleApplyCode()}
                              placeholder="DISCOUNT CODE"
                              className="flex-1 border border-ink/[0.35] bg-ink/[0.08] px-3 py-2 text-sm text-ink uppercase tracking-wide placeholder:text-ink/50 focus:outline-none focus:border-ink transition-all"
                            />
                            <button
                              onClick={handleApplyCode}
                              disabled={discountLoading || !discountCode.trim()}
                              className="bg-ink text-bone px-4 py-2 text-sm hover:bg-terracotta transition-colors disabled:opacity-60 flex items-center gap-1.5 whitespace-nowrap"
                            >
                              {discountLoading && <Loader2 size={11} className="animate-spin" />}
                              Apply
                            </button>
                          </div>
                          {discountError && (
                            <p className="text-xs text-terracotta">{discountError}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-olive">
                      <Tag size={11} />
                      <span>Code <strong>{appliedCode}</strong> applied</span>
                    </div>
                  )}
                </div>
              )}

              {storeLive && (
                <>
                  {error && (
                    <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 mb-4">
                      {error}
                    </p>
                  )}
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-4 bg-ink text-bone text-sm hover:bg-terracotta transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Redirecting…
                      </>
                    ) : (
                      'Checkout'
                    )}
                  </button>
                  <p className="text-xs text-ink-muted text-center mt-3">
                    You will be redirected to Stripe to complete payment securely.
                  </p>
                </>
              )}
            </div>

            {/* Coming soon block — replaces checkout when store is not live */}
            {!storeLive && <LaunchSignupBlock source="cart" />}
          </div>
        </div>
      )}
    </div>
  )
}
