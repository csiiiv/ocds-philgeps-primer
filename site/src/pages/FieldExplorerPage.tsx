import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FIELD_TRACES } from "../content/fieldExplorer";

export function FieldExplorerPage() {
  const [params] = useSearchParams();
  const requested = params.get("trace");
  const [traceId, setTraceId] = useState(FIELD_TRACES.some((item) => item.id === requested) ? requested! : FIELD_TRACES[0].id);
  const trace = FIELD_TRACES.find((item) => item.id === traceId)!;
  return <>
    <p className="eyebrow">Intermediate · Field explorer</p>
    <h1>Trace a Source Field into OCDS</h1>
    <p className="lede">The beginner journey follows a contracting process. This optional intermediate view follows one field through an audited transformation rule into exact OCDS destinations.</p>
    <aside className="provenance-contract"><strong>Transformation, not simple renaming</strong><p>A source field can establish identity, create several array entries, populate more than one OCDS path, or be rejected as a sentinel. Select a field to inspect the rule and evidence.</p></aside>
    <div className="field-explorer">
      <nav className="field-list" aria-label="Fields available to trace">
        {FIELD_TRACES.map((item) => <button type="button" key={item.id} aria-pressed={trace.id === item.id} data-active={trace.id === item.id || undefined} onClick={() => setTraceId(item.id)}><code>{item.sourceField}</code><strong>{item.label}</strong><small>{item.values.length} mapped value{item.values.length === 1 ? "" : "s"}</small></button>)}
      </nav>
      <article className="field-trace">
        <header><div><span>Selected field</span><h2>{trace.sourceField}</h2><p>{trace.example}</p></div><Link to={`/possible-journeys/${trace.journeyId}#record`}>Open full evidence <span aria-hidden="true">→</span></Link></header>
        <div className="field-trace__rule"><span>Transformation rule</span><p>{trace.rule}</p><strong>Why:</strong> {trace.rationale}</div>
        {trace.caution && <p className="journey-caution">{trace.caution}</p>}
        <div className="field-trace__flow"><span>Source row</span><b>→</b><span>Rule</span><b>→</b><span>OCDS result</span></div>
        <ol className="field-trace__values">
          {trace.values.map((value, index) => <li key={`${value.sourceLine}-${value.ocdsPath}-${index}`}><div><span>Line {value.sourceLine}</span><code>{trace.sourceField}</code><strong>{value.sourceValue}</strong></div><b aria-hidden="true">→</b><div><span>OCDS path</span><code>{value.ocdsPath}</code><strong>{value.ocdsValue}</strong></div></li>)}
        </ol>
      </article>
    </div>
  </>;
}
