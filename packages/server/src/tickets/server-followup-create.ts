import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { BlobStore } from "../storage/store.js";
import type { SymmetricKey } from "@care-y/crypto";
import {
  generateContentKey,
  encryptContent,
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
  blobKey: string;
  contentType: string;
  sizeBytes: number;
}

interface RecordingRecord {
  blobKey: string;
  durationSeconds: number;
}

interface EncryptedMedia {
  attachmentRecords: AttachmentRecord[];
  recordingRecord: RecordingRecord | null;
}

async function encryptAndStoreMedia(
  tk: SymmetricKey,
  opts: EncryptedFollowUpOpts | undefined,
): Promise<EncryptedMedia> {
  const attachmentRecords: AttachmentRecord[] = [];
  if (
    opts?.attachments &&
    opts.blobStore !== undefined &&
    opts.orgSchema !== undefined
  ) {
    for (const att of opts.attachments) {
      const encrypted = encryptContent(new Uint8Array(att.data), tk);
      att.data.fill(0);
      const blobKey = await opts.blobStore.put(
        opts.orgSchema,
        "attachment",
        Buffer.from(encrypted),
      );
      attachmentRecords.push({
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
    const encrypted = encryptContent(new Uint8Array(opts.recording.data), tk);
    opts.recording.data.fill(0);
    const blobKey = await opts.blobStore.put(
      opts.orgSchema,
      "recording",
      Buffer.from(encrypted),
    );
    recordingRecord = {
      blobKey,
      durationSeconds: opts.recording.durationSeconds,
    };
  }

  return { attachmentRecords, recordingRecord };
}

async function insertFollowUpWithMedia(
  db: Kysely<TenantDatabase>,
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
 * All plaintext Buffers and `tk_temp` are zeroed in the finally block.
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

  try {
    const encryptedContent = encryptContent(new Uint8Array(content), tkTemp);
    content.fill(0);

    const media = await encryptAndStoreMedia(tkTemp, opts);

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

    const followUpId = await insertFollowUpWithMedia(
      db,
      ticketId,
      encryptedContent,
      type,
      source,
      keyGen,
      media,
    );

    return { followUpId, keyGeneration: keyGen };
  } finally {
    sodium.memzero(tkTemp);
  }
}

/**
 * Create a follow-up using a caller-provided key (for new tickets where
 * the ticket's `tk` is reused). The caller must zero `tk` after use.
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
  const encryptedContent = encryptContent(new Uint8Array(content), tk);
  content.fill(0);

  const media = await encryptAndStoreMedia(tk, opts);

  return insertFollowUpWithMedia(
    db,
    ticketId,
    encryptedContent,
    type,
    source,
    null,
    media,
  );
}
