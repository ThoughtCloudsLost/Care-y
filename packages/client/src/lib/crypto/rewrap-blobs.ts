/**
 * Main-thread blob re-wrap orchestration.
 *
 * After the Worker re-encrypts text content (via decryptAndRewrap), the
 * main thread calls this function to handle any blobs (recordings, MMS
 * attachments) on the same follow-up. The flow:
 *
 *  1. Check TanStack Query cache for the follow-up's blob flags
 *  2. If blobs exist: query server for recording/attachment metadata
 *  3. Fetch each encrypted blob via tRPC download endpoints
 *  4. Send to Worker for re-encrypt (tk_temp -> canonical tk)
 *  5. Return re-encrypted blob updates for the rewrapFollowUp mutation
 *
 * The Worker can't call tRPC directly (no auth context), so the main
 * thread fetches encrypted blob data and passes it to the Worker.
 */

import type { TRPCClient } from "@trpc/client";
import type { AppRouter } from "@care-y/server";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { QueryClient } from "@tanstack/svelte-query";
import { ticketKeys } from "$lib/query/keys.js";
import { fetchBlob } from "$lib/utils/fetch-blob.js";

type TicketRouter = NonNullable<TRPCClient<AppRouter>["tickets"]>;

interface BlobUpdate {
  oldBlobKey: string;
  encryptedData: string;
  category: "attachment" | "recording";
}

interface FileKeyUpdate {
  attachmentId: string;
  fileKeyWrap: string;
  /** Filename re-encrypted under the canonical tk, when the row has one. */
  encryptedFilename?: string;
}

interface RecordingFileKeyUpdate {
  recordingId: string;
  fileKeyWrap: string;
}

/**
 * What the follow-up's media needs from the convergence pass.
 *
 * Three shapes, because there are two envelopes applied to two media
 * classes. An attachment or recording carrying a file key wrap is
 * re-wrapped in place: nothing is downloaded and nothing is re-uploaded
 * (ADR-089, ADR-092). Everything else (MMS images and legacy voicemail
 * recordings without a file key) still travels through the browser to
 * be re-encrypted whole.
 */
export interface RewrapMediaUpdates {
  readonly blobUpdates: readonly BlobUpdate[];
  readonly fileKeyUpdates: readonly FileKeyUpdate[];
  readonly recordingFileKeyUpdates: readonly RecordingFileKeyUpdate[];
}

interface FollowUpCacheEntry {
  readonly id?: string;
  readonly hasRecording?: boolean;
  readonly hasImage?: boolean;
  readonly hasFile?: boolean;
}

function followUpHasBlobs(
  ticketId: string,
  followUpId: string,
  queryClient: QueryClient,
): boolean {
  // Follow-up data lives under sub-keys (followUpsInitial, followUpsPage,
  // followUpsByIds), not the parent prefix. Use getQueriesData with the
  // prefix to search all sub-caches.
  const entries = queryClient.getQueriesData<readonly FollowUpCacheEntry[]>({
    queryKey: ticketKeys.followUps(ticketId),
  });

  for (const [, data] of entries) {
    if (!data) continue;
    const fu = data.find((f) => f.id === followUpId);
    if (fu) {
      return (
        (fu.hasRecording ?? false) ||
        (fu.hasImage ?? false) ||
        (fu.hasFile ?? false)
      );
    }
  }

  return false;
}

export async function rewrapBlobsForFollowUp(
  ticketId: string,
  followUpId: string,
  bridge: CryptoBridge,
  ticketRouter: TicketRouter,
  queryClient: QueryClient,
): Promise<RewrapMediaUpdates> {
  if (!followUpHasBlobs(ticketId, followUpId, queryClient)) {
    return { blobUpdates: [], fileKeyUpdates: [], recordingFileKeyUpdates: [] };
  }

  const [recordings, attachments] = await Promise.all([
    ticketRouter.listRecordings.query({
      ticketId,
      followupId: followUpId,
      limit: 200,
    }),
    ticketRouter.listAttachments.query({
      ticketId,
      followupId: followUpId,
      limit: 200,
    }),
  ]);

  const blobUpdates: BlobUpdate[] = [];
  const fileKeyUpdates: FileKeyUpdate[] = [];
  const recordingFileKeyUpdates: RecordingFileKeyUpdate[] = [];

  async function rewrapItems(
    items: readonly { id: string; blobKey: string }[],
    download: (id: string) => Promise<ArrayBuffer>,
    category: "recording" | "attachment",
  ): Promise<void> {
    for (const item of items) {
      const ciphertext = await download(item.id);
      const result = await bridge.rewrapBlob(
        followUpId,
        ticketId,
        ciphertext,
        item.blobKey,
        item.id,
        category,
      );
      blobUpdates.push({
        oldBlobKey: result.blobKey,
        encryptedData: result.encryptedData,
        category: result.category,
      });
    }
  }

  // Recordings: split on fileKeyWrap (ADR-092). Wrapped recordings
  // re-wrap the 32-byte key only, matching the attachment file-key path.
  // Direct (null wrap) recordings still download and re-encrypt whole.
  const wrappedRecordings = recordings.filter((r) => r.fileKeyWrap !== null);
  const directRecordings = recordings.filter((r) => r.fileKeyWrap === null);

  for (const rec of wrappedRecordings) {
    // Non-null by construction of `wrappedRecordings`, and narrowing
    // does not survive the filter callback.
    const wrap = rec.fileKeyWrap ?? "";
    // Recordings have no stored filename, so no encryptedFilename arg.
    const result = await bridge.rewrapFileKey(
      followUpId,
      ticketId,
      rec.id,
      wrap,
    );
    recordingFileKeyUpdates.push({
      recordingId: result.attachmentId,
      fileKeyWrap: result.fileKeyWrap,
    });
  }

  await rewrapItems(
    directRecordings,
    async (id) => fetchBlob(`/api/blobs/recordings/${id}`),
    "recording",
  );

  // An attachment carrying a file key wrap is converged by re-wrapping 32
  // bytes. Downloading the file to re-encrypt it would move the same bytes
  // twice across the network to arrive at ciphertext nobody needed to
  // change (ADR-089).
  const wrapped = attachments.filter((a) => a.fileKeyWrap !== null);
  const direct = attachments.filter((a) => a.fileKeyWrap === null);

  for (const att of wrapped) {
    // Non-null by construction of `wrapped`, and narrowing does not survive
    // the filter callback.
    const wrap = att.fileKeyWrap ?? "";
    const result = await bridge.rewrapFileKey(
      followUpId,
      ticketId,
      att.id,
      wrap,
      att.encryptedFilename ?? undefined,
    );
    fileKeyUpdates.push({
      attachmentId: result.attachmentId,
      fileKeyWrap: result.fileKeyWrap,
      encryptedFilename: result.encryptedFilename,
    });
  }

  await rewrapItems(
    direct,
    async (id) => fetchBlob(`/api/blobs/attachments/${id}`),
    "attachment",
  );

  return { blobUpdates, fileKeyUpdates, recordingFileKeyUpdates };
}
