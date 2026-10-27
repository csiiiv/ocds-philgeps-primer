# 13 — Intermediate field explorer

## Purpose

The Field Explorer is optional intermediate material at `/explore/fields`. It follows source fields through explicit transformation rules into exact OCDS paths and values. It does not add field selection back into the introductory contracting-process journey.

## Initial traces

1. **Bid Reference No. → `ocid`** — repeated bid references plus buyer retain one process across two award rows.
2. **Zero Bid Reference No. → disclosed fallback** — the sentinel is rejected and the selected fixture uses Solicitation No. plus buyer.
3. **Item Description → `tender.items[]`** — four source rows become four identified items within one process.
4. **Award No. → `awards[].id`** — two award identifiers remain children of one OCID.
5. **Contract No + Award No. → `contracts[].id` and `awardID`** — each contract links to the award on its source row.
6. **Contract Amount → award and contract values** — a single source field supplies identified monetary objects with explicit PHP currency.

## Interaction contract

- A persistent field list selects one trace; the selection persists through reloads via the URL.
- Every trace states the transformation rule, rationale, and any caveat.
- Each mapped value names its exact source line, source field and value, OCDS path, and OCDS value.
- Every trace carries an explicit metadata block (October 2026): source system/schema version (recorded as "database schema/version not supplied"), source table, source type, OCDS type, mapping classification, join/cardinality rule, review status, and fixture assumptions.
- The full Journey Detail evidence remains one link away.
- The explorer demonstrates that mapping is not necessarily field renaming: a value can establish identity, create an array member, populate multiple paths, or be rejected as a sentinel.

The explorer currently documents tested POC behavior. It is not a generic mapping-authoring tool and does not imply that these rules apply unchanged to every PhilGEPS schema. A relational companion lives in the Mapping Guide's structures topic and the fictional solar-pump lab (`/mapping/solar-pumps`), which show source tables and joins beside the resulting OCDS objects.
