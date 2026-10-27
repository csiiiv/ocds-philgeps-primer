import schema from "../../schemas/ocds-release-schema.json";

export const MAPPING_AREAS = [
  { id: "fields", title: "Fields", question: "Where does the value come from?", example: "Join the item and unit tables; turn a price into an amount/currency object.", output: "Source, destination, type, transformation, and missing-value rule." },
  { id: "identity", title: "Identifiers and relationships", question: "What does this identifier identify?", example: "One process can have two awards. Each contract references its award; supplier references resolve to parties.", output: "Stable keys, namespaces, joins, cardinality, and migration rules." },
  { id: "codelists", title: "Codelists", question: "What does the source code mean?", example: "A procedure open to all interested suppliers can map to open. Preserve its local name in procurementMethodDetails.", output: "Source definition, target code, rationale, and review status." },
  { id: "events", title: "Events and releases", question: "Which changes should be published, and when?", example: "A formal deadline amendment creates a new release under the existing OCID. A private draft edit does not.", output: "Trigger, eligibility, release tag, publication timing, and history source." },
];

export const RELEASE_ANATOMY = [
  { path: "ocid", group: "Metadata", meaning: "Stable identity of one contracting process across its releases." },
  { path: "id / date / tag", group: "Metadata", meaning: "Publication identity, publication timestamp, and the kind of information published. These are not object IDs, event timestamps, or source statuses." },
  { path: "initiationType", group: "Metadata", meaning: "How the process was initiated; tender is the core OCDS 1.1.5 code." },
  { path: "planning", group: "Lifecycle", meaning: "Rationale, budget, and planning context. Project identity does not automatically define the process boundary." },
  { path: "tender", group: "Lifecycle", meaning: "Opportunity, procedure, items, submission periods, and tender status." },
  { path: "awards[]", group: "Lifecycle", meaning: "Award decisions, each with its own ID and supplier references." },
  { path: "contracts[]", group: "Lifecycle", meaning: "Contracts reference award IDs. Delivery milestones and payments live under each contract's implementation object." },
  { path: "parties[]", group: "Shared organizations", meaning: "Organization details and roles, referenced from buyer, procuring entity, and suppliers." },
  { path: "buyer", group: "Reference", meaning: "ID/name reference to the organization whose budget pays for the procurement." },
  { path: "relatedProcesses[]", group: "Cross-process links", meaning: "Relationships to other processes; relationship codes are different from release tags." },
];

export const SHARED_STRUCTURES = [
  { name: "OrganizationReference", path: "buyer / tender.procuringEntity / awards[].suppliers[]", lesson: "Use an ID and name that match the intended party. The buyer and procuring entity may be different organizations." },
  { name: "Item + Classification", path: "tender.items[] / awards[].items[] / contracts[].items[]", lesson: "Join descriptions, quantities, units, classification schemes, and codes. Item identity differs from lot identity." },
  { name: "Value", path: "tender.value / awards[].value / contracts[].value", lesson: "Pair amount with currency. An estimate, an award, and a contract can have different amounts; do not silently copy one into another." },
  { name: "Period", path: "tender.tenderPeriod / contracts[].period", lesson: "A bid-submission window and a contract period have different meanings. Neither is the release publication timestamp." },
  { name: "Document", path: "planning.documents[] / tender.documents[]", lesson: "Retain the original URL, title, document type, and relevant dates. A local type label may need codelist mapping." },
  { name: "Milestone", path: "contracts[].implementation.milestones[]", lesson: "Distinguish a target dueDate, a completion dateMet, and a status. A planned end date does not prove delivery occurred." },
  { name: "Amendment", path: "tender.amendments[] / contracts[].amendments[]", lesson: "Explain the formal change and update the affected values in a new release, retaining the same object IDs." },
];

const codes = (values: Array<string | null>) => values.filter((value): value is string => typeof value === "string");
export const CODELISTS = [
  { id: "method", title: "Procurement method", path: "tender.procurementMethod", open: false, codes: codes(schema.definitions.Tender.properties.procurementMethod.enum), note: "Map the procedure's meaning. open allows all interested suppliers; direct means award to one supplier without competition. Retain the local method name in procurementMethodDetails." },
  { id: "tender-status", title: "Tender status", path: "tender.status", open: false, codes: codes(schema.definitions.Tender.properties.status.enum), note: "complete is the end of the tender procedure, not evidence that a contract was delivered. cancelled and unsuccessful have distinct meanings." },
  { id: "award-status", title: "Award status", path: "awards[].status", open: false, codes: codes(schema.definitions.Award.properties.status.enum), note: "An active award can exist before a contract is signed. Do not infer contract status from award status." },
  { id: "contract-status", title: "Contract status", path: "contracts[].status", open: false, codes: codes(schema.definitions.Contract.properties.status.enum), note: "signed is not a contractStatus code. Record signature in dateSigned and establish the actual contract status separately." },
  { id: "party-role", title: "Party role", path: "parties[].roles[]", open: true, codes: ["buyer", "procuringEntity", "tenderer", "supplier", "funder", "payer", "payee"], note: "Selected standard roles are shown here, not the full list. One party can have several roles. Reuse standard codes where appropriate; document any necessary additional code in an extension and publication policy." },
  { id: "release-tag", title: "Release tag", path: "tag[]", open: false, codes: codes(schema.properties.tag.items.enum), note: "Tags describe published information, not the current source workflow status. tenderAmendment describes a formal amendment; tenderUpdate describes an update or correction. compiled is reserved for the derived compiled view." },
];

export interface CodelistQuestion {
  id: string; source: string; meaning: string; path: string; choices: string[]; answer: string; explanation: string;
}
export const CODELIST_QUESTIONS: CodelistQuestion[] = [
  { id: "public-bidding", source: "Public Bidding", meaning: "The source definition confirms that any interested supplier may submit a bid.", path: "tender.procurementMethod", choices: ["open", "direct", "publicBidding", "unresolved"], answer: "open", explanation: "The meaning supports open. Preserve Public Bidding in procurementMethodDetails; the local label is not itself a standard method code." },
  { id: "unknown-method", source: "Alternative Mode 7", meaning: "No source definition or procedure documentation is available.", path: "tender.procurementMethod", choices: ["limited", "direct", "open", "unresolved"], answer: "unresolved", explanation: "A code label alone cannot establish whether competition was open, selective, limited, or absent. Ask the source owner and document the unresolved mapping." },
  { id: "signature", source: "Signed", meaning: "The source records a signature date but does not say whether the contract is in force.", path: "contracts[].status", choices: ["signed", "active", "complete", "unresolved"], answer: "unresolved", explanation: "Publish the known signature date in dateSigned. signed and complete are not contractStatus codes, and the available evidence does not establish active." },
  { id: "valid-wrong", source: "Direct award", meaning: "One supplier was selected without competition. A proposed mapping uses the valid code open.", path: "tender.procurementMethod", choices: ["open", "direct", "selective", "unresolved"], answer: "direct", explanation: "open is a valid code with the wrong meaning here. Schema membership is necessary but not sufficient; this described procedure supports direct." },
];

export const MAPPING_CLASSIFICATIONS = [
  { name: "Direct", example: "A verified source title becomes tender.title without changing its meaning." },
  { name: "Derived", example: "Build an OCID from a synthetic publisher prefix and a verified stable process key." },
  { name: "Transformed", example: "Parse an amount and attach its known currency, or map a local procedure definition to an OCDS code." },
  { name: "Missing / unresolved", example: "Leave an unknown signature date absent; record a question and an owner instead of inventing a date." },
];
