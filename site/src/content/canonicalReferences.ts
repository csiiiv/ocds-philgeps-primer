import type { StationId } from "./stations";

export type ReferenceScope = "primer" | "schema" | "guidance";

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
   * for canonical standard material.
   */
  publisher?: string;
}

const OCP = "Open Contracting Partnership";

/**
 * Canonical references linked from station prose and the Reference page.
 *
 * Every link points to a verified, authoritative external source. The primer
 * intentionally does not host or link internal workspace documents: those are
 * written for this project team rather than for the public learner, and their
 * concepts are already covered authoritatively by the sources below.
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
];

export const REFERENCE_SCOPE_LABELS: Record<ReferenceScope, string> = {
  primer: "OCDS primer",
  schema: "OCDS schema",
  guidance: "OCDS guidance",
};
