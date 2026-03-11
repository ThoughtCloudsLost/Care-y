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

import { createServer } from "node:http";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { db } from "./db/db.js";
import { tenantDb } from "./db/db.js";
import { sql } from "kysely";
import { getEnv } from "./env.js";
import { createOrgService } from "./org/service.js";
import { createScryptHasher } from "./auth/password.js";
import { createInMemoryRateLimiter } from "./ratelimit/rate-limiter.js";
import {
  deriveKeys,
  createFieldEncryptor,
  createBlindIndexer,
} from "./crypto/field-encryptor.js";
import { createContextFactory } from "./trpc/context.js";
import { createAppRouter } from "./routes/router.js";

// --- DB startup probe ---
// Kysely pools are lazy. Probe immediately so the container log is meaningful.
try {
  await db.executeQuery(sql`SELECT 1`.compile(db));
  console.log("Database connected");
} catch (err) {
  // Log only the message. The full error object may contain DATABASE_URL (credentials).
  console.error("Database connection failed:", extractErrorMessage(err));
  process.exit(1);
}

// --- Dependency wiring ---
const env = getEnv();

// Derive field-level encryption keys from OPS_SECRETS_KEY (HKDF, once at startup).
const opsKey = Buffer.from(env.OPS_SECRETS_KEY, "hex");
const derivedKeys = deriveKeys(opsKey);
const encryptor = createFieldEncryptor(derivedKeys.fieldEncryptKey);
const indexer = createBlindIndexer(derivedKeys.blindIndexKey);

// Singletons: shared across all requests.
const orgService = createOrgService(db, tenantDb);
const hasher = createScryptHasher();
const loginLimiter = createInMemoryRateLimiter({
  windowMs: 60_000,
  maxRequests: 5,
});

// --- tRPC router + context ---
const createContext = createContextFactory({
  orgService,
  hasher,
  encryptor,
  indexer,
});

const appRouter = createAppRouter({
  authDeps: {
    hasher,
    loginLimiter,
    encryptor,
    indexer,
    isSecureCookie: env.NODE_ENV === "production",
  },
  orgService,
});

export type AppRouter = typeof appRouter;

// --- HTTP server ---
// createHTTPHandler returns a RequestListener. We create the http.Server
// manually so we can intercept OPTIONS preflight before tRPC processes it.
// Shared CORS headers. The preflight handler adds Max-Age; responseMeta
// attaches the base set to every tRPC response.
const corsBase = {
  "Access-Control-Allow-Origin": env.CORS_ORIGIN,
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
} as const;

const preflightHeaders = {
  ...corsBase,
  "Access-Control-Max-Age": "86400",
} as const;

const trpcHandler = createHTTPHandler({
  router: appRouter,
  createContext,
  responseMeta() {
    return { headers: corsBase };
  },
});

const server = createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, preflightHeaders);
    res.end();
    return;
  }
  trpcHandler(req, res);
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port);
console.log(`Server ready on port ${String(port)}`);
