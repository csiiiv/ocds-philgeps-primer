import { Link, useSearchParams } from "react-router-dom";
import { JsonView } from "../components/JsonView";
import { POC_RELEASE_PACKAGE, PORTFOLIO_PROCESSES, PORTFOLIO_TOTALS, type PortfolioProcess } from "../content/publication";
import { ReleaseInspector, type InspectorItem } from "../components/ReleaseInspector";
import { formatReleaseDate } from "../content/format";

type Cohort = "all" | "awarded" | "contracted" | "missing-contract" | "multi-award" | "chronology" | "signals" | "not-assessable";

const COHORT_IDS: Cohort[] = ["all", "awarded", "contracted", "missing-contract", "multi-award", "chronology", "signals", "not-assessable"];

const COHORTS: Array<{ id: Cohort; label: string; value: string; note: string }> = [
  { id: "all", label: "Processes", value: String(PORTFOLIO_TOTALS.processes), note: "All audited current-state releases" },
  { id: "awarded", label: "Reached award", value: String(PORTFOLIO_TOTALS.awarded), note: "At least one published award" },
  { id: "contracted", label: "Reached contract", value: String(PORTFOLIO_TOTALS.contracted), note: "At least one published contract" },
  { id: "missing-contract", label: "Award without contract", value: String(PORTFOLIO_TOTALS.missingContracts), note: "Publication completeness question" },
  { id: "multi-award", label: "Multiple awards", value: String(PORTFOLIO_TOTALS.multiAward), note: "More than one award in one OCID" },
  { id: "chronology", label: "Lifecycle-order checks", value: String(PORTFOLIO_TOTALS.chronologyChecks), note: "At least one event needs date review" },
  { id: "signals", label: "Indicator signals", value: String(PORTFOLIO_TOTALS.indicatorSignals), note: "Illustrative red-flag conditions met across the portfolio" },
  { id: "not-assessable", label: "Not assessable", value: String(PORTFOLIO_TOTALS.indicatorNotAssessable), note: "A required field was missing, so a check could not run" },
];

function isCohort(value: string | null): value is Cohort {
  return value !== null && (COHORT_IDS as string[]).includes(value);
}

export function PublicationPage() {
  const [params, setParams] = useSearchParams();
  const cohortParam = params.get("cohort");
  const cohort: Cohort = isCohort(cohortParam) ? cohortParam : "all";
  const inspectorParam = params.get("inspect");
  const inspectorIndex = (() => {
    if (inspectorParam == null) return null;
    const index = Number(inspectorParam);
    return Number.isInteger(index) && index >= 0 && index < POC_RELEASE_PACKAGE.releases.length ? index : null;
  })();

  const processes = PORTFOLIO_PROCESSES.filter((process) => inCohort(process, cohort));
  const selected = COHORTS.find((item) => item.id === cohort)!;
  const expandIndicators = cohort === "signals" || cohort === "not-assessable";

  const setCohort = (id: Cohort) => {
    const next = new URLSearchParams(params);
    if (id === "all") next.delete("cohort");
    else next.set("cohort", id);
    setParams(next, { replace: true });
  };

  const setInspectorIndex = (index: number | null) => {
    const next = new URLSearchParams(params);
    if (index == null) next.delete("inspect");
    else next.set("inspect", String(index));
    setParams(next, { replace: true });
  };

  const inspectorItems: InspectorItem[] = POC_RELEASE_PACKAGE.releases.map((release) => {
    const process = PORTFOLIO_PROCESSES.find((item) => item.ocid === release.ocid);
    const ocid = String(release.ocid ?? "");
    return {
      id: ocid,
      label: process?.title ?? ocid,
      date: typeof release.date === "string" ? release.date : undefined,
      kind: "currentStateRelease",
      data: release,
    };
  });

  return <>
    <p className="eyebrow">Chapter 3 · Publication and portfolio</p>
    <h1>From Processes to the Bigger Picture</h1>
    <p className="lede">Seven audited transformations become one standard OCDS release package. A separate analytical view then summarizes that package and always links back to its contributing processes.</p>

    <section className="publication-section">
      <div className="publication-section__heading"><div><span className="artifact-badge">Standard OCDS artifact</span><h2>Release package</h2></div><p>One package can contain releases for many contracting processes. It does not merge their OCIDs.</p></div>
      <div className="package-flow" aria-label="Publication assembly"><div><strong>7</strong><span>audited row groups</span></div><b>→</b><div><strong>7</strong><span>current-state releases</span></div><b>→</b><div><strong>1</strong><span>release package</span></div></div>
      <dl className="package-metadata"><div><dt>Package URI</dt><dd><code>{POC_RELEASE_PACKAGE.uri}</code></dd></div><div><dt>Version</dt><dd>{POC_RELEASE_PACKAGE.version}</dd></div><div><dt>Published date</dt><dd>{formatReleaseDate(POC_RELEASE_PACKAGE.publishedDate)}</dd></div><div><dt>Publisher</dt><dd>{POC_RELEASE_PACKAGE.publisher.name}</dd></div></dl>
      <div className="package-release-index">
        {PORTFOLIO_PROCESSES.map((process, index) => <article key={process.ocid}><span>{index + 1}</span><div><strong>{process.title}</strong><small>{process.buyer}</small><code>{process.ocid}</code></div><div className="package-release-index__counts"><b>{process.items}<small>items</small></b><b>{process.awards}<small>awards</small></b><b>{process.contracts}<small>contracts</small></b></div><div className="package-release-index__signals">{renderSignalCell(process)}</div><button type="button" className="package-release-index__inspect" data-active={inspectorIndex === index || undefined} aria-haspopup="dialog" aria-expanded={inspectorIndex === index} onClick={() => setInspectorIndex(index)}>Inspect <span aria-hidden="true">→</span></button></article>)}
      </div>
      <JsonView data={POC_RELEASE_PACKAGE} label="Inspect complete release-package JSON" collapsed />
      <p className="journey-caution">This local proof of concept uses a non-resolving URN generated for the fixture. It does not claim an external host or organizational publisher. Production publication needs publisher-controlled persistent metadata, a license, and a publication policy.</p>
    </section>

    <section className="publication-section">
      <div className="publication-section__heading"><div><span className="artifact-badge artifact-badge--analysis">Non-standard analytical view</span><h2>Portfolio</h2></div><p>The dashboard below is derived from OCDS data, but it is not itself an OCDS package or schema component.</p></div>
      <div className="portfolio-kpis">{COHORTS.map((item) => <button type="button" key={item.id} aria-pressed={cohort === item.id} data-active={cohort === item.id || undefined} onClick={() => setCohort(item.id)}><span>{item.label}</span><strong>{item.value}</strong><small>{item.note}</small></button>)}</div>
      <div className="portfolio-value"><span>Total published award value</span><strong>{money(PORTFOLIO_TOTALS.awardValue)}</strong><small>Sum of <code>awards[].value.amount</code>; no adjustment for inflation, amendments, or payments.</small></div>
      <div className="portfolio-results"><header><div><span>Selected cohort</span><h3>{selected.label}</h3></div><strong>{processes.length} process{processes.length === 1 ? "" : "es"}</strong></header>
        {processes.length ? <div className="portfolio-table-wrap"><table><thead><tr><th>Process</th><th>Items</th><th>Awards</th><th>Suppliers</th><th>Contracts</th><th>Award value</th><th>Indicator signals</th><th>Evidence</th></tr></thead><tbody>{processes.map((process) => {
          const releaseIndex = POC_RELEASE_PACKAGE.releases.findIndex((release) => release.ocid === process.ocid);
          return <tr key={process.ocid}><th scope="row"><Link to={`/possible-journeys/${process.journeyId}`}>{process.title}</Link><small>{process.buyer}</small></th><td>{process.items}</td><td>{process.awards}</td><td>{process.suppliers}</td><td>{process.contracts}</td><td>{money(process.awardValue)}</td><td className="portfolio-table__signals">{renderSignalCell(process)}</td><td>{releaseIndex >= 0 ? <button type="button" className="portfolio-table__release" aria-haspopup="dialog" aria-expanded={inspectorIndex === releaseIndex} onClick={() => setInspectorIndex(releaseIndex)}>Release</button> : <span />} · <Link to={`/possible-journeys/${process.journeyId}#timeline`}>Timeline</Link></td></tr>;
        })}</tbody></table></div> : <p>No processes match this cohort.</p>}
      </div>
    </section>

    <ReleaseInspector
      items={inspectorItems}
      selectedIndex={inspectorIndex}
      onClose={() => setInspectorIndex(null)}
      onSelect={setInspectorIndex}
      contextLabel="Release package release"
      expandIndicators={expandIndicators}
    />
    <aside className="next-chapter"><span className="next-chapter__preview">Optional intermediate lesson: follow individual source fields through the audited transformation rules.</span><Link to="/explore/fields">Open Field Explorer <span aria-hidden="true">→</span></Link></aside>
  </>;
}

function inCohort(process: PortfolioProcess, cohort: Cohort) {
  if (cohort === "awarded") return process.awards > 0;
  if (cohort === "contracted") return process.contracts > 0;
  if (cohort === "missing-contract") return process.awards > 0 && process.contracts === 0;
  if (cohort === "multi-award") return process.awards > 1;
  if (cohort === "chronology") return process.chronologyChecks > 0;
  if (cohort === "signals") return process.indicatorSummary.signal > 0;
  if (cohort === "not-assessable") return process.indicatorSummary.not_assessable > 0;
  return true;
}

function money(value: number) { return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 }).format(value); }

function renderSignalCell(process: PortfolioProcess) {
  const { signal, not_assessable, clear } = process.indicatorSummary;
  if (signal === 0 && not_assessable === 0) {
    return <span className="signal-pill signal-pill--clear" title={`${clear} check${clear === 1 ? "" : "s"} ran clean`}>{clear} clear</span>;
  }
  return <>
    {signal > 0 && <span className="signal-pill signal-pill--signal" title={`${signal} illustrative red-flag condition${signal === 1 ? "" : "s"} met`}>{signal} signal{signal === 1 ? "" : "s"}</span>}
    {not_assessable > 0 && <span className="signal-pill signal-pill--na" title={`${not_assessable} check${not_assessable === 1 ? "" : "s"} could not run (missing data)`}>{not_assessable} n/a</span>}
  </>;
}
