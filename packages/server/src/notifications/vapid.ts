// VAPID key pair lifecycle: generate, store (encrypted), load.
// Single platform-wide key pair, encrypted with OPS_SECRETS_KEY.

import type { Kysely } from "kysely";
import type { PlatformDatabase } from "../db/types.js";
import type { SecretsEncryptor } from "../config/secrets.js";
import { generateVapidKeyPair } from "./push-crypto.js";

export interface VapidKeys {
  readonly publicKey: string; // base64url
  readonly privateKeyPem: string;
}

/**
 * Loads or generates the platform VAPID key pair.
 * Called once at server startup. If no key exists, generates one and stores it.
 */
export async function loadOrCreateVapidKeys(
  db: Kysely<PlatformDatabase>,
  encryptor: SecretsEncryptor,
): Promise<VapidKeys> {
  const existing = await db
    .selectFrom("vapid_config")
    .select(["public_key", "encrypted_private_key"])
    .where("id", "=", 1)
    .executeTakeFirst();

  if (existing) {
    const privateKeyBuf = encryptor.decrypt(existing.encrypted_private_key);
    const privateKeyPem = privateKeyBuf.toString("utf-8");
    privateKeyBuf.fill(0);
    return { publicKey: existing.public_key, privateKeyPem };
  }

  // First startup: generate and persist
  const { publicKey, privateKeyPem } = generateVapidKeyPair();
  const encryptedPrivate = encryptor.encrypt(
    Buffer.from(privateKeyPem, "utf-8"),
  );

  await db
    .insertInto("vapid_config")
    .values({
      id: 1,
      public_key: publicKey,
      encrypted_private_key: encryptedPrivate,
    })
    .execute();

  return { publicKey, privateKeyPem };
}
