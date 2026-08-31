/**
 * Recording-complete webhook handler.
 *
 * Happy path: fetches raw audio from the telephony provider, encrypts it
 * with per-ticket ECIES via createEncryptedFollowUp, stores the ciphertext
 * in BlobStore, then requests deletion of the provider-side recording and
 * call log.
 *
 * Failure paths (tracker miss, no intake queue, unresolved client): the
 * audio is encrypted via sealed box and quarantined for manual admin
 * resolution. Policy: never leave plaintext at the provider, never
 * silently destroy a recording. Encrypt-then-quarantine satisfies both.
 *
 * Raw audio Buffers are zeroed by the follow-up creation function or by
 * sealBufferAndZero in the quarantine path. No plaintext audio is logged
 * or returned.
 */

import type { Kysely } from "kysely";
import type { TelephonyProvider } from "./provider.js";
import type { BlobStore } from "../storage/store.js";
import type { JobQueue } from "../jobs/queue.js";
import type { TenantDatabase } from "../db/types.js";
import type { CallTracker } from "./call-tracker.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { NotificationService } from "../notifications/service.js";
import { TelephonyError } from "../errors.js";
import { deleteOrEnqueue } from "./log-deletion-helpers.js";
import { createEncryptedFollowUp } from "../tickets/server-followup-create.js";
import { resolveInboundTicket } from "./resolve-inbound-ticket.js";
import { quarantineRecording } from "./voicemail-quarantine.js";
import type {
  OrgId,
  OrgSchema,
  OrgSlug,
  QueueId,
  TicketId,
  FollowupId,
  ClientId,
  ChannelRowId,
} from "@care-y/shared";
import {
  type RecordingSid,
  type CallSid,
  recordingSidSchema,
  callSidSchema,
} from "@care-y/shared";
import { findActiveChannel } from "../portal/channel-service.js";

export interface RecordingHandlerDeps {
  readonly provider: TelephonyProvider;
  readonly blobStore: BlobStore;
  readonly jobQueue: JobQueue;
  readonly callTracker: CallTracker;
  readonly getTenantDb: (orgSchema: OrgSchema) => Kysely<TenantDatabase>;
  readonly intakeQueueId: QueueId | null;
  readonly orgSchema: OrgSchema;
  readonly orgId: OrgId;
  readonly sealedBox: SealedBoxEncryptor;
  readonly orgSlug: OrgSlug;
  readonly notificationService: NotificationService;
}

export interface RecordingResult {
  readonly ticketId: TicketId | null;
  readonly followUpId: FollowupId | null;
}

interface ParsedRecordingCallback {
  readonly recordingSid: RecordingSid;
  readonly callSid: CallSid;
  readonly durationSeconds: number;
}

function parseRecordingCallback(
  body: Record<string, string>,
): ParsedRecordingCallback {
  // eslint-disable-next-line @typescript-eslint/dot-notation -- Twilio keys are PascalCase strings, not identifiers
  const recordingSid = body["RecordingSid"];
  // eslint-disable-next-line @typescript-eslint/dot-notation
  const callSid = body["CallSid"];
  // eslint-disable-next-line @typescript-eslint/dot-notation
  const rawDuration = body["RecordingDuration"];

  if (recordingSid === undefined || recordingSid === "") {
    throw new TelephonyError("Missing RecordingSid in recording callback");
  }
  if (callSid === undefined || callSid === "") {
    throw new TelephonyError("Missing CallSid in recording callback");
  }

  const durationSeconds = rawDuration !== undefined ? Number(rawDuration) : 0;
  return {
    recordingSid: recordingSidSchema.parse(recordingSid),
    callSid: callSidSchema.parse(callSid),
    durationSeconds,
  };
}

export async function handleRecordingComplete(
  body: Record<string, string>,
  deps: RecordingHandlerDeps,
): Promise<RecordingResult> {
  const {
    provider,
    blobStore,
    jobQueue,
    callTracker,
    getTenantDb,
    intakeQueueId,
    orgSchema,
    orgId,
    sealedBox,
    orgSlug,
    notificationService,
  } = deps;
  const { recordingSid, callSid, durationSeconds } =
    parseRecordingCallback(body);

  // Look up tracked call for ticket context
  const tracked = await callTracker.get(orgSchema, callSid);

  if (!tracked) {
    // Server restarted mid-call or tracker entry expired.
    // Encrypt and quarantine so the recording is not lost.
    const tDb = getTenantDb(orgSchema);
    await quarantineRecording(
      {
        tDb,
        provider,
        blobStore,
        jobQueue,
        sealedBox,
        orgId,
        orgSchema,
        orgSlug,
        notificationService,
      },
      {
        recordingSid,
        callSid,
        reason: "tracker_miss",
        durationSeconds,
      },
    );
    return { ticketId: null, followUpId: null };
  }

  const callOrgSchema =
    tracked.orgSchema === "" ? orgSchema : tracked.orgSchema;
  const tDb = getTenantDb(callOrgSchema);

  // Resolve ticket: use tracked ticketId if available, otherwise resolve
  let ticketId = tracked.ticketId;

  if (ticketId === "" && tracked.clientId !== null) {
    if (intakeQueueId === null) {
      await quarantineRecording(
        {
          tDb,
          provider,
          blobStore,
          jobQueue,
          sealedBox,
          orgId,
          orgSchema: callOrgSchema,
          orgSlug,
          notificationService,
        },
        {
          recordingSid,
          callSid,
          reason: "no_intake_queue",
          clientId: tracked.clientId,
          durationSeconds,
        },
      );
      return { ticketId: null, followUpId: null };
    }

    ticketId = await resolveInboundTicket(
      tDb,
      tracked.clientId,
      intakeQueueId,
      "Inbound call with voicemail",
    );
  }

  if (ticketId === "") {
    await quarantineRecording(
      {
        tDb,
        provider,
        blobStore,
        jobQueue,
        sealedBox,
        orgId,
        orgSchema: callOrgSchema,
        orgSlug,
        notificationService,
      },
      {
        recordingSid,
        callSid,
        reason: "unresolved_client",
        durationSeconds,
      },
    );
    return { ticketId: null, followUpId: null };
  }

  // Best-effort: resolve the client's active portal channel so voicemail
  // can use the file-key envelope and write a portal carrier row (ADR-092).
  // The clientId comes from the tracked call or, when that is null, from
  // the ticket row. Failure must not affect the forward path.
  let portalSeal:
    | { readonly channelRowId: ChannelRowId; readonly clientPublic: Buffer }
    | undefined;
  try {
    let resolvedClientId: ClientId | null = tracked.clientId;
    if (resolvedClientId === null) {
      const ticketRow = await tDb
        .selectFrom("tickets")
        .select("client_id")
        .where("id", "=", ticketId)
        .executeTakeFirst();
      resolvedClientId = ticketRow?.client_id ?? null;
    }
    if (resolvedClientId !== null) {
      const activeChannel = await findActiveChannel(tDb, resolvedClientId);
      if (activeChannel) {
        portalSeal = {
          channelRowId: activeChannel.id,
          clientPublic: activeChannel.client_public,
        };
      }
    }
  } catch {
    console.warn("Portal seal skipped: channel lookup failed for recording");
  }

  // Fetch raw audio from the provider
  const rawAudio = await provider.getRecording(recordingSid);

  // Create encrypted follow-up with recording data
  const fuResult = await createEncryptedFollowUp(
    tDb,
    ticketId,
    Buffer.from("Voicemail recording", "utf-8"),
    "voicemail",
    "client",
    {
      recording: { data: rawAudio, durationSeconds },
      blobStore,
      orgSchema,
      ...(portalSeal !== undefined ? { portalSeal } : {}),
    },
  );

  // M3: Delete the recording from the provider
  await deleteOrEnqueue(provider, jobQueue, {
    orgId,
    resourceType: "recording",
    resourceId: recordingSid,
  });

  // M1: Delete the call log from the provider
  await deleteOrEnqueue(provider, jobQueue, {
    orgId,
    resourceType: "call",
    resourceId: callSid,
  });

  return { ticketId, followUpId: fuResult.followUpId };
}
