CURRENT VER= 0.1.2-alpha / PENDING VER= 0.1.3-alpha

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
