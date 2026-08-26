import { validateEnv, EnvValidationError } from "./env.js";
import { extractErrorMessage } from "./errors.js";

// Validate env vars before anything else. Exits with a clear error if
// required vars are missing or malformed (same fail-fast as original).
try {
  validateEnv();
} catch (err) {
  if (err instanceof EnvValidationError) {
    console.error(err.message);
    process.exit(1);
  }
  throw err;
}

import type {
  IncomingMessage,
  RequestListener,
  ServerResponse,
} from "node:http";
import { createServer } from "node:http";
import { hkdfSync } from "node:crypto";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { db, tenantDb } from "./db/db.js";
import { sql } from "kysely";
import { getEnv, type EnvVars } from "./env.js";
import { createOrgService } from "./org/service.js";
import { createScryptHasher } from "./auth/password.js";
import {
  createInMemoryRateLimiter,
  assertSingleInstanceRateLimiting,
  type RateLimiter,
} from "./ratelimit/rate-limiter.js";
import {
  createTotpReplayCache,
  assertSingleInstanceTotpReplayCache,
} from "./auth/totp-replay-cache.js";
import {
  deriveKeys,
  createFieldEncryptor,
  createBlindIndexer,
  deriveConsultantPhoneIndexKey,
  type FieldEncryptor,
  type BlindIndexer,
} from "./crypto/field-encryptor.js";
import { deriveFakeSaltKey } from "./auth/salt-defense.js";
import {
  deriveSessionHmacKey,
  createSessionTokenizer,
  type SessionTokenizer,
} from "./crypto/session-tokenizer.js";
import { createContextFactory } from "./trpc/context.js";
import { createAppRouter } from "./routes/router.js";
import { createEmailSender } from "./email/email-sender.js";
import { createIpcEvaluator } from "./crypto/oprf-ipc.js";
import { createPowVerifier } from "./crypto/pow.js";
import { createOprfAuditLogger } from "./crypto/oprf-audit.js";
import { createOprfEvaluateService } from "./crypto/oprf-evaluate-service.js";
import { createJobQueue } from "./jobs/index.js";
import { deriveSecretsKey, createSecretsEncryptor } from "./config/secrets.js";
import { createProviderFactory } from "./telephony/factory.js";
import type { ProviderConstructor } from "./telephony/factory.js";
import type { TelephonyProviderStatic } from "./telephony/provider.js";
import {
  createTwilioProvider,
  twilioProviderStatic,
} from "./telephony/twilio.js";
import { createWebhookHandler } from "./routes/webhooks.js";
import { createTelephonyContentService } from "./telephony/telephony-content-service.js";
import { createGreetingAudioHandler } from "./routes/greeting-audio.js";
import { createBrandingIconHandler } from "./routes/branding-icons.js";
import { createBlobDownloadHandler } from "./routes/blob-download.js";
import { createManifestHandler } from "./routes/manifest.js";
import { createRelayHandler, type PendingCall } from "./routes/relay.js";
import { authenticateRelay, type OrgResolved } from "./routes/relay-utils.js";
import { createDbCallTracker } from "./telephony/call-tracker.js";
import { getReachabilityForUsers } from "./telephony/reachability.js";
import { extractOrgSlug } from "./org/slug-resolver.js";
import { NotFoundError } from "./errors.js";
import { createPhoneResolver } from "./telephony/phone-resolver.js";
import { createConsultantRepository } from "./telephony/models/consultant-repo.js";
import { createConsultantService } from "./telephony/consultant-service.js";
import { createDbSessionRepository } from "./auth/session-repository.js";
import { createDedupStore } from "./telephony/dedup-store.js";
import { registerLogDeletionHandler } from "./jobs/log-deletion.js";
import { createTelephonyConfigService } from "./telephony/config-service.js";
import { createBlobStore, type BlobStore } from "./storage/index.js";
import {
  createSealedBoxEncryptor,
  type SealedBoxEncryptor,
} from "./crypto/sealed-box.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "./db/types.js";
import { createWebhookDispatch } from "./telephony/webhook-dispatch.js";
import { createTicketAccessChecker } from "./tickets/access.js";
import {
  createTicketService,
  type PendingClient,
} from "./tickets/ticket-service.js";
import { createFollowUpService } from "./tickets/followup-service.js";
import { createReadCursorService } from "./tickets/read-cursor-service.js";
import { createMergeService } from "./tickets/merge-service.js";
import { createPresetService } from "./tickets/preset-service.js";
import { createDependencyService } from "./tickets/dependency-service.js";
import {
  createMediaService,
  registerMediaCleanupHandler,
  MEDIA_CLEANUP_QUEUE,
} from "./tickets/media-service.js";
import { createQueueService } from "./tickets/queue-service.js";
import { createAssignmentService } from "./tickets/assignment.js";
import { createWatchersService } from "./tickets/watchers.js";
import { createNoteTypeService } from "./tickets/note-type-service.js";
import { createQueuePermissionsService } from "./tickets/queue-permissions.js";
import {
  registerEscalationHandler,
  escalateTenantTickets,
  ESCALATION_QUEUE,
} from "./tickets/escalation.js";
import { loadOrCreateVapidKeys } from "./notifications/vapid.js";
import { createSseService } from "./notifications/sse.js";
import { createNotificationEmailSender } from "./notifications/email.js";
import { createPushNotificationSender } from "./notifications/push.js";
import { createPushSubscriptionService } from "./notifications/push-subscriptions.js";
import {
  createNotificationJobHandler,
  createNotificationService,
} from "./notifications/service.js";
import { registerNotificationSmsHandler } from "./jobs/notification-sms.js";
import { createNotificationPreferencesService } from "./notifications/preferences.js";
import { createSearchService } from "./tickets/search.js";
import { createAuditService } from "./tickets/audit.js";
import {
  createKBCategoryService,
  createKBItemService,
  createKBVoteService,
} from "./kb/service.js";
import { createKBMediaService } from "./kb/kb-media-service.js";
import { createClientService } from "./clients/client-service.js";
import { createIntakeFormService } from "./portal/intake-form-service.js";
import { createIntakeResponseService } from "./portal/intake-response-service.js";
import * as portalChannelService from "./portal/channel-service.js";
import * as portalMessageService from "./portal/portal-message-service.js";
import {
  registerPortalExpiryHandler,
  expirePortalMessages,
  PORTAL_EXPIRY_QUEUE,
} from "./jobs/portal-message-expiry.js";
import {
  registerShareCleanupHandler,
  SHARE_CLEANUP_QUEUE,
} from "./portal/share-service.js";
import {
  registerEscalationRulesHandler,
  ESCALATION_RULES_QUEUE,
  DEFAULT_ESCALATION_RULES_INTERVAL_MS,
} from "./jobs/escalation-checker.js";
import { ensureRecurringJob } from "./jobs/ensure-recurring.js";
import {
  runEscalationCheck,
  type EscalationServiceDeps,
} from "./tickets/escalation-service.js";
import { RoleId } from "@care-y/shared";
import type {
  OrgId,
  OrgSchema,
  OrgSlug,
  StoredProviderId,
} from "@care-y/shared";

// --- DB startup probe ---

/** Executes a trivial query to verify the connection pool is alive.
 *  Kysely pools are lazy, so this forces an immediate connection. */
async function probeDatabase(): Promise<void> {
  try {
    await db.executeQuery(sql`SELECT 1`.compile(db));
    console.log("Database connected");
  } catch (err) {
    // Log only the message. The full error object may contain DATABASE_URL (credentials).
    console.error("Database connection failed:", extractErrorMessage(err));
    process.exit(1);
  }
}

// --- Crypto key derivation ---

interface CryptoServices {
  readonly encryptor: FieldEncryptor;
  readonly indexer: BlindIndexer;
  readonly consultantPhoneIndexer: BlindIndexer;
  readonly fakeSaltKey: Buffer;
  readonly tokenizer: SessionTokenizer;
  readonly pushChallengeHmacKey: Buffer;
}

const PUSH_CHALLENGE_HMAC_INFO = "care-y-push-challenge-v1";

/** Derives the push challenge HMAC key from OPS_SECRETS_KEY via HKDF. */
function derivePushChallengeHmacKey(opsKey: Buffer): Buffer {
  return Buffer.from(
    hkdfSync("sha256", opsKey, Buffer.alloc(0), PUSH_CHALLENGE_HMAC_INFO, 32),
  );
}

/** Derives all field-encryption, blind-index, fake-salt, and session-token
 *  keys from OPS_SECRETS_KEY. Called once at startup. */
async function deriveCryptoServices(
  opsSecretsKeyHex: string,
): Promise<CryptoServices> {
  const opsKey = Buffer.from(opsSecretsKeyHex, "hex");
  const derived = deriveKeys(opsKey);
  const encryptor = createFieldEncryptor(derived.fieldEncryptKey);
  const indexer = createBlindIndexer(derived.blindIndexKey);
  const consultantPhoneIndexer = createBlindIndexer(
    deriveConsultantPhoneIndexKey(opsKey),
  );
  const fakeSaltKey = await deriveFakeSaltKey(opsSecretsKeyHex);
  const tokenizer = createSessionTokenizer(deriveSessionHmacKey(opsKey));
  const pushChallengeHmacKey = derivePushChallengeHmacKey(opsKey);
  return {
    encryptor,
    indexer,
    consultantPhoneIndexer,
    fakeSaltKey,
    tokenizer,
    pushChallengeHmacKey,
  };
}

// --- CORS ---

interface CorsHeaders {
  readonly base: Record<string, string>;
  readonly preflight: Record<string, string>;
}

function buildCorsHeaders(origin: string): CorsHeaders {
  const base = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  } as const;

  return {
    base,
    preflight: { ...base, "Access-Control-Max-Age": "86400" },
  };
}

// --- HTTP server ---

/** A path-prefix route entry. Handler is invoked when req.url starts with prefix. */
interface HttpRoute {
  readonly prefix: string;
  readonly handler: (
    req: IncomingMessage,
    res: ServerResponse,
  ) => void | Promise<void>;
}

/** Creates an http.Server that dispatches by path prefix (first match wins),
 *  falling through to tRPC for unmatched routes. */
function createHttpServer(
  trpcHandler: RequestListener,
  preflightHeaders: Record<string, string>,
  routes: readonly HttpRoute[],
): ReturnType<typeof createServer> {
  return createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, preflightHeaders);
      res.end();
      return;
    }

    const url = req.url ?? "";

    for (const route of routes) {
      if (url.startsWith(route.prefix)) {
        void Promise.resolve(route.handler(req, res));
        return;
      }
    }

    trpcHandler(req, res);
  });
}

// --- Rate limit constants ---

const RATE_WINDOW_1M = 60_000;
const RATE_WINDOW_1H = 3_600_000;
const RATE_WINDOW_15M = 15 * 60 * 1000;

const RATE_LOGIN_MAX = 5;
const RATE_SALT_MAX = 20;
const RATE_OPRF_USER_MAX = 10;
const RATE_OPRF_IP_MAX = 50;
const RATE_PASSWORD_CHANGE_MAX = 5;
const RATE_UPLOAD_MAX = 3;
const RATE_KB_UPLOAD_MAX = 5;
const RATE_BRANDING_UPLOAD_MAX = 3;
const RATE_BOOTSTRAP_MAX = getEnv().NODE_ENV === "production" ? 2 : 20;

// Portal read: 60 req/hour per IP. A 5-minute polling interval uses 12/hr.
// refetchOnWindowFocus adds ~5-10/hr. The remaining headroom covers
// CGNAT-shared IPs where multiple clients behind the same NAT share
// one public IP.
const RATE_PORTAL_READ_MAX = 60;
// Portal reply: 30 req/hour per IP. Reply writes 3 DB rows per call
// (follow-up + portal wrap + portal message), so a lower cap limits
// storage DoS from a single source.
const RATE_PORTAL_REPLY_MAX = 30;

// Share open: 10 req/min per IP. Defense in depth on the public consume
// endpoint. UUIDv4 ids (122 random bits) make enumeration infeasible;
// the limiter caps probe volume and log noise.
const RATE_SHARE_OPEN_MAX = 10;

// Account salt + login: 10 req/hour per IP each. Online guessing is
// already throttled at the OPRF step; these bound salt-endpoint
// scraping and login spam independently.
const RATE_ACCOUNT_SALT_MAX = 10;
const RATE_ACCOUNT_LOGIN_MAX = 10;

// --- Rate limiters ---

const noopLimiter: RateLimiter = {
  check: () => ({ allowed: true, remaining: Infinity, retryAfterMs: 0 }),
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- intentional no-op for dev
  reset: () => {},
};

interface RateLimiters {
  readonly loginLimiter: ReturnType<typeof createInMemoryRateLimiter>;
  readonly saltLimiter: ReturnType<typeof createInMemoryRateLimiter>;
}

function createAuthRateLimiters(): RateLimiters {
  if (getEnv().NODE_ENV === "development") {
    return { loginLimiter: noopLimiter, saltLimiter: noopLimiter };
  }
  return {
    loginLimiter: createInMemoryRateLimiter({
      windowMs: RATE_WINDOW_1M,
      maxRequests: RATE_LOGIN_MAX,
    }),
    saltLimiter: createInMemoryRateLimiter({
      windowMs: RATE_WINDOW_1M,
      maxRequests: RATE_SALT_MAX,
    }),
  };
}

// --- OPRF infrastructure ---
// The main server uses @care-y/crypto functions (lagrangeInterpolate,
// toRistrettoPoint) to combine partial OPRF evaluations from the sidecars.
// These functions require the sodium backend to be initialized.
import { getSodium } from "@care-y/crypto";
await getSodium();

import type { OprfEvaluateService } from "./crypto/oprf-evaluate-service.js";

function createOprfInfrastructure(env: EnvVars): OprfEvaluateService {
  const evaluator = createIpcEvaluator({
    socketPathA: env.OPRF_SOCKET_A,
    socketPathB: env.OPRF_SOCKET_B,
  });

  const userRateLimiter =
    getEnv().NODE_ENV === "development"
      ? noopLimiter
      : createInMemoryRateLimiter({
          windowMs: RATE_WINDOW_15M,
          maxRequests: RATE_OPRF_USER_MAX,
        });
  const ipRateLimiter =
    getEnv().NODE_ENV === "development"
      ? noopLimiter
      : createInMemoryRateLimiter({
          windowMs: RATE_WINDOW_15M,
          maxRequests: RATE_OPRF_IP_MAX,
        });

  const opsKeyBuf = Buffer.from(env.OPS_SECRETS_KEY, "hex");
  const auditLogger = createOprfAuditLogger(db, opsKeyBuf);

  return createOprfEvaluateService({
    evaluator,
    userRateLimiter,
    ipRateLimiter,
    powVerifier: createPowVerifier(),
    auditLogger,
  });
}

// --- Bootstrap ---

await probeDatabase();

const env: EnvVars = getEnv();

// Fail fast when a multi-instance deployment is declared but only
// process-local in-memory stores (rate limiter, TOTP replay cache) are
// available.
assertSingleInstanceRateLimiting(env.APP_MULTI_INSTANCE);
assertSingleInstanceTotpReplayCache(env.APP_MULTI_INSTANCE);

const {
  encryptor,
  indexer,
  consultantPhoneIndexer,
  fakeSaltKey,
  tokenizer,
  pushChallengeHmacKey,
} = await deriveCryptoServices(env.OPS_SECRETS_KEY);

// --- Telephony provider factory ---

const secretsKey = deriveSecretsKey(Buffer.from(env.OPS_SECRETS_KEY, "hex"));
const secretsEncryptor = createSecretsEncryptor(secretsKey);

// Keyed by the shared stored-provider union: registering an id that is not
// in STORED_PROVIDER_IDS is a compile error, so this map cannot drift from
// the single registry source.
const providerConstructors = new Map<StoredProviderId, ProviderConstructor>([
  ["twilio", createTwilioProvider],
]);

// Register mock provider (dev/test only). Production stays fail-closed:
// schema validation passes (mockConfigSchema is unconditional) but the
// constructor lookup here fails, which is the correct behavior.
if (env.NODE_ENV !== "production") {
  const { createMockProvider } = await import("./telephony/mock-provider.js");
  providerConstructors.set("mock", createMockProvider);
}

const providerFactory = createProviderFactory({
  db,
  secretsEncryptor,
  providerConstructors,
});

// --- BlobStore ---

const blobStore: BlobStore = createBlobStore(
  env.BLOB_STORE_TYPE,
  env.BLOB_STORE_PATH,
);

const orgService = createOrgService(db, tenantDb);
const hasher = createScryptHasher();
const { loginLimiter, saltLimiter } = createAuthRateLimiters();
const emailSender = createEmailSender({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  from: env.SMTP_FROM,
  secure: env.SMTP_SECURE,
  user: env.SMTP_USER,
  password: env.SMTP_PASSWORD,
});
const oprfService = createOprfInfrastructure(env);

// --- Notification infrastructure ---

const vapidKeys = await loadOrCreateVapidKeys(db, secretsEncryptor);
const sseService = createSseService();
const notificationEmailSender = createNotificationEmailSender(emailSender);
const pushSender = createPushNotificationSender(vapidKeys, "admin@care-y.app");

// Job queue created early so NotificationService can use it during routing.
const jobQueue = createJobQueue(db);

const preferencesService = createNotificationPreferencesService();

const notificationService = createNotificationService({
  sse: sseService,
  emailSender: notificationEmailSender,
  pushSender,
  jobQueue,
  preferences: preferencesService,
  getReachabilityForUsers,
});

const createContext = createContextFactory({
  orgService,
  hasher,
  encryptor,
  indexer,
  tokenizer,
});

const providerStatics = new Map<StoredProviderId, TelephonyProviderStatic>([
  ["twilio", twilioProviderStatic],
]);

// Register mock statics (dev/test only), gated identically to the constructor.
if (env.NODE_ENV !== "production") {
  const { mockProviderStatic } = await import("./telephony/mock-provider.js");
  providerStatics.set("mock", mockProviderStatic);
}
const telephonyConfigService = createTelephonyConfigService({
  db,
  secretsEncryptor,
  providerFactory,
  providerStatics,
});

// --- Phone purpose resolver ---

const phoneResolver = createPhoneResolver({
  async getOrgConfig(orgSchema: OrgSchema) {
    const tDb = tenantDb(orgSchema);
    const row = await tDb
      .selectFrom("org_config")
      .select(["phone_outbound_sid", "phone_system_sid"])
      .executeTakeFirst();
    return {
      phone_outbound_sid: row?.phone_outbound_sid ?? null,
      phone_system_sid: row?.phone_system_sid ?? null,
    };
  },
  async getProvisionedPhones(orgId: OrgId) {
    return telephonyConfigService.lookupProvisionedPhones(orgId);
  },
});

const pendingClients = new Map<string, PendingClient>();

// One instance shared by the auth and two-factor routers so a TOTP code
// accepted on either path is burned for both (RFC 6238 Section 5.2).
const totpReplayCache = createTotpReplayCache();

const appRouter = createAppRouter({
  authDeps: {
    hasher,
    loginLimiter,
    saltLimiter,
    fakeSaltKey,
    encryptor,
    indexer,
    tokenizer,
    isSecureCookie: env.NODE_ENV === "production",
    emailSender,
    providerFactory,
    resolveCallerId: phoneResolver,
    totpReplayCache,
  },
  profileDeps: {
    hasher,
    encryptor,
    indexer,
    tokenizer,
    passwordChangeLimiter: createInMemoryRateLimiter({
      windowMs: RATE_WINDOW_1M,
      maxRequests: RATE_PASSWORD_CHANGE_MAX,
    }),
  },
  twoFactorDeps: {
    emailSender,
    encryptor,
    indexer,
    tokenizer,
    providerFactory,
    resolveCallerId: phoneResolver,
    pushSender,
    pushHmacKey: pushChallengeHmacKey,
    totpReplayCache,
  },
  oprfDeps: { oprfService },
  orgService,
  providerFactory,
  telephonyAdminDeps: {
    configService: telephonyConfigService,
    webhookBaseUrl: env.WEBHOOK_BASE_URL,
    indexer,
  },
  telephonyContentDeps: {
    createService: createTelephonyContentService,
    blobStore,
    uploadLimiter: createInMemoryRateLimiter({
      windowMs: RATE_WINDOW_1M,
      maxRequests: RATE_UPLOAD_MAX,
    }),
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
    createSearchSvc: (tDb) =>
      createSearchService(tDb, async (userId) => {
        const qps = createQueuePermissionsService(tDb);
        return qps.getUserQueues(userId);
      }),
    createAuditSvc: createAuditService,
    createNoteTypeSvc: (tDb) => createNoteTypeService(tDb, secretsEncryptor),
    notificationService,
    fieldEncryptor: encryptor,
    pendingClients,
  },
  kbDeps: {
    createCategorySvc: createKBCategoryService,
    createItemSvc: createKBItemService,
    createVoteSvc: createKBVoteService,
    createMediaSvc: (tDb) => createKBMediaService(tDb),
    blobStore,
    uploadLimiter: createInMemoryRateLimiter({
      windowMs: RATE_WINDOW_1M,
      maxRequests: RATE_KB_UPLOAD_MAX,
    }),
  },
  notificationDeps: {
    createPushSubSvc: (tDb) => createPushSubscriptionService(tDb),
    vapidPublicKey: vapidKeys.publicKey,
    preferencesService,
  },
  escalationDeps: {
    createAuditSvc: (tDb) => createAuditService(tDb),
  },
  intakeFormDeps: {
    createAuditSvc: (tDb) => createAuditService(tDb),
    intakeFormService: createIntakeFormService({ fieldEncryptor: encryptor }),
    intakeResponseService: createIntakeResponseService(),
  },
  clientPortalDeps: {
    submissionLimiter: createInMemoryRateLimiter({
      windowMs: RATE_WINDOW_1H,
      maxRequests: env.INTAKE_SUBMISSION_LIMIT,
    }),
    challengeLimiter: createInMemoryRateLimiter({
      windowMs: RATE_WINDOW_1H,
      maxRequests: 10,
    }),
    powVerifier:
      env.INTAKE_POW_DIFFICULTY > 0
        ? createPowVerifier({
            baseDifficulty: env.INTAKE_POW_DIFFICULTY,
            challengeTtlMs: 5 * 60 * 1000,
          })
        : null,
    intakeFormService: createIntakeFormService({ fieldEncryptor: encryptor }),
    notificationService,
    fieldEncryptor: encryptor,
    // Secure Link portal deps (separate limiters from intake)
    portalChannelService: {
      resolveAuthedChannel: portalChannelService.resolveAuthedChannel,
    },
    portalMessageService: {
      bootstrap: portalMessageService.bootstrap,
      clientReply: portalMessageService.clientReply,
    },
    portalReadLimiter: createInMemoryRateLimiter({
      windowMs: RATE_WINDOW_1H,
      maxRequests: RATE_PORTAL_READ_MAX,
    }),
    portalReplyLimiter: createInMemoryRateLimiter({
      windowMs: RATE_WINDOW_1H,
      maxRequests: RATE_PORTAL_REPLY_MAX,
    }),
    portalGetProvider: async (orgId: OrgId) =>
      providerFactory.getProvider(orgId),
    portalResolveCallerId: phoneResolver,
    shareLimiter: createInMemoryRateLimiter({
      windowMs: RATE_WINDOW_1M,
      maxRequests: RATE_SHARE_OPEN_MAX,
    }),
    // Encrypted Account deps (orgUuid resolved per-request from ctx.org)
    accountServiceDeps: {
      indexer,
      fakeSaltKey,
    },
    accountSaltLimiter: createInMemoryRateLimiter({
      windowMs: RATE_WINDOW_1H,
      maxRequests: RATE_ACCOUNT_SALT_MAX,
    }),
    accountLoginLimiter: createInMemoryRateLimiter({
      windowMs: RATE_WINDOW_1H,
      maxRequests: RATE_ACCOUNT_LOGIN_MAX,
    }),
  },
  brandingDeps: {
    blobStore,
    uploadLimiter: createInMemoryRateLimiter({
      windowMs: RATE_WINDOW_1M,
      maxRequests: RATE_BRANDING_UPLOAD_MAX,
    }),
  },
  onboardingDeps: {
    orgService,
    hasher,
    encryptor,
    indexer,
    tokenizer,
    bootstrapLimiter: createInMemoryRateLimiter({
      windowMs: RATE_WINDOW_1H,
      maxRequests: RATE_BOOTSTRAP_MAX,
    }),
    isSecureCookie: env.NODE_ENV === "production",
    tenantDbFactory: tenantDb,
  },
  voicemailQuarantineDeps: {
    blobStore,
    pendingClients,
  },
  clientDeps: {
    createClientSvc: (tDb, orgId) =>
      createClientService({
        db: tDb,
        audit: createAuditService(tDb),
        encryptor,
        indexer,
        mergeService: createMergeService(tDb),
        orgId,
      }),
    fieldEncryptor: encryptor,
    async isAssignedToClientTicket(tDb, clientId, userId) {
      const row = await tDb
        .selectFrom("tickets")
        .select(tDb.fn.countAll<number>().as("cnt"))
        .where("client_id", "=", clientId)
        .where("assigned_to", "=", userId)
        .executeTakeFirst();
      return (row?.cnt ?? 0) > 0;
    },
  },
  devDeps: env.NODE_ENV !== "production" ? { blobStore } : undefined,
});

export type AppRouter = typeof appRouter;

const cors = buildCorsHeaders(env.CORS_ORIGIN);
const trpcHandler = createHTTPHandler({
  router: appRouter,
  createContext,
  responseMeta() {
    return { headers: cors.base };
  },
});

// --- Job queue handlers ---

/** Lists schema names for all active orgs. Used by cross-tenant job handlers. */
async function listActiveOrgSchemas(): Promise<OrgSchema[]> {
  const orgs = await db
    .selectFrom("orgs")
    .select("schema_name")
    .where("is_active", "=", true)
    .execute();
  return orgs.map((o) => o.schema_name);
}

/** Lists id + schema + slug for all active orgs (single query). Cross-tenant
 *  job handlers need the id for platform tables and the schema for tenant
 *  queries, so both travel together. */
async function listActiveOrgSchemasWithSlugs(): Promise<
  readonly { id: OrgId; schema: OrgSchema; slug: OrgSlug }[]
> {
  const orgs = await db
    .selectFrom("orgs")
    .select(["id", "schema_name", "slug"])
    .where("is_active", "=", true)
    .execute();
  return orgs.map((o) => ({
    id: o.id,
    schema: o.schema_name,
    slug: o.slug,
  }));
}

registerLogDeletionHandler(jobQueue, providerFactory);
registerMediaCleanupHandler(
  jobQueue,
  tenantDb,
  blobStore,
  listActiveOrgSchemas,
);

const notificationJobHandler = createNotificationJobHandler({
  emailSender: notificationEmailSender,
  encryptor,
  getTenantDb: tenantDb,
});
jobQueue.process("notification-email", notificationJobHandler);

registerNotificationSmsHandler(jobQueue, {
  encryptor,
  getTenantDb: tenantDb,
  getProvider: async (orgId: OrgId) => providerFactory.getProvider(orgId),
  resolveCallerIdByPurpose: phoneResolver,
});

registerEscalationHandler(jobQueue, async () => {
  const schemas = await listActiveOrgSchemas();
  for (const schema of schemas) {
    await escalateTenantTickets(tenantDb(schema));
  }
});

// Escalation rules checker: evaluates time-based rules across all tenants
const escalationRulesDeps: EscalationServiceDeps = {
  notificationService,
  async getManagerIds(tDb) {
    const managerRows = await tDb
      .selectFrom("users")
      .select("id")
      .where("is_active", "=", true)
      .where("role_id", "in", [RoleId.MANAGER, RoleId.ADMIN])
      .execute();
    return managerRows.map((r) => r.id);
  },
  async getQueueWatcherIds(tDb, queueId) {
    const watcherRows = await tDb
      .selectFrom("queue_watchers")
      .select("user_id")
      .where("queue_id", "=", queueId)
      .execute();
    return watcherRows.map((r) => r.user_id);
  },
};

registerEscalationRulesHandler(
  jobQueue,
  async () => {
    const orgs = await listActiveOrgSchemasWithSlugs();
    for (const org of orgs) {
      try {
        await runEscalationCheck(
          tenantDb(org.schema),
          org.id,
          org.schema,
          org.slug,
          escalationRulesDeps,
        );
      } catch (err: unknown) {
        console.error(
          `Escalation rules check failed for schema ${org.schema}:`,
          err instanceof Error ? err.message : String(err),
        );
      }
    }
  },
  env.ESCALATION_RULES_INTERVAL_MS ?? DEFAULT_ESCALATION_RULES_INTERVAL_MS,
);
// Portal message expiry: deletes client copies for inactive channels (30 days)
registerPortalExpiryHandler(jobQueue, async () => {
  const schemas = await listActiveOrgSchemas();
  for (const schema of schemas) {
    try {
      const deleted = await expirePortalMessages(tenantDb(schema));
      if (deleted > 0) {
        console.log(
          `Portal expiry: ${String(deleted)} rows removed in ${schema}`,
        );
      }
    } catch (err: unknown) {
      console.error(
        `Portal expiry failed for schema ${schema}:`,
        err instanceof Error ? err.message : String(err),
      );
    }
  }
});

registerShareCleanupHandler(jobQueue, tenantDb, listActiveOrgSchemas);

await ensureRecurringJob(db, jobQueue, ESCALATION_RULES_QUEUE);
await ensureRecurringJob(db, jobQueue, ESCALATION_QUEUE);
await ensureRecurringJob(db, jobQueue, MEDIA_CLEANUP_QUEUE);
await ensureRecurringJob(db, jobQueue, PORTAL_EXPIRY_QUEUE);
await ensureRecurringJob(db, jobQueue, SHARE_CLEANUP_QUEUE);
jobQueue.start();
console.log("Job queue started");

// --- Call tracker ---

const callTracker = createDbCallTracker(tenantDb, listActiveOrgSchemas);

// --- Webhook dispatch callbacks ---

const webhookDispatch = createWebhookDispatch({
  orgService,
  tenantDb,
  providerFactory,
  indexer,
  blobStore,
  jobQueue,
  webhookBaseUrl: env.WEBHOOK_BASE_URL,
  callTracker,
  notificationService,
});

// --- Webhook handler ---

const webhookDedupStore = createDedupStore();
const webhookRateLimiter = createInMemoryRateLimiter({
  windowMs: 60_000,
  maxRequests: 200,
});
const webhookHandler = createWebhookHandler(
  {
    configService: telephonyConfigService,
    providerFactory,
    rateLimiter: webhookRateLimiter,
    dedupStore: webhookDedupStore,
  },
  webhookDispatch,
  env.WEBHOOK_BASE_URL,
);

// --- Relay infrastructure ---

const pendingCalls = new Map<string, PendingCall>();

/** Zeros sensitive buffers in a pending call entry. */
function zeroPendingCallBuffers(pending: PendingCall): void {
  pending.clientPhoneBuf.fill(0);
  pending.callerIdBuf.fill(0);
}

/** Evicts pending calls older than TTL, zeroing sensitive buffers. */
function evictExpiredPendingCalls(calls: Map<string, PendingCall>): void {
  const cutoff = Date.now() - 2 * 60 * 1000;
  for (const [sid, pending] of calls) {
    if (pending.createdAt < cutoff) {
      zeroPendingCallBuffers(pending);
      calls.delete(sid);
    }
  }
}

/** Zeros and clears all pending calls. Used during graceful shutdown. */
function zeroAllPendingCalls(calls: Map<string, PendingCall>): void {
  for (const [, pending] of calls) {
    zeroPendingCallBuffers(pending);
  }
  calls.clear();
}

/** Zeros OPS-encrypted phone Buffers and clears all pending client tokens. */
function zeroAllPendingClients(clients: Map<string, PendingClient>): void {
  for (const [, entry] of clients) {
    entry.opsEncryptedPhone.fill(0);
  }
  clients.clear();
}

const pendingCallCleanupInterval = setInterval(() => {
  evictExpiredPendingCalls(pendingCalls);
}, 60_000);

// Org resolver for relay endpoints: looks up the org by slug via orgService
// (same pattern as tRPC context). Returns both identifiers, because platform
// tables are keyed by the org UUID while tenant queries need the schema name.
async function relayOrgResolver(
  req: IncomingMessage,
): Promise<OrgResolved | null> {
  const slug = extractOrgSlug(req);
  if (slug === null) return null;
  const org = await orgService.findBySlug(slug);
  if (org?.isActive !== true) return null;
  return { orgId: org.id, orgSchema: org.schemaName };
}

// Session repo factory for relay auth. Loads the real org_public_key
// for the SealedBoxEncryptor (same pattern as resolveOrgForWebhook).
// The relay handler only calls findByToken (reads), but the session
// repo interface requires a SealedBoxEncryptor for consistency.
async function createRelaySessionRepo(
  orgSchema: OrgSchema,
): Promise<ReturnType<typeof createDbSessionRepository>> {
  const tDb = tenantDb(orgSchema);
  const row = await tDb
    .selectFrom("org_config")
    .select("org_public_key")
    .executeTakeFirst();

  // Org must have its public key set (post-onboarding).
  // Pre-onboarding orgs can't have active sessions anyway.
  const sealedBox = row?.org_public_key
    ? createSealedBoxEncryptor(row.org_public_key)
    : createSealedBoxEncryptor(Buffer.alloc(32));

  return createDbSessionRepository(tDb, tokenizer, sealedBox);
}

/** Looks up webhook config for an org. Shared by relay auth token + account SID resolution. */
async function requireWebhookConfig(
  orgId: OrgId,
): Promise<{ accountSid: string; authToken: string }> {
  const lookup = await telephonyConfigService.lookupWebhookConfig(orgId);
  if (!lookup) {
    throw new NotFoundError(`No telephony config for org ${orgId}`);
  }
  return lookup;
}

/** Builds a SealedBoxEncryptor from the org's public key, or null when the
 *  org has not completed onboarding (no key set yet). */
async function getOrgSealedBoxEncryptor(
  orgSchema: OrgSchema,
): Promise<SealedBoxEncryptor | null> {
  const row = await tenantDb(orgSchema)
    .selectFrom("org_config")
    .select("org_public_key")
    .executeTakeFirst();
  return row?.org_public_key
    ? createSealedBoxEncryptor(row.org_public_key)
    : null;
}

const relayHandler = createRelayHandler({
  getProvider: async (orgId: OrgId) => providerFactory.getProvider(orgId),
  getTenantDb: tenantDb,
  createConsultantRepo: (tDb: Kysely<TenantDatabase>) =>
    createConsultantRepository(tDb),
  resolveCallerIdByPurpose: phoneResolver,
  pendingCalls,
  webhookBaseUrl: env.WEBHOOK_BASE_URL,
  async getAuthToken(orgId: OrgId) {
    const lookup = await telephonyConfigService.lookupWebhookConfig(orgId);
    return lookup?.authToken ?? null;
  },
  async getAccountSid(orgId: OrgId) {
    return (await requireWebhookConfig(orgId)).accountSid;
  },
  apiKeySid: env.TWILIO_API_KEY_SID ?? "",
  apiKeySecret: env.TWILIO_API_KEY_SECRET ?? "",
  twimlAppSid: env.TWILIO_TWIML_APP_SID ?? "",
  orgResolver: relayOrgResolver,
  createSessionRepo: async (orgSchema) => createRelaySessionRepo(orgSchema),
  indexer,
  fieldEncryptor: encryptor,
  pendingClients,
  callTracker,
  consultantPhoneIndexer,
  getSealedBoxEncryptor: getOrgSealedBoxEncryptor,
  createConsultantService,
});

// --- HTTP server ---

// SSE handler (raw HTTP, not tRPC). Session auth follows the relay pattern.
function handleSse(req: IncomingMessage, res: ServerResponse): void {
  void (async () => {
    const result = await authenticateRelay(
      req,
      relayOrgResolver,
      createRelaySessionRepo,
    );

    if (!result.ok) {
      res.writeHead(result.status, { "Content-Type": "text/plain" });
      res.end("Unauthorized");
      return;
    }

    // Set CORS headers for SSE (same origin policy applies)
    res.setHeader("Access-Control-Allow-Origin", env.CORS_ORIGIN);
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Parse Last-Event-ID for reconnection replay
    const lastEventIdHeader = req.headers["last-event-id"];
    const lastEventId =
      typeof lastEventIdHeader === "string"
        ? Number(lastEventIdHeader)
        : undefined;

    const cleanup = sseService.connect(
      res,
      result.session.userId,
      result.session.orgSchema,
      Number.isFinite(lastEventId) ? lastEventId : undefined,
    );

    req.on("close", cleanup);
    res.on("close", cleanup);
  })();
}

const greetingAudioHandler = createGreetingAudioHandler({
  blobStore,
  corsHeaders: cors.base,
});

const brandingIconHandler = createBrandingIconHandler({
  blobStore,
  orgService,
  corsHeaders: cors.base,
});

const blobDownloadHandler = createBlobDownloadHandler({
  blobStore,
  orgResolver: relayOrgResolver,
  createSessionRepo: createRelaySessionRepo,
  corsHeaders: cors.base,
  createMediaSvc: (orgSchema) => {
    const tDb = tenantDb(orgSchema);
    return createMediaService(tDb, blobStore, createTicketAccessChecker(tDb));
  },
  createKBMediaSvc: (orgSchema) => createKBMediaService(tenantDb(orgSchema)),
  getUserRole: async (orgSchema, userId) => {
    const row = await tenantDb(orgSchema)
      .selectFrom("users")
      .select("role_id")
      .where("id", "=", userId)
      .where("is_active", "=", true)
      .executeTakeFirst();
    return row?.role_id ?? null;
  },
  createTenantDb: (orgSchema) => tenantDb(orgSchema),
});

const manifestHandler = createManifestHandler({ orgService });

const server = createHttpServer(trpcHandler, cors.preflight, [
  { prefix: "/webhooks/", handler: webhookHandler },
  { prefix: "/relay/", handler: relayHandler },
  { prefix: "/notifications/stream", handler: handleSse },
  { prefix: "/api/greetings/", handler: greetingAudioHandler },
  { prefix: "/api/blobs/", handler: blobDownloadHandler },
  { prefix: "/api/branding/", handler: brandingIconHandler },
  { prefix: "/manifest.webmanifest", handler: manifestHandler },
]);
const port = Number(process.env.PORT ?? 3000);
server.listen(port);
console.log(`Server ready on port ${String(port)}`);

// --- Graceful shutdown ---

async function shutdown(signal: string): Promise<void> {
  console.log(`${signal} received, shutting down`);
  server.close();
  sseService.closeAll();
  callTracker.stop();
  webhookDedupStore.stop();
  clearInterval(pendingCallCleanupInterval);
  zeroAllPendingCalls(pendingCalls);
  zeroAllPendingClients(pendingClients);
  await jobQueue.stop();
  await db.destroy();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
