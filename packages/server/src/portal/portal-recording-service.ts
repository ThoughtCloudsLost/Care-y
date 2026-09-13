/**
 * Portal recording service.
 *
 * Stores and retrieves portal-tier recording file key wraps. Each
 * recording is encrypted once under a random file key. That key is
 * wrapped under the follow-up's key for the org side
 * (recordings.file_key_wrap) and sealed to portal_channels.client_public
 * for the client side (portal_recordings). The server never decrypts
 * anything here; every ciphertext field is opaque passthrough.
 *
 * See ADR-089 for the envelope design and ADR-092 for the media
 * parity decision.
 */

import type { Kysely, Transaction } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type {
  RecordingId,
  FollowupId,
  ChannelRowId,
  BlobKey,
} from "@care-y/shared";
import { encode } from "@care-y/crypto";

// Inline rather than importing from portal-message-service to avoid a
// circular module dependency (the message service may import from here).
interface EciesTripleBuffers {
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly ciphertext: Buffer;
}

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface PortalRecordingWire {
  readonly recordingId: string;
  readonly followupId: string;
  readonly direction: string;
  readonly durationSeconds: number | null;
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly ciphertext: string;
  readonly createdAt: string;
}

// ---------------------------------------------------------------------------
// insertClientRecordingWrap
// ---------------------------------------------------------------------------

export interface InsertClientRecordingWrapOpts {
  /** Stamp the row's created_at explicitly (reseed uses the followup's timestamp). */
  readonly createdAt?: Date;
  /** Add ON CONFLICT DO NOTHING on the per-channel unique index columns. */
  readonly onConflictIgnore?: boolean;
}

/**
 * Write the client's wrap of the recording file key for one channel.
 * Returns whether a row was written; false only when onConflictIgnore
 * suppressed a duplicate.
 */
export async function insertClientRecordingWrap(
  trx: Kysely<TenantDatabase> | Transaction<TenantDatabase>,
  args: {
    recordingId: RecordingId;
    channelRowId: ChannelRowId;
    followupId: FollowupId;
    direction: "to_client" | "from_client";
    copy: EciesTripleBuffers;
  },
  opts?: InsertClientRecordingWrapOpts,
): Promise<boolean> {
  let query = trx.insertInto("portal_recordings").values({
    recording_id: args.recordingId,
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
      oc.columns(["channel_id", "recording_id"]).doNothing(),
    );
  }

  const result = await query.executeTakeFirst();
  return Number(result.numInsertedOrUpdatedRows ?? 0n) > 0;
}

// ---------------------------------------------------------------------------
// listChannelRecordings
// ---------------------------------------------------------------------------

/** Every recording this channel may open, oldest first. */
export async function listChannelRecordings(
  db: Kysely<TenantDatabase>,
  channelRowId: ChannelRowId,
): Promise<PortalRecordingWire[]> {
  const rows = await db
    .selectFrom("portal_recordings as pr")
    .innerJoin("recordings as r", "r.id", "pr.recording_id")
    .select([
      "pr.recording_id",
      "pr.followup_id",
      "pr.direction",
      "r.duration_seconds",
      "pr.ephemeral_point",
      "pr.nonce",
      "pr.ciphertext",
      "pr.created_at",
    ])
    .where("pr.channel_id", "=", channelRowId)
    .where("r.deleted_at", "is", null)
    .orderBy("pr.created_at", "asc")
    .orderBy("pr.id", "asc")
    .execute();

  return rows.map((r) => ({
    recordingId: r.recording_id,
    followupId: r.followup_id,
    direction: r.direction,
    durationSeconds: r.duration_seconds,
    ephemeralPoint: encode(new Uint8Array(r.ephemeral_point)),
    nonce: encode(new Uint8Array(r.nonce)),
    ciphertext: encode(new Uint8Array(r.ciphertext)),
    createdAt: r.created_at.toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// resolveChannelRecordingBlobKey
// ---------------------------------------------------------------------------

/**
 * Blob key for a recording download, scoped to the channel that
 * authenticated. Null when no wrap ties the recording to this channel
 * or the recording is soft-deleted. A recording id on its own proves
 * nothing.
 */
export async function resolveChannelRecordingBlobKey(
  db: Kysely<TenantDatabase>,
  channelRowId: ChannelRowId,
  recordingId: RecordingId,
): Promise<BlobKey | null> {
  const row = await db
    .selectFrom("portal_recordings as pr")
    .innerJoin("recordings as r", "r.id", "pr.recording_id")
    .select("r.blob_key")
    .where("pr.channel_id", "=", channelRowId)
    .where("pr.recording_id", "=", recordingId)
    .where("r.deleted_at", "is", null)
    .executeTakeFirst();

  return row?.blob_key ?? null;
}

// ---------------------------------------------------------------------------
// purgeChannelRecordings
// ---------------------------------------------------------------------------

/** Drop a channel's recording wraps when its copies expire. Blob and org row stay. */
export async function purgeChannelRecordings(
  trx: Kysely<TenantDatabase> | Transaction<TenantDatabase>,
  channelRowId: ChannelRowId,
): Promise<void> {
  await trx
    .deleteFrom("portal_recordings")
    .where("channel_id", "=", channelRowId)
    .execute();
}
