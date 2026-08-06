/**
 * FAQ content for the `/faq` page.
 *
 * Authored as structured data so each question becomes a deep-linkable
 * (`#slug`) entry and feeds the sidebar search index. Wording mirrors the
 * voice in `01_goals_and_audience.md` (plain, second-person) and stays
 * consistent with the decisions recorded in `00_planning_index.md`. The
 * Markdown draft lives at `15_faq.md`; this module is the promoted, rendered
 * version.
 */

export interface FaqEntry {
  /** Stable anchor slug used in `#slug` deep links and search URLs. */
  slug: string;
  question: string;
  /** Plain-text answer. A single sentence or short paragraph. */
  answer: string;
}

export interface FaqSection {
  id: string;
  title: string;
  entries: FaqEntry[];
}

export const FAQ_SECTIONS: FaqSection[] = [
  {
    id: "about-the-primer",
    title: "About the primer",
    entries: [
      {
        slug: "what-is-this-site",
        question: "What is this site?",
        answer:
          "An interactive teaching website for the Open Contracting Data Standard (OCDS). It follows one contracting process from a real-world event — a procurement need — through extraction and mapping, into OCDS releases and a record, and on to red-flag analysis. Later chapters contrast that journey with audited real source-row shapes and assemble several processes into a publication and portfolio view. The goal is a mental model: what an OCDS dataset is, why it is shaped the way it is, and what that shape lets you see that a flat export hides.",
      },
      {
        slug: "who-is-it-for",
        question: "Who is it for?",
        answer:
          "People who need to understand an OCDS dataset — analysts at CSOs, newsrooms, and government audit units; developers integrating a publishing pipeline; and anyone preparing to map, publish, or audit contracting data. It assumes comfort with spreadsheets and reading JSON, not programming. It is not written for OCDS experts, or for people who need to publish data today.",
      },
      {
        slug: "how-is-this-different-from-the-official-docs",
        question: "How is this different from the official OCDS documentation and primer?",
        answer:
          "The official OCDS documentation and primer are authoritative and formal. This primer is complementary: more interactive, more scenario-driven, and built around this project's PhilGEPS material as its worked example. Wherever a formal definition exists, this site links out to it rather than restating it. The release/record/compiled/versioned distinction specifically follows How is OCDS data published? (releases and records).",
      },
      {
        slug: "is-the-data-real",
        question: "Is the data real?",
        answer:
          "The first journey uses clearly labelled synthetic data — a designed teaching example chosen to exercise the core concepts cleanly. Later chapters (Possible Journeys, Publication & Portfolio) use audited transformations of real source rows, preserved beside their results. Each fixture is honest about what the source exposes: real-world chapters present one reconstructed current-state release per process, never a fabricated release history.",
      },
      {
        slug: "is-this-an-official-publication",
        question: "Is this an official publication?",
        answer:
          "No. This is an organization-neutral proof of concept. It has no designated owner, publisher, or public deployment target. Example publication metadata is visibly synthetic — the generated release package uses a deterministic, non-resolving urn:uuid: and a generic local POC publisher name. A future production publisher must supply and control its own persistent package URI, registered OCID prefix, license, publication policy, and hosting location.",
      },
    ],
  },
  {
    id: "the-mental-model",
    title: "The mental model",
    entries: [
      {
        slug: "what-is-a-contracting-process",
        question: "What is a contracting process?",
        answer:
          "A single instance of buying something — from the procurement need, through tender, award, contract, and implementation, until it is complete. OCDS models this as a lifecycle rather than a single event, because most integrity-relevant questions span several stages.",
      },
      {
        slug: "release-vs-record",
        question: "What is the difference between a release, a record, a compiled release, and a versioned release?",
        answer:
          "A release is a snapshot of what was known about a process at one moment — a tender notice, an award notice, a contract signature. Each release is immutable once published. A record indexes all of a process's releases under one ocid and may add derived views. A compiled release is the current-state view: everything known so far, merged together. A versioned release is the per-field change history: for each value, which release set it and when. One ocid groups many releases; the record ties them together. Station 4 shows all three views side by side, because the record is the conceptual centrepiece of OCDS.",
      },
      {
        slug: "what-is-an-ocid",
        question: "What is an ocid, and why does it matter?",
        answer:
          "The ocid is the OCDS process boundary — the globally unique identifier for one contracting process, shared by every release in that process. It is generated by combining a registered prefix with the publisher's best stable internal process identifier. OCDS requires the publisher's best stable internal process identifier; it does not prescribe which field that is. In the PhilGEPS exports currently available, bid_reference_no is the strongest observed tender-stage key, so the teaching example uses it — but that is an evidence-led observation about this data, not a universal rule.",
      },
      {
        slug: "ocid-vs-tender-id",
        question: "What is the difference between ocid and tender.id?",
        answer:
          "This is the most common mapping bug. They are different identifier layers. ocid identifies the whole process (shared by every release). tender.id is the human-readable reference for the tender inside that process — the number the buyer knows the solicitation by. In the teaching example the same source value (bid_reference_no) legitimately populates both: combined with a prefix it becomes the ocid; carried verbatim it becomes tender.id. Station 3's hard mapping question teaches this fan-out explicitly.",
      },
      {
        slug: "what-is-a-release-package",
        question: "What is a release package, and what must it contain?",
        answer:
          "A release package is the container that bundles releases together for publication. It must carry five required fields — uri, version, publishedDate, publisher, and releases[] — and the individual releases go inside releases[]. The Publication & Portfolio chapter assembles one from the worked examples so you can see the container and its contents together.",
      },
    ],
  },
  {
    id: "using-the-site",
    title: "Using the site",
    entries: [
      {
        slug: "do-i-need-to-code",
        question: "Do I need to know how to code?",
        answer:
          "No. The primer assumes comfort with spreadsheets and reading JSON, not programming. Interactive lenses let you click through the data; nothing requires you to write code.",
      },
      {
        slug: "what-order",
        question: "What order should I go in?",
        answer:
          "The designed path is: (1) The journey — five stations in order: Event, Extraction, Mapping to OCDS, Record, Indicators and Red Flags. (2) Possible Journeys — compare cancelled, incomplete, retendered, and other real-world process shapes against the tidy introductory one. (3) Publication & Portfolio — see many processes assembled into a publication and analysed as a portfolio. (4) Field Explorer (optional, intermediate) — follow a single source field end to end after the mental model is secure. The sidebar groups the journey's stations by phase with colour-coded rails that mirror the subway diagram.",
      },
      {
        slug: "progress-tracking",
        question: "How does progress tracking work, and where is it stored?",
        answer:
          "Each station has a short knowledge check at three difficulty tiers (easy, normal, hard). A station counts as passed only when all three difficulties are answered correctly. Progress is stored in your browser's localStorage — there is no account, no backend, and no analytics. Clearing your browser storage, or using a private/incognito window, resets progress. If your browser blocks local storage, the checks still work but progress will not persist between visits.",
      },
      {
        slug: "multi-select-questions",
        question: "Why do some questions ask for more than one answer?",
        answer:
          "Because OCDS genuinely fans out: one source value can legitimately populate several fields. For example, the buyer name has to appear in buyer.name, the matching parties[] entry, and be cross-referenced by tender.procuringEntity. The hard tiers of some checks are multi-select to teach this reality — you select every correct destination, and the exact correct set is required.",
      },
      {
        slug: "deep-links",
        question: "Can I link directly to a specific release or process?",
        answer:
          "Yes. Several views are deep-linkable: the Station 4 release route, individual Possible Journeys (with #timeline / #record anchors), and the Publication inspector (via ?inspect=N, with ?cohort=signals to filter by indicator signals). Under the hood the site uses hash-based routing, so refreshes and direct links always work on GitHub Pages.",
      },
    ],
  },
  {
    id: "the-data-and-the-standard",
    title: "The data and the standard",
    entries: [
      {
        slug: "which-ocds-version",
        question: "Which version of OCDS does this use?",
        answer:
          "OCDS 1.1.5, the version exposed by the official latest documentation. The site does not cover OCDS 1.2 while it remains draft. All teaching fixtures are validated against the canonical release, versioned-release, release-package, and record-package schemas at build time.",
      },
      {
        slug: "what-are-indicators",
        question: "What are red-flag indicators, and are they accusations?",
        answer:
          "No. An indicator is an illustrative check that turns structured OCDS fields into a question for review — for example, a single bidder, a very short tender period, or an award with no corresponding contract. A signal is the pattern being flagged; it is a prompt to look closer, not a verdict of fraud, wrongdoing, or poor value. Reviewers still need procurement documents, applicable rules, market context, and an explanation from the buyer before drawing any conclusion. The primer's five indicators are a teaching subset, not the full OCDS red-flag catalogue.",
      },
      {
        slug: "why-award-without-contract",
        question: 'Why does an "active award with no contract" matter?',
        answer:
          "Because it is a machine-detectable signal that flat exports hide. In a spreadsheet, a blank contract-amount cell is just a blank cell. In OCDS, an active award with no entry in contracts[] referencing it is structurally visible — and it blocks downstream indicators (like award-without-contract) that depend on that linkage. OCDS makes data gaps visible where flat exports conceal them; that visibility is one of the standard's main advantages.",
      },
      {
        slug: "how-examples-chosen",
        question: "How are the real-world examples chosen?",
        answer:
          "Process shapes are chosen for teaching, not as a statistical sample. Possible Journeys deliberately includes single-row, multi-item, multi-award, cancelled, incomplete, long-span, and chronology-anomaly shapes so learners see the variety they will meet in real data. The percentages in the catalogue are contextual, not population estimates of Philippine procurement.",
      },
    ],
  },
  {
    id: "building-on-the-primer",
    title: "Building on the primer",
    entries: [
      {
        slug: "i-need-to-publish",
        question: "I need to publish OCDS data — where do I go?",
        answer:
          "This primer teaches the journey; it does not publish data. For hands-on mapping work, use the mapping tools referenced from the official documentation. For the formal standard, publisher guidance, and validation tools (CoVE, the Data Review Tool), start at the official OCDS documentation.",
      },
      {
        slug: "reuse",
        question: "Can I reuse or adapt this material?",
        answer:
          "The primer is an open proof of concept. For reuse, licensing, or adaptation, contact the project maintainers and review the references cited on the About and Reference index pages. A future production publisher must supply and control its own persistent package URI, registered OCID prefix, license, and publication policy.",
      },
      {
        slug: "missing-content",
        question: "The site doesn't cover something I expected. Where do I look next?",
        answer:
          "Try the Glossary for term definitions, the Reference index for the authoritative sources this primer cites, or the sidebar search for a term across all chapters. If a concept is genuinely missing, it may be deferred to a later phase — the roadmap lives in 06_roadmap_and_phases.md.",
      },
      {
        slug: "how-built",
        question: "How is the site built?",
        answer:
          "A static React + Vite + TypeScript application. Markdown-driven content keeps non-developers able to edit lessons; interactive station lenses are embedded where the journey needs them. There is no backend, no authentication, and no analytics. The build validates every example against the canonical OCDS schemas plus semantic assertions for chronology, party introduction, and implementation semantics, so a broken fixture cannot ship.",
      },
    ],
  },
];
