/**
 * Illustrative OCDS red-flag indicator engine.
 *
 * Each indicator is a pure function from a release-shaped object to a result.
 * The engine maps the registry over a release and returns every result, so
 * callers (the Analytics station's `RedFlagPlayground`, the Publication
 * portfolio table, and the release inspector) all see the same findings.
 *
 * Statuses follow a single vocabulary:
 * - `signal`         — the condition is met; the process deserves review.
 * - `clear`          — the condition is not met.
 * - `not_assessable` — a required OCDS field is missing, so the check cannot
 *                      run. This is itself a publication-coverage signal.
 *
 * A signal is a question, not a verdict. Indicators surface patterns; they do
 * not establish misconduct or invalidity. Callers should surface this caveat
 * alongside any indicator display.
 */
export type IndicatorStatus = "signal" | "clear" | "not_assessable";

export interface IndicatorEvidence {
  /** OCDS path or computed label, e.g. "tender.numberOfTenderers" or "Calculated duration". */
  path: string;
  /** Human-readable value, e.g. "1" or "Not published" or "9 days". */
  value: string;
}

export interface IndicatorResult {
  id: string;
  category: string;
  name: string;
  status: IndicatorStatus;
  /** Short finding label, e.g. "Risk signal", "Condition not met", "Not assessable". */
  finding: string;
  /** One-paragraph explanation referencing the evidence. */
  explanation: string;
  evidence: IndicatorEvidence[];
  /** The review question this signal raises. */
  question: string;
}

type JsonObject = Record<string, unknown>;

/** A release-shaped object. The engine narrows from `unknown` defensively. */
export type ReleaseLike = unknown;

export interface Indicator {
  id: string;
  category: string;
  name: string;
  /** Returns `null` to opt out for this release (e.g. release has no awards). */
  evaluate: (release: ReleaseLike) => IndicatorResult | null;
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function object(value: unknown): JsonObject {
  return isObject(value) ? value : {};
}
function objects(value: unknown): JsonObject[] {
  return Array.isArray(value) ? value.filter(isObject) : [];
}
function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
function str(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * The registry. Add new indicators here; every consumer picks them up
 * automatically. Indicators may return `null` to opt out for a release where
 * the underlying lifecycle stage is genuinely absent (e.g. no awards at all).
 */
export const INDICATORS: Indicator[] = [
  {
    id: "single-bidder",
    category: "Competition",
    name: "Single submitted bid",
    evaluate: (release) => {
      const tenderers = num(object(object(release).tender).numberOfTenderers);
      return {
        id: "single-bidder",
        category: "Competition",
        name: "Single submitted bid",
        status: tenderers == null ? "not_assessable" : tenderers === 1 ? "signal" : "clear",
        finding: tenderers == null ? "Not assessable" : tenderers === 1 ? "Risk signal" : "Condition not met",
        explanation: tenderers == null
          ? "The number of tenderers was not published, so this check cannot run."
          : `${tenderers} tenderer${tenderers === 1 ? "" : "s"} recorded. ${tenderers === 1 ? "This process deserves contextual review for limited competition." : "This process does not meet the single-bid condition."}`,
        evidence: [{ path: "tender.numberOfTenderers", value: tenderers == null ? "Not published" : String(tenderers) }],
        question: "Was competition limited, or was there a legitimate reason that only one supplier bid?",
      };
    },
  },
  {
    id: "short-tender-period",
    category: "Timeliness",
    name: "Short tender period",
    evaluate: (release) => {
      const period = object(object(object(release).tender).tenderPeriod);
      const start = str(period.startDate);
      const end = str(period.endDate);
      const days = start && end ? Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) : undefined;
      const THRESHOLD = 14;
      return {
        id: "short-tender-period",
        category: "Timeliness",
        name: "Short tender period",
        status: days == null ? "not_assessable" : days < THRESHOLD ? "signal" : "clear",
        finding: days == null ? "Not assessable" : days < THRESHOLD ? "Risk signal" : "Condition not met",
        explanation: days == null
          ? "The tender period could not be calculated because a date is missing."
          : `The published period is ${days} day${days === 1 ? "" : "s"}. It does not meet this example's illustrative threshold of fewer than ${THRESHOLD} days.`,
        evidence: [
          { path: "tender.tenderPeriod.startDate", value: start ?? "Not published" },
          { path: "tender.tenderPeriod.endDate", value: end ?? "Not published" },
          { path: "Calculated duration", value: days == null ? "Unavailable" : `${days} days` },
        ],
        question: "Did suppliers have enough time, considering the market and what was being purchased?",
      };
    },
  },
  {
    id: "single-supplier",
    category: "Competition",
    name: "Single supplier on award",
    evaluate: (release) => {
      const awards = objects(object(release).awards);
      if (awards.length === 0) return null;
      const suppliers = new Set(
        awards.flatMap((award) => objects(award.suppliers).map((supplier) => String(supplier.id ?? supplier.name ?? "").trim()).filter(Boolean)),
      );
      if (suppliers.size === 0) {
        return {
          id: "single-supplier",
          category: "Competition",
          name: "Single supplier on award",
          status: "not_assessable",
          finding: "Not assessable",
          explanation: "Award entries are published but no supplier is named, so this check cannot run.",
          evidence: [{ path: "awards[].suppliers[].id", value: "Not published" }],
          question: "Why is the awarded supplier not identifiable in the published data?",
        };
      }
      const single = suppliers.size === 1;
      return {
        id: "single-supplier",
        category: "Competition",
        name: "Single supplier on award",
        status: single ? "signal" : "clear",
        finding: single ? "Risk signal" : "Condition not met",
        explanation: `${suppliers.size} supplier${suppliers.size === 1 ? "" : "s"} named across ${awards.length} award${awards.length === 1 ? "" : "s"}. ${single ? "This is a proxy for limited competition — it does not by itself prove sole sourcing, but it deserves review alongside the procurement method." : "More than one supplier is named."}`,
        evidence: [{ path: "Distinct suppliers", value: String(suppliers.size) }],
        question: "Was there genuine competition, or was the procurement method (e.g. direct contracting) the reason only one supplier appears?",
      };
    },
  },
  {
    id: "award-without-contract",
    category: "Publication completeness",
    name: "Award without published contract",
    evaluate: (release) => {
      const awards = objects(object(release).awards);
      const contracts = objects(object(release).contracts);
      if (awards.length === 0) return null;
      const missing = awards.length > contracts.length;
      return {
        id: "award-without-contract",
        category: "Publication completeness",
        name: "Award without published contract",
        status: missing ? "signal" : "clear",
        finding: missing ? "Publication gap" : "Complete for this check",
        explanation: `${awards.length} award${awards.length === 1 ? "" : "s"} and ${contracts.length} contract${contracts.length === 1 ? "" : "s"} published. ${missing ? "At least one award has no matching contract publication; this may be a timing gap or a publication omission." : "Every award has at least one corresponding contract."}`,
        evidence: [
          { path: "awards.length", value: String(awards.length) },
          { path: "contracts.length", value: String(contracts.length) },
        ],
        question: "Is the missing contract a real-world timing gap (not yet signed) or a publication omission?",
      };
    },
  },
  {
    id: "missing-delivery-dates",
    category: "Data quality",
    name: "Missing delivery completion date",
    evaluate: (release) => {
      const milestones = objects(object(release).contracts).flatMap((contract) => objects(contract.implementation ? object(contract.implementation).milestones : undefined));
      if (milestones.length === 0) {
        return {
          id: "missing-delivery-dates",
          category: "Data quality",
          name: "Missing delivery completion date",
          status: "not_assessable",
          finding: "Not assessable",
          explanation: "No delivery milestones were published, so completion cannot be checked.",
          evidence: [{ path: "contracts[].implementation.milestones", value: "Not published" }],
          question: "Was the completion date absent in the source, or was it lost during publication?",
        };
      }
      const missingCount = milestones.filter((item) => item.status === "met" && !item.dateMet).length;
      return {
        id: "missing-delivery-dates",
        category: "Data quality",
        name: "Missing delivery completion date",
        status: missingCount > 0 ? "signal" : "clear",
        finding: missingCount > 0 ? "Publication gap" : "Complete for this check",
        explanation: missingCount > 0
          ? `${missingCount} of ${milestones.length} delivery milestone${milestones.length === 1 ? "" : "s"} ${missingCount === 1 ? "is" : "are"} marked met without a completion date.`
          : "Every completed delivery milestone includes its completion date.",
        evidence: milestones.map((item, index) => ({ path: `contracts[].implementation.milestones[${index}].dateMet`, value: str(item.dateMet) ?? "Not published" })),
        question: "Was the completion date absent in the source, or was it lost during publication?",
      };
    },
  },
];

/**
 * Run every indicator in the registry against a release. Indicators that
 * return `null` (opt-out) are excluded, so the result list contains only
 * checks that meaningfully apply to this release.
 */
export function evaluateIndicators(release: ReleaseLike): IndicatorResult[] {
  return INDICATORS.map((indicator) => indicator.evaluate(release)).filter((result): result is IndicatorResult => result !== null);
}

/** Convenience: count results by status. Useful for summary headers. */
export function summarize(results: IndicatorResult[]): { signal: number; clear: number; not_assessable: number; total: number } {
  const signal = results.filter((r) => r.status === "signal").length;
  const clear = results.filter((r) => r.status === "clear").length;
  const not_assessable = results.filter((r) => r.status === "not_assessable").length;
  return { signal, clear, not_assessable, total: results.length };
}
