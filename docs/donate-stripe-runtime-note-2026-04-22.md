# Donate Stripe Runtime Note

Date: 2026-04-22

- `/donate` now uses live Stripe Checkout through Cloudflare Pages Functions when the Stripe runtime contract is mounted and enabled.
- Required env names:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_LIVE_ENABLED`
- Active payment path in this milestone: one-time Stripe Checkout card flow.
- Deferred payment paths:
  - PayPal
  - any broader donation ledger or billing admin surface
- Fallback behavior:
  - if the Stripe env contract is incomplete or unavailable, `/donate` keeps the current premium layout, disables the primary checkout action, and shows public-safe unavailability messaging instead of runtime detail
  - the amount-selection UI stays visible so the route still reads as an intentional support page rather than a broken payment surface
- PayPal remains a later milestone and is intentionally not presented as a working button in this pass.
