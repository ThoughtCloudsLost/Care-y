/**
 * Migration 014: Add HMAC token columns to sessions for drift detection.
 *
 * Code migration: adds ip_token and ua_token columns, then backfills
 * from existing encrypted IP/UA values. Requires OPS_SECRETS_KEY in env.
 *
 * After backfill, columns are set NOT NULL via sql tagged template
 * (Kysely's schema builder has no alterColumn().setNotNull() API).
 *
 * Uses Kysely<unknown> (not Kysely<any>) to preserve .withSchema() scoping
 * from the migration runner. Data queries use a local MigrationDatabase
 * interface with a single eslint-disable for the narrowing assertion.
 * See SEC-203, SEC-204 (Kysely migration API), SEC-205 (eslint guidance).
 */

import type { Kysely } from "kysely";
import { hkdfSync, createHmac } from "node:crypto";

// Inline error class (migrations can't import from ../errors.ts reliably)
class MigrationError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "MigrationError";
  }
}

// Inline key derivation to avoid import path issues in migration context.
// These constants must match field-encryptor.ts and session-tokenizer.ts.
const FIELD_ENCRYPT_INFO = "care-y-field-encrypt-v1";
const SESSION_TOKEN_INFO = "care-y-session-token-v1";

function deriveKey(opsKey: Buffer, info: string): Buffer {
  return Buffer.from(hkdfSync("sha256", opsKey, Buffer.alloc(0), info, 32));
}

async function decryptField(sealed: Buffer, key: Buffer): Promise<string> {
  // Lazy-import sodium-native to avoid loading it when migration is skipped
  const sodium = (await import("sodium-native")).default;

  const nonce = sealed.subarray(0, sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = sealed.subarray(sodium.crypto_secretbox_NONCEBYTES);
  const plaintext = Buffer.alloc(
    ciphertext.length - sodium.crypto_secretbox_MACBYTES,
  );

  const ok = sodium.crypto_secretbox_open_easy(
    plaintext,
    ciphertext,
    nonce,
    key,
  );
  if (!ok) {
    throw new MigrationError(
      "Decryption failed during session token migration backfill",
    );
  }

  const result = plaintext.toString("utf-8");
  plaintext.fill(0);
  return result;
}

// care-y-ignore-next-line no-plaintext-db-write -- produces a one-way HMAC-SHA256 hash, not plaintext. The hex digest is what gets written to the DB.
function hmacToken(value: string, hmacKey: Buffer): string {
  return createHmac("sha256", hmacKey).update(value).digest("hex");
}

// Local DB interface for typed data queries in this migration.
// Only the columns needed for the backfill are declared.
// This is a migration-local type, not the application's TenantDatabase.
interface MigrationSessionsTable {
  id: string;
  encrypted_ip_address: Buffer;
  encrypted_user_agent: Buffer;
  ip_token: string | null;
  ua_token: string | null;
}

interface MigrationDatabase {
  sessions: MigrationSessionsTable;
}

export async function up(db: Kysely<unknown>): Promise<void> {
  // Add columns as NOT NULL with a placeholder default. The backfill below
  // overwrites every row with the real HMAC token. The default handles the
  // NOT NULL constraint for any rows inserted between ADD COLUMN and backfill
  // (not possible in a migration transaction, but defensive).
  // Using NOT NULL + DEFAULT avoids a raw sql`ALTER COLUMN SET NOT NULL`
  // which would bypass .withSchema() scoping (Kysely #761).
  await db.schema
    .alterTable("sessions")
    .addColumn("ip_token", "text", (col) => col.notNull().defaultTo(""))
    .execute();
  await db.schema
    .alterTable("sessions")
    .addColumn("ua_token", "text", (col) => col.notNull().defaultTo(""))
    .execute();

  // Backfill from existing encrypted values
  const opsKeyHex = process.env.OPS_SECRETS_KEY;
  if (opsKeyHex === undefined || opsKeyHex === "") {
    throw new MigrationError(
      "OPS_SECRETS_KEY required for session token migration",
    );
  }
  const opsKey = Buffer.from(opsKeyHex, "hex");
  const fieldKey = deriveKey(opsKey, FIELD_ENCRYPT_INFO);
  const hmacKey = deriveKey(opsKey, SESSION_TOKEN_INFO);

  // Kysely's Migration interface uses Kysely<any> (SEC-203, SEC-204), but
  // CARE-Y migrations use Kysely<unknown> to preserve .withSchema() scoping
  // from the test migration runner. Narrowing to a local interface is the
  // recommended approach for framework-constrained type assertions (SEC-205).
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const typedDb = db as unknown as Kysely<MigrationDatabase>;

  try {
    const rows = await typedDb
      .selectFrom("sessions")
      .select(["id", "encrypted_ip_address", "encrypted_user_agent"])
      .execute();

    for (const row of rows) {
      const ip = await decryptField(row.encrypted_ip_address, fieldKey);
      const ua = await decryptField(row.encrypted_user_agent, fieldKey);

      await typedDb
        .updateTable("sessions")
        .set({
          ip_token: hmacToken(ip, hmacKey),
          ua_token: hmacToken(ua, hmacKey),
        })
        .where("id", "=", row.id)
        .execute();
    }
  } finally {
    fieldKey.fill(0);
    hmacKey.fill(0);
  }
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable("sessions").dropColumn("ip_token").execute();
  await db.schema.alterTable("sessions").dropColumn("ua_token").execute();
}
