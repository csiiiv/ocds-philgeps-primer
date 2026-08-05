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
