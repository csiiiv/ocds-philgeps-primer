import denr from "../../../examples/denr-r7-laptops-2024.json";
import pocResults from "../../../examples/poc_etl/current_state_releases.json";
import pocRows from "../../../examples/poc_etl/source_rows.json";

export interface JourneyEvidenceItem {
  id: string;
  label: string;
  date?: string;
  kind: "release" | "currentStateRelease" | "sourceRows";
  data: unknown;
}

interface TeachingRelease {
  id: string;
  date?: string;
  summary: string;
  partial: unknown;
}

function teachingReleases(releases: TeachingRelease[]): JourneyEvidenceItem[] {
  return releases.map((release) => ({
    id: release.id,
    label: release.summary,
    date: release.date,
    kind: "release",
    data: release.partial,
  }));
}

type PocFixture = keyof typeof pocResults;

function pocEvidence(fixture: PocFixture): JourneyEvidenceItem[] {
  const result = pocResults[fixture];
  return [
    {
      id: `${fixture}-source`,
      label: `Source row${pocRows[fixture].length === 1 ? "" : "s"}`,
      kind: "sourceRows",
      data: pocRows[fixture],
    },
    {
      id: result.release.id,
      label: "Reconstructed current-state release",
      date: result.release.date,
      kind: "currentStateRelease",
      data: result.release,
    },
  ];
}

export const JOURNEY_EVIDENCE: Record<string, JourneyEvidenceItem[]> = {
  "denr-laptops": teachingReleases(denr.sourceHistory.releases),
  "poc-single-row": pocEvidence("single-row"),
  "poc-multi-item": pocEvidence("multi-item"),
  "poc-multi-award": pocEvidence("multi-award"),
  "poc-cancelled": pocEvidence("cancelled"),
  "poc-award-only": pocEvidence("award-only"),
  "poc-long-service": pocEvidence("long-service"),
  "poc-chronology": pocEvidence("chronology-anomaly"),
};
