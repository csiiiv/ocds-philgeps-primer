# 06 — Roadmap and Phases

**Question:** What do we build first, and what comes later?

> **Revised framing.**
>
> With `Events → Releases → Analytics` as the section hierarchy and five noun-based stations beneath it, the smallest useful product remains the complete journey end to end.

---

## How to read this document

Each phase is a **shippable increment**: at the end of it, the site is deployable and useful to someone. Effort estimates are rough ranges for a single contributor familiar with the existing `ocds_mapping_explorer` stack.

The phases are now organised around *how much of the journey is real*, not around *how many concept modules exist*.

## Delivery sequence (decision D12)

The primer now widens its field of view in four deliberate chapters:

1. **One designed journey.** A clearly labelled synthetic process demonstrates the complete lifecycle and the core OCDS model without source-data accidents obscuring the lesson.
2. **Possible journeys.** Real or carefully anonymised real-world examples show cancelled, award-only, retendered, incomplete, and anomalous process shapes. These correct the tidy-example bias after the learner has a stable mental model.
3. **A multi-process publication.** The audited current-state releases are assembled into a release package. A real record package is deferred until trustworthy multi-release histories exist. The UI distinguishes standard OCDS artifacts from its own analytical views.
4. **The bigger picture.** A portfolio view derives every figure from that publication and lets the learner drill from an aggregate back to contributing processes and fields.

Synthetic, adapted, and real data must always carry visible provenance labels. The flagship should demonstrate several concepts, but it should contain a credible mix of clean results, one risk signal, and one data-quality lesson rather than firing every indicator.

---

## Phase 0 — Foundation & skeleton (≈2–3 days) — **DONE**

**Goal:** A locally runnable, deployable static site that proves the toolchain and content pipeline end-to-end, before writing any real journey content. This phase does not designate a public host.

**Status (2026-08-04):** Complete. The scaffold lives in `site/` (Vite + React + TS + MDX). Routing, sidebar, and the journey hub are wired; the five stations are navigable; Station 4 renders a release timeline with one sub-station per release. Build is clean (~64 KB gzipped JS).

### Scope

- Vite + React + TS + MDX scaffold inside `site/` *(done)*
- File-based routing, sidebar populated, prev/next *(done)*
- Minimal layout: sidebar, content area, prev/next, footer *(done)*
- The `/journey` hub route renders a **subway diagram** of the 5 stations *(v0 horizontal stepper — done; polished SVG to come)*
- Station pages with teaching content (framing + callouts) *(done)*
- Station 4 as a **parent with release sub-stations** at `/journey/4-record/:releaseId` *(done)*
- Copy `ocds_reference.json` into primer `public/` at build time *(deferred — not needed for scaffold)*
- Build-time structural integrity script for the example catalogue and release identities *(done)*
- Full canonical JSON Schema validation for source releases, compiled release, versioned release, and record package *(done)*

### Done when

- `npm run dev` serves the primer locally
- `npm run build` produces a host-neutral static `dist/`
- The placeholder station renders MDX with an embedded React component
- The build fails if an example is missing, internally inconsistent, has mismatched release identities, violates canonical schemas, or regresses the flagship's chronology and delivery semantics
- The static subway diagram is visible at `/journey`

### Not in scope

- Real station lenses, real prose, search, glossary tooltips, styling polish

---

## Phase 1 — MVP: one journey, end to end (≈2–3 weeks)

**Goal:** A learner can land on the site, follow one contracting process from event to red flag, and walk away understanding *the point* of OCDS. This is the smallest thing that fulfils the user's original ask ("show the steps for how procurement is recorded, released, analyzed").

> **Scope note (2026-08-04, revised by D12).** MVP now concentrates on one excellent synthetic journey. The example gallery, real-world contrasts, gap toggles, and multi-process publication follow only after this vertical slice works end to end.

### Scope

- One **synthetic flagship `WorkedExample`**, visibly labelled and schema-valid, feeds every station from a single source of truth. It is designed to cover the lifecycle, an amendment, identifier continuity, compilation/versioning, and a credible mix of indicator outcomes.
- All **five station lenses**, each minimally functional:
  - Station 1 — `EventCard` (static content, no interaction needed). Framing makes "events are the atomic input" explicit.
  - Station 2 — `RawRowViewer` (one real-shape Schema 3 row, highlightable columns)
  - Station 3 — `CanonicalMapper` (raw→canonical arrows; canonical→OCDS arrows shown but not editable). **Carries the process-boundary caveat**: `ocid` is the OCDS boundary, while the source identifier is chosen from the best stable key actually exposed. `bid_reference_no` is the strongest observed key in current exports; an earlier APP/project ID remains a candidate pending lifecycle and cardinality tests. Fallbacks retain provenance and do not silently share the same confidence. (D11, refined.)
  - Station 4 — **`RecordViewer`** — three numbered navigation tabs expose one record view at a time. Release Index starts with contextual cards only; selecting a card opens the complete release in an accessible modal without reflowing the index. The modal has synchronized previous/next sequence controls and a position indicator. Compiled Release uses a lifecycle summary and relationship flow. Versioned Release uses a filterable field-change browser linked to source releases. Raw JSON remains available as a secondary disclosure in both derived views. Release URLs remain addressable and retain overview, previous, and next controls. Includes the pipeline-honesty callout.
  - Station 5 — **`RedFlagPlayground`** — consumes the shared indicator engine in `content/indicators.ts`. A selectable result list and evidence panel show competition, timeliness, publication-completeness, and data-quality findings computed from the compiled release, including the exact OCDS paths and values. A fixed caution explains that signals are questions, not verdicts. The station closes the introductory journey by identifying which questions require multiple processes and previewing Possible Journeys. *(done — engine shared with Publication portfolio + release inspector)*
- A fixed **process-continuity cue** that tells the learner what happened to the same contracting process at each station. It introduces the `ocid` when mapping establishes the process boundary and carries that identity through releases, the record, and analysis.
- A clear **Start the journey** call to action on the hub *(done)*
- Source-level accessibility and responsive audit: skip navigation, route focus, keyboard tab contract, modal semantics, focus indicators, reduced motion, readable muted text, and narrow/short viewport reflow *(done; manual browser, screen-reader, zoom, and Lighthouse verification remains a Phase 1 gate)*
- The **`ProcurementJourney` hub** — the subway diagram, now clickable: a station expands inline to show its lens; prev/next walks the journey
- **Station prose** — the 200–400 words per station explaining the transformation, reusing the workspace docs
- **Knowledge checks** at the end of each station, with immediate explanatory feedback and a final journey-completion state *(done — each station now carries three stacked questions at **easy / normal / hard** difficulties; the original single normal-difficulty questions are retained and augmented with an easy recall question and a hard edge-case question per station. A station counts as "passed" for progress tracking only when all three difficulties are answered correctly. Per-difficulty completion persists to `localStorage` so partial progress survives reloads. The data model supports both single-answer and multi-select questions via a discriminated `CheckDefinition` union (`mode: "single" | "multi"`); the hard tiers of Stations 1 and 4 are `multi` to teach the OCDS reality that one concept can legitimately fan out to several values — a tender-extension release can carry both `tenderUpdate` and `tenderAmendment` tags, and a record can contain both `compiledRelease` and `versionedRelease` derived views. Multi questions are answered with checkboxes and require the exact correct set.)*
- **"Go deeper"** links from each station to the relevant workspace doc and OCP canonical page

### Done when

- A pilot learner can complete the full journey in ~30 min and correctly answer: "what happens at each step?" and "why does this step exist?"
- The learner can explain, in their own words, that **the `ocid` is the OCDS process boundary but its source key is an implementation decision** based on the earliest stable, unique identifier exposed across the lifecycle
- The learner can explain the difference between a contracting process, release, and record—and that the release index is required, the compiled release is recommended, and the versioned release is optional
- The learner can explain, in their own words, how a source column becomes part of a red-flag indicator
- The learner understands that the flagship is synthetic and pedagogically complete, not statistically typical
- The subway diagram + at least one station's expanded view share-able by URL
- Lighthouse ≥ 90 on performance/accessibility
- The site deploys and is shareable

### Explicitly deferred from MVP

- **`FieldTracer`** and all selectable field tracing — intermediate material, outside the introductory journey
- **Trace-mode** inside `ProcurementJourney` — same
- Search, dark mode, print view, real-world journey gallery, and multi-process publication
- Knowledge-check scores persisting across stations (a simple progress rail is enough for MVP)

**This is the milestone at which we pause and evaluate before continuing.** Pilot with 2–3 target-persona users. If they "get it", proceed to v1. If the journey landing falls flat, this is the moment to revise, before more layers are added.

---

## Phase 2 — v1: possible journeys and the publication view (≈2–3 weeks)

**Goal:** Correct the flagship's tidy-example bias, then show how multiple contracting processes become a publication and support bigger-picture analysis.

### Scope

- A **possible journeys gallery** using real, anonymised, or explicitly real-shaped processes: cancelled, award-only, retendered (separate `ocid`s connected with `relatedProcesses`), incomplete implementation, and data-quality anomaly
- An audited source-row comparison set: one-row flattened state, multi-item process, multi-award process, cancelled tender, award-only process, long service contract, and chronology anomaly
- A shareable two-to-three journey comparison matrix whose values drill back to source-backed detail sections *(done)*
- A provenance contract that visibly labels every example as **synthetic**, **adapted**, or **real**, including source and transformation notes where publishable
- A **publication builder** that combines the chapter's audited current-state releases into a canonical release package; record-package publication remains deferred until real histories exist *(done)*
- A **portfolio view** covering stage completion, missing contracts, multi-award processes, chronology checks, suppliers, published award value, and illustrative indicator signals; every aggregate drills back to its contributing process *(done — portfolio KPI cohorts include Indicator signals and Not assessable; both the release-package artifact table and the portfolio table show per-process signal pills; cohort + open inspector state sync to `/publication?cohort=…&inspect=…` so deep links preserve the view. Opening a release from a signals cohort auto-expands the inspector's indicator panel.)*
- Clear separation between standard OCDS packages and the primer's non-standard analytical dashboard
- **Shared indicator engine** — `content/indicators.ts` evaluates five illustrative checks (single-bidder, single-supplier, short tender period, award-without-contract, missing delivery dates) against any release-shaped object. Status vocabulary is `signal` / `clear` / `not_assessable`. Consumed by Station 5, the Publication portfolio, and the release inspector. *(done)*
- **User-facing dates** render through `formatReleaseDate` (en-PH, e.g. "Mar 1, 2024"); ISO strings remain only in raw JSON fixtures and source-evidence cells. *(done)*
- **Sidebar journey nav** — stations are direct children of "The journey" with three colour-coded vertical rails (Events / Releases / Analytics) and no text phase labels. *(done)*
- **Intermediate field explorer** — a separate `/explore/fields` page where a learner can trace audited source values and transformation rules into exact OCDS paths. It never adds a selector back into the beginner journey. Six initial traces are implemented; real version history remains unavailable for flattened current-state sources. *(done)*
- **Station 3 mini-exercise** — a small "try mapping one column yourself" destination choice, behind the demonstrative `CanonicalMapper`. It gives immediate feedback and supports retry without affecting station scoring. *(done — expanded to four stacked questions: easy Posted Date → `tender.tenderPeriod.startDate`; normal Closing Date → `tender.tenderPeriod.endDate`; hard Bid Reference No. → multi-select `ocid` + `tender.id`; bonus Procuring Entity → multi-select `buyer.name` + `parties[].name` + `tender.procuringEntity`. The model supports both `single` and `multi` modes via a discriminated `MappingQuestionDefinition` union. The exercise remains optional and does not affect station scoring.)*
- **Codelist check inside Station 4** — an optional "spot the invalid value" exercise covers four tender, award, and contract codelist-controlled fields, with per-row feedback and retry. *(done)*
- **Glossary** populated with the primer's OCDS, lifecycle, organization, mapping, analysis, and Philippine-context vocabulary. Filtering and stable term anchors are implemented; automatic first-mention linking remains deferred. *(partially done)*
- **Search** — client-side ranked search over station prose, Possible Journeys, Field Explorer traces, publication content, and glossary definitions. The current static corpus uses a dependency-free index rather than FlexSearch. *(done)*
- **Dark mode** and **print/export view** with static fallbacks for every station
- **Knowledge-check progress** persists to `localStorage`; sidebar shows "3/5 stations passed" *(done — `StationProgressProvider` in `context/StationProgress.tsx` records per-difficulty completion under a versioned storage key. A station counts as passed only when all three difficulties — easy, normal, hard — are correct. The sidebar shows a count + reset control, station nav links gain a checkmark when fully passed, the subway diagram marks stations done from the persisted set, and the journey hub surfaces a completion banner when all five are passed. Persists to `ocds-primer:station-progress:v2`; degrades silently when `localStorage` is unavailable.)*
- **Explorer hand-off** — Station 3's CTA opens the blank project in `ocds_mapping_explorer`; the explorer gains a "Primer" link in its header

### Done when

- The intermediate field explorer works for at least 3 source fields, end to end
- Every interactive has a verified keyboard + static-fallback path
- All five stations pass content review against the canonical docs
- Search works across stations and glossary
- Pilot users confirm they can answer "how does `Bid Reference No.` become part of an indicator?" by using `/explore/fields` alone

### Not in scope

- Translations, additional indicator catalogue, and advanced analytics

---

## Unified release inspection — **DONE**

**Goal:** Make every entry point for an individual OCDS release feel and behave like the same inspection tool.

**Status (2026-08-05):** Complete. A single `ReleaseInspector` component (with a non-modal `ReleaseInspectorInline` variant for the addressable release route) now backs all four consumers: the introductory Record release modal, the Possible Journeys evidence viewer, the standalone `/journey/4-record/:releaseId` route, and the Publication & Portfolio release inspector. Both variants share the same Readable/JSON view contract, position announcement, and previous/next navigation vocabulary. The readable view now also includes a per-release **lifecycle timeline** (tender period, awards, contracts, publication date) and a collapsible **indicator signals** panel driven by the shared indicator engine. `ReleaseSummary` and the source-row presentation were lifted out of `JourneyEvidenceViewer.tsx` into the shared module; `JourneyEvidenceViewer` re-exports `ReleaseSummary` for compatibility.

1. Extract the current shared readable release presentation and duplicated dialog behavior into a reusable `ReleaseInspector` component. *(done)*
2. Use it in the introductory Record release index and the Possible Journeys evidence viewer. *(done)*
3. Give the standalone `/journey/4-record/:releaseId` route the same Readable view / JSON view contract and navigation vocabulary. *(done)*
4. Add release inspection from Publication & Portfolio without creating a third modal implementation. *(done — Package release cards and the portfolio table now open the same shared inspector.)*
5. Verify desktop, tablet, narrow mobile, short viewport, keyboard focus, Escape/backdrop close, focus return, previous/next announcements, and 200–400% zoom. *(source build, schema validation, TypeScript strict, route smoke tests, and lints pass; rendered-browser and assistive-technology verification remains part of the Phase 1 sign-off gate in `08_accessibility_and_responsive_audit.md`.)*

**Done when:** all release entry points use the shared component; fixed context remains visible; only the data region scrolls; view choice and navigation behave consistently; and reconstructed releases remain visibly distinct from compiled releases and genuine publication histories. *(met for code; manual AT verification tracked separately.)*

---

## Phase 3 — v2: reach, contrast, sustain (≈ongoing)

**Goal:** Harden, broaden, and make the primer sustainable. Cherry-pick from these; no single "v2 ships" gate.

### Scope (pick from)

- **More worked examples** — add a single-bidder example, a very-short-period example, and a multi-award process. This lets Indicators and Red Flags show a wider range of outcomes.
- **Full `RedFlagPlayground`** — expand from the current shared five-indicator engine toward a curated 8–10 set, with a coverage-vs-detection visualisation
- **i18n** — at least one translation (open decision **D6**); MDX + a locale switcher
- **Authoring workflow** — contributor guide, content review checklist, CI checks for schema validity + link integrity
- **Analytics** — privacy-respecting, aggregate-only (station views, completion, knowledge-check pass rates) to validate success criteria
- **Embeddable lenses** — let the explorer (or external sites) embed `AnnotatedJsonTree` or the journey hub
- **Shared package extraction** — promote vendored components to a workspace package (open decision **D3**)
- **Glossary tooltips on hover/focus** — first-mention-of-term popover

### Done when

Per-item; no gate.

---

## Phase summary (revised)

| Phase | What ships | Effort | Useful site? |
|-------|-----------|--------|--------------|
| 0 — Foundation | Scaffold + subway diagram v0 + release sub-stations *(done)* | 2–3 days *(done)* | No (proves pipeline) |
| 1 — MVP | **One designed synthetic journey, all 5 stations, minimal interactivity** | ~2–3 weeks | **Yes — teaches the core model** |
| 2 — v1 | Real-world journey gallery + release/record packages + portfolio view | ~3–4 weeks | Yes — corrects tidy-example bias and shows the bigger picture |
| 3 — v2 | Contrast examples, i18n, analytics, embeds | ongoing | Iterative |

Total to a complete v1: roughly **5–7 weeks** of focused single-contributor effort, with a usable, shareable first-journey MVP in **2–3 weeks**.

The key change from the v1 plan: the MVP is no longer "modules 0–3 of a concept ladder". It is **the whole journey, rough but complete**. That is a better MVP because it teaches the whole point, not a fragment.

---

## Sequencing rationale (revised)

- **Why MVP = the whole journey, not a subset:** the user's ask was "show the steps for recorded → released → analyzed". Shipping only the first 2–3 stations teaches "here is raw data" without the payoff. The whole journey, even if each station is minimally interactive, delivers the "aha". This is the difference between a teaching tool and a partial diagram.
- **Why field tracing is separate:** following changing fields requires the learner to already understand contracting processes, releases, records, compilation, and version history. Mixing it into the first journey creates two simultaneous mental models.
- **Why defer journey variants to Phase 2:** the MVP needs one protagonist the learner can follow without context switching. The variants then correct the flagship's tidy-example bias before the publication chapter zooms out.
- **Why pause-and-evaluate after MVP:** the journey-as-spine decision is the biggest architectural choice in the plan. Validating it against real pilot users before building trace mode, glossary, and search prevents sunk-cost commitment to the wrong structure.

---

## Risks and mitigations (revised)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| The journey feels like 5 unrelated widgets rather than one story | Medium | High | The same `WorkedExample` feeds every station; fixed continuity copy names the process, the latest event, its `ocid`, and what happens next |
| Station 3 (mapping) is too abstract to "feel" like a step | Medium | High | Show the arrows *animating* from raw column → canonical field → OCDS path; let the learner click a column to trigger its mapping |
| **Terminology drift between "release" and "record"** (the original error that prompted the D11 revision) | Medium | High | Macro-phase renamed `Recorded → Events` to remove the collision; "record" is reserved exclusively for the OCDS artefact at Station 4; Station 4 is a parent with one sub-station per release so the release/record distinction is structural, not just prose |
| **Station 4 conflates releases / records / compiled releases** (the original error the D10 revision fixes) | Medium | High | Station 4's `RecordViewer` mirrors the record schema exactly (release index, compiled release, versioned release) per [How is OCDS data published?](https://standard.open-contracting.org/latest/en/primer/releases_and_records/); commits to the single canonical model (incremental publishing, full event history) |
| **Worked example over-claims what the pipeline produces** — the record (release index + compiled + versioned) is illustrative, while the flattened exports expose only current-state observations | Medium | High | Station 4 labels its history as illustrative; Chapter 2 exposes exact source rows and audited reconstructed current-state releases, and does not fabricate release history |
| Worked example becomes schema-invalid after an OCDS bump | Low | Medium | Canonical schema and semantic validation run during every build; examples remain pinned to 1.1.5 |
| **Single tidy example sets wrong expectations** — learners assume "a contracting process" usually has 7 releases and a contract | High | High | Label it as a designed teaching example throughout Phase 1, then make real-world journey variants the immediate next chapter before presenting aggregate analysis |
| Scope creep (Station 6, 7, …) | Medium | High | Strict rule: every station must be a real layer of the actual pipeline; no invented stations |
| Primer drifts from canonical docs | Medium | High | Every station's "Go deeper" link is a contract; periodic review pass |
| A11y shipped as an afterthought | Medium | High | Accessibility is in the component contract from Phase 1; the subway diagram is a labelled `<ol>` in the DOM, not just SVG |
| Pilot says "too PhilGEPS-specific" | Low | Medium | Worked example is generic-flavoured; PhilGEPS specifics live in "Go deeper" links |
| Pilot says "the Extraction station is boring" | Medium | Low | Acceptable; it is short and establishes the source-data problem. If it lands flat, merge it into Event in a later revision. |

---

## Open questions for review

- Is the **MVP = whole journey** cut right, or should MVP be even thinner (e.g. only Stations 1, 4, 5 — skip the extracted/mapping intermediate steps)? Lean: include all five; the intermediate steps *are* the "show me the steps" the user asked for.
- Field tracing no longer needs an MVP decision: D13 places it in a separate intermediate exploration after the introductory journey.
- Is the **~3–4-week MVP** estimate acceptable, or do we want a thinner MVP in ~1 week (e.g. static-only stations, no interactivity) to get something live fast? Lean: include at least the station-lens interactivity in MVP, since "interactive" was the original ask.
