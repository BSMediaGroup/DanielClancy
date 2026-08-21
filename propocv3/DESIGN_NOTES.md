# Design Notes — Professional Homepage POC v3.2

## Objective

Present Daniel Clancy as an experienced multidisciplinary design consultant through a technical, employer-facing review surface. The visual language is deliberately closer to a controlled project dossier than a generic creative-agency landing page.

## Core direction

- Graphite-led dark mode and paper-led light mode, with restrained parchment and cool-steel accents.
- Strong condensed typography, drafting-grid structure, sheet references, measured linework, and document-style metadata.
- Project evidence is visually dominant. The first three records represented are Pheasants Nest, Wungong Urban Water Master Plan, and Lake Joondalup Baptist College.
- Homepage chronology is concise. `/cv` remains the complete employment record.
- No arbitrary software percentage scores are used.
- Dark and light CV editions are shown as paired, content-identical documents.

## v3.2 visual review amendments

### Header branding

- Retain the existing abstract Daniel Clancy mark.
- Do not use the previous raster wordmark typography as the visual authority for the site header.
- Render `DANIEL CLANCY` as live display typography using the same typographic system as the page headings so the header feels native to the POC.
- Keep `DESIGN CONSULTANT` and the discipline line subordinate in compact technical type.
- The final exact font family/families will be specified explicitly during the Codex implementation step; the POC uses its existing display/mono stack only as a visual placeholder.

### Section joints

- Alternating normal/deep background sections must not terminate as visually abrupt hard cuts.
- Consecutive primary sections use a single 1px low-contrast divider, constrained to the main content width and very gently faded at both ends.
- The divider is intentionally quieter than card borders and navigation accents; it should read as a precise architectural/documentation joint rather than a decorative rule.
- Preserve the existing hero/metrics framing, which already uses its own subtle line treatment.

## Production implementation boundaries

- Preserve current professional routes, real CMS/public-site data hydration, SEO behaviour, contact workflow, and Cloudflare Pages compatibility.
- Repair portfolio resolution and project routing from authoritative project records rather than hard-coding the three POC examples.
- Use existing repository brand, employer, software, portrait, and project assets where available.
- Preserve every existing CV fact and employment entry. Content changes require separate explicit approval.
- Maintain keyboard navigation, visible focus states, semantic landmarks, reduced-motion support, and responsive layouts.

## Suggested breakpoint intent

- Desktop: 1440–1920 px, split hero and evidence board, five-column discipline matrix.
- Tablet: 768–1180 px, stacked hero, two/three-column content sections.
- Mobile: 390–620 px, single-column cards, compact navigation, no horizontal overflow.


## Header branding v3.2
- Header identity now mirrors the hero-title treatment: stacked DANIEL / CLANCY only.
- DANIEL is solid; CLANCY uses the matching outline treatment.
- Removed the former Design Consultant and discipline subtitle lines from the header to keep the identity compact and consistent with the supplied mock-up.
