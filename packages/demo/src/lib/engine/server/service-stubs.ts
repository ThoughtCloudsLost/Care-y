/**
 * Demo service stubs and router construction.
 *
 * Extracted from bootDemoEngine to keep the boot function focused on
 * sequencing. All stubs, dynamic imports, and the createAppRouter call
 * live here. The builder takes crypto services and seed results as
 * dependencies, constructs every stub, and returns the wired appRouter
 * plus ancillary values the caller needs.
 */

import { Buffer } from "buffer";
import type { Kysely } from "kysely";

import { DemoEngineError } from "../errors.js";
import type { createAppRouter as createAppRouterFn } from "../../../../../server/src/routes/router.js";
import { NotFoundError } from "../../../../../server/src/errors.js";
import type { TelephonyProvider } from "../../../../../server/src/telephony/provider.js";
import { db, tenantDb } from "./db-shim.js";
import { hkdfSync } from "./node-crypto-shim.js";
import { appendToOutbox } from "../outbox.js";
import type { FieldEncryptor, BlindIndexer } from "./field-encryptor-shim.js";
import type { SecretsEncryptor } from "./secrets-shim.js";
import type { OrgId, UserId } from "@care-y/shared";
import type { OrgRecord } from "../../../../../server/src/org/service.js";

import type { TenantDatabase } from "../../../../../server/src/db/types.js";
import type { BlobStore } from "../../../../../server/src/storage/store.js";
import type { RateLimiter } from "../../../../../server/src/ratelimit/rate-limiter.js";
import type { PushNotificationSender } from "../../../../../server/src/notifications/push.js";
import type { NotificationService } from "../../../../../server/src/notifications/service.js";
import type { OrgService } from "../../../../../server/src/org/service.js";
import type { ProviderFactory } from "../../../../../server/src/telephony/factory.js";
import {
  DEMO_ORG_SLUG,
  DEMO_ORG_SCHEMA,
  type SeedStructureResult,
} from "./seed-structure.js";
import { createDemoOprfService } from "./demo-keys.js";
import type { SessionTokenizer } from "../../../../../server/src/crypto/session-tokenizer.js";
import type { ScryptHasher } from "../../../../../server/src/auth/scrypt-hash.js";
import type { PasswordHasher } from "../../../../../server/src/auth/password.js";
import type { PasswordHash } from "@care-y/shared";
import type { PendingClient } from "../../../../../server/src/tickets/ticket-service.js";

// ── Types ──────────────────────────────────────────────────────────

export interface ServiceStubDeps {
  readonly opsKey: Buffer;
  readonly seedResult: SeedStructureResult;
  readonly encryptor: FieldEncryptor;
  readonly indexer: BlindIndexer;
  readonly secretsEncryptor: SecretsEncryptor;
  readonly hasher: ScryptHasher;
  readonly tokenizer: SessionTokenizer;
  readonly blobStore: BlobStore;
  readonly demoVolScalar: Uint8Array;
  readonly noopLimiter: RateLimiter;
}

/**
 * The real router type, recovered from the factory so the engine's
 * caller keeps full procedure inference across the module boundary.
 */
export type DemoAppRouter = ReturnType<typeof createAppRouterFn>;

export interface ServiceStubResult {
  readonly appRouter: DemoAppRouter;
  readonly pendingClients: Map<string, PendingClient>;
}

/** Wraps a ScryptHasher with the branded hashPassword method PasswordHasher requires. */
function wrapAsPasswordHasher(base: ScryptHasher): PasswordHasher {
  return {
    hash: base.hash.bind(base),
    verify: base.verify.bind(base),
    async hashPassword(password: string): Promise<PasswordHash> {
      return (await base.hash(password)) as PasswordHash;
    },
  };
}

// ── Builder ────────────────────────────────────────────────────────

export async function buildServiceStubs(
  deps: ServiceStubDeps,
): Promise<ServiceStubResult> {
  const {
    opsKey,
    seedResult,
    encryptor,
    indexer,
    secretsEncryptor,
    hasher,
    tokenizer,
    blobStore,
    demoVolScalar,
    noopLimiter,
  } = deps;

  // Demo OPRF service: evaluates blinded elements using the fixed demo scalar
  const oprfService = createDemoOprfService(demoVolScalar);

  // OrgService stub
  const orgServiceStub: OrgService = {
    async createOrg(): Promise<never> {
      return Promise.reject(
        new DemoEngineError("createOrg not available in browser demo"),
      );
    },
    async findBySlug(slug: string): Promise<OrgRecord | null> {
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
    async findById(id: OrgId): Promise<OrgRecord | null> {
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
  const pendingClients = new Map<string, PendingClient>();

  // Import createAppRouter
  const { createAppRouter } =
    await import("../../../../../server/src/routes/router.js");

  const { createTicketAccessChecker } =
    await import("../../../../../server/src/tickets/access.js");
  const { createTicketService } =
    await import("../../../../../server/src/tickets/ticket-service.js");
  const { createFollowUpService } =
    await import("../../../../../server/src/tickets/followup-service.js");
  const { createReadCursorService } =
    await import("../../../../../server/src/tickets/read-cursor-service.js");
  const { createMergeService } =
    await import("../../../../../server/src/tickets/merge-service.js");
  const { createPresetService } =
    await import("../../../../../server/src/tickets/preset-service.js");
  const { createDependencyService } =
    await import("../../../../../server/src/tickets/dependency-service.js");
  const { createMediaService } =
    await import("../../../../../server/src/tickets/media-service.js");
  const { createQueueService } =
    await import("../../../../../server/src/tickets/queue-service.js");
  const { createAssignmentService } =
    await import("../../../../../server/src/tickets/assignment.js");
  const { createWatchersService } =
    await import("../../../../../server/src/tickets/watchers.js");
  const { createNoteTypeService } =
    await import("../../../../../server/src/tickets/note-type-service.js");
  const { createQueuePermissionsService } =
    await import("../../../../../server/src/tickets/queue-permissions.js");
  const { createSearchService } =
    await import("../../../../../server/src/tickets/search.js");
  const { createAuditService } =
    await import("../../../../../server/src/tickets/audit.js");
  const { createKBCategoryService, createKBItemService, createKBVoteService } =
    await import("../../../../../server/src/kb/service.js");
  const { createKBMediaService } =
    await import("../../../../../server/src/kb/kb-media-service.js");
  const { createPushSubscriptionService } =
    await import("../../../../../server/src/notifications/push-subscriptions.js");
  const { createTelephonyContentService } =
    await import("../../../../../server/src/telephony/telephony-content-service.js");
  const { createTelephonyConfigService } =
    await import("../../../../../server/src/telephony/config-service.js");
  const { twilioProviderStatic, createTwilioProvider } =
    await import("../../../../../server/src/telephony/twilio.js");
  const { createProviderFactory } =
    await import("../../../../../server/src/telephony/factory.js");

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

  const passwordHasher = wrapAsPasswordHasher(hasher);

  // Import notification preferences service for notificationDeps
  const { createNotificationPreferencesService } =
    await import("../../../../../server/src/notifications/preferences.js");

  const appRouter = createAppRouter({
    authDeps: {
      hasher: passwordHasher,
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
      hasher: passwordHasher,
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
        createSearchService(svcTDb, async (userId: UserId) => {
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
      preferencesService: createNotificationPreferencesService(),
    },
    brandingDeps: {
      blobStore,
      uploadLimiter: noopLimiter,
    },
    onboardingDeps: {
      orgService: orgServiceStub,
      hasher: passwordHasher,
      encryptor,
      indexer,
      tokenizer,
      bootstrapLimiter: noopLimiter,
      isSecureCookie: false,
      tenantDbFactory: tenantDb,
    },
    voicemailQuarantineDeps: {
      blobStore,
      pendingClients,
    },
    // HARD CONSTRAINT: devDeps is undefined (NODE_ENV=production)
    devDeps: undefined,
  });

  return { appRouter, pendingClients };
}
