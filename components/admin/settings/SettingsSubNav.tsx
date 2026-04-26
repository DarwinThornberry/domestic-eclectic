'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

const SECTIONS = [
  {
    heading: 'PRICING',
    items: [
      { href: '/admin/settings/pricing/strategy', label: 'Strategy' },
      { href: '/admin/settings/pricing/costs',    label: 'Print Costs' },
      { href: '/admin/settings/pricing/discounts', label: 'Discounts' },
    ],
  },
  {
    heading: 'STUDIO',
    items: [
      { href: '/admin/settings/notifications',    label: 'Notifications' },
      { href: '/admin/settings/studio',           label: 'Studio Profile' },
      { href: '/admin/settings/account',          label: 'Account' },
      { href: '/admin/settings/launch-signups',   label: 'Email Signups' },
    ],
  },
]

export function SettingsSubNav() {
  const pathname = usePathname()

  return (
    <aside className="shrink-0 w-44 border-r border-border bg-bone py-6 px-3 flex flex-col gap-6 hidden lg:flex">
      {SECTIONS.map((section) => (
        <div key={section.heading}>
          <p className="caption text-ink-muted tracking-[0.14em] text-[9px] px-3 mb-2">
            {section.heading}
          </p>
          <nav className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 text-sm rounded-sm transition-colors ${
                    active
                      ? 'bg-bone-dark text-ink'
                      : 'text-ink-muted hover:text-ink hover:bg-bone-dark'
                  }`}
                >
                  {item.label}
                  {active && <ChevronRight size={12} className="text-ink-muted" />}
                </Link>
              )
            })}
          </nav>
        </div>
      ))}
    </aside>
  )
}

export function SettingsMobileNav() {
  const pathname = usePathname()
  const allItems = SECTIONS.flatMap((s) => s.items)

  return (
    <nav className="lg:hidden shrink-0 flex border-b border-border bg-bone overflow-x-auto px-4">
      {allItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap text-xs px-3 py-3 border-b-2 transition-colors ${
              active
                ? 'border-ink text-ink'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
