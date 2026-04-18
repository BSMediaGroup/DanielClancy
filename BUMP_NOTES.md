CURRENT VER= 0.1.1-alpha / PENDING VER= 0.1.2-alpha

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

### Planned next

- Expand portfolio coverage and improve project-level categorisation.
- Add real contact-form delivery.
- Add deeper browser verification across responsive breakpoints and final copy polish.
- Define the handoff boundary between this public site and the future admin/dashboard workflow.
