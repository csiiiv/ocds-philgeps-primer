import source from "../../../examples/solar-pump-mapping.json";
import { buildOcdsRecord, type OcdsRelease } from "./ocdsMerge";
import { LOTS_EXTENSION, recordPackage, releasePackage } from "./teachingPackages";

export const SOLAR_SOURCE = source;
export const SOLAR_OCID = "ocds-example-solar-001";
export const SOLAR_STEPS = ["Tender published", "First lot awarded", "Supplier name corrected", "Second lot awarded", "Two contracts signed"];

function organization(id: string, corrected = false) {
  const row = source.organizations.find((entry) => entry.id === id)!;
  return { id: row.id, name: corrected && id === source.supplierCorrection.supplierID ? source.supplierCorrection.name : row.name };
}
function items(lotID?: string) {
  return source.items.filter((row) => !lotID || row.lotID === lotID).map((row) => {
    const unit = source.units.find((entry) => entry.id === row.unitID)!;
    const classification = source.classifications.find((entry) => entry.id === row.classificationID)!;
    return { id: row.id, description: row.description, quantity: row.quantity, unit: { name: unit.name }, classification: { ...classification }, relatedLot: row.lotID };
  });
}

/** Illustrative source joins, not a claim about PhilGEPS table names or business rules. */
export function solarReleases(sameSupplier = false): OcdsRelease[] {
  const base = (id: string, date: string, tag: string[]) => ({ ocid: SOLAR_OCID, id, date, tag, initiationType: "tender" });
  const award = (index: number, corrected: boolean) => {
    const row = source.awards[index];
    const supplierID = sameSupplier ? "SUP-1" : row.supplierID;
    return {
      id: row.id, title: `Award for ${row.lotID}`, status: "active", date: row.date,
      value: { amount: row.amount, currency: source.process.currency },
      suppliers: [organization(supplierID, corrected)], relatedLots: [row.lotID], items: items(row.lotID),
    };
  };
  const supplier = (id: string, corrected: boolean) => ({ ...organization(id, corrected), roles: ["tenderer", "supplier"] });
  const secondSupplierID = sameSupplier ? "SUP-1" : source.awards[1].supplierID;
  return [
    {
      ...base("solar-001", source.process.opens, ["tender"]),
      parties: source.organizations.map((row) => ({ ...organization(row.id), roles: [...row.roles], ...("registrationID" in row ? { identifier: { scheme: "EXAMPLE-REGISTRY", id: row.registrationID } } : {}) })),
      buyer: organization(source.process.buyerID),
      planning: { rationale: "Fictional irrigation equipment programme", budget: { projectID: source.process.projectID, description: `Planning reference ${source.process.planReference}`, amount: { amount: source.process.estimatedAmount, currency: source.process.currency } } },
      tender: {
        id: source.process.id, title: source.process.title, status: "active", procuringEntity: organization(source.process.procuringEntityID),
        procurementMethod: "open", procurementMethodDetails: "Public Bidding (illustrative source definition)",
        value: { amount: source.process.estimatedAmount, currency: source.process.currency },
        tenderPeriod: { startDate: source.process.opens, endDate: source.process.closes },
        lots: source.lots.map((row) => ({ id: row.id, title: row.title, status: "active", value: { amount: row.estimatedAmount, currency: source.process.currency } })), items: items(),
      },
    },
    { ...base("solar-002", source.awards[0].date, ["award"]), parties: [supplier("SUP-1", false)], tender: { id: source.process.id, status: "active", lots: [{ id: "LOT-1", status: "complete" }] }, awards: [award(0, false)] },
    { ...base("solar-003", source.supplierCorrection.date, ["awardUpdate"]), parties: [supplier("SUP-1", true)], awards: [{ id: "AWD-1", suppliers: [organization("SUP-1", true)] }] },
    { ...base("solar-004", source.awards[1].date, ["award"]), parties: [supplier(secondSupplierID, true)], tender: { id: source.process.id, status: "complete", lots: [{ id: "LOT-2", status: "complete" }] }, awards: [award(1, true)] },
    {
      ...base("solar-005", source.contracts[0].dateSigned, ["contract"]),
      contracts: source.contracts.map((row) => {
        const awardRow = source.awards.find((entry) => entry.id === row.awardID)!;
        return { id: row.id, awardID: row.awardID, status: "active", title: `Contract for ${awardRow.lotID}`, dateSigned: row.dateSigned, value: { amount: row.amount, currency: source.process.currency }, period: { startDate: row.start, endDate: row.end }, items: items(awardRow.lotID) };
      }),
    },
  ];
}

export function solarArtifacts(step = SOLAR_STEPS.length, sameSupplier = false) {
  const releases = solarReleases(sameSupplier).slice(0, Math.max(1, Math.min(step, SOLAR_STEPS.length)));
  const record = buildOcdsRecord(releases);
  return { releases, record, releasePackage: releasePackage(releases, [LOTS_EXTENSION]), recordPackage: recordPackage(record, [LOTS_EXTENSION]) };
}

export const SOLAR_TRACES = [
  { id: "planning", title: "Project and planning context", source: "process.projectID / process.planReference / process.id", join: "A project and its planning reference can lead to several procedures. This lab maps one procedure to one OCID.", classification: "Direct context + derived process identity", destination: "planning.budget.projectID / planning.budget.description / ocid", rule: "Keep the project reference distinct from the process key. The planning reference is described as source context here; do not invent a new core property or assume the APP is one-to-one with a procedure.", example: { ocid: SOLAR_OCID, planning: { budget: { projectID: source.process.projectID, description: `Planning reference ${source.process.planReference}` } } } },
  { id: "party", title: "Buyer and procuring entity", source: "process.buyerID / process.procuringEntityID → organizations.id", join: "Two foreign keys, two organization references. In this lab the organizations differ.", classification: "Joined reference", destination: "buyer / tender.procuringEntity / parties[]", rule: "Resolve each source ID and copy the matching name into the reference. Keep role-specific party entries.", example: { buyer: organization(source.process.buyerID), procuringEntity: organization(source.process.procuringEntityID) } },
  { id: "organization-id", title: "Party ID and registry identifier", source: "organizations.id / organizations.registrationID", join: "The party key supports references; the registry number belongs to a named identification scheme.", classification: "Direct + scheme assignment", destination: "parties[].id / parties[].identifier", rule: "The lab uses an explicitly fictional scheme. Production needs a verified registry scheme, source IDs, and documented resolution rules.", example: { id: "SUP-1", identifier: { scheme: "EXAMPLE-REGISTRY", id: "EXAMPLE-001" } } },
  { id: "items", title: "Items, units, and classification", source: "items.unitID → units.id; items.classificationID → classifications.id", join: "Three item rows join unit and classification lookups. Two of the items share a lot.", classification: "Joined transformation", destination: "tender.items[]", rule: "Preserve each item ID and relatedLot. Classification and registration schemes beginning EXAMPLE are fictional placeholders.", example: items() },
  { id: "lots", title: "Items are not lots", source: "items.lotID / awards.lotID → lots.id", join: "LOT-1 has two items, LOT-2 has one. Each award references its lot.", classification: "One-to-many relationship", destination: "tender.lots[] / items[].relatedLot / awards[].relatedLots", rule: "Declare the pinned Lots extension in each package. Keep item, lot, and award namespaces separate.", example: { item: { id: "ITEM-1", relatedLot: "LOT-1" }, award: { id: "AWD-1", relatedLots: ["LOT-1"] } } },
  { id: "contract", title: "Contract to award", source: "contracts.awardID → awards.id", join: "CON-1 refers to AWD-1; CON-2 refers to AWD-2. Do not assume this cardinality for every source system.", classification: "Foreign-key reference", destination: "contracts[].awardID", rule: "Resolve the award within the same OCID and preserve the reference across later contract updates.", example: source.contracts.map((row) => ({ id: row.id, awardID: row.awardID })) },
  { id: "values", title: "Estimate, award, and contract values", source: "process.estimatedAmount / awards.amount / contracts.amount", join: "Different source columns represent different business facts.", classification: "Value transformation", destination: "tender.value / awards[].value / contracts[].value", rule: "Attach the known currency and use each amount's own source. Differences are deliberate in this fictional example, not an unexplained normalization.", example: { estimate: 3000000, totalAwards: 2800000, totalContracts: 2760000, currency: "PHP" } },
  { id: "periods", title: "Dates and periods", source: "process.opens / process.closes / contracts.dateSigned / contracts.start / contracts.end", join: "Tender and contract rows supply different kinds of dates.", classification: "Typed date/period transformation", destination: "tender.tenderPeriod / contracts[].dateSigned / contracts[].period", rule: "Preserve timezone offsets and the meaning of each date. A planned contract end does not prove actual delivery, and release.date is the publication time rather than a substitute for these source dates.", example: { tenderPeriod: { startDate: source.process.opens, endDate: source.process.closes }, dateSigned: source.contracts[0].dateSigned, contractPeriod: { startDate: source.contracts[0].start, endDate: source.contracts[0].end } } },
];

export const PROCESS_SCENARIOS = [
  { id: "multiple-awards", title: "Several awards, one procedure", policy: "The two lots belong to the same procurement procedure. Multiple awards and contracts retain one OCID.", links: { ocid: SOLAR_OCID, awards: ["AWD-1", "AWD-2"], contracts: [{ id: "CON-1", awardID: "AWD-1" }, { id: "CON-2", awardID: "AWD-2" }] } },
  { id: "project", title: "One project, several procurements", policy: "A project can fund equipment and construction through separate procedures. A shared project reference does not collapse their OCIDs.", links: { projectID: "PROJECT-SOLAR", processes: ["ocds-example-equipment-001", "ocds-example-works-001"] } },
  { id: "rebid-new", title: "Re-bidding as a distinct process", policy: "If publication policy treats the later attempt as a distinct procedure, assign a new OCID and link back to the unsuccessful process. This is an illustrative policy choice, not a rule for every re-bid.", links: { ocid: "ocds-example-rebid-002", relatedProcesses: [{ id: "previous-attempt", relationship: ["unsuccessfulProcess"], scheme: "ocid", identifier: "ocds-example-rebid-001" }] } },
  { id: "rebid-same", title: "A change within the existing process", policy: "If the activity remains within the same contracting process under the publisher's documented policy, preserve the OCID and publish the appropriate updates. Establish source semantics before choosing tags; cancellation alone does not decide identity.", links: { ocid: SOLAR_OCID, note: "Same process identity; additional releases preserve the history." } },
];
