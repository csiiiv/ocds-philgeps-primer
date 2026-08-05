import { GLOSSARY } from "./glossary";
import { STATIONS } from "./stations";
import { STATION_TEACHING } from "./stationTeaching";
import { POSSIBLE_JOURNEYS } from "./possibleJourneys";
import { FIELD_TRACES } from "./fieldExplorer";

export interface SearchDocument { id: string; type: string; title: string; excerpt: string; url: string; text: string }

export const SEARCH_DOCUMENTS: SearchDocument[] = [
  ...STATIONS.map((station) => { const teaching = STATION_TEACHING[station.id]; const text = [station.blurb, teaching.framing, ...(teaching.callouts ?? []).flatMap((callout) => [callout.title, callout.body])].join(" "); return { id: station.id, type: "Journey station", title: station.title, excerpt: station.blurb, url: `/journey/${station.id}`, text }; }),
  ...POSSIBLE_JOURNEYS.map((journey) => ({ id: journey.id, type: "Possible journey", title: journey.title, excerpt: `${journey.shape} · ${journey.buyer}`, url: `/possible-journeys/${journey.id}`, text: [journey.why, journey.canAnalyze, journey.cannotAnalyze, journey.source, journey.ocid, journey.caution].filter(Boolean).join(" ") })),
  ...FIELD_TRACES.map((trace) => ({ id: trace.id, type: "Field trace", title: trace.sourceField, excerpt: trace.label, url: `/explore/fields?trace=${trace.id}`, text: `${trace.rule} ${trace.rationale} ${trace.caution ?? ""} ${trace.values.map((value) => `${value.ocdsPath} ${value.ocdsValue}`).join(" ")}` })),
  ...GLOSSARY.map((entry) => ({ id: entry.slug, type: "Glossary", title: entry.term, excerpt: entry.definition, url: `/glossary#${entry.slug}`, text: `${entry.category} ${entry.definition} ${(entry.related ?? []).join(" ")}` })),
  { id: "publication", type: "Chapter", title: "Publication & Portfolio", excerpt: "Combine seven audited current-state releases into one OCDS release package and drillable portfolio.", url: "/publication", text: "release package publisher published date portfolio awards contracts suppliers spending chronology" },
];

export function searchDocuments(query: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return SEARCH_DOCUMENTS.map((document) => {
    const title = document.title.toLowerCase();
    const haystack = `${document.title} ${document.excerpt} ${document.text}`.toLowerCase();
    if (!terms.every((term) => haystack.includes(term))) return null;
    const score = terms.reduce((total, term) => total + (title === term ? 20 : title.startsWith(term) ? 12 : title.includes(term) ? 8 : document.excerpt.toLowerCase().includes(term) ? 4 : 1), 0);
    return { document, score };
  }).filter((result): result is { document: SearchDocument; score: number } => result !== null).sort((a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title));
}
