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
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { db, tenantDb } from "./db/db.js";
import { sql } from "kysely";
import { getEnv, type EnvVars } from "./env.js";
import { createOrgService } from "./org/service.js";
import { createScryptHasher } from "./auth/password.js";
import { createInMemoryRateLimiter } from "./ratelimit/rate-limiter.js";
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
import { createRelayHandler, type PendingCall } from "./routes/relay.js";
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
  return { encryptor, indexer, fakeSaltKey, tokenizer };
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

/** Creates an http.Server that routes /webhooks/* to the webhook handler,
 *  /relay/* to the relay handler, and everything else to tRPC. */
function createHttpServer(
  trpcHandler: RequestListener,
  preflightHeaders: Record<string, string>,
  onWebhook?: (req: IncomingMessage, res: ServerResponse) => Promise<void>,
  onRelay?: (req: IncomingMessage, res: ServerResponse) => Promise<void>,
): ReturnType<typeof createServer> {
  return createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, preflightHeaders);
      res.end();
      return;
    }

    const url = req.url ?? "";

    if (onWebhook !== undefined && url.startsWith("/webhooks/")) {
      void onWebhook(req, res);
      return;
    }

    if (onRelay !== undefined && url.startsWith("/relay/")) {
      void onRelay(req, res);
      return;
    }

    trpcHandler(req, res);
  });
}

// --- Rate limiters ---

interface RateLimiters {
  readonly loginLimiter: ReturnType<typeof createInMemoryRateLimiter>;
  readonly saltLimiter: ReturnType<typeof createInMemoryRateLimiter>;
}

function createAuthRateLimiters(): RateLimiters {
  return {
    loginLimiter: createInMemoryRateLimiter({
      windowMs: 60_000,
      maxRequests: 5,
    }),
    saltLimiter: createInMemoryRateLimiter({
      windowMs: 60_000,
      maxRequests: 20,
    }),
  };
}

// --- OPRF infrastructure ---

import type { OprfEvaluateService } from "./crypto/oprf-evaluate-service.js";

function createOprfInfrastructure(env: EnvVars): OprfEvaluateService {
  const evaluator = createIpcEvaluator({
    socketPathA: env.OPRF_SOCKET_A,
    socketPathB: env.OPRF_SOCKET_B,
  });

  const userRateLimiter = createInMemoryRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
  });
  const ipRateLimiter = createInMemoryRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 50,
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
const { encryptor, indexer, fakeSaltKey, tokenizer } =
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
const emailSender = createEmailSender(
  env.SMTP_HOST,
  env.SMTP_PORT,
  env.SMTP_FROM,
);
const oprfService = createOprfInfrastructure(env);

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
  },
  twoFactorDeps: {
    emailSender,
    encryptor,
    indexer,
    tokenizer,
    providerFactory,
    resolveCallerId: phoneResolver,
  },
  oprfDeps: { oprfService },
  orgService,
  providerFactory,
  telephonyAdminDeps: {
    configService: telephonyConfigService,
    webhookBaseUrl: env.WEBHOOK_BASE_URL,
  },
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

// --- Job queue ---

const jobQueue = createJobQueue(db);
registerLogDeletionHandler(jobQueue, providerFactory);
jobQueue.start();
console.log("Job queue started");

// --- Webhook dispatch callbacks ---

const webhookDispatch = createWebhookDispatch({
  orgService,
  tenantDb,
  providerFactory,
  indexer,
  blobStore,
  jobQueue,
  webhookBaseUrl: env.WEBHOOK_BASE_URL,
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

// Pending call cleanup (2-minute TTL). Zeroes phone buffers on eviction.
const pendingCallCleanupInterval = setInterval(() => {
  const cutoff = Date.now() - 2 * 60 * 1000;
  for (const [sid, pending] of pendingCalls) {
    if (pending.createdAt < cutoff) {
      pending.clientPhoneBuf.fill(0);
      pending.callerIdBuf.fill(0);
      pendingCalls.delete(sid);
    }
  }
}, 60_000);

// Org resolver for relay endpoints: uses the shared extractOrgSlug utility
// (same logic as tRPC context), then derives the schema name from the slug.
// The schema name is org_<slug> by convention (see MT1 in 00-overview.md).
function relayOrgResolver(req: IncomingMessage): string | null {
  const slug = extractOrgSlug(req);
  if (slug === null) return null;
  return `org_${slug}`;
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
    const lookup = await telephonyConfigService.lookupWebhookConfig(orgId);
    if (!lookup) {
      throw new NotFoundError(`No telephony config for org ${orgId}`);
    }
    return lookup.accountSid;
  },
  apiKeySid: env.TWILIO_API_KEY_SID ?? "",
  apiKeySecret: env.TWILIO_API_KEY_SECRET ?? "",
  twimlAppSid: env.TWILIO_TWIML_APP_SID ?? "",
  orgResolver: relayOrgResolver,
  createSessionRepo: async (orgSchema: string) =>
    createRelaySessionRepo(orgSchema),
});

// --- HTTP server ---

const server = createHttpServer(
  trpcHandler,
  cors.preflight,
  webhookHandler,
  relayHandler,
);
const port = Number(process.env.PORT ?? 3000);
server.listen(port);
console.log(`Server ready on port ${String(port)}`);

// --- Graceful shutdown ---

async function shutdown(signal: string): Promise<void> {
  console.log(`${signal} received, shutting down`);
  server.close();
  webhookDedupStore.stop();
  clearInterval(pendingCallCleanupInterval);
  // Zero any remaining pending call buffers
  for (const [, pending] of pendingCalls) {
    pending.clientPhoneBuf.fill(0);
    pending.callerIdBuf.fill(0);
  }
  pendingCalls.clear();
  await jobQueue.stop();
  await db.destroy();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
