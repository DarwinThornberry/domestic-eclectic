import { notFound } from 'next/navigation'
import { getPublishedArtwork, getPublishedArtworkSlugs } from '@/lib/data/artworks-db'
import { getPricingTiers } from '@/lib/data/artworks-db'
import { ArtworkDetail } from '@/components/site/ArtworkDetail'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ArtworkPage({ params }: Props) {
  const { slug } = await params
  const [artwork, tiers] = await Promise.all([
    getPublishedArtwork(slug),
    getPricingTiers(),
  ])

  if (!artwork) notFound()

  return <ArtworkDetail artwork={artwork} tiers={tiers} />
}

export async function generateStaticParams() {
  const slugs = await getPublishedArtworkSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const artwork = await getPublishedArtwork(slug)
  return {
    title: artwork ? `${artwork.title} — Domestic Eclectic` : 'Work — Domestic Eclectic',
  }
}
