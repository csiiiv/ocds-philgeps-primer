import { useState } from "react";
import { FAQ_SECTIONS } from "../content/faq";

/**
 * The FAQ page, styled to match the About page: plain section headings and
 * prose, no cards. Each section is an `<h2>`; each question is an `<h3>` with
 * a stable `#slug` anchor (deep-linkable, with `scroll-margin-top` so anchored
 * links aren't hidden under any sticky header) and the answer follows as a
 * normal paragraph. A lightweight in-page filter narrows by question or
 * answer text.
 */
export function FAQPage() {
  const [query, setQuery] = useState("");
  const normalized = query.toLowerCase().trim();

  const visibleSections = FAQ_SECTIONS.map((section) => ({
    ...section,
    entries: section.entries.filter(
      (entry) =>
        !normalized ||
        `${entry.question} ${entry.answer}`.toLowerCase().includes(normalized)
    ),
  })).filter((section) => section.entries.length > 0);

  const totalVisible = visibleSections.reduce((sum, s) => sum + s.entries.length, 0);
  const totalEntries = FAQ_SECTIONS.reduce((sum, s) => sum + s.entries.length, 0);

  return (
    <>
      <p className="eyebrow">Help</p>
      <h1>Frequently asked questions</h1>
      <p className="lede">
        Quick answers about the primer, the mental model it teaches, how the site works, the data behind it, and where to go next.
      </p>

      <div className="faq-controls">
        <label>
          <span>Find</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. release, OCID, progress"
          />
        </label>
      </div>

      <p className="gallery-count" aria-live="polite">
        Showing {totalVisible} of {totalEntries} answers
      </p>

      {visibleSections.length > 0 ? (
        <>
          {visibleSections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2>{section.title}</h2>
              {section.entries.map((entry) => (
                <div className="faq__entry" key={entry.slug} id={entry.slug}>
                  <h3>
                    <a href={`#${entry.slug}`} className="faq__anchor" aria-label={`Link to: ${entry.question}`}>
                      #
                    </a>
                    {entry.question}
                  </h3>
                  <p>{entry.answer}</p>
                </div>
              ))}
            </section>
          ))}
        </>
      ) : (
        <p className="empty-search">No questions match this filter.</p>
      )}
    </>
  );
}
