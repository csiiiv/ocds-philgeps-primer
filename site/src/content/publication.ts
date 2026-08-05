import releasePackage from "../../../examples/poc_etl/release_package.json";
import { POSSIBLE_JOURNEYS } from "./possibleJourneys";
import { eventsForJourney } from "./journeyTimeline";
import { evaluateIndicators, summarize, type IndicatorResult } from "./indicators";

type JsonObject = Record<string, unknown>;

export interface PortfolioProcess {
  journeyId: string;
  title: string;
  buyer: string;
  ocid: string;
  items: number;
  awards: number;
  suppliers: number;
  contracts: number;
  awardValue: number;
  chronologyChecks: number;
  tags: string[];
  /** Indicator results for this process's current-state release. */
  indicators: IndicatorResult[];
  /** Counts by status, for the portfolio summary header and table cells. */
  indicatorSummary: { signal: number; clear: number; not_assessable: number; total: number };
}

export const POC_RELEASE_PACKAGE = releasePackage;

export const PORTFOLIO_PROCESSES: PortfolioProcess[] = releasePackage.releases.map((release) => {
  const journey = POSSIBLE_JOURNEYS.find((item) => item.ocid === release.ocid);
  if (!journey) throw new Error(`Release package OCID has no Possible Journey: ${release.ocid}`);
  const tender = object(release.tender);
  const awards = objects(release.awards);
  const suppliers = new Set(awards.flatMap((award) => objects(award.suppliers).map((supplier) => String(supplier.id ?? supplier.name))));
  const indicators = evaluateIndicators(release);
  return {
    journeyId: journey.id,
    title: journey.title,
    buyer: journey.buyer,
    ocid: release.ocid,
    items: objects(tender.items).length,
    awards: awards.length,
    suppliers: suppliers.size,
    contracts: objects(release.contracts).length,
    awardValue: awards.reduce((sum, award) => sum + (Number(object(award.value).amount) || 0), 0),
    chronologyChecks: eventsForJourney(journey.id).filter((event) => event.sequenceIssue).length,
    tags: release.tag.map(String),
    indicators,
    indicatorSummary: summarize(indicators),
  };
});

export const PORTFOLIO_TOTALS = {
  processes: PORTFOLIO_PROCESSES.length,
  awarded: PORTFOLIO_PROCESSES.filter((process) => process.awards > 0).length,
  contracted: PORTFOLIO_PROCESSES.filter((process) => process.contracts > 0).length,
  missingContracts: PORTFOLIO_PROCESSES.filter((process) => process.awards > 0 && process.contracts === 0).length,
  multiAward: PORTFOLIO_PROCESSES.filter((process) => process.awards > 1).length,
  chronologyChecks: PORTFOLIO_PROCESSES.filter((process) => process.chronologyChecks > 0).length,
  awardValue: PORTFOLIO_PROCESSES.reduce((sum, process) => sum + process.awardValue, 0),
  indicatorSignals: PORTFOLIO_PROCESSES.reduce((sum, process) => sum + process.indicatorSummary.signal, 0),
  indicatorNotAssessable: PORTFOLIO_PROCESSES.reduce((sum, process) => sum + process.indicatorSummary.not_assessable, 0),
};

function object(value: unknown): JsonObject { return isObject(value) ? value : {}; }
function objects(value: unknown): JsonObject[] { return Array.isArray(value) ? value.filter(isObject) : []; }
function isObject(value: unknown): value is JsonObject { return typeof value === "object" && value !== null && !Array.isArray(value); }
