import Stripe from 'stripe'

// Lazily initialised so the app doesn't crash at build time
// if STRIPE_SECRET_KEY isn't set yet.
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        'STRIPE_SECRET_KEY is not configured. Add it to .env.local before testing checkout.',
      )
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-04-22.dahlia',
    })
  }
  return _stripe
}
