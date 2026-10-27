# PhilGEPS–OCDS Refresher Supplement: Data Model and Shared Structures

**Date:** October 27, 2026  
**Companion to:** *PhilGEPS–OCDS Refresher: Discussion Summary* and *PhilGEPS–OCDS Field-Level Mapping Workshop Outline*  
**Purpose:** Extend our earlier discussion of OCIDs, releases, records, release packages, and publication events to the **contents of an OCDS release** and the implications for field-level mapping.

> **Core distinction:** OCDS does not simply publish separate tender, award, and contract tables. A release describes a contracting process using lifecycle objects, common structures, organization references, identifiers, and relationships.

## 1. Where this fits in the refresher

Previous topics covered:

1. **OCID:** Stable identifier for a contracting process.
2. **Release:** A publication of information about that process at a given time, with its own release ID and tags.
3. **Record:** Collects references to the releases for one OCID, optionally including compiled and versioned views.
4. **Release package:** Publishes multiple releases together, potentially across different OCIDs.
5. **Release triggering:** Deciding which PhilGEPS events or changes generate new publications.

**This supplement asks:** What data goes *inside* each release, how are related objects represented, and what does that mean for the source database mappings?

## 2. Anatomy of an OCDS release

Common top-level properties of an OCDS release include:

| Property | Purpose | Example in PhilGEPS |
|---|---|---|
| `ocid` | Identifies the contracting process | Stable procurement-process identifier |
| `id` | Identifies this release within its OCID | Event/publication sequence or unique release key |
| `date` | Date and time of the release | Publication timestamp |
| `tag` | Describes the information/event being published | `tender`, `award`, `contract` |
| `initiationType` | How the contracting process was initiated | Normally `tender` |
| `planning` | Planning and budgeting context | Procurement plan and budget data |
| `tender` | The procurement procedure, with items/lots where applicable | Bid notice, procedure, submission dates |
| `awards` | An array of awards | One or several winning decisions |
| `contracts` | An array of contracts | Agreements and implementation data |
| `parties` | Organizations involved in the process | Buyer, procuring entity, suppliers, bidders |
| `buyer` | Reference to the buyer organization | Government buyer |
| `relatedProcesses` | References to other contracting processes | Related plan, prior unsuccessful procurement, follow-on process |
| `language` | Language of the published information | `en` where appropriate |

Not every release needs every section. A tender-stage release need not include contracts that do not yet exist. Later releases may contain new objects or updated data about existing objects.

## 3. `parties`: the organizations behind the procurement

The `parties` array describes organizations taking part in a contracting process. Organizations may have one or more roles, such as **buyer**, **procuring entity**, **tenderer**, or **supplier**.

Other objects refer to these organizations using organization references (`id`, and often `name`). The referenced `id` should match the corresponding entry in `parties`.

### Simplified example (release fragment)

```json
{
  "parties": [
    {
      "id": "NIA-001",
      "name": "National Irrigation Administration",
      "roles": ["buyer", "procuringEntity"]
    },
    {
      "id": "SUP-001",
      "name": "Solar Equipment Supplier A",
      "roles": ["tenderer", "supplier"]
    },
    {
      "id": "SUP-002",
      "name": "Solar Equipment Supplier B",
      "roles": ["supplier"]
    }
  ],
  "buyer": {
    "id": "NIA-001",
    "name": "National Irrigation Administration"
  },
  "awards": [
    {
      "id": "AWD-001",
      "suppliers": [{"id": "SUP-001", "name": "Solar Equipment Supplier A"}]
    },
    {
      "id": "AWD-002",
      "suppliers": [{"id": "SUP-002", "name": "Solar Equipment Supplier B"}]
    }
  ]
}
```

*Illustrative fragment, not a standalone valid release package; names and identifiers are fictional.*

**Why it matters:** There might be one tender and several award decisions, but the supplier entities should still be consistently identifiable, regardless of how many award or contract objects reference them.

## 4. `parties[].id` versus `parties[].identifier`

These serve different functions:

- **`parties[].id`:** The identifier used to reference that party within the OCDS contracting process, including from `buyer`, `tender/procuringEntity`, and `awards[].suppliers`.
- **`parties[].identifier`:** An identifier from a specified identification scheme (for example, a recognized registration system), including its `scheme` and `id`.
- **`parties[].additionalIdentifiers`:** Other useful organization identifiers, where available.

```json
{
  "id": "SUP-001",
  "name": "Solar Equipment Supplier A",
  "identifier": {
    "scheme": "EXAMPLE-REGISTRY",
    "id": "1234567",
    "legalName": "Solar Equipment Supplier A"
  },
  "roles": ["supplier"]
}
```

`EXAMPLE-REGISTRY` is a placeholder, **not** a verified organization identifier scheme. Before implementing this mapping, verify the chosen scheme and the quality of the underlying registry data.

### PhilGEPS mapping questions

- Does PhilGEPS assign a stable supplier ID across procurements and across system versions?
- Are there multiple records for the same legal entity (duplicates, subsidiaries, branch records, name changes)?
- Can source IDs be mapped to business registration or other trusted legal-entity identifiers?
- Does the source system distinguish the **buyer**, **procuring entity**, and other government bodies when these are not the same organization?
- Will consistent organization identification support future beneficial-ownership, blacklist, and budget-linkage use cases?

**Important nuance:** `parties` is part of a contracting-process release, not automatically a globally deduplicated master registry. Consistent source identifiers and organization-resolution rules are still essential for cross-procurement analysis.

## 5. Other reusable OCDS structures

| Structure | Common locations | Mapping consideration |
|---|---|---|
| **OrganizationReference** | `buyer`, procuring entity, award suppliers | Preserve references to `parties[].id` |
| **Item** | `tender/items`, award and contract items | Descriptions, quantities, units, classifications, unit values |
| **Value** | Tender, award, contract values | Amount and currency; distinguish estimates from awards and contracts |
| **Period** | Tender/contract periods | Start/end timestamps and semantics |
| **Document** | Planning, tender, award, contract | Original document URLs, titles, types, publication dates |
| **Milestone** | Tender, contract, implementation | Meaningful targets, completion dates, status |
| **Amendment** | Tender, award, contract | Amendment references, dates, descriptions and rationale |
| **Classification** | Items and categorized objects | Scheme, code, and description for meaningful comparisons |
| **Identifier** | Organizations | Trusted identifier scheme and stable legal identity |

These structures often require more than a one-column-to-one-field conversion. For example, an OCDS `Item` might need information joined from an item table, quantity/unit table, classification lookup, and a price table.

## 6. Relationships within one OCID

For a procurement containing multiple lots, awards, and contracts, mapping must preserve object-level IDs and relationships:

```text
OCID: ocds-tvcjdl-SOLAR-001
  |
  +-- tender
  |     +-- lots: LOT-1, LOT-2
  |     +-- items: ITEM-1, ITEM-2
  |
  +-- parties: BUYER-1, SUP-1, SUP-2
  |
  +-- awards
  |     +-- AWD-1 -> LOT-1 -> SUP-1
  |     +-- AWD-2 -> LOT-2 -> SUP-2
  |
  +-- contracts
        +-- CON-1 -> AWD-1
        +-- CON-2 -> AWD-2
```

The **release ID** distinguishes publications; the **award/contract/lot IDs** distinguish objects within the process. Repeated `award` or `contract` release tags do not require a new OCID.

For the actual mapping, verify how PhilGEPS represents lots and how awards and contracts reference them. Do not assume a one-to-one relationship among tender, award, and contract tables.

## 7. How shared information behaves across releases

A release for an existing OCID may add or update information about the same organization or object:

- A supplier wins another lot: a later release can introduce another award referring to the same party ID.
- A supplier's display name is corrected: a later release can provide updated organization information using the same party ID; earlier releases remain unchanged.
- A contract receives a formal amendment: a later release references the existing contract ID and includes relevant amendment information.
- A new entity participates: a later release can introduce another entry in `parties` and reference it from the relevant object.

The compiled record brings together releases by OCID and uses OCDS merging rules to build an up-to-date view. **Avoid treating each later release as a full replacement of the entire contracting process.**

For identity changes, distinguish corrections to the same organization from genuinely different legal entities. That decision cannot safely be made from names alone.

## 8. Implications for the field-level mapping worksheet

In addition to **source field → OCDS path**, capture:

| Mapping dimension | Questions |
|---|---|
| Source provenance | Which PhilGEPS version/table/column supplies the value? |
| Field semantics | What does the source value mean in the business workflow? |
| Join logic | Which primary/foreign keys connect related tables? |
| Object identity | What identifies the party, lot, award, or contract over time? |
| Transformation | Direct value, lookup, calculation, normalization, or aggregation? |
| Codelist | Is the source code compatible with the OCDS value? |
| Change history | Can earlier values be recovered if the source is overwritten? |
| Publication | Is the information public, restricted, or undecided? |
| Quality/validation | Are the field, relationships, and generated JSON accurate? |
| Use case | Does the mapping support procurement tracking, comparison, or analysis? |

This highlights **four complementary mapping tasks**:

1. **Field-level mapping** — which source values populate OCDS properties?
2. **Identifier and relationship mapping** — how are objects and parties consistently linked?
3. **Codelist mapping** — how do local values correspond to standard OCDS values?
4. **Event/release mapping** — what changes generate releases and which tags apply?

## 9. Suggested workshop demonstration

Use one fictional or suitably anonymized solar-pump procurement with two lots and two awards.

**Suggested walkthrough:**

1. Show a simplified source relational model: procuring entities, suppliers, tender, lots, bids, awards, contracts.
2. Show the `parties` array and the matching references in `buyer` and `awards[].suppliers`.
3. Show item- and lot-level relationships and monetary values.
4. Show how an initial tender release and subsequent award/contract releases share an OCID while preserving object IDs.
5. Ask eBiz to identify the actual PhilGEPS source tables and keys for every important object.
6. Note unresolved mappings, source data gaps, and questions requiring OCP validation.

**Desired output:** A small, end-to-end worked mapping example—not merely a list of matched field names.

## 10. Topics to revisit later

- Sample **release packages per procurement stage** with valid OCDS JSON and package metadata.
- How a **record package** groups contracting processes and how `compiledRelease`/`versionedRelease` are derived.
- How **release-trigger policies** interact with audit logs, CDC, and append-only release storage.
- How to model **planning, cancellations, re-bids, and `relatedProcesses`** without confusing project IDs with OCIDs.
- Data quality rules for organization deduplication and linking to outside registries.

## References

- [OCDS schema reference](https://standard.open-contracting.org/latest/en/schema/reference/)
- [OCDS codelists](https://standard.open-contracting.org/latest/en/schema/codelists/)
- [OCDS records reference](https://standard.open-contracting.org/latest/en/schema/records_reference/)

---

**Takeaway:** The success of PhilGEPS field-level mapping depends as much on **object identities, joins, and consistent party references** as it does on choosing matching OCDS paths. The workshop should test a realistic end-to-end example using actual source relationships, then document the transformations and gaps before attempting complete coverage.
