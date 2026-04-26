import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ArtworkForm } from '@/components/admin/ArtworkForm'

export const metadata = { title: 'Add new work' }

export default function NewArtworkPage() {
  return (
    <div className="px-6 lg:px-10 py-10">
      <Link
        href="/admin/artworks"
        className="inline-flex items-center gap-2 caption text-ink-muted hover:text-ink transition-colors mb-8"
      >
        <ArrowLeft size={12} /> Works
      </Link>
      <div className="mb-8">
        <p className="caption text-terracotta tracking-[0.16em] mb-2">STUDIO</p>
        <h1 className="font-display text-4xl italic text-ink">Add a new work</h1>
      </div>
      <ArtworkForm />
    </div>
  )
}
