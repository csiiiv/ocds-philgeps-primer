export type Provenance = "Synthetic" | "Adapted" | "Real";
export type LifecycleStage = "Tender" | "Award" | "Contract" | "Implementation";

export interface PossibleJourney {
  id: string;
  title: string;
  buyer: string;
  provenance: Provenance;
  shape: string;
  stages: LifecycleStage[];
  start: string;
  end?: string;
  metrics: Array<{ label: string; value: string }>;
  why: string;
  canAnalyze: string;
  cannotAnalyze: string;
  source: string;
  ocid?: string;
  caution?: string;
}

const POC_SOURCE = "2023.csv · exact source rows preserved in examples/poc_etl/source_rows.json";

export const POSSIBLE_JOURNEYS: PossibleJourney[] = [
  {
    id: "denr-laptops",
    title: "Laptops for DENR Region VII",
    buyer: "DENR Region VII",
    provenance: "Synthetic",
    shape: "Complete teaching lifecycle",
    stages: ["Tender", "Award", "Contract", "Implementation"],
    start: "2024-03-01",
    end: "2024-07-15",
    metrics: [{ label: "Illustrative releases", value: "7" }, { label: "Observed span", value: "136 days" }],
    why: "The deliberately tidy reference journey used in Chapter 1.",
    canAnalyze: "Process continuity, amendments, competition, current state, version history, and delivery-publication quality.",
    cannotAnalyze: "Whether this lifecycle shape or its signals are common in real PhilGEPS data.",
    source: "Designed and schema-validated teaching fixture: examples/denr-r7-laptops-2024.json",
    caution: "No real procurement is represented.",
  },
  {
    id: "poc-single-row",
    title: "Sharp toner cartridges",
    buyer: "National Meat Inspection Service",
    provenance: "Real",
    shape: "One-row flattened process",
    stages: ["Tender", "Award", "Contract"],
    start: "2023-12-18",
    metrics: [{ label: "Source rows", value: "1" }, { label: "Tender items", value: "1" }, { label: "Awards / contracts", value: "1 / 1" }],
    why: "Shows that one export row can already contain tender, award, supplier, and contract facts.",
    canAnalyze: "The disclosed current state and how fields from one flattened row separate into OCDS entities.",
    cannotAnalyze: "A historical release sequence or contract duration because no contract period is published.",
    source: `${POC_SOURCE} · line 2`,
    ocid: "ocds-philgeps-poc-23-11-1710-national-meat-inspection",
    caution: "Bid Reference No. is 0, so this fixture explicitly uses Solicitation No. as a POC identity fallback.",
  },
  {
    id: "poc-multi-item",
    title: "Streetlight installation materials",
    buyer: "Municipality of Liliw, Laguna",
    provenance: "Real",
    shape: "Four rows, one award",
    stages: ["Tender", "Award", "Contract"],
    start: "2023-01-04",
    end: "2023-02-10",
    metrics: [{ label: "Source rows", value: "4" }, { label: "Tender items", value: "4" }, { label: "Awards / contracts", value: "1 / 1" }],
    why: "Demonstrates that repeated rows can be line items rather than separate contracting processes.",
    canAnalyze: "The four disclosed items, shared process metadata, award, supplier, and contract.",
    cannotAnalyze: "Whether the equal contract start and end dates describe actual delivery or a source-entry issue.",
    source: `${POC_SOURCE} · lines 23448–23451`,
    ocid: "ocds-philgeps-poc-9386985-municipality-of-liliw-la",
    caution: "Negative item-budget sentinels are omitted; the source values remain available beside the transformation.",
  },
  {
    id: "poc-multi-award",
    title: "Secure socket licence and managed storage service",
    buyer: "City of Cebu",
    provenance: "Real",
    shape: "One tender, two awards",
    stages: ["Tender", "Award", "Contract"],
    start: "2023-01-23",
    end: "2023-05-22",
    metrics: [{ label: "Source rows", value: "2" }, { label: "Awards / contracts", value: "2 / 2" }, { label: "Combined awards", value: "₱938,600" }],
    why: "Proves that different award numbers can remain inside one bid-level contracting process.",
    canAnalyze: "Two items, two suppliers, two award values, and two contracts correctly linked through award IDs.",
    cannotAnalyze: "Bid competition because the free-text bidder field has not been interpreted as structured bids.",
    source: `${POC_SOURCE} · lines 21179–21180`,
    ocid: "ocds-philgeps-poc-9342044-city-of-cebu-cebu",
    caution: "An award-first grouping would incorrectly split this one process into two OCIDs.",
  },
  {
    id: "poc-cancelled",
    title: "Construction of stage",
    buyer: "Barangay Taloto, Camalig, Albay",
    provenance: "Real",
    shape: "Cancelled before award",
    stages: ["Tender"],
    start: "2023-07-23",
    metrics: [{ label: "Source rows", value: "1" }, { label: "Visible endpoint", value: "Cancelled" }, { label: "Approved budget", value: "₱389,964.58" }],
    why: "Shows a real process that ends without an award or contract in the export.",
    canAnalyze: "Tender scope, budget, period, method, and disclosed cancelled status.",
    cannotAnalyze: "The cancellation date or reason because neither is present in the selected source row.",
    source: `${POC_SOURCE} · line 20887`,
    ocid: "ocds-philgeps-poc-6412776-barangay-taloto-camalig-",
  },
  {
    id: "poc-award-only",
    title: "School canteen renovation materials",
    buyer: "Diwa Elementary School",
    provenance: "Real",
    shape: "Award visible, contract absent",
    stages: ["Tender", "Award"],
    start: "2023-02-16",
    end: "2023-02-23",
    metrics: [{ label: "Source rows", value: "1" }, { label: "Award value", value: "₱51,872" }, { label: "Contracts", value: "0" }],
    why: "Shows that an award and supplier do not justify inventing a contract object.",
    canAnalyze: "Tender and award facts, supplier, value, and the visible contract-publication gap.",
    cannotAnalyze: "Contract identifier, signing, duration, or implementation.",
    source: `${POC_SOURCE} · line 20898`,
    ocid: "ocds-philgeps-poc-7482778-diwa-elementary-school",
  },
  {
    id: "poc-long-service",
    title: "Western Mindanao janitorial services",
    buyer: "Home Development Mutual Fund",
    provenance: "Real",
    shape: "Three-year service contract",
    stages: ["Tender", "Award", "Contract"],
    start: "2023-01-13",
    end: "2026-04-30",
    metrics: [{ label: "Contract duration", value: "1,095 days" }, { label: "Contract value", value: "₱8.96M" }, { label: "Source rows", value: "1" }],
    why: "Provides a clean long-span comparison where the source explicitly describes a three-year service period.",
    canAnalyze: "Tender, award, supplier, value, and planned contract dates from the flattened current state.",
    cannotAnalyze: "Actual service delivery, payments, amendments, or whether the contract ended as planned.",
    source: `${POC_SOURCE} · line 21653`,
    ocid: "ocds-philgeps-poc-9384586-home-development-mutual-",
    caution: "Long duration is descriptive and is not a red flag by itself.",
  },
  {
    id: "poc-chronology",
    title: "Construction of Ilian Maul Road",
    buyer: "Ministry of Public Works — BARMM",
    provenance: "Real",
    shape: "Chronology anomaly",
    stages: ["Tender", "Award"],
    start: "2023-01-14",
    end: "2022-08-02",
    metrics: [{ label: "Award before tender publication", value: "165 days" }, { label: "Contracts", value: "0" }, { label: "Source rows", value: "1" }],
    why: "Demonstrates why transformations must preserve contradictory dates for investigation instead of silently repairing them.",
    canAnalyze: "The disclosed tender and award fields and the chronology inconsistency between them.",
    cannotAnalyze: "Whether the inconsistency is a late publication, miscoded date, reused reference, or another source problem.",
    source: `${POC_SOURCE} · line 21005`,
    ocid: "ocds-philgeps-poc-8602960-ministry-of-public-works",
    caution: "Treat this as a validation question, not evidence of misconduct or even a confirmed procurement sequence.",
  },
];
