import type { StationId } from "./stations";

export type ReferenceScope = "primer" | "schema" | "guidance" | "workspace";

export interface CanonicalReference {
  id: string;
  title: string;
  url: string;
  scope: ReferenceScope;
  /** Stations where this reference is the natural "go deeper" link. Empty = general. */
  stations?: StationId[];
  /** Short description (1 sentence). */
  description: string;
  /**
   * Optional publisher/organization label. Use "Open Contracting Partnership"
   * for canonical standard material. Workspace docs use a relative path and
   * omit the publisher.
   */
  publisher?: string;
}

const OCP = "Open Contracting Partnership";

/**
 * Canonical references linked from station prose and the Reference page.
 *
 * External links must point to verified authoritative sources. Workspace links
 * use relative paths from the repository root and never imply a public URL.
 */
export const CANONICAL_REFERENCES: CanonicalReference[] = [
  {
    id: "ocds-primer-releases-records",
    title: "How is OCDS data published?",
    url: "https://standard.open-contracting.org/latest/en/primer/releases_and_records/",
    scope: "primer",
    stations: ["4-record"],
    publisher: OCP,
    description: "The authoritative primer on releases, records, compiled releases, versioned releases, and the incremental publishing model taught in Station 4.",
  },
  {
    id: "ocds-release-reference",
    title: "OCDS 1.1.5 release reference",
    url: "https://standard.open-contracting.org/latest/en/schema/reference/",
    scope: "schema",
    stations: ["4-record"],
    publisher: OCP,
    description: "Field-level reference for the release schema. Source of truth for tender, parties, awards, contracts, and implementation structures.",
  },
  {
    id: "ocds-record-reference",
    title: "OCDS 1.1.5 record reference",
    url: "https://standard.open-contracting.org/latest/en/schema/records_reference/",
    scope: "schema",
    stations: ["4-record"],
    publisher: OCP,
    description: "Field-level reference for the record schema: release index, compiled release, versioned release.",
  },
  {
    id: "ocds-merging",
    title: "OCDS merging specification",
    url: "https://standard.open-contracting.org/latest/en/schema/merging/",
    scope: "schema",
    stations: ["4-record"],
    publisher: OCP,
    description: "Defines how releases merge into a compiled release, including wholeListMerge annotations and identifier-merge rules.",
  },
  {
    id: "ocds-identifiers",
    title: "OCDS identifiers guidance",
    url: "https://standard.open-contracting.org/latest/en/schema/identifiers/",
    scope: "guidance",
    stations: ["3-mapped"],
    publisher: OCP,
    description: "How OCIDs are constructed from a registered prefix and a publisher's internal process identifier.",
  },
  {
    id: "ocds-milestones",
    title: "OCDS milestone guidance",
    url: "https://standard.open-contracting.org/latest/en/guidance/map/milestones/",
    scope: "guidance",
    stations: ["4-record"],
    publisher: OCP,
    description: "How to model delivery milestones, including the delivery-type pattern used by the flagship implementation events.",
  },
  {
    id: "ocds-bids-extension",
    title: "Bids and expressions of interest extension 1.1.5",
    url: "https://extensions.open-contracting.org/en/extensions/bids/v1.1.5/",
    scope: "schema",
    stations: ["4-record"],
    publisher: OCP,
    description: "Extension that structures individual bids under bids.details[].tenderers[]. Required when bid-level detail is published; must be declared at package level.",
  },
  {
    id: "pipeline-architecture",
    title: "PhilGEPS pipeline architecture",
    url: "../PHILGEPS_PIPELINE_ARCHITECTURE.md",
    scope: "workspace",
    stations: ["1-event", "2-extracted", "3-mapped"],
    description: "The workspace's five-layer pipeline. Its diagram is the literal spine of the journey; Schema 3 columns drive Station 2.",
  },
  {
    id: "release-package-guide",
    title: "OCDS release package guide",
    url: "../docs/OCDS_RELEASE_PACKAGE_GUIDE.md",
    scope: "workspace",
    stations: ["4-record"],
    description: "Workspace notes on release packages and the five required package fields. Feeds the Publication & Portfolio chapter.",
  },
  {
    id: "process-release-identity",
    title: "OCDS process and release identity",
    url: "../philgeps_schema_analysis/docs/OCDS_PROCESS_AND_RELEASE_IDENTITY.md",
    scope: "workspace",
    stations: ["1-event", "3-mapped", "4-record"],
    description: "Workspace analysis of the contracting-process concept, the release/record distinction, and the boundary decision behind Station 3.",
  },
  {
    id: "id-generation",
    title: "OCDS ID generation",
    url: "../philgeps_schema_analysis/docs/OCDS_ID_GENERATION.md",
    scope: "workspace",
    stations: ["3-mapped"],
    description: "How the workspace constructs an OCID during mapping. Feeds the mapping station and field-trace content.",
  },
  {
    id: "mapping-compliance",
    title: "OCDS mapping compliance",
    url: "../docs/OCDS_MAPPING_COMPLIANCE.md",
    scope: "workspace",
    stations: ["3-mapped"],
    description: "Mapping files vs releases; codelist and path compliance. Station 3 leans on this for the mapping-exercise feedback.",
  },
  {
    id: "philgeps-ocds-plan",
    title: "PhilGEPS OCDS plan",
    url: "../philgeps_ocds_plan.md",
    scope: "workspace",
    stations: ["3-mapped", "5-analyzed"],
    description: "Flat rows → process-oriented releases; Cardinal workflow and indicator references used in the Analytics station.",
  },
  {
    id: "ocp-red-flags",
    title: "OCP red flags to OCDS mapping",
    url: "../ocds_mapping_explorer/references/OCP_RED_FLAGS_TO_OCDS.md",
    scope: "workspace",
    stations: ["5-analyzed"],
    description: "Red-flag catalogue R001–R073 and the OCDS paths each indicator reads. Source for the Analytics station's evidence panel.",
  },
];

export const REFERENCE_SCOPE_LABELS: Record<ReferenceScope, string> = {
  primer: "OCDS primer",
  schema: "OCDS schema",
  guidance: "OCDS guidance",
  workspace: "Workspace doc",
};
