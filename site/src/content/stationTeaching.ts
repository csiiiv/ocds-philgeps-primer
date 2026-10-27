import type { StationId } from "./stations";

export interface TeachingCallout {
  variant: "info" | "warn";
  title: string;
  body: string;
}

export interface StationTeaching {
  /** A short framing paragraph shown after the lede. */
  framing: string;
  /** Optional callouts that reinforce a core concept. */
  callouts?: TeachingCallout[];
}

export const STATION_TEACHING: Record<StationId, StationTeaching> = {
  "1-event": {
    framing:
      "A procurement story unfolds through real-world events: a notice is posted, a bid is received, an award is made, a contract is signed, goods are delivered. Source systems may record these events individually or expose only their accumulated current state.",
    callouts: [
      {
        variant: "info",
        title: "Events and publications have different roles",
        body: "An event is something that happens. A publication policy determines which meaningful changes produce releases and when. An internal database edit need not produce a release; a release can repeat unchanged information as well as publish changes.",
      },
    ],
  },
  "2-extracted": {
    framing:
      "An export chooses what one row represents. One row may contain tender, award, supplier, and contract facts; several rows may instead describe items or awards within the same process. Inspect the row grain and shared keys before grouping or mapping.",
    callouts: [
      {
        variant: "warn",
        title: "Flat rows hide the process",
        body: "The audited Liliw example has four source rows for four items in one process. The Cebu example has two rows for two awards. Shared keys and source semantics establish relationships; a row count does not establish the number of events, releases, or processes.",
      },
    ],
  },
  "3-mapped": {
    framing:
      "The notice row is mapped into the OCDS fields appropriate to that event: buyer, parties, and tender. Later bid, award, contract, and implementation events populate their own sections in later releases. This is also where the event is joined to its contracting process — by deriving its ocid from the process identifier.",
    callouts: [
      {
        variant: "info",
        title: "What starts a contracting process?",
        body: "The process boundary is the ocid, but OCDS does not prescribe which Philippine source field must generate it. A publisher should use the earliest stable internal identifier that uniquely follows one contracting process across systems. In the source exports available to this project, a valid bid_reference_no is currently the strongest observed tender-stage key, so this example uses it. That is a dataset-specific mapping decision, not an OCDS rule.",
      },
      {
        variant: "info",
        title: "Could the APP be the better starting point?",
        body: "Possibly—if an APP procurement-project identifier is exposed, unique, and carried unchanged through tender, award, contract, and implementation. But an APP entry can also be a planning container that leads to more than one procurement attempt. In that case, keep the APP identifier as planning or project provenance and assign each attempt its own ocid, linking related attempts where appropriate. The mapping must be tested against the actual source cardinality and lifecycle.",
      },
      {
        variant: "warn",
        title: "Fallbacks are hypotheses, not equivalent keys",
        body: "It is tempting to fall back to Solicitation No. or Award ID when Bid Reference No. is absent. These fields can have different scopes and collision patterns: sample analysis found 679 S3 2021 solicitation values mapping to multiple unrelated bids. A fallback therefore needs its own namespace, provenance, confidence flag, and collision tests; it must not silently pretend to have the same process boundary as a valid bid reference.",
      },
      {
        variant: "info",
        title: "The example prefix is fictional",
        body: "ocds-philgeps is a readable placeholder for this synthetic lesson, not a registered production OCID prefix. A real publisher requests a unique prefix, then appends its stable internal contracting-process identifier.",
      },
    ],
  },
  "4-record": {
    framing:
      "A release is one immutable JSON document published when information about the process changes. Many releases describe one contracting process over time. A record indexes those releases and should include a compiled release giving the latest known field values under OCDS merge rules, and may include a versioned release containing field-value history and source-release provenance.",
    callouts: [
      {
        variant: "info",
        title: "One process, one record, many releases",
        body: "The ocid is the join key. Every release sharing an ocid belongs to the same record. When releases become available, the record's index and derived views are updated to reflect them. The standard defines the result, not whether a publisher updates or regenerates it internally.",
      },
      {
        variant: "warn",
        title: "Honest about this pipeline",
        body: "The workspace's bulk compiler creates artifacts labelled as compiled releases, but its grouping semantics are under review and it does not provide a release history. The worked example below illustrates the target incremental publishing model. Real Chapter 2 fixtures are instead labelled reconstructed current-state releases: they can show disclosed state, but not how it changed.",
      },
      {
        variant: "info",
        title: "Release objects live inside packages",
        body: "This station focuses on the releases inside one record. Actual OCDS publication wraps releases and records in packages carrying metadata such as a URI, schema version, publication date, and publisher. Packages return in the later publication chapter.",
      },
    ],
  },
  "5-analyzed": {
    framing:
      "Indicators and red flags read OCDS paths and surface risk signals: a single bid on a large tender, a tender period too short to attract competition, or a contract value far above the award. Because the indicators run over structured paths, they also surface what isn't there — and missing data is itself a signal.",
    callouts: [
      {
        variant: "info",
        title: "Gaps are visible in OCDS",
        body: "An active award with no contracts[] referencing it is a machine-detectable fact: the path exists and is empty. A blank contract-amount cell in a spreadsheet is not — it is just absent. OCDS makes partial lifecycles legible, which makes data-quality problems actionable rather than invisible.",
      },
    ],
  },
};
