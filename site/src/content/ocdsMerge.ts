export type JsonObject = Record<string, unknown>;

export interface OcdsRelease extends JsonObject {
  ocid: string;
  id: string;
  date: string;
  tag: string[];
  initiationType: string;
}

export interface OcdsRecord {
  ocid: string;
  releases: OcdsRelease[];
  compiledRelease: OcdsRelease;
  versionedRelease: JsonObject;
}

interface ReleaseMetadata {
  releaseID: string;
  releaseDate: string;
  releaseTag: string[];
}

/**
 * Build the two derived record views from immutable releases.
 *
 * This implements the OCDS 1.1 merge subset used by this fixture:
 * objects merge recursively; arrays of objects carrying `id` merge by that
 * identifier unless the base schema marks the field `wholeListMerge`; other
 * arrays are whole values; null removes a compiled value; and changed literal
 * values become chronological versioned values. It is not an extension-aware
 * replacement for the official OCDS Merge reference implementation.
 */
export function buildOcdsRecord(input: OcdsRelease[]): OcdsRecord {
  if (input.length === 0) throw new Error("A record requires at least one release");
  const releases = [...input].sort((a, b) => a.date.localeCompare(b.date));
  const ocid = releases[0].ocid;
  if (releases.some((release) => release.ocid !== ocid)) {
    throw new Error("All releases in a record must share one ocid");
  }

  const compiled: JsonObject = {};
  const versioned: JsonObject = { ocid };
  for (const release of releases) {
    mergeCompiled(compiled, release, true);
    mergeVersioned(versioned, release, {
      releaseID: release.id,
      releaseDate: release.date,
      releaseTag: release.tag,
    }, true);
  }

  const latest = releases[releases.length - 1];
  const compiledRelease = {
    ...compiled,
    ocid,
    id: `${ocid}-${latest.date}`,
    date: latest.date,
    tag: ["compiled"],
    initiationType: String(compiled.initiationType ?? "tender"),
  } as OcdsRelease;

  return { ocid, releases, compiledRelease, versionedRelease: versioned };
}

function mergeCompiled(output: JsonObject, input: JsonObject, root = false) {
  for (const [key, value] of Object.entries(input)) {
    if (root && (key === "id" || key === "date" || key === "tag")) continue;
    if (value === null) {
      delete output[key];
    } else if (isObject(value)) {
      const target = isObject(output[key]) ? output[key] as JsonObject : {};
      mergeCompiled(target, value);
      output[key] = target;
    } else if (Array.isArray(value) && !isWholeListField(key) && isIdentifiedObjectArray(value)) {
      output[key] = mergeIdentifiedArray(output[key], value);
    } else {
      output[key] = clone(value);
    }
  }
}

function mergeIdentifiedArray(current: unknown, incoming: JsonObject[]) {
  const output = Array.isArray(current) ? clone(current) as JsonObject[] : [];
  for (const item of incoming) {
    const match = output.find((candidate) => candidate.id === item.id);
    if (match) mergeCompiled(match, item);
    else output.push(clone(item) as JsonObject);
  }
  return output;
}

function mergeVersioned(output: JsonObject, input: JsonObject, metadata: ReleaseMetadata, root = false) {
  for (const [key, value] of Object.entries(input)) {
    if (root && (key === "id" || key === "date" || key === "tag" || key === "ocid")) continue;
    if (isObject(value)) {
      const target = isObject(output[key]) ? output[key] as JsonObject : {};
      mergeVersioned(target, value, metadata);
      output[key] = target;
    } else if (Array.isArray(value) && !isWholeListField(key) && isIdentifiedObjectArray(value)) {
      const target = Array.isArray(output[key]) ? output[key] as JsonObject[] : [];
      for (const item of value) {
        let match = target.find((candidate) => candidate.id === item.id);
        if (!match) {
          match = { id: item.id };
          target.push(match);
        }
        const fields = Object.fromEntries(Object.entries(item).filter(([name]) => name !== "id"));
        mergeVersioned(match, fields, metadata);
      }
      output[key] = target;
    } else {
      const history = Array.isArray(output[key]) ? output[key] as JsonObject[] : [];
      const previous = history[history.length - 1]?.value;
      if (history.length === 0 || !equal(previous, value)) {
        history.push({ ...metadata, value: clone(value) });
      }
      output[key] = history;
    }
  }
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIdentifiedObjectArray(value: unknown[]): value is JsonObject[] {
  return value.length > 0 && value.every((item) => isObject(item) && typeof item.id === "string");
}

// Fields marked wholeListMerge in the canonical OCDS 1.1.5 base schema.
const WHOLE_LIST_FIELDS = new Set(["additionalIdentifiers", "additionalClassifications"]);
function isWholeListField(key: string) { return WHOLE_LIST_FIELDS.has(key); }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function equal(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}
