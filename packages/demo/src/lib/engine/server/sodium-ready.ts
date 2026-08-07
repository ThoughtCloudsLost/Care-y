/**
 * Shared sodium readiness gate.
 *
 * A single boolean + setter + assertion used by every server shim that
 * depends on libsodium being initialized. bootDemoEngine calls
 * markSodiumReady() once after `await _sodium.ready`; every consumer
 * calls assertSodiumReady() before touching any sodium API.
 */

import { DemoEngineError } from "../errors.js";

let ready = false;

/** Called once by engine.ts after `await _sodium.ready`. */
export function markSodiumReady(): void {
  ready = true;
}

/** Throws if sodium has not been initialized yet. */
export function assertSodiumReady(): void {
  if (!ready) {
    throw new DemoEngineError(
      "Sodium shim called before sodium.ready was awaited. " +
        "bootDemoEngine must call markSodiumReady() first.",
    );
  }
}
