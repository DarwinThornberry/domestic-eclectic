'use client'

import { useState, useTransition } from 'react'
import { Mail, MailOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { markMessageRead } from '@/app/admin/actions'

interface Message {
  id: string
  name: string
  email: string
  message: string
  is_read: boolean
  created_at: string
}

interface Props {
  messages: Message[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function MessagesClient({ messages: initial }: Props) {
  const [messages, setMessages] = useState(initial)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggleExpand(id: string) {
    const msg = messages.find((m) => m.id === id)
    // Auto-mark as read when first opened
    if (msg && !msg.is_read) handleMarkRead(id, true)
    setExpandedId((prev) => (prev === id ? null : id))
  }

  function handleMarkRead(id: string, isRead: boolean) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: isRead } : m)))
    startTransition(async () => {
      await markMessageRead(id, isRead)
    })
  }

  if (messages.length === 0) {
    return (
      <div className="border border-border px-6 py-12 text-center">
        <p className="font-display text-xl italic text-ink-muted">No messages yet.</p>
        <p className="text-sm text-ink-muted mt-2">
          Contact form submissions will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-border divide-y divide-border">
      {messages.map((msg) => {
        const expanded = expandedId === msg.id

        return (
          <div key={msg.id}>
            {/* Row */}
            <div
              className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-bone-dark/40 transition-colors ${
                !msg.is_read ? 'bg-terracotta/[0.03]' : ''
              }`}
              onClick={() => toggleExpand(msg.id)}
            >
              {/* Read indicator */}
              <div className="shrink-0">
                {msg.is_read
                  ? <MailOpen size={14} className="text-ink-muted/50" />
                  : <Mail size={14} className="text-terracotta" />
                }
              </div>

              {/* Name */}
              <p className={`w-32 shrink-0 text-sm truncate ${msg.is_read ? 'text-ink-muted' : 'text-ink font-medium'}`}>
                {msg.name}
              </p>

              {/* Email */}
              <p className="w-48 shrink-0 text-xs text-ink-muted font-mono truncate hidden lg:block">
                {msg.email}
              </p>

              {/* Preview */}
              <p className={`flex-1 min-w-0 text-sm truncate ${msg.is_read ? 'text-ink-muted' : 'text-ink'}`}>
                {msg.message}
              </p>

              {/* Date */}
              <p className="shrink-0 text-xs text-ink-muted whitespace-nowrap hidden sm:block">
                {formatDate(msg.created_at)}
              </p>

              {/* Chevron */}
              <span className="shrink-0 text-ink-muted">
                {expanded
                  ? <ChevronUp size={13} />
                  : <ChevronDown size={13} />
                }
              </span>
            </div>

            {/* Expanded detail */}
            {expanded && (
              <div className="px-5 pb-5 pt-3 bg-bone-dark/20 border-t border-border">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-ink">{msg.name}</p>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-xs text-ink-muted font-mono hover:text-ink transition-colors inline-flex items-center gap-1 mt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {msg.email}
                      <ExternalLink size={10} />
                    </a>
                    <p className="text-xs text-ink-muted/60 mt-1">{formatDate(msg.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleMarkRead(msg.id, !msg.is_read)}
                      disabled={isPending}
                      className="text-xs text-ink-muted hover:text-ink transition-colors border border-border px-3 py-1.5 hover:bg-bone-dark disabled:opacity-50"
                    >
                      {msg.is_read ? 'Mark unread' : 'Mark read'}
                    </button>
                    <a
                      href={`mailto:${msg.email}?subject=Re: Your message to Domestic Eclectic`}
                      className="caption text-[10px] text-bone bg-ink px-3 py-1.5 hover:bg-terracotta transition-colors"
                    >
                      Reply
                    </a>
                  </div>
                </div>

                {/* Full message */}
                <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap border-t border-border pt-4">
                  {msg.message}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
