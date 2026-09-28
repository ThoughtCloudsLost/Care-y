/**
 * Demo engine: boots PGlite, runs migrations, seeds, builds the real
 * tRPC router, and returns a caller adapter usable by both the phone
 * demo and the health check.
 *
 * Split into two entry points:
 *   - bootDemoEngine(): shared boot sequence, returns DemoEngineResult
 *   - runHealthProofs(): health-only proof battery over the engine
 *
 * The building blocks (migrations, crypto services, admin keys, the
 * fabricated session, the portal seed) live in engine-core.ts, which the
 * Node seed snapshot builder composes too.
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
import { isTrpcServerError } from "./caller-adapter.js";
import { TRPCClientError } from "@trpc/client";
import type { RoleIdValue, Permission, TicketId } from "@care-y/shared";

import { initDb, db, tenantDb } from "./server/db-shim.js";
import {
  getPlatformMigrationCount,
  getTenantMigrationCount,
} from "./server/schema-utils-shim.js";
import { createSealedBoxEncryptor } from "./server/sealed-box-shim.js";
import { seedStructure, DEMO_ORG_SCHEMA } from "./server/seed-structure.js";
import {
  timeMs,
  noopLimiter,
  createMapBlobStore,
  initEngineSodium,
  migrateEngineDatabase,
  deriveEngineCryptoServices,
  seedAdminKeys,
  denyTicketAccess,
  seedEnginePortal,
  createEngineSession,
  createEngineBlobResolver,
  type HealthTimings,
} from "./engine-core.js";

import type { TenantDatabase } from "../../../../server/src/db/types.js";
import type { BlobStore } from "../../../../server/src/storage/store.js";
import type { DemoBlobResolver } from "../../stubs/fetch-blob.js";
import type { Context } from "../../../../server/src/trpc/context.js";
import type { PlatformDatabase } from "../../../../server/src/db/types.js";
import type { SeedStructureResult } from "./server/seed-structure.js";
import type { ProcedureProxy } from "./proc-proxy.js";
import type { SeedMediaAssets } from "../../../../server/src/dev/seed-tickets.js";
import type { SeedPortalResult } from "../../../../server/src/dev/seed-portal.js";

// ── Exported types ──────────────────────────────────────────────────

export type { HealthTimings } from "./engine-core.js";

export interface HealthProofResult {
  readonly name: string;
  readonly pass: boolean;
  readonly detail: string;
}

export interface DemoEngineResult {
  readonly trpc: ProcedureProxy;
  readonly timings: readonly HealthTimings[];
  readonly seedResult: SeedStructureResult;
  /** Seeded ticket IDs, ordered by creation. First entry has the richest thread. */
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
  /** Ticket ID whose key wrap was deleted (decrypt-denied demo). */
  readonly deniedTicketId: string;
  /** Seeded client-portal surfaces: channel and share ids, their fragments, account credentials. */
  readonly portal: SeedPortalResult;
  /** Map-backed blob store (greeting audio, attachments). */
  readonly blobStore: BlobStore;
  /** Blob resolver for the fetch-blob stub (recordings, attachments, kb-attachments). */
  readonly resolveBlob: DemoBlobResolver;
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
  runProofs(report: (r: HealthProofResult) => void): Promise<void>;
}

// Email/SMS outbox for inspection. The implementation lives in outbox.ts
// so phone-side subscribers do not create a static edge to this module.
// Re-exported here for the health page and any engine-side consumers.
export { appendToOutbox, onOutboxAppend } from "./outbox.js";
export type { OutboxEntry } from "./outbox.js";

/** Options for bootDemoEngine. All fields are optional for backward compat. */
export interface BootDemoEngineOptions {
  mediaAssets?: SeedMediaAssets;
  /** English answer-greeting clip for the admin Greetings section. */
  greetingAudioEn?: { bytes: Uint8Array };
}

// ── Boot ────────────────────────────────────────────────────────────

export async function bootDemoEngine(
  opts?: BootDemoEngineOptions,
): Promise<DemoEngineResult> {
  const timings: HealthTimings[] = [];

  // 0. Init sodium and the crypto package's backend state.
  const t0 = timeMs();
  const { deriveTaggedShare } = await initEngineSodium();
  timings.push({ label: "sodium-ready", ms: timeMs() - t0 });

  // 1. Boot PGlite (memory FS)
  const t1 = timeMs();
  const pg = new PGlite();
  await pg.waitReady;
  timings.push({ label: "pglite-init", ms: timeMs() - t1 });

  // Wire up the DB shim
  initDb(pg);

  // Kick off all the dynamic imports in parallel so module fetch/eval
  // overlaps with migrations and seeding. None depends on another's
  // evaluation; the globals-init constraint (top of this file) is
  // satisfied because it is a static import that evaluates first.
  const [
    passwordMod,
    seedTicketsMod,
    seedKbMod,
    seedPortalMod,
    serviceStubsMod,
    trpcMod,
    callerAdapterMod,
  ] = await Promise.all([
    import("../../../../server/src/auth/password.js"),
    import("../../../../server/src/dev/seed-tickets.js"),
    import("../../../../server/src/dev/seed-kb.js"),
    import("../../../../server/src/dev/seed-portal.js"),
    import("./server/service-stubs.js"),
    import("../../../../server/src/trpc/trpc.js"),
    import("./caller-adapter.js"),
  ]);

  // 2-3. Platform migrations, tenant schema + tenant migrations
  const tDb = tenantDb(DEMO_ORG_SCHEMA);
  await migrateEngineDatabase(db, tDb, timings);

  // 4. Derive crypto services
  // The product's Argon2id hasher, running over the sodium-native shim.
  // Cost is libsodium's minimum because demo sign-ins hash in the
  // visitor's browser, and the hashes only ever land in the tab's
  // in-memory database. Never reuse these parameters for stored
  // credentials.
  const cryptoServices = deriveEngineCryptoServices(() =>
    passwordMod.createPasswordHasher(passwordMod.AUTH_ARGON2ID_TEST_PARAMS),
  );
  const { encryptor, indexer, secretsEncryptor, hasher, tokenizer } =
    cryptoServices;

  // 5. Structural seed
  const t5 = timeMs();
  const { blobStore } = createMapBlobStore();
  const seedResult = await seedStructure({
    platformDb: db,
    tenantDb: tDb,
    encryptor,
    indexer,
    secretsEncryptor,
    hasher,
    tokenizer,
    blobStore,
    voicemailAudio: opts?.mediaAssets?.voicemailAudio,
    greetingAudioEn: opts?.greetingAudioEn,
  });
  timings.push({ label: "seed-structure", ms: timeMs() - t5 });

  // 6. Content seed (real seed modules)
  const t6 = timeMs();
  const orgPublicKey = seedResult.orgPublicKey;
  const sealedBox = createSealedBoxEncryptor(orgPublicKey, 1);

  const { demoVolScalar } = await seedAdminKeys(tDb, seedResult, timings);

  const ticketResult = await seedTicketsMod.seedTestTickets(
    tDb,
    blobStore,
    seedResult.adminUserId,
    DEMO_ORG_SCHEMA,
    undefined,
    opts?.mediaAssets,
  );

  // Pick the LAST ticket for the denied demo (never ticketIds[0], which
  // is the detail deep-link target).
  const deniedTicketId =
    ticketResult.ticketIds[ticketResult.ticketIds.length - 1];
  if (deniedTicketId === undefined) {
    throw new DemoEngineError("No seeded tickets for the denied demo");
  }
  await denyTicketAccess(tDb, deniedTicketId);

  const kbResult = await seedKbMod.seedKbArticles(
    tDb,
    sealedBox,
    seedResult.adminUserId,
    blobStore,
    DEMO_ORG_SCHEMA,
    seedResult.rosterUserIds,
  );

  // Seed audit_log rows so the dashboard activity feed has entries.
  // Spread across five event types with staggered timestamps.
  const auditEventTypes = [
    "ticket_created",
    "ticket_closed",
    "ticket_reopened",
    "followup_added",
    "mention",
    "ticket_created",
    "followup_added",
    "ticket_closed",
  ] as const;
  const now = Date.now();
  const auditRows = auditEventTypes.map((eventType, i) => {
    const ticketId = ticketResult.ticketIds.at(
      i % ticketResult.ticketIds.length,
    );
    if (ticketId === undefined) {
      throw new DemoEngineError(
        `ticketIds missing index ${String(i % ticketResult.ticketIds.length)}`,
      );
    }
    // Stagger from 2 hours ago to 5 days ago
    const hoursBack = 2 + i * 14;
    const createdAt = new Date(now - hoursBack * 60 * 60 * 1000);
    return {
      event_type: eventType,
      actor_id: seedResult.adminUserId,
      ticket_id: ticketId as TicketId,
      metadata: {},
      created_at: createdAt,
    };
  });
  await tDb.insertInto("audit_log").values(auditRows).execute();

  timings.push({ label: "seed-content", ms: timeMs() - t6 });

  // 7. Build router (service stubs, provider factories, createAppRouter)
  const t7 = timeMs();
  const routerBuild = await serviceStubsMod.buildServiceStubs({
    ...cryptoServices,
    seedResult,
    blobStore,
    demoVolScalar,
    noopLimiter,
  });
  const { appRouter } = routerBuild;
  timings.push({ label: "router-build", ms: timeMs() - t7 });

  // 7b. Portal content seed.
  const t7b = timeMs();
  const anchorTicketId = ticketResult.ticketIds[0];
  if (anchorTicketId === undefined) {
    throw new DemoEngineError("No seeded tickets to anchor the portal seed");
  }
  const anchorTicketKey = ticketResult.ticketKeys.get(anchorTicketId);
  if (anchorTicketKey === undefined) {
    throw new DemoEngineError(
      `Ticket seed returned no content key for ${anchorTicketId}`,
    );
  }
  const portalResult = await seedEnginePortal({
    seedPortal: seedPortalMod.seedPortal,
    tDb,
    sealedBox,
    crypto: cryptoServices,
    blobStore,
    router: routerBuild,
    seedResult,
    demoVolScalar,
    deriveTaggedShare,
    anchorTicketId,
    anchorTicketKey,
  });
  timings.push({ label: "seed-portal", ms: timeMs() - t7b });

  // 8. Fabricated admin session, callers and caller adapter
  const session = await createEngineSession({
    appRouter,
    createCallerFactory: trpcMod.createCallerFactory,
    createCallerAdapter: callerAdapterMod.createCallerAdapter,
    tDb,
    seedResult,
    sealedBox,
  });

  // Snapshot: dumpDataDir is not feasible without COOP/COEP headers
  // (GitHub Pages restriction). Record -1 as a sentinel.
  timings.push({ label: "snapshot-bytes", ms: -1 });

  return {
    trpc: session.trpc,
    timings,
    seedResult,
    ticketIds: ticketResult.ticketIds,
    articleIds: kbResult.articleIds,
    demoVolScalar,
    platformDb: db,
    tDb,
    callerFactory: session.callerFactory,
    adminCtx: session.adminCtx,
    volunteerCtx: session.volunteerCtx,
    appRouter,
    deniedTicketId,
    portal: portalResult,
    blobStore,
    resolveBlob: createEngineBlobResolver(tDb, blobStore),
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
    const hasDevSeedTickets = "devSeedTickets" in procedures;
    const hasDevKey = "dev" in procedures;
    const topLevelKeys = Object.keys(procedures).filter((k) =>
      k.startsWith("dev."),
    );

    report({
      name: "P5 no-dev-surface",
      pass: !hasDevSeedTickets && !hasDevKey && topLevelKeys.length === 0,
      detail:
        `devSeedTickets: ${String(hasDevSeedTickets)}, ` +
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
      "platform-migrate",
      "tenant-migrate",
      "seed-structure",
      "demo-key-derivation",
      "seed-content",
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
