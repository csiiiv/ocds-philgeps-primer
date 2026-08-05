# 14 — Glossary and search

## Glossary

The glossary at `/glossary` defines the vocabulary used across the primer. Entries are grouped into OCDS model, lifecycle, organizations, data and mapping, analysis, and Philippine context.

Definitions distinguish standard concepts—such as release, record, compiled release, package, and OCID—from local POC terminology such as reconstructed current-state release. The page supports text filtering, category filtering, stable term anchors, and direct links from search results.

Automatic first-mention linking from lesson prose is deliberately deferred. It requires content-aware rendering that avoids links inside headings, controls, code, and already-linked text.

## Search

The sidebar search opens `/search?q=...`. The client-side index covers:

- all five introductory stations and their callouts;
- every Possible Journey and its analytical boundaries;
- all Field Explorer traces, rules, paths, and values;
- glossary entries;
- the publication and portfolio chapter.

Results require every query term to appear and rank exact or prefix title matches above excerpt and body matches. Search is entirely client-side and does not transmit queries or learner activity.

This lightweight index is sufficient for the current static corpus. A dedicated search library can replace it if the content grows enough to require stemming, fuzzy matching, or incremental indexing.
