import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { getAboutPhotoUrl } from '@/lib/data/artworks-db'

export const metadata: Metadata = {
  title: 'About',
  description: 'About Lara Stocco — Melbourne-based artist and creator of Domestic Eclectic.',
}

export default async function AboutPage() {
  const aboutPhotoUrl = await getAboutPhotoUrl()

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        {/* Studio photo */}
        <div className="relative aspect-[3/4] bg-bone-dark overflow-hidden order-1 lg:order-none">
          {aboutPhotoUrl ? (
            <Image
              src={aboutPhotoUrl}
              alt="Lara Stocco"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <p className="font-display text-7xl italic text-ink select-none">LS</p>
            </div>
          )}
        </div>

        {/* Text */}
        <div className="order-2 lg:order-none">
          <p className="caption text-terracotta mb-4">About</p>
          <h1 className="font-display text-4xl md:text-5xl italic text-ink mb-8 leading-tight">
            Lara Stocco
          </h1>

          <div className="flex flex-col gap-5 text-ink leading-relaxed">
            <p>
              My name is Lara, and I&apos;m a Melbournian artist with an
              indelible passion for color, shape, and the coalescence of many
              parts into a unified entity. Often, my work incorporates a
              combination of history, architecture, and the human personality,
              mixed with the warmth and vibrancy of nature and its forms.
              Despite assumed incompatibility, it&apos;s the connection of these
              two worlds that makes my work feel true and whole.
            </p>
            <p>
              What comes first can only be described as chaos. A mismatched
              layout of various source materials; books, posters, magazines,
              prints, all collated by chance encounter throughout my daily life.
            </p>
            <p>
              Then, I go through a multi-week, hand done process of matching
              pieces, cutting images, and painting to restore lost vibrance,
              forming a dense, maximalist collage; strange yet comfortable,
              intertwining periods and styles of the past in ways that would
              never occur on their own.
            </p>
            <p>
              All of my work is pieced together by me in my Melbourne studio.
              With the help of Southern Buoy in Mornington, Victoria, with their
              high quality, lasting materials, archival prints of my work can be
              purchased here on Domestic Eclectic.
            </p>
          </div>

          <Link
            href="/works"
            className="inline-flex items-center gap-2 caption text-ink border-b border-ink pb-px mt-10 hover:text-terracotta hover:border-terracotta transition-colors"
          >
            Browse the collection <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}
