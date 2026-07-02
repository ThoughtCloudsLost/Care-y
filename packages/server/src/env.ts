// Environment variable validation.
// Exports lazy accessors so importing this module does NOT trigger validation.
// Call validateEnv() explicitly in index.ts for fail-fast startup behavior.
// All env vars are declared here. Add new vars as features are built.

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // The session signing key must be set even in dev to avoid accidental plaintext sessions.
  // Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  SESSION_SECRET: z
    .string()
    .min(64, "SESSION_SECRET must be at least 64 hex chars (32 bytes)"),

  // Database connection
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Field-level PII encryption
  // HKDF-derived subkeys for blind indexing and field encryption.
  // Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  OPS_SECRETS_KEY: z
    .string()
    .min(64, "OPS_SECRETS_KEY must be at least 64 hex chars (32 bytes)")
    .regex(/^[0-9a-f]+$/i, "OPS_SECRETS_KEY must be hex-encoded"),

  // tRPC CORS origin. In dev, the Vite proxy makes this mostly irrelevant
  // (requests are same-origin from the browser's perspective), but it
  // applies for production (Caddy reverse proxy) and direct API testing.
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  // Set true only when running more than one app-server instance behind a load
  // balancer. The in-memory rate limiter holds state per process, so multiple
  // instances would multiply every limit by the instance count. Boot refuses
  // this until a shared-store RateLimiter is configured.
  APP_MULTI_INSTANCE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),

  // OPRF IPC sockets
  OPRF_SOCKET_A: z.string().default("/run/oprf/oprf-a.sock"),
  OPRF_SOCKET_B: z.string().default("/run/oprf/oprf-b.sock"),

  // SMTP (optional, defaults to Mailpit in dev)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_FROM: z.string().default("noreply@care-y.app"),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  // Blob storage (encrypted file store for attachments, recordings, etc.)
  BLOB_STORE_TYPE: z.enum(["local"]).default("local"),
  BLOB_STORE_PATH: z.string().default("./data"),

  // Public URL that Twilio uses to reach this server's webhook endpoints.
  // Production: the Caddy reverse proxy URL (e.g., "https://api.care-y.app").
  // Dev: ngrok or localhost URL for webhook testing.
  WEBHOOK_BASE_URL: z.string().default("http://localhost:3000"),

  // Managed-mode Twilio master credentials (optional).
  // Only needed when the platform operator manages Twilio accounts for orgs.
  TWILIO_MASTER_SID: z.string().optional(),
  TWILIO_MASTER_AUTH_TOKEN: z.string().optional(),

  // Twilio API Key for WebRTC Access Tokens.
  // These are NOT per-org. They're platform-level API keys that sign JWTs.
  // Create via Twilio Console > API Keys.
  TWILIO_API_KEY_SID: z.string().optional(),
  TWILIO_API_KEY_SECRET: z.string().optional(),
  TWILIO_TWIML_APP_SID: z.string().optional(),
});

export type EnvVars = z.infer<typeof envSchema>;

export class EnvValidationError extends Error {
  constructor(issues: readonly { path: PropertyKey[]; message: string }[]) {
    const lines = issues.map(
      (i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`,
    );
    super(`Invalid environment variables:\n${lines.join("\n")}`);
    this.name = "EnvValidationError";
  }
}

/** Parses and validates process.env against the schema. Throws EnvValidationError on failure. */
export function validateEnv(): EnvVars {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new EnvValidationError(parsed.error.issues);
  }
  return parsed.data;
}

let cached: EnvVars | null = null;

/** Returns validated env vars, calling validateEnv() on first access and caching the result. */
export function getEnv(): EnvVars {
  cached ??= validateEnv();
  return cached;
}

/** Resets the cached env. Test-only: allows re-validation after changing process.env. */
export function _resetEnvCache(): void {
  cached = null;
}
