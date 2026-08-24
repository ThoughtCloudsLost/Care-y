/**
 * Phone blocklist repository: add, remove, list, and check blocked phone
 * numbers for the tenant-scoped `phone_blocklist` table.
 *
 * Phone numbers are stored as sealed-box-encrypted bytea for admin display.
 * Lookups use the phone_hash (HMAC blind index). No plaintext is persisted.
 */

import type { Kysely, Selectable } from "kysely";
import type { PhoneBlocklistTable, TenantDatabase } from "../../db/types.js";
import type { PhoneBlocklistId, PhoneHash, UserId } from "@care-y/shared";

export interface BlocklistEntry {
  readonly id: PhoneBlocklistId;
  readonly phoneHash: PhoneHash;
  readonly encryptedNumber: Buffer;
  readonly addedBy: UserId;
  readonly createdAt: Date;
}

export interface BlocklistRepository {
  add(
    phoneHash: PhoneHash,
    encryptedNumber: Buffer,
    addedBy: UserId,
  ): Promise<BlocklistEntry>;
  remove(id: PhoneBlocklistId): Promise<void>;
  list(): Promise<readonly BlocklistEntry[]>;
  exists(phoneHash: PhoneHash): Promise<boolean>;
}

function mapRow(row: Selectable<PhoneBlocklistTable>): BlocklistEntry {
  return {
    id: row.id,
    phoneHash: row.phone_hash,
    encryptedNumber: row.encrypted_number,
    addedBy: row.added_by,
    createdAt: row.created_at,
  };
}

export function createBlocklistRepository(
  db: Kysely<TenantDatabase>,
): BlocklistRepository {
  return {
    async add(
      phoneHash: PhoneHash,
      encryptedNumber: Buffer,
      addedBy: UserId,
    ): Promise<BlocklistEntry> {
      const row = await db
        .insertInto("phone_blocklist")
        .values({
          phone_hash: phoneHash,
          encrypted_number: encryptedNumber,
          added_by: addedBy,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return mapRow(row);
    },

    async remove(id: PhoneBlocklistId): Promise<void> {
      await db.deleteFrom("phone_blocklist").where("id", "=", id).execute();
    },

    async list(): Promise<readonly BlocklistEntry[]> {
      const rows = await db
        .selectFrom("phone_blocklist")
        .selectAll()
        .orderBy("created_at", "desc")
        .execute();

      return rows.map(mapRow);
    },

    async exists(phoneHash: PhoneHash): Promise<boolean> {
      const row = await db
        .selectFrom("phone_blocklist")
        .select("id")
        .where("phone_hash", "=", phoneHash)
        .executeTakeFirst();

      return row !== undefined;
    },
  };
}
