# OCDS Primer — Planning Index

**Status:** Local proof of concept implemented through the publication, portfolio, field-explorer, glossary, and search chapters (`site/`). No public host or organizational owner is designated.  
**Purpose:** This file is the single entry point for primer planning. It frames the problem, lists the decisions we need to make, and summarises the recommendation that the other documents argue for in detail.

---

## The one-paragraph pitch

An interactive website that teaches the **Open Contracting Data Standard (OCDS)** by **following one contracting process from beginning to end** — from a procurement need, through tender, award, contract, and implementation events, to a sequence of OCDS releases aggregated into a record and analyzed for red flags. The contracting process is the introductory protagonist. Field-level transformation is introduced only in a later intermediate lesson. This mirrors the workspace's actual pipeline, so the steps are real rather than invented.

> **Terminology follows the OCDS 1.1.5 primer** — [How is OCDS data published?](https://standard.open-contracting.org/latest/en/primer/releases_and_records/): a contracting process is described by many releases. Its record indexes those releases, should include a compiled release, and may include a versioned release.

---

## The questions we need to answer

Planning is organised around six questions. Each has a dedicated document, followed by a standards audit.

1. **Who is this for and what should they walk away with?** → [`01_goals_and_audience.md`](01_goals_and_audience.md)
2. **What is the journey, what are its stations, and what concepts attach where?** → [`02_content_structure.md`](02_content_structure.md)
3. **What do we build it with?** → [`03_tech_stack_options.md`](03_tech_stack_options.md)
4. **How do we show the steps interactively — what is the journey component and its station lenses?** → [`04_interactivity_patterns.md`](04_interactivity_patterns.md)
5. **How does it relate to the existing explorer, pipeline, and docs?** → [`05_relationship_to_existing_tooling.md`](05_relationship_to_existing_tooling.md)
6. **What do we build first, and what comes later?** → [`06_roadmap_and_phases.md`](06_roadmap_and_phases.md)
7. **How closely does the current primer align with OCDS?** → [`07_ocds_alignment_audit.md`](07_ocds_alignment_audit.md)
8. **Does the implemented journey meet its accessibility and responsive contracts?** → [`08_accessibility_and_responsive_audit.md`](08_accessibility_and_responsive_audit.md)
9. **How do learners compare real-world process shapes and long-span projects?** → [`09_possible_journeys.md`](09_possible_journeys.md)

---

## Recommended approach (summary)

The full argument lives in the linked docs. In short:

- **Spine:** the noun-based hierarchy `Events → Releases → Analytics`. Its stations are `Event → Extraction → Mapping to OCDS → Record → Indicators and Red Flags`. This follows the workspace's five pipeline layers while keeping section and station labels grammatically consistent.
- **Audience:** Multi-track, but lead with the *analyst/CSO/journalist* persona. Developer-deep content is a secondary layer.
- **Concept modules** hang off the journey's stations as explanatory content (e.g. "identifiers" is taught inside the mapping station, not as a standalone topic).
- **Tech stack:** A **static React + Vite + TypeScript site** (same toolchain as `ocds_mapping_explorer`), deployed as static files. Markdown-driven content (MDX) so non-developers can edit lessons, with interactive station-lens components embedded where needed. No backend, no auth. **Scaffolded in `site/`.**
- **Flagship interactive:** `ProcurementJourney` — a clickable subway map of the five stations, each showing the same procurement at that stage. Station lenses (`EventCard`, `RawRowViewer`, `CanonicalMapper`, `RecordViewer`, `RedFlagPlayground`) show the data transforming.
- **Record is the conceptual centrepiece and a parent with sub-stations:** a release is not a contracting process. One `ocid` groups multiple immutable releases. The record must index the releases, should provide a compiled release, and may provide a versioned release. The flagship deliberately shows all three views. (D10.)
- **The process boundary is taught explicitly but the source key remains evidence-led.** The `ocid` is the OCDS boundary. OCDS requires the publisher's best stable internal process identifier; it does not prescribe `bid_reference_no`. That field is the strongest observed key in the exports currently available. An earlier APP procurement-project identifier might be preferable if future data proves it is unique and persists across the whole process; otherwise it remains planning provenance. Fallback keys require separate provenance and collision testing. (Decision **D11**, refined.)
- **Progressive learning arc:** first follow one deliberately designed synthetic process end to end; then compare real or real-shaped process variants; then combine those processes into release and record packages; finally analyze the publication as a portfolio.
- **A later `FieldTracer`** lets an intermediate learner follow one field end to end after completing the contracting-process journey. It is not part of the introductory navigation.
- **Relationship to existing tooling:** The primer *teaches* the journey, the explorer *does* mapping. The primer links out to the explorer for hands-on work; it reuses `ocds_reference.json` and the explorer's JSON-tree primitives.
- **Phasing:** MVP = **one synthetic journey end to end**, all 5 stations, minimally interactive. v1 adds real-world journey variants and assembles them into a multi-process publication. The culmination is a portfolio view whose figures derive from that publication. Later work adds trace mode, glossary, i18n, and polish.

---

## Open decisions

These are the choices that still need a human call before implementation starts. They are flagged inline in each document too.

| ID | Decision | Owner | Default if unresolved |
|----|----------|-------|------------------------|
| D1 | Primary persona — lead with analyst vs developer | — | Analyst-first, developer as secondary layer |
| D2 | Markdown framework — MDX-in-Vite vs Astro Star/Docusaurus | — | MDX-in-Vite (reuse explorer toolchain & components) |
| D3 | Whether to share a component library with `ocds_mapping_explorer` | — | Share the JSON-tree + reference-loader primitives as a vendored folder |
| D4 | Hosting target | — | Unresolved. Keep the build host-neutral until a real owner selects and controls a deployment target. |
| D5 | Scope of Cardinal / red-flag content in MVP — full Station 5 or 2 indicators only | — | 2 indicators in MVP (R003, R024); expand in v1/v2 |
| D6 | Whether the primer is single-language (EN) at launch | — | EN at launch; i18n deferred to v2 |
| D7 | Tone/register — formal standard-style vs friendlier "explainer" voice | — | Friendlier explainer voice; link to canonical docs for formal definitions |
| D8 | Whether `FieldTracer` ships in MVP or v1 | — | v1 (depends on stable stations first) |
| D9 | Whether the 5 stations are the right cut, or Events' two stations merge | — | Keep 5; revisit if pilot says the extracted station is dead weight |
| D10 | ~~Station 4 publishing-model default — Mode A (live, multi-release) vs Mode B (bulk compiled)~~ **RESOLVED:** teach incremental publishing (full event history) as the single canonical model; honest callout on the pipeline gap | — | Resolved 2026-08-04 |
| D11 | ~~Macro-phase naming + process boundary~~ **RESOLVED, REFINED:** (a) rename `Recorded → Events`; (b) teach `ocid` as the boundary while presenting `bid_reference_no` only as the best key observed in current exports, subject to revision if earlier stable APP/project identifiers are exposed; (c) treat fallbacks as separately tested mappings; (d) Station 4 is the record parent | — | Refined 2026-08-04 |
| D12 | ~~Worked-example sequence~~ **RESOLVED:** begin with one clearly labelled synthetic process designed to cover the core concepts; introduce real-world variants after the first journey; culminate in a multi-process publication and portfolio view | — | Resolved 2026-08-04 |
| D13 | ~~Field tracing in the introductory journey~~ **RESOLVED:** the first journey follows the contracting process itself from start to finish; selectable field tracing moves to a separate intermediate exploration chapter | — | Resolved 2026-08-04 |
| D14 | ~~Section and station grammar~~ **RESOLVED:** use nouns throughout navigation: Events (Event, Extraction, Mapping to OCDS), Releases (Record), Analytics (Indicators and Red Flags) | — | Resolved 2026-08-04 |
| D15 | ~~POC identity and publication references~~ **RESOLVED:** do not infer a host, owner, publisher, package scope, or repository from the workspace path. Use verified external references, relative local paths, and visibly synthetic fixture metadata. | — | Resolved 2026-08-05 |

---

## Non-goals (explicit)

To keep scope bounded, the primer will **not**:

- Replace the [official OCDS documentation](https://standard.open-contracting.org/latest/en/) — it links to it.
- Be a full data-publication tool — that is `ocds_mapping_explorer`'s job.
- Cover OCDS 1.2 (still draft at time of writing); pin to 1.1, same as the rest of the workspace.
- Include server-side components, accounts, or progress-tracking backends in v1. Progress can live in `localStorage`.

---

## How to use these documents

1. Read this file and [`01_goals_and_audience.md`](01_goals_and_audience.md) first.
2. Read [`02_content_structure.md`](02_content_structure.md) — the journey and its stations are the spine; make sure the station map matches your mental model.
3. Skim [`04_interactivity_patterns.md`](04_interactivity_patterns.md) to see the `ProcurementJourney` flagship and its station lenses — this is where "show me the steps" becomes concrete.
4. Check [`03_tech_stack_options.md`](03_tech_stack_options.md) for the build approach.
5. Resolve the open decisions above.
6. Then we pick a phase from [`06_roadmap_and_phases.md`](06_roadmap_and_phases.md) and start building — most likely Phase 0 (scaffold) then Phase 1 (the full journey MVP).
