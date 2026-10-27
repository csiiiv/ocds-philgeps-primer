import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import Ajv from "ajv-draft-04";
import addFormats from "ajv-formats";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => JSON.parse(readFileSync(resolve(root, file), "utf8"));
// Bundle the website's actual TS/JSON modules in memory. No test server,
// network connection, duplicate merge implementation, or generated files.
const bundle = await build({ configFile: false, root, logLevel: "silent", build: {
  ssr: resolve(root, "scripts/learning-modules.ts"), write: false, minify: false, target: "node20",
  rollupOptions: { output: { inlineDynamicImports: true } },
} });
const code = bundle.output.find((entry) => entry.type === "chunk").code;
const { simulation, source, solar, packages, workshop, search } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);

function mergePatch(target, patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return structuredClone(patch);
  const output = target && typeof target === "object" && !Array.isArray(target) ? structuredClone(target) : {};
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) delete output[key]; else output[key] = mergePatch(output[key], value);
  }
  return output;
}

function validators(lots = false) {
  const ajv = new Ajv({ allErrors: true, strict: false }); addFormats(ajv);
  let release = read("schemas/ocds-release-schema.json");
  if (lots) release = mergePatch(release, read("schemas/extensions/lots-1.1.5-release-schema.json"));
  ajv.addSchema(release); ajv.addSchema(read("schemas/ocds-versioned-release-validation-schema.json"));
  return {
    release: ajv.getSchema(release.id),
    releasePackage: ajv.compile(read("schemas/ocds-release-package-schema.json")),
    recordPackage: ajv.compile(read("schemas/ocds-record-package-schema.json")),
  };
}
const core = validators(); const extended = validators(true);
const valid = (validator, data) => assert(validator(data), JSON.stringify(validator.errors));
const { initialSimulation, stepSimulation, STORY_EVENTS, pendingPublications, simulationRecord } = simulation;

test("source snapshots precede publication, retain captured before/after rows, and reset independently", () => {
  const empty = source.sourceDatabase(0);
  assert(Object.values(empty.tables).every((rows) => rows.length === 0));
  assert.equal(empty.captured_events.length, 0);
  let state = initialSimulation();
  for (let index = 0; index < 3; index++) state = stepSimulation(state, "advance", "scheduled", "demand");
  const first = source.sourceDatabase(1);
  const original = JSON.stringify(first);
  const current = source.sourceDatabase(state.cursor);
  assert.equal(state.published.length, 0);
  assert.equal(current.tables.tenders[0].closing_at, "2024-03-25T17:00:00+08:00");
  assert.equal(current.tables.tenders[0].title, first.tables.tenders[0].title);
  assert.equal(first.tables.tenders[0].closing_at, "2024-03-20T17:00:00+08:00");
  const deadline = current.captured_events[2].changes.find((change) => change.table === "tenders");
  assert.equal(deadline.before.closing_at, first.tables.tenders[0].closing_at);
  assert.equal(deadline.after.closing_at, current.tables.tenders[0].closing_at);
  assert.equal(current.captured_events[1].publication_eligible, false);
  assert.equal(current.captured_events[1].changes[0].table, "internal_notes");
  assert.notEqual(current.tables.internal_notes[0].body, first.tables.internal_notes[0].body);
  state = stepSimulation(state, "publish", "scheduled", "demand");
  assert.deepEqual(source.sourceDatabase(state.cursor), current);
  assert(!JSON.stringify(state.published).includes("Draft review"));
  assert.equal(JSON.stringify(first), original);
  assert.deepEqual(source.sourceDatabase(stepSimulation(state, "reset", "scheduled", "demand").cursor), empty);
});

test("source rows preserve keys and missing dates through the complete story", () => {
  const complete = source.sourceDatabase(STORY_EVENTS.length);
  assert.equal(complete.tables.tenders.length, 1);
  assert.equal(complete.tables.organizations.length, 2);
  assert.equal(complete.tables.tenderers.length, 1);
  assert.equal(complete.tables.awards.length, 1);
  assert.equal(complete.tables.contracts.length, 1);
  assert.equal(complete.tables.deliveries.length, 2);
  assert.equal(complete.tables.contracts[0].award_id, complete.tables.awards[0].award_id);
  assert.equal(complete.tables.awards[0].supplier_id, complete.tables.tenderers[0].organization_id);
  for (const delivery of complete.tables.deliveries) assert.equal(delivery.contract_id, complete.tables.contracts[0].contract_id);
  assert.equal(complete.tables.deliveries[0].completed_at, "2024-06-10T16:00:00+08:00");
  assert(!("completed_at" in complete.tables.deliveries[1]));
  assert(!complete.captured_events.at(-1).changes.some((change) => change.table === "contracts"));
  // Each retained after-image remains the state at its own event.
  const firstTender = complete.captured_events[0].changes.find((change) => change.table === "tenders");
  assert.equal(firstTender.after.closing_at, "2024-03-20T17:00:00+08:00");
});

test("a private draft edit creates no release; published objects stay immutable", () => {
  const sourceBefore = JSON.stringify(STORY_EVENTS);
  const start = initialSimulation();
  const first = stepSimulation(start, "advance", "event", "event");
  const archiveBefore = JSON.stringify(first.published);
  const draft = stepSimulation(first, "advance", "event", "event");
  assert.equal(draft.cursor, 2); assert.equal(draft.published.length, 1); assert.equal(draft.recordCount, 1);
  assert.equal(JSON.stringify(first.published), archiveBefore); assert.equal(start.published.length, 0);
  assert.equal(JSON.stringify(STORY_EVENTS), sourceBefore);
});

test("requesting a record never publishes pending source changes", () => {
  let state = stepSimulation(initialSimulation(), "advance", "demand", "demand");
  assert.equal(pendingPublications(state), 1);
  state = stepSimulation(state, "record", "demand", "demand");
  assert.equal(state.published.length, 0); assert.equal(simulationRecord(state), undefined);
  state = stepSimulation(state, "publish", "demand", "demand");
  assert.equal(state.published.length, 1); assert.equal(state.recordCount, 0);
  state = stepSimulation(state, "record", "demand", "demand");
  const record = simulationRecord(state);
  assert.equal(record.releases.length, 1);
  const generationTime = state.recordGeneratedAt;
  state = stepSimulation(state, "record", "demand", "demand");
  assert.equal(state.published.length, 1); assert.equal(state.recordGeneratedAt, generationTime);
});

for (const publicationMode of ["event", "scheduled", "demand"]) {
  for (const recordMode of ["event", "scheduled", "demand"]) {
    test(`${publicationMode} publication / ${recordMode} record: capture, publish, merge, and retry`, () => {
      let state = initialSimulation();
      for (const event of STORY_EVENTS) {
        const before = JSON.stringify(state);
        const original = state;
        state = stepSimulation(state, "advance", publicationMode, recordMode);
        assert.equal(JSON.stringify(original), before, `state mutated on ${event.id}`);
      }
      if (publicationMode !== "event") {
        assert.equal(state.published.length, 0);
        assert.equal(pendingPublications(state), 7);
        state = stepSimulation(state, "publish", publicationMode, recordMode);
      }
      assert.equal(state.published.length, 7); assert.equal(pendingPublications(state), 0);
      if (recordMode !== "event") {
        assert.equal(state.recordCount, 0);
        state = stepSimulation(state, "record", publicationMode, recordMode);
      }
      const record = simulationRecord(state);
      assert.equal(record.releases.length, 7);
      assert.equal(new Set(record.releases.map((release) => release.id)).size, 7);
      assert.equal(new Set(record.releases.map((release) => release.ocid)).size, 1);
      for (let index = 1; index < record.releases.length; index++) {
        assert(Date.parse(record.releases[index].date) > Date.parse(record.releases[index - 1].date), "publication order must remain chronological, including batched amendments");
      }
      assert.equal(record.compiledRelease.tender.title, "Supply and Delivery of Laptop Computers");
      assert.equal(record.compiledRelease.tender.tenderPeriod.endDate, "2024-03-25T17:00:00+08:00");
      assert.equal(record.versionedRelease.tender.tenderPeriod.endDate.length, 2);
      assert.equal(record.compiledRelease.contracts[0].implementation.milestones.length, 2);
      assert.deepEqual(record.releases.at(-1).tag, ["implementationUpdate"]);
      for (const release of record.releases) valid(core.release, release);
      valid(core.releasePackage, packages.releasePackage(record.releases));
      valid(core.recordPackage, packages.recordPackage(record));
      const archive = JSON.stringify(state.published);
      state = stepSimulation(state, "publish", publicationMode, recordMode);
      state = stepSimulation(state, "publish", publicationMode, recordMode);
      state = stepSimulation(state, "record", publicationMode, recordMode);
      assert.equal(JSON.stringify(state.published), archive);
      assert.deepEqual(stepSimulation(state, "reset", publicationMode, recordMode), initialSimulation());
    });
  }
}

test("an older record snapshot includes only its listed releases until regeneration", () => {
  let state = stepSimulation(initialSimulation(), "advance", "event", "demand");
  state = stepSimulation(state, "record", "event", "demand");
  state = stepSimulation(state, "advance", "event", "demand"); // private edit
  state = stepSimulation(state, "advance", "event", "demand"); // deadline amendment
  assert.equal(state.published.length, 2); assert.equal(state.recordCount, 1);
  assert.equal(simulationRecord(state).compiledRelease.tender.tenderPeriod.endDate, "2024-03-20T17:00:00+08:00");
  state = stepSimulation(state, "record", "event", "demand");
  const changes = simulation.fieldChanges(simulationRecord(state, state.previousRecordCount).compiledRelease, simulationRecord(state).compiledRelease);
  assert(changes.some((change) => change.path === "tender.tenderPeriod.endDate" && change.before === "2024-03-20T17:00:00+08:00" && change.after === "2024-03-25T17:00:00+08:00"));
  assert(!changes.some((change) => change.path === "tender.title"));
});

function assertRelationships(record) {
  const current = record.compiledRelease;
  const parties = new Map(current.parties.map((party) => [party.id, party]));
  assert.equal(parties.size, current.parties.length);
  for (const reference of [current.buyer, current.tender.procuringEntity, ...(current.awards ?? []).flatMap((award) => award.suppliers)]) {
    assert.equal(reference.name, parties.get(reference.id)?.name, `unresolved party ${reference.id}`);
  }
  const lots = new Set(current.tender.lots.map((lot) => lot.id));
  for (const item of current.tender.items) assert(lots.has(item.relatedLot));
  for (const award of current.awards ?? []) {
    for (const lot of award.relatedLots) assert(lots.has(lot));
    for (const item of award.items) assert(award.relatedLots.includes(item.relatedLot));
  }
  const awards = new Set((current.awards ?? []).map((award) => award.id));
  for (const contract of current.contracts ?? []) assert(awards.has(contract.awardID));
}

for (const sameSupplier of [false, true]) {
  test(`solar lab with ${sameSupplier ? "one supplier winning both lots" : "different suppliers"}: extended schema and joins at every step`, () => {
    for (let step = 1; step <= 5; step++) {
      const result = solar.solarArtifacts(step, sameSupplier);
      assert.deepEqual(result.releasePackage.extensions, [packages.LOTS_EXTENSION]);
      assert.deepEqual(result.recordPackage.extensions, [packages.LOTS_EXTENSION]);
      valid(extended.releasePackage, result.releasePackage);
      valid(extended.recordPackage, result.recordPackage);
      assertRelationships(result.record);
      assert.equal(result.record.releases.length, step);
      assert.equal(result.record.compiledRelease.tender.items.length, 3);
      assert.equal(result.record.compiledRelease.tender.lots.length, 2);
    }
    const { record } = solar.solarArtifacts(5, sameSupplier);
    assert.equal(record.compiledRelease.awards.length, 2);
    assert.equal(record.compiledRelease.contracts.length, 2);
    assert.notEqual(record.compiledRelease.buyer.id, record.compiledRelease.tender.procuringEntity.id);
    const supplierIDs = new Set(record.compiledRelease.awards.flatMap((award) => award.suppliers.map((party) => party.id)));
    assert.equal(supplierIDs.size, sameSupplier ? 1 : 2);
    assert.equal(record.releases[1].parties[0].name, "Solar Equipment Cooperative");
    assert.equal(record.compiledRelease.parties.find((party) => party.id === "SUP-1").name, "Solar Equipment Cooperative A");
    assert.equal(record.versionedRelease.parties.find((party) => party.id === "SUP-1").name.length, 2);
    assert.equal(record.compiledRelease.tender.value.amount, 3000000);
    assert.equal(record.compiledRelease.awards.reduce((total, award) => total + award.value.amount, 0), 2800000);
    assert.equal(record.compiledRelease.contracts.reduce((total, contract) => total + contract.value.amount, 0), 2760000);
  });
}

test("the extended schema catches invalid lot status and item/award references are checked semantically", () => {
  const result = solar.solarArtifacts();
  const invalid = structuredClone(result.releasePackage);
  invalid.releases[0].tender.lots[0].status = "awarded";
  assert.equal(extended.releasePackage(invalid), false);
  const broken = structuredClone(result.record);
  broken.compiledRelease.contracts[0].awardID = "missing-award";
  assert.throws(() => assertRelationships(broken));
});

test("supplied workshop workbooks exist and new lessons are searchable", () => {
  assert.equal(workshop.WORKSHOP_TEMPLATES.length, 3);
  assert.equal(workshop.MAPPING_EXPLORER_URL, "https://csiiiv.github.io/ocds_mapping_explorer/");
  assert.equal(new Set(workshop.WORKSHOP_TEMPLATES.map((template) => template.asset)).size, 3);
  for (const template of workshop.WORKSHOP_TEMPLATES) {
    assert(/^[a-z0-9.-]+\.xlsx$/.test(template.asset), "Download asset names must be URL-safe");
    const path = resolve(root, "../templates", template.file);
    assert(existsSync(path));
    assert(template.file.endsWith(".xlsx"));
    assert(template.title && template.purpose);
    assert.equal(readFileSync(path).subarray(0, 4).toString("hex"), "504b0304", `${template.file} is not an XLSX/ZIP file`);
  }
  for (const query of ["codelist", "procurement replay", "supplier", "workshop", "on demand"]) {
    assert(search.searchDocuments(query).length > 0, `No search results for ${query}`);
  }
});
