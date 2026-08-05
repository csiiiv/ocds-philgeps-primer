# 10 — Proof-of-concept ETL fixtures

## Purpose

This proof of concept tests a small number of explicit transformation rules. It is not a production compiler and makes no claim that one grouping strategy works across every PhilGEPS export schema.

The proof of concept treats **source interpretation** as a separate step from **OCDS serialization**. A release is accepted only when its source rows have an explicit grain, process key, array-building rule, and provenance trail. Passing the OCDS schema is necessary but is not evidence that rows were grouped correctly.

The source is `raw/PHILGEPS -- 2021-2025 (CSV)/2023.csv`. Exact source lines are copied to `examples/poc_etl/source_rows.json`; transformed results and assumptions are stored in `examples/poc_etl/current_state_releases.json`.

## Selected process shapes

| Fixture | Source lines | Source shape | Expected OCDS shape |
|---|---:|---|---|
| `single-row` | 2 | One flattened row; Bid Reference No. is `0` | One process using the solicitation number fallback, one item, one award, one contract |
| `multi-item` | 23448–23451 | Four rows sharing bid, award, supplier, and contract identifiers | One process, four tender/award items, one award, one contract |
| `multi-award` | 21179–21180 | Two rows sharing Bid Reference No. `9342044`, with distinct items, awards, suppliers, and contracts | One OCID, two items, two awards, and two contracts linked through `awardID` |
| `cancelled` | 20887 | One cancelled civil-works notice with no award | One process ending at a cancelled tender |
| `award-only` | 20898 | One row with an award and supplier but no contract identifier or period | One process with one tender and award; no invented contract |
| `long-service` | 21653 | One flattened row with a three-year janitorial-services contract | One process with a 1,095-day planned contract period |
| `chronology-anomaly` | 21005 | One award-only row whose award predates the published tender observation | One process preserving the dates and exposing the chronology question |

The multi-award fixture is the decisive identity test: award numbers identify entries within `awards[]`; they do not identify separate contracting processes.

## Output contract

Each fixture produces one **current-state release reconstructed from flattened rows**. It is not called a source release, compiled release, or versioned history.

- A usable bid reference and buyer establish process identity.
- A missing, null, or zero bid reference falls back to solicitation number and buyer; the fallback is recorded in provenance.
- `Award No.` becomes `awards[].id`.
- `Contract No` becomes `contracts[].id`, and `contracts[].awardID` links it to the award on the same source row.
- Repeated process fields must agree. The proof of concept fails instead of silently selecting the most frequent value.
- Items are preserved from their source rows. Negative item budgets are treated as sentinels and omitted rather than published as monetary values.
- Timezone-less source timestamps are interpreted as Philippine local time (`+08:00`) and the assumption is disclosed.
- Source path, source line numbers, process key, interpretation, and assumptions are stored beside—not inside—the standard release.

## Validation

The auditable inputs and outputs are checked in under `examples/poc_etl/`. The generator that originally produced them is not part of the primer directory, so it is not a supported or authoritative primer command. Until a generator is moved into this directory and reviewed against the primer's identity and publication-reference policy, validate the checked-in fixtures without regenerating them:

```powershell
cd ocds_primer/site
npm.cmd run validate:examples
```

Validation checks the OCDS 1.1 release schema and semantic counts for source rows, tender items, awards, and contracts. It also checks that every contract's `awardID` resolves to an award in the same release.

## Deferred production questions

- Row-grain rules for every historical PhilGEPS schema.
- Duplicate rows produced by joins across items, bidders, awards, and contracts.
- Stable buyer identifiers and a registered OCID prefix.
- Award and contract amendments or repeated snapshots over time.
- Lots, APP/project relationships, documents, implementation, and transactions.
- Conflict-resolution policies more expressive than failing a fixture.

These should be addressed only when the proof-of-concept transformations are expanded into a production ETL.

Detailed findings about the existing bulk compiler and the raw export are recorded separately in [`11_etl_observations.md`](11_etl_observations.md). Keeping observations separate prevents provisional findings from becoming undocumented transformation rules.
