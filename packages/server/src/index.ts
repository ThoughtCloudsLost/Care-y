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
import { createDedupStore } from "./telephony/dedup-store.js";
import { registerLogDeletionHandler } from "./jobs/log-deletion.js";
import { createTelephonyConfigService } from "./telephony/config-service.js";
import { createBlobStore, type BlobStore } from "./storage/index.js";
import { createSealedBoxEncryptor } from "./crypto/sealed-box.js";
import type { SealedBoxEncryptor } from "./crypto/sealed-box.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "./db/types.js";
import { createPhoneRepository } from "./telephony/models/phone-repo.js";
import { createClientRepository } from "./telephony/models/client-repo.js";
import { createSmsResponseRepository } from "./telephony/models/sms-response-repo.js";
import { createGreetingRepository } from "./telephony/models/greeting-repo.js";
import { handleInboundSms } from "./telephony/inbound-sms.js";
import { handleInboundCall } from "./telephony/inbound-call.js";
import { handleRecordingComplete } from "./telephony/recording-handler.js";
import { processAttachments } from "./telephony/inbound-mms.js";
import type { WebhookDispatch } from "./routes/webhooks.js";

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

/** Creates an http.Server that routes /webhooks/* to the webhook handler
 *  and everything else to tRPC (after OPTIONS preflight). */
function createHttpServer(
  trpcHandler: RequestListener,
  preflightHeaders: Record<string, string>,
  onWebhook?: (req: IncomingMessage, res: ServerResponse) => Promise<void>,
): ReturnType<typeof createServer> {
  return createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, preflightHeaders);
      res.end();
      return;
    }

    if (onWebhook !== undefined && req.url?.startsWith("/webhooks/") === true) {
      void onWebhook(req, res);
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

const providerFactory = createProviderFactory({
  db,
  secretsEncryptor,
  providerConstructors: new Map([["twilio", createTwilioProvider]]),
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
  },
  twoFactorDeps: {
    emailSender,
    encryptor,
    indexer,
    tokenizer,
    providerFactory,
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

// --- Org context resolver for webhook dispatch ---

interface WebhookOrgContext {
  readonly orgId: string;
  readonly orgSchema: string;
  readonly tDb: Kysely<TenantDatabase>;
  readonly sealedBox: SealedBoxEncryptor;
}

async function resolveOrgForWebhook(
  orgId: string,
): Promise<WebhookOrgContext | null> {
  const org = await orgService.findById(orgId);
  if (org?.isActive !== true) return null;

  const tDb = tenantDb(org.schemaName);
  const row = await tDb
    .selectFrom("org_config")
    .select("org_public_key")
    .executeTakeFirst();

  if (!row?.org_public_key) return null;

  const sealedBox = createSealedBoxEncryptor(row.org_public_key);
  return { orgId: org.id, orgSchema: org.schemaName, tDb, sealedBox };
}

// --- Webhook dispatch callbacks ---

const webhookDispatch: WebhookDispatch = {
  async onInboundSms(
    orgId: string,
    body: Record<string, string>,
  ): Promise<string | null> {
    const org = await resolveOrgForWebhook(orgId);
    if (!org) return null;

    const provider = await providerFactory.getProvider(orgId);
    const phoneRepo = createPhoneRepository(org.tDb);
    const clientRepo = createClientRepository(org.tDb, phoneRepo);
    const smsResponseRepo = createSmsResponseRepository(org.tDb);

    const smsData = provider.parseIncomingSms(body);

    const result = await handleInboundSms(smsData, {
      provider,
      sealedBox: org.sealedBox,
      indexer,
      blobStore,
      jobQueue,
      clientRepo,
      smsResponseRepo,
      orgId,
      orgSchema: org.orgSchema,
      defaultLocale: "en-US",
    });

    // Process MMS attachments if present
    if (smsData.numMedia > 0) {
      await processAttachments(smsData.mediaUrls, smsData.mediaContentTypes, {
        sealedBox: org.sealedBox,
        blobStore,
        orgSchema: org.orgSchema,
      });
      // Blob keys available in result for ticket follow-up wiring
    }

    void result; // Consumed by ticket creation when wired
    return null; // No TwiML response (auto-reply sent via API)
  },

  async onInboundVoice(
    orgId: string,
    body: Record<string, string>,
  ): Promise<string | null> {
    const org = await resolveOrgForWebhook(orgId);
    if (!org) return null;

    const provider = await providerFactory.getProvider(orgId);

    // Check if this is a recording-complete callback
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const recordingSid = body["RecordingSid"];
    if (recordingSid !== undefined && recordingSid !== "") {
      await handleRecordingComplete(body, {
        provider,
        sealedBox: org.sealedBox,
        blobStore,
        jobQueue,
        orgSchema: org.orgSchema,
        orgId,
      });
      return null;
    }

    const phoneRepo = createPhoneRepository(org.tDb);
    const clientRepo = createClientRepository(org.tDb, phoneRepo);
    const greetingRepo = createGreetingRepository(org.tDb);

    const callData = provider.parseIncomingCall(body);

    const instructions = await handleInboundCall(callData, body, {
      sealedBox: org.sealedBox,
      indexer,
      phoneRepo,
      clientRepo,
      greetingRepo,
      orgId,
      webhookBaseUrl: env.WEBHOOK_BASE_URL,
      defaultLocale: "en-US",
    });

    return provider.generateVoiceResponse(instructions);
  },

  // onStatusCallback: not wired yet. Ticket system will use status
  // callbacks for state updates.
};

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

// --- HTTP server ---

const server = createHttpServer(trpcHandler, cors.preflight, webhookHandler);
const port = Number(process.env.PORT ?? 3000);
server.listen(port);
console.log(`Server ready on port ${String(port)}`);

// --- Graceful shutdown ---

async function shutdown(signal: string): Promise<void> {
  console.log(`${signal} received, shutting down`);
  server.close();
  webhookDedupStore.stop();
  await jobQueue.stop();
  await db.destroy();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
