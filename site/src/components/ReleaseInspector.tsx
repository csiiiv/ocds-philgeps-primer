import { useEffect, useRef, useState, type ReactNode } from "react";
import { JsonView } from "./JsonView";
import { formatReleaseDate } from "../content/format";
import { evaluateIndicators, summarize } from "../content/indicators";

type JsonObject = Record<string, unknown>;

/** Kind of artifact an InspectorItem represents. */
export type InspectorKind = "release" | "currentStateRelease" | "sourceRows";

export interface InspectorItem {
  id: string;
  label: string;
  date?: string;
  kind: InspectorKind;
  data: unknown;
}

export interface ReleaseInspectorProps {
  /** The full ordered list the modal navigates through. */
  items: InspectorItem[];
  /** Index of the item currently shown (or null when closed). */
  selectedIndex: number | null;
  /** Called when the user requests close (Escape, backdrop, or Close button). */
  onClose: () => void;
  /** Called with the new index when the user navigates previous/next. */
  onSelect: (index: number) => void;
  /**
   * Short context line shown in the dialog toolbar — e.g. "Possible Journey evidence"
   * or "Publication release". Defaults to "Selected release".
   */
  contextLabel?: string;
  /**
   * Optional fixed content rendered above the scrollable region. For source-row
   * items this receives the row selector. For all other kinds it is empty.
   */
  fixedHeader?: ReactNode;
  /**
   * When true, the readable-view indicator panel starts expanded. Used by the
   * Publication page when the learner arrives via the signals / not-assessable
   * cohort so the findings they filtered on are immediately visible.
   */
  expandIndicators?: boolean;
  /**
   * ARIA-labelledby id for the dialog heading. Defaults to a stable generated id.
   * Pass an explicit id when the caller wants the heading referenced by name.
   */
  titleId?: string;
}

const DEFAULT_TITLE_ID = "release-inspector-title";

/**
 * Shared release / evidence inspection surface.
 *
 * Renders a single dialog with a fixed toolbar + heading, a Readable view / JSON
 * view toggle, an independently scrolling content region, and synchronized
 * previous/next navigation with a position indicator. The dialog opens when
 * `selectedIndex` is non-null and closes when it becomes null, so callers stay
 * declarative — they manage state, this component owns presentation and a11y.
 *
 * For source-row items, callers may pass a fixed row selector via `fixedHeader`.
 * The component owns row-state for the readable summary itself, but exposes the
 * selector through that prop so the row choice stays visible while scrolling.
 */
export function ReleaseInspector({
  items,
  selectedIndex,
  onClose,
  onSelect,
  contextLabel = "Selected release",
  fixedHeader,
  expandIndicators = false,
  titleId = DEFAULT_TITLE_ID,
}: ReleaseInspectorProps) {
  const [view, setView] = useState<"summary" | "json">("summary");
  const [sourceRowIndex, setSourceRowIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = selectedIndex !== null;
  const selected = isOpen ? items[selectedIndex] : undefined;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // Reset transient view state when the inspected item changes.
  useEffect(() => {
    if (isOpen) { setView("summary"); setSourceRowIndex(0); }
  }, [selectedIndex, isOpen]);

  const hasPrev = selectedIndex !== null && selectedIndex > 0;
  const hasNext = selectedIndex !== null && selectedIndex < items.length - 1;
  const previous = hasPrev ? items[selectedIndex - 1] : undefined;
  const next = hasNext ? items[selectedIndex + 1] : undefined;

  return (
    <dialog
      ref={dialogRef}
      className="release-dialog evidence-dialog"
      aria-labelledby={titleId}
      onCancel={onClose}
      onClose={() => { if (selectedIndex !== null) onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      {selected && selectedIndex !== null && (
        <article className="selected-release">
          <div className="selected-release__toolbar">
            <span>{contextLabel}</span>
            <button type="button" onClick={onClose} aria-label="Close inspector">
              Close <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="selected-release__heading">
            <div>
              <span>Item {selectedIndex + 1} of {items.length}</span>
              <h3 id={titleId}>{selected.label}</h3>
            </div>
            {selected.date && <time className="release-inspector__date" dateTime={selected.date}>{formatReleaseDate(selected.date)}</time>}
          </div>
          <div className="evidence-view-toggle" role="group" aria-label="Display mode">
            <button type="button" aria-pressed={view === "summary"} data-active={view === "summary" || undefined} onClick={() => setView("summary")}>Readable view</button>
            <button type="button" aria-pressed={view === "json"} data-active={view === "json" || undefined} onClick={() => setView("json")}>JSON view</button>
          </div>
          <div className="evidence-dialog__fixed">
            {view === "summary" && (fixedHeader ?? (selected.kind === "sourceRows" && (
              <SourceRowsHeader data={selected.data} rowIndex={sourceRowIndex} onSelect={setSourceRowIndex} />
            )))}
          </div>
          <div className="evidence-dialog__content">
            {view === "summary"
              ? (selected.kind === "sourceRows"
                  ? <SourceRowsSummary data={selected.data} rowIndex={sourceRowIndex} />
                  : <ReleaseSummary data={selected.data} expandIndicators={expandIndicators} />)
              : <JsonView data={selected.data} label={selected.kind === "sourceRows" ? "Source row JSON" : "OCDS release JSON"} />}
          </div>
          <nav className="release-dialog__navigation" aria-label="Inspector navigation">
            <button
              type="button"
              disabled={!hasPrev}
              onClick={() => onSelect(selectedIndex - 1)}
            >
              <span aria-hidden="true">←</span>
              <span><small>Previous</small><strong>{previous?.label ?? "Beginning"}</strong></span>
            </button>
            <span className="release-dialog__position" aria-live="polite">
              {selectedIndex + 1} of {items.length}
            </span>
            <button
              type="button"
              disabled={!hasNext}
              onClick={() => onSelect(selectedIndex + 1)}
            >
              <span><small>Next</small><strong>{next?.label ?? "End"}</strong></span>
              <span aria-hidden="true">→</span>
            </button>
          </nav>
        </article>
      )}
    </dialog>
  );
}

/**
 * Inline (non-modal) variant of the inspector for addressable release routes.
 *
 * Renders the same Readable view / JSON view contract and position vocabulary
 * as the dialog variant, but as an in-flow section rather than a modal. Used
 * by `/journey/4-record/:releaseId` so the standalone route feels like the
 * same inspection tool the learner just used in the modal.
 */
export function ReleaseInspectorInline({
  items,
  selectedIndex,
  onSelect,
  contextLabel = "Selected release",
  fixedHeader,
}: Omit<ReleaseInspectorProps, "onClose" | "selectedIndex"> & {
  selectedIndex: number;
  onClose?: never;
}) {
  const [view, setView] = useState<"summary" | "json">("summary");
  const [sourceRowIndex, setSourceRowIndex] = useState(0);
  const selected = items[selectedIndex];
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < items.length - 1;
  const previous = hasPrev ? items[selectedIndex - 1] : undefined;
  const next = hasNext ? items[selectedIndex + 1] : undefined;

  // Reset transient view state when the inspected item changes.
  useEffect(() => { setView("summary"); setSourceRowIndex(0); }, [selectedIndex]);

  return (
    <article className="selected-release selected-release--inline">
      <div className="selected-release__toolbar">
        <span>{contextLabel}</span>
        <span className="release-dialog__position" aria-live="polite">
          {selectedIndex + 1} of {items.length}
        </span>
      </div>
      <div className="selected-release__heading">
        <div>
          <span>Item {selectedIndex + 1} of {items.length}</span>
          <h3 id={DEFAULT_TITLE_ID}>{selected.label}</h3>
        </div>
        {selected.date && <time className="release-inspector__date" dateTime={selected.date}>{formatReleaseDate(selected.date)}</time>}
      </div>
      <div className="evidence-view-toggle" role="group" aria-label="Display mode">
        <button type="button" aria-pressed={view === "summary"} data-active={view === "summary" || undefined} onClick={() => setView("summary")}>Readable view</button>
        <button type="button" aria-pressed={view === "json"} data-active={view === "json" || undefined} onClick={() => setView("json")}>JSON view</button>
      </div>
      <div className="evidence-dialog__fixed">
        {view === "summary" && (fixedHeader ?? (selected.kind === "sourceRows" && (
          <SourceRowsHeader data={selected.data} rowIndex={sourceRowIndex} onSelect={setSourceRowIndex} />
        )))}
      </div>
      <div className="evidence-dialog__content evidence-dialog__content--inline">
        {view === "summary"
          ? (selected.kind === "sourceRows"
              ? <SourceRowsSummary data={selected.data} rowIndex={sourceRowIndex} />
              : <ReleaseSummary data={selected.data} expandIndicators={false} />)
          : <JsonView data={selected.data} label={selected.kind === "sourceRows" ? "Source row JSON" : "OCDS release JSON"} />}
      </div>
      <nav className="release-dialog__navigation" aria-label="Inspector navigation">
        <button type="button" disabled={!hasPrev} onClick={() => onSelect(selectedIndex - 1)}>
          <span aria-hidden="true">←</span>
          <span><small>Previous</small><strong>{previous?.label ?? "Beginning"}</strong></span>
        </button>
        <span className="release-dialog__position">{selectedIndex + 1} of {items.length}</span>
        <button type="button" disabled={!hasNext} onClick={() => onSelect(selectedIndex + 1)}>
          <span><small>Next</small><strong>{next?.label ?? "End"}</strong></span>
          <span aria-hidden="true">→</span>
        </button>
      </nav>
    </article>
  );
}

const SOURCE_SECTIONS = [
  { title: "Process identity", fields: ["Procuring Entity", "Bid Reference No.", "Solicitation No.", "Notice Title", "Notice Status"] },
  { title: "Tender", fields: ["Notice Type", "Classification", "Procurement Mode", "Approved Budget of the Contract", "Published Date", "Closing Date", "Contract Duration", "Calendar Type"] },
  { title: "Item", fields: ["Line Item No", "Item Name", "Item Description", "Quantity", "UOM", "Item Budget", "UNSPSC Code", "UNSPSC Description"] },
  { title: "Award", fields: ["Award No.", "Award Title", "Award Type", "Award Date", "Published Date(Award)", "Award Status", "Contract Amount", "Awardee Organization Name", "Reason for Award"] },
  { title: "Contract", fields: ["Contract No", "Contract Efectivity Date", "Contract End Date", "Notice to Proceed Date"] },
];

function SourceRowsHeader({ data, rowIndex, onSelect }: { data: unknown; rowIndex: number; onSelect: (index: number) => void }) {
  const rows = Array.isArray(data) ? data.filter(isObject) : [];
  return <>
    <div className="evidence-readable__intro"><strong>{rows.length} flattened source row{rows.length === 1 ? "" : "s"}</strong><span>Fields are grouped for reading; values are unchanged.</span></div>
    {rows.length > 1 && <div className="source-row-tabs" role="tablist" aria-label="Source rows">{rows.map((item, index) => <button key={String(item._source_line ?? index)} type="button" role="tab" aria-selected={rowIndex === index} data-active={rowIndex === index || undefined} onClick={() => onSelect(index)}>Row {index + 1}<small>line {text(item._source_line)}</small></button>)}</div>}
  </>;
}

function SourceRowsSummary({ data, rowIndex }: { data: unknown; rowIndex: number }) {
  const rows = Array.isArray(data) ? data.filter(isObject) : [];
  const row = rows[rowIndex] ?? {};
  return (
    <div className="evidence-readable">
      <div className="source-sections">
        {SOURCE_SECTIONS.map((section) => {
          const fields = section.fields.filter((field) => hasValue(row[field]));
          if (!fields.length) return null;
          return <section key={section.title}><h4>{section.title}</h4><dl>{fields.map((field) => <div key={field}><dt>{field}</dt><dd>{displayValue(row[field], field)}</dd></div>)}</dl></section>;
        })}
      </div>
    </div>
  );
}

export function ReleaseSummary({ data, expandIndicators = false }: { data: unknown; expandIndicators?: boolean }) {
  const release = object(data);
  const buyer = object(release.buyer);
  const tender = object(release.tender);
  const tenderPeriod = object(tender.tenderPeriod);
  const items = objects(tender.items);
  const awards = objects(release.awards);
  const contracts = objects(release.contracts);
  const parties = objects(release.parties);
  return (
    <div className="evidence-readable">
      <div className="ocds-headline">
        <Summary label="Buyer" value={buyer.name} />
        <Summary label="Tender status" value={tender.status} />
        <Summary label="Items" value={items.length} />
        <Summary label="Awards / contracts" value={`${awards.length} / ${contracts.length}`} />
      </div>
      <section className="ocds-process-card"><header><div><span>Contracting process</span><strong>{text(release.ocid)}</strong></div><b>{Array.isArray(release.tag) ? release.tag.join(" · ") : text(release.tag)}</b></header><h4>{text(tender.title)}</h4><dl><Fact label="Method" value={tender.procurementMethodDetails ?? tender.procurementMethod} /><Fact label="Budget" value={money(tender.value)} /><Fact label="Tender period" value={period(tenderPeriod)} /><Fact label="Release date" value={date(release.date)} /></dl></section>
      <ReleaseTimeline release={release} awards={awards} contracts={contracts} tenderPeriod={tenderPeriod} releaseDate={release.date} />
      <ReleaseIndicators release={release} defaultOpen={expandIndicators} />
      {items.length > 0 && <section className="entity-section"><h4>Tender items <span>{items.length}</span></h4><div className="entity-table-wrap"><table className="entity-table"><thead><tr><th>ID</th><th>Description</th><th>Quantity</th><th>Classification</th></tr></thead><tbody>{items.map((item, index) => <tr key={text(item.id ?? index)}><td>{text(item.id)}</td><td>{text(item.description)}</td><td>{item.quantity == null ? "—" : `${text(item.quantity)} ${text(object(item.unit).name)}`}</td><td>{text(object(item.classification).id)}</td></tr>)}</tbody></table></div></section>}
      <section className="entity-section"><h4>Awards <span>{awards.length}</span></h4>{awards.length ? <div className="entity-cards">{awards.map((award) => { const supplier = objects(award.suppliers)[0] ?? {}; return <article key={text(award.id)}><header><strong>Award {text(award.id)}</strong><span>{text(award.status)}</span></header><dl><Fact label="Supplier" value={supplier.name} /><Fact label="Date" value={date(award.date)} /><Fact label="Value" value={money(award.value)} /><Fact label="Items" value={objects(award.items).length} /></dl></article>; })}</div> : <p className="empty-entity">No award is published in this release.</p>}</section>
      <section className="entity-section"><h4>Contracts <span>{contracts.length}</span></h4>{contracts.length ? <div className="entity-cards">{contracts.map((contract) => <article key={text(contract.id)}><header><strong>Contract {text(contract.id)}</strong><span>{text(contract.status)}</span></header><dl><Fact label="Linked award" value={contract.awardID} /><Fact label="Value" value={money(contract.value)} /><Fact label="Period" value={period(object(contract.period))} /></dl></article>)}</div> : <p className="empty-entity">No contract is published in this release.</p>}</section>
      <details className="party-list"><summary>Organizations in this release ({parties.length})</summary><ul>{parties.map((party) => <li key={text(party.id)}><strong>{text(party.name)}</strong><span>{Array.isArray(party.roles) ? party.roles.join(", ") : text(party.roles)}</span></li>)}</ul></details>
    </div>
  );
}

interface TimelineMilestone {
  /** ISO datetime string, used both for sorting and the `<time dateTime>` attribute. */
  iso: string;
  /** Human-readable label, e.g. "Tender period opens", "Award 4563951". */
  label: string;
  /** Short context, e.g. "Direct Contracting" or a supplier name. */
  detail?: string;
  /** Lifecycle phase; drives the colour of the marker, mirroring the subway rail. */
  phase: "events" | "released" | "analyzed";
}

/**
 * Pull every dated milestone out of a release and render them in chronological
 * order. The timeline gives an at-a-glance view of the lifecycle that's harder
 * to read from the per-section cards below — especially for current-state
 * releases that flatten many events into one payload.
 */
function ReleaseTimeline({ release, awards, contracts, tenderPeriod, releaseDate }: {
  release: JsonObject;
  awards: JsonObject[];
  contracts: JsonObject[];
  tenderPeriod: JsonObject;
  releaseDate: unknown;
}) {
  const milestones: TimelineMilestone[] = [];

  if (typeof tenderPeriod.startDate === "string") {
    milestones.push({ iso: tenderPeriod.startDate, label: "Tender period opens", detail: text(object(release.tender).procurementMethodDetails), phase: "events" });
  }
  if (typeof tenderPeriod.endDate === "string") {
    milestones.push({ iso: tenderPeriod.endDate, label: "Tender period closes", phase: "events" });
  }
  for (const award of awards) {
    if (typeof award.date === "string") {
      const supplier = objects(award.suppliers)[0];
      milestones.push({
        iso: award.date,
        label: `Award ${text(award.id)}`,
        detail: supplier?.name ? `→ ${text(supplier.name)}` : undefined,
        phase: "released",
      });
    }
  }
  for (const contract of contracts) {
    const signed = contract.dateSigned ?? object(contract.period).startDate;
    if (typeof signed === "string") {
      milestones.push({ iso: signed, label: `Contract ${text(contract.id)} signed`, phase: "released" });
    }
    const period = object(contract.period);
    if (typeof period.endDate === "string") {
      milestones.push({ iso: period.endDate, label: `Contract ${text(contract.id)} ends`, phase: "released" });
    }
  }
  if (typeof releaseDate === "string") {
    milestones.push({ iso: releaseDate, label: "Release published", detail: "current-state snapshot", phase: "analyzed" });
  }

  // Sort chronologically; stable sort keeps same-date milestones in extraction order.
  milestones.sort((a, b) => a.iso.localeCompare(b.iso));

  if (!milestones.length) return null;

  return (
    <section className="release-timeline" aria-label="Lifecycle milestones in this release">
      <h4>Timeline</h4>
      <ol>
        {milestones.map((milestone, index) => (
          <li key={`${milestone.iso}-${index}`} className="release-timeline__item" data-phase={milestone.phase}>
            <span className="release-timeline__marker" aria-hidden="true" />
            <div>
              <time className="release-timeline__date" dateTime={milestone.iso}>{formatReleaseDate(milestone.iso)}</time>
              <strong className="release-timeline__label">{milestone.label}</strong>
              {milestone.detail && <span className="release-timeline__detail">{milestone.detail}</span>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * Compact red-flag indicator summary for an inspected release. Mirrors the
 * engine consumed by the Analytics station and the Publication portfolio, so
 * the same findings follow the learner from station → portfolio → inspector.
 *
 * The summary line shows counts by status. The expandable body lists each
 * indicator with its finding and the OCDS paths it read, so the inspector
 * stays a useful place to ask "why does this process show 2 signals?".
 */
function ReleaseIndicators({ release, defaultOpen = false }: { release: JsonObject; defaultOpen?: boolean }) {
  const results = evaluateIndicators(release);
  const [open, setOpen] = useState(defaultOpen);
  // Re-sync when the inspected release changes or when the caller asks for
  // an expanded panel (e.g. Publication signals cohort).
  useEffect(() => { setOpen(defaultOpen); }, [defaultOpen, release]);
  if (results.length === 0) return null;
  const { signal, clear, not_assessable } = summarize(results);
  return (
    <details
      className="release-indicators"
      open={open}
      onToggle={(event) => setOpen((event.currentTarget as HTMLDetailsElement).open)}
    >
      <summary>
        <span>Indicator signals</span>
        <span className="release-indicators__counts">
          {signal > 0 && <b data-status="signal">{signal} signal{signal === 1 ? "" : "s"}</b>}
          {not_assessable > 0 && <b data-status="not_assessable">{not_assessable} not assessable</b>}
          {signal === 0 && not_assessable === 0 && <b data-status="clear">{clear} clear</b>}
        </span>
      </summary>
      <p className="release-indicators__caveat">Illustrative checks. A signal is a question for review, not a verdict.</p>
      <ul className="release-indicators__list">
        {results.map((result) => (
          <li key={result.id} data-status={result.status}>
            <div className="release-indicators__row">
              <span className="release-indicators__name">{result.name}</span>
              <span className="release-indicators__finding">{result.finding}</span>
            </div>
            <p className="release-indicators__explanation">{result.explanation}</p>
            <dl className="release-indicators__evidence">
              {result.evidence.map((item) => (
                <div key={item.path}><dt><code>{item.path}</code></dt><dd>{item.value}</dd></div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </details>
  );
}

function Summary({ label, value }: { label: string; value: unknown }) { return <div><span>{label}</span><strong>{text(value)}</strong></div>; }
function Fact({ label, value }: { label: string; value: unknown }) { return <div><dt>{label}</dt><dd>{text(value)}</dd></div>; }
function object(value: unknown): JsonObject { return isObject(value) ? value : {}; }
function objects(value: unknown): JsonObject[] { return Array.isArray(value) ? value.filter(isObject) : []; }
function isObject(value: unknown): value is JsonObject { return typeof value === "object" && value !== null && !Array.isArray(value); }
function hasValue(value: unknown) { return value !== undefined && value !== null && value !== "" && value !== "NULL"; }
function text(value: unknown) { return value == null || value === "" ? "Not published" : String(value); }
function date(value: unknown) { return typeof value === "string" ? formatReleaseDate(value) : "Not published"; }
function money(value: unknown) { const amount = object(value).amount; return typeof amount === "number" ? new Intl.NumberFormat("en-PH", { style: "currency", currency: text(object(value).currency || "PHP"), maximumFractionDigits: 2 }).format(amount) : "Not published"; }
function period(value: JsonObject) { const start = date(value.startDate); const end = date(value.endDate); return start === "Not published" && end === "Not published" ? "Not published" : `${start} → ${end}`; }
function displayValue(value: unknown, field: string) { if (field.includes("Budget") || field.includes("Amount")) { const amount = Number(value); if (Number.isFinite(amount)) return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 }).format(amount); } return text(value); }
