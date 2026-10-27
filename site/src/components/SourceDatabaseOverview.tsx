import { useState } from "react";
import { ArtifactBrowser } from "./ArtifactBrowser";
import { SOURCE_TABLES, sourceDatabase, type SourceTableId } from "../content/sourceDatabase";

export function SourceDatabaseOverview({ eventCount, historical }: { eventCount: number; historical: boolean }) {
  const database = sourceDatabase(eventCount);
  const changes = database.captured_events[database.captured_events.length - 1]?.changes ?? [];
  const suggested = changes.some((change) => change.table === "tenders") ? "tenders" : changes[changes.length - 1]?.table ?? "tenders";
  const [selected, setSelected] = useState<SourceTableId>(suggested);
  const table = SOURCE_TABLES.find((item) => item.id === selected)!;
  const rows = database.tables[selected];
  const updatedColumns = new Set(changes.filter((change) => change.table === selected && change.before).flatMap((change) => Object.keys(change.after).filter((column) => change.before?.[column] !== change.after[column])));
  // Show updated values first so a deadline change is visible without scrolling
  // through every unchanged column in a narrow source panel.
  const columns = [...new Set([...updatedColumns, ...rows.flatMap((row) => Object.keys(row))])];
  const rowCount = Object.values(database.tables).reduce((count, entries) => count + entries.length, 0);
  return <div className="source-database">
    <h3>Inside the source database</h3>
    <p className="source-database-note">Fictional source tables{eventCount ? ` · after event ${eventCount}` : ""}.</p>
    <p className="source-database-counts"><strong>{rowCount} source rows</strong> · {SOURCE_TABLES.filter((item) => database.tables[item.id].length).length} populated tables · {database.captured_events.length} captured events</p>
    {historical && <p className="journey-caution">Historical source snapshot after event {eventCount}. The published archive and latest record stay unchanged.</p>}
    <label className="learning-select">Inspect a source table<select value={selected} onChange={(event) => setSelected(event.target.value as SourceTableId)}>{SOURCE_TABLES.map((item) => <option key={item.id} value={item.id}>{item.id} ({database.tables[item.id].length} {database.tables[item.id].length === 1 ? "row" : "rows"})</option>)}</select></label>
    {rows.length ? <div className="learning-table-wrap source-table-wrap" role="region" aria-label={`${selected} source rows`} tabIndex={0}><table className="learning-table source-table"><caption>{selected} · {rows.length} {rows.length === 1 ? "row" : "rows"}</caption><thead><tr><th>Event change</th>{columns.map((column) => <th key={column} scope="col"><code>{column}</code></th>)}</tr></thead><tbody>{rows.map((row) => {
      const change = changes.find((item) => item.table === selected && table.keys.every((key) => item.after[key] === row[key]));
      return <tr key={table.keys.map((key) => row[key]).join("/")} className={change ? "source-row-changed" : undefined}><th scope="row">{change ? change.before ? "Updated" : "Added" : "Unchanged"}</th>{columns.map((column) => {
        const changed = change && change.before?.[column] !== row[column];
        return <td key={column}>{changed && change.before && <><del>{String(change.before[column] ?? "Not recorded")}</del><span aria-hidden="true"> → </span></>}<span className={changed ? "source-cell-changed" : undefined}>{String(row[column] ?? "Not recorded")}</span></td>;
      })}</tr>;
    })}</tbody></table></div> : <p className="source-empty">No rows in <code>{selected}</code> yet.</p>}
    <p className="source-database-note">Scroll across to inspect columns. Source writes happen before publication and record jobs.</p>
    <p className="source-database-note"><strong>Key:</strong> <code>{table.keys.join(" + ")}</code><br /><strong>OCDS destination:</strong> {table.mapping}.</p>
    {selected === "internal_notes" && <p className="journey-caution">Internal rows remain in the source. This note is excluded from every release and record.</p>}
    {selected === "deliveries" && rows.some((row) => !row.completed_at) && <p className="journey-caution">The final delivery has no recorded completion date. The event time does not fill this gap.</p>}
    <details className="source-table-inventory"><summary>All source table counts and joins</summary><p>This illustrative schema is not the actual PhilGEPS database. Columns reuse the synthetic story's known values; internal note text is also invented.</p><ul>{SOURCE_TABLES.map((item) => <li key={item.id}><code>{item.id}</code>: <strong>{database.tables[item.id].length} rows</strong><small>{item.mapping}</small></li>)}</ul></details>
    <details className="source-event-log"><summary>Captured changes for this event ({changes.length} row writes)</summary><p>Current rows can overwrite old values. This replay separately retains before/after event data so a later publication job can process each captured change.</p><ul>{changes.map((change, index) => <li key={index}><strong>{change.before ? "Updated" : "Added"}</strong> <code>{change.table}</code> · {change.key}{change.before && <ul>{Object.keys(change.after).filter((column) => change.before?.[column] !== change.after[column]).map((column) => <li key={column}><code>{column}</code>: <del>{String(change.before?.[column] ?? "Not recorded")}</del> → <strong>{String(change.after[column])}</strong></li>)}</ul>}</li>)}</ul></details>
    <ArtifactBrowser label="Source artifact" items={[{ id: "snapshot", label: "Source database snapshot JSON", data: database, filename: `denr-source-after-event-${eventCount}.json` }]} />
  </div>;
}
