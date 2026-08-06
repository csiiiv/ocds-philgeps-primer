# 16 — Alignment vs Official OCDS Sample (`fictional-example/1.1`)

**Assessment date:** 2026-08-06
**Reference sample:** [`open-contracting/sample-data` → `fictional-example/1.1`](https://github.com/open-contracting/sample-data/tree/main/fictional-example/1.1) (six releases covering planning → tender → tenderAmendment → award → contract → implementation, for the Barnet cycle-lane process `ocds-213czf-000-00001`)
**Target version:** OCDS 1.1 (we pin 1.1.5 internally; the sample is tagged 1.1)
**Scope:** the primer's two output patterns — the synthetic flagship (`examples/denr-r7-laptops-2024.json`) and the POC ETL package (`examples/poc_etl/release_package.json`) — compared field-by-field against the official six-release sample.

This document is a *cross-check against a canonical reference*, complementing [`07_ocds_alignment_audit.md`](07_ocds_alignment_audit.md) (which is our own internal schema-semantics audit). It does not supersede the audit.

---

## Bottom line

The primer is **structurally aligned with OCDS 1.1** and passes the canonical schemas (per `site/scripts/validate-examples.mjs`). It runs **two different output patterns**, only one of which mirrors the official sample's release-history shape:

| Output | Pattern | Matches official sample? |
|---|---|---|
| `examples/denr-r7-laptops-2024.json` | One release per event, single `tag`, progressive party introduction | **Yes — close structural match** |
| `examples/poc_etl/release_package.json` | One release per *process* with multi-tag `["tender","award","contract"]` | **No — compiled current-state, not a release history** |

The POC divergence is already documented in `examples/manifest.json` (`pipelineHonestyNote`): *"this workspace's `compile_ocds.py` currently emits one compiled release per process (tag: `['compiled']`), not a release history or a record."* It is intentional and should not be "fixed" to look like the official sample.

The flagship is where the official-sample comparison matters most, and it holds up well — and is in a few places *more correct* than the official example.

---

## Field-by-field comparison

### 1. Package envelope

Official (`01-planning.json`) carries full publisher provenance:

```json
"publisher": { "name": "...", "scheme": "GB-COH", "uid": "95006232.0", "uri": "..." },
"license": "http://opendatacommons.org/licenses/pddl/1.0/",
"publicationPolicy": "https://github.com/open-contracting/sample-data/"
```

POC package (`examples/poc_etl/release_package.json:2-7`):

```2:7:ocds_primer/examples/poc_etl/release_package.json
  "uri": "urn:uuid:1718be18-e762-59a6-8cca-fe1dc103282f",
  "version": "1.1",
  "publishedDate": "2023-12-18T15:37:53+08:00",
  "publisher": {
    "name": "Local OCDS Primer proof-of-concept publisher"
  },
```

- ✅ `uri`, `version`, `publishedDate`, `publisher` present
- ❌ Missing `license` and `publicationPolicy`
- ⚠️ `publisher` is a bare name with no `scheme` / `uid` / `uri`. Already flagged as deliberate for a teaching fixture in audit A6 (`07_ocds_alignment_audit.md:77`)

### 2. Release envelope

Every official release carries `"language": "en"`. None of ours set `language` anywhere. Schema-optional, but present in every official example.

### 3. Parties — the biggest structural gap

Official party (`04-award.json`) is fully identified and addressable:

```json
{
  "id": "GB-COH-11111111", "name": "AnyCorp Cycle Provision",
  "roles": ["supplier"],
  "identifier": { "scheme": "GB-COH", "id": "11111111.0", "legalName": "AnyCorp Ltd" },
  "address": { "streetAddress": "...", "locality": "...", "region": "...", "postalCode": "...", "countryName": "..." },
  "contactPoint": { "name": "...", "email": "...", "telephone": "...", "faxNumber": "...", "url": "..." }
}
```

POC parties (`examples/poc_etl/release_package.json:23-39`):

```23:39:ocds_primer/examples/poc_etl/release_package.json
      "parties": [
        {
          "id": "buyer-national-meat-inspection-service",
          "name": "NATIONAL MEAT INSPECTION  SERVICE",
          "roles": ["buyer", "procuringEntity"]
        },
        {
          "id": "supplier-e-copy-corporation",
          "name": "E-COPY CORPORATION",
          "roles": ["supplier"]
        }
      ],
```

- ❌ Party `id`s are slugified names (`buyer-national-meat-inspection-service`), not scheme-based identifiers (`GB-COH-11111111`). Schema-valid, but loses cross-walkability — the whole point of OCDS identifiers.
- ❌ No `identifier{}` block (scheme + id + legalName) anywhere in the POC
- ❌ No `address` or `contactPoint` blocks anywhere

The flagship `examples/denr-r7-laptops-2024.json` has the same minimal party shape (e.g. line 83).

### 4. Items, units, classification

Official item carries `unit.scheme: "UNCEFACT"`, `unit.id: "SMI"`, `unit.value`, and `additionalClassifications[]`. POC item (`examples/poc_etl/release_package.json:59-64`):

```59:64:ocds_primer/examples/poc_etl/release_package.json
            "classification": {
              "scheme": "UNSPSC",
              "id": "44103103",
              "description": "Printer or facsimile toner"
            }
```

- ✅ `UNSPSC` scheme is appropriate for PH (official uses `CPV` for EU) — correct localisation, not a defect
- ❌ No `unit.scheme` / `unit.id` (UNCEFACT) — units are bare `name` only
- ⚠️ `unit.value` present on some items, absent on others (e.g. Liliw items at `release_package.json:166-187`)
- ❌ No `additionalClassifications[]` anywhere

### 5. Amendments — ✅ aligned

Flagship models amendments correctly (`examples/denr-r7-laptops-2024.json:112-119`):

```112:119:ocds_primer/examples/denr-r7-laptops-2024.json
            "amendments": [{
              "id": "amendment-001",
              "date": "2024-03-18T10:00:00+08:00",
              "description": "The bid submission deadline was extended by five days.",
              "rationale": "Allow suppliers additional preparation time.",
              "amendsReleaseID": "001",
              "releaseID": "002"
            }]
```

This matches the official `03-tenderAmendment.json` amendment shape exactly.

### 6. Awards & contracts — ✅ aligned

Award→contract linkage via `awardID` is correct; both the official sample and ours repeat the full `items[]` array inside awards and contracts.

### 7. Implementation — divergent on purpose, and we're more correct

Official `06-implementation.json` uses `contracts[].implementation.transactions[]` for money flows. The flagship uses `milestones[]` for deliveries (`examples/denr-r7-laptops-2024.json:199-205`):

```199:205:ocds_primer/examples/denr-r7-laptops-2024.json
              "milestones": [{
                "id": "delivery-001",
                "title": "First delivery — 25 laptops",
                "type": "delivery",
                "status": "met",
                "dateMet": "2024-06-10T16:00:00+08:00"
              }]
```

Audit A1 (`07_ocds_alignment_audit.md:31-37`) explains why: `transactions` semantically means *payments*, not *deliveries*. The official sample is correct because its example *is* payments (it includes `payer`, `payee`, `value`). So our divergence is principled, not an error — but it does mean learners never see a `transactions[]` block in our outputs.

### 8. Documents — visible gap

The official sample laces `documents[]` through every stage (procurementPlan, needsAssessment, tenderNotice, clarifications, awardNotice, contractSigned, physicalProgressReport). Ours have **zero `documents[]`** in any output. Schema-valid, but it's the most visible content gap vs the canonical example.

---

## Where we are *more* correct than the official sample

1. **Party introduction timing.** The flagship introduces the tenderer only at the bid-received release (003) and adds the `supplier` role only at award (004). The official example leaks the supplier into the parties array from the very first release — exactly the bug our audit A2 corrected. See `examples/denr-r7-laptops-2024.json:135` and `:151`.
2. **`numberOfTenderers` discipline.** We omit it until bids are known (release 003, `examples/denr-r7-laptops-2024.json:136`). The official example doesn't trip on this but doesn't model the boundary as cleanly.
3. **Deliveries vs payments.** As above — we model deliveries as milestones, not transactions.
4. **`ocds-philgeps` prefix labelling.** Audit A6 (`07_ocds_alignment_audit.md:71-79`) explicitly labels it fictional. The official sample uses `ocds-213czf-` which looks like a real registered prefix without that caveat.

---

## Gaps worth closing

Priority-ordered. Items 1–2 are trivial mechanical fixes; 5 and 6 carry the most teaching value.

| # | Gap | Where | Effort | Teaching value |
|---|---|---|---|---|
| 1 | Add `language: "en"` to every release | both outputs | trivial | low |
| 2 | Add `license` + `publicationPolicy` to the POC package | `examples/poc_etl/release_package.json:7` | trivial | low |
| 3 | Add `identifier{}` to at least the buyer in the flagship | `examples/denr-r7-laptops-2024.json` | small — invent a PH scheme like `PH-GOV-xxx` | medium |
| 4 | Add `unit.scheme` / `unit.id` (UNCEFACT) on items with quantities | both | small | medium |
| 5 | Add at least one `documents[]` block (tender notice, award notice) to the flagship | `examples/denr-r7-laptops-2024.json` | small | **high** |
| 6 | Add one `implementation.transactions[]` (a real payment, with `payer` / `payee` / `value`) alongside our milestones, so learners see the delivery/payment distinction we built | flagship release 006 or 007 | small | **high** |

Items 5 and 6 are the most valuable for the stated primary audience ("Mai, the procurement analyst", per [`01_goals_and_audience.md`](01_goals_and_audience.md)) — documents and transactions are the fields that make OCDS genuinely useful for integrity analysis, and the flagship is currently silent on both.

---

## Recommendation

For Phase 1's documented teaching scope, the current alignment is **good enough to ship** — our own audit (`07_ocds_alignment_audit.md`) is more rigorous than most publishers' and marks every real defect as resolved. Before going further, close gaps 1, 2, and 5; the others can wait. Do **not** try to make the `poc_etl` output look like the official release-history sample — it's a compiled snapshot by design and `examples/manifest.json` already says so. The flagship is where the official-example comparison matters, and it holds up well.

---

## Authoritative references

- [Official sample — `fictional-example/1.1` directory](https://github.com/open-contracting/sample-data/tree/main/fictional-example/1.1)
- [OCDS 1.1.5 release reference](https://standard.open-contracting.org/latest/en/schema/reference/)
- [OCDS 1.1.5 record reference](https://standard.open-contracting.org/latest/en/schema/records_reference/)
- [OCDS merging specification](https://standard.open-contracting.org/latest/en/schema/merging/)
- [OCDS identifiers guidance](https://standard.open-contracting.org/latest/en/schema/identifiers/)
- [OCDS milestone guidance](https://standard.open-contracting.org/latest/en/guidance/map/milestones/)
