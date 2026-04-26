export const SITE_NAME = 'Domestic Eclectic'
export const SITE_TAGLINE = 'Fine Art Prints by Lara Stoco'
export const SITE_DESCRIPTION =
  'Fine art prints of original mixed-media collages by Australian artist Lara Stoco. Printed on archival cotton rag and canvas by Southern Buoy, Mornington.'

export const PRINTER_EMAIL = process.env.PRINTER_EMAIL ?? 'southernbuoy@gmail.com'
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''
export const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000'

// Human-readable labels used throughout the UI
export const MATERIAL_LABELS: Record<string, string> = {
  cotton_rag_smooth: 'Cotton Rag Smooth',
  cotton_rag_textured: 'Cotton Rag Textured',
  canvas_satin: 'Canvas Satin',
  canvas_lustre: 'Canvas Lustre',
}

export const FRAMING_LABELS: Record<string, string> = {
  unframed: 'Unframed',
  standard_flooded_gum: 'Standard Frame — Flooded Gum',
  standard_american_ash: 'Standard Frame — American Ash',
  premium_white: 'Premium Frame — Stained White',
  premium_mahogany: 'Premium Frame — Stained Native Mahogany',
  premium_walnut: 'Premium Frame — Stained Walnut',
  premium_black: 'Premium Frame — Stained Black',
}

export const SIZE_LABELS: Record<string, string> = {
  '210x297': 'A4 — 210 × 297 mm',
  '297x420': 'A3 — 297 × 420 mm',
  '420x594': 'A2 — 420 × 594 mm',
  '594x841': 'A1 — 594 × 841 mm',
  '841x1189': 'A0 — 841 × 1189 mm',
  '300x300': '300 × 300 mm',
  '400x400': '400 × 400 mm',
  '500x500': '500 × 500 mm',
  '600x600': '600 × 600 mm',
  '700x700': '700 × 700 mm',
  '800x800': '800 × 800 mm',
  '900x900': '900 × 900 mm',
  '1000x1000': '1000 × 1000 mm',
  '1100x1100': '1100 × 1100 mm',
  '300x400': '300 × 400 mm',
  '450x600': '450 × 600 mm',
  '600x800': '600 × 800 mm',
  '760x1000': '760 × 1000 mm',
}
