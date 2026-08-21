# DanielClancy.net — Professional Homepage POC v3.2

This folder is a **visual proof of concept only** for the professional DanielClancy.net homepage. It is intended to be saved in the DanielClancy repository as `/propocv3` and used as an implementation reference during the next local Codex task.

## Contents

- `index.html` — self-contained responsive homepage proof of concept with dark/light theme switching.
- `reference/Daniel_Clancy_CV_2026.pdf` — untouched current dark CV supplied for reference.
- `reference/Daniel_Clancy_CV_2026_Light.pdf` — untouched current light CV supplied for reference.
- `DESIGN_NOTES.md` — design rationale, v3.2 review amendments, and implementation boundaries.

## Use

Open `index.html` directly in a modern browser. No build step or internet connection is required.

## v3.2 review amendment

The header branding now uses the same display-typography language as the rest of the POC instead of relying on the previous full image wordmark. The existing brand mark is retained, while the name, role, and discipline line are rendered as live type so the header reads consistently with the page. Exact production font files/families remain intentionally unspecified here and will be supplied during the Codex implementation step.

Major content-section transitions now use a restrained 1px divider treatment with low-contrast, softly faded ends. This is intended to mirror the existing live-site section-line language and prevent the alternating dark/deep surfaces from reading as abrupt hard cuts.

## Boundary

This POC does not alter the production repositories, source data, CV wording, portfolio records, routes, or Cloudflare Pages configuration. The existing application data and repository assets remain authoritative during implementation.


## Header branding v3.2
- Header identity now mirrors the hero-title treatment: stacked DANIEL / CLANCY only.
- DANIEL is solid; CLANCY uses the matching outline treatment.
- Removed the former Design Consultant and discipline subtitle lines from the header to keep the identity compact and consistent with the supplied mock-up.
