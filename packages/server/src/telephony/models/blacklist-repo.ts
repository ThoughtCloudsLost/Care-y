/**
 * Phone blacklist repository: add, remove, list, and check blocked phone
 * numbers for the tenant-scoped `phone_blacklist` table.
 *
 * Phone numbers are stored as sealed-box-encrypted bytea for admin display.
 * Lookups use the phone_hash (HMAC blind index). No plaintext is persisted.
 */

import type { Kysely, Selectable } from "kysely";
import type { PhoneBlacklistTable, TenantDatabase } from "../../db/types.js";

export interface BlacklistEntry {
  readonly id: string;
  readonly phoneHash: string;
  readonly encryptedNumber: Buffer;
  readonly addedBy: string;
  readonly createdAt: Date;
}

export interface BlacklistRepository {
  add(
    phoneHash: string,
    encryptedNumber: Buffer,
    addedBy: string,
  ): Promise<BlacklistEntry>;
  remove(id: string): Promise<void>;
  list(): Promise<readonly BlacklistEntry[]>;
  exists(phoneHash: string): Promise<boolean>;
}

function mapRow(row: Selectable<PhoneBlacklistTable>): BlacklistEntry {
  return {
    id: row.id,
    phoneHash: row.phone_hash,
    encryptedNumber: row.encrypted_number,
    addedBy: row.added_by,
    createdAt: row.created_at,
  };
}

export function createBlacklistRepository(
  db: Kysely<TenantDatabase>,
): BlacklistRepository {
  return {
    async add(
      phoneHash: string,
      encryptedNumber: Buffer,
      addedBy: string,
    ): Promise<BlacklistEntry> {
      const row = await db
        .insertInto("phone_blacklist")
        .values({
          phone_hash: phoneHash,
          encrypted_number: encryptedNumber,
          added_by: addedBy,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return mapRow(row);
    },

    async remove(id: string): Promise<void> {
      await db.deleteFrom("phone_blacklist").where("id", "=", id).execute();
    },

    async list(): Promise<readonly BlacklistEntry[]> {
      const rows = await db
        .selectFrom("phone_blacklist")
        .selectAll()
        .orderBy("created_at", "desc")
        .execute();

      return rows.map(mapRow);
    },

    async exists(phoneHash: string): Promise<boolean> {
      const row = await db
        .selectFrom("phone_blacklist")
        .select("id")
        .where("phone_hash", "=", phoneHash)
        .executeTakeFirst();

      return row !== undefined;
    },
  };
}
