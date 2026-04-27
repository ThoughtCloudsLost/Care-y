import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { BlobStore } from "../storage/store.js";
import type { SymmetricKey } from "@care-y/crypto";
import {
  generateContentKey,
  encryptContent,
  eciesEncrypt,
  toRistrettoPoint,
  requireSodium,
} from "@care-y/crypto";

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
    // Encrypt content
    const encryptedContent = encryptContent(new Uint8Array(content), tkTemp);
    content.fill(0);

    // Encrypt attachments if present
    const attachmentRecords: {
      blobKey: string;
      contentType: string;
      sizeBytes: number;
    }[] = [];
    if (
      opts?.attachments &&
      opts.blobStore !== undefined &&
      opts.orgSchema !== undefined
    ) {
      for (const att of opts.attachments) {
        const encrypted = encryptContent(new Uint8Array(att.data), tkTemp);
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

    // Encrypt recording if present
    let recordingRecord: {
      blobKey: string;
      durationSeconds: number;
    } | null = null;
    if (
      opts?.recording &&
      opts.blobStore !== undefined &&
      opts.orgSchema !== undefined
    ) {
      const encrypted = encryptContent(
        new Uint8Array(opts.recording.data),
        tkTemp,
      );
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

    // ECIES wrap tkTemp for each authorized volunteer
    for (const vol of volunteers) {
      if (!vol.vol_public) continue;
      const volPublic = toRistrettoPoint(new Uint8Array(vol.vol_public));
      const wrap = eciesEncrypt(tkTemp, volPublic);
      await db
        .insertInto("ticket_key_wraps")
        .values({
          ticket_id: ticketId,
          volunteer_id: vol.volunteer_id,
          key_generation: keyGen,
          ephemeral_point: Buffer.from(wrap.ephemeralPoint),
          nonce: Buffer.from(wrap.nonce),
          wrapped_key: Buffer.from(wrap.ciphertext),
          algorithm: "ecies-ristretto255-v1",
        })
        .execute();
    }

    // Insert follow-up row
    const followUp = await db
      .insertInto("followups")
      .values({
        ticket_id: ticketId,
        source,
        type,
        encrypted_content: Buffer.from(encryptedContent),
        key_generation: keyGen,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    // Insert attachment rows
    for (const att of attachmentRecords) {
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

    // Insert recording row
    if (recordingRecord) {
      await db
        .insertInto("recordings")
        .values({
          ticket_id: ticketId,
          followup_id: followUp.id,
          blob_key: recordingRecord.blobKey,
          size_bytes: 0,
          duration_seconds: recordingRecord.durationSeconds,
        })
        .execute();
    }

    return { followUpId: followUp.id, keyGeneration: keyGen };
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

  // Encrypt attachments if present
  const attachmentRecords: {
    blobKey: string;
    contentType: string;
    sizeBytes: number;
  }[] = [];
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

  // Encrypt recording if present
  let recordingRecord: {
    blobKey: string;
    durationSeconds: number;
  } | null = null;
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

  // Insert follow-up (key_generation = null: uses ticket's canonical wraps)
  const followUp = await db
    .insertInto("followups")
    .values({
      ticket_id: ticketId,
      source,
      type,
      encrypted_content: Buffer.from(encryptedContent),
    })
    .returning("id")
    .executeTakeFirstOrThrow();

  // Insert attachment rows
  for (const att of attachmentRecords) {
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

  // Insert recording row
  if (recordingRecord) {
    await db
      .insertInto("recordings")
      .values({
        ticket_id: ticketId,
        followup_id: followUp.id,
        blob_key: recordingRecord.blobKey,
        size_bytes: 0,
        duration_seconds: recordingRecord.durationSeconds,
      })
      .execute();
  }

  return followUp.id;
}
