import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { KeyGeneration, TicketId, UserId } from "@care-y/shared";

/**
 * A volunteer's ECIES-wrapped ticket key, as stored. Buffers are returned
 * raw: wire encoding is the caller's concern, matching how
 * org-key-query-service hands back key material.
 */
export interface TicketKeyWrapRow {
  readonly ticketId: TicketId;
  readonly keyGeneration: KeyGeneration;
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly wrappedKey: Buffer;
}

export interface TicketKeyWrapQueryService {
  /**
   * Every wrap belonging to one volunteer, across all key generations.
   * The client unwraps these with its vol_private key to read tickets; the
   * server never holds a key that could open them.
   */
  listForVolunteer(volunteerId: UserId): Promise<readonly TicketKeyWrapRow[]>;
}

export function createTicketKeyWrapQueryService(
  db: Kysely<TenantDatabase>,
): TicketKeyWrapQueryService {
  return {
    async listForVolunteer(
      volunteerId: UserId,
    ): Promise<readonly TicketKeyWrapRow[]> {
      const rows = await db
        .selectFrom("ticket_key_wraps")
        .select([
          "ticket_id",
          "key_generation",
          "ephemeral_point",
          "nonce",
          "wrapped_key",
        ])
        .where("volunteer_id", "=", volunteerId)
        .execute();

      return rows.map((r) => ({
        ticketId: r.ticket_id,
        keyGeneration: r.key_generation,
        ephemeralPoint: r.ephemeral_point,
        nonce: r.nonce,
        wrappedKey: r.wrapped_key,
      }));
    },
  };
}
