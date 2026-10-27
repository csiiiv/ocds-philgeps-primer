import { FLAGSHIP_RELEASES } from "./workedExample";
import { buildOcdsRecord, type OcdsRelease, type OcdsRecord, type JsonObject } from "./ocdsMerge";

export type TimingMode = "event" | "scheduled" | "demand";
export const TIMING_MODES: Array<{ id: TimingMode; label: string }> = [
  { id: "event", label: "Event driven" }, { id: "scheduled", label: "Scheduled job" }, { id: "demand", label: "On demand" },
];
export interface StoryEvent { id: string; title: string; occurredAt: string; rule: string; changes: string; release?: OcdsRelease }
const RULES = [
  ["A public tender notice is eligible for publication.", "The tender, buyer, estimated value, and submission window become known."],
  ["A formal amendment must preserve the earlier publication.", "The submission deadline moves from March 20 to March 25; the title and estimate remain known."],
  ["Publish the disclosed bid information after the submission window.", "One tenderer is recorded. This publication uses the fixture's tender tag."],
  ["An announced award is a new publication event.", "An award is added and the existing tenderer also becomes a supplier."],
  ["Publish the signed contract with its award reference.", "The contract points to its award using awardID."],
  ["First disclosed delivery information starts implementation publication.", "The first delivery milestone has a completion date."],
  ["Later delivery information updates implementation.", "A second milestone is added. Its missing dateMet remains a visible data-quality question."],
];
const procurementEvents: StoryEvent[] = FLAGSHIP_RELEASES.map((item, index) => ({
  id: `event-${item.id}`, title: item.summary, occurredAt: item.date,
  rule: RULES[index][0], changes: RULES[index][1], release: item.partial as OcdsRelease,
}));
export const STORY_EVENTS: StoryEvent[] = [
  procurementEvents[0],
  { id: "internal-edit", title: "A private draft note is edited", occurredAt: "2024-03-02T11:00:00+08:00", rule: "This internal draft change is outside the illustrative publication policy.", changes: "The private note is retained internally. No public procurement information changes, so no release is generated." },
  ...procurementEvents.slice(1),
];

export interface PublishedEvent { eventId: string; publishedAt: string; release: OcdsRelease }
export interface SimulationState {
  cursor: number; processed: number; clock: string; published: PublishedEvent[];
  recordCount: number; previousRecordCount: number; recordGeneratedAt?: string;
}
export type SimulationAction = "advance" | "publish" | "record" | "reset";
export function initialSimulation(): SimulationState {
  return { cursor: 0, processed: 0, clock: "2024-03-01T00:00:00+08:00", published: [], recordCount: 0, previousRecordCount: 0 };
}

/** All times are simulated. Jobs retain every captured event, not only the latest source snapshot. */
export function stepSimulation(state: SimulationState, action: SimulationAction, publicationMode: TimingMode, recordMode: TimingMode): SimulationState {
  if (action === "reset") return initialSimulation();
  let next: SimulationState = { ...state, published: [...state.published] };
  if (action === "advance") {
    const event = STORY_EVENTS[next.cursor];
    if (!event) return state;
    next.clock = new Date(Math.max(Date.parse(event.occurredAt), Date.parse(next.clock) + 60_000)).toISOString();
    next.cursor += 1;
    if (publicationMode === "event") next = publishPending(next);
  } else {
    next.clock = new Date(Date.parse(next.clock) + 5 * 60_000).toISOString();
    if (action === "publish") next = publishPending(next);
  }
  if (action === "record" || (recordMode === "event" && next.published.length > next.recordCount)) {
    if (next.recordCount !== next.published.length) {
      next.previousRecordCount = next.recordCount;
      next.recordCount = next.published.length;
      next.recordGeneratedAt = next.clock;
    }
  }
  return next;
}

function publishPending(state: SimulationState): SimulationState {
  const eligible = STORY_EVENTS.slice(state.processed, state.cursor).filter((event) => event.release);
  // Even a batch publishes its captured changes in sequence. In particular,
  // an amendment follows the earlier tender publication, not an equal-date tie.
  const additions = eligible.map((event, index) => {
    const publishedAt = new Date(Date.parse(state.clock) + index).toISOString();
    return { eventId: event.id, publishedAt, release: { ...structuredClone(event.release!), date: publishedAt } };
  });
  return { ...state, clock: additions[additions.length - 1]?.publishedAt ?? state.clock, processed: state.cursor, published: [...state.published, ...additions] };
}

export function simulationRecord(state: SimulationState, count = state.recordCount): OcdsRecord | undefined {
  return count ? buildOcdsRecord(state.published.slice(0, count).map((entry) => entry.release)) : undefined;
}

export function pendingPublications(state: SimulationState): number {
  return STORY_EVENTS.slice(state.processed, state.cursor).filter((event) => event.release).length;
}

export interface FieldChange { path: string; before: unknown; after: unknown }
export function fieldChanges(before: JsonObject = {}, after: JsonObject = {}): FieldChange[] {
  const flatten = (value: unknown, path: string, output: Map<string, unknown>) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const key = item && typeof item === "object" && "id" in item ? `id=${item.id}` : String(index);
        flatten(item, `${path}[${key}]`, output);
      });
    } else if (value && typeof value === "object") {
      for (const [key, item] of Object.entries(value)) flatten(item, path ? `${path}.${key}` : key, output);
    } else output.set(path, value);
  };
  const left = new Map<string, unknown>(); const right = new Map<string, unknown>();
  flatten(before, "", left); flatten(after, "", right);
  return [...new Set([...left.keys(), ...right.keys()])]
    .filter((path) => !["id", "date", "ocid", "tag[0]", "initiationType"].includes(path) && JSON.stringify(left.get(path)) !== JSON.stringify(right.get(path)))
    .map((path) => ({ path, before: left.get(path), after: right.get(path) }));
}
