# DanielClancy.net Migration Notes

## Live source pages scanned

- `https://www.danielclancy.net/`
- `https://www.danielclancy.net/cv`
- `https://www.danielclancy.net/portfolio`
- `https://www.danielclancy.net/contact`

## 2026-04-19 refinement rescan audit

Browser/MCP rescan completed against the current live Wix pages before this refinement pass.

### Observed page structure and ordering

- `/`
  - Compact top header with wordmark and tight pill navigation.
  - Hero/identity band with a portrait-led composition, long summary paragraph, and `DOWNLOAD CV` CTA.
  - Narrow draft-status separator strip repeated between major content zones.
  - Software competency strip presented as icon tiles in one row.
  - Employment-history section is the dominant body content and appears before portfolio sampling.
  - Lower-page pagination controls and a sparse footer/utility area.
- `/cv`
  - Short title band with `CV - 2025` and download actions for Word/PDF.
  - Repeated divider strip.
  - Long single-column stack of employment cards with logo-right composition.
  - Footer repeats direct contact and secondary utility links.
- `/portfolio`
  - Header band with page title.
  - Static filter area split into software tags and discipline tags.
  - Disclaimer line placed near the filter controls rather than buried at the bottom.
  - Dense gallery of project tiles with image-first hierarchy and lightweight text metadata.
  - Footer again carries direct contact plus secondary utility links.
- `/contact`
  - Large centered title/contact block.
  - Sparse, direct contact details above the form.
  - Clean form stack with four fields and one submit action.
  - Large negative space below the contact block, then footer.

### Recurring visual motifs

- Dark industrial background with brushed-metal and corrugated-sheet references.
- Narrow metallic separator strips between zones.
- Rounded pill navigation and pill CTAs with thin outline treatment.
- Heavy use of uppercase techno-display typography for titles and labels.
- Framed dark panels sitting over textured dark backgrounds rather than flat color blocks.
- Brightened top bands and darker body fields, producing a top-lit industrial look.

### Repeated separators and background treatments

- Metallic header/hero bands sit over darker black body zones.
- Thin repeated strip graphics separate hero, software, timeline, and footer areas.
- Backgrounds alternate between brighter metal texture and darker matte body panels.
- The live site uses repetition more than variety: same strip treatment, same rounded shells, same dense black body fields.

### CTA patterns

- Primary employer-facing CTA is CV download.
- Portfolio uses project-title links more than oversized CTA blocks.
- Contact page is direct: details first, form second, no marketing-heavy callouts.
- Footer utilities are present but visually secondary to the hiring flow.

### Section density and spacing tendencies

- The live site is compact and vertically dense at the top.
- Mid-page content often shifts into very large dark fields with comparatively little copy.
- Cards are tightly packed with shallow padding and narrow spacing between stacked items.
- Important sections are distinguished more by strip separators and tone changes than by generous whitespace.

### Portfolio and filter behaviour

- Filters appear static and category-based rather than complex or faceted.
- Software and discipline filters are visually separated into two groups.
- Project cards are gallery-first; metadata is concise.
- A security/IP disclaimer is always visible near the gallery controls.

### Contact-page structure

- Direct contact block: name, email, phone, postal address.
- Form fields: name, email, company, message.
- One clear submit action.
- Sparse composition with strong emphasis on immediate reach-out details.

### Footer and hidden-link separation

- Main header navigation remains limited to `HOME`, `CV`, `PORTFOLIO`, and `CONTACT`.
- Footer/utility area includes secondary links such as `MEMBERS`, `WATCH`, and `DONATE`.
- The live site mixes employer-facing content and utility links in the footer, but the rebuild should keep these utilities more restrained and clearly secondary.

### Refinement implications for this repo

- Keep the live site's dark industrial identity, divider rhythm, and CV-first credibility cues.
- Modernize the composition with better hierarchy, spacing discipline, and more intentional asymmetry.
- Preserve the employer-facing/public split by keeping `/watch` and `/donate` out of the primary nav and visually subordinate in the footer.
- Keep portfolio filters static-friendly for now, but style them as deliberate controls rather than placeholder chips.
- Use layered panels, tonal bands, and restrained texture instead of cloning the Wix textures literally.

## Tone and presentation observations

- The live site is dark, restrained, and industrial rather than playful.
- The strongest employer-facing signals are experience depth, software familiarity, and project evidence.
- The existing Wix structure is functional but visually draft-like and repetitive, with employer-facing content mixed with utility links in the footer.
- The rebuild should keep the professional seriousness while separating future personal/social utilities from hiring-focused presentation.

## Route mapping

| Wix route | Rebuild route | Notes |
| --- | --- | --- |
| `/` | `/` | Maintains experience summary, software emphasis, featured work, and contact CTA. |
| `/cv` | `/cv` | Keeps downloadable CV access and employment timeline. |
| `/portfolio` | `/portfolio` | Rebuilt as curated project showcase with room for later filtering and detail routes. |
| `/contact` | `/contact` | Keeps direct contact details and a presentable enquiry form scaffold. |
| Footer utility links | `/watch`, `/donate` | Rebuilt as intentionally hidden utility routes, excluded from primary navigation and SEO. |

## Local source material used now

- `cmsdata/wix/collection-tables/Employment+History.csv`
- `cmsdata/wix/collection-tables/Design+Portfiolo.csv`
- `cmsdata/wix/cv/Daniel_Clancy_CV_2026.pdf`
- Selected images copied from:
  - `cmsdata/wix/portfolio/bimset/`
  - `cmsdata/wix/portfolio/cadset/`
  - `cmsdata/wix/portfolio/skpset/`

## Migrated in this milestone

- Route scaffold for all required public and hidden pages.
- Shared visual system with local font assets wired into the app.
- Truthful first-pass employment timeline derived from the Wix export table.
- Curated featured portfolio set using local source imagery and live-site project framing.
- Contact details, local launcher scripts, README, bump notes, and Cloudflare Pages static-hosting support files.

## Deferred from this milestone

- Exhaustive portfolio migration and richer filter logic.
- Full CV formatting parity with DOCX support.
- Contact form delivery integration.
- CMS/admin dashboard and editing workflows.
- YouTube ingestion on `/watch`.
- Stripe or PayPal implementation on `/donate`.

## Hidden route separation

- `/watch` and `/donate` are not included in the main site navigation.
- `public/robots.txt` explicitly disallows them.
- `public/_headers` applies `X-Robots-Tag: noindex, nofollow, noarchive` to both routes.
- Their tone, copy, and UI treatment are intentionally separate from the employer-facing pages.

## Future CMS / admin notes

- This repo is the public Cloudflare Pages front end only.
- Admin/dashboard work should stay in the separate admin repository and be integrated later through a controlled content pipeline.
- Raw Wix export folders remain in place as source reference material and should not be removed until a replacement content workflow is proven.
