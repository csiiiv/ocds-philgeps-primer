import templateFiles from "../../../templates/workshop-templates.json";

export const WORKSHOP_LESSONS = [
  { time: "11:00–11:20", title: "Introductions and alignment", output: "Shared objectives, known source systems, and named technical counterparts.", to: "/workshop#outputs", action: "Prepare the output checklist", exercise: "Identify the source owner, mapper, reviewer, and person resolving business definitions. Do not infer responsibilities from organization names." },
  { time: "11:20–12:00", title: "OCDS refresher", output: "Shared understanding of OCIDs, publications, records, and their contents.", to: "/simulation", action: "Replay the procurement story", exercise: "Advance through the deadline amendment. Compare the new release with the compiled and versioned views. Explain which dates describe events versus publication." },
  { time: "12:00–12:30", title: "Introduction to field-level mapping", output: "A repeatable method for fields, identifiers, codelists, and publication events.", to: "/mapping", action: "Open the Mapping Guide", exercise: "Classify one direct mapping, one derived identifier, one transformed value, and one unresolved field." },
  { time: "12:30–13:30", title: "Lunch break", output: "", to: "", action: "", exercise: "" },
  { time: "13:30–14:15", title: "Understand the source data", output: "Source versions, schema, tables, keys, row grain, and available history.", to: "/explore/fields", action: "Inspect audited export traces", exercise: "Ask PhilGEPS/eBiz to identify the actual buyer, supplier, item, award, and contract tables. The lab's fictional tables do not establish a production mapping." },
  { time: "14:15–15:15", title: "Hands-on mapping", output: "A small end-to-end example with generated JSON, joins, and documented assumptions.", to: "/mapping/solar-pumps", action: "Work through the solar-pump lab", exercise: "Trace a party reference, a unit/classification join, an item-to-lot link, and a contract-to-award link. Then substitute a suitable actual source sample and test the proposed mappings." },
  { time: "15:15–15:30", title: "Short break", output: "", to: "", action: "", exercise: "" },
  { time: "15:30–16:15", title: "Codelist mapping and open issues", output: "Initial crosswalks and a consolidated list of questions for review.", to: "/mapping#codelist-practice", action: "Try the codelist exercises", exercise: "Compare source definitions with OCDS code definitions. Record rationale and mark unresolved mappings instead of forcing a match." },
  { time: "16:15–16:45", title: "Workplan and responsibilities", output: "Owners, dependencies, review steps, and agreed milestones.", to: "/workshop#templates", action: "Download review templates", exercise: "Review the existing October 31 mapping target against known blockers; record realistic milestones agreed by the participants." },
  { time: "16:45–17:00", title: "Recap and next steps", output: "Immediate deliverables, owners, due dates, and the next review session.", to: "/workshop#outputs", action: "Review the outputs", exercise: "Confirm what was mapped, what remains provisional, who will resolve each question, and when the example will be reviewed again." },
];

export const WORKSHOP_TEMPLATES = templateFiles;

export const MAPPING_EXPLORER_URL = "https://csiiiv.github.io/ocds_mapping_explorer/";

export const WORKSHOP_OUTPUTS = [
  "Technical counterparts and actual source systems identified",
  "A manageable source sample with known grain and relationships selected",
  "Initial field, identifier, codelist, and event/release mappings documented",
  "Generated release/package checked for schema validity and correct relationships",
  "Assumptions and unresolved questions assigned owners and next actions",
  "A repeatable review process and realistic milestones agreed",
];
