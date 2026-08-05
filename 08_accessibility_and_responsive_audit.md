# 08 — Accessibility and Responsive Audit

**Audit date:** 2026-08-04  
**Scope:** static interaction audit, keyboard contracts, semantic markup, focus behavior, contrast-sensitive tokens, reduced motion, and responsive CSS

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
