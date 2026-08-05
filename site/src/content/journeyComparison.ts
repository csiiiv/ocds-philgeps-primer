import { FLAGSHIP_EXAMPLE } from "./workedExample";
import { JOURNEY_EVIDENCE } from "./journeyEvidence";
import { eventsForJourney } from "./journeyTimeline";
import { formatReleaseDate } from "./format";
import type { PossibleJourney } from "./possibleJourneys";

type JsonObject = Record<string, unknown>;

export interface JourneyComparison {
  sourceRows: number | string;
  identity: string;
  items: number;
  awards: number;
  suppliers: number;
  contracts: number;
  chronologyChecks: number;
  period: string;
}

export function comparisonFor(journey: PossibleJourney): JourneyComparison {
  const release = currentRelease(journey.id);
  const tender = object(release.tender);
  const awards = objects(release.awards);
  const contracts = objects(release.contracts);
  const supplierIds = new Set(awards.flatMap((award) => objects(award.suppliers).map((supplier) => String(supplier.id ?? supplier.name))));
  const sourceRows = JOURNEY_EVIDENCE[journey.id]?.find((item) => item.kind === "sourceRows")?.data;
  return {
    sourceRows: Array.isArray(sourceRows) ? sourceRows.length : "Designed history",
    identity: journey.id === "denr-laptops" ? "Synthetic bid reference" : journey.caution?.includes("Solicitation No.") ? "Solicitation-number fallback" : "Bid reference + buyer",
    items: objects(tender.items).length,
    awards: awards.length,
    suppliers: supplierIds.size,
    contracts: contracts.length,
    chronologyChecks: eventsForJourney(journey.id).filter((event) => event.sequenceIssue).length,
    period: journey.end ? `${formatReleaseDate(journey.start)} → ${formatReleaseDate(journey.end)}` : `${formatReleaseDate(journey.start)} → no later endpoint`,
  };
}

function currentRelease(journeyId: string): JsonObject {
  if (journeyId === "denr-laptops") return object(FLAGSHIP_EXAMPLE.record.compiledRelease);
  return object(JOURNEY_EVIDENCE[journeyId]?.find((item) => item.kind === "currentStateRelease")?.data);
}

function object(value: unknown): JsonObject { return isObject(value) ? value : {}; }
function objects(value: unknown): JsonObject[] { return Array.isArray(value) ? value.filter(isObject) : []; }
function isObject(value: unknown): value is JsonObject { return typeof value === "object" && value !== null && !Array.isArray(value); }
