/**
 * Phone greeting repository for IVR content.
 *
 * Each greeting is keyed by (phone_number, locale, greeting_type) where
 * phone_number is the E.164 org line that callers dial. Text greetings
 * are stored inline; audio greetings reference a BlobStore key.
 *
 * All queries go through a tenant-scoped Kysely instance. Schema
 * scoping is the caller's responsibility (pass tenantDb(orgSchema)).
 */

import type { Kysely, Selectable } from "kysely";
import type { TenantDatabase, PhoneGreetingsTable } from "../../db/types.js";
import { NotFoundError } from "../../errors.js";
import { ErrorCode } from "@care-y/shared";

export interface GreetingRecord {
  readonly id: string;
  readonly phoneNumber: string;
  readonly greetingType: string;
  readonly locale: string;
  readonly text: string;
  readonly isAudio: boolean;
  readonly audioBlobKey: string | null;
  readonly audioContentType: string | null;
}

export interface GreetingRepository {
  findById(id: string): Promise<GreetingRecord | null>;
  findByNumberAndLocaleAndType(
    phoneNumber: string,
    locale: string,
    greetingType: string,
  ): Promise<GreetingRecord | null>;
  listByNumber(phoneNumber: string): Promise<readonly GreetingRecord[]>;
  listAll(): Promise<readonly GreetingRecord[]>;
  create(input: {
    phoneNumber: string;
    greetingType: string;
    locale: string;
    text: string;
    isAudio?: boolean;
    audioBlobKey?: string | null;
    audioContentType?: string | null;
  }): Promise<GreetingRecord>;
  update(
    id: string,
    input: {
      phoneNumber?: string;
      text?: string;
      isAudio?: boolean;
      audioBlobKey?: string | null;
      audioContentType?: string | null;
    },
  ): Promise<GreetingRecord>;
  delete(id: string): Promise<void>;
}

function toGreetingRecord(
  row: Selectable<PhoneGreetingsTable>,
): GreetingRecord {
  return {
    id: row.id,
    phoneNumber: row.phone_number,
    greetingType: row.greeting_type,
    locale: row.locale,
    text: row.text,
    isAudio: row.is_audio,
    audioBlobKey: row.audio_blob_key,
    audioContentType: row.audio_content_type,
  };
}

export function createGreetingRepository(
  db: Kysely<TenantDatabase>,
): GreetingRepository {
  return {
    async findById(id: string): Promise<GreetingRecord | null> {
      const row = await db
        .selectFrom("phone_greetings")
        .selectAll()
        .where("id", "=", id)
        .executeTakeFirst();

      if (!row) return null;
      return toGreetingRecord(row);
    },

    async findByNumberAndLocaleAndType(
      phoneNumber: string,
      locale: string,
      greetingType: string,
    ): Promise<GreetingRecord | null> {
      const row = await db
        .selectFrom("phone_greetings")
        .selectAll()
        .where("phone_number", "=", phoneNumber)
        .where("locale", "=", locale)
        .where("greeting_type", "=", greetingType)
        .executeTakeFirst();

      if (!row) return null;
      return toGreetingRecord(row);
    },

    async listByNumber(
      phoneNumber: string,
    ): Promise<readonly GreetingRecord[]> {
      const rows = await db
        .selectFrom("phone_greetings")
        .selectAll()
        .where("phone_number", "=", phoneNumber)
        .execute();

      return rows.map(toGreetingRecord);
    },

    async listAll(): Promise<readonly GreetingRecord[]> {
      const rows = await db.selectFrom("phone_greetings").selectAll().execute();

      return rows.map(toGreetingRecord);
    },

    async create(input: {
      phoneNumber: string;
      greetingType: string;
      locale: string;
      text: string;
      isAudio?: boolean;
      audioBlobKey?: string | null;
      audioContentType?: string | null;
    }): Promise<GreetingRecord> {
      const row = await db
        .insertInto("phone_greetings")
        .values({
          phone_number: input.phoneNumber,
          greeting_type: input.greetingType,
          locale: input.locale,
          text: input.text,
          is_audio: input.isAudio ?? false,
          audio_blob_key: input.audioBlobKey ?? null,
          audio_content_type: input.audioContentType ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toGreetingRecord(row);
    },

    async update(
      id: string,
      input: {
        phoneNumber?: string;
        text?: string;
        isAudio?: boolean;
        audioBlobKey?: string | null;
        audioContentType?: string | null;
      },
    ): Promise<GreetingRecord> {
      const updateValues: Record<string, unknown> = {};
      if (input.phoneNumber !== undefined)
        updateValues.phone_number = input.phoneNumber;
      if (input.text !== undefined) updateValues.text = input.text;
      if (input.isAudio !== undefined) updateValues.is_audio = input.isAudio;
      if (input.audioBlobKey !== undefined)
        updateValues.audio_blob_key = input.audioBlobKey;
      if (input.audioContentType !== undefined)
        updateValues.audio_content_type = input.audioContentType;

      const row = await db
        .updateTable("phone_greetings")
        .set(updateValues)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirst();

      if (!row) {
        throw new NotFoundError(ErrorCode.GREETING_NOT_FOUND);
      }

      return toGreetingRecord(row);
    },

    async delete(id: string): Promise<void> {
      const result = await db
        .deleteFrom("phone_greetings")
        .where("id", "=", id)
        .executeTakeFirst();

      if (Number(result.numDeletedRows) === 0) {
        throw new NotFoundError(ErrorCode.GREETING_NOT_FOUND);
      }
    },
  };
}
