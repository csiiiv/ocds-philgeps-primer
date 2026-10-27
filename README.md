# OCDS Primer — Planning

This folder holds the plans, worked examples, and implementation of an interactive OCDS (Open Contracting Data Standard) primer website.

**Live site:** <https://csiiiv.github.io/ocds-philgeps-primer/>

## Project identity and reference policy

This primer is an organization-neutral, local proof of concept. Its location inside a wider workspace does not establish an owner, publisher, public website, repository, deployment target, or package namespace for the primer.

- Do not construct URLs, publisher names, repository links, package scopes, or organizational affiliations from directory names.
- Links to external material must point to verified, authoritative sources. Local artifacts use relative paths.
- Example publication metadata must be visibly synthetic. The generated release package uses a deterministic, non-resolving `urn:uuid:` and a generic local POC publisher name.
- A future production publisher must supply and control its own persistent package URI, registered OCID prefix, license, publication policy, and hosting location.

## Why a primer?

The wider `philgeps_data_analysis` workspace already contains deep, accurate OCDS teaching material and a real five-layer data pipeline. The primer repackages it as the noun-based journey **`Events → Releases → Analytics`**: follow one contracting process through **Event → Extraction → Mapping to OCDS → Record → Indicators and Red Flags**. Field-level tracing is an intermediate lesson after this mental model is secure. Terminology follows the OCDS 1.1.5 primer — [How is OCDS data published?](https://standard.open-contracting.org/latest/en/primer/releases_and_records/).

## Planning documents

Read in this order:

| # | Document | What it decides |
|---|----------|-----------------|
| 00 | [`00_planning_index.md`](00_planning_index.md) | Entry point — the questions we need to answer, open decisions, and a one-page summary |
| 01 | [`01_goals_and_audience.md`](01_goals_and_audience.md) | Who the primer is for, learning outcomes, success criteria |
| 02 | [`02_content_structure.md`](02_content_structure.md) | The journey spine, the 5 stations, what concepts attach to which station, the worked example |
| 03 | [`03_tech_stack_options.md`](03_tech_stack_options.md) | Static-site vs full React app vs docs-framework, with trade-offs and a recommendation |
| 04 | [`04_interactivity_patterns.md`](04_interactivity_patterns.md) | The introductory `ProcurementJourney`, its 5 station lenses, and the later intermediate `FieldTracer` |
| 05 | [`05_relationship_to_existing_tooling.md`](05_relationship_to_existing_tooling.md) | How the primer relates to `ocds_mapping_explorer`, the pipeline, the schema reference, and the corpus docs |
| 06 | [`06_roadmap_and_phases.md`](06_roadmap_and_phases.md) | Phased delivery — one designed journey, real-world variants, a multi-process publication, then the bigger picture |
| 07 | [`07_ocds_alignment_audit.md`](07_ocds_alignment_audit.md) | OCDS 1.1.5 alignment audit — what validates, what is semantically misleading, and what to correct next |
| 08 | [`08_accessibility_and_responsive_audit.md`](08_accessibility_and_responsive_audit.md) | Implemented accessibility and responsive corrections, plus remaining manual-browser checks |
| 09 | [`09_possible_journeys.md`](09_possible_journeys.md) | Chapter 2 provenance contract and audited catalogue of single-row, multi-row, cancelled, incomplete, long-span, and anomalous processes |
| 10 | [`10_poc_etl.md`](10_poc_etl.md) | Auditable proof-of-concept ETL fixtures for single-row, multi-item, and multi-award process shapes |
| 11 | [`11_etl_observations.md`](11_etl_observations.md) | Provisional findings about source-row grain, identity, current compiler risks, and publication semantics |
| 12 | [`12_publication_and_portfolio.md`](12_publication_and_portfolio.md) | Chapter 3 release-package assembly and drillable non-standard portfolio view |
| 13 | [`13_field_explorer.md`](13_field_explorer.md) | Optional intermediate source-field-to-OCDS trace explorer |
| 14 | [`14_glossary_and_search.md`](14_glossary_and_search.md) | Filterable glossary and client-side search contract |
| 15 | [`15_faq.md`](15_faq.md) | Drafted FAQ content for the `/faq` page — primer scope, mental model, usage, data, and next steps |
| 16 | [`16_alignment_vs_official_sample.md`](16_alignment_vs_official_sample.md) | Cross-check of both output patterns against the official OCDS fictional-example sample |

Workshop-phase planning (October 2026) lives in [`docs/`](docs/): the [website update plan](docs/website-update-plan.md), the accepted [structure review](docs/structure-review.md), the [workshop outline](docs/PhilGEPS_OCDS_Workshop_Outline.md), the [refresher discussion summary](docs/PhilGEPS_OCDS_Refresher_Discussion_Summary.md), and the [data-model and mapping supplement](docs/PhilGEPS_OCDS_Supplement_Data_Model_and_Mapping.md).

## Status

The implemented learning arc now moves from one clearly labelled synthetic journey, through audited real source-row shapes, to a multi-process release package and portfolio-level view. Selectable field tracing remains reserved for an intermediate exploration chapter. As of October 2026 the site additionally carries the practical mapping-workshop companion: Mapping Guide, procurement replay, solar-pump lab, and the facilitated workshop path.

The site is deployed at <https://csiiiv.github.io/ocds-philgeps-primer/> via GitHub Pages (verified live after the workshop deployment, commit `eccaa48`, 2026-10-27). It has no organizational owner beyond this repository; run and inspect it locally for development.

## Mapping workshop additions (local implementation)

The scope and source-dependent follow-ups are tracked in
[`docs/website-update-plan.md`](docs/website-update-plan.md).

| Route | Learning activity |
|---|---|
| `/mapping` | One selected mapping task: fields, identifiers/relationships, codelists, or events. Anatomy and shared structures remain available as supporting reference. |
| `/simulation` | Inspect evolving fictional source tables and captured changes, publish releases, and generate records using independent event-driven, scheduled, or on-demand controls. Inspect/download source snapshots, releases, derived views, and packages. |
| `/mapping/solar-pumps` | Source → Mapping → Result lab with fictional tables, three items across two lots, party references, awards/contracts, and supplier variants. |
| `/workshop` | Workshop learning path, recap checklist, Mapping Explorer link, and three supplied Excel mapping workbooks. |

The workshop's Templates view downloads the originals in [`templates/`](templates/):
the blank OCDS template, the 2025 PhilGEPS 1.5 workbook, and the 2025 mPhilGEPS
workbook. `templates/workshop-templates.json` defines their labels and source
filenames. Vite serves these files directly in development and emits unchanged
copies into the production output. Download URLs use simple asset names; the
original workbook names, including spaces and `#`, are preserved when downloading.

The solar-pump source is deliberately fictional, with placeholder registry and
classification schemes; it is not the actual PhilGEPS schema or an approved
production mapping. Its packages declare the pinned Lots extension 1.1.5.
The DENR replay remains synthetic and does not connect to a live source system.
Its Source tables inspection view shows eight illustrative tables, row counts, keys, OCDS destinations,
and added/updated values as events arrive. Source snapshots advance independently
of publication jobs; internal notes stay out of releases and records. Historical
inspection preserves the latest archive and record, and missing dates stay missing.

Navigation is grouped into **Learn OCDS**, **Map data**, **Workshop**, and
**Reference**. Station links appear in the introductory journey. The replay uses
three compact state summaries, a persistent desktop event list, and one inspector
with Source tables, Release, and Record views. Processing settings are optional;
waiting publications and stale records stay visible. JSON viewing and downloads
share an artifact picker. The structure and delivery record are documented in
[`docs/structure-review.md`](docs/structure-review.md).

From `site/`:

```bash
npm ci
npm run dev
npm test
npm run build
```

`npm test` checks the actual TypeScript content modules through an in-memory Vite
bundle without a server or network access. It verifies all nine publication/record
mode combinations, capture and publication order, immutability, retained values,
record snapshots, package schemas, Lots schema constraints, party/object
relationships, templates, and search coverage. `npm run build` also runs these
checks plus the existing example validation and TypeScript checks.

For the desktop-first restructuring and automated accessibility checks:

```bash
npx playwright install chromium
npm run test:e2e -- --project=desktop
```

The browser suite starts a local server on port 5184 and runs desktop and mobile
projects. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` can select an existing Chromium binary.
Desktop layout checks cover 1440×900, 1920×1080, and 2560×1440, including
compact replay summaries, the event rail, and a wide inspection workspace.
The mobile project remains available; dedicated mobile optimization is deferred.
`PRIMER_TEST_URL` targets an already running server; the suite will not start a
second server when it is set. The browser checks exercise controls and downloads;
they do not publish anything to GitHub Pages.

## Deployment (GitHub Pages)

A workflow at `.github/workflows/deploy.yml` builds the site on every push to `main` and publishes it to GitHub Pages: <https://csiiiv.github.io/ocds-philgeps-primer/>.

To enable it:

1. Push the repo to GitHub.
2. In **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow installs, builds with `VITE_BASE=/ocds-philgeps-primer/`, and deploys the `site/dist` artifact.

Notes:

- The app uses `HashRouter`, so all routes live after `#` (e.g. `…/ocds-philgeps-primer/#/journey/3-mapped`). This makes refreshes and direct links work on GitHub Pages, which has no SPA fallback.
- `VITE_BASE` only affects production builds; `npm run dev` still serves at `/` locally.

## Relationship to the rest of the workspace

- The primer is a *teaching* layer. The `ocds_mapping_explorer` is the *working tool*. The docs under `docs/` and `philgeps_schema_analysis/docs/` are the *source material*.
- The primer should link out to the explorer for hands-on mapping, and cite the canonical docs for depth — not duplicate them.
