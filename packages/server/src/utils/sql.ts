/**
 * Escapes SQL LIKE/ILIKE wildcards so user input cannot
 * alter the pattern semantics of a LIKE clause.
 */
export function sanitizeLike(input: string): string {
  return input.replace(/[%_\\]/g, "\\$&");
}

/**
 * Returns a masked phone string (`***NNNN`) from a sealed-box
 * decrypted Buffer. Zeros the buffer before returning.
 */
export function maskPhone(phoneBuf: Buffer): string {
  try {
    const str = phoneBuf.toString("utf-8");
    return `***${str.slice(-4)}`;
  } finally {
    phoneBuf.fill(0);
  }
}

/**
 * Formats an E.164 phone buffer into a human-readable string for admin
 * display. Handles US numbers (+1AAABBBCCCC -> +1 (AAA) BBB-CCCC) and
 * falls back to raw E.164 for other country codes. Zeros the buffer
 * before returning.
 */
export function formatPhone(phoneBuf: Buffer): string {
  try {
    const raw = phoneBuf.toString("utf-8");
    if (raw.startsWith("+1") && raw.length === 12) {
      const area = raw.slice(2, 5);
      const prefix = raw.slice(5, 8);
      const line = raw.slice(8, 12);
      return `+1 (${area}) ${prefix}-${line}`;
    }
    return raw;
  } finally {
    phoneBuf.fill(0);
  }
}
