import exampleData from "../../../examples/denr-r7-laptops-2024.json";
import { buildOcdsRecord, type OcdsRecord, type OcdsRelease } from "./ocdsMerge";

export interface MappingStep {
  from: string;
  to: string;
}

export interface WorkedRelease {
  id: string;
  date: string;
  tag: string[];
  summary: string;
  partial: unknown;
}

export interface RedFlagResult {
  code: string;
  name: string;
  paths: string[];
  status: "clean" | "flagged" | "no_data";
  explanation: string;
}

export interface WorkedExample {
  meta: {
    title: string;
    description: string;
    fictional: boolean;
    shapeNote: string;
    ocdsVersion: string;
  };
  event: Record<string, string>;
  rawRow: Record<string, string | number>;
  rawColumns: Array<{ name: string; description: string }>;
  canonicalRow: Record<string, string | number | string[]>;
  rawToCanonical: MappingStep[];
  canonicalToOcds: MappingStep[];
  ocid: string;
  record: OcdsRecord;
  redFlags?: RedFlagResult[];
  trace: Array<{
    datum: string;
    value: string;
    steps: Array<{ station: string; value: string; note: string }>;
  }>;
}

/**
 * The first journey is deliberately synthetic: one coherent process can
 * demonstrate the complete lifecycle without pretending to be representative.
 * Later chapters contrast it with real-world process shapes.
 */
interface SourceRelease extends WorkedRelease {
  partial: OcdsRelease;
}

interface SourceExample extends Omit<WorkedExample, "record"> {
  sourceHistory: { releases: SourceRelease[] };
}

const source = exampleData as unknown as SourceExample;
const record = buildOcdsRecord(source.sourceHistory.releases.map((item) => item.partial));

export const FLAGSHIP_RELEASES = source.sourceHistory.releases;
export const FLAGSHIP_EXAMPLE: WorkedExample = { ...source, record };
