import { useState } from "react";
import { downloadJson } from "./ArtifactView";
import { JsonView } from "./JsonView";

export interface JsonArtifact { id: string; label: string; data: unknown; filename: string; description?: string }

/** One artifact picker replaces repeated JSON disclosures and download buttons. */
export function ArtifactBrowser({ items, label = "JSON artifact" }: { items: JsonArtifact[]; label?: string }) {
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  const [showJson, setShowJson] = useState(false);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  if (!selected) return null;
  return <div className="artifact-browser">
    <div className="artifact-browser__toolbar">
      <label className="learning-select">{label}<select value={selected.id} onChange={(event) => { setSelectedId(event.target.value); setShowJson(false); }}>{items.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <button className="lesson-button" type="button" aria-expanded={showJson} onClick={() => setShowJson(!showJson)}>{showJson ? "Hide JSON" : "View JSON"}</button>
      <button className="lesson-button" type="button" aria-label={`Download ${selected.label}`} onClick={() => downloadJson(selected.data, selected.filename)}>Download JSON</button>
    </div>
    {selected.description && <p className="artifact-browser__description">{selected.description}</p>}
    {showJson && <JsonView data={selected.data} label={selected.label} />}
  </div>;
}
