import { useMemo, useState } from "react";
import { FLAGSHIP_EXAMPLE } from "../content/workedExample";
import { evaluateIndicators, summarize } from "../content/indicators";

function titleCase(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export function EventCard() {
  const { event, meta } = FLAGSHIP_EXAMPLE;
  return (
    <section className="lens-card" aria-labelledby="event-card-title">
      <div className="lens-card__header">
        <div>
          <p className="lens-kicker">Designed teaching example</p>
          <h2 id="event-card-title">{meta.title}</h2>
        </div>
        <span className="truth-label">Synthetic</span>
      </div>
      <p>{event.story}</p>
      <dl className="fact-grid">
        {Object.entries(event)
          .filter(([key]) => key !== "story")
          .map(([key, value]) => (
            <div key={key}>
              <dt>{titleCase(key)}</dt>
              <dd>{value}</dd>
            </div>
          ))}
      </dl>
      <p className="lens-note">{meta.shapeNote}</p>
    </section>
  );
}

export function RawRowViewer() {
  const { rawRow, rawColumns } = FLAGSHIP_EXAMPLE;
  const firstColumn = rawColumns[0]?.name ?? Object.keys(rawRow)[0];
  const [selected, setSelected] = useState(firstColumn);
  const descriptions = useMemo(
    () => Object.fromEntries(rawColumns.map((column) => [column.name, column.description])),
    [rawColumns]
  );

  return (
    <section className="lens-card" aria-labelledby="raw-row-title">
      <p className="lens-kicker">One exported row</p>
      <h2 id="raw-row-title">Click a column to inspect what survived the export</h2>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>Source column</th><th>Value</th></tr></thead>
          <tbody>
            {Object.entries(rawRow).map(([key, value]) => (
              <tr key={key} data-selected={selected === key || undefined}>
                <th scope="row">
                  <button type="button" onClick={() => setSelected(key)}>{key}</button>
                </th>
                <td>{String(value) || <span className="empty-value">blank</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="selection-explainer" aria-live="polite">
        <strong>{selected}</strong>
        <span>{descriptions[selected] ?? "Source metadata retained for traceability."}</span>
      </div>
    </section>
  );
}

export function CanonicalMapper() {
  const { rawToCanonical, canonicalToOcds, rawRow, canonicalRow, ocid } = FLAGSHIP_EXAMPLE;
  const [selected, setSelected] = useState(rawToCanonical[0]?.from);
  const first = rawToCanonical.find((item) => item.from === selected);
  const second = canonicalToOcds.find((item) => item.from === first?.to);

  return (
    <section className="lens-card" aria-labelledby="mapper-title">
      <p className="lens-kicker">Source → canonical → OCDS</p>
      <h2 id="mapper-title">Select a source field to follow its mapping</h2>
      <div className="mapping-picker" role="group" aria-label="Source fields">
        {rawToCanonical.map((item) => (
          <button key={item.from} type="button" onClick={() => setSelected(item.from)}
            data-selected={selected === item.from || undefined}>
            {item.from}
          </button>
        ))}
      </div>
      {first && (
        <div className="mapping-chain" aria-live="polite">
          <div><span>Source</span><strong>{first.from}</strong><code>{String(rawRow[first.from] ?? "")}</code></div>
          <b aria-hidden="true">→</b>
          <div><span>Canonical</span><strong>{first.to}</strong><code>{String(canonicalRow[first.to] ?? "")}</code></div>
          <b aria-hidden="true">→</b>
          <div><span>OCDS</span><strong>{second?.to ?? "Mapped by transformation rule"}</strong><code>{first.to === "bid_reference_no" ? ocid : "OCDS release field"}</code></div>
        </div>
      )}
    </section>
  );
}

interface BaseQuestion {
  difficulty: "easy" | "normal" | "hard" | "bonus";
  hint: string;
  sourceField: string;
  sourceValue: string;
  prompt: string;
  options: Array<{ path: string; label: string }>;
  correctFeedback: string;
  retryFeedback: string;
}

interface SingleAnswerQuestion extends BaseQuestion {
  mode: "single";
  answer: string;
}

interface MultiAnswerQuestion extends BaseQuestion {
  mode: "multi";
  answers: string[];
  /** Optional short hint shown above the option list to set multi-select expectations. */
  selectHint?: string;
}

type MappingQuestionDefinition = SingleAnswerQuestion | MultiAnswerQuestion;

const MAPPING_QUESTIONS: MappingQuestionDefinition[] = [
  {
    mode: "single",
    difficulty: "easy",
    hint: "Where a single date belongs.",
    sourceField: "Posted Date",
    sourceValue: "Feb 15, 2024",
    prompt: "A new tender notice is posted on this date. Which single OCDS path should it populate?",
    options: [
      { path: "tender.tenderPeriod.startDate", label: "When the tender period (the window for receiving bids) begins." },
      { path: "awards[0].date", label: "When an award decision is made — too late in the process." },
      { path: "contracts[0].dateSigned", label: "When a contract is signed — even later." },
    ],
    answer: "tender.tenderPeriod.startDate",
    correctFeedback: "Yes. Posted Date marks when the tender period opens for bid submissions, so it maps cleanly to a single destination: tender.tenderPeriod.startDate.",
    retryFeedback: "Posted Date is the start of the bidding window. Which path marks the beginning, not the end, of a tender?",
  },
  {
    mode: "single",
    difficulty: "normal",
    hint: "Apply it to a date field.",
    sourceField: "Closing Date",
    sourceValue: "Mar 20, 2024",
    prompt: "Where should this source value go?",
    options: [
      { path: "tender.tenderPeriod.startDate", label: "When the tender period begins." },
      { path: "tender.tenderPeriod.endDate", label: "When submissions close." },
      { path: "awards[0].date", label: "When an award decision is made." },
    ],
    answer: "tender.tenderPeriod.endDate",
    correctFeedback: "Closing Date marks the end of the period in which submissions are accepted, so it maps to tender.tenderPeriod.endDate.",
    retryFeedback: "This value describes the submission deadline—not the tender start or award decision. Try the tender-period end date.",
  },
  {
    mode: "multi",
    difficulty: "hard",
    hint: "Reason about the process boundary — one source key, two destinations.",
    sourceField: "Bid Reference No.",
    sourceValue: "9386985",
    selectHint: "Select every destination this source value should populate — there can be more than one.",
    prompt: "This source identifier is the strongest observed process-level key in the export. Which OCDS field(s) should it populate?",
    options: [
      { path: "ocid", label: "The globally unique Open Contracting Identifier for the whole process (formed by combining the source key with a registered prefix)." },
      { path: "tender.id", label: "The human-readable reference for the tender inside this process — the number the buyer knows the solicitation by." },
      { path: "awards[0].id", label: "An identifier for one award within this process." },
      { path: "parties[0].id", label: "The internal identifier of an organization." },
    ],
    answers: ["ocid", "tender.id"],
    correctFeedback: "Right — this is the fan-out pattern. The source key does double duty: combined with a registered prefix it becomes the OCID (the process boundary, shared by every release), and carried verbatim it becomes tender.id (the human-readable solicitation number). awards[].id and parties[].id are assigned on their own axes (award numbering and organization identifiers) and are not derived from the bid reference.",
    retryFeedback: "Think about the two roles this one source value plays: it identifies the whole process at the boundary (with a prefix → ?), and it is also the readable tender reference inside that process (→ ?). Award IDs and party IDs are assigned independently.",
  },
  {
    mode: "multi",
    difficulty: "bonus",
    hint: "One source value, several destinations. (Fan-out)",
    sourceField: "Procuring Entity",
    sourceValue: "Department of Environment and Natural Resources — Region VII",
    prompt: "The same buyer name has to be consistent across OCDS. Select every destination this source value should populate so the buyer is identifiable and cross-referenced correctly.",
    options: [
      { path: "buyer.name", label: "Display name on the release's buyer block." },
      { path: "parties[0].name", label: "Name on the organisation entry that carries the buyer role." },
      { path: "tender.procuringEntity", label: "Reference (party.id) on the tender that points back to the buyer." },
      { path: "planning.budget.projectID", label: "An unrelated planning identifier." },
    ],
    answers: ["buyer.name", "parties[0].name", "tender.procuringEntity"],
    correctFeedback: "Right — this is the fan-out pattern. One source value (the buyer name) populates buyer.name and the parties[] entry (with role 'buyer'), and tender.procuringEntity cross-references that party by id. The three must stay consistent so the buyer is identifiable from either side.",
    retryFeedback: "Think about every place OCDS expects to see the buyer: a release-level shortcut (buyer), a canonical organisation record (parties[]), and the tender's pointer back to it. planning.budget.projectID is unrelated.",
  },
];

export function MappingExercise() {
  return (
    <section className="mapping-exercise" aria-labelledby="mapping-exercise-title">
      <header>
        <span>Try one mapping</span>
        <h2 id="mapping-exercise-title">Map source fields into OCDS</h2>
        <p>Optional practice after the demonstrated mapping above. Three short single-answer questions plus a multi-select fan-out case — answer in any order.</p>
      </header>
      <ol className="mapping-exercise__list">
        {MAPPING_QUESTIONS.map((definition, index) => (
          <MappingQuestion key={definition.difficulty} definition={definition} index={index} total={MAPPING_QUESTIONS.length} />
        ))}
      </ol>
    </section>
  );
}

function MappingQuestion({ definition, index, total }: { definition: MappingQuestionDefinition; index: number; total: number }) {
  const [singleSelection, setSingleSelection] = useState("");
  const [multiSelection, setMultiSelection] = useState<string[]>([]);
  const [evaluated, setEvaluated] = useState(false);
  const idBase = `mapping-${definition.difficulty}`;

  const isCorrect = definition.mode === "single"
    ? evaluated && singleSelection === definition.answer
    : evaluated && multiSelection.length === definition.answers.length && definition.answers.every((path) => multiSelection.includes(path));

  const toggleMulti = (path: string) => {
    setMultiSelection((current) => (current.includes(path) ? current.filter((item) => item !== path) : [...current, path]));
    setEvaluated(false);
  };

  const reset = () => {
    if (definition.mode === "single") setSingleSelection("");
    else setMultiSelection([]);
    setEvaluated(false);
  };

  const canSubmit = definition.mode === "single" ? Boolean(singleSelection) : multiSelection.length > 0;

  return (
    <li className="mapping-question" data-correct={isCorrect || undefined}>
      <div className="mapping-question__heading">
        <span className={`knowledge-question__difficulty knowledge-question__difficulty--${definition.difficulty}`}>{definition.difficulty}</span>
        <span className="knowledge-question__hint">{definition.hint}</span>
        <span className="knowledge-question__index" aria-hidden="true">{index + 1} / {total}</span>
      </div>
      <div className="mapping-exercise__source">
        <span>Source field</span>
        <code>{definition.sourceField}</code>
        <strong>{definition.sourceValue}</strong>
      </div>
      <fieldset>
        <legend id={idBase}>{definition.prompt}</legend>
        {definition.mode === "multi" && definition.selectHint && (
          <p className="knowledge-question__multi-hint">{definition.selectHint}</p>
        )}
        <div className="mapping-question__options">
          {definition.options.map((option) => {
            const selected = definition.mode === "single" ? singleSelection === option.path : multiSelection.includes(option.path);
            const commonProps = {
              checked: selected,
              onChange: definition.mode === "single"
                ? () => { setSingleSelection(option.path); setEvaluated(false); }
                : () => toggleMulti(option.path),
            };
            return (
              <label key={option.path} data-selected={selected || undefined}>
                <input
                  type={definition.mode === "single" ? "radio" : "checkbox"}
                  name={idBase}
                  value={option.path}
                  {...commonProps}
                />
                <span><code>{option.path}</code><small>{option.label}</small></span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <button className="knowledge-check__submit" type="button" disabled={!canSubmit} onClick={() => setEvaluated(true)}>
        {definition.mode === "multi" ? "Check selections" : "Check answer"}
      </button>
      {evaluated && (
        <div className="mapping-exercise__feedback" data-correct={isCorrect || undefined} aria-live="polite">
          <strong>{isCorrect ? "Correct" : "Not quite"}</strong>
          <p>{isCorrect ? definition.correctFeedback : definition.retryFeedback}</p>
          {!isCorrect && <button type="button" className="knowledge-check__retry" onClick={reset}>Try again</button>}
        </div>
      )}
    </li>
  );
}

export function CodelistExercise() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [evaluated, setEvaluated] = useState(false);
  const entries = [
    { path: "tender.status", value: "complete", valid: true, explanation: "complete is a valid tenderStatus code." },
    { path: "tender.procurementMethod", value: "publicBidding", valid: false, explanation: "publicBidding is a source label, not an OCDS procurementMethod code. This example maps public bidding to open." },
    { path: "awards[0].status", value: "active", valid: true, explanation: "active is a valid awardStatus code." },
    { path: "contracts[0].status", value: "signed", valid: false, explanation: "signed is not a contractStatus code. Contract signature belongs in dateSigned; an in-force contract normally uses active." },
  ];
  const invalid = entries.filter((entry) => !entry.valid).map((entry) => entry.path);
  const correct = evaluated && invalid.length === selected.length && invalid.every((path) => selected.includes(path));
  const toggle = (path: string) => { setSelected((current) => current.includes(path) ? current.filter((item) => item !== path) : [...current, path]); setEvaluated(false); };
  const reset = () => { setSelected([]); setEvaluated(false); };
  return <section className="codelist-exercise">
    <div className="codelist-exercise__heading"><div><span>Optional data-quality exercise</span><h2>Spot the invalid codelist values</h2><p>OCDS paths can be structurally correct while their values still use the wrong vocabulary.</p></div><button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? "Hide exercise" : "Start exercise"}</button></div>
    {open && <div className="codelist-exercise__body"><p>Select every row whose value is invalid for the named OCDS field.</p><div className="codelist-options">{entries.map((entry) => <button type="button" key={entry.path} aria-pressed={selected.includes(entry.path)} data-selected={selected.includes(entry.path) || undefined} data-result={evaluated ? entry.valid === !selected.includes(entry.path) ? "correct" : "incorrect" : undefined} onClick={() => toggle(entry.path)}><code>{entry.path}</code><strong>“{entry.value}”</strong>{evaluated && <small>{entry.explanation}</small>}</button>)}</div><div className="codelist-exercise__actions"><button type="button" disabled={!selected.length} onClick={() => setEvaluated(true)}>Check selections</button>{evaluated && <button type="button" onClick={reset}>Try again</button>}</div>{evaluated && <div className="codelist-exercise__feedback" data-correct={correct || undefined} aria-live="polite"><strong>{correct ? "All invalid values found" : "Review the highlighted explanations"}</strong><p>{correct ? "Correct: field meaning, data type, and codelist membership all need to align." : "An invalid selection or a missed invalid value remains. The explanations show the accepted modeling approach."}</p></div>}</div>}
  </section>;
}

export function RedFlagPlayground() {
  const release = FLAGSHIP_EXAMPLE.record.compiledRelease;
  const results = useMemo(() => evaluateIndicators(release), [release]);
  const [selectedId, setSelectedId] = useState(results[0]?.id);
  const selected = results.find((result) => result.id === selectedId) ?? results[0];
  const { signal: signalCount, clear: clearCount, not_assessable: unavailableCount } = summarize(results);

  return (
    <section className="lens-card" aria-labelledby="indicators-title">
      <p className="lens-kicker">Results from the compiled release</p>
      <h2 id="indicators-title">What can this process tell us?</h2>
      <p className="analytics-intro">These illustrative checks turn structured OCDS fields into questions for review. Select a result to see the evidence behind it.</p>

      <section className="analytics-summary" aria-label="Indicator result summary">
        <div data-status="signal"><strong>{signalCount}</strong><span>Signals or gaps</span></div>
        <div data-status="clear"><strong>{clearCount}</strong><span>Conditions not met</span></div>
        <div data-status="not_assessable"><strong>{unavailableCount}</strong><span>Not assessable</span></div>
      </section>

      <div className="analytics-browser">
        <div className="indicator-grid" role="group" aria-label="Indicator results">
          {results.map((result) => (
            <button type="button" className="indicator" key={result.id}
              data-status={result.status} data-selected={selected.id === result.id || undefined}
              onClick={() => setSelectedId(result.id)}>
              <span className="indicator__category">{result.category}</span>
              <span className="indicator__name">{result.name}</span>
              <span className="indicator__finding">{result.finding}</span>
            </button>
          ))}
        </div>

        <article className="indicator-detail" aria-live="polite">
          <div className="indicator__heading">
            <div><span>{selected.category}</span><h3>{selected.name}</h3></div>
            <strong data-status={selected.status}>{selected.finding}</strong>
          </div>
          <p>{selected.explanation}</p>
          <h4>OCDS evidence</h4>
          <dl className="indicator-evidence">
            {selected.evidence.map((item) => (
              <div key={item.path}><dt><code>{item.path}</code></dt><dd>{item.value}</dd></div>
            ))}
          </dl>
          <div className="review-question"><span>Question for review</span><p>{selected.question}</p></div>
        </article>
      </div>

      <aside className="signal-caution">
        <strong>A signal is a question, not a verdict</strong>
        <p>A red flag identifies a pattern worth examining. It does not establish fraud, wrongdoing, or poor value by itself. Reviewers still need procurement documents, applicable rules, market context, and an explanation from the buyer.</p>
      </aside>

      <div className="next-chapter">
        <span>End of the introductory journey</span>
        <strong>One process can raise questions. Many processes reveal patterns.</strong>
        <p>This process can show a single bid and a missing date. It cannot tell us whether the same supplier repeatedly wins, whether one buyer regularly receives little competition, or how spending is distributed. Those questions require a publication containing many contracting processes.</p>
        <p className="next-chapter__preview">Next chapter: Possible Journeys — cancelled, incomplete, retendered, and other real-world process shapes.</p>
      </div>
    </section>
  );
}
