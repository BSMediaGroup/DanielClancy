# DanielClancy v1.0

Date: 2026-06-26

## Release Summary

DanielClancy v1.0 is the first stable release marker for the public DanielClancy.net website. The site remains a Cloudflare Pages-friendly Vite, React, and TypeScript public surface for Daniel Clancy's professional portfolio, CV, contact, legal, watch, and support routes.

This release does not invent or change CV, employment, company, software/platform, or project facts. Public content continues to come from source-backed fallback data and the sanitized DanielClancy-Admin public site-data endpoint when configured.

## Highlights

- Promotes public package metadata to `1.0.0`.
- Keeps professional and personal route shells separated with route-specific metadata.
- Keeps direct-route portfolio and CV rendering fallback-first, then hydrates from Admin-published public site data when configured.
- Keeps public contact, page-visit forwarding, watch feed, donation checkout, Privacy Policy, and Terms of Use routes documented in the repo.
- Adds release metadata and a focused version consistency test for the v1.0 release.

## Public Website Features Shipped

- Professional routes: `/`, `/cv`, `/work`, `/portfolio`, `/portfolio/:slug`, `/contact`, `/privacy`, and `/terms`.
- Personal routes: `/home`, `/watch`, and `/donate`, with noindex handling documented for personal surfaces.
- Contact delivery through Cloudflare Pages Functions and Resend when required server-side env vars are configured.
- Public page-visit forwarding to DanielClancy-Admin analytics ingest when the shared analytics ingest env vars are configured.
- Live Stripe and PayPal donation flow support through server-side Pages Functions, with graceful provider fallback.
- YouTube-backed `/watch` feed through a server-side feed endpoint, with the existing provider seam preserved.

## Portfolio, Project Rendering, And Data Hydration

- Portfolio archive and project detail routes render from the committed source-derived fallback model first.
- Public hydration uses the sanitized Admin endpoint only, not admin CMS or session APIs.
- Project detail lookup supports stable slugs, IDs, legacy codes, title-derived aliases, and existing path-tail aliases.
- Cards, hero images, galleries, company labels, software/platform labels, and document links normalize public-safe asset paths without exposing admin-only fields.
- `npm run data:rebuild` and `npm run data:check` remain the public fallback rebuild/check workflow after Admin manifests change.

## CV And Positions Hydration

- CV and position-related rendering uses the committed public fallback model and accepts sanitized Admin-published Companies, Platforms, and Positions collections when the public site-data endpoint is configured.
- Missing or unavailable live data does not empty the public CV/portfolio model.
- No CV, employment, company, or software/platform facts are changed by this release task.

## Admin CMS / Public Data Integration

- Public hydration expects DanielClancy-Admin to publish sanitized public site data.
- The public app reads `VITE_ADMIN_PUBLIC_SITE_DATA_URL` at build time and keeps rendering from fallback data when the endpoint is missing, unavailable, or invalid.
- Public edits appear after Admin Save/Sync, Admin Publish site data, and a public refresh. Public redeploy is only needed when env, fallback data, rendering code, public assets, or routing files change.

## Deployment Notes

- Deployment target: Cloudflare Pages for `danielclancy.net`.
- Required public build-time environment variable for live Admin hydration:
  - `VITE_ADMIN_PUBLIC_SITE_DATA_URL=https://admin.danielclancy.net/api/public/site-data`
- Contact, Turnstile, payment, watch feed, alert forwarding, and analytics forwarding env vars remain documented in `README.md`.
- `public/_redirects` keeps SPA fallback behavior for direct route loads.

## Known Limitations / Follow-Ups

- Legal pages are informational website policy pages and should receive legal review before being relied on as final legal documents.
- Hosted Cloudflare Pages should be checked after deployment for direct routes and configured public site-data hydration.
- The `/watch` provider remains YouTube-backed in this repo; any future provider migration should be handled as a separate feature task.

## Validation / Tests Summary

- Added `tests/version-consistency.test.mjs` for v1.0 release metadata and visible pre-release label checks.
- Release validation for this task includes the focused version consistency test, existing public data tests, TypeScript check, Vite production build, and `git diff --check`.
