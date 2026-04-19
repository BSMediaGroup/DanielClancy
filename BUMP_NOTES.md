CURRENT VER= 0.1.4-alpha / PENDING VER= 0.1.5-alpha

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

## 0.1.3-alpha

### Technical

- Audited the retained structural, ACCE, and unsorted Wix portfolio materials and added a tranche-specific migration note in `docs/portfolio-tranche-2-audit.md`.
- Expanded the portfolio content model with optional project-family labels, documentation types, source-confidence markers, and evidence-asset arrays.
- Promoted four additional source-verifiable archive entries from the retained ACCE, GHD, and unsorted sheet exports while keeping metadata conservative.
- Reworked `/portfolio` to support project-family filtering, grouped archive sections by family, stronger detail metadata, and inline evidence-strip presentation.
- Curated the home-page selected-work strip so it better represents the broader archive without overloading the landing page.
- Reduced oversized shared title scaling and tightened responsive handling for archive controls, detail blocks, and evidence cards.
- Copied tranche-2 verified sheet images into `public/media/portfolio/` for static hosting compatibility.
- Bumped the package version to `0.1.3-alpha`.

### Human-readable

- The public portfolio now covers more of the retained structural and unsorted source material without slipping into guesswork.
- Recruiters can see clearer project-family context, stronger metadata blocks, and sheet-level evidence for the newly promoted archive records.
- Oversized page titles have been pulled back so the site reads more like a professional portfolio and less like a draft splash screen.

## 0.1.0-alpha

### Technical

- Initialized a Cloudflare Pages-suitable `Vite + React + TypeScript` public site scaffold.
- Added routed public pages for `/`, `/cv`, `/portfolio`, and `/contact`.
- Added hidden utility routes for `/watch` and `/donate` with `noindex` handling via metadata, `robots.txt`, and Cloudflare `_headers`.
- Wired local typography assets into the site styling foundation.
- Seeded initial CV and portfolio content from local Wix-exported source materials.
- Added local launcher scripts and static-hosting support files.
- Added migration notes and a DanielClancy-specific README.

### Human-readable

- The old minimal placeholder repo is now a runnable first-pass public website foundation.
- Employers can review a cleaner home page, CV page, portfolio sample set, and contact page.
- Social and donation concepts now have isolated scaffolds without leaking into the hiring-facing experience.

## 0.1.1-alpha

### Technical

- Performed a fresh MCP/browser rescan of the live Wix pages for `/`, `/cv`, `/portfolio`, and `/contact`.
- Expanded `docs/migration-notes.md` with a refinement audit covering page order, separators, CTA patterns, density, portfolio filters, contact structure, and footer utility-link separation.
- Reworked the shared visual system in `src/styles/global.css` to introduce stronger hero framing, tonal bands, refined panel treatments, upgraded buttons, clearer typography hierarchy, and more intentional footer/secondary-route handling.
- Refined `HomePage`, `CvPage`, `PortfolioPage`, and `ContactPage` to better reflect the live site's structure and rhythm while remaining modernized and easier to maintain.
- Lightly aligned `/watch` and `/donate` to the improved global system without changing their hidden utility role or adding integrations.
- Bumped the package version to `0.1.1-alpha`.

### Human-readable

- The public site now feels materially closer to the live DanielClancy.net composition instead of a generic first-pass portfolio scaffold.
- The home page places stronger emphasis on CV access, employment history, software framing, and curated work samples.
- The CV page reads more like a polished recruiter-facing document hub.
- The portfolio page now presents the work as a curated documentation set with deliberate static filter treatment and a clearer disclaimer boundary.
- The contact page keeps the live site's directness while feeling more finished and premium.

## 0.1.2-alpha

### Technical

- Expanded the portfolio content layer from a short featured list into a richer archive schema with IDs, studio metadata, subtype tags, sector/location fields, source references, source-file lists, and sensitivity notes.
- Surfaced additional archive entries from the retained Wix materials, including more UPSS packages and separate Curtin Creative Quarter concept records.
- Rebuilt `/portfolio` around client-side archive controls, filter chips, featured evidence cards, grouped archive sections, and an inline detail panel for project inspection.
- Extended `src/styles/global.css` with archive-specific layout rules and responsive refinements affecting Home, Portfolio, CV, Contact, header navigation, filter wrapping, and footer balance.
- Expanded `docs/migration-notes.md` with a portfolio-source audit covering source folders, grouping opportunities, repeated disciplines, promoted entries, and deferred archive material.
- Bumped the package version to `0.1.2-alpha`.

### Human-readable

- The portfolio now reads as a broader professional archive instead of a small teaser gallery.
- Recruiters can inspect more projects, see clearer metadata, and understand which materials come from drawing sets versus concept exports.
- Mobile and tablet handling is tighter around archive filters, project cards, footer balance, and stacked call-to-action layouts.

### Planned next

- Add the next tranche of source-verified structural and unsorted archive material after a stricter metadata pass.
- Add real contact-form delivery.
- Consider lightweight deep-linked project routes only if they materially improve employer review.
- Define the handoff boundary between this public site and the future admin/dashboard workflow.
