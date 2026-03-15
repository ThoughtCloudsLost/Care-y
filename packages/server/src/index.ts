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
import { createContextFactory } from "./trpc/context.js";
import { createAppRouter } from "./routes/router.js";
import { createEmailSender } from "./email/email-sender.js";
import { createIpcEvaluator } from "./crypto/oprf-ipc.js";
import { createPowVerifier } from "./crypto/pow.js";
import { createOprfAuditLogger } from "./crypto/oprf-audit.js";
import { createOprfEvaluateService } from "./crypto/oprf-evaluate-service.js";

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
}

/** Derives all field-encryption, blind-index, and fake-salt keys from OPS_SECRETS_KEY.
 *  Called once at startup. The hex key is consumed here and never stored. */
async function deriveCryptoServices(
  opsSecretsKeyHex: string,
): Promise<CryptoServices> {
  const opsKey = Buffer.from(opsSecretsKeyHex, "hex");
  const derived = deriveKeys(opsKey);
  const encryptor = createFieldEncryptor(derived.fieldEncryptKey);
  const indexer = createBlindIndexer(derived.blindIndexKey);
  const fakeSaltKey = await deriveFakeSaltKey(opsSecretsKeyHex);
  return { encryptor, indexer, fakeSaltKey };
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

/** Creates an http.Server that handles OPTIONS preflight before delegating to tRPC. */
function createHttpServer(
  trpcHandler: RequestListener,
  preflightHeaders: Record<string, string>,
): ReturnType<typeof createServer> {
  return createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, preflightHeaders);
      res.end();
      return;
    }
    trpcHandler(req, res);
  });
}

// --- Bootstrap ---

await probeDatabase();

const env: EnvVars = getEnv();
const { encryptor, indexer, fakeSaltKey } = await deriveCryptoServices(
  env.OPS_SECRETS_KEY,
);

const orgService = createOrgService(db, tenantDb);
const hasher = createScryptHasher();
const loginLimiter = createInMemoryRateLimiter({
  windowMs: 60_000,
  maxRequests: 5,
});
const saltLimiter = createInMemoryRateLimiter({
  windowMs: 60_000,
  maxRequests: 20,
});

const createContext = createContextFactory({
  orgService,
  hasher,
  encryptor,
  indexer,
});

const emailSender = createEmailSender(
  env.SMTP_HOST,
  env.SMTP_PORT,
  env.SMTP_FROM,
);

// --- OPRF infrastructure ---

const oprfEvaluator = createIpcEvaluator({
  socketPathA: env.OPRF_SOCKET_A,
  socketPathB: env.OPRF_SOCKET_B,
});

const oprfUserLimiter = createInMemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
});

const oprfIpLimiter = createInMemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 50,
});

const powVerifier = createPowVerifier();

const opsKeyBuf = Buffer.from(env.OPS_SECRETS_KEY, "hex");
const oprfAuditLogger = createOprfAuditLogger(db, opsKeyBuf);

const oprfService = createOprfEvaluateService({
  evaluator: oprfEvaluator,
  userRateLimiter: oprfUserLimiter,
  ipRateLimiter: oprfIpLimiter,
  powVerifier,
  auditLogger: oprfAuditLogger,
});

const appRouter = createAppRouter({
  authDeps: {
    hasher,
    loginLimiter,
    saltLimiter,
    fakeSaltKey,
    encryptor,
    indexer,
    isSecureCookie: env.NODE_ENV === "production",
    emailSender,
  },
  twoFactorDeps: {
    emailSender,
    encryptor,
  },
  oprfDeps: { oprfService },
  orgService,
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

const server = createHttpServer(trpcHandler, cors.preflight);
const port = Number(process.env.PORT ?? 3000);
server.listen(port);
console.log(`Server ready on port ${String(port)}`);
