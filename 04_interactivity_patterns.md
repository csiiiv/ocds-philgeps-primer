# 04 — Interactivity Patterns

**Question:** How do we make the primer *interactive* — concretely?

> **Sequence decision (D12).** Interactions first operate on one deliberately synthetic flagship process so each transformation is coherent and inspectable. Later chapters reuse the same lenses for real-world journey variants, assemble them into standard release and record packages, and allow every publication-level figure to drill back to its contributing processes.

> **Beginner-focus decision (D13).** The introductory journey follows the **contracting process**, not a user-selected field. Its narrative is fixed: a need starts the process; an `ocid` establishes its boundary; later events publish releases under that same `ocid`; those releases form a record; the record supports analysis. Selectable field tracing is a separate intermediate exploration after the learner completes this journey.

> **Revised framing (supersedes the original concept-ladder approach).**
>
> "Interactive" means following one contracting process through the noun-based hierarchy `Events → Releases → Analytics`. Its stations are Event, Extraction, Mapping to OCDS, Record, and Indicators and Red Flags.

> **Terminology (locked).** Per the [OCDS 1.1.5 record reference](https://standard.open-contracting.org/latest/en/schema/records_reference/), a record must identify one `ocid` and index its releases, should contain a compiled release, and may contain a versioned release. The flagship shows all three views, but the UI must not imply that both derived views are mandatory.

---

## The journey, and why it is the spine

The workspace's own [`PHILGEPS_PIPELINE_ARCHITECTURE.md`](../PHILGEPS_PIPELINE_ARCHITECTURE.md) defines a 5-layer pipeline. That pipeline *is* the journey we want to teach:

```text
EVENTS                                    RELEASES                          ANALYTICS
──────                                    ────────                          ────────
Layer 0  Raw          a real procurement event, exported as a flat PhilGEPS row
   │
   ▼
Layer 1  Raw JSONL    that row, typed and line-delimited
   │
   ▼
Layer 2  Canonical    flat row unified into semantic fields
   │
   │ (here the data is "mapped" to OCDS paths; the event joins its process via its ocid)
   ▼
Layer 3  OCDS         canonical fields become a sequence of releases about the process  ───►  Layer 4  Cardinal
             │                                                                           coverage · prepare · red flags
             │   one ocid → many immutable releases over time → aggregated into a record
             │   (the compiled view a consumer analyses is the *output* of that merge)
```

> **Critical correction to the original framing.** "A release" is **not** the same as "a contracting process." One contracting process (one `ocid`) is told through **multiple releases** over time — a tender release, an award release, a contract release, amendments. Those releases are aggregated into a **record**, which holds a release index, a compiled release (current state), and a versioned release (per-field history). The primer teaches the canonical OCDS model (incremental publishing, full event history). See [How is OCDS data published?](https://standard.open-contracting.org/latest/en/primer/releases_and_records/) and [`OCDS_PROCESS_AND_RELEASE_IDENTITY.md`](../philgeps_schema_analysis/docs/OCDS_PROCESS_AND_RELEASE_IDENTITY.md).

This is far more memorable than a concept ladder because:

- It has a **story arc** with one protagonist: a single contracting process.
- The **same contracting process appears at every station**. Its buyer, purpose, and `ocid` provide continuity while its lifecycle develops from tender through implementation. The process is the lesson; individual field transformations are secondary.
- It maps onto **real, existing pipeline code** — the examples aren't invented; they're drawn from `scripts/` and the canonical model.
- It answers the exact question the user asked: *show the steps for how procurement is recorded, released, analyzed.*
- The **process boundary is visible**: the `ocid` is what groups events into a process, and the journey shows an event joining its process at Station 3 (Mapped).

**Design principle:** the journey component is the *primary* interactive. Everything else (annotated JSON tree, identifier quiz, red-flag playground) is a lens *on a station of the journey*, not a peer of it.

---

## The flagship component: `ProcurementJourney`

**Teaches:** the whole point — how a real-world procurement becomes a red-flag signal, through discrete steps.

**What it is:** A full-width, horizontally-scrollable (and vertically-stacked on mobile) "subway map" of the five layers. Each station is a card showing the **same contracting process** at that stage of its life:

```text
┌─ EVENT ────────┐  ┌─ EXTRACTION ──┐  ┌─ MAPPING TO OCDS ─┐  ┌─ RECORD ────────┐  ┌─ INDICATORS AND RED FLAGS ─┐
│  A contracting │  │ One row,      │  │ Unified into  │  │ A record: index, │  │ Red flags fire │
│  process       │→ │ typed JSON.   │→ │ semantic      │→ │ compiled +        │→ │ (or don't).    │
│  happens.      │  │               │  │ fields; event │  │ versioned release │  │                │
│ "DENR R7 needs │  │ { "Ref ID":   │  │ joins process │  │ tender.id:        │  │ ⚠ R003 single  │
│  laptops..."   │  │   "2024-001"} │  │ via ocid      │  │ "2024-001"        │  │   bid          │
└────────────────┘  └───────────────┘  └───────────────┘  └───────────────────┘  └────────────────┘
```

### Interaction model

- **Default view:** all five stations visible, each showing a minimal, hand-curated artefact for the active example. This alone is a powerful one-glance diagram.
- **Example picker** (top of the hub): switch between the examples in `examples/manifest.json` — DENR laptops (full lifecycle, default), DOLE computer upgrades (award-only), CHR office tables (cancelled). Each switch reloads every station with the new process's data. The picker shows each example's shape and its `% of real PhilGEPS data` so learners see that "a contracting process" is usually *not* a tidy full lifecycle.
- **Click a station → it expands** into the main panel below, showing the full artefact (a real row, a real JSONL record, the canonical fields, the record with its three parts, the red-flag output) with annotations.
- **Prev/Next + a progress rail** walk the learner station by station. This is the linear "show me the steps" mode.
- **Process-continuity cue:** every station identifies where the same contracting process is now, which event occurred, which release it produced, and what remains before analysis. No field selector appears in the introductory journey.

```tsx
<ProcurementJourney
  examples={manifest.examples}       // from examples/manifest.json
  activeExampleId="denr-r7-laptops-2024"
  ocid="ocds-philgeps-2024-001"     // fixed identity of the journey's process
  initialStation="1-event"
/>
```

### Why this works as the spine

| Module concept (old, concept-ladder) | Becomes a station of the journey (new) |
|---------------------------------------|-----------------------------------------|
| Module 1 "the contracting process" | The **Events** station — what a process *is*, before any data exists |
| Module 2 "releases and packages" | The **Released** station — what the record looks like |
| Module 3 "identifiers" | **Trace mode** through Events → Released; Station 3 (the `ocid` boundary) |
| Module 6 "mapping" | The transition **Mapped → Released** |
| Module 7 "red flags" | The **Analyzed** station |

The concept modules don't disappear — they become **the explanatory content attached to each station**, and the lens components (below) live inside them.

---

## Station lens components

Each station has a *lens* — a specialised viewer for the artefact at that station. Lenses are where the original concept widgets live, now contextualised.

### Station 1 — Events: `EventCard`

**Shows:** the real-world procurement event behind the contracting process, as a human story. Buyer, need, what was bought, when the notice went out. No JSON yet.

```tsx
<EventCard
  buyer="DENR Region VII"
  need="50 laptops for field offices"
  noticeDate="2024-03-01"
  method="Public bidding"
  story="A regional office needs to equip field staff. The notice goes up on PhilGEPS..."
/>
```

**Teaches:** what a contracting process *is* before any data exists (outcome 1). Anchors the journey in something concrete. The station's framing makes one thing explicit: **everything in OCDS begins as an event** — a notice posted, a bid received, an award made. Events are the atomic input; releases are how events are published.

### Station 2 — Extraction: `RawRowViewer`

**Shows:** the flat source row, exactly as exported. One row, typed.

```tsx
<RawRowViewer
  row={rawPhilgepsRow}              // straight from jsonl/sample/2023.jsonl shape
  columns={philgepsSchema3Columns}  // 43-column Schema 3 layout
  highlight={['Reference ID', 'Awardee Corporate Title', 'Award Date']}
/>
```

**Teaches:** source data is flat, denormalized, line-item-granular. Sets up the structural challenge (outcome 6, bridge to outcome 13). Reuses the workspace's actual Schema 3 column list from `PHILGEPS_PIPELINE_ARCHITECTURE.md` §1.2 — this is real, not invented.

### Station 3 — Mapped: `CanonicalMapper`

**Shows:** the flat row's fields unified into canonical semantic fields, then mapped to OCDS paths. This is where "mapping" is *shown happening*, not described. It is also where the event joins its contracting process — by deriving its `ocid` from the process identifier.

```tsx
<CanonicalMapper
  rawRow={rawPhilgepsRow}
  canonical={canonicalRow}
  mappings={schemaMappings}         // arrows: raw column → canonical field
  ocdsMappings={canonicalToOcds}    // arrows: canonical field → OCDS path
  highlightMapping={['Reference ID → bid_reference_no → ocid + tender.id']}
/>
```

**Teaches:** why a canonical layer exists (different source schemas across years, one semantic model). The arrows are the entire lesson. (Outcome 6, 13.)

**Process-boundary callout (carried here, open decision D11 resolved).** This station is the natural home for the most important identity lesson in the primer: **what starts a contracting process?**

> The process boundary is the `ocid` — not the calendar and not a universally prescribed source column. OCDS says to construct it from the publisher's best stable internal identifier for the contracting process. In the exports currently available here, `bid_reference_no` is the strongest observed tender-stage key. If future APP data exposes an earlier identifier that is unique and persists across tender, award, contract, and implementation, it may be the better root. If one APP entry leads to multiple attempts, retain it as planning provenance and give the attempts distinct, related `ocid` values.

A second callout warns against treating fallback fields as interchangeable. Sample analysis found 679 solicitation values in S3 2021 mapping to multiple unrelated bids (one solicitation, 62 bids). Solicitation, award, and other fallbacks need separate namespaces, provenance, and collision tests. They must not silently claim the same boundary confidence as a valid bid reference. Source: [`OCDS_PROCESS_AND_RELEASE_IDENTITY.md`](../philgeps_schema_analysis/docs/OCDS_PROCESS_AND_RELEASE_IDENTITY.md).

### Station 4 — Record: `RecordViewer`

**Navigation contract.** Record is a parent experience. Three numbered cards act as tabs for the release index, compiled release, and versioned release, with only one panel rendered at a time. The Release Index opens with only the contextual cards visible, so the learner first reads the process sequence. Selecting a card opens its complete release in a fixed-height modal, preserving the stable index layout and giving the release enough reading width. The modal itself never scrolls: its title, metadata, dedicated URL, and previous/next controls remain visible while only the expanded JSON pane scrolls internally. Previous/next controls walk the release sequence without closing the modal and keep the selected index card synchronized; the endpoints are visibly disabled. The modal closes through its close action, Escape, or the backdrop. Each release retains its own URL; the detail route uses the same index-oriented model with overview, previous, and next controls.

**Possible Journeys evidence viewer.** Real source rows and their reconstructed current-state release use the same fixed modal shell but default to a readable view. Flattened source fields are grouped into process identity, tender, item, award, and contract sections. The OCDS view presents headline counts, tender facts, items, every award and supplier, every contract and its `awardID`, and the parties list. JSON is retained behind an explicit toggle for technical inspection; it is not the initial view.

**This station carries the most important conceptual beat in the primer.** Per the canonical OCDS reference ([How is OCDS data published?](https://standard.open-contracting.org/latest/en/primer/releases_and_records/)):

- The procurement story is a **contracting process** (one `ocid`).
- A contracting process has **one record**, and that record contains **three things**:
  1. a **release index** — an index of all releases for the process
  2. a **compiled release** — current state generated with the OCDS merge rules
  3. an optional **versioned release** — all published field values with source-release provenance

A release, in turn, is JSON published each time the process changes; releases are immutable, there are many per process, and together they form the process's change history.

`RecordViewer` is a single component with three panes that mirror the record's structure exactly. Only one pane is open at a time. The learner doesn't read about "release vs record vs compiled" in the abstract — they move among three views fed by the same contracting process.

#### 4a. The release index pane (`ReleaseTimeline`)

**Shows:** the **release index** — every release for this `ocid`, each immutable, each with its own `id` + `date` + `tag`.

```tsx
<ReleaseTimeline
  ocid="ocds-philgeps-2024-001"
  releases={[
    { id: '001', date: '2024-03-01', tag: ['tender'],              summary: 'Notice posted' },
    { id: '002', date: '2024-03-18', tag: ['tenderAmendment'],    summary: 'Deadline extended' },
    { id: '003', date: '2024-04-05', tag: ['award'],               summary: 'Awarded to ABC Trading' },
    { id: '004', date: '2024-04-20', tag: ['contract'],            summary: 'Contract signed' },
    { id: '005', date: '2024-06-10', tag: ['implementation'],      summary: 'First delivery milestone met' },
  ]}
  onReleaseSelect={(r) => setJsonPreview(r)}
/>
```

- Each release is a node; clicking one navigates to **that release's own sub-station** at `/journey/4-record/:releaseId`, where the release's JSON is shown in an `AnnotatedJsonTree`. The sub-station has prev/next paging along the release timeline, so the learner can walk the event history release by release.
- A gutter annotation makes immutability concrete: "you cannot edit release 002 — you publish 003 instead."
- The compiled and versioned releases are **not** sub-stations — they are peer views of the whole record, rendered as cards on the station 4 page itself. The asymmetry is deliberate and mirrors the record schema: releases are the atomic input; compiled and versioned are derived aggregates.

#### 4b. The compiled release pane (`CompiledReleaseView`)

**Shows:** the compiled release—the current-state view generated chronologically by the primer's OCDS 1.1.5 merge subset. The primary presentation is a lifecycle summary, not a JSON dump: headline facts, Tender/Award/Contract/Implementation cards, and a compact relationship flow make the current state readable. Literal values, objects, identified arrays, schema-defined whole-list arrays, missing fields, and nulls do not all merge the same way. The implementation is sufficient for the base-schema structures in this fixture; it is not presented as an extension-aware replacement for the official merge implementation.

**Optional codelist exercise.** After the Record viewer, learners can reveal a four-row exercise covering `tender.status`, `tender.procurementMethod`, `awards[].status`, and `contracts[].status`. They select every invalid value, receive per-row explanations, and can retry. The exercise reinforces that a correct path and JSON type are insufficient when the value is outside the field's codelist or represents a different concept such as contract signature.

```tsx
<CompiledReleaseView release={record.compiledRelease} />
```

The complete raw JSON remains available in a collapsed disclosure for verification and advanced inspection. It is evidence behind the explanation, not the default reading experience.

#### 4c. The versioned release pane (`VersionedReleaseView`)

**Shows:** the optional versioned release—all published values over time. Its primary presentation is a change browser: summary counts, lifecycle-section filtering, a changed/added/unchanged table, and a selected-field history linked to the source releases. Each versioned value includes `releaseID`, `releaseDate`, `releaseTag`, and `value`; identified arrays retain their array shape and object IDs.

```tsx
<VersionedReleaseView release={record.versionedRelease} />
```

For the worked example, this pane makes the tender amendment vivid: `tender.tenderPeriod.endDate` shows `2024-03-20` (from release 001) then `2024-03-25` (from release 002), with each value tagged by its source release.

The complete versioned JSON is retained in a collapsed disclosure. This preserves transparency without requiring a newcomer to infer a change history from a deeply nested schema structure.

#### Single publishing model: incremental / full event history

The primer teaches **one** publishing model: the canonical OCDS model where a publisher emits a **new immutable release every time the contracting process changes**, and a **record** aggregates those releases into a release index, a compiled release, and a versioned release. The compiled and versioned views are *derived from the release history* — never published as the process's "real" data.

Release inspection uses one UI contract across chapters: a large modal with fixed identity and navigation, Readable view and JSON view, and a separately scrollable data region. Real flattened-data examples reuse the record's visual frame but show only the reconstructed current-state release and source evidence; unavailable history, compiled, and versioned views are labeled rather than fabricated.

**Next implementation step:** consolidate the currently shared readable renderer and parallel modal shells into one `ReleaseInspector`. The component must support modal and standalone-route contexts, optional previous/next navigation, provenance/type labels, and a caller-provided addressable URL. Publication & Portfolio must reuse this component rather than introduce another release viewer.

This is a deliberate choice (open decision **D10**, resolved): the primer teaches the standard correctly rather than leading with a simplification. It also matches what a contracting process actually is — a sequence of events over time, not a single snapshot.

**Honest note on the pipeline.** The workspace's `compile_ocds.py` creates artifacts labelled as compiled releases, but its process grouping and multi-award handling are under review; see [`11_etl_observations.md`](11_etl_observations.md). The primer's worked-example `releases[]` and record remain **illustrative of the target incremental publishing model**. Chapter 2 uses a separate audited POC transformation and calls each real result a reconstructed current-state release, not a source history or compiled record.

> **Authoritative source:** [How is OCDS data published? — releases and records](https://standard.open-contracting.org/latest/en/primer/releases_and_records/) (OCDS 1.1.5 primer). Also: [`OCDS_PROCESS_AND_RELEASE_IDENTITY.md`](../philgeps_schema_analysis/docs/OCDS_PROCESS_AND_RELEASE_IDENTITY.md) §"Live / incremental publishing"; [OCDS merging guidance](https://standard.open-contracting.org/latest/en/guidance/build/merging/).

### Station 5 — Indicators and Red Flags: `RedFlagPlayground`

**Shows:** three illustrative checks computed from the flagship's compiled release: a competition signal, a timing condition that is not met, and a publication-quality gap. Summary counts establish the mix of outcomes; selecting a result exposes the exact OCDS paths and values behind it.

#### `RedFlagPlayground`

The result list and evidence panel use progressive disclosure. Each result states a question for human review, and a fixed caution distinguishes a risk signal from proof of wrongdoing. This avoids teaching learners to treat automated checks as verdicts.

```tsx
<RedFlagPlayground />
```

The station closes the introductory journey explicitly: one process can raise questions, but supplier concentration, recurring buyer behaviour, and spending patterns require many contracting processes. A preview points to the next chapter, Possible Journeys, without pretending that chapter already exists.

**Teaches:** indicators are queries over structured paths; clear, signalled, and unavailable results are all meaningful; coverage matters; and contextual review remains essential.

#### `GapAnalysisPane` (Phase 2, renders when `example.gapAnalysis` is present)

The later DOLE example carries a `gapAnalysis` object that this pane renders directly. It extends the flagship's small publication-quality check into the concrete payoff of OCDS's structure: ambiguity becomes signal.

```tsx
<GapAnalysisPane
  gap={example.gapAnalysis}    // from the DOLE WorkedExample
/>
```

The pane shows three things side by side:

1. **Flat export view** — what a spreadsheet user sees (a blank `Contract Amount` cell) and why it's ambiguous.
2. **OCDS view** — what the record shows (an `active` award with no `contracts[]` referencing it) and the one-line `jq` query that finds every dangling award in a dataset.
3. **Blocked indicators** — the downstream checks the gap prevents (`final-vs-award-value`, `contract-timeliness`, `implementation-delivery`), each with the path it needs and why it matters.

**Gap toggle:** the learner can flip the missing contract "on" (fill in a plausible contract) and watch the blocked indicators light up — making the cost of the gap tangible. Flipping it back "off" disables them again.

The gap toggle and full comparison remain Phase 2 work, when the Possible Journeys chapter introduces the DOLE process.

---

## Cross-journey interactives

These aren't tied to a station; they're checkpoints the learner hits *between* stations.

### `FieldTracer` — intermediate exploration

This is deliberately separate from the introductory `ProcurementJourney`. After completing the process story, an intermediate learner can pick a source field and inspect its full life across the pipeline, including which release introduced each change. It reads from the record's versioned release.

```text
"Bid Reference No." = "2024-001"
   ↓ (Raw JSONL)         preserved verbatim
   ↓ (Canonical)         bid_reference_no: "2024-001"
   ↓ (Released/OCDS)     becomes ocid suffix:  ocds-philgeps-2024-001
                         AND tender.id in the tender release (release id=001)
   ↓ (Record)            versioned release shows: tender.id = "2024-001" (release 001, 2024-03-01) — unchanged since
   ↓ (Analyzed)          used by identity/uniqueness checks; Cardinal keys on ocid
```

```tsx
<FieldTracer
  datum="Bid Reference No."
  value="2024-001"
  journey={workedExample}     // reads workedExample.record.versionedRelease for the change history
/>
```

**Teaches:** the three identifier layers by *following one through the pipeline* (outcome 5) — far more concrete than the original quiz-first approach. Crucially, it shows that a single source datum (`bid_reference_no`) can populate fields at **multiple** OCDS layers: it becomes the `ocid` suffix (process-level) *and* `tender.id` (in-object) *and* is published across **multiple releases** of the same process. The versioned release is what makes the "changed in release X, unchanged since" story rigorous. The original `IdentifierLayersQuiz` becomes an optional knowledge-check at the end of this page, not the main event.

### `KnowledgeCheck` (carried over, unchanged)

1–3 questions at the end of each station's explanatory content. Data-driven from MDX frontmatter. Scores persist to `localStorage`. Unchanged from the original plan.

---

## Component inventory (revised)

| Component | Role | Stations used in |
|-----------|------|------------------|
| `ProcurementJourney` | The spine — subway map of all 5 stations | Module 1 (intro), recurs as the hub |
| `EventCard` | Lens for the Events station | Station 1 |
| `RawRowViewer` | Lens for the Extraction station | Station 2 |
| `CanonicalMapper` | Lens for the Mapped station | Station 3 |
| `RecordViewer` | Wrapper for Station 4 — the contracting process's record (parent with release sub-stations) | Station 4 |
| `ReleaseTimeline` | Pane 4a — cards-only release index; selecting a card opens a complete release modal with a link to its addressable sub-station | Station 4 (inside `RecordViewer`) |
| `CompiledReleaseView` | Pane 4b — lifecycle-oriented current state, with raw JSON as a secondary disclosure | Station 4 (inside `RecordViewer`) |
| `VersionedReleaseView` | Pane 4c — filterable per-field change history, with source-release links and secondary raw JSON | Station 4 (inside `RecordViewer`) |
| `RedFlagPlayground` | Indicator toggles — shows how paths become signals | Station 5 |
| `KnowledgeCheck` | One mental-model question after each station, with retry explanation and an end-of-journey completion state | All five stations |
| `GapAnalysisPane` | Renders `gapAnalysis` payload (DOLE example) — the "missing data is visible in OCDS" beat | Station 5 |
| `FieldTracer` | Cross-journey trace of one datum — reads the versioned release | Bridges stations |
| `KnowledgeCheck` | Per-station recall (carried over) | End of each station |

The original concept widgets — `LifecycleTimeline`, `CodelistSpotter`, `MappingExercise`, `IdentifierLayersQuiz` — are **folded into the journey** rather than dropped:

| Original widget | Now lives as |
|-----------------|--------------|
| `LifecycleTimeline` | The horizontal layout of `ProcurementJourney` itself (the 5 stages are the 5 stations, for the lifecycle subset) |
| `MappingExercise` | The arrows in `CanonicalMapper` (shown happening) + a small "try one" mini-exercise at the end of Station 3 |
| `IdentifierLayersQuiz` | A knowledge check inside `FieldTracer` |
| `CodelistSpotter` | A small "valid/invalid" toggle exercise inside Station 4 (`AnnotatedJsonTree`), showing how codelist values are checked |

This collapses 6 widgets + a quiz pattern into **one spine + 5 lenses + 1 tracer**, each of which earns its place against a specific station.

---

## Principles (mostly carried over, tightened)

1. **Every interactive must teach a specific transformation.** A station must show data *changing form*, not just data sitting still.
2. **Stateful, not just animated.** The learner drives the step; the page doesn't auto-play.
3. **Reset-able and share-able.** Each station's state encodes in the URL (e.g. `/journey?station=released&trace=bid_reference_no`).
4. **Accessible by default.** Keyboard parity, ARIA, reduced-motion, and a **static fallback** for every station (the subway diagram itself is the print fallback — it's already a single image).
5. **Same process, every station.** The components receive lifecycle slices of one `WorkedExample`, and each station says what happened to that process next.

---

## Accessibility & fallback contract

Unchanged from v1, restated for the journey model:

- **Keyboard:** every station selectable via tab and prev/next navigation operable without a pointer. The later field explorer must also be keyboard accessible.
- **ARIA:** the subway map is a labelled `<ol>` of stations in the DOM, not just a visual SVG.
- **Reduced motion:** transitions between stations are instant.
- **Static fallback:** the full subway diagram (all 5 station cards in a row) *is* the print/no-JS view — it's a complete, readable summary on its own. Each station's expanded artefact degrades to a labelled code block + caption.

---

## What we are NOT building (anti-scope, tightened)

- **A live pipeline runner.** The journey shows *curated* artefacts from the real pipeline, not a live execution. (Live execution is a v3+ "expert mode" idea at most.)
- **A free-form JSON editor.** Curated examples only.
- **The full mapping workspace.** That's the explorer's job; the journey's Station 3 is a *demonstration*, with a CTA to the explorer.
- **All 73 OCP red flags.** Station 5 ships with 2–3 in v1; the catalogue links out.
- **Gamification.** Knowledge checks + a station-progress rail are enough.

### Station knowledge checks

Each introductory station ends with one multiple-choice check. The question tests the station's central distinction—event versus publication, row versus process, OCID versus labels, release versus record, and signal versus verdict. Answers produce immediate explanatory feedback and can be retried. Passing the final Analytics check reveals the introductory journey completion state and the hand-off to Possible Journeys. Results are intentionally session-only in Phase 1; persistent scoring remains Phase 2 work.

---

## Data shape: `WorkedExample`

The flagship stores immutable releases under `sourceHistory`. The application derives the conformant embedded-release record, compiled release, and versioned release from that single history. Display summaries remain teaching metadata and are not inserted into the OCDS release objects.

The repository currently contains three designed examples spanning different shapes. Only the flagship is exposed in the first journey; the other shapes seed the later gallery and can be replaced or supplemented with suitably publishable real-world data:

| `meta.id` | `meta.shape` | Releases | % in real data |
|-----------|--------------|---------:|---------------:|
| `denr-r7-laptops-2024` | `full-lifecycle` | 7 | ~10% |
| `dole-computer-upgrades-2002` | `award-only` | 2 | ~19% |
| `chr-office-tables-2002` | `cancelled` | 2 | ~70% |

```ts
type WorkedExample = {
  meta: {
    id: string; title: string; description: string;
    shape: 'full-lifecycle' | 'award-only' | 'cancelled' | 'unsuccessful';
    fictional: boolean;          // all primer examples are fictional — shaped on real records
    shapeNote?: string;          // what this shape represents in real PhilGEPS data
    ocdsVersion: string;         // '1.1.5'
  };

  // Station 1 — the event
  event: { buyer: string; need: string; noticeDate: string; method: string; story: string };

  // Station 2 — flat source
  rawRow: Record<string, unknown>;            // schema_1 or schema_3 shape, per source
  rawColumns: { name: string; description: string }[];

  // Station 3 — canonical + mappings
  canonicalRow: Record<string, unknown>;
  rawToCanonical: { from: string; to: string }[];
  canonicalToOcds: { from: string; to: string }[];

  // Station 4 source: immutable releases plus separate teaching summaries
  ocid: string;
  sourceHistory: {
    releases: {
      id: string; date: string; tag: string[];
      summary: string;                       // UI metadata, outside OCDS data
      url: string;
      partial: OcdsRelease;                  // schema-valid immutable release
    }[];
  };

  // Generated at runtime from sourceHistory, not hand-authored
  record: {
    ocid: string;
    releases: OcdsRelease[];                 // embedded release index
    compiledRelease: OcdsRelease;            // validated current-state merge for this fixture
    versionedRelease: VersionedRelease;      // optional history view shown here
  };

  // Station 5 — Indicators and Red Flags
  redFlags: {
    code: string; name: string;
    paths: string[]; status: 'flagged' | 'clean' | 'no_data';
    explanation: string;
  }[];

  // FieldTracer
  trace: { datum: string; steps: { station: string; value: string; note: string }[] }[];
};
```

At build time, the flagship's releases and generated compiled release validate against the canonical 1.1.5 release schema, its versioned release validates against the canonical versioned-release schema, and the complete envelope validates against the record-package schema. See `site/scripts/validate-examples.mjs`.

---

## Open questions for review

- Is **5 stations** the right granularity, or should Events' first two stations (event + extracted) merge (some learners won't care about the JSONL step)? Lean: keep them separate — the typing/line-delimiting step is where "raw but machine-readable" becomes possible.
- **Field tracing is resolved (D13):** it does not ship inside the introductory journey. It becomes a separate intermediate exploration only after the process, release, and record concepts have been taught.
- Should the journey default to **"follow the steps" mode** (one station at a time, prev/next) or **"see it all" mode** (all five visible, click to expand)? Lean: "see it all" default for the wow-factor + comprehension; prev/next as the secondary mode for step-by-step learning.
- For Station 4, the publishing model is settled (open decision **D10**, resolved): the primer teaches **incremental publishing with a full event history** — the canonical OCDS model. The compiled view is shown as the output of merging, never as "the release." Real Chapter 2 fixtures are instead labelled reconstructed current-state releases because their flattened source does not provide publication history.
- **The example sequence is settled (D12):** one labelled synthetic flagship first; then real or real-shaped variants; then release and record packages containing multiple processes; finally a drillable portfolio view.
