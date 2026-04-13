/**
 * Read cursor service for ticket read state tracking.
 *
 * Each volunteer has one encrypted read cursor per ticket, containing
 * an encrypted timestamp ("read up to this point"). The server cannot
 * read the cursor content; it stores opaque ciphertext.
 *
 * Lazy population: a dummy row (random bytes) is created on first
 * access. Rows are deleted on ticket close.
 */

import { randomBytes } from "node:crypto";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { TicketAccessChecker } from "./access.js";

/**
 * Size of the dummy encrypted read cursor in bytes.
 *
 * Matches the expected ciphertext output of XSalsa20-Poly1305 for a
 * read cursor payload (~45 bytes JSON):
 *   nonce (24) + plaintext (45) + MAC (16) = 85 bytes
 */
const DUMMY_CURSOR_SIZE = 85;

export interface ReadCursorRecord {
  readonly ticketId: string;
  readonly userId: string;
  readonly encryptedReadCursor: Buffer;
}

export interface ReadCursorService {
  /**
   * Get the read cursor for a user on a ticket.
   * Creates a dummy row if none exists (lazy population).
   */
  getOrCreate(userId: string, ticketId: string): Promise<ReadCursorRecord>;

  /** Update the encrypted read cursor for a user on a ticket. */
  update(
    userId: string,
    ticketId: string,
    encryptedReadCursor: Buffer,
  ): Promise<void>;

  /** Delete all read cursors for a ticket (called on ticket close). */
  deleteForTicket(ticketId: string): Promise<void>;
}

export function createReadCursorService(
  db: Kysely<TenantDatabase>,
  access: TicketAccessChecker,
): ReadCursorService {
  return {
    async getOrCreate(userId, ticketId) {
      await access.assertAccess(userId, ticketId);

      const existing = await db
        .selectFrom("ticket_read_cursors")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (existing) {
        return {
          ticketId: existing.ticket_id,
          userId: existing.user_id,
          encryptedReadCursor: existing.encrypted_read_cursor,
        };
      }

      // Lazy populate with random bytes (indistinguishable from real
      // ciphertext to a snapshot attacker).
      const dummy = randomBytes(DUMMY_CURSOR_SIZE);

      await db
        .insertInto("ticket_read_cursors")
        .values({
          ticket_id: ticketId,
          user_id: userId,
          encrypted_read_cursor: dummy,
        })
        .onConflict((oc) => oc.columns(["ticket_id", "user_id"]).doNothing())
        .execute();

      // Re-read in case of race (another request inserted between our
      // SELECT and INSERT). The onConflict doNothing means our INSERT
      // may have been a no-op if the other request won.
      const row = await db
        .selectFrom("ticket_read_cursors")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .where("user_id", "=", userId)
        .executeTakeFirstOrThrow();

      return {
        ticketId: row.ticket_id,
        userId: row.user_id,
        encryptedReadCursor: row.encrypted_read_cursor,
      };
    },

    async update(userId, ticketId, encryptedReadCursor) {
      await access.assertAccess(userId, ticketId);

      await db
        .updateTable("ticket_read_cursors")
        .set({ encrypted_read_cursor: encryptedReadCursor })
        .where("ticket_id", "=", ticketId)
        .where("user_id", "=", userId)
        .execute();
    },

    async deleteForTicket(ticketId) {
      await db
        .deleteFrom("ticket_read_cursors")
        .where("ticket_id", "=", ticketId)
        .execute();
    },
  };
}
