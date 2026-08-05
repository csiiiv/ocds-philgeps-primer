import { FLAGSHIP_EXAMPLE } from "../content/workedExample";
import type { StationId } from "../content/stations";

const PROCESS_STEPS: Record<StationId, { heading: string; body: string }> = {
  "1-event": {
    heading: "The process begins with a need",
    body: "DENR Region VII needs laptops for its field offices. No OCDS process exists yet; this is the real-world procurement story that the data will describe.",
  },
  "2-extracted": {
    heading: "The event is captured as a source row",
    body: "PhilGEPS records the notice and assigns Bid Reference No. 2024-001. That source identifier will let later events be recognized as parts of the same process.",
  },
  "3-mapped": {
    heading: "The contracting-process boundary is established",
    body: `The bid reference becomes the basis of ${FLAGSHIP_EXAMPLE.ocid}. Later tender, award, contract, and implementation events carrying this identity belong to this process.`,
  },
  "4-record": {
    heading: "One process accumulates many releases",
    body: `Every release in this timeline shares ${FLAGSHIP_EXAMPLE.ocid}. Together, those publications describe how this one process changed from tender through implementation.`,
  },
  "5-analyzed": {
    heading: "The process can now be analyzed",
    body: "The compiled release gives the current state of the completed story. Indicators inspect that structured state for competition risks and publication-quality gaps.",
  },
};

export function ProcessContinuity({ stationId }: { stationId: StationId }) {
  const step = PROCESS_STEPS[stationId];
  return (
    <aside className="process-continuity">
      <span>Following one contracting process</span>
      <strong>{step.heading}</strong>
      <p>{step.body}</p>
    </aside>
  );
}
