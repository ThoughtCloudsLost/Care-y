/**
 * Demo seed snapshot builder: writes db.tar.gz, blobs.bin and
 * manifest.json to packages/demo/.seed-snapshot/, skipping the build when
 * the manifest's schemaHash already matches the current sources.
 *
 * Runs inside Vite's module runner with the demo engine aliases
 * (scripts/seed-snapshot.mjs), or inside the demo smoke test config.
 * Those aliases rewrite the node:fs, node:path and node:crypto specifiers
 * to the engine's browser shims for every module, this one included, so
 * the Node builtins here are imported by their bare names, which no alias
 * touches.
 *
 * The build itself lives in src/lib/engine/snapshot/seed-snapshot-builder.ts.
 */

import { createHash } from "crypto";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  SEED_SNAPSHOT_FILES,
  SeedSnapshotFormatError,
  parseSeedSnapshotManifest,
  type SeedSnapshotManifest,
} from "@care-y/shared/dev/seed-snapshot.js";
import { buildSeedSnapshotArtifacts } from "../src/lib/engine/snapshot/seed-snapshot-builder.js";
import { SeedSnapshotBuildError } from "../src/lib/engine/errors.js";

const REPO_ROOT = fileURLToPath(new URL("../../../", import.meta.url));

/** Where the build writes the snapshot unless told otherwise. */
export const DEFAULT_SEED_SNAPSHOT_DIR = fileURLToPath(
  new URL("../.seed-snapshot/", import.meta.url),
);

/** Bumped when the hashing scheme itself changes. */
const HASH_SCHEME = "care-y-seed-snapshot-v1";

/**
 * Sources whose content decides the snapshot, relative to the repo root.
 * A directory entry covers every file under it except tests.
 */
const HASHED_SOURCES: readonly string[] = [
  "packages/server/src/db/migrations",
  "packages/shared/src/dev",
  "packages/client/src/lib/dev/seed-replay.ts",
  "packages/demo/src/lib/engine/server/seed-structure.ts",
  "packages/server/src/dev/seed-portal.ts",
  // The builder and what it wires the replay through.
  "packages/demo/scripts/build-seed-snapshot.ts",
  "packages/demo/src/lib/engine/snapshot",
  "packages/demo/src/lib/engine/engine-core.ts",
  "packages/demo/src/lib/engine/server/service-stubs.ts",
  "packages/demo/src/lib/engine/server/demo-keys.ts",
  "packages/server/src/dev/dev-service.ts",
  "packages/server/src/dev/seed-quarantine.ts",
  "packages/server/src/routes/dev.ts",
  "packages/server/src/routes/relay.ts",
  "packages/server/src/routes/relay-utils.ts",
  // Media the snapshot carries.
  "packages/demo/src/assets/demo-greeting-en.m4a",
];

const VOICEMAIL_PATH = "packages/shared/src/dev/assets/seed-voicemail-en.m4a";
const GREETING_PATH = "packages/demo/src/assets/demo-greeting-en.m4a";

async function collectFiles(relative: string): Promise<string[]> {
  const absolute = path.join(REPO_ROOT, relative);
  let isDirectory: boolean;
  try {
    isDirectory = (await stat(absolute)).isDirectory();
  } catch (err: unknown) {
    throw new SeedSnapshotBuildError(`Cannot read hashed source ${relative}`, {
      cause: err,
    });
  }
  if (!isDirectory) return [relative];

  const files: string[] = [];
  for (const entry of await readdir(absolute, { withFileTypes: true })) {
    const child = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(child)));
    } else if (entry.isFile() && !entry.name.includes(".test.")) {
      files.push(child);
    }
  }
  return files;
}

/** SHA-256 over every hashed source file's path and bytes, in path order. */
export async function computeSeedSnapshotHash(): Promise<string> {
  const files = new Set<string>();
  for (const source of HASHED_SOURCES) {
    for (const file of await collectFiles(source)) files.add(file);
  }
  const hash = createHash("sha256");
  hash.update(HASH_SCHEME);
  for (const file of [...files].sort((a, b) => a.localeCompare(b))) {
    const bytes = await readFile(path.join(REPO_ROOT, file));
    hash.update("\0");
    hash.update(file);
    hash.update("\0");
    hash.update(String(bytes.byteLength));
    hash.update("\0");
    hash.update(bytes);
  }
  return hash.digest("hex");
}

/**
 * The manifest of the snapshot already in `outDir`, or null when there is
 * none or it cannot be read as one (the build then replaces it).
 */
async function readExistingManifest(
  outDir: string,
): Promise<SeedSnapshotManifest | null> {
  let text: string;
  try {
    text = await readFile(path.join(outDir, SEED_SNAPSHOT_FILES.manifest), {
      encoding: "utf-8",
    });
  } catch (err: unknown) {
    if (err instanceof Error && "code" in err && err.code === "ENOENT") {
      return null;
    }
    throw new SeedSnapshotBuildError("Cannot read the existing manifest", {
      cause: err,
    });
  }
  try {
    return parseSeedSnapshotManifest(text);
  } catch (err: unknown) {
    if (err instanceof SeedSnapshotFormatError) return null;
    throw err;
  }
}

async function snapshotFilesExist(outDir: string): Promise<boolean> {
  const present = new Set(await readdir(outDir));
  return (
    present.has(SEED_SNAPSHOT_FILES.db) &&
    present.has(SEED_SNAPSHOT_FILES.blobs)
  );
}

export interface BuildSeedSnapshotOptions {
  /** Output directory. Defaults to packages/demo/.seed-snapshot/. */
  readonly outDir?: string;
  /** Rebuild even when the manifest's schemaHash matches. */
  readonly force?: boolean;
  /**
   * Receives step labels and timings only, never seed content: the runner
   * prints each one to the build log.
   */
  readonly onProgress?: (step: string) => void;
}

export interface BuildSeedSnapshotOutcome {
  readonly outDir: string;
  /** True when the existing snapshot was current and nothing was built. */
  readonly skipped: boolean;
  readonly manifest: SeedSnapshotManifest;
}

/**
 * Build the snapshot into `outDir` unless it is already current. The new
 * files are written to a sibling directory first and moved into place
 * only once all three are complete.
 */
export async function buildSeedSnapshot(
  options: BuildSeedSnapshotOptions = {},
): Promise<BuildSeedSnapshotOutcome> {
  const outDir = path.resolve(options.outDir ?? DEFAULT_SEED_SNAPSHOT_DIR);
  const progress = (message: string): void => {
    options.onProgress?.(message);
  };

  const schemaHash = await computeSeedSnapshotHash();
  if (options.force !== true) {
    const existing = await readExistingManifest(outDir);
    if (
      existing !== null &&
      existing.schemaHash === schemaHash &&
      (await snapshotFilesExist(outDir))
    ) {
      progress("snapshot is current, skipping the build");
      return { outDir, skipped: true, manifest: existing };
    }
  }

  const greetingAudioEn = await readFile(path.join(REPO_ROOT, GREETING_PATH));

  const artifacts = await buildSeedSnapshotArtifacts({
    schemaHash,
    loadVoicemail: async () =>
      new Uint8Array(await readFile(path.join(REPO_ROOT, VOICEMAIL_PATH))),
    greetingAudioEn: new Uint8Array(greetingAudioEn),
    onProgress: progress,
  });
  for (const timing of artifacts.timings) {
    progress(`${timing.label}: ${String(Math.round(timing.ms))} ms`);
  }

  const staging = `${outDir}.staging-${String(process.pid)}`;
  await rm(staging, { recursive: true, force: true });
  await mkdir(staging, { recursive: true });
  try {
    await writeFile(path.join(staging, SEED_SNAPSHOT_FILES.db), artifacts.db);
    await writeFile(
      path.join(staging, SEED_SNAPSHOT_FILES.blobs),
      artifacts.blobs,
    );
    await writeFile(
      path.join(staging, SEED_SNAPSHOT_FILES.manifest),
      `${JSON.stringify(artifacts.manifest, null, 2)}\n`,
    );
    await rm(outDir, { recursive: true, force: true });
    await rename(staging, outDir);
  } catch (err: unknown) {
    await rm(staging, { recursive: true, force: true });
    throw new SeedSnapshotBuildError(
      `Writing the snapshot to ${outDir} failed`,
      { cause: err },
    );
  }

  progress(
    `wrote ${outDir} (db ${String(artifacts.db.byteLength)} bytes, blobs ${String(artifacts.blobs.byteLength)} bytes)`,
  );
  return { outDir, skipped: false, manifest: artifacts.manifest };
}

export interface SeedSnapshotContents {
  /** Every entry name in the snapshot directory. */
  readonly entries: readonly string[];
  readonly db: Uint8Array<ArrayBuffer>;
  readonly blobs: Uint8Array<ArrayBuffer>;
  readonly manifest: SeedSnapshotManifest;
}

/** Read back a snapshot directory this module wrote. */
export async function readSeedSnapshot(
  dir: string,
): Promise<SeedSnapshotContents> {
  const [entries, db, blobs, manifestText] = await Promise.all([
    readdir(dir),
    readFile(path.join(dir, SEED_SNAPSHOT_FILES.db)),
    readFile(path.join(dir, SEED_SNAPSHOT_FILES.blobs)),
    readFile(path.join(dir, SEED_SNAPSHOT_FILES.manifest), {
      encoding: "utf-8",
    }),
  ]);
  return {
    entries,
    db: new Uint8Array(db),
    blobs: new Uint8Array(blobs),
    manifest: parseSeedSnapshotManifest(manifestText),
  };
}
