import type { OrderWithItems } from '@/types'

// Shared email styles — inline for maximum email client compatibility
const styles = {
  body: 'font-family: Georgia, "Times New Roman", serif; background-color: #F5F1EA; margin: 0; padding: 0; color: #1A1814;',
  wrap: 'max-width: 560px; margin: 0 auto; padding: 40px 24px;',
  wordmarkTop: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 9px; letter-spacing: 4px; color: #4A4540; text-transform: uppercase; margin: 0 0 2px;',
  wordmarkBottom: 'font-family: Georgia, serif; font-size: 20px; font-style: italic; color: #1A1814; margin: 0 0 32px;',
  h2: 'font-family: Georgia, serif; font-size: 22px; font-style: italic; font-weight: 400; color: #1A1814; margin: 0 0 8px;',
  lead: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 14px; color: #4A4540; line-height: 1.6; margin: 0 0 24px;',
  sectionLabel: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 10px; letter-spacing: 3px; color: #9A6B4F; text-transform: uppercase; margin: 24px 0 10px; padding-top: 20px; border-top: 1px solid #E5DFD5;',
  itemTitle: 'font-family: Georgia, serif; font-size: 16px; font-style: italic; color: #1A1814; margin: 0 0 2px;',
  itemDetail: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 12px; color: #4A4540; margin: 0 0 8px;',
  small: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 12px; color: #4A4540;',
  mono: 'font-family: "Courier New", monospace; font-size: 11px; color: #4A4540;',
  address: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 13px; color: #1A1814; line-height: 1.8;',
  totalRow: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 13px; color: #4A4540; padding: 4px 0;',
  totalFinal: 'font-family: Georgia, serif; font-size: 15px; font-style: italic; color: #1A1814; padding: 10px 0 0; border-top: 1px solid #E5DFD5; margin-top: 4px;',
  btn: 'display: inline-block; background: #1A1814; color: #F5F1EA; font-family: "Helvetica Neue", Arial, sans-serif; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; padding: 14px 28px; margin-top: 24px;',
  footer: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 11px; color: #4A4540; border-top: 1px solid #E5DFD5; margin-top: 40px; padding-top: 20px; line-height: 1.7;',
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AUD`
}

function wordmark(): string {
  return `
    <p style="${styles.wordmarkTop}">DOMESTIC</p>
    <p style="${styles.wordmarkBottom}">Eclectic</p>
  `
}

function itemsBlock(order: OrderWithItems): string {
  return order.order_items.map((item) => `
    <div style="margin-bottom: 16px;">
      <p style="${styles.itemTitle}">${item.artwork_title_snapshot}</p>
      <p style="${styles.itemDetail}">${item.material.replace(/_/g, ' ')} · ${item.size.replace('x', ' × ')} mm · ${item.framing.replace(/_/g, ' ')} · Qty ${item.quantity}</p>
      <p style="${styles.itemDetail}">Line total: ${formatCents(item.line_total_aud)}</p>
    </div>
  `).join('')
}

function addressBlock(order: OrderWithItems): string {
  const a = order.shipping_address
  return `
    <p style="${styles.address}">
      ${a.name}<br>
      ${a.line1}${a.line2 ? '<br>' + a.line2 : ''}<br>
      ${a.city}${a.state ? ', ' + a.state : ''} ${a.postal_code}<br>
      ${a.country}
    </p>
  `
}

export function printerEmailHtml(order: OrderWithItems, printFileUrl?: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Print Order — ${order.order_number}</title></head>
<body style="${styles.body}">
<div style="${styles.wrap}">
  ${wordmark()}
  <h2 style="${styles.h2}">New Drop Ship Order</h2>
  <p style="${styles.lead}">Please print and ship the following order directly to the customer. This order is for Domestic Eclectic, managed by Lara Stocco.</p>

  <p style="${styles.sectionLabel}">Order</p>
  <p style="${styles.small}"><strong>${order.order_number}</strong> · Placed ${new Date(order.created_at).toLocaleDateString('en-AU', { dateStyle: 'long' })}</p>

  <p style="${styles.sectionLabel}">Items</p>
  ${itemsBlock(order)}

  ${printFileUrl ? `
  <p style="${styles.sectionLabel}">Print File</p>
  <p style="${styles.small}">The high-resolution print file is available for download below. This link expires in 30 days.</p>
  <a href="${printFileUrl}" style="${styles.btn}">Download print file</a>
  ` : `
  <p style="${styles.sectionLabel}">Print File</p>
  <p style="${styles.small}">The print file will be sent separately or is already on file.</p>
  `}

  <p style="${styles.sectionLabel}">Ship To</p>
  ${addressBlock(order)}

  <p style="${styles.sectionLabel}">Totals</p>
  <p style="${styles.totalRow}">Subtotal: ${formatCents(order.subtotal_aud)}</p>
  <p style="${styles.totalRow}">Shipping: ${formatCents(order.shipping_aud)}</p>
  <p style="${styles.totalFinal}">Total: ${formatCents(order.total_aud)}</p>

  <p style="${styles.footer}">
    Questions about this order? Contact Lara Stocco at lara@domesticeclectic.com.au<br>
    Domestic Eclectic · Fine Art Prints by Lara Stocco
  </p>
</div>
</body></html>`
}

export function customerConfirmationHtml(order: OrderWithItems): string {
  const firstName = order.customer_name.split(' ')[0]

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Order confirmed — ${order.order_number}</title></head>
<body style="${styles.body}">
<div style="${styles.wrap}">
  ${wordmark()}
  <h2 style="${styles.h2}">Thank you, ${firstName}.</h2>
  <p style="${styles.lead}">Your order has been confirmed. We'll be in touch when your print is on its way.</p>

  <p style="${styles.sectionLabel}">Your Order — ${order.order_number}</p>
  ${itemsBlock(order)}

  <p style="${styles.sectionLabel}">Shipping To</p>
  ${addressBlock(order)}

  <p style="${styles.sectionLabel}">Order Total</p>
  <p style="${styles.totalRow}">Subtotal: ${formatCents(order.subtotal_aud)}</p>
  <p style="${styles.totalRow}">Shipping: ${formatCents(order.shipping_aud)}</p>
  <p style="${styles.totalFinal}">Total: ${formatCents(order.total_aud)}</p>

  <p style="${styles.sectionLabel}">What happens next</p>
  <p style="${styles.small}">Your print will be produced on archival materials by Southern Buoy in Mornington, Victoria. Australian orders typically arrive within 7–14 business days of dispatch. You'll receive a shipping notification once your order leaves the studio.</p>
  <p style="${styles.small}" style="margin-top: 12px;">Questions? Reply to this email or visit <a href="https://domesticeclectic.com.au/contact" style="color: #9A6B4F;">our contact page</a>.</p>

  <p style="${styles.footer}">
    Domestic Eclectic · Fine Art Prints by Lara Stocco<br>
    Printed and fulfilled by Southern Buoy, Mornington VIC
  </p>
</div>
</body></html>`
}

export function adminNotificationHtml(order: OrderWithItems, siteUrl: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>New order — ${order.order_number}</title></head>
<body style="${styles.body}">
<div style="${styles.wrap}">
  ${wordmark()}
  <h2 style="${styles.h2}">New order received.</h2>

  <p style="${styles.small}"><strong>${order.order_number}</strong> · ${formatCents(order.total_aud)} · ${order.customer_name} (${order.customer_email})</p>
  <br>
  ${itemsBlock(order)}

  <a href="${siteUrl}/admin/orders/${order.id}" style="${styles.btn}">View order in studio</a>

  <p style="${styles.footer}">Domestic Eclectic Studio</p>
</div>
</body></html>`
}

export function shippedNotificationHtml(order: OrderWithItems, trackingNumber?: string): string {
  const firstName = order.customer_name.split(' ')[0]

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Your order is on its way — ${order.order_number}</title></head>
<body style="${styles.body}">
<div style="${styles.wrap}">
  ${wordmark()}
  <h2 style="${styles.h2}">Your order is on its way, ${firstName}.</h2>
  <p style="${styles.lead}">Your print has been dispatched by Southern Buoy in Mornington, Victoria.</p>

  ${trackingNumber ? `
  <p style="${styles.sectionLabel}">Tracking</p>
  <p style="${styles.small}">Your tracking number is: <strong>${trackingNumber}</strong></p>
  ` : ''}

  <p style="${styles.sectionLabel}">Order</p>
  <p style="${styles.small}">${order.order_number}</p>
  ${itemsBlock(order)}

  <p style="${styles.sectionLabel}">Shipping To</p>
  ${addressBlock(order)}

  <p style="${styles.footer}">
    Questions? Reply to this email.<br>
    Domestic Eclectic · Fine Art Prints by Lara Stocco
  </p>
</div>
</body></html>`
}
