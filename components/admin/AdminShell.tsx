'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import {
  LayoutDashboard, Package, Image, Settings, BarChart2,
  LogOut, ChevronDown, Mail, Rss,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/admin',           label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders',    label: 'Orders',    icon: Package },
  { href: '/admin/artworks',  label: 'Works',     icon: Image },
  { href: '/admin/messages',  label: 'Messages',  icon: Mail },
  { href: '/admin/newsletter',label: 'Studio Notes', icon: Rss },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/settings',  label: 'Settings',  icon: Settings },
]

interface Props {
  children: React.ReactNode
  userInitials: string
  userName: string
  unreadMessages?: number
}

export function AdminShell({ children, userInitials, userName, unreadMessages = 0 }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function isActive(item: typeof NAV_ITEMS[0]): boolean {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex flex-col h-screen bg-bone" style={{ '--color-bone': '#F5F1EA', '--color-bone-dark': '#EDE8DF' } as React.CSSProperties}>
      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <header className="shrink-0 h-14 flex items-center justify-between px-5 lg:px-8 bg-bone border-b border-border z-10">
        <div className="flex items-center gap-0 leading-none">
          <div className="flex flex-col items-start gap-0.5">
            <span className="wordmark-domestic text-ink text-[10px]">DOMESTIC</span>
            <span className="wordmark-eclectic text-ink text-[13px]">Eclectic</span>
          </div>
          <span className="ml-2.5 caption text-[9px] tracking-[0.2em] text-ink-muted border border-border-dark px-1.5 py-0.5 self-center">
            STUDIO
          </span>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 text-ink hover:text-terracotta transition-colors"
            aria-label="Account menu"
          >
            <div className="w-8 h-8 rounded-full bg-ink text-bone flex items-center justify-center text-xs font-body font-medium tracking-wide">
              {userInitials}
            </div>
            <ChevronDown size={13} className={`transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-bone border border-border shadow-sm py-1 z-50">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-xs text-ink-muted">{userName}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-bone-dark transition-colors flex items-center gap-2"
              >
                <LogOut size={13} className="text-ink-muted" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Mobile nav tabs ──────────────────────────────────────────────────── */}
      <nav className="lg:hidden shrink-0 flex border-b border-border bg-bone overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item)
          const showBadge = item.href === '/admin/messages' && unreadMessages > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-1.5 px-4 py-3 text-xs whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? 'border-ink text-ink'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              <item.icon size={13} />
              {item.label}
              {showBadge && (
                <span className="ml-0.5 bg-terracotta text-bone text-[9px] font-medium px-1.5 py-0.5 rounded-full leading-none">
                  {unreadMessages}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Body: sidebar + content ──────────────────────────────────────────���── */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex flex-col w-48 shrink-0 border-r border-border bg-bone">
          <nav className="flex flex-col py-6 gap-0.5 px-3">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item)
              const showBadge = item.href === '/admin/messages' && unreadMessages > 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors rounded-sm ${
                    active
                      ? 'bg-bone-dark text-ink'
                      : 'text-ink-muted hover:text-ink hover:bg-bone-dark'
                  }`}
                >
                  <item.icon size={14} />
                  <span className="flex-1">{item.label}</span>
                  {showBadge && (
                    <span className="bg-terracotta text-bone text-[9px] font-medium px-1.5 py-0.5 rounded-full leading-none">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
