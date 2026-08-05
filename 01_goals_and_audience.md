# 01 — Goals and Audience

**Question:** Who is the primer for, and what should they be able to do after using it?

---

## Why this document comes first

Every other planning decision — tone, depth, tech stack, interactivity — depends on who we are teaching and what "success" looks like for them. Nailing the audience first prevents the primer from becoming a second official docs site (which already exists and we should not duplicate).

---

## The audience

OCDS has a famously wide readership. We cannot serve all of them equally in a single linear experience, so the plan is to pick a **primary** persona to design the spine around, and treat others as secondary layers.

### Primary persona — "Mai, the procurement analyst"

- Works at a CSO, newsroom, or government audit unit in a country adopting OCDS.
- Comfortable with spreadsheets and JSON at a reading level; not a developer.
- Needs to *understand* what an OCDS dataset is telling her before she can analyse it, write about it, or file an FOI request for better data.
- Has tried to read the official standard and bounced off the formal schema language.
- Cares about red flags and integrity, not primarily about publishing infrastructure.

**Mai is the design target.** If the primer works for Mai, the developer persona can be served by an optional deeper layer.

### Secondary personas

| Persona | Role | What they need from the primer |
|---------|------|--------------------------------|
| **The developer (Karim)** | Backend/data engineer integrating a publishing pipeline | Fast, accurate mental model of release vs record, package structure, where extensions live. Will skim concept modules, go deep on structure/identifiers. |
| **The government publisher (Lena)** | Responsible for her agency's OCDS publication | Why process-orientation matters, what a release package must contain, how mapping to source systems works. Will click through to the explorer. |
| **The policy/training lead (Ravi)** | Designs training for a procurement authority | Authoritative-enough content he can point staff at; ideally printable/reusable under an open license. |
| **The curious public (anyone)** | Lands from a news article mentioning "OCDS" | A 2-minute "what is this" explainer before the deep stuff. |

### Anti-personas (explicitly not the target)

- **OCDS experts / OCP staff** — they already know this; the primer adds nothing for them.
- **People who need to *publish* data today** — send them to `ocds_mapping_explorer` and the official docs.

---

## Learning outcomes

After completing the primer, a learner should be able to:

### Foundational (everyone)

1. Explain in plain language what a **contracting process** is and why OCDS models it as a lifecycle rather than a single event.
2. Distinguish a **contracting process**, **release**, **record**, and **release package**: one `ocid` groups many releases; the record indexes them, should contain a compiled current-state view, and may contain a versioned history view.
3. Read a small OCDS JSON snippet and identify `ocid`, `release.id`, parties, tender, awards, and contracts.
4. Recognise the standard **stages** of a process (planning → tender → award → contract → implementation) and the `tag` values that mark them.

### Structural (analysts, developers, publishers)

5. Explain the three identifier layers — `ocid` (process), `release.id` (publication), in-object `id`s — and why confusing them is the most common mapping bug.
6. **Explain what starts a contracting process and what joins one** — the `ocid` is the OCDS boundary, generated from the publisher's best stable internal process identifier. In the currently exposed PhilGEPS exports, `bid_reference_no` is the strongest observed tender-stage key, not a universal rule. Learners should be able to explain when an earlier APP/project identifier could be preferable and why fallback identifiers require provenance and cardinality testing.
7. Describe what a **release package** must contain (the five required fields) and what goes inside `releases[]`.
8. Read a **party** block and its `roles`, and explain the difference between buyer, supplier, procuring entity, and tenderers.
9. Navigate the OCDS schema tree and find a field's definition, type, and codelist.

### Applied (analysts who will use the data)

10. Read a **record** — its release index, its **compiled release** (current state), and its **versioned release** (per-field change history) — and trace a single award through to its contract and implementation.
11. Recognise common **codelists** (`releaseTag`, `initiationType`, `currency`, party role/identifier schemes) well enough to spot invalid values.
12. Explain at a conceptual level how a **red-flag indicator** (e.g. R003 single bid, R024 period too short) is computed from OCDS paths, without needing the formula.
13. **Spot data gaps and explain why OCDS makes them visible where flat exports hide them** — e.g. an `active` award with no `contracts[]` referencing it is a machine-detectable signal; a blank contract-amount cell in a spreadsheet is not. Name at least one downstream indicator the gap blocks.

### Hands-on (optional, for the developer/publisher track)

14. Open a mapping project in `ocds_mapping_explorer` and understand what the field tree, mapping column, and validation views are telling them.
15. Identify which source-system fields in a sample dataset map to which OCDS paths for one stage.

Outcomes 1–4 define the **MVP floor**. Outcomes 5–9 are the **v1 core** (outcome 6 — the process boundary — is taught explicitly at Station 3 per decision D11). Outcomes 10–13 are the **v1 applied layer** (including the data-gaps beat). Outcomes 14–15 are **cross-links to the explorer**, not primer content themselves.

---

## Success criteria

How do we know the primer is working? Concrete, testable signals:

| Criterion | How we'd measure it |
|-----------|--------------------|
| A new analyst can explain contracting-process / release / record in their own words after ~20 min | Pilot with 3–5 people from the target persona; brief verbal/written check |
| Drop-off on the first module is low | Anonymous page analytics; goal: ≥60% reach the end of module 1 |
| Learners correctly identify `ocid` vs `release.id` in a 5-question check | Embedded knowledge-check scores; goal: ≥80% pass on first attempt after the identifiers module |
| Learners can explain the `ocid` boundary and distinguish it from the dataset-specific source key used to generate it | Pilot check after Station 3; goal: ≥70% identify “best stable internal process identifier” and explain why current exports use `bid_reference_no` provisionally |
| Learners can explain why an active award with no contract is *visible in OCDS but hidden in a flat export* | Pilot check after the DOLE example; goal: ≥70% give the "structure → signal" answer unprompted |
| The primer is cited/shared by people outside the project | Inbound links, mentions in training material |
| It does **not** duplicate the official docs | Review pass: every concept page links out to canonical OCP docs for formal detail; content is explanation, not restatement |
| It loads fast and works offline-ish | Lighthouse ≥90; static hosting; no required login |

---

## Tone and register

- **Plain language, second person ("you").** Not the formal register of the official standard.
- **Concrete before abstract.** Every concept opens with a tiny example (a 5-line JSON, a one-sentence scenario) and *then* generalises.
- **Visual where possible.** A diagram or annotated snippet per concept, not paragraphs of prose.
- **Honest about depth.** "This is the 5-minute version — the full rule is in the [official schema reference]." Link generously.
- **No jargon without definition on first use.** Maintain a glossary; first mention of any term links to it.

This is open decision **D7** in the planning index.

---

## Scope boundaries (what the primer is *not*)

- Not a publication tool — that's the explorer's job.
- Not a validator — link to cove / the Data Review Tool.
- Not a replacement for OCP's own [primer](https://standard.open-contracting.org/latest/en/primer/) and [getting-started](https://standard.open-contracting.org/latest/en/getting-started/) pages — in particular, [How is OCDS data published? (releases and records)](https://standard.open-contracting.org/latest/en/primer/releases_and_records/) is the authoritative reference for the release/record/compiled/versioned distinction and the primer defers to it for formal definitions. The primer is a *complementary*, more interactive, more scenario-driven take that uses this project's PhilGEPS material as its worked example.
- Not OCDS 1.2 — pinned to 1.1, consistent with the rest of the workspace.
- Not a training programme — no facilitator guide, cohort features, or LMS integration in v1/v2.

---

## Open questions for review

- Is the **analyst-first** persona the right spine, or should we lead with the **publisher/government** persona given this project's PhilGEPS context? (Open decision **D1**)
- Is **English-only at launch** acceptable? (Open decision **D6**)
- Should outcome 13 (cross-link to explorer) be a soft link or a guided "open this project in the explorer" hand-off? (Resolved in [`05_relationship_to_existing_tooling.md`](05_relationship_to_existing_tooling.md).)
