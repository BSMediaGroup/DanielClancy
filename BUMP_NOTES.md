CURRENT VER= 0.3.1-alpha / PENDING VER= 0.3.2-alpha

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
