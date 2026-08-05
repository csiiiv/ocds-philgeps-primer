# 03 — Tech Stack Options

**Question:** What do we build the primer with?

---

## The constraint that narrows the field

The primer must ship as a **static, frontend-only site**. That rules out anything requiring a server, database, or auth for the core experience. Within that constraint, the realistic options are:

1. A **static-site generator / docs framework** (Astro Star, Docusaurus, VitePress, etc.)
2. A **custom React + Vite + TypeScript app** with markdown/MDX-driven content
3. A **hybrid**: docs framework for prose modules + a shared React component library for interactives

Each is evaluated below against criteria that matter for *this* project specifically — not generic docs-site criteria.

---

## Evaluation criteria

Weighted by relevance to the OCDS primer:

| Criterion | Weight | Why it matters here |
|-----------|--------|---------------------|
| **Authoring ergonomics** — can a non-developer edit a lesson? | High | Content will change often; analysts should be able to contribute |
| **Interactive component story** — easy to embed custom React? | High | The "interactive" promise depends on this (see `04_interactivity_patterns.md`) |
| **Reuse of existing explorer components** | High | `ocds_mapping_explorer` already has a JSON-tree viewer, schema reference loader, modal system |
| **Zero-backend / static hosting** | High | Non-negotiable |
| **Familiarity to the existing codebase** | Medium | Same toolchain = lower maintenance burden |
| **Search, sidebar, glossary tooltips out of the box** | Medium | Saves build time, but we can build them |
| **Bundle size / load speed** | Medium | Important for low-bandwidth users (some audiences are in markets with expensive data) |
| **i18n path** | Low at v1, High at v2 | EN at launch; translations deferred |
| **Long-term maintenance / community** | Medium | Don't pick something that'll be dead in 2 years |

---

## Option A — Docs framework (Astro Star / Docusaurus / VitePress)

### What it is
A purpose-built docs/tutorial framework. You write Markdown (often MDX), get sidebar/search/prev-next/theme for free, and embed React components where needed.

| Pros | Cons |
|------|------|
| Authoring is the smoothest — Markdown files are first-class | The component/embedding story is *possible* but each framework has its own quirks (Astro islands, Docusaurus MDX config, VitePress `<ClientOnly>`) |
| Sidebar, search, dark mode, i18n scaffolding included | Sharing components with `ocds_mapping_explorer` requires extracting a shared package or vendoring — friction |
| Fast by default (especially Astro/VitePress) | Theming/customisation fights you past a point; "primer" UX (timeline, drag-drop, quizzes) isn't native |
| Large, active communities | Adds a framework to learn/maintain that is different from the existing explorer stack |

**Best fit if:** authoring ergonomics dominate and interactives are light.

### Framework shortlist within this option

- **Astro Star** — modern, content-first, MDX-friendly, fast. Strong default for tutorial sites. Islands model handles interactivity cleanly. *Leading candidate within Option A.*
- **Docusaurus** — most mature, best i18n, heavier bundle, React-native. Good if i18n becomes urgent early.
- **VitePress** — fastest, lightest, but Vue-based (mismatch with the existing React explorer).

---

## Option B — Custom React + Vite + TypeScript, MDX content (RECOMMENDED)

### What it is
The same toolchain as `ocds_mapping_explorer` (React + Vite + TS). Lessons are authored as `.mdx` files — Markdown that can import and render React components. Routing, sidebar, search are built from small, owned pieces rather than a framework.

### Why this is the recommendation

1. **Component reuse is the killer feature.** `ocds_mapping_explorer` already has:
   - A hierarchical OCDS field tree (`OcdsPathPickerModal`, the explorer view)
   - A schema-reference loader (consumes `public/ocds_reference.json`)
   - A path-detail modal (`OcdsPathDetailModal`)
   - Modal/dialog infrastructure
   
   In Option B these can be imported directly or extracted into a tiny shared package (`packages/ocds-ui` or similar). In a docs framework, you'd reimplement or fight the framework's component boundaries.

2. **The interactives are not docs widgets.** A lifecycle timeline, a drag-each-id-to-its-layer quiz, a red-flag toggle playground — these are bespoke React components, not Markdown extensions. Building them in the same stack as the explorer is the lowest-friction path.

3. **Authoring is still good.** MDX gives you Markdown for prose with embedded components:
   
   ```mdx
   ## The release package

   A release package is an envelope. Here's the smallest valid one:

   <AnnotatedReleasePackage
     data={import('../content/examples/minimal-package.json')}
     highlight={['uri', 'version', 'publishedDate', 'publisher', 'releases']}
   />

   The five required fields are...
   ```
   
   Non-developers edit the prose; developers own the components.

4. **No framework to outlive.** It's Vite + React + a router. Boring, durable, well-understood.

5. **One portable build artifact.** Static `dist/` can be deployed by a future owner without coupling the primer to a provider now.

| Pros | Cons |
|------|------|
| Maximum reuse from existing explorer | Sidebar/search/tooltips are built, not given — modest up-front cost |
| MDX keeps authoring Markdown-friendly | Slightly more boilerplate to set up than Astro Star |
| Same stack = shared knowledge, shared deps, shared deploy | Need a small content-routing layer (file-based or a manifest) |
| Interactivity is first-class, not bolted on | |
| Lowest long-term maintenance | |

---

## Option C — Hybrid (docs framework for prose + shared React component library)

### What it is
Use Astro Star (or similar) for the lesson scaffolding, but extract the interactive components into a standalone React package that both the primer and the explorer import.

### Why it's second-best
You get framework authoring ergonomics *and* real component reuse — but at the cost of:
- Maintaining a published/vendored shared package (versioning, build, two consumers)
- Coordinating two build pipelines (framework + the shared package)
- Higher initial setup complexity

**Best fit if:** content authoring by non-developers turns out to be the dominant activity AND the explorer/primer diverge enough that a shared package is cleaner than vendoring.

This is open decision **D2/D3** — worth revisiting after MVP if Option B's authoring friction bites.

---

## Recommendation

The recommendation concerns the build architecture only. It does not select or imply a hosting provider, domain, repository, organization, or deployment owner. The generated static files are host-neutral; deployment remains an explicit future decision.

**Option B — MDX-in-Vite + React + TypeScript**, sharing primitives with `ocds_mapping_explorer`.

Concretely:

| Layer | Choice |
|-------|--------|
| Build tool | **Vite** (matches explorer) |
| UI framework | **React 18 + TypeScript** (matches explorer) |
| Content authoring | **MDX** (`@mdx-js/rollup`) — one `.mdx` per lesson, frontmatter for title/order/tags |
| Routing | **React Router** (matches explorer's route style) |
| Styling | **CSS Modules / Tailwind** — match whichever the explorer uses for consistency |
| State / progress | **localStorage** (no backend); module completion + quiz scores |
| Search | Client-side index (FlexSearch or similar) built at build time over MDX content + glossary |
| Diagrams | Inline SVG components for the lifecycle; reusable across modules |
| Data | Reuse `ocds_reference.json` and the worked-example JSON directly |
| Deploy | **Unresolved** — produce a host-neutral static `dist/`; select a provider only when an actual owner and target are confirmed |

### Suggested package layout

```
ocds_primer/
├── src/
│   ├── content/            # .mdx lessons + frontmatter
│   │   ├── modules/
│   │   │   ├── 0-five-minute.mdx
│   │   │   ├── 1-process.mdx
│   │   │   └── ...
│   │   ├── examples/       # the worked example, as JSON
│   │   └── glossary.json
│   ├── components/         # interactive building blocks
│   │   ├── AnnotatedJsonTree/
│   │   ├── LifecycleTimeline/
│   │   ├── MappingExercise/
│   │   ├── RedFlagPlayground/
│   │   └── KnowledgeCheck/
│   ├── layout/             # sidebar, prev/next, search
│   ├── routes/             # one route per module + index
│   └── main.tsx
├── public/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## What we explicitly avoid

- **Next.js / Remix** — overkill; adds SSR complexity we don't need for a static site.
- **A custom docs engine from scratch** — reinventing Astro Star.
- **Embedding the explorer in an iframe** — coupling that hurts both. Link out instead.
- **A CMS** (Sanity, Contentful, etc.) — content volume doesn't justify it; MDX in git is simpler and reviewable.
- **Heavy animation frameworks** (Framer Motion for everything) — targeted CSS/SVG transitions suffice; keep bundle small.

---

## Open questions for review

- Confirm **Option B** over **Option A (Astro Star)** — open decision **D2**. The deciding factor is how much we value reusing explorer components vs out-of-the-box authoring.
- Should the shared components live as a **vendored folder** in the primer, a **git submodule**, or a **published local package**? Open decision **D3**. Vendoring is simplest for v1.
- Resolve the deployment owner and target without inferring either from the local workspace — open decision **D4**.
