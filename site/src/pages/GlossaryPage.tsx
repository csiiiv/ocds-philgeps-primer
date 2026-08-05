import { useState } from "react";
import { GLOSSARY, GLOSSARY_CATEGORIES, type GlossaryCategory } from "../content/glossary";

export function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | GlossaryCategory>("All");
  const normalized = query.toLowerCase().trim();
  const entries = GLOSSARY.filter((entry) => (category === "All" || entry.category === category) && (!normalized || `${entry.term} ${entry.definition} ${entry.category}`.toLowerCase().includes(normalized)));
  return <>
    <p className="eyebrow">Reference</p><h1>Glossary</h1>
    <p className="lede">Definitions use the meaning taught by this primer and distinguish standard OCDS concepts from local proof-of-concept terminology.</p>
    <div className="glossary-controls"><label><span>Find a term</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. release, OCID, provenance" /></label><label><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value as "All" | GlossaryCategory)}><option>All</option>{GLOSSARY_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label></div>
    <p className="gallery-count" aria-live="polite">Showing {entries.length} of {GLOSSARY.length} terms</p>
    <dl className="glossary-list">{entries.map((entry) => <div key={entry.slug} id={entry.slug}><dt><a href={`#${entry.slug}`}>{entry.term}</a><span>{entry.category}</span></dt><dd>{entry.definition}</dd></div>)}</dl>
    {!entries.length && <p className="empty-search">No glossary terms match this filter.</p>}
  </>;
}
