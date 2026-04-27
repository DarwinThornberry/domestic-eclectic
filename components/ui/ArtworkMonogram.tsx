'use client'

export function ArtworkMonogram() {
  return (
    <div
      aria-hidden="true"
      className="absolute bottom-4 right-4 pointer-events-none select-none"
      style={{ zIndex: 20 }}
    >
      <span
        className="font-display"
        style={{
          display: 'block',
          fontStyle: 'italic',
          fontSize: 'clamp(28px, 5vw, 64px)',
          color: 'rgba(255, 255, 255, 0.75)',
          letterSpacing: '0.1em',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          // text-shadow is drawn independently of color alpha — stays visible
          // on light and dark artwork regardless of the image underneath
          textShadow: '0 1px 4px rgba(0,0,0,0.75), 0 0 8px rgba(0,0,0,0.4)',
        }}
      >
        D · E
      </span>
    </div>
  )
}
