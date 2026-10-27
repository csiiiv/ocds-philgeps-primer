import type { OcdsRecord, OcdsRelease } from "./ocdsMerge";

export const LOTS_EXTENSION = "https://raw.githubusercontent.com/open-contracting-extensions/ocds_lots_extension/v1.1.5/extension.json";
const PUBLISHER = { name: "Synthetic OCDS learning examples" };

// Deterministic, non-resolving fixture identities. No real publisher or host is implied.
export function releasePackage(releases: OcdsRelease[], extensions: string[] = []) {
  return {
    uri: "urn:uuid:1e6dd070-5a3c-4afd-a94e-2c7d74c25045", version: "1.1",
    publishedDate: releases[releases.length - 1].date, publisher: PUBLISHER,
    ...(extensions.length ? { extensions } : {}), releases,
  };
}
export function recordPackage(record: OcdsRecord, extensions: string[] = []) {
  return {
    uri: "urn:uuid:60e9ed30-6a01-4380-884f-9e36822a865e", version: "1.1",
    publishedDate: record.compiledRelease.date, publisher: PUBLISHER,
    ...(extensions.length ? { extensions } : {}), records: [record],
  };
}
