/**
 * Ticket-specific attachment download pipeline.
 *
 * Fetches an encrypted attachment blob via the ticket tRPC router,
 * decrypts it through the crypto Worker (ECIES per-ticket key), then
 * triggers a browser download via the shared download utility.
 *
 * MIME type helpers (fileIcon, fileTypeLabel) and the browser download
 * trigger (triggerBlobDownload) live in the shared attachment-download
 * module. Re-exported here for backwards compatibility with existing
 * ticket component imports.
 */

import { blobSlot } from "@care-y/crypto";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";
import type { TRPCClient } from "@trpc/client";
import type { AppRouter } from "@care-y/server";
import { triggerBlobDownload } from "$lib/components/shared/attachment-download.js";

// Re-export shared utilities so existing callers don't need path changes
export {
  fileIcon,
  fileTypeLabel,
  triggerBlobDownload,
} from "$lib/components/shared/attachment-download.js";

type TicketRouter = NonNullable<TRPCClient<AppRouter>["tickets"]>;

export interface DownloadDeps {
  ticketRouter: TicketRouter;
  bridge: CryptoBridge;
  ticketId: string;
  keyWrap: TicketKeyWrap;
}

/**
 * Fetch an encrypted attachment blob, decrypt it via the crypto Worker,
 * and trigger a browser file download.
 *
 * The calling component owns the downloading-state guard (to prevent
 * duplicate clicks) and error catching if toast feedback is desired.
 */
export async function downloadDecryptedAttachment(
  attachmentId: string,
  filename: string,
  deps: DownloadDeps,
): Promise<void> {
  const { data: encryptedBase64 } =
    await deps.ticketRouter.downloadAttachmentBlob.query({ attachmentId });

  const decryptedBuf = await deps.bridge.decryptBlob(
    deps.ticketId,
    blobSlot(attachmentId),
    deps.keyWrap.ephemeralPoint,
    deps.keyWrap.nonce,
    deps.keyWrap.wrappedKey,
    encryptedBase64,
  );

  triggerBlobDownload(decryptedBuf, filename);
}
