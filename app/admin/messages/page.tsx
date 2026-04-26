import { createAdminClient } from '@/lib/supabase/server'
import { MessagesClient } from '@/components/admin/MessagesClient'

export const metadata = { title: 'Messages' }

export default async function MessagesPage() {
  let messages: {
    id: string
    name: string
    email: string
    message: string
    is_read: boolean
    created_at: string
  }[] = []

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('contact_messages')
      .select('id, name, email, message, is_read, created_at')
      .order('created_at', { ascending: false })
    messages = data ?? []
  }

  const unreadCount = messages.filter((m) => !m.is_read).length

  return (
    <div className="px-6 lg:px-10 py-10 max-w-4xl">
      <div className="mb-8">
        <p className="caption text-terracotta tracking-[0.16em] mb-2">STUDIO</p>
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-4xl italic text-ink">Messages</h1>
          {unreadCount > 0 && (
            <span className="text-sm text-terracotta">
              {unreadCount} unread
            </span>
          )}
        </div>
        <p className="text-sm text-ink-muted mt-1">
          Contact form submissions from your website.
        </p>
      </div>

      <MessagesClient messages={messages} />
    </div>
  )
}
