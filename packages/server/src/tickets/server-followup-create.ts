import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { BlobStore } from "../storage/store.js";
import type { SymmetricKey } from "@care-y/crypto";
import {
  generateContentKey,
  encryptContent,
  buildContentAad,
  followupSlot,
  blobSlot,
  requireSodium,
} from "@care-y/crypto";
import { eciesWrapAndStore } from "./key-wrap.js";

export interface EncryptedFollowUpResult {
  readonly followUpId: string;
  readonly keyGeneration: string;
}

export interface FollowUpAttachment {
  readonly data: Buffer;
  readonly contentType: string;
}

export interface FollowUpRecording {
  readonly data: Buffer;
  readonly durationSeconds: number;
}

export interface EncryptedFollowUpOpts {
  readonly attachments?: readonly FollowUpAttachment[];
  readonly recording?: FollowUpRecording;
  readonly blobStore?: BlobStore;
  readonly orgSchema?: string;
}

// --- Shared helpers ---

interface AttachmentRecord {
  id: string;
  blobKey: string;
  contentType: string;
  sizeBytes: number;
}

interface RecordingRecord {
  id: string;
  blobKey: string;
  durationSeconds: number;
}

interface EncryptedMedia {
  attachmentRecords: AttachmentRecord[];
  recordingRecord: RecordingRecord | null;
}

/**
 * Encrypt and store attachments/recordings. Row ids are minted here,
 * before encryption, because the blob AAD binds the attachments or
 * recordings row id (ADR-053). The blob storage key is minted by the
 * store after encryption and is deliberately not part of the AAD.
 *
 * All media input buffers are zeroed in the finally block, so plaintext
 * does not outlive an encryption or storage failure partway through.
 */
async function encryptAndStoreMedia(
  tk: SymmetricKey,
  ticketId: string,
  opts: EncryptedFollowUpOpts | undefined,
): Promise<EncryptedMedia> {
  try {
    const attachmentRecords: AttachmentRecord[] = [];
    if (
      opts?.attachments &&
      opts.blobStore !== undefined &&
      opts.orgSchema !== undefined
    ) {
      for (const att of opts.attachments) {
        const attachmentId = crypto.randomUUID();
        const encrypted = encryptContent(
          new Uint8Array(att.data),
          tk,
          buildContentAad(ticketId, blobSlot(attachmentId)),
        );
        const blobKey = await opts.blobStore.put(
          opts.orgSchema,
          "attachment",
          Buffer.from(encrypted),
        );
        attachmentRecords.push({
          id: attachmentId,
          blobKey,
          contentType: att.contentType,
          sizeBytes: encrypted.length,
        });
      }
    }

    let recordingRecord: RecordingRecord | null = null;
    if (
      opts?.recording &&
      opts.blobStore !== undefined &&
      opts.orgSchema !== undefined
    ) {
      const recordingId = crypto.randomUUID();
      const encrypted = encryptContent(
        new Uint8Array(opts.recording.data),
        tk,
        buildContentAad(ticketId, blobSlot(recordingId)),
      );
      const blobKey = await opts.blobStore.put(
        opts.orgSchema,
        "recording",
        Buffer.from(encrypted),
      );
      recordingRecord = {
        id: recordingId,
        blobKey,
        durationSeconds: opts.recording.durationSeconds,
      };
    }

    return { attachmentRecords, recordingRecord };
  } finally {
    for (const att of opts?.attachments ?? []) {
      att.data.fill(0);
    }
    opts?.recording?.data.fill(0);
  }
}

async function insertFollowUpWithMedia(
  db: Kysely<TenantDatabase>,
  followUpId: string,
  ticketId: string,
  encryptedContent: Uint8Array,
  type: string,
  source: string,
  keyGeneration: string | null,
  media: EncryptedMedia,
): Promise<string> {
  const followUp = await db
    .insertInto("followups")
    .values({
      id: followUpId,
      ticket_id: ticketId,
      source,
      type,
      encrypted_content: Buffer.from(encryptedContent),
      ...(keyGeneration !== null ? { key_generation: keyGeneration } : {}),
    })
    .returning("id")
    .executeTakeFirstOrThrow();

  for (const att of media.attachmentRecords) {
    await db
      .insertInto("attachments")
      .values({
        id: att.id,
        ticket_id: ticketId,
        followup_id: followUp.id,
        blob_key: att.blobKey,
        size_bytes: att.sizeBytes,
        content_type: att.contentType,
      })
      .execute();
  }

  if (media.recordingRecord) {
    await db
      .insertInto("recordings")
      .values({
        id: media.recordingRecord.id,
        ticket_id: ticketId,
        followup_id: followUp.id,
        blob_key: media.recordingRecord.blobKey,
        size_bytes: 0,
        duration_seconds: media.recordingRecord.durationSeconds,
      })
      .execute();
  }

  return followUp.id;
}

// --- Public API ---

/**
 * Create a follow-up on an existing ticket with its own `tk_temp`.
 * Used when the server has PII content to add to a ticket it didn't just create.
 *
 * The follow-up id is minted before encryption so the AAD can bind it
 * (ADR-053). `content` and `tk_temp` are zeroed in the finally block;
 * media buffers are zeroed inside encryptAndStoreMedia.
 */
export async function createEncryptedFollowUp(
  db: Kysely<TenantDatabase>,
  ticketId: string,
  content: Buffer,
  type: string,
  source: string,
  opts?: EncryptedFollowUpOpts,
): Promise<EncryptedFollowUpResult> {
  const sodium = requireSodium();
  const tkTemp = generateContentKey();
  const keyGen = crypto.randomUUID();
  const followUpId = crypto.randomUUID();

  try {
    const encryptedContent = encryptContent(
      new Uint8Array(content),
      tkTemp,
      buildContentAad(ticketId, followupSlot(followUpId)),
    );

    const media = await encryptAndStoreMedia(tkTemp, ticketId, opts);

    // Query volunteers with access to this ticket's key wraps
    const volunteers = await db
      .selectFrom("ticket_key_wraps")
      .innerJoin(
        "user_keys",
        "user_keys.user_id",
        "ticket_key_wraps.volunteer_id",
      )
      .select(["ticket_key_wraps.volunteer_id", "user_keys.vol_public"])
      .where("ticket_key_wraps.ticket_id", "=", ticketId)
      .where("user_keys.vol_public", "is not", null)
      .groupBy(["ticket_key_wraps.volunteer_id", "user_keys.vol_public"])
      .execute();

    await eciesWrapAndStore(
      db,
      ticketId,
      keyGen,
      tkTemp,
      volunteers
        .filter(
          (v): v is typeof v & { vol_public: Buffer } => v.vol_public !== null,
        )
        .map((v) => ({
          volunteerId: v.volunteer_id,
          volPublic: v.vol_public,
        })),
    );

    await insertFollowUpWithMedia(
      db,
      followUpId,
      ticketId,
      encryptedContent,
      type,
      source,
      keyGen,
      media,
    );

    return { followUpId, keyGeneration: keyGen };
  } finally {
    content.fill(0);
    sodium.memzero(tkTemp);
  }
}

/**
 * Create a follow-up using a caller-provided key (for new tickets where
 * the ticket's `tk` is reused). `content` is zeroed in the finally block;
 * the caller must zero `tk` after use.
 *
 * Follow-up is inserted with `key_generation = null` since the ticket's
 * canonical wraps already cover this key.
 */
export async function createFollowUpWithTk(
  db: Kysely<TenantDatabase>,
  ticketId: string,
  tk: SymmetricKey,
  content: Buffer,
  type: string,
  source: string,
  opts?: EncryptedFollowUpOpts,
): Promise<string> {
  const followUpId = crypto.randomUUID();
  try {
    const encryptedContent = encryptContent(
      new Uint8Array(content),
      tk,
      buildContentAad(ticketId, followupSlot(followUpId)),
    );

    const media = await encryptAndStoreMedia(tk, ticketId, opts);

    return await insertFollowUpWithMedia(
      db,
      followUpId,
      ticketId,
      encryptedContent,
      type,
      source,
      null,
      media,
    );
  } finally {
    content.fill(0);
  }
}
