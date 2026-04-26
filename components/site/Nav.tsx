'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'

const NAV_LINKS = [
  { href: '/works', label: 'Works' },
  { href: '/about', label: 'About' },
  { href: '/process', label: 'Process' },
  { href: '/contact', label: 'Contact' },
]

export function Nav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { totals, mounted } = useCart()

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const itemCount = mounted ? totals.itemCount : 0

  return (
    <header className="sticky top-0 z-50 bg-bone border-b border-border">
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-[4.5rem] flex items-center justify-between">

        {/* Wordmark */}
        <Link href="/" className="flex flex-col items-start gap-0.5 leading-none shrink-0">
          <span className="wordmark-domestic text-ink">DOMESTIC</span>
          <span className="wordmark-eclectic text-ink">Eclectic</span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`caption transition-colors hover:text-terracotta ${
                  pathname.startsWith(href) ? 'text-ink' : 'text-ink-muted'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Cart icon + mobile menu */}
        <div className="flex items-center gap-5">
          <Link
            href="/cart"
            aria-label={`View cart${itemCount > 0 ? ` — ${itemCount} item${itemCount !== 1 ? 's' : ''}` : ''}`}
            className="relative text-ink hover:text-terracotta transition-colors"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-terracotta text-bone text-[10px] leading-none rounded-full flex items-center justify-center px-1">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            className="md:hidden text-ink hover:text-terracotta transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-bone border-t border-border px-6 py-8 flex flex-col gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-display text-2xl italic text-ink hover:text-terracotta transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
