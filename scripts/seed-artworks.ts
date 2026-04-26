/**
 * Seed script — uploads artwork images to Supabase Storage and upserts artwork rows.
 *
 * Run with:
 *   npx tsx scripts/seed-artworks.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Idempotent — re-running updates existing rows rather than failing.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

// Load .env.local before anything else
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'artwork-public'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

// ─── Artwork definitions ──────────────────────────────────────────────────────
// Matches lib/data/artworks.ts. Copy used here intentionally — the seed script
// is a standalone tool that doesn't import Next.js app code.

interface ArtworkSeed {
  slug: string
  title: string
  year: number
  tagline: string
  description: string
  original_dims: string
  blur_color: string
  sort_order: number
}

const ARTWORKS: ArtworkSeed[] = [
  {
    slug: 'flora-bewildered',
    title: 'Flora, Bewildered',
    year: 2024,
    tagline: 'The garden as portrait, the portrait as garden.',
    description:
      'A Botticelli Venus transformed — the classical figure disappears into a cascade of pink florals and hovering butterflies. The portrait becomes indistinguishable from the garden it inhabits, each element borrowing beauty from the other.',
    original_dims: '900 × 1200 mm',
    blur_color: '#E8D4C8',
    sort_order: 1,
  },
  {
    slug: 'frida-and-the-pomegranate',
    title: 'Frida & The Pomegranate',
    year: 2024,
    tagline: 'Devotional fragments arranged into bloom.',
    description:
      'Frida Kahlo at the centre of a vivid altar — surrounded by tropical fruits, bold reds, and the accumulated imagery of a life lived in full colour. Part devotional, part still life, entirely her own.',
    original_dims: '900 × 1200 mm',
    blur_color: '#C4553A',
    sort_order: 2,
  },
  {
    slug: 'quietude-in-lemon',
    title: 'Quietude in Lemon',
    year: 2024,
    tagline: 'A study of stillness, citrus, and the slow afternoon.',
    description:
      "A Delft blue vase, a lemon, a butterfly at rest. The composition holds the quality of a long afternoon — Dutch interior light refracted through Lara's layering process into something utterly still.",
    original_dims: '760 × 1000 mm',
    blur_color: '#D4B94A',
    sort_order: 3,
  },
  {
    slug: 'cabinet-of-wonders',
    title: 'Cabinet of Wonders',
    year: 2024,
    tagline: 'Tattoos, marigolds, and the company we keep.',
    description:
      'A tattooed figure presides over a cabinet of gathered wonders — cascading marigolds, a blue bird, pendulous grapes. The body as collector; the collection as self-portrait.',
    original_dims: '800 × 800 mm',
    blur_color: '#9B7B3A',
    sort_order: 4,
  },
  {
    slug: 'the-crimson-sitter',
    title: 'The Crimson Sitter',
    year: 2025,
    tagline: 'An eclectic court, observed.',
    description:
      'A Renaissance noblewoman sits within an improvised court of leopard print, scattered butterflies, and rich red drapery. The historical and the domestic collide with the absurd dignity they both deserve.',
    original_dims: '600 × 800 mm',
    blur_color: '#C45050',
    sort_order: 5,
  },
  {
    slug: 'devotionals',
    title: 'Devotionals',
    year: 2025,
    tagline: 'Small altars to small things.',
    description:
      "Frida Kahlo's self-portrait meets a Byzantine Madonna icon in an arrangement of mushrooms, flowers, and tender curiosities. A secular altar to the things that matter quietly.",
    original_dims: '600 × 800 mm',
    blur_color: '#7A4A3A',
    sort_order: 6,
  },
  {
    slug: 'statuary',
    title: 'Statuary',
    year: 2025,
    tagline: 'The body as museum, the museum as body.',
    description:
      'A profile portrait flanked by a classical white statue and an anatomical figure. Three representations of the body in dialogue — the living, the carved, and the diagrammatic — each observing the others.',
    original_dims: '760 × 1000 mm',
    blur_color: '#D4CBC0',
    sort_order: 7,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg: string) {
  console.log(`  ${msg}`)
}

function ok(msg: string) {
  console.log(`  ✓ ${msg}`)
}

function warn(msg: string) {
  console.warn(`  ⚠ ${msg}`)
}

async function uploadImage(
  localPath: string,
  storagePath: string,
): Promise<string | null> {
  if (!fs.existsSync(localPath)) {
    warn(`Image file not found: ${localPath}`)
    return null
  }

  const fileBuffer = fs.readFileSync(localPath)
  const mimeType = localPath.endsWith('.png') ? 'image/png' : 'image/jpeg'

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: true,   // overwrite if already exists
    })

  if (error) {
    warn(`Upload failed for ${storagePath}: ${error.message}`)
    return null
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

async function getImageDimensions(filePath: string): Promise<{ width: number; height: number } | null> {
  try {
    const meta = await sharp(filePath).metadata()
    if (meta.width && meta.height) {
      return { width: meta.width, height: meta.height }
    }
    return null
  } catch (err) {
    warn(`Could not read dimensions from ${filePath}: ${err}`)
    return null
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\nDomestic Eclectic — artwork seed\n')
  console.log(`Supabase: ${SUPABASE_URL}`)
  console.log(`Bucket:   ${BUCKET}`)
  console.log(`Artworks: ${ARTWORKS.length}\n`)

  const imageDir = path.join(process.cwd(), 'public', 'artworks', 'web')

  let seeded = 0
  let skipped = 0
  let errors = 0

  for (const artwork of ARTWORKS) {
    console.log(`→ ${artwork.title} (${artwork.slug})`)

    // ── Find image file ────────────────────────────────────────────────────
    // Try .png first, then .jpg
    let localPath = path.join(imageDir, `${artwork.slug}.png`)
    if (!fs.existsSync(localPath)) {
      localPath = path.join(imageDir, `${artwork.slug}.jpg`)
    }

    const ext = localPath.endsWith('.png') ? 'png' : 'jpg'
    const storagePath = `web/${artwork.slug}.${ext}`

    // ── Upload image ───────────────────────────────────────────────────────
    log(`Uploading ${storagePath}…`)
    const publicUrl = await uploadImage(localPath, storagePath)

    if (!publicUrl) {
      warn(`Skipping DB upsert for ${artwork.slug} — no image URL`)
      errors++
      continue
    }

    ok(`Uploaded → ${publicUrl}`)

    // ── Get aspect ratio from actual image dimensions ──────────────────────
    let aspectRatio: number | null = null
    if (fs.existsSync(localPath)) {
      const dims = await getImageDimensions(localPath)
      if (dims) {
        aspectRatio = dims.width / dims.height
        log(`Dimensions: ${dims.width}×${dims.height} → aspect_ratio ${aspectRatio.toFixed(4)}`)
      }
    }

    // ── Upsert artwork row ─────────────────────────────────────────────────
    // blur_color and gallery_image_urls are added by migration 002 — omit them
    // here if the column doesn't exist yet so the seed works before migrations run.
    const { error: upsertError } = await supabase
      .from('artworks')
      .upsert(
        {
          slug: artwork.slug,
          title: artwork.title,
          year: artwork.year,
          tagline: artwork.tagline,
          description: artwork.description,
          original_dims: artwork.original_dims,
          thumbnail_url: publicUrl,
          gallery_images: [],
          is_published: true,
          sort_order: artwork.sort_order,
          aspect_ratio: aspectRatio,
        },
        { onConflict: 'slug' },
      )

    if (upsertError) {
      warn(`DB upsert failed for ${artwork.slug}: ${upsertError.message}`)
      errors++
      continue
    }

    ok(`DB row upserted`)
    seeded++
    console.log()
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('─'.repeat(50))
  console.log(`Done.  seeded=${seeded}  skipped=${skipped}  errors=${errors}`)
  if (errors > 0) {
    console.log('\nCheck warnings above for details on any failures.')
    process.exit(1)
  }
}

seed().catch((err) => {
  console.error('\nSeed script failed:', err)
  process.exit(1)
})
