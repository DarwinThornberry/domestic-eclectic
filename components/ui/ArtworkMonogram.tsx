// Tiled watermark pattern — absolute-fills its parent, clipped by parent overflow-hidden.
// The inner div is oversized (200% each axis) so rotation doesn't leave gaps at edges.
// Drop-shadow filter keeps each mark readable on both light and dark areas of artwork.
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><text x="60" y="48" text-anchor="middle" dominant-baseline="middle" font-family="Georgia,serif" font-style="italic" font-size="19" letter-spacing="4" fill="#F2EBD9">D · E</text></svg>`
const TILE = `url("data:image/svg+xml,${encodeURIComponent(SVG)}")`

export function ArtworkMonogram() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={{ zIndex: 20 }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '-50%',
          backgroundImage: TILE,
          backgroundSize: '120px 90px',
          backgroundRepeat: 'repeat',
          transform: 'rotate(-30deg)',
          opacity: 0.32,
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.55))',
        }}
      />
    </div>
  )
}
