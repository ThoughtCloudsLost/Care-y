/**
 * Recording decrypt callback builder for the org surface.
 *
 * VoicemailPlayer is crypto-agnostic (it takes an injected decrypt
 * callback, mirroring MmsImage), so the envelope branch lives at the
 * call site. Two envelopes exist (ADR-089, ADR-092): a non-null
 * fileKeyWrap means the blob is encrypted under a per-file key that the
 * Worker unwraps first; a null wrap means the blob is encrypted directly
 * under the follow-up key, reached through the ticket key wrap.
 *
 * Shared by FollowUpMedia and PanelMediaSection so the branch cannot
 * drift between the thread and the panel.
 */

import { blobSlot } from "@care-y/crypto";
import { ClientError } from "$lib/errors.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";

export function buildRecordingDecrypt(
  bridge: CryptoBridge,
  ticketId: string,
  keyWrap: TicketKeyWrap | null,
  recordingId: string,
  fileKeyWrap: string | null,
): (ciphertext: ArrayBuffer) => Promise<ArrayBuffer> {
  if (fileKeyWrap !== null) {
    // File-key envelope: the Worker unwraps the file key at the
    // filekey slot, then decrypts the blob. The recording row id goes
    // in the attachmentId position because the AAD binds row ids, not
    // table identity.
    return async (ct: ArrayBuffer): Promise<ArrayBuffer> =>
      bridge.decryptAttachment(ticketId, recordingId, fileKeyWrap, ct);
  }
  if (keyWrap === null) {
    return async (): Promise<ArrayBuffer> =>
      Promise.reject(
        new ClientError("No ticket key wrap available for recording"),
      );
  }
  const wrap = keyWrap;
  return async (ct: ArrayBuffer): Promise<ArrayBuffer> =>
    bridge.decryptBlob(
      ticketId,
      blobSlot(recordingId),
      wrap.ephemeralPoint,
      wrap.nonce,
      wrap.wrappedKey,
      ct,
    );
}
