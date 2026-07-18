import type { Kysely } from "kysely";
import { sql } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  generateContentKey,
  encryptContent,
  buildContentAad,
  requireSodium,
  type SymmetricKey,
} from "@care-y/crypto";
import { eciesWrapAndStore } from "./key-wrap.js";

export interface ResolveTicketResult {
  readonly ticketId: string;
  readonly isNew: boolean;
  readonly tk: SymmetricKey | null;
  readonly keyGeneration: string | null;
}

/**
 * Find an open ticket for a client, reopen a closed one, or create a new
 * ticket with server-side ECIES key wrapping.
 *
 * For the "create" branch, the returned `tk` is NOT zeroed. The caller
 * MUST zero it after using it for follow-up encryption.
 */
export async function resolveOrCreateTicket(
  db: Kysely<TenantDatabase>,
  clientId: string,
  intakeQueueId: string,
  title: Buffer,
  description: Buffer,
): Promise<ResolveTicketResult> {
  // Wrap in a transaction with an advisory lock on the client ID to prevent
  // concurrent webhooks from creating duplicate tickets (ADR-018 one-ticket-per-client).
  // pg_advisory_xact_lock releases automatically when the transaction ends.
  return db.transaction().execute(async (trx) => {
    await sql`SELECT pg_advisory_xact_lock(hashtext(${clientId}))`.execute(trx);

    // 1. Check for an open ticket
    const openTicket = await trx
      .selectFrom("tickets")
      .select("id")
      .where("client_id", "=", clientId)
      .where("status", "=", "open")
      .orderBy("created_at", "desc")
      .executeTakeFirst();

    if (openTicket) {
      title.fill(0);
      description.fill(0);
      return {
        ticketId: openTicket.id,
        isNew: false,
        tk: null,
        keyGeneration: null,
      };
    }

    // 2. Check for a closed ticket to reopen
    const closedTicket = await trx
      .selectFrom("tickets")
      .select("id")
      .where("client_id", "=", clientId)
      .orderBy("created_at", "desc")
      .executeTakeFirst();

    if (closedTicket) {
      await trx
        .updateTable("tickets")
        .set({ status: "open" })
        .where("id", "=", closedTicket.id)
        .execute();

      await trx
        .insertInto("followups")
        .values({
          ticket_id: closedTicket.id,
          source: "system",
          type: "status_opened",
          encrypted_content: Buffer.alloc(0),
        })
        .execute();

      title.fill(0);
      description.fill(0);
      return {
        ticketId: closedTicket.id,
        isNew: false,
        tk: null,
        keyGeneration: null,
      };
    }

    // 3. No existing ticket: create with server-side ECIES. The id is
    // minted before encryption so the AAD can bind it (ADR-053).
    const sodium = requireSodium();
    const tk = generateContentKey();
    try {
      const keyGeneration = crypto.randomUUID();
      const ticketId = crypto.randomUUID();

      const encryptedTitle = encryptContent(
        new Uint8Array(title),
        tk,
        buildContentAad(ticketId, "title"),
      );
      const encryptedDescription = encryptContent(
        new Uint8Array(description),
        tk,
        buildContentAad(ticketId, "description"),
      );

      title.fill(0);
      description.fill(0);

      const ticket = await trx
        .insertInto("tickets")
        .values({
          id: ticketId,
          client_id: clientId,
          queue_id: intakeQueueId,
          encrypted_title: Buffer.from(encryptedTitle),
          encrypted_description: Buffer.from(encryptedDescription),
          key_generation: keyGeneration,
          priority: "normal",
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      // ECIES wrap tk for all volunteers in the intake queue with vol_public
      const volunteers = await trx
        .selectFrom("queue_assignments")
        .innerJoin(
          "user_keys",
          "user_keys.user_id",
          "queue_assignments.user_id",
        )
        .select(["queue_assignments.user_id", "user_keys.vol_public"])
        .where("queue_assignments.queue_id", "=", intakeQueueId)
        .where("user_keys.vol_public", "is not", null)
        .execute();

      await eciesWrapAndStore(
        trx,
        ticket.id,
        keyGeneration,
        tk,
        volunteers
          .filter(
            (v): v is typeof v & { vol_public: Buffer } =>
              v.vol_public !== null,
          )
          .map((v) => ({ volunteerId: v.user_id, volPublic: v.vol_public })),
      );

      return { ticketId: ticket.id, isNew: true, tk, keyGeneration };
    } catch (err: unknown) {
      sodium.memzero(tk);
      title.fill(0);
      description.fill(0);
      throw err;
    }
  });
}
