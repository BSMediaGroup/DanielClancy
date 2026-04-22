# DanielClancy

Public-site repository for `DanielClancy.net`, built as a Cloudflare Pages-friendly Vite + React + TypeScript front end.

## Purpose

This repo holds the public-facing Daniel Clancy website only. It now uses a deliberate split between:

- a professional shell for CV, portfolio, and contact review
- a personal shell for content, support, and future member-facing utilities

The visual system keeps the existing DanielClancy font pairing while tightening hierarchy, spacing, route separation, and public copy quality.

The portfolio/archive layer now rebuilds from the canonical `cmsdata/wix/collection-tables/WorkSet.csv` export instead of the previous hand-maintained project array.

## Route architecture

### Professional shell

| Route | Purpose | Indexed |
| --- | --- | --- |
| `/` | Professional landing page with selected work, software capability, and chronology preview | Yes |
| `/cv` | PDF access and readable employment timeline | Yes |
| `/portfolio` | WorkSet-driven archive gallery and filtering surface | Yes |
| `/portfolio/:slug` | Dedicated project detail route with gallery, lightbox, and prev/next navigation | Yes |
| `/contact` | Professional contact page with live-ready form delivery | Yes |

### Personal shell

| Route | Purpose | Indexed |
| --- | --- | --- |
| `/home` | Personal landing page for channels and supporter paths | No |
| `/watch` | Featured video layout and future channel-ingestion seam | No |
| `/donate` | Future-ready support page for hosted and direct payments | No |

## SEO and metadata split

- Professional routes use standard indexable metadata.
- Personal routes use `noindex, nofollow, noarchive`.
- Personal routes still render Open Graph and Twitter preview metadata for link sharing.
- `public/robots.txt` and `public/_headers` enforce the noindex split for `/home`, `/watch`, and `/donate`.

## Contact delivery

- UI route: `/contact`
- Server endpoint: `functions/api/contact.js`
- Delivery target:
  - To: `mail@danielclancy.net`
  - CC: `daniel@brainstream.media`
- Delivery provider: Resend via server-side env usage
- Local preview behavior: explicit safe mock success if the Pages Function env/runtime is not mounted

Environment keys already used:

- `RESEND_API_KEY`
- `MAIL_FROM`
- `MAIL_REPLY_TO`

## Fonts and assets

- Display: `assets/fonts/Recharge-Bold.otf`
- Body: `assets/fonts/SuiGeneris-Regular.otf`
- Monospace UI: `assets/fonts/mono/SUSEMono-Variable.ttf`
- Public CV: `public/docs/Daniel_Clancy_CV_2026.pdf`
- Canonical portfolio source: `cmsdata/wix/collection-tables/WorkSet.csv`
- Canonical portfolio media root: `cmsdata/wix/portfolio/`
- Local preview-only fallbacks for genuinely missing WorkSet exports: `public/media/portfolio/`
- Logo/social/software/company marks: `assets/logos/` and `assets/icons/`

## Key implementation files

- Routing: `src/app/App.tsx`
- Shells:
  - `src/components/ProfessionalShell.tsx`
  - `src/components/PersonalShell.tsx`
- Shared brand/media helpers:
  - `src/components/SiteBrand.tsx`
  - `src/components/MediaFrame.tsx`
  - `src/components/CapabilityMeter.tsx`
  - `src/components/CompanyLogoMark.tsx`
  - `src/components/ContactMap.tsx`
  - `src/components/PortfolioMediaGallery.tsx`
  - `src/content/brandAssets.ts`
  - `src/content/workSetPortfolio.ts`
  - `src/lib/portfolio.ts`
- Pages:
  - `src/pages/HomePage.tsx`
  - `src/pages/CvPage.tsx`
  - `src/pages/PortfolioPage.tsx`
  - `src/pages/PortfolioDetailPage.tsx`
  - `src/pages/ContactPage.tsx`
  - `src/pages/PersonalHomePage.tsx`
  - `src/pages/WatchPage.tsx`
  - `src/pages/DonatePage.tsx`
- Global styling: `src/styles/global.css`
- Audit notes:
  - `docs/public-site-polish-audit-2026-04-22.md`
  - `docs/migration-notes.md`
  - `docs/portfolio-tranche-2-audit.md`
  - `docs/amajaying-inspired-overhaul-audit.md`

## Local development

### Quick launch

- `run-local.cmd`
- `.\run-local.ps1`

### Manual

```powershell
npm install
npm run dev -- --host
```

### Validation

```powershell
npm run check
npm run build
npm run preview -- --host
```

## Repository tree

```text
DanielClancy/
├─ assets/
│  ├─ backgrounds/
│  ├─ fonts/
│  ├─ icons/
│  ├─ logos/
│  └─ portraits/
├─ cmsdata/
│  └─ wix/
├─ docs/
│  ├─ amajaying-inspired-overhaul-audit.md
│  ├─ migration-notes.md
│  ├─ portfolio-tranche-2-audit.md
│  └─ public-site-polish-audit-2026-04-22.md
├─ functions/
│  └─ api/
│     └─ contact.js
├─ public/
│  ├─ assets/fonts/
│  ├─ docs/
│  ├─ media/portfolio/
│  ├─ _headers
│  ├─ _redirects
│  ├─ favicon.ico
│  └─ robots.txt
├─ src/
│  ├─ app/App.tsx
│  ├─ assets.d.ts
│  ├─ vite-env.d.ts
│  ├─ components/
│  ├─ content/
│  ├─ lib/
│  ├─ pages/
│  └─ styles/global.css
├─ .env.example
├─ BUMP_NOTES.md
├─ package.json
├─ run-local.cmd
├─ run-local.ps1
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts
```

## Deferred items

- Cloudflare deployment and DNS cutover
- Live YouTube or Rumble ingestion
- Live Stripe and PayPal payment processing
- Admin-side content workflow integration
- Further archive enrichment as more source material is verified
- Potential media-bundle optimisation if the full local WorkSet asset set proves too heavy for final deployment targets
