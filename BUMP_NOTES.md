CURRENT VER= v1.0 / PENDING VER= v1.0.1

## Cart Drawer, Customer Profile Refresh, And Merch Banner Diagnostics Repair

### Technical

- Moved the Personal Studio cart drawer into a React portal attached to `document.body` so fixed positioning is not trapped by the header/page stacking context; CSS now explicitly uses a high-z fixed viewport overlay, a full fixed scrim, and a `100dvh` right-side panel.
- Preserved the existing cart icon-only trigger and full `/cart` page while keeping drawer close behavior on backdrop/outside click, Escape, close button, and `Open Cart` navigation.
- Customer profile saves now use the returned server customer profile immediately, dispatch the existing `danielclancy:customer-session-updated` event with that profile, and refetch `/api/customer/me` with `cache: "no-store"` so header/account state refreshes before and after hard reloads.
- `PATCH /api/customer/profile` now rejects non-HTTPS avatar URLs with `valid_avatar_url_required` and preserves the existing stored avatar unless an explicit clear flag is sent.
- Public merch product APIs now report safe override diagnostics (`overrideSource`, `overrideRevision`, `overrideUpdatedAt`, `productOverrideCount`, `bannerCount`, and warning when applicable) while keeping Admin public site-data reads no-store/cache-busted.
- Public merch banner normalization now filters disabled product-level banner assignments as well as disabled registry banners.
- Added focused public banner merge coverage for enabled assigned banners, disabled registry/assignment filtering, and safe ad-hoc banner labels.

### Human-readable

- `/shop` cart now opens as a real right-side drawer instead of appearing squashed in the header area.
- Saving display name/avatar from `/account/profile` updates the header/account UI immediately and still relies on the KV-backed `/api/customer/me` profile after refresh.
- Public product responses now make it clear whether live Admin banner overrides were used, missing, or unavailable.

### Known limitations

- Live banner/profile proof still depends on deployed Pages bindings and configured `DC_CUSTOMERS_KV`, `PRINTFUL_STORE_API`, and Admin public site-data URL.
- No OAuth/manual login modal behavior was replaced; the restored OAuth provider plus collapsed email/password login remains the primary public login UI.

### Files / areas changed

- `README.md`
- `functions/_shared/printful-products.js`
- `functions/api/customer/[[path]].js`
- `functions/api/merch/products/[[lookup]].js`
- `src/components/PersonalHeaderAccount.tsx`
- `src/lib/customerAccount.ts`
- `src/lib/merch.ts`
- `src/pages/AccountPage.tsx`
- `src/styles/global.css`
- `tests/merch-product-banners.test.mjs`

## Restored Customer Login, Cart Drawer, Account Titles, And Merch Banner Sync Milestone

### Technical

- Replaced the passwordless-only customer login panel as the primary UI with the restored shared login modal pattern: OAuth provider buttons plus a collapsed manual email/password section backed by DanielClancy-Admin auth endpoints.
- Kept legacy `POST /api/customer/login/start` magic-link behavior available as a secondary endpoint, but removed it from the primary header and `/account/login` customer experience.
- Added `VITE_ADMIN_AUTH_ORIGIN` support for the public login panel, defaulting to `https://admin.danielclancy.net`, without exposing Admin secrets or storing session tokens in localStorage.
- Updated public logout to clear both `dc_customer_session` and the shared `dc_auth_session` cookie name with production `.danielclancy.net` domain behavior and host-only local/dev behavior.
- Converted the Personal Studio cart icon from a direct `/cart` link into a right-side drawer trigger. The drawer reads the existing local cart helper, validates totals through the existing merch cart API, supports quantity/remove controls, closes on Escape/backdrop, and keeps a prominent `Open Cart` link to the full `/cart` page.
- Reduced account/customer hero title sizing by more than half through the account-scoped `.account-hero h1` style.
- Changed public merch product APIs and Admin site-data fetches to no-store/no-cache reads so refreshed product cards/details and cart validation can see current published banner/settings data.
- Updated README notes for the restored OAuth/manual login model, secondary magic-link status, shared cookies, cart drawer, and merch banner refresh behavior.

### Human-readable

- Public `MORE > Login`, `/account/login`, and `/watch` account login now use the restored OAuth/manual login modal instead of a broken magic-link-only screen.
- The cart icon opens a cart drawer first while preserving the full `/cart` page.
- Account pages no longer use oversized hero titles.
- Product promo banners saved from Admin can appear on public `/shop` and product detail refreshes once the Admin save publishes the sanitized snapshot.

### Known limitations

- Real OAuth/manual login still depends on the DanielClancy-Admin Pages project env vars, OAuth apps, and shared `DC_CUSTOMERS_KV` binding.
- OAuth providers that do not return a verified email may not create a public-recognizable customer profile until an email identity exists.

### Files / areas changed

- `README.md`
- `functions/api/customer/[[path]].js`
- `functions/api/merch/cart/[[action]].js`
- `functions/api/merch/products/[[lookup]].js`
- `src/components/PersonalHeaderAccount.tsx`
- `src/lib/customerAccount.ts`
- `src/pages/AccountPage.tsx`
- `src/styles/global.css`

## Shared Public/Admin Login + Header Dropdown Repair Milestone

### Technical

- Updated the customer session cookie helper so `dc_customer_session` defaults to `Domain=.danielclancy.net` on production `danielclancy.net` / `admin.danielclancy.net` requests and remains host-only on localhost/dev.
- Preserved hashed KV-backed customer session lookup and added normalized server-only customer admin access fields to customer profiles without exposing them through public `/api/customer/me` responses.
- Restored the existing `.login-modal` visual contract as a shared React login modal/panel; Personal Studio dropdown Login opens the modal and `/account/login` renders the same panel instead of a separate stale form.
- Changed logged-out Personal Studio and `/watch` account labels to `MORE`; logged-in state still resolves the server-returned display name/avatar.
- Added Login, Account, Cart, Shop, Orders / Purchase history, and Contact / help to the logged-out dropdown, and kept Logout in the logged-in dropdown.
- Removed the redundant text `Cart` Personal Studio nav item while preserving the cart icon button, badge behavior, `/cart` route, and account-menu Cart links.
- Replaced `/watch`'s static profile pill with the shared account dropdown while preserving the custom cinematic watch header/chrome.
- Logout now clears the shared customer cookie server-side and updates local account UI state without clearing cart selections.

### Human-readable

- Public customer login now enters through the main account modal/panel, not a route-only broken login experience.
- A shared production customer session can be recognized across the public and Admin subdomains when both projects use `DC_CUSTOMERS_KV -> danielclancy-customers`.
- Professional CV/portfolio shell remains separate from storefront/customer controls.

### Known limitations

- Passwordless customer login still depends on configured `RESEND_API_KEY`, `MAIL_FROM`, and `DC_CUSTOMERS_KV`; missing bindings continue to fail closed with safe config-needed responses.
- Public logout clears the shared customer session. Admin-specific signed-session logout is handled by the Admin project.

### Files / areas changed

- `.env.example`
- `README.md`
- `functions/_shared/customer-accounts.js`
- `src/components/PersonalHeaderAccount.tsx`
- `src/components/PersonalShell.tsx`
- `src/pages/AccountPage.tsx`
- `src/pages/WatchPage.tsx`
- `src/styles/global.css`

## Personal Studio Header Cart / Account Dropdown Milestone

### Technical

- Added a Personal Studio header cart icon button that links to `/cart` and stays scoped to `PersonalShell`.
- Wired the cart icon badge to the existing `merchCart` local selection helper; the badge hides at zero, updates on cart events/focus/storage changes, and caps visually at `99+`.
- Replaced the basic Personal Studio account link with a StreamSuites-Dashboard-style dropdown pattern: compact avatar/name pill, dark glass panel, account identity block, icon menu rows, click-outside close, Escape close, and right-aligned desktop/mobile-safe positioning.
- Added logged-out dropdown rows for sign-in/create account, account overview, cart, order history, and contact help.
- Added logged-in dropdown rows for overview, profile, orders, delivery addresses, preferences, payment methods, cart, and logout.
- Logout uses the existing `logoutCustomer()` helper for `POST /api/customer/logout`, clears only in-memory customer UI state after success, closes the dropdown, emits the customer-session update event, and routes to `/account/login`.
- Updated README, Privacy, and Terms copy to describe the route/API account flow instead of the old public account modal wording.

### Human-readable

- Personal Studio shoppers now have a persistent cart icon and a polished account menu in the shop/account header without changing the professional CV/portfolio header.
- Signed-out customers can reach login, account, cart, and order-history routes from the dropdown without opening a modal.
- Signed-in customers can reach all customer account sections and log out from the same header control.

### Known limitations

- The cart badge reflects the existing non-sensitive local cart selections; server validation still happens later through the merch cart APIs.
- Local static/dev smoke tests can prove the dropdown UI and routing, but a real signed-in customer session still depends on configured `DC_CUSTOMERS_KV` and email provider bindings.

### Files / areas changed

- `README.md`
- `src/components/PersonalHeaderAccount.tsx`
- `src/components/PersonalShell.tsx`
- `src/pages/PrivacyPage.tsx`
- `src/pages/TermsPage.tsx`
- `src/styles/global.css`

## Customer Account Foundation Milestone

### Technical

- Added same-origin customer account routes under the Personal Studio shell: `/account`, `/account/login`, `/account/profile`, `/account/orders`, `/account/addresses`, `/account/preferences`, `/account/payments`, and `/account/logout`.
- Added `DC_CUSTOMERS_KV` helpers and key families for customer profiles, email lookup, hashed login challenges, hashed sessions, customer order links, recent customer index rows, and Stripe customer mappings.
- Added passwordless email magic-link endpoints under `/api/customer/*`. Login tokens are generated with secure random bytes, stored hashed, expire, and sessions are stored separately with HttpOnly SameSite=Lax cookies.
- Reused Resend only when `RESEND_API_KEY` and `MAIL_FROM` are configured; otherwise login start fails safely with `customer_email_provider_not_configured`.
- Added profile, HTTPS avatar URL, optional phone, contact preferences, marketing opt-in, delivery address add/edit/delete/default, order history, logout, and Stripe Customer Portal API/UI paths.
- Linked signed-in merch checkout to the server-resolved customer account without trusting client-provided customer ids; guest checkout remains available.
- When signed in, checkout creates/stores a Stripe customer id server-side where needed, passes it to Stripe Checkout, stores only the Stripe customer id mapping, and links the merch order intent under the customer account.
- Updated cart prefill to use the signed-in customer default delivery address only when `/api/customer/me` returns one.
- Replaced the old Personal Studio Admin-origin account modal with a same-origin customer account link in the Personal header and added Cart to the Personal navigation.

### Human-readable

- Customers can request a real passwordless sign-in link, manage profile details, delivery addresses, preferences, linked orders, and Stripe-hosted payment-method management states.
- Missing customer KV or email/Stripe provider setup shows clear config-needed errors instead of fake login, fake persistence, or fake payment-method data.
- Raw card numbers, CVCs, bank details, and raw Stripe payment method payloads are not stored or rendered by DanielClancy.net.

### Cloudflare setup required

- DanielClancy Pages project: `DC_CUSTOMERS_KV -> danielclancy-customers`.
- Magic-link email requires server-side `RESEND_API_KEY` and `MAIL_FROM`.
- Stripe Customer Portal requires existing `STRIPE_SECRET_KEY` plus Stripe Dashboard Customer Portal configuration.

### Known limitations

- Avatar upload is not implemented in the public storefront; profile supports a HTTPS avatar URL only.
- Hosted Pages verification is still required after `DC_CUSTOMERS_KV`, Resend, Stripe, and Stripe Customer Portal are configured.

### Files / areas changed

- `.env.example`
- `README.md`
- `functions/_shared/customer-accounts.js`
- `functions/api/customer/[[path]].js`
- `functions/api/merch/cart/[[action]].js`
- `src/app/App.tsx`
- `src/components/PersonalHeaderAccount.tsx`
- `src/components/PersonalShell.tsx`
- `src/lib/customerAccount.ts`
- `src/pages/AccountPage.tsx`
- `src/pages/CartPage.tsx`
- `src/styles/global.css`

## Merch Category / Banner / Hero Slide UX Repair Milestone

### Technical

- Renamed the locked storefront system category from `All` to `All Products` while preserving the canonical slug `all`.
- Kept every visible product assigned to locked `All Products`, with additional Printful-derived or Admin-managed categories applied only when real metadata or overrides exist.
- Extended public product normalization to consume published Admin category settings, banner settings, and shop hero slide settings without making the public storefront an authority layer.
- Added product promo banner rendering on cards/details; banners render only when enabled and explicitly assigned.
- Added a static shop hero slide manifest for `assets/backgrounds/shopheroslides/` and crossfaded the configured slide set by default every 5 seconds.
- Strengthened merch price presentation: cards keep main AUD pricing only, while product detail/cart show stronger AUD prices plus selected-currency estimate rows with flag prefixes.
- Darkened currency controls so selected values/options remain readable.

### Human-readable

- Products with only `All Products` remain browseable at `/products/all`; that state is merchandising setup work, not a broken Printful sync.
- The shop hero now uses the configured merch imagery instead of a static-only text-heavy hero.
- Currency conversion remains informational and never blocks checkout when rates are unavailable.

### Follow-up

- Full public customer account management is still the next major phase. It needs a real auth/session model, customer profile storage, order-history integration, delivery-address/contact-preference storage, an Admin Customers page, and Stripe Customer Portal or equivalent saved-payment handling instead of raw card storage.

### Known limitations

- Admin cannot write new static hero files into the deployed git repo at runtime; static slides must be added to `assets/backgrounds/shopheroslides/` and the manifest, while runtime/uploaded slides must use public R2/CDN URLs.
- No default promo banners are invented for products.

### Files / areas changed

- `README.md`
- `functions/_shared/printful-products.js`
- `functions/api/merch/cart/[[action]].js`
- `functions/api/merch/products/[[lookup]].js`
- `src/content/shopHeroSlides.ts`
- `src/lib/merch.ts`
- `src/pages/CartPage.tsx`
- `src/pages/ProductDetailPage.tsx`
- `src/pages/ShopPage.tsx`
- `src/styles/global.css`

## Merch Stripe Webhook Secret Split / Currency Rates Config Milestone

### Technical

- Updated `POST /api/merch/stripe/webhook` to verify Stripe signatures only with `STRIPE_MERCH_WEBHOOK_SECRET`.
- Preserved the existing donation/payment Stripe webhook contract: `functions/api/payments/stripe/webhook.js` continues to use `STRIPE_WEBHOOK_SECRET`.
- Missing merch webhook signing config now fails closed with `merch_webhook_secret_not_configured` before reading the request body, touching KV, or attempting Printful confirmation.
- Invalid merch webhook signatures now return `merch_webhook_signature_invalid` without leaking secret material.
- Currency conversion now requires the explicit full endpoint URL `CURRENCY_RATES_API_URL=https://api.frankfurter.dev/v1/latest?base=AUD`; missing, failed, or non-AUD-base rate payloads return an unavailable conversion state while shopping and checkout remain unblocked.
- `.env.example` and README now document the donation/payment webhook secret and merch webhook secret as separate values.

### Human-readable

- The new merch webhook signing secret is isolated from the existing donation/payment webhook secret.
- Currency conversion remains display-only and AUD-based. Buyers still check out using server-validated store-currency totals.

### Cloudflare / Stripe setup notes

- Existing donation/payment webhook secret: `STRIPE_WEBHOOK_SECRET`.
- Merch-specific webhook secret: `STRIPE_MERCH_WEBHOOK_SECRET`.
- Merch webhook URL: `https://danielclancy.net/api/merch/stripe/webhook`.
- Merch webhook events: `checkout.session.completed` and `checkout.session.expired`.
- Currency rates URL: `CURRENCY_RATES_API_URL=https://api.frankfurter.dev/v1/latest?base=AUD`.

### Files / areas changed

- `.env.example`
- `README.md`
- `functions/api/merch/currency-rates.js`
- `functions/api/merch/stripe/webhook.js`

## Merch Storefront Routing / Pricing / Currency / Category Repair Milestone

### Technical

- Added explicit PersonalShell routes for `/products/all` and `/products/:category` before `/products/:category/:slug`, preserving `/shop`, `/store`, `/merch`, `/cart`, `/shop/success`, and `/shop/cancel`.
- Fixed product lookup normalization so slash-delimited `category/slug` keys stay slash-delimited instead of collapsing into one slug, and added `all/{product}` lookup fallback.
- Product detail API resolution now matches the public, override-merged product list first, then hydrates the selected product detail by Printful id. This supports Admin slug/category overrides and prevents valid generated product links from 404ing.
- Printful product list normalization now hydrates missing list prices/variants from detail endpoints with bounded concurrency, reads retail price candidates from variant/list/detail fields, derives min/max price ranges, defaults missing currency to AUD, and keeps checkout totals server-validated.
- Added category modeling with system `All Products`, Printful category/collection/tag/product-type fields where present, and Admin override categories from the published public-safe Admin data snapshot.
- Added `/api/merch/currency-rates` for AUD-based display conversion with optional `CURRENCY_RATES_API_URL`; conversion failures show unavailable UI and do not block shopping.
- Product cards show AUD/store-currency flag + price only. Product detail and cart show muted converted estimates and a small AUD conversion calculator while checkout remains store-currency only.
- Polished `/shop` toward a cinematic dark merch storefront with smaller hero typography, category chips, richer cards, and featured-product presentation.

### Human-readable

- Product links and category pages should now resolve instead of falling through to not-found states when the product exists.
- Merch prices should show real Printful variant prices when Printful returns them; “Price pending” is reserved for products with no usable server-side price after detail hydration.
- Converted prices are estimates only. The buyer is still charged through the validated AUD/store-currency checkout path.

### Cloudflare / Stripe setup notes

- Optional conversion endpoint override: `CURRENCY_RATES_API_URL=https://api.frankfurter.dev/v1/latest?base=AUD`. Leave blank only when display conversion should be unavailable.
- Stripe Dashboard webhook URL remains `https://danielclancy.net/api/merch/stripe/webhook`.
- Stripe webhook events remain `checkout.session.completed` and `checkout.session.expired`.

### Known limitations

- Currency conversion depends on a runtime rates fetch and can be unavailable without blocking shopping.
- PayPal merch checkout remains deferred because the existing PayPal code is donation-specific and not a safe product-cart checkout flow.

### Files / areas changed

- `.env.example`
- `README.md`
- `functions/_shared/printful-products.js`
- `functions/api/merch/cart/[[action]].js`
- `functions/api/merch/currency-rates.js`
- `functions/api/merch/products/[[lookup]].js`
- `src/app/App.tsx`
- `src/lib/currency.tsx`
- `src/lib/merch.ts`
- `src/pages/CartPage.tsx`
- `src/pages/ProductDetailPage.tsx`
- `src/pages/ShopPage.tsx`
- `src/styles/global.css`

## Live Merch Order Persistence / Storefront Shell Milestone

### Technical

- Moved `/shop`, `/store`, `/merch`, `/cart`, `/shop/success`, `/shop/cancel`, and `/products/:category/:slug` out of `ProfessionalShell` and into the Personal Studio/storefront shell.
- Removed Shop from the professional navigation and removed the professional footer Legal link block. `/privacy` and `/terms` routes remain available; Personal Studio/storefront footer legal links remain.
- Added `functions/_shared/merch-orders.js` with dedicated `DC_MERCH_ORDERS_KV` helpers and key prefixes: `merch:orders:*`, `merch:stripe:sessions:*`, `merch:stripe:events:*`, `merch:printful:drafts:*`, and `merch:index:recent:*`.
- `POST /api/merch/cart/checkout` now requires complete recipient details, revalidates the selected shipping option against Printful `/v2/shipping-rates`, persists a durable order intent, creates a Printful synced-product draft order with confirmation deferred, and only then creates Stripe Checkout.
- Printful order draft/confirmation uses the legacy synced-order endpoints (`POST /orders?confirm=false` and `POST /orders/{id}/confirm`) because storefront checkout items are existing Printful sync variants; v2 remains in use for shipping rates and file registration where already practical.
- `POST /api/merch/stripe/webhook` now handles `checkout.session.completed` and `checkout.session.expired`, records Stripe event ids, marks paid sessions idempotently, confirms the Printful draft only after `payment_status=paid`, and persists `printful_confirmation_failed` or `manual_review_required` when fulfillment cannot be confirmed after payment.
- `/shop/success` reads only safe public order status by Stripe session id. `/shop/cancel` attempts to mark the intent canceled when an intent id is present.
- Checkout still fails safely when `DC_MERCH_ORDERS_KV`, `PRINTFUL_STORE_API`, Stripe secret config, or webhook signing config is unavailable. No local filesystem, in-memory-only, fake success, or fake fulfillment path was added.
- PayPal merch checkout remains deferred because the existing PayPal flow is donation-specific, uses `NO_SHIPPING`, and is not a safe product-cart checkout implementation.

### Human-readable

- Storefront pages now visually belong to Personal Studio instead of the professional CV/portfolio site.
- Paid merch checkout can now create durable order state, defer Printful fulfillment until Stripe payment succeeds, and surface manual-review states instead of silently dropping fulfillment failures.

### Cloudflare / Stripe setup required

- DanielClancy Pages project: `DC_MERCH_ORDERS_KV -> danielclancy-merch-orders`.
- DanielClancy Pages project: server-only `PRINTFUL_STORE_API`, `STRIPE_SECRET_KEY`, and `STRIPE_MERCH_WEBHOOK_SECRET` are required before live merch checkout/webhook behavior can complete. The existing donation/payment webhook continues to use `STRIPE_WEBHOOK_SECRET`.
- Stripe Dashboard webhook URL: `https://danielclancy.net/api/merch/stripe/webhook`.
- Stripe webhook events: subscribe to `checkout.session.completed` and `checkout.session.expired`.

### Known limitations

- Local/static development without the KV binding still shows config-needed failure states by design.
- Printful confirmation failures after paid Stripe sessions require manual review; no Admin mutation action was added in this public repo milestone.

### Files / areas changed

- `.env.example`
- `README.md`
- `functions/_shared/merch-orders.js`
- `functions/_shared/printful-products.js`
- `functions/api/merch/cart/[[action]].js`
- `functions/api/merch/stripe/webhook.js`
- `src/app/App.tsx`
- `src/components/PersonalShell.tsx`
- `src/components/ProfessionalShell.tsx`
- `src/lib/merchCart.ts`
- `src/pages/CartPage.tsx`

## Live Merch Cart / Checkout Guardrail Milestone

### Technical

- Added a public merch cart flow with `/cart`, `/shop/success`, and `/shop/cancel` routes. Product detail pages now support variant selection, quantity selection, add-to-cart, and cart navigation.
- Added `src/lib/merchCart.ts` so browser storage contains only non-sensitive cart selections: product id, slug, variant id, and quantity. Prices, titles, variant names, and totals are never trusted from localStorage.
- Added server-side merch cart endpoints: `POST /api/merch/cart/validate`, `POST /api/merch/cart/shipping`, and `POST /api/merch/cart/checkout`.
- Cart validation recalculates product/variant/title/price/currency totals from server-side Printful product data and published Admin storefront overrides, rejecting hidden/unpublished products, unknown products, unknown variants, mixed currencies, and variants without server-side prices.
- Shipping estimates call Printful `/v2/shipping-rates` server-side with validated cart rows and recipient data. US, AU, and CA require state/province codes.
- Stripe merch checkout is fail-closed until durable order-intent storage exists. `POST /api/merch/cart/checkout` requires `DC_MERCH_ORDERS_KV` before creating a Stripe Checkout Session or writing payment metadata.
- Added `POST /api/merch/stripe/webhook` with Stripe signature verification and `checkout.session.completed` handling, but it also requires `DC_MERCH_ORDERS_KV` before updating merch payment state.
- Printful draft order creation and confirmation remain intentionally deferred because this repo did not have existing durable merch order storage. No fulfillment order is created or confirmed before payment success.
- PayPal merch checkout remains deferred because the existing PayPal implementation is donation-specific, uses `NO_SHIPPING`, and is not a safe reusable product-cart checkout flow.
- Replaced the concrete `PRINTFUL_STORE_API` value in `.env.example` with a blank placeholder so server-only Printful secrets are not exposed in example config.

### Human-readable

- Customers can now add live Printful variants to a cart and request server-side validation/shipping estimates.
- The site still refuses to start paid checkout unless durable merch order storage is configured, preventing fake order persistence or lost fulfillment state.

### Cloudflare / Stripe setup required

- DanielClancy Pages project: configure server-only `PRINTFUL_STORE_API`, existing Stripe env vars, and a KV binding named `DC_MERCH_ORDERS_KV` before enabling merch Stripe checkout.
- Stripe Dashboard webhook URL after deployment: `https://danielclancy.net/api/merch/stripe/webhook`; subscribe at minimum to `checkout.session.completed`.
- Printful fulfillment handoff remains a follow-up after durable order intents are verified end to end.

### Files / areas changed

- `.env.example`
- `README.md`
- `functions/_shared/printful-products.js`
- `functions/api/merch/cart/[[action]].js`
- `functions/api/merch/stripe/webhook.js`
- `src/app/App.tsx`
- `src/lib/merchCart.ts`
- `src/pages/CartPage.tsx`
- `src/pages/ProductDetailPage.tsx`
- `src/pages/ShopPage.tsx`
- `src/styles/global.css`

## Printful Merch Storefront Foundation Milestone

### Technical

- Added `/shop` as the canonical merch storefront route, `/store` and `/merch` Cloudflare/client redirects to `/shop`, and `/products/:category/:slug` product detail routing.
- Added server-side Cloudflare Pages merch API endpoints under `/api/merch/products` so `PRINTFUL_STORE_API` stays server-only and is never bundled into client code.
- Added a shared Printful normalization helper that resolves the `Daniel Clancy` store with Printful v2 stores where possible, then uses legacy Printful sync product endpoints for product list/detail data because sync product management is not available in Printful v2 yet.
- Added a merch frontend data layer and polished public shop/detail pages that merge sanitized Printful product data with published Admin storefront overrides when `DANIELCLANCY_ADMIN_PUBLIC_SITE_DATA_URL` or `VITE_ADMIN_PUBLIC_SITE_DATA_URL` is configured.
- Kept checkout intentionally disabled for merch products; product pages show a checkout-pending CTA because no Printful order/payment flow is wired in this repo.

### Human-readable

- DanielClancy.net now has a real merch storefront foundation ready to display Printful products once the server token and store data are available.
- The storefront stays honest when Printful is missing or empty and does not invent product names, pricing, inventory, images, variants, or checkout capability.

### Setup / config required

- Configure `PRINTFUL_STORE_API` only in the Cloudflare Pages Functions environment.
- Configure the Admin public site-data URL if published storefront overrides should affect `/shop`.
- Live paid checkout and Printful fulfillment order creation remain future work.

### Files / areas changed

- `functions/_shared/printful-products.js`
- `functions/api/merch/products/[[lookup]].js`
- `public/_redirects`
- `src/app/App.tsx`
- `src/components/ProfessionalShell.tsx`
- `src/lib/merch.ts`
- `src/pages/ShopPage.tsx`
- `src/pages/ProductDetailPage.tsx`
- `src/styles/global.css`
- `README.md`
- `BUMP_NOTES.md`

## Watch Page Immersive Shell Correction Milestone

### Technical

- Replaced the previous `/watch` constrained cinematic hero/card treatment with a route-owned immersive watch shell: compact custom top chrome, full-bleed hero media stage, thumbnail-derived blurred side/backdrop falloff, lower-left overlay copy/meta, lower-right playback/source controls, and a dark selector strip directly below the hero.
- Scoped the normal personal shell suppression to `/watch` only so the standard Home / Watch / Donate header and personal footer no longer render on the immersive watch route, while `/home` and `/donate` keep the existing personal shell.
- Kept `functions/api/watch-feed.js`, `src/lib/watchFeed.ts`, the fetched item contract, and all video item data untouched. No video titles, descriptions, thumbnails, dates, URLs, platform metadata, or catalogue rows were invented.
- Preserved the lower fetched catalogue section and source links, with the selector now promoting fetched items into the active hero state through accessible buttons and carousel arrows.
- Added watch-specific platform/profile chrome using existing local brand/social assets and existing known platform links.

### Human-readable

- `/watch` now reads as an immersive streaming/watch surface instead of a standard DanielClancy.net content page with a large centered card.
- The active video/poster fills the first viewport under a compact translucent header, with the metadata, title, source CTA, mute, and autoplay controls overlaid on the stage.
- The thumbnail rail sits immediately below the hero as secondary "More content" navigation, and the full fetched catalogue remains available farther down the page.

### Files / areas changed

- `src/components/PersonalShell.tsx`
- `src/content/brandAssets.ts`
- `src/pages/WatchPage.tsx`
- `src/styles/global.css`
- `BUMP_NOTES.md`

### Validation

- Passed `npm run check`.
- Passed `npm run build`; Vite reported the existing large-chunk warning.
- Passed `git diff --check`; Git only reported line-ending normalization warnings for edited files.
- Passed local `/watch` visual smoke at desktop/wide, laptop-ish, and mobile viewports through Playwright MCP against the Vite dev server, with `/api/watch-feed` fulfilled from the existing public sanitized feed response because Vite does not run Cloudflare Pages Functions.
- Browser smoke confirmed no horizontal overflow, the watch-specific chrome replaced the normal personal nav, selector clicks changed the active hero state, the source CTA resolved, autoplay/mute controls updated iframe state, and the lower fetched catalogue remained present.
- `npm run lint` and `npm run typecheck` are not present in `package.json`; `npm run check` is the repo's TypeScript check script.

### Risks / follow-ups

- Local Vite-only smoke can verify layout and interaction state, but real hosted feed hydration and YouTube iframe playback still depend on the Cloudflare Pages Function and configured YouTube env.
- The overlay autoplay/mute controls continue to rebuild the iframe URL rather than using a YouTube Player API bridge.

## Cinematic Watch Page Redesign Milestone

### Technical

- Rebuilt `/watch` around an active fetched-video state so the first item from the existing watch feed is the default hero item and selector thumbnails can promote any fetched catalogue item into the hero.
- Added client-side platform/embed helpers for platform detection, YouTube embed URL construction, source CTA labels, deduped feed item resolution, and thumbnail-backed cinematic backdrop styling.
- Added muted autoplay defaults plus overlay autoplay and mute buttons. The controls rebuild the YouTube iframe URL with `autoplay`, `mute`, `playsinline`, `rel`, and `modestbranding` params instead of adding a heavier player API bridge.
- Added fallback handling for non-embeddable or unavailable platforms: thumbnail-backed hero panel where available, source-platform CTA, safe external link attributes, and defensive catalogue thumbnail placeholders.
- Replaced the old split `/watch` hero presentation with a cinematic embedded-player stage, dark falloff overlays, blurred thumbnail-derived ambient backdrop, active thumbnail selector rail, accessible selector buttons, and a secondary full fetched-catalogue card grid.
- Kept `functions/api/watch-feed.js` and the existing feed source unchanged. No video titles, descriptions, thumbnails, dates, platform URLs, tags, or catalogue entries were invented.
- Widened the TypeScript watch-feed provider type enough for future non-YouTube provider fallback handling while preserving the current YouTube response contract.

### Human-readable

- `/watch` now opens as a premium dark video-watch surface with the latest fetched release as the hero, cinematic backdrop treatment, source CTA, visible autoplay/mute controls, and a thumbnail rail directly beneath the hero.
- The full fetched catalogue remains available lower on the page, while the hero selector provides a cleaner way to preview fetched videos without losing source links.
- If the local or hosted feed is unavailable, the page stays honest and presentable instead of pretending live video data exists.

### Files / areas changed

- `src/pages/WatchPage.tsx`
- `src/lib/watchFeed.ts`
- `src/styles/global.css`
- `BUMP_NOTES.md`

### Validation

- Passed `npm run check`.
- Passed `npm run build`; Vite reported the existing large-chunk warning.
- Ran a local Vite `/watch` smoke check at `http://127.0.0.1:5182/watch` with Playwright MCP at desktop and mobile widths. The route rendered, the cinematic fallback hero and full-catalogue empty state were visible, controls had accessible labels, and no horizontal overflow was detected.
- The local Vite smoke did not prove live feed hydration or live YouTube iframe playback because Vite does not run Cloudflare Pages Functions and upstream watch-feed fetching was intentionally not exercised for this task.

### Risks / follow-ups

- Hosted Cloudflare Pages should be checked after deploy with the real `/api/watch-feed` function and configured YouTube env to confirm hydrated selector thumbnails, iframe playback, and thumbnail-derived backdrop imagery with live data.
- The overlay autoplay/mute controls intentionally rebuild the iframe URL rather than controlling an already-mounted player instance; a future iframe API bridge would be a separate enhancement if smoother in-place control is needed.

## v1.0 Release Milestone

### Technical

- Promoted the public DanielClancy package metadata from `0.1.2-beta` to `1.0.0`.
- Added GitHub-release-ready `RELEASE_NOTES_v1.0.md` built from the current README, BUMP notes, package metadata, source files, and test coverage.
- Added a focused version consistency test covering package metadata, BUMP heading, the release-notes file, and public footer/source absence of visible alpha/beta/pre-release version labels.
- Kept the existing public site-data hydration model: `VITE_ADMIN_PUBLIC_SITE_DATA_URL` points at the sanitized DanielClancy-Admin public endpoint, while committed fallback data keeps routes renderable when the endpoint is unavailable.
- Kept the Cloudflare Pages deployment posture, contact/page-visit Pages Functions, payment/watch endpoints, public auth-origin handoff, and legal routes unchanged for this release documentation pass.
- No CV, employment, company, software/platform, project, or portfolio facts were changed.

### Human-readable

- DanielClancy.net is now tracked as the `v1.0` public website release.
- The release keeps the public site as a read-only Cloudflare Pages surface that renders portfolio, CV, contact, legal, support, and watch routes from source-backed public data.
- Public edits still flow from DanielClancy-Admin Save/Sync plus Publish site data, then public hydration through the configured endpoint.

### Files / areas changed

- `package.json`
- `package-lock.json`
- `README.md`
- `BUMP_NOTES.md`
- `RELEASE_NOTES_v1.0.md`
- `tests/version-consistency.test.mjs`

### Validation

- Run `node --test tests/version-consistency.test.mjs`.
- Run existing public data tests and the repo `check`, `build`, and `git diff --check` release validation commands.

### Risks / follow-ups

- Hosted Cloudflare Pages still needs `VITE_ADMIN_PUBLIC_SITE_DATA_URL=https://admin.danielclancy.net/api/public/site-data` configured for live Admin-published hydration.
- Legal pages remain informational website policy pages and should receive legal review before relying on them as final legal documents.

## Public Privacy And Terms Pages Milestone

### Technical

- Added `/privacy` and `/terms` as professional-shell React routes in the existing Vite/React router.
- Added `src/components/LegalPageLayout.tsx` for shared legal-page hero metadata, last-updated display, top jump-to anchor menu, stable section IDs, per-section hash links, and accessible long-form section rendering.
- Added `src/pages/PrivacyPage.tsx` with complete Privacy Policy content covering contact form fields, OAuth/login data, admin/session/security metadata, page visits, approximate Cloudflare request location metadata, Turnstile, local/session storage, /watch media metadata, YouTube API Services, Google/GitHub/X OAuth, Twitch/Kick platform references, Cloudflare infrastructure, analytics/security logs, retention, revocation, and third-party links.
- Added `src/pages/TermsPage.tsx` with complete Terms of Use content covering acceptance, site purpose, accounts/admin restrictions, OAuth and third-party services, /watch media/platform content, YouTube API Services terms, Twitch/Kick/X/GitHub/Google provider terms, acceptable use, IP, portfolio/CV content, submitted content, analytics/security, Cloudflare/Turnstile, disclaimers, liability, indemnity, termination, changes, and New South Wales governing law.
- Added provider/API references for YouTube Terms, Google Privacy Policy, Google API Services User Data Policy, YouTube API Services Terms, YouTube API Services Developer Policies, Google security permissions/revocation, GitHub Terms/Privacy, X Developer Agreement/Policy/Privacy/Terms, Twitch docs/Terms/Privacy, Kick Developer Terms/Terms, and Cloudflare Privacy/Turnstile/Website Terms.
- Added scoped `.legal-*` styles to `src/styles/global.css` so the pages use the existing dark professional visual system, responsive cards, keyboard-visible focus states, and mobile-friendly anchor links.
- Added footer legal links in both public shells and Privacy/Terms links in the account modal without changing OAuth, auth, Turnstile, admin, analytics, contact, or watch behavior.
- Preserved the existing Cloudflare Pages SPA fallback in `public/_redirects`; no redirect changes were required for direct `/privacy` or `/terms` loads.
- Updated `README.md` route architecture, legal-page notes, key implementation files, and repository tree for the new component/page files.
- No legal entity registration number, office address, new phone number, lawyer, regulator contact, or unverified formal company detail was invented.
- DanielClancy-Admin was inspected read-only for auth/OAuth context only. DanielClancy-Admin, StreamSuites, and StreamSuites-Dashboard were not mutated.

### Human-readable

- DanielClancy.net now has professional public Privacy Policy and Terms of Use pages with visible provider, OAuth, YouTube API, streaming platform, analytics, Cloudflare, Turnstile, security, storage, and contact coverage.
- Both pages provide jump menus and stable deep links for each major section, making the long policy content easier to scan and link to.
- The pages are informational website policy pages and should receive legal review before relying on them as final legal documents.

### Files / areas changed

- `src/app/App.tsx`
- `src/components/LegalPageLayout.tsx`
- `src/components/ProfessionalShell.tsx`
- `src/components/PersonalShell.tsx`
- `src/components/PersonalHeaderAccount.tsx`
- `src/pages/PrivacyPage.tsx`
- `src/pages/TermsPage.tsx`
- `src/styles/global.css`
- `README.md`
- `BUMP_NOTES.md`

### Validation

- Passed `npm run check`.
- Passed `npm run build`; Vite reported the existing large-chunk warning.
- Passed static source inspection for `/privacy` and `/terms` routes, Cloudflare SPA fallback, required section IDs, unique section IDs, anchor-menu/hash-link rendering, footer/account legal links, YouTube/Google/API/OAuth/provider links, Twitch/Kick streaming provider links, Cloudflare/Turnstile links, watch/API language, analytics/security/storage language, absence of the banned word `delve`, and absence of invented ABN/ACN/registered-office/phone marker details in the new page files.
- Passed local Vite direct-route smoke checks returning HTTP 200 for `/privacy`, `/terms`, `/privacy#youtube-api-services`, and `/terms#youtube-api-services-terms`.
- Passed `git diff --check`; Git only reported line-ending normalization warnings for edited files.

### Risks / follow-ups

- Legal review is still required before treating the content as final legal advice or a finalized legal document.
- Hosted Cloudflare Pages should be checked after deployment for direct `/privacy`, `/terms`, and deep-hash links.

## TypeScript Resolver Deprecation Repair Milestone

### Technical

- Replaced deprecated `moduleResolution: "Node"` with `moduleResolution: "Bundler"` in the app TypeScript config and the referenced Vite TypeScript config.
- Removed the temporary `ignoreDeprecations` waiver because the deprecated resolver setting is no longer present.

### Human-readable

- TypeScript config validation no longer depends on the deprecated Node 10 resolver.

### Files / areas changed

- `tsconfig.json`
- `tsconfig.node.json`
- `BUMP_NOTES.md`

### Validation

- Passed `npm run check`.

### Risks / follow-ups

- `Bundler` module resolution is the Vite-aligned resolver mode for this app; any future non-bundled Node-specific tooling should be checked separately if added.

## Emergency Page-Visit Analytics Forwarding Repair Milestone

### Technical

- Updated `PageVisitBeacon` to include a per-page-load `eventId` and `recordedAt` without exposing any server secret.
- Updated `POST /api/track/page-visit` so the server-side forward to DanielClancy-Admin includes `source: "page_visit_kv"`, `live: true`, `eventId`, `dedupeKey`, `recordedAt`, page/referrer/client fields, and sanitized Cloudflare `request.cf` city/region/country fields.
- Kept `DANIELCLANCY_ANALYTICS_INGEST_SECRET` server-side only in the Pages Function header `X-DanielClancy-Analytics-Secret`.
- Added a focused public forwarder test proving the Admin ingest payload receives geo/source/live metadata and the browser-facing response does not expose the secret.
- Kept StreamSuites alert sending event-only and non-blocking; StreamSuites alert rules were not mutated.

### Human-readable

- Real public visitor geographies can now reach DanielClancy-Admin analytics KV instead of only appearing in StreamSuites alerts.
- Analytics forwarding failures remain server-side diagnostics and do not block page rendering.

### Files / areas changed

- `functions/api/track/page-visit.js`
- `src/components/PageVisitBeacon.tsx`
- `tests/page-visit-forwarder.test.mjs`
- `README.md`
- `BUMP_NOTES.md`

### Validation

- Passed `node --check functions/api/track/page-visit.js`.
- Passed `node --test tests/page-visit-forwarder.test.mjs`.
- Passed `npm run check`.
- Passed `npm run build`; Vite reported the existing large-chunk warning.
- Passed `git diff --check`; Git only reported line-ending normalization warnings for edited files.
- Browser validation through the Admin surface confirmed source-tagged public page-visit style rows render as live analytics rows when ingested.

### Risks / follow-ups

- Hosted Cloudflare Pages must have `DANIELCLANCY_ADMIN_ANALYTICS_INGEST_URL` and matching `DANIELCLANCY_ANALYTICS_INGEST_SECRET` configured.

## Direct Route Hydration Repair Milestone

### Technical

- Kept `PublicSiteDataProvider` fallback-first by initializing from `publicSiteFallback` synchronously, exposing `source`, `revision`, `publishedAt`, `usingFallback`, `loading`, and safe error metadata without blocking route rendering.
- Hardened Admin live hydration so missing env, fetch failure, invalid responses, and missing collections preserve committed fallback Projects, Companies, Platforms, and Positions instead of emptying the public site.
- Added normalized project route lookup for slug, ID, legacy code, title-derived aliases, and existing URL/path tail aliases so `/portfolio/<project-slug>` resolves from fallback before live fetch completion and remains stable after live fetch failure.
- Replaced immediate project-detail redirect with a safe pending/not-found state so normal hydration no longer flashes or redirects away from fallback projects.
- Added `/work` as a portfolio archive alias and preserved the existing Cloudflare Pages SPA fallback in `public/_redirects` (`/* /index.html 200`) for direct browser loads and refreshes.
- Hardened public asset path normalization for root-relative `/media/portfolio/...` and `/docs/...` paths while preserving valid absolute URLs.
- Expanded `tests/public-site-data-client.test.mjs` coverage around fallback-first initialization, missing/failed/invalid Admin data, merge semantics, route alias lookup, asset path safety, CV fallback records, and no admin-only field exposure.
- DanielClancy-Admin site-data endpoint was read-only for this task; no public endpoint contract bug required Admin mutation.
- No CV/project/company/software facts were invented.
- Alerts editor remains removed/disabled in Admin.
- StreamSuites and StreamSuites-Dashboard were not mutated.

### Human-readable

- Direct browser loads, refreshes, bookmarks, and shared links for public routes now render from committed fallback data first, then refresh with Admin-published data when configured.
- Project detail pages no longer depend on prior Home navigation and no longer treat normal hydration as a missing project.

### Files / areas changed

- `src/app/App.tsx`
- `src/lib/portfolio.ts`
- `src/lib/publicSiteData.tsx`
- `src/pages/PortfolioDetailPage.tsx`
- `tests/public-site-data-client.test.mjs`
- `README.md`
- `BUMP_NOTES.md`

### Validation

- Passed `node --test tests/public-site-data-client.test.mjs`.
- Passed `npm run check`.
- Passed `npm run build`; Vite reported the existing large-chunk warning.
- Passed production preview direct-route browser validation on `http://127.0.0.1:4174` for `/`, `/portfolio`, `/portfolio/proposed-retail-development-for-dawesville-iga`, `/portfolio/cue-roadhouse`, `/portfolio/redevelopment-of-highway-service-center-pheasants-nest-m31-north-and-south`, `/cv`, `/work`, and `/contact`.
- Passed portfolio-to-detail click smoke from `/portfolio` to `/portfolio/redevelopment-of-highway-service-center-pheasants-nest-m31-north-and-south`.
- Passed `git diff --check`; Git only reported line-ending normalization warnings for edited files.

### Risks / follow-ups

- Hosted Cloudflare Pages should still be verified after deploy for live CORS and the configured `VITE_ADMIN_PUBLIC_SITE_DATA_URL`.
- Admin-published rows with unsupported relative media/doc paths will continue using committed fallback assets until the public endpoint emits clean `/media/portfolio/...`, `/docs/...`, or absolute URLs.

## Public Site-Data Revision Diagnostics / Fallback Rebuild Milestone

### Technical

- Updated `src/lib/publicSiteData.tsx` to fetch `VITE_ADMIN_PUBLIC_SITE_DATA_URL` with `cache: "no-store"` and preserve `source`, `revision`, `publishedAt`, `generatedAt`, `usingFallback`, and safe error metadata.
- Added development-only diagnostics for missing env, successful live load, and fetch fallback.
- Added generated committed fallback data at `src/data/public-site-fallback.generated.json`; `src/data/public-site-fallback.ts` prefers it when populated and otherwise keeps the existing source-derived fallback.
- Added `tools/rebuild-public-fallback.mjs` plus `npm run data:rebuild`, `npm run data:check`, and `npm run build:with-data`.
- Added `tests/public-site-data-client.test.mjs` for client wiring, revision metadata, normalization hooks, generated fallback counts, and no admin-only field leaks.
- Added `VITE_ADMIN_PUBLIC_SITE_DATA_URL=https://admin.danielclancy.net/api/public/site-data` to `.env.example`.
- No admin-only overlay/account/session/secret data is exposed.
- No CV/employment/company/software/project facts were invented.

### Human-readable

- DanielClancy.net can now tell internally whether it loaded a live/published Admin payload or committed fallback data.
- The public fallback snapshot can be rebuilt locally after Admin manifests change, without requiring live Admin KV.

### Validation

- Targeted validation should include `npm run data:rebuild`, `node --test tests/public-site-data-client.test.mjs`, `npm run check`, `npm run build`, and `git diff --check`.

### Risks / follow-ups

- Public Cloudflare Pages must have `VITE_ADMIN_PUBLIC_SITE_DATA_URL` set and redeployed once for runtime live hydration to be available.
- Public refresh is enough after Admin publishes new data; public redeploy is only needed for env/fallback/code/assets changes.

## Public Site-Data Hydration Milestone

### Technical

- Added a committed public site-data fallback model derived from the existing public portfolio/CV source data.
- Added `PublicSiteDataProvider` and normalization helpers that fetch `VITE_ADMIN_PUBLIC_SITE_DATA_URL` when configured, validate `danielclancy-public-site-data.v1`, and fall back to static committed data when the env var is missing, fetch fails, response shape is invalid, or collections are incomplete.
- Updated portfolio listing, project detail, gallery/lightbox, home spotlight, and CV chronology rendering to read normalized Projects, Companies, Platforms, and Positions.
- Portfolio cards now resolve `thumbnailPath` first, then hero/gallery/static image fallback.
- Project detail/gallery now uses `heroImage` or the first ordered `galleryPaths` image, preserves ordered gallery rendering, and prefers local `/docs/...` document links where present before older OneDrive fallback URLs.
- Company/studio display on project cards/details is text-only; platform/software chips render full-color SVG logo images with tooltip/title labels.
- CV positions resolve through hydrated Positions/Companies/Platforms while preserving existing static fallback facts.
- The public site fetches only the sanitized public endpoint and does not call admin CMS endpoints or expose admin errors to visitors.
- No CV/employment/company/software/project facts were invented.
- Alerts editor remains removed/disabled in Admin; OAuth auto-promotion and manual env-backed admin access are unchanged.
- StreamSuites and StreamSuites-Dashboard were not mutated.

### Human-readable

- DanielClancy.net can now hydrate project, company, software/platform, and CV position data from Admin public site-data when available.
- The website still works fully from committed fallback data if Admin is down or the endpoint is not configured.

### Files / areas changed

- `src/app/App.tsx`
- `src/components/PortfolioMediaGallery.tsx`
- `src/data/public-site-fallback.ts`
- `src/lib/portfolio.ts`
- `src/lib/publicSiteData.tsx`
- `src/pages/CvPage.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/PortfolioDetailPage.tsx`
- `src/pages/PortfolioPage.tsx`
- `README.md`
- `BUMP_NOTES.md`

### Validation

- Run `npm run check`, `npm run build`, and `git diff --check`.

### Risks / follow-ups

- Hosted Cloudflare Pages verification should confirm live CORS and `VITE_ADMIN_PUBLIC_SITE_DATA_URL=https://admin.danielclancy.net/api/public/site-data`.
- Admin project rows that still contain filename-only gallery/document references continue to fall back to the committed static project media until clean `/media/portfolio/...` or `/docs/...` paths are configured.

## Emergency Auth Turnstile Removal And Alert Geo Context Milestone

### Technical

- Removed Turnstile from the public login/signup modal and OAuth start buttons; manual email/password auth requests no longer include or require a Turnstile token.
- Kept the public contact form Turnstile isolated in `src/pages/ContactPage.tsx` and `functions/api/contact.js`; auth no longer imports the React Turnstile component.
- Expanded the public alert sender to forward sanitized Cloudflare request metadata, including host/origin, page/referrer fields, request method, client IP, user agent, browser/device/platform, timezone, colo, `geo.*`, and country flag.
- Public contact and page_visit alert events remain event-only and continue stripping rule/configuration/manifest fields before posting to StreamSuites.

### Human-readable

- Public login/signup/OAuth no longer gets blocked by a fragile Turnstile token lifecycle.
- Contact remains protected by Turnstile, and alert templates can now receive real Cloudflare location/client context.

### Files / areas changed

- `functions/_shared/alert-sender.js`
- `functions/api/contact.js`
- `functions/api/track/page-visit.js`
- `src/components/PersonalHeaderAccount.tsx`
- `README.md`
- `BUMP_NOTES.md`

### Validation

- Run `node --check functions/_shared/alert-sender.js functions/api/contact.js functions/api/track/page-visit.js`, `npm run check`, `npm run build`, and `git diff --check`.

## Public Page-Visit Analytics Forwarding Milestone

### Technical

- Updated `POST /api/track/page-visit` so public DanielClancy page visits still beacon locally but now forward sanitized page-visit metadata server-side to DanielClancy-Admin analytics ingest when configured.
- Added server-only env vars `DANIELCLANCY_ADMIN_ANALYTICS_INGEST_URL` and `DANIELCLANCY_ANALYTICS_INGEST_SECRET`; the ingest secret is sent only by the Pages Function using `X-DanielClancy-Analytics-Secret`.
- Added page URL, timezone, browser, device, and platform metadata to the public `PageVisitBeacon` payload without exposing any secret to frontend JavaScript.
- Kept alert event sending intact and non-blocking; analytics forwarding failures are logged server-side and do not block page rendering.
- StreamSuites and StreamSuites-Dashboard were not mutated.
- No MCP browser tests or Playwright MCP checks were run.

### Human-readable

- Public `danielclancy.net` traffic can now feed DanielClancy-Admin page-visit analytics when both repos share the generated analytics ingest secret.
- The public browser never receives the admin analytics ingest secret.

### Files / areas changed

- `.env.example`
- `functions/api/track/page-visit.js`
- `src/components/PageVisitBeacon.tsx`
- `README.md`
- `BUMP_NOTES.md`

### Validation

- Run `node --check functions/api/track/page-visit.js`, `npm run check`, `npm run build`, and `git diff --check`.

### Follow-ups

- Hosted Cloudflare Pages verification is still required to confirm forwarding reaches `https://admin.danielclancy.net/api/analytics/ingest/page-visit` with the configured shared secret.

## Emergency Alert Event-Only Sender Guard

### Technical

- Hardened `functions/_shared/alert-sender.js` so public contact/page_visit alert payload/context objects recursively strip rule-definition, configuration, preferences, manifest, seed/reset/import, and `apply_configuration` fields before posting to StreamSuites ingest.
- Public DanielClancy alert delivery remains event-only and does not send StreamSuites alert rule definitions.

### Human-readable

- DanielClancy.net may send alert events only.
- StreamSuites alert rule definitions remain canonical in StreamSuites and StreamSuites-Dashboard.

## Emergency Turnstile Reliability And Alert Sender Wiring

### Technical

- Stabilized the shared React Turnstile lifecycle so widgets render once per visible form/modal lifecycle and reset only through explicit per-widget retry/submit consumption.
- Stored Turnstile token issue time in the public login modal and contact form, kept token state stable after success, and kept manual email/password collapsed by default.
- Preserved public OAuth start protection by requiring the current Turnstile token before redirecting to the admin auth origin; OAuth callbacks remain owned by DanielClancy-Admin and are not Turnstile-gated here.
- Added `functions/_shared/alert-sender.js` for Cloudflare Pages-compatible posting to StreamSuites `POST /api/alerts/danielclancy` with server-only `DANIELCLANCY_ALERT_INGEST_URL` and `DANIELCLANCY_ALERT_INGEST_SECRET`.
- Wired successful contact form delivery to post `contact_form` alerts with safe summary metadata only.
- Added `/api/track/page-visit` plus `PageVisitBeacon` to send route-deduped `page_visit` events without blocking rendering.
- Updated `.env.example` and README documentation for alert ingest URL/secret generation and non-blocking alert delivery.
- StreamSuites and StreamSuites-Dashboard were not mutated.

### Human-readable

- Completing Turnstile once should no longer uncheck itself during normal login/OAuth/contact use.
- Contact and page visit alerts now post to StreamSuites when the sender env vars are configured.
- Alert delivery failures stay server-side and do not block contact submission or page rendering.

### Files / areas changed

- `.env.example`
- `README.md`
- `functions/_shared/alert-sender.js`
- `functions/api/contact.js`
- `functions/api/track/page-visit.js`
- `src/app/App.tsx`
- `src/components/PageVisitBeacon.tsx`
- `src/components/PersonalHeaderAccount.tsx`
- `src/lib/turnstile.tsx`
- `src/pages/ContactPage.tsx`
- `BUMP_NOTES.md`

### Validation

- Run `node --check` on changed Pages Function/helper JS, `npm run check`, `npm run build`, and `git diff --check`.

### Follow-ups

- Hosted Cloudflare Pages testing should confirm the configured alert ingest URL reaches the intended StreamSuites runtime/API host.
- Live OAuth provider testing still depends on DanielClancy-Admin provider/env configuration.

## Turnstile login and contact protection milestone

### Technical

- Added a Cloudflare Pages-compatible Turnstile Siteverify helper at `functions/_shared/turnstile.js`.
- Added `/api/turnstile/config` so the public site can fetch `DC_TURNSTILE_SITE_KEY` without exposing `DC_TURNSTILE_SECRET_KEY`.
- Added the shared React Turnstile renderer in `src/lib/turnstile.tsx`, loading the Cloudflare script only when the login modal or contact form needs it.
- Added Turnstile to the public login/signup modal while preserving `assets/logos/logo.webp`, OAuth provider icons, the sign in/create account toggle, Escape/close behavior, and collapsed email/password by default.
- Public manual login/signup now includes a Turnstile token in the admin-auth request body.
- Public OAuth start buttons now require a Turnstile token and append it to the admin OAuth start request for server-side verification.
- Added Turnstile to the `/contact` form before submit, disabled submit until a token exists, and sent the token to `/api/contact`.
- Updated `functions/api/contact.js` so honeypot behavior remains quiet but real submissions must pass server-side Turnstile verification before validation and Resend delivery.
- Added `DC_TURNSTILE_SITE_KEY`, `DC_TURNSTILE_SECRET_KEY`, and `DC_TURNSTILE_DEV_BYPASS=false` to `.env.example`.
- Turnstile secret remains server-only.
- StreamSuites and StreamSuites-Dashboard were not mutated.
- Alert delivery bridge remains the next separate task.

### Human-readable

- Login/signup and contact submissions now require a real server-verified anti-abuse challenge instead of a decorative browser-only widget.
- Local static/Vite views can show Turnstile unavailable until Pages Functions and env bindings are available.
- Existing manual env-backed admin auth is preserved through the admin auth origin, and OAuth users are still not auto-promoted to admin.

### Files / areas changed

- `.env.example`
- `functions/_shared/turnstile.js`
- `functions/api/contact.js`
- `functions/api/turnstile/config.js`
- `src/components/PersonalHeaderAccount.tsx`
- `src/lib/turnstile.tsx`
- `src/pages/ContactPage.tsx`
- `src/styles/global.css`
- `README.md`
- `BUMP_NOTES.md`

### Testing / validation notes

- Run `npm run check`, `npm run build`, syntax checks for changed Pages Functions, and `git diff --check`.
- Smoke test login modal open/close/Escape, logo rendering, sign in/create account toggle, OAuth button presence/start gating, collapsed email expansion, Turnstile container rendering, contact form Turnstile rendering, and mobile sanity.

### Risks / follow-ups

- Live Turnstile verification requires the Cloudflare Pages deployment to have matching `DC_TURNSTILE_SITE_KEY` and `DC_TURNSTILE_SECRET_KEY` values.
- Public OAuth start protection depends on the DanielClancy-Admin auth deployment accepting and verifying the `turnstileToken` query parameter.

## Contact Resend delivery hardening milestone

### Technical

- Re-tested `/api/contact` through local Cloudflare Pages dev before changing code; the local process could see `RESEND_API_KEY`, `MAIL_FROM`, and `MAIL_REPLY_TO`, and the pre-change POST returned success locally.
- The previous pass still left a deployment-risk failure path: contact delivery used raw env strings without code-level quote stripping or sender-shape validation, ignored the frontend `sourcePath` field requested for submission evidence, and returned generic failure JSON without safe diagnostic codes.
- Hardened `functions/api/contact.js` with env normalization that trims whitespace and strips one accidental pair of wrapping single or double quotes before Resend validation.
- Added Resend-compatible sender validation, destination validation, safe JSON response codes (`INVALID_INPUT`, `CONFIG_MISSING`, `RESEND_REJECTED`, `SEND_FAILED`, `SENT`), and kept provider/config details server-side only.
- Aligned the contact form payload with the endpoint by sending `sourcePath` from `src/pages/ContactPage.tsx`.
- Kept delivery through the real Cloudflare Pages Function path and Resend `fetch` API; no mock success path was introduced.

### Human-readable

- The contact form now handles quoted email env values safely and keeps Daniel's inbox fallback working through `MAIL_REPLY_TO`.
- Valid submissions continue to show the professional success message instead of surfacing provider internals.

### Files / areas changed

- `functions/api/contact.js`
- `src/pages/ContactPage.tsx`
- `README.md`
- `BUMP_NOTES.md`

### Testing / validation notes

- Pre-change Pages-dev endpoint POST returned success locally through `http://127.0.0.1:8791/api/contact`; no local pre-change failure response was reproducible in this checkout.
- Run `npm run check`, `npm run build`, and a post-change local Cloudflare Pages dev POST to `/api/contact` using the BSMG Resend integration payload.
- Browser-smoke-test `/contact` against the real local endpoint after the post-change endpoint test succeeds.
- Record whether a real Resend email was sent by the post-change endpoint run.

### Risks / follow-ups

- Production success still depends on the deployed Cloudflare Pages project having a valid `RESEND_API_KEY`, normalized or normalizable `MAIL_FROM`, and a verified Resend sending domain.

## Login/signup modal logo and copy polish milestone

### Technical

- Added `assets/logos/logo.webp` to the shared brand asset map and used it as the top mark in the personal-shell login/signup modal.
- Adjusted the modal brand mark sizing so the webp logo renders cleanly and responsively.
- Removed surfaced internal setup text from the login/signup modal, including env/provider setup notes and server implementation details.
- Kept OAuth buttons, sign in/create account toggle, Escape/close behavior, and the manual email/password section collapsed by default.
- Preserved public-site behavior: OAuth users are still not auto-promoted to admin, and admin authority remains server-side.

### Human-readable

- The public login/signup modal now uses the requested DanielClancy logo and presents concise user-facing copy.
- Internal setup details remain documentation material rather than modal UI text.

### Files / areas changed

- `src/content/brandAssets.ts`
- `src/components/PersonalHeaderAccount.tsx`
- `src/styles/global.css`
- `README.md`
- `BUMP_NOTES.md`

### Testing / validation notes

- Run `npm run check`, `npm run build`, and `git diff --check`.
- Smoke test login modal open/close/Escape, logo rendering, sign in/create account toggle, OAuth links, collapsed email expansion, removed setup text, and mobile sanity.

### Risks / follow-ups

- Live auth/session verification still depends on the DanielClancy-Admin Pages Functions deployment and configured provider/env setup.
- OAuth users are still not automatically admins.

## Auth UX polish and signup scaffold milestone

### Technical

- Upgraded the personal-shell login lightbox into a sign in/create account modal with a DC brand mark, OAuth-first provider actions, and a collapsed manual email/password section.
- Reused local GitHub, Google, and Twitter/X icon assets through the existing brand asset map.
- Added safe email signup handling that calls the admin auth origin but only reports the durable account-store limitation; no password is stored client-side and no client-side account authority is introduced.
- Kept public session rendering tied to `/api/auth/session`, preserving regular/non-admin vs admin session display without granting admin access from OAuth.
- OAuth live env setup has been completed externally enough for provider flows to redirect, but OAuth users remain regular/non-admin unless explicitly allowlisted or promoted later.

### Human-readable

- The account modal now feels like a finished DanielClancy.net login/signup control rather than a basic scaffold.
- Manual env-backed admin login remains the production admin path.
- OAuth is the preferred public signup/signin route for now.
- Email signup clearly explains that durable account storage is still coming soon.
- The admin dashboard link remains visible and points to `https://admin.danielclancy.net`.

### Files / areas changed

- `src/content/brandAssets.ts`
- `src/components/PersonalHeaderAccount.tsx`
- `src/styles/global.css`
- `README.md`
- `BUMP_NOTES.md`

### Testing / validation notes

- Run `npm run check`, `npm run build`, and `git diff --check`.
- Smoke test login modal open/close/Escape, sign in/create account toggle, OAuth button hrefs, collapsed email expansion, safe email signup messaging, signed-in status display, and mobile viewport sanity.

### Risks / follow-ups

- Durable account store remains future work.
- OAuth users are not automatically admins unless explicit allowlist or future durable role promotion work is implemented.
- Next planned phase is making scaffolded admin pages operational/hydrated.

## Auth/login foundation milestone

### Technical

- Wired the personal-shell account widget to open a real login lightbox modal with GitHub, Google, Twitter/X, and email/password options.
- Pointed public login/session actions at the DanielClancy-Admin auth origin via `VITE_DC_AUTH_ORIGIN`, expected `https://admin.danielclancy.net`.
- Kept password verification out of the Vite bundle; manual email/password checks are documented as server-side Pages Function work owned by DanielClancy-Admin.
- Added session status and logout UI handling for the modal without treating public-site state as admin authority.

### Human-readable

- The public login icon now opens a proper sign-in modal instead of a cosmetic account preview.
- Admin access remains restricted; public session-aware content remains future work.
- OAuth buttons are present, but OAuth requires Cloudflare env vars and provider redirect URI setup before live testing.
- Alerts page remains future work.
- Cloudflare Pages/DNS setup checkpoint is now approaching and should be completed before real OAuth production testing.

### Files / areas changed

- `.env.example`
- `README.md`
- `src/components/PersonalHeaderAccount.tsx`
- `src/styles/global.css`
- `BUMP_NOTES.md`

### Testing / validation notes

- Run `npm run check`, `npm run build`, and `git diff --check`.
- Smoke test the public account widget, modal close/Escape behavior, missing email/password validation, OAuth start links, and mobile viewport sanity.

### Risks / follow-ups

- Manual email/password env-backed master admin accounts are the first production admin path, but live verification depends on the admin Pages Functions deployment.
- OAuth users are not automatically master admins unless explicitly allowlisted or promoted through the future durable account-role system.
- Public session-aware content remains future work.

## v0.1.2-beta baseline correction

### Technical

- Established the shared DanielClancy project version baseline as `CURRENT VER= v0.1.2-beta / PENDING VER= v1.0`.
- Aligned the public-site package metadata with the corrected project baseline because this repo already uses explicit package version metadata.
- Preserved the existing historical implementation notes below without reclassifying admin-dashboard work into the public website repo.
- StreamSuites and StreamSuites-Dashboard follow their own separate version formats and must not be altered as part of DanielClancy versioning.
- Public-site login/admin entry wiring remains a future integration step and should be coordinated with the DanielClancy-Admin deployment readiness checkpoint.

### Human-readable

- DanielClancy now shares the same version baseline as DanielClancy-Admin.
- The public site has not gained admin dashboard implementation, CMS wiring, login wiring, or Cloudflare setup as part of this documentation/version correction.

### Files / areas changed

- `BUMP_NOTES.md`
- `package.json`
- `package-lock.json`

### Testing / validation notes

- Version/documentation correction only; no public-site runtime behavior is intended to change.
- `git diff --check` should be run after the edit.
- Because package metadata changed, use the repo's existing lightweight validation scripts where practical.

### Risks / follow-ups

- Public-site login/admin entry wiring remains deferred.
- Coordinate the future public login/admin entry wiring with the DanielClancy-Admin readiness checkpoint before production testing.

## Historical public-site notes retained from earlier local versioning

## Released series through 0.3.6-alpha

- `v0.3.6-alpha` is the last publicly issued release in the current alpha series.
- The live Stripe and PayPal donation runtime, its Cloudflare Pages Function payment routes, and the first production-safe `/donate` rebuild belong to that already-issued public release line.
- The earlier local `0.3.7-alpha` placeholder has been retired so future notes do not imply an unreleased extra alpha cut.

## 0.4.0-beta

### Technical

- Removed the `brand__subtitle-chip` wrapper from the shared `SiteBrand` header component and deleted the chip-only border/background styling so professional and personal page headers show the existing subtitle text without an outer container.
- Repaired the `/contact` delivery path so `src/pages/ContactPage.tsx` submits to the Cloudflare Pages Function without local mock success, includes the source path, blocks duplicate pending submits, and exposes accessible pending/success/error status text.
- Hardened `functions/api/contact.js` for real Resend delivery with JSON POST validation, quiet honeypot handling, non-POST 405 responses, configurable destination selection via `CONTACT_MAIL_TO`/`MAIL_TO`/`MAIL_REPLY_TO`, submitter-email Reply-To, safe browser errors, and server-side logging for missing config or provider failures.
- Updated `README.md` contact-delivery notes to document the required Cloudflare Pages environment variables: `RESEND_API_KEY`, `MAIL_FROM`, and `MAIL_REPLY_TO`.
- Hardened the `/donate` PayPal runtime so the shared config helper no longer falls back to stale preview messaging on enabled paths, expanded PayPal live-flag parsing for the current Cloudflare env contract, and aligned API-base selection with that resolved mode.
- Replaced the `/donate` PayPal smart-button dependency with a server-created order plus redirect approval flow, updated the create-order endpoint to return the official PayPal approval URL, and added return-time capture handling on the page before the final success banner is shown.
- Updated `docs/donate-stripe-runtime-note-2026-04-22.md` with the redirect-flow reason, the confirmation that dashboard credentials were not the root issue, and the rule that the live PayPal path now depends on the approval URL returned by order creation.
- Replaced the personal-shell header subtitle with `Personal Studio`, added a shared animated mobile-menu toggle component, and split both shell headers into desktop/mobile navigation treatments without merging route logic.
- Updated header-responsive styling in `src/styles/global.css` so mobile shows only the logo mark, collapses nav into a themed burger menu, and keeps the personal account trigger avatar-only while preserving desktop/tablet behavior.
- Simplified the personal-shell header account trigger to a logged-out-by-default icon state, removed the old `Member access` trigger label, and kept a structural logged-in username/avatar fallback seam without introducing auth logic.
- Added a shared slim external social-link row component for `/home` and `/watch`, reusing existing repo icons and keeping the personal-shell visual language intact on desktop and mobile.
- Rebuilt the `/donate` hero into a full-width slideshow using only the existing `assets/backgrounds/heroslides/*` assets, with restrained fade transitions, stronger overlay control, and cleaner alignment against the personal header.
- Reduced the donate hero title scale materially, tightened the supporting copy width, removed the public-facing `Accepted range` summary language, and kept the amount/payment runtime logic intact.
- Replaced the donate payment-method wordmarks with icon variants already present in `assets/icons/`, and added an explicit manual white treatment for the black `assets/icons/ui/payments.svg` asset in the Stripe provider row.
- Updated `docs/donate-stripe-runtime-note-2026-04-22.md` to record this final donation-page polish pass, the slideshow-asset constraint, and the post-`v0.3.6-alpha` version-note realignment.
- Realigned `package.json` at the time to the then-local `0.4.0-beta` milestone direction; the current shared DanielClancy baseline above supersedes that earlier local version note.
- Corrected employer logo placement on the `/` and `/cv` employment cards, switched those card marks to the monochrome `-0.svg` logo assets rendered white, and added breathing room above the employment-list CTA rows.
- Kept `/cv` employment-card logos pinned to the top-right corner on smaller breakpoints so they no longer create extra bottom whitespace in the card stack.

### Human-readable

- The header subtitle under `Daniel Clancy` now appears as plain text on both professional and personal pages, without the small outlined chip around it.
- The contact page now sends real enquiries through the server-side Resend endpoint on Cloudflare Pages instead of accepting cosmetic/local-preview submissions.
- Daniel receives submissions at the configured inbox, and replies can go directly to the submitter when their email address is valid.
- `/donate` now starts PayPal from a real branded CTA that redirects to PayPal approval after server-side order creation, instead of depending on the flaky smart-button renderer in the browser.
- Both site headers now behave cleanly on mobile: the full wordmark/subtitle hides, the logo mark stays visible, navigation collapses into a compact animated menu, and the personal shell subtitle now reads `Personal Studio`.
- The personal header account control is now cleaner and quieter by default, showing only the circular key icon until real sign-in state exists.
- `/home` and `/watch` now include a slim social link strip for Daniel's public channels without adding a bulky toolbar feel.
- `/donate` now opens with a calmer, more premium full-bleed slideshow hero instead of the oversized heading-heavy banner.
- The page reads cleaner in the payment-method areas, and the working Stripe/PayPal flow stays intact while the presentation is tightened for desktop and mobile.

## 0.3.5-alpha

### Technical

- Added a new Cloudflare Pages Function at `functions/api/watch-feed.js` to fetch and normalize Daniel's YouTube uploads server-side using the existing `YOUTUBE_API_KEY_DANIEL` and `YOUTUBE_CHANNEL_ID_DANIEL` env contract.
- Rebuilt `src/pages/WatchPage.tsx` around live feed hydration with an embedded featured video, recent uploads gallery, and restrained public-facing loading/empty/error states.
- Added `src/lib/watchFeed.ts` to keep the client-side feed contract and date formatting separate from the React page implementation.
- Extended `src/styles/global.css` with watch-page embed, card, and fallback-state styling while preserving the current personal-shell language.
- Updated `README.md` and `docs/public-site-polish-audit-2026-04-22.md` to record the server-side YouTube-first phase, the channel-ID env seam, and fallback behavior.
- Bumped the package version to `0.3.5-alpha`.

### Human-readable

- `/watch` now shows Daniel's latest YouTube release from a server-side feed instead of a static scaffold.
- The page stays presentable when the live feed cannot be loaded, and the browser bundle no longer needs direct YouTube API access.

## 0.3.4-alpha

### Technical

- Removed portfolio-project PDF importing from `src/content/workSetPortfolio.ts` so Vite no longer bundles project PDFs from `cmsdata/wix/portfolio/` into deploy output.
- Repointed project document actions in the portfolio detail flow to the shared interim OneDrive folder and updated the button/link copy to match folder-based access.
- Replaced the prior targeted `.gitignore` exceptions with a repo-safe rule covering `cmsdata/wix/portfolio/**/*.pdf`, keeping the local project PDF archive source-only and ready for untracking.
- Appended the broader pre-admin PDF-removal and shared-folder-routing note to `docs/public-site-polish-audit-2026-04-22.md` and clarified the asset policy in `README.md`.
- Bumped the package version to `0.3.4-alpha`.

### Human-readable

- Cloudflare Pages should no longer receive any project PDFs from the portfolio archive in the tracked repo surface or build output.
- Project detail pages still show an active document action, but it now opens the shared OneDrive folder until individual cloud links are introduced.

## 0.3.3-alpha

### Technical

- Detached oversized local portfolio PDFs from the Vite bundle by splitting WorkSet image and document resolution and excluding the temporary Cloudflare-blocking files from the imported PDF set.
- Added explicit document availability metadata to portfolio items so affected project detail routes can show a disabled PDF action without breaking the rest of the WorkSet-driven media flow.
- Updated `src/components/PortfolioMediaGallery.tsx`, `src/pages/PortfolioDetailPage.tsx`, and `src/styles/global.css` so disabled PDF actions remain visible, greyed out, and paired with brief professional microcopy.
- Appended a temporary pre-R2 oversized-PDF mitigation note to `docs/public-site-polish-audit-2026-04-22.md`.
- Added targeted `.gitignore` entries for the detached local source PDFs and prepared the repo for untracking those files while preserving them on disk.
- Bumped the package version to `0.3.3-alpha`.

### Human-readable

- Cloudflare Pages should no longer receive the oversized local portfolio PDFs in the deploy bundle.
- The affected project detail page now keeps its PDF button visible but disabled until dedicated large-file hosting is introduced.

## 0.3.2-alpha

### Technical

- Reworked `src/content/workSetPortfolio.ts` so WorkSet media resolution now prefers the canonical filenames from `cmsdata/wix/collection-tables/WorkSet.csv` against the actual local Wix-exported files under `cmsdata/wix/portfolio/`.
- Removed the remaining runtime fallback to Wix CDN media/document URLs; unmatched WorkSet assets now stay local-only, using restrained `public/media/portfolio/` preview fallbacks only where an existing local preview already exists.
- Added safer no-media handling in `src/components/MediaFrame.tsx` and `src/components/PortfolioMediaGallery.tsx` so gallery/detail routes stay stable when a WorkSet reference is genuinely missing from the local Wix export.
- Appended a focused WorkSet media-mapping audit note to `docs/public-site-polish-audit-2026-04-22.md`.
- Updated README media-source notes and bumped the package version to `0.3.2-alpha`.

### Human-readable

- Portfolio cards and project detail pages now resolve against the real local Wix-exported files first instead of falling back to old Wix-hosted URLs.
- Projects with partial local exports now show the matched local media that actually exists in the repo, while genuinely missing files are called out more truthfully and degrade safely.

## 0.3.1-alpha

### Technical

- Replaced the professional homepage split hero with a single full-bleed banner composition driven by the existing striped texture asset and the required `assets/portraits/profileavatar.webp` circular portrait treatment.
- Added homepage-only sticky-header state logic in `src/components/ProfessionalShell.tsx` so `/` overlays the header on the hero and fades the header surface back in on scroll without changing `/cv`, `/portfolio`, `/portfolio/:slug`, or `/contact`.
- Added scoped hero/header polish styles and responsive rules in `src/styles/global.css` without redesigning lower homepage sections or the personal shell.
- Appended the hero-pass implementation note to `docs/public-site-polish-audit-2026-04-22.md`.
- Bumped the package version to `0.3.1-alpha`.

### Human-readable

- The homepage now opens with a cleaner, more premium banner-led first impression instead of a busy two-column hero stack.
- Daniel's identity, portrait, and role read more clearly at first glance, while deeper detail is deferred to the existing sections below.
- The professional header now feels more intentional on the homepage by staying visible over the hero before easing back into the usual dark sticky surface on scroll.

## 0.3.0-alpha

### Technical

- Rebuilt the portfolio/archive data flow around `cmsdata/wix/collection-tables/WorkSet.csv` as the canonical public-project source.
- Replaced the obsolete hard-coded portfolio array in `src/content/siteContent.ts` with a smaller content module plus a new `src/content/workSetPortfolio.ts` parser/normaliser.
- Added WorkSet-driven gallery media, local asset resolution, supporting PDF links, and slug generation for `/portfolio/:slug`.
- Upgraded the project detail route with a contained media viewport, inline gallery controls, pagination dots, lightbox mode, collapsible details panel, previous/next project navigation, and back-to-gallery handling.
- Added `CompanyLogoMark`, `CapabilityMeter`, `ContactMap`, and `PortfolioMediaGallery` components.
- Added `leaflet` plus `@types/leaflet` for the static-host-friendly dark Sydney contact map.
- Updated shell/header layout logic, account-widget structure, logo handling, competence-bar animation, and route styling in `src/styles/global.css`.
- Bumped the package version to `0.3.0-alpha`.

### Human-readable

- The site is now wider, calmer, and more deliberate without changing the established Daniel Clancy font identity.
- The personal header/account area now aligns correctly and feels closer to an intentional dashboard control instead of a loose placeholder.
- Portfolio browsing and detail-page review are materially stronger, with the media/documentation now carrying the experience.
- The contact page now has an integrated dark Sydney map rather than stopping at text-only location details.

## 0.2.0-alpha

### Technical

- Added `docs/public-site-polish-audit-2026-04-22.md` to document the current layout issues, public-copy cleanup targets, shell split, and deferred integration items.
- Replaced the old single shared shell with two explicit route shells:
  - professional: `/`, `/cv`, `/portfolio`, `/portfolio/:slug`, `/contact`
  - personal: `/home`, `/watch`, `/donate`
- Added dedicated shell components, a shared brand component, a personal header member-widget UI, and a reusable media skeleton/shimmer component.
- Reworked route metadata to support indexed professional pages and noindex-but-shareable personal pages with Open Graph and Twitter tags.
- Rebuilt the professional home page, CV page, portfolio archive, dedicated portfolio detail page, and contact page around cleaner copy, stronger spacing, logo discipline, and clearer route hierarchy.
- Rebuilt the personal home, watch, and donate routes so they read as intentional public pages rather than utility placeholders.
- Moved project detail presentation from the portfolio gallery page into dedicated `/portfolio/:slug` routes and updated internal links accordingly.
- Added Cloudflare Pages-compatible contact delivery in `functions/api/contact.js` using the existing Resend env contract, with validation, honeypot/timing checks, and explicit local preview fallback behavior.
- Updated `public/_headers` and `public/robots.txt` to include `/home` in the noindex split.
- Added typed asset-module declarations in `src/assets.d.ts`.
- Removed the obsolete single-shell component `src/components/SiteLayout.tsx`.
- Bumped the package version to `0.2.0-alpha`.

### Human-readable

- The public site is now cleaner, more intentional, and much less exposed to internal/dev-style language.
- Professional pages stay fully focused on CV review, project evidence, and contact.
- Personal pages now feel like a distinct content-facing surface with their own header, footer, navigation, and preview-ready metadata.
- Portfolio browsing is easier to understand, and deeper project context now has dedicated detail pages instead of a crowded inline panel.
- The contact page is prepared for real delivery on Cloudflare Pages instead of stopping at a local-only form shell.

## 0.1.4-alpha

### Technical

- Performed a browser/MCP comparison pass against `https://www.amajaying.me/` and `https://www.danielclancy.net/` before editing.
- Added `docs/amajaying-inspired-overhaul-audit.md` documenting borrowed traits, rejected interaction patterns, Daniel-specific adaptation rules, and explicit preservation of the existing DanielClancy font system.
- Reworked the shared shell and global styling in `src/styles/global.css` around a more editorial poster-led hero, calmer panel hierarchy, stronger section choreography, cleaner footer treatment, and tighter responsive behavior.
- Rebuilt `HomePage`, `CvPage`, `PortfolioPage`, and `ContactPage` to match the new premium visual system while preserving recruiter clarity, static-hosting compatibility, and the existing route structure.
- Lightly aligned `/watch` and `/donate` with the redesigned system through shared-shell and global-style changes while keeping them out of primary navigation and indexed discovery.
- Bumped the package version to `0.1.4-alpha`.

### Human-readable

- The public site now feels materially more premium, art-directed, and memorable instead of reading like a cleaner version of the previous dark scaffold.
- The home page has a stronger identity-led first impression, the CV page reads more like a digital casefile, and the portfolio feels more curated and deliberate.
- The redesign preserves Daniel's existing font identity while upgrading composition, hierarchy, spacing, and overall presentation quality.
