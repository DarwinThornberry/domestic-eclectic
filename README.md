# Domestic Eclectic

Fine art print-on-demand store for Melbourne artist Lara Stoco. Built with Next.js 16, Tailwind v4, Supabase, and Stripe.

## Architecture

```
app/
  (public)/          — customer-facing pages (homepage, gallery, artwork, cart, checkout)
  (admin)/           — password-protected admin panel (orders, artworks, settings)
  api/               — API routes (Stripe checkout, webhooks, admin actions)
components/
  site/              — public-site components (Nav, Footer, etc.)
  admin/             — admin-only components
  ui/                — shared UI primitives
lib/
  pricing/           — southern-buoy.ts: single source of truth for all prices + shipping
  supabase/          — server.ts (Server Components) + client.ts (Client Components)
  stripe/            — Stripe client helpers
  email/             — Resend email templates
  constants/         — shared labels, site config
types/               — TypeScript interfaces matching the DB schema
supabase/migrations/ — SQL migrations to run in Supabase
```

## Key decisions

- **Money**: all prices stored and calculated as integer cents (AUD). Divide by 100 only at display time.
- **Pricing**: `lib/pricing/southern-buoy.ts` is the single source of truth. Adjust `MARKUP_MULTIPLIER` to reprice everything.
- **Cart**: stored in localStorage (client). Server always recalculates prices — never trusts client-submitted values.
- **Payments**: Stripe hosted Checkout (not Elements). Webhook is idempotent — safe to receive duplicate events.
- **Auth**: Supabase Auth, email + password. Admin access checked against `admins` DB table.

## Getting started

```bash
cp .env.local.example .env.local
# Fill in all env vars (Supabase, Stripe, Resend)

npm install
npm run dev
```

Run the SQL in `supabase/migrations/001_initial_schema.sql` in your Supabase project SQL editor.

## Build phases

| Phase | Status | Scope |
|-------|--------|-------|
| 1 — Foundation | ✅ Done | Scaffold, design system, homepage, gallery |
| 2 — Configurator | ⬜ Next | Artwork page, pricing, cart |
| 3 — Checkout | ⬜ | Stripe, webhook, emails |
| 4 — Admin | ⬜ | Auth, orders, artwork management |
| 5 — Polish | ⬜ | SEO, Vercel deploy, HANDOVER.md |

## Deployment

Deploy to Vercel. Set all env vars in the Vercel dashboard. Set `SITE_URL` to the production domain.
Configure the Stripe webhook endpoint to `https://yourdomain.com/api/webhooks/stripe`.
