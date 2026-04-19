# DanielClancy Aesthetic Overhaul Audit

Date: 2026-04-19

Reviewed with browser tooling before implementation:

- `https://www.amajaying.me/`
- `https://www.danielclancy.net/`

Purpose:

- record which traits from the reference site are being adapted
- record which behaviours are intentionally rejected
- define the DanielClancy-specific interpretation for a recruiter-facing architecture and drafting portfolio
- confirm that the DanielClancy font system is preserved

## Font-preservation lock

This overhaul preserves the existing DanielClancy font system exactly as the canonical site identity:

- titles / primary display typography: `assets/fonts/Recharge-Bold.otf`
- body / subtitles: `assets/fonts/SuiGeneris-Regular.otf`
- monospace / system / data contexts: `assets/fonts/mono/SUSEMono-Variable.ttf`

What changes:

- type scale
- tracking
- spacing
- where each existing font is used
- hierarchy and rhythm

What does not change:

- no replacement display font
- no replacement body font
- no new core font identity inspired by the reference site

## Aesthetic traits being borrowed from the reference

- stronger first-viewport authorship with a more poster-like hero composition
- clearer contrast between large headline moments and denser factual content
- more deliberate negative space so the page feels composed instead of packed
- editorial section choreography rather than repeating one card pattern everywhere
- restrained framing devices such as soft grids, ruled lines, overlays, and layered image planes
- a more memorable CTA rhythm with fewer but more intentional actions
- stronger visual distinction between featured work and background documentation
- cleaner mobile collapse with hierarchy preserved instead of merely stacked

## Interaction and presentation patterns intentionally rejected

These reference-site behaviours or tendencies should not be copied into DanielClancy.net because they would weaken recruiter usability or professional tone:

- playful or novelty-heavy motion as a primary experience
- ambiguous or hidden navigation
- personality-forward copy that buries qualifications
- decorative chips or floating UI used where plain evidence is clearer
- image-first storytelling that suppresses chronology, software, or document context
- overscaled hero theatre that delays access to CV, portfolio, and contact actions
- vague product-style claims that are less credible than direct drafting/documentation language

## DanielClancy-specific adaptation

The DanielClancy version should feel premium and more art-directed, but still operate like a professional review document.

Therefore the redesign adapts the inspiration like this:

- hero becomes more editorial and portrait-led, but still foregrounds role, years of experience, and the CV / portfolio path
- featured work uses stronger art direction and larger image treatment, but project metadata remains factual and scannable
- the CV route is treated like a digital casefile rather than a plain list, while keeping chronology easy to review
- portfolio controls stay obvious and static-hosting friendly instead of becoming experimental
- contact remains direct and low-friction, with details visible immediately
- `/watch` and `/donate` remain visually related but clearly secondary and outside the main hiring flow

## Inspiration versus copy

This redesign is intended to be inspired by the reference site's composition language, not to copy its layout, content model, or interaction blueprint.

Borrowed:

- authored spacing
- stronger compositional confidence
- layered image/text balance
- more premium visual pacing
- cleaner, more memorable section transitions

Not copied:

- exact page structure
- exact component layout
- reference-site typography
- reference-site copy style
- playful product-designer tone
- social/creative-personality emphasis over recruiter clarity

## DanielClancy design thesis for this milestone

Visual thesis:

- a polished editorial-industrial portfolio that feels closer to a premium architecture casefile than a generic dark-theme website

Content plan:

- hero: identity, credibility, direct review actions
- support: selected work and software/documentation framing
- detail: employment chronology and archive structure
- final CTA: direct recruiter contact

Interaction thesis:

- restrained reveal motion on first load
- hover states that sharpen affordance rather than entertain
- light layered depth in hero/media surfaces, kept fast and Cloudflare Pages friendly

## Expected outcome

After implementation, DanielClancy.net should feel materially closer to `amajaying.me` in aesthetic sophistication while remaining clearly Daniel Clancy's own employer-facing site:

- more premium
- more authored
- more editorial
- more memorable
- still readable
- still credible
- still maintainable
