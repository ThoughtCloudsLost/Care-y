/**
 * Shared download-and-decrypt utility for file attachments, plus
 * MIME type helpers (icon mapping, label extraction, file type display).
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
import {
  Paperclip,
  FileText,
  FileArchive,
  FileSpreadsheet,
  FileHeadphone,
  FilePlay,
  File,
  type LucideIcon,
} from "@lucide/svelte";

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

// ── MIME type helpers ──────────────────────────────────────────────────

/** Map MIME content type to a Lucide icon component. */
export function fileIcon(ct: string | null): LucideIcon {
  if (ct === null || ct === "") return File;
  if (ct.startsWith("text/")) return FileText;
  if (ct === "application/pdf") return FileText;
  if (ct === "application/msword") return FileText;
  if (
    ct ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return FileText;
  if (
    ct === "application/zip" ||
    ct === "application/gzip" ||
    ct === "application/x-tar" ||
    ct === "application/x-7z-compressed" ||
    ct === "application/x-rar-compressed"
  )
    return FileArchive;
  if (
    ct === "application/vnd.ms-excel" ||
    ct ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    ct === "text/csv"
  )
    return FileSpreadsheet;
  if (ct.startsWith("audio/")) return FileHeadphone;
  if (ct.startsWith("video/")) return FilePlay;
  return Paperclip;
}

/** Known MIME type to short label mapping. */
const MIME_LABELS = new Map<string, string>([
  ["application/pdf", "PDF"],
  ["application/zip", "ZIP"],
  ["application/gzip", "GZIP"],
  ["application/x-tar", "TAR"],
  ["application/x-7z-compressed", "7Z"],
  ["application/x-rar-compressed", "RAR"],
  ["application/vnd.ms-excel", "XLS"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "XLSX"],
  ["application/msword", "DOC"],
  [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "DOCX",
  ],
  ["application/vnd.ms-powerpoint", "PPT"],
  [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "PPTX",
  ],
  ["text/plain", "TXT"],
  ["text/csv", "CSV"],
  ["text/html", "HTML"],
  ["application/json", "JSON"],
  ["application/xml", "XML"],
]);

/** Extract short label from MIME type (e.g. "application/pdf" -> "PDF"). */
export function fileTypeLabel(ct: string | null): string {
  if (ct === null || ct === "") return "";
  const known = MIME_LABELS.get(ct);
  if (known !== undefined) return known;
  const sub = ct.split("/")[1];
  if (sub === undefined || sub === "") return "";
  return sub.replace(/^x-/, "").toUpperCase();
}
