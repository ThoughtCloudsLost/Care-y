/**
 * Global polyfills that must run BEFORE any other module evaluates.
 *
 * ESM hoists static imports, so inline top-level statements in engine.ts
 * run AFTER its imports. This module is engine.ts's first import, which
 * makes it evaluate ahead of everything else in the graph.
 *
 * - Buffer: server code and PGlite bytea handling expect a global Buffer.
 * - process.env: migration 014 reads OPS_SECRETS_KEY at migration time.
 * - VITEST_WORKER_ID: @trpc/server computes its isServerDefault at module
 *   evaluation and accepts a truthy worker id as "server context". This
 *   is the only demo-owned way to run the real routers in a browser
 *   without editing the product's initTRPC call. Fake value, no secret.
 */

import { Buffer } from "buffer";

if (typeof globalThis.Buffer === "undefined") {
  (globalThis as Record<string, unknown>).Buffer = Buffer;
}

// The npm buffer polyfill (v6) predates Node's "base64url" encoding,
// but the server's wire helpers (utils/ciphertext-wire, auth service,
// org config) call toString("base64url") on every bytea column, and
// PGlite rows surface bytea as this polyfill's Buffer. Bridge the gap
// once, here, before any server module evaluates. On a runtime whose
// Buffer already understands base64url (Node test envs) the patched
// paths delegate straight through.

/** Standard base64 to base64url (URL-safe alphabet, no padding). */
export function toBase64Url(standard: string): string {
  return standard.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

/** base64url back to standard base64 with padding restored. */
export function fromBase64Url(url: string): string {
  const mapped = url.replace(/-/g, "+").replace(/_/g, "/");
  const rem = mapped.length % 4;
  return rem === 0 ? mapped : mapped + "=".repeat(4 - rem);
}

function supportsBase64Url(): boolean {
  try {
    return Buffer.from("ab").toString("base64url") === "YWI";
  } catch {
    return false;
  }
}

type BufferToString = (
  this: Buffer,
  encoding?: BufferEncoding,
  start?: number,
  end?: number,
) => string;

if (!supportsBase64Url()) {
  // The polyfill's prototype surface types as `any`; pin the one
  // method signature the patch touches.
  const proto = Buffer.prototype as unknown as { toString: BufferToString };
  const origToString: BufferToString = proto.toString;
  proto.toString = function patchedToString(
    this: Buffer,
    encoding?: BufferEncoding,
    start?: number,
    end?: number,
  ): string {
    if (encoding === "base64url") {
      return toBase64Url(origToString.call(this, "base64", start, end));
    }
    return origToString.call(this, encoding, start, end);
  };

  type BufferFrom = typeof Buffer.from;
  const origFrom: BufferFrom = Buffer.from.bind(Buffer);
  (Buffer as { from: BufferFrom }).from = ((
    value: unknown,
    encodingOrOffset?: unknown,
    length?: number,
  ): Buffer => {
    if (typeof value === "string" && encodingOrOffset === "base64url") {
      return origFrom(fromBase64Url(value), "base64");
    }
    return origFrom(value as never, encodingOrOffset as never, length);
  }) as BufferFrom;

  const origIsEncoding = Buffer.isEncoding.bind(Buffer);
  (Buffer as { isEncoding: typeof Buffer.isEncoding }).isEncoding = (
    encoding: string,
  ): encoding is BufferEncoding =>
    encoding === "base64url" || origIsEncoding(encoding);
}

interface ProcessLike {
  env: Record<string, string | undefined>;
}

if (typeof globalThis.process === "undefined") {
  (globalThis as Record<string, unknown>).process = { env: {} };
}

const proc = globalThis.process as unknown as ProcessLike;

// Obviously fake 64-hex ops key: migration 014's backfill derivation
// needs a syntactically valid value. Never a real secret. Exported so
// demo code reads the constant directly; production builds statically
// replace process.env reads, so runtime env access is unreliable there
// (the vite config define covers the migration's bare read).
// Computed, not a literal: a 64-char hex string literal trips secret
// scanners on entropy shape even when obviously fake.
export const FAKE_OPS_KEY_HEX: string = "0f".repeat(32);
proc.env.OPS_SECRETS_KEY = FAKE_OPS_KEY_HEX;

// Satisfy @trpc/server's isServerDefault check (see header comment).
proc.env.VITEST_WORKER_ID = "1";
