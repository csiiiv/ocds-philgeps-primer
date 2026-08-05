import { useState } from "react";
import { Link } from "react-router-dom";
import { POSSIBLE_JOURNEYS, type LifecycleStage, type Provenance } from "../content/possibleJourneys";
import { formatReleaseDate } from "../content/format";

const PROVENANCE: Array<"All" | Provenance> = ["All", "Synthetic", "Adapted", "Real"];
const STAGES: LifecycleStage[] = ["Tender", "Award", "Contract", "Implementation"];

export function PossibleJourneysPage() {
  const [filter, setFilter] = useState<"All" | Provenance>("All");
  const [selected, setSelected] = useState<string[]>([]);
  const journeys = POSSIBLE_JOURNEYS.filter((journey) => filter === "All" || journey.provenance === filter);
  const toggleComparison = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current);

  return (
    <>
      <p className="eyebrow">Chapter 2 · Process shapes</p>
      <h1>Possible Journeys</h1>
      <p className="lede">The introductory process was designed to reach every stage. Real procurement data is less tidy: processes stop, skip visible stages, contain gaps, and span very different periods.</p>

      <aside className="provenance-contract">
        <strong>Read the provenance before the pattern</strong>
        <p><b>Synthetic</b> examples are designed. <b>Adapted</b> examples change observed data for teaching. <b>Real</b> cards use exact cited source rows and an audited POC transformation—but the source can still be incomplete or wrong.</p>
      </aside>

      <div className="journey-filters" role="group" aria-label="Filter journeys by provenance">
        {PROVENANCE.map((item) => <button key={item} type="button" data-active={filter === item || undefined} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
      </div>

      <p className="gallery-count" aria-live="polite">Showing {journeys.length} of {POSSIBLE_JOURNEYS.length} journeys</p>
      <div className="journey-gallery">
        {journeys.map((journey) => (
          <article className="journey-card" key={journey.id} data-selected={selected.includes(journey.id) || undefined}>
            <header>
              <span className={`provenance provenance--${journey.provenance.toLowerCase()}`}>{journey.provenance}</span>
              <span>{journey.shape}</span>
            </header>
            <h2>{journey.title}</h2>
            <p className="journey-card__buyer">{journey.buyer}</p>
            <ol className="stage-strip" aria-label="Visible lifecycle stages">
              {STAGES.map((stage) => <li key={stage} data-present={journey.stages.includes(stage) || undefined}><span aria-hidden="true" />{stage}</li>)}
            </ol>
            <div className="journey-metrics">
              {journey.metrics.map((metric) => <div key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></div>)}
            </div>
            <p>{journey.why}</p>
            <div className="journey-card__actions">
              <Link className="journey-card__action" to={`/possible-journeys/${journey.id}`}>Explore this journey <span aria-hidden="true">→</span></Link>
              <button type="button" aria-pressed={selected.includes(journey.id)} disabled={!selected.includes(journey.id) && selected.length >= 3} onClick={() => toggleComparison(journey.id)}>{selected.includes(journey.id) ? "Selected" : "Compare"}</button>
            </div>
            <details className="journey-card__details">
              <summary>Inspect context and limits</summary>
              <dl>
                <div><dt>Observed period</dt><dd>{formatReleaseDate(journey.start)}{journey.end ? ` → ${formatReleaseDate(journey.end)}` : " → no later stage shown"}</dd></div>
                <div><dt>Can analyze</dt><dd>{journey.canAnalyze}</dd></div>
                <div><dt>Cannot conclude</dt><dd>{journey.cannotAnalyze}</dd></div>
                <div><dt>Source</dt><dd>{journey.source}</dd></div>
                {journey.ocid && <div><dt>Source OCID</dt><dd><code>{journey.ocid}</code></dd></div>}
              </dl>
              {journey.caution && <p className="journey-caution">{journey.caution}</p>}
            </details>
          </article>
        ))}
      </div>
      {selected.length > 0 && <aside className="comparison-bar" aria-label="Journey comparison selection">
        <div><strong>{selected.length} of 3 selected</strong><span>{selected.length < 2 ? "Choose one more journey to compare." : POSSIBLE_JOURNEYS.filter((journey) => selected.includes(journey.id)).map((journey) => journey.title).join(" · ")}</span></div>
        <button type="button" onClick={() => setSelected([])}>Clear</button>
        {selected.length >= 2 ? <Link to={`/possible-journeys/compare?ids=${selected.join(",")}`}>Compare selected <span aria-hidden="true">→</span></Link> : <span className="comparison-bar__disabled" aria-disabled="true">Compare selected</span>}
      </aside>}
    </>
  );
}
