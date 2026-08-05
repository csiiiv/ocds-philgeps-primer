import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchDocuments } from "../content/searchIndex";

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [input, setInput] = useState(initial);
  const query = params.get("q") ?? "";
  const results = searchDocuments(query);
  const submit = (event: FormEvent) => { event.preventDefault(); setParams(input.trim() ? { q: input.trim() } : {}); };
  return <>
    <p className="eyebrow">Search</p><h1>Search the Primer</h1>
    <form className="search-page-form" onSubmit={submit}><input type="search" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Search concepts, fields, examples, or OCDS paths" autoFocus /><button type="submit">Search</button></form>
    {query ? <><p className="gallery-count">{results.length} result{results.length === 1 ? "" : "s"} for “{query}”</p><ol className="search-results">{results.map(({ document }) => <li key={`${document.type}-${document.id}`}><span>{document.type}</span><h2><Link to={document.url}>{document.title}</Link></h2><p>{document.excerpt}</p></li>)}</ol>{!results.length && <div className="empty-search"><strong>No matching content</strong><p>Try fewer words, an OCDS path such as <code>awardID</code>, or browse the <Link to="/glossary">glossary</Link>.</p></div>}</> : <div className="search-suggestions"><strong>Try searching for</strong><div>{["OCID", "compiled release", "multiple awards", "contract amount", "publication gap"].map((term) => <button type="button" key={term} onClick={() => { setInput(term); setParams({ q: term }); }}>{term}</button>)}</div></div>}
  </>;
}
