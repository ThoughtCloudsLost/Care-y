/**
 * Merge scan data service.
 *
 * Fetches the minimal data the browser needs to run merge candidate
 * detection: per-client intake form response blobs, key wraps, and
 * field-to-role mappings. The server returns ciphertext only; all
 * decryption and comparison happens browser-side in the Worker.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface MergeScanClientRecord {
  readonly clientId: string;
  readonly responses: readonly MergeScanResponseRecord[];
}

export interface MergeScanResponseRecord {
  readonly ticketId: string;
  readonly formId: string;
  readonly encryptedResponse: Buffer;
}

export interface MergeScanFieldRoleRecord {
  readonly formId: string;
  readonly fieldId: string;
  readonly role: string;
}

export interface MergeScanPhoneHashRecord {
  readonly clientId: string;
  readonly phoneMatchHash: string;
}

// ---------------------------------------------------------------------------
// Service interface
// ---------------------------------------------------------------------------

export interface MergeScanService {
  /**
   * Returns intake form response blobs grouped by client, for all
   * non-merged clients that have at least one intake form response.
   * Restricted to tickets visible to the calling volunteer (via key wraps).
   */
  getResponsesByClient(
    userId: string,
  ): Promise<readonly MergeScanClientRecord[]>;

  /**
   * Returns field-to-role mappings for all intake forms that have
   * at least one role-tagged field.
   */
  getFieldRoles(): Promise<readonly MergeScanFieldRoleRecord[]>;

  /**
   * Returns browser-computed phone blind index hashes for all non-merged
   * clients whose phone row has a non-null phone_match_hash. This covers
   * both intake-created and telephony-created clients. The hash list
   * draws only from the phones table (clients); consultant reachability
   * rows live in a separate table with their own HKDF label and never
   * appear here.
   */
  getPhoneHashes(): Promise<readonly MergeScanPhoneHashRecord[]>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export function createMergeScanService(
  db: Kysely<TenantDatabase>,
): MergeScanService {
  return {
    async getResponsesByClient(
      userId: string,
    ): Promise<readonly MergeScanClientRecord[]> {
      // Join intake_form_responses with tickets to get client_id,
      // and with key_wraps to filter to tickets accessible to this volunteer.
      // Exclude merged clients.
      const rows = await db
        .selectFrom("intake_form_responses as ifr")
        .innerJoin("tickets as t", "t.id", "ifr.ticket_id")
        .innerJoin("clients as c", "c.id", "t.client_id")
        .leftJoin("ticket_key_wraps as kw", (join) =>
          join
            .onRef("kw.ticket_id", "=", "t.id")
            .on("kw.volunteer_id", "=", userId),
        )
        .leftJoin("intake_key_wraps as ikw", "ikw.ticket_id", "t.id")
        .where("c.merged_into", "is", null)
        .where((eb) =>
          eb.or([
            eb("kw.volunteer_id", "is not", null),
            eb("ikw.ticket_id", "is not", null),
          ]),
        )
        .select([
          "t.client_id as clientId",
          "ifr.ticket_id as ticketId",
          "ifr.form_id as formId",
          "ifr.encrypted_response as encryptedResponse",
        ])
        .execute();

      // Group by client
      const byClient = new Map<string, MergeScanResponseRecord[]>();
      for (const row of rows) {
        const clientId = row.clientId;
        let responses = byClient.get(clientId);
        if (!responses) {
          responses = [];
          byClient.set(clientId, responses);
        }
        responses.push({
          ticketId: row.ticketId,
          formId: row.formId,
          encryptedResponse: row.encryptedResponse,
        });
      }

      return Array.from(byClient.entries()).map(([clientId, responses]) => ({
        clientId,
        responses,
      }));
    },

    async getFieldRoles(): Promise<readonly MergeScanFieldRoleRecord[]> {
      const rows = await db
        .selectFrom("intake_form_fields")
        .where("role", "is not", null)
        .select(["form_id as formId", "id as fieldId", "role"])
        .execute();

      return rows.map((r) => ({
        formId: r.formId,
        fieldId: r.fieldId,
        role: typeof r.role === "string" ? r.role : String(r.role),
      }));
    },

    async getPhoneHashes(): Promise<readonly MergeScanPhoneHashRecord[]> {
      const rows = await db
        .selectFrom("clients as c")
        .innerJoin("phones as p", "p.id", "c.phone_id")
        .select(["c.id as clientId", "p.phone_match_hash as phoneMatchHash"])
        .where("c.merged_into", "is", null)
        .where("p.phone_match_hash", "is not", null)
        .execute();

      // phone_match_hash is guaranteed non-null by the WHERE clause, but
      // Kysely types it as nullable. The cast is safe here.
      return rows.map((r) => ({
        clientId: r.clientId,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- filtered by WHERE phone_match_hash IS NOT NULL
        phoneMatchHash: r.phoneMatchHash!,
      }));
    },
  };
}
