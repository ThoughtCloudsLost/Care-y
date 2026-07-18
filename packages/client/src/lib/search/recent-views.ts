/**
 * Recently-viewed entities (tickets, KB articles) for the search overlay.
 *
 * The list lives in memory (SvelteMap, cleared through CacheRegistry on
 * logout and idle teardown) and is mirrored to the server as a single
 * self-blob envelope on user_recent_views, sealed to the user's own
 * vol_public. The server stores ciphertext only; other volunteers can
 * never read it; history survives reloads and devices.
 *
 * The payload holds entity IDs and timestamps only, never titles. The
 * overlay re-resolves IDs through the live search providers, so entries
 * the user can no longer access fail to resolve and are not shown.
 *
 * Password change rotates vol keys, which makes the stored envelope
 * unopenable. Hydration treats that as an empty history and the next
 * push overwrites the envelope (accepted reset, documented in the ADR).
 */

import { SvelteMap } from "svelte/reactivity";
import { cacheRegistry } from "$lib/crypto/cache-registry.js";
import {
  uint8ArrayToBase64,
  base64ToUint8Array,
} from "$lib/utils/buffer-encoding.js";

export type RecentViewType = "ticket" | "article";

export interface RecentViewEntry {
  readonly type: RecentViewType;
  readonly id: string;
  /** Client clock, epoch ms. Ordering and merge only; never sent in plaintext. */
  readonly viewedAt: number;
}

export interface RecentViewsEnvelope {
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly wrappedPayload: string;
}

export interface RecentViewsDeps {
  /** Fetch the stored envelope; null when the user has none. */
  readonly fetchEnvelope: () => Promise<RecentViewsEnvelope | null>;
  /** Store an envelope (last write wins). */
  readonly pushEnvelope: (envelope: RecentViewsEnvelope) => Promise<void>;
  /** Seal a base64 payload to the user's own vol_public (Worker self-blob). */
  readonly seal: (dataB64: string) => Promise<RecentViewsEnvelope>;
  /** Open a self-blob envelope; rejects when unopenable (e.g. rotated keys). */
  readonly open: (envelope: RecentViewsEnvelope) => Promise<string>;
  /** Ensure raw ticket rows for these IDs are in the query cache. */
  readonly prefetchTickets: (ids: readonly string[]) => Promise<void>;
  /** Injectable clock for tests. */
  readonly now?: () => number;
  /** Debounce delay for server pushes. */
  readonly pushDelayMs?: number;
}

const MAX_PER_TYPE = 10;
const MAX_TOTAL = 20;
const DEFAULT_PUSH_DELAY_MS = 4_000;
const PAYLOAD_VERSION = 1;

interface RecentViewsPayload {
  readonly v: number;
  readonly entries: readonly RecentViewEntry[];
}

function isRecentViewEntry(value: unknown): value is RecentViewEntry {
  if (typeof value !== "object" || value === null) return false;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- guarded by typeof+null check above
  const obj = value as Record<string, unknown>;
  return (
    (obj.type === "ticket" || obj.type === "article") &&
    typeof obj.id === "string" &&
    obj.id.length > 0 &&
    typeof obj.viewedAt === "number" &&
    Number.isFinite(obj.viewedAt)
  );
}

/** Serialize entries to the base64 payload sealed into the envelope. */
export function serializePayload(entries: readonly RecentViewEntry[]): string {
  const payload: RecentViewsPayload = { v: PAYLOAD_VERSION, entries };
  return uint8ArrayToBase64(new TextEncoder().encode(JSON.stringify(payload)));
}

/**
 * Parse a base64 payload back into entries. Malformed or unknown-version
 * payloads yield an empty list: the recovery path is a fresh history,
 * overwritten by the next push.
 */
export function parsePayload(dataB64: string): readonly RecentViewEntry[] {
  try {
    const json = new TextDecoder().decode(base64ToUint8Array(dataB64));
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null) return [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- guarded by typeof+null check above
    const obj = parsed as Record<string, unknown>;
    if (obj.v !== PAYLOAD_VERSION || !Array.isArray(obj.entries)) return [];
    return obj.entries.filter(isRecentViewEntry);
  } catch {
    return [];
  }
}

export interface RecentViews {
  /** All entries, most recently viewed first. Reactive. */
  readonly entries: readonly RecentViewEntry[];
  /** Entries of one type, most recently viewed first. Reactive. */
  entriesOf(type: RecentViewType): readonly RecentViewEntry[];
  /** Record a view. Dedupes by entity, caps the list, schedules a push. */
  record(type: RecentViewType, id: string): void;
  /** Load and merge the server envelope once per session. Fire and forget. */
  ensureHydrated(): void;
  /** Push any pending changes immediately (tests, teardown). */
  flush(): Promise<void>;
  /** Clear all entries and pending work. Called by CacheRegistry. */
  clear(): void;
}

export function createRecentViews(deps: RecentViewsDeps): RecentViews {
  const now = deps.now ?? Date.now;
  const pushDelayMs = deps.pushDelayMs ?? DEFAULT_PUSH_DELAY_MS;

  // Keyed by `${type}:${id}`. SvelteMap so reads inside $derived are
  // tracked and the overlay updates as views are recorded.
  const byKey = new SvelteMap<string, RecentViewEntry>();

  let hydration: "idle" | "pending" | "done" = "idle";
  let pushTimer: ReturnType<typeof setTimeout> | null = null;
  let pushing = false;
  let dirty = false;

  function sorted(): readonly RecentViewEntry[] {
    return [...byKey.values()].sort((a, b) => b.viewedAt - a.viewedAt);
  }

  function applyCaps(): void {
    let tickets = 0;
    let articles = 0;
    let total = 0;
    for (const entry of sorted()) {
      total += 1;
      const typeCount =
        entry.type === "ticket" ? (tickets += 1) : (articles += 1);
      if (typeCount > MAX_PER_TYPE || total > MAX_TOTAL) {
        byKey.delete(`${entry.type}:${entry.id}`);
      }
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
    pushing = true;
    dirty = false;
    try {
      const envelope = await deps.seal(serializePayload(sorted()));
      await deps.pushEnvelope(envelope);
    } catch (err: unknown) {
      // Recovery path: keep the history local for this session and retry
      // on the next recorded view. No IDs in the log (activity metadata).
      dirty = true;
      console.warn(
        "[recent-views] push failed:",
        err instanceof Error ? err.message : "unknown error",
      );
    } finally {
      pushing = false;
      if (dirty && pushTimer === null) schedulePush();
    }
  }

  async function hydrate(): Promise<void> {
    let serverEntries: readonly RecentViewEntry[] = [];
    try {
      const envelope = await deps.fetchEnvelope();
      if (envelope) {
        try {
          serverEntries = parsePayload(await deps.open(envelope));
        } catch {
          // Unopenable envelope (vol keys rotated by a password change).
          // Start fresh; the next push overwrites it.
          serverEntries = [];
        }
      }
    } catch (err: unknown) {
      // Fetch failed. Mark done so the reactive $effect does not retry
      // in a tight loop. The next initRecentViews call (re-login, effect
      // re-run) resets hydration via clear().
      hydration = "done";
      console.warn(
        "[recent-views] hydration failed:",
        err instanceof Error ? err.message : "unknown error",
      );
      return;
    }

    // Merge under local entries: anything recorded this session is newer
    // than the stored copy of the same entity.
    for (const entry of serverEntries) {
      const key = `${entry.type}:${entry.id}`;
      if (!byKey.has(key)) byKey.set(key, entry);
    }
    applyCaps();
    hydration = "done";

    const ticketIds = sorted()
      .filter((e) => e.type === "ticket")
      .map((e) => e.id);
    if (ticketIds.length > 0) {
      deps.prefetchTickets(ticketIds).catch((err: unknown) => {
        // Unresolved entries are simply not rendered; nothing to repair.
        console.warn(
          "[recent-views] ticket prefetch failed:",
          err instanceof Error ? err.message : "unknown error",
        );
      });
    }

    // Local views recorded before hydration completed are not in the
    // stored envelope yet; push the merged list.
    if (dirty) void doPush();
  }

  return {
    get entries(): readonly RecentViewEntry[] {
      return sorted();
    },

    entriesOf(type: RecentViewType): readonly RecentViewEntry[] {
      return sorted().filter((e) => e.type === type);
    },

    record(type: RecentViewType, id: string): void {
      if (id.length === 0) return;
      byKey.delete(`${type}:${id}`);
      byKey.set(`${type}:${id}`, { type, id, viewedAt: now() });
      applyCaps();
      schedulePush();
    },

    ensureHydrated(): void {
      if (hydration !== "idle") return;
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
      byKey.clear();
      hydration = "idle";
      dirty = false;
      if (pushTimer !== null) {
        clearTimeout(pushTimer);
        pushTimer = null;
      }
    },
  };
}

// ── Module singleton ─────────────────────────────────────────────────
// AppShell wires the real deps after login. Components call the facade;
// before init every call is a no-op and reads return empty lists.

let instance: RecentViews | null = null;

export function initRecentViews(deps: RecentViewsDeps): RecentViews {
  // Re-init (AppShell effect re-run) discards the old instance; clear it
  // so a stale debounce timer cannot push an outdated envelope.
  instance?.clear();
  instance = createRecentViews(deps);
  cacheRegistry.register("RecentViews", instance);
  return instance;
}

export const recentViews = {
  get entries(): readonly RecentViewEntry[] {
    return instance?.entries ?? [];
  },
  entriesOf(type: RecentViewType): readonly RecentViewEntry[] {
    return instance?.entriesOf(type) ?? [];
  },
  record(type: RecentViewType, id: string): void {
    instance?.record(type, id);
  },
  ensureHydrated(): void {
    instance?.ensureHydrated();
  },
};
