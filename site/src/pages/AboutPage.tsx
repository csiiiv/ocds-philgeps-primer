import { Link } from "react-router-dom";
import { REFERENCE_SCOPE_LABELS, CANONICAL_REFERENCES } from "../content/canonicalReferences";

export function AboutPage() {
  const ocdsVersion = "1.1.5";
  return (
    <>
      <p className="eyebrow">About</p>
      <h1>About this primer</h1>
      <p className="lede">
        An interactive teaching website for the Open Contracting Data Standard (OCDS). The primer follows one contracting process from a real-world event, through extraction and mapping, into OCDS releases and a record, and on to red-flag analysis. Later chapters contrast that journey with audited real source-row shapes and assemble them into a publication and portfolio view.
      </p>

      <section>
        <h2>Project identity</h2>
        <p>
          This is an organization-neutral proof of concept. No directory name, file path, or internal label establishes an owner, publisher, public website, repository, deployment target, or package namespace. The first journey uses clearly labelled synthetic data; later chapters use audited transformations of real source rows preserved beside their results.
        </p>
        <ul className="about-bullets">
          <li>Do not construct URLs, publisher names, repository links, package scopes, or organizational affiliations from directory names.</li>
          <li>Links to external material point to verified, authoritative sources. Local artifacts use relative paths.</li>
          <li>Example publication metadata is visibly synthetic. The generated release package uses a deterministic, non-resolving <code>urn:uuid:</code> and a generic local POC publisher name.</li>
          <li>A future production publisher must supply and control its own persistent package URI, registered OCID prefix, license, publication policy, and hosting location.</li>
        </ul>
      </section>

      <section>
        <h2>Standards and versions</h2>
        <p>
          Examples and canonical schemas are pinned to OCDS <strong>{ocdsVersion}</strong>, the version exposed by the official <em>latest</em> documentation. The site does not cover OCDS 1.2 while it remains draft.
        </p>
        <p>
          The teaching record model teaches incremental publishing with a full event history as the single canonical model. Real-world fixtures are honest about what the source exposes: each is one reconstructed current-state release, never a fabricated release history.
        </p>
      </section>

      <section>
        <h2>What this primer is not</h2>
        <ul className="about-bullets">
          <li>It does not replace the <a href="https://standard.open-contracting.org/latest/en/">official OCDS documentation</a>; it links to it.</li>
          <li>It is a teaching site, not a data-publication tool or validator. For hands-on mapping and validation, use the tools linked from the official documentation.</li>
          <li>It is not a general OCDS merge implementation. The custom merge subset handles the base-schema structures exercised by the synthetic fixture and is not extension-aware.</li>
          <li>It is not a statistical sample of Philippine procurement. Process shapes are chosen for teaching; their percentages in the catalogue are contextual, not population estimates.</li>
        </ul>
      </section>

      <section>
        <h2>How it was built</h2>
        <p>
          The site is a static React + Vite + TypeScript application. Markdown-driven content keeps non-developers able to edit lessons; interactive station lenses are embedded where the journey needs them. There is no backend, no authentication, and no analytics. The build validates every example against the canonical OCDS release, versioned-release, release-package, and record-package schemas, plus semantic assertions for chronology, party introduction, and implementation semantics.
        </p>
      </section>

      <section>
        <h2>Find the source</h2>
        <p>
          The first chapter's flagship example is <code>examples/denr-r7-laptops-2024.json</code>; later chapters read <code>examples/poc_etl/</code>. The reference index below lists every authoritative source this primer cites.
        </p>
        <p>
          <Link className="eyebrow-link" to="/reference">Browse the reference index →</Link>
        </p>
      </section>

      <section>
        <h2>Authoritative references cited</h2>
        <p className="gallery-count">{CANONICAL_REFERENCES.length} sources</p>
        <ul className="reference-compact-list">
          {CANONICAL_REFERENCES.map((reference) => (
            <li key={reference.id}>
              <a href={reference.url}>{reference.title}</a>
              <span>{REFERENCE_SCOPE_LABELS[reference.scope]}{reference.publisher ? ` · ${reference.publisher}` : ""}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
