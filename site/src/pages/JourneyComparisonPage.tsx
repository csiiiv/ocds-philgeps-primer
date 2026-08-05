import { Link, useSearchParams } from "react-router-dom";
import { POSSIBLE_JOURNEYS } from "../content/possibleJourneys";
import { comparisonFor } from "../content/journeyComparison";

interface ComparisonRow {
  label: string;
  section: "shape" | "timeline" | "record" | "questions";
  value: (journey: (typeof POSSIBLE_JOURNEYS)[number]) => string | number;
  missing?: (value: string | number) => boolean;
}

const ROWS: ComparisonRow[] = [
  { label: "Provenance", section: "shape", value: (journey) => journey.provenance },
  { label: "Process shape", section: "shape", value: (journey) => journey.shape },
  { label: "Visible stages", section: "shape", value: (journey) => journey.stages.join(" → ") },
  { label: "Observed period", section: "timeline", value: (journey) => comparisonFor(journey).period },
  { label: "Chronology checks", section: "timeline", value: (journey) => comparisonFor(journey).chronologyChecks, missing: (value) => value === 0 },
  { label: "Source-row shape", section: "record", value: (journey) => comparisonFor(journey).sourceRows === 1 ? "1 flattened row" : typeof comparisonFor(journey).sourceRows === "number" ? `${comparisonFor(journey).sourceRows} flattened rows` : comparisonFor(journey).sourceRows },
  { label: "Process identity", section: "record", value: (journey) => comparisonFor(journey).identity },
  { label: "Tender items", section: "record", value: (journey) => comparisonFor(journey).items },
  { label: "Awards", section: "record", value: (journey) => comparisonFor(journey).awards, missing: (value) => value === 0 },
  { label: "Suppliers", section: "record", value: (journey) => comparisonFor(journey).suppliers, missing: (value) => value === 0 },
  { label: "Contracts", section: "record", value: (journey) => comparisonFor(journey).contracts, missing: (value) => value === 0 },
  { label: "Can analyze", section: "questions", value: (journey) => journey.canAnalyze },
  { label: "Cannot conclude", section: "questions", value: (journey) => journey.cannotAnalyze },
];

export function JourneyComparisonPage() {
  const [params] = useSearchParams();
  const requested = (params.get("ids") ?? "").split(",").filter(Boolean);
  const journeys = [...new Set(requested)].slice(0, 3).map((id) => POSSIBLE_JOURNEYS.find((journey) => journey.id === id)).filter((journey): journey is (typeof POSSIBLE_JOURNEYS)[number] => Boolean(journey));

  if (journeys.length < 2) return <>
    <p className="eyebrow">Chapter 2 · Comparison</p><h1>Select at least two journeys</h1>
    <p className="lede">Comparison works with two or three examples. Return to the gallery and choose the process shapes you want to contrast.</p>
    <Link className="primary-action" to="/possible-journeys">Choose journeys <span aria-hidden="true">→</span></Link>
  </>;

  return <>
    <Link className="detail-back" to="/possible-journeys">← Back to all journeys</Link>
    <p className="eyebrow">Chapter 2 · Comparison</p>
    <h1>Compare Possible Journeys</h1>
    <p className="lede">Differences are descriptive, not rankings. Select any value to return to the source-backed timeline, record, or analytical boundary for that journey.</p>
    <aside className="comparison-callout"><strong>{journeys.length} contracting processes</strong><span>Each column retains its own provenance and evidence boundary.</span></aside>
    <div className="comparison-table-wrap">
      <table className="comparison-table">
        <thead><tr><th scope="col">Dimension</th>{journeys.map((journey) => <th scope="col" key={journey.id}><span className={`provenance provenance--${journey.provenance.toLowerCase()}`}>{journey.provenance}</span><Link to={`/possible-journeys/${journey.id}`}>{journey.title}</Link><small>{journey.buyer}</small></th>)}</tr></thead>
        <tbody>{ROWS.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{journeys.map((journey) => { const value = row.value(journey); return <td key={journey.id} data-empty={row.missing?.(value) || undefined}><Link to={`/possible-journeys/${journey.id}#${row.section}`}>{value}</Link></td>; })}</tr>)}</tbody>
      </table>
    </div>
    <p className="journey-caution">A zero count means the entity is not published in the selected release; it does not prove that the real-world event never happened.</p>
    <aside className="next-chapter"><span className="next-chapter__preview">Next chapter: combine every audited process into one OCDS release package and portfolio.</span><Link to="/publication">Open Publication &amp; Portfolio <span aria-hidden="true">→</span></Link></aside>
  </>;
}
