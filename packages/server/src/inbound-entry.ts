/**
 * Process entrypoint for the inbound SMTP receiver.
 *
 * Runs beside the API process, never inside it: a crash or memory
 * exhaustion in the internet-facing protocol parser must not take down
 * the API (inbound email design, section 4; GHSA-fv2f-rw9f-v9cm shows
 * the failure class, SEC-234). The systemd unit template lives in
 * docs/design-ref/security-hardening.md.
 *
 * Boot is minimal: env validation, the shared db pool, the reply-token
 * hasher, the receiver, and graceful shutdown. No HTTP, no tRPC.
 */

import { getSodium } from "@care-y/crypto";
import { validateEnv } from "./env.js";
import { db, tenantDb } from "./db/db.js";
import {
  createReplyTokenHasher,
  deriveReplyTokenIndexKey,
} from "./crypto/field-encryptor.js";
import { createInboundReceiver } from "./email/inbound-receiver.js";

async function main(): Promise<void> {
  const env = validateEnv();

  if (!env.INBOUND_SMTP_ENABLED) {
    console.log("Inbound SMTP receiver disabled (INBOUND_SMTP_ENABLED)");
    return;
  }

  // Ingest seals portal copies and tk_temp wraps with libsodium; the
  // API entrypoint initializes it at boot and this process must too.
  await getSodium();

  const opsKey = Buffer.from(env.OPS_SECRETS_KEY, "hex");
  let hasher;
  try {
    hasher = createReplyTokenHasher(deriveReplyTokenIndexKey(opsKey));
  } finally {
    opsKey.fill(0);
  }

  const receiver = createInboundReceiver(
    {
      platformDb: db,
      getTenantDb: tenantDb,
      replyTokenHasher: hasher,
    },
    {
      port: env.INBOUND_SMTP_PORT,
      tlsKeyPath: env.INBOUND_SMTP_TLS_KEY_PATH,
      tlsCertPath: env.INBOUND_SMTP_TLS_CERT_PATH,
    },
  );

  await receiver.listen();
  console.log(
    `Inbound SMTP receiver listening on port ${String(env.INBOUND_SMTP_PORT)}`,
  );

  let shuttingDown = false;
  const shutdown = (signal: string): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`Received ${signal}, shutting down inbound SMTP receiver`);
    void (async (): Promise<void> => {
      try {
        await receiver.close();
        await db.destroy();
        process.exit(0);
      } catch {
        process.exit(1);
      }
    })();
  };

  process.on("SIGTERM", () => {
    shutdown("SIGTERM");
  });
  process.on("SIGINT", () => {
    shutdown("SIGINT");
  });
}

main().catch((err: unknown) => {
  // Startup failure only; no message content exists at this point.
  console.error(
    "Inbound SMTP receiver failed to start:",
    err instanceof Error ? err.message : String(err),
  );
  process.exit(1);
});
