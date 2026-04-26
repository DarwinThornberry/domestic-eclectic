import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface ValidateBody {
  code: string
  subtotalAud: number
  items: Array<{ artwork_id: string; material: string; line_total_aud: number }>
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ValidateBody
    const code = body.code?.trim().toUpperCase()

    if (!code) {
      return NextResponse.json({ error: 'Enter a discount code.' }, { status: 400 })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ error: 'Store not configured.' }, { status: 500 })
    }

    const supabase = createAdminClient()

    const { data: discount, error } = await supabase
      .from('discounts')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single()

    if (error || !discount) {
      return NextResponse.json({ error: 'That code is not valid or has expired.' }, { status: 400 })
    }

    const now = new Date()

    // Date range check
    if (discount.starts_at && new Date(discount.starts_at) > now) {
      return NextResponse.json({ error: 'That code is not active yet.' }, { status: 400 })
    }
    if (discount.ends_at && new Date(discount.ends_at) < now) {
      return NextResponse.json({ error: 'That code has expired.' }, { status: 400 })
    }

    // Total uses check
    if (discount.max_total_uses !== null) {
      const { count } = await supabase
        .from('discount_redemptions')
        .select('*', { count: 'exact', head: true })
        .eq('discount_id', discount.id)

      if ((count ?? 0) >= discount.max_total_uses) {
        return NextResponse.json({ error: 'That code has reached its usage limit.' }, { status: 400 })
      }
    }

    // Minimum spend check
    if (discount.minimum_spend_aud !== null && body.subtotalAud < discount.minimum_spend_aud) {
      const min = (discount.minimum_spend_aud / 100).toFixed(0)
      return NextResponse.json(
        { error: `This code requires a minimum spend of $${min}.` },
        { status: 400 },
      )
    }

    // Calculate discount amount
    const amountAud = computeDiscountAmount(discount, body.subtotalAud, body.items)

    if (amountAud <= 0) {
      return NextResponse.json(
        { error: 'This code does not apply to any items in your cart.' },
        { status: 400 },
      )
    }

    const label = discount.discount_type === 'percentage'
      ? `${discount.value}% off`
      : `$${(discount.value / 100).toFixed(0)} off`

    return NextResponse.json({ code: discount.code, label, amountAud })
  } catch (err) {
    console.error('[discount/validate]', err)
    return NextResponse.json({ error: 'Could not validate code.' }, { status: 500 })
  }
}

function computeDiscountAmount(
  discount: any,
  subtotalAud: number,
  items: ValidateBody['items'],
): number {
  if (discount.applies_to === 'specific_artworks') {
    const artworkIds: string[] = discount.applies_to_data ?? []
    const eligibleSubtotal = items
      .filter((i) => artworkIds.includes(i.artwork_id))
      .reduce((sum, i) => sum + i.line_total_aud, 0)
    return applyDiscount(discount, eligibleSubtotal)
  }

  if (discount.applies_to === 'material') {
    const material: string = discount.applies_to_data ?? ''
    const eligibleSubtotal = items
      .filter((i) => i.material === material)
      .reduce((sum, i) => sum + i.line_total_aud, 0)
    return applyDiscount(discount, eligibleSubtotal)
  }

  return applyDiscount(discount, subtotalAud)
}

function applyDiscount(discount: any, amountCents: number): number {
  if (discount.discount_type === 'percentage') {
    return Math.round(amountCents * (discount.value / 100))
  }
  // fixed: value is already in cents
  return Math.min(discount.value, amountCents)
}
