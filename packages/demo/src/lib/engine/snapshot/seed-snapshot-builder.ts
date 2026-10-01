/**
 * Builds the demo seed snapshot in Node: boots the engine on a fresh
 * PGlite, replays the shared seed data through the product's own
 * endpoints, and returns the seeded rows, the blob store contents and
 * the manifest. Writing them to disk is the caller's job
 * (scripts/build-seed-snapshot.ts).
 *
 * The replay needs the dev-only seed procedures. This module mounts them
 * on a router of their own, called with the same admin context as the app
 * router. The app router is built exactly as the shipped demo builds it,
 * with no dev procedures, and the shipped demo never imports this module.
 *
 * Crypto runs through the product's CryptoBridge over an in-process
 * stand-in for its worker, keyed the way login keys it.
 */

// Globals (Buffer, process.env, trpc isServer signal) MUST evaluate
// before every other import.
import "../server/globals-init.js";

import { PGlite } from "@electric-sql/pglite";
import {
  decode,
  encode,
  eciesDecrypt,
  toNonce,
  toRistrettoPoint,
  toSymmetricKey,
  type SymmetricKey,
} from "@care-y/crypto";
import {
  RoleId,
  type NoteTypeId,
  type QueueId,
  type TicketId,
  type UserId,
} from "@care-y/shared";
import {
  SEED_SNAPSHOT_FILES,
  SEED_SNAPSHOT_FORMAT_VERSION,
  seedSnapshotManifestSchema,
  encodeSeedSnapshotBlobs,
  encodeSeedSnapshotRows,
  type SeedSnapshotManifest,
} from "@care-y/shared/dev/seed-snapshot.js";

import { SeedSnapshotBuildError } from "../errors.js";
import { initDb, db, tenantDb } from "../server/db-shim.js";
import { createSealedBoxEncryptor } from "../server/sealed-box-shim.js";
import {
  seedStructure,
  seedPhoneGreetings,
  applyDemoBranding,
  assignRosterQueues,
  DEMO_ORG_SCHEMA,
  DEMO_ADMIN_IDENTIFIER,
  DEMO_ADMIN_PASSWORD,
  DEMO_ROSTER,
  type SeedStructureResult,
} from "../server/seed-structure.js";
import { withDemoVolPrivate } from "../server/demo-keys.js";
import {
  noopLimiter,
  createMapBlobStore,
  initEngineSodium,
  migrateEngineDatabase,
  deriveEngineCryptoServices,
  seedAdminKeys,
  denyTicketAccess,
  seedEnginePortal,
  createEngineSession,
  type EngineCryptoServices,
  type EngineSession,
  type HealthTimings,
} from "../engine-core.js";

import type { TenantDatabase } from "../../../../../server/src/db/types.js";
import type { PendingClient } from "../../../../../server/src/tickets/ticket-service.js";
import type { SealedBoxEncryptor } from "../../../../../server/src/crypto/sealed-box.js";
import type { BlobStore } from "../../../../../server/src/storage/store.js";
import type { Kysely } from "kysely";

import { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { OrgKeyManager } from "$lib/crypto/org-key.js";
import { toArrayBuffer } from "$lib/base64.js";
import { requireRouter } from "$lib/errors.js";
import {
  seedReplay,
  type SeedReplayClient,
  type SeedReplayResult,
  type SeedReplayUser,
} from "$lib/dev/seed-replay.js";
// Type-only, through a relative path: the $lib/trpc alias points at the
// demo's stub, and only the real client's type is wanted here.
import type { trpc as RealTrpcClient } from "../../../../../client/src/lib/trpc/index.js";

import { withInProcessCryptoWorker } from "./in-process-crypto-worker.js";
import { gzipBytes } from "./seed-rows.js";
import { exportSeedSnapshotRows } from "./seed-rows-export.js";
// Type-only (erased at runtime): the modules themselves load through
// loadServerModules, after sodium is ready.
import type * as ServiceStubsModule from "../server/service-stubs.js";
import type * as CallerAdapterModule from "../caller-adapter.js";
import type * as TrpcModule from "../../../../../server/src/trpc/trpc.js";
import type * as DevRoutesModule from "../../../../../server/src/routes/dev.js";
import type * as SeedPortalModule from "../../../../../server/src/dev/seed-portal.js";
import type * as RelayLookupModule from "./relay-phone-lookup.js";

type AppTrpc = typeof RealTrpcClient;

/**
 * Generated stories the demo seeds on top of the handbook story ticket.
 * At 52 the My tickets and Needs attention dashboard sections and the
 * tickets list all overflow into "See all", and every origin kind,
 * queue, priority and status still appears.
 */
const DEMO_STORY_COUNT = 52;

/**
 * The roster people the replay hands tickets to. Only the active ones are
 * listed, because the product refuses to assign a ticket to a deactivated
 * account. Volunteers come first, so the handbook story ticket's first
 * shift goes to a volunteer (the replay gives it to the first user) and
 * not to the manager.
 */
function rosterReplayUsers(): SeedReplayUser[] {
  const active = DEMO_ROSTER.filter((member) => member.active);
  const volunteers = active.filter((m) => m.roleId === RoleId.VOLUNTEER);
  const others = active.filter((m) => m.roleId !== RoleId.VOLUNTEER);
  return [...volunteers, ...others].map((member) => ({
    identifier: member.identifier,
    displayName: member.displayName,
    roleId: member.roleId,
    queueIndices: member.queueIndices,
  }));
}

export interface SeedSnapshotBuildInputs {
  /** Content hash of the snapshot's sources, recorded in the manifest. */
  readonly schemaHash: string;
  /** Loads the seed voicemail clip the replay attaches to tickets. */
  readonly loadVoicemail: () => Promise<Uint8Array>;
  /** English answer-greeting clip for the admin Greetings section. */
  readonly greetingAudioEn: Uint8Array;
  readonly onProgress?: (message: string) => void;
}

export interface SeedSnapshotArtifacts {
  /** Every seeded row in the rows.bin format, gzipped (rows.bin.gz). */
  readonly rows: Uint8Array;
  /** Blob store contents in the blobs.bin format. */
  readonly blobs: Uint8Array;
  readonly manifest: SeedSnapshotManifest;
  /** Phase timings, for the build log. */
  readonly timings: readonly HealthTimings[];
}

/**
 * Run the full build. Fails with {@link SeedSnapshotBuildError} on any
 * step, with the underlying failure as its cause; nothing partial is
 * returned.
 */
export async function buildSeedSnapshotArtifacts(
  inputs: SeedSnapshotBuildInputs,
): Promise<SeedSnapshotArtifacts> {
  try {
    return await runBuild(inputs);
  } catch (err: unknown) {
    if (err instanceof SeedSnapshotBuildError) throw err;
    const reason = err instanceof Error ? err.message : String(err);
    throw new SeedSnapshotBuildError(`Seed snapshot build failed: ${reason}`, {
      cause: err,
    });
  }
}

async function runBuild(
  inputs: SeedSnapshotBuildInputs,
): Promise<SeedSnapshotArtifacts> {
  const timings: HealthTimings[] = [];
  const progress = (message: string): void => {
    inputs.onProgress?.(message);
  };
  const timed = async <T>(label: string, run: () => Promise<T>): Promise<T> => {
    progress(label);
    const start = performance.now();
    const result = await run();
    timings.push({ label, ms: performance.now() - start });
    return result;
  };

  const { deriveTaggedShare } = await initEngineSodium();
  const server = await loadServerModules();

  const pg = new PGlite();
  try {
    await pg.waitReady;
    initDb(pg);

    const tDb = tenantDb(DEMO_ORG_SCHEMA);
    await timed("migrate", async () => migrateEngineDatabase(db, tDb, timings));
    await assertMigrationsWroteNoRows(pg);

    // Same minimum-cost Argon2id as the runtime engine: these hashes only
    // ever land in the demo's in-memory database. Imported here, not at
    // the top: password.js reads sodium constants at module load, so it
    // must evaluate after initEngineSodium, as it does in engine.ts.
    const passwordMod =
      await import("../../../../../server/src/auth/password.js");
    const cryptoServices = deriveEngineCryptoServices(() =>
      passwordMod.createPasswordHasher(passwordMod.AUTH_ARGON2ID_TEST_PARAMS),
    );
    const { blobStore, entries } = createMapBlobStore();

    const seedResult = await timed("seed-structure", async () =>
      seedStructure({
        platformDb: db,
        tenantDb: tDb,
        encryptor: cryptoServices.encryptor,
        indexer: cryptoServices.indexer,
        secretsEncryptor: cryptoServices.secretsEncryptor,
        hasher: cryptoServices.hasher,
        tokenizer: cryptoServices.tokenizer,
      }),
    );
    const { demoVolScalar } = await seedAdminKeys(tDb, seedResult, timings);

    const sealedBox = createSealedBoxEncryptor(seedResult.orgPublicKey, 1);
    const routerBuild = await server.buildServiceStubs({
      ...cryptoServices,
      seedResult,
      blobStore,
      demoVolScalar,
      noopLimiter,
    });
    const session = await createEngineSession({
      appRouter: routerBuild.appRouter,
      createCallerFactory: server.createCallerFactory,
      createCallerAdapter: server.createCallerAdapter,
      tDb,
      seedResult,
      sealedBox,
    });

    const usersBeforeReplay = await listUserIds(tDb);
    const replay = await withInProcessCryptoWorker(async () =>
      runReplayWithBridge({
        session,
        blobStore,
        tDb,
        seedResult,
        cryptoServices,
        sealedBox,
        pendingClients: routerBuild.pendingClients,
        loadVoicemail: inputs.loadVoicemail,
        timed,
        progress,
      }),
    );
    assertSameUsers(usersBeforeReplay, await listUserIds(tDb));

    // The replay sets its own branding and its reset wipes greetings and
    // queue memberships. The demo's branding and greetings come back
    // after it. The replay already gave the active roster people their
    // queues, so only the deactivated ones, whom it never sees, get
    // theirs here.
    await applyDemoBranding(tDb);
    await seedPhoneGreetings(tDb, blobStore, {
      bytes: inputs.greetingAudioEn,
    });
    await assignRosterQueues(
      tDb,
      seedResult.rosterUserIds,
      await listQueueIdsInOrder(tDb),
      (member) => !member.active,
    );
    const defaultNoteTypeId = replay.noteTypeIds.at(0);
    if (defaultNoteTypeId !== undefined) {
      await tDb
        .updateTable("org_config")
        .set({ default_note_type_id: defaultNoteTypeId as NoteTypeId })
        .execute();
    }

    const storyTicketId = replay.ticketIds.at(0);
    const deniedTicketId = replay.ticketIds.at(-1);
    if (
      storyTicketId === undefined ||
      deniedTicketId === undefined ||
      deniedTicketId === storyTicketId
    ) {
      throw new SeedSnapshotBuildError(
        "The replay opened too few tickets for the story and denied demos",
      );
    }

    // Open the story ticket's key from the admin's own wrap before any
    // wrap is removed. The portal seed writes ticket content with it.
    const anchorTicketKey = await openAdminTicketKey(
      tDb,
      seedResult,
      demoVolScalar,
      storyTicketId,
    );
    const portal = await timed("seed-portal", async () =>
      seedEnginePortal({
        seedPortal: server.seedPortal,
        tDb,
        sealedBox,
        crypto: cryptoServices,
        blobStore,
        router: routerBuild,
        seedResult,
        demoVolScalar,
        deriveTaggedShare,
        anchorTicketId: storyTicketId,
        anchorTicketKey,
      }),
    ).finally(() => {
      anchorTicketKey.fill(0);
    });

    await denyTicketAccess(tDb, deniedTicketId);

    // Every time the seed wrote is relative to the wall clock while it
    // ran. The last writes happen just before this point, so taking the
    // build time here keeps every shifted time at or before the load time.
    const buildNow = Date.now();

    const tables = await timed("export-rows", async () =>
      exportSeedSnapshotRows(pg),
    );
    const rows = await timed("encode-rows", async () =>
      gzipBytes(encodeSeedSnapshotRows(tables)),
    );
    const blobs = encodeSeedSnapshotBlobs(entries);

    const manifest = seedSnapshotManifestSchema.safeParse({
      formatVersion: SEED_SNAPSHOT_FORMAT_VERSION,
      rows: {
        file: SEED_SNAPSHOT_FILES.rows,
        tables: tables.map((table) => ({
          schema: table.schema,
          table: table.table,
          rowCount: table.rows.length,
        })),
      },
      buildNow,
      schemaHash: inputs.schemaHash,
      adminUserId: seedResult.adminUserId,
      orgId: seedResult.orgId,
      orgPublicKey: encode(seedResult.orgPublicKey),
      orgSecretKey: encode(seedResult.orgSecretKey),
      ticketIds: replay.ticketIds,
      articleIds: replay.articleIds,
      deniedTicketId,
      portal: {
        portalChannelId: portal.portalChannelId,
        portalFragment: portal.portalFragment,
        shareId: portal.shareId,
        shareFragment: portal.shareFragment,
        accountId: portal.accountId,
        accountUsername: portal.accountUsername,
        accountPassword: portal.accountPassword,
        customFormId: portal.customFormId,
        customFormSlug: portal.customFormSlug,
        closedFormId: portal.closedFormId,
        closedFormSlug: portal.closedFormSlug,
        responseTicketIds: portal.responseTicketIds,
        keyNotHeldTicketId: portal.keyNotHeldTicketId,
      },
      // The denied ticket's cursor can no longer be opened, so boot has
      // nothing to re-seal there.
      readCursorTicketIds: replay.readCursorTicketIds.filter(
        (id) => id !== deniedTicketId,
      ),
    });
    if (!manifest.success) {
      throw new SeedSnapshotBuildError(
        `Built manifest does not match the schema: ${manifest.error.message}`,
      );
    }

    return { rows, blobs, manifest: manifest.data, timings };
  } finally {
    await pg.close();
  }
}

// ── Replay ──────────────────────────────────────────────────────────

interface ReplayRunDeps {
  readonly session: EngineSession;
  readonly blobStore: BlobStore;
  readonly tDb: Kysely<TenantDatabase>;
  readonly seedResult: SeedStructureResult;
  readonly cryptoServices: EngineCryptoServices;
  readonly sealedBox: SealedBoxEncryptor;
  readonly pendingClients: Map<string, PendingClient>;
  readonly loadVoicemail: () => Promise<Uint8Array>;
  readonly timed: <T>(label: string, run: () => Promise<T>) => Promise<T>;
  readonly progress: (message: string) => void;
}

/**
 * Key a CryptoBridge as the demo admin and run the replay through it.
 * The bridge is zeroed and torn down before this returns or throws, so
 * no key material and no idle timer outlive the build.
 */
async function runReplayWithBridge(
  deps: ReplayRunDeps,
): Promise<SeedReplayResult> {
  const bridge = new CryptoBridge("dedicated");
  let result: SeedReplayResult;
  try {
    result = await keyAndReplay(bridge, deps);
  } catch (err: unknown) {
    await zeroAndDestroy(bridge, err);
    throw err;
  }
  await zeroAndDestroy(bridge, null);
  return result;
}

async function zeroAndDestroy(
  bridge: CryptoBridge,
  primary: unknown,
): Promise<void> {
  try {
    await bridge.zeroAll();
  } catch (zeroErr: unknown) {
    bridge.destroy();
    throw new SeedSnapshotBuildError("Zeroing the crypto worker failed", {
      cause:
        primary === null ? zeroErr : new AggregateError([primary, zeroErr]),
    });
  }
  bridge.destroy();
}

async function keyAndReplay(
  bridge: CryptoBridge,
  deps: ReplayRunDeps,
): Promise<SeedReplayResult> {
  const { session, tDb, seedResult, cryptoServices } = deps;
  const app = session.trpc as unknown as AppTrpc;
  const orgKeyManager = new OrgKeyManager(bridge);

  await deps.timed("key-bridge", async () => {
    // Mirrors loginCrypto: getSalt, Argon2id, OPRF blind, evaluate,
    // derive, then unwrap the org key.
    const { salt: saltB64, userId } = await app.auth.getSalt.query({
      identifier: DEMO_ADMIN_IDENTIFIER,
    });
    const passwordBytes = new TextEncoder().encode(DEMO_ADMIN_PASSWORD);
    await bridge.argon2id(
      toArrayBuffer(passwordBytes),
      toArrayBuffer(decode(saltB64)),
    );
    const { blindedElement } = await bridge.oprfBlind();
    const { evaluated } = await app.oprf.evaluate.mutate({
      kind: "volunteer",
      userId,
      blindedElement,
    });
    const { volPublic } = await bridge.deriveKeys(
      toArrayBuffer(decode(evaluated)),
    );

    const stored = await tDb
      .selectFrom("user_keys")
      .select("vol_public")
      .where("user_id", "=", seedResult.adminUserId)
      .executeTakeFirst();
    const storedVolPublic = stored?.vol_public ?? null;
    if (storedVolPublic === null || encode(storedVolPublic) !== volPublic) {
      throw new SeedSnapshotBuildError(
        "The keyed bridge's public key does not match the admin's stored key",
      );
    }

    const orgKeyData = await app.keys.getWrappedOrgKey.query();
    if (!orgKeyData) {
      throw new SeedSnapshotBuildError("The admin has no wrapped org key");
    }
    const orgPublicKey = await bridge.unwrapOrgKey(
      orgKeyData.wrappedKey,
      orgKeyData.ephemeralPoint,
      orgKeyData.nonce,
      orgKeyData.currentGeneration,
      orgKeyData.generations,
    );
    orgKeyManager.load(orgPublicKey);
  });

  // The dev seed procedures, on a router of their own, signed in as the
  // same admin and sharing the app caller's user-refresh state.
  const server = await loadServerModules();
  const devCaller = server.createCallerFactory(
    server.router({
      dev: server.createDevRouter({ blobStore: deps.blobStore }),
    }),
  )(session.adminCtx);
  const devApp = server.createCallerAdapter({
    callerObj: devCaller,
    refreshAdminUser: session.refreshAdminUser,
    markDirty: session.markAdminUserDirty,
    isDirty: session.isAdminUserDirty,
  }) as unknown as AppTrpc;

  const client: SeedReplayClient = {
    auth: app.auth,
    org: app.org,
    branding: requireRouter(app.branding, "branding"),
    kb: requireRouter(app.kb, "kb"),
    tickets: requireRouter(app.tickets, "tickets"),
    voicemailQuarantine: requireRouter(
      app.voicemailQuarantine,
      "voicemailQuarantine",
    ),
    dev: requireRouter(devApp.dev, "dev"),
    // The demo router has no devSeedTelephony (it runs as production);
    // the structural seed wrote the telephony config instead. The caller
    // adapter answers every path, so absence has to be stated here.
    telephonyAdmin: {},
    funds: requireRouter(app.funds, "funds"),
  };

  // Clients are resolved through the relay endpoint, as the new-ticket
  // screen resolves them.
  const relayLookup = await server.createRelayPhoneLookup({
    orgId: seedResult.orgId,
    adminUserId: seedResult.adminUserId,
    indexer: cryptoServices.indexer,
    fieldEncryptor: cryptoServices.encryptor,
    pendingClients: deps.pendingClients,
    tokenizer: cryptoServices.tokenizer,
    sealedBox: deps.sealedBox,
  });
  try {
    return await deps.timed("replay", async () =>
      seedReplay({
        client,
        bridge,
        orgKeyManager,
        phoneLookup: relayLookup.lookup,
        loadVoicemail: deps.loadVoicemail,
        storyCount: DEMO_STORY_COUNT,
        users: rosterReplayUsers(),
        onProgress: deps.progress,
      }),
    );
  } finally {
    await relayLookup.close();
  }
}

// ── Build checks ────────────────────────────────────────────────────

/**
 * Boot runs the same migrations and then inserts the snapshot's rows with
 * no conflict rule, which is only sound while the migrations themselves
 * write no rows into an empty database. They write none today. This
 * fails the build if a migration starts seeding rows, so the loader gets
 * a rule for them before any snapshot duplicates one.
 */
async function assertMigrationsWroteNoRows(pg: PGlite): Promise<void> {
  const seeded = (await exportSeedSnapshotRows(pg)).filter(
    (table) => table.rows.length > 0,
  );
  if (seeded.length > 0) {
    const names = seeded.map((t) => `${t.schema}.${t.table}`).join(", ");
    throw new SeedSnapshotBuildError(
      `Migrations wrote rows into an empty database (${names}); the snapshot loader has no rule for them`,
    );
  }
}

async function listUserIds(tDb: Kysely<TenantDatabase>): Promise<UserId[]> {
  const rows = await tDb.selectFrom("users").select("id").execute();
  return rows.map((r) => r.id);
}

/**
 * The replay must find every roster person it is given. An account it
 * registered would be a second set of people beside the roster.
 */
function assertSameUsers(
  before: readonly UserId[],
  after: readonly UserId[],
): void {
  const known = new Set<string>(before);
  const added = after.filter((id) => !known.has(id));
  if (added.length > 0 || after.length !== before.length) {
    throw new SeedSnapshotBuildError(
      `The replay changed the user list (${String(added.length)} added) instead of reusing the roster`,
    );
  }
}

// ── Post-replay helpers ─────────────────────────────────────────────

/** Queue ids in the order the replay created them (Intake, Crisis, Housing). */
async function listQueueIdsInOrder(
  tDb: Kysely<TenantDatabase>,
): Promise<QueueId[]> {
  const rows = await tDb
    .selectFrom("queues")
    .select("id")
    .orderBy("sort_order", "asc")
    .execute();
  return rows.map((r) => r.id);
}

/**
 * The story ticket's content key, opened from the admin's own key wrap
 * with the admin's volunteer private key, derived here from the demo's
 * published credentials. Nothing is exported from the crypto worker.
 * The caller zeroes the returned key.
 */
async function openAdminTicketKey(
  tDb: Kysely<TenantDatabase>,
  seedResult: SeedStructureResult,
  demoVolScalar: Uint8Array,
  ticketId: string,
): Promise<SymmetricKey> {
  const keys = await tDb
    .selectFrom("user_keys")
    .select("salt")
    .where("user_id", "=", seedResult.adminUserId)
    .executeTakeFirst();
  if (keys === undefined) {
    throw new SeedSnapshotBuildError("The admin has no key row");
  }
  const wrap = await tDb
    .selectFrom("ticket_key_wraps as w")
    .innerJoin("tickets as t", (join) =>
      join
        .onRef("t.id", "=", "w.ticket_id")
        .onRef("t.key_generation", "=", "w.key_generation"),
    )
    .select(["w.ephemeral_point", "w.nonce", "w.wrapped_key"])
    .where("w.ticket_id", "=", ticketId as TicketId)
    .where("w.volunteer_id", "=", seedResult.adminUserId)
    .executeTakeFirst();
  if (wrap === undefined) {
    throw new SeedSnapshotBuildError(
      "The admin holds no current key wrap on the story ticket",
    );
  }
  const opened = withDemoVolPrivate(
    DEMO_ADMIN_PASSWORD,
    new Uint8Array(keys.salt),
    demoVolScalar,
    seedResult.adminUserId,
    (volPrivate) =>
      eciesDecrypt(
        toRistrettoPoint(new Uint8Array(wrap.ephemeral_point)),
        toNonce(new Uint8Array(wrap.nonce)),
        new Uint8Array(wrap.wrapped_key),
        volPrivate,
      ),
  );
  return toSymmetricKey(opened);
}

/**
 * Server-side modules the build calls. Loaded on demand rather than at the
 * top of this file: the auth services they pull in read libsodium
 * constants at module load, so they must evaluate after initEngineSodium,
 * as engine.ts arranges with its own dynamic imports. The module cache
 * makes repeat calls free.
 */
async function loadServerModules(): Promise<{
  readonly buildServiceStubs: typeof ServiceStubsModule.buildServiceStubs;
  readonly createCallerAdapter: typeof CallerAdapterModule.createCallerAdapter;
  readonly createCallerFactory: typeof TrpcModule.createCallerFactory;
  readonly router: typeof TrpcModule.router;
  readonly createDevRouter: typeof DevRoutesModule.createDevRouter;
  readonly seedPortal: typeof SeedPortalModule.seedPortal;
  readonly createRelayPhoneLookup: typeof RelayLookupModule.createRelayPhoneLookup;
}> {
  const [serviceStubs, callerAdapter, trpcMod, devRoutes, portal, relay] =
    await Promise.all([
      import("../server/service-stubs.js"),
      import("../caller-adapter.js"),
      import("../../../../../server/src/trpc/trpc.js"),
      import("../../../../../server/src/routes/dev.js"),
      import("../../../../../server/src/dev/seed-portal.js"),
      import("./relay-phone-lookup.js"),
    ]);
  return {
    buildServiceStubs: serviceStubs.buildServiceStubs,
    createCallerAdapter: callerAdapter.createCallerAdapter,
    createCallerFactory: trpcMod.createCallerFactory,
    router: trpcMod.router,
    createDevRouter: devRoutes.createDevRouter,
    seedPortal: portal.seedPortal,
    createRelayPhoneLookup: relay.createRelayPhoneLookup,
  };
}
