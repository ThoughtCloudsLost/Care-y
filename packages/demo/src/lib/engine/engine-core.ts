/**
 * Engine building blocks shared by the in-browser boot (engine.ts) and
 * the Node seed snapshot builder: crypto init, migrations, the demo's
 * crypto services, the admin's key rows, the fabricated request context
 * and caller adapter, the blob resolver and the portal seed.
 *
 * Nothing here seeds ticket content or chooses a router surface. Each
 * caller composes these pieces in its own order.
 */

// Globals (Buffer, process.env, trpc isServer signal) MUST evaluate
// before every other import; ESM hoisting makes a first-position import
// the only reliable ordering.
import { FAKE_OPS_KEY_HEX } from "./server/globals-init.js";

import { Buffer } from "buffer";
import _sodium from "libsodium-wrappers-sumo";
import type { Kysely } from "kysely";
import { sql } from "kysely";
import type {
  deriveTaggedShare as DeriveTaggedShare,
  SymmetricKey,
} from "@care-y/crypto";
import {
  RoleId,
  type RoleIdValue,
  type Permission,
  type OrgSchema,
  type UserId,
  type SessionId,
  type SessionToken,
  type IpToken,
  type UaToken,
  type BlobKey,
  type TicketId,
  type RecordingId,
  type AttachmentId,
  type KbAttachmentId,
} from "@care-y/shared";

import { DemoEngineError } from "./errors.js";
import {
  markSodiumReady,
  hkdfSync,
  createHmac,
} from "./server/node-crypto-shim.js";
import {
  createPlatformMigrator,
  createTenantMigrator,
} from "./server/schema-utils-shim.js";
import {
  deriveKeys,
  createFieldEncryptor,
  createBlindIndexer,
  type FieldEncryptor,
  type BlindIndexer,
} from "./server/field-encryptor-shim.js";
import {
  deriveSecretsKey,
  createSecretsEncryptor,
  type SecretsEncryptor,
} from "./server/secrets-shim.js";
import {
  DEMO_ORG_SCHEMA,
  DEMO_ORG_SLUG,
  DEMO_ADMIN_PASSWORD,
  DEMO_CLIENT_USERNAME,
  DEMO_CLIENT_PASSWORD,
  type SeedStructureResult,
} from "./server/seed-structure.js";
import {
  deriveDemoOprfScalar,
  deriveDemoVolPublic,
  wrapOrgKeyForVolunteer,
} from "./server/demo-keys.js";

import type {
  TenantDatabase,
  PlatformDatabase,
} from "../../../../server/src/db/types.js";
import type {
  BlobStore,
  BlobCategory,
} from "../../../../server/src/storage/store.js";
import type { DemoBlobResolver } from "../../stubs/fetch-blob.js";
import type { RateLimiter } from "../../../../server/src/ratelimit/rate-limiter.js";
import type {
  Context,
  OrgContext,
} from "../../../../server/src/trpc/context.js";
import type { SessionData } from "../../../../server/src/auth/session-repository.js";
import type { UserRecord } from "../../../../server/src/auth/service.js";
import type { SessionTokenizer } from "../../../../server/src/crypto/session-tokenizer.js";
import type { PasswordHasher } from "../../../../server/src/auth/password.js";
import type { SealedBoxEncryptor } from "../../../../server/src/crypto/sealed-box.js";
import type { createCallerFactory as CreateCallerFactory } from "../../../../server/src/trpc/trpc.js";
import type {
  seedPortal as SeedPortal,
  SeedPortalResult,
} from "../../../../server/src/dev/seed-portal.js";
import type { createCallerAdapter as CreateCallerAdapter } from "./caller-adapter.js";
import type { ProcedureProxy } from "./proc-proxy.js";
import type {
  DemoAppRouter,
  ServiceStubResult,
} from "./server/service-stubs.js";

// ── Timing ──────────────────────────────────────────────────────────

export interface HealthTimings {
  readonly label: string;
  readonly ms: number;
}

export function timeMs(): number {
  return performance.now();
}

// ── No-op infrastructure stubs ──────────────────────────────────────

export const noopLimiter: RateLimiter = {
  check: () => ({ allowed: true, remaining: Infinity, retryAfterMs: 0 }),
  reset: () => {
    // intentional no-op
  },
};

// ── Blob store ──────────────────────────────────────────────────────

export interface MapBlobStore {
  readonly blobStore: BlobStore;
  /**
   * The store's backing map, keyed by blob key. The snapshot builder
   * reads it to write blobs.bin; a snapshot boot fills it before use.
   */
  readonly entries: Map<string, Buffer>;
}

export function createMapBlobStore(
  entries: Map<string, Buffer> = new Map<string, Buffer>(),
): MapBlobStore {
  const blobStore: BlobStore = {
    async put(
      orgSchema: OrgSchema,
      category: BlobCategory,
      blob: Buffer,
    ): Promise<BlobKey> {
      const key =
        `${orgSchema}/${category}/${globalThis.crypto.randomUUID()}` as BlobKey;
      entries.set(key, Buffer.from(blob));
      return Promise.resolve(key);
    },
    async get(key: BlobKey): Promise<Buffer | null> {
      return Promise.resolve(entries.get(key) ?? null);
    },
    async delete(key: BlobKey): Promise<void> {
      entries.delete(key);
      return Promise.resolve();
    },
    async exists(key: BlobKey): Promise<boolean> {
      return Promise.resolve(entries.has(key));
    },
  };
  return { blobStore, entries };
}

// ── Sodium ──────────────────────────────────────────────────────────

export interface EngineSodium {
  readonly deriveTaggedShare: typeof DeriveTaggedShare;
}

/**
 * Init sodium FIRST (node-crypto-shim needs it), plus the crypto
 * package's own backend state (seeders call its sync API, which requires
 * the package-level getSodium() to have resolved).
 */
export async function initEngineSodium(): Promise<EngineSodium> {
  await _sodium.ready;
  markSodiumReady();
  const { getSodium, deriveTaggedShare } = await import("@care-y/crypto");
  await getSodium();
  return { deriveTaggedShare };
}

// ── Migrations ──────────────────────────────────────────────────────

/** Platform migrations, then the demo tenant schema and its migrations. */
export async function migrateEngineDatabase(
  platformDb: Kysely<PlatformDatabase>,
  tDb: Kysely<TenantDatabase>,
  timings: HealthTimings[],
): Promise<void> {
  const t2 = timeMs();
  const platformMigrator = createPlatformMigrator(platformDb);
  const platformResult = await platformMigrator.migrateToLatest();
  if (platformResult.error !== undefined) {
    const errMsg =
      platformResult.error instanceof Error
        ? platformResult.error.message
        : JSON.stringify(platformResult.error);
    throw new DemoEngineError(`Platform migration failed: ${errMsg}`);
  }
  timings.push({ label: "platform-migrate", ms: timeMs() - t2 });

  const t3 = timeMs();
  await sql`CREATE SCHEMA IF NOT EXISTS ${sql.ref(DEMO_ORG_SCHEMA)}`.execute(
    platformDb,
  );
  const tenantMigrator = createTenantMigrator(tDb, DEMO_ORG_SCHEMA);
  const tenantResult = await tenantMigrator.migrateToLatest();
  if (tenantResult.error !== undefined) {
    const errMsg =
      tenantResult.error instanceof Error
        ? tenantResult.error.message
        : JSON.stringify(tenantResult.error);
    throw new DemoEngineError(`Tenant migration failed: ${errMsg}`);
  }
  timings.push({ label: "tenant-migrate", ms: timeMs() - t3 });
}

// ── Crypto services ─────────────────────────────────────────────────

export interface EngineCryptoServices {
  readonly opsKey: Buffer;
  readonly encryptor: FieldEncryptor;
  readonly indexer: BlindIndexer;
  readonly secretsEncryptor: SecretsEncryptor;
  readonly tokenizer: SessionTokenizer;
  readonly hasher: PasswordHasher;
}

/** The server's operational crypto, keyed by the demo's fake ops key. */
export function deriveEngineCryptoServices(
  createHasher: () => PasswordHasher,
): EngineCryptoServices {
  const opsKey = Buffer.from(FAKE_OPS_KEY_HEX, "hex");
  const derivedKeys = deriveKeys(opsKey);
  const encryptor = createFieldEncryptor(derivedKeys.fieldEncryptKey);
  const indexer = createBlindIndexer(derivedKeys.blindIndexKey);
  const secretsKey = deriveSecretsKey(opsKey);
  const secretsEncryptor = createSecretsEncryptor(secretsKey);

  // Session tokenizer (via shim)
  const SESSION_TOKEN_INFO = "care-y-session-token-v1";
  const sessionHmacKey = Buffer.from(
    hkdfSync("sha256", opsKey, Buffer.alloc(0), SESSION_TOKEN_INFO, 32),
  );
  const tokenizer: SessionTokenizer = {
    tokenize(value: string): string {
      return createHmac("sha256", sessionHmacKey).update(value).digest("hex");
    },
    tokenizeIp(value: string): IpToken {
      return this.tokenize(value) as IpToken;
    },
    tokenizeUa(value: string): UaToken {
      return this.tokenize(value) as UaToken;
    },
  };

  const hasher = createHasher();

  return { opsKey, encryptor, indexer, secretsEncryptor, tokenizer, hasher };
}

// ── Admin key rows ──────────────────────────────────────────────────

export interface EngineAdminKeys {
  readonly demoVolScalar: Uint8Array;
}

/**
 * Write the admin's user_keys and wrapped_org_keys rows, which login
 * needs before the crypto worker can be keyed.
 *
 * The demo OPRF scalar and volunteer keypair are derived
 * deterministically. Running the full client pipeline (Argon2id, OPRF
 * blind/evaluate/finalize, master key derivation) at seed time produces a
 * volPublic that the visitor's real client crypto worker will reproduce
 * identically when it logs in with the same password and salt.
 */
export async function seedAdminKeys(
  tDb: Kysely<TenantDatabase>,
  seedResult: SeedStructureResult,
  timings: HealthTimings[],
): Promise<EngineAdminKeys> {
  const tKeys = timeMs();
  const demoVolScalar = deriveDemoOprfScalar();
  const demoSalt = _sodium.randombytes_buf(16);
  const { volPublic: demoVolPublic } = deriveDemoVolPublic(
    DEMO_ADMIN_PASSWORD,
    demoSalt,
    demoVolScalar,
    seedResult.adminUserId,
  );
  timings.push({ label: "demo-key-derivation", ms: timeMs() - tKeys });

  await tDb
    .insertInto("user_keys")
    .values({
      user_id: seedResult.adminUserId,
      salt: Buffer.from(demoSalt),
      vol_public: Buffer.from(demoVolPublic),
    })
    .execute();

  // Wrap the org secret key to the volunteer's ristretto255 public key
  // so the client can unwrap it via keys.getWrappedOrgKey after login.
  const orgWrap = wrapOrgKeyForVolunteer(
    seedResult.orgSecretKey,
    demoVolPublic,
  );
  await tDb
    .insertInto("wrapped_org_keys")
    .values({
      user_id: seedResult.adminUserId,
      ephemeral_point: Buffer.from(orgWrap.ephemeralPoint),
      wrapped_key: Buffer.from(orgWrap.ciphertext),
      nonce: Buffer.from(orgWrap.nonce),
      key_version: 1,
    })
    .execute();

  return { demoVolScalar };
}

// ── Denied ticket ───────────────────────────────────────────────────

/**
 * Delete every key wrap on one ticket so the locked/denied state still
 * demos. A missing wrap is the shape production actually produces for
 * no-access (keyWrap null -> DENIED); re-wrapping to a foreign key while
 * keeping user_id would create a row no production flow can create, and
 * it breaks the real password-change pipeline, whose myTicketKeyWraps
 * unwrap loop rightly expects every own wrap to open.
 */
export async function denyTicketAccess(
  tDb: Kysely<TenantDatabase>,
  ticketId: string,
): Promise<void> {
  await tDb
    .deleteFrom("ticket_key_wraps")
    .where("ticket_id", "=", ticketId as TicketId)
    .execute();
}

// ── Portal seed ─────────────────────────────────────────────────────

export interface EnginePortalSeedDeps {
  readonly seedPortal: typeof SeedPortal;
  readonly tDb: Kysely<TenantDatabase>;
  readonly sealedBox: SealedBoxEncryptor;
  readonly crypto: EngineCryptoServices;
  readonly blobStore: BlobStore;
  readonly router: ServiceStubResult;
  readonly seedResult: SeedStructureResult;
  readonly demoVolScalar: Uint8Array;
  readonly deriveTaggedShare: typeof DeriveTaggedShare;
  readonly anchorTicketId: string;
  readonly anchorTicketKey: SymmetricKey;
}

/**
 * Portal content seed. Runs after the router build because it needs the
 * same IntakeFormService the two portal routers hold, and it has to come
 * last regardless: the account tier attaches to a client one of its own
 * intake submissions creates.
 */
export async function seedEnginePortal(
  deps: EnginePortalSeedDeps,
): Promise<SeedPortalResult> {
  const { demoVolScalar, deriveTaggedShare } = deps;
  return deps.seedPortal({
    tDb: deps.tDb,
    sealedBox: deps.sealedBox,
    orgPublicKey: deps.seedResult.orgPublicKey,
    fieldEncryptor: deps.crypto.encryptor,
    blindIndexer: deps.crypto.indexer,
    blobStore: deps.blobStore,
    intakeFormService: deps.router.intakeFormService,
    notificationService: deps.router.notificationService,
    accountServiceDeps: deps.router.accountServiceDeps,
    orgId: deps.seedResult.orgId,
    orgSchema: DEMO_ORG_SCHEMA,
    orgSlug: DEMO_ORG_SLUG,
    adminUserId: deps.seedResult.adminUserId,
    anchorTicketId: deps.anchorTicketId as TicketId,
    anchorTicketKey: deps.anchorTicketKey,
    // Same scalar the demo OPRF service evaluates under, so the published
    // password re-derives these keys when the visitor signs in for real.
    // The tag selects a per-identity working share (ADR-091), matching how
    // the real service derives per-tag scalars from the master share.
    evaluateOprf: (blindedElement: Uint8Array, tag: string): Uint8Array => {
      const taggedScalar = deriveTaggedShare(demoVolScalar, tag);
      try {
        return _sodium.crypto_scalarmult_ristretto255(
          taggedScalar,
          blindedElement,
        );
      } finally {
        _sodium.memzero(taggedScalar);
      }
    },
    accountUsername: DEMO_CLIENT_USERNAME,
    accountPassword: DEMO_CLIENT_PASSWORD,
  });
}

// ── Session: fabricated context, callers, adapter ───────────────────

export interface EngineSessionDeps {
  readonly appRouter: DemoAppRouter;
  readonly createCallerFactory: typeof CreateCallerFactory;
  readonly createCallerAdapter: typeof CreateCallerAdapter;
  readonly tDb: Kysely<TenantDatabase>;
  readonly seedResult: SeedStructureResult;
  readonly sealedBox: SealedBoxEncryptor;
}

export interface EngineSession {
  /** Caller adapter over the app router, signed in as the admin. */
  readonly trpc: ProcedureProxy;
  /** Caller factory over the app router (typed loosely, as DemoEngineResult exposes it). */
  readonly callerFactory: unknown;
  readonly adminCtx: Context;
  readonly volunteerCtx: Context;
  // Function-valued properties rather than methods: callers pass them
  // around unbound, and none of them reads `this`.
  /** Reload the admin user record so ctx.user reflects recent writes. */
  readonly refreshAdminUser: () => Promise<void>;
  readonly markAdminUserDirty: () => void;
  readonly isAdminUserDirty: () => boolean;
  /** See DemoEngineResult.setSignedInRole. */
  readonly setSignedInRole: (
    roleId: RoleIdValue,
  ) => Promise<readonly Permission[]>;
}

export async function createEngineSession(
  deps: EngineSessionDeps,
): Promise<EngineSession> {
  const { appRouter, tDb, seedResult, sealedBox } = deps;

  // Fabricated context for the admin user
  const orgCtx: OrgContext = {
    orgId: seedResult.orgId,
    orgSlug: DEMO_ORG_SLUG,
    orgSchema: DEMO_ORG_SCHEMA,
    tenantDb: tDb,
    sealedBox,
  };

  const adminSession: SessionData = {
    id: globalThis.crypto.randomUUID() as SessionId,
    token: globalThis.crypto.randomUUID() as SessionToken,
    userId: seedResult.adminUserId,
    ipToken: "demo" as IpToken,
    uaToken: "demo" as UaToken,
    expiresAt: new Date(Date.now() + 86400000),
    twofaVerified: true,
    webauthnChallenge: null,
  };

  // The fabricated context mirrors what the production session middleware
  // does per request: load the user record fresh from the users table.
  // auth.me serves ctx.user directly, so the sealed ciphertexts must be
  // the row's real bytes (or every me:* org-tier decrypt fails), and a
  // profile mutation must be visible on the next read (or settings
  // writes appear to have no effect). The adapter refreshes this when
  // the dirty flag is set; ctx.user is a live getter over the latest load.
  async function loadAdminUser(): Promise<UserRecord> {
    const row = await tDb
      .selectFrom("users")
      .select([
        "encrypted_identifier",
        "encrypted_display_name",
        "role_id",
        "is_active",
        "has_seen_briefing",
        "must_change_password",
      ])
      .where("id", "=", seedResult.adminUserId)
      .executeTakeFirstOrThrow();
    return {
      id: seedResult.adminUserId,
      encryptedIdentifier: row.encrypted_identifier.toString("base64"),
      encryptedDisplayName: row.encrypted_display_name.toString("base64"),
      encryptedPreferredLocale: null,
      roleId: row.role_id,
      isActive: row.is_active,
      hasSeenBriefing: row.has_seen_briefing,
      mustChangePassword: row.must_change_password,
    };
  }

  let currentAdminUser: UserRecord = await loadAdminUser();

  // Dirty flag: set after any mutation dispatch completes (including
  // failures) via the adapter's finally block. The adapter only runs
  // a PGlite SELECT when dirty, avoiding a full reload before pure
  // reads. setSignedInRole refreshes directly instead of marking dirty.
  let adminUserDirty = false;

  async function refreshAdminUser(): Promise<void> {
    currentAdminUser = await loadAdminUser();
    adminUserDirty = false;
  }

  function markAdminUserDirty(): void {
    adminUserDirty = true;
  }

  // Cookie jar. The client-portal account procedures are the only ones
  // that need a real round-trip: accountLogin writes a Set-Cookie header
  // and accountBootstrap/accountMessages/accountLogout read it back off
  // req.headers.cookie. Everything else on that router is orgProcedure
  // and reads nothing from the request.
  //
  // Reset point: the jar is local to this boot. A demo restart reloads
  // the iframe, which reboots the engine and builds a fresh jar, so a
  // signed-out account cannot survive into the next run.
  const cookieJar = new Map<string, string>();

  const requestHeaders: Record<string, string> = {};

  function syncCookieHeader(): void {
    if (cookieJar.size === 0) {
      delete requestHeaders.cookie;
      return;
    }
    requestHeaders.cookie = Array.from(
      cookieJar,
      ([name, value]) => `${name}=${value}`,
    ).join("; ");
  }

  /**
   * Parse one Set-Cookie value back into the jar, which is what a browser
   * would do before the next request carries it in the Cookie header.
   * Only the pieces the portal actually uses are honoured: the name-value
   * pair and Max-Age=0 as the delete signal (buildExpiredClientSessionCookie
   * in client-portal.ts logs out that way). Expires, Domain, Path, Secure,
   * HttpOnly, and SameSite have no meaning against a fabricated request
   * that never leaves the page.
   */
  function acceptSetCookie(value: string): void {
    const [pair, ...attrs] = value.split(";");
    if (pair === undefined) return;
    const eq = pair.indexOf("=");
    if (eq === -1) return;
    const name = pair.slice(0, eq).trim();
    if (name === "") return;
    const cookieValue = pair.slice(eq + 1).trim();

    const expired = attrs.some((attr) => {
      const [attrName, attrValue] = attr.split("=");
      return (
        attrName?.trim().toLowerCase() === "max-age" &&
        Number(attrValue?.trim()) <= 0
      );
    });

    if (expired || cookieValue === "") {
      cookieJar.delete(name);
    } else {
      cookieJar.set(name, cookieValue);
    }
    syncCookieHeader();
  }

  const adminCtx: Context = {
    // auth.login reads req.socket.remoteAddress (request-utils getClientIp)
    // for its rate-limit and ip-token inputs, so the fabricated request
    // needs a socket with a stable placeholder address.
    req: {
      headers: requestHeaders,
      socket: { remoteAddress: "127.0.0.1" },
    } as unknown as Context["req"],
    res: {
      setHeader(name: string, value: string): void {
        // Set-Cookie is the one header the embedded engine has to honour;
        // there is no HTTP transport for the rest.
        if (name.toLowerCase() === "set-cookie") {
          acceptSetCookie(value);
        }
      },
    } as unknown as Context["res"],
    org: orgCtx,
    session: adminSession,
    get user(): UserRecord {
      return currentAdminUser;
    },
  };

  const callerFactory = deps.createCallerFactory(appRouter);
  const adminCaller = callerFactory(adminCtx);

  // Non-admin context for middleware testing
  const volunteerUser: UserRecord = {
    id: globalThis.crypto.randomUUID() as UserId,
    encryptedIdentifier: "",
    encryptedDisplayName: "",
    encryptedPreferredLocale: null,
    roleId: RoleId.VOLUNTEER,
    isActive: true,
    hasSeenBriefing: true,
    mustChangePassword: false,
  };

  const volunteerCtx: Context = {
    ...adminCtx,
    user: volunteerUser,
    session: { ...adminSession, userId: volunteerUser.id },
  };

  // Caller adapter (wire reshape + dispatch proxy)
  const trpcAdapter = deps.createCallerAdapter({
    callerObj: adminCaller,
    refreshAdminUser,
    markDirty: markAdminUserDirty,
    isDirty: () => adminUserDirty,
  });

  return {
    trpc: trpcAdapter,
    callerFactory,
    adminCtx,
    volunteerCtx,
    refreshAdminUser,
    markAdminUserDirty,
    isAdminUserDirty: () => adminUserDirty,
    setSignedInRole: async (
      roleId: RoleIdValue,
    ): Promise<readonly Permission[]> => {
      await tDb
        .updateTable("users")
        .set({ role_id: roleId })
        .where("id", "=", seedResult.adminUserId)
        .execute();
      // Refresh immediately so the auth.me call below (and every
      // subsequent ctx.user read) sees the new role_id. The adapter's
      // own finally-based markDirty handles the dispatch path; this
      // out-of-band UPDATE bypasses dispatch, so a direct refresh is
      // the correct synchronization point.
      await refreshAdminUser();
      const me = await adminCaller.auth.me();
      return me.permissions;
    },
  };
}

// ── Blob resolver ───────────────────────────────────────────────────

/** Blob resolver for the fetch-blob stub (recordings, attachments, kb-attachments). */
export function createEngineBlobResolver(
  tDb: Kysely<TenantDatabase>,
  blobStore: BlobStore,
): DemoBlobResolver {
  // Demo is single-user with all-fictional data; no auth/role checks.
  return {
    async resolveBlob(category, id): Promise<Uint8Array | null> {
      // Portal categories share the underlying attachments/recordings
      // tables. The server resolves them through the portal join tables
      // with channel-scoped auth; the demo skips auth and queries the
      // org-side table directly.
      // Exhaustive rather than a trailing else: a sixth category added to
      // BlobCategory would otherwise land in kb_attachments silently and
      // return the wrong org's bytes rather than failing.
      const tableName = (():
        "recordings" | "attachments" | "kb_attachments" => {
        switch (category) {
          case "recordings":
          case "portal-recordings":
            return "recordings";
          case "attachments":
          case "portal-attachments":
            return "attachments";
          case "kb-attachments":
            return "kb_attachments";
          default: {
            const unreachable: never = category;
            throw new DemoEngineError(
              `Unknown blob category: ${String(unreachable)}`,
            );
          }
        }
      })();

      // The id parameter is a plain string from the DemoBlobResolver
      // interface, but the tables have distinct branded id columns.
      // A single cast to the union's common shape is the cleanest fix
      // for this generic lookup across the five categories.
      const brandedId = id as RecordingId & AttachmentId & KbAttachmentId;
      const row = await tDb
        .selectFrom(tableName)
        .select("blob_key")
        .where("id", "=", brandedId)
        .where("deleted_at", "is", null)
        .executeTakeFirst();

      if (!row) return null;

      const blob = await blobStore.get(row.blob_key);
      if (!blob) return null;

      return new Uint8Array(blob.buffer, blob.byteOffset, blob.byteLength);
    },
  };
}
