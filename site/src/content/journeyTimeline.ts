import { JOURNEY_EVIDENCE } from "./journeyEvidence";
import type { LifecycleStage } from "./possibleJourneys";

type JsonObject = Record<string, unknown>;

export interface JourneyEvent {
  id: string;
  date?: string;
  stage: LifecycleStage;
  label: string;
  sourceLine?: string;
  sourceField: string;
  sourceValue: string;
  ocdsPath?: string;
  ocdsValue?: string;
  sequenceIssue?: boolean;
}

const STAGE_ORDER: Record<LifecycleStage, number> = { Tender: 0, Award: 1, Contract: 2, Implementation: 3 };

export function eventsForJourney(journeyId: string): JourneyEvent[] {
  const evidence = JOURNEY_EVIDENCE[journeyId] ?? [];
  const source = evidence.find((item) => item.kind === "sourceRows");
  if (source) return eventsFromRows(source.data);
  return evidence.filter((item) => item.kind === "release").map((item) => {
    const release = object(item.data);
    const tags = Array.isArray(release.tag) ? release.tag.map(String) : [];
    const stage = tags.includes("implementation") ? "Implementation" : tags.includes("contract") ? "Contract" : tags.includes("award") ? "Award" : "Tender";
    return { id: `release-${item.id}`, date: item.date, stage, label: item.label, sourceField: "Teaching release", sourceValue: item.id, ocdsPath: "tag", ocdsValue: tags.join(", ") || "tender", sequenceIssue: false };
  });
}

function eventsFromRows(data: unknown): JourneyEvent[] {
  const rows = Array.isArray(data) ? data.filter(isObject) : [];
  const events: JourneyEvent[] = [];
  const seen = new Set<string>();
  const add = (event: JourneyEvent) => {
    const key = `${event.stage}|${event.label}|${event.date ?? "undated"}|${event.sourceValue}`;
    if (!seen.has(key)) { seen.add(key); events.push(event); }
  };

  for (const row of rows) {
    const line = value(row._source_line);
    const awardId = value(row["Award No."]);
    const contractId = value(row["Contract No"]);
    addDate(add, row, line, "Published Date", "Tender", "Tender published", "tender.tenderPeriod.startDate");
    addDate(add, row, line, "Closing Date", "Tender", "Tender closed", "tender.tenderPeriod.endDate");
    if (awardId) {
      addDate(add, row, line, "Award Date", "Award", `Award ${awardId} made`, `awards[id=${awardId}].date`);
      addDate(add, row, line, "Published Date(Award)", "Award", `Award ${awardId} published`, "release.date (latest publication observation)");
    }
    if (contractId) {
      addDate(add, row, line, "Contract Efectivity Date", "Contract", `Contract ${contractId} started`, `contracts[id=${contractId}].period.startDate`);
      addDate(add, row, line, "Contract End Date", "Contract", `Contract ${contractId} ended`, `contracts[id=${contractId}].period.endDate`);
    }
    addDate(add, row, line, "Notice to Proceed Date", "Contract", contractId ? `Notice to proceed for ${contractId}` : "Notice to proceed", undefined);
    if (String(row["Notice Status"] ?? "").toLowerCase().includes("cancel")) {
      add({ id: `cancelled-${line}`, stage: "Tender", label: "Tender cancelled", sourceLine: line, sourceField: "Notice Status", sourceValue: value(row["Notice Status"]) || "Cancelled", ocdsPath: "tender.status", ocdsValue: "cancelled" });
    }
  }

  events.sort((a, b) => {
    if (!a.date && !b.date) return STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage];
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date) || STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage] || a.label.localeCompare(b.label);
  });
  let highestStage = -1;
  return events.map((event) => {
    const rank = STAGE_ORDER[event.stage];
    const sequenceIssue = rank < highestStage;
    highestStage = Math.max(highestStage, rank);
    return { ...event, sequenceIssue };
  });
}

function addDate(add: (event: JourneyEvent) => void, row: JsonObject, line: string | undefined, field: string, stage: LifecycleStage, label: string, ocdsPath?: string) {
  const raw = value(row[field]);
  if (!raw) return;
  add({ id: `${field}-${line}-${raw}`, date: raw.slice(0, 10), stage, label, sourceLine: line, sourceField: field, sourceValue: raw, ocdsPath, ocdsValue: ocdsPath ? `${raw.replace(" ", "T").replace(/\.\d+$/, "")}+08:00` : undefined });
}

function object(valueToCheck: unknown): JsonObject { return isObject(valueToCheck) ? valueToCheck : {}; }
function isObject(valueToCheck: unknown): valueToCheck is JsonObject { return typeof valueToCheck === "object" && valueToCheck !== null && !Array.isArray(valueToCheck); }
function value(valueToFormat: unknown) { const text = String(valueToFormat ?? "").trim(); return !text || text === "NULL" || text === "0" ? undefined : text; }
