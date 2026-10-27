import { STORY_EVENTS } from "./simulation";
import type { JsonObject } from "./ocdsMerge";

type Cell = string | number | boolean | null;
export type SourceRow = Record<string, Cell>;
export const SOURCE_TABLES = [
  { id: "tenders", keys: ["bid_reference_no"], mapping: "tender; buyer and procuring-entity references" },
  { id: "organizations", keys: ["organization_id"], mapping: "parties; roles follow the organization's relationships" },
  { id: "tenderers", keys: ["tender_id", "organization_id"], mapping: "tender.numberOfTenderers and tenderer party roles; not a bid-price table" },
  { id: "amendments", keys: ["amendment_id"], mapping: "tender.amendments; the publisher adds release references" },
  { id: "awards", keys: ["award_id"], mapping: "awards and supplier references (one supplier per award in this example)" },
  { id: "contracts", keys: ["contract_id"], mapping: "contracts; award_id joins to awards.award_id" },
  { id: "deliveries", keys: ["delivery_id"], mapping: "contracts[].implementation.milestones; contract_id joins to contracts" },
  { id: "internal_notes", keys: ["note_id"], mapping: "Internal only; excluded from the illustrative publication policy" },
] as const;
export type SourceTableId = typeof SOURCE_TABLES[number]["id"];
export interface SourceChange { table: SourceTableId; key: string; before?: SourceRow; after: SourceRow }
export interface CapturedEvent { event_id: string; occurred_at: string; publication_eligible: boolean; changes: SourceChange[] }
export interface SourceDatabase { tables: Record<SourceTableId, SourceRow[]>; captured_events: CapturedEvent[] }
const object = (value: unknown): JsonObject => value && typeof value === "object" ? value as JsonObject : {};
const list = (value: unknown): JsonObject[] => Array.isArray(value) ? value : [];

function project(input: JsonObject, fields: Record<string, string>): SourceRow {
  const result: SourceRow = {};
  for (const [column, path] of Object.entries(fields)) {
    const value = path.split(".").reduce<unknown>((item, key) => object(item)[key], input);
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) result[column] = value;
  }
  return result;
}

/** A fictional relational projection of source-event fixtures, independent of
 * publication and record jobs. No OCDS merge or published record is used here. */
export function sourceDatabase(eventCount: number): SourceDatabase {
  const database: SourceDatabase = { tables: Object.fromEntries(SOURCE_TABLES.map((table) => [table.id, []])) as unknown as SourceDatabase["tables"], captured_events: [] };
  for (const event of STORY_EVENTS.slice(0, Math.max(0, eventCount))) {
    const changes: SourceChange[] = [];
    const upsert = (table: SourceTableId, patch: SourceRow) => {
      const definition = SOURCE_TABLES.find((item) => item.id === table)!;
      // Comparing all key columns preserves composite relationship keys.
      const current = database.tables[table].find((row) => definition.keys.every((key) => row[key] === patch[key]));
      const before = current ? { ...current } : undefined;
      const after = { ...current, ...patch };
      if (JSON.stringify(before) === JSON.stringify(after)) return;
      if (current) Object.assign(current, patch); else database.tables[table].push(after);
      changes.push({ table, key: definition.keys.map((key) => String(after[key])).join(" / "), before, after: { ...after } });
    };
    const release: JsonObject = event.release ?? {};
    const tender = object(release.tender);
    for (const party of list(release.parties)) upsert("organizations", project(party, { organization_id: "id", name: "name" }));
    if (tender.id) upsert("tenders", { ...project(tender, {
      bid_reference_no: "id", title: "title", status: "status", method: "procurementMethod",
      estimated_value: "value.amount", currency: "value.currency", posted_at: "tenderPeriod.startDate",
      closing_at: "tenderPeriod.endDate", procuring_entity_id: "procuringEntity.id", tenderer_count: "numberOfTenderers",
    }), ...(release.buyer ? { buyer_id: String(object(release.buyer).id) } : {}) });
    for (const amendment of list(tender.amendments)) upsert("amendments", { ...project(amendment, { amendment_id: "id", issued_at: "date", description: "description", change_reason: "rationale" }), tender_id: String(tender.id) });
    for (const party of list(release.parties)) {
      if (list(release.awards).length === 0 && Array.isArray(party.roles) && party.roles.includes("tenderer")) upsert("tenderers", { tender_id: String(tender.id), organization_id: String(party.id) });
    }
    for (const award of list(release.awards)) upsert("awards", {
      ...project(award, { award_id: "id", title: "title", status: "status", award_date: "date", value: "value.amount", currency: "value.currency" }),
      tender_id: String(database.tables.tenders[0].bid_reference_no), supplier_id: String(list(award.suppliers)[0].id),
    });
    for (const contract of list(release.contracts)) {
      upsert("contracts", project(contract, { contract_id: "id", award_id: "awardID", title: "title", status: "status", signed_at: "dateSigned", value: "value.amount", currency: "value.currency" }));
      for (const milestone of list(object(contract.implementation).milestones)) upsert("deliveries", {
        ...project(milestone, { delivery_id: "id", title: "title", status: "status", completed_at: "dateMet" }), contract_id: String(contract.id),
      });
    }
    if (event.id === STORY_EVENTS[0].id || event.id === "internal-edit") upsert("internal_notes", {
      note_id: "note-001", tender_id: "2024-001", body: event.id === "internal-edit" ? "Draft review: confirm delivery contact." : "Draft review pending.",
    });
    database.captured_events.push({ event_id: event.id, occurred_at: event.occurredAt, publication_eligible: Boolean(event.release), changes });
  }
  return database;
}
