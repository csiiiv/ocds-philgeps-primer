# Primer structure review

Date: October 27, 2026  
Status: Accepted restructuring implemented locally. The assessment below records the earlier baseline and the design decisions that guided this revision.

Scope: **Desktop first**, following the user's priority. Optimize the hierarchy and working layouts at 1440px, 1920px, and 2560px. Mobile redesign is deferred to a later pass; existing mobile behavior is background context for this assessment.

## Implementation record

- Four navigation sections with contextual child links; the introduction has one Start/Continue action and one follow-on sequence.
- Desktop replay: persistent event rail, compact Source → Release → Record summaries, optional timing settings, and a wide workspace with keyboard-accessible inspection and record tabs.
- Source snapshots, captured changes, private-note handling, pending publications, stale records, original release JSON, and all timing modes remain available. The latest relevant lifecycle fact appears in each state summary.
- Shared artifact selection replaces stacks of JSON/download controls. The record reuses readable compiled/versioned views, with an accurate source-release count and links to the actual replay publications.
- Mapping topics and existing deep links select the relevant content. Codelist teaching remains visible in Station 3; full definitions and exercises have one home in the guide, with one practice decision shown at a time.
- The lab uses Source → Mapping → Result views with side-by-side source/rule and result. Process-boundary comparisons live in the identifier topic; the old lab anchor redirects there.
- Workshop agenda, templates, and outputs are separate views. Exercise and checklist state survives switching local views.
- Desktop layout is targeted at 1440×900, 1920×1080, and 2560×1440. A basic stacked fallback is retained; mobile redesign remains deferred.

Validation: `npm run build` passed, including 18 data/schema/semantic checks and TypeScript. All 18 desktop browser checks passed, including the target window sizes, navigation and deep links, state preservation, exact release inspection, downloads, keyboard focus, and automated WCAG A/AA checks across the new views. Desktop screenshots were also inspected locally. No publication was performed.

## Overall assessment

The additions cover useful teaching requirements, but were assembled feature by feature without a corresponding revision to the site's hierarchy. Introductory lessons, implementation guidance, interactive inspection, and workshop logistics now compete for attention.

The next revision should consolidate and sequence the existing material. Keep the five-station introduction, visible codelist teaching, procurement replay, evolving source tables, per-release JSON inspection, relational lab, and workshop outputs. Give each a clear role and reveal technical detail when the learner chooses to inspect it.

## Evidence from the current implementation

Reviewed the route structure, sidebar, introductory stations, Mapping Guide, replay, solar-pump lab, workshop, and links to the existing example/publication pages. Inspected the local application in Chromium at desktop and mobile sizes, including the completed replay.

| Finding | Current evidence | Effect on the learner |
|---|---|---|
| Navigation has no useful grouping after the introductory stations | The sidebar contains 17 destination links, including five station links. It overflows a 1000px desktop viewport even on pages unrelated to the introductory journey. | A chapter, a specialist tool, and a reference page look equally important. |
| The home page has competing explanations of the learning path | Subway map, Start the journey, two new learning cards, complete learning arc, and stations-at-a-glance list. The new mapping/replay cards are absent from the stated four-part learning arc. | The learner has to decide whether the cards are prerequisites, alternatives, or next steps. |
| Introductory mapping has grown into an implementation chapter | Station 3 renders the mapper, four mapping-task cards, the codelist lesson and explorer, a mapping exercise, and a knowledge check. Four task cards and much of the codelist teaching also appear in the Mapping Guide. | It is difficult to finish the introduction without encountering specialist detail or repeating material. |
| The Mapping Guide does several jobs in one page | Release anatomy, four mapping tasks, classifications, codelist definitions and four exercises, shared structures, organization identity, and a validation workflow. Its section navigation does not correspond to the four mapping tasks it teaches. | Its purpose and completion point are unclear. |
| The replay has become an inspection dashboard | After eight events, the 1440px desktop state has 24 visible buttons and 12 disclosure controls. Tall source and record panels surround a shorter release panel. Tables and field lists introduce additional scrolling regions. | It is hard to see the essential change and choose the next action. |
| Mobile preserves desktop content order without prioritizing the comparison | In the completed replay at 390×844, the source panel is about 1040px tall and the record begins around page position 2364px. | The event, published release, and resulting record cannot be compared easily. |
| Inspection patterns vary | Station 4 uses record-view tabs and the shared inspector; the replay adds a release table, field list, disclosures, and four record artifact downloads; the lab stacks another set of artifacts. | The learner repeatedly learns a different way to inspect related objects. |
| Some implementation detail precedes the teaching action | Station 3 has four callouts before its mapper, including APP identity, fallback analysis, and publisher-prefix limitations. Field Explorer places six metadata rows before the concrete source-to-result values. | The example that would make the explanation understandable arrives late. |
| The relational lab combines separate exercises | Source joins, publication history, supplier alternatives, package inspection, and process-boundary scenarios occupy one page. | A learner tracing one foreign key encounters several unrelated decisions. |

Page lengths illustrate the current density: at 1440px wide, Station 3 is approximately 5667px, the Mapping Guide 5357px, the solar-pump lab 3772px, and Workshop 3923px. Length alone is not a defect; mixing distinct tasks without clear stopping points is the problem. These measurements are observations of the tested states, not usability-test results.

The existing browser and accessibility checks establish useful functional coverage. They do not establish that the learning sequence or visual hierarchy is understandable.

## Proposed site hierarchy

Use four primary sections. Show the active section's local navigation; keep other sections reachable through their section entries. The five stations should be visible while following the introduction, rather than permanently occupying the sidebar on every tool page. Do not hide the entire navigation behind collapsed groups.

| Primary section | Contents | Role |
|---|---|---|
| **Learn OCDS** | Five-station introduction; procurement replay; process examples; publication and portfolio | Understand the model, watch it change, then see how real data differs. |
| **Map data** | Mapping Guide; source-field traces; solar-pump lab | Apply the model to source systems, values, keys, and relationships. |
| **Workshop** | Learning agenda; preparation; templates; expected outputs | Provide a facilitated route through existing lessons and capture work outside the site. |
| **Reference** | Glossary; FAQ; official references; About | Look up definitions, evidence, limitations, and background. |

Keep current URLs working. Navigation labels and visual ownership can change without changing route names. Keep section anchors, field-trace query parameters, standalone release URLs, and existing bookmarks working.

Carry the same content hierarchy into the later mobile pass. This revision does not include a new mobile navigation or interaction layout.

## One primary job per page

| Existing surface | Primary job after revision | Content to move or simplify |
|---|---|---|
| Journey home | Explain the primer and recommend a starting point. | Keep the subway map and one Start/Continue action. Replace competing path summaries with a short “After the introduction” sequence. Provide a small Workshop shortcut for returning participants. |
| Stations 1–5 | Teach the minimum needed to follow one contracting process. | Use one worked example and one knowledge check per station. Move extended implementation policy into the relevant mapping/reference topic. |
| Station 3 | Show a source value becoming an OCDS field and code. | Retain a visible codelist example and the buyer/procuring-entity distinction. Replace the repeated task-card grid and full codelist explorer with a concise explanation and a contextual link to the full guide. |
| Station 4 | Explain the release index, compiled view, and versioned history. | Reuse its existing view-selection pattern. Keep raw record JSON available through inspection. Link to the replay as the application of these concepts. |
| Mapping Guide | Help a mapper work through fields, identifiers/relationships, codelists, and publication events. | Start with those four topics and their outputs. Make release anatomy and reusable structures supporting reference material, linked at the point of use. Show a selected topic rather than every exercise and reference table at once. |
| Field Explorer | Show one source value, its rule, and the resulting OCDS value. | Put the concrete transformation first. Put types, source version, cardinality, evidence, and review metadata in a clearly labelled detail area. Keep a short provenance/status label visible. |
| Solar-pump lab | Practice joining source entities into OCDS objects. | Present Source → Mapping → Result as a small exercise sequence. Reveal supplier variations when awards exist. Move the full process-boundary comparison to the identifier topic and link to it. |
| Workshop | Direct participants to the right exercise and worksheet at the right time. | Separate Learning path, Templates, and Outputs into local views. Keep detailed timings with the agenda. Present templates as a compact list rather than six large peer cards. |

The recommended introductory sequence is the five stations, then the replay, followed by process examples and publication/portfolio. Mapping is a separate practical route that can be entered directly by workshop participants. Completing every introductory quiz should not gate access to tools.

## Replay: overview first, one inspector for detail

Preserve the requested database overview and release buttons, while changing their presentation.

### Default view

1. A short title and a compact **Synthetic example** provenance label, with the full explanation available through Example details.
2. A small toolbar with Next event and Play/Pause. Keep Reset available as a secondary action. Put the independent publication and record timing selectors inside **Processing settings**. Keep pending-publication and stale-record indicators visible even when settings are closed.
3. A visible event position and a persistent, compact desktop event list beside the inspection workspace. Show the selected event, its time, and the main change.
4. Three compact summaries: **Source data → Published release → Generated record**. For the deadline amendment, show the source deadline changing, release 002 being published or pending, and the deadline in the latest generated record.
5. One inspection workspace below the summaries, with **Source tables**, **Release**, and **Record** views. Each view has room for its content without squeezing a wide table into a narrow card.

On desktop, keep the three summaries side by side and use the remaining width for the selected inspector. Switching views must retain the replay state. Plan the mobile presentation separately after the desktop layout is settled.

### Desktop layout priorities

- Use a compact global sidebar, approximately 220–240px where labels permit. Put section/topic navigation in the relevant context instead of filling the global sidebar with every station and tool.
- Keep the replay's title, provenance label, and toolbar compact enough for the primary action and state comparison to appear in the first viewport.
- Place an approximately 200–240px event list beside a flexible inspection area. The event list stays available while inspecting the current step; it should not require expanding a disclosure each time.
- Give the selected table or record most of the working width. The current 1440px layout gives its three full-height panels approximately 280px, 329px, and 445px; the narrow source panel is particularly unsuitable for database columns.
- Use the three columns for compact summaries. Put detailed tables, release history, metadata, and artifact viewing in the larger workspace below them. This also removes the large empty area under the shorter published-release card.
- Use extra width at 1920px and 2560px for source/result comparisons and readable table columns. Keep explanatory prose around 70–80 characters per line.
- Reduce nested scrolling. Prefer one main detail area, with a bounded scroll area for raw JSON when necessary. Keep the context and primary controls available during inspection.
- On mapping pages, use a local topic list alongside the chosen lesson/example. In the lab, show the relevant source and OCDS result beside each other when space permits.
- Check window height as well as width: use 1440×900, 1920×1080, and 2560×1440 as the primary review sizes. Avoid layouts that only work in unusually tall browser windows.

### Where the current features go

| Current feature | Proposed location |
|---|---|
| Database table counts | Compact source summary; complete inventory in Source tables. |
| Source rows, keys, joins, before/after values | Source tables inspection view. |
| Private note example | Source summary says “Internal note changed; no public update.” The row remains inspectable. |
| Current release metadata and content | Release inspection view, using the existing readable/JSON inspector conventions. |
| Latest generated record | Record inspection view defaults to a readable current-state summary. |
| Release index and per-release View JSON buttons | Record's Release history view. Each button opens the exact archived release, as it does now. |
| Compiled and versioned JSON | Artifact choices in the record inspector, with their meanings stated. |
| Long field-by-field differences | Change details under the short explanation of the main change. |
| Package JSON and repeated download buttons | One labelled artifact selector and View/Download actions for the selected artifact. |
| Captured event log and source snapshot export | Source details and source artifact choices. |
| Timing-model explanation | Processing settings, with a contextual link to event/release mapping. |

Keep synthetic provenance visible. Move the longer explanation, rather than repeating it in every panel. Keep actual data-quality warnings next to the affected data.

Make temporal context explicit across views: historical inspection concerns the selected event, while the latest generated record may cover later publications. Retain the current Return to latest event action and label the record's coverage. Do not silently rewind or regenerate the record when changing inspection views.

## Consolidate repeated teaching and presentation

- Give full codelist teaching and exercises one home in the Mapping Guide. Keep a short introduction and a concrete code example in Station 3; deliberate reinforcement in a knowledge check remains useful.
- Teach release anatomy in the introductory record lesson. Offer the complete property reference on demand from mapping topics.
- Keep the DENR example for the basic lifecycle and replay. Use the solar-pump example for relational mapping and multiple objects. Use audited source examples to explain observed data and its limits.
- Keep process-boundary policy in the identifier/relationship topic. Link to it from the lab and process examples.
- Reuse the existing record views and shared release inspector before adding another inspection pattern. Put JSON viewing and downloads behind a consistent artifact selection.
- Establish a common lesson layout: purpose, one example/action, what to notice, optional detail, and the next step. Avoid putting several large advisory boxes before the first example.
- Preserve desktop width for comparisons and tables. Retain bounded prose and use intentional full-width interactive areas within lessons; reducing every page to a narrow column would undermine the useful desktop improvements.

## Implementation order

1. **Navigation and home:** establish the four sections, contextual station navigation, consistent labels, and a single recommended introduction. Preserve routes and section links.
2. **Replay layout:** separate compact state summaries from inspection; consolidate artifacts and move timing controls into settings. Preserve all timing, history, private-note, and record semantics.
3. **Introductory lessons and Mapping Guide:** assign each topic a clear home, trim duplicated rendering, and make mapping topics independently navigable. Keep codelists visible in the introduction.
4. **Lab and workshop:** introduce exercise steps and compact template/output views. Preserve the fictional-source labels and distinction between demonstration and approved mapping.
5. **Consistency and validation:** align inspection patterns, contextual links, typography, empty states, and desktop behavior. Update browser tests to verify the revised experience. Schedule mobile layout and interaction work separately.

Avoid a large route rewrite or additional top-level destinations as part of this cleanup. Extract focused presentation components where it helps maintain the hierarchy; the data modules and replay state logic can largely remain.

## Acceptance criteria

- A new visitor sees one recommended starting action and can tell how the replay and mapping practice relate to the introduction.
- The sidebar distinguishes learning, mapping, workshop, and reference material. Station links no longer occupy unrelated sections.
- Advancing an event makes the principal source/publication/record change understandable without opening raw JSON.
- At the target desktop sizes, the three replay summaries remain visible together in the first viewport, along with the primary action. The event list and detail workspace make good use of the remaining width.
- Detailed tables can use the available workspace. Long raw JSON and audit history remain optional.
- Per-release JSON inspection, source snapshots, record views, package exports, and all timing modes remain reachable and retain their current semantics.
- A stale record, private source update, missing delivery date, and historical event each have clear contextual labels.
- Topic navigation and all retained deep links open the relevant content. Tabs/disclosures work by keyboard; inspectors retain Escape handling and focus restoration.
- Existing schema/semantic checks still pass. Browser checks cover revised navigation, task flow, state preservation, target desktop widths/heights, and active-inspector accessibility. Mobile redesign and dedicated mobile optimization are deferred.
- A short manual walkthrough can complete three tasks: explain the deadline amendment, inspect release 001 from the record, and find the codelist worksheet. Use the walkthrough to assess comprehension in addition to automated checks.
