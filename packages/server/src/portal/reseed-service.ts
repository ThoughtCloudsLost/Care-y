/**
 * Portal thread reseed service.
 *
 * When a volunteer regenerates a portal channel, the browser re-seals
 * the conversation history under the new channel's public key and
 * sends it here in chunks. The server validates structure, stamps
 * ordering/authorship from the canonical followup rows, and inserts
 * portal carrier rows idempotently.
 *
 * This module never decrypts any ciphertext; every field is opaque
 * passthrough.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { TicketAccessChecker } from "../tickets/access.js";
import type { BlobStore, BlobCategory } from "../storage/store.js";
import {
  attachmentIdSchema,
  recordingIdSchema,
  type ClientId,
  type UserId,
  type FollowupId,
  type TicketId,
  type AttachmentId,
  type RecordingId,
  type OrgSchema,
} from "@care-y/shared";
import { encode } from "@care-y/crypto";
import { findActiveChannel } from "./channel-service.js";
import {
  PortalChannelMismatchError,
  ReseedValidationError,
  ReseedAlreadyConvertedError,
  ReseedRowNotFoundError,
} from "./portal-errors.js";
import type { EciesTripleBuffers } from "./portal-message-service.js";
import { insertClientWrap } from "./portal-attachment-service.js";
import { insertClientRecordingWrap } from "./portal-recording-service.js";

// ---------------------------------------------------------------------------
// Input types (Buffer-decoded by the router before calling these)
// ---------------------------------------------------------------------------

export interface ReseedMessageItem {
  readonly followupId: FollowupId;
  readonly copy: EciesTripleBuffers;
}

export interface ReseedAttachmentWrapItem {
  readonly attachmentId: AttachmentId;
  readonly followupId: FollowupId;
  readonly copy: EciesTripleBuffers;
}

export interface ReseedRecordingWrapItem {
  readonly recordingId: RecordingId;
  readonly followupId: FollowupId;
  readonly copy: EciesTripleBuffers;
}

export interface ReseedPortalHistoryInput {
  readonly clientId: ClientId;
  readonly channelId: string;
  readonly messages: readonly ReseedMessageItem[];
  readonly attachmentWraps: readonly ReseedAttachmentWrapItem[];
  readonly recordingWraps: readonly ReseedRecordingWrapItem[];
}

export interface ReseedPortalHistoryResult {
  readonly inserted: number;
  readonly skipped: number;
}

export interface ConvertBlobForReseedInput {
  readonly clientId: ClientId;
  readonly channelId: string;
  readonly kind: "attachment" | "recording";
  readonly rowId: string;
  readonly followupId: FollowupId;
  readonly encryptedData: Buffer;
  readonly fileKeyWrap: Buffer;
  readonly copy: EciesTripleBuffers;
}

export interface ConvertBlobForReseedResult {
  readonly inserted: boolean;
}

// ---------------------------------------------------------------------------
// Followup types eligible for message copies
// ---------------------------------------------------------------------------

/**
 * Only text-bearing followup types get portal message copies. Must stay
 * in step with ELIGIBLE_TYPES in the client reseed composable.
 * email_outbound and email_inbound are included because the live paths
 * store portal copies for outbound org emails and inbound client replies;
 * recovered history should match.
 */
const MESSAGE_COPY_TYPES = new Set([
  "message",
  "sms_outbound",
  "sms_inbound",
  "email_outbound",
  "email_inbound",
]);

// ---------------------------------------------------------------------------
// reseedPortalHistory
// ---------------------------------------------------------------------------

export async function reseedPortalHistory(
  db: Kysely<TenantDatabase>,
  access: TicketAccessChecker,
  userId: UserId,
  input: ReseedPortalHistoryInput,
): Promise<ReseedPortalHistoryResult> {
  // Collect all distinct followupIds for bulk validation
  const allFollowupIds = new Set<FollowupId>();
  for (const m of input.messages) allFollowupIds.add(m.followupId);
  for (const a of input.attachmentWraps) allFollowupIds.add(a.followupId);
  for (const r of input.recordingWraps) allFollowupIds.add(r.followupId);

  const requested =
    input.messages.length +
    input.attachmentWraps.length +
    input.recordingWraps.length;

  let totalInserted = 0;

  await db.transaction().execute(async (trx) => {
    // 1. Channel validation
    const channel = await findActiveChannel(trx, input.clientId);
    if (channel === undefined) {
      throw new PortalChannelMismatchError();
    }
    if (channel.channel_id !== input.channelId) {
      throw new PortalChannelMismatchError();
    }

    // 2. Load all referenced followups joined to their tickets
    const followupIds = [...allFollowupIds];
    if (followupIds.length === 0) {
      throw new ReseedValidationError("No followup IDs referenced");
    }

    const followupRows = await trx
      .selectFrom("followups as f")
      .innerJoin("tickets as t", "t.id", "f.ticket_id")
      .select([
        "f.id",
        "f.ticket_id",
        "f.type",
        "f.source",
        "f.is_private",
        "f.deleted_at",
        "f.created_at",
        "t.client_id",
      ])
      .where("f.id", "in", followupIds)
      .execute();

    // Build a map for quick lookup
    const followupMap = new Map(followupRows.map((r) => [r.id, r]));

    // Verify every referenced followupId exists and belongs to this client
    for (const fuId of followupIds) {
      const fu = followupMap.get(fuId);
      if (!fu) {
        throw new ReseedValidationError(`Followup ${fuId} not found`);
      }
      if (fu.client_id !== input.clientId) {
        throw new ReseedValidationError(
          `Followup ${fuId} does not belong to this client`,
        );
      }
      if (fu.is_private) {
        throw new ReseedValidationError(`Followup ${fuId} is private`);
      }
      if (fu.deleted_at !== null) {
        throw new ReseedValidationError(`Followup ${fuId} is deleted`);
      }
    }

    // Validate message-specific type constraint
    for (const m of input.messages) {
      const fu = followupMap.get(m.followupId);
      if (!fu) continue; // already validated above
      if (!MESSAGE_COPY_TYPES.has(fu.type)) {
        throw new ReseedValidationError(
          `Followup ${m.followupId} type "${fu.type}" is not eligible for message copies`,
        );
      }
    }

    // Validate attachment/recording parent followup: must not be internal_note
    for (const a of input.attachmentWraps) {
      const fu = followupMap.get(a.followupId);
      if (!fu) continue;
      if (fu.type === "internal_note") {
        throw new ReseedValidationError(
          `Followup ${a.followupId} is an internal note; attachment wraps not allowed`,
        );
      }
    }
    for (const r of input.recordingWraps) {
      const fu = followupMap.get(r.followupId);
      if (!fu) continue;
      if (fu.type === "internal_note") {
        throw new ReseedValidationError(
          `Followup ${r.followupId} is an internal note; recording wraps not allowed`,
        );
      }
    }

    // Validate attachment rows exist, are non-deleted, and followup_id matches
    if (input.attachmentWraps.length > 0) {
      const attIds = input.attachmentWraps.map((a) => a.attachmentId);
      const attRows = await trx
        .selectFrom("attachments")
        .select(["id", "followup_id", "deleted_at"])
        .where("id", "in", attIds)
        .execute();
      const attMap = new Map(attRows.map((r) => [r.id, r]));

      for (const a of input.attachmentWraps) {
        const row = attMap.get(a.attachmentId);
        if (!row) {
          throw new ReseedValidationError(
            `Attachment ${a.attachmentId} not found`,
          );
        }
        if (row.deleted_at !== null) {
          throw new ReseedValidationError(
            `Attachment ${a.attachmentId} is deleted`,
          );
        }
        if (row.followup_id !== a.followupId) {
          throw new ReseedValidationError(
            `Attachment ${a.attachmentId} followup_id mismatch`,
          );
        }
      }
    }

    // Validate recording rows exist, are non-deleted, and followup_id matches
    if (input.recordingWraps.length > 0) {
      const recIds = input.recordingWraps.map((r) => r.recordingId);
      const recRows = await trx
        .selectFrom("recordings")
        .select(["id", "followup_id", "deleted_at"])
        .where("id", "in", recIds)
        .execute();
      const recMap = new Map(recRows.map((r) => [r.id, r]));

      for (const r of input.recordingWraps) {
        const row = recMap.get(r.recordingId);
        if (!row) {
          throw new ReseedValidationError(
            `Recording ${r.recordingId} not found`,
          );
        }
        if (row.deleted_at !== null) {
          throw new ReseedValidationError(
            `Recording ${r.recordingId} is deleted`,
          );
        }
        if (row.followup_id !== r.followupId) {
          throw new ReseedValidationError(
            `Recording ${r.recordingId} followup_id mismatch`,
          );
        }
      }
    }

    // Per-ticket access check (distinct tickets only)
    const ticketIds = new Set<TicketId>();
    for (const fu of followupRows) ticketIds.add(fu.ticket_id);
    for (const tid of ticketIds) {
      await access.assertAccess(userId, tid);
    }

    // 3. Insert portal_messages with onConflict doNothing
    if (input.messages.length > 0) {
      const messageValues = input.messages.map((m) => {
        const fu = followupMap.get(m.followupId);
        if (fu === undefined) {
          throw new ReseedValidationError(
            `Followup ${m.followupId} not found in validated set`,
          );
        }
        const direction: "from_client" | "to_client" =
          fu.source === "client" ? "from_client" : "to_client";
        return {
          channel_id: channel.id,
          followup_id: m.followupId,
          direction,
          ephemeral_point: m.copy.ephemeralPoint,
          nonce: m.copy.nonce,
          ciphertext: m.copy.ciphertext,
          created_at: fu.created_at,
        };
      });

      const msgResult = await trx
        .insertInto("portal_messages")
        .values(messageValues)
        .onConflict((oc) =>
          oc.columns(["channel_id", "followup_id"]).doNothing(),
        )
        .execute();

      // numInsertedOrUpdatedRows is present on InsertResult
      const insertedCount =
        msgResult.length > 0 && msgResult[0] !== undefined
          ? Number(msgResult[0].numInsertedOrUpdatedRows)
          : 0;
      totalInserted += insertedCount;
    }

    // 4. Insert portal_attachments via the extended writer
    for (const a of input.attachmentWraps) {
      const fu = followupMap.get(a.followupId);
      if (fu === undefined) {
        throw new ReseedValidationError(
          `Followup ${a.followupId} not found in validated set`,
        );
      }
      const direction: "from_client" | "to_client" =
        fu.source === "client" ? "from_client" : "to_client";
      const wrote = await insertClientWrap(
        trx,
        {
          attachmentId: a.attachmentId,
          channelRowId: channel.id,
          followupId: a.followupId,
          direction,
          copy: a.copy,
        },
        { createdAt: fu.created_at, onConflictIgnore: true },
      );
      if (wrote) totalInserted++;
    }

    // 5. Insert portal_recordings via the extended writer
    for (const r of input.recordingWraps) {
      const fu = followupMap.get(r.followupId);
      if (fu === undefined) {
        throw new ReseedValidationError(
          `Followup ${r.followupId} not found in validated set`,
        );
      }
      const direction: "from_client" | "to_client" =
        fu.source === "client" ? "from_client" : "to_client";
      const wrote = await insertClientRecordingWrap(
        trx,
        {
          recordingId: r.recordingId,
          channelRowId: channel.id,
          followupId: r.followupId,
          direction,
          copy: r.copy,
        },
        { createdAt: fu.created_at, onConflictIgnore: true },
      );
      if (wrote) totalInserted++;
    }
  });

  return {
    inserted: totalInserted,
    skipped: requested - totalInserted,
  };
}

// ---------------------------------------------------------------------------
// convertBlobForReseed
// ---------------------------------------------------------------------------

export async function convertBlobForReseed(
  db: Kysely<TenantDatabase>,
  access: TicketAccessChecker,
  userId: UserId,
  input: ConvertBlobForReseedInput,
  blobStore: BlobStore,
  orgSchema: OrgSchema,
): Promise<ConvertBlobForReseedResult> {
  // 1. Channel validation
  const channel = await findActiveChannel(db, input.clientId);
  if (channel === undefined) {
    throw new PortalChannelMismatchError();
  }
  if (channel.channel_id !== input.channelId) {
    throw new PortalChannelMismatchError();
  }

  const category: BlobCategory =
    input.kind === "attachment" ? "attachment" : "recording";

  if (input.kind === "attachment") {
    const attId = attachmentIdSchema.parse(input.rowId);

    // Load the attachment row
    const att = await db
      .selectFrom("attachments")
      .select([
        "id",
        "ticket_id",
        "followup_id",
        "blob_key",
        "file_key_wrap",
        "deleted_at",
      ])
      .where("id", "=", attId)
      .executeTakeFirst();

    if (att === undefined) {
      throw new ReseedRowNotFoundError("attachment");
    }
    if (att.deleted_at !== null) {
      throw new ReseedRowNotFoundError("attachment");
    }
    if (att.followup_id !== input.followupId) {
      throw new ReseedValidationError(
        `Attachment ${attId} followup_id mismatch`,
      );
    }
    if (att.file_key_wrap !== null) {
      throw new ReseedAlreadyConvertedError();
    }

    // Load the parent followup for access + direction
    const fu = await db
      .selectFrom("followups as f")
      .innerJoin("tickets as t", "t.id", "f.ticket_id")
      .select(["f.id", "f.source", "f.created_at", "t.client_id"])
      .where("f.id", "=", input.followupId)
      .executeTakeFirst();

    if (fu === undefined) {
      throw new ReseedValidationError(
        "Parent followup not found or wrong client",
      );
    }
    if (fu.client_id !== input.clientId) {
      throw new ReseedValidationError(
        "Parent followup not found or wrong client",
      );
    }

    // Ticket access check
    await access.assertAccess(userId, att.ticket_id);

    // Re-store the blob under a fresh key
    const newBlobKey = await blobStore.put(
      orgSchema,
      category,
      input.encryptedData,
    );
    const oldBlobKey = att.blob_key;

    // Transaction: update the attachment row and insert the portal carrier
    await db.transaction().execute(async (trx) => {
      await trx
        .updateTable("attachments")
        .set({
          blob_key: newBlobKey,
          file_key_wrap: input.fileKeyWrap,
        })
        .where("id", "=", attId)
        .execute();

      const direction: "from_client" | "to_client" =
        fu.source === "client" ? "from_client" : "to_client";

      await insertClientWrap(
        trx,
        {
          attachmentId: attId,
          channelRowId: channel.id,
          followupId: input.followupId,
          direction,
          copy: input.copy,
        },
        { createdAt: fu.created_at, onConflictIgnore: true },
      );
    });

    // Orphan-tolerant old blob cleanup after commit
    await blobStore.delete(oldBlobKey).catch((_: unknown) => {
      // Intentional: orphaned blob is harmless
    });
  } else {
    const recId = recordingIdSchema.parse(input.rowId);

    // Load the recording row
    const rec = await db
      .selectFrom("recordings")
      .select([
        "id",
        "ticket_id",
        "followup_id",
        "blob_key",
        "file_key_wrap",
        "deleted_at",
      ])
      .where("id", "=", recId)
      .executeTakeFirst();

    if (rec === undefined) {
      throw new ReseedRowNotFoundError("recording");
    }
    if (rec.deleted_at !== null) {
      throw new ReseedRowNotFoundError("recording");
    }
    if (rec.followup_id !== input.followupId) {
      throw new ReseedValidationError(
        `Recording ${recId} followup_id mismatch`,
      );
    }
    if (rec.file_key_wrap !== null) {
      throw new ReseedAlreadyConvertedError();
    }

    // Load the parent followup for access + direction
    const fu = await db
      .selectFrom("followups as f")
      .innerJoin("tickets as t", "t.id", "f.ticket_id")
      .select(["f.id", "f.source", "f.created_at", "t.client_id"])
      .where("f.id", "=", input.followupId)
      .executeTakeFirst();

    if (fu === undefined) {
      throw new ReseedValidationError(
        "Parent followup not found or wrong client",
      );
    }
    if (fu.client_id !== input.clientId) {
      throw new ReseedValidationError(
        "Parent followup not found or wrong client",
      );
    }

    // Ticket access check
    await access.assertAccess(userId, rec.ticket_id);

    // Re-store the blob under a fresh key
    const newBlobKey = await blobStore.put(
      orgSchema,
      category,
      input.encryptedData,
    );
    const oldBlobKey = rec.blob_key;

    // Transaction: update the recording row and insert the portal carrier
    await db.transaction().execute(async (trx) => {
      await trx
        .updateTable("recordings")
        .set({
          blob_key: newBlobKey,
          file_key_wrap: input.fileKeyWrap,
        })
        .where("id", "=", recId)
        .execute();

      const direction: "from_client" | "to_client" =
        fu.source === "client" ? "from_client" : "to_client";

      await insertClientRecordingWrap(
        trx,
        {
          recordingId: recId,
          channelRowId: channel.id,
          followupId: input.followupId,
          direction,
          copy: input.copy,
        },
        { createdAt: fu.created_at, onConflictIgnore: true },
      );
    });

    // Orphan-tolerant old blob cleanup after commit
    await blobStore.delete(oldBlobKey).catch((_: unknown) => {
      // Intentional: orphaned blob is harmless
    });
  }

  return { inserted: true };
}

// ---------------------------------------------------------------------------
// listTicketsForClient
// ---------------------------------------------------------------------------

export interface ClientTicketRef {
  readonly ticketId: TicketId;
  /**
   * The caller's key wrap for the ticket's current key generation,
   * base64url-encoded. This is the same wrap tickets.get returns; the
   * reseed needs it because ordinary follow-ups (key_generation null)
   * carry no per-row wrap and decrypt under the current ticket key.
   * Null when the caller holds no wrap for the current generation.
   */
  readonly keyWrap: {
    readonly ephemeralPoint: string;
    readonly nonce: string;
    readonly wrappedKey: string;
  } | null;
}

export async function listTicketsForClient(
  db: Kysely<TenantDatabase>,
  access: TicketAccessChecker,
  userId: UserId,
  clientId: ClientId,
): Promise<ClientTicketRef[]> {
  const rows = await db
    .selectFrom("tickets as t")
    .leftJoin("ticket_key_wraps as tkw", (join) =>
      join
        .onRef("tkw.ticket_id", "=", "t.id")
        .on("tkw.volunteer_id", "=", userId)
        .onRef("tkw.key_generation", "=", "t.key_generation"),
    )
    .select(["t.id", "tkw.ephemeral_point", "tkw.nonce", "tkw.wrapped_key"])
    .where("t.client_id", "=", clientId)
    .orderBy("t.created_at", "asc")
    .execute();

  const accessible: ClientTicketRef[] = [];
  for (const row of rows) {
    const canView = await access.canAccess(userId, row.id);
    if (!canView) continue;
    const keyWrap =
      row.ephemeral_point && row.nonce && row.wrapped_key
        ? {
            ephemeralPoint: encode(new Uint8Array(row.ephemeral_point)),
            nonce: encode(new Uint8Array(row.nonce)),
            wrappedKey: encode(new Uint8Array(row.wrapped_key)),
          }
        : null;
    accessible.push({ ticketId: row.id, keyWrap });
  }

  return accessible;
}
