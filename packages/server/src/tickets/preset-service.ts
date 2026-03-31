/**
 * Preset reply CRUD service.
 *
 * Preset replies are org-authored response templates encrypted with the
 * org key. Admin/Manager creates, volunteers read. Content is decrypted
 * client-side only.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { NotFoundError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";

export interface PresetReplyRecord {
  readonly id: string;
  readonly encryptedTitle: Buffer;
  readonly encryptedBody: Buffer;
  readonly queueId: string | null;
  readonly createdBy: string;
  readonly createdAt: Date;
}

export interface PresetService {
  create(input: {
    encryptedTitle: Buffer;
    encryptedBody: Buffer;
    queueId: string | null;
    createdBy: string;
  }): Promise<PresetReplyRecord>;

  list(queueId?: string): Promise<PresetReplyRecord[]>;

  update(
    presetId: string,
    input: {
      encryptedTitle?: Buffer;
      encryptedBody?: Buffer;
      queueId?: string | null;
    },
  ): Promise<PresetReplyRecord>;

  delete(presetId: string): Promise<void>;
}

function toRecord(row: {
  id: string;
  encrypted_title: Buffer;
  encrypted_body: Buffer;
  queue_id: string | null;
  created_by: string;
  created_at: Date;
}): PresetReplyRecord {
  return {
    id: row.id,
    encryptedTitle: row.encrypted_title,
    encryptedBody: row.encrypted_body,
    queueId: row.queue_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

export function createPresetService(db: Kysely<TenantDatabase>): PresetService {
  return {
    async create(input) {
      const row = await db
        .insertInto("preset_replies")
        .values({
          encrypted_title: input.encryptedTitle,
          encrypted_body: input.encryptedBody,
          queue_id: input.queueId,
          created_by: input.createdBy,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toRecord(row);
    },

    async list(queueId) {
      let query = db.selectFrom("preset_replies").selectAll();

      if (queueId !== undefined) {
        // Return queue-specific + global (null queue_id)
        query = query.where((eb) =>
          eb.or([eb("queue_id", "=", queueId), eb("queue_id", "is", null)]),
        );
      }

      const rows = await query.orderBy("created_at", "asc").execute();
      return rows.map(toRecord);
    },

    async update(presetId, input) {
      const updates: Record<string, unknown> = {};
      if (input.encryptedTitle !== undefined)
        updates.encrypted_title = input.encryptedTitle;
      if (input.encryptedBody !== undefined)
        updates.encrypted_body = input.encryptedBody;
      if (input.queueId !== undefined) updates.queue_id = input.queueId;

      if (Object.keys(updates).length === 0) {
        const existing = await db
          .selectFrom("preset_replies")
          .selectAll()
          .where("id", "=", presetId)
          .executeTakeFirst();
        if (!existing)
          throw new NotFoundError(ErrorCode.PRESET_REPLY_NOT_FOUND);
        return toRecord(existing);
      }

      const row = await db
        .updateTable("preset_replies")
        .set(updates)
        .where("id", "=", presetId)
        .returningAll()
        .executeTakeFirst();

      if (!row) throw new NotFoundError(ErrorCode.PRESET_REPLY_NOT_FOUND);
      return toRecord(row);
    },

    async delete(presetId) {
      const result = await db
        .deleteFrom("preset_replies")
        .where("id", "=", presetId)
        .executeTakeFirst();

      if (result.numDeletedRows === 0n) {
        throw new NotFoundError(ErrorCode.PRESET_REPLY_NOT_FOUND);
      }
    },
  };
}
