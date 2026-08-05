export type StationId =
  | "1-event"
  | "2-extracted"
  | "3-mapped"
  | "4-record"
  | "5-analyzed";

export type MacroPhase = "Events" | "Releases" | "Analytics";

export interface Station {
  id: StationId;
  index: number;
  macroPhase: MacroPhase;
  title: string;
  /** One-line summary shown on the subway map and hub. */
  blurb: string;
  /** The lens component that shows the data at this station. */
  lens: "EventCard" | "RawRowViewer" | "CanonicalMapper" | "RecordViewer" | "RedFlagPlayground";
  /** CSS custom property name for the rail colour. */
  railVar: string;
  /**
   * True if this station has release sub-stations under it (e.g. the record
   * fans out into one sub-station per release). Used by the subway + routing.
   */
  hasSubStations?: boolean;
}

export const STATIONS: Station[] = [
  {
    id: "1-event",
    index: 1,
    macroPhase: "Events",
    title: "Event",
    blurb: "A real-world procurement event happens and is logged in PhilGEPS.",
    lens: "EventCard",
    railVar: "--rail-events",
  },
  {
    id: "2-extracted",
    index: 2,
    macroPhase: "Events",
    title: "Extraction",
    blurb: "The event becomes a flat export row — one line per event, no relationships between rows.",
    lens: "RawRowViewer",
    railVar: "--rail-events",
  },
  {
    id: "3-mapped",
    index: 3,
    macroPhase: "Events",
    title: "Mapping to OCDS",
    blurb: "The flat row is mapped into the OCDS shape — and the event joins its contracting process via its ocid.",
    lens: "CanonicalMapper",
    railVar: "--rail-events",
  },
  {
    id: "4-record",
    index: 4,
    macroPhase: "Releases",
    title: "Record",
    blurb:
      "One record indexes all releases for the process and can provide compiled current-state and versioned history views.",
    lens: "RecordViewer",
    railVar: "--rail-released",
    hasSubStations: true,
  },
  {
    id: "5-analyzed",
    index: 5,
    macroPhase: "Analytics",
    title: "Indicators and Red Flags",
    blurb:
      "Cardinal indicators read OCDS paths and surface risk signals — and reveal where data is missing.",
    lens: "RedFlagPlayground",
    railVar: "--rail-analyzed",
  },
];

export const STATION_BY_ID: Record<StationId, Station> = Object.fromEntries(
  STATIONS.map((s) => [s.id, s])
) as Record<StationId, Station>;
