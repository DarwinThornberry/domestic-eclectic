import type { Metadata } from 'next'
import { WorksGallery } from '@/components/site/WorksGallery'
import { getPublishedArtworks } from '@/lib/data/artworks-db'

export const metadata: Metadata = {
  title: 'Works',
  description:
    'Browse fine art prints by Lara Stoco — archival cotton rag and canvas prints of original mixed-media collages.',
}

export default async function WorksPage() {
  const artworks = await getPublishedArtworks()

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-24">

      {/* Page header */}
      <div className="mb-14">
        <p className="caption text-terracotta mb-3 tracking-[0.16em]">PRINT COLLECTION</p>
        <h1 className="font-display text-5xl md:text-6xl italic text-ink mb-6">Index</h1>
        <p className="text-ink-muted max-w-md leading-relaxed">
          Each print is produced on archival cotton rag or canvas by Southern Buoy
          in Mornington, Victoria — available unframed or with a choice of framing.
        </p>
        <hr className="mt-10" />
      </div>

      {/* Gallery — client component handles filtering + image display */}
      <WorksGallery artworks={artworks} />

    </div>
  )
}
