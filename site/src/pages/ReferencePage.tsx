import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CANONICAL_REFERENCES,
  REFERENCE_SCOPE_LABELS,
  type ReferenceScope,
} from "../content/canonicalReferences";
import { STATIONS, STATION_BY_ID, type StationId } from "../content/stations";

type ScopeFilter = "All" | ReferenceScope;
type StationFilter = "All" | StationId;

const SCOPES: ScopeFilter[] = ["All", "primer", "schema", "guidance", "workspace"];

export function ReferencePage() {
  const [scope, setScope] = useState<ScopeFilter>("All");
  const [station, setStation] = useState<StationFilter>("All");
  const [query, setQuery] = useState("");

  const normalized = query.toLowerCase().trim();
  const filtered = CANONICAL_REFERENCES.filter((reference) => {
    if (scope !== "All" && reference.scope !== scope) return false;
    if (station !== "All" && !(reference.stations ?? []).includes(station)) return false;
    if (normalized && !`${reference.title} ${reference.description} ${reference.publisher ?? ""}`.toLowerCase().includes(normalized)) return false;
    return true;
  });

  return (
    <>
      <p className="eyebrow">Reference</p>
      <h1>Reference index</h1>
      <p className="lede">
        Every authoritative source cited by this primer. External links point to verified Open Contracting Partnership documentation; workspace links use relative paths from the repository root and never imply a public URL.
      </p>

      <div className="reference-controls">
        <label>
          <span>Find</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. release, merge, identifiers" />
        </label>
        <label>
          <span>Scope</span>
          <select value={scope} onChange={(event) => setScope(event.target.value as ScopeFilter)}>
            {SCOPES.map((item) => <option key={item} value={item}>{item === "All" ? "All scopes" : REFERENCE_SCOPE_LABELS[item]}</option>)}
          </select>
        </label>
        <label>
          <span>Station</span>
          <select value={station} onChange={(event) => setStation(event.target.value as StationFilter)}>
            <option value="All">All stations</option>
            {STATIONS.map((item) => <option key={item.id} value={item.id}>{item.index}. {item.title}</option>)}
          </select>
        </label>
      </div>

      <p className="gallery-count" aria-live="polite">Showing {filtered.length} of {CANONICAL_REFERENCES.length} references</p>

      {filtered.length ? (
        <ul className="reference-list">
          {filtered.map((reference) => (
            <li key={reference.id} className="reference-item">
              <div className="reference-item__heading">
                <a href={reference.url}>{reference.title}</a>
                <span className={`reference-scope reference-scope--${reference.scope}`}>{REFERENCE_SCOPE_LABELS[reference.scope]}</span>
              </div>
              <p>{reference.description}</p>
              <div className="reference-item__meta">
                <span>{reference.publisher ?? (reference.scope === "workspace" ? "Workspace document" : "External")}</span>
                {reference.stations && reference.stations.length > 0 && (
                  <span className="reference-item__stations">
                    {reference.stations.map((id) => (
                      <Link key={id} to={`/journey/${id}`}>{STATION_BY_ID[id].title}</Link>
                    ))}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-search">No references match these filters.</p>
      )}
    </>
  );
}
