import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArtifactBrowser } from "../components/ArtifactBrowser";
import { SourceDatabaseOverview } from "../components/SourceDatabaseOverview";
import { ReleaseInspector, ReleaseInspectorInline, type InspectorItem } from "../components/ReleaseInspector";
import { ViewTabs } from "../components/ViewTabs";
import { CompiledReleaseView, VersionedReleaseView } from "../components/RecordViews";
import { fieldChanges, initialSimulation, pendingPublications, simulationRecord, stepSimulation, STORY_EVENTS, TIMING_MODES, type TimingMode, type SimulationAction } from "../content/simulation";
import { sourceDatabase, type SourceDatabase } from "../content/sourceDatabase";
import { releasePackage, recordPackage } from "../content/teachingPackages";
import type { JsonObject } from "../content/ocdsMerge";

const timestamp = (value: string) => new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" }).format(new Date(value));
const display = (value: unknown) => value === undefined ? "Not present" : String(value);
const object = (value: unknown) => (value ?? {}) as JsonObject;
const deadline = (value: unknown) => value ? timestamp(String(value)) : "Not yet known";
function sourceFact(database: SourceDatabase): string {
  const tables = database.tables;
  if (tables.deliveries.length) return `${tables.deliveries.length} delivery milestones${tables.deliveries[tables.deliveries.length - 1].completed_at ? " recorded" : " · latest completion date missing"}`;
  if (tables.contracts.length) return `Signed contract ${tables.contracts[0].contract_id}`;
  if (tables.awards.length) return `Award to ${tables.organizations.find((party) => party.organization_id === tables.awards[0].supplier_id)?.name ?? tables.awards[0].supplier_id}`;
  if (tables.tenders[0]?.tenderer_count !== undefined) return `${tables.tenders[0].tenderer_count} tenderer recorded`;
  return `Closing deadline: ${deadline(tables.tenders[0]?.closing_at)}`;
}
function recordFact(release?: JsonObject): string {
  if (!release) return "Assembled from published releases.";
  const contracts = (release.contracts ?? []) as JsonObject[];
  const milestones = (object(contracts[0]?.implementation).milestones ?? []) as JsonObject[];
  if (milestones.length) return `${milestones.length} delivery milestones${milestones[milestones.length - 1].dateMet ? " published" : " · latest completion date missing"}`;
  if (contracts.length) return `Signed contract ${contracts[0].id}`;
  const awards = (release.awards ?? []) as JsonObject[];
  if (awards.length) return `Award to ${((awards[0].suppliers ?? []) as JsonObject[])[0]?.name}`;
  const tender = object(release.tender);
  if (tender.numberOfTenderers !== undefined) return `${tender.numberOfTenderers} tenderer recorded`;
  return `Closing deadline: ${deadline(object(tender.tenderPeriod).endDate)}`;
}
const INSPECTION_VIEWS = [{ id: "source", label: "Source tables" }, { id: "release", label: "Release" }, { id: "record", label: "Record" }];
const RECORD_VIEWS = [{ id: "current", label: "Current state" }, { id: "history", label: "Release history" }, { id: "versions", label: "Field history" }];

export function SimulationPage() {
  const [state, setState] = useState(initialSimulation);
  const [publicationMode, setPublicationMode] = useState<TimingMode>("event");
  const [recordMode, setRecordMode] = useState<TimingMode>("event");
  const [playing, setPlaying] = useState(false);
  const [inspected, setInspected] = useState<number | null>(null);
  const [inspectedRelease, setInspectedRelease] = useState<number | null>(null);
  const [view, setView] = useState("record");
  const [recordView, setRecordView] = useState("current");
  const complete = state.cursor === STORY_EVENTS.length;
  const eventIndex = inspected ?? state.cursor - 1;
  const event = STORY_EVENTS[eventIndex];
  const publication = state.published.find((entry) => entry.eventId === event?.id);
  const record = simulationRecord(state);
  const previous = simulationRecord(state, state.previousRecordCount);
  const changes = fieldChanges(previous?.compiledRelease, record?.compiledRelease);
  const pending = pendingPublications(state);
  const database = sourceDatabase(eventIndex + 1);
  const sourceRows = Object.values(database.tables).reduce((total, rows) => total + rows.length, 0);
  const recordReleases: InspectorItem[] = (record?.releases ?? []).map((release) => ({ id: release.id, label: `Release ${release.id}`, date: release.date, kind: "release", data: release }));
  const act = (action: SimulationAction) => {
    setState((value) => stepSimulation(value, action, publicationMode, recordMode));
    if (action === "advance" || action === "reset") setInspected(null);
    if (action === "reset") { setPlaying(false); setInspectedRelease(null); }
  };
  useEffect(() => {
    if (!playing || complete) return;
    const timer = window.setInterval(() => {
      setState((value) => stepSimulation(value, "advance", publicationMode, recordMode));
      setInspected(null);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [playing, complete, publicationMode, recordMode]);
  const changeMode = (value: TimingMode, kind: "publication" | "record") => {
    setPlaying(false); setInspected(null); setInspectedRelease(null); setState(initialSimulation());
    if (kind === "publication") setPublicationMode(value); else setRecordMode(value);
  };
  return <div className="replay-page">
    <header className="workspace-header"><div><p className="eyebrow">Learn OCDS · Procurement replay</p><h1>Watch a procurement unfold</h1><p>Advance the DENR laptop story. Compare source data, its publication, and the latest record.</p></div><details className="example-details"><summary>Synthetic example · details</summary><p>A replay, not a live PhilGEPS connection. Source tables, events, notes, and publications are fictional. Every captured event is retained here; a real system polling only overwritten values can miss intermediate changes.</p></details></header>
    <div className="replay-toolbar">
      <div className="learning-actions"><button type="button" className="lesson-button lesson-button--primary" disabled={complete} onClick={() => act("advance")}>Next event</button><button type="button" className="lesson-button" disabled={complete} onClick={() => setPlaying(!playing)}>{playing && !complete ? "Pause replay" : "Autoplay"}</button><button type="button" className="text-button" onClick={() => act("reset")}>Reset replay</button></div>
      <details className="processing-settings"><summary>Processing settings</summary><div className="processing-settings__body"><div className="lesson-grid"><label className="learning-select">Publish releases<select value={publicationMode} onChange={(e) => changeMode(e.target.value as TimingMode, "publication")}>{TIMING_MODES.map((mode) => <option key={mode.id} value={mode.id}>{mode.label}</option>)}</select></label><label className="learning-select">Generate records<select value={recordMode} onChange={(e) => changeMode(e.target.value as TimingMode, "record")}>{TIMING_MODES.map((mode) => <option key={mode.id} value={mode.id}>{mode.label}</option>)}</select></label></div><p>Changing a mode resets the replay. Autoplay advances source events. Release publication and record generation are independent; requesting a record uses archived releases. Repeated jobs do not duplicate processed changes.</p><Link to="/mapping#events">Review event and release mapping →</Link></div></details>
      {publicationMode !== "event" && <button type="button" className="lesson-button" onClick={() => act("publish")}>{publicationMode === "scheduled" ? "Run publication job" : "Publish pending changes"}</button>}
      {recordMode !== "event" && <button type="button" className="lesson-button" onClick={() => act("record")}>{recordMode === "scheduled" ? "Run record job" : "Request record"}</button>}
      <span className="replay-clock">{timestamp(state.clock)} · Philippine time</span>
    </div>
    <p role="status" className="replay-status">{state.cursor} / {STORY_EVENTS.length} events observed · {state.published.length} {state.published.length === 1 ? "release" : "releases"} published · {pending} eligible changes waiting · record includes {state.recordCount} {state.recordCount === 1 ? "release" : "releases"}</p>
    <div className="replay-layout">
      <aside className="event-rail"><h2>Story events</h2><ol className="story-steps" aria-label="Procurement story events">{STORY_EVENTS.map((item, index) => <li key={item.id}><button type="button" disabled={index >= state.cursor} aria-pressed={index === eventIndex} onClick={() => { setPlaying(false); setInspected(index); }}><span>{index + 1}</span><strong>{item.title}</strong><small>{index >= state.cursor ? "Not yet observed" : !item.release ? "Internal only" : state.published.some((entry) => entry.eventId === item.id) ? "Published" : "Waiting to publish"}</small></button></li>)}</ol></aside>
      <div className="replay-workspace">
        <header className="event-heading"><p className="eyebrow">{event ? `Selected event ${eventIndex + 1} · ${timestamp(event.occurredAt)}` : "Ready to begin"}</p><h2>{event?.title ?? "The story has not started"}</h2><p>{event?.changes ?? "Choose Next event to capture the tender notice."}</p>{eventIndex < state.cursor - 1 && <button type="button" className="text-button" onClick={() => setInspected(null)}>Return to latest event</button>}</header>
        <div className="replay-summaries" aria-label="Source to publication to record">
          <section className="state-summary"><p className="eyebrow">1 · Source data</p><h3>{sourceRows} source rows</h3><p>{event?.id === "internal-edit" ? "Internal note changed; no public update." : sourceFact(database)}</p><button className="text-button" type="button" onClick={() => setView("source")}>Inspect source tables →</button></section>
          <section className="state-summary"><p className="eyebrow">2 · Published release</p><h3>{publication ? `Release ${publication.release.id}` : event?.release ? "Waiting to publish" : "No new release"}</h3><p>{publication ? `${publication.release.tag.join(", ")} · ${timestamp(publication.publishedAt)}` : event ? event.rule : "Publications appear after eligible changes."}</p><button className="text-button" type="button" onClick={() => setView("release")}>Inspect publication →</button></section>
          <section className="state-summary"><p className="eyebrow">3 · Generated record</p><h3>{state.recordCount} releases included</h3><p>{recordFact(record?.compiledRelease)}</p><button className="text-button" type="button" onClick={() => setView("record")}>Inspect record →</button></section>
        </div>
        {pending > 0 && <p className="workspace-notice">{pending} eligible source changes are waiting for publication.</p>}
        {state.recordCount < state.published.length && <p className="workspace-notice">The latest record is waiting to be regenerated. It covers {state.recordCount} of {state.published.length} archived releases.</p>}
        {eventIndex < state.cursor - 1 && <p className="workspace-notice">Inspecting source data and the publication for event {eventIndex + 1}. The latest generated record and archive remain at their current state.</p>}
        <div className="inspection-workspace">
          <ViewTabs id="replay" label="Replay inspection" items={INSPECTION_VIEWS} value={view} onChange={setView} />
          <section id="replay-panel-source" role="tabpanel" aria-labelledby="replay-tab-source" hidden={view !== "source"}><SourceDatabaseOverview key={eventIndex} eventCount={eventIndex + 1} historical={eventIndex < state.cursor - 1} /></section>
          <section id="replay-panel-release" role="tabpanel" aria-labelledby="replay-tab-release" hidden={view !== "release"}>
            {publication ? <><ReleaseInspectorInline key={publication.release.id} items={[{ id: publication.release.id, label: `Release ${publication.release.id}`, date: publication.publishedAt, kind: "release", data: publication.release }]} selectedIndex={0} onSelect={() => {}} contextLabel="Publication for the selected event" /><ArtifactBrowser label="Publication artifact" items={[{ id: "release", label: "Release JSON", data: publication.release, filename: `denr-release-${publication.release.id}.json` }, { id: "package", label: "Release package JSON", data: releasePackage([publication.release]), filename: `denr-release-package-${publication.release.id}.json`, description: "The package wraps the release with synthetic publication metadata." }]} /></> : <div className="workspace-empty"><h3>{event?.release ? "Waiting to publish" : "No new release"}</h3><p>{event?.release ? "This eligible source event is captured but has not been published yet." : event ? "The private note changes internal data. It is excluded from the public releases and record." : "Advance the story to create the initial publication."}</p></div>}
          </section>
          <section id="replay-panel-record" role="tabpanel" aria-labelledby="replay-tab-record" hidden={view !== "record"}>
            <header className="inspection-heading"><h2>{record ? "Latest generated record" : "No record generated yet"}</h2>{record && <p>Covers {state.recordCount} of {state.published.length} archived releases · Generated {timestamp(state.recordGeneratedAt!)}.</p>}</header>
            {record ? <><ViewTabs id="record" label="Record views" items={RECORD_VIEWS} value={recordView} onChange={setRecordView} />
              <section id="record-panel-current" role="tabpanel" aria-labelledby="record-tab-current" hidden={recordView !== "current"}><CompiledReleaseView data={record.compiledRelease} compact showJson={false} /><details className="change-details"><summary>What changed since the previous record generation? ({changes.length} fields)</summary><ul className="delta-list" tabIndex={0} aria-label="Changed record fields">{changes.map((change) => <li key={change.path}><code>{change.path}</code><span><del>{display(change.before)}</del> → <strong>{display(change.after)}</strong></span></li>)}</ul></details><p className="workspace-footnote">Unchanged earlier facts remain in the compiled view. A new release updates the process rather than replacing every earlier field.</p></section>
              <section id="record-panel-history" role="tabpanel" aria-labelledby="record-tab-history" hidden={recordView !== "history"}><div className="learning-table-wrap" role="region" aria-label="Record release index" tabIndex={0}><table className="learning-table"><caption>Immutable releases included in this record</caption><thead><tr><th>ID</th><th>Published</th><th>Tags</th><th>Release JSON</th></tr></thead><tbody>{record.releases.map((release, index) => <tr key={release.id}><th scope="row">{release.id}</th><td>{timestamp(release.date)}</td><td><code>{release.tag.join(", ")}</code></td><td><button type="button" className="lesson-button" aria-label={`View JSON for release ${release.id}`} aria-haspopup="dialog" onClick={() => { setPlaying(false); setInspectedRelease(index); }}>View JSON</button></td></tr>)}</tbody></table></div></section>
              <section id="record-panel-versions" role="tabpanel" aria-labelledby="record-tab-versions" hidden={recordView !== "versions"}><VersionedReleaseView data={record.versionedRelease} sourceReleaseCount={state.recordCount} showJson={false} onInspectRelease={(id) => { const index = record.releases.findIndex((release) => release.id === id); if (index >= 0) { setPlaying(false); setInspectedRelease(index); } }} /></section>
              <ArtifactBrowser label="Record artifact" items={[{ id: "record", label: "Complete record JSON", data: record, filename: "denr-record.json" }, { id: "compiled", label: "Compiled release JSON", data: record.compiledRelease, filename: "denr-compiled-release.json", description: "Latest field values assembled from the releases included in this record." }, { id: "versioned", label: "Versioned release JSON", data: record.versionedRelease, filename: "denr-versioned-release.json", description: "Field-value history with its source-release provenance." }, { id: "package", label: "Record package JSON", data: recordPackage(record), filename: "denr-record-package.json" }]} />
            </> : <p className="workspace-empty">{state.published.length ? "Releases are archived. Run the record job or request a record to assemble them." : "A record is assembled from published releases. Advance an event, then publish eligible changes."}</p>}
          </section>
        </div>
        <p className="workspace-footnote"><Link to="/mapping#events">Understand event and release mapping</Link> · <Link to="/possible-journeys">Next: compare process examples →</Link></p>
      </div>
    </div>
    <ReleaseInspector items={recordReleases} selectedIndex={inspectedRelease} onClose={() => setInspectedRelease(null)} onSelect={setInspectedRelease} contextLabel="Release included in the latest generated record" titleId="replay-release-inspector-title" initialView="json" />
  </div>;
}
