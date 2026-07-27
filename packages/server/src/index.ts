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
import {
  createTwilioProvider,
  twilioProviderStatic,
} from "./telephony/twilio.js";
import { createWebhookHandler } from "./routes/webhooks.js";
import { createTelephonyContentService } from "./telephony/telephony-content-service.js";
import { createGreetingAudioHandler } from "./routes/greeting-audio.js";
import { createBrandingIconHandler } from "./routes/branding-icons.js";
import { createManifestHandler } from "./routes/manifest.js";
import { createRelayHandler, type PendingCall } from "./routes/relay.js";
import { authenticateRelay } from "./routes/relay-utils.js";
import { createDbCallTracker } from "./telephony/call-tracker.js";
import { extractOrgSlug } from "./org/slug-resolver.js";
import { NotFoundError } from "./errors.js";
import { createPhoneResolver } from "./telephony/phone-resolver.js";
import { createConsultantRepository } from "./telephony/models/consultant-repo.js";
import { createDbSessionRepository } from "./auth/session-repository.js";
import { createDedupStore } from "./telephony/dedup-store.js";
import { registerLogDeletionHandler } from "./jobs/log-deletion.js";
import { createTelephonyConfigService } from "./telephony/config-service.js";
import { createBlobStore, type BlobStore } from "./storage/index.js";
import { createSealedBoxEncryptor } from "./crypto/sealed-box.js";
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
} from "./tickets/media-service.js";
import { createQueueService } from "./tickets/queue-service.js";
import { createAssignmentService } from "./tickets/assignment.js";
import { createWatchersService } from "./tickets/watchers.js";
import { createNoteTypeService } from "./tickets/note-type-service.js";
import { createQueuePermissionsService } from "./tickets/queue-permissions.js";
import {
  registerEscalationHandler,
  escalateTenantTickets,
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
import { createSearchService } from "./tickets/search.js";
import { createAuditService } from "./tickets/audit.js";
import {
  createKBCategoryService,
  createKBItemService,
  createKBVoteService,
} from "./kb/service.js";
import { createKBMediaService } from "./kb/kb-media-service.js";
import { createClientService } from "./clients/client-service.js";

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
  const fakeSaltKey = await deriveFakeSaltKey(opsSecretsKeyHex);
  const tokenizer = createSessionTokenizer(deriveSessionHmacKey(opsKey));
  const pushChallengeHmacKey = derivePushChallengeHmacKey(opsKey);
  return { encryptor, indexer, fakeSaltKey, tokenizer, pushChallengeHmacKey };
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

const { encryptor, indexer, fakeSaltKey, tokenizer, pushChallengeHmacKey } =
  await deriveCryptoServices(env.OPS_SECRETS_KEY);

// --- Telephony provider factory ---

const secretsKey = deriveSecretsKey(Buffer.from(env.OPS_SECRETS_KEY, "hex"));
const secretsEncryptor = createSecretsEncryptor(secretsKey);

const providerConstructors = new Map([["twilio", createTwilioProvider]]);

// Register mock provider (dev/test only)
if (env.NODE_ENV !== "production") {
  const { createMockProvider } = await import("./telephony/mock-provider.js");
  providerConstructors.set("mock", () => createMockProvider());
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

const notificationService = createNotificationService({
  sse: sseService,
  emailSender: notificationEmailSender,
  pushSender,
  jobQueue,
});

const createContext = createContextFactory({
  orgService,
  hasher,
  encryptor,
  indexer,
  tokenizer,
});

const providerStatics = new Map([["twilio", twilioProviderStatic]]);
const telephonyConfigService = createTelephonyConfigService({
  db,
  secretsEncryptor,
  providerFactory,
  providerStatics,
});

// --- Phone purpose resolver ---

const phoneResolver = createPhoneResolver({
  async getOrgConfig(orgSchema: string) {
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
  async getProvisionedPhones(orgSchema: string) {
    return telephonyConfigService.lookupProvisionedPhones(orgSchema);
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
    secretsEncryptor,
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
async function listActiveOrgSchemas(): Promise<string[]> {
  const orgs = await db
    .selectFrom("orgs")
    .select("schema_name")
    .where("is_active", "=", true)
    .execute();
  return orgs.map((o) => o.schema_name);
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

registerEscalationHandler(jobQueue, async () => {
  const schemas = await listActiveOrgSchemas();
  for (const schema of schemas) {
    await escalateTenantTickets(tenantDb(schema));
  }
});
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
// (same pattern as tRPC context) to get the correct UUID-based schema name.
async function relayOrgResolver(req: IncomingMessage): Promise<string | null> {
  const slug = extractOrgSlug(req);
  if (slug === null) return null;
  const org = await orgService.findBySlug(slug);
  if (org?.isActive !== true) return null;
  return org.schemaName;
}

// Session repo factory for relay auth. Loads the real org_public_key
// for the SealedBoxEncryptor (same pattern as resolveOrgForWebhook).
// The relay handler only calls findByToken (reads), but the session
// repo interface requires a SealedBoxEncryptor for consistency.
async function createRelaySessionRepo(
  orgSchema: string,
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
  orgId: string,
): Promise<{ accountSid: string; authToken: string }> {
  const lookup = await telephonyConfigService.lookupWebhookConfig(orgId);
  if (!lookup) {
    throw new NotFoundError(`No telephony config for org ${orgId}`);
  }
  return lookup;
}

const relayHandler = createRelayHandler({
  getProvider: async (orgId: string) => providerFactory.getProvider(orgId),
  getTenantDb: tenantDb,
  createConsultantRepo: (tDb: Kysely<TenantDatabase>) =>
    createConsultantRepository(tDb),
  resolveCallerIdByPurpose: phoneResolver,
  pendingCalls,
  webhookBaseUrl: env.WEBHOOK_BASE_URL,
  async getAuthToken(orgId: string) {
    const lookup = await telephonyConfigService.lookupWebhookConfig(orgId);
    return lookup?.authToken ?? null;
  },
  async getAccountSid(orgId: string) {
    return (await requireWebhookConfig(orgId)).accountSid;
  },
  apiKeySid: env.TWILIO_API_KEY_SID ?? "",
  apiKeySecret: env.TWILIO_API_KEY_SECRET ?? "",
  twimlAppSid: env.TWILIO_TWIML_APP_SID ?? "",
  orgResolver: relayOrgResolver,
  createSessionRepo: async (orgSchema: string) =>
    createRelaySessionRepo(orgSchema),
  indexer,
  fieldEncryptor: encryptor,
  pendingClients,
  callTracker,
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

const manifestHandler = createManifestHandler({ orgService });

const server = createHttpServer(trpcHandler, cors.preflight, [
  { prefix: "/webhooks/", handler: webhookHandler },
  { prefix: "/relay/", handler: relayHandler },
  { prefix: "/notifications/stream", handler: handleSse },
  { prefix: "/api/greetings/", handler: greetingAudioHandler },
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
