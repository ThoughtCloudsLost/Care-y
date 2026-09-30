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
  SEED_SNAPSHOT_FILES,
  decodeSeedSnapshotBlobs,
  decodeSeedSnapshotRows,
  type SeedSnapshotManifest,
  type SeedSnapshotTable,
  type SeedSnapshotValue,
} from "@care-y/shared/dev/seed-snapshot.js";
import { SEED_HANDBOOK_TICKET } from "@care-y/shared/dev/seed-handbook-ticket.js";
import {
  buildSeedSnapshot,
  readSeedSnapshot,
  type SeedSnapshotContents,
} from "../../../scripts/build-seed-snapshot.js";
import { migrateEngineDatabase } from "./engine-core.js";
import { PGliteDialect } from "./server/pglite-dialect.js";
import {
  DEMO_ORG_SCHEMA,
  DEMO_ADMIN_PASSWORD,
} from "./server/seed-structure.js";
import {
  deriveDemoOprfScalar,
  withDemoVolPrivate,
} from "./server/demo-keys.js";
import { gunzipBytes, loadSeedSnapshotRows } from "./snapshot/seed-rows.js";
import { exportSeedSnapshotRows } from "./snapshot/seed-rows-export.js";
import type {
  PlatformDatabase,
  TenantDatabase,
} from "../../../../server/src/db/types.js";

/**
 * Builds the seed snapshot into a temp dir through the real builder, then
 * loads it the way the demo boot does. A fresh PGlite gets the product's
 * migrations and then the snapshot's rows. Reads the result back to
 * prove the round trip.
 *
 * The build replays every seed story through the product's endpoints, so
 * it takes minutes, not seconds.
 */

const BUILD_TIMEOUT_MS = 900_000;
const DEMO_STORY_COUNT = 52;

/** One row as text, with bytes as hex, for comparing rows as sets. */
function rowKey(row: readonly SeedSnapshotValue[]): string {
  return JSON.stringify(
    row.map((value) => {
      if (value === null) return null;
      if (typeof value === "string") return `t:${value}`;
      return `b:${Array.from(value, (b) => b.toString(16).padStart(2, "0")).join("")}`;
    }),
  );
}

function rowCountOf(manifest: SeedSnapshotManifest, table: string): number {
  const entry = manifest.rows.tables.find(
    (t) => t.schema === DEMO_ORG_SCHEMA && t.table === table,
  );
  if (entry === undefined) expect.fail(`Manifest does not list ${table}`);
  return entry.rowCount;
}

async function countRows(
  tDb: Kysely<TenantDatabase>,
  table: "tickets" | "followups" | "ticket_key_wraps",
): Promise<number> {
  const row = await tDb
    .selectFrom(table)
    .select((eb) => eb.fn.countAll<number>().as("n"))
    .executeTakeFirstOrThrow();
  return row.n;
}

describe("seed snapshot build", () => {
  let tempDir: string | undefined;
  let outDir: string;
  let manifest: SeedSnapshotManifest;
  let contents: SeedSnapshotContents;
  let exported: SeedSnapshotTable[];
  let restored: PGlite | undefined;
  let tDb: Kysely<TenantDatabase>;

  beforeAll(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), "care-y-seed-snapshot-"));
    outDir = path.join(tempDir, "snapshot");
    const outcome = await buildSeedSnapshot({ outDir, force: true });
    expect(outcome.skipped).toBe(false);

    contents = await readSeedSnapshot(outDir);
    manifest = contents.manifest;
    exported = decodeSeedSnapshotRows(await gunzipBytes(contents.rows));

    const pg = new PGlite();
    restored = pg;
    await pg.waitReady;
    const platformDb = new Kysely<PlatformDatabase>({
      dialect: new PGliteDialect(pg),
    });
    tDb = new Kysely<TenantDatabase>({
      dialect: new PGliteDialect(pg),
    }).withSchema(DEMO_ORG_SCHEMA);
    await migrateEngineDatabase(platformDb, tDb, []);
    await loadSeedSnapshotRows(pg, contents.rows, manifest);
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
        SEED_SNAPSHOT_FILES.rows,
        SEED_SNAPSHOT_FILES.blobs,
        SEED_SNAPSHOT_FILES.manifest,
      ]),
    );
    const blobs = decodeSeedSnapshotBlobs(contents.blobs);
    expect(blobs.size).toBeGreaterThan(0);
  });

  it("lists the rows file's tables, in order, with their row counts", () => {
    expect(
      exported.map((t) => ({
        schema: t.schema,
        table: t.table,
        rowCount: t.rows.length,
      })),
    ).toEqual(manifest.rows.tables);
    expect(exported.map((t) => t.table)).not.toContain("kysely_migration");
  });

  it("loads every ticket, follow-up and key wrap the build wrote", async () => {
    expect(manifest.ticketIds).toHaveLength(DEMO_STORY_COUNT + 1);
    for (const table of ["tickets", "followups", "ticket_key_wraps"] as const) {
      const expected = rowCountOf(manifest, table);
      expect(expected).toBeGreaterThan(0);
      expect(await countRows(tDb, table)).toBe(expected);
    }

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

  it(
    "round-trips every value exactly",
    async () => {
      if (restored === undefined) expect.fail("No restored database");
      const reread = await exportSeedSnapshotRows(restored);
      expect(reread.map((t) => `${t.schema}.${t.table}`)).toEqual(
        exported.map((t) => `${t.schema}.${t.table}`),
      );
      for (const [i, table] of exported.entries()) {
        const again = reread.at(i);
        if (again === undefined) expect.fail(`Missing ${table.table}`);
        expect(again.columns).toEqual(table.columns);
        expect(again.rows.map(rowKey).sort()).toEqual(
          table.rows.map(rowKey).sort(),
        );
      }
    },
    BUILD_TIMEOUT_MS,
  );

  it("assigns tickets only to active people, some of them from the roster", async () => {
    // tickets.assigned_to is text and users.id is uuid, so the two are not
    // joined directly; the assignee ids are looked up as parameters.
    const assigneeRows = await tDb
      .selectFrom("tickets")
      .select("assigned_to")
      .distinct()
      .where("assigned_to", "is not", null)
      .execute();
    const assigneeIds = assigneeRows.flatMap((row) =>
      row.assigned_to === null ? [] : [row.assigned_to],
    );
    expect(assigneeIds.length).toBeGreaterThan(0);
    const assigned = await tDb
      .selectFrom("users")
      .select(["id", "is_active"])
      .where("id", "in", assigneeIds)
      .execute();
    expect(assigned.length).toBe(assigneeIds.length);
    expect(assigned.every((row) => row.is_active)).toBe(true);
    expect(assigned.some((row) => row.id !== manifest.adminUserId)).toBe(true);
  });

  it("decrypts the handbook story ticket's title", async () => {
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
