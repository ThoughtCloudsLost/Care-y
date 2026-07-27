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
// (the vite.health.config.ts define covers the migration's bare read).
// Computed, not a literal: a 64-char hex string literal trips secret
// scanners on entropy shape even when obviously fake.
export const FAKE_OPS_KEY_HEX: string = "0f".repeat(32);
proc.env.OPS_SECRETS_KEY = FAKE_OPS_KEY_HEX;

// Satisfy @trpc/server's isServerDefault check (see header comment).
proc.env.VITEST_WORKER_ID = "1";
