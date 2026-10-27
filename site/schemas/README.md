# OCDS standard schemas

Vendored copies of the OCDS 1.1 standard JSON schemas, used by
`scripts/validate-examples.mjs` to validate the teaching fixtures during
`npm run build`. Checked in so the build is self-contained and runs in CI
without depending on files outside this repository.

Source: [OCDS 1.1.x documentation](https://standard.open-contracting.org/latest/en/schema/)
and the [`ocds` schema repository](https://github.com/open-contracting/standard).

Files:

- `ocds-release-schema.json` — the release schema.
- `ocds-versioned-release-validation-schema.json` — the versioned release validation schema.
- `ocds-record-package-schema.json` — the record package schema.
- `ocds-release-package-schema.json` — the release package schema.

`extensions/lots-1.1.5-extension.json` and
`extensions/lots-1.1.5-release-schema.json` are unmodified vendored copies from
[Lots extension v1.1.5](https://github.com/open-contracting-extensions/ocds_lots_extension/tree/v1.1.5).
The learning checks apply the release-schema JSON Merge Patch to the base schema
in a separate validator, then validate the solar-pump release and record packages.
Party, item/lot, and award/contract relationships are also checked semantically.
Versioned views are checked against the vendored base versioned schema and their
party histories are checked explicitly; this is not a general extension-aware
versioned-schema generator or production merge engine.
