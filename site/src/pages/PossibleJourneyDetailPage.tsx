import { Link, Navigate, useParams } from "react-router-dom";
import { POSSIBLE_JOURNEYS, type LifecycleStage } from "../content/possibleJourneys";
import { JOURNEY_EVIDENCE } from "../content/journeyEvidence";
import { JourneyEvidenceViewer } from "../components/JourneyEvidenceViewer";
import { JourneyEventTimeline } from "../components/JourneyEventTimeline";
import { formatReleaseDate } from "../content/format";

const STAGES: LifecycleStage[] = ["Tender", "Award", "Contract", "Implementation"];

function recordNote(provenance: string) {
  if (provenance === "Synthetic") return "A complete, schema-validated teaching history is available. Its releases illustrate the model; they were not published by a real procurement system.";
  if (provenance === "Adapted") return "This teaching journey was shaped from an observed record. Any reconstructed history is illustrative and must not be read as a release history published by the source.";
  return "Exact source rows and their audited POC transformation are available below. The result is one reconstructed current-state release, not a genuine release-by-release or versioned history.";
}

export function PossibleJourneyDetailPage() {
  const { journeyId } = useParams();
  const index = POSSIBLE_JOURNEYS.findIndex((item) => item.id === journeyId);
  if (index < 0) return <Navigate to="/possible-journeys" replace />;

  const journey = POSSIBLE_JOURNEYS[index];
  const previous = POSSIBLE_JOURNEYS[index - 1];
  const next = POSSIBLE_JOURNEYS[index + 1];
  const evidence = JOURNEY_EVIDENCE[journey.id] ?? [];

  return (
    <>
      <Link className="detail-back" to="/possible-journeys">← Back to all journeys</Link>
      <p className="eyebrow">Chapter 2 · Journey {index + 1} of {POSSIBLE_JOURNEYS.length}</p>
      <div className="journey-detail__heading">
        <div>
          <span className={`provenance provenance--${journey.provenance.toLowerCase()}`}>{journey.provenance}</span>
          <h1>{journey.title}</h1>
          <p className="lede">{journey.buyer} · {journey.shape}</p>
        </div>
      </div>

      <nav className="detail-section-nav" aria-label="Journey detail sections">
        <a href="#shape">Shape</a><a href="#timeline">Timeline</a><a href="#record">Record</a><a href="#questions">Questions</a>
      </nav>

      <section id="shape" className="journey-detail__section">
        <p className="eyebrow">1 · Shape</p>
        <h2>What kind of journey is this?</h2>
        <p>{journey.why}</p>
        <ol className="stage-strip" aria-label="Visible lifecycle stages">
          {STAGES.map((stage) => <li key={stage} data-present={journey.stages.includes(stage) || undefined}><span aria-hidden="true" />{stage}</li>)}
        </ol>
        <div className="journey-metrics">
          {journey.metrics.map((metric) => <div key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></div>)}
        </div>
      </section>

      <section id="timeline" className="journey-detail__section">
        <p className="eyebrow">2 · Timeline</p>
        <h2>What events are actually visible?</h2>
        <p>Events are derived from the selected source rows and sorted by their observed dates. Select one to inspect its source field and OCDS destination.</p>
        <JourneyEventTimeline journeyId={journey.id} />
      </section>

      <section id="record" className="journey-detail__section">
        <p className="eyebrow">3 · Record</p>
        <h2>What evidence is actually available?</h2>
        <p>{recordNote(journey.provenance)}</p>
        <dl className="detail-facts">
          <div><dt>Observed period</dt><dd>{formatReleaseDate(journey.start)}{journey.end ? ` → ${formatReleaseDate(journey.end)}` : " → no later stage shown"}</dd></div>
          <div><dt>Source</dt><dd>{journey.source}</dd></div>
          {journey.ocid && <div><dt>Source OCID</dt><dd><code>{journey.ocid}</code></dd></div>}
        </dl>
        <JourneyEvidenceViewer items={evidence} provenance={journey.provenance} />
        {journey.provenance === "Real" && <p className="journey-caution">Compare the source rows with the reconstructed release above. Release Index and Versioned Release remain unavailable because the export does not provide the underlying publication history.</p>}
      </section>

      <section id="questions" className="journey-detail__section">
        <p className="eyebrow">4 · Questions</p>
        <h2>What can we ask—and what remains unknown?</h2>
        <div className="question-boundaries">
          <article><h3>Supported</h3><p>{journey.canAnalyze}</p></article>
          <article><h3>Not supported</h3><p>{journey.cannotAnalyze}</p></article>
        </div>
        {journey.caution && <p className="journey-caution">{journey.caution}</p>}
      </section>

      <nav className="station-nav" aria-label="Possible journey navigation">
        {previous ? <Link className="station-nav__link" to={`/possible-journeys/${previous.id}`}>← <span><small>Previous journey</small><strong>{previous.title}</strong></span></Link> : <span className="station-nav__link station-nav__link--mute">Start of gallery</span>}
        {next ? <Link className="station-nav__link" to={`/possible-journeys/${next.id}`}><span><small>Next journey</small><strong>{next.title}</strong></span> →</Link> : <Link className="station-nav__link" to="/possible-journeys"><span><small>Journey {POSSIBLE_JOURNEYS.length} of {POSSIBLE_JOURNEYS.length}</small><strong>Back to all journeys</strong></span> →</Link>}
      </nav>
    </>
  );
}
