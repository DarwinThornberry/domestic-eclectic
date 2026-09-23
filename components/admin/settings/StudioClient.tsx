'use client'

import { useState, useTransition } from 'react'
import { Loader2, X } from 'lucide-react'
import { saveSettings } from '@/app/admin/actions'
import { ImageUpload } from '@/components/admin/ImageUpload'

interface Props {
  studioName: string
  contactEmail: string
  instagramUrl: string
  aboutPhotoUrl: string | null
}

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-ink-muted block mb-1.5">{label}</label>
      {children}
      {help && <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">{help}</p>}
    </div>
  )
}

export function StudioClient({
  studioName: initial_name,
  contactEmail: initial_email,
  instagramUrl: initial_ig,
  aboutPhotoUrl: initial_about_photo,
}: Props) {
  const [studioName, setStudioName] = useState(initial_name)
  const [contactEmail, setContactEmail] = useState(initial_email)
  const [instagramUrl, setInstagramUrl] = useState(initial_ig)
  const [aboutPhotoUrl, setAboutPhotoUrl] = useState(initial_about_photo)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      try {
        await saveSettings({
          studio_name: studioName,
          contact_email: contactEmail,
          instagram_url: instagramUrl || null,
          about_photo_url: aboutPhotoUrl || null,
        })
        setSaved(true)
      } catch (e: any) {
        setError(e.message ?? 'Could not save. Please try again.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {error && (
        <p className="text-sm text-terracotta border border-terracotta/30 bg-terracotta/5 px-4 py-3">{error}</p>
      )}

      <Field label="Studio name" help="The name shown in your site's header and emails.">
        <input
          type="text"
          value={studioName}
          onChange={(e) => { setStudioName(e.target.value); setSaved(false) }}
          className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
        />
      </Field>

      <Field label="Contact email (shown on site)" help="Displayed on your contact page for enquiries.">
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => { setContactEmail(e.target.value); setSaved(false) }}
          className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
        />
      </Field>

      <Field label="About page photo" help="Shown beside your bio on the site's About page.">
        {aboutPhotoUrl ? (
          <div className="relative w-40 h-40 border border-border overflow-hidden">
            <img src={aboutPhotoUrl} alt="About page photo" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => { setAboutPhotoUrl(null); setSaved(false) }}
              title="Remove photo"
              className="absolute top-1 right-1 bg-ink text-bone rounded-full p-0.5 hover:bg-terracotta transition-colors"
            >
              <X size={10} />
            </button>
          </div>
        ) : (
          <ImageUpload
            label=""
            helpText=""
            bucket="artwork-public"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            maxMB={20}
            showPreview={false}
            onUpload={(url) => { setAboutPhotoUrl(url); setSaved(false) }}
          />
        )}
      </Field>

      <Field label="Instagram URL (optional)">
        <input
          type="url"
          value={instagramUrl}
          onChange={(e) => { setInstagramUrl(e.target.value); setSaved(false) }}
          placeholder="https://instagram.com/yourhandle"
          className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
        />
      </Field>

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-ink text-bone px-5 py-3 text-sm hover:bg-terracotta transition-colors disabled:opacity-60"
        >
          {isPending && <Loader2 size={12} className="animate-spin" />}
          Save
        </button>
        {saved && <p className="text-xs text-olive">Saved.</p>}
      </div>
    </div>
  )
}
