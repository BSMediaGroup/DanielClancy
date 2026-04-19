# Portfolio Tranche 2 Audit

Date: 2026-04-19

Purpose: source audit for the second public-site archive tranche, focused on structural, ACCE, and unsorted Wix-exported materials that were not promoted in the first archive pass.

## Folders and files reviewed

- `cmsdata/wix/portfolio/cadset/`
  - `ACCE_Page_01.jpg` through `ACCE_Page_34.jpg`
  - `32-1.jpg` through `32-8.jpg`
  - `44 (2015_11_26 08_40_25 UTC).jpg`
  - `44S (2015_11_26 08_40_25 UTC).jpg`
  - `45 (2015_11_26 08_40_25 UTC).jpg`
  - `45S (2015_11_26 08_40_25 UTC).jpg`
  - `BBALL_SHELTER-001.jpg`
  - `GENERAL - UNSORTED_Page_01.jpg` through `GENERAL - UNSORTED_Page_14.jpg`
- Supporting cross-checks:
  - `cmsdata/wix/collection-tables/Design+Portfiolo.csv`
  - `docs/migration-notes.md`

## Formats present

- JPEG sheet exports
- PDF drawing sets
- CSV table metadata
- Mixed titleblock quality ranging from clearly readable to placeholder or cropped

## Grouping opportunities discovered

- `ACCE structural archive`
  - Readable titleblock sheets exist for at least two separate projects.
  - Adjacent pages can support those records as evidence, but many pages are not safe as standalone public entries.
- `GHD buildings archive`
  - The `32-*` sheet group appears to be one coherent documentation family with readable company and project-title metadata on at least one sheet.
- `Urbis public-domain details`
  - The unsorted export contains at least one self-contained public-domain detail sheet that can stand as documented evidence without reconstructing the full project.
- `Deferred generic / placeholder sheets`
  - Several unsorted or generic sheets look useful as archive residue but remain too incomplete for truthful public promotion.

## Promoted now

### Lake Joondalup Baptist College - Year 4 Classrooms

- Source files:
  - `cmsdata/wix/portfolio/cadset/ACCE_Page_17.jpg`
  - supporting: `ACCE_Page_16.jpg`, `ACCE_Page_18.jpg`
- Why usable now:
  - readable titleblock
  - readable project name
  - readable location
  - readable drawing title
  - readable date
  - readable drafter attribution
- Public framing used:
  - structural detail-sheet archive record
- Confidence:
  - High

### Proposed Rowell Residence

- Source files:
  - `cmsdata/wix/portfolio/cadset/ACCE_Page_34.jpg`
  - supporting: `ACCE_Page_33.jpg`
- Why usable now:
  - readable titleblock
  - readable project name
  - readable address/location
  - readable drawing title
  - readable date
  - readable architect/company references
- Public framing used:
  - structural roof-details archive record
- Confidence:
  - High

### South Perth Promenade

- Source files:
  - `cmsdata/wix/portfolio/cadset/GENERAL - UNSORTED_Page_11.jpg`
- Why usable now:
  - readable titleblock
  - readable client
  - readable project name
  - readable location
  - readable drawing title
- Public framing used:
  - public-domain detail-sheet evidence only
- Confidence:
  - High

### BCP / Laboratory & Storage Facility

- Source files:
  - `cmsdata/wix/portfolio/cadset/32-5.jpg`
  - supporting: `32-6.jpg`
- Why usable now:
  - readable GHD and Aqwest references
  - readable project title
  - readable drawing title
  - readable drafter attribution
- Public framing used:
  - building documentation archive record
- Confidence:
  - High

## Deferred for later tranche or admin-side reconciliation

### ACCE pages without safe standalone metadata

- `ACCE_Page_01.jpg` and similar pages contain useful drafting evidence but do not all carry readable project-identifying titleblocks in the inspected export state.
- Defer until the full ACCE source family can be reconciled sheet-to-project more systematically.

### Generic or placeholder shelter sheets

- `BBALL_SHELTER-001.jpg`
- `GENERAL - UNSORTED_Page_07.jpg`
- Reason deferred:
  - placeholder or incomplete titleblock fields
  - not enough truthful public metadata

### Low-legibility GHD / unsorted items

- `44S (2015_11_26 08_40_25 UTC).jpg`
- related `44*` and `45*` sheets
- Reason deferred:
  - insufficient legibility during this tranche audit
  - would require more manual inspection before publication

## Notes for later CMS/admin migration

- Preserve the distinction between:
  - full project records
  - project-family records
  - sheet-led evidence records
- The new public-site data model should continue to support:
  - `projectFamily`
  - `documentationType`
  - `sourceConfidence`
  - `evidenceAssets`
- The tranche-2 promoted items are defensible because each one anchors to a readable titleblock or similarly self-contained sheet.
- The deferred items should not be promoted automatically by a later CMS ingest without a human metadata pass.
