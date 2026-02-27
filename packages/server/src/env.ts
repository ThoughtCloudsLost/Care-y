// Environment variable validation. Import this FIRST in index.ts.
// Validates required vars at startup and exits with a clear error if any are missing.
// This schema is the single source of truth for what env vars exist.
// Add new vars here as features are added.

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
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(z.treeifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
