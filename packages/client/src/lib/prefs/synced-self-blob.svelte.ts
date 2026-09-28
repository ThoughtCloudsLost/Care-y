/**
 * One per-user document held in memory and mirrored to the server as a
 * self-blob envelope: sealed to the user's own vol_public by the crypto
 * Worker, stored as ciphertext only, readable by nobody else.
 *
 * Sync rules shared by every consumer:
 * - hydration runs once per session (clear() resets it);
 * - changes made before hydration completes win the merge;
 * - pushes are debounced, and a failed push leaves the document dirty and
 *   retries on the next change, flush, or debounce tick;
 * - an unopenable envelope (vol keys rotated by a password change) or a
 *   payload that fails parse loads the default, and the next push
 *   overwrites the stored copy;
 * - the document is registered with CacheRegistry so logout and idle
 *   teardown clear it.
 *
 * Push failures surface through saveStatus rather than disappearing into
 * the console, so a surface can tell the user a change was not saved.
 */

import { untrack } from "svelte";
import { cacheRegistry } from "$lib/crypto/cache-registry.js";
import {
  uint8ArrayToBase64,
  base64ToUint8Array,
} from "$lib/utils/buffer-encoding.js";

export interface SelfBlobEnvelope {
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly wrappedPayload: string;
}

export type SelfBlobSaveStatus = "idle" | "saving" | "error";

const DEFAULT_PUSH_DELAY_MS = 4_000;

/**
 * Server storage and Worker crypto for one self-blob. Every consumer wires
 * the same bridge calls; only the tRPC procedures differ.
 */
export interface SelfBlobTransport {
  /** Fetch the stored envelope; null when the user has none. */
  readonly fetchEnvelope: () => Promise<SelfBlobEnvelope | null>;
  /** Store an envelope (last write wins). */
  readonly pushEnvelope: (envelope: SelfBlobEnvelope) => Promise<void>;
  /** Seal a base64 payload to the user's own vol_public (Worker self-blob). */
  readonly seal: (dataB64: string) => Promise<SelfBlobEnvelope>;
  /** Open a self-blob envelope; rejects when unopenable (e.g. rotated keys). */
  readonly open: (envelope: SelfBlobEnvelope) => Promise<string>;
}

export interface SyncedSelfBlobDeps<T> extends SelfBlobTransport {
  /** CacheRegistry key; a later document with the same name replaces it. */
  readonly cacheName: string;
  /** Log prefix. Logs carry error messages only, never document content. */
  readonly logTag: string;
  /** Decoded JSON to document; null when the payload is not acceptable. */
  readonly parse: (json: unknown) => T | null;
  /** Document to the JSON value sealed into the envelope. */
  readonly serialize: (value: T) => unknown;
  /** Fresh default document: initial state, clear(), and failed loads. */
  readonly defaultValue: () => T;
  /** Debounce delay for server pushes. */
  readonly pushDelayMs?: number;
  /**
   * Combine the in-memory document with the hydrated one. Without it the
   * local document wins if it changed this session, else the stored one.
   */
  readonly merge?: (local: T, remote: T) => T;
  /** Runs after a successful hydration with the merged document. */
  readonly onHydrated?: (value: T) => void;
}

export interface SyncedSelfBlob<T> {
  /** Current document. Reactive. */
  readonly value: T;
  /** True once the stored document has been loaded (or failed to load). Reactive. */
  readonly hydrated: boolean;
  /** State of the most recent push. Reactive. */
  readonly saveStatus: SelfBlobSaveStatus;
  /** Replace the document and schedule a push. */
  update(fn: (current: T) => T): void;
  /** Load and merge the stored envelope once per session. Fire and forget. */
  ensureHydrated(): void;
  /** Push any pending changes immediately (tests, teardown). */
  flush(): Promise<void>;
  /** Reset to the default and drop pending work. Called by CacheRegistry. */
  clear(): void;
}

/** Encode a JSON value as the base64 payload sealed into an envelope. */
export function encodeSelfBlobPayload(json: unknown): string {
  return uint8ArrayToBase64(new TextEncoder().encode(JSON.stringify(json)));
}

/** Decode a base64 payload back to JSON. Throws on malformed input. */
export function decodeSelfBlobPayload(dataB64: string): unknown {
  const parsed: unknown = JSON.parse(
    new TextDecoder().decode(base64ToUint8Array(dataB64)),
  );
  return parsed;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "unknown error";
}

export function createSyncedSelfBlob<T>(
  deps: SyncedSelfBlobDeps<T>,
): SyncedSelfBlob<T> {
  const pushDelayMs = deps.pushDelayMs ?? DEFAULT_PUSH_DELAY_MS;
  // Reactive for readers. Internal reads go through untrack: callers run
  // ensureHydrated, update and flush from $effect blocks, and a tracked
  // read there would re-run the effect on every write (a clear() at idle
  // teardown would immediately re-trigger hydration).
  let value = $state.raw<T>(deps.defaultValue());
  let hydration = $state<"idle" | "pending" | "done">("idle");
  let saveStatus = $state<SelfBlobSaveStatus>("idle");

  let pushTimer: ReturnType<typeof setTimeout> | null = null;
  let pushing = false;
  let dirty = false;
  // Changed locally since the last clear(). Drives the default merge:
  // a push that lands before hydration clears `dirty`, but the local
  // document must still win over the older stored copy.
  let touched = false;
  // Bumped by clear(). Async work started before a clear (a hydration
  // or push still in flight at logout) must not write into the cleared
  // document or reschedule a push of it.
  let generation = 0;

  function parseOrNull(dataB64: string): T | null {
    try {
      return deps.parse(decodeSelfBlobPayload(dataB64));
    } catch {
      return null;
    }
  }

  function schedulePush(): void {
    dirty = true;
    if (pushTimer !== null) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
      pushTimer = null;
      void doPush();
    }, pushDelayMs);
  }

  async function doPush(): Promise<void> {
    if (pushing || !dirty) return;
    const started = generation;
    pushing = true;
    dirty = false;
    saveStatus = "saving";
    try {
      const envelope = await deps.seal(
        encodeSelfBlobPayload(deps.serialize(untrack(() => value))),
      );
      await deps.pushEnvelope(envelope);
      if (started === generation) saveStatus = "idle";
    } catch (err: unknown) {
      if (started === generation) {
        // Recovery path: keep the document local for this session, report
        // the failure, and retry. No content in the log.
        dirty = true;
        saveStatus = "error";
        console.warn(`[${deps.logTag}] push failed:`, errorMessage(err));
      }
    } finally {
      pushing = false;
      if (dirty && pushTimer === null) schedulePush();
    }
  }

  async function hydrate(): Promise<void> {
    const started = generation;
    let remote: T = deps.defaultValue();
    try {
      const envelope = await deps.fetchEnvelope();
      if (envelope) {
        let dataB64: string | null;
        try {
          dataB64 = await deps.open(envelope);
        } catch {
          // Unopenable envelope (vol keys rotated by a password change).
          // Start from the default; the next push overwrites it.
          dataB64 = null;
        }
        if (dataB64 !== null) remote = parseOrNull(dataB64) ?? remote;
      }
    } catch (err: unknown) {
      if (started !== generation) return;
      // Fetch failed. Mark done so a reactive caller does not retry in a
      // tight loop. clear() (re-login, re-init) resets hydration.
      hydration = "done";
      console.warn(`[${deps.logTag}] hydration failed:`, errorMessage(err));
      return;
    }
    if (started !== generation) return;

    if (deps.merge) {
      value = deps.merge(value, remote);
    } else if (!touched) {
      value = remote;
    }
    hydration = "done";
    deps.onHydrated?.(value);

    // Local changes made before hydration completed are not in the
    // stored envelope yet; push the merged document.
    if (dirty) void doPush();
  }

  const blob: SyncedSelfBlob<T> = {
    get value(): T {
      return value;
    },

    get hydrated(): boolean {
      return hydration === "done";
    },

    get saveStatus(): SelfBlobSaveStatus {
      return saveStatus;
    },

    update(fn: (current: T) => T): void {
      value = fn(untrack(() => value));
      touched = true;
      schedulePush();
    },

    ensureHydrated(): void {
      if (untrack(() => hydration) !== "idle") return;
      hydration = "pending";
      void hydrate();
    },

    async flush(): Promise<void> {
      if (pushTimer !== null) {
        clearTimeout(pushTimer);
        pushTimer = null;
      }
      await doPush();
    },

    clear(): void {
      generation += 1;
      value = deps.defaultValue();
      hydration = "idle";
      saveStatus = "idle";
      dirty = false;
      touched = false;
      if (pushTimer !== null) {
        clearTimeout(pushTimer);
        pushTimer = null;
      }
    },
  };

  cacheRegistry.register(deps.cacheName, blob);
  return blob;
}
