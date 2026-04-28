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
