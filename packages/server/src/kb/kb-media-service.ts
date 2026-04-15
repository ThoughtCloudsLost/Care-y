/**
 * KB attachment service: CRUD for knowledge base file attachments.
 *
 * Simpler than ticket MediaService: no ticket access checker (KB articles
 * are org-wide, any volunteer can view), no followup FK, no recording
 * support. Encrypted blobs stored via BlobStore with "kb-attachment"
 * category. The server never decrypts attachment content.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { NotFoundError } from "../errors.js";
import { ErrorCode, KB_MAX_ATTACHMENTS_PER_ARTICLE } from "@care-y/shared";

export interface KBAttachmentRecord {
  readonly id: string;
  readonly itemId: string;
  readonly blobKey: string;
  readonly sizeBytes: number;
  readonly encryptedFilename: Buffer | null;
  readonly contentType: string | null;
  readonly createdAt: Date;
  readonly deletedAt: Date | null;
}

export interface KBMediaService {
  createAttachment(input: {
    itemId: string;
    blobKey: string;
    sizeBytes: number;
    encryptedFilename?: Buffer;
    contentType?: string;
  }): Promise<KBAttachmentRecord>;

  getAttachment(attachmentId: string): Promise<KBAttachmentRecord>;

  listAttachments(itemId: string): Promise<KBAttachmentRecord[]>;

  softDeleteAttachment(attachmentId: string): Promise<void>;
}

function toKBAttachmentRecord(row: {
  id: string;
  item_id: string;
  blob_key: string;
  size_bytes: number;
  encrypted_filename: Buffer | null;
  content_type: string | null;
  created_at: Date;
  deleted_at: Date | null;
}): KBAttachmentRecord {
  return {
    id: row.id,
    itemId: row.item_id,
    blobKey: row.blob_key,
    sizeBytes: row.size_bytes,
    encryptedFilename: row.encrypted_filename,
    contentType: row.content_type,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
  };
}

export function createKBMediaService(
  db: Kysely<TenantDatabase>,
): KBMediaService {
  return {
    async createAttachment(input) {
      const row = await db
        .insertInto("kb_attachments")
        .values({
          item_id: input.itemId,
          blob_key: input.blobKey,
          size_bytes: input.sizeBytes,
          encrypted_filename: input.encryptedFilename ?? null,
          content_type: input.contentType ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toKBAttachmentRecord(row);
    },

    async getAttachment(attachmentId) {
      const row = await db
        .selectFrom("kb_attachments")
        .selectAll()
        .where("id", "=", attachmentId)
        .where("deleted_at", "is", null)
        .executeTakeFirst();

      if (!row) {
        throw new NotFoundError(ErrorCode.KB_ATTACHMENT_NOT_FOUND);
      }

      return toKBAttachmentRecord(row);
    },

    async listAttachments(itemId) {
      const rows = await db
        .selectFrom("kb_attachments")
        .selectAll()
        .where("item_id", "=", itemId)
        .where("deleted_at", "is", null)
        .orderBy("created_at", "asc")
        .limit(KB_MAX_ATTACHMENTS_PER_ARTICLE)
        .execute();

      return rows.map(toKBAttachmentRecord);
    },

    async softDeleteAttachment(attachmentId) {
      const result = await db
        .updateTable("kb_attachments")
        .set({ deleted_at: new Date() })
        .where("id", "=", attachmentId)
        .where("deleted_at", "is", null)
        .executeTakeFirst();

      if (result.numUpdatedRows === 0n) {
        throw new NotFoundError(ErrorCode.KB_ATTACHMENT_NOT_FOUND);
      }
    },
  };
}
