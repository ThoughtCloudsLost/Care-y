/**
 * Size limits shared across schema modules.
 *
 * This module must stay a leaf (no imports from sibling schema files).
 * It exists to break the import cycle kb -> tickets -> client-portal ->
 * intake-forms -> kb that a direct cross-import of these constants creates.
 */

/** 10MB in bytes. Enforced client-side and server-side. */
export const KB_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

/**
 * Ciphertext cap for one attachment on a portal-tier ticket, enforced on
 * the server against the uploaded bytes.
 *
 * The server holds ciphertext and can measure it. It cannot inspect it, so
 * this cap and the declared content type are the only checks it can make
 * (ADR-089).
 */
export const PORTAL_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

/**
 * Plaintext cap the browser applies before encrypting.
 *
 * The slack covers the AEAD envelope. Without it a file sized exactly at
 * the limit passes the browser check and fails the server one by its own
 * nonce and tag, which reads to the person sending it as the app rejecting
 * a file it just accepted.
 */
export const PORTAL_ATTACHMENT_MAX_PLAINTEXT_BYTES =
  PORTAL_ATTACHMENT_MAX_BYTES - 1024;

/** Attachments one follow-up may carry. Bounds a single request's work. */
export const PORTAL_ATTACHMENTS_PER_MESSAGE = 5;

/**
 * Newest non-system follow-up timestamps returned per ticket by
 * listReadState. Bounds the payload for a 50-ticket window; client-side
 * unread counts cap at this window size by design.
 *
 * The browser reads this to tell a saturated count from an exact one:
 * when all timestamps in the window are newer than the cursor AND the
 * window is full, the true count may be higher than what was returned.
 */
export const READ_STATE_TIMESTAMPS_PER_TICKET = 20;

/**
 * Most ids one filter request may name (queues, categories). Far above any
 * real organization's count, so it only bounds the work a single request
 * can ask of the server.
 */
export const FILTER_ID_LIST_MAX = 200;
