export interface FieldTraceValue {
  sourceLine: number;
  sourceValue: string;
  ocdsPath: string;
  ocdsValue: string;
}

export interface FieldTrace {
  id: string;
  sourceField: string;
  label: string;
  journeyId: string;
  example: string;
  rule: string;
  rationale: string;
  caution?: string;
  values: FieldTraceValue[];
}

export const FIELD_TRACES: FieldTrace[] = [
  {
    id: "bid-reference",
    sourceField: "Bid Reference No.",
    label: "Process identity",
    journeyId: "poc-multi-award",
    example: "City of Cebu · two rows, two awards",
    rule: "Normalize the usable bid reference and combine it with the buyer under the publisher's OCID prefix. Repeated rows with the same process key retain one OCID.",
    rationale: "The OCID joins tender, award, and contract information for one contracting process. Award numbers identify children of that process.",
    values: [
      { sourceLine: 21179, sourceValue: "9342044", ocdsPath: "ocid", ocdsValue: "ocds-philgeps-poc-9342044-city-of-cebu-cebu" },
      { sourceLine: 21180, sourceValue: "9342044", ocdsPath: "ocid", ocdsValue: "ocds-philgeps-poc-9342044-city-of-cebu-cebu" },
    ],
  },
  {
    id: "identity-fallback",
    sourceField: "Bid Reference No.",
    label: "Identity fallback",
    journeyId: "poc-single-row",
    example: "National Meat Inspection Service · zero bid reference",
    rule: "Treat 0 as unusable. For this audited fixture only, fall back to Solicitation No. plus buyer and record the fallback in provenance.",
    rationale: "Sentinel values must not collapse unrelated processes into one OCID.",
    caution: "This fallback is a POC rule, not yet a production-wide uniqueness claim.",
    values: [
      { sourceLine: 2, sourceValue: "0; fallback Solicitation No. = 23-11-1710", ocdsPath: "ocid", ocdsValue: "ocds-philgeps-poc-23-11-1710-national-meat-inspection" },
    ],
  },
  {
    id: "item-description",
    sourceField: "Item Description",
    label: "Repeated line items",
    journeyId: "poc-multi-item",
    example: "Municipality of Liliw · four source rows",
    rule: "Use Line Item No as the item identifier and preserve each row's description as a separate tender item.",
    rationale: "Repeated rows describe four items within one process; they are not four releases or four contracting processes.",
    values: [
      { sourceLine: 23448, sourceValue: "10 THHN Wire (150mtrs/box)", ocdsPath: "tender.items[id=4].description", ocdsValue: "10 THHN Wire (150mtrs/box)" },
      { sourceLine: 23449, sourceValue: "100 watts LED Streetlight", ocdsPath: "tender.items[id=1].description", ocdsValue: "100 watts LED Streetlight" },
      { sourceLine: 23450, sourceValue: "LED Power Supply Driver -240W-12 220V 50%", ocdsPath: "tender.items[id=2].description", ocdsValue: "LED Power Supply Driver -240W-12 220V 50%" },
      { sourceLine: 23451, sourceValue: "100W White LED Light High Power Lamp 24x44ML 12V", ocdsPath: "tender.items[id=3].description", ocdsValue: "100W White LED Light High Power Lamp 24x44ML 12V" },
    ],
  },
  {
    id: "award-number",
    sourceField: "Award No.",
    label: "Multiple awards",
    journeyId: "poc-multi-award",
    example: "City of Cebu · one process, two awards",
    rule: "Group by process identity first, then create one awards[] object for each distinct Award No.",
    rationale: "This retains both awards under one OCID instead of splitting one tender into separate processes.",
    values: [
      { sourceLine: 21179, sourceValue: "4193158", ocdsPath: "awards[id=4193158].id", ocdsValue: "4193158" },
      { sourceLine: 21180, sourceValue: "4193159", ocdsPath: "awards[id=4193159].id", ocdsValue: "4193159" },
    ],
  },
  {
    id: "contract-number",
    sourceField: "Contract No",
    label: "Contract relationships",
    journeyId: "poc-multi-award",
    example: "City of Cebu · two contracts linked to two awards",
    rule: "Create one contracts[] object for each Contract No and set awardID from the Award No on the same source row.",
    rationale: "The explicit reference makes the award-to-contract relationship machine-readable.",
    values: [
      { sourceLine: 21179, sourceValue: "0261 · Award No. 4193158", ocdsPath: "contracts[id=0261].awardID", ocdsValue: "4193158" },
      { sourceLine: 21180, sourceValue: "0262 · Award No. 4193159", ocdsPath: "contracts[id=0262].awardID", ocdsValue: "4193159" },
    ],
  },
  {
    id: "contract-amount",
    sourceField: "Contract Amount",
    label: "Monetary values",
    journeyId: "poc-multi-award",
    example: "City of Cebu · award and contract values",
    rule: "Parse the numeric amount, attach PHP explicitly, and publish it on the corresponding award and contract.",
    rationale: "OCDS monetary values are objects containing both amount and currency.",
    values: [
      { sourceLine: 21179, sourceValue: "440000.00", ocdsPath: "awards[id=4193158].value", ocdsValue: "{ amount: 440000, currency: PHP }" },
      { sourceLine: 21179, sourceValue: "440000.00", ocdsPath: "contracts[id=0261].value", ocdsValue: "{ amount: 440000, currency: PHP }" },
      { sourceLine: 21180, sourceValue: "498600.00", ocdsPath: "awards[id=4193159].value", ocdsValue: "{ amount: 498600, currency: PHP }" },
      { sourceLine: 21180, sourceValue: "498600.00", ocdsPath: "contracts[id=0262].value", ocdsValue: "{ amount: 498600, currency: PHP }" },
    ],
  },
];
