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
