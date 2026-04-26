import { Resend } from 'resend'
import type { OrderWithItems } from '@/types'
import {
  printerEmailHtml,
  customerConfirmationHtml,
  adminNotificationHtml,
  shippedNotificationHtml,
} from './templates'

let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured')
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

const FROM_ADDRESS = process.env.EMAIL_FROM ?? 'Domestic Eclectic <studio@domesticeclectic.com.au>'

export async function sendPrinterEmail(order: OrderWithItems, printFileUrl?: string) {
  const resend = getResend()
  const printerEmail = process.env.PRINTER_EMAIL ?? 'southernbuoy@gmail.com'

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: printerEmail,
    subject: `New Drop Ship Order — Domestic Eclectic — ${order.order_number}`,
    html: printerEmailHtml(order, printFileUrl),
  })
}

export async function sendCustomerConfirmationEmail(order: OrderWithItems) {
  const resend = getResend()

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: order.customer_email,
    subject: 'Your Domestic Eclectic order is confirmed',
    html: customerConfirmationHtml(order),
  })
}

export async function sendAdminNotificationEmail(order: OrderWithItems) {
  const resend = getResend()
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return // no admin email configured

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: adminEmail,
    subject: `New order: ${order.order_number} — ${formatCents(order.total_aud)}`,
    html: adminNotificationHtml(order, siteUrl),
  })
}

export async function sendShippedEmail(order: OrderWithItems, trackingNumber?: string) {
  const resend = getResend()

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: order.customer_email,
    subject: `Your order is on its way — ${order.order_number}`,
    html: shippedNotificationHtml(order, trackingNumber),
  })
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AUD`
}
