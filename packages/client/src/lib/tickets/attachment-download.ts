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
import { fetchBlob } from "$lib/utils/fetch-blob.js";
import { triggerBlobDownload } from "$lib/components/shared/attachment-download.js";

// Re-export shared utilities so existing callers don't need path changes
export {
  fileIcon,
  fileTypeLabel,
  triggerBlobDownload,
} from "$lib/components/shared/attachment-download.js";

export interface DownloadDeps {
  bridge: CryptoBridge;
  ticketId: string;
  keyWrap: TicketKeyWrap;
}

export async function downloadDecryptedAttachment(
  attachmentId: string,
  filename: string,
  deps: DownloadDeps,
): Promise<void> {
  const ciphertext = await fetchBlob(`/api/blobs/attachments/${attachmentId}`);

  const decryptedBuf = await deps.bridge.decryptBlob(
    deps.ticketId,
    blobSlot(attachmentId),
    deps.keyWrap.ephemeralPoint,
    deps.keyWrap.nonce,
    deps.keyWrap.wrappedKey,
    ciphertext,
  );

  triggerBlobDownload(decryptedBuf, filename);
}
