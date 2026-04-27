import Link from 'next/link'
import { NewsletterForm } from './NewsletterForm'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 py-16">

          {/* Wordmark + about */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="wordmark-domestic text-ink">DOMESTIC</p>
              <p className="wordmark-eclectic text-ink">Eclectic</p>
            </div>
            <p className="caption text-ink-muted">by Lara Stocco</p>
            <p className="text-sm text-ink-muted leading-relaxed mt-2">
              Fine art prints of original mixed-media collages,
              printed on archival materials in Mornington, Victoria.
            </p>

            {/* Social */}
            <div className="flex items-center gap-4 mt-4">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Domestic Eclectic on Instagram"
                className="text-ink-muted hover:text-ink transition-colors"
              >
                {/* Instagram icon — inline SVG, lucide-react doesn't include it */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Domestic Eclectic on Facebook"
                className="text-ink-muted hover:text-ink transition-colors"
              >
                {/* Facebook icon — inline SVG, lucide-react doesn't include it */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="caption text-ink mb-5">Navigate</p>
            <ul className="flex flex-col gap-3">
              {[
                { href: '/works', label: 'Works' },
                { href: '/about', label: 'About' },
                { href: '/process', label: 'Process' },
                { href: '/contact', label: 'Contact' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-ink-muted hover:text-ink transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="caption text-ink mb-3">Studio Notes</p>
            <p className="text-xs text-ink-muted mb-4 leading-relaxed">
              Occasional updates from the studio — new works, process notes,
              and what&apos;s on the bench.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Acknowledgement of Country — [PLACEHOLDER] Lara to review wording */}
        <div className="border-t border-border py-8">
          <p className="text-xs text-ink-muted leading-relaxed max-w-2xl">
            Domestic Eclectic acknowledges the Traditional Custodians of the lands
            on which we live and create. We pay our respects to Elders past and present.
          </p>
        </div>

        {/* Copyright */}
        <div className="border-t border-border py-5 flex flex-col md:flex-row justify-between gap-3">
          <p className="text-xs text-ink-muted">
            © {year} Lara Stocco · Domestic Eclectic. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <p className="text-xs text-ink-muted">
              Fulfilled by{' '}
              <a
                href="https://www.southernbuoy.com.au"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink transition-colors"
              >
                Southern Buoy
              </a>
              , Mornington VIC
            </p>
            <Link href="/login" className="text-xs text-ink-muted hover:text-ink transition-colors">
              Studio
            </Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
