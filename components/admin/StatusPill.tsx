import type { OrderStatus } from '@/types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string; strikethrough?: boolean }> = {
  pending:          { label: 'Pending',          bg: 'bg-bone-dark',              text: 'text-ink-muted' },
  paid:             { label: 'Awaiting action',  bg: 'bg-terracotta/15',          text: 'text-ink' },
  sent_to_printer:  { label: 'Sent to printer',  bg: 'bg-olive/15',               text: 'text-ink' },
  shipped:          { label: 'Shipped',           bg: 'bg-[#D4E1E8]/60',           text: 'text-ink' },
  delivered:        { label: 'Delivered',         bg: 'bg-[#D4E8D4]/60',           text: 'text-ink' },
  cancelled:        { label: 'Cancelled',         bg: 'bg-bone-dark',              text: 'text-ink-muted', strikethrough: true },
  refunded:         { label: 'Refunded',          bg: 'bg-bone-dark',              text: 'text-ink-muted', strikethrough: true },
}

interface Props {
  status: OrderStatus
  size?: 'sm' | 'md'
}

export function StatusPill({ status, size = 'md' }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center rounded-sm font-body tracking-wide whitespace-nowrap ${padding} ${config.bg} ${config.text} ${config.strikethrough ? 'line-through opacity-70' : ''}`}
    >
      {config.label}
    </span>
  )
}
