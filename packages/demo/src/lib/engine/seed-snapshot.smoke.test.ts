import { describe, it, expect, beforeAll, afterAll } from "vitest";
// Bare builtin names: the smoke config aliases the node: forms of fs, path
// and crypto to the engine's browser shims.
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { Kysely } from "kysely";
import { PGlite } from "@electric-sql/pglite";
import {
  buildContentAad,
  decryptContent,
  eciesDecrypt,
  toCiphertext,
  toNonce,
  toRistrettoPoint,
  toSymmetricKey,
} from "@care-y/crypto";
import {
  SEED_SNAPSHOT_DB_MIME,
  SEED_SNAPSHOT_FILES,
  decodeSeedSnapshotBlobs,
  type SeedSnapshotManifest,
} from "@care-y/shared/dev/seed-snapshot.js";
import { SEED_HANDBOOK_TICKET } from "@care-y/shared/dev/seed-handbook-ticket.js";
import {
  buildSeedSnapshot,
  readSeedSnapshot,
  type SeedSnapshotContents,
} from "../../../scripts/build-seed-snapshot.js";
import { PGliteDialect } from "./server/pglite-dialect.js";
import {
  DEMO_ORG_SCHEMA,
  DEMO_ADMIN_PASSWORD,
} from "./server/seed-structure.js";
import {
  deriveDemoOprfScalar,
  withDemoVolPrivate,
} from "./server/demo-keys.js";
import type { TenantDatabase } from "../../../../server/src/db/types.js";

/**
 * Builds the seed snapshot into a temp dir through the real builder, then
 * restores the database dump into a fresh PGlite and reads it back.
 *
 * The build replays every seed story through the product's endpoints, so
 * it takes minutes, not seconds.
 */

const BUILD_TIMEOUT_MS = 900_000;

describe("seed snapshot build", () => {
  let tempDir: string | undefined;
  let outDir: string;
  let manifest: SeedSnapshotManifest;
  let contents: SeedSnapshotContents;
  let restored: PGlite | undefined;
  let tDb: Kysely<TenantDatabase>;

  beforeAll(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), "care-y-seed-snapshot-"));
    outDir = path.join(tempDir, "snapshot");
    const outcome = await buildSeedSnapshot({ outDir, force: true });
    expect(outcome.skipped).toBe(false);

    contents = await readSeedSnapshot(outDir);
    manifest = contents.manifest;

    const pg = new PGlite({
      loadDataDir: new Blob([contents.db], {
        type: SEED_SNAPSHOT_DB_MIME,
      }),
    });
    restored = pg;
    await pg.waitReady;
    tDb = new Kysely<TenantDatabase>({
      dialect: new PGliteDialect(pg),
    }).withSchema(DEMO_ORG_SCHEMA);
  }, BUILD_TIMEOUT_MS);

  afterAll(async () => {
    if (restored !== undefined) await restored.close();
    if (tempDir !== undefined) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("writes the three snapshot files", () => {
    expect(contents.entries).toEqual(
      expect.arrayContaining([
        SEED_SNAPSHOT_FILES.db,
        SEED_SNAPSHOT_FILES.blobs,
        SEED_SNAPSHOT_FILES.manifest,
      ]),
    );
    const blobs = decodeSeedSnapshotBlobs(contents.blobs);
    expect(blobs.size).toBeGreaterThan(0);
  });

  it("restores a database that holds every seeded ticket", async () => {
    const rows = await tDb.selectFrom("tickets").select("id").execute();
    const ids = new Set<string>(rows.map((r) => r.id));
    for (const ticketId of manifest.ticketIds) {
      expect(ids.has(ticketId)).toBe(true);
    }
    expect(manifest.ticketIds.at(-1)).toBe(manifest.deniedTicketId);
    expect(
      await tDb
        .selectFrom("ticket_key_wraps")
        .select("id")
        .where("ticket_id", "=", manifest.deniedTicketId)
        .execute(),
    ).toHaveLength(0);
  });

  it("puts the handbook story ticket first", async () => {
    const storyId = manifest.ticketIds[0];
    if (storyId === undefined) expect.fail("Manifest has no tickets");
    const adminId = manifest.adminUserId;
    const keys = await tDb
      .selectFrom("user_keys")
      .select("salt")
      .where("user_id", "=", adminId)
      .executeTakeFirstOrThrow();
    const wrap = await tDb
      .selectFrom("ticket_key_wraps as w")
      .innerJoin("tickets as t", (join) =>
        join
          .onRef("t.id", "=", "w.ticket_id")
          .onRef("t.key_generation", "=", "w.key_generation"),
      )
      .select([
        "w.ephemeral_point",
        "w.nonce",
        "w.wrapped_key",
        "t.encrypted_title",
      ])
      .where("w.ticket_id", "=", storyId)
      .where("w.volunteer_id", "=", adminId)
      .executeTakeFirstOrThrow();

    const title = withDemoVolPrivate(
      DEMO_ADMIN_PASSWORD,
      new Uint8Array(keys.salt),
      deriveDemoOprfScalar(),
      adminId,
      (volPrivate) => {
        const tk = toSymmetricKey(
          eciesDecrypt(
            toRistrettoPoint(new Uint8Array(wrap.ephemeral_point)),
            toNonce(new Uint8Array(wrap.nonce)),
            new Uint8Array(wrap.wrapped_key),
            volPrivate,
          ),
        );
        try {
          return new TextDecoder().decode(
            decryptContent(
              toCiphertext(new Uint8Array(wrap.encrypted_title)),
              tk,
              buildContentAad(storyId, "title"),
            ),
          );
        } finally {
          tk.fill(0);
        }
      },
    );
    expect(title).toBe(SEED_HANDBOOK_TICKET.title);
  });

  it(
    "skips the rebuild while the sources are unchanged",
    async () => {
      const again = await buildSeedSnapshot({ outDir });
      expect(again.skipped).toBe(true);
      expect(again.manifest.schemaHash).toBe(manifest.schemaHash);
    },
    BUILD_TIMEOUT_MS,
  );
});
