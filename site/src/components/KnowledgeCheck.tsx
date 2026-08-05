import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { StationId } from "../content/stations";
import {
  DIFFICULTIES,
  DIFFICULTY_META,
  KNOWLEDGE_CHECKS,
  type CheckDefinition,
  type Difficulty,
} from "../content/knowledgeChecks";
import { useStationProgress } from "../context/StationProgress";

/**
 * Knowledge checks for one station.
 *
 * Three difficulties (easy / normal / hard) are stacked on the page; the
 * learner can answer them in any order. A station is recorded as "passed"
 * only when all three difficulties have been answered correctly (see
 * `StationProgress`). Each question owns its own selection/evaluated state,
 * so the parent does not need to thread per-question state through props.
 *
 * Most questions are single-answer (`mode: "single"`), but a question may
 * instead be `mode: "multi"` to teach the OCDS reality that one concept
 * legitimately fans out to several values (e.g. a release can carry more
 * than one tag, a record can contain more than one derived view). Multi
 * questions are answered with checkboxes and require the exact correct set.
 */
export function KnowledgeCheck({ stationId }: { stationId: StationId }) {
  const checks = KNOWLEDGE_CHECKS[stationId];
  const { passed, isAvailable } = useStationProgress();
  const alreadyPassed = passed.has(stationId);
  const [correctCount, setCorrectCount] = useState(0);

  // The journey-complete block appears only on Station 5 when all three of
  // its difficulties are correct (not necessarily when every station has
  // been passed — that's handled by the journey-hub banner).
  const allCorrectHere = correctCount === DIFFICULTIES.length;

  return (
    <section className="knowledge-check" aria-labelledby={`check-${stationId}`} data-correct={allCorrectHere || undefined}>
      <div className="knowledge-check__heading">
        <div>
          <p className="lens-kicker">Knowledge check</p>
          <p className="knowledge-check__subhead">Three short questions · answer in any order.</p>
        </div>
        {alreadyPassed && <span className="knowledge-check__badge" aria-label={`Station ${stationId} passed`}>Passed</span>}
      </div>

      <ol className="knowledge-check__list">
        {DIFFICULTIES.map((difficulty, index) => (
          <KnowledgeQuestion
            key={difficulty}
            stationId={stationId}
            difficulty={difficulty}
            index={index}
            definition={checks[difficulty]}
            onCorrect={() => setCorrectCount((count) => Math.max(count, index + 1))}
          />
        ))}
      </ol>

      {!isAvailable && correctCount > 0 && (
        <p className="knowledge-check__persistence-note">Your browser blocked local storage, so this progress won't be saved between visits.</p>
      )}
      {allCorrectHere && stationId === "5-analyzed" && (
        <div className="journey-complete">
          <span>Introductory journey complete</span>
          <strong>You followed one contracting process from event to analysis.</strong>
          <p>You are ready to compare less tidy process shapes in Possible Journeys.</p>
          <Link to="/possible-journeys">Continue to Possible Journeys <span aria-hidden="true">→</span></Link>
        </div>
      )}
    </section>
  );
}

interface KnowledgeQuestionProps {
  stationId: StationId;
  difficulty: Difficulty;
  index: number;
  definition: CheckDefinition;
  onCorrect: () => void;
}

function KnowledgeQuestion({ stationId, difficulty, index, definition, onCorrect }: KnowledgeQuestionProps) {
  const { markDifficultyPassed, isDifficultyPassed } = useStationProgress();
  const meta = DIFFICULTY_META[difficulty];
  const previouslyPassed = isDifficultyPassed(stationId, difficulty);

  // A difficulty can only be recorded as "passed" by submitting the correct
  // answer, so on first mount we can faithfully replay that submission: the
  // option(s) are checked, the feedback block reappears, and the green
  // "correct" styling is restored after a navigation away and back. Because
  // this is computed once per mount from the persisted record, it stays in
  // sync without re-introducing stale state on subsequent in-page interactions.
  const seedSelection = (): string | string[] => {
    if (!previouslyPassed) return definition.mode === "single" ? "" : [];
    return definition.mode === "single" ? definition.answer : [...definition.answers];
  };

  const [singleSelection, setSingleSelection] = useState<string>(() =>
    definition.mode === "single" ? (seedSelection() as string) : ""
  );
  const [multiSelection, setMultiSelection] = useState<string[]>(() =>
    definition.mode === "multi" ? (seedSelection() as string[]) : []
  );
  const [evaluated, setEvaluated] = useState(previouslyPassed);

  const isCorrect = definition.mode === "single"
    ? evaluated && singleSelection === definition.answer
    : evaluated
      && multiSelection.length === definition.answers.length
      && definition.answers.every((id) => multiSelection.includes(id));

  // Record the difficulty as passed the first time the learner submits the
  // correct answer. Also bubble the correct-count up to the parent so the
  // Station 5 completion banner can appear.
  useEffect(() => {
    if (isCorrect) {
      markDifficultyPassed(stationId, difficulty);
      onCorrect();
    }
  }, [isCorrect, stationId, difficulty, markDifficultyPassed, onCorrect]);

  const idBase = `check-${stationId}-${difficulty}`;
  const toggleMulti = (id: string) => {
    setMultiSelection((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    setEvaluated(false);
  };
  const reset = () => {
    if (definition.mode === "single") setSingleSelection("");
    else setMultiSelection([]);
    setEvaluated(false);
  };
  const canSubmit = definition.mode === "single" ? Boolean(singleSelection) : multiSelection.length > 0;

  return (
    <li className="knowledge-question" data-correct={isCorrect || undefined}>
      <div className="knowledge-question__heading">
        <span className={`knowledge-question__difficulty knowledge-question__difficulty--${difficulty}`}>{meta.label}</span>
        <span className="knowledge-question__hint">{meta.description}</span>
        {previouslyPassed && <span className="knowledge-question__check" aria-label={`${meta.label} passed`}>✓</span>}
        <span className="knowledge-question__index" aria-hidden="true">{index + 1} / {DIFFICULTIES.length}</span>
      </div>
      <fieldset>
        <legend id={idBase}>{definition.question}</legend>
        {definition.mode === "multi" && definition.selectHint && (
          <p className="knowledge-question__multi-hint">{definition.selectHint}</p>
        )}
        <div className="knowledge-check__options">
          {definition.options.map((option) => {
            const selected = definition.mode === "single"
              ? singleSelection === option.id
              : multiSelection.includes(option.id);
            return (
              <label key={option.id} data-selected={selected || undefined}>
                <input
                  type={definition.mode === "single" ? "radio" : "checkbox"}
                  name={idBase}
                  value={option.id}
                  checked={selected}
                  onChange={() => {
                    if (definition.mode === "single") {
                      setSingleSelection(option.id);
                      setEvaluated(false);
                    } else {
                      toggleMulti(option.id);
                    }
                  }}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <button
        className="knowledge-check__submit"
        type="button"
        disabled={!canSubmit}
        onClick={() => setEvaluated(true)}
      >
        {definition.mode === "multi" ? "Check selections" : "Check answer"}
      </button>
      {evaluated && (
        <div className="knowledge-check__feedback" data-correct={isCorrect || undefined} role="status" aria-live="polite">
          <strong>{isCorrect ? "That’s it" : "Not quite yet"}</strong>
          <p>{isCorrect ? definition.correctFeedback : definition.retryFeedback}</p>
          {!isCorrect && (
            <button type="button" className="knowledge-check__retry" onClick={reset}>
              Try again
            </button>
          )}
        </div>
      )}
    </li>
  );
}
