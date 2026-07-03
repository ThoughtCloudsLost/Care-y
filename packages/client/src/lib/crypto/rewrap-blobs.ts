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

type TicketRouter = NonNullable<TRPCClient<AppRouter>["tickets"]>;

interface BlobUpdate {
  oldBlobKey: string;
  encryptedData: string;
  category: "attachment" | "recording";
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
): Promise<BlobUpdate[]> {
  if (!followUpHasBlobs(ticketId, followUpId, queryClient)) {
    return [];
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

  const updates: BlobUpdate[] = [];

  async function rewrapItems(
    items: readonly { id: string; blobKey: string }[],
    download: (id: string) => Promise<{ data: string }>,
    category: "recording" | "attachment",
  ): Promise<void> {
    for (const item of items) {
      const { data: ciphertext } = await download(item.id);
      const result = await bridge.rewrapBlob(
        followUpId,
        ticketId,
        ciphertext,
        item.blobKey,
        item.id,
        category,
      );
      updates.push({
        oldBlobKey: result.blobKey,
        encryptedData: result.encryptedData,
        category: result.category,
      });
    }
  }

  await rewrapItems(
    recordings,
    async (id) => ticketRouter.downloadRecordingBlob.query({ recordingId: id }),
    "recording",
  );
  await rewrapItems(
    attachments,
    async (id) =>
      ticketRouter.downloadAttachmentBlob.query({ attachmentId: id }),
    "attachment",
  );

  return updates;
}
