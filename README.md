# DanielClancy

Professional public-site repository for `DanielClancy.net`, rebuilt as a static-first Cloudflare Pages front end focused on CV review, portfolio assessment, and employer-facing presentation.

## Project purpose

This repository holds the public website foundation for Daniel Clancy's professional drafting and design presence. The first milestone rebuilds the current Wix site into a cleaner and more maintainable front end without introducing the admin/dashboard layer yet.

## Audience and presentation goals

- Primary audience: recruiters, hiring managers, collaborators, and project reviewers.
- Presentation goal: professional, restrained, dark, and credible rather than casual or social-first.
- Content goal: truthful first-pass migration from the current live site and locally exported Wix source materials.

## Deployment target

- Hosting target: Cloudflare Pages
- Rendering model: static-friendly Vite SPA
- Routing support: `public/_redirects`
- SEO handling for hidden utility routes: `public/robots.txt` and `public/_headers`

## Route map

| Route | Purpose | Indexed |
| --- | --- | --- |
| `/` | Employer-facing landing page with summary, capabilities, experience snapshot, and featured work. | Yes |
| `/cv` | Downloadable CV access and employment timeline. | Yes |
| `/portfolio` | Curated first-pass project showcase. | Yes |
| `/contact` | Direct contact details and form scaffold. | Yes |
| `/watch` | Hidden utility/social-media scaffold for future channel integration. | No |
| `/donate` | Hidden utility support-page scaffold for future Stripe/PayPal flows. | No |

## Local run instructions

### Quick launch

- Double-click `run-local.cmd`
- Or run `.\run-local.ps1` from PowerShell

### Manual

```powershell
npm install
npm run dev -- --host
```

### Build validation

```powershell
npm run build
```

## Content and data sources

- Live site reference:
  - `https://www.danielclancy.net/`
  - `https://www.danielclancy.net/cv`
  - `https://www.danielclancy.net/portfolio`
  - `https://www.danielclancy.net/contact`
- Local Wix exports:
  - `cmsdata/wix/collection-tables/Employment+History.csv`
  - `cmsdata/wix/collection-tables/Design+Portfiolo.csv`
  - `cmsdata/wix/cv/Daniel_Clancy_CV_2026.pdf`
  - `cmsdata/wix/portfolio/`

## Font and asset notes

- Titles: `assets/fonts/Recharge-Bold.otf`
- Body/subtitles: `assets/fonts/SuiGeneris-Regular.otf`
- Monospace/data UI: `assets/fonts/mono/SUSEMono-Variable.ttf`
- Build-wired public copies live in `public/assets/fonts/`
- Selected portfolio source images are copied into `public/media/portfolio/` for static deployment compatibility

## Hidden-route separation

- `/watch` and `/donate` are intentionally excluded from the primary navigation.
- They are scaffolded as separate-purpose utility pages rather than part of the employer-facing experience.
- `robots.txt` disallows them.
- `_headers` applies `X-Robots-Tag: noindex, nofollow, noarchive`.

## Repo relationship to future admin work

- This repository is the public website only.
- Admin or CMS ownership should remain separate from the public front end.
- The dashboard/admin implementation is expected to live in the separate admin repository and connect later through a controlled content workflow.

## Repository tree

```text
DanielClancy/
├─ assets/
│  ├─ fonts/
│  ├─ icons/
│  └─ logos/
├─ cmsdata/
│  ├─ cmsdata-README.md
│  └─ wix/
│     ├─ collection-tables/
│     ├─ cv/
│     └─ portfolio/
├─ docs/
│  └─ migration-notes.md
├─ public/
│  ├─ assets/fonts/
│  ├─ docs/Daniel_Clancy_CV_2026.pdf
│  ├─ media/portfolio/
│  ├─ _headers
│  ├─ _redirects
│  ├─ favicon.ico
│  └─ robots.txt
├─ src/
│  ├─ app/App.tsx
│  ├─ components/
│  ├─ content/siteContent.ts
│  ├─ pages/
│  └─ styles/global.css
├─ .env.example
├─ .gitignore
├─ BUMP_NOTES.md
├─ index.html
├─ package.json
├─ run-local.cmd
├─ run-local.ps1
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts
```

## Current milestone scope

- Production-ready public scaffold for Cloudflare Pages
- Shared theme tokens and layout system
- First-pass home, CV, portfolio, and contact routes
- Hidden utility scaffolds for `/watch` and `/donate`
- Local launcher scripts
- Migration notes and bump notes

## Deferred items

- Full portfolio migration and richer filtering
- Contact form delivery logic
- YouTube ingestion on `/watch`
- Stripe and PayPal integration on `/donate`
- Public/admin content workflow integration
