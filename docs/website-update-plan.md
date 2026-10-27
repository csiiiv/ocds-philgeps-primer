# OCDS Primer Website Update Plan

Date: October 27, 2026  
Status: Implemented and **published** to <https://csiiiv.github.io/ocds-philgeps-primer/> (commit `eccaa48`, deployed and verified 2026-10-27). Actual PhilGEPS schema/worksheet integration and production mapping decisions remain dependent on source-owner input.

## Purpose

Extend the primer from an introduction to OCDS into a practical companion for the PhilGEPS field-level mapping workshop. Keep the existing five-station journey and build on its worked examples, Field Explorer, Possible Journeys, and publication chapter.

The accepted [structure review](structure-review.md) guided the desktop restructuring now implemented locally: grouped navigation, a focused introduction, compact replay summaries with a shared inspection workspace, and clearer ownership of mapping lessons. Desktop targets are 1440×900, 1920×1080, and 2560×1440; dedicated mobile optimization is deferred.

The [workshop outline](PhilGEPS_OCDS_Workshop_Outline.md) supplies the teaching sequence. The [discussion summary](PhilGEPS_OCDS_Refresher_Discussion_Summary.md) identifies the mapping and implementation questions. The [data-model and mapping supplement](PhilGEPS_OCDS_Supplement_Data_Model_and_Mapping.md) adds release anatomy, shared structures, organization identity, and a proposed two-lot workshop example.

## Implementation progress

- Fixed Possible Journeys section links and section scrolling so Shape, Timeline, Record, and Questions preserve the journey route.
- Added complete record JSON inspection to the synthetic DENR journey and Station 4, using the same generated record as the existing views.
- Clarified that the real-source examples expose reconstructed releases without claiming the original publication history.
- Corrected source-row/event explanations and the buyer/procuring-entity exercise. The formal-amendment check now distinguishes amendment tags from update tags.
- Added the [Mapping Guide](../site/src/pages/MappingGuidePage.tsx) at `/mapping`, covering release anatomy, four mapping tasks, shared structures, organization references, and interactive codelist practice.
- Added the [procurement replay](../site/src/pages/SimulationPage.tsx) at `/simulation`, with manual/autoplay controls, historical event inspection, independent publication/record modes, pending-work indicators, immutable archived releases, field changes, retained values, and JSON/package downloads.
- Added an evolving source-database overview to the replay: eight fictional tables with row counts, keys, joins, OCDS destinations, highlighted inserts/updates, captured before/after changes, and downloadable snapshots. Source rows advance before publication jobs; private notes remain internal. Historical inspection and missing completion dates stay explicit.
- Added a View JSON button to each release row in the latest generated record. It opens the shared inspector directly in JSON view, with previous/next navigation through the record's included publications. Inspecting pauses autoplay and preserves the record snapshot and source-event selection.
- Added the [solar-pump lab](../site/src/pages/SolarLabPage.tsx) at `/mapping/solar-pumps`, using fictional source joins, three items across two lots, separate buyer/procuring entity, two awards/contracts, a supplier-name correction, and an alternative same-supplier scenario. Added project and re-bidding boundary comparisons.
- Extended audited Field Explorer traces with source/version availability, types, join rules, classifications, review status, and explicit fixture assumptions. Trace selections now survive reload through their URL.
- Restructured navigation into Learn OCDS, Map data, Workshop, and Reference, with station links contextual to the introduction and one recommended action on the home page. The desktop replay uses a persistent event rail, three compact summaries, a wide inspection workspace, and a shared artifact picker. Independent timing settings are optional while pending/stale states remain visible.
- Split the Mapping Guide into selected topics, reduced repeated introductory teaching, made codelist practice one decision at a time, and moved detailed field evidence after the concrete transformation. The solar lab now has Source → Mapping → Result steps; workshop views separate the agenda, compact template list, and outputs. Existing anchors and URLs remain supported, including a redirect from the old lab process-boundary anchor.
- Added the [workshop path](../site/src/pages/WorkshopPage.tsx) at `/workshop`, with agenda-linked exercises, a temporary recap checklist, and three supplied Excel mapping workbooks from [templates](../templates/) and a link to the OCDS Mapping Explorer. The original supplementary CSVs remain available at their existing URLs.
- Updated navigation, search, glossary, FAQs, and official references. Fixed glossary/FAQ fragment links and mobile keyboard/accessibility issues encountered in the new learning paths.
- Vendored the official Lots extension 1.1.5 metadata/schema patch for offline checks. Added tests against the actual site data modules for all nine timing combinations, record/history semantics, batch publication order, both supplier variants, extended schema validation, and object references.

The implementation preserves the existing five-station journey and the earlier navigation/record-view fixes. The validation commands and browser setup are documented in the [README](../README.md). Automated accessibility checks complement browser checks; they do not replace a manual assistive-technology review.

### Validation completed

- `npm run build`: existing example/package validation, 18 learning-data/schema/semantic checks, TypeScript checks, and production bundling passed.
- `npm run test:e2e -- --project=desktop`: 18 browser checks passed after restructuring, covering grouped navigation, a single introductory action, topic/legacy anchors, retained exercise state, all replay controls, unpublished source changes, exact per-release JSON, downloads, keyboard navigation/focus, and layouts at 1440×900, 1920×1080, and 2560×1440.
- Automated WCAG A/AA checks reported no violations in the tested default pages, mapping topics, lab/workshop views, replay source/release/record views, versioned history, and active release inspector. These are automated checks, not a manual assistive-technology review.
- The earlier feature implementation was also checked with a production build and preview under `/ocds-philgeps-primer/`. The desktop restructuring and all workshop features were published on 2026-10-27 (commit `eccaa48`) and verified live: the GitHub Actions deploy workflow passed, the four new routes serve correctly, and the three Excel workbooks download with their original filenames preserved. Dedicated mobile optimization remains deferred.

### Remaining source-dependent work

- Replace or supplement the fictional relational schema with actual PhilGEPS/eBiz source schemas, field definitions, mapping worksheets, and suitable sample records when supplied.
- Confirm production identifier schemes, source-key uniqueness/cardinality, migration continuity, and publisher prefix before using production metadata.
- Agree actual codelist crosswalks, publication eligibility, release triggers, history-capture mechanisms, and re-bidding boundaries with the source owners and reviewers.
- Capture real owners, decisions, milestones, and workshop outputs in the team's agreed shared process. The website does not infer these from the preparation documents.

## Revise existing explanations

| Area | Revision |
|---|---|
| Source rows and events | Correct the “one row per event” explanation. One export row can contain several lifecycle stages; multiple rows can represent items or awards within one process. Distinguish source-row grain, business events, contracting processes, and publications. |
| Releases and history | Explain that a new release can repeat unchanged information. Preserve earlier publications rather than editing them. Distinguish observed release histories, synthetic teaching histories, and reconstructed current-state data. |
| Compiled releases | Retain this official OCDS concept. Define a compiled release as the latest known state assembled from releases for one OCID using OCDS merge rules. It is not necessarily the newest individual release. A record indexes releases, should contain a compiled release, and may contain a versioned release. |
| Record JSON inspection | Expose the complete record object alongside individual release JSON wherever a complete release history is available. Include `ocid`, `releases`, `compiledRelease`, and optional `versionedRelease`, and explain the record-package wrapper. For reconstructed current-state examples, explicitly identify that the complete record is unavailable. |
| Identifiers and policy | Reinforce the distinction between project, planning, process, release, award, and contract identifiers. Label source-key choices, identity fallbacks, re-bidding boundaries, and publication architecture as implementation decisions supported by evidence. Preserve process identity across lifecycle changes and system migrations. |
| Organization roles and references | Revise the buyer-name mapping exercise and related explanations that imply the buyer is always the procuring entity. Explicitly state when the example organization plays both roles, then add a contrasting case with separate organizations. Distinguish copying an organization's name from constructing an organization reference using its ID and name. |

## Add and expand lessons

### 1. Four-part Mapping Guide

Begin with a short release-anatomy lesson spanning Stations 3–4: distinguish release metadata (`ocid`, `id`, `date`, `tag`, `initiationType`) from lifecycle objects, `parties`, organization references, and `relatedProcesses`. Show that releases include the sections relevant to the information being published, rather than requiring every lifecycle section at every stage.

Then expand Station 3 with a guide covering:

- **Field mapping:** Where does each value come from, and what transformation does it need?
- **Identifier and relationship mapping:** How are processes, organizations, awards, contracts, and their relationships identified consistently?
- **Codelist mapping:** How do source codes and their meanings correspond to OCDS codes?
- **Event/release mapping:** Which changes warrant publication, and which release tags describe the information being published?

Teach direct mappings, derived values, transformations, missing data, assumptions, and unresolved questions. Demonstrate mappings against sample records and generated JSON, alongside the worksheets.

### 2. Visible codelist lesson and mapping practice

Codelists currently have glossary definitions and an optional “Spot the invalid codelist values” exercise in Station 4. Add a visible lesson in Station 3 and retain the existing exercise as reinforcement.

Cover:

- Field mapping versus value mapping.
- Open and closed codelists, exact case-sensitive codes, and codes versus display labels.
- Comparing source definitions with OCDS definitions rather than matching labels alone.
- Preserving local procurement-method detail in `tender.procurementMethodDetails`.
- Handling unknown values, unresolved mappings, and documented extensions where appropriate.
- Distinguishing an invalid code from a valid code used with the wrong meaning.

Start with procurement methods, tender/award/contract statuses, party roles, and release tags. Provide a small mapping exercise with an “unresolved—needs clarification” option. A worksheet row should capture source code and definition, target field and code, rationale, and review status.

### 3. Relational data to nested OCDS objects

Extend Field Explorer to show source tables and joins beside the resulting `parties`, `planning`, `tender`, `awards`, `contracts`, and `relatedProcesses` structures. Show that implementation information belongs within contracts.

Add source-system/schema version, table and column, data type, join/cardinality rule, mapping classification, assumptions, and review status to relevant traces. Highlight one-to-many relationships and explicit references such as `contracts[].awardID`.

Use the supplement to add two focused lessons:

**Organization identity and references**

- Trace `buyer`, `tender.procuringEntity`, and `awards[].suppliers` back to matching entries in `parties`.
- Distinguish `parties[].id` (the cross-reference key), `parties[].identifier` (a scheme and organization identifier), and `additionalIdentifiers`.
- Show one organization holding multiple roles and a separate example where buyer and procuring entity differ.
- Explain why `parties` is not automatically a deduplicated global organization registry. Cross-process analysis still needs consistent identifiers and documented resolution rules.
- Keep sample registration schemes visibly fictional until actual schemes and source identifiers are verified.

**Reusable structures**

| Structure | What the example should teach |
|---|---|
| OrganizationReference | ID/name references resolve to the intended party. |
| Item and Classification | Join descriptions, quantities, units, and classification codes from source tables. |
| Value | Include amount and currency; distinguish tender estimates, award values, and contract values rather than assuming they are interchangeable. |
| Period | Distinguish publication timestamps, bid-submission windows, and contract periods. |
| Document | Preserve source URLs and map document types and dates. |
| Milestone | Separate targets, status, and actual completion dates. |
| Amendment | Preserve object identity and explain the change with amendment metadata as well as updated values. |

For workshop mapping rows, also capture the source field's business meaning, publication eligibility (public/restricted/undecided), intended use case, and validation evidence. These are mapping decisions to document, not assumptions to infer from column names.

### 4. “Watch a procurement unfold” simulation

Make an evolving procurement story the central new interaction. Reuse the existing synthetic flagship example so learners can connect it to the five stations.

| Story event | Illustrative release tag | Record effect |
|---|---|---|
| Tender published | `tender` | First release is indexed; initial compiled state is available. |
| Formal deadline amendment | `tenderAmendment` | New release is added; compiled deadline changes; the earlier deadline remains traceable. |
| Award announced | `award` | Award and supplier information are added. |
| Contract signed | `contract` | Contract is added and linked to its award. |
| Delivery progress published | `implementation` | Initial implementation information is added. |
| Delivery progress updated | `implementationUpdate` | Latest progress changes; earlier publications remain available. |

For each step, show three connected panels:

1. **What happened:** Plain-language story and source changes.
2. **What was published:** New release, OCID, release ID, publication date, tag, and highlighted fields.
3. **What the record contains:** Release index, compiled release, and optional versioned history.

Allow manual advance, autoplay, pause, reset, and inspection of earlier steps. Keep the same OCID throughout this story and make the growing release history visible. Highlight retained values as well as changed values so learners see why the compiled release differs from the newest release.

Explain how a publication rule selects meaningful changes; routine database updates do not automatically warrant releases. The simulation should be clearly labelled as simulated rather than connected to live PhilGEPS data.

In the later relationship exercise, demonstrate a correction to a supplier's display name under the same party ID and another award referring to an existing supplier. Show how stable object IDs let merge rules update the intended object or retain an additional award. Contrast correcting the same organization with introducing a different legal entity; a similar name alone does not establish identity.

### 5. Publication timing and record-generation modes

Distinguish when releases are generated/published from when records and their derived views are assembled. These are separate implementation choices.

| Mode | Release generation/publication | Record generation |
|---|---|---|
| Event driven | A qualifying application event triggers processing and publication. | A new release triggers an update to the record. |
| Scheduled | A job processes captured events or detected changes. | A job rebuilds affected records. |
| On demand | An explicit operation publishes eligible unpublished changes. | A request assembles a record from archived releases. |

Add timing controls after the basic story works. Show event time, publication time, and pending processing separately. A published record should reflect the releases available when it is generated.

Requesting a record does not itself create a procurement release. Repeated requests or job runs should not create duplicate publications for the same processed change. Scheduled extraction from overwritten current-state data can miss intermediate changes unless audit/event history is retained; record generation cannot recover history that was never captured.

### 6. Expanded process-relationship scenarios

Build on the existing multiple-award example and add explicit comparisons for:

- One tender with multiple awards and contracts under one OCID.
- One project or planning reference linked to several contracting processes.
- Failed bidding and subsequent re-bidding, with continuity or separate related processes determined by a consistent publication policy.

Teach `relatedProcesses` relationships separately from release tags. Do not imply that every cancellation or re-bid automatically requires a new OCID.

Add the supplement's fictional solar-pump procurement as a second, focused mapping lab with two lots, two awards, and linked contracts. Keep DENR as the introductory story. In the lab, learners should follow source tables and keys through party references, item/lot relationships, releases, and the resulting record, then identify the corresponding actual PhilGEPS tables with eBiz.

For OCDS 1.1.5, lots are provided by the **Lots extension**, not the core schema. Declare a pinned extension version at package level and validate against the extended schema. Teach item-to-lot `relatedLot`, award-to-lot `relatedLots`, and contract-to-award `awardID` references without implying that every table relationship is one-to-one. Do not treat item IDs as lot IDs.

### 7. Workshop path and templates

Add a facilitated route linking existing lessons to the workshop agenda, with short exercises and downloadable templates for field, identifier, codelist, and event/release mapping, plus open issues and decisions.

Capture assumptions, clarification questions, owners, review status, and next actions in the workshop outputs. Keep the goal a repeatable mapping and review process rather than completing every mapping during the session.

Include complete, valid release-package examples for the demonstrated stages and a record-package example. Make the distinction between a release fragment, a full release object, and its publication package explicit. Use the solar-pump lab to produce a small end-to-end mapping example with documented unresolved questions.

## Content and validation requirements

- Label examples as synthetic, observed, adapted, or reconstructed, as appropriate.
- Distinguish confirmed mappings from proposals and unresolved implementation choices.
- Do not present reconstructed legacy exports as evidence of a historical release sequence.
- The mapping workbooks are now supplied in `templates/`; the actual PhilGEPS 2027 database schema/data dictionary is still needed. Keep database examples visibly illustrative until the source schema is available.
- Keep synthetic publication metadata distinct from real publisher metadata. Verify the prefix claim in the notes before using it in production-oriented examples.
- Update glossary entries, FAQs, search, canonical references, and knowledge checks alongside the lessons.
- Validate new JSON fixtures against the appropriate schemas and check identifiers, relationships, merge results, and history semantics.
- Verify party references, object-ID stability, and declared extensions in addition to schema validity. A valid JSON structure does not prove that the joins describe the intended organizations or procurement objects.

## Delivery order (implemented locally)

1. **Foundation:** Correct source-row, history, and buyer/procuring-entity explanations; clarify compiled releases; add release anatomy, the four-part Mapping Guide, and the visible codelist lesson.
2. **Core interaction:** Add the step-by-step procurement simulation with generated releases and evolving record views.
3. **Deeper practice:** Add timing controls, organization/reference and shared-structure traces, the solar-pump mapping lab with its declared Lots extension, process-relationship scenarios, and workshop materials informed by actual schemas and worksheets.

## Official references verified during planning

- [Mapping guidance](https://standard.open-contracting.org/latest/en/guidance/map/)
- [Codelists](https://standard.open-contracting.org/latest/en/schema/codelists/)
- [Releases and records primer](https://standard.open-contracting.org/latest/en/primer/releases_and_records/)
- [Record reference](https://standard.open-contracting.org/latest/en/schema/records_reference/)
- [Merging specification](https://standard.open-contracting.org/latest/en/schema/merging/)
- [Change-history worked example](https://standard.open-contracting.org/latest/en/guidance/build/change_history/)
- [Release schema and reusable building blocks](https://standard.open-contracting.org/latest/en/schema/reference/)
- [Lots extension 1.1.5](https://extensions.open-contracting.org/en/extensions/lots/v1.1.5/)
