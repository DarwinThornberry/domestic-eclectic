'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import type { OrderStatus, Settings, PricingMode } from '@/types'

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  extra: Record<string, unknown> = {},
) {
  const supabase = createAdminClient()
  const timestampField: Partial<Record<OrderStatus, string>> = {
    sent_to_printer: 'sent_to_printer_at',
    shipped:         'shipped_at',
    delivered:       'delivered_at',
    cancelled:       'cancelled_at',
    refunded:        'refunded_at',
  }
  const tsField = timestampField[status]
  const update: Record<string, unknown> = {
    status,
    ...extra,
    ...(tsField ? { [tsField]: new Date().toISOString() } : {}),
  }
  const { error } = await supabase.from('orders').update(update).eq('id', orderId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin/orders')
  revalidatePath('/admin')
}

export async function addOrderNote(orderId: string, notes: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('orders').update({ notes }).eq('id', orderId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/orders/${orderId}`)
}

export async function refundOrder(orderId: string) {
  const supabase = createAdminClient()
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, stripe_payment_intent, status')
    .eq('id', orderId)
    .single()

  if (fetchError || !order) throw new Error('Order not found')
  if (!order.stripe_payment_intent) throw new Error('No payment intent on this order')

  const stripe = getStripe()
  await stripe.refunds.create({ payment_intent: order.stripe_payment_intent })
  await updateOrderStatus(orderId, 'refunded')
}

export async function sendToPrinter(orderId: string) {
  const supabase = createAdminClient()

  // Fetch full order with items for the email
  const { data: order, error } = await supabase
    .from('orders')
    .select(`*, order_items(*, artworks(slug, thumbnail_url, hi_res_file_url))`)
    .eq('id', orderId)
    .single()

  if (error || !order) throw new Error('Order not found')

  // Generate signed URL for the first artwork's print file (if available)
  let printFileUrl: string | undefined
  const firstItem = order.order_items?.[0]
  const hiResPath = firstItem?.artworks?.hi_res_file_url
  if (hiResPath) {
    const { data } = await supabase.storage
      .from('artwork-hires')
      .createSignedUrl(hiResPath, 60 * 60 * 24 * 30) // 30 days
    printFileUrl = data?.signedUrl
  }

  // Send the email
  const { sendPrinterEmail } = await import('@/lib/email')
  await sendPrinterEmail(order as any, printFileUrl)

  await updateOrderStatus(orderId, 'sent_to_printer')
}

export async function markShipped(orderId: string, trackingNumber?: string) {
  const supabase = createAdminClient()
  const { data: order } = await supabase
    .from('orders')
    .select(`*, order_items(*, artworks(slug, thumbnail_url))`)
    .eq('id', orderId)
    .single()

  if (order) {
    const { sendShippedEmail } = await import('@/lib/email')
    await sendShippedEmail(order as any, trackingNumber).catch(console.warn)
  }

  await updateOrderStatus(orderId, 'shipped', trackingNumber ? { tracking_number: trackingNumber } : {})
}

// ─── Artworks ─────────────────────────────────────────────────────────────────

export async function saveArtwork(
  data: Record<string, unknown>,
  artworkId?: string,
) {
  const supabase = createAdminClient()

  if (artworkId) {
    const { error } = await supabase.from('artworks').update(data).eq('id', artworkId)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('artworks').insert(data)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/artworks')
  revalidatePath('/works')
}

export async function archiveArtwork(artworkId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('artworks')
    .update({ is_published: false, updated_at: new Date().toISOString() })
    .eq('id', artworkId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/artworks')
  revalidatePath('/works', 'layout')
}

export async function reorderArtworks(orderedIds: string[]) {
  const supabase = createAdminClient()
  const updates = orderedIds.map((id, index) =>
    supabase.from('artworks').update({ sort_order: index }).eq('id', id),
  )
  await Promise.all(updates)
  revalidatePath('/admin/artworks')
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function saveSettings(data: Partial<Omit<Settings, 'id' | 'updated_at'>>) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('settings')
    .upsert({ id: 1, ...data, updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/settings', 'layout')
}

// ─── Artwork pricing ─────────────────────────────────────────────────────────

export async function saveArtworkPricing(
  artworkId: string,
  pricingMode: PricingMode,
  customMarkup: number | null,
  fixedPrices: Record<string, number> | null,
  customMarkupSmall?: number | null,
  customMarkupMedium?: number | null,
  customMarkupLarge?: number | null,
  priceOverrides?: Record<string, number> | null,
) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('artworks')
    .update({
      pricing_mode:          pricingMode,
      custom_markup:         customMarkup,
      fixed_prices:          fixedPrices,
      custom_markup_small:   customMarkupSmall  ?? null,
      custom_markup_medium:  customMarkupMedium ?? null,
      custom_markup_large:   customMarkupLarge  ?? null,
      price_overrides:       priceOverrides     ?? null,
    })
    .eq('id', artworkId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/artworks/${artworkId}/edit`)
  revalidatePath('/admin/settings/pricing/strategy')
}

// ─── Contact messages ─────────────────────────────────────────────────────────

export async function markMessageRead(messageId: string, isRead: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('contact_messages')
    .update({ is_read: isRead })
    .eq('id', messageId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/messages')
}

// ─── Discounts ────────────────────────────────────────────────────────────────

interface DiscountPayload {
  name: string
  code: string | null
  discount_type: 'percentage' | 'fixed'
  value: number
  applies_to: 'order' | 'specific_artworks' | 'material'
  applies_to_data: unknown
  minimum_spend_aud: number | null
  max_total_uses: number | null
  max_uses_per_customer: number
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
}

export async function saveDiscount(payload: DiscountPayload, discountId?: string) {
  const supabase = createAdminClient()
  const data = {
    ...payload,
    code: payload.code ? payload.code.toUpperCase().trim() : null,
  }

  if (discountId) {
    const { error } = await supabase.from('discounts').update(data).eq('id', discountId)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('discounts').insert(data)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/settings/pricing/discounts')
}

export async function deleteDiscount(discountId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('discounts').delete().eq('id', discountId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/settings/pricing/discounts')
}

export async function toggleDiscountActive(discountId: string, isActive: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('discounts')
    .update({ is_active: isActive })
    .eq('id', discountId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/settings/pricing/discounts')
}
