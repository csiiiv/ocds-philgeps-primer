import { Link } from "react-router-dom";
import { STATIONS } from "../content/stations";
import { SubwayDiagram } from "../components/SubwayDiagram";
import { FLAGSHIP_EXAMPLE } from "../content/workedExample";
import { useStationProgress } from "../context/StationProgress";

export function JourneyHub() {
  const { counts } = useStationProgress();
  const allPassed = counts.passed === counts.total && counts.passed > 0;
  return (
    <>
      <p className="eyebrow">The journey</p>
      <h1>From a procurement event to a red-flag signal</h1>
      <p className="lede">
        Follow one contracting process through the five stations of the PhilGEPS
        data pipeline. Watch the process begin as a procurement need, acquire a
        stable identity, accumulate tender, award, contract, and implementation
        releases, become a record, and finally support risk analysis.
      </p>

      <SubwayDiagram />

      {allPassed && (
        <div className="journey-complete journey-complete--hub" role="status" aria-live="polite">
          <span>All five stations passed</span>
          <strong>You followed the introductory journey end to end.</strong>
          <p>Passing every knowledge check means you've seen the full OCDS model on one synthetic process. The next chapter contrasts that tidy story with cancelled, incomplete, and multi-award process shapes drawn from audited source rows.</p>
          <Link className="primary-action" to="/possible-journeys">Continue to Possible Journeys <span aria-hidden="true">→</span></Link>
        </div>
      )}

      <div className="journey-start">
        <div>
          <strong>Ready to follow the data?</strong>
          <span>Begin with the real-world event behind the publication.</span>
        </div>
        <Link className="primary-action" to="/journey/1-event">Start the journey <span aria-hidden="true">→</span></Link>
      </div>

      <h2>What you'll follow</h2>
      <p>
        We begin with <strong>{FLAGSHIP_EXAMPLE.meta.title}</strong>, a deliberately
        designed synthetic example that carries every core concept through the
        five stations. It is complete enough to teach the model, but it is not
        presented as a typical procurement.
      </p>

      <div className="callout">
        <span className="callout__title">Synthetic first, reality next</span>
        After this guided journey, the primer will introduce cancelled,
        award-only, retendered, and incomplete real-world process shapes. Those
        processes will then be combined into a multi-process publication for
        portfolio-level analysis.
      </div>

      <h2>The complete learning arc</h2>
      <ol className="chapter-arc">
        <li><strong>Follow one journey</strong><span>Learn the model with one coherent synthetic process.</span></li>
        <li><strong>Compare possible journeys</strong><span>See how real contracting processes stop, branch, or contain gaps.</span></li>
        <li><strong>Build a publication</strong><span>Combine releases and records from multiple contracting processes.</span></li>
        <li><strong>See the bigger picture</strong><span>Analyze competition, completeness, buyers, suppliers, and spending across the publication.</span></li>
      </ol>

      <h2>Stations at a glance</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {STATIONS.map((s) => (
          <li
            key={s.id}
            style={{
              padding: "14px 0",
              borderTop: "1px solid var(--line)",
            }}
          >
            <Link
              to={`/journey/${s.id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                gap: 16,
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: 700,
                  color: `var(${s.railVar})`,
                  minWidth: 24,
                }}
              >
                {s.index}
              </span>
              <span>
                <span style={{ fontWeight: 600, color: "var(--ink)" }}>
                  {s.title}
                </span>
                <span style={{ color: "var(--ink-soft)" }}> — {s.blurb}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
