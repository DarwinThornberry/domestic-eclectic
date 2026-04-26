'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { saveArtwork, deleteArtwork } from '@/app/admin/actions'

interface ArtworkData {
  id?: string
  slug?: string
  title?: string
  year?: number
  tagline?: string
  description?: string
  original_dims?: string
  thumbnail_url?: string | null
  hi_res_file_url?: string | null
  gallery_images?: string[]
  is_published?: boolean
  aspect_ratio?: number | null
  blur_color?: string | null
}

interface Props {
  artwork?: ArtworkData
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function Field({
  label,
  help,
  children,
}: {
  label: string
  help?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-xs text-ink-muted block mb-1.5">{label}</label>
      {children}
      {help && <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">{help}</p>}
    </div>
  )
}

export function ArtworkForm({ artwork }: Props) {
  const router = useRouter()
  const isEditing = !!artwork?.id
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedStatus, setSavedStatus] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: artwork?.title ?? '',
    year: artwork?.year ?? new Date().getFullYear(),
    tagline: artwork?.tagline ?? '',
    description: artwork?.description ?? '',
    original_dims: artwork?.original_dims ?? '',
    slug: artwork?.slug ?? '',
    is_published: artwork?.is_published ?? false,
    thumbnail_url: artwork?.thumbnail_url ?? '',
    hi_res_file_url: artwork?.hi_res_file_url ?? '',
    gallery_images: artwork?.gallery_images ?? [],
  })

  function set(key: keyof typeof form, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleTitleChange(title: string) {
    set('title', title)
    // Auto-fill slug if not manually edited yet
    if (!isEditing || !artwork?.slug) {
      set('slug', slugify(title))
    }
  }

  function handleSave(publish?: boolean) {
    setError(null)
    const payload = {
      ...form,
      is_published: publish !== undefined ? publish : form.is_published,
    }

    startTransition(async () => {
      try {
        await saveArtwork(payload, artwork?.id)
        setSavedStatus('Saved.')
        if (!isEditing) router.push('/admin/artworks')
      } catch (e: any) {
        setError(e.message ?? 'Could not save. Please try again.')
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteArtwork(artwork!.id!)
        router.push('/admin/artworks')
      } catch (e: any) {
        setError(e.message ?? 'Could not delete.')
      }
    })
  }

  return (
    <div className="max-w-2xl">
      {error && (
        <div className="border border-terracotta/30 bg-terracotta/5 px-4 py-3 mb-6">
          <p className="text-sm text-terracotta">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-7">
        {/* Title */}
        <Field label="Title" help="The name of this work.">
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
            required
          />
        </Field>

        {/* Year */}
        <Field label="Year" help="When you completed this piece.">
          <input
            type="number"
            value={form.year}
            onChange={(e) => set('year', parseInt(e.target.value))}
            min={1900}
            max={new Date().getFullYear()}
            className="w-32 border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
          />
        </Field>

        {/* Tagline */}
        <Field label="Tagline" help="A short evocative line that appears beside the work.">
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => set('tagline', e.target.value)}
            maxLength={120}
            className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
          />
          <p className="text-xs text-ink-muted mt-1">{form.tagline.length}/120</p>
        </Field>

        {/* Description */}
        <Field label="Description" help="A longer description for the artwork's page. You can use line breaks.">
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={5}
            className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors resize-y"
          />
        </Field>

        {/* Original dimensions */}
        <Field
          label="Original dimensions"
          help="The size of the original collage, e.g. 900 × 1200 mm."
        >
          <input
            type="text"
            value={form.original_dims}
            onChange={(e) => set('original_dims', e.target.value)}
            placeholder="e.g. 760 × 1000 mm"
            className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
          />
        </Field>

        {/* Web image */}
        <hr />
        <ImageUpload
          label="Web image"
          helpText="The version of the artwork shown on the website. Drop a high-quality JPEG here. Recommended: at least 2400px on the long edge."
          bucket="artwork-public"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          maxMB={30}
          showPreview
          onUpload={(url) => set('thumbnail_url', url)}
          initialUrl={form.thumbnail_url || null}
        />

        {/* Print file */}
        <ImageUpload
          label="Print file"
          helpText="The high-resolution file that will be sent to Southern Buoy for printing. This should be your TIFF reproduction file. Customers never see this — it's only used for printing."
          bucket="artwork-hires"
          accept="image/tiff,image/tif,image/jpeg,image/png"
          maxMB={500}
          showPreview={false}
          onUpload={(url) => set('hi_res_file_url', url)}
          initialUrl={form.hi_res_file_url || null}
        />

        {/* Gallery images */}
        <Field
          label="Additional gallery images (optional)"
          help="Detail shots that appear alongside the main image on the artwork's page."
        >
          <div className="flex flex-col gap-3">
            {form.gallery_images.map((url, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <img src={url} alt="" className="w-12 h-12 object-cover border border-border shrink-0" />
                <p className="text-xs text-ink-muted flex-1 truncate">{url}</p>
                <button
                  type="button"
                  onClick={() => set('gallery_images', form.gallery_images.filter((_, i) => i !== idx))}
                  className="text-xs text-ink-muted hover:text-ink transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
            <ImageUpload
              label=""
              helpText=""
              bucket="artwork-public"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              maxMB={20}
              showPreview={false}
              onUpload={(url) => set('gallery_images', [...form.gallery_images, url])}
            />
          </div>
        </Field>

        {/* Slug */}
        <hr />
        <Field
          label="Slug"
          help="The web address for this work. Auto-filled from the title. Only change this if you have a reason."
        >
          <div className="flex items-center">
            <span className="px-3 py-3 bg-bone-dark border border-border border-r-0 text-xs text-ink-muted shrink-0">/works/</span>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              pattern="[a-z0-9-]+"
              className="flex-1 border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
            />
          </div>
        </Field>

        {/* Status */}
        <Field
          label="Status"
          help="Drafts are saved but not visible on the public site. Switch to Published when ready."
        >
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={!form.is_published}
                onChange={() => set('is_published', false)}
                className="accent-ink"
              />
              <span className="text-sm text-ink">Draft</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={form.is_published}
                onChange={() => set('is_published', true)}
                className="accent-ink"
              />
              <span className="text-sm text-ink">Published</span>
            </label>
          </div>
        </Field>

        {/* Actions */}
        <div className="pt-2 border-t border-border flex flex-wrap items-center gap-4">
          {savedStatus && !error && (
            <p className="text-xs text-olive">{savedStatus}</p>
          )}

          <div className="flex flex-wrap gap-3 ml-auto">
            {!isEditing ? (
              <>
                <button
                  onClick={() => handleSave(false)}
                  disabled={isPending}
                  className="border border-border px-5 py-3 text-sm text-ink hover:bg-bone-dark transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {isPending && <Loader2 size={12} className="animate-spin" />}
                  Save draft
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={isPending}
                  className="bg-ink text-bone px-5 py-3 text-sm hover:bg-terracotta transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {isPending && <Loader2 size={12} className="animate-spin" />}
                  Save and publish
                </button>
              </>
            ) : (
              <button
                onClick={() => handleSave()}
                disabled={isPending}
                className="bg-ink text-bone px-5 py-3 text-sm hover:bg-terracotta transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {isPending && <Loader2 size={12} className="animate-spin" />}
                Save changes
              </button>
            )}
          </div>
        </div>

        {/* Delete */}
        {isEditing && (
          <div className="pt-4">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-ink-muted hover:text-terracotta transition-colors"
              >
                Delete this work
              </button>
            ) : (
              <div className="border border-terracotta/30 bg-terracotta/5 p-4">
                <p className="text-sm text-ink mb-3">
                  Are you sure? This will permanently delete <strong>{form.title}</strong> and cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="border border-terracotta bg-terracotta/10 text-ink px-4 py-2 text-sm hover:bg-terracotta hover:text-bone transition-colors"
                  >
                    Yes, delete permanently
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="border border-border px-4 py-2 text-sm text-ink hover:bg-bone-dark transition-colors"
                  >
                    Keep it
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
