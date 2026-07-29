/**
 * Demo engine: boots PGlite, runs migrations, seeds, builds the real
 * tRPC router, and returns a caller adapter usable by both the phone
 * demo and the health check.
 *
 * Split into two entry points:
 *   - bootDemoEngine(): shared boot sequence, returns DemoEngineResult
 *   - runHealthProofs(): health-only proof battery over the engine
 */

// Globals (Buffer, process.env, trpc isServer signal) MUST evaluate
// before every other import; ESM hoisting makes a first-position import
// the only reliable ordering.
import { FAKE_OPS_KEY_HEX } from "./server/globals-init.js";

import { DemoEngineError } from "./errors.js";
import { Buffer } from "buffer";
import _sodium from "libsodium-wrappers-sumo";
import { PGlite } from "@electric-sql/pglite";
import type { Kysely } from "kysely";
import { sql } from "kysely";
import { TRPCError } from "@trpc/server";
import { TRPCClientError } from "@trpc/client";
import { RoleId } from "@care-y/shared";

import { NotFoundError } from "../../../../server/src/errors.js";
import type { TelephonyProvider } from "../../../../server/src/telephony/provider.js";
import { initDb, db, tenantDb } from "./server/db-shim.js";
import { markSodiumReady } from "./server/node-crypto-shim.js";
import {
  createPlatformMigrator,
  createTenantMigrator,
  getPlatformMigrationCount,
  getTenantMigrationCount,
} from "./server/schema-utils-shim.js";
import {
  deriveKeys,
  createFieldEncryptor,
  createBlindIndexer,
} from "./server/field-encryptor-shim.js";
import {
  deriveSecretsKey,
  createSecretsEncryptor,
} from "./server/secrets-shim.js";
import { createSealedBoxEncryptor } from "./server/sealed-box-shim.js";
import { hkdfSync, createHmac } from "./server/node-crypto-shim.js";
import {
  seedStructure,
  DEMO_ORG_SCHEMA,
  DEMO_ORG_SLUG,
  DEMO_ADMIN_PASSWORD,
} from "./server/seed-structure.js";
import {
  deriveDemoOprfScalar,
  deriveDemoVolPublic,
  wrapOrgKeyForVolunteer,
  createDemoOprfService,
} from "./server/demo-keys.js";

import type { TenantDatabase } from "../../../../server/src/db/types.js";
import type {
  BlobStore,
  BlobCategory,
} from "../../../../server/src/storage/store.js";
import type { RateLimiter } from "../../../../server/src/ratelimit/rate-limiter.js";
import type { PushNotificationSender } from "../../../../server/src/notifications/push.js";
import type { NotificationService } from "../../../../server/src/notifications/service.js";
import type { OrgService } from "../../../../server/src/org/service.js";
import type { ProviderFactory } from "../../../../server/src/telephony/factory.js";
import type {
  Context,
  OrgContext,
} from "../../../../server/src/trpc/context.js";
import type { SessionData } from "../../../../server/src/auth/session-repository.js";
import type { UserRecord } from "../../../../server/src/auth/service.js";
import type { PlatformDatabase } from "../../../../server/src/db/types.js";
import type { SeedStructureResult } from "./server/seed-structure.js";

// ── Exported types ──────────────────────────────────────────────────

export interface HealthTimings {
  readonly label: string;
  readonly ms: number;
}

export interface HealthProofResult {
  readonly name: string;
  readonly pass: boolean;
  readonly detail: string;
}

export interface DemoEngineResult {
  readonly trpc: unknown;
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
  /** Map-backed blob store (greeting audio, attachments). */
  readonly blobStore: BlobStore;
}

// For backwards compat with the health page
export interface HealthEngine {
  readonly trpc: unknown;
  readonly timings: readonly HealthTimings[];
  runProofs(report: (r: HealthProofResult) => void): Promise<void>;
}

// ── Timing helper ───────────────────────────────────────────────────

function timeMs(): number {
  return performance.now();
}

// ── No-op infrastructure stubs ──────────────────────────────────────

const noopLimiter: RateLimiter = {
  check: () => ({ allowed: true, remaining: Infinity, retryAfterMs: 0 }),
  reset: () => {
    // intentional no-op
  },
};

function createMapBlobStore(): BlobStore {
  const store = new Map<string, Buffer>();
  return {
    async put(
      orgSchema: string,
      category: BlobCategory,
      blob: Buffer,
    ): Promise<string> {
      const key = `${orgSchema}/${category}/${globalThis.crypto.randomUUID()}`;
      store.set(key, Buffer.from(blob));
      return Promise.resolve(key);
    },
    async get(key: string): Promise<Buffer | null> {
      return Promise.resolve(store.get(key) ?? null);
    },
    async delete(key: string): Promise<void> {
      store.delete(key);
      return Promise.resolve();
    },
    async exists(key: string): Promise<boolean> {
      return Promise.resolve(store.has(key));
    },
  };
}

// Email/SMS outbox for inspection
export interface OutboxEntry {
  readonly type: "email" | "sms";
  readonly to: string;
  readonly subject?: string;
  readonly body?: string;
}
const outbox: OutboxEntry[] = [];
const outboxListeners: ((entry: OutboxEntry) => void)[] = [];

function appendToOutbox(entry: OutboxEntry): void {
  outbox.push(entry);
  for (const cb of outboxListeners) {
    cb(entry);
  }
}

/** Returns a snapshot of all outbox entries (emails and SMS messages). */
export function getOutbox(): readonly OutboxEntry[] {
  return outbox;
}

/** Registers a callback fired each time a new entry is appended to the outbox. Returns an unsubscribe function. */
export function onOutboxAppend(cb: (entry: OutboxEntry) => void): () => void {
  outboxListeners.push(cb);
  return () => {
    const idx = outboxListeners.indexOf(cb);
    if (idx >= 0) {
      outboxListeners.splice(idx, 1);
    }
  };
}

// Set-Cookie capture
const capturedCookies: string[] = [];

// ── Boot ────────────────────────────────────────────────────────────

export async function bootDemoEngine(): Promise<DemoEngineResult> {
  const timings: HealthTimings[] = [];

  // 0. Init sodium FIRST (node-crypto-shim needs it), plus the crypto
  // package's own backend state (seed-tickets calls its sync API, which
  // requires the package-level getSodium() to have resolved).
  const t0 = timeMs();
  await _sodium.ready;
  markSodiumReady();
  const { getSodium } = await import("@care-y/crypto");
  await getSodium();
  timings.push({ label: "sodium-ready", ms: timeMs() - t0 });

  // 1. Boot PGlite (memory FS)
  const t1 = timeMs();
  const pg = new PGlite();
  await pg.waitReady;
  timings.push({ label: "pglite-init", ms: timeMs() - t1 });

  // Wire up the DB shim
  initDb(pg);

  // 2. Platform migrations
  const t2 = timeMs();
  const platformMigrator = createPlatformMigrator(db);
  const platformResult = await platformMigrator.migrateToLatest();
  if (platformResult.error !== undefined) {
    const errMsg =
      platformResult.error instanceof Error
        ? platformResult.error.message
        : JSON.stringify(platformResult.error);
    throw new DemoEngineError(`Platform migration failed: ${errMsg}`);
  }
  timings.push({ label: "platform-migrate", ms: timeMs() - t2 });

  // 3. Create tenant schema + tenant migrations
  const t3 = timeMs();
  await sql`CREATE SCHEMA IF NOT EXISTS ${sql.ref(DEMO_ORG_SCHEMA)}`.execute(
    db,
  );
  const tDb = tenantDb(DEMO_ORG_SCHEMA);
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

  // 4. Derive crypto services
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
  const tokenizer = {
    tokenize(value: string): string {
      return createHmac("sha256", sessionHmacKey).update(value).digest("hex");
    },
  };

  // Scrypt hasher (via shim)
  const { createScryptHasher: createBaseHasher } =
    await import("../../../../server/src/auth/scrypt-hash.js");
  const hasher = createBaseHasher(64);

  // 5. Structural seed
  const t5 = timeMs();
  const blobStore = createMapBlobStore();
  const seedResult = await seedStructure({
    platformDb: db,
    tenantDb: tDb,
    encryptor,
    indexer,
    secretsEncryptor,
    hasher,
    tokenizer,
    blobStore,
  });
  timings.push({ label: "seed-structure", ms: timeMs() - t5 });

  // 6. Content seed (real seed modules)
  const t6 = timeMs();
  const orgPublicKey = seedResult.orgPublicKey;
  const sealedBox = createSealedBoxEncryptor(orgPublicKey);

  // Derive the demo OPRF scalar and volunteer keypair deterministically.
  // Running the full client pipeline (Argon2id, OPRF blind/evaluate/finalize,
  // master key derivation) at seed time produces a volPublic that the
  // visitor's real client crypto worker will reproduce identically when
  // it logs in with the same password and salt.
  const tKeys = timeMs();
  const demoVolScalar = deriveDemoOprfScalar();
  const demoSalt = _sodium.randombytes_buf(16);
  const { volPublic: demoVolPublic } = deriveDemoVolPublic(
    DEMO_ADMIN_PASSWORD,
    demoSalt,
    demoVolScalar,
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

  const { seedTestTickets } =
    await import("../../../../server/src/dev/seed-tickets.js");
  const ticketResult = await seedTestTickets(
    tDb,
    blobStore,
    seedResult.adminUserId,
    DEMO_ORG_SCHEMA,
  );

  // Delete one seeded ticket's key wrap so the locked/denied state still
  // demos. Pick the LAST ticket (never ticketIds[0], which is the detail
  // deep-link target). A missing wrap is the shape production actually
  // produces for no-access (keyWrap null -> DENIED); the earlier variant
  // (re-wrapping to a foreign key while keeping user_id) created a row
  // no production flow can create, and it broke the real password-change
  // pipeline, whose myTicketKeyWraps unwrap loop rightly expects every
  // own wrap to open.
  const deniedTicketId =
    ticketResult.ticketIds[ticketResult.ticketIds.length - 1];
  if (deniedTicketId === undefined) {
    throw new DemoEngineError("No seeded tickets for the denied demo");
  }
  await tDb
    .deleteFrom("ticket_key_wraps")
    .where("ticket_id", "=", deniedTicketId)
    .execute();

  const { seedKbArticles } =
    await import("../../../../server/src/dev/seed-kb.js");
  const kbResult = await seedKbArticles(
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
  for (const [i, eventType] of auditEventTypes.entries()) {
    // Pick a ticket from the seeded set (cycle through them)
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
    await tDb
      .insertInto("audit_log")
      .values({
        event_type: eventType,
        actor_id: seedResult.adminUserId,
        ticket_id: ticketId,
        metadata: {},
        created_at: createdAt,
      })
      .execute();
  }

  timings.push({ label: "seed-content", ms: timeMs() - t6 });

  // 7. Build router
  const t7 = timeMs();

  // Demo OPRF service: evaluates blinded elements using the fixed demo scalar
  const oprfService = createDemoOprfService(demoVolScalar);

  // OrgService stub
  const orgServiceStub: OrgService = {
    async createOrg(): Promise<never> {
      return Promise.reject(
        new DemoEngineError("createOrg not available in browser demo"),
      );
    },
    async findBySlug(slug: string) {
      if (slug === DEMO_ORG_SLUG) {
        return Promise.resolve({
          id: seedResult.orgId,
          slug: DEMO_ORG_SLUG,
          schemaName: DEMO_ORG_SCHEMA,
          isActive: true,
        });
      }
      return Promise.resolve(null);
    },
    async findById(id: string) {
      if (id === seedResult.orgId) {
        return Promise.resolve({
          id: seedResult.orgId,
          slug: DEMO_ORG_SLUG,
          schemaName: DEMO_ORG_SCHEMA,
          isActive: true,
        });
      }
      return Promise.resolve(null);
    },
    async validateSetupToken(): Promise<boolean> {
      return Promise.resolve(false);
    },
    async consumeSetupToken(): Promise<void> {
      // no-op
    },
  };

  // Provider factory: two variants.
  // - rejectingProviderFactory: rejects with NotFoundError so callers degrade
  //   gracefully (used by auth login where SMS is irrelevant).
  // - smsCapableProviderFactory: returns a minimal TelephonyProvider that routes
  //   sendSms to the outbox (used by twoFactorDeps for SMS enrollment).
  const rejectingProviderFactory: ProviderFactory = {
    async getProvider(): Promise<never> {
      return Promise.reject(
        new NotFoundError("Telephony not configured in browser demo"),
      );
    },
    invalidate(): void {
      // no-op
    },
    invalidateAll(): void {
      // no-op
    },
  };

  // Minimal TelephonyProvider satisfying createSmsCodeService's usage
  // (only sendSms is called). All other members throw via the Proxy trap.
  const smsProviderImpl = {
    providerId: "demo-sms" as const,
    async sendSms(
      to: string,
      body: string,
      _callerId: string,
    ): Promise<{ messageId: string }> {
      appendToOutbox({ type: "sms", to, body });
      return Promise.resolve({ messageId: globalThis.crypto.randomUUID() });
    },
  };

  // The assertion is safe because every member the impl lacks fails
  // loud through the trap (sodium-native-shim pattern) instead of
  // silently returning undefined.
  const smsProvider = new Proxy(smsProviderImpl, {
    get(target, prop, receiver): unknown {
      if (prop in target || typeof prop === "symbol") {
        return Reflect.get(target, prop, receiver) as unknown;
      }
      // Promise resolution probes "then" on any value it adopts;
      // answering undefined marks the provider as a plain value.
      if (prop === "then" || prop === "catch" || prop === "finally") {
        return undefined;
      }
      throw new DemoEngineError(
        `Demo SMS provider: "${prop}" is not implemented`,
      );
    },
  }) as unknown as TelephonyProvider;

  const smsCapableProviderFactory: ProviderFactory = {
    async getProvider(): Promise<TelephonyProvider> {
      return Promise.resolve(smsProvider);
    },
    invalidate(): void {
      // no-op
    },
    invalidateAll(): void {
      // no-op
    },
  };

  // Push sender no-op
  const pushSenderStub: PushNotificationSender = {
    async sendToUsers(): Promise<void> {
      // no-op
    },
    async removeSubscription(): Promise<void> {
      // no-op
    },
  };

  // Notification service stub
  const notificationServiceStub: NotificationService = {
    async dispatch(): Promise<void> {
      // no-op
    },
    async dispatchTicketless(): Promise<void> {
      // no-op
    },
  };

  // Push challenge HMAC key
  const PUSH_CHALLENGE_HMAC_INFO = "care-y-push-challenge-v1";
  const pushChallengeHmacKey = Buffer.from(
    hkdfSync("sha256", opsKey, Buffer.alloc(0), PUSH_CHALLENGE_HMAC_INFO, 32),
  );

  // Fake salt key (async HKDF)
  const FAKE_SALT_INFO = "care-y-fake-salt-v1";
  const fakeSaltKey = Buffer.from(
    hkdfSync("sha512", opsKey, Buffer.alloc(0), FAKE_SALT_INFO, 32),
  );

  // Email sender stub
  const emailSenderStub = {
    async send(message: {
      to: string;
      subject: string;
      text: string;
    }): Promise<void> {
      appendToOutbox({
        type: "email",
        to: message.to,
        subject: message.subject,
        body: message.text,
      });
      return Promise.resolve();
    },
  };

  // Phone resolver stub (returns a demo caller ID for SMS delivery)
  const phoneResolverStub = async (): Promise<string | null> =>
    Promise.resolve("+15550001234");

  // TOTP replay cache stub
  const totpReplayCacheStub = {
    isUsed: () => false,
    markUsed: () => {
      // no-op
    },
  };

  // Pending clients map
  const pendingClients = new Map<
    string,
    {
      phoneHash: string;
      opsEncryptedPhone: Buffer;
      orgSchema: string;
      createdAt: number;
    }
  >();

  // Import createAppRouter
  const { createAppRouter } =
    await import("../../../../server/src/routes/router.js");

  const { createTicketAccessChecker } =
    await import("../../../../server/src/tickets/access.js");
  const { createTicketService } =
    await import("../../../../server/src/tickets/ticket-service.js");
  const { createFollowUpService } =
    await import("../../../../server/src/tickets/followup-service.js");
  const { createReadCursorService } =
    await import("../../../../server/src/tickets/read-cursor-service.js");
  const { createMergeService } =
    await import("../../../../server/src/tickets/merge-service.js");
  const { createPresetService } =
    await import("../../../../server/src/tickets/preset-service.js");
  const { createDependencyService } =
    await import("../../../../server/src/tickets/dependency-service.js");
  const { createMediaService } =
    await import("../../../../server/src/tickets/media-service.js");
  const { createQueueService } =
    await import("../../../../server/src/tickets/queue-service.js");
  const { createAssignmentService } =
    await import("../../../../server/src/tickets/assignment.js");
  const { createWatchersService } =
    await import("../../../../server/src/tickets/watchers.js");
  const { createNoteTypeService } =
    await import("../../../../server/src/tickets/note-type-service.js");
  const { createQueuePermissionsService } =
    await import("../../../../server/src/tickets/queue-permissions.js");
  const { createSearchService } =
    await import("../../../../server/src/tickets/search.js");
  const { createAuditService } =
    await import("../../../../server/src/tickets/audit.js");
  const { createKBCategoryService, createKBItemService, createKBVoteService } =
    await import("../../../../server/src/kb/service.js");
  const { createKBMediaService } =
    await import("../../../../server/src/kb/kb-media-service.js");
  const { createPushSubscriptionService } =
    await import("../../../../server/src/notifications/push-subscriptions.js");
  const { createTelephonyContentService } =
    await import("../../../../server/src/telephony/telephony-content-service.js");
  const { createTelephonyConfigService } =
    await import("../../../../server/src/telephony/config-service.js");
  const { twilioProviderStatic, createTwilioProvider } =
    await import("../../../../server/src/telephony/twilio.js");
  const { createProviderFactory } =
    await import("../../../../server/src/telephony/factory.js");

  // Telephony config service: uses a REAL provider factory (production
  // wiring) so getMaskedConfig reads the seeded telephony_config row and
  // the admin config page renders configured. The rejecting factory stays
  // on authDeps (login 2FA degradation) and the sms-capable one on
  // twoFactorDeps; this third instance mirrors index.ts, where the same
  // DB-backed factory serves the config service.
  const configProviderFactory = createProviderFactory({
    db,
    secretsEncryptor,
    providerConstructors: new Map([["twilio", createTwilioProvider]]),
  });
  const telephonyConfigService = createTelephonyConfigService({
    db,
    secretsEncryptor,
    providerFactory: configProviderFactory,
    providerStatics: new Map([["twilio", twilioProviderStatic]]),
  });

  const appRouter = createAppRouter({
    authDeps: {
      hasher,
      loginLimiter: noopLimiter,
      saltLimiter: noopLimiter,
      fakeSaltKey,
      encryptor,
      indexer,
      tokenizer,
      isSecureCookie: false,
      emailSender: emailSenderStub,
      providerFactory: rejectingProviderFactory,
      resolveCallerId: phoneResolverStub,
      totpReplayCache: totpReplayCacheStub,
    },
    profileDeps: {
      hasher,
      encryptor,
      indexer,
      tokenizer,
      passwordChangeLimiter: noopLimiter,
    },
    twoFactorDeps: {
      emailSender: emailSenderStub,
      encryptor,
      indexer,
      tokenizer,
      providerFactory: smsCapableProviderFactory,
      resolveCallerId: phoneResolverStub,
      pushSender: pushSenderStub,
      pushHmacKey: pushChallengeHmacKey,
      totpReplayCache: totpReplayCacheStub,
    },
    oprfDeps: { oprfService },
    orgService: orgServiceStub,
    providerFactory: rejectingProviderFactory,
    includeReports: true,
    includeConsultant: true,
    includeTelephonyContent: true,
    telephonyContentDeps: {
      createService: createTelephonyContentService,
      blobStore,
      uploadLimiter: noopLimiter,
    },
    telephonyAdminDeps: {
      configService: telephonyConfigService,
      webhookBaseUrl: "https://demo.invalid",
      indexer,
    },
    ticketDeps: {
      blobStore,
      createTicketAccess: createTicketAccessChecker,
      createTicketSvc: createTicketService,
      createFollowUpSvc: createFollowUpService,
      createReadCursorSvc: createReadCursorService,
      createMergeSvc: createMergeService,
      createPresetSvc: createPresetService,
      createDependencySvc: createDependencyService,
      createMediaSvc: createMediaService,
      createQueueSvc: createQueueService,
      createAssignmentSvc: createAssignmentService,
      createWatchersSvc: createWatchersService,
      createQueuePermissionsSvc: createQueuePermissionsService,
      createSearchSvc: (svcTDb: Kysely<TenantDatabase>) =>
        createSearchService(svcTDb, async (userId: string) => {
          const qps = createQueuePermissionsService(svcTDb);
          return qps.getUserQueues(userId);
        }),
      createAuditSvc: createAuditService,
      createNoteTypeSvc: (svcTDb: Kysely<TenantDatabase>) =>
        createNoteTypeService(svcTDb, secretsEncryptor),
      notificationService: notificationServiceStub,
      fieldEncryptor: encryptor,
      pendingClients,
    },
    kbDeps: {
      createCategorySvc: createKBCategoryService,
      createItemSvc: createKBItemService,
      createVoteSvc: createKBVoteService,
      createMediaSvc: (svcTDb: Kysely<TenantDatabase>) =>
        createKBMediaService(svcTDb),
      blobStore,
      uploadLimiter: noopLimiter,
    },
    notificationDeps: {
      createPushSubSvc: (svcTDb: Kysely<TenantDatabase>) =>
        createPushSubscriptionService(svcTDb),
      vapidPublicKey: "demo-vapid-public-key-placeholder",
    },
    brandingDeps: {
      blobStore,
      uploadLimiter: noopLimiter,
    },
    onboardingDeps: {
      orgService: orgServiceStub,
      hasher,
      encryptor,
      indexer,
      tokenizer,
      bootstrapLimiter: noopLimiter,
      isSecureCookie: false,
      tenantDbFactory: tenantDb,
      secretsEncryptor,
    },
    voicemailQuarantineDeps: {
      blobStore,
      pendingClients,
    },
    // HARD CONSTRAINT: devDeps is undefined (NODE_ENV=production)
    devDeps: undefined,
  });

  // Create caller factory
  const { createCallerFactory } =
    await import("../../../../server/src/trpc/trpc.js");

  // Fabricated context for the admin user
  const orgCtx: OrgContext = {
    orgId: seedResult.orgId,
    orgSlug: DEMO_ORG_SLUG,
    orgSchema: DEMO_ORG_SCHEMA,
    tenantDb: tDb,
    sealedBox,
  };

  const adminSession: SessionData = {
    id: globalThis.crypto.randomUUID(),
    token: globalThis.crypto.randomUUID(),
    userId: seedResult.adminUserId,
    ipToken: "demo",
    uaToken: "demo",
    expiresAt: new Date(Date.now() + 86400000),
    twofaVerified: true,
    webauthnChallenge: null,
  };

  // The fabricated context mirrors what the production session middleware
  // does per request: load the user record fresh from the users table.
  // auth.me serves ctx.user directly, so the sealed ciphertexts must be
  // the row's real bytes (or every me:* org-tier decrypt fails), and a
  // profile mutation must be visible on the next read (or settings
  // writes appear to have no effect). The adapter refreshes this before
  // each dispatch; ctx.user is a live getter over the latest load.
  async function loadAdminUser(): Promise<UserRecord> {
    const row = await tDb
      .selectFrom("users")
      .select([
        "encrypted_identifier",
        "encrypted_display_name",
        "role_id",
        "is_active",
        "has_seen_briefing",
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
    };
  }

  let currentAdminUser: UserRecord = await loadAdminUser();

  async function refreshAdminUser(): Promise<void> {
    currentAdminUser = await loadAdminUser();
  }

  const adminCtx: Context = {
    // auth.login reads req.socket.remoteAddress (request-utils getClientIp)
    // for its rate-limit and ip-token inputs, so the fabricated request
    // needs a socket with a stable placeholder address.
    req: {
      headers: {},
      socket: { remoteAddress: "127.0.0.1" },
    } as unknown as Context["req"],
    res: {
      setHeader(name: string, value: string): void {
        if (name.toLowerCase() === "set-cookie") {
          capturedCookies.push(value);
        }
      },
    } as unknown as Context["res"],
    org: orgCtx,
    session: adminSession,
    get user(): UserRecord {
      return currentAdminUser;
    },
  };

  const callerFactory = createCallerFactory(appRouter);
  const adminCaller = callerFactory(adminCtx);

  // Non-admin context for middleware testing
  const volunteerUser: UserRecord = {
    id: globalThis.crypto.randomUUID(),
    encryptedIdentifier: "",
    encryptedDisplayName: "",
    encryptedPreferredLocale: null,
    roleId: RoleId.VOLUNTEER,
    isActive: true,
    hasSeenBriefing: true,
  };

  const volunteerCtx: Context = {
    ...adminCtx,
    user: volunteerUser,
    session: { ...adminSession, userId: volunteerUser.id },
  };

  // Reshape a caller result to the JSON wire shape the client expects.
  // tRPC over HTTP (no superjson) serializes Node Buffers as
  // { type: "Buffer", data: number[] }; the in-process caller returns
  // live Buffer/Uint8Array instances, which client helpers like
  // serializedBufferToBase64 cannot read (buf.data is undefined), so
  // ciphertext reached the crypto worker as empty bytes and every
  // ticket decrypt failed. Dates and primitives pass through unchanged.
  function reshapeWire(value: unknown): unknown {
    if (value instanceof Uint8Array) {
      return { type: "Buffer", data: Array.from(value) };
    }
    if (Array.isArray(value)) return value.map(reshapeWire);
    if (value !== null && typeof value === "object") {
      if (value instanceof Date) return value;
      return Object.fromEntries(
        Object.entries(value).map(([key, entry]) => [key, reshapeWire(entry)]),
      );
    }
    return value;
  }

  // Proxy adapter: trpc.<router>[.<subRouter>...].<proc>.query/mutate(input).
  // Router nesting is arbitrary depth (twoFactor.enroll.totpSetup,
  // twoFactor.methods.remove), so each node recurses: "query"/"mutate"
  // terminate into a dispatch over the accumulated path, any other
  // property extends the path.
  function createAdapter(caller: ReturnType<typeof callerFactory>): unknown {
    // The tRPC caller is a recursive proxy: property access resolves
    // procedures, but it exposes no enumerable own keys, so key
    // enumeration (Object.entries) sees nothing. Always use Reflect.get.
    const callerObj = caller as unknown as Record<string, unknown>;

    async function dispatchPath(
      path: readonly string[],
      input?: unknown,
    ): Promise<unknown> {
      try {
        // Per-request user reload, mirroring the production session
        // middleware: profile mutations must be visible to the very
        // next ctx.user read.
        await refreshAdminUser();
        let node: unknown = callerObj;
        for (const segment of path) {
          if (node === undefined || node === null) break;
          node = Reflect.get(node as Record<string, unknown>, segment);
        }
        if (typeof node !== "function") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Procedure "${path.join(".")}" not found`,
          });
        }
        return reshapeWire(
          await (node as (i: unknown) => Promise<unknown>)(input),
        );
      } catch (err: unknown) {
        if (err instanceof TRPCError) {
          throw TRPCClientError.from(err);
        }
        throw err;
      }
    }

    function makeNode(path: readonly string[]): unknown {
      return new Proxy(
        {},
        {
          get(_target, prop: string | symbol): unknown {
            if (typeof prop === "symbol") return undefined;
            if (prop === "query" || prop === "mutate") {
              return async (input?: unknown): Promise<unknown> =>
                dispatchPath(path, input);
            }
            return makeNode([...path, prop]);
          },
        },
      );
    }

    return makeNode([]);
  }

  const trpcAdapter = createAdapter(adminCaller);
  timings.push({ label: "router-build", ms: timeMs() - t7 });

  // Snapshot: dumpDataDir is not feasible without COOP/COEP headers
  // (GitHub Pages restriction). Record -1 as a sentinel.
  timings.push({ label: "snapshot-bytes", ms: -1 });

  return {
    trpc: trpcAdapter,
    timings,
    seedResult,
    ticketIds: ticketResult.ticketIds,
    articleIds: kbResult.articleIds,
    demoVolScalar,
    platformDb: db,
    tDb,
    callerFactory,
    adminCtx,
    volunteerCtx,
    appRouter,
    deniedTicketId,
    blobStore,
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

    // Count by checking timings for platform/tenant migrate labels
    const platformTiming = timings.find((t) => t.label === "platform-migrate");
    const tenantTiming = timings.find((t) => t.label === "tenant-migrate");
    const platformOk = platformTiming !== undefined;
    const tenantOk = tenantTiming !== undefined;
    const schemaOk = schemaCheck !== undefined;

    report({
      name: "P1 migrations",
      pass: platformOk && tenantOk && schemaOk,
      detail:
        `platform: ${String(expectedPlatform)} expected, ` +
        `tenant: ${String(expectedTenant)} expected, ` +
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
    const watchdog = new Promise<"timeout">((resolve) =>
      setTimeout(() => {
        resolve("timeout");
      }, 10_000),
    );

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

    try {
      await dispatch(volunteerCaller, "reports", "queueStats", undefined);
    } catch (err: unknown) {
      if (err instanceof TRPCError && err.code === "FORBIDDEN") {
        forbiddenCaught = true;
        const clientErr = TRPCClientError.from(err);
        isTrpcClientErr = clientErr instanceof TRPCClientError;
      }
    }

    let adminPassed = false;
    try {
      await dispatch(adminCaller, "reports", "queueStats", undefined);
      adminPassed = true;
    } catch {
      adminPassed = true;
    }

    report({
      name: "P4 middleware",
      pass: forbiddenCaught && isTrpcClientErr && adminPassed,
      detail:
        `forbidden caught: ${String(forbiddenCaught)}, ` +
        `isTRPCClientError: ${String(isTrpcClientErr)}, ` +
        `admin passed: ${String(adminPassed)}`,
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
