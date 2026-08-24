/**
 * Voicemail quarantine service.
 *
 * When a recording-complete webhook cannot route a voicemail to a ticket
 * (tracker miss, no intake queue, unresolved client), the audio is
 * encrypted via sealed box, stored, and held for manual admin resolution.
 *
 * Policy: never leave plaintext at the provider, never silently destroy
 * a recording. Encrypt-then-quarantine satisfies both.
 *
 * Route and dismiss operations are a separate module (admin API surface).
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { TelephonyProvider } from "./provider.js";
import type { BlobStore } from "../storage/store.js";
import type { JobQueue } from "../jobs/queue.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { NotificationService } from "../notifications/service.js";
import type {
  QuarantineReason,
  ListQuarantineInput,
  RouteQuarantineInput,
  OrgId,
  OrgSchema,
  OrgSlug,
  RecordingSid,
  CallSid,
  ClientId,
  VoicemailQuarantineId,
  TicketId,
  FollowupId,
  UserId,
  QueueId,
} from "@care-y/shared";
import {
  SYSTEM_ACTOR_ID,
  RoleId,
  VOICEMAIL_QUARANTINE_MAX_BYTES,
  newVoicemailQuarantineId,
  userIdSchema,
} from "@care-y/shared";
import { sealBufferAndZero, sealString } from "./crypto-helpers.js";
import { deleteOrEnqueue } from "./log-deletion-helpers.js";
import { createAuditService } from "../tickets/audit.js";
import { createUserService } from "../users/user-service.js";
import { NotFoundError, ConflictError, ValidationError } from "../errors.js";
import { createEncryptedFollowUp } from "../tickets/server-followup-create.js";
import { resolveInboundTicket } from "./resolve-inbound-ticket.js";
import { createPhoneRepository } from "./models/phone-repo.js";
import { createClientRepository } from "./models/client-repo.js";
import type { PendingClient } from "../tickets/ticket-service.js";

// ---------------------------------------------------------------------------
// Dependency interface
// ---------------------------------------------------------------------------

export interface QuarantineDeps {
  readonly tDb: Kysely<TenantDatabase>;
  readonly provider: TelephonyProvider;
  readonly blobStore: BlobStore;
  readonly jobQueue: JobQueue;
  readonly sealedBox: SealedBoxEncryptor;
  readonly orgId: OrgId;
  readonly orgSchema: OrgSchema;
  readonly orgSlug: OrgSlug;
  readonly notificationService: NotificationService;
}

// ---------------------------------------------------------------------------
// quarantineRecording params
// ---------------------------------------------------------------------------

export interface QuarantineParams {
  readonly recordingSid: RecordingSid;
  readonly callSid: CallSid;
  readonly reason: QuarantineReason;
  readonly clientId?: ClientId | null;
  readonly durationSeconds?: number;
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface QuarantineListRow {
  readonly id: VoicemailQuarantineId;
  readonly reason: string;
  readonly status: string;
  readonly createdAt: Date;
  readonly durationSeconds: number | null;
  readonly encryptedCallerNumber: string | null;
  readonly encryptedCalledNumber: string | null;
  readonly clientId: ClientId | null;
  readonly routedTicketId: TicketId | null;
  readonly routedFollowupId: FollowupId | null;
  readonly resolvedBy: UserId | null;
  readonly resolvedAt: Date | null;
}

export interface QuarantineBlobResult {
  readonly sealedBase64: string;
  readonly durationSeconds: number | null;
}

// ---------------------------------------------------------------------------
// Route/dismiss dependency interface
// ---------------------------------------------------------------------------

export interface RouteQuarantineDeps {
  readonly tDb: Kysely<TenantDatabase>;
  readonly blobStore: BlobStore;
  readonly orgSchema: OrgSchema;
  readonly pendingClients: Map<string, PendingClient>;
  readonly sealedBox: SealedBoxEncryptor;
}

export interface RouteQuarantineResult {
  readonly ticketId: TicketId;
  readonly followUpId: FollowupId;
}

export interface DismissQuarantineDeps {
  readonly tDb: Kysely<TenantDatabase>;
  readonly blobStore: BlobStore;
}

// ---------------------------------------------------------------------------
// quarantineRecording
// ---------------------------------------------------------------------------

/**
 * Encrypts a voicemail recording and stores it in the quarantine table.
 *
 * Steps: fetch call details (best-effort), fetch audio from provider,
 * seal the audio, store the blob, insert the DB row, audit, notify admins,
 * then delete provider-side copies.
 *
 * If audio fetch, encryption, or DB insert throw, the error propagates
 * so the webhook returns 500 and the provider retries. Provider-side
 * deletion happens only after the row is durably inserted.
 */
export async function quarantineRecording(
  deps: QuarantineDeps,
  params: QuarantineParams,
): Promise<void> {
  const {
    tDb,
    provider,
    blobStore,
    jobQueue,
    sealedBox,
    orgId,
    orgSchema,
    orgSlug,
    notificationService,
  } = deps;
  const { recordingSid, callSid, reason, clientId, durationSeconds } = params;

  // (a) For tracker_miss and unresolved_client, try to capture call metadata.
  let encryptedCaller: Buffer | null = null;
  let encryptedCalled: Buffer | null = null;

  if (reason === "tracker_miss" || reason === "unresolved_client") {
    try {
      const details = await provider.getCallDetails(callSid);
      encryptedCaller = sealString(sealedBox, details.from);
      encryptedCalled = sealString(sealedBox, details.to);
    } catch (_err: unknown) {
      // Call details lookup failed. Proceed with null numbers;
      // a quarantine with no numbers is still recoverable by
      // listening to the audio. Log the call SID (pseudonymous,
      // no PII) so operators can correlate.
      console.error(
        `getCallDetails failed for quarantine (callSid: ${callSid})`,
      );
    }
  }

  // (b) Fetch raw audio from the provider.
  const rawAudio = await provider.getRecording(recordingSid);

  // (c) Encrypt and zero the audio, then store the sealed blob.
  const sealed = sealBufferAndZero(sealedBox, rawAudio);
  const blobKey = await blobStore.put(orgSchema, "quarantine", sealed);

  // (d) Insert quarantine row. ON CONFLICT DO NOTHING handles webhook retries.
  const quarantineId = newVoicemailQuarantineId();
  const result = await tDb
    .insertInto("voicemail_quarantine")
    .values({
      id: quarantineId,
      recording_sid: recordingSid,
      call_sid: callSid,
      blob_key: blobKey,
      size_bytes: sealed.length,
      duration_seconds: durationSeconds ?? null,
      reason,
      client_id: clientId ?? null,
      encrypted_caller_number: encryptedCaller,
      encrypted_called_number: encryptedCalled,
    })
    .onConflict((oc) => oc.column("recording_sid").doNothing())
    .executeTakeFirst();

  if (result.numInsertedOrUpdatedRows === 0n) {
    // Duplicate recording_sid: a prior webhook delivery already stored this
    // recording. Delete the duplicate blob we just wrote and return.
    await blobStore.delete(blobKey);
    return;
  }

  // (e) Audit the quarantine event.
  const auditService = createAuditService(tDb);
  await auditService.log({
    eventType: "voicemail_quarantined",
    actorId: userIdSchema.parse(SYSTEM_ACTOR_ID),
    metadata: {
      quarantineId,
      reason,
      callSid,
    },
  });

  // (f) Notify admins (best-effort).
  try {
    const userService = createUserService(tDb);
    const adminIds = await userService.listActiveIdsByRoleId(RoleId.ADMIN);
    if (adminIds.length > 0) {
      await notificationService.dispatchTicketless(
        tDb,
        orgId,
        orgSchema,
        orgSlug,
        "voicemail_quarantined",
        adminIds,
      );
    }
  } catch (_notifyErr: unknown) {
    // Notification failure must not block the quarantine.
    console.error("Failed to notify admins of quarantined voicemail");
  }

  // (g) Provider-side cleanup (only after durable insert).
  await deleteOrEnqueue(provider, jobQueue, orgId, "recording", recordingSid);
  await deleteOrEnqueue(provider, jobQueue, orgId, "call", callSid);
}

// ---------------------------------------------------------------------------
// listQuarantined
// ---------------------------------------------------------------------------

/**
 * Lists quarantined voicemails, optionally filtered by status,
 * ordered newest first, with a configurable limit.
 *
 * Encrypted numbers are returned as base64 strings (same serialization
 * the client decrypt cache expects for sealed-box ciphertext).
 */
export async function listQuarantined(
  tDb: Kysely<TenantDatabase>,
  input: ListQuarantineInput,
): Promise<readonly QuarantineListRow[]> {
  let query = tDb
    .selectFrom("voicemail_quarantine")
    .select([
      "id",
      "reason",
      "status",
      "created_at",
      "duration_seconds",
      "encrypted_caller_number",
      "encrypted_called_number",
      "client_id",
      "routed_ticket_id",
      "routed_followup_id",
      "resolved_by",
      "resolved_at",
    ]);

  if (input.status !== undefined) {
    query = query.where("status", "=", input.status);
  }

  const rows = await query
    .orderBy("created_at", "desc")
    .limit(input.limit)
    .execute();

  return rows.map((row) => ({
    id: row.id,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
    durationSeconds: row.duration_seconds,
    encryptedCallerNumber: row.encrypted_caller_number
      ? row.encrypted_caller_number.toString("base64url")
      : null,
    encryptedCalledNumber: row.encrypted_called_number
      ? row.encrypted_called_number.toString("base64url")
      : null,
    clientId: row.client_id,
    routedTicketId: row.routed_ticket_id,
    routedFollowupId: row.routed_followup_id,
    resolvedBy: row.resolved_by,
    resolvedAt: row.resolved_at,
  }));
}

// ---------------------------------------------------------------------------
// getQuarantineBlob
// ---------------------------------------------------------------------------

/**
 * Loads a quarantined voicemail's sealed audio blob, returning it as a
 * base64-encoded string alongside duration metadata.
 *
 * The bytes are sealed-box ciphertext (not plaintext), so string handling
 * is safe. Only plaintext audio requires Buffer-and-zero discipline.
 */
export async function getQuarantineBlob(
  tDb: Kysely<TenantDatabase>,
  blobStore: BlobStore,
  quarantineId: VoicemailQuarantineId,
): Promise<QuarantineBlobResult> {
  const row = await tDb
    .selectFrom("voicemail_quarantine")
    .select(["blob_key", "duration_seconds"])
    .where("id", "=", quarantineId)
    .executeTakeFirst();

  if (!row) {
    throw new NotFoundError("Quarantined voicemail not found");
  }

  const sealedBlob = await blobStore.get(row.blob_key);
  if (!sealedBlob) {
    throw new NotFoundError("Quarantine blob missing from store");
  }

  return {
    sealedBase64: sealedBlob.toString("base64url"),
    durationSeconds: row.duration_seconds,
  };
}

// ---------------------------------------------------------------------------
// routeQuarantined
// ---------------------------------------------------------------------------

/**
 * Routes a quarantined voicemail to a ticket, creating a follow-up with
 * the decrypted audio data provided by the admin client.
 *
 * The admin client decrypts the sealed-box audio, re-encrypts it with the
 * ticket key, and sends the plaintext audio for re-encryption server-side
 * via createEncryptedFollowUp. Plaintext audio is handled as a Buffer and
 * zeroed in a finally block.
 *
 * Atomic pending-guard: the quarantine row is marked routed only after
 * the follow-up is successfully created. If two admins try to route the
 * same voicemail, one will get a ConflictError.
 */
export async function routeQuarantined(
  deps: RouteQuarantineDeps,
  input: RouteQuarantineInput,
  actorId: UserId,
): Promise<RouteQuarantineResult> {
  const { tDb, blobStore, orgSchema, pendingClients } = deps;

  // Load the quarantine row
  const row = await tDb
    .selectFrom("voicemail_quarantine")
    .select(["id", "status", "blob_key", "duration_seconds"])
    .where("id", "=", input.quarantineId)
    .executeTakeFirst();

  if (!row) {
    throw new NotFoundError("Quarantined voicemail not found");
  }
  if (row.status !== "pending") {
    throw new ConflictError("Quarantine entry is already resolved");
  }

  // Resolve the target ticket
  let ticketId: TicketId;

  switch (input.target.type) {
    case "clientId": {
      const intakeQueueId = await loadIntakeQueueId(tDb);
      if (intakeQueueId === null) {
        throw new ValidationError(
          "No intake queue configured for this organization",
        );
      }
      ticketId = await resolveInboundTicket(
        tDb,
        input.target.clientId,
        intakeQueueId,
        "Quarantined voicemail routed by admin",
      );
      break;
    }
    case "clientToken": {
      const intakeQueueId = await loadIntakeQueueId(tDb);
      if (intakeQueueId === null) {
        throw new ValidationError(
          "No intake queue configured for this organization",
        );
      }
      const pending = pendingClients.get(input.target.clientToken);
      if (!pending) {
        throw new NotFoundError("Client token expired or invalid");
      }
      pendingClients.delete(input.target.clientToken);

      const phoneRepo = createPhoneRepository(tDb);
      const clientRepo = createClientRepository(tDb, phoneRepo, deps.sealedBox);
      const result = await clientRepo.findOrCreateByPhoneHash(
        pending.phoneHash,
        pending.opsEncryptedPhone,
        pending.phoneMatchHash,
      );

      ticketId = await resolveInboundTicket(
        tDb,
        result.client.id,
        intakeQueueId,
        "Quarantined voicemail routed by admin",
      );
      break;
    }
    case "ticketId": {
      const ticket = await tDb
        .selectFrom("tickets")
        .select(["id", "status"])
        .where("id", "=", input.target.ticketId)
        .executeTakeFirst();
      if (!ticket) {
        throw new NotFoundError("Target ticket not found");
      }
      if (ticket.status !== "open") {
        throw new ValidationError("Target ticket is not open");
      }
      ticketId = ticket.id;
      break;
    }
  }

  // Decode base64 audio data into a Buffer (plaintext audio: relay rules apply)
  const audioData = Buffer.from(input.audioData, "base64");

  if (audioData.length > VOICEMAIL_QUARANTINE_MAX_BYTES) {
    audioData.fill(0);
    throw new ValidationError("Decoded audio exceeds maximum allowed size");
  }

  let followUpId: FollowupId;
  try {
    const fuResult = await createEncryptedFollowUp(
      tDb,
      ticketId,
      Buffer.from("Voicemail recording", "utf-8"),
      "voicemail",
      "client",
      {
        recording: {
          data: audioData,
          durationSeconds: input.durationSeconds ?? 0,
        },
        blobStore,
        orgSchema,
      },
    );
    followUpId = fuResult.followUpId;
  } finally {
    audioData.fill(0);
  }

  // Atomic pending-guard update
  const updateResult = await tDb
    .updateTable("voicemail_quarantine")
    .set({
      status: "routed",
      routed_ticket_id: ticketId,
      routed_followup_id: followUpId,
      resolved_by: actorId,
      resolved_at: new Date(),
    })
    .where("id", "=", input.quarantineId)
    .where("status", "=", "pending")
    .executeTakeFirst();

  if (updateResult.numUpdatedRows === 0n) {
    throw new ConflictError("Quarantine entry was resolved by another user");
  }

  // Delete the sealed quarantine blob (original sealed-box copy)
  await blobStore.delete(row.blob_key);

  // Audit the routing decision
  const auditService = createAuditService(tDb);
  await auditService.log({
    eventType: "voicemail_quarantine_routed",
    actorId,
    metadata: {
      quarantineId: input.quarantineId,
      routedTicketId: ticketId,
    },
  });

  return { ticketId, followUpId };
}

// ---------------------------------------------------------------------------
// dismissQuarantined
// ---------------------------------------------------------------------------

/**
 * Dismisses a quarantined voicemail, deleting the sealed blob and marking
 * the row as dismissed. This is an explicit admin decision to discard the
 * recording permanently.
 *
 * Atomic pending-guard prevents double-dismiss races.
 */
export async function dismissQuarantined(
  deps: DismissQuarantineDeps,
  quarantineId: VoicemailQuarantineId,
  actorId: UserId,
): Promise<void> {
  const { tDb, blobStore } = deps;

  // Load the row to get the blob key
  const row = await tDb
    .selectFrom("voicemail_quarantine")
    .select(["id", "status", "blob_key"])
    .where("id", "=", quarantineId)
    .executeTakeFirst();

  if (!row) {
    throw new NotFoundError("Quarantined voicemail not found");
  }
  if (row.status !== "pending") {
    throw new ConflictError("Quarantine entry is already resolved");
  }

  // Atomic pending-guard update
  const updateResult = await tDb
    .updateTable("voicemail_quarantine")
    .set({
      status: "dismissed",
      resolved_by: actorId,
      resolved_at: new Date(),
    })
    .where("id", "=", quarantineId)
    .where("status", "=", "pending")
    .executeTakeFirst();

  if (updateResult.numUpdatedRows === 0n) {
    throw new ConflictError("Quarantine entry was resolved by another user");
  }

  // Delete the sealed blob
  await blobStore.delete(row.blob_key);

  // Audit the dismissal
  const auditService = createAuditService(tDb);
  await auditService.log({
    eventType: "voicemail_quarantine_dismissed",
    actorId,
    metadata: { quarantineId },
  });
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Reads the org's intake_queue_id from org_config. Returns null if unset.
 */
async function loadIntakeQueueId(
  tDb: Kysely<TenantDatabase>,
): Promise<QueueId | null> {
  const config = await tDb
    .selectFrom("org_config")
    .select("intake_queue_id")
    .executeTakeFirst();

  return config?.intake_queue_id ?? null;
}
