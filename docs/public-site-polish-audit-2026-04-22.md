# DanielClancy Public-Site Polish Audit

Date: 2026-04-22

## Inspection basis

- Current local Vite build reviewed at `http://127.0.0.1:4177/`
- Current route/content/style implementation reviewed in `src/`
- Current local logos, software marks, portraits, and share-image assets reviewed in `assets/` and `public/`
- StreamSuites dashboard reviewed as read-only reference for the personal-header user widget pattern in `G:\StreamSuites-Dashboard\docs\assets\css\ss-profile-hovercard.css` and related profile-card markup
- User-provided problem statement for layout dead space, archive confusion, public-copy cleanup, and professional/personal surface leakage treated as the active screenshot-note equivalent for this milestone

## Problems being corrected now

### Public copy and messaging

- Professional routes still expose internal implementation language such as:
  - "recruiter-facing"
  - "employer-facing"
  - "intentionally isolated"
  - "future foundation"
  - "public build"
  - "scaffold" / "placeholder" style copy
- `/watch`, `/donate`, and `/contact` currently describe implementation state rather than presenting a real public-facing experience
- README and bump notes currently describe the site too much as a workshop build instead of an authored DanielClancy public site

### Shell and navigation leakage

- The app currently uses one shared `SiteLayout` for professional and personal routes
- The shared footer leaks `/watch` and `/donate` into the professional shell
- Professional footer messaging currently reads like internal segmentation notes rather than public site content
- Personal routes inherit professional shell chrome instead of using a distinct content-facing shell

### Layout and composition

- Professional home hero leaves large dead space and underuses the first viewport
- Home page section rhythm drops too sharply from hero into archive, software, and contact blocks
- CV page presents true information, but some framing copy is still internal and the chronology could read more clearly
- Portfolio archive uses a dense control cluster and an inline detail panel that makes the page feel heavy and confusing
- Watch and donate pages read as unfinished utility placeholders instead of production-ready personal surfaces

### Missing functionality

- No dedicated `/portfolio/:slug` detail route yet
- Contact form is not wired to send mail
- Personal-route metadata is noindex-only but needs cleaner share-preview handling
- Gallery/detail media loading needs a polished placeholder treatment

## Publicly inappropriate/internal copy targeted for removal or replacement

- "This route is intentionally isolated..."
- "The public site now opens with stronger composition..."
- "employer-facing"
- "recruiter-focused" / "recruiter-facing"
- "future foundation"
- "delivery wiring is intentionally deferred..."
- "hidden utility route"
- similar public text that explains the build process rather than Daniel Clancy's site

## Split-shell architecture

### Professional shell

- Routes:
  - `/`
  - `/cv`
  - `/portfolio`
  - `/portfolio/:slug`
  - `/contact`
- Own header and footer
- SEO-indexed
- No links or explanatory references to `/home`, `/watch`, or `/donate`
- Positioning: professional review, CV, selected work, and contact

### Personal shell

- Routes:
  - `/home`
  - `/watch`
  - `/donate`
- Own header and footer
- Own subtitle, navigation, and title-link target
- Noindex / nofollow treatment retained
- Open Graph and Twitter preview metadata still present for link sharing
- Includes a non-functional but intentional login/member widget pattern inspired by the StreamSuites dashboard profile-card treatment

## Isolation rules

- Professional pages do not advertise or expose the personal routes
- Personal pages may acknowledge Daniel's wider studio/professional presence in a restrained way, but they remain visually and structurally separate from the professional shell
- The two shells can share the same font system and premium dark design language, but they should not share copy blocks, nav items, footer utility lists, or route explanations

## Implement now

- Public-copy cleanup across all affected routes
- Two-shell routing and layout split
- Professional header/footer and personal header/footer implementations
- `/home` personal landing page
- Professional home/CV/portfolio/contact redesign pass
- Dedicated `/portfolio/:slug` detail routes
- Gallery/detail image skeleton and shimmer loading treatment
- Watch and donate redesign with future-integration seams
- Contact form delivery via Cloudflare Pages Functions using server-side Resend
- Metadata split for SEO vs noindex/share-preview handling
- README and milestone-note updates

## Defer to later deployment/integration phase

- Cloudflare deployment and DNS cutover
- Provisioning real Cloudflare dashboard secrets
- Live Stripe / PayPal payment wiring
- Live YouTube / Rumble ingestion
- Admin CMS integration
- Final production analytics/observability pass
- Hard abuse/rate-limiting beyond a sensible first-pass contact guardrail
