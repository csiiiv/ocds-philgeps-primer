import type { StationId } from "./stations";

export type Difficulty = "easy" | "normal" | "hard";

export const DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard"];

export const DIFFICULTY_META: Record<Difficulty, { label: string; description: string }> = {
  easy: { label: "Easy", description: "Recall the core idea." },
  normal: { label: "Normal", description: "Apply it to the example." },
  hard: { label: "Hard", description: "Reason about an edge case." },
};

export interface BaseCheckDefinition {
  question: string;
  options: Array<{ id: string; label: string }>;
  correctFeedback: string;
  retryFeedback: string;
}

export interface SingleCheckDefinition extends BaseCheckDefinition {
  mode: "single";
  answer: string;
}

export interface MultiCheckDefinition extends BaseCheckDefinition {
  mode: "multi";
  answers: string[];
  /** Optional short hint shown above the option list to set multi-select expectations. */
  selectHint?: string;
}

export type CheckDefinition = SingleCheckDefinition | MultiCheckDefinition;

/**
 * Three-tier knowledge checks per station.
 *
 * Easy = recognition/recall of the core concept.
 * Normal = direct application to the worked example (carries forward from
 *   the original single-question checks).
 * Hard = reasoning about an edge case, contradiction, or modelling choice.
 *
 * A station is recorded as "passed" only when all three difficulties have
 * been answered correctly.
 */
export const KNOWLEDGE_CHECKS: Record<StationId, Record<Difficulty, CheckDefinition>> = {
  "1-event": {
    easy: {
      mode: "single",
      question: "In OCDS publishing, what does \"event\" mean?",
      options: [
        { id: "planned", label: "A planned procurement milestone on a calendar." },
        { id: "happened", label: "Something that actually happened and was recorded at a point in time." },
        { id: "release-type", label: "A type of OCDS release." },
      ],
      answer: "happened",
      correctFeedback: "Yes. An event is a real-world occurrence; a release is how information about that change is published.",
      retryFeedback: "An event is not a planned date or a release type — it is something that actually happened.",
    },
    normal: {
      mode: "single",
      question: "A procurement notice is posted. What is the relationship between the event and an OCDS release?",
      options: [
        { id: "same", label: "They are the same object in two formats." },
        { id: "publication", label: "The posting is the event; a release publishes information about that event." },
        { id: "record", label: "The event is created only after a complete record exists." },
      ],
      answer: "publication",
      correctFeedback: "Exactly. The event is what happened; the release is how information about that change is published.",
      retryFeedback: "Look again at the direction of the relationship: something happens first, then structured information about it is published.",
    },
    hard: {
      mode: "multi",
      selectHint: "Select every tag that applies — there can be more than one.",
      question: "A buyer publishes a release that extends a tender's submission deadline. Which tag(s) can this release carry?",
      options: [
        { id: "tender", label: "tender — a tender notice or update." },
        { id: "tenderUpdate", label: "tenderUpdate — a correction to a previously published tender." },
        { id: "tenderAmendment", label: "tenderAmendment — a formal change to the tender period or conditions." },
        { id: "award", label: "award — an award decision has been made." },
      ],
      answers: ["tenderUpdate", "tenderAmendment"],
      correctFeedback: "Right. A single release can carry multiple tags. Extending the deadline is an amendment to the tender, and the release is also an update to a previously published tender. The 'award' tag would imply an award decision happened, which it did not.",
      retryFeedback: "Extending a deadline touches both the 'is this a correction?' axis (tenderUpdate) and the 'is this a formal change?' axis (tenderAmendment). 'award' is wrong — no award decision is being published here.",
    },
  },
  "2-extracted": {
    easy: {
      mode: "single",
      question: "What does one row in a flat PhilGEPS export describe?",
      options: [
        { id: "always-process", label: "Always exactly one contracting process." },
        { id: "export-choice", label: "Whatever fields that export chose to flatten — could be an event, an item, or a whole process snapshot." },
        { id: "one-release", label: "One OCDS release." },
      ],
      answer: "export-choice",
      correctFeedback: "Correct. Flat rows are an export choice, not an OCDS structural unit.",
      retryFeedback: "Flat exports do not align row boundaries with process boundaries. The grain depends on the export.",
    },
    normal: {
      mode: "single",
      question: "Several exported rows carry the same valid Bid Reference No. What should you infer first?",
      options: [
        { id: "unrelated", label: "Each row is automatically a separate procurement." },
        { id: "same-process", label: "They can be events belonging to the same contracting process." },
        { id: "duplicate", label: "All but the newest row should be deleted as duplicates." },
      ],
      answer: "same-process",
      correctFeedback: "Right. Flat rows separate events visually, while the shared process identifier preserves their relationship.",
      retryFeedback: "A row boundary is not necessarily a process boundary. Focus on the stable identifier carried by the rows.",
    },
    hard: {
      mode: "single",
      question: "An export row contains tender, award, supplier, and contract facts all at once. What can you honestly call this row?",
      options: [
        { id: "release-history", label: "A published release history." },
        { id: "current-state", label: "A current-state snapshot derived from multiple events." },
        { id: "no-events", label: "Evidence that no events ever occurred." },
      ],
      answer: "current-state",
      correctFeedback: "Right. The row flattens the current state; it is not a record of when each fact became known.",
      retryFeedback: "A flattened current-state row tells you what is true now, not when each fact was published.",
    },
  },
  "3-mapped": {
    easy: {
      mode: "single",
      question: "What does the ocid identify?",
      options: [
        { id: "release", label: "One release." },
        { id: "process", label: "One contracting process." },
        { id: "buyer", label: "One buyer organization." },
      ],
      answer: "process",
      correctFeedback: "Correct. Every release sharing an ocid belongs to the same contracting process.",
      retryFeedback: "The ocid joins releases to a process, not to a single publication or an organization.",
    },
    normal: {
      mode: "single",
      question: "Which identifier establishes the contracting-process boundary in OCDS?",
      options: [
        { id: "solicitation", label: "The human-readable Solicitation No." },
        { id: "release", label: "The newest release ID." },
        { id: "ocid", label: "The OCID, derived for this example from the best stable source key currently exposed." },
      ],
      answer: "ocid",
      correctFeedback: "Correct. Releases with the same OCID describe the same contracting process. Bid Reference No. is this dataset's current source key, not a source field prescribed by OCDS.",
      retryFeedback: "Separate the process identifier from labels and publication identifiers. Which value joins every release in the process?",
    },
    hard: {
      mode: "single",
      question: "Bid Reference No. is 0 in a source row. What is the right next step?",
      options: [
        { id: "publish-zero", label: "Publish ocid \"0\" and hope it is unique." },
        { id: "fallback", label: "Reject 0 as a sentinel and use a disclosed fallback with provenance." },
        { id: "skip", label: "Skip the row entirely." },
      ],
      answer: "fallback",
      correctFeedback: "Yes. Sentinel values like 0, NULL, or blank cannot be process identifiers. The fallback must be tested and labelled.",
      retryFeedback: "0 is a sentinel, not a stable identifier. Pick the next best stable key and disclose the assumption.",
    },
  },
  "4-record": {
    easy: {
      mode: "single",
      question: "How many releases describe one contracting process over its lifetime?",
      options: [
        { id: "always-one", label: "Always exactly one." },
        { id: "always-seven", label: "Always exactly seven." },
        { id: "as-many", label: "As many as events published for that process." },
      ],
      answer: "as-many",
      correctFeedback: "Right. There is no fixed release count; one release is published per event.",
      retryFeedback: "Release count tracks published events. There is no universal number.",
    },
    normal: {
      mode: "single",
      question: "Which statement accurately describes an OCDS record?",
      options: [
        { id: "one-release", label: "It is another name for the newest release." },
        { id: "three-required", label: "Its release index, compiled release, and versioned release are all mandatory." },
        { id: "cardinality", label: "It indexes all releases, should include a compiled release, and may include a versioned release." },
      ],
      answer: "cardinality",
      correctFeedback: "Yes. The index preserves the publications; the compiled and versioned releases are derived views with different normative strength.",
      retryFeedback: "Remember that the three views are not equally required, and a record is larger than any one release.",
    },
    hard: {
      mode: "multi",
      selectHint: "Select every part that a record can contain — there can be more than one.",
      question: "Which of these are derived views an OCDS record can contain (as opposed to the release index itself)?",
      options: [
        { id: "releases", label: "releases — the list pointing back at every published release." },
        { id: "compiledRelease", label: "compiledRelease — the current-state merge of all releases." },
        { id: "versionedRelease", label: "versionedRelease — every field with a history of which release set it." },
        { id: "tender", label: "tender — a top-level tender block standing alone outside any release." },
      ],
      answers: ["compiledRelease", "versionedRelease"],
      correctFeedback: "Correct. The compiled and versioned releases are the two derived views a record can contain. 'releases' is the index (a list of pointers), not a derived view, and 'tender' only ever appears inside releases — it has no meaning at the record's top level.",
      retryFeedback: "Separate the index from the derived views: 'releases' is the list of pointers, while two other entries are the actual derived merges. A tender block does not stand alone at record scope.",
    },
  },
  "5-analyzed": {
    easy: {
      mode: "single",
      question: "A red-flag indicator fires. What does that mean?",
      options: [
        { id: "misconduct", label: "Misconduct has been proven." },
        { id: "review", label: "The process deserves contextual review." },
        { id: "invalid", label: "The data is invalid." },
      ],
      answer: "review",
      correctFeedback: "Correct. Indicators surface patterns for review, not legal conclusions.",
      retryFeedback: "A signal is a question, not a verdict.",
    },
    normal: {
      mode: "single",
      question: "A single-bid indicator raises a signal. What can you conclude?",
      options: [
        { id: "fraud", label: "Fraud has been proven." },
        { id: "invalid", label: "The contracting process is automatically invalid." },
        { id: "review", label: "The process merits contextual review; the signal is not a verdict." },
      ],
      answer: "review",
      correctFeedback: "Exactly. Structured indicators prioritize questions. Documents, rules, market context, and explanations are still needed.",
      retryFeedback: "Automated checks identify patterns, not intent or legal conclusions. What action should a signal prompt?",
    },
    hard: {
      mode: "single",
      question: "An indicator returns \"not assessable\". What does that mean?",
      options: [
        { id: "failed", label: "The indicator failed to run." },
        { id: "missing-data", label: "A required OCDS field is missing, so the check cannot be evaluated." },
        { id: "clean", label: "The process is automatically clean." },
      ],
      answer: "missing-data",
      correctFeedback: "Right. \"Not assessable\" is a publication-coverage signal, not a clean bill of health.",
      retryFeedback: "A \"not assessable\" result means the data needed to run the check is missing — that is itself information.",
    },
  },
};
