/**
 * Fetches the seed snapshot the demo boots from: the files
 * seedSnapshotPlugin() (vite.ts) serves in dev and ships with the build.
 *
 * Lives outside lib/engine and imports only the engine's types, so the
 * phone entry can start these downloads at load without pulling the
 * engine chunk onto its initial load path.
 */

import { seedSnapshotUrls } from "virtual:care-y-seed-snapshot";
import { SeedSnapshotFetchError } from "./errors.js";
import type { SeedSnapshotFiles } from "./engine/engine.js";

async function fetchBytes(url: string, what: string): Promise<Uint8Array> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (err: unknown) {
    throw new SeedSnapshotFetchError(
      `Fetching the seed snapshot's ${what} failed`,
      { cause: err },
    );
  }
  if (!response.ok) {
    throw new SeedSnapshotFetchError(
      `Fetching the seed snapshot's ${what} answered ${String(response.status)}`,
    );
  }
  return new Uint8Array(await response.arrayBuffer());
}

/** Download the snapshot's three files in parallel. */
export async function fetchSeedSnapshot(): Promise<SeedSnapshotFiles> {
  const [rows, blobs, manifest] = await Promise.all([
    fetchBytes(seedSnapshotUrls.rows, "rows"),
    fetchBytes(seedSnapshotUrls.blobs, "blobs"),
    fetchBytes(seedSnapshotUrls.manifest, "manifest"),
  ]);
  return { rows, blobs, manifestText: new TextDecoder().decode(manifest) };
}
