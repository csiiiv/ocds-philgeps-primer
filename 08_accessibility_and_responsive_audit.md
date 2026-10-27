# 08 — Accessibility and Responsive Audit

**Audit date:** 2026-08-04 (original); **updated 2026-10-27** after the desktop-first workshop restructuring  
**Scope:** static interaction audit, keyboard contracts, semantic markup, focus behavior, contrast-sensitive tokens, reduced motion, responsive CSS, and — since October — automated browser accessibility checks

## Corrections implemented

- Added a keyboard-visible skip link and a focusable main-content target.
- Moves focus to the lesson heading region after client-side route changes.
- Added consistent visible focus treatment for links, buttons, form fields, summaries, and selects.
- Completed the Record tabs' ARIA relationships and added Arrow Left/Right, Home, and End navigation with roving `tabIndex`.
- Preserved native button semantics in Mapping and Analytics instead of overriding buttons with `listitem` roles.
- Removed mouse-only selection behavior from version-history table rows; the labeled button remains the single keyboard and pointer action.
- Release cards now expose `aria-haspopup="dialog"`, `aria-controls`, and their expanded state.
- The native release dialog retains Escape, backdrop, and explicit-close behavior. Its position update is announced politely while browsing previous/next releases.
- Increased the muted-text token from low-contrast decorative gray to a readable text color.
- Added `prefers-reduced-motion` behavior and removed hover movement for affected users.
- Reflowed the five-station subway into a vertical rail on narrow screens.
- Stacked station navigation and all major two-column viewers at the mobile breakpoint.
- Added compact short-viewport modal rules while retaining the fixed title, JSON pane, link, and release navigation.

## Verification completed

- Canonical OCDS and semantic fixture validation
- TypeScript compilation
- Production Vite build
- Source-level keyboard and accessible-name audit for every interactive component
- Responsive-rule review at the 760 px width breakpoint and 600 px height breakpoint

## Manual checks still required before Phase 1 sign-off

The next release-inspector refactor must be tested once across all consuming contexts rather than treating each modal as a separate interaction. Its acceptance checks include focus entering the dialog, focus returning to the invoking release card, Escape and backdrop close, announced previous/next position changes, persistent access to the title and controls, an independently scrolling content region, and usable Readable/JSON toggles at high zoom and short viewport heights.

- Keyboard walkthrough in current Chrome, Firefox, and Safari
- Screen-reader walkthrough with NVDA or VoiceOver
- Browser zoom at 200% and 400%
- Device checks at representative 320 px, 375 px, 768 px, and desktop widths
- Lighthouse accessibility and performance runs against the deployed or preview build
- Contrast verification with rendered states, including disabled controls and tags

The remaining checks require rendered-browser and assistive-technology observation; a passing compiler cannot substitute for them.

---

## Update — 2026-10-27 (workshop restructuring)

The October desktop-first restructuring (see [`docs/structure-review.md`](docs/structure-review.md)) added automated rendered-browser checks and closed several of the earlier manual gaps for the new surfaces:

### Corrections implemented (October)

- **Automated WCAG A/AA checks** now run via `@axe-core/playwright` (`npm run test:e2e`) against the default pages, mapping topics, lab/workshop views, replay source/release/record views, versioned history, and the active release inspector. No violations were reported in the tested states. These are automated checks, not a manual assistive-technology review.
- **18 desktop browser checks** pass at 1440×900, 1920×1080, and 2560×1440, covering grouped navigation, deep links and legacy anchors, retained exercise state, all replay controls, unpublished source changes, exact per-release JSON, downloads, and keyboard navigation/focus.
- The skip link now routes through the router (HashRouter owns the fragment), scrolling to and focusing the main content programmatically.
- In-page section fragments (e.g. `#/workshop#templates`) are resolved programmatically after navigation, scrolling to and focusing the target, since the browser cannot scroll to targets inside the router's fragment.
- The mobile progress indicator exposes proper `role="progressbar"` semantics with `aria-valuemin`/`aria-valuemax`/`aria-valuenow`.
- Section-framed navigation uses links and native buttons rather than re-purposed list items.
- The mobile keyboard/accessibility issues encountered in the new learning paths (navigation drawer focus handling, control reachability) were fixed during implementation.

### Verification completed (October, automated)

- `npm run build` — example/package validation, 18 learning-data/schema/semantic checks, TypeScript strict, production bundling
- `npm run test:e2e -- --project=desktop` — 18 browser checks across the three desktop target sizes
- Automated axe-core WCAG A/AA scans across the new views — no violations reported
- Mobile e2e project remains available and retained (390×844); **dedicated mobile optimisation is deferred** — the desktop-first pass keeps a basic stacked fallback

### Still requiring manual verification

- Screen-reader walkthrough (NVDA/VoiceOver) of the new surfaces — replay event rail, artifact picker, mapping topics, lab steps, workshop views
- Keyboard walkthrough in Firefox and Safari (the automated suite runs Chromium)
- 200–400% zoom verification on the new wide workspaces
- Lighthouse runs against the deployed build
- The release-inspector acceptance list above remains the reference contract for any future inspector refactor
