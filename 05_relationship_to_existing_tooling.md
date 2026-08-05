# 05 — Relationship to Existing Tooling

> **Scope and identity:** Relationships described here are local workspace relationships, not evidence of common organizational ownership or public deployment. Names such as `ocds-ui` are illustrative unscoped package names, not published registry packages unless a verified registry entry is cited.

**Question:** How does the primer relate to `ocds_mapping_explorer`, the schema/reference data, and the corpus docs — without duplicating any of them?

---

## The three-layer model

The workspace already has three distinct layers of OCDS material. The primer becomes a fourth, with a clearly different job.

| Layer | Artifact(s) | Job | Audience |
|-------|-------------|-----|----------|
| **Reference (source of truth)** | `references/ocds-release-schema.json`, `ocds_mapping_explorer/public/ocds_reference.json`, OCP canonical docs (external) | Define what OCDS *is* | Experts, tools |
| **Working tool** | `ocds_mapping_explorer/` (React app) | Map a source system to OCDS; validate; export | Publishers, engineers |
| **Conceptual docs** | `docs/*.md`, `philgeps_schema_analysis/docs/*.md`, `philgeps_ocds_plan.md` | Explain PhilGEPS→OCDS in depth, in prose | Engineers on this project |
| **Primer (new)** | `ocds_primer/` | *Teach* OCDS concepts interactively, to people who don't already know them | Analysts, journalists, CSOs, new developers |

The primer is the **teaching layer**. Its job is to make the other three layers reachable by people who currently bounce off them.

---

## The guiding rule: teach, don't duplicate

For every concept in the primer, ask: *is this already explained somewhere in the workspace or in the canonical docs?* If yes:

- **If it's conceptual and stable** → rewrite for tone/brevity in the primer, link out to the canonical source for depth. Don't copy-paste.
- **If it's a tool/workflow** → describe the *concept* in the primer, then link out to the tool for the *doing*.

This keeps the primer maintainable: when the canonical source changes, only one place needs updating.

---

## Concrete relationships

### 1. Primer ↔ `ocds_mapping_explorer`

**Relationship: primer teaches, explorer does.**

- The primer's `MappingExercise` is a deliberately tiny, curated destination-choice exercise — **not** the real mapping workspace. The separate Field Explorer provides deeper audited traces; a future hand-off can still open the full mapping workspace.
- The primer's `AnnotatedJsonTree` component **reuses** the explorer's tree-rendering and path-detail logic (see §"Component sharing" below), but renders *values*, not mappings.
- The primer links to specific explorer URLs (e.g. `/p/blank/explorer/tender`) so a learner can pivot from "what is tender?" to "show me tender's fields" in one click.
- The primer does **not** embed the explorer in an iframe — coupling that hurts both apps.

### 2. Primer ↔ reference data (`ocds_reference.json`, schema JSON)

**Relationship: primer consumes the reference; never defines it.**

- `AnnotatedJsonTree` tooltips/panels read field titles, descriptions, types, and codelists from `public/ocds_reference.json` (the same file the explorer uses). One source of truth.
- The worked example is hand-authored primer content, but every field/value in it must be **valid against** `references/ocds-release-schema.json`. A build-time check (small script) asserts this so the primer never shows invalid OCDS.
- If the reference is regenerated (e.g. OCDS version bump), the primer picks up new titles/descriptions automatically; only the prose needs review.

### 3. Primer ↔ conceptual docs (`docs/`, `philgeps_schema_analysis/docs/`)

**Relationship: primer is the friendly front door; docs are the depth.**

- The primer's prose rewrites the conceptual content of these docs in plainer language and shorter form.
- Each module's **"Go deeper"** section links to the specific section of the relevant doc (see the reuse table in [`02_content_structure.md`](02_content_structure.md)).
- The docs remain the authoritative engineering reference; the primer never contradicts them. If a discrepancy is found, the **doc wins**, and the primer is the one that gets fixed.

### 4. Primer ↔ Cardinal / red-flag material

**Relationship: conceptual in primer, operational in docs/explorer.**

- Module 7 teaches *what a red flag is* (an OCDS-path query) and shows 2–3 worked indicators interactively.
- The catalogue of R001–R073 lives in `ocds_mapping_explorer/references/OCP_RED_FLAGS_TO_OCDS.md` and the indicator packs. The primer links there; it does not reproduce the full catalogue.
- The Cardinal workflow itself (prepare/indicators CLI) is out of scope for the primer — that's `philgeps_ocds_plan.md` territory.

---

## Component sharing with the explorer

This is the main technical reuse and the strongest argument for the recommended tech stack (see [`03_tech_stack_options.md`](03_tech_stack_options.md)).

### What's worth sharing

| Explorer asset | How the primer reuses it |
|----------------|--------------------------|
| Hierarchical OCDS field tree rendering | Basis of `AnnotatedJsonTree`'s expand/collapse + path navigation |
| `OcdsPathDetailModal` (path → title/description/type/codelist) | Becomes the tooltip/side-panel content source in `AnnotatedJsonTree` |
| `public/ocds_reference.json` loader | Reused as-is; same fetch/caching pattern |
| Modal/dialog primitives | Reused for knowledge-check feedback panels |
| Styling tokens (colours, typography) | Reused so the two apps feel like one family |

### How to share it — three options (open decision **D3**)

| Option | Mechanism | Pros | Cons |
|--------|-----------|------|------|
| **A. Vendor** (recommended for MVP) | Copy the needed components into `ocds_primer/src/components/shared/` with a `// vendored from ocds_mapping_explorer — keep in sync` header | Simplest; no packaging; no version drift between primer and a published package | Manual sync when shared code changes |
| **B. Local workspace package** | Extract a `packages/ocds-ui` (or use a monorepo / npm `workspace:*`) referenced by both apps | Clean; one source of truth; no copy drift | Requires monorepo setup; more moving parts |
| **C. Publish to a registry** | Publish an organization-neutral `ocds-ui` package and consume it in both | Fully decoupled | Overkill at current scale; publish pipeline overhead |

**Recommendation:** Start with **A (vendor)** for MVP speed, with a clear comment header on each vendored file. Revisit **B** in v1 if the primer and explorer both grow and drift becomes painful. **C** only if a third consumer appears.

The primer must never *import directly* from `../ocds_mapping_explorer/src/...` — that couples build pipelines. Vendor or package only.

---

## Data dependencies (what the primer reads at build/runtime)

| Asset | Source | Loaded | Used by |
|-------|--------|--------|---------|
| `ocds_reference.json` | `ocds_mapping_explorer/public/` | Build-time copy into primer `public/` | `AnnotatedJsonTree` tooltips |
| `ocds-release-schema.json` | `references/` | Build-time only (validation script) | Asserts worked example validity |
| Worked example JSON | primer-authored, `src/content/examples/` | Bundled | `LifecycleTimeline`, `AnnotatedJsonTree`, `RedFlagPlayground` |
| Glossary | primer-authored, `src/content/glossary.json` | Bundled | Tooltips, `/glossary` page, search index |
| Codelists (closed) | Derived from reference at build time | Bundled | `CodelistSpotter` |
| Red-flag indicator defs (2–3) | Hand-picked from OCP catalogue, primer-authored | Bundled | `RedFlagPlayground` |

Nothing is fetched at runtime from a remote server in v1. The site is fully static and works offline once loaded.

---

## Naming and identity

- The primer is a sibling app to the explorer, not a child of it. Suggested project name: **"OCDS Primer"** (folder `ocds_primer/`). It has its own `package.json`, its own deploy, its own README.
- Both apps link to each other: primer → explorer ("try this for real"), explorer → primer ("new to OCDS? start here").
- Attribution: both credit OCP as the standard's maintainer; primer cites the specific docs it teaches from.

---

## What happens when OCDS versions change

The workspace pins OCDS 1.1 (1.1.5 specifically). When that pin moves:

1. `ocds_reference.json` is regenerated in the explorer.
2. The primer's build copies the new reference → `AnnotatedJsonTree` tooltips update automatically.
3. The build-time validation script re-checks the worked example against the new schema.
4. A human reviews primer prose for any field that changed title/description.
5. The version badge in the primer footer updates (e.g. "Teaches OCDS 1.1.5").

This keeps the primer honest without making it a maintenance burden.

---

## Open questions for review

- **Vendor vs package** for shared components — open decision **D3**. Default: vendor for MVP.
- Should the primer ship its **own copy** of `ocds_reference.json` or fetch the explorer's at build time via a relative path script? Lean: own copy (decoupled deploys; the file is static).
- Should the explorer gain a "Primer" link in its header in v1, or wait until the primer is live? Lean: add the link in primer v1.
