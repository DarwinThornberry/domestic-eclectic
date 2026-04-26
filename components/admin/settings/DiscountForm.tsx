'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { saveDiscount } from '@/app/admin/actions'
import type { Discount } from '@/types'

interface Props {
  discount?: Partial<Discount>
  artworks: { id: string; title: string }[]
}

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-ink-muted block mb-1.5">{label}</label>
      {children}
      {help && <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">{help}</p>}
    </div>
  )
}

const MATERIALS = [
  { value: 'cotton_rag_smooth',   label: 'Cotton Rag Smooth' },
  { value: 'cotton_rag_textured', label: 'Cotton Rag Textured' },
  { value: 'canvas_satin',        label: 'Canvas Satin' },
  { value: 'canvas_lustre',       label: 'Canvas Lustre' },
]

export function DiscountForm({ discount, artworks }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(discount?.name ?? '')
  const [code, setCode] = useState(discount?.code ?? '')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(discount?.discount_type ?? 'percentage')
  const [value, setValue] = useState(String(discount?.value ?? ''))
  const [appliesTo, setAppliesTo] = useState<'order' | 'specific_artworks' | 'material'>(discount?.applies_to ?? 'order')
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>(
    Array.isArray(discount?.applies_to_data) ? discount.applies_to_data as string[] : []
  )
  const [selectedMaterial, setSelectedMaterial] = useState(
    typeof discount?.applies_to_data === 'string' ? discount.applies_to_data : ''
  )
  const [minSpend, setMinSpend] = useState(
    discount?.minimum_spend_aud ? String(discount.minimum_spend_aud / 100) : ''
  )
  const [maxTotalUses, setMaxTotalUses] = useState(
    discount?.max_total_uses ? String(discount.max_total_uses) : ''
  )
  const [maxPerCustomer, setMaxPerCustomer] = useState(String(discount?.max_uses_per_customer ?? 1))
  const [startsAt, setStartsAt] = useState(
    discount?.starts_at ? discount.starts_at.slice(0, 16) : ''
  )
  const [endsAt, setEndsAt] = useState(
    discount?.ends_at ? discount.ends_at.slice(0, 16) : ''
  )
  const [isActive, setIsActive] = useState(discount?.is_active ?? true)

  function toggleArtwork(id: string) {
    setSelectedArtworks((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  function buildAppliesToData() {
    if (appliesTo === 'specific_artworks') return selectedArtworks
    if (appliesTo === 'material') return selectedMaterial || null
    return null
  }

  function handleSave() {
    if (!name.trim()) { setError('Name is required.'); return }
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue <= 0) { setError('Enter a valid discount value.'); return }
    if (discountType === 'percentage' && numValue > 100) { setError('Percentage cannot exceed 100%.'); return }

    setError(null)
    startTransition(async () => {
      try {
        await saveDiscount({
          name: name.trim(),
          code: code.trim() || null,
          discount_type: discountType,
          value: discountType === 'fixed' ? Math.round(numValue * 100) : numValue,
          applies_to: appliesTo,
          applies_to_data: buildAppliesToData(),
          minimum_spend_aud: minSpend ? Math.round(parseFloat(minSpend) * 100) : null,
          max_total_uses: maxTotalUses ? parseInt(maxTotalUses) : null,
          max_uses_per_customer: parseInt(maxPerCustomer) || 1,
          starts_at: startsAt ? new Date(startsAt).toISOString() : null,
          ends_at: endsAt ? new Date(endsAt).toISOString() : null,
          is_active: isActive,
        }, discount?.id)
        router.push('/admin/settings/pricing/discounts')
      } catch (e: any) {
        setError(e.message ?? 'Could not save. Please try again.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      {error && (
        <p className="text-sm text-terracotta border border-terracotta/30 bg-terracotta/5 px-4 py-3">{error}</p>
      )}

      <Field label="Name (for your reference)" help="Only visible in admin — your customers never see this.">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Summer sale, Subscriber gift"
          className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
        />
      </Field>

      <Field
        label="Discount code (optional)"
        help="This is what customers type at checkout. Leave blank to apply the discount automatically to qualifying orders — no code required."
      >
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. SUMMER20"
          className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink uppercase focus:outline-none focus:border-ink transition-colors"
        />
      </Field>

      <Field label="Discount type">
        <div className="flex gap-4 mt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="discountType" checked={discountType === 'percentage'} onChange={() => setDiscountType('percentage')} className="accent-ink" />
            <span className="text-sm text-ink">Percentage off</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="discountType" checked={discountType === 'fixed'} onChange={() => setDiscountType('fixed')} className="accent-ink" />
            <span className="text-sm text-ink">Fixed amount off</span>
          </label>
        </div>
      </Field>

      <Field
        label={discountType === 'percentage' ? 'Percentage off' : 'Amount off (AUD)'}
        help={discountType === 'percentage' ? 'Enter a number between 1 and 100.' : 'Enter the dollar amount to discount, e.g. 25 for $25 off.'}
      >
        <div className="flex items-center gap-2">
          {discountType === 'fixed' && <span className="text-sm text-ink-muted">$</span>}
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            min="0.01"
            step={discountType === 'percentage' ? '1' : '0.01'}
            className="w-28 border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
          />
          {discountType === 'percentage' && <span className="text-sm text-ink-muted">% off</span>}
        </div>
      </Field>

      <Field
        label="Applies to"
        help="Choose whether this discount applies to the entire order or only certain works/materials."
      >
        <select
          value={appliesTo}
          onChange={(e) => setAppliesTo(e.target.value as typeof appliesTo)}
          className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
        >
          <option value="order">Whole order</option>
          <option value="specific_artworks">Specific works</option>
          <option value="material">Specific material</option>
        </select>
      </Field>

      {appliesTo === 'specific_artworks' && (
        <Field label="Select works" help="The discount applies only when one of these works is in the cart.">
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto border border-border p-3">
            {artworks.length === 0 && (
              <p className="text-sm text-ink-muted">No published works found.</p>
            )}
            {artworks.map((a) => (
              <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedArtworks.includes(a.id)}
                  onChange={() => toggleArtwork(a.id)}
                  className="accent-ink"
                />
                <span className="text-sm text-ink">{a.title}</span>
              </label>
            ))}
          </div>
        </Field>
      )}

      {appliesTo === 'material' && (
        <Field label="Select material" help="The discount applies only when this material is in the cart.">
          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
          >
            <option value="">Choose a material…</option>
            {MATERIALS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </Field>
      )}

      <Field
        label="Minimum spend (optional, AUD)"
        help="The cart subtotal must reach this amount before the discount applies. Leave blank for no minimum."
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink-muted">$</span>
          <input
            type="number"
            value={minSpend}
            onChange={(e) => setMinSpend(e.target.value)}
            min="0"
            step="1"
            placeholder="No minimum"
            className="w-32 border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
          />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Max total uses (optional)"
          help="Limit urgency. Leave blank for unlimited."
        >
          <input
            type="number"
            value={maxTotalUses}
            onChange={(e) => setMaxTotalUses(e.target.value)}
            min="1"
            placeholder="Unlimited"
            className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
          />
        </Field>
        <Field
          label="Max uses per customer"
          help="How many times one person can use this."
        >
          <input
            type="number"
            value={maxPerCustomer}
            onChange={(e) => setMaxPerCustomer(e.target.value)}
            min="1"
            className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Start date & time (optional)"
          help="Leave blank to activate immediately."
        >
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
          />
        </Field>
        <Field
          label="End date & time (optional)"
          help="Set an end date to schedule a sale automatically. Leave blank for open-ended."
        >
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
          />
        </Field>
      </div>

      <Field label="Status" help="Paused discounts are saved but not applied at checkout.">
        <div className="flex gap-4 mt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="isActive" checked={isActive} onChange={() => setIsActive(true)} className="accent-ink" />
            <span className="text-sm text-ink">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="isActive" checked={!isActive} onChange={() => setIsActive(false)} className="accent-ink" />
            <span className="text-sm text-ink">Paused</span>
          </label>
        </div>
      </Field>

      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-ink text-bone px-5 py-3 text-sm hover:bg-terracotta transition-colors disabled:opacity-60"
        >
          {isPending && <Loader2 size={12} className="animate-spin" />}
          {discount?.id ? 'Save changes' : 'Create discount'}
        </button>
        <button
          onClick={() => router.push('/admin/settings/pricing/discounts')}
          className="text-sm text-ink-muted hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
