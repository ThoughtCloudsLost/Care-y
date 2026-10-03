/**
 * Phone lookup service for the outbound relay.
 *
 * Resolves a browser-supplied plaintext phone number to an existing client
 * (with its open ticket, if any) by blind index. When no active client
 * matches, it returns the pre-computed phone hash and OPS-encrypted number so
 * the caller can park them under a short-lived pending-client token.
 *
 * The plaintext arrives as a Buffer owned by the caller, which zeroes it.
 * Nothing here logs or returns the number.
 */

import { randomUUID } from "node:crypto";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type {
  FieldEncryptor,
  BlindIndexer,
} from "../crypto/field-encryptor.js";
import type { PendingClient } from "../tickets/ticket-service.js";
import { createPhoneRepository } from "../telephony/models/phone-repo.js";
import type {
  ClientId,
  OrgId,
  OrgSchema,
  PhoneHash,
  PhoneMatchHash,
  TicketId,
} from "@care-y/shared";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface PendingPhoneArtifacts {
  readonly phoneHash: PhoneHash;
  readonly opsEncryptedPhone: Buffer;
}

export type PhoneLookupResult =
  | {
      readonly found: true;
      readonly clientId: ClientId;
      readonly encryptedAlias: Buffer;
      readonly openTicketId: TicketId | null;
    }
  | { readonly found: false; readonly pending: PendingPhoneArtifacts };

// ---------------------------------------------------------------------------
// Service interface
// ---------------------------------------------------------------------------

export interface PhoneLookupService {
  /** Looks up the active, unmerged client for a plaintext phone number and
   *  that client's open ticket. When no client matches, returns the phone
   *  hash and OPS-encrypted number for a pending-client entry. The caller
   *  owns the phone Buffer and zeroes it; this method never modifies it. */
  lookupPhone(phone: Buffer): Promise<PhoneLookupResult>;

  /** Stores the artifacts of an unmatched lookup in the pending-client map
   *  under a fresh random token and returns the token. */
  storePendingClient(
    pending: PendingPhoneArtifacts,
    phoneMatchHash: PhoneMatchHash | null,
  ): string;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export interface PhoneLookupServiceDeps {
  readonly db: Kysely<TenantDatabase>;
  readonly indexer: BlindIndexer;
  readonly encryptor: FieldEncryptor;
  readonly orgId: OrgId;
  readonly orgSchema: OrgSchema;
  readonly pendingClients: Map<string, PendingClient>;
}

export function createPhoneLookupService(
  deps: PhoneLookupServiceDeps,
): PhoneLookupService {
  const { db, indexer, encryptor, orgId } = deps;

  return {
    async lookupPhone(phone): Promise<PhoneLookupResult> {
      // Derive hash + OPS-encrypted phone in a tight scope so the JS string
      // reference drops before the await calls below. The caller owns the
      // Buffer and zeroes it, but this conversion creates an immutable JS
      // string that persists until GC (accepted residual risk, same as the
      // SMS relay). Scoping minimizes the number of closures that capture it.
      let phoneHash: PhoneHash;
      let opsEncryptedPhone: Buffer;
      {
        const phoneStr = phone.toString("utf-8");
        phoneHash = indexer.hashPhone(phoneStr, orgId);
        opsEncryptedPhone = encryptor.encrypt(phoneStr);
      }

      try {
        const phoneRepo = createPhoneRepository(db);
        const existingPhone = await phoneRepo.findByHash(phoneHash);

        if (existingPhone) {
          const client = await db
            .selectFrom("clients")
            .select(["id", "encrypted_alias"])
            .where("phone_id", "=", existingPhone.id)
            .where("merged_into", "is", null)
            .executeTakeFirst();

          if (client) {
            const openTicket = await db
              .selectFrom("tickets")
              .select("id")
              .where("client_id", "=", client.id)
              .where("status", "=", "open")
              .executeTakeFirst();

            // Existing client found: zero the pre-computed OPS-encrypted phone
            // since we won't need it for a pending token.
            opsEncryptedPhone.fill(0);

            return {
              found: true,
              clientId: client.id,
              encryptedAlias: client.encrypted_alias,
              openTicketId: openTicket?.id ?? null,
            };
          }
        }

        return { found: false, pending: { phoneHash, opsEncryptedPhone } };
      } catch (err: unknown) {
        // No caller receives the OPS-encrypted phone when a query fails, so
        // zero it here before the error propagates.
        opsEncryptedPhone.fill(0);
        throw err;
      }
    },

    storePendingClient(pending, phoneMatchHash): string {
      const token = randomUUID();
      deps.pendingClients.set(token, {
        phoneHash: pending.phoneHash,
        opsEncryptedPhone: pending.opsEncryptedPhone,
        phoneMatchHash,
        orgSchema: deps.orgSchema,
        createdAt: Date.now(),
      });
      return token;
    },
  };
}
