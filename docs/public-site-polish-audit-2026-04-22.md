# DanielClancy Public-Site Refinement Audit

Date: 2026-04-22

## Inspection basis

- DanielClancy repo state reviewed locally before edits.
- Canonical project source reviewed in `cmsdata/wix/collection-tables/WorkSet.csv`.
- The user task brief and screenshot-markup notes were treated as the active markup-reference source for this pass.
- Existing portfolio gallery/detail implementation, local logo assets, and shell/header/widget components were reviewed in `src/` and `assets/`.
- StreamSuites dashboard remained reference-only for the compact personal-header account pattern and subtle glass-chip subtitle treatment.

## Final issues fixed in this pass

### Global layout and typography

- Increased the shared max-width target to 1600px.
- Reduced oversized display headings and tightened section-title scale.
- Trimmed dead space in the professional home composition without changing the established font system.

### Header and shell refinement

- Added a restrained dark glass subtitle chip to both shell headers.
- Rebuilt the personal header so the brand sits left, navigation sits to its right, and the compact account widget stays on the far right.
- Removed the decorative dot/bell artifact from the personal account widget trigger.
- Preserved the two-shell separation already established in the repo.

### Homepage and CV polish

- Reworked competence bars so they animate from zero on load, replay on hover, and add a restrained shine/glow effect.
- Converted the studios/employers preview to square logo cards using the `-0.svg` monochrome logo set for that section only.
- Moved employment-history logos on home and CV cards into a stable bottom-left placement with per-logo shape handling.
- Preserved the premium dark direction while tightening spacing and card rhythm.

### Portfolio rebuild

- Replaced the prior hand-maintained portfolio archive implementation with a canonical WorkSet-driven data module.
- Normalised project slugs, ordering, metadata, media lists, supporting PDF links, and studio/discipline/software filters from `WorkSet.csv`.
- Preserved existing richer wording only where it stayed consistent with the WorkSet record.
- Removed the obsolete hard-coded portfolio array from `src/content/siteContent.ts`; that file is now intentionally much shorter because the stale archive source was retired.

## WorkSet.csv source-of-truth rules now implemented

- `cmsdata/wix/collection-tables/WorkSet.csv` is the active public portfolio source.
- Project cards, project detail routes, ordering, and supporting metadata now derive from that canonical CSV.
- Prior enriched wording was retained only when it did not contradict title, discipline, studio, location, date, or technical-description data in the CSV.
- No stale legacy project facts remain in the active public-site data flow.

## Portfolio UX upgrades added

- Entire gallery cards are now clickable.
- Gallery cards now use a restrained hover glow.
- Individual project pages remain on `/portfolio/:slug`.
- Project detail pages now prioritise media/documentation viewing instead of a text-heavy split.
- Added:
  - collapsible details panel
  - inline prev/next gallery controls
  - pagination dots
  - lightbox mode with prev/next controls
  - previous/next project navigation
  - discreet back-to-gallery action
- Media frames now support contain-mode viewing with stable aspect-ratio handling and retained shimmer loading.

## Contact-map addition

- Added a dark Sydney CBD map surface suitable for static hosting.
- Used a branded custom marker based on `assets/logos/company-dcdesignstudio.svg`.
- Added a dark custom tooltip treatment for hover state.

## Homepage hero polish note

- Replaced the original split hero on `/` with a single full-width banner treatment using the existing striped background texture plus the required circular `assets/portraits/profileavatar.webp` portrait, refined identity stack, restrained overview line, and lighter text-link actions.
- Intentionally left everything below the hero unchanged in structure and purpose: the selected-projects section, software capability section, chronology section, footer, and all non-homepage routes still use the existing post-hero layout.
- The professional header now keeps its normal sticky structure everywhere, but on `/` only it is visually overlaid on the hero with a transparent shell at the top of the page and a scroll-driven fade back to the standard dark glass surface as the hero scroll state clears.

## WorkSet media-mapping correction note

- `cmsdata/wix/collection-tables/WorkSet.csv` was rechecked against the actual local export under `cmsdata/wix/portfolio/`, and portfolio media resolution now matches canonical WorkSet filenames back to those local Wix-exported files first.
- Confirmed mismatch types:
  - WorkSet filenames that do exist locally but only under different portfolio subfolders
  - rows where `singleImage` matched a local export even though some `imageGallery.fileName` values did not
  - rows whose WorkSet filenames were missing entirely from the local Wix export, including several image sets and some PDFs
- Genuine local-export gaps remain for several WorkSet references, including examples such as `Dawesville IGA`, `Jull Street Boundary Realignment`, `Eighth Road Land Resumption`, `Henry Street Residence`, and selected Curtin/Cockburn/Lake Joondalup/Cottesloe naming variants.
- Fallback behavior now stays local-only:
  - matched Wix-exported files from `cmsdata/wix/portfolio/` are used first
  - existing `public/media/portfolio/` previews are used only for some rows where no matched local export image exists
  - no Wix CDN media/document URL fallback remains in the runtime resolver

## Deferred to later Cloudflare/deployment/integration stage

- Cloudflare deployment and domain cutover.
- Cloudflare secrets provisioning and production email env configuration.
- Live Stripe / PayPal wiring.
- Live YouTube / Rumble ingestion.
- Admin-side CMS wiring.
- Any later asset/performance optimisation pass if the full local project-media bundle proves too heavy for the production rollout target.
