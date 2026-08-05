import { Link, useLocation } from "react-router-dom";
import { STATIONS } from "../content/stations";
import { useStationProgress } from "../context/StationProgress";

/**
 * SubwayDiagram (v0 — horizontal stepper)
 *
 * Placeholder for the polished SVG subway map. This version proves the visual
 * concept: five stations on a rail, colour-coded by macro-phase, clickable,
 * with the current station highlighted. A station is marked done when the
 * learner has passed its knowledge check (persisted across sessions).
 */
export function SubwayDiagram() {
  const location = useLocation();
  const { passed } = useStationProgress();
  const activeIndex = STATIONS.findIndex(
    (s) => location.pathname === `/journey/${s.id}`
  );
  const allPassed = passed.size === STATIONS.length;

  return (
    <div className="subway" role="navigation" aria-label="Procurement journey stations">
      <div className="subway__phases">
        <div className="subway__phase subway__phase--events">
          <span>Events</span>
        </div>
        <div className="subway__phase subway__phase--released">
          <span>Releases</span>
        </div>
        <div className="subway__phase subway__phase--analyzed">
          <span>Analytics</span>
        </div>
      </div>

      <ol className="subway__rail">
        {STATIONS.map((s, i) => {
          const isActive = activeIndex === i;
          const isDone = passed.has(s.id);
          return (
            <li key={s.id}>
              <Link
                to={`/journey/${s.id}`}
                className="subway__node"
                data-active={isActive ? "true" : undefined}
                data-done={isDone ? "true" : undefined}
                style={{ ["--station-color" as string]: `var(${s.railVar})` }}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Station ${s.index}: ${s.title}${isDone ? " (passed)" : ""}`}
              >
                <span className="subway__dot"><span className="subway__dot-num">{s.index}</span></span>
                <span className="subway__label">{s.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>

      <p className="subway__caption">
        {allPassed
          ? "You've passed every station. Compare less tidy process shapes in Possible Journeys."
          : "Click a station to follow the contracting process at that stage. Passing a station's knowledge check marks it complete."}
      </p>
    </div>
  );
}
