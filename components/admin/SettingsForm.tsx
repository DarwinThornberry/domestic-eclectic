'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { saveSettings } from '@/app/admin/actions'
import type { Settings } from '@/types'

interface Props {
  settings: Partial<Settings> | null
}

function Section({ title, children, onSave, isPending, saved }: {
  title: string
  children: React.ReactNode
  onSave: () => void
  isPending: boolean
  saved: boolean
}) {
  return (
    <section className="pt-8 first:pt-0 border-t first:border-t-0 border-border">
      <h2 className="caption text-ink tracking-[0.12em] mb-6">{title}</h2>
      <div className="flex flex-col gap-5">
        {children}
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={onSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-ink text-bone px-5 py-3 text-sm hover:bg-terracotta transition-colors disabled:opacity-60"
          >
            {isPending && <Loader2 size={12} className="animate-spin" />}
            Save
          </button>
          {saved && <p className="text-xs text-olive">Saved.</p>}
        </div>
      </div>
    </section>
  )
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

function Input({ value, onChange, type = 'text', ...rest }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & { onChange: (v: string) => void }) {
  return (
    <input
      type={type}
      value={value as string}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
      {...rest}
    />
  )
}

export function SettingsForm({ settings }: Props) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  const [markup, setMarkup] = useState(String(settings?.markup_multiplier ?? 2.2))
  const [adminEmail, setAdminEmail] = useState(settings?.admin_email ?? '')
  const [printerEmail, setPrinterEmail] = useState(settings?.printer_email ?? 'southernbuoy@gmail.com')
  const [studioName, setStudioName] = useState(settings?.studio_name ?? 'Domestic Eclectic')
  const [contactEmail, setContactEmail] = useState(settings?.contact_email ?? '')
  const [instagramUrl, setInstagramUrl] = useState(settings?.instagram_url ?? '')

  function save(section: string, data: Partial<Omit<Settings, 'id' | 'updated_at'>>) {
    setError(null)
    setSaved((prev) => ({ ...prev, [section]: false }))
    startTransition(async () => {
      try {
        await saveSettings(data)
        setSaved((prev) => ({ ...prev, [section]: true }))
      } catch (e: any) {
        setError(e.message ?? 'Could not save. Please try again.')
      }
    })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <div className="border border-border p-6">
        <p className="text-sm text-ink-muted">Connect Supabase to manage settings.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      {error && (
        <p className="text-sm text-terracotta border border-terracotta/30 bg-terracotta/5 px-4 py-3">
          {error}
        </p>
      )}

      {/* Pricing */}
      <Section
        title="PRICING"
        onSave={() => save('pricing', { markup_multiplier: parseFloat(markup) })}
        isPending={isPending}
        saved={!!saved.pricing}
      >
        <Field
          label="Markup multiplier"
          help={`Customer prices are calculated by multiplying Southern Buoy's base costs by this number. At ${markup}×, a $100 base cost becomes $${(parseFloat(markup) * 100).toFixed(0)} for your customer.`}
        >
          <Input
            type="number"
            value={markup}
            onChange={setMarkup}
            min="1"
            max="10"
            step="0.1"
            className="w-32 border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
          />
        </Field>
      </Section>

      {/* Notifications */}
      <Section
        title="NOTIFICATIONS"
        onSave={() => save('notifications', { admin_email: adminEmail, printer_email: printerEmail })}
        isPending={isPending}
        saved={!!saved.notifications}
      >
        <Field
          label="Your notification email"
          help="Where you'll receive new order notifications."
        >
          <Input type="email" value={adminEmail} onChange={setAdminEmail} />
        </Field>
        <Field
          label="Printer email (Southern Buoy)"
          help="Where print orders are sent. Change this if Southern Buoy ever updates their email."
        >
          <Input type="email" value={printerEmail} onChange={setPrinterEmail} />
        </Field>
      </Section>

      {/* Studio */}
      <Section
        title="STUDIO"
        onSave={() => save('studio', { studio_name: studioName, contact_email: contactEmail, instagram_url: instagramUrl || null })}
        isPending={isPending}
        saved={!!saved.studio}
      >
        <Field label="Studio name">
          <Input value={studioName} onChange={setStudioName} />
        </Field>
        <Field
          label="Contact email (shown on site)"
          help="The email address shown on your contact page."
        >
          <Input type="email" value={contactEmail} onChange={setContactEmail} />
        </Field>
        <Field label="Instagram URL (optional)">
          <Input
            type="url"
            value={instagramUrl}
            onChange={setInstagramUrl}
            placeholder="https://instagram.com/yourhandle"
          />
        </Field>
      </Section>

      {/* Account */}
      <Section
        title="ACCOUNT"
        onSave={() => {}}
        isPending={false}
        saved={false}
      >
        <p className="text-sm text-ink-muted leading-relaxed">
          To change your password, use the{' '}
          <a href="/forgot-password" className="text-ink underline underline-offset-2 hover:text-terracotta transition-colors">
            password reset flow
          </a>
          . Enter your email and we'll send you a link.
        </p>
      </Section>
    </div>
  )
}
