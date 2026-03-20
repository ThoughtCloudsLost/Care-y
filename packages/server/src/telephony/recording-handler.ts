/**
 * Recording-complete webhook handler. Fetches raw audio from the telephony
 * provider, encrypts it with sealed-box (server-blind), stores the ciphertext
 * in BlobStore, then requests deletion of the provider-side recording and
 * call log (GAP-16 mitigations M3 and M1).
 *
 * Raw audio Buffers are zeroed immediately after encryption. No plaintext
 * audio is logged or returned.
 */

import type { TelephonyProvider } from "./provider.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { BlobStore } from "../storage/store.js";
import type { JobQueue } from "../jobs/queue.js";
import { TelephonyError } from "../errors.js";

export interface RecordingHandlerDeps {
  readonly provider: TelephonyProvider;
  readonly sealedBox: SealedBoxEncryptor;
  readonly blobStore: BlobStore;
  readonly jobQueue: JobQueue;
  readonly orgSchema: string;
  readonly orgId: string;
}

export interface RecordingResult {
  readonly blobKey: string;
  readonly durationSeconds: number;
}

/**
 * Process a recording-complete callback. Fetches the audio, encrypts it,
 * stores the ciphertext, and schedules provider-side deletion.
 *
 * Deletion failures are non-fatal: they enqueue a retry job rather than
 * failing the entire recording ingest. The caller still gets a valid
 * RecordingResult so the voicemail can be linked to a ticket.
 */
export async function handleRecordingComplete(
  body: Record<string, string>,
  deps: RecordingHandlerDeps,
): Promise<RecordingResult> {
  const { provider, sealedBox, blobStore, jobQueue, orgSchema, orgId } = deps;

  // eslint-disable-next-line @typescript-eslint/dot-notation
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

  // Fetch raw audio from the provider
  let rawAudio: Buffer | null = null;
  let encryptedAudio: Buffer;
  try {
    rawAudio = await provider.getRecording(recordingSid);
    encryptedAudio = sealedBox.sealBuffer(rawAudio);
  } finally {
    if (rawAudio !== null) {
      rawAudio.fill(0);
    }
  }

  // Store encrypted audio in BlobStore
  const blobKey = await blobStore.put(orgSchema, "recording", encryptedAudio);

  // M3: Delete the recording from the provider. Enqueue retry on failure.
  try {
    await provider.deleteRecording(recordingSid);
  } catch {
    await jobQueue.enqueue("log-deletion", {
      orgId,
      resourceType: "recording",
      resourceId: recordingSid,
    });
  }

  // M1: Delete the call log from the provider. Enqueue retry on failure.
  try {
    await provider.deleteCallLog(callSid);
  } catch {
    await jobQueue.enqueue("log-deletion", {
      orgId,
      resourceType: "call",
      resourceId: callSid,
    });
  }

  return { blobKey, durationSeconds };
}
