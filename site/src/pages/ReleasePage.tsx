import { Link, useNavigate, useParams } from "react-router-dom";
import { DEFAULT_RELEASES } from "../content/releases";
import type { WorkedRelease } from "../content/workedExample";
import { STATION_BY_ID } from "../content/stations";
import { ReleaseTimeline } from "../components/ReleaseTimeline";
import { FLAGSHIP_EXAMPLE } from "../content/workedExample";
import { formatReleaseDate } from "../content/format";
import { ReleaseInspectorInline, type InspectorItem } from "../components/ReleaseInspector";

const VALID_IDS = new Set(DEFAULT_RELEASES.map((r) => r.id));

export function ReleasePage() {
  const { releaseId } = useParams<{ releaseId: string }>();
  const navigate = useNavigate();
  const station = STATION_BY_ID["4-record"];

  if (!releaseId || !VALID_IDS.has(releaseId)) {
    return (
      <>
        <p className="eyebrow">Station {station.index} · Sub-station</p>
        <h1>Release not found</h1>
        <p>
          <Link to="/journey/4-record">Back to the record</Link>
        </p>
      </>
    );
  }

  const idx = DEFAULT_RELEASES.findIndex((r) => r.id === releaseId);
  const release = DEFAULT_RELEASES[idx];
  const prev = DEFAULT_RELEASES[idx - 1];
  const next = DEFAULT_RELEASES[idx + 1];

  const inspectorItems: InspectorItem[] = DEFAULT_RELEASES.map((item: WorkedRelease) => ({
    id: item.id,
    label: item.summary,
    date: item.date,
    kind: "release",
    data: item.partial,
  }));

  return (
    <>
      <header className="release-detail__header">
        <div>
          <p className="eyebrow">Releases · Record · Release {idx + 1} of {DEFAULT_RELEASES.length}</p>
          <h1>Release #{release.id}</h1>
        </div>
        <Link to="/journey/4-record" className="release-exit" aria-label="Close release and return to record overview">
          <span aria-hidden="true">×</span> Record overview
        </Link>
      </header>

      <section className="release-context">
        <span>Part of contracting process</span>
        <strong>{FLAGSHIP_EXAMPLE.ocid}</strong>
        <p>This is one immutable publication in the record—not the whole contracting process.</p>
      </section>

      <div className="release-detail">
        <aside className="release-detail__index">
          <h2>Release index</h2>
          <p>Select another publication without leaving the record context.</p>
          <ReleaseTimeline activeReleaseId={release.id} compact />
        </aside>

        <article className="release-detail__body">
          <div className="release-meta">
            <div><span>Publication date</span><strong>{formatReleaseDate(release.date)}</strong></div>
            <div><span>Release tag</span><strong>{release.tag.join(", ")}</strong></div>
          </div>
          <p className="lede">{release.summary}</p>
          <p>This release publishes only the fields associated with this update. The compiled release on the record overview combines it with the other releases.</p>
          <ReleaseInspectorInline
            items={inspectorItems}
            selectedIndex={idx}
            onSelect={(index) => navigate(`/journey/4-record/${DEFAULT_RELEASES[index].id}`)}
            contextLabel="Flagship record release"
          />
        </article>
      </div>

      <nav className="release-pagination" aria-label="Release navigation">
        {prev ? <Link to={`/journey/4-record/${prev.id}`}>← <span>Previous</span><strong>#{prev.id} · {prev.tag.join(", ")}</strong></Link> : <span />}
        <Link to="/journey/4-record" className="release-pagination__overview">Record overview</Link>
        {next ? <Link to={`/journey/4-record/${next.id}`}><span>Next</span> →<strong>#{next.id} · {next.tag.join(", ")}</strong></Link> : <span />}
      </nav>
    </>
  );
}
