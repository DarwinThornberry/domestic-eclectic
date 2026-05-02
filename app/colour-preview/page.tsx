import Image from 'next/image'
import type { Metadata } from 'next'
import { ShoppingBag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Colour Preview — Internal',
  robots: { index: false, follow: false },
}

// ─── Hero data (Flora, Bewildered) ─────────────────────────────────────────────

const HERO = {
  src: '/artworks/web/flora-bewildered.png',
  title: 'Flora, Bewildered',
  tagline: 'The garden as portrait, the portrait as garden.',
  meta: '900 × 1200 MM · 2024',
  blurColor: '#E8D4C8',
}

const INTRO =
  'Domestic Eclectic is the studio practice of Lara Stocco — collages built from art history, botany, and the quiet mythology of the everyday.'

// ─── Palette definitions ───────────────────────────────────────────────────────

type Palette = {
  id: string
  name: string
  hexCodes: string
  bg: string
  text: string
  textMuted: string
  accentColor: string
  artworkContainerBg: string
  borderColor: string
}

const PALETTES: Palette[] = [
  {
    id: 'warm-cream',
    name: 'CURRENT (Warm Cream)',
    hexCodes: 'BG #FAF6EC · TEXT #1A1814',
    bg: '#FAF6EC',
    text: '#1A1814',
    textMuted: '#4A4540',
    accentColor: '#9A6B4F',
    artworkContainerBg: '#ffffff',
    borderColor: '#E5DFD5',
  },
  {
    id: 'dark-olive',
    name: 'DARK OLIVE',
    hexCodes: 'BG #67582F · TEXT #F2EBD9',
    bg: '#67582F',
    text: '#F2EBD9',
    textMuted: '#D4C9A8',
    accentColor: '#E8C98A',
    artworkContainerBg: '#FAF6EC',
    borderColor: 'rgba(242,235,217,0.25)',
  },
  {
    id: 'warm-charcoal',
    name: 'WARM CHARCOAL',
    hexCodes: 'BG #2A2520 · TEXT #F2EBD9',
    bg: '#2A2520',
    text: '#F2EBD9',
    textMuted: '#C8BFB0',
    accentColor: '#D4957A',
    artworkContainerBg: '#FAF6EC',
    borderColor: 'rgba(242,235,217,0.18)',
  },
  {
    id: 'moss-green',
    name: 'MOSS GREEN',
    hexCodes: 'BG #4A5240 · TEXT #F2EBD9',
    bg: '#4A5240',
    text: '#F2EBD9',
    textMuted: '#C6CAB4',
    accentColor: '#D4C98A',
    artworkContainerBg: '#FAF6EC',
    borderColor: 'rgba(242,235,217,0.22)',
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ColourPreviewPage() {
  return (
    <div style={{ background: '#F0EBE0', minHeight: '100vh', padding: '48px 24px 80px' }}>

      {/* Heading */}
      <div style={{ maxWidth: 860, margin: '0 auto 56px' }}>
        <h1
          className="font-display"
          style={{ fontSize: '2rem', fontWeight: 400, color: '#1A1814', marginBottom: 10 }}
        >
          Colour Preview
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#4A4540', lineHeight: 1.6 }}>
          Compare backgrounds with the same artwork. Each palette uses the existing typography and layout.
        </p>
      </div>

      {/* Palette stack */}
      <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 64 }}>
        {PALETTES.map((palette) => (
          <PaletteCard key={palette.id} palette={palette} />
        ))}
      </div>

    </div>
  )
}

// ─── Palette card ──────────────────────────────────────────────────────────────

function PaletteCard({ palette }: { palette: Palette }) {
  return (
    <div>
      {/* Label */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#1A1814',
          }}
        >
          {palette.name}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: '#6B6560',
            letterSpacing: '0.04em',
          }}
        >
          {palette.hexCodes}
        </span>
      </div>

      {/* Preview card */}
      <div
        style={{
          background: palette.bg,
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.12)',
          borderRadius: 2,
        }}
      >
        {/* Mini nav */}
        <MiniNav palette={palette} />

        {/* Hero section */}
        <div style={{ padding: '24px 28px 0' }}>

          {/* Artwork container */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 280,
              overflow: 'hidden',
              background: palette.artworkContainerBg,
              border: `1px solid ${palette.borderColor}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
            }}
          >
            <Image
              src={HERO.src}
              alt={HERO.title}
              fill
              sizes="860px"
              className="object-cover object-center artwork-img"
              draggable={false}
            />
          </div>

          {/* Caption */}
          <div style={{ marginTop: 20, paddingBottom: 20 }}>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.6875rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: palette.accentColor,
                marginBottom: 8,
              }}
            >
              FEATURED WORK
            </p>
            <h2
              className="font-display"
              style={{
                fontSize: '1.6rem',
                fontStyle: 'italic',
                fontWeight: 400,
                color: palette.text,
                lineHeight: 1.2,
                marginBottom: 6,
              }}
            >
              {HERO.title}
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                color: palette.textMuted,
                lineHeight: 1.6,
                marginBottom: 8,
              }}
            >
              {HERO.tagline}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.6875rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: palette.textMuted,
              }}
            >
              {HERO.meta}
            </p>
          </div>
        </div>

        {/* Intro strip */}
        <div
          style={{
            borderTop: `1px solid ${palette.borderColor}`,
            padding: '20px 28px 24px',
          }}
        >
          <p
            className="font-display"
            style={{
              fontSize: '1.1rem',
              fontStyle: 'italic',
              fontWeight: 400,
              color: palette.text,
              lineHeight: 1.5,
              maxWidth: 560,
            }}
          >
            {INTRO}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Mini nav ──────────────────────────────────────────────────────────────────

function MiniNav({ palette }: { palette: Palette }) {
  const links = ['Works', 'About', 'Process', 'Contact']

  return (
    <div
      style={{
        height: 52,
        borderBottom: `1px solid ${palette.borderColor}`,
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Wordmark */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className="wordmark-domestic" style={{ color: palette.text }}>DOMESTIC</span>
        <span className="wordmark-eclectic" style={{ color: palette.text }}>Eclectic</span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {links.map((label) => (
          <span
            key={label}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.6875rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: palette.textMuted,
            }}
          >
            {label}
          </span>
        ))}
        <ShoppingBag size={15} strokeWidth={1.5} color={palette.text} style={{ opacity: 0.7 }} />
      </div>
    </div>
  )
}
