# DanielClancy

Public-site repository for `DanielClancy.net`, built as a Cloudflare Pages-friendly Vite + React + TypeScript front end.

## Current Release

- Current release: `v1.0`
- Package version: `1.0.0`
- Release notes: `RELEASE_NOTES_v1.0.md`

## Purpose

This repo holds the public-facing Daniel Clancy website only. It now uses a deliberate split between:

- a professional shell for CV, portfolio, and contact review
- a Personal Studio shell for content, support, and storefront/merch commerce pages

The professional shell uses a restrained drawing-sheet/dossier visual system with Source Sans 3 headings, weighted Blinker body copy, the existing SUSE Mono interface labels, low-contrast grid cues, and first-class dark/light themes. Personal Studio, watch, and shop surfaces retain their established visual treatment.

The portfolio/archive layer now rebuilds from the canonical `cmsdata/wix/collection-tables/WorkSet.csv` export instead of the previous hand-maintained project array.

The CV, portfolio, project detail, company, platform/software, image, gallery, thumbnail, and document data now hydrate from the sanitized DanielClancy-Admin public site-data export when configured. The committed static fallback remains the current public source-derived model so the site still builds and renders when the admin API is unavailable.

## Route architecture

### Professional shell

| Route | Purpose | Indexed |
| --- | --- | --- |
| `/` | Professional landing page with selected work, software capability, and chronology preview | Yes |
| `/cv` | PDF access and readable employment timeline | Yes |
| `/work` | Portfolio archive alias for share/bookmark compatibility | Yes |
| `/work/:slug` | Legacy project-detail alias resolved through the shared canonical lookup | Yes |
| `/workset/:slug` | Legacy WorkSet project-detail alias resolved through the shared canonical lookup | Yes |
| `/portfolio` | WorkSet-driven archive gallery and filtering surface | Yes |
| `/portfolio/:slug` | Dedicated project detail route with gallery, lightbox, and prev/next navigation | Yes |
| `/contact` | Professional contact page with live-ready form delivery | Yes |
| `/privacy` | Privacy Policy covering contact, OAuth/login, analytics, media/API integrations, Cloudflare, Turnstile, and third-party services | Yes |
| `/terms` | Terms of Use covering portfolio content, accounts, providers/APIs, acceptable use, IP, analytics, and third-party services | Yes |

### Personal shell

| Route | Purpose | Indexed |
| --- | --- | --- |
| `/home` | Personal landing page for channels and supporter paths | No |
| `/watch` | Featured latest-video page hydrated from a server-side YouTube feed plus sanitized Admin manual watch media, targeting at least 12 fetched YouTube items where the upstream feed supports it | No |
| `/donate` | Live Stripe and PayPal support page with hosted checkout, PayPal approval redirect, and graceful fallback handling | No |
| `/shop` | Printful-powered merch storefront with published Admin display overrides where available | Yes |
| `/cart` | Merch cart, server-side validation, Printful draft creation, Stripe checkout, and safe return status | Yes |
| `/account` | Customer account overview for profile, orders, addresses, preferences, and payment-method management status | No |
| `/account/login` | Route-hosted version of the shared customer login panel used by the Personal Studio account dropdown | No |
| `/account/profile`, `/account/orders`, `/account/addresses`, `/account/preferences`, `/account/payments` | Protected customer account management routes backed by `DC_CUSTOMERS_KV` session state | No |
| `/shop/success`, `/shop/cancel` | Customer-facing merch checkout return states backed by safe order-status lookups where possible | Yes |
| `/store`, `/merch` | Cloudflare/client aliases redirecting to `/shop` | Yes |
| `/products/all`, `/products/:category` | Category browsing routes for the Printful-backed product catalogue | Yes |
| `/products/:category/:slug` | Clean product detail route resolved through the server-side merch API by slug or Printful identifiers where available | Yes |

## SEO and metadata split

- Professional CV/portfolio routes use standard indexable metadata.
- Personal content/support routes such as `/home`, `/watch`, and `/donate` use `noindex, nofollow, noarchive`; storefront routes under the Personal Studio shell remain indexable where their page metadata allows it.
- Personal and storefront routes still render Open Graph and Twitter preview metadata for link sharing.
- `public/robots.txt` and `public/_headers` enforce the noindex split for `/home`, `/watch`, and `/donate`.
- `public/_redirects` keeps Cloudflare Pages on SPA fallback mode with direct `/store` and `/merch` redirects to `/shop`, then `/* /index.html 200` so direct loads and refreshes for `/`, `/portfolio`, `/portfolio/:slug`, `/work`, `/work/:slug`, `/workset/:slug`, `/products/all`, `/products/:category`, `/products/:category/:slug`, `/cv`, `/shop`, `/cart`, `/shop/success`, `/shop/cancel`, `/contact`, `/privacy`, and `/terms` serve the Vite app before React resolves the route.

## Legal and policy pages

- Public routes: `/privacy` and `/terms`
- Shared layout: `src/components/LegalPageLayout.tsx`
- Page files: `src/pages/PrivacyPage.tsx` and `src/pages/TermsPage.tsx`
- Both pages use the professional shell, route metadata through `Seo`, a last-updated date, a top jump-to anchor menu, stable section IDs, per-section hash links, and scoped `.legal-*` styling in `src/styles/global.css`.
- Footer legal links are no longer advertised from the professional footer. Terms and Privacy remain available as routes and continue to be linked from the Personal Studio/storefront footer where commercially or account-policy relevant.
- The Privacy Policy covers contact form fields, OAuth/login data, admin/session/security metadata, page visits, Cloudflare request metadata, Turnstile, local/session storage, /watch media metadata, YouTube API Services, Google/GitHub/X OAuth, Twitch/Kick streaming platform references, Cloudflare infrastructure, analytics/security logs, retention, revocation, and third-party links.
- The Terms of Use cover acceptance, site purpose, accounts/admin restrictions, OAuth and third-party services, /watch media/platform content, YouTube API Services terms, Twitch/Kick/X/GitHub/Google provider terms, acceptable use, intellectual property, portfolio/CV content, submitted content, analytics/security, Cloudflare/Turnstile, disclaimers, liability, indemnity, termination, changes, and New South Wales governing law.
- The pages are informational website policy pages and should receive legal review before relying on them as final legal documents. No legal entity registration number, office address, new phone number, lawyer, regulator contact, or other unverified formal registration detail is added by these pages.

## Contact delivery

- UI route: `/contact`
- Server endpoint: `functions/api/contact.js`
- Delivery provider: Resend via server-side Cloudflare Pages Function env usage
- Delivery target: `CONTACT_MAIL_TO` or `MAIL_TO` if configured, otherwise `MAIL_REPLY_TO`, with `mail@danielclancy.net` as the final code fallback
- Sender: `MAIL_FROM`
- Reply-To: the validated submitter email address so Daniel can reply directly
- Env handling: delivery env values are trimmed and one accidental pair of wrapping single or double quotes is stripped server-side before Resend validation
- Cloudflare Turnstile: the form renders a Turnstile challenge before submit and `functions/api/contact.js` verifies the token server-side before accepting or sending the message

Required Cloudflare Pages environment variables:

- `RESEND_API_KEY`
- `MAIL_FROM`
- `MAIL_REPLY_TO`
- `DC_TURNSTILE_SITE_KEY`
- `DC_TURNSTILE_SECRET_KEY`

Optional destination overrides:

- `CONTACT_MAIL_TO`
- `MAIL_TO`
- `DC_TURNSTILE_DEV_BYPASS=false` for normal production behavior; only set `true` in explicit dev/test environments
- `DANIELCLANCY_ALERT_INGEST_URL` - StreamSuites runtime/API `POST /api/alerts/danielclancy` endpoint for contact/page-visit alert delivery
- `DANIELCLANCY_ALERT_INGEST_SECRET` - server-only shared secret matching the StreamSuites receiver
- DanielClancy.net alert sender payloads are event-only; rule/configuration/preferences/manifest fields are stripped from nested payload/context data before posting to StreamSuites ingest.
- Contact and page-visit alert events forward sanitized Cloudflare request metadata when available, including host/origin, page/referrer fields, request method, client IP, user agent, browser/device/platform, timezone, colo, `geo.city`, `geo.region`, `geo.region_code`, `geo.country`, `geo.country_code`, and derived country flag. Rule definitions are never sent.
- `DANIELCLANCY_ADMIN_ANALYTICS_INGEST_URL` - DanielClancy-Admin `POST /api/analytics/ingest/page-visit` endpoint, expected `https://admin.danielclancy.net/api/analytics/ingest/page-visit`
- `DANIELCLANCY_ANALYTICS_INGEST_SECRET` - server-only shared secret matching DanielClancy-Admin analytics ingest

Generate the alert ingest secret with:

```sh
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Use the same generated value in this sender repo and the StreamSuites runtime receiver environment. Do not expose or commit `RESEND_API_KEY`, `DC_TURNSTILE_SECRET_KEY`, or `DANIELCLANCY_ALERT_INGEST_SECRET`. `MAIL_FROM` may use the StreamSuites notify sender, and `MAIL_REPLY_TO` should remain Daniel's destination inbox unless a more specific destination variable is configured. A simple static/Vite dev server cannot run Pages Functions, so the contact Turnstile may show an unavailable static-dev state until served through a Pages-compatible runtime with the env vars. Alert delivery failures are logged server-side and do not block contact delivery or page rendering.

Generate `DANIELCLANCY_ANALYTICS_INGEST_SECRET` separately unless intentionally reusing another generated secret:

```sh
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Public page visits beacon to this repo's `POST /api/track/page-visit` endpoint. That Pages Function forwards sanitized page-visit metadata server-side to DanielClancy-Admin analytics ingest when the analytics URL/secret are configured. The browser sends a per-page-load `eventId` and page fields only; the Pages Function adds `source: "page_visit_kv"`, `live: true`, `recordedAt`, and sanitized Cloudflare `request.cf` city/region/country fields before forwarding. The browser never receives the analytics ingest secret, and forwarding failures do not block page rendering.

## Customer account foundation

- Personal Studio routes: `/account`, `/account/login`, `/account/profile`, `/account/orders`, `/account/addresses`, `/account/preferences`, `/account/payments`, and `/account/logout`.
- The Personal Studio header includes a cart icon button with the local cart count when non-zero and a StreamSuites-style customer account dropdown for signed-in and signed-out account actions. The cart icon opens a fixed viewport right-side cart drawer first, with current cart state, quantity/remove controls, a close action, backdrop/outside-click/Escape close behavior, and a prominent `Open Cart` button for the full `/cart` page. Logged-out headers show `MORE`; the dropdown includes Login, Account, Cart, Shop, Orders / Purchase history, and Contact / help. Signed-in headers show the customer display name/avatar when available and include Logout. Professional CV/portfolio headers and footers do not advertise customer account routes.
- `/watch` keeps its custom cinematic header, but its account control uses the same customer session state, Login modal trigger, signed-in display name/avatar handling, and Logout action as the Personal Studio header.
- Customer logout is route/API based through `POST /api/customer/logout` and clears the HttpOnly customer session cookie plus the shared Admin auth cookie name server-side; browser code only updates in-memory customer UI state after the helper returns.
- Customer auth uses the shared login panel/modal with the Admin-owned OAuth providers and manual email/password option. The public login UI calls the Admin auth endpoints so successful OAuth/manual login creates the shared `dc_customer_session` HttpOnly, SameSite=Lax cookie with Secure on HTTPS. Production requests on `danielclancy.net` or `admin.danielclancy.net` default that cookie to `Domain=.danielclancy.net`; localhost/dev requests omit Domain so local testing remains host-only.
- Customer state is stored only in `DC_CUSTOMERS_KV -> danielclancy-customers`: profiles, email lookup, login challenges, sessions, delivery addresses, contact preferences, order references, and Stripe customer mappings.
- The DanielClancy-Admin project also reads and writes compatible `dc_customer_session` records in `DC_CUSTOMERS_KV`, so a successful Admin login can be recognized by the public site and a public login can be recognized by Admin when the customer profile has explicit server-side admin access.
- If `DC_CUSTOMERS_KV` is missing, customer endpoints return `customer_storage_not_configured` / config-needed states. No local filesystem, localStorage, in-memory-only, or Admin KV fallback is used for customer accounts.
- Passwordless magic-link endpoints remain secondary/legacy and are not the primary customer login UI. If that endpoint is called and the email provider is unavailable, `POST /api/customer/login/start` returns `customer_email_provider_not_configured` and does not pretend login succeeded.
- Customer profile fields include email identity, display name, HTTPS avatar URL, optional phone, contact/marketing preferences, delivery addresses, timestamps, status, Stripe customer id presence, and server-only admin access metadata. Public customer responses do not expose admin access metadata. `/api/customer/me` rehydrates the current profile from `DC_CUSTOMERS_KV` with `Cache-Control: no-store`, and profile saves dispatch the refreshed customer state so the header/account UI updates immediately before a hard-refresh proof.
- `/account/orders` reads linked order ids from `DC_CUSTOMERS_KV` and safe order summaries from `DC_MERCH_ORDERS_KV`, only for the logged-in customer.
- `/account/payments` never stores or renders raw card numbers, CVCs, bank details, or raw Stripe payment method payloads. Payment methods are managed through Stripe Customer Portal when Stripe configuration and portal setup allow it.

Customer account endpoints:

- `POST /api/customer/login/start`
- `GET|POST /api/customer/login/verify`
- `POST /api/customer/logout`
- `GET /api/customer/me`
- `PATCH /api/customer/profile`
- `PATCH /api/customer/preferences`
- `GET|POST /api/customer/addresses`
- `PATCH|DELETE /api/customer/addresses/:id`
- `GET /api/customer/orders`
- `POST /api/customer/stripe/portal`

Public build-time env:

- `VITE_ADMIN_AUTH_ORIGIN` - optional Admin auth origin for the shared OAuth/manual login panel, defaulting to `https://admin.danielclancy.net`
- `VITE_ADMIN_PUBLIC_SITE_DATA_URL` - optional sanitized public CMS export endpoint, recommended `https://admin.danielclancy.net/api/public/site-data`

Shared customer session env:

- `DC_CUSTOMERS_KV` - required Pages KV binding for customer profiles, login challenges, session records, and order links.
- `DC_CUSTOMER_COOKIE_DOMAIN` - optional override for the shared customer cookie domain. Leave blank for localhost/dev. Production defaults to `.danielclancy.net` when the request host is `danielclancy.net` or `admin.danielclancy.net`.

Contact Turnstile env:

- `DC_TURNSTILE_SITE_KEY` - exposed only through the safe `/api/turnstile/config` Pages Function response
- `DC_TURNSTILE_SECRET_KEY` - server-side only; required by `/api/contact`, not by login/signup/OAuth auth flows
- `DC_TURNSTILE_DEV_BYPASS=false`

Server-side admin auth env vars and OAuth redirect URIs live in the DanielClancy-Admin repo because the admin Pages Functions own password verification and session cookies.

Cloudflare setup checkpoint after this local scaffold:

- Create/confirm the DanielClancy-Admin Cloudflare Pages project.
- Configure `admin.danielclancy.net` DNS/custom domain.
- Add the required admin auth env vars in Cloudflare.
- Create OAuth apps in GitHub, Google Cloud, and Twitter/X developer portals.
- Register callback URLs and confirm cookies across `danielclancy.net` and `admin.danielclancy.net`.

## Watch feed delivery

- UI route: `/watch`
- Server endpoint: `functions/api/watch-feed.js`
- Provider phase: YouTube auto-fetch plus sanitized Admin manual watch media from the public site-data export
- Server-only env usage:
  - `YOUTUBE_API_KEY_DANIEL`
  - `YOUTUBE_CHANNEL_ID_DANIEL`
- Channel identifier used now: the stable channel ID from `YOUTUBE_CHANNEL_ID_DANIEL`
- Manual Rumble media comes from DanielClancy-Admin `collections.watchMedia` in `GET /api/public/site-data`; the public client never calls Admin CMS routes or receives Admin KV/binding names. Live public site-data reads use `cache: "no-store"` plus a cache-busting query parameter, and valid live `watchMedia: []` remains empty rather than falling back to stale committed watch rows.
- Watch media rows containing scaffold/demo/sample/placeholder identifiers or titles are rejected in the public fallback normalizer and live public site-data normalizer.
- Hero and gallery ordering use the same newest-first date precedence: `sortDate`, `publishedAt`, `enteredAt`, `createdAt`, then `updatedAt`. Hero selection picks the first sorted visible embeddable item; it does not prefer YouTube over a newer safe Rumble video.
- Rumble videos can be hero items when they have a safe `https://rumble.com/embed/...` iframe URL. Rumble shorts are always gallery-only, portrait `9:16`, non-embeddable, and link to their source URL from the gallery.
- `functions/api/watch-feed.js` requests a named `WATCH_FEED_TARGET_COUNT` of 12 YouTube uploads and returns `Cache-Control: no-store`. If YouTube returns fewer, `/watch` shows the real count through subtle feed diagnostics and does not duplicate or invent items.
- YouTube Shorts stay on the existing YouTube embed path and are rendered as portrait gallery cards when detected from short metadata while remaining hero-eligible where the existing YouTube iframe behavior supports it.
- Fallback behavior: if env/runtime or the upstream API is unavailable, `/watch` keeps its static share metadata, shows a polished fallback hero/state, still renders any valid Admin manual media available through public site-data, and avoids exposing any secret in the client bundle.
- To verify live sync, save a Rumble video in Admin Media, confirm `/api/public/site-data` contains the sanitized `watchMedia` row with the edited `sortDate`/`publishedAt`, confirm the Admin public export revision/updated timestamp changes, refresh `/watch`, and check the diagnostic line for `manual`, `merged`, and `hero` values. The newest embeddable item should be the hero; a newer Rumble short should stay gallery-only.

## Printful merch storefront

- UI routes: `/shop`, `/products/all`, `/products/:category`, `/products/:category/:slug`, `/cart`, `/shop/success`, and `/shop/cancel`
- Redirect aliases: `/store` and `/merch` redirect to `/shop` through `public/_redirects` and client routing
- Server endpoints:
  - `GET /api/merch/products`
  - `GET /api/merch/products/*`
  - `GET /api/merch/currency-rates`
  - `POST /api/merch/cart/validate`
  - `POST /api/merch/cart/shipping`
  - `POST /api/merch/cart/checkout`
  - `POST /api/merch/stripe/webhook`
- Server-only env:
  - `PRINTFUL_STORE_API`
  - `DANIELCLANCY_ADMIN_PUBLIC_SITE_DATA_URL` or `VITE_ADMIN_PUBLIC_SITE_DATA_URL` for sanitized published Admin storefront overrides
  - `STRIPE_SECRET_KEY`
  - `STRIPE_MERCH_WEBHOOK_SECRET` for `https://danielclancy.net/api/merch/stripe/webhook`
  - `STRIPE_LIVE_ENABLED`
  - Optional `CURRENCY_RATES_API_URL=https://api.frankfurter.dev/v1/latest?base=AUD` for a runtime AUD-based exchange-rate JSON endpoint. If omitted or unavailable, conversion UI shows an unavailable state and shopping/checkout remain available.
  - `DC_MERCH_ORDERS_KV` Cloudflare KV binding for durable merch order intents before Stripe checkout/session creation is allowed

The public storefront never reads `PRINTFUL_STORE_API` in browser code. Pages Functions resolve the Printful store named `Daniel Clancy` through Printful v2 stores where available, then use legacy Printful sync product endpoints for storefront product list/detail data because sync product management is not available in Printful v2 yet. Public responses are normalized into the local merch product shape and merged with published Admin overrides for visibility, featured state, display title, description, category/categories, primary category, slug, hero image, gallery order, alt text, banners, and sort order.

Every visible product is assigned the locked system category `All Products` with slug `all`. Products with no additional category remain visible at `/products/all`, and product details continue to resolve at `/products/all/:slug` as well as configured category routes. Additional categories come from Printful category/collection/tag/product-type fields when present or from Admin category overrides; Admin category overrides remain authoritative for public display categories and primary category. Do not invent categories when Printful does not provide them.

Banners are managed product promo chips, not categories. They are configured in Admin, assigned per product, and render on product cards/details only when enabled and explicitly assigned. Disabled banners do not render publicly. Admin product/banner saves auto-publish the sanitized public site-data snapshot, and public merch product/cart APIs use no-store/no-cache reads so a storefront refresh can see current banner assignments without hunting for a hidden publish step. Product API responses include safe override diagnostics such as `overrideSource`, `overrideRevision`, `productOverrideCount`, and `bannerCount` so missing live Admin site-data is visible without exposing Admin secrets.

Shop hero slides use static or public-CDN image records from the published Admin product settings. The static repo-backed manifest is `src/content/shopHeroSlides.ts`, and the source image directory is `assets/backgrounds/shopheroslides/` with the currently verified files `shophero-00.webp`, `shophero-01.webp`, and `shophero-02.webp`. To add static hero images, place files in `assets/backgrounds/shopheroslides/`, update `src/content/shopHeroSlides.ts`, configure active/enabled slides, order, active set, and crossfade timing in Admin Shop Settings, then publish site data. Runtime uploads, when used, must be public R2/CDN URLs; Admin does not write new files into the deployed git repo at runtime. The default crossfade interval is 5 seconds.

The store base currency is AUD. Product cards show only the AUD/store-currency price with a small inline flag icon. Product detail and cart pages show a stronger main AUD price and can show a smaller converted estimate underneath the main price, defaulting to USD, with selected currency flag icons for USD, CAD, NZD, GBP, EUR, JPY, CHF, SGD, HKD, and KRW when rates are available. Converted amounts are informational only; checkout, shipping, Stripe session creation, and Printful draft order data continue to use server-validated store-currency totals. If rates cannot be fetched, conversion UI shows an unavailable state and does not block shopping.

The public cart stores only non-sensitive selections in localStorage: product id, slug, variant id, and quantity. `POST /api/merch/cart/validate` validates those selections against server-side Printful data, rejects hidden/unpublished products through published Admin overrides, rejects unknown variants, and recalculates titles, variant names, prices, currency, and totals server-side. `POST /api/merch/cart/shipping` validates the same cart and calls Printful `/v2/shipping-rates` server-side with short-lived recipient data; US, AU, and CA require a state/province code. Checkout requires complete recipient name, email, and shipping address, then rechecks the selected shipping option server-side before any payment session is created.

`POST /api/merch/cart/checkout` requires the dedicated `DC_MERCH_ORDERS_KV` binding before it creates payment or fulfillment state. It writes durable records under `merch:orders:*`, `merch:index:recent:*`, `merch:printful:drafts:*`, and `merch:stripe:sessions:*`, creates a Printful draft order with synced variant ids and confirmation deferred, then creates a Stripe Checkout Session from server-validated line items and shipping only. If storage, Printful, shipping validation, or Stripe configuration is unavailable, checkout fails closed with a config-needed or safe generic checkout message and no fake success path.

The merch webhook URL is `https://danielclancy.net/api/merch/stripe/webhook`. Subscribe it to `checkout.session.completed` and `checkout.session.expired` after deployment. The merch webhook verifies the Stripe signature with the merch-specific `STRIPE_MERCH_WEBHOOK_SECRET`; it does not use or fall back to the existing donation/payment `STRIPE_WEBHOOK_SECRET`. It records Stripe event ids under `merch:stripe:events:*`, marks paid sessions once, confirms the Printful draft only after `payment_status=paid`, and persists `printful_confirmation_failed` or `manual_review_required` when paid fulfillment cannot be confirmed. `/shop/success` reads only the safe order status by Stripe session id; `/shop/cancel` attempts to mark the intent canceled when the intent id is present.

Printful product discovery still uses the existing synced product feed. Shipping rates use Printful `/v2/shipping-rates`; product image file registration elsewhere uses `/v2/files`; order draft/confirmation uses the legacy synced-order path (`POST /orders?confirm=false` and `POST /orders/{id}/confirm`) because the storefront items are existing Printful sync variants.

If Printful is not configured or returns no products, `/shop` renders a polished empty/error state without inventing products, prices, images, descriptions, variants, or inventory.

PayPal merch checkout is deferred. The existing PayPal implementation is donation-specific, uses `NO_SHIPPING`, and captures a one-time donation order; it is not reused for physical product cart checkout in this milestone.

Signed-in customer checkout remains optional. Guest checkout still uses the anonymous local cart path. When a valid customer session exists, checkout attaches the server-resolved customer id/email to the merch order intent, links the intent under `customer:orders:{customerId}`, pre-fills the cart form from the default delivery address where safe, and passes the stored Stripe customer id to Stripe Checkout when available. If a signed-in customer has no Stripe customer id yet, the server creates one through Stripe before checkout and stores only the Stripe customer id mapping in `DC_CUSTOMERS_KV`.

## Donation checkout

- UI route: `/donate`
- Server endpoints:
  - `functions/api/payments/config.js`
  - `functions/api/payments/stripe/create-session.js`
  - `functions/api/payments/stripe/webhook.js`
  - `functions/api/payments/paypal/create-order.js`
  - `functions/api/payments/paypal/capture-order.js`
  - `functions/api/payments/paypal/webhook.js`
  - compatibility shims remain at `functions/api/donate/session.js` and `functions/api/donate/webhook.js`
- Active payment phase: live one-time Stripe Checkout and live PayPal donation flow
- Server-only Stripe env contract:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_LIVE_ENABLED`
- Server-only PayPal env contract:
  - `PAYPAL_CLIENT_ID`
  - `PAYPAL_CLIENT_SECRET`
  - `PAYPAL_WEBHOOK_ID`
  - `PAYPAL_APP_NAME`
  - `PAYPAL_LIVE_ENABLED`
- Runtime behavior:
  - `/donate` exposes only public provider availability and PayPal client configuration to the browser
  - Stripe Checkout Session creation, PayPal order creation/capture, and both webhook handlers stay server-side only
  - if one provider is unavailable, the page stays presentable and keeps the other live provider active instead of exposing runtime detail

## Fonts and assets

- Professional headings and compact wordmark: `assets/fonts/heading/SourceSans3-VariableFont_wght.ttf`, used across its available variable weight range
- Professional body: weighted `assets/fonts/body/Blinker-*.ttf` faces from Thin through Black
- Existing Recharge and Sui Generis faces remain available to the non-professional Personal Studio/watch/shop surfaces
- Monospace UI: `assets/fonts/mono/SUSEMono-Variable.ttf`
- Public CV: `public/docs/Daniel_Clancy_CV_2026.pdf`
- Canonical portfolio source: `cmsdata/wix/collection-tables/WorkSet.csv`
- Canonical portfolio media root: `cmsdata/wix/portfolio/`
- Portfolio project PDFs under `cmsdata/wix/portfolio/` are source-only local archive material and should remain gitignored rather than tracked or deployed.
- Local preview-only fallbacks for genuinely missing WorkSet exports: `public/media/portfolio/`
- Public portfolio thumbnails: `public/media/portfolio/thumbs/`, addressed as clean paths such as `/media/portfolio/thumbs/example.webp`
- Public portfolio gallery/hero media: `public/media/portfolio/`, addressed as clean paths such as `/media/portfolio/example.webp`
- Public documents: `public/docs/`, addressed as clean paths such as `/docs/example.pdf`
- Logo/social/software/company marks: `assets/logos/` and `assets/icons/`

Project detail document actions prefer a sanitized local `/docs/...` `documentPath` when one exists. Older OneDrive `documentationUrl` values remain as fallback source data until replaced by an admin-managed local document path.

## Public site-data hydration

- Client entrypoint: `src/lib/publicSiteData.tsx`
- Static fallback: `src/data/public-site-fallback.ts`
- Admin endpoint: `GET /api/public/site-data` from DanielClancy-Admin
- Live env: `VITE_ADMIN_PUBLIC_SITE_DATA_URL=https://admin.danielclancy.net/api/public/site-data`

The public site fetches only the sanitized public endpoint. It does not call `/api/admin/cms/*`, does not require an admin session, and does not receive account registry, auth/session, secret, KV, or overlay internals. The React provider initializes synchronously from the committed fallback model, so route rendering never depends on visiting Home first or waiting for Admin hydration. If the env var is missing, fetch fails, the response is invalid, or a collection is missing, the app keeps rendering from the committed fallback model and safely fills missing live rows from fallback data.

The public client uses `cache: "no-store"` for runtime fetches and preserves internal source metadata: `source`, `revision`, `publishedAt`, `generatedAt`, `usingFallback`, `loading`, and a safe error summary. Development builds log one compact diagnostic when the live endpoint is missing, loaded, or unavailable; production builds do not add noisy console output.

The normalized model preserves legacy project fields while accepting admin public fields such as `thumbnailPath`, `heroImage`, ordered `galleryPaths`, `documentPath`, `companyId`/`companyName`, `clientName`/`clientLabel`, `platformIds`, and `platformLabels`. For records already present in the committed WorkSet catalogue, the public client prefers verified bundled thumbnail/gallery paths over stale or empty exported media paths, while new unmatched records may still use sanitized export media. Discipline/category fields are split into the actual filter taxonomy, descriptive tags remain scope labels, and software aliases are deduplicated to the established platform names. Portfolio filter state is stored in the URL query so direct loads, project round-trips, reloads, and browser history preserve the current archive view.

The normalized model also accepts `collections.watchMedia` for `/watch`. That collection is public-safe only: manual Rumble videos/shorts include title, description/excerpt, thumbnail, source/embed URLs, `sortDate`, `publishedAt`, `enteredAt`, `createdAt`, `updatedAt`, visibility, hero/gallery flags, aspect, tags, and platform ids where available. Admin-only override/audit fields are stripped before the public site receives the snapshot, and rejected scaffold/demo/sample/placeholder watch rows are filtered before rendering. Media CMS saves in Admin auto-publish the public site-data snapshot when live Admin KV is available, so a public refresh can see manual media changes without a hidden manual publish step.

Project detail routes resolve against the fallback archive immediately by normalized slug, ID, legacy code, title-derived key, and existing URL/path tail aliases through one shared lookup. Canonical `/portfolio/:slug` URLs and compatibility `/work/:slug` and `/workset/:slug` routes use the same resolver. When Admin published data arrives, it merges into the fallback archive without dropping fallback-only projects; unknown project routes show a loading-safe state while live hydration is pending and only show Not Found after the live fetch has resolved or failed. Asset paths used by cards, heroes, galleries, and document links are kept root-relative for `/media/portfolio/...` and `/docs/...`, while absolute CDN/R2 URLs remain valid on nested direct routes.

### Public fallback rebuild

Use `npm run data:rebuild` after Admin manifests change. The script reads, in order, the live URL from `VITE_ADMIN_PUBLIC_SITE_DATA_URL` when configured or local Admin manifests from `../DanielClancy-Admin`, then writes `src/data/public-site-fallback.generated.json`. `npm run data:check` reports stale generated fallback data without writing it. `npm run build:with-data` rebuilds the fallback then runs the normal build.

Public CMS edits show on DanielClancy.net after Admin Save/Sync, Admin Publish site data, and a public refresh; navigation from Home is not required. Merch product/banner saves publish their sanitized product snapshot automatically when live Admin KV is available, and `/api/merch/products` should show the new `overrideRevision` / banner fields on refresh. Redeploy the public site only when `VITE_ADMIN_PUBLIC_SITE_DATA_URL`, committed fallback data, rendering code, public assets, or Cloudflare routing files changed.

## Key implementation files

- Routing: `src/app/App.tsx`
- Shells:
  - `src/components/ProfessionalShell.tsx`
  - `src/components/PersonalShell.tsx`
- Shared brand/media helpers:
  - `src/components/SiteBrand.tsx`
  - `src/components/MediaFrame.tsx`
  - `src/components/CapabilityMeter.tsx`
  - `src/components/CompanyLogoMark.tsx`
  - `src/components/ContactMap.tsx`
  - `src/components/LegalPageLayout.tsx`
  - `src/components/PersonalHeaderAccount.tsx`
  - `src/components/PortfolioMediaGallery.tsx`
  - `src/content/brandAssets.ts`
  - `src/content/shopHeroSlides.ts`
  - `src/content/workSetPortfolio.ts`
  - `src/data/public-site-fallback.generated.json`
  - `src/data/public-site-fallback.ts`
  - `src/lib/customerAccount.ts`
  - `src/lib/merch.ts`
  - `src/lib/merchCart.ts`
  - `src/lib/publicSiteData.tsx`
  - `src/lib/watchPlayer.ts`
  - `src/lib/watchFeed.ts`
  - `src/lib/portfolio.ts`
- Pages:
  - `src/pages/AccountPage.tsx`
  - `src/pages/HomePage.tsx`
  - `src/pages/CvPage.tsx`
  - `src/pages/PortfolioPage.tsx`
  - `src/pages/PortfolioDetailPage.tsx`
  - `src/pages/ContactPage.tsx`
  - `src/pages/PrivacyPage.tsx`
  - `src/pages/TermsPage.tsx`
  - `src/pages/PersonalHomePage.tsx`
  - `src/pages/LivePage.tsx`
  - `src/pages/WatchPage.tsx`
  - `src/pages/DonatePage.tsx`
  - `src/pages/CartPage.tsx`
  - `src/pages/ShopPage.tsx`
  - `src/pages/ProductDetailPage.tsx`
  - `src/lib/donate.ts`
- Global styling: `src/styles/global.css`
- Audit notes:
  - `docs/public-site-polish-audit-2026-04-22.md`
  - `docs/migration-notes.md`
  - `docs/portfolio-tranche-2-audit.md`
  - `docs/amajaying-inspired-overhaul-audit.md`
  - `docs/donate-stripe-runtime-note-2026-04-22.md`

## Local development

### Quick launch

- `run-local.cmd`
- `.\run-local.ps1`

### Manual

```powershell
npm install
npm run dev -- --host
```

### Validation

```powershell
npm run check
npm run data:rebuild
npm run build
npm run preview -- --host
```

## Repository tree

```text
DanielClancy/
├─ assets/
│  ├─ backgrounds/
│  ├─ fonts/
│  ├─ icons/
│  ├─ logos/
│  └─ portraits/
├─ cmsdata/
│  └─ wix/
├─ docs/
│  ├─ amajaying-inspired-overhaul-audit.md
│  ├─ donate-stripe-runtime-note-2026-04-22.md
│  ├─ migration-notes.md
│  ├─ portfolio-tranche-2-audit.md
│  └─ public-site-polish-audit-2026-04-22.md
├─ functions/
│  ├─ _shared/
│  │  ├─ alert-sender.js
│  │  ├─ customer-accounts.js
│  │  ├─ merch-orders.js
│  │  ├─ printful-products.js
│  │  └─ turnstile.js
│  └─ api/
│     ├─ contact.js
│     ├─ customer/
│     │  └─ [[path]].js
│     ├─ donate/
│     │  ├─ session.js
│     │  └─ webhook.js
│     ├─ merch/
│     │  ├─ cart/
│     │  │  └─ [[action]].js
│     │  ├─ currency-rates.js
│     │  ├─ products/
│     │  │  └─ [[lookup]].js
│     │  └─ stripe/
│     │     └─ webhook.js
│     ├─ track/
│     │  └─ page-visit.js
│     ├─ turnstile/
│     │  └─ config.js
│     └─ watch-feed.js
├─ public/
│  ├─ assets/fonts/
│  ├─ docs/
│  ├─ media/portfolio/
│  ├─ _headers
│  ├─ _redirects
│  ├─ favicon.ico
│  └─ robots.txt
├─ src/
│  ├─ app/App.tsx
│  ├─ assets.d.ts
│  ├─ vite-env.d.ts
│  ├─ components/
│  │  ├─ LegalPageLayout.tsx
│  │  ├─ PersonalHeaderAccount.tsx
│  │  └─ PageVisitBeacon.tsx
│  ├─ content/
│  │  └─ shopHeroSlides.ts
│  ├─ data/
│  │  ├─ public-site-fallback.generated.json
│  │  └─ public-site-fallback.ts
│  ├─ lib/
│  │  ├─ customerAccount.ts
│  │  ├─ currency.tsx
│  │  ├─ donate.ts
│  │  ├─ merchCart.ts
│  │  ├─ merch.ts
│  │  ├─ portfolio.ts
│  │  ├─ publicSiteData.tsx
│  │  ├─ turnstile.tsx
│  │  ├─ watchPlayer.ts
│  │  └─ watchFeed.ts
│  ├─ pages/
│  │  ├─ AccountPage.tsx
│  │  ├─ CartPage.tsx
│  │  ├─ LivePage.tsx
│  │  ├─ ProductDetailPage.tsx
│  │  ├─ ShopPage.tsx
│  │  ├─ PrivacyPage.tsx
│  │  └─ TermsPage.tsx
│  └─ styles/global.css
├─ tests/
│  ├─ merch-product-banners.test.mjs
│  ├─ page-visit-forwarder.test.mjs
│  ├─ public-site-data-client.test.mjs
│  ├─ watch-media-merge.test.mjs
│  └─ version-consistency.test.mjs
├─ tools/
│  └─ rebuild-public-fallback.mjs
├─ .env.example
├─ BUMP_NOTES.md
├─ RELEASE_NOTES_v1.0.md
├─ package.json
├─ run-local.cmd
├─ run-local.ps1
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts
```

## Deferred items

- Cloudflare deployment and DNS cutover
- Later provider migration for the current YouTube-backed `/watch` feed
- Admin-side content workflow integration
- Further archive enrichment as more source material is verified
- Hosted Cloudflare verification of the customer account flow after `DC_CUSTOMERS_KV`, Resend, Stripe, and Stripe Customer Portal settings are configured
- Potential media-bundle optimisation if the full local WorkSet asset set proves too heavy for final deployment targets
