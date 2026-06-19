# DanielClancy

Public-site repository for `DanielClancy.net`, built as a Cloudflare Pages-friendly Vite + React + TypeScript front end.

## Purpose

This repo holds the public-facing Daniel Clancy website only. It now uses a deliberate split between:

- a professional shell for CV, portfolio, and contact review
- a personal shell for content, support, and future member-facing utilities

The visual system keeps the existing DanielClancy font pairing while tightening hierarchy, spacing, route separation, and public copy quality.

The portfolio/archive layer now rebuilds from the canonical `cmsdata/wix/collection-tables/WorkSet.csv` export instead of the previous hand-maintained project array.

The CV, portfolio, project detail, company, platform/software, image, gallery, thumbnail, and document data now hydrate from the sanitized DanielClancy-Admin public site-data export when configured. The committed static fallback remains the current public source-derived model so the site still builds and renders when the admin API is unavailable.

## Route architecture

### Professional shell

| Route | Purpose | Indexed |
| --- | --- | --- |
| `/` | Professional landing page with selected work, software capability, and chronology preview | Yes |
| `/cv` | PDF access and readable employment timeline | Yes |
| `/portfolio` | WorkSet-driven archive gallery and filtering surface | Yes |
| `/portfolio/:slug` | Dedicated project detail route with gallery, lightbox, and prev/next navigation | Yes |
| `/contact` | Professional contact page with live-ready form delivery | Yes |

### Personal shell

| Route | Purpose | Indexed |
| --- | --- | --- |
| `/home` | Personal landing page for channels and supporter paths | No |
| `/watch` | Featured latest-video page hydrated from a server-side YouTube feed, with a clean provider seam for later migration | No |
| `/donate` | Live Stripe and PayPal support page with hosted checkout, PayPal approval redirect, and graceful fallback handling | No |

## SEO and metadata split

- Professional routes use standard indexable metadata.
- Personal routes use `noindex, nofollow, noarchive`.
- Personal routes still render Open Graph and Twitter preview metadata for link sharing.
- `public/robots.txt` and `public/_headers` enforce the noindex split for `/home`, `/watch`, and `/donate`.

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

Public page visits beacon to this repo's `POST /api/track/page-visit` endpoint. That Pages Function forwards sanitized page-visit metadata server-side to DanielClancy-Admin analytics ingest when the analytics URL/secret are configured. The browser never receives the analytics ingest secret, and forwarding failures do not block page rendering.

## Public login modal and auth origin

- The personal-shell account widget opens a polished login/signup lightbox modal branded with `assets/logos/logo.webp`, GitHub, Google, Twitter/X, and collapsed email/password sections.
- Sign in and Create account modes share the OAuth entry flow because provider login/signup both start through the same admin auth origin.
- The public site does not verify admin passwords in browser code. Email/password and OAuth requests are sent to the DanielClancy-Admin Cloudflare Pages Functions auth origin.
- The modal does not render or require Cloudflare Turnstile for login, signup, or OAuth start. Turnstile is isolated to the public contact form only.
- Email/password signup is scaffolded only. Until durable account storage exists, attempts return a clear storage-required message and do not store passwords client-side.
- Public session-aware content remains future work. Signing in on the public site must not grant admin dashboard access unless the server-side admin session says the account is admin.
- The surfaced modal copy stays user-facing and does not expose internal env/provider setup notes.
- Admin dashboard action/link target: `https://admin.danielclancy.net`.

Public build-time env:

- `VITE_DC_AUTH_ORIGIN` - expected `https://admin.danielclancy.net`
- `VITE_ADMIN_PUBLIC_SITE_DATA_URL` - optional sanitized public CMS export endpoint, recommended `https://admin.danielclancy.net/api/public/site-data`

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
- Provider phase: YouTube first, with a normalized response shape ready for a later Rumble-backed swap
- Server-only env usage:
  - `YOUTUBE_API_KEY_DANIEL`
  - `YOUTUBE_CHANNEL_ID_DANIEL`
- Channel identifier used now: the stable channel ID from `YOUTUBE_CHANNEL_ID_DANIEL`
- Fallback behavior: if env/runtime or the upstream API is unavailable, `/watch` keeps its static share metadata, shows a polished fallback hero/state, and avoids exposing any secret in the client bundle

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

- Display: `assets/fonts/Recharge-Bold.otf`
- Body: `assets/fonts/SuiGeneris-Regular.otf`
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

The public site fetches only the sanitized public endpoint. It does not call `/api/admin/cms/*`, does not require an admin session, and does not receive account registry, auth/session, secret, KV, or overlay internals. If the env var is missing, fetch fails, the response is invalid, or a collection is missing, the app renders from the committed fallback model and safely fills missing live rows from fallback data.

The public client uses `cache: "no-store"` for runtime fetches and preserves internal source metadata: `source`, `revision`, `publishedAt`, `generatedAt`, `usingFallback`, and a safe error summary. Development builds log a compact diagnostic when the live endpoint is missing, loaded, or unavailable; production builds do not add noisy console output.

The normalized model preserves legacy project fields while accepting admin public fields such as `thumbnailPath`, `heroImage`, ordered `galleryPaths`, `documentPath`, `companyId`/`companyName`, `clientName`/`clientLabel`, `platformIds`, and `platformLabels`. Portfolio cards use `thumbnailPath` first, project detail uses `heroImage` or the first ordered gallery image, gallery ordering follows configured `galleryPaths`, company/studio displays as a text chip, and platform/software icons resolve to full-color SVG logo assets where available.

### Public fallback rebuild

Use `npm run data:rebuild` after Admin manifests change. The script reads, in order, the live URL from `VITE_ADMIN_PUBLIC_SITE_DATA_URL` when configured or local Admin manifests from `../DanielClancy-Admin`, then writes `src/data/public-site-fallback.generated.json`. `npm run data:check` reports stale generated fallback data without writing it. `npm run build:with-data` rebuilds the fallback then runs the normal build.

Public edits show on DanielClancy.net after Admin Save/Sync, Admin Publish site data, and a public refresh. Redeploy the public site only when `VITE_ADMIN_PUBLIC_SITE_DATA_URL`, committed fallback data, rendering code, or public assets changed.

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
  - `src/components/PortfolioMediaGallery.tsx`
  - `src/content/brandAssets.ts`
  - `src/content/workSetPortfolio.ts`
  - `src/data/public-site-fallback.generated.json`
  - `src/data/public-site-fallback.ts`
  - `src/lib/publicSiteData.tsx`
  - `src/lib/watchFeed.ts`
  - `src/lib/portfolio.ts`
- Pages:
  - `src/pages/HomePage.tsx`
  - `src/pages/CvPage.tsx`
  - `src/pages/PortfolioPage.tsx`
  - `src/pages/PortfolioDetailPage.tsx`
  - `src/pages/ContactPage.tsx`
  - `src/pages/PersonalHomePage.tsx`
  - `src/pages/WatchPage.tsx`
  - `src/pages/DonatePage.tsx`
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
│  │  └─ turnstile.js
│  └─ api/
│     ├─ contact.js
│     ├─ donate/
│     │  ├─ session.js
│     │  └─ webhook.js
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
│  │  └─ PageVisitBeacon.tsx
│  ├─ content/
│  ├─ data/
│  │  ├─ public-site-fallback.generated.json
│  │  └─ public-site-fallback.ts
│  ├─ lib/
│  │  ├─ donate.ts
│  │  ├─ portfolio.ts
│  │  ├─ publicSiteData.tsx
│  │  ├─ turnstile.tsx
│  │  └─ watchFeed.ts
│  ├─ pages/
│  └─ styles/global.css
├─ tests/
│  └─ public-site-data-client.test.mjs
├─ tools/
│  └─ rebuild-public-fallback.mjs
├─ .env.example
├─ BUMP_NOTES.md
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
- Potential media-bundle optimisation if the full local WorkSet asset set proves too heavy for final deployment targets
