import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { FLAGSHIP_EXAMPLE } from "../content/workedExample";

export type TraceKey = "process-id" | "closing-date";

interface TraceDefinition {
  key: TraceKey;
  label: string;
  sourceField: string;
  canonicalField: string;
  description: string;
}

export const TRACES: TraceDefinition[] = [
  {
    key: "process-id",
    label: "Bid Reference No.",
    sourceField: "Bid Reference No.",
    canonicalField: "bid_reference_no",
    description: "The identity thread that groups every release into one contracting process.",
  },
  {
    key: "closing-date",
    label: "Closing Date",
    sourceField: "Closing Date",
    canonicalField: "closing_date",
    description: "A changing date that becomes version history and feeds the short-period indicator.",
  },
];

interface TraceContextValue {
  activeTrace: TraceDefinition;
  setActiveTrace: (key: TraceKey) => void;
  stationStep: (station: string) => { value: string; note: string } | undefined;
}

const TraceContext = createContext<TraceContextValue | null>(null);

export function TraceProvider({ children }: { children: ReactNode }) {
  const [key, setKey] = useState<TraceKey>("closing-date");
  const value = useMemo<TraceContextValue>(() => {
    const activeTrace = TRACES.find((trace) => trace.key === key) ?? TRACES[0];
    const source = FLAGSHIP_EXAMPLE.trace.find((trace) => trace.datum === activeTrace.label);
    return {
      activeTrace,
      setActiveTrace: setKey,
      stationStep: (station) => source?.steps.find((step) => step.station === station),
    };
  }, [key]);

  return <TraceContext.Provider value={value}>{children}</TraceContext.Provider>;
}

export function useTrace() {
  const value = useContext(TraceContext);
  if (!value) throw new Error("useTrace must be used inside TraceProvider");
  return value;
}
