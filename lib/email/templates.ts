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

// Used by adminNotificationHtml and shippedNotificationHtml — unchanged
function itemsBlock(order: OrderWithItems): string {
  return order.order_items.map((item) => `
    <div style="margin-bottom: 16px;">
      <p style="${styles.itemTitle}">${item.artwork_title_snapshot}</p>
      <p style="${styles.itemDetail}">${item.material.replace(/_/g, ' ')} · ${item.size.replace('x', ' × ')} mm · ${item.framing.replace(/_/g, ' ')} · Qty ${item.quantity}</p>
      <p style="${styles.itemDetail}">Line total: ${formatCents(item.line_total_aud)}</p>
    </div>
  `).join('')
}

// Cleaner item layout for the customer confirmation email
function customerItemsBlock(order: OrderWithItems): string {
  return order.order_items.map((item) => `
    <div style="margin-bottom: 20px;">
      <p style="${styles.itemTitle}">${item.artwork_title_snapshot}</p>
      <p style="${styles.itemDetail}">${titleCase(item.material)} &middot; ${item.size.replace('x', ' &times; ')} mm &middot; ${titleCase(item.framing)} &middot; Qty&nbsp;${item.quantity}</p>
      <p style="${styles.itemTotal}">Line total: ${formatCents(item.line_total_aud)}</p>
    </div>
  `).join('')
}

// Large, high-legibility item layout for the printer fulfilment email
function printerItemsBlock(order: OrderWithItems): string {
  const label = `font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #9A6B4F; padding: 6px 18px 6px 0; width: 90px; vertical-align: middle;`
  return order.order_items.map((item) => `
    <div style="margin-bottom: 20px; padding: 22px 24px; background: #EAE0CC; border-left: 5px solid #9A6B4F;">
      <p style="font-family: Georgia, serif; font-size: 22px; font-style: italic; color: #1A1814; margin: 0 0 18px; line-height: 1.3;">${item.artwork_title_snapshot}</p>
      <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="${label}">Size</td>
          <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 20px; font-weight: 700; color: #1A1814; padding: 6px 0;">${item.size.replace('x', ' &times; ')} mm</td>
        </tr>
        <tr>
          <td style="${label}">Material</td>
          <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #1A1814; padding: 6px 0;">${titleCase(item.material)}</td>
        </tr>
        <tr>
          <td style="${label}">Framing</td>
          <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #1A1814; padding: 6px 0;">${titleCase(item.framing)}</td>
        </tr>
        <tr>
          <td style="${label}">Qty</td>
          <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 28px; font-weight: 700; color: #1A1814; padding: 6px 0;">${item.quantity}</td>
        </tr>
      </table>
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
  ${printerItemsBlock(order)}

  ${printFileUrl ? `
  <p style="${styles.sectionLabel}">Print File</p>
  <p style="${styles.small}">The high-resolution print file is available for download below. This link expires in 30 days.</p>
  <a href="${printFileUrl}" style="${styles.btn}">Download print file</a>
  ` : `
  <p style="${styles.sectionLabel}">Print File</p>
  <p style="${styles.small}">The print file will be sent separately or is already on file.</p>
  `}

  <p style="${styles.sectionLabel}">Ship To</p>
  ${printerAddressBlock(order)}

  <p style="${styles.footer}">
    Questions about this order? Contact Lara Stocco at lara@domesticeclectic.com.au<br>
    Domestic Eclectic · Fine Art Prints by Lara Stocco
  </p>
</div>
</body></html>`
}

export function customerConfirmationHtml(order: OrderWithItems): string {
  const firstName = order.customer_name.split(' ')[0]
  const gstCents = Math.round(order.total_aud / 11)

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Order confirmed — ${order.order_number}</title></head>
<body style="${styles.body}">
<div style="${styles.wrap}">
  ${wordmark()}
  <h2 style="${styles.h2}">Thank you, ${firstName}.</h2>
  <p style="${styles.lead}">Your order has been confirmed. We'll be in touch when your print is on its way.</p>

  <p style="${styles.sectionLabel}">Your Order — ${order.order_number}</p>
  ${customerItemsBlock(order)}

  <p style="${styles.sectionLabel}">Shipping To</p>
  ${addressBlock(order)}

  <p style="${styles.sectionLabel}">Order Total</p>
  <p style="${styles.totalRow}">Subtotal: ${formatCents(order.subtotal_aud)}</p>
  <p style="${styles.totalRow}">Shipping: ${formatCents(order.shipping_aud)}</p>
  <p style="${styles.totalFinal}">Total: ${formatCents(order.total_aud)}</p>
  <p style="${styles.totalGst}">Includes GST: ${formatCents(gstCents)}</p>

  <p style="${styles.sectionLabel}">What happens next</p>
  <p style="${styles.small}">Your print will be produced on archival materials by Southern Buoy in Mornington, Victoria. Australian orders typically arrive within 7–14 business days of dispatch. You'll receive a shipping notification once your order leaves the studio.</p>
  <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #4A4540; margin-top: 12px;">Questions? Reply to this email or visit <a href="https://domesticeclectic.com.au/contact" style="color: #9A6B4F;">our contact page</a>.</p>

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
