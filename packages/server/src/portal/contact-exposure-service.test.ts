/**
 * DB integration tests for the contact-exposure service.
 *
 * Verifies the ECIES-sealed envelope round-trip: the service returns
 * sealed contact info that opens with the correct channel private key
 * and fails with a different key. Bare-link channels get the typed
 * error before any decryption happens.
 *
 * Uses real libsodium keypairs for the ristretto255 ECIES path.
 * Runs inside Docker via `pnpm test:server:db`.
 */

import crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Kysely } from "kysely";
import {
  getSodium,
  eciesDecrypt,
  toRistrettoPoint,
  toScalar,
  toNonce,
  type RistrettoPoint,
  type Scalar,
} from "@care-y/crypto";
import type { SodiumBackend } from "@care-y/crypto";
import type { TenantDatabase } from "../db/types.js";
import type {
  ClientId,
  PhoneHash,
  EmailHash,
  PhoneId,
  EmailId,
} from "@care-y/shared";
import { channelSecretSchema } from "@care-y/shared";
import {
  createTestDb,
  testFieldEncryptor,
  testSealedBox,
  type TestDb,
} from "../test-utils.js";
import { getSealedContactInfo } from "./contact-exposure-service.js";
import { PortalContactLockedError } from "./portal-errors.js";
import type { PortalChannelRow } from "./channel-service.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a ristretto255 keypair for the test channel. */
function makeRistrettoKeypair(sodium: SodiumBackend): {
  clientPrivate: Scalar;
  clientPublic: RistrettoPoint;
} {
  const clientPrivate = sodium.crypto_core_ristretto255_scalar_random();
  const clientPublic =
    sodium.crypto_scalarmult_ristretto255_base(clientPrivate);
  return {
    clientPrivate: toScalar(clientPrivate),
    clientPublic: toRistrettoPoint(clientPublic),
  };
}

/** Build a PortalChannelRow-shaped object for the service. */
function makeChannelRow(
  clientId: ClientId,
  clientPublic: Uint8Array,
  opts?: { kind?: string; hasPassphrase?: boolean },
): PortalChannelRow {
  return {
    // Row fields the service reads
    id: crypto.randomUUID() as PortalChannelRow["id"],
    client_id: clientId,
    channel_id: channelSecretSchema.parse(
      crypto.randomBytes(24).toString("hex"),
    ),
    auth_hash: crypto.randomBytes(32),
    client_public: Buffer.from(clientPublic),
    has_passphrase: opts?.hasPassphrase ?? true,
    key_check_ephemeral_point: crypto.randomBytes(32),
    key_check_nonce: crypto.randomBytes(24),
    key_check_ciphertext: crypto.randomBytes(48),
    status: "active",
    kind: opts?.kind ?? "secure_link",
    created_at: new Date(),
    last_seen_at: null,
    last_notified_at: null,
    revoked_at: null,
  };
}

/** Insert a client with optional phone and email. */
async function insertClientWithContacts(
  db: Kysely<TenantDatabase>,
  opts: { phone?: string; email?: string },
): Promise<ClientId> {
  let phoneId: PhoneId | null = null;
  let emailId: EmailId | null = null;

  if (opts.phone !== undefined) {
    const encryptedNumber = testFieldEncryptor.encrypt(opts.phone);
    const phoneHash = `ph-${crypto.randomUUID().slice(0, 8)}` as PhoneHash;

    // care-y-ignore-next-line no-plaintext-db-write -- phone_hash is a blind index, encrypted_number is pre-encrypted above
    const phoneRow = await db
      .insertInto("phones")
      .values({
        phone_hash: phoneHash,
        encrypted_number: encryptedNumber,
        locale: "en-US",
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    phoneId = phoneRow.id;
  }

  if (opts.email !== undefined) {
    const encryptedAddress = testFieldEncryptor.encrypt(opts.email);
    const emailHash = `em-${crypto.randomUUID().slice(0, 8)}` as EmailHash;

    // care-y-ignore-next-line no-plaintext-db-write -- email_hash is a blind index, encrypted_address is pre-encrypted above
    const emailRow = await db
      .insertInto("emails")
      .values({
        email_hash: emailHash,
        encrypted_address: encryptedAddress,
        locale: "en-US",
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    emailId = emailRow.id;
  }

  // care-y-ignore-next-line no-plaintext-db-write -- encrypted_alias is test ciphertext via testSealedBox; phone_id/email_id are UUID FKs
  const client = await db
    .insertInto("clients")
    .values({
      encrypted_alias: testSealedBox.sealBuffer(
        Buffer.from(`cl-${crypto.randomUUID().slice(0, 8)}`),
      ),
      alias_hash: null,
      phone_id: phoneId,
      email_id: emailId,
    })
    .returning("id")
    .executeTakeFirstOrThrow();

  return client.id;
}

/**
 * Decode a base64url sealed envelope and decrypt with eciesDecrypt.
 *
 * Contract: the 32|24|N split (ephemeralPoint | nonce | ciphertext) must
 * match the client-side envelope parser in packages/client/src/lib/portal;
 * a cross-package drift makes portal copies undecryptable.
 */
function openEnvelope(
  sealedBase64url: string,
  recipientPrivate: Scalar,
): Record<string, string> {
  const envelope = Buffer.from(sealedBase64url, "base64url");

  // envelope = ephemeralPoint(32) | nonce(24) | ciphertext(rest)
  const ephemeralPoint = toRistrettoPoint(
    new Uint8Array(envelope.subarray(0, 32)),
  );
  const nonce = toNonce(new Uint8Array(envelope.subarray(32, 56)));
  const ciphertext = new Uint8Array(envelope.subarray(56));

  const plaintext = eciesDecrypt(
    ephemeralPoint,
    nonce,
    ciphertext,
    recipientPrivate,
  );
  const json = Buffer.from(plaintext).toString("utf-8");
  return JSON.parse(json) as Record<string, string>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const DATABASE_URL = process.env.DATABASE_URL;

describe.skipIf(!DATABASE_URL)("contact-exposure-service", () => {
  let testDb: TestDb;
  let db: Kysely<TenantDatabase>;
  let sodium: SodiumBackend;

  beforeAll(async () => {
    sodium = await getSodium();
    testDb = await createTestDb();
    db = testDb.db;
  }, 30_000);

  afterAll(async () => {
    await testDb.cleanup();
  });

  // -----------------------------------------------------------------------
  // Bare-link channels get the typed error
  // -----------------------------------------------------------------------

  it("throws PortalContactLockedError for bare-link channels", async () => {
    const kp = makeRistrettoKeypair(sodium);
    const clientId = await insertClientWithContacts(db, {
      phone: "+15550001234",
    });
    const channel = makeChannelRow(clientId, kp.clientPublic, {
      kind: "secure_link",
      hasPassphrase: false,
    });

    await expect(
      getSealedContactInfo(channel, db, testFieldEncryptor),
    ).rejects.toThrow(PortalContactLockedError);
  });

  // -----------------------------------------------------------------------
  // Passphrase channel: envelope opens with correct key
  // -----------------------------------------------------------------------

  it("returns a sealed envelope that opens with the channel private key (passphrase channel)", async () => {
    const kp = makeRistrettoKeypair(sodium);
    const clientId = await insertClientWithContacts(db, {
      phone: "+15550009999",
      email: "test@example.org",
    });
    const channel = makeChannelRow(clientId, kp.clientPublic, {
      kind: "secure_link",
      hasPassphrase: true,
    });

    const result = await getSealedContactInfo(channel, db, testFieldEncryptor);

    // Wire shape: { sealed: string }
    expect(result).toHaveProperty("sealed");
    expect(typeof result.sealed).toBe("string");
    expect(result.sealed.length).toBeGreaterThan(0);

    // The base64url string must NOT contain plaintext digits or addresses
    const rawEnvelope = result.sealed;
    expect(rawEnvelope).not.toContain("+15550009999");
    expect(rawEnvelope).not.toContain("test@example.org");

    // Decrypt with the correct key
    const contact = openEnvelope(result.sealed, kp.clientPrivate);
    expect(contact.phone).toBe("+15550009999");
    expect(contact.email).toBe("test@example.org");
  });

  // -----------------------------------------------------------------------
  // Passphrase channel: envelope fails with a different key
  // -----------------------------------------------------------------------

  it("envelope fails to open with a different (seed-only-derived) key", async () => {
    const kp = makeRistrettoKeypair(sodium);
    const clientId = await insertClientWithContacts(db, {
      phone: "+15550004444",
    });
    const channel = makeChannelRow(clientId, kp.clientPublic, {
      kind: "secure_link",
      hasPassphrase: true,
    });

    const result = await getSealedContactInfo(channel, db, testFieldEncryptor);

    // Generate a different keypair (simulating a seed-only derivation)
    const wrongKp = makeRistrettoKeypair(sodium);

    expect(() => openEnvelope(result.sealed, wrongKp.clientPrivate)).toThrow();
  });

  // -----------------------------------------------------------------------
  // Account channel: envelope opens with account key
  // -----------------------------------------------------------------------

  it("returns a sealed envelope for account channels", async () => {
    const kp = makeRistrettoKeypair(sodium);
    const clientId = await insertClientWithContacts(db, {
      phone: "+15550007777",
      email: "account@example.org",
    });
    const channel = makeChannelRow(clientId, kp.clientPublic, {
      kind: "account",
      hasPassphrase: false,
    });

    const result = await getSealedContactInfo(channel, db, testFieldEncryptor);

    const contact = openEnvelope(result.sealed, kp.clientPrivate);
    expect(contact.phone).toBe("+15550007777");
    expect(contact.email).toBe("account@example.org");
  });

  // -----------------------------------------------------------------------
  // Client with no phone and no email yields empty JSON, not an error
  // -----------------------------------------------------------------------

  it("returns a sealed empty object when client has no phone and no email", async () => {
    const kp = makeRistrettoKeypair(sodium);
    const clientId = await insertClientWithContacts(db, {});
    const channel = makeChannelRow(clientId, kp.clientPublic, {
      kind: "secure_link",
      hasPassphrase: true,
    });

    const result = await getSealedContactInfo(channel, db, testFieldEncryptor);

    const contact = openEnvelope(result.sealed, kp.clientPrivate);
    expect(contact).toEqual({});
  });

  // -----------------------------------------------------------------------
  // Response wire shape never contains plaintext
  // -----------------------------------------------------------------------

  it("response sealed string does not contain plaintext digits or addresses", async () => {
    const kp = makeRistrettoKeypair(sodium);
    const clientId = await insertClientWithContacts(db, {
      phone: "+15550001111",
      email: "pii@example.org",
    });
    const channel = makeChannelRow(clientId, kp.clientPublic, {
      kind: "secure_link",
      hasPassphrase: true,
    });

    const result = await getSealedContactInfo(channel, db, testFieldEncryptor);

    // Decode the raw base64url bytes to verify no plaintext leaks
    const rawBytes = Buffer.from(result.sealed, "base64url").toString("utf-8");
    expect(rawBytes).not.toContain("+15550001111");
    expect(rawBytes).not.toContain("pii@example.org");
  });
});
