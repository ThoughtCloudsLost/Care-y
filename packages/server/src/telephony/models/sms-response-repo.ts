/**
 * SMS auto-reply response repository.
 *
 * Stores canned text responses keyed by (locale, response_type).
 * The findWithFallback method supports locale fallback: it queries
 * for both the requested locale and the default locale in one round
 * trip, preferring the exact match via ORDER BY CASE.
 *
 * All queries go through a tenant-scoped Kysely instance. Schema
 * scoping is the caller's responsibility (pass tenantDb(orgSchema)).
 */

import type { Kysely, Selectable } from "kysely";
import type { TenantDatabase, SmsResponsesTable } from "../../db/types.js";
import { NotFoundError } from "../../errors.js";
import { ErrorCode } from "@care-y/shared";

export interface SmsResponseRecord {
  readonly id: string;
  readonly responseType: string;
  readonly locale: string;
  readonly text: string;
}

export interface SmsResponseRepository {
  findByLocaleAndType(
    locale: string,
    responseType: string,
  ): Promise<SmsResponseRecord | null>;
  findWithFallback(
    locale: string,
    responseType: string,
    defaultLocale: string,
  ): Promise<SmsResponseRecord | null>;
  list(locale?: string): Promise<readonly SmsResponseRecord[]>;
  create(input: {
    responseType: string;
    locale: string;
    text: string;
  }): Promise<SmsResponseRecord>;
  update(id: string, input: { text?: string }): Promise<SmsResponseRecord>;
  delete(id: string): Promise<void>;
}

function toSmsResponseRecord(
  row: Selectable<SmsResponsesTable>,
): SmsResponseRecord {
  return {
    id: row.id,
    responseType: row.response_type,
    locale: row.locale,
    text: row.text,
  };
}

export function createSmsResponseRepository(
  db: Kysely<TenantDatabase>,
): SmsResponseRepository {
  return {
    async findByLocaleAndType(
      locale: string,
      responseType: string,
    ): Promise<SmsResponseRecord | null> {
      const row = await db
        .selectFrom("sms_responses")
        .selectAll()
        .where("locale", "=", locale)
        .where("response_type", "=", responseType)
        .executeTakeFirst();

      if (!row) return null;
      return toSmsResponseRecord(row);
    },

    async findWithFallback(
      locale: string,
      responseType: string,
      defaultLocale: string,
    ): Promise<SmsResponseRecord | null> {
      const row = await db
        .selectFrom("sms_responses")
        .selectAll()
        .where("response_type", "=", responseType)
        .where("locale", "in", [locale, defaultLocale])
        .orderBy((eb) =>
          eb.case().when("locale", "=", locale).then(0).else(1).end(),
        )
        .limit(1)
        .executeTakeFirst();

      if (!row) return null;
      return toSmsResponseRecord(row);
    },

    async list(locale?: string): Promise<readonly SmsResponseRecord[]> {
      let query = db.selectFrom("sms_responses").selectAll();

      if (locale !== undefined) {
        query = query.where("locale", "=", locale);
      }

      const rows = await query.execute();
      return rows.map(toSmsResponseRecord);
    },

    async create(input: {
      responseType: string;
      locale: string;
      text: string;
    }): Promise<SmsResponseRecord> {
      const row = await db
        .insertInto("sms_responses")
        .values({
          response_type: input.responseType,
          locale: input.locale,
          text: input.text,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toSmsResponseRecord(row);
    },

    async update(
      id: string,
      input: { text?: string },
    ): Promise<SmsResponseRecord> {
      const updateValues: Record<string, unknown> = {};
      if (input.text !== undefined) updateValues.text = input.text;

      const row = await db
        .updateTable("sms_responses")
        .set(updateValues)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirst();

      if (!row) {
        throw new NotFoundError(ErrorCode.SMS_RESPONSE_NOT_FOUND);
      }

      return toSmsResponseRecord(row);
    },

    async delete(id: string): Promise<void> {
      const result = await db
        .deleteFrom("sms_responses")
        .where("id", "=", id)
        .executeTakeFirst();

      if (Number(result.numDeletedRows) === 0) {
        throw new NotFoundError(ErrorCode.SMS_RESPONSE_NOT_FOUND);
      }
    },
  };
}
