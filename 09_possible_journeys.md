# 09 — Possible Journeys

## Purpose

Chapter 2 corrects the introductory flagship's tidy-example bias. Learners compare contracting processes that stop, contain multiple items or awards, expose chronology problems, or span much longer periods. The chapter does not repeat the five-station tutorial; it asks learners to recognize source-row shape, process shape, provenance, analytical possibilities, and limitations.

## Provenance contract

Every journey carries one of three labels:

| Label | Meaning | Required disclosure |
|---|---|---|
| **Synthetic** | Designed teaching data; not an observed procurement | State the teaching purpose and confirm schema validation |
| **Adapted** | Observed data materially changed or reconstructed for teaching | Identify the source, list material transformations, and never imply that the history was published |
| **Real** | Exact source rows transformed without changing their observed values | Cite the source file and lines, disclose process-key and mapping assumptions, and separate source observations from derived metrics |

“Real” does not mean complete or authoritative. It means learners can compare the exact selected rows with the resulting POC release. Missing and contradictory source facts remain visible.

## Gallery card contract

Each card shows:

- provenance and exact source location;
- source-row and contracting-process shape;
- lifecycle stages visible;
- observed dates and clearly named derived durations;
- why the example matters;
- what can and cannot be analyzed;
- data-quality or interpretation cautions.

Durations must name their endpoints. “Long span” is not a finding by itself.

## Journey detail contract

Every gallery card links to a stable `/possible-journeys/:journeyId` page. Detail pages reuse the introductory journey's visual vocabulary without repeating its five-station lesson:

1. **Shape** — provenance, visible stages, key metrics, and why the example matters.
2. **Timeline** — every dated tender, award, publication, notice-to-proceed, and contract-period observation derived from the selected rows. Multiple awards and contracts remain separate. Events are sorted by observed date; selecting one reveals its source line and field, source value, OCDS destination and transformed value. Undated cancellation remains visible, and lifecycle stages appearing out of expected order receive a chronology warning.
3. **Record** — a record-shaped summary frames the exact source rows and the one reconstructed current-state OCDS release, while explicitly marking publication history as unavailable. Both evidence artifacts open in the same large fixed modal pattern used by the introductory release index: fixed context, Readable view and JSON view, independently scrollable content, close, and previous/next navigation. The readable view groups source fields by lifecycle meaning and presents OCDS items, awards, suppliers, contracts, links, and organizations as semantic cards and tables. For multi-row sources, the row count and row selector remain fixed above the independently scrollable content. Release Index, compiled release, and versioned release are not fabricated when the source has no publication history.
4. **Questions** — conclusions supported by the evidence, conclusions that remain unavailable, and the principal caution.

Previous and next navigation lets learners walk the catalogue.

## Comparison contract

Gallery cards can be selected for comparison, with a limit of three to keep the matrix readable. Two selected examples enable a persistent **Compare selected** action. The comparison URL stores journey IDs in its query string so the result is shareable.

The matrix compares provenance, process shape, visible stages, observed period, chronology checks, source-row grain, identity rule, item/award/supplier/contract counts, supported analysis, and unsupported conclusions. Values are descriptive rather than scores. Every cell links back to the contributing journey's Shape, Timeline, Record, or Questions section. Zero entity counts are explicitly treated as “not published,” not proof that the event never occurred.

## Audited catalogue

The catalogue retains the synthetic DENR flagship, then uses seven checked-in transformations in `examples/poc_etl/` from exact lines in the 2023 PhilGEPS CSV:

1. **Sharp toner cartridges** — one flattened row containing tender, award, supplier, and contract facts; the zero bid reference triggers a disclosed solicitation-number fallback.
2. **Streetlight installation materials** — four line-item rows correctly retained as one tender, one award, and one contract.
3. **Secure socket licence and managed storage service** — two rows sharing one bid reference but carrying two awards, suppliers, and contracts. This is the central OCID-boundary example.
4. **Construction of stage** — a cancelled tender with no award or contract.
5. **School canteen renovation materials** — an award and supplier with no contract identifier or period.
6. **Western Mindanao janitorial services** — a flattened current state with an explicitly three-year planned contract period.
7. **Construction of Ilian Maul Road** — an award date 165 days before the observed tender-publication date, preserved as a data-validation question.

The former DPWH cards generated by the exploratory bulk compiler are removed from the active catalogue. They can return after their original source rows are located and transformed through the same auditable process. For later project-centered infrastructure analysis across multiple contracting processes, OC4IDS remains the more appropriate model.

## Boundaries

- Each real example is one reconstructed current-state release, not an observed historical release.
- Exact source rows and assumptions remain accessible beside the transformation.
- Schema validity does not prove correct grouping; semantic fixture checks assert expected row, item, award, and contract counts.
- Dates are preserved as source observations. The POC reports contradictions and does not silently repair them.
- Free-text bidder lists are not converted into structured bids until their delimiter and organization-identity behavior is tested.
- Long duration and chronology anomalies are questions for investigation, not verdicts.
