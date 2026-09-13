/**
 * Inbound email ingest handler. Receives the parsed pieces of an accepted
 * message from the SMTP receiver, reopens the ticket if it was closed,
 * encrypts the payload as an email_inbound follow-up through the inbound
 * SMS machinery (tk_temp path, ADR-041), and stores a portal copy sealed
 * to the client's active channel (ADR-090).
 *
 * This is a relay endpoint and follows the relay rules: the payload buffer is
 * zeroed by the follow-up helpers, nothing is spooled, and no content,
 * subject, address, or token is ever logged. The parsed strings handed in
 * by the receiver are the same residual JS-string exposure the relay
 * routes document; their lifetime is this handler call.
 *
 * Attribution is the reply token (resolved by the receiver before this
 * runs). The From value here is display-only and never routes anything.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { FollowupId, TicketId } from "@care-y/shared";
import { EMAIL_RELAY_LIMITS, emailInboundPayloadSchema } from "@care-y/shared";
import { InboundEmailError } from "../errors.js";
import { reopenClosedTicket } from "../tickets/ticket-reopen.js";
import { createEncryptedFollowUp } from "../tickets/server-followup-create.js";
import {
  sealInboundClientCopy,
  writeInboundClientCopy,
} from "../portal/portal-message-service.js";

/** Maximum stored length of the claimed From value (RFC 5321 path limit). */
const FROM_MAX = 320;

/** Parsed message fields the receiver hands to the ingest handler. */
export interface InboundEmailData {
  readonly subject: string;
  readonly text: string;
  /** Claimed From header value. Display only, never used for routing. */
  readonly from: string;
  readonly droppedAttachments: number;
}

export interface InboundEmailResult {
  readonly followUpId: FollowupId;
  readonly reopened: boolean;
}

/**
 * Builds the canonical email_inbound payload object from parsed fields.
 *
 * Over-cap subject/text are truncated to the shared schema limits rather
 * than rejected: a 552 would lose a real reply outright and a 451 would
 * make the sender's MTA retry a permanently oversized message forever.
 * An empty body (subject-only mail) is stored as a single space so the
 * payload still satisfies the schema's non-empty text requirement.
 */
export function buildInboundEmailPayload(
  data: InboundEmailData,
): ReturnType<typeof emailInboundPayloadSchema.parse> {
  const text =
    data.text.length > 0 ? data.text.slice(0, EMAIL_RELAY_LIMITS.text) : " ";
  return emailInboundPayloadSchema.parse({
    subject: data.subject.slice(0, EMAIL_RELAY_LIMITS.subject),
    text,
    from: data.from.slice(0, FROM_MAX),
    droppedAttachments: data.droppedAttachments,
  });
}

/**
 * Ingest one accepted inbound email onto its ticket.
 *
 * Ordering follows handleInboundSms: the portal copy is sealed to the
 * channel's client_public BEFORE createEncryptedFollowUp zeroes the
 * payload buffer (ADR-090), and the copy write is best-effort after the
 * follow-up id exists. Copy-path failure never fails the forward path.
 *
 * @throws InboundEmailError when the ticket row is missing (integrity
 *   failure: the token resolved but its ticket does not exist).
 */
export async function handleInboundEmail(
  tDb: Kysely<TenantDatabase>,
  ticketId: TicketId,
  data: InboundEmailData,
): Promise<InboundEmailResult> {
  // 1. Load the ticket; the token already proved routing, so a missing
  // row is an integrity bug, not a client error.
  const ticket = await tDb
    .selectFrom("tickets")
    .select(["id", "client_id", "status"])
    .where("id", "=", ticketId)
    .executeTakeFirst();

  if (!ticket) {
    throw new InboundEmailError("Ticket for resolved reply token not found");
  }

  // 2. Reopen a closed ticket with the same semantics as inbound SMS
  // (shared helper, status_opened system follow-up).
  let reopened = false;
  if (ticket.status !== "open") {
    await reopenClosedTicket(tDb, ticketId);
    reopened = true;
  }

  // 3. Build the payload buffer. From here to the follow-up helpers'
  // finally blocks, bodyBuf is the plaintext under our control.
  const payload = buildInboundEmailPayload(data);
  const bodyBuf = Buffer.from(JSON.stringify(payload), "utf-8");

  // 4. Seal the portal copy BEFORE follow-up creation zeroes bodyBuf
  // (ADR-090). Best-effort via the shared ingest helper.
  const copyResult = await sealInboundClientCopy(
    tDb,
    ticket.client_id,
    bodyBuf,
  );

  // 5. Existing-ticket path always: tk_temp with its own ECIES wraps
  // (ADR-041). bodyBuf is zeroed inside, in a finally block.
  const result = await createEncryptedFollowUp(
    tDb,
    ticketId,
    bodyBuf,
    "email_inbound",
    "client",
  );

  // 6. Store the portal copy (best-effort, ADR-090 fault isolation).
  if (copyResult.channelRowId !== null && copyResult.portalCopy !== null) {
    await writeInboundClientCopy(
      tDb,
      copyResult.channelRowId,
      result.followUpId,
      copyResult.portalCopy,
    );
  }

  return { followUpId: result.followUpId, reopened };
}
