/**
 * Server-side follow-up creation with per-ticket ECIES encryption.
 *
 * Two envelopes (ADR-089, ADR-092):
 *
 *  1. Direct envelope (portalSeal absent): the blob is encrypted directly
 *     under the follow-up key. No file_key_wrap. This is the original path,
 *     used when the client has no active channel.
 *
 *  2. File-key envelope (portalSeal present): a random file key encrypts the
 *     blob; the key is wrapped under the follow-up key in file_key_wrap and
 *     sealed to the channel's client_public in a portal carrier row. The blob
 *     is stored once; two readers hold two wraps of the same 32-byte key.
 *
 * All plaintext Buffers and file keys are zeroed in finally blocks within the
 * same call scope that created them. The portal carrier insert is wrapped in
 * try/catch so a failure there never stops the forward path (ADR-090).
 */

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
  fileKeySlot,
  requireSodium,
  eciesEncrypt,
  toRistrettoPoint,
  encodeFileKeyPayload,
} from "@care-y/crypto";
import { eciesWrapAndStore } from "./key-wrap.js";
import { insertClientWrap } from "../portal/portal-attachment-service.js";
import { insertClientRecordingWrap } from "../portal/portal-recording-service.js";
import type {
  TicketId,
  FollowupId,
  AttachmentId,
  RecordingId,
  KeyGeneration,
  BlobKey,
  OrgSchema,
  ChannelRowId,
} from "@care-y/shared";
import {
  newFollowupId,
  newAttachmentId,
  newRecordingId,
  newKeyGeneration,
} from "@care-y/shared";

export interface EncryptedFollowUpResult {
  readonly followUpId: FollowupId;
  readonly keyGeneration: KeyGeneration;
}

export interface FollowUpAttachment {
  readonly data: Buffer;
  readonly contentType: string;
}

export interface FollowUpRecording {
  readonly data: Buffer;
  readonly durationSeconds: number;
}

/** ECIES triple in Buffer form, as stored in portal carrier rows. */
interface EciesTripleBuffers {
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly ciphertext: Buffer;
}

export interface EncryptedFollowUpOpts {
  readonly attachments?: readonly FollowUpAttachment[];
  readonly recording?: FollowUpRecording;
  readonly blobStore?: BlobStore;
  readonly orgSchema?: OrgSchema;
  /**
   * When present, media is encrypted with the file-key envelope (ADR-089,
   * ADR-092) and a portal carrier row is written for each blob. When absent,
   * the direct envelope is used and no portal rows are created.
   */
  readonly portalSeal?: {
    readonly channelRowId: ChannelRowId;
    readonly clientPublic: Buffer;
  };
}

// --- Shared helpers ---

interface AttachmentRecord {
  id: AttachmentId;
  blobKey: BlobKey;
  contentType: string;
  sizeBytes: number;
  /** Non-null when the file-key envelope is used (ADR-089). */
  fileKeyWrap: Buffer | null;
  /** Non-null when portalSeal was provided. */
  portalWrap: EciesTripleBuffers | null;
}

interface RecordingRecord {
  id: RecordingId;
  blobKey: BlobKey;
  durationSeconds: number;
  /** Non-null when the file-key envelope is used (ADR-092). */
  fileKeyWrap: Buffer | null;
  /** Non-null when portalSeal was provided. */
  portalWrap: EciesTripleBuffers | null;
}

interface EncryptedMedia {
  attachmentRecords: AttachmentRecord[];
  recordingRecord: RecordingRecord | null;
}

interface FileKeyEnvelope {
  readonly encrypted: Uint8Array;
  readonly fileKeyWrap: Buffer;
  readonly portalWrap: EciesTripleBuffers;
}

/**
 * Encrypt one blob with the file-key envelope (ADR-089, ADR-092): mint a
 * file key, encrypt the blob under it, wrap the key under the follow-up
 * key at the filekey slot, and seal it to the channel's client_public.
 *
 * Fully synchronous, so the file key is minted, used, and zeroed with no
 * await inside its lifetime. The filename in the sealed payload is empty
 * by design: MMS and voicemail carry no name, and the UI shows its
 * unnamed and voicemail labels instead.
 */
function sealFileKeyEnvelope(
  data: Buffer,
  tk: SymmetricKey,
  ticketId: TicketId,
  rowId: string,
  clientPublic: Buffer,
): FileKeyEnvelope {
  const sodium = requireSodium();
  const fileKey = generateContentKey();
  try {
    const encrypted = encryptContent(
      data,
      fileKey,
      buildContentAad(ticketId, blobSlot(rowId)),
    );
    const fkWrap = encryptContent(
      fileKey,
      tk,
      buildContentAad(ticketId, fileKeySlot(rowId)),
    );
    const payload = encodeFileKeyPayload(fileKey, "");
    const sealed = eciesEncrypt(
      payload,
      toRistrettoPoint(new Uint8Array(clientPublic)),
    );
    return {
      encrypted,
      fileKeyWrap: Buffer.from(fkWrap),
      portalWrap: {
        ephemeralPoint: Buffer.from(sealed.ephemeralPoint),
        nonce: Buffer.from(sealed.nonce),
        ciphertext: Buffer.from(sealed.ciphertext),
      },
    };
  } finally {
    sodium.memzero(fileKey);
  }
}

/**
 * Encrypt and store attachments/recordings. Row ids are minted here,
 * before encryption, because the blob AAD binds the attachments or
 * recordings row id (ADR-053). The blob storage key is minted by the
 * store after encryption and is deliberately not part of the AAD.
 *
 * When portalSeal is present, each blob uses the file-key envelope:
 * a random file key encrypts the blob, the key is wrapped under the
 * follow-up key, and sealed to the channel's client_public. The file
 * key is zeroed in a finally block in the same scope (ADR-092).
 *
 * All media input buffers are zeroed in the finally block, so plaintext
 * does not outlive an encryption or storage failure partway through.
 */
async function encryptAndStoreMedia(
  tk: SymmetricKey,
  ticketId: TicketId,
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
        const attachmentId = newAttachmentId();

        if (opts.portalSeal) {
          // File-key envelope (ADR-089, ADR-092)
          const env = sealFileKeyEnvelope(
            att.data,
            tk,
            ticketId,
            attachmentId,
            opts.portalSeal.clientPublic,
          );
          const blobKey = await opts.blobStore.put(
            opts.orgSchema,
            "attachment",
            Buffer.from(env.encrypted),
          );
          attachmentRecords.push({
            id: attachmentId,
            blobKey,
            contentType: att.contentType,
            sizeBytes: env.encrypted.length,
            fileKeyWrap: env.fileKeyWrap,
            portalWrap: env.portalWrap,
          });
        } else {
          // Direct envelope (original path)
          const encrypted = encryptContent(
            att.data,
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
            fileKeyWrap: null,
            portalWrap: null,
          });
        }
      }
    }

    let recordingRecord: RecordingRecord | null = null;
    if (
      opts?.recording &&
      opts.blobStore !== undefined &&
      opts.orgSchema !== undefined
    ) {
      const recordingId = newRecordingId();

      if (opts.portalSeal) {
        // File-key envelope (ADR-092)
        const env = sealFileKeyEnvelope(
          opts.recording.data,
          tk,
          ticketId,
          recordingId,
          opts.portalSeal.clientPublic,
        );
        const blobKey = await opts.blobStore.put(
          opts.orgSchema,
          "recording",
          Buffer.from(env.encrypted),
        );
        recordingRecord = {
          id: recordingId,
          blobKey,
          durationSeconds: opts.recording.durationSeconds,
          fileKeyWrap: env.fileKeyWrap,
          portalWrap: env.portalWrap,
        };
      } else {
        // Direct envelope (original path)
        const encrypted = encryptContent(
          opts.recording.data,
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
          fileKeyWrap: null,
          portalWrap: null,
        };
      }
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
  followUpId: FollowupId,
  ticketId: TicketId,
  encryptedContent: Uint8Array,
  type: string,
  source: string,
  keyGeneration: KeyGeneration | null,
  media: EncryptedMedia,
  portalSeal: EncryptedFollowUpOpts["portalSeal"],
): Promise<FollowupId> {
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
        ...(att.fileKeyWrap !== null ? { file_key_wrap: att.fileKeyWrap } : {}),
      })
      .execute();

    // Best-effort portal carrier row. Failure must not stop the forward
    // path (ADR-090 fault isolation).
    if (portalSeal && att.portalWrap) {
      try {
        await insertClientWrap(db, {
          attachmentId: att.id,
          channelRowId: portalSeal.channelRowId,
          followupId: followUp.id,
          direction: "from_client",
          copy: att.portalWrap,
        });
      } catch {
        console.warn("Portal attachment carrier dropped for follow-up");
      }
    }
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
        ...(media.recordingRecord.fileKeyWrap !== null
          ? { file_key_wrap: media.recordingRecord.fileKeyWrap }
          : {}),
      })
      .execute();

    // Best-effort portal carrier row for recording.
    if (portalSeal && media.recordingRecord.portalWrap) {
      try {
        await insertClientRecordingWrap(db, {
          recordingId: media.recordingRecord.id,
          channelRowId: portalSeal.channelRowId,
          followupId: followUp.id,
          direction: "from_client",
          copy: media.recordingRecord.portalWrap,
        });
      } catch {
        console.warn("Portal recording carrier dropped for follow-up");
      }
    }
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
  ticketId: TicketId,
  content: Buffer,
  type: string,
  source: string,
  opts?: EncryptedFollowUpOpts,
): Promise<EncryptedFollowUpResult> {
  const sodium = requireSodium();
  const tkTemp = generateContentKey();
  const keyGen = newKeyGeneration();
  const followUpId = newFollowupId();

  try {
    // content is passed uncopied so the finally-block fill(0) reaches
    // the only plaintext buffer that exists.
    const encryptedContent = encryptContent(
      content,
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
      opts?.portalSeal,
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
  ticketId: TicketId,
  tk: SymmetricKey,
  content: Buffer,
  type: string,
  source: string,
  opts?: EncryptedFollowUpOpts,
): Promise<FollowupId> {
  const followUpId = newFollowupId();
  try {
    const encryptedContent = encryptContent(
      content,
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
      opts?.portalSeal,
    );
  } finally {
    content.fill(0);
  }
}
