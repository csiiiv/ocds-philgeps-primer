# 07 — OCDS Alignment Audit

**Audit date:** 2026-08-04  
**Target:** OCDS 1.1.5, the version exposed by the official `latest` documentation  
**Scope:** the synthetic flagship, generated record views, validation script, and learner-facing claims

## Overall assessment after correction

The primer is **structurally and semantically aligned for its documented teaching scope**. It is not a general OCDS publishing or merge reference implementation.

The seven source releases, generated compiled release, generated versioned release, and assembled record package pass the canonical OCDS 1.1.5 schemas. The release/record distinction, record cardinality language (`must`/`should`/`may`), immutable release history, compiled metadata, and version provenance are substantially correct.

The original audit findings below were corrected in the flagship and guarded by build-time semantic assertions. The remaining boundary is deliberate: the custom merge subset covers the base-schema structures exercised by this fixture and honors its whole-list fields, but it is not extension-aware and does not replace the official merge implementation.

## What is aligned

| Area | Assessment | Evidence |
|---|---|---|
| OCDS version | Aligned | The examples and canonical schemas are pinned to 1.1.5. |
| Release identity | Aligned | Every source release has one `ocid`, a locally unique `id`, a date-time `date`, a closed-codelist `tag`, and `initiationType`. |
| Release history | Aligned | Releases are treated as immutable inputs and ordered chronologically. |
| Record model | Aligned | A record contains its `ocid` and embedded releases, should contain a compiled release, and may contain a versioned release. The UI no longer implies that both derived views are mandatory. |
| Embedded releases | Aligned | A record is permitted to embed complete releases instead of linking to release packages. |
| Compiled metadata | Aligned | The generated compiled release uses `tag: ["compiled"]`, the most recent release date, and `{ocid}-{date}` for its identifier, matching the interim approach in the official merging guidance. |
| Version provenance | Aligned for this fixture | Changed values carry `releaseID`, `releaseDate`, `releaseTag`, and `value` in chronological order. |
| Validation | Strong | Build-time validation covers every flagship source release, the compiled release, versioned release, and a record-package envelope using canonical schemas. |
| Indicator framing | Aligned | Checks expose their OCDS evidence and are explicitly described as questions for review, not findings of wrongdoing. The 14-day threshold is labelled illustrative. |

## Findings requiring correction

### A1 — Delivery events are modeled as spending transactions (high)

**Status: resolved.** Delivery updates now use `contracts[].implementation.milestones[]`; the UI and Analytics station inspect milestone completion dates.

`contracts[].implementation.transactions[]` represents spending transactions made against a contract. The flagship release summaries call these objects deliveries of 25 laptops, and the compiled view labels their count “Deliveries.” This changes the meaning of the OCDS field.

**Correction:** represent deliveries as `contracts[].implementation.milestones[]` with a delivery type, status, and relevant dates. Retain transactions only if the story intentionally includes payments; then describe them as payments and, where available, publish `date`, `payer`, and `payee`.

### A2 — The history reveals the supplier before bids are received (high)

**Status: resolved.** The notice contains only the buyer; the bidder appears in the bid-received release and gains the supplier role in the award release. The notice omits `numberOfTenderers`.

Release 001, the tender notice, already includes ABC Computer Trading with `supplier` and `tenderer` roles. At that point in the story no bid has yet been received and no supplier has been selected. It also publishes `tender.numberOfTenderers: 0`, although that field means the number of parties who submit a bid; at notice publication this is unknown and ought to be omitted, not asserted as zero.

**Correction:** release 001 should contain only parties known at notice publication. Introduce ABC as a tenderer in the bid-received release and add the supplier role in the award release. Omit `numberOfTenderers` until the bids are known.

### A3 — “One event becomes one flat row” conflicts with the fixture (high)

**Status: resolved.** The introductory raw and canonical rows now contain notice-event facts only.

The extraction station says that each event becomes a flat export row. Its displayed row contains notice, closing, award, supplier, and contract facts at once. That is a lifecycle-wide snapshot, not the notice event shown in Station 1.

**Correction:** either show the actual notice row in the introductory path and introduce later rows as later events, or explicitly describe the source row as a denormalized current-state export. The first option better supports the chosen event → release narrative.

### A4 — The merge generator is fixture-aware, not schema-aware (high)

**Status: mitigated and explicitly bounded.** Base-schema whole-list fields are handled, claims now say “merge subset,” and comments direct general implementations to the official reference implementation.

The custom generator infers identifier merge whenever an incoming array consists of objects with string `id` values. OCDS requires the strategy to be selected from a dereferenced schema, including `wholeListMerge` annotations and array-item definitions. Some arrays whose objects contain IDs are explicitly whole-list merged. Schema-valid output does not prove that a merge was generated correctly.

**Correction:** use the official reference implementation or port its schema-directed behavior and test suite. Until then, label this as a deterministic subset sufficient for the flagship, not a general OCDS merge implementation.

### A5 — The bid extension mapping path is inaccurate (medium)

**Status: resolved.** The unused and inaccurate extension mapping was removed from the notice-row mapping lesson. Future bid-extension work must use `bids.details[].tenderers[]` and declare the extension at package level.

The mapping catalogue says `bids[].tenderers[].id`. In the maintained bids extension, individual bids are under `bids.details[]`, and their tenderers are under `bids.details[].tenderers[]`. Any package using the extension must declare its `extension.json` URL in `extensions`.

**Correction:** update the path and introduce the extension declaration when bid objects are added. Core `tender.numberOfTenderers` can continue to support the current single-bid teaching check without the extension.

### A6 — The synthetic OCID looks like a production prefix (medium)

**Status: resolved.** Mapping now explicitly labels `ocds-philgeps` as a fictional teaching placeholder and explains prefix registration.

An OCID is globally unique because the publisher registers a prefix and appends its internal process identifier. `ocds-philgeps-2024-001` is suitable as a teaching placeholder only if it is never presented as a registered production identifier.

The same evidence rule applies to package metadata: a filesystem path or project context is not evidence of a publisher, domain, or resolvable publication URL. The POC release package therefore uses a deterministic `urn:uuid:` and a generic local publisher label. Neither should be copied into production data.

**Correction:** label the prefix as fictional wherever identifier construction is taught, or replace it with a documented example prefix reserved for the primer. Production guidance must state that publishers request a registered prefix.

### A7 — Package publication is validated but not taught yet (medium)

**Status: resolved for Phase 1.** Station 4 now states that release and record objects are published inside metadata-bearing packages and defers the full package lesson visibly.

The source releases are valid release objects, and the validation script constructs a valid record package. However, OCDS releases and records are published inside release and record packages with package metadata. The current release URLs are teaching metadata and do not resolve to release packages.

**Correction:** keep this deferred to the planned publication chapter, but add a boundary note in Station 4: the learner is inspecting release objects inside a record; actual publication wraps them in packages with URI, version, published date, and publisher metadata.

### A8 — The amendment is visible but not explicitly described (low)

**Status: resolved.** Release 002 now carries a tender amendment with description, rationale, date, and before/after release references.

The changed deadline and `tenderAmendment` tag correctly create version history. OCDS also provides `tender.amendments[]` for rationale and links between the before/after releases.

**Correction:** add an amendment object with an identifier, date, rationale or description, `amendsReleaseID`, and `releaseID`. This is optional for schema validity but improves the teaching example.

### A9 — Dormant red-flag metadata is misleading (low)

**Status: resolved.** The unused fixture-level red-flag block was removed; Analytics computes its path-correct illustrative checks from the compiled release.

The fixture still carries unused `R003`, `R024`, and `R038` objects. The UI no longer displays these codes, and the `R038` input path includes `buyer.awards.value.amount`, which is not an OCDS path.

**Correction:** remove this dormant block or replace it with the same explicitly illustrative, path-correct check definitions used by the Analytics station.

## Recommended correction order

1. Correct the event chronology and transaction/delivery semantics (A1–A3).
2. Narrow the merge claims and adopt a schema-directed implementation (A4).
3. Correct extension paths, OCID teaching language, and package boundary notes (A5–A7).
4. Enrich the amendment and remove stale indicator metadata (A8–A9).
5. Re-run canonical schema validation and add semantic assertions for chronology, party introduction, extension declarations, and implementation-event meaning.

## Authoritative references

- [OCDS 1.1.5 release reference](https://standard.open-contracting.org/latest/en/schema/reference/)
- [OCDS 1.1.5 record reference](https://standard.open-contracting.org/latest/en/schema/records_reference/)
- [OCDS merging specification](https://standard.open-contracting.org/latest/en/schema/merging/)
- [OCDS identifiers guidance](https://standard.open-contracting.org/latest/en/schema/identifiers/)
- [OCDS milestone guidance](https://standard.open-contracting.org/latest/en/guidance/map/milestones/)
- [Bids and expressions of interest extension 1.1.5](https://extensions.open-contracting.org/en/extensions/bids/v1.1.5/)
