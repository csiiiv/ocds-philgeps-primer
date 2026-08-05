# 11 — PhilGEPS ETL observations

## Status

These are proof-of-concept observations, not production-wide conclusions. They describe behavior verified in the current repository and selected source rows. Each observation should eventually become either a tested transformation rule, a schema-specific exception, or a rejected hypothesis.

## Source grain

1. A PhilGEPS export row is not consistently equivalent to one contracting process.
2. Some rows flatten tender, award, supplier, and contract fields into one current-state observation.
3. Repeated rows can represent line items within the same tender and award.
4. Rows sharing a bid reference can carry distinct award and contract identifiers. These belong in `awards[]` and `contracts[]` under one process unless other evidence establishes separate processes.
5. Repeated flattened values can also result from joins. Counting rows as items, bids, awards, or contracts without entity-specific identifiers can overcount.

## Identity

1. A usable `Bid Reference No.` is presently the strongest observed process-level key in the 2021–2025 CSV export.
2. `Award No.` is an award-level identifier. Using it before the bid reference splits multi-award tenders into separate OCIDs.
3. Values such as `0`, `NULL`, and blank strings are not usable process identifiers.
4. `Solicitation No.` plus buyer is a plausible fallback for selected samples, but its uniqueness and stability must be measured before production use.
5. APP identifiers might provide earlier or broader linkage in other schemas. Their scope must be verified before using them as an OCID root.

## Current bulk compiler

The current `scripts/compile_ocds.py` is useful as an exploratory mapping but has semantic risks:

- `process_group_key()` and `build_ocid()` prefer award reference over bid reference.
- `pick_process_field()` selects the most frequent non-null value when grouped rows conflict, which can conceal a bad grouping.
- `compile_group()` gathers items and parties across rows but constructs at most one award and one contract from the merged row.
- A release can therefore pass the OCDS schema while losing awards or contracts, or while representing only part of a contracting process.

The proof-of-concept transformer is intentionally separate. It fails on conflicting process fields and groups items, awards, and contracts using their own identifiers.

## Publication semantics

1. The historical exports examined so far provide flattened current-state data, not necessarily immutable OCDS publication events.
2. One reconstructed current-state release is an honest output when the source contains only a current-state row or group of rows.
3. A release index requires distinct source publications or an explicitly labelled teaching reconstruction.
4. A compiled release and versioned release should not be presented as observed history when no underlying source releases are available.
5. “Compiled releases” is currently also used as a pipeline filename for Cardinal input. That operational label should not be confused with evidence that a formal OCDS record was compiled from published releases.

## Data-quality observations

1. Some rows use negative item budgets as sentinel values. The proof of concept omits these monetary values.
2. Source timestamps lack timezone offsets. The proof of concept applies `+08:00` and records that assumption.
3. A contract number can be present without contract period dates; that still supports a contract identifier, but not duration analysis.
4. Equal contract start and end dates, reversed chronology, or unusually long intervals require source verification and must not be silently corrected.
5. Free-text bidder lists should not be split into `bids.details` until delimiter behavior and organization identity are tested.

## Implications for the primer

- Possible Journeys should prefer audited source-row fixtures over records emitted by the exploratory bulk compiler.
- Each real example should disclose source file, exact line numbers, process-key rule, and whether it is a reconstructed current-state release.
- Different row shapes are themselves part of the lesson: one row can contain a whole flattened process, while several rows can describe items or multiple awards within one process.
- Real examples should expose the transformed release and its source rows, allowing learners to inspect the interpretation rather than only the result.

## Questions for later profiling

- How often is the bid reference missing, zero, or reused within a buyer?
- How often does one bid reference contain multiple award or contract identifiers?
- Which schemas use one row per item, award, bidder, or joined combination?
- Can repeated rows be deduplicated using stable identifiers rather than value comparison?
- Which fields represent publication dates versus lifecycle event dates?
- Are APP and PR identifiers stable enough to link planning to procurement without changing the OCID boundary?
