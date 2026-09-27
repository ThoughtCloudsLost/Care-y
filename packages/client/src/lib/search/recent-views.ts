/**
 * Recently-viewed entities (tickets, KB articles) for the search overlay.
 *
 * The list lives in memory (a synced self-blob document, cleared through
 * CacheRegistry on logout and idle teardown) and is mirrored to the server
 * as a single self-blob envelope on user_recent_views, sealed to the
 * user's own vol_public. The server stores ciphertext only; other
 * volunteers can never read it; history survives reloads and devices.
 *
 * The payload holds entity IDs and timestamps only, never titles. The
 * overlay re-resolves IDs through the live search providers, so entries
 * the user can no longer access fail to resolve and are not shown.
 *
 * Password change rotates vol keys, which makes the stored envelope
 * unopenable. Hydration treats that as an empty history and the next
 * push overwrites the envelope (accepted reset, documented in the ADR).
 */

import {
  createSyncedSelfBlob,
  decodeSelfBlobPayload,
  encodeSelfBlobPayload,
  type SelfBlobEnvelope,
  type SelfBlobTransport,
} from "$lib/prefs/synced-self-blob.svelte.js";

export type RecentViewType = "ticket" | "article";

export interface RecentViewEntry {
  readonly type: RecentViewType;
  readonly id: string;
  /** Client clock, epoch ms. Ordering and merge only; never sent in plaintext. */
  readonly viewedAt: number;
}

export type RecentViewsEnvelope = SelfBlobEnvelope;

export interface RecentViewsDeps extends SelfBlobTransport {
  /** Ensure raw ticket rows for these IDs are in the query cache. */
  readonly prefetchTickets: (ids: readonly string[]) => Promise<void>;
  /** Injectable clock for tests. */
  readonly now?: () => number;
  /** Debounce delay for server pushes. */
  readonly pushDelayMs?: number;
}

const MAX_PER_TYPE = 10;
const MAX_TOTAL = 20;
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

function entriesFromJson(json: unknown): readonly RecentViewEntry[] {
  if (typeof json !== "object" || json === null) return [];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- guarded by typeof+null check above
  const obj = json as Record<string, unknown>;
  if (obj.v !== PAYLOAD_VERSION || !Array.isArray(obj.entries)) return [];
  return obj.entries.filter(isRecentViewEntry);
}

function toPayload(entries: readonly RecentViewEntry[]): RecentViewsPayload {
  return { v: PAYLOAD_VERSION, entries };
}

/** Serialize entries to the base64 payload sealed into the envelope. */
export function serializePayload(entries: readonly RecentViewEntry[]): string {
  return encodeSelfBlobPayload(toPayload(entries));
}

/**
 * Parse a base64 payload back into entries. Malformed or unknown-version
 * payloads yield an empty list: the recovery path is a fresh history,
 * overwritten by the next push.
 */
export function parsePayload(dataB64: string): readonly RecentViewEntry[] {
  try {
    return entriesFromJson(decodeSelfBlobPayload(dataB64));
  } catch {
    return [];
  }
}

function entryKey(entry: RecentViewEntry): string {
  return `${entry.type}:${entry.id}`;
}

/** Most recently viewed first. Stable, so ties keep insertion order. */
function sortEntries(
  entries: readonly RecentViewEntry[],
): readonly RecentViewEntry[] {
  return [...entries].sort((a, b) => b.viewedAt - a.viewedAt);
}

/**
 * Drop the oldest entries beyond the per-type and total caps. The input
 * is in insertion order (one entry per entity) and so is the result.
 */
function applyCaps(
  entries: readonly RecentViewEntry[],
): readonly RecentViewEntry[] {
  let tickets = 0;
  let articles = 0;
  let total = 0;
  const dropped: string[] = [];
  for (const entry of sortEntries(entries)) {
    total += 1;
    const typeCount =
      entry.type === "ticket" ? (tickets += 1) : (articles += 1);
    if (typeCount > MAX_PER_TYPE || total > MAX_TOTAL) {
      dropped.push(entryKey(entry));
    }
  }
  if (dropped.length === 0) return entries;
  return entries.filter((e) => !dropped.includes(entryKey(e)));
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

  // The document is the entry list in insertion order, one entry per
  // entity; readers sort by viewedAt. Registered with CacheRegistry by
  // the helper.
  const blob = createSyncedSelfBlob<readonly RecentViewEntry[]>({
    cacheName: "RecentViews",
    logTag: "recent-views",
    fetchEnvelope: deps.fetchEnvelope,
    pushEnvelope: deps.pushEnvelope,
    seal: deps.seal,
    open: deps.open,
    parse: entriesFromJson,
    serialize: (entries) => toPayload(sortEntries(entries)),
    defaultValue: () => [],
    pushDelayMs: deps.pushDelayMs,
    // Merge under local entries: anything recorded this session is newer
    // than the stored copy of the same entity.
    merge: (local, remote) => {
      const merged = [...local];
      const seen = merged.map(entryKey);
      for (const entry of remote) {
        const key = entryKey(entry);
        if (seen.includes(key)) continue;
        seen.push(key);
        merged.push(entry);
      }
      return applyCaps(merged);
    },
    onHydrated: (entries) => {
      const ticketIds = sortEntries(entries)
        .filter((e) => e.type === "ticket")
        .map((e) => e.id);
      if (ticketIds.length === 0) return;
      deps.prefetchTickets(ticketIds).catch((err: unknown) => {
        // Unresolved entries are simply not rendered; nothing to repair.
        console.warn(
          "[recent-views] ticket prefetch failed:",
          err instanceof Error ? err.message : "unknown error",
        );
      });
    },
  });

  return {
    get entries(): readonly RecentViewEntry[] {
      return sortEntries(blob.value);
    },

    entriesOf(type: RecentViewType): readonly RecentViewEntry[] {
      return sortEntries(blob.value).filter((e) => e.type === type);
    },

    record(type: RecentViewType, id: string): void {
      if (id.length === 0) return;
      blob.update((current) =>
        applyCaps([
          ...current.filter((e) => e.type !== type || e.id !== id),
          { type, id, viewedAt: now() },
        ]),
      );
    },

    ensureHydrated(): void {
      blob.ensureHydrated();
    },

    async flush(): Promise<void> {
      await blob.flush();
    },

    clear(): void {
      blob.clear();
    },
  };
}

// ── Module singleton ─────────────────────────────────────────────────
// AppShell wires the real deps after login. Components call the facade;
// before init every call is a no-op and reads return empty lists.

let instance: RecentViews | null = null;

export function initRecentViews(deps: RecentViewsDeps): RecentViews {
  // Re-init (AppShell effect re-run) discards the old instance; clear it
  // so a stale debounce timer cannot push an outdated envelope. The new
  // instance registers itself with CacheRegistry under the same name.
  instance?.clear();
  instance = createRecentViews(deps);
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
