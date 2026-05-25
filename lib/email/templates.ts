import type { OrderWithItems } from '@/types'

// Shared email styles — inline for maximum email client compatibility
const styles = {
  body: 'font-family: Georgia, "Times New Roman", serif; background-color: #F2EBD9; margin: 0; padding: 0; color: #1A1814;',
  wrap: 'max-width: 560px; margin: 0 auto; padding: 40px 24px;',
  wordmarkTop: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 9px; letter-spacing: 4px; color: #4A4540; text-transform: uppercase; margin: 0 0 2px;',
  wordmarkBottom: 'font-family: Georgia, serif; font-size: 20px; font-style: italic; color: #1A1814; margin: 0 0 32px;',
  h2: 'font-family: Georgia, serif; font-size: 22px; font-style: italic; font-weight: 400; color: #1A1814; margin: 0 0 8px;',
  lead: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 14px; color: #4A4540; line-height: 1.6; margin: 0 0 24px;',
  sectionLabel: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 10px; letter-spacing: 3px; color: #9A6B4F; text-transform: uppercase; margin: 24px 0 10px; padding-top: 20px; border-top: 1px solid #E5DFD5;',
  itemTitle: 'font-family: Georgia, serif; font-size: 16px; font-style: italic; color: #1A1814; margin: 0 0 5px;',
  itemDetail: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 12px; color: #4A4540; line-height: 1.5; margin: 0 0 6px;',
  itemTotal: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 12px; color: #4A4540; margin: 0;',
  small: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 12px; color: #4A4540;',
  mono: 'font-family: "Courier New", monospace; font-size: 11px; color: #4A4540;',
  address: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 13px; color: #1A1814; line-height: 1.8;',
  totalRow: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 13px; color: #4A4540; padding: 4px 0;',
  totalFinal: 'font-family: Georgia, serif; font-size: 15px; font-style: italic; color: #1A1814; padding: 10px 0 4px; border-top: 1px solid #E5DFD5; margin-top: 4px;',
  totalGst: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 11px; color: #9A6B4F; padding: 0; margin: 0;',
  btn: 'display: inline-block; background: #1A1814; color: #F2EBD9; font-family: "Helvetica Neue", Arial, sans-serif; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; padding: 14px 28px; margin-top: 24px;',
  footer: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 11px; color: #4A4540; border-top: 1px solid #E5DFD5; margin-top: 40px; padding-top: 20px; line-height: 1.7;',
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AUD`
}

function titleCase(str: string): string {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function wordmark(): string {
  return `
    <p style="${styles.wordmarkTop}">DOMESTIC</p>
    <p style="${styles.wordmarkBottom}">Eclectic</p>
  `
}

// Used by shippedNotificationHtml — unchanged
function itemsBlock(order: OrderWithItems): string {
  return order.order_items.map((item) => `
    <div style="margin-bottom: 16px;">
      <p style="${styles.itemTitle}">${item.artwork_title_snapshot}</p>
      <p style="${styles.itemDetail}">${item.material.replace(/_/g, ' ')} · ${item.size.replace('x', ' × ')} mm · ${item.framing.replace(/_/g, ' ')} · Qty ${item.quantity}</p>
      <p style="${styles.itemDetail}">Line total: ${formatCents(item.line_total_aud)}</p>
    </div>
  `).join('')
}

// Two-column item layout for the customer confirmation email
function customerItemsBlock(order: OrderWithItems): string {
  const rows = order.order_items.map((item) => `
    <tr>
      <td style="padding: 18px 0; border-bottom: 1px solid #E5DFD5; vertical-align: top;">
        <p style="font-family: Georgia, serif; font-size: 16px; font-style: italic; color: #1A1814; margin: 0 0 5px;">${item.artwork_title_snapshot}</p>
        <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #4A4540; line-height: 1.5; margin: 0;">${titleCase(item.material)} &middot; ${item.size.replace('x', ' &times; ')} mm &middot; ${titleCase(item.framing)}</p>
      </td>
      <td style="padding: 18px 0 18px 16px; border-bottom: 1px solid #E5DFD5; vertical-align: top; text-align: right; white-space: nowrap;">
        <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: #9A6B4F; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 5px;">Qty ${item.quantity}</p>
        <p style="font-family: Georgia, serif; font-size: 15px; font-style: italic; color: #1A1814; margin: 0;">${formatCents(item.line_total_aud)}</p>
      </td>
    </tr>
  `).join('')
  return `<table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">${rows}</table>`
}

// Two-column item layout for the admin notification email (includes line totals)
function adminItemsBlock(order: OrderWithItems): string {
  const rows = order.order_items.map((item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #E5DFD5; vertical-align: top;">
        <p style="font-family: Georgia, serif; font-size: 15px; font-style: italic; color: #1A1814; margin: 0 0 4px;">${item.artwork_title_snapshot}</p>
        <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #4A4540; line-height: 1.5; margin: 0;">${titleCase(item.material)} &middot; ${item.size.replace('x', ' &times; ')} mm &middot; ${titleCase(item.framing)} &middot; Qty&nbsp;${item.quantity}</p>
      </td>
      <td style="padding: 12px 0 12px 16px; border-bottom: 1px solid #E5DFD5; vertical-align: top; text-align: right; white-space: nowrap;">
        <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #1A1814; margin: 0;">${formatCents(item.line_total_aud)}</p>
      </td>
    </tr>
  `).join('')
  return `<table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">${rows}</table>`
}

// Invoice-style item table for the printer fulfilment email — NO pricing
function printerInvoiceItemsBlock(order: OrderWithItems): string {
  const lbl = `font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 700; color: #1A1814; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 14px; border-right: 1px solid #E5DFD5; width: 100px; vertical-align: top;`
  const val = `font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #1A1814; padding: 10px 14px; vertical-align: top;`
  const sep = `border-bottom: 1px solid #E5DFD5;`
  return order.order_items.map((item, i) => `
    <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; border: 1px solid #E5DFD5;${i < order.order_items.length - 1 ? ' margin-bottom: 16px;' : ''}">
      <tr>
        <td style="${lbl} ${sep}">Artwork</td>
        <td style="font-family: Georgia, serif; font-size: 15px; font-style: italic; color: #1A1814; padding: 10px 14px; ${sep} vertical-align: top;">${item.artwork_title_snapshot}</td>
      </tr>
      <tr>
        <td style="${lbl} ${sep}">Material</td>
        <td style="${val} ${sep}">${titleCase(item.material)}</td>
      </tr>
      <tr>
        <td style="${lbl} ${sep}">Size</td>
        <td style="${val} ${sep}">${item.size.replace('x', ' &times; ')} mm</td>
      </tr>
      <tr>
        <td style="${lbl} ${sep}">Framing</td>
        <td style="${val} ${sep}">${titleCase(item.framing)}</td>
      </tr>
      <tr>
        <td style="${lbl}">Quantity</td>
        <td style="${val}">${item.quantity}</td>
      </tr>
    </table>
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

// Large, bold ship-to address for the printer fulfilment email
function printerAddressBlock(order: OrderWithItems): string {
  const a = order.shipping_address
  return `
    <div style="padding: 22px 24px; background: #EAE0CC; border-left: 5px solid #1A1814;">
      <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 17px; font-weight: 700; color: #1A1814; line-height: 1.9; margin: 0;">
        ${a.name}<br>
        ${a.line1}${a.line2 ? '<br>' + a.line2 : ''}<br>
        ${a.city}${a.state ? ', ' + a.state : ''}&nbsp;${a.postal_code}<br>
        ${a.country}
      </p>
    </div>
  `
}

export function printerEmailHtml(order: OrderWithItems): string {
  const emailBorder = order.customer_phone ? ' border-bottom: 1px solid #E5DFD5;' : ''
  const phoneRow = order.customer_phone
    ? `<tr>
      <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 700; color: #1A1814; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 14px; border-right: 1px solid #E5DFD5; width: 80px; vertical-align: top;">Phone</td>
      <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #1A1814; padding: 10px 14px; vertical-align: top;">${order.customer_phone}</td>
    </tr>`
    : ''

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Print Order — ${order.order_number}</title></head>
<body style="${styles.body}">
<div style="${styles.wrap}">
  ${wordmark()}
  <h2 style="${styles.h2}">Drop Ship Order</h2>
  <p style="${styles.lead}">Please print and ship the following order directly to the customer. This order is for Domestic Eclectic, managed by Lara Stocco.</p>

  <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; border: 1px solid #E5DFD5; margin-bottom: 4px;">
    <tr>
      <td style="padding: 12px 16px; border-right: 1px solid #E5DFD5; width: 50%;">
        <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #9A6B4F; margin: 0 0 4px;">Order</p>
        <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #1A1814; margin: 0;">${order.order_number}</p>
      </td>
      <td style="padding: 12px 16px; width: 50%;">
        <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #9A6B4F; margin: 0 0 4px;">Date</p>
        <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: #1A1814; margin: 0;">${new Date(order.created_at).toLocaleDateString('en-AU', { dateStyle: 'long' })}</p>
      </td>
    </tr>
  </table>

  <p style="${styles.sectionLabel}">Items</p>
  ${printerInvoiceItemsBlock(order)}

  <p style="${styles.sectionLabel}">Ship To</p>
  ${printerAddressBlock(order)}

  <p style="${styles.sectionLabel}">Contact</p>
  <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; border: 1px solid #E5DFD5;">
    <tr>
      <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 700; color: #1A1814; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 14px; border-right: 1px solid #E5DFD5; width: 80px; vertical-align: top;${emailBorder}">Email</td>
      <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #1A1814; padding: 10px 14px; vertical-align: top;${emailBorder}">${order.customer_email}</td>
    </tr>
    ${phoneRow}
  </table>

  <p style="${styles.footer}">
    Questions about this order? Contact Lara Stocco at <a href="mailto:lara@domesticeclectic.com.au" style="color: #9A6B4F;">lara@domesticeclectic.com.au</a> — do not reply to this email.<br>
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
  <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #9A6B4F; text-transform: uppercase; letter-spacing: 2px; margin: -16px 0 28px;">Order ${order.order_number} &middot; ${new Date(order.created_at).toLocaleDateString('en-AU', { dateStyle: 'long' })}</p>

  <p style="${styles.sectionLabel}">Your Items</p>
  ${customerItemsBlock(order)}

  <p style="${styles.sectionLabel}">Shipping To</p>
  ${addressBlock(order)}

  <p style="${styles.sectionLabel}">Order Total</p>
  <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #4A4540; padding: 8px 0; border-bottom: 1px solid #E5DFD5;">Subtotal</td>
      <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #4A4540; padding: 8px 0; border-bottom: 1px solid #E5DFD5; text-align: right;">${formatCents(order.subtotal_aud)}</td>
    </tr>
    <tr>
      <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #4A4540; padding: 8px 0; border-bottom: 1px solid #E5DFD5;">Shipping</td>
      <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #4A4540; padding: 8px 0; border-bottom: 1px solid #E5DFD5; text-align: right;">${formatCents(order.shipping_aud)}</td>
    </tr>
    <tr>
      <td style="font-family: Georgia, serif; font-size: 16px; font-style: italic; color: #1A1814; padding: 12px 0 0;">Total</td>
      <td style="font-family: Georgia, serif; font-size: 16px; font-style: italic; color: #1A1814; padding: 12px 0 0; text-align: right;">${formatCents(order.total_aud)}</td>
    </tr>
  </table>

  <p style="${styles.sectionLabel}">What Happens Next</p>
  <p style="${styles.small}">Your print will be produced on archival materials by Southern Buoy in Mornington, Victoria. Australian orders typically arrive within 7–14 business days of dispatch. You'll receive a shipping notification once your order leaves the studio.</p>

  <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #4A4540; margin-top: 20px; padding-top: 16px; border-top: 1px solid #E5DFD5; line-height: 1.7;">This inbox is not monitored — please do not reply to this email. For any questions, visit our <a href="https://domesticeclectic.com.au/contact" style="color: #9A6B4F;">contact page</a>.</p>

  <p style="${styles.footer}">
    Domestic Eclectic · Fine Art Prints by Lara Stocco<br>
    Printed and fulfilled by Southern Buoy, Mornington VIC<br>
    ABN: 54 728 864 878
  </p>
</div>
</body></html>`
}

export function adminNotificationHtml(order: OrderWithItems, siteUrl: string): string {
  const a = order.shipping_address
  const kvLbl = `font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 700; color: #4A4540; text-transform: uppercase; letter-spacing: 0.5px; width: 60px; padding: 4px 14px 4px 0; vertical-align: top;`
  const kvVal = `font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #1A1814; padding: 4px 0; vertical-align: top;`
  const discountRow = order.discount_aud > 0 ? `
    <tr>
      <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #4A4540; padding: 6px 0; border-bottom: 1px solid #E5DFD5;">Discount${order.discount_code ? ` (${order.discount_code})` : ''}</td>
      <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #4A4540; padding: 6px 0; border-bottom: 1px solid #E5DFD5; text-align: right;">−${formatCents(order.discount_aud)}</td>
    </tr>` : ''

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>New order — ${order.order_number}</title></head>
<body style="${styles.body}">
<div style="${styles.wrap}">
  ${wordmark()}
  <h2 style="${styles.h2}">New order.</h2>
  <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #1A1814; margin: 0 0 4px;"><strong>${order.order_number}</strong> &middot; ${new Date(order.created_at).toLocaleDateString('en-AU', { dateStyle: 'long' })} &middot; ${formatCents(order.total_aud)}</p>

  <p style="${styles.sectionLabel}">Customer</p>
  <table cellpadding="0" cellspacing="0">
    <tr>
      <td style="${kvLbl}">Name</td>
      <td style="${kvVal}">${order.customer_name}</td>
    </tr>
    <tr>
      <td style="${kvLbl}">Email</td>
      <td style="${kvVal}"><a href="mailto:${order.customer_email}" style="color: #9A6B4F;">${order.customer_email}</a></td>
    </tr>
    <tr>
      <td style="${kvLbl}">Phone</td>
      <td style="${kvVal}">${order.customer_phone ?? '—'}</td>
    </tr>
  </table>

  <p style="${styles.sectionLabel}">Shipping Address</p>
  <p style="${styles.address}">
    ${a.name}<br>
    ${a.line1}${a.line2 ? '<br>' + a.line2 : ''}<br>
    ${a.city}${a.state ? ', ' + a.state : ''} ${a.postal_code}<br>
    ${a.country}
  </p>

  <p style="${styles.sectionLabel}">Items</p>
  ${adminItemsBlock(order)}

  <p style="${styles.sectionLabel}">Order Total</p>
  <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #4A4540; padding: 6px 0; border-bottom: 1px solid #E5DFD5;">Subtotal</td>
      <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #4A4540; padding: 6px 0; border-bottom: 1px solid #E5DFD5; text-align: right;">${formatCents(order.subtotal_aud)}</td>
    </tr>
    <tr>
      <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #4A4540; padding: 6px 0; border-bottom: 1px solid #E5DFD5;">Shipping</td>
      <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #4A4540; padding: 6px 0; border-bottom: 1px solid #E5DFD5; text-align: right;">${formatCents(order.shipping_aud)}</td>
    </tr>
    ${discountRow}
    <tr>
      <td style="font-family: Georgia, serif; font-size: 15px; font-style: italic; color: #1A1814; padding: 10px 0 0;">Total</td>
      <td style="font-family: Georgia, serif; font-size: 15px; font-style: italic; color: #1A1814; padding: 10px 0 0; text-align: right;">${formatCents(order.total_aud)}</td>
    </tr>
  </table>

  <a href="${siteUrl}/admin/orders/${order.id}" style="${styles.btn}">View order in studio</a>

  <p style="${styles.footer}">Domestic Eclectic Studio</p>
</div>
</body></html>`
}

// ─── Contact form emails ──────────────────────────────────────────────────────

export function contactConfirmationHtml(name: string): string {
  const firstName = name.split(' ')[0]
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Message received — Domestic Eclectic</title></head>
<body style="${styles.body}">
<div style="${styles.wrap}">
  ${wordmark()}
  <h2 style="${styles.h2}">Thank you, ${firstName}.</h2>
  <p style="${styles.lead}">Your message has been received. Lara will get back to you shortly.</p>

  <p style="${styles.footer}">
    Domestic Eclectic · Fine Art Prints by Lara Stocco<br>
    <a href="https://domesticeclectic.com.au" style="color: #9A6B4F; text-decoration: none;">domesticeclectic.com.au</a>
  </p>
</div>
</body></html>`
}

export function contactNotificationHtml(name: string, senderEmail: string, message: string): string {
  const escapedMessage = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>New message — ${name}</title></head>
<body style="${styles.body}">
<div style="${styles.wrap}">
  ${wordmark()}
  <h2 style="${styles.h2}">New message received.</h2>

  <p style="${styles.sectionLabel}">From</p>
  <p style="${styles.small}"><strong>${name}</strong> &middot; <a href="mailto:${senderEmail}" style="color: #9A6B4F;">${senderEmail}</a></p>

  <p style="${styles.sectionLabel}">Message</p>
  <p style="font-family: Georgia, serif; font-size: 15px; font-style: italic; color: #1A1814; line-height: 1.7; margin: 0; padding: 18px 20px; background: #EAE0CC; border-left: 4px solid #9A6B4F;">${escapedMessage}</p>

  <p style="${styles.footer}">
    Reply directly to <a href="mailto:${senderEmail}" style="color: #9A6B4F;">${senderEmail}</a> to respond.<br>
    Domestic Eclectic Studio
  </p>
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
    This inbox is not monitored — please do not reply to this email. For any questions, visit our <a href="https://domesticeclectic.com.au/contact" style="color: #9A6B4F;">contact page</a>.<br>
    Domestic Eclectic · Fine Art Prints by Lara Stocco
  </p>
</div>
</body></html>`
}
