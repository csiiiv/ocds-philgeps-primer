import { GLOSSARY } from "./glossary";
import { STATIONS } from "./stations";
import { STATION_TEACHING } from "./stationTeaching";
import { POSSIBLE_JOURNEYS } from "./possibleJourneys";
import { FIELD_TRACES } from "./fieldExplorer";
import { FAQ_SECTIONS } from "./faq";
import { CODELISTS, CODELIST_QUESTIONS, MAPPING_AREAS, RELEASE_ANATOMY, SHARED_STRUCTURES } from "./mappingGuide";
import { PROCESS_SCENARIOS, SOLAR_TRACES } from "./solarLab";
import { WORKSHOP_LESSONS, WORKSHOP_TEMPLATES } from "./workshop";

export interface SearchDocument { id: string; type: string; title: string; excerpt: string; url: string; text: string }

export const SEARCH_DOCUMENTS: SearchDocument[] = [
  ...MAPPING_AREAS.map((area) => ({ id: `mapping-${area.id}`, type: "Mapping guide", title: area.title, excerpt: area.question, url: `/mapping#${area.id}`, text: `${area.example} ${area.output}` })),
  { id: "release-anatomy", type: "Mapping guide", title: "Inside a release", excerpt: "Metadata, lifecycle objects, parties, and references.", url: "/mapping#anatomy", text: RELEASE_ANATOMY.map((entry) => `${entry.path} ${entry.meaning}`).join(" ") },
  ...SHARED_STRUCTURES.map((entry) => ({ id: `structure-${entry.name}`, type: "Shared structure", title: entry.name, excerpt: entry.lesson, url: "/mapping#structures", text: `${entry.path} ${entry.lesson}` })),
  ...CODELISTS.map((entry) => ({ id: `codelist-${entry.id}`, type: "Codelist", title: entry.title, excerpt: entry.note, url: "/mapping#codelists", text: `${entry.path} ${entry.open ? "open" : "closed"} ${entry.codes.join(" ")}` })),
  ...CODELIST_QUESTIONS.map((entry) => ({ id: `practice-${entry.id}`, type: "Mapping exercise", title: entry.source, excerpt: entry.meaning, url: "/mapping#codelist-practice", text: `${entry.path} unresolved clarification` })),
  ...SOLAR_TRACES.map((entry) => ({ id: `solar-${entry.id}`, type: "Fictional mapping lab", title: entry.title, excerpt: entry.join, url: "/mapping/solar-pumps#mapping-trace", text: `${entry.source} ${entry.destination} ${entry.rule}` })),
  ...PROCESS_SCENARIOS.map((entry) => ({ id: `boundary-${entry.id}`, type: "Process relationship", title: entry.title, excerpt: entry.policy, url: "/mapping#process-boundaries", text: JSON.stringify(entry.links) })),
  { id: "simulation", type: "Interactive replay", title: "Watch a procurement unfold", excerpt: "Inspect changing source database rows, publish immutable releases, and generate the record.", url: "/simulation", text: "database source tables rows snapshots primary foreign keys tenders organizations tenderers amendments awards contracts deliveries internal notes event driven scheduled on demand release triggers captured events publication time record generation compiled versioned retained values private draft change audit history" },
  { id: "workshop", type: "Workshop", title: "PhilGEPS–OCDS mapping workshop", excerpt: "Guided learning path, OCDS Mapping Explorer, and downloadable Excel mapping workbooks.", url: "/workshop", text: [...WORKSHOP_LESSONS.map((entry) => `${entry.title} ${entry.exercise} ${entry.output}`), ...WORKSHOP_TEMPLATES.map((entry) => `${entry.title} ${entry.purpose}`)].join(" ") },
  ...STATIONS.map((station) => { const teaching = STATION_TEACHING[station.id]; const text = [station.blurb, teaching.framing, ...(teaching.callouts ?? []).flatMap((callout) => [callout.title, callout.body])].join(" "); return { id: station.id, type: "Journey station", title: station.title, excerpt: station.blurb, url: `/journey/${station.id}`, text }; }),
  ...POSSIBLE_JOURNEYS.map((journey) => ({ id: journey.id, type: "Possible journey", title: journey.title, excerpt: `${journey.shape} · ${journey.buyer}`, url: `/possible-journeys/${journey.id}`, text: [journey.why, journey.canAnalyze, journey.cannotAnalyze, journey.source, journey.ocid, journey.caution].filter(Boolean).join(" ") })),
  ...FIELD_TRACES.map((trace) => ({ id: trace.id, type: "Field trace", title: trace.sourceField, excerpt: trace.label, url: `/explore/fields?trace=${trace.id}`, text: `${trace.rule} ${trace.rationale} ${trace.caution ?? ""} ${trace.values.map((value) => `${value.ocdsPath} ${value.ocdsValue}`).join(" ")}` })),
  ...GLOSSARY.map((entry) => ({ id: entry.slug, type: "Glossary", title: entry.term, excerpt: entry.definition, url: `/glossary#${entry.slug}`, text: `${entry.category} ${entry.definition} ${(entry.related ?? []).join(" ")}` })),
  ...FAQ_SECTIONS.flatMap((section) => section.entries.map((entry) => ({ id: `faq-${entry.slug}`, type: "FAQ", title: entry.question, excerpt: entry.answer, url: `/faq#${entry.slug}`, text: entry.answer }))),
  { id: "publication", type: "Chapter", title: "Publication & Portfolio", excerpt: "Combine seven audited current-state releases into one OCDS release package and drillable portfolio.", url: "/publication", text: "release package publisher published date portfolio awards contracts suppliers spending chronology" },
];

export function searchDocuments(query: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return SEARCH_DOCUMENTS.map((document) => {
    const title = document.title.toLowerCase();
    const haystack = `${document.type} ${document.title} ${document.excerpt} ${document.text}`.toLowerCase();
    if (!terms.every((term) => haystack.includes(term))) return null;
    const score = terms.reduce((total, term) => total + (title === term ? 20 : title.startsWith(term) ? 12 : title.includes(term) ? 8 : document.excerpt.toLowerCase().includes(term) ? 4 : 1), 0);
    return { document, score };
  }).filter((result): result is { document: SearchDocument; score: number } => result !== null).sort((a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title));
}
