/**
 * Demo engine: boots PGlite, runs the product's migrations, loads the
 * prebuilt seed snapshot, builds the real tRPC router, and returns a
 * caller adapter usable by both the phone demo and the health check.
 *
 * Split into two entry points:
 *   - bootDemoEngine(): shared boot sequence, returns DemoEngineResult
 *   - runHealthProofs(): health-only proof battery over the engine
 *
 * The seed itself is built ahead of time in Node
 * (scripts/build-seed-snapshot.ts), by replaying the shared seed data
 * through the product's own endpoints. Boot loads its rows and blobs, then
 * moves every seeded time forward by the gap between build time and now.
 * The one time stored inside ciphertext, the read cursor, moves after the
 * crypto worker is keyed (DemoEngineResult.resealSeedTimes).
 *
 * The building blocks (migrations, crypto services, the fabricated
 * session, the blob store and resolver) live in engine-core.ts, which the
 * Node snapshot builder composes too.
 */

// Globals (Buffer, process.env, trpc isServer signal) MUST evaluate
// before every other import; ESM hoisting makes a first-position import
// the only reliable ordering.
import "./server/globals-init.js";

import { DemoEngineError } from "./errors.js";
import { Buffer } from "buffer";
import { PGlite } from "@electric-sql/pglite";
import type { Kysely } from "kysely";
import { sql } from "kysely";
import { decode } from "@care-y/crypto";
import {
  decodeSeedSnapshotBlobs,
  parseSeedSnapshotManifest,
  type SeedSnapshotManifest,
} from "@care-y/shared/dev/seed-snapshot.js";
import { isTrpcServerError } from "./caller-adapter.js";
import { TRPCClientError } from "@trpc/client";
import type { RoleIdValue, Permission } from "@care-y/shared";

import { initDb, db, tenantDb } from "./server/db-shim.js";
import {
  getPlatformMigrationCount,
  getTenantMigrationCount,
} from "./server/schema-utils-shim.js";
import { createSealedBoxEncryptor } from "./server/sealed-box-shim.js";
import { DEMO_ORG_SCHEMA } from "./server/seed-structure.js";
import { deriveDemoOprfScalar } from "./server/demo-keys.js";
import {
  timeMs,
  noopLimiter,
  createMapBlobStore,
  initEngineSodium,
  migrateEngineDatabase,
  deriveEngineCryptoServices,
  createEngineSession,
  createEngineBlobResolver,
  type EngineSeedIdentity,
  type HealthTimings,
} from "./engine-core.js";
import { loadSeedSnapshotRows } from "./snapshot/seed-rows.js";
import { shiftSeedTimes } from "./snapshot/seed-time-shift.js";
import {
  resealReadCursors,
  type ReadCursorResealDeps,
} from "./snapshot/read-cursor-reseal.js";

import { requireRouter } from "$lib/errors.js";

import type { TenantDatabase } from "../../../../server/src/db/types.js";
import type { BlobStore } from "../../../../server/src/storage/store.js";
import type { DemoBlobResolver } from "../../stubs/fetch-blob.js";
import type { Context } from "../../../../server/src/trpc/context.js";
import type { PlatformDatabase } from "../../../../server/src/db/types.js";
import type { ProcedureProxy } from "./proc-proxy.js";
// Type-only, through a relative path: the $lib/trpc alias points at the
// demo's stub, and only the real client's type is wanted here.
import type { trpc as RealTrpcClient } from "../../../../client/src/lib/trpc/index.js";

// ── Exported types ──────────────────────────────────────────────────

export type { HealthTimings, EngineSeedIdentity } from "./engine-core.js";

export interface HealthProofResult {
  readonly name: string;
  readonly pass: boolean;
  readonly detail: string;
}

/** The seed snapshot's three files, as boot receives them. */
export interface SeedSnapshotFiles {
  /** rows.bin.gz, still gzipped. */
  readonly rows: Uint8Array;
  /** blobs.bin. */
  readonly blobs: Uint8Array;
  /** manifest.json's text. */
  readonly manifestText: string;
}

/**
 * Supplies the seed snapshot. The phone and the health page fetch the
 * files the demo build ships; smoke tests read them from disk.
 */
export type SeedSnapshotSource = () => Promise<SeedSnapshotFiles>;

/** Byte sizes of the snapshot files boot loaded. */
export interface SeedSnapshotSizes {
  readonly rows: number;
  readonly blobs: number;
  readonly manifest: number;
}

/** The crypto bridge operations the read cursor reseal uses. */
export type SeedTimeResealBridge = ReadCursorResealDeps["bridge"];

export interface DemoEngineResult {
  readonly trpc: ProcedureProxy;
  readonly timings: readonly HealthTimings[];
  /** The demo org and the admin the engine is signed in as. */
  readonly seedResult: EngineSeedIdentity;
  /** Seeded ticket IDs. The first is the handbook story ticket, the detail deep-link target. */
  readonly ticketIds: readonly string[];
  /** Seeded KB article IDs, ordered by creation. First entry is the detail deep-link target. */
  readonly articleIds: readonly string[];
  readonly demoVolScalar: Uint8Array;
  readonly platformDb: Kysely<PlatformDatabase>;
  readonly tDb: Kysely<TenantDatabase>;
  readonly callerFactory: unknown;
  readonly adminCtx: Context;
  readonly volunteerCtx: Context;
  readonly appRouter: unknown;
  /** Ticket ID whose key wraps were removed (decrypt-denied demo). */
  readonly deniedTicketId: string;
  /** Seeded client-portal surfaces: channel and share ids, their fragments, account credentials. */
  readonly portal: SeedSnapshotManifest["portal"];
  /** Map-backed blob store (greeting audio, attachments). */
  readonly blobStore: BlobStore;
  /** Blob resolver for the fetch-blob stub (recordings, attachments, kb-attachments). */
  readonly resolveBlob: DemoBlobResolver;
  /** Milliseconds every seeded time was moved forward by at boot. */
  readonly timeShiftMs: number;
  /** Tickets whose read cursor resealSeedTimes moves. */
  readonly readCursorTicketIds: readonly string[];
  readonly snapshotSizes: SeedSnapshotSizes;
  /**
   * Move the time inside each seeded read cursor by timeShiftMs, through
   * the product's read cursor calls. Needs a crypto bridge keyed as the
   * admin; call it after keying and before any ticket query reads a
   * cursor. Runs once: later calls share the first successful run, and a
   * failed run can be retried.
   */
  resealSeedTimes(bridge: SeedTimeResealBridge): Promise<void>;
  /**
   * The signed-in user's server-authoritative permission set, read
   * through auth.me without changing anything. The phone applies it at
   * boot so client gates start from the seeded role's real permissions.
   */
  signedInPermissions(): Promise<readonly Permission[]>;
  /**
   * Mutate the signed-in user's role_id in the tenant DB and refresh
   * the cached admin user so subsequent middleware checks (requireRole)
   * enforce the new role. Does not touch key material. Returns the
   * server-authoritative permission set for the new role, read back
   * through auth.me so client gates derive from the same ROLE_CONFIG
   * the middleware enforces.
   */
  setSignedInRole(roleId: RoleIdValue): Promise<readonly Permission[]>;
}

// For backwards compat with the health page
export interface HealthEngine {
  readonly trpc: unknown;
  readonly timings: readonly HealthTimings[];
  readonly snapshotSizes: SeedSnapshotSizes;
  runProofs(report: (r: HealthProofResult) => void): Promise<void>;
}

// Email/SMS outbox for inspection. The implementation lives in outbox.ts
// so phone-side subscribers do not create a static edge to this module.
// Re-exported here for the health page and any engine-side consumers.
export { appendToOutbox, onOutboxAppend } from "./outbox.js";
export type { OutboxEntry } from "./outbox.js";

export interface BootDemoEngineOptions {
  /** Where the seed snapshot's files come from. */
  readonly snapshot: SeedSnapshotSource;
  /**
   * Wall-clock ms epoch the seed's times are shifted to. Defaults to the
   * time the snapshot finishes loading. Smoke tests move it so the shift
   * is large enough to observe.
   */
  readonly shiftTo?: number;
}

type AppTrpc = typeof RealTrpcClient;

// ── Boot ────────────────────────────────────────────────────────────

async function fetchSnapshot(
  source: SeedSnapshotSource,
  timings: HealthTimings[],
): Promise<SeedSnapshotFiles> {
  const start = timeMs();
  const files = await source();
  timings.push({ label: "snapshot-fetch", ms: timeMs() - start });
  return files;
}

async function startDatabase(timings: HealthTimings[]): Promise<PGlite> {
  // Sodium first: node-crypto-shim and the crypto package need it.
  const t0 = timeMs();
  await initEngineSodium();
  timings.push({ label: "sodium-ready", ms: timeMs() - t0 });

  const t1 = timeMs();
  const pg = new PGlite();
  await pg.waitReady;
  timings.push({ label: "pglite-init", ms: timeMs() - t1 });
  return pg;
}

export async function bootDemoEngine(
  opts: BootDemoEngineOptions,
): Promise<DemoEngineResult> {
  const timings: HealthTimings[] = [];

  // 1. Snapshot files, sodium and PGlite (memory FS), side by side.
  const [files, pg] = await Promise.all([
    fetchSnapshot(opts.snapshot, timings),
    startDatabase(timings),
  ]);
  // Throws SeedSnapshotFormatError on text that is not JSON, a format
  // version other than this build's, or any field outside the schema.
  const manifest = parseSeedSnapshotManifest(files.manifestText);

  // Wire up the DB shim
  initDb(pg);

  // 2. Platform migrations, tenant schema + tenant migrations, while the
  // server modules load. None of the modules depends on another's
  // evaluation; the globals-init constraint (top of this file) is
  // satisfied because it is a static import that evaluates first.
  const tDb = tenantDb(DEMO_ORG_SCHEMA);
  const modulesPromise = Promise.all([
    import("../../../../server/src/auth/password.js"),
    import("./server/service-stubs.js"),
    import("../../../../server/src/trpc/trpc.js"),
    import("./caller-adapter.js"),
  ]);
  const [modules] = await Promise.all([
    modulesPromise,
    migrateEngineDatabase(db, tDb, timings),
  ]);
  const [passwordMod, serviceStubsMod, trpcMod, callerAdapterMod] = modules;

  // 3. The snapshot's rows and blob store contents.
  const tLoad = timeMs();
  await loadSeedSnapshotRows(pg, files.rows, manifest);
  const blobEntries = new Map<string, Buffer>();
  for (const [key, bytes] of decodeSeedSnapshotBlobs(files.blobs)) {
    blobEntries.set(
      key,
      Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength),
    );
  }
  const { blobStore } = createMapBlobStore(blobEntries);
  timings.push({ label: "snapshot-load", ms: timeMs() - tLoad });

  // 4. Move every seeded time forward to now.
  const tShift = timeMs();
  const timeShiftMs = (opts.shiftTo ?? Date.now()) - manifest.buildNow;
  await shiftSeedTimes(pg, timeShiftMs);
  timings.push({ label: "time-shift", ms: timeMs() - tShift });

  // 5. Crypto services
  // The product's Argon2id hasher, running over the sodium-native shim.
  // Cost is libsodium's minimum because demo sign-ins hash in the
  // visitor's browser, and the hashes only ever land in the tab's
  // in-memory database. Never reuse these parameters for stored
  // credentials.
  const cryptoServices = deriveEngineCryptoServices(() =>
    passwordMod.createPasswordHasher(passwordMod.AUTH_ARGON2ID_TEST_PARAMS),
  );

  const seedResult: EngineSeedIdentity = {
    orgId: manifest.orgId,
    adminUserId: manifest.adminUserId,
    orgPublicKey: Buffer.from(decode(manifest.orgPublicKey)),
  };
  // Deterministic, so it is the scalar the snapshot's admin keys were
  // derived under.
  const demoVolScalar = deriveDemoOprfScalar();

  // 6. Build router (service stubs, provider factories, createAppRouter)
  const t6 = timeMs();
  const routerBuild = await serviceStubsMod.buildServiceStubs({
    ...cryptoServices,
    seedResult,
    blobStore,
    demoVolScalar,
    noopLimiter,
  });
  const { appRouter } = routerBuild;
  timings.push({ label: "router-build", ms: timeMs() - t6 });

  // 7. Fabricated admin session, callers and caller adapter
  const session = await createEngineSession({
    appRouter,
    createCallerFactory: trpcMod.createCallerFactory,
    createCallerAdapter: callerAdapterMod.createCallerAdapter,
    tDb,
    seedResult,
    sealedBox: createSealedBoxEncryptor(seedResult.orgPublicKey, 1),
  });

  // 8. The read cursor reseal, run once the caller holds a keyed bridge.
  const app = session.trpc as unknown as AppTrpc;
  let reseal: Promise<void> | null = null;
  async function resealSeedTimes(bridge: SeedTimeResealBridge): Promise<void> {
    reseal ??= resealReadCursors({
      tickets: requireRouter(app.tickets, "tickets"),
      bridge,
      userId: manifest.adminUserId,
      ticketIds: manifest.readCursorTicketIds,
      deltaMs: timeShiftMs,
    }).catch((err: unknown) => {
      reseal = null;
      throw err;
    });
    await reseal;
  }

  return {
    trpc: session.trpc,
    timings,
    seedResult,
    ticketIds: manifest.ticketIds,
    articleIds: manifest.articleIds,
    demoVolScalar,
    platformDb: db,
    tDb,
    callerFactory: session.callerFactory,
    adminCtx: session.adminCtx,
    volunteerCtx: session.volunteerCtx,
    appRouter,
    deniedTicketId: manifest.deniedTicketId,
    portal: manifest.portal,
    blobStore,
    resolveBlob: createEngineBlobResolver(tDb, blobStore),
    timeShiftMs,
    readCursorTicketIds: manifest.readCursorTicketIds,
    snapshotSizes: {
      rows: files.rows.byteLength,
      blobs: files.blobs.byteLength,
      manifest: new TextEncoder().encode(files.manifestText).byteLength,
    },
    resealSeedTimes,
    signedInPermissions: session.signedInPermissions,
    setSignedInRole: session.setSignedInRole,
  };
}

// ── Health proof battery ────────────────────────────────────────────

export async function runHealthProofs(
  engine: DemoEngineResult,
  report: (r: HealthProofResult) => void,
): Promise<void> {
  const {
    platformDb,
    tDb,
    callerFactory,
    adminCtx,
    volunteerCtx,
    appRouter,
    timings,
  } = engine;

  /**
   * Typed dispatch helper: looks up router then procedure by name on a
   * caller instance, passing input through as `unknown`. Throws
   * DemoEngineError on missing keys. Mirrors the createAdapter pattern
   * used by the phone demo, but without the Proxy layer (health proofs
   * address known procedures by literal name).
   */
  async function dispatch(
    caller: unknown,
    routerName: string,
    procName: string,
    input?: unknown,
  ): Promise<unknown> {
    // tRPC callers are recursive proxies with no enumerable own keys:
    // property access resolves procedures, enumeration sees nothing.
    const routerObj = Reflect.get(caller as object, routerName) as unknown;
    if (routerObj === undefined || routerObj === null) {
      throw new DemoEngineError(
        `Health proof dispatch: router "${routerName}" not found on caller`,
      );
    }
    const proc = Reflect.get(routerObj, procName) as unknown;
    if (typeof proc !== "function") {
      throw new DemoEngineError(
        `Health proof dispatch: procedure "${procName}" not found on router "${routerName}"`,
      );
    }
    return await (proc as (i: unknown) => Promise<unknown>)(input);
  }

  /** Dispatch into a nested sub-router (e.g. tickets.noteTypes.listActive). */
  async function dispatchNested(
    caller: unknown,
    routerName: string,
    subRouterName: string,
    procName: string,
    input?: unknown,
  ): Promise<unknown> {
    const routerObj = Reflect.get(caller as object, routerName) as unknown;
    if (routerObj === undefined || routerObj === null) {
      throw new DemoEngineError(
        `Health proof dispatch: router "${routerName}" not found on caller`,
      );
    }
    const subRouter = Reflect.get(routerObj, subRouterName) as unknown;
    // Recursive-proxy nodes report typeof "function" (every node is
    // callable), so accept both shapes.
    if (
      (typeof subRouter !== "object" && typeof subRouter !== "function") ||
      subRouter === null
    ) {
      throw new DemoEngineError(
        `Health proof dispatch: sub-router "${subRouterName}" not found on "${routerName}"`,
      );
    }
    const proc = Reflect.get(subRouter, procName) as unknown;
    if (typeof proc !== "function") {
      throw new DemoEngineError(
        `Health proof dispatch: procedure "${procName}" not found on "${routerName}.${subRouterName}"`,
      );
    }
    return await (proc as (i: unknown) => Promise<unknown>)(input);
  }

  const adminCaller = (callerFactory as (ctx: Context) => unknown)(adminCtx);
  const volunteerCaller = (callerFactory as (ctx: Context) => unknown)(
    volunteerCtx,
  );

  // P1: Migration counts
  try {
    const expectedPlatform = getPlatformMigrationCount();
    const expectedTenant = getTenantMigrationCount();

    const schemaCheck = await platformDb
      .selectFrom(
        sql<{ schema_name: string }>`information_schema.schemata`.as("s"),
      )
      .select("schema_name")
      .where("schema_name", "=", DEMO_ORG_SCHEMA)
      .executeTakeFirst();
    const schemaOk = schemaCheck !== undefined;

    // Query Kysely's migration bookkeeping table (default name:
    // "kysely_migration") in both schemas and compare row counts
    // against the expected values from the glob-based providers.
    const platformMigRows = await sql<{ cnt: string }>`
      SELECT count(*)::text AS cnt FROM public.kysely_migration
    `.execute(platformDb);
    const actualPlatform = Number(platformMigRows.rows[0]?.cnt ?? "0");

    const tenantMigRows = await sql<{ cnt: string }>`
      SELECT count(*)::text AS cnt FROM ${sql.ref(DEMO_ORG_SCHEMA)}.kysely_migration
    `.execute(tDb);
    const actualTenant = Number(tenantMigRows.rows[0]?.cnt ?? "0");

    const platformOk = actualPlatform === expectedPlatform;
    const tenantOk = actualTenant === expectedTenant;

    report({
      name: "P1 migrations",
      pass: platformOk && tenantOk && schemaOk,
      detail:
        `platform: ${String(actualPlatform)}/${String(expectedPlatform)}, ` +
        `tenant: ${String(actualTenant)}/${String(expectedTenant)}, ` +
        `schema exists: ${String(schemaOk)}`,
    });
  } catch (err: unknown) {
    report({
      name: "P1 migrations",
      pass: false,
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  // P2: Seed integrity via adapter
  try {
    const tickets = await dispatch(adminCaller, "tickets", "list", {
      limit: 100,
    });
    const kb = await dispatch(adminCaller, "kb", "listItems", {});

    const ticketCount = Array.isArray(tickets) ? tickets.length : 0;
    const kbCount =
      "items" in (kb as Record<string, unknown>)
        ? (kb as { items: unknown[] }).items.length
        : 0;

    report({
      name: "P2 seed integrity",
      pass: ticketCount > 0 && kbCount > 0,
      detail: `tickets: ${String(ticketCount)}, kb items: ${String(kbCount)}`,
    });
  } catch (err: unknown) {
    report({
      name: "P2 seed integrity",
      pass: false,
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  // P3: Serialization hammer
  try {
    let watchdogTimer: ReturnType<typeof setTimeout> | undefined;
    const watchdog = new Promise<"timeout">((resolve) => {
      watchdogTimer = setTimeout(() => {
        resolve("timeout");
      }, 10_000);
    });

    const txPromise = tDb.transaction().execute(async (tx) => {
      await tx.selectFrom("tickets").select("id").limit(1).executeTakeFirst();
      await new Promise((r) => setTimeout(r, 50));
    });

    const burstPromise = Promise.all([
      dispatch(adminCaller, "tickets", "list", { limit: 10 }),
      dispatch(adminCaller, "tickets", "counts", undefined),
      dispatch(adminCaller, "tickets", "myQueues", undefined),
      dispatchNested(
        adminCaller,
        "tickets",
        "noteTypes",
        "listActive",
        undefined,
      ),
      dispatch(adminCaller, "kb", "listItems", {}),
    ]);

    const raceResult = await Promise.race([
      Promise.all([txPromise, burstPromise]).then(() => "ok" as const),
      watchdog,
    ]);
    clearTimeout(watchdogTimer);

    report({
      name: "P3 serialization hammer",
      pass: raceResult === "ok",
      detail: raceResult === "ok" ? "all settled, no deadlock" : "TIMEOUT",
    });
  } catch (err: unknown) {
    report({
      name: "P3 serialization hammer",
      pass: false,
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  // P4: Middleware (role check)
  try {
    let forbiddenCaught = false;
    let isTrpcClientErr = false;
    let volunteerOutcome = "resolved without error";

    try {
      await dispatch(volunteerCaller, "reports", "queueStats", undefined);
    } catch (err: unknown) {
      // Structural brand check, not instanceof: the router chunk's
      // TRPCError copy differs from this module's (see isTrpcServerError
      // in caller-adapter.ts).
      if (isTrpcServerError(err) && err.code === "FORBIDDEN") {
        forbiddenCaught = true;
        const clientErr = TRPCClientError.from(err);
        isTrpcClientErr = clientErr instanceof TRPCClientError;
        volunteerOutcome = "forbidden";
      } else if (err instanceof Error) {
        volunteerOutcome = `${err.name}: ${err.message}`;
      } else {
        volunteerOutcome = String(err);
      }
    }

    let adminPassed = false;
    let adminError = "";
    try {
      await dispatch(adminCaller, "reports", "queueStats", undefined);
      adminPassed = true;
    } catch (adminErr: unknown) {
      adminError =
        adminErr instanceof Error ? adminErr.message : String(adminErr);
    }

    report({
      name: "P4 middleware",
      pass: forbiddenCaught && isTrpcClientErr && adminPassed,
      detail:
        `forbidden caught: ${String(forbiddenCaught)}, ` +
        `isTRPCClientError: ${String(isTrpcClientErr)}, ` +
        `admin passed: ${String(adminPassed)}` +
        (forbiddenCaught ? "" : `, volunteer outcome: ${volunteerOutcome}`) +
        (adminError ? `, admin error: ${adminError}` : ""),
    });
  } catch (err: unknown) {
    report({
      name: "P4 middleware",
      pass: false,
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  // P5: No dev surface
  try {
    const routerDef = (
      appRouter as { _def: { procedures: Record<string, unknown> } }
    )._def;
    const procedures = routerDef.procedures;
    // Procedure keys are dotted paths. The server mounts these only in
    // development, alongside the dev router checked below.
    const gatedDevKeys = [
      "auth.devBypass2fa",
      "auth.devReEncryptDisplayName",
      "keys.devSeedOrgKey",
      "telephonyAdmin.devSeedTelephony",
    ].filter((key) => key in procedures);
    const hasDevKey = "dev" in procedures;
    const topLevelKeys = Object.keys(procedures).filter((k) =>
      k.startsWith("dev."),
    );

    report({
      name: "P5 no-dev-surface",
      pass:
        gatedDevKeys.length === 0 && !hasDevKey && topLevelKeys.length === 0,
      detail:
        `gated dev procedures: ${gatedDevKeys.join(", ") || "none"}, ` +
        `dev key: ${String(hasDevKey)}, ` +
        `dev procedures: ${String(topLevelKeys.length)}`,
    });
  } catch (err: unknown) {
    report({
      name: "P5 no-dev-surface",
      pass: false,
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  // P6a: scrypt parity (RFC 7914 section 12 test vector)
  try {
    const { scrypt: shimScrypt, promisify: shimPromisify } =
      await import("./server/node-crypto-shim.js");
    const scryptAsync = shimPromisify(shimScrypt);
    const testPassword = "pleaseletmein";
    const testSalt = Buffer.from("SodiumChloride", "utf-8");

    const derived = await scryptAsync(testPassword, testSalt, 64);

    const expectedHex =
      "7023bdcb3afd7348461c06cd81fd38eb" +
      "fda8fbba904f8e3ea9b543f6545da1f2" +
      "d5432955613f0fcf62d49705242a9af9" +
      "e61e85dc0d651e40dfcf017b45575887";

    const derivedHex = derived.toString("hex");
    const match = derivedHex === expectedHex;

    report({
      name: "P6a scrypt parity",
      pass: match,
      detail: match
        ? "RFC 7914 vector matches"
        : `expected ${expectedHex.slice(0, 32)}..., got ${derivedHex.slice(0, 32)}...`,
    });
  } catch (err: unknown) {
    report({
      name: "P6a scrypt parity",
      pass: false,
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  // P6b: Real key derivation (partial, documents blockers)
  try {
    const userKeys = await tDb
      .selectFrom("user_keys")
      .select(["vol_public", "salt"])
      .where("user_id", "=", engine.seedResult.adminUserId)
      .executeTakeFirst();

    const hasKeys = userKeys !== undefined;
    const hasVolPublic = hasKeys && userKeys.vol_public !== null;

    report({
      name: "P6b real key derivation",
      pass: hasKeys && hasVolPublic,
      detail:
        `user_keys present: ${String(hasKeys)}, vol_public set: ${String(hasVolPublic)}. ` +
        "Full OPRF derivation blocked: threshold two-server topology requires " +
        "real IPC sockets (node:net), not available in browser. " +
        "The demo login path scripts around this seam.",
    });
  } catch (err: unknown) {
    report({
      name: "P6b real key derivation",
      pass: false,
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  // P6c: push-crypto load
  try {
    await import("../../../../server/src/notifications/push.js");

    report({
      name: "P6c push-crypto load",
      pass: true,
      detail: "Module loaded without calling sync ECDSA",
    });
  } catch (err: unknown) {
    report({
      name: "P6c push-crypto load",
      pass: false,
      detail: `Module load failed (expected if push-crypto uses top-level sync ECDSA): ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // P7: Timings surface
  try {
    const expectedLabels = [
      "sodium-ready",
      "pglite-init",
      "snapshot-fetch",
      "platform-migrate",
      "tenant-migrate",
      "snapshot-load",
      "time-shift",
      "router-build",
    ];
    const presentLabels = timings.map((t) => t.label);
    const allPresent = expectedLabels.every((l) => presentLabels.includes(l));

    report({
      name: "P7 timings surface",
      pass: allPresent,
      detail: `labels: [${presentLabels.join(", ")}]`,
    });
  } catch (err: unknown) {
    report({
      name: "P7 timings surface",
      pass: false,
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  // P8: TOTP enrollment round-trip via the caller adapter
  try {
    const { generateTotpCode, base32Decode } =
      await import("../../../../server/src/auth/totp.js");

    // Step 1: Begin TOTP enrollment (generates secret + otpauth URI)
    const setupResult = await dispatch(
      adminCaller,
      "twoFactor",
      "status",
      undefined,
    );

    // Remove any existing totp method first (the admin was seeded with all
    // method types enrolled). Removing it lets us re-enroll cleanly.
    const statusBefore = setupResult as {
      methods: { type: string }[];
    };
    const existingTotp = statusBefore.methods.find((m) => m.type === "totp");
    if (existingTotp) {
      await dispatchNested(adminCaller, "twoFactor", "methods", "remove", {
        method: "totp",
      });
    }

    // Step 2: Setup TOTP (get secret + URI)
    const totpSetup = (await dispatchNested(
      adminCaller,
      "twoFactor",
      "enroll",
      "totpSetup",
      undefined,
    )) as { secret: string; uri: string };

    // Step 3: Compute a valid TOTP code from the returned base32 secret
    const secretBytes = base32Decode(totpSetup.secret);
    const totpCode = generateTotpCode(secretBytes, Date.now());

    // Step 4: Verify the code to complete enrollment
    const verifyResult = (await dispatchNested(
      adminCaller,
      "twoFactor",
      "enroll",
      "totpVerify",
      { code: totpCode },
    )) as { success: boolean };

    // Step 5: Confirm TOTP is now enrolled
    const statusAfter = (await dispatch(
      adminCaller,
      "twoFactor",
      "status",
      undefined,
    )) as { methods: { type: string }[] };
    const totpEnrolled = statusAfter.methods.some((m) => m.type === "totp");

    report({
      name: "P8 totp enrollment round-trip",
      pass: verifyResult.success && totpEnrolled,
      detail:
        `verify success: ${String(verifyResult.success)}, ` +
        `totp enrolled after: ${String(totpEnrolled)}`,
    });
  } catch (err: unknown) {
    report({
      name: "P8 totp enrollment round-trip",
      pass: false,
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  // P11: telephonyAdmin round-trip (getConfig decrypts the seeded BYOT config)
  try {
    const config = (await dispatch(
      adminCaller,
      "telephonyAdmin",
      "getConfig",
      undefined,
    )) as { provider?: string; phoneNumbers?: readonly unknown[] } | null;

    // The config service uses a real DB-backed provider factory, so the
    // seeded telephony_config row round-trips through secretsEncryptor
    // decryption and provider masking.
    const pass =
      config !== null &&
      config.provider === "twilio" &&
      Array.isArray(config.phoneNumbers) &&
      config.phoneNumbers.length === 2;

    report({
      name: "P11 telephonyAdmin round-trip",
      pass,
      detail: pass
        ? "seeded twilio config masked with 2 phone numbers"
        : `unexpected config: ${JSON.stringify(config).slice(0, 120)}`,
    });
  } catch (err: unknown) {
    report({
      name: "P11 telephonyAdmin round-trip",
      pass: false,
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  // P12: telephonyContent round-trip (create greeting, then list)
  try {
    // Create a text greeting via the real router
    const created = (await dispatch(
      adminCaller,
      "telephonyContent",
      "createGreeting",
      {
        phoneNumber: "+15550009999",
        locale: "en",
        greetingType: "answer",
        text: "Health check greeting",
      },
    )) as { id: string; text: string };

    const hasId = typeof created.id === "string" && created.id.length > 0;
    const textMatches = created.text === "Health check greeting";

    // List greetings and verify the created one appears
    const greetings = (await dispatch(
      adminCaller,
      "telephonyContent",
      "listGreetings",
      {},
    )) as readonly { id: string }[];

    const found = greetings.some((g) => g.id === created.id);

    report({
      name: "P12 telephonyContent round-trip",
      pass: hasId && textMatches && found,
      detail:
        `created id: ${String(hasId)}, ` +
        `text matches: ${String(textMatches)}, ` +
        `found in list: ${String(found)}`,
    });
  } catch (err: unknown) {
    report({
      name: "P12 telephonyContent round-trip",
      pass: false,
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
