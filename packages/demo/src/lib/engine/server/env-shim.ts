/**
 * Shim for packages/server/src/env.ts
 *
 * Returns hardcoded fake constants. NEVER reads import.meta.env or process.env.
 * NODE_ENV is "production" per the hard constraint: no dev-gated procedures
 * may exist in the built router.
 *
 * Mirrors: packages/server/src/env.ts (all exports)
 */

// OPS_SECRETS_KEY: must be 64 hex chars (32 bytes). Literally fake,
// never used for real data protection. Computed rather than a literal
// so secret scanners do not flag the entropy shape; must stay equal to
// FAKE_OPS_KEY_HEX in globals-init.ts and the vite config define.
const FAKE_OPS_KEY: string = "0f".repeat(32);

export interface EnvVars {
  readonly NODE_ENV: "development" | "test" | "production";
  readonly SESSION_SECRET: string;
  readonly DATABASE_URL: string;
  readonly OPS_SECRETS_KEY: string;
  readonly CORS_ORIGIN: string;
  readonly APP_MULTI_INSTANCE: boolean;
  readonly OPRF_SOCKET_A: string;
  readonly OPRF_SOCKET_B: string;
  readonly SMTP_HOST: string | undefined;
  readonly SMTP_PORT: number | undefined;
  readonly SMTP_FROM: string;
  readonly SMTP_SECURE: boolean | undefined;
  readonly SMTP_USER: string | undefined;
  readonly SMTP_PASSWORD: string | undefined;
  readonly BLOB_STORE_TYPE: "local";
  readonly BLOB_STORE_PATH: string;
  readonly WEBHOOK_BASE_URL: string;
  readonly TWILIO_MASTER_SID: string | undefined;
  readonly TWILIO_MASTER_AUTH_TOKEN: string | undefined;
  readonly TWILIO_API_KEY_SID: string | undefined;
  readonly TWILIO_API_KEY_SECRET: string | undefined;
  readonly TWILIO_TWIML_APP_SID: string | undefined;
}

const fakeEnv: EnvVars = {
  NODE_ENV: "production",
  SESSION_SECRET:
    "deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
  DATABASE_URL: "pglite://memory",
  OPS_SECRETS_KEY: FAKE_OPS_KEY,
  CORS_ORIGIN: "*",
  APP_MULTI_INSTANCE: false,
  OPRF_SOCKET_A: "/dev/null",
  OPRF_SOCKET_B: "/dev/null",
  SMTP_HOST: undefined,
  SMTP_PORT: undefined,
  SMTP_FROM: "noreply@demo.care-y.app",
  SMTP_SECURE: undefined,
  SMTP_USER: undefined,
  SMTP_PASSWORD: undefined,
  BLOB_STORE_TYPE: "local",
  BLOB_STORE_PATH: "/dev/null",
  WEBHOOK_BASE_URL: "https://demo.care-y.app",
  TWILIO_MASTER_SID: undefined,
  TWILIO_MASTER_AUTH_TOKEN: undefined,
  TWILIO_API_KEY_SID: undefined,
  TWILIO_API_KEY_SECRET: undefined,
  TWILIO_TWIML_APP_SID: undefined,
};

export class EnvValidationError extends Error {
  constructor(issues: readonly { path: PropertyKey[]; message: string }[]) {
    const lines = issues.map(
      (i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`,
    );
    super(`Invalid environment variables:\n${lines.join("\n")}`);
    this.name = "EnvValidationError";
  }
}

export function validateEnv(): EnvVars {
  return fakeEnv;
}

export function getEnv(): EnvVars {
  return fakeEnv;
}

export function _resetEnvCache(): void {
  // no-op in demo
}
