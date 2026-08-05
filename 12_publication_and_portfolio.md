# 12 — Publication and portfolio

## Purpose

Chapter 3 zooms out from individual contracting processes. It assembles the seven audited POC releases into one standard OCDS release package, then derives a separate portfolio view from that package.

The distinction is structural and visible:

- **Release package:** a standard OCDS artifact containing package metadata and releases for multiple OCIDs.
- **Portfolio:** a primer-specific analytical interface derived from those releases. It is not part of the OCDS schema.

## Package contract

The checked-in `examples/poc_etl/release_package.json` contains the same releases stored in `current_state_releases.json`. The package includes the five required fields: `uri`, `version`, `publishedDate`, `publisher`, and `releases`. Regeneration is deliberately not documented until a reviewed generator lives inside the primer directory.

The build validates the package against the canonical OCDS 1.1.5 release-package schema and asserts that every audited POC release is included exactly once. Each release retains its own `ocid`; packaging does not merge contracting processes.

The local POC uses the non-resolving identifier `urn:uuid:1718be18-e762-59a6-8cca-fe1dc103282f`, generated deterministically for this fixture. It does not imply a website, external publisher, or organizational owner. Production publication requires publisher-controlled persistent metadata and decisions about license and publication policy.

The publisher name, `Local OCDS Primer proof-of-concept publisher`, is a fixture label rather than the name of a real organization. The package is a checked-in local artifact, not evidence that it is available at a public URL. Documentation and UI must link to it by its repository-relative path, `examples/poc_etl/release_package.json`, when a link is needed.

Do not replace the URN with a guessed domain or derive an organization from the workspace directory. A resolvable production URI can only be added after the actual publisher has selected and controls the endpoint.

## Why no real record package yet

A record package contains records, and a record indexes the releases belonging to one OCID. The audited real samples currently provide one reconstructed current-state release per process, not observed publication histories. The chapter therefore publishes a valid release package and does not manufacture compiled or versioned records merely to fill a second package type.

The synthetic flagship continues to teach the full record model. A real record package becomes appropriate when the source ETL can produce multiple trustworthy releases for the same OCID.

## Portfolio contract

The portfolio computes:

- total contracting processes;
- processes with at least one award;
- processes with at least one contract;
- awards without a published contract;
- multi-award processes;
- processes with lifecycle-order checks;
- total published award value.

Selecting a metric filters the contributing-process table. Every result links back to the corresponding Possible Journey Record or Timeline. A zero entity count means “not published in this release,” not “the real-world event did not occur.”

The total award value is a direct sum of `awards[].value.amount`. It is not adjusted for inflation, amendments, duplicate publications, payments, or currency conversion. All current POC values use PHP.

## Route

The chapter is available at `/publication` and appears as **Publication & Portfolio** in the primary navigation.

## Next interaction

Processes in the publication now expose individual releases through the shared `ReleaseInspector` used by the introductory Record, the standalone release route, and Possible Journeys. Each package-release card and each portfolio-table row opens the same modal, with publication-specific context supplied via the inspector's `contextLabel`. Future additions (release filters, cross-process comparisons) should keep composing the same component rather than forking the readable renderer, JSON view, or modal behavior.
