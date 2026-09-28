/**
 * Cross-process ticket-change notices over Postgres NOTIFY.
 *
 * Writes made outside the API process (the inbound SMTP receiver) cannot
 * reach the API's SSE streams directly. After such a write commits, the
 * writer publishes the tenant schema and ticket id on one fixed channel.
 * The API process listens (ticket-change-listener.ts) and runs the same
 * live-event path as its own writes. Recipients come from the access
 * rule, never from the notice.
 *
 * A notice carries ids only. Postgres delivers it to every session
 * listening on the channel in this database. Content never goes in it.
 */

import type { Kysely } from "kysely";
import { z } from "zod";
import { orgSchemaNameSchema, ticketIdSchema } from "@care-y/shared";
import type { OrgSchema, TicketId } from "@care-y/shared";
import type { PlatformDatabase } from "../db/types.js";

/**
 * The one NOTIFY channel for ticket changes. A fixed lowercase identifier,
 * so the unquoted LISTEN in the listener names the same channel as the
 * pg_notify argument here.
 */
export const TICKET_CHANGED_CHANNEL = "care_y_ticket_changed";

/** Subscribes a session to the channel. Built from the constant alone. */
export const TICKET_CHANGED_LISTEN_STATEMENT = `LISTEN ${TICKET_CHANGED_CHANNEL}`;

/** The notice payload. Unknown keys are dropped on parse. */
export const ticketChangeNoticeSchema = z.object({
  orgSchema: orgSchemaNameSchema,
  ticketId: ticketIdSchema,
});
export type TicketChangeNotice = z.infer<typeof ticketChangeNoticeSchema>;

/**
 * Parses a raw NOTIFY payload. Returns null for anything that is not JSON
 * of the notice shape; the caller drops it.
 */
export function parseTicketChangeNotice(
  payload: string | undefined,
): TicketChangeNotice | null {
  if (payload === undefined) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(payload);
  } catch {
    return null;
  }
  const parsed = ticketChangeNoticeSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

/**
 * Publishes a notice that a ticket changed. Call after the write commits,
 * with the base instance rather than a transaction: Postgres holds a
 * NOTIFY issued inside a transaction until that transaction commits.
 * Never rejects: a failure is logged without ids and leaves views stale
 * until their next refetch.
 */
export async function publishTicketChange(
  db: Kysely<PlatformDatabase>,
  orgSchema: OrgSchema,
  ticketId: TicketId,
): Promise<void> {
  const notice: TicketChangeNotice = { orgSchema, ticketId };
  try {
    await db
      .selectNoFrom((eb) => [
        eb
          .fn<unknown>("pg_notify", [
            eb.val(TICKET_CHANGED_CHANNEL),
            eb.val(JSON.stringify(notice)),
          ])
          .as("notified"),
      ])
      .execute();
  } catch (err: unknown) {
    // The message only: no schema, no ticket id.
    console.error(
      "Ticket change notice failed:",
      err instanceof Error ? err.message : String(err),
    );
  }
}
