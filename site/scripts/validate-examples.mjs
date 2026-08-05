import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv-draft-04";
import addFormats from "ajv-formats";

const here = dirname(fileURLToPath(import.meta.url));
const examplesDir = resolve(here, "../../examples");
// Vendored copy of the OCDS 1.1 standard schemas, checked in so the build is
// self-contained and runs in CI. The optional workspace fallback keeps older
// local setups working where the schemas live in a sibling /references folder.
const vendoredSchemasDir = resolve(here, "../schemas");
const workspaceSchemasDir = resolve(here, "../../../references");
const referencesDir = existsSync(vendoredSchemasDir) ? vendoredSchemasDir : workspaceSchemasDir;
const manifest = readJson(join(examplesDir, "manifest.json"));
const files = new Set(readdirSync(examplesDir).filter((name) => name.endsWith(".json")));
const errors = [];
const WHOLE_LIST_FIELDS = new Set(["additionalIdentifiers", "additionalClassifications"]);
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const releaseSchema = readJson(join(referencesDir, "ocds-release-schema.json"));
const versionedSchema = readJson(join(referencesDir, "ocds-versioned-release-validation-schema.json"));
ajv.addSchema(releaseSchema);
ajv.addSchema(versionedSchema);
const validateRelease = ajv.getSchema(releaseSchema.id);
const validateVersioned = ajv.getSchema(versionedSchema.id);
const validateRecordPackage = ajv.compile(readJson(join(referencesDir, "ocds-record-package-schema.json")));
const pocSamples = readJson(join(examplesDir, "poc_etl/current_state_releases.json"));
const pocReleasePackage = readJson(join(examplesDir, "poc_etl/release_package.json"));
const validateReleasePackage = ajv.compile(readJson(join(referencesDir, "ocds-release-package-schema.json")));

for (const entry of manifest.examples) {
  if (!files.has(entry.file)) {
    errors.push(`Manifest entry ${entry.id} points to missing file ${entry.file}`);
    continue;
  }

  const example = readJson(join(examplesDir, entry.file));
  const isCanonicalFixture = Boolean(example.sourceHistory);
  const sourceEntries = example.sourceHistory?.releases ?? example.record?.releases;
  const releases = sourceEntries?.map((entry) => entry.partial ?? entry);
  if (!Array.isArray(releases) || releases.length === 0) {
    errors.push(`${entry.file}: record.releases must be a non-empty array`);
    continue;
  }
  if (entry.releaseCount !== releases.length) {
    errors.push(`${entry.file}: manifest says ${entry.releaseCount} releases, file has ${releases.length}`);
  }
  const seenIds = new Set();
  for (const [index, release] of releases.entries()) {
    const sourceEntry = sourceEntries[index];
    const prefix = `${entry.file}: release ${index + 1}`;
    for (const key of ["id", "date", "tag"]) {
      if (release[key] === undefined) errors.push(`${prefix} is missing ${key}`);
    }
    if (!isCanonicalFixture && sourceEntry.partial === undefined) errors.push(`${prefix} is missing partial`);
    if (seenIds.has(release.id)) errors.push(`${prefix} duplicates id ${release.id}`);
    seenIds.add(release.id);
    if (release.ocid !== example.ocid) {
      errors.push(`${prefix} ocid does not match the example ocid`);
    }
    if (sourceEntry.id && sourceEntry.id !== release.id) {
      errors.push(`${prefix} teaching index id does not match release.id`);
    }
    if (isCanonicalFixture) assertSchema(validateRelease, release, `${prefix} release schema`, errors);
  }

  if (example.sourceHistory) {
    assertFlagshipSemantics(example, releases, entry.file, errors);
    const record = buildRecord(releases);
    assertSchema(validateRelease, record.compiledRelease, `${entry.file}: compiled release schema`, errors);
    assertSchema(validateVersioned, record.versionedRelease, `${entry.file}: versioned release schema`, errors);
    const recordPackage = {
      uri: `https://example-philgeps.gov.ph/records/${example.meta.id}.json`,
      version: "1.1",
      publishedDate: record.compiledRelease.date,
      publisher: { name: "PhilGEPS teaching example" },
      records: [record],
    };
    assertSchema(validateRecordPackage, recordPackage, `${entry.file}: record package schema`, errors);
  }
}

validatePocSamples(pocSamples, errors);
assertSchema(validateReleasePackage, pocReleasePackage, "POC ETL release package schema", errors);
if (pocReleasePackage.releases.length !== Object.keys(pocSamples).length) errors.push("POC ETL release package does not contain every audited release");

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Validated ${manifest.examples.length} teaching catalogues, ${Object.keys(pocSamples).length} proof-of-concept ETL releases, and the assembled release package.`);

function validatePocSamples(samples, target) {
  const expected = {
    "single-row": { lines: 1, items: 1, awards: 1, contracts: 1 },
    "multi-item": { lines: 4, items: 4, awards: 1, contracts: 1 },
    "multi-award": { lines: 2, items: 2, awards: 2, contracts: 2 },
    "cancelled": { lines: 1, items: 1, awards: 0, contracts: 0 },
    "award-only": { lines: 1, items: 1, awards: 1, contracts: 0 },
    "long-service": { lines: 1, items: 1, awards: 1, contracts: 1 },
    "chronology-anomaly": { lines: 1, items: 1, awards: 1, contracts: 0 },
  };
  for (const [name, counts] of Object.entries(expected)) {
    const sample = samples[name];
    if (!sample) {
      target.push(`POC ETL: missing ${name}`);
      continue;
    }
    assertSchema(validateRelease, sample.release, `POC ETL ${name} release schema`, target);
    const actual = {
      lines: sample.provenance.sourceLines.length,
      items: sample.release.tender?.items?.length ?? 0,
      awards: sample.release.awards?.length ?? 0,
      contracts: sample.release.contracts?.length ?? 0,
    };
    for (const [field, value] of Object.entries(counts)) {
      if (actual[field] !== value) target.push(`POC ETL ${name}: expected ${value} ${field}, found ${actual[field]}`);
    }
    for (const contract of sample.release.contracts ?? []) {
      if (!(sample.release.awards ?? []).some((award) => award.id === contract.awardID)) {
        target.push(`POC ETL ${name}: contract ${contract.id} has missing awardID ${contract.awardID}`);
      }
    }
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertSchema(validate, data, label, target) {
  if (!validate(data)) {
    const detail = validate.errors.slice(0, 8).map((error) => `${error.instancePath || "/"} ${error.message}`).join("; ");
    target.push(`${label}: ${detail}`);
  }
}

function buildRecord(input) {
  const releases = [...input].sort((a, b) => a.date.localeCompare(b.date));
  const ocid = releases[0].ocid;
  const compiled = {};
  const versioned = { ocid };
  for (const release of releases) {
    mergeCompiled(compiled, release, true);
    mergeVersioned(versioned, release, {
      releaseID: release.id, releaseDate: release.date, releaseTag: release.tag,
    }, true);
  }
  const latest = releases[releases.length - 1];
  return {
    ocid,
    releases,
    compiledRelease: { ...compiled, ocid, id: `${ocid}-${latest.date}`, date: latest.date, tag: ["compiled"] },
    versionedRelease: versioned,
  };
}

function mergeCompiled(output, input, root = false) {
  for (const [key, value] of Object.entries(input)) {
    if (root && ["id", "date", "tag"].includes(key)) continue;
    if (value === null) delete output[key];
    else if (isObject(value)) {
      const target = isObject(output[key]) ? output[key] : {};
      mergeCompiled(target, value);
      output[key] = target;
    } else if (Array.isArray(value) && !isWholeListField(key) && isIdentifiedArray(value)) {
      const target = Array.isArray(output[key]) ? clone(output[key]) : [];
      for (const item of value) {
        const match = target.find((candidate) => candidate.id === item.id);
        if (match) mergeCompiled(match, item); else target.push(clone(item));
      }
      output[key] = target;
    } else output[key] = clone(value);
  }
}

function mergeVersioned(output, input, metadata, root = false) {
  for (const [key, value] of Object.entries(input)) {
    if (root && ["id", "date", "tag", "ocid"].includes(key)) continue;
    if (isObject(value)) {
      const target = isObject(output[key]) ? output[key] : {};
      mergeVersioned(target, value, metadata);
      output[key] = target;
    } else if (Array.isArray(value) && !isWholeListField(key) && isIdentifiedArray(value)) {
      const target = Array.isArray(output[key]) ? output[key] : [];
      for (const item of value) {
        let match = target.find((candidate) => candidate.id === item.id);
        if (!match) { match = { id: item.id }; target.push(match); }
        mergeVersioned(match, Object.fromEntries(Object.entries(item).filter(([name]) => name !== "id")), metadata);
      }
      output[key] = target;
    } else {
      const history = Array.isArray(output[key]) ? output[key] : [];
      if (!history.length || JSON.stringify(history[history.length - 1].value) !== JSON.stringify(value)) {
        history.push({ ...metadata, value: clone(value) });
      }
      output[key] = history;
    }
  }
}

function isObject(value) { return typeof value === "object" && value !== null && !Array.isArray(value); }
function isIdentifiedArray(value) { return value.length > 0 && value.every((item) => isObject(item) && typeof item.id === "string"); }
function isWholeListField(key) { return WHOLE_LIST_FIELDS.has(key); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }

function assertFlagshipSemantics(example, releases, file, target) {
  const first = releases[0];
  const bidderRelease = releases.find((release) => release.tender?.numberOfTenderers !== undefined);
  const awardRelease = releases.find((release) => release.tag?.includes("award"));
  const implementationReleases = releases.filter((release) => release.tag?.includes("implementation"));

  if (first.tender?.numberOfTenderers !== undefined) {
    target.push(`${file}: notice release must omit numberOfTenderers until bids are known`);
  }
  if (first.parties?.some((party) => party.roles?.some((role) => role === "tenderer" || role === "supplier"))) {
    target.push(`${file}: notice release reveals a tenderer or supplier before bidding`);
  }
  if (!bidderRelease?.parties?.some((party) => party.roles?.includes("tenderer"))) {
    target.push(`${file}: bid-received release must introduce the tenderer party`);
  }
  if (!awardRelease?.parties?.some((party) => party.roles?.includes("supplier"))) {
    target.push(`${file}: award release must introduce the supplier role`);
  }
  if (implementationReleases.some((release) => release.contracts?.some((contract) => contract.implementation?.transactions))) {
    target.push(`${file}: delivery events must use implementation milestones, not spending transactions`);
  }
  if (!implementationReleases.every((release) => release.contracts?.some((contract) => contract.implementation?.milestones?.some((milestone) => milestone.type === "delivery")))) {
    target.push(`${file}: each teaching delivery release must contain a delivery milestone`);
  }
  const lifecycleOnlyColumns = ["Award Date", "Awardee Corporate Title", "Contract Amount", "List of Bidder's"];
  if (lifecycleOnlyColumns.some((column) => column in example.rawRow)) {
    target.push(`${file}: introductory extraction row must contain only notice-event fields`);
  }
}
