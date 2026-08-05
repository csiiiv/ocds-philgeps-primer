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
      "Everything in OCDS begins as an event in a source system: a notice is posted, a bid is received, an award is made, a contract is signed, goods are delivered. Each event is a discrete thing that happened, at a point in time, recorded by PhilGEPS.",
    callouts: [
      {
        variant: "info",
        title: "Events are the atomic input",
        body: "A release is not one CSV row and it is not one process — it is one publication about a process, and publications happen when events do. The event is what changes; the release is how that change is published.",
      },
    ],
  },
  "2-extracted": {
    framing:
      "When PhilGEPS exports data, each event becomes a flat row. The row carries the event's facts (dates, amounts, names) but no relationships to other rows — even when those rows describe the same procurement.",
    callouts: [
      {
        variant: "warn",
        title: "Flat rows hide the process",
        body: "Four rows with the same Bid Reference No. look like four records in a spreadsheet. They are one contracting process. The relationship is encoded in a shared identifier, not in the row layout — which is why flat exports are so easy to misread.",
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
      "A release is one immutable JSON document published when information about the process changes. Many releases describe one contracting process over time. A record indexes those releases and can include a compiled release generated using OCDS merge rules and a versioned release containing field-value history and source-release provenance.",
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
