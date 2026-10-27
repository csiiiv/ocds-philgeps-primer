# PhilGEPS–OCDS Refresher: Discussion Summary

Date: October 27, 2026\
Context: Preparation for the PhilGEPS–OCDS Field-Level Mapping Workshop\
Focus: OCDS identifiers, releases, records, release triggers, procurement relationships, and implementation considerations.

## 1. Open Contracting Data Standard (OCDS) Overview

The Open Contracting Data Standard (OCDS) is a standardized format for publishing and organizing public procurement information across the contracting lifecycle.

The major stages include:

1. Planning
2. Tender
3. Award
4. Contract
5. Implementation

OCDS allows procurement information to be published incrementally, preserving the history of a contracting process rather than providing only its latest state.

For PhilGEPS, implementation involves translating existing database records into OCDS-compatible structures while preserving identifiers, relationships, and historical changes.

## 2. Open Contracting Identifier (OCID)

An OCID uniquely identifies a contracting process, allowing its different stages and updates to be linked.

### Structure

An OCID consists of a registered publisher prefix and a locally unique identifier.

Example:

`ocds-tvcjdl-00001234`

- `ocds-tvcjdl` — Registered PhilGEPS publisher prefix.
- `00001234` — Unique contracting process identifier assigned by the publisher.

PhilGEPS registered the prefix `ocds-tvcjdl` in July 2026.

### Key characteristics

- One OCID identifies one contracting process.
- All releases for that process use the same OCID.
- The identifier must remain unique and stable.
- Developers can generate the local identifier using serial numbers, UUIDs, existing procurement keys, or another reliable scheme.
- An OCID should not change simply because a procurement advances to another stage, is amended, or migrates to another database.

### PhilGEPS considerations

The implementation team must decide how to generate and maintain OCIDs and how to relate them to existing PhilGEPS identifiers.

An identifier-mapping table may be necessary, particularly when migrating historical records from earlier PhilGEPS versions.

## 3. Releases and Records

OCDS distinguishes between individual publications of information and the compiled history of a contracting process.

| Concept     | Description                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------- |
| OCID        | Identifies the contracting process.                                                         |
| Release     | Publishes information about the process at a particular point in time.                      |
| Release ID  | Uniquely identifies a release within its contracting process.                               |
| Release tag | Describes the nature or stage of the published information.                                 |
| Record      | Groups the releases associated with an OCID and can provide a compiled view of the process. |

### Example: Solar Pump Irrigation Procurement

| Event                  | OCID | Release ID | Example tag            |
| ---------------------- | ---- | ---------- | ---------------------- |
| Planning published     | XYZ  | R001       | `planning`             |
| Tender published       | XYZ  | R002       | `tender`               |
| Tender amended         | XYZ  | R003       | `tenderAmendment`      |
| Contract awarded       | XYZ  | R004       | `award`                |
| Contract signed        | XYZ  | R005       | `contract`             |
| Implementation updated | XYZ  | R006       | `implementationUpdate` |

Illustrative release identifiers and tags; the actual OCID and release ID formats must follow OCDS requirements.

All releases share the same OCID because they describe the same contracting process.

### Immutability

An OCDS release is intended to be an immutable publication.

Once published, the historical release should remain available. Subsequent changes are communicated through new releases rather than modifying the earlier publication.

However, a release does not necessarily contain only changed fields. It may contain a fuller snapshot of information.

A compiled record can present both the release history and the latest known state.

## 4. Release Tags and Publication Triggers

Release tags identify the type of contracting information contained in a release.

Examples include:

| Tag                    | Purpose                              |
| ---------------------- | ------------------------------------ |
| `planning`             | Planning information                 |
| `tender`               | Tender information                   |
| `tenderAmendment`      | Formal changes to tender information |
| `tenderUpdate`         | Updated tender information           |
| `award`                | Award information                    |
| `awardUpdate`          | Updated award information            |
| `contract`             | Contract information                 |
| `contractAmendment`    | Formal contract amendments           |
| `implementation`       | Initial implementation information   |
| `implementationUpdate` | Updates during implementation        |

Release tags and release-trigger rules serve different purposes.

Release tags describe the type of information being published.

Release triggers determine when PhilGEPS should generate a new OCDS release.

A new release does not necessarily mean a new procurement stage.

For example, a tender deadline adjustment may generate another release under the existing OCID.

### Important implementation question

Not every relational database update should necessarily generate an OCDS release.

PhilGEPS must define which application events, status transitions, or data modifications warrant publication.

This means two related mapping activities are necessary:

- Field-level mapping: Source database fields to OCDS fields.
- Event/release mapping: PhilGEPS business events to OCDS publication actions and release tags.

## 5. Translating Relational Data into OCDS Releases

A major concern identified during our discussion was how PhilGEPS can reliably generate OCDS releases from its existing relational database.

Most operational databases maintain the current values of records.

For example, a tender deadline might initially be November 10 and subsequently change to November 15.

If the application simply overwrites the original database value, it may become impossible to reconstruct the previous deadline from the operational database alone.

### Potential architecture

```
PhilGEPS Operational Database
          |
          v
Change Detection / Event Capture
          |
          v
OCDS Mapping & Transformation
          |
          v
OCDS Release Generation
          |
          v
Append-Only Release Archive
          |
          v
OCDS Records / API / Bulk Downloads
```

An append-only archive of generated releases is a practical option, although OCDS does not mandate a particular internal database architecture.

Possible mechanisms for detecting changes include application events, audit tables, change data capture (CDC), or scheduled extraction and comparison.

### Critical questions for PhilGEPS

- Does the operational database preserve historical field values?
- Are audit logs or change-tracking mechanisms available?
- Can modifications across related tables be reconstructed?
- Can the system distinguish meaningful procurement events from routine database updates?
- How will published OCDS releases be stored and preserved?

Without reliable change detection, certain intermediate developments may never be captured in OCDS.

## 6. Multiple Awards Under One Tender

We discussed how one procurement procedure may result in several awards and contracts.

For example, a solar irrigation tender might contain three lots, awarded to three different suppliers.

```
OCID: XYZ
    |
    +-- Tender
    |     +-- Lot 1
    |     +-- Lot 2
    |     +-- Lot 3
    |
    +-- Award 1 -> Supplier A
    +-- Award 2 -> Supplier B
    +-- Award 3 -> Supplier C
    |
    +-- Contract 1
    +-- Contract 2
    +-- Contract 3
```

These can remain under a single OCID because they belong to the same contracting process.

Each award and contract should have its own identifier within that process.

An award release can contain multiple award objects.

The number of awards does not determine the number of OCIDs.

For field-level mapping, the developers must establish how PhilGEPS stores lots, awards, suppliers, and contracts and how those records are related.

## 7. Failed Bidding, Re-bidding, and OCID Continuity

We explored the complication of a procurement that begins with planning, proceeds to tender, fails, and is subsequently re-bid.

The major question is whether the re-bidding remains part of the original contracting process or constitutes a new one.

This requires a consistent publication policy.

A cancelled tender does not automatically require a new OCID. If the subsequent procedure is treated as a distinct contracting process, it can receive a new OCID while preserving a relationship to the earlier one.

### Illustrative example

```
Project: Solar Pump Irrigation
              |
              v
       Planning Reference
              |
       +------+------+
       |             |
       v             v
  OCID: XYZ-001  OCID: XYZ-002
  Initial Bid     Re-bidding
  (Unsuccessful)  (Successful)
                       |
                       v
                     Award
                       |
                       v
                    Contract
```

In this example, the two procurement attempts have different OCIDs but share a common planning or project reference.

This is an illustrative modeling approach, not a requirement that every re-bid must receive a new OCID.

### Related processes

OCDS includes a `relatedProcesses` structure for expressing relationships between contracting processes.

Relationship codes, such as those indicating planning or unsuccessful processes, are different from release tags.

- Release tags describe what a release contains.
- Related-process relationships describe how separate contracting processes connect.

This allows a subsequent procurement procedure to reference an earlier unsuccessful procedure without reusing its OCID.

## 8. Planning IDs, Project IDs, and Procurement IDs

One of our main conclusions was that planning and procurement tracking should be treated as related but distinct concerns.

A major project might involve several procurements across multiple phases, funding periods, or implementing offices.

Assigning a single OCID to the entire project could therefore become problematic.

We discussed the following practical model:

| Identifier         | Purpose                                                        |
| ------------------ | -------------------------------------------------------------- |
| Project ID         | Links activities belonging to a common project or program.     |
| Planning reference | Identifies a procurement plan or planning item.                |
| OCID               | Identifies an individual contracting process.                  |
| Release ID         | Identifies a particular published release within that process. |
| Award/contract ID  | Identifies individual awards and contracts within the process. |

### Proposed approach for PhilGEPS

Where its operational model supports it, use a stable procurement-procedure identifier as the basis for the OCID.

Planning and project identifiers can then connect multiple procurement procedures.

The benefit is that this approach can accommodate:

- Multi-phase projects
- Multiple procurement packages
- Split projects or procurement lots
- Failed bidding and re-bidding
- Procurements spanning multiple fiscal years
- Future linkage with budget allocations and project monitoring datasets

A planning-stage OCDS release is still possible where the contracting process is already identifiable. Anchoring OCID assignment to tender creation is a potential PhilGEPS implementation choice, not an OCDS rule.

## 9. Implications for Field-Level Mapping

Our discussion identified that field-level mapping cannot be limited to matching database column names against OCDS JSON paths.

At least four related areas need consideration.

| Mapping area          | Primary question                                                                   |
| --------------------- | ---------------------------------------------------------------------------------- |
| Field-level mapping   | Where does each OCDS value come from?                                              |
| Identifier mapping    | How are procurement processes, objects, and organizations consistently identified? |
| Codelist mapping      | How do PhilGEPS codes correspond to OCDS standard values?                          |
| Event/release mapping | Which PhilGEPS events generate releases, and what tags should they contain?        |

We also need to document how relational tables are joined and transformed into nested OCDS objects.

The ability to generate a valid OCDS release should ultimately be used to test the correctness of these mappings.

## 10. Questions to Raise During the PhilGEPS Workshop

1. What is PhilGEPS's authoritative identifier for an individual procurement procedure?
2. When is that identifier assigned, and does it remain stable?
3. How are planning records related to tenders, awards, and contracts?
4. How are failed bids and subsequent re-bidding attempts represented?
5. Can a tender generate multiple awards and contracts, and how are they linked?
6. Does PhilGEPS preserve historical changes to procurement records?
7. Which system activities should generate new OCDS releases?
8. How should release tags be determined from PhilGEPS business events?
9. How will releases be stored and made available for historical reconstruction?
10. How will identifiers and historical relationships be preserved during migration to PhilGEPS 2027?

## 11. Agreed Direction and Next Learning Topics

Our provisional direction is to:

- Use stable identifiers for individual contracting processes.
- Preserve relationships with planning, project, and previous procurement records.
- Treat releases as immutable historical publications.
- Determine release triggers separately from field-level mappings.
- Investigate PhilGEPS audit trails and change-detection capabilities before deciding on the publication architecture.
- Validate mappings against actual procurement records rather than relying exclusively on mapping spreadsheets.

Next refresher topic: The internal OCDS data structure, particularly `planning`, `tender`, `awards`, `contracts`, `parties`, and `relatedProcesses`, followed by how PhilGEPS relational tables can be mapped into these objects.

This will bridge the conceptual discussion into tomorrow's hands-on field-level mapping exercise.