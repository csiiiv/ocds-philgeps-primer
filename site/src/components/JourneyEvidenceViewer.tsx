import { useState } from "react";
import type { JourneyEvidenceItem } from "../content/journeyEvidence";
import { ReleaseInspector, type InspectorItem, ReleaseSummary } from "./ReleaseInspector";

export { ReleaseSummary };

interface JourneyEvidenceViewerProps {
  items: JourneyEvidenceItem[];
  provenance: string;
}

type JsonObject = Record<string, unknown>;

/**
 * Possible Journeys evidence viewer.
 *
 * The list of items may mix flattened source rows and reconstructed
 * current-state releases. This viewer just composes the shared
 * `ReleaseInspector`; it owns no dialog of its own.
 */
export function JourneyEvidenceViewer({ items, provenance }: JourneyEvidenceViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const reconstructed = items.find((item) => item.kind === "currentStateRelease");
  const reconstructedRelease = reconstructed ? object(reconstructed.data) : undefined;

  const inspectorItems: InspectorItem[] = items.map((item) => ({
    id: item.id,
    label: item.label,
    date: item.date,
    kind: item.kind,
    data: item.data,
  }));

  return (
    <>
      {reconstructedRelease && <section className="record-summary record-summary--reconstructed" aria-label="Reconstructed process summary">
        <div><span>Contracting process</span><strong>{text(reconstructedRelease.ocid)}</strong></div>
        <div><span>Current-state releases</span><strong>1 reconstructed</strong></div>
        <div><span>Publication history</span><strong>Not available</strong></div>
      </section>}
      <div className={reconstructedRelease ? "record-panel reconstructed-record" : undefined}>
        {reconstructedRelease && <div className="reconstructed-record__heading"><div><span>Available record evidence</span><h3>Reconstructed process view</h3></div><span className="availability-label">No compiled or versioned history</span></div>}
        <div className="evidence-index" aria-label="Available record evidence">
        {items.map((item, index) => (
          <button type="button" key={item.id} onClick={() => setSelectedIndex(index)}>
            <span className="evidence-index__number">{item.kind === "release" ? index + 1 : item.kind === "sourceRows" ? "RAW" : "OCDS"}</span>
            <span><strong>{item.label}</strong><small>{typeLabel(item, provenance)}{item.date ? ` · ${item.date.slice(0, 10)}` : ""}</small></span>
            <b>View data <span aria-hidden="true">→</span></b>
          </button>
        ))}
        </div>
      </div>

      <ReleaseInspector
        items={inspectorItems}
        selectedIndex={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onSelect={setSelectedIndex}
        contextLabel={`${provenance} journey evidence`}
      />
    </>
  );
}

function typeLabel(item: JourneyEvidenceItem, provenance: string) {
  return item.kind === "release"
    ? `${provenance} teaching release`
    : item.kind === "sourceRows" ? "Exact flattened source data" : "POC OCDS transformation";
}
function object(value: unknown): JsonObject { return isObject(value) ? value : {}; }
function isObject(value: unknown): value is JsonObject { return typeof value === "object" && value !== null && !Array.isArray(value); }
function text(value: unknown) { return value == null || value === "" ? "Not published" : String(value); }
