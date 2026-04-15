/**
 * Shared download utilities and MIME type helpers for file attachments.
 *
 * Decryption-agnostic: provides the browser download pipeline
 * (blob URL creation, anchor click, URL revocation) and MIME type
 * display helpers (icon mapping, label extraction). Both ticket and KB
 * attachment components use these shared utilities while plugging in
 * their own decryption layer.
 */

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

/**
 * Trigger a browser file download from a decrypted buffer.
 *
 * Creates a temporary blob URL, clicks a programmatic anchor, and
 * immediately revokes the URL. The caller decrypts the data before
 * passing it here.
 */
export function triggerBlobDownload(
  decryptedBuf: Uint8Array | ArrayBuffer,
  filename: string,
): void {
  const blob = new Blob([new Uint8Array(decryptedBuf)]);
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

// -- MIME type helpers -------------------------------------------------------

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
