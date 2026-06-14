CURRENT VER= v0.1.2-beta / PENDING VER= v1.0

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
