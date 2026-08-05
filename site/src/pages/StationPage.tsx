import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import {
  STATION_BY_ID,
  STATIONS,
  type StationId,
} from "../content/stations";
import { STATION_TEACHING } from "../content/stationTeaching";
import { Callout } from "../components/Callout";
import {
  CanonicalMapper,
  EventCard,
  MappingExercise,
  CodelistExercise,
  RawRowViewer,
  RedFlagPlayground,
} from "../components/StationLenses";
import { FLAGSHIP_EXAMPLE } from "../content/workedExample";
import { ProcessContinuity } from "../components/ProcessContinuity";
import { formatReleaseDate } from "../content/format";
import { DEFAULT_RELEASES } from "../content/releases";
import type { WorkedRelease } from "../content/workedExample";
import { ReleaseTimeline } from "../components/ReleaseTimeline";
import { CompiledReleaseView, VersionedReleaseView } from "../components/RecordViews";
import { KnowledgeCheck } from "../components/KnowledgeCheck";
import { ReleaseInspector, type InspectorItem } from "../components/ReleaseInspector";

const VALID_IDS = new Set<string>(STATIONS.map((s) => s.id));

export function StationPage() {
  const { stationId } = useParams<{ stationId: string }>();

  if (!stationId || !VALID_IDS.has(stationId)) {
    return (
      <>
        <h1>Station not found</h1>
        <p>
          <Link to="/journey">Back to the journey</Link>
        </p>
      </>
    );
  }

  const station = STATION_BY_ID[stationId as StationId];
  const teaching = STATION_TEACHING[station.id];
  const prev = STATIONS[station.index - 2];
  const next = STATIONS[station.index];

  return (
    <>
      <p className="eyebrow">
        Station {station.index} of {STATIONS.length} · {station.macroPhase}
      </p>
      <h1>{station.title}</h1>
      <p className="lede">{station.blurb}</p>

      {teaching.framing && <p>{teaching.framing}</p>}

      {teaching.callouts?.map((c, i) => (
        <Callout key={i} callout={c} />
      ))}

      <ProcessContinuity stationId={station.id} />

      <StationLens stationId={station.id} />

      <KnowledgeCheck key={station.id} stationId={station.id} />

      <nav className="station-nav">
        {prev ? (
          <Link to={`/journey/${prev.id}`} className="station-nav__link">
            ← {prev.index}. {prev.title}
          </Link>
        ) : (
          <Link to="/journey" className="station-nav__link">
            ← The journey
          </Link>
        )}
        {next ? (
          <Link to={`/journey/${next.id}`} className="station-nav__link">
            {next.index}. {next.title} →
          </Link>
        ) : (
          <span className="station-nav__link station-nav__link--mute">
            End of journey
          </span>
        )}
      </nav>
    </>
  );
}

function StationLens({ stationId }: { stationId: StationId }) {
  switch (stationId) {
    case "1-event": return <EventCard />;
    case "2-extracted": return <RawRowViewer />;
    case "3-mapped": return <><CanonicalMapper /><MappingExercise /></>;
    case "4-record": return <><RecordStationBody /><CodelistExercise /></>;
    case "5-analyzed": return <RedFlagPlayground />;
  }
}

/**
 * The body of station 4 ("Record").
 *
 * This example shows three record views. The release index is rendered inline as
 * cards; selecting one opens a modal that also links to its addressable release route. The compiled
 * and versioned releases are peer views of the whole record — they get their
 * own cards here rather than being sub-stations, because they are derived
 * aggregates, not atomic publications.
 */
function RecordStationBody() {
  const releases = FLAGSHIP_EXAMPLE.record.releases;
  const first = releases[0];
  const last = releases[releases.length - 1];
  const [view, setView] = useState<"index" | "compiled" | "versioned">("index");
  const [releaseId, setReleaseId] = useState<string | null>(null);

  const inspectorItems: InspectorItem[] = DEFAULT_RELEASES.map((release: WorkedRelease) => ({
    id: release.id,
    label: release.summary,
    date: release.date,
    kind: "release",
    data: release.partial,
  }));
  const selectedIndex = releaseId
    ? DEFAULT_RELEASES.findIndex((release) => release.id === releaseId)
    : null;
  const selectedRelease = selectedIndex !== null && selectedIndex >= 0 ? DEFAULT_RELEASES[selectedIndex] : undefined;

  const selectRecordTab = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const tabs = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
    const current = tabs.indexOf(event.currentTarget);
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? tabs.length - 1
      : event.key === "ArrowRight" ? (current + 1) % tabs.length
      : (current - 1 + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    const nextView = nextTab.dataset.view as "index" | "compiled" | "versioned";
    setView(nextView);
    nextTab.focus();
  };
  return (
    <>
      <section className="record-summary" aria-label="Record summary">
        <div><span>Contracting process</span><strong>{FLAGSHIP_EXAMPLE.ocid}</strong></div>
        <div><span>Releases</span><strong>{releases.length}</strong></div>
        <div><span>Publication period</span><strong>{formatReleaseDate(first.date)} → {formatReleaseDate(last.date)}</strong></div>
      </section>

      <div className="record-parts" role="tablist" aria-label="Record views">
        <button id="record-tab-index" type="button" role="tab" data-view="index" aria-controls="record-view-panel" aria-selected={view === "index"} tabIndex={view === "index" ? 0 : -1} data-current={view === "index" || undefined} onKeyDown={selectRecordTab} onClick={() => setView("index")}>
          <span>1</span><strong>Release index</strong><small>Each immutable publication</small>
        </button>
        <button id="record-tab-compiled" type="button" role="tab" data-view="compiled" aria-controls="record-view-panel" aria-selected={view === "compiled"} tabIndex={view === "compiled" ? 0 : -1} data-current={view === "compiled" || undefined} onKeyDown={selectRecordTab} onClick={() => setView("compiled")}>
          <span>2</span><strong>Compiled release</strong><small>Recommended current state</small>
        </button>
        <button id="record-tab-versioned" type="button" role="tab" data-view="versioned" aria-controls="record-view-panel" aria-selected={view === "versioned"} tabIndex={view === "versioned" ? 0 : -1} data-current={view === "versioned" || undefined} onKeyDown={selectRecordTab} onClick={() => setView("versioned")}>
          <span>3</span><strong>Versioned release</strong><small>Optional change history</small>
        </button>
      </div>

      <section id="record-view-panel" className="record-panel" role="tabpanel" aria-labelledby={`record-tab-${view}`}>
        {view === "index" && (
          <>
            <h2>Release index</h2>
            <p>Start with the release cards to see the process sequence. Select one when you want to inspect its complete publication.</p>
            <div className="record-release-browser">
              <aside className="record-release-browser__index">
                <ReleaseTimeline activeReleaseId={selectedRelease?.id} compact onSelect={setReleaseId} />
              </aside>
              <p className="record-release-browser__hint">
                Releases are immutable publications. The compiled and versioned views on the other tabs are derived from this sequence.
              </p>
            </div>
            <ReleaseInspector
              items={inspectorItems}
              selectedIndex={selectedIndex}
              onClose={() => setReleaseId(null)}
              onSelect={(index) => setReleaseId(DEFAULT_RELEASES[index].id)}
              contextLabel="Flagship record release"
              fixedHeader={selectedRelease ? (
                <Link className="release-detail-link" to={`/journey/4-record/${selectedRelease.id}`}>Open at its own URL <span aria-hidden="true">→</span></Link>
              ) : undefined}
            />
          </>
        )}

        {view === "compiled" && (
          <>
            <h2>Compiled release</h2>
            <p>The current state generated chronologically by the primer's OCDS 1.1.5 merge subset. Objects merge recursively, identified awards and contracts merge by <code>id</code>, schema-defined whole lists replace earlier lists, and later literal values replace earlier ones.</p>
            <p className="derived-note">Generated from seven releases; validated against the OCDS 1.1.5 release schema.</p>
            <CompiledReleaseView data={FLAGSHIP_EXAMPLE.record.compiledRelease} />
          </>
        )}

        {view === "versioned" && (
          <>
            <h2>Versioned release</h2>
            <p>All published values over time. Each value records its <code>releaseID</code>, <code>releaseDate</code>, and <code>releaseTag</code>; identified arrays retain their object IDs.</p>
            <p className="derived-note">Generated from the same releases; validated against the OCDS 1.1.5 versioned-release schema.</p>
            <VersionedReleaseView data={FLAGSHIP_EXAMPLE.record.versionedRelease} />
          </>
        )}
      </section>
    </>
  );
}
