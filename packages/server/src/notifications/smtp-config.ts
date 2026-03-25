// Production SMTP credentials loading.
// In production: reads from /etc/care-y/secrets.env (same pattern as OPS_SECRETS_KEY).
// In dev/test: falls back to env vars (SMTP_HOST/SMTP_PORT already in env.ts; new
// SMTP_USER/SMTP_PASSWORD/SMTP_SECURE are optional).

import { readFileSync } from "node:fs";

export interface SmtpConfig {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
  readonly user: string | undefined;
  readonly password: string | undefined;
}

/**
 * Parses a KEY=VALUE env file (no quoting, no interpolation).
 * Returns a Map of key to value. Lines starting with # are comments.
 */
function parseEnvFile(content: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    result.set(trimmed.slice(0, eqIdx), trimmed.slice(eqIdx + 1));
  }
  return result;
}

const SECRETS_PATH = "/etc/care-y/secrets.env";

/**
 * Loads SMTP config. Production reads from secrets file. Dev/test uses env vars.
 * Returns undefined if no SMTP host is configured (console fallback).
 */
export function loadSmtpConfig(nodeEnv: string): SmtpConfig | undefined {
  let host: string | undefined;
  let port: number | undefined;
  let secure = false;
  let user: string | undefined;
  let password: string | undefined;

  if (nodeEnv === "production") {
    try {
      const content = readFileSync(SECRETS_PATH, "utf-8");
      const vars = parseEnvFile(content);
      host = vars.get("SMTP_HOST");
      const portStr = vars.get("SMTP_PORT");
      port = portStr !== undefined ? Number(portStr) : undefined;
      secure = vars.get("SMTP_SECURE") === "true";
      user = vars.get("SMTP_USER");
      password = vars.get("SMTP_PASSWORD");
    } catch {
      // Secrets file not found in production. Fall through to undefined return.
    }
  } else {
    host = process.env.SMTP_HOST;
    const portStr = process.env.SMTP_PORT;
    port = portStr !== undefined ? Number(portStr) : undefined;
    secure = process.env.SMTP_SECURE === "true";
    user = process.env.SMTP_USER;
    password = process.env.SMTP_PASSWORD;
  }

  if (host === undefined || host === "" || port === undefined) {
    return undefined;
  }

  return { host, port, secure, user, password };
}
