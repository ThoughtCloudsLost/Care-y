import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { resolveOrCreateTicket } from "../tickets/server-ticket-create.js";
import { requireSodium } from "@care-y/crypto";

/**
 * Resolve or create a ticket for an inbound call/voicemail.
 * Builds encrypted title/description, calls resolveOrCreateTicket,
 * and zeros the returned tk immediately (phone_call follow-ups contain
 * no PII content that needs tk).
 *
 * Returns the resolved ticketId.
 */
export async function resolveInboundTicket(
  tDb: Kysely<TenantDatabase>,
  clientId: string,
  intakeQueueId: string,
  description: string,
): Promise<string> {
  const titleBuf = Buffer.from(`Call from ${clientId}`, "utf-8");
  const descBuf = Buffer.from(description, "utf-8");

  const result = await resolveOrCreateTicket(
    tDb,
    clientId,
    intakeQueueId,
    titleBuf,
    descBuf,
  );

  if (result.tk) {
    const sodium = requireSodium();
    sodium.memzero(result.tk);
  }

  return result.ticketId;
}
