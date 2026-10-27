import { Link } from "react-router-dom";
import { STATIONS } from "../content/stations";
import { SubwayDiagram } from "../components/SubwayDiagram";
import { FLAGSHIP_EXAMPLE } from "../content/workedExample";
import { useStationProgress } from "../context/StationProgress";

export function JourneyHub() {
  const { counts, passed } = useStationProgress();
  const next = STATIONS.find((station) => !passed.has(station.id));
  const started = counts.passed > 0;
  return <>
    <p className="eyebrow">Learn OCDS · Start here</p>
    <h1>From a procurement event to a red-flag signal</h1>
    <p className="lede">Follow one contracting process through five stations: the event, source data, mapping, the record, and analysis.</p>
    <div className="journey-start"><div><strong>{!next ? "Introduction complete" : started ? `${counts.passed} of 5 stations passed` : "Start with one procurement story"}</strong><span>{FLAGSHIP_EXAMPLE.meta.title} · synthetic teaching example</span></div><Link className="primary-action" to={next ? `/journey/${next.id}` : "/simulation"}>{!next ? "Continue to the replay" : started ? "Continue the journey" : "Start the journey"} →</Link></div>
    <SubwayDiagram />
    <section className="learning-section"><h2>After the introduction</h2><ol className="next-path">
      <li><span>01</span><div><Link to="/simulation">Watch the story change</Link><p>Replay events and compare source rows, published releases, and the generated record.</p></div></li>
      <li><span>02</span><div><Link to="/possible-journeys">Compare process examples</Link><p>See cancelled, incomplete, and multiple-award processes, with their source evidence.</p></div></li>
      <li><span>03</span><div><Link to="/publication">Explore a publication and portfolio</Link><p>Combine processes and examine competition, completeness, and risk signals.</p></div></li>
    </ol></section>
    <aside className="quiet-next"><strong>Here to work on mappings?</strong><p>Go directly to the <Link to="/mapping">Mapping Guide</Link> or follow the <Link to="/workshop">workshop learning path</Link>. Lessons and tools are available without completing the quizzes.</p></aside>
  </>;
}
