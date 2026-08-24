/**
 * Intake key wrap conversion: transforms org-key sealed wraps into
 * per-volunteer ECIES wraps.
 *
 * The public intake form seals tk to the org public key (crypto_box_seal).
 * The first volunteer to open the ticket detail converts that sealed wrap
 * into standard ristretto255 ECIES wraps for each queue volunteer. After
 * conversion the interim wrap is deleted and the ticket is indistinguishable
 * from any telephony-originated ticket.
 *
 * The Worker (client-side) performs the actual unsealing and ECIES
 * re-wrapping. This service validates targets, stores wraps, and deletes
 * the interim row, all within a single transaction.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { TicketAccessChecker } from "../tickets/access.js";
import { ForbiddenError, ValidationError } from "../errors.js";
import { encode } from "@care-y/crypto";
import type { TicketId, UserId } from "@care-y/shared";

export interface ConversionTarget {
  readonly volunteerId: UserId;
  readonly volPublic: string; // base64
}

export interface ConversionWrap {
  readonly volunteerId: UserId;
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly wrappedKey: Buffer;
}

export interface ConvertIntakeKeyWrapInput {
  readonly ticketId: TicketId;
  readonly wraps: readonly ConversionWrap[];
}

export interface ConvertIntakeKeyWrapResult {
  readonly converted: boolean;
}

/**
 * Fetch queue volunteers with published vol_public for a ticket. These
 * are the conversion targets the Worker will ECIES-wrap tk for.
 *
 * Uses the same queue_assignments x user_keys join as server-side ticket
 * creation (server-ticket-create.ts).
 */
export async function getConversionTargets(
  db: Kysely<TenantDatabase>,
  access: TicketAccessChecker,
  userId: UserId,
  ticketId: TicketId,
): Promise<ConversionTarget[]> {
  await access.assertAccess(userId, ticketId);

  const ticket = await db
    .selectFrom("tickets")
    .select("queue_id")
    .where("id", "=", ticketId)
    .executeTakeFirst();

  if (!ticket) return [];

  const volunteers = await db
    .selectFrom("queue_assignments")
    .innerJoin("user_keys", "user_keys.user_id", "queue_assignments.user_id")
    .select(["queue_assignments.user_id", "user_keys.vol_public"])
    .where("queue_assignments.queue_id", "=", ticket.queue_id)
    .where("user_keys.vol_public", "is not", null)
    .execute();

  return volunteers
    .filter(
      (v): v is typeof v & { vol_public: Buffer } => v.vol_public !== null,
    )
    .map((v) => ({
      volunteerId: v.user_id,
      volPublic: encode(new Uint8Array(v.vol_public)),
    }));
}

/**
 * Convert the interim org-key sealed wrap into per-volunteer ECIES wraps.
 *
 * Transaction semantics:
 * 1. DELETE the intake_key_wraps row with RETURNING (row lock serializes
 *    concurrent converters; zero rows = already converted, return no-op).
 * 2. Validate every volunteerId against queue membership (client list is
 *    untrusted).
 * 3. Insert ticket_key_wraps rows for each validated wrap.
 * 4. On any insert failure the transaction rolls back, restoring the
 *    interim wrap.
 *
 * Empty wraps list (no volunteers with vol_public) is a no-op that leaves
 * the interim wrap in place for retry on next open.
 */
export async function convertIntakeKeyWrap(
  db: Kysely<TenantDatabase>,
  access: TicketAccessChecker,
  userId: UserId,
  input: ConvertIntakeKeyWrapInput,
): Promise<ConvertIntakeKeyWrapResult> {
  await access.assertAccess(userId, input.ticketId);

  // Empty wraps list: no volunteers onboarded yet. Leave the interim wrap.
  if (input.wraps.length === 0) {
    return { converted: false };
  }

  return db.transaction().execute(async (trx) => {
    // Row-lock the interim wrap. RETURNING gives us the row if it existed.
    const deleted = await trx
      .deleteFrom("intake_key_wraps")
      .where("ticket_id", "=", input.ticketId)
      .returning("ticket_id")
      .executeTakeFirst();

    // Already converted (concurrent converter won the race, or no wrap exists).
    if (!deleted) {
      return { converted: false };
    }

    // Fetch the ticket's queue and key_generation for the inserts.
    const ticket = await trx
      .selectFrom("tickets")
      .select(["queue_id", "key_generation"])
      .where("id", "=", input.ticketId)
      .executeTakeFirst();

    if (!ticket) {
      // Ticket disappeared mid-transaction (cascade delete); nothing to do.
      return { converted: false };
    }

    // Re-derive queue membership server-side (never trust client target list).
    const queueMembers = await trx
      .selectFrom("queue_assignments")
      .select("user_id")
      .where("queue_id", "=", ticket.queue_id)
      .execute();

    const memberSet = new Set(queueMembers.map((m) => m.user_id));

    // Validate every volunteerId the client sent.
    for (const wrap of input.wraps) {
      if (!memberSet.has(wrap.volunteerId)) {
        throw new ForbiddenError(
          `Volunteer ${wrap.volunteerId} is not a member of the ticket queue`,
        );
      }
    }

    // Insert ECIES wraps for each target volunteer.
    for (const wrap of input.wraps) {
      await trx
        .insertInto("ticket_key_wraps")
        .values({
          ticket_id: input.ticketId,
          volunteer_id: wrap.volunteerId,
          key_generation: ticket.key_generation,
          ephemeral_point: wrap.ephemeralPoint,
          nonce: wrap.nonce,
          wrapped_key: wrap.wrappedKey,
          algorithm: "ecies-ristretto255-v1",
        })
        .execute();
    }

    return { converted: true };
  });
}

/**
 * Typed error for the key rotation guard: rotation cannot proceed while
 * intake wraps are pending conversion.
 */
export class PendingIntakeWrapsError extends ValidationError {
  constructor() {
    super(
      "Cannot rotate org key while intake_key_wraps rows exist. " +
        "Convert all pending intake wraps before rotating.",
    );
  }
}
