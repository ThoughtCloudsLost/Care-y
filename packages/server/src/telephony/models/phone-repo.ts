/**
 * Phone repository: find-by-hash, create, and update-locale for the
 * tenant-scoped `phones` table.
 *
 * All queries go through a Kysely instance bound to the tenant schema.
 * Phone numbers are stored as encrypted bytea; lookups use the phone_hash
 * (HMAC blind index). The repository never touches plaintext phone numbers.
 */

import type { Kysely, Selectable } from "kysely";
import type { PhonesTable, TenantDatabase } from "../../db/types.js";

export interface PhoneRecord {
  readonly id: string;
  readonly phoneHash: string;
  readonly encryptedNumber: Buffer;
  readonly phoneMatchHash: string | null;
  readonly locale: string;
  readonly locationCity: string | null;
  readonly locationRegion: string | null;
  readonly isActive: boolean;
}

export interface CreatePhoneInput {
  readonly phoneHash: string;
  readonly encryptedNumber: Buffer;
  readonly phoneMatchHash?: string | null;
  readonly locale?: string;
  readonly locationCity?: string;
  readonly locationRegion?: string;
}

export interface PhoneRepository {
  findByHash(phoneHash: string): Promise<PhoneRecord | null>;
  create(input: CreatePhoneInput): Promise<PhoneRecord>;
  updateLocale(id: string, locale: string): Promise<void>;
  deactivate(id: string): Promise<void>;
}

function mapPhoneRow(row: Selectable<PhonesTable>): PhoneRecord {
  return {
    id: row.id,
    phoneHash: row.phone_hash,
    encryptedNumber: row.encrypted_number,
    phoneMatchHash: row.phone_match_hash,
    locale: row.locale,
    locationCity: row.location_city,
    locationRegion: row.location_region,
    isActive: row.is_active,
  };
}

export function createPhoneRepository(
  db: Kysely<TenantDatabase>,
): PhoneRepository {
  return {
    async findByHash(phoneHash: string): Promise<PhoneRecord | null> {
      const row = await db
        .selectFrom("phones")
        .selectAll()
        .where("phone_hash", "=", phoneHash)
        .where("is_active", "=", true)
        .executeTakeFirst();

      if (!row) return null;
      return mapPhoneRow(row);
    },

    async create(input: CreatePhoneInput): Promise<PhoneRecord> {
      const row = await db
        .insertInto("phones")
        .values({
          phone_hash: input.phoneHash,
          encrypted_number: input.encryptedNumber,
          phone_match_hash: input.phoneMatchHash ?? null,
          locale: input.locale ?? "en-US",
          location_city: input.locationCity ?? null,
          location_region: input.locationRegion ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return mapPhoneRow(row);
    },

    async updateLocale(id: string, locale: string): Promise<void> {
      await db
        .updateTable("phones")
        .set({ locale, updated_at: new Date() })
        .where("id", "=", id)
        .execute();
    },

    async deactivate(id: string): Promise<void> {
      await db
        .updateTable("phones")
        .set({ is_active: false, updated_at: new Date() })
        .where("id", "=", id)
        .execute();
    },
  };
}
