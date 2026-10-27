import { useState } from "react";
import { CODELISTS, CODELIST_QUESTIONS, type CodelistQuestion } from "../content/mappingGuide";

export function CodelistLesson() {
  const [selected, setSelected] = useState(CODELISTS[0].id);
  const [exercise, setExercise] = useState(CODELIST_QUESTIONS[0].id);
  const list = CODELISTS.find((item) => item.id === selected)!;
  return <section className="learning-section" id="codelists">
    <p className="eyebrow">Map values as well as fields</p>
    <h2>Codelists: choose a code by its meaning</h2>
    <p>Field mapping chooses <code>tender.procurementMethod</code>. Codelist mapping chooses a value such as <code>open</code>. Display labels can be translated; published codes are case-sensitive and must retain their exact spelling.</p>
    <div className="lesson-grid">
      <article><h3>Closed list</h3><p>Use the standard codes. If none fits, record the gap for review rather than inventing a code or forcing an unsupported match.</p></article>
      <article><h3>Open list</h3><p>Use a standard code where appropriate. If none fits, an additional code can be documented in an extension and publication policy.</p></article>
    </div>
    <label className="learning-select">Explore a codelist<select value={selected} onChange={(event) => setSelected(event.target.value)}>{CODELISTS.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
    <article className="learning-card" aria-live="polite"><span className="artifact-badge">{list.open ? "Open codelist · selected standard codes" : "Closed codelist"}</span><h3>{list.title}</h3><code>{list.path}</code><ul className="code-chips">{list.codes.map((code) => <li key={code}><code>{code}</code></li>)}</ul><p>{list.note}</p></article>
    <div id="codelist-practice"><h3>Try a mapping decision</h3><p>These are illustrative definitions, not an approved PhilGEPS crosswalk. “Unresolved” is a useful answer when the evidence is insufficient.</p><label className="learning-select">Choose a mapping decision<select value={exercise} onChange={(event) => setExercise(event.target.value)}>{CODELIST_QUESTIONS.map((question, index) => <option key={question.id} value={question.id}>{index + 1}. {question.source}</option>)}</select></label>{CODELIST_QUESTIONS.map((question) => <div key={question.id} hidden={exercise !== question.id}><CodelistPractice question={question} /></div>)}</div>
    <p className="derived-note"><a href="https://standard.open-contracting.org/latest/en/schema/codelists/">Official code definitions and full open codelists</a></p>
  </section>;
}

function CodelistPractice({ question }: { question: CodelistQuestion }) {
  const [choice, setChoice] = useState("");
  const [checked, setChecked] = useState(false);
  return <fieldset className="mapping-practice"><legend>{question.source}</legend><p>{question.meaning}</p><p>Destination: <code>{question.path}</code></p><div className="learning-actions">{question.choices.map((value) => <label key={value}><input type="radio" name={question.id} value={value} checked={choice === value} onChange={() => { setChoice(value); setChecked(false); }} /> {value === "unresolved" ? "Unresolved — needs clarification" : value}</label>)}</div><button type="button" className="lesson-button" disabled={!choice} onClick={() => setChecked(true)}>Check mapping</button>{checked && <p role="status" className={choice === question.answer ? "lesson-feedback" : "journey-caution"}><strong>{choice === question.answer ? "Supported decision. " : "Reconsider the source meaning. "}</strong>{question.explanation}</p>}</fieldset>;
}
