# 02 — Content Structure

**Question:** What concepts does the primer cover, and in what order?

> **Revised framing (supersedes the original concept-ladder module map).**
>
> The spine is the noun-based journey `Events → Releases → Analytics`. Concept modules hang off its five stations rather than forming a separate top-level structure.

---

## Design principles for the content spine

1. **Journey-first.** The organising structure is the data's journey through the pipeline, not an OCDS feature taxonomy. This matches the user's framing: *show the steps for how procurement is recorded, released, analyzed.*
2. **One protagonist before a wider cast.** The learner first follows one clearly labelled synthetic process designed to demonstrate the complete model. Only after that mental model is stable do real or real-shaped cancelled, award-only, retendered, and incomplete processes appear.
3. **Concepts attach to stations.** Every OCDS concept (process, release, identifiers, parties, codelists, mapping, red flags) is taught *in the place it actually matters in the journey*, not as a standalone topic.
4. **Two questions per station:** "What happens to the data here?" and "Why does this step exist?"
5. **Reuse, don't rewrite.** This workspace already contains accurate conceptual material (see §"Source material to reuse"). The primer rewrites for tone/brevity and links out for depth.
6. **Linear by default, browsable by design.** First-time learners follow the journey top to bottom; returning users jump to any station via the sidebar.
7. **Zoom out deliberately.** Later chapters combine multiple processes into release and record packages, then derive a publication-level view of competition, completeness, buyers, suppliers, and spending.

---

## The journey as content structure

The journey has three macro-phases and five stations:

```text
EVENTS                            RELEASES                       ANALYTICS
──────                            ────────                       ─────────
Station 1: Event                  Station 4: Record              Station 5: Indicators and Red Flags
Station 2: Extraction
Station 3: Mapping to OCDS
```

| # | Station | Macro-phase | What the learner sees | What concept it teaches |
|---|---------|-------------|-----------------------|-------------------------|
| 1 | **Event** | Events | The real-world procurement event behind the contracting process | What a contracting process is; lifecycle stages and tags |
| 2 | **Extraction** | Events | The procurement as one flat PhilGEPS row | The structural limits of flat source data |
| 3 | **Mapping to OCDS** | Events | Source fields mapped to canonical fields and OCDS paths; the event joins its process via `ocid` | Mapping, identifiers, process boundaries, and codelists |
| 4 | **Record** | Releases | Release index, compiled release, and versioned release, with one sub-station per release | Incremental publication and the release/record distinction |
| 5 | **Indicators and Red Flags** | Analytics | Indicators computed from the compiled release | Risk signals, coverage, and publication quality |

The original 7 concept-modules don't disappear — they fold into the stations as the **explanatory prose each station shows when expanded**:

| Original module | Now lives in |
|-----------------|--------------|
| 0 — 5-minute OCDS | Becomes the **landing page** that introduces the journey (no station) |
| 1 — Contracting process | Station 1 explanatory content |
| 2 — Releases, records, packages | Station 4 explanatory content (split across the three record panes: release index + compiled release + versioned release) |
| 3 — Identifiers | Station 3 explains how the `ocid` keeps this process together; detailed field tracing is a later intermediate lesson |
| 4 — Parties, tender, awards, contracts | Station 4 explanatory content |
| 5 — Codelists, extensions, amendments | Station 4 explanatory content (sub-section) |
| 6 — Mapping | Station 3 explanatory content |
| 7 — Red flags | Station 5 explanatory content |

---

## Page/route structure

```text
/                              → redirects to /journey
/journey                       The full ProcurementJourney hub
/journey/1-event               Station 1 — Event
/journey/2-extracted           Station 2 — Extraction
/journey/3-mapped              Station 3 — Mapping to OCDS
/journey/4-record              Station 4 — Record
/journey/4-record/:releaseId   Station 4 sub-station — one release
/journey/5-analyzed            Station 5 — Indicators and Red Flags
/possible-journeys             Possible Journeys gallery
/possible-journeys/compare     Side-by-side journey comparison
/possible-journeys/:journeyId  One journey detail (+ #timeline / #record anchors)
/publication                   Release package + portfolio
                               (?cohort=signals|not-assessable|…&inspect=N)
/explore/fields                Intermediate field tracing
/glossary                      Glossary
/reference                     Canonical reference index
/about                         About, attribution, license
/search                        Client-side search (?q=…)

# Alias redirects (keep old bookmarks working)
/stations                      → /journey
/stations/:id                  → /journey/:id
/trace                         → /explore/fields
/explore                       → /explore/fields
```

- `/journey` is the **hub**: the subway diagram with all stations visible; clicking a station routes to its dedicated page.
- Each `/journey/<station>` page has the station's lens component + its explanatory prose + a knowledge check + prev/next along the journey.
- `/explore/fields` is reachable from Publication and from "Go deeper" links after the introductory journey.
- User-facing dates use `formatReleaseDate` (en-PH); ISO strings remain in raw JSON only.
---

## Per-station content template

Every station page follows the same shape so learners always know what to expect:

1. **Where we are** — one-line orientation ("This is what the data looks like *before* it's OCDS").
2. **The lens** — the station's interactive component showing the worked example.
3. **What happened here** — 200–400 words on the transformation this station performs.
4. **Why this step exists** — the engineering/why reason (e.g. "raw is XLSX/CSV with mixed types; JSONL is the machine-readable, typed base").
5. **Concept deep-dive** — the OCDS concept this station is the natural home for (see mapping table above).
6. **Gotchas** — the 1–3 most common mistakes, drawn from existing docs.
7. **Knowledge check** — 1–3 questions with instant feedback.
8. **Go deeper** — link to the canonical OCP doc page and the relevant workspace doc.
9. **Next station** — one-line teaser ("Now watch this flat row become a compiled release →").

---

## The worked-example sequence

The primer begins with one deliberately synthetic flagship, then introduces a small audited source-row catalogue only after the learner finishes that journey. Earlier shape estimates from `ocds/sample/compiled_releases.jsonl` are not used as teaching evidence because the exploratory compiler's process grouping is under review.

| Example | Shape | Releases | % of real data | What it teaches |
|---------|-------|---------:|---------------:|-----------------|
| **DENR Region VII laptops, 2024** *(default)* | Full lifecycle | 7 (tender → amendment → bids → award → contract → 2× implementation) | ~10% | The complete journey — exercises every station and shows what a full record looks like |
| **DOLE Main computer upgrades, 2002** | Award only (data-gaps focus) | 2 (tender → award) | ~19% | A common partial lifecycle: award recorded, **no contract**. The flagship *data-gaps* example — OCDS's structured record makes the missing contract visible (a dangling award with no `contracts[]` referencing it) where a flat export just shows a blank cell. Surfaces real data-quality issues (award date before notice date) and shows what indicators the gap blocks downstream |
| **CHR office tables & chairs, 2002** | Cancelled | 2 (tender → tenderCancellation) | ~70% | The most common shape: a process that never reached an award. Shows that "a contracting process" often ends at tender, and that red-flag indicators correctly return "no data" when there's nothing to analyze |

The corpus is catalogued in `examples/manifest.json`. Phase 1 reads only the flagship; the later possible-journeys gallery reads the full catalogue. Each example is a self-contained `WorkedExample` JSON (`examples/<id>.json`).

### Why one example first, then a corpus

A single tidy lifecycle is the clearest first lesson but a misleading final impression. The synthetic flagship establishes the vocabulary and transformations. The next chapter immediately corrects its tidy-example bias with real or real-shaped processes; in the 2,000-record workspace sample, only ~10% reach an award and contract while ~70% never reach an award.

The sequence lets the learner:
- see the **full ideal** first (DENR — the default),
- then contrast it with **what most data actually looks like** (CHR — cancelled, DOLE — award-only),
- and understand that **red-flag indicators depend on coverage** — a cancelled process yields `no_data`, which is correct, not a failure.

### The data-gaps teaching example (DOLE)

The DOLE example does extra duty: it's the primer's clearest argument for **why OCDS beats flat exports**. The contracting process has an award (`awards[0].id = "1470"`, status `active`) but no contract — `contracts[]` is absent entirely. The example carries a `gapAnalysis` payload that the Indicators and Red Flags station renders:

- **Flat export view:** a row with a blank `Contract Amount` cell — ambiguous (could mean not-yet-awarded, not-captured, not-required, or skipped).
- **OCDS view:** an `active` award object with a stable `id` that no `contracts[].awardID` references — a machine-detectable signal. A one-line `jq` query finds every dangling award in a dataset; impossible in a flat export.
- **What the gap blocks:** three downstream indicators (`final-vs-award-value`, `contract-timeliness`, `implementation-delivery`) — each listed with the path it needs and why it matters.

The Indicators and Red Flags station lets the learner toggle this gap on/off and watch the blocked indicators appear or become unavailable. This is the concrete payoff of structured data: ambiguity becomes signal.

### The flagship example (DENR laptops)

> **"Procurement of laptops for DENR Region VII, 2024"**
> - Buyer: DENR Region VII
> - One tender, posted 2024-03-01, deadline 2024-03-20
> - A deadline extension (tender amendment) on 2024-03-18 — a second release in the event history, which makes the versioned release non-trivial (`tender.tenderPeriod.endDate` changes)
> - **One tenderer** (so single-bid indicator R003 fires)
> - One award to "ABC Computer Trading" on 2024-04-05
> - One contract signed 2024-04-20
> - Two implementation delivery milestones

Why this is the flagship:
- It has a real **flat-row representation** (Schema 3 shape from the actual archive) — Station 2 is honest, not invented.
- It exercises **every OCDS structural concept** (parties, tender, awards, contracts, implementation) — Station 4 is rich enough.
- It has a natural **multi-release event history** (7 releases), which is exactly what the incremental publishing model requires. The record at Station 4 is built from these: the release index lists them, the compiled release is their merge, and the versioned release shows the per-field deltas (most visibly, the moved deadline).
- It produces a credible mix at Station 5: a single-bid check raises a review signal, the illustrative short-period condition is not met after the amendment, and a completed delivery milestone without `dateMet` creates a publication-quality warning.

### Honest about the pipeline gap

The introductory examples are **fictional but shaped on real PhilGEPS records**. Their multi-release event histories are **illustrative of the target OCDS-compliant model**. Chapter 2 separately uses audited real source rows transformed into single reconstructed current-state releases. The bulk `compile_ocds.py` output is not used as teaching evidence while its grouping semantics are under review.

---

## Source material to reuse (not rewrite)

The workspace already has accurate conceptual content; the primer rewrites for tone/length and links out for depth. Updated to map sources to stations:

| Existing doc | Reused for station |
|--------------|--------------------|
| [`PHILGEPS_PIPELINE_ARCHITECTURE.md`](../PHILGEPS_PIPELINE_ARCHITECTURE.md) | The **journey itself** (the 5-layer pipeline diagram is the primer's spine); Station 2 (Schema 3 columns); Station 3 (canonical model design, raw→canonical) |
| [`docs/OCDS_RELEASE_PACKAGE_GUIDE.md`](../docs/OCDS_RELEASE_PACKAGE_GUIDE.md) | Station 4 (release packages, the five required fields) |
| [`philgeps_schema_analysis/docs/OCDS_PROCESS_AND_RELEASE_IDENTITY.md`](../philgeps_schema_analysis/docs/OCDS_PROCESS_AND_RELEASE_IDENTITY.md) | Station 1 (process concept); **Station 3 (the `ocid` boundary — what starts a contracting process)**; **Station 4 (contracting process → record; the three parts of a record; the two publishing modes and the BCDA worked example)**; `/trace` (the three identifier layers) |
| **[OCDS primer — How is OCDS data published?](https://standard.open-contracting.org/latest/en/primer/releases_and_records/)** | **Authoritative external source for Station 4** — the canonical definitions of release, record, compiled release, versioned release, and the incremental publishing model |
| [`philgeps_schema_analysis/docs/OCDS_ID_GENERATION.md`](../philgeps_schema_analysis/docs/OCDS_ID_GENERATION.md) | Station 3 (how `ocid` is built during mapping); `/trace` |
| [`docs/OCDS_MAPPING_COMPLIANCE.md`](../docs/OCDS_MAPPING_COMPLIANCE.md) | Station 3 (mapping files vs releases distinction; codelist/path compliance) |
| [`philgeps_ocds_plan.md`](../philgeps_ocds_plan.md) | Station 3 (flat rows → process-oriented releases); Station 5 (Cardinal workflow, indicator references) |
| [`ocds_mapping_explorer/references/OCP_RED_FLAGS_TO_OCDS.md`](../ocds_mapping_explorer/references/OCP_RED_FLAGS_TO_OCDS.md) | Station 5 (red-flag catalogue, R001–R073) |
| [`references/ocds-release-schema.json`](../references/ocds-release-schema.json) | Station 4 — source of truth for field definitions |
| [`ocds_mapping_explorer/public/ocds_reference.json`](../ocds_mapping_explorer/public/ocds_reference.json) | Station 4 lens — drives the `AnnotatedJsonTree` tooltips |

The pipeline-architecture doc is now central, not peripheral — its 5-layer diagram is literally the journey map.

---

## Glossary

Unchanged from v1: every term gets a one-line entry, linked on first use. Maintained as a single data file so it surfaces as tooltips, a `/glossary` page, and the search index.

Starter terms, now grouped by the station where they first appear:

- **Events:** **contracting process**, lifecycle stage, tag, initiationType, **event** (the atomic input)
- **Events (mapping):** **`ocid` as process boundary**; selection of the best stable internal source identifier; `bid_reference_no` as the strongest key in current exports; APP/project identifiers as earlier candidates requiring lifecycle and cardinality tests; fallback provenance
- **Released:** ocid, release, release.id, **contracting process → record**, **record = release index + compiled release + versioned release**, **incremental publishing / event history**, immutability, merge, release package, party, role, buyer, supplier, procuring entity, tenderer, tender, award, contract, implementation, milestone, document, codelist (closed/open), extension, amendment, mapping
- **Analyzed:** Cardinal, red flag, coverage, indicator

---

## Navigation model

- **Sidebar:** Landing → Journey (hub) → the 5 stations (indented under Journey) → Trace → Glossary → Reference → About. *(Glossary, Reference index, and About are all implemented; Reference and About read from a shared `canonicalReferences.ts` content module so the same data drives the page and the About summary.)*
- **Prev/Next:** walks the journey linearly: Landing → Event → Extracted → Mapped → Record → Analyzed → Trace.
- **Hub diagram:** `/journey` is the visual table of contents — clicking a station deep-links.
- **Search:** client-side full-text over station prose + glossary. (v1.)

---

## Open questions for review

- Is **5 stations** the right cut, or should Events' two stations (event + extracted) merge? Lean: keep separate — the extraction/typing step is genuinely a different transformation.
- Should the **Station 3 mapping** content live before or inside the journey? Lean: inside, as a station — because mapping *is* the transition from Events to Released, and putting it elsewhere breaks the spine.
- The **publishing model for Station 4 is settled** (open decision **D10**, resolved): the primer teaches **incremental publishing with a full event history** — the canonical OCDS model. The compiled view is the output of merging, never "the release." The workspace's bulk artifact is not treated as an observed release history; audited real examples are published as reconstructed current-state releases.
- The **OCDS boundary is settled but the source mapping is evidence-led** (decision **D11**, refined): the `ocid` groups one contracting process, while the source field used to construct it depends on what the publisher exposes and how identifiers behave across the lifecycle. Current exports support `bid_reference_no` as the strongest observed tender-stage key. A stable APP/project identifier could move the boundary earlier if it proves one-to-one and persistent; otherwise it remains planning provenance or links multiple related attempts.
- Is the **DENR laptops** example the right protagonist, or should it be more generic so the primer reads as globally useful? Lean: keep PhilGEPS-flavoured (it's this project's context and the source data is real), but make the *journey* concept generic enough that the framing travels.
