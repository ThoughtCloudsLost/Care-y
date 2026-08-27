/**
 * Size limits shared across schema modules.
 *
 * This module must stay a leaf (no imports from sibling schema files).
 * It exists to break the import cycle kb -> tickets -> client-portal ->
 * intake-forms -> kb that a direct cross-import of these constants creates.
 */

/** 10MB in bytes. Enforced client-side and server-side. */
export const KB_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
