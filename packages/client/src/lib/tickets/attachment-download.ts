/**
 * Shared download-and-decrypt utility for file attachments.
 *
 * Handles the fetch -> decrypt -> blob URL -> browser download pipeline.
 * Both AttachmentChip and TicketPanelContent use this same flow;
 * the calling component owns the downloading-state guard (single boolean
 * vs SvelteSet, respectively).
 */

import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";
import type { TRPCClient } from "@trpc/client";
import type { AppRouter } from "@care-y/server";

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
    deps.keyWrap.ephemeralPoint,
    deps.keyWrap.nonce,
    deps.keyWrap.wrappedKey,
    encryptedBase64,
  );

  const blob = new Blob([decryptedBuf]);
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
