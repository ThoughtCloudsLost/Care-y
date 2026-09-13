/**
 * Client contact resolution.
 *
 * Resolves a client's phone or email as an OPS-decrypted Buffer from a
 * ticket ID. These helpers were originally co-located with the relay
 * handler; they now live in the clients package so service-layer callers
 * (portal-message-service, relay) import from a non-route module.
 *
 * Both functions return a Buffer that the caller must zero after use.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import type { TicketId } from "@care-y/shared";

/**
 * Resolves a client's phone number from a ticket ID by joining
 * tickets -> clients -> phones, then OPS-decrypting the stored number.
 * Returns null when any link in the chain is missing.
 */
export async function resolveClientPhone(
  ticketId: TicketId,
  tenantDb: Kysely<TenantDatabase>,
  fieldEncryptor: FieldEncryptor,
): Promise<Buffer | null> {
  const row = await tenantDb
    .selectFrom("tickets as t")
    .innerJoin("clients as c", "c.id", "t.client_id")
    .innerJoin("phones as p", "p.id", "c.phone_id")
    .select("p.encrypted_number")
    .where("t.id", "=", ticketId)
    .executeTakeFirst();

  if (!row) return null;
  return fieldEncryptor.decryptToBuffer(row.encrypted_number);
}

/**
 * Resolves a client's email address from a ticket ID by joining
 * tickets -> clients -> emails, then OPS-decrypting the stored address.
 * Returns null when any link in the chain is missing.
 */
export async function resolveClientEmail(
  ticketId: TicketId,
  tenantDb: Kysely<TenantDatabase>,
  fieldEncryptor: FieldEncryptor,
): Promise<Buffer | null> {
  const row = await tenantDb
    .selectFrom("tickets as t")
    .innerJoin("clients as c", "c.id", "t.client_id")
    .innerJoin("emails as e", "e.id", "c.email_id")
    .select("e.encrypted_address")
    .where("t.id", "=", ticketId)
    .executeTakeFirst();

  if (!row) return null;
  return fieldEncryptor.decryptToBuffer(row.encrypted_address);
}
