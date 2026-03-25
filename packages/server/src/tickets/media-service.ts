/**
 * Media service: recording and attachment CRUD with retention cleanup.
 *
 * Encrypted blobs are stored via BlobStore (H-017). The server never
 * decrypts media content. Soft-delete sets deleted_at, follow-ups
 * show "attachment expired." Hard-delete removes blob + DB row.
 * Irreversible in an E2E encrypted system.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { BlobStore } from "../storage/store.js";
import type { TicketAccessChecker } from "./access.js";
import type { JobQueue } from "../jobs/queue.js";
import { NotFoundError } from "../errors.js";

export interface RecordingRecord {
  readonly id: string;
  readonly ticketId: string;
  readonly followupId: string | null;
  readonly blobKey: string;
  readonly sizeBytes: number;
  readonly durationSeconds: number | null;
  readonly createdAt: Date;
  readonly deletedAt: Date | null;
}

export interface AttachmentRecord {
  readonly id: string;
  readonly ticketId: string;
  readonly followupId: string | null;
  readonly blobKey: string;
  readonly sizeBytes: number;
  readonly encryptedFilename: Buffer | null;
  readonly contentType: string | null;
  readonly createdAt: Date;
  readonly deletedAt: Date | null;
}

export interface MediaService {
  createRecording(input: {
    ticketId: string;
    followupId?: string;
    blobKey: string;
    sizeBytes: number;
    durationSeconds?: number;
  }): Promise<RecordingRecord>;

  createAttachment(input: {
    ticketId: string;
    followupId?: string;
    blobKey: string;
    sizeBytes: number;
    encryptedFilename?: Buffer;
    contentType?: string;
  }): Promise<AttachmentRecord>;

  getRecording(userId: string, recordingId: string): Promise<RecordingRecord>;
  getAttachment(
    userId: string,
    attachmentId: string,
  ): Promise<AttachmentRecord>;

  softDeleteRecording(recordingId: string): Promise<void>;
  softDeleteAttachment(attachmentId: string): Promise<void>;

  hardDeleteRecording(recordingId: string): Promise<void>;
  hardDeleteAttachment(attachmentId: string): Promise<void>;

  listRecordings(userId: string, ticketId: string): Promise<RecordingRecord[]>;
  listAttachments(
    userId: string,
    ticketId: string,
  ): Promise<AttachmentRecord[]>;
}

function toRecordingRecord(row: {
  id: string;
  ticket_id: string;
  followup_id: string | null;
  blob_key: string;
  size_bytes: number;
  duration_seconds: number | null;
  created_at: Date;
  deleted_at: Date | null;
}): RecordingRecord {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    followupId: row.followup_id,
    blobKey: row.blob_key,
    sizeBytes: row.size_bytes,
    durationSeconds: row.duration_seconds,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
  };
}

function toAttachmentRecord(row: {
  id: string;
  ticket_id: string;
  followup_id: string | null;
  blob_key: string;
  size_bytes: number;
  encrypted_filename: Buffer | null;
  content_type: string | null;
  created_at: Date;
  deleted_at: Date | null;
}): AttachmentRecord {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    followupId: row.followup_id,
    blobKey: row.blob_key,
    sizeBytes: row.size_bytes,
    encryptedFilename: row.encrypted_filename,
    contentType: row.content_type,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
  };
}

export function createMediaService(
  db: Kysely<TenantDatabase>,
  blobStore: BlobStore,
  access: TicketAccessChecker,
): MediaService {
  return {
    async createRecording(input) {
      const row = await db
        .insertInto("recordings")
        .values({
          ticket_id: input.ticketId,
          followup_id: input.followupId ?? null,
          blob_key: input.blobKey,
          size_bytes: input.sizeBytes,
          duration_seconds: input.durationSeconds ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toRecordingRecord(row);
    },

    async createAttachment(input) {
      const row = await db
        .insertInto("attachments")
        .values({
          ticket_id: input.ticketId,
          followup_id: input.followupId ?? null,
          blob_key: input.blobKey,
          size_bytes: input.sizeBytes,
          encrypted_filename: input.encryptedFilename ?? null,
          content_type: input.contentType ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toAttachmentRecord(row);
    },

    async getRecording(userId, recordingId) {
      const row = await db
        .selectFrom("recordings")
        .selectAll()
        .where("id", "=", recordingId)
        .executeTakeFirst();

      if (!row) {
        throw new NotFoundError("Recording not found");
      }

      await access.assertAccess(userId, row.ticket_id);
      return toRecordingRecord(row);
    },

    async getAttachment(userId, attachmentId) {
      const row = await db
        .selectFrom("attachments")
        .selectAll()
        .where("id", "=", attachmentId)
        .executeTakeFirst();

      if (!row) {
        throw new NotFoundError("Attachment not found");
      }

      await access.assertAccess(userId, row.ticket_id);
      return toAttachmentRecord(row);
    },

    async softDeleteRecording(recordingId) {
      await db
        .updateTable("recordings")
        .set({ deleted_at: new Date() })
        .where("id", "=", recordingId)
        .execute();
    },

    async softDeleteAttachment(attachmentId) {
      await db
        .updateTable("attachments")
        .set({ deleted_at: new Date() })
        .where("id", "=", attachmentId)
        .execute();
    },

    async hardDeleteRecording(recordingId) {
      const row = await db
        .selectFrom("recordings")
        .select(["id", "blob_key"])
        .where("id", "=", recordingId)
        .executeTakeFirst();

      if (!row) return;

      // Delete blob first: orphaned blob is harmless, dangling DB row causes 404
      await blobStore.delete(row.blob_key);
      await db.deleteFrom("recordings").where("id", "=", row.id).execute();
    },

    async hardDeleteAttachment(attachmentId) {
      const row = await db
        .selectFrom("attachments")
        .select(["id", "blob_key"])
        .where("id", "=", attachmentId)
        .executeTakeFirst();

      if (!row) return;

      // Delete blob first: orphaned blob is harmless, dangling DB row causes 404
      await blobStore.delete(row.blob_key);
      await db.deleteFrom("attachments").where("id", "=", row.id).execute();
    },

    async listRecordings(userId, ticketId) {
      await access.assertAccess(userId, ticketId);

      const rows = await db
        .selectFrom("recordings")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .where("deleted_at", "is", null)
        .orderBy("created_at", "asc")
        .execute();

      return rows.map(toRecordingRecord);
    },

    async listAttachments(userId, ticketId) {
      await access.assertAccess(userId, ticketId);

      const rows = await db
        .selectFrom("attachments")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .where("deleted_at", "is", null)
        .orderBy("created_at", "asc")
        .execute();

      return rows.map(toAttachmentRecord);
    },
  };
}

/** Soft-deletes rows in a media table where created_at is older than the cutoff. */
async function softDeleteExpiredMedia(
  tDb: Kysely<TenantDatabase>,
  table: "recordings" | "attachments",
  cutoff: Date,
): Promise<void> {
  await tDb
    .updateTable(table)
    .set({ deleted_at: new Date() })
    .where("created_at", "<", cutoff)
    .where("deleted_at", "is", null)
    .execute();
}

/** Hard-deletes soft-deleted rows past the purge threshold. Deletes blob first for safety. */
async function purgeDeletedMedia(
  tDb: Kysely<TenantDatabase>,
  table: "recordings" | "attachments",
  cutoff: Date,
  blobStore: BlobStore,
): Promise<void> {
  const expired = await tDb
    .selectFrom(table)
    .select(["id", "blob_key"])
    .where("deleted_at", "<", cutoff)
    .execute();

  for (const row of expired) {
    await blobStore.delete(row.blob_key);
    await tDb.deleteFrom(table).where("id", "=", row.id).execute();
  }
}

export function registerMediaCleanupHandler(
  jobQueue: JobQueue,
  getTenantDb: (orgSchema: string) => Kysely<TenantDatabase>,
  blobStore: BlobStore,
  listOrgSchemas: () => Promise<string[]>,
): void {
  jobQueue.process("media-cleanup", async () => {
    const schemas = await listOrgSchemas();

    for (const schema of schemas) {
      const tDb = getTenantDb(schema);

      const config = await tDb
        .selectFrom("org_config")
        .select(["media_retention_days", "media_purge_days"])
        .executeTakeFirst();

      if (!config) continue;

      const retentionCutoff = new Date(
        Date.now() - config.media_retention_days * 24 * 60 * 60 * 1000,
      );
      const purgeCutoff = new Date(
        Date.now() - config.media_purge_days * 24 * 60 * 60 * 1000,
      );

      await softDeleteExpiredMedia(tDb, "recordings", retentionCutoff);
      await softDeleteExpiredMedia(tDb, "attachments", retentionCutoff);
      await purgeDeletedMedia(tDb, "recordings", purgeCutoff, blobStore);
      await purgeDeletedMedia(tDb, "attachments", purgeCutoff, blobStore);
    }
  });
}
