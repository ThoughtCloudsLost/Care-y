/**
 * Recording-complete webhook handler. Fetches raw audio from the telephony
 * provider, encrypts it with per-ticket ECIES via createEncryptedFollowUp,
 * stores the ciphertext in BlobStore, then requests deletion of the
 * provider-side recording and call log (GAP-16 mitigations M3 and M1).
 *
 * Raw audio Buffers are zeroed by the follow-up creation function.
 * No plaintext audio is logged or returned.
 */

import type { Kysely } from "kysely";
import type { TelephonyProvider } from "./provider.js";
import type { BlobStore } from "../storage/store.js";
import type { JobQueue } from "../jobs/queue.js";
import type { TenantDatabase } from "../db/types.js";
import type { CallTracker } from "./call-tracker.js";
import { TelephonyError } from "../errors.js";
import { deleteOrEnqueue } from "./log-deletion-helpers.js";
import { createEncryptedFollowUp } from "../tickets/server-followup-create.js";
import { resolveInboundTicket } from "./resolve-inbound-ticket.js";

export interface RecordingHandlerDeps {
  readonly provider: TelephonyProvider;
  readonly blobStore: BlobStore;
  readonly jobQueue: JobQueue;
  readonly callTracker: CallTracker;
  readonly getTenantDb: (orgSchema: string) => Kysely<TenantDatabase>;
  readonly intakeQueueId: string | null;
  readonly orgSchema: string;
  readonly orgId: string;
}

export interface RecordingResult {
  readonly ticketId: string | null;
  readonly followUpId: string | null;
}

interface ParsedRecordingCallback {
  readonly recordingSid: string;
  readonly callSid: string;
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
  return { recordingSid, callSid, durationSeconds };
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
  } = deps;
  const { recordingSid, callSid, durationSeconds } =
    parseRecordingCallback(body);

  // Look up tracked call for ticket context
  const tracked = callTracker.get(callSid);

  if (!tracked) {
    // Server restarted mid-call, tracker entry expired. Schedule cleanup only.
    await deleteOrEnqueue(provider, jobQueue, orgId, "recording", recordingSid);
    await deleteOrEnqueue(provider, jobQueue, orgId, "call", callSid);
    return { ticketId: null, followUpId: null };
  }

  const tDb = getTenantDb(tracked.orgSchema || orgSchema);

  // Resolve ticket: use tracked ticketId if available, otherwise resolve
  let ticketId = tracked.ticketId;

  if (ticketId === "" && tracked.clientId !== null) {
    if (intakeQueueId === null) {
      await deleteOrEnqueue(
        provider,
        jobQueue,
        orgId,
        "recording",
        recordingSid,
      );
      await deleteOrEnqueue(provider, jobQueue, orgId, "call", callSid);
      return { ticketId: null, followUpId: null };
    }

    ticketId = await resolveInboundTicket(
      tDb,
      tracked.clientId,
      intakeQueueId,
      "Inbound call with voicemail",
    );
  }

  if (!ticketId) {
    await deleteOrEnqueue(provider, jobQueue, orgId, "recording", recordingSid);
    await deleteOrEnqueue(provider, jobQueue, orgId, "call", callSid);
    return { ticketId: null, followUpId: null };
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
    },
  );

  // M3: Delete the recording from the provider
  await deleteOrEnqueue(provider, jobQueue, orgId, "recording", recordingSid);

  // M1: Delete the call log from the provider
  await deleteOrEnqueue(provider, jobQueue, orgId, "call", callSid);

  return { ticketId, followUpId: fuResult.followUpId };
}
