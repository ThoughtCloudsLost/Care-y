import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  eciesEncrypt,
  toRistrettoPoint,
  type SymmetricKey,
} from "@care-y/crypto";

export interface VolunteerPublicKey {
  readonly volunteerId: string;
  readonly volPublic: Buffer;
}

/**
 * ECIES-wrap a ticket key for each volunteer and insert into ticket_key_wraps.
 * Callers provide the volunteer list (queried from different sources).
 */
export async function eciesWrapAndStore(
  db: Kysely<TenantDatabase>,
  ticketId: string,
  keyGeneration: string,
  tk: SymmetricKey,
  volunteers: readonly VolunteerPublicKey[],
): Promise<void> {
  for (const vol of volunteers) {
    const volPublic = toRistrettoPoint(new Uint8Array(vol.volPublic));
    const wrap = eciesEncrypt(tk, volPublic);
    await db
      .insertInto("ticket_key_wraps")
      .values({
        ticket_id: ticketId,
        volunteer_id: vol.volunteerId,
        key_generation: keyGeneration,
        ephemeral_point: Buffer.from(wrap.ephemeralPoint),
        nonce: Buffer.from(wrap.nonce),
        wrapped_key: Buffer.from(wrap.ciphertext),
        algorithm: "ecies-ristretto255-v1",
      })
      .execute();
  }
}
