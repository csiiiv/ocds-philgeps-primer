import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { STATIONS, type StationId } from "../content/stations";
import { DIFFICULTIES, type Difficulty } from "../content/knowledgeChecks";

/**
 * Knowledge-check progress persistence.
 *
 * Each station has three difficulty tiers (easy / normal / hard). When the
 * learner submits the correct answer for a difficulty, we record that
 * station+difficulty as completed. A station counts as "passed" only when all
 * three difficulties have been answered correctly. Progress survives reloads
 * via `localStorage`.
 *
 * Storage key carries a version suffix. Bumping the version cleanly discards
 * data written by an older shape — `v1` stored only station IDs; `v2` stores
 * per-difficulty completion.
 */

const STORAGE_KEY = "ocds-primer:station-progress:v2";

type DifficultyMap = Partial<Record<Difficulty, boolean>>;
type StationMap = Partial<Record<StationId, DifficultyMap>>;

interface PersistedShape {
  /** stationId → difficulty → completed. */
  stations: StationMap;
}

interface StationProgressContextValue {
  /** Set of station IDs the learner has fully passed (all difficulties). */
  passed: Set<StationId>;
  /** Number of fully-passed stations over the total station count. */
  counts: { passed: number; total: number };
  /** True when localStorage is unavailable (private mode, disabled, etc.). */
  isAvailable: boolean;
  /** Records a difficulty as completed for a station. */
  markDifficultyPassed: (stationId: StationId, difficulty: Difficulty) => void;
  /** Removes one difficulty's completion (e.g. on reset). */
  markDifficultyUnpassed: (stationId: StationId, difficulty: Difficulty) => void;
  /** Returns true when a specific station+difficulty is recorded as completed. */
  isDifficultyPassed: (stationId: StationId, difficulty: Difficulty) => boolean;
  /** Clears all recorded progress. */
  reset: () => void;
}

const StationProgressContext = createContext<StationProgressContextValue | null>(null);

const TOTAL = STATIONS.length;
const VALID_IDS = new Set(STATIONS.map((station) => station.id));

function isStationPassed(stations: StationMap, stationId: StationId): boolean {
  const byDifficulty = stations[stationId];
  if (!byDifficulty) return false;
  return DIFFICULTIES.every((difficulty) => byDifficulty[difficulty] === true);
}

function computePassed(stations: StationMap): Set<StationId> {
  const out = new Set<StationId>();
  for (const station of STATIONS) {
    if (isStationPassed(stations, station.id)) out.add(station.id);
  }
  return out;
}

function readFromStorage(): { stations: StationMap; available: boolean } {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return { stations: {}, available: false };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { stations: {}, available: true };
    const parsed = JSON.parse(raw) as Partial<PersistedShape>;
    const stations: StationMap = {};
    if (parsed && typeof parsed === "object" && parsed.stations && typeof parsed.stations === "object") {
      for (const [stationId, difficultyMap] of Object.entries(parsed.stations)) {
        if (!VALID_IDS.has(stationId as StationId)) continue;
        if (!difficultyMap || typeof difficultyMap !== "object") continue;
        const cleaned: DifficultyMap = {};
        for (const difficulty of DIFFICULTIES) {
          if (difficultyMap[difficulty] === true) cleaned[difficulty] = true;
        }
        stations[stationId as StationId] = cleaned;
      }
    }
    return { stations, available: true };
  } catch {
    // Corrupt JSON or blocked storage — degrade silently without persisting.
    return { stations: {}, available: false };
  }
}

export function StationProgressProvider({ children }: { children: ReactNode }) {
  const [stations, setStations] = useState<StationMap>(() => readFromStorage().stations);
  const [isAvailable, setIsAvailable] = useState<boolean>(() => readFromStorage().available);

  // Re-hydrate on first mount.
  useEffect(() => {
    const { stations: stored, available } = readFromStorage();
    setStations(stored);
    setIsAvailable(available);
  }, []);

  const persist = useCallback((next: StationMap): boolean => {
    if (typeof window === "undefined" || typeof window.localStorage === "undefined") return false;
    try {
      const payload: PersistedShape = { stations: next };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }, []);

  const markDifficultyPassed = useCallback((stationId: StationId, difficulty: Difficulty) => {
    if (!VALID_IDS.has(stationId)) return;
    setStations((current) => {
      const existing = current[stationId] ?? {};
      if (existing[difficulty] === true) return current;
      const next: StationMap = {
        ...current,
        [stationId]: { ...existing, [difficulty]: true },
      };
      if (!persist(next)) setIsAvailable(false);
      return next;
    });
  }, [persist]);

  const markDifficultyUnpassed = useCallback((stationId: StationId, difficulty: Difficulty) => {
    if (!VALID_IDS.has(stationId)) return;
    setStations((current) => {
      const existing = current[stationId];
      if (!existing || existing[difficulty] !== true) return current;
      const nextDifficulty: DifficultyMap = { ...existing };
      delete nextDifficulty[difficulty];
      const next: StationMap = { ...current, [stationId]: nextDifficulty };
      if (!persist(next)) setIsAvailable(false);
      return next;
    });
  }, [persist]);

  const reset = useCallback(() => {
    setStations(() => {
      if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        try { window.localStorage.removeItem(STORAGE_KEY); } catch { setIsAvailable(false); }
      }
      return {};
    });
  }, []);

  const passed = useMemo(() => computePassed(stations), [stations]);

  const value = useMemo<StationProgressContextValue>(() => ({
    passed,
    counts: { passed: passed.size, total: TOTAL },
    isAvailable,
    markDifficultyPassed,
    markDifficultyUnpassed,
    isDifficultyPassed: (stationId, difficulty) => stations[stationId]?.[difficulty] === true,
    reset,
  }), [passed, isAvailable, stations, markDifficultyPassed, markDifficultyUnpassed, reset]);

  return <StationProgressContext.Provider value={value}>{children}</StationProgressContext.Provider>;
}

export function useStationProgress(): StationProgressContextValue {
  const ctx = useContext(StationProgressContext);
  if (!ctx) throw new Error("useStationProgress must be used inside a StationProgressProvider");
  return ctx;
}
