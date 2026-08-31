/**
 * Portal attachment service.
 *
 * Validates, stores, and retrieves portal-tier file attachments. Each
 * attachment is encrypted once under a random file key. That key is
 * wrapped under the follow-up's key for the org side (attachments.file_key_wrap)
 * and sealed to portal_channels.client_public for the client side
 * (portal_attachments). The server never decrypts anything here; every
 * ciphertext field is opaque passthrough.
 *
 * See ADR-089 for the envelope design.
 */

import type { Kysely, Transaction } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { BlobStore } from "../storage/store.js";
import type {
  AttachmentId,
  TicketId,
  FollowupId,
  ChannelRowId,
  OrgSchema,
  BlobKey,
} from "@care-y/shared";
import {
  PORTAL_ATTACHMENT_MAX_BYTES,
  PORTAL_ALLOWED_CONTENT_TYPES,
} from "@care-y/shared";
import { ValidationError, AttachmentValidationError } from "../errors.js";
import { encode } from "@care-y/crypto";

// Inline rather than importing from portal-message-service to avoid a
// circular module dependency (the message service imports from here).
interface EciesTripleBuffers {
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly ciphertext: Buffer;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALLOWED_CONTENT_TYPES: ReadonlySet<string> = new Set<string>(
  PORTAL_ALLOWED_CONTENT_TYPES,
);

const BLOB_CATEGORY = "attachment" as const;

// ---------------------------------------------------------------------------
// Input / output types
// ---------------------------------------------------------------------------

export interface PreparedAttachment {
  readonly attachmentId: AttachmentId;
  readonly ticketId: TicketId;
  readonly blobKey: BlobKey;
  readonly sizeBytes: number;
  readonly contentType: string;
  readonly fileKeyWrap: Buffer;
  readonly encryptedFilename: Buffer;
}

export interface AttachmentInput {
  readonly attachmentId: AttachmentId;
  readonly ticketId: TicketId;
  readonly blob: Buffer;
  readonly declaredSize: number;
  readonly contentType: string;
  readonly fileKeyWrap: Buffer;
  readonly encryptedFilename: Buffer;
}

export interface PortalAttachmentWire {
  readonly attachmentId: string;
  readonly followupId: string;
  readonly direction: string;
  readonly sizeBytes: number;
  readonly contentType: string | null;
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly ciphertext: string;
  readonly createdAt: string;
}

// ---------------------------------------------------------------------------
// prepareAttachment
// ---------------------------------------------------------------------------

/**
 * Validate an upload and put its ciphertext in the blob store. Does not
 * touch the database, so the caller can insert the row inside whatever
 * transaction it already owns.
 */
export async function prepareAttachment(
  blobStore: BlobStore,
  orgSchema: OrgSchema,
  input: AttachmentInput,
): Promise<PreparedAttachment> {
  // 1. Size cap
  if (input.blob.byteLength > PORTAL_ATTACHMENT_MAX_BYTES) {
    throw new ValidationError(
      `Attachment exceeds ${String(PORTAL_ATTACHMENT_MAX_BYTES)} byte limit`,
    );
  }

  // 2. Declared size must match actual blob length
  if (input.declaredSize !== input.blob.byteLength) {
    throw new ValidationError(
      `Declared size ${String(input.declaredSize)} does not match actual blob size ${String(input.blob.byteLength)}`,
    );
  }

  // 3. Content type allowlist
  const normalizedType = (input.contentType.split(";")[0] ?? "")
    .trim()
    .toLowerCase();
  if (!ALLOWED_CONTENT_TYPES.has(normalizedType)) {
    throw new AttachmentValidationError(
      `Content type "${normalizedType}" is not allowed`,
      "content_type",
    );
  }

  // No magic byte check. The blob is ciphertext, so it carries no file
  // signature, and a server holding ciphertext cannot verify what a file
  // actually is. The same constraint applies to form-asset uploads
  // (form-asset-service.ts) and was the reason the KB route's magic byte
  // check was removed: it rejected every real upload because encrypted
  // bytes never match a plaintext signature.

  const blobKey = await blobStore.put(orgSchema, BLOB_CATEGORY, input.blob);

  return {
    attachmentId: input.attachmentId,
    ticketId: input.ticketId,
    blobKey,
    sizeBytes: input.blob.byteLength,
    contentType: normalizedType,
    fileKeyWrap: input.fileKeyWrap,
    encryptedFilename: input.encryptedFilename,
  };
}

// ---------------------------------------------------------------------------
// insertAttachmentRow
// ---------------------------------------------------------------------------

/** Insert the attachments row. followupId null means the upload is not yet sent. */
export async function insertAttachmentRow(
  trx: Kysely<TenantDatabase> | Transaction<TenantDatabase>,
  prepared: PreparedAttachment,
  followupId: FollowupId | null,
): Promise<void> {
  await trx
    .insertInto("attachments")
    .values({
      id: prepared.attachmentId,
      ticket_id: prepared.ticketId,
      followup_id: followupId,
      blob_key: prepared.blobKey,
      size_bytes: prepared.sizeBytes,
      content_type: prepared.contentType,
      encrypted_filename: prepared.encryptedFilename,
      file_key_wrap: prepared.fileKeyWrap,
    })
    .execute();
}

// ---------------------------------------------------------------------------
// storeAttachment
// ---------------------------------------------------------------------------

/**
 * Validate an upload, store its bytes, and record the row, leaving it with
 * no follow-up until a message claims it.
 *
 * The blob goes in before the row and comes back out if the row fails,
 * because bytes nothing points at are invisible and accumulate. The
 * reverse order would be worse: a row whose blob never arrived answers a
 * download with a 404 forever.
 */
export async function storeAttachment(
  db: Kysely<TenantDatabase>,
  blobStore: BlobStore,
  orgSchema: OrgSchema,
  input: AttachmentInput,
): Promise<AttachmentId> {
  const prepared = await prepareAttachment(blobStore, orgSchema, input);

  try {
    await insertAttachmentRow(db, prepared, null);
  } catch (err: unknown) {
    await blobStore.delete(prepared.blobKey).catch((_: unknown) => {
      // Intentional: an orphaned blob is harmless next to the throw
    });
    throw err;
  }

  return prepared.attachmentId;
}

// ---------------------------------------------------------------------------
// attachToFollowUp
// ---------------------------------------------------------------------------

/** Tie an already-uploaded attachment to the follow-up that carries it. */
export async function attachToFollowUp(
  trx: Kysely<TenantDatabase> | Transaction<TenantDatabase>,
  attachmentId: AttachmentId,
  ticketId: TicketId,
  followupId: FollowupId,
): Promise<boolean> {
  const result = await trx
    .updateTable("attachments")
    .set({ followup_id: followupId })
    .where("id", "=", attachmentId)
    .where("ticket_id", "=", ticketId)
    .where("followup_id", "is", null)
    .executeTakeFirst();

  return result.numUpdatedRows > 0n;
}

// ---------------------------------------------------------------------------
// insertClientWrap
// ---------------------------------------------------------------------------

export interface InsertClientWrapOpts {
  /** Stamp the row's created_at explicitly (reseed uses the followup's timestamp). */
  readonly createdAt?: Date;
  /** Add ON CONFLICT DO NOTHING on the per-channel unique index columns. */
  readonly onConflictIgnore?: boolean;
}

/**
 * Write the client's wrap of the file key for one channel. Returns
 * whether a row was written; false only when onConflictIgnore
 * suppressed a duplicate.
 */
export async function insertClientWrap(
  trx: Kysely<TenantDatabase> | Transaction<TenantDatabase>,
  args: {
    attachmentId: AttachmentId;
    channelRowId: ChannelRowId;
    followupId: FollowupId;
    direction: "to_client" | "from_client";
    copy: EciesTripleBuffers;
  },
  opts?: InsertClientWrapOpts,
): Promise<boolean> {
  let query = trx.insertInto("portal_attachments").values({
    attachment_id: args.attachmentId,
    channel_id: args.channelRowId,
    followup_id: args.followupId,
    direction: args.direction,
    ephemeral_point: args.copy.ephemeralPoint,
    nonce: args.copy.nonce,
    ciphertext: args.copy.ciphertext,
    ...(opts?.createdAt !== undefined ? { created_at: opts.createdAt } : {}),
  });

  if (opts?.onConflictIgnore === true) {
    query = query.onConflict((oc) =>
      oc.columns(["channel_id", "attachment_id"]).doNothing(),
    );
  }

  const result = await query.executeTakeFirst();
  return Number(result.numInsertedOrUpdatedRows ?? 0n) > 0;
}

// ---------------------------------------------------------------------------
// listChannelAttachments
// ---------------------------------------------------------------------------

/** Every file this channel may open, oldest first. */
export async function listChannelAttachments(
  db: Kysely<TenantDatabase>,
  channelRowId: ChannelRowId,
): Promise<PortalAttachmentWire[]> {
  const rows = await db
    .selectFrom("portal_attachments as pa")
    .innerJoin("attachments as a", "a.id", "pa.attachment_id")
    .select([
      "pa.attachment_id",
      "pa.followup_id",
      "pa.direction",
      "a.size_bytes",
      "a.content_type",
      "pa.ephemeral_point",
      "pa.nonce",
      "pa.ciphertext",
      "pa.created_at",
    ])
    .where("pa.channel_id", "=", channelRowId)
    .where("a.deleted_at", "is", null)
    .orderBy("pa.created_at", "asc")
    .orderBy("pa.id", "asc")
    .execute();

  return rows.map((r) => ({
    attachmentId: r.attachment_id,
    followupId: r.followup_id,
    direction: r.direction,
    sizeBytes: r.size_bytes,
    contentType: r.content_type,
    ephemeralPoint: encode(new Uint8Array(r.ephemeral_point)),
    nonce: encode(new Uint8Array(r.nonce)),
    ciphertext: encode(new Uint8Array(r.ciphertext)),
    createdAt: r.created_at.toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// resolveChannelBlobKey
// ---------------------------------------------------------------------------

/**
 * Blob key for a download, scoped to the channel that authenticated.
 * Null when no wrap ties the file to this channel or the attachment is
 * soft-deleted. An attachment id on its own proves nothing.
 */
export async function resolveChannelBlobKey(
  db: Kysely<TenantDatabase>,
  channelRowId: ChannelRowId,
  attachmentId: AttachmentId,
): Promise<BlobKey | null> {
  const row = await db
    .selectFrom("portal_attachments as pa")
    .innerJoin("attachments as a", "a.id", "pa.attachment_id")
    .select("a.blob_key")
    .where("pa.channel_id", "=", channelRowId)
    .where("pa.attachment_id", "=", attachmentId)
    .where("a.deleted_at", "is", null)
    .executeTakeFirst();

  return row?.blob_key ?? null;
}

// ---------------------------------------------------------------------------
// purgeChannelAttachments
// ---------------------------------------------------------------------------

/** Drop a channel's wraps when its copies expire. Blob and org row stay. */
export async function purgeChannelAttachments(
  trx: Kysely<TenantDatabase> | Transaction<TenantDatabase>,
  channelRowId: ChannelRowId,
): Promise<void> {
  await trx
    .deleteFrom("portal_attachments")
    .where("channel_id", "=", channelRowId)
    .execute();
}

// ---------------------------------------------------------------------------
// purgeUnlinkedAttachments
// ---------------------------------------------------------------------------

/**
 * Delete attachments still carrying no follow-up past the cutoff, blob
 * first. An upload the sender abandoned otherwise keeps its bytes forever.
 * Returns how many were removed.
 */
export async function purgeUnlinkedAttachments(
  db: Kysely<TenantDatabase>,
  blobStore: BlobStore,
  cutoff: Date,
): Promise<number> {
  const rows = await db
    .selectFrom("attachments")
    .select(["id", "blob_key"])
    .where("followup_id", "is", null)
    .where("created_at", "<", cutoff)
    .execute();

  for (const row of rows) {
    await blobStore.delete(row.blob_key);
    await db.deleteFrom("attachments").where("id", "=", row.id).execute();
  }

  return rows.length;
}
