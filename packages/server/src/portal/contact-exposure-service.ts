/**
 * Contact-info exposure service.
 *
 * Returns a client's on-file phone and email as an ECIES-sealed envelope
 * addressed to the channel's client_public key (ADR-098). Bare-link
 * channels are refused before any decryption happens. All plaintext
 * Buffers are zeroed in a finally block.
 *
 * No PII is logged. No plaintext leaves this module.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import type { PortalChannelRow } from "./channel-service.js";
import { eciesEncrypt, toRistrettoPoint } from "@care-y/crypto";
import { PortalContactLockedError } from "./portal-errors.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Wire-safe sealed contact envelope (base64url ECIES). */
export interface SealedContactInfo {
  readonly sealed: string;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * Fetch, decrypt, seal, and return the client's on-file contact info.
 *
 * Bare-link channels (`has_passphrase === false`, `kind === "secure_link"`)
 * are refused with a typed error before any decryption happens, because
 * sealing to a seed-derived key would hand the info to anyone with the link.
 *
 * For passphrase and account channels, the JSON payload is ECIES-sealed to
 * the channel's stored `client_public`. A passphrase-channel holder must
 * possess the passphrase-derived private key to open it. Account channels
 * get the same sealed shape (uniform sealing, ADR-098).
 *
 * Every plaintext Buffer is zeroed in a finally block.
 */
export async function getSealedContactInfo(
  channel: PortalChannelRow,
  tDb: Kysely<TenantDatabase>,
  fieldEncryptor: FieldEncryptor,
): Promise<SealedContactInfo> {
  if (channel.kind === "secure_link" && !channel.has_passphrase) {
    throw new PortalContactLockedError();
  }

  // Plaintext Buffers tracked for zeroing
  const plaintextBuffers: Buffer[] = [];

  try {
    // Resolve the client row to get phone_id and email_id
    const client = await tDb
      .selectFrom("clients")
      .select(["phone_id", "email_id"])
      .where("id", "=", channel.client_id)
      .executeTakeFirstOrThrow();

    // Build contact JSON parts
    let phoneStr: string | undefined;
    let emailStr: string | undefined;

    if (client.phone_id !== null) {
      const phoneRow = await tDb
        .selectFrom("phones")
        .select(["encrypted_number"])
        .where("id", "=", client.phone_id)
        .executeTakeFirst();

      if (phoneRow) {
        const phoneBuf = fieldEncryptor.decryptToBuffer(
          phoneRow.encrypted_number,
        );
        plaintextBuffers.push(phoneBuf);
        phoneStr = phoneBuf.toString("utf-8");
      }
    }

    if (client.email_id !== null) {
      const emailRow = await tDb
        .selectFrom("emails")
        .select(["encrypted_address"])
        .where("id", "=", client.email_id)
        .executeTakeFirst();

      if (emailRow) {
        const emailBuf = fieldEncryptor.decryptToBuffer(
          emailRow.encrypted_address,
        );
        plaintextBuffers.push(emailBuf);
        emailStr = emailBuf.toString("utf-8");
      }
    }

    // Assemble JSON in a Buffer (no JS string for the combined payload)
    const contactObj: Record<string, string> = {};
    if (phoneStr !== undefined) contactObj.phone = phoneStr;
    if (emailStr !== undefined) contactObj.email = emailStr;

    const jsonBuf = Buffer.from(JSON.stringify(contactObj), "utf-8");
    plaintextBuffers.push(jsonBuf);

    // ECIES-seal to the channel's client_public (ADR-090 construction)
    const clientPoint = toRistrettoPoint(new Uint8Array(channel.client_public));
    const sealed = eciesEncrypt(jsonBuf, clientPoint);

    // Concatenate envelope: ephemeralPoint(32) | nonce(24) | ciphertext(N)
    const envelope = Buffer.concat([
      Buffer.from(sealed.ephemeralPoint),
      Buffer.from(sealed.nonce),
      Buffer.from(sealed.ciphertext),
    ]);

    return { sealed: envelope.toString("base64url") };
  } finally {
    for (const buf of plaintextBuffers) {
      buf.fill(0);
    }
  }
}
