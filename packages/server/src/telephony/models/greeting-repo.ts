/**
 * Phone greeting repository for IVR content.
 *
 * Each greeting is keyed by (phone_id, locale, greeting_type).
 * Text greetings are stored inline; audio greetings reference a
 * BlobStore key for the pre-recorded file.
 *
 * All queries go through a tenant-scoped Kysely instance. Schema
 * scoping is the caller's responsibility (pass tenantDb(orgSchema)).
 */

import type { Kysely, Selectable } from "kysely";
import type { TenantDatabase, PhoneGreetingsTable } from "../../db/types.js";
import { NotFoundError } from "../../errors.js";

export interface GreetingRecord {
  readonly id: string;
  readonly phoneId: string;
  readonly greetingType: string;
  readonly locale: string;
  readonly text: string;
  readonly isAudio: boolean;
  readonly audioBlobKey: string | null;
}

export interface GreetingRepository {
  findByPhoneAndLocaleAndType(
    phoneId: string,
    locale: string,
    greetingType: string,
  ): Promise<GreetingRecord | null>;
  listByPhone(phoneId: string): Promise<readonly GreetingRecord[]>;
  create(input: {
    phoneId: string;
    greetingType: string;
    locale: string;
    text: string;
    isAudio?: boolean;
    audioBlobKey?: string | null;
  }): Promise<GreetingRecord>;
  update(
    id: string,
    input: { text?: string; isAudio?: boolean; audioBlobKey?: string | null },
  ): Promise<GreetingRecord>;
  delete(id: string): Promise<void>;
}

function toGreetingRecord(
  row: Selectable<PhoneGreetingsTable>,
): GreetingRecord {
  return {
    id: row.id,
    phoneId: row.phone_id,
    greetingType: row.greeting_type,
    locale: row.locale,
    text: row.text,
    isAudio: row.is_audio,
    audioBlobKey: row.audio_blob_key,
  };
}

export function createGreetingRepository(
  db: Kysely<TenantDatabase>,
): GreetingRepository {
  return {
    async findByPhoneAndLocaleAndType(
      phoneId: string,
      locale: string,
      greetingType: string,
    ): Promise<GreetingRecord | null> {
      const row = await db
        .selectFrom("phone_greetings")
        .selectAll()
        .where("phone_id", "=", phoneId)
        .where("locale", "=", locale)
        .where("greeting_type", "=", greetingType)
        .executeTakeFirst();

      if (!row) return null;
      return toGreetingRecord(row);
    },

    async listByPhone(phoneId: string): Promise<readonly GreetingRecord[]> {
      const rows = await db
        .selectFrom("phone_greetings")
        .selectAll()
        .where("phone_id", "=", phoneId)
        .execute();

      return rows.map(toGreetingRecord);
    },

    async create(input: {
      phoneId: string;
      greetingType: string;
      locale: string;
      text: string;
      isAudio?: boolean;
      audioBlobKey?: string | null;
    }): Promise<GreetingRecord> {
      const row = await db
        .insertInto("phone_greetings")
        .values({
          phone_id: input.phoneId,
          greeting_type: input.greetingType,
          locale: input.locale,
          text: input.text,
          is_audio: input.isAudio ?? false,
          audio_blob_key: input.audioBlobKey ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toGreetingRecord(row);
    },

    async update(
      id: string,
      input: { text?: string; isAudio?: boolean; audioBlobKey?: string | null },
    ): Promise<GreetingRecord> {
      const updateValues: Record<string, unknown> = {};
      if (input.text !== undefined) updateValues.text = input.text;
      if (input.isAudio !== undefined) updateValues.is_audio = input.isAudio;
      if (input.audioBlobKey !== undefined)
        updateValues.audio_blob_key = input.audioBlobKey;

      const row = await db
        .updateTable("phone_greetings")
        .set(updateValues)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirst();

      if (!row) {
        throw new NotFoundError(`Greeting not found: ${id}`);
      }

      return toGreetingRecord(row);
    },

    async delete(id: string): Promise<void> {
      const result = await db
        .deleteFrom("phone_greetings")
        .where("id", "=", id)
        .executeTakeFirst();

      if (Number(result.numDeletedRows) === 0) {
        throw new NotFoundError(`Greeting not found: ${id}`);
      }
    },
  };
}
