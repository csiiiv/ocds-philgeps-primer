import { TRACES, useTrace } from "../context/TraceContext";

export function TraceRail() {
  const { activeTrace, setActiveTrace } = useTrace();
  return (
    <section className="trace-rail" aria-labelledby="trace-title">
      <div>
        <span className="trace-rail__kicker">Follow one datum</span>
        <strong id="trace-title">{activeTrace.label}</strong>
        <p>{activeTrace.description}</p>
      </div>
      <label>
        Trace
        <select value={activeTrace.key} onChange={(event) => setActiveTrace(event.target.value as typeof activeTrace.key)}>
          {TRACES.map((trace) => <option key={trace.key} value={trace.key}>{trace.label}</option>)}
        </select>
      </label>
    </section>
  );
}

export function TraceBeat({ station }: { station: "raw" | "canonical" | "released" | "analyzed" }) {
  const { activeTrace, stationStep } = useTrace();
  const step = stationStep(station);
  if (!step) return null;
  return (
    <aside className="trace-beat" aria-live="polite">
      <span>Tracing · {activeTrace.label}</span>
      <strong>{step.value}</strong>
      {step.note && <p>{step.note}</p>}
    </aside>
  );
}
