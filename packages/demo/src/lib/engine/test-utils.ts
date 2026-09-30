/**
 * The seed snapshot the engine smoke tests boot from.
 *
 * Reuses packages/demo/.seed-snapshot/ when its content hash matches the
 * current sources. Otherwise it builds a fresh snapshot into a temp dir
 * through the real builder. It never writes the default dir, so smoke
 * files running in parallel cannot collide there.
 */

// Bare builtin names: the smoke config aliases the node: forms of fs, path
// and crypto to the engine's browser shims.
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { SeedSnapshotFormatError } from "@care-y/shared/dev/seed-snapshot.js";
import {
  DEFAULT_SEED_SNAPSHOT_DIR,
  buildSeedSnapshot,
  computeSeedSnapshotHash,
  readSeedSnapshot,
  type SeedSnapshotContents,
} from "../../../scripts/build-seed-snapshot.js";
import type { SeedSnapshotSource } from "./engine.js";

/** A fresh build replays every seed story, which takes a while. */
export const SMOKE_SNAPSHOT_TIMEOUT_MS = 900_000;

function isMissingFile(err: unknown): boolean {
  return err instanceof Error && "code" in err && err.code === "ENOENT";
}

async function readCurrentDefault(): Promise<SeedSnapshotContents | null> {
  let contents: SeedSnapshotContents;
  try {
    contents = await readSeedSnapshot(DEFAULT_SEED_SNAPSHOT_DIR);
  } catch (err: unknown) {
    // No snapshot there yet, or one from an older format: build instead.
    if (isMissingFile(err) || err instanceof SeedSnapshotFormatError) {
      return null;
    }
    throw err;
  }
  const current = await computeSeedSnapshotHash();
  return contents.manifest.schemaHash === current ? contents : null;
}

/** The current seed snapshot's files, read back as the builder wrote them. */
export async function loadSmokeSnapshot(): Promise<SeedSnapshotContents> {
  const current = await readCurrentDefault();
  if (current !== null) return current;

  const tempDir = await mkdtemp(path.join(tmpdir(), "care-y-smoke-snapshot-"));
  try {
    const outDir = path.join(tempDir, "snapshot");
    await buildSeedSnapshot({ outDir, force: true });
    return await readSeedSnapshot(outDir);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

/** A boot source that hands the engine these files, as a fetch would. */
export function smokeSnapshotSource(
  contents: SeedSnapshotContents,
): SeedSnapshotSource {
  return async () =>
    Promise.resolve({
      rows: contents.rows,
      blobs: contents.blobs,
      manifestText: JSON.stringify(contents.manifest),
    });
}
