# DanielClancy.net Migration Notes

## Live source pages scanned

- `https://www.danielclancy.net/`
- `https://www.danielclancy.net/cv`
- `https://www.danielclancy.net/portfolio`
- `https://www.danielclancy.net/contact`

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
