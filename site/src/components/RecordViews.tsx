import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { JsonView } from "./JsonView";
import { DEFAULT_RELEASES } from "../content/releases";
import { formatReleaseDate } from "../content/format";

type JsonObject = Record<string, unknown>;

export function CompiledReleaseView({ data }: { data: unknown }) {
  const release = data as JsonObject;
  const tender = object(release.tender);
  const buyer = object(release.buyer);
  const awards = objects(release.awards);
  const contracts = objects(release.contracts);
  const award = awards[0] ?? {};
  const contract = contracts[0] ?? {};
  const supplier = objects(award.suppliers)[0] ?? {};
  const period = object(tender.tenderPeriod);
  const implementation = object(contract.implementation);
  const milestones = objects(implementation.milestones);

  return (
    <div className="compiled-view">
      <div className="compiled-summary">
        <Summary label="Buyer" value={buyer.name} />
        <Summary label="Supplier" value={supplier.name} />
        <Summary label="Contract value" value={money(object(contract.value))} />
        <Summary label="Competition" value={`${String(tender.numberOfTenderers ?? "—")} tenderer`} />
      </div>

      <div className="lifecycle-sections">
        <LifecycleSection title="Tender" status={tender.status}>
          <Field label="Title" value={tender.title} path="tender.title" />
          <Field label="Method" value={tender.procurementMethod} path="tender.procurementMethod" />
          <Field label="Start" value={date(period.startDate)} path="tender.tenderPeriod.startDate" />
          <Field label="Deadline" value={date(period.endDate)} path="tender.tenderPeriod.endDate" />
          <Field label="Tenderers" value={tender.numberOfTenderers} path="tender.numberOfTenderers" />
        </LifecycleSection>
        <LifecycleSection title="Award" status={award.status}>
          <Field label="Supplier" value={supplier.name} path="awards[].suppliers[].name" />
          <Field label="Award date" value={date(award.date)} path="awards[].date" />
          <Field label="Value" value={money(object(award.value))} path="awards[].value" />
        </LifecycleSection>
        <LifecycleSection title="Contract" status={contract.status}>
          <Field label="Contract" value={contract.title} path="contracts[].title" />
          <Field label="Value" value={money(object(contract.value))} path="contracts[].value" />
          <Field label="Delivery milestones" value={milestones.length} path="contracts[].implementation.milestones[]" />
        </LifecycleSection>
        <LifecycleSection title="Implementation" status={milestones.length ? "delivery updates" : "not published"}>
          {milestones.map((milestone, index) => (
            <Field key={String(milestone.id)} label={text(milestone.title)} value={`${text(milestone.status)} · ${milestone.dateMet ? date(milestone.dateMet) : "completion date not published"}`} path={`contracts[].implementation.milestones[${index}]`} />
          ))}
        </LifecycleSection>
      </div>

      <div className="relationship-flow" aria-label="OCDS relationships">
        <div><span>Supplier</span><strong>{text(supplier.name)}</strong></div><b>← supplies ←</b>
        <div><span>Award</span><strong>{text(award.id)}</strong></div><b>← referenced by ←</b>
        <div><span>Contract</span><strong>{text(contract.id)}</strong></div><b>→ contains →</b>
        <div><span>Delivery milestones</span><strong>{milestones.length}</strong></div>
      </div>

      <JsonView data={data} label="Inspect raw compiled-release JSON" collapsed />
    </div>
  );
}

interface VersionValue { releaseID: string; releaseDate: string; releaseTag: string[]; value: unknown }
interface ChangeRow { path: string; section: string; kind: "changed" | "added" | "removed" | "unchanged"; history: VersionValue[] }

export function VersionedReleaseView({ data }: { data: unknown }) {
  const rows = useMemo(() => flattenVersioned(data), [data]);
  const [section, setSection] = useState("All");
  const [showUnchanged, setShowUnchanged] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string>();
  const sections = ["All", ...new Set(rows.map((row) => row.section))];
  const filtered = rows.filter((row) => (section === "All" || row.section === section) && (showUnchanged || row.kind !== "unchanged"));
  const selected = filtered.find((row) => row.path === selectedPath) ?? filtered[0];
  const changed = rows.filter((row) => row.kind === "changed").length;
  const added = rows.filter((row) => row.kind === "added").length;

  return (
    <div className="versioned-view">
      <div className="change-summary">
        <div><strong>{changed}</strong><span>fields changed</span></div>
        <div><strong>{added}</strong><span>fields added later</span></div>
        <div><strong>{DEFAULT_RELEASES.length}</strong><span>source releases</span></div>
      </div>

      <div className="change-controls">
        <label>Lifecycle section<select value={section} onChange={(event) => setSection(event.target.value)}>{sections.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="check-control"><input type="checkbox" checked={showUnchanged} onChange={(event) => setShowUnchanged(event.target.checked)} /> Include unchanged fields</label>
      </div>

      <div className="change-browser">
        <div className="change-table-wrap">
          <table className="change-table">
            <thead><tr><th>Field</th><th>Previous</th><th>Current</th><th>Change</th></tr></thead>
            <tbody>
              {filtered.map((row) => {
                const latest = row.history[row.history.length - 1];
                const previous = row.history.length > 1 ? row.history[row.history.length - 2] : undefined;
                return (
                  <tr key={row.path} data-selected={selected?.path === row.path || undefined}>
                    <th scope="row"><button type="button" onClick={() => setSelectedPath(row.path)}>{shortPath(row.path)}</button><code>{row.section}</code></th>
                    <td>{previous ? display(previous.value) : "—"}</td><td>{display(latest.value)}</td>
                    <td><span className={`change-kind change-kind--${row.kind}`}>{row.kind}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selected && <ChangeDetail row={selected} />}
      </div>

      <JsonView data={data} label="Inspect raw versioned-release JSON" collapsed />
    </div>
  );
}

function ChangeDetail({ row }: { row: ChangeRow }) {
  return (
    <aside className="change-detail">
      <span>Selected field</span><code>{row.path}</code>
      <ol>
        {row.history.map((version, index) => (
          <li key={`${version.releaseID}-${index}`}>
            <div><strong>{display(version.value)}</strong><span>{formatReleaseDate(version.releaseDate)}</span></div>
            <Link to={`/journey/4-record/${version.releaseID}`}>Release #{version.releaseID} · {version.releaseTag.join(", ")}</Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function LifecycleSection({ title, status, children }: { title: string; status: unknown; children: ReactNode }) {
  return <section className="lifecycle-card"><header><h3>{title}</h3><span>{text(status)}</span></header><dl>{children}</dl></section>;
}
function Field({ label, value, path }: { label: string; value: unknown; path: string }) {
  return <div><dt>{label}</dt><dd>{text(value)}</dd><code>{path}</code></div>;
}
function Summary({ label, value }: { label: string; value: unknown }) { return <div><span>{label}</span><strong>{text(value)}</strong></div>; }

function flattenVersioned(data: unknown): ChangeRow[] {
  const output: ChangeRow[] = [];
  const firstRelease = DEFAULT_RELEASES[0]?.id;
  function visit(value: unknown, path: string) {
    if (isVersionHistory(value)) {
      const latest = value[value.length - 1];
      const kind = latest.value === null ? "removed" : value.length > 1 ? "changed" : value[0].releaseID === firstRelease ? "unchanged" : "added";
      output.push({ path, section: sectionFor(path), kind, history: value });
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}[${isObject(item) && item.id ? `id=${item.id}` : index}]`));
    } else if (isObject(value)) {
      Object.entries(value).forEach(([key, child]) => key !== "id" && key !== "ocid" && visit(child, path ? `${path}.${key}` : key));
    }
  }
  visit(data, "");
  return output.sort((a, b) => a.path.localeCompare(b.path));
}

function isVersionHistory(value: unknown): value is VersionValue[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => isObject(item) && typeof item.releaseID === "string" && "value" in item);
}
function sectionFor(path: string) { const root = path.split(/[.[]/)[0]; return ({ tender: "Tender", awards: "Awards", contracts: "Contracts", parties: "Parties", buyer: "Parties" } as Record<string, string>)[root] ?? "Other"; }
function shortPath(path: string) { const parts = path.split("."); return parts[parts.length - 1] ?? path; }
function object(value: unknown): JsonObject { return isObject(value) ? value : {}; }
function objects(value: unknown): JsonObject[] { return Array.isArray(value) ? value.filter(isObject) : []; }
function isObject(value: unknown): value is JsonObject { return typeof value === "object" && value !== null && !Array.isArray(value); }
function text(value: unknown) { return value == null || value === "" ? "Not published" : Array.isArray(value) ? value.join(", ") : String(value); }
function date(value: unknown) { return typeof value === "string" ? formatReleaseDate(value) : text(value); }
function money(value: JsonObject) { return typeof value.amount === "number" ? new Intl.NumberFormat("en-PH", { style: "currency", currency: String(value.currency ?? "PHP"), maximumFractionDigits: 0 }).format(value.amount) : "Not published"; }
function display(value: unknown) { return typeof value === "object" && value !== null ? JSON.stringify(value) : text(value); }
