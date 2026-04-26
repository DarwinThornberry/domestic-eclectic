'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { saveSettings } from '@/app/admin/actions'

interface Props {
  adminEmail: string
  printerEmail: string
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

export function NotificationsClient({ adminEmail: initial_admin, printerEmail: initial_printer }: Props) {
  const [adminEmail, setAdminEmail] = useState(initial_admin)
  const [printerEmail, setPrinterEmail] = useState(initial_printer)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      try {
        await saveSettings({ admin_email: adminEmail, printer_email: printerEmail })
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

      <Field
        label="Your notification email"
        help="Where you'll receive new order notifications and confirmations."
      >
        <input
          type="email"
          value={adminEmail}
          onChange={(e) => { setAdminEmail(e.target.value); setSaved(false) }}
          className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
        />
      </Field>

      <Field
        label="Printer email (Southern Buoy)"
        help="Where print orders are forwarded. Change this only if Southern Buoy updates their address."
      >
        <input
          type="email"
          value={printerEmail}
          onChange={(e) => { setPrinterEmail(e.target.value); setSaved(false) }}
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
