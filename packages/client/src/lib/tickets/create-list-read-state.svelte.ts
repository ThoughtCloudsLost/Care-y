/**
 * Read-state composable for the tickets list (unread pills + global truth).
 *
 * Two server sources feed it, both server-blind:
 * - The WINDOW query (tickets.listReadState) batches the loaded rows and
 *   carries up to 20 non-system, non-self reply timestamps per ticket.
 *   It is the authority for per-ticket unread counts on loaded rows.
 * - The SWEEP query (tickets.readStateSweep) enumerates ALL of the user's
 *   cursor rows (open tickets in accessible queues), paged to exhaustion.
 *   It contributes existence, not counts: which unloaded tickets are
 *   unread, so the counts line and the unread filter are globally honest.
 *
 * Cursor blobs are E2E-encrypted per user; decryption happens in the
 * crypto Worker via TicketDecryptCache.decryptReadCursor, and decrypted
 * read state lives only in that registry-tracked SvelteMap (cleared on
 * idle-timer key zeroing, so pills quietly disappear until reauth).
 * Nothing derived from read state is ever sent back to the server.
 *
 * Unread semantics (locked): a ticket is unread only when its cursor
 * decrypts to a real readUpTo date AND newer non-system activity BY
 * OTHERS exists (the server excludes the caller's own replies from both
 * sources; your own reply is not unread to you). Never-opened tickets
 * (no cursor row) and first-open dummy rows (AEAD failure) are NOT
 * unread; their New status mark already announces them.
 */

import type { CreateQueryResult } from "@tanstack/svelte-query";
import { isDecryptError } from "$lib/crypto/async-decrypt-cache.js";
import type {
  TicketDecryptCache,
  TicketKeyWrap,
} from "$lib/crypto/ticket-decrypt-cache.js";
import type { SerializedBuffer } from "$lib/utils/buffer-encoding.js";

// ── Wire shapes (tRPC JSON: Buffers as SerializedBuffer, Dates as strings) ──

export interface ReadStateWindowEntry {
  readonly encryptedReadCursor: SerializedBuffer | string | null;
  readonly followUpCreatedAt: string[];
}

/** tickets.listReadState result keyed by ticket id. */
export type ReadStateWindow = Record<string, ReadStateWindowEntry | undefined>;

export interface SweepReadStateEntry {
  readonly ticketId: string;
  readonly encryptedReadCursor: SerializedBuffer | string;
  readonly latestActivityAt: string | null;
  /** This user's wrap at the ticket's current generation; null = quietly not-unread. */
  readonly keyWrap: TicketKeyWrap | null;
}

export interface SweepReadStatePage {
  readonly items: SweepReadStateEntry[];
  readonly nextCursor: string | null;
}

// ── Fetch helpers (the page wires these into its createQuery calls) ──

/** tickets.listReadState accepts at most 50 ids per call. */
export const READ_STATE_BATCH_LIMIT = 50;

/**
 * Fetch read state for the whole loaded window, chunked to the server's
 * per-call id limit and merged back into one record.
 */
export async function fetchReadStateWindow(
  ticketIds: readonly string[],
  queryBatch: (ids: string[]) => Promise<ReadStateWindow>,
): Promise<ReadStateWindow> {
  const result: ReadStateWindow = {};
  for (let i = 0; i < ticketIds.length; i += READ_STATE_BATCH_LIMIT) {
    const chunk = ticketIds.slice(i, i + READ_STATE_BATCH_LIMIT);
    Object.assign(result, await queryBatch([...chunk]));
  }
  return result;
}

/**
 * Page the read-state sweep to exhaustion (nextCursor null). The result
 * set is bounded by the cursor-row lifecycle: rows exist only for open
 * tickets this user has opened, and close deletes them.
 */
export async function fetchSweepToExhaustion(
  fetchPage: (cursor: string | undefined) => Promise<SweepReadStatePage>,
): Promise<SweepReadStateEntry[]> {
  const items: SweepReadStateEntry[] = [];
  let cursor: string | undefined = undefined;
  do {
    const page = await fetchPage(cursor);
    items.push(...page.items);
    cursor = page.nextCursor ?? undefined;
  } while (cursor !== undefined);
  return items;
}

// ── Composable ──

export interface ListReadStateConfig {
  /** Batched read state for the loaded window (key: ticketsKeys.readState). */
  readonly windowQuery: CreateQueryResult<ReadStateWindow>;
  /** Global sweep, paged to exhaustion in its queryFn (key: ticketsKeys.readStateSweep). */
  readonly sweepQuery: CreateQueryResult<SweepReadStateEntry[]>;
  /** Key wrap from the loaded list row; window cursors decrypt via the row's own wrap. */
  readonly getKeyWrap: (ticketId: string) => TicketKeyWrap | null;
  /** Current user id; the cursor row and its AAD slot are per-user. */
  readonly getUserId: () => string;
  readonly ticketDecryptCache: TicketDecryptCache;
}

export interface ListReadState {
  /**
   * Unread reply count for a LOADED row. 0 while data or decrypts are
   * pending, for never-opened tickets, and for dummy/failed cursors.
   * Capped at the server's 20-timestamp window per ticket by design: the
   * pill is a signal, not an audit, so a busier ticket reads "20 new".
   */
  unreadCount(ticketId: string): number;
  /** Window-authoritative for loaded rows; falls back to the sweep set for unloaded tickets. */
  isUnread(ticketId: string): boolean;
  /** Global unread count from the sweep (truthful beyond the loaded window). */
  unreadTotal(): number;
  /** Globally unread ticket ids, newest unread activity first. */
  unreadIds(): string[];
  /** True once the sweep has loaded and every entry's cursor decrypt settled. */
  sweepSettled(): boolean;
}

export function createListReadState(
  config: ListReadStateConfig,
): ListReadState {
  /**
   * Resolve a cursor blob to its decrypted readUpTo.
   * undefined = decrypt still pending; null = no real cursor (dummy row,
   * AEAD failure, missing wrap, malformed payload) which is never unread.
   */
  function resolveReadUpTo(
    ticketId: string,
    keyWrap: TicketKeyWrap | null,
    encryptedReadCursor: SerializedBuffer | string,
  ): Date | null | undefined {
    const userId = config.getUserId();
    if (userId === "") return undefined;

    const payload = config.ticketDecryptCache.decryptReadCursor(
      ticketId,
      userId,
      keyWrap,
      encryptedReadCursor,
    );
    if (payload === undefined) return undefined;
    if (isDecryptError(payload)) return null;
    try {
      const parsed: unknown = JSON.parse(payload);
      if (
        parsed !== null &&
        typeof parsed === "object" &&
        "readUpTo" in parsed
      ) {
        const ts = (parsed as Record<string, unknown>).readUpTo;
        // eslint-disable-next-line svelte/prefer-svelte-reactivity -- immutable value, not mutated after construction
        if (typeof ts === "string") return new Date(ts);
      }
    } catch {
      // Malformed payload: recover as "no real cursor", never as unread.
      return null;
    }
    return null;
  }

  // Settled resolutions memoized per entry object. Identity keying is
  // safe because a settled entry's resolution is final: its ciphertext
  // never changes, and both queries return fresh entry objects wholesale
  // on every refetch (no select), so key rotation and new cursors arrive
  // as new identities and the WeakMaps self-invalidate. The structural
  // point: memoized entries skip decryptReadCursor entirely, so the
  // deriveds reading them stop subscribing to settled cursor keys and
  // re-runs shrink as the sweep settles.
  const sweepMemo = new WeakMap<SweepReadStateEntry, Date | null>();
  const windowMemo = new WeakMap<ReadStateWindowEntry, Date | null>();

  function memoizedResolve<E extends object>(
    memo: WeakMap<E, Date | null>,
    entry: E,
    ticketId: string,
    keyWrap: TicketKeyWrap | null,
    encryptedReadCursor: SerializedBuffer | string,
  ): Date | null | undefined {
    const hit = memo.get(entry);
    if (hit !== undefined) return hit;
    const resolved = resolveReadUpTo(ticketId, keyWrap, encryptedReadCursor);
    // Store settled results only, and never a null produced while the
    // wrap was missing: the window path resolves through getKeyWrap and
    // can race the wrap's arrival, and a memoized wrapless null would
    // pin the ticket to "no cursor" even after the wrap lands.
    if (resolved !== undefined && keyWrap !== null) {
      memo.set(entry, resolved);
    }
    return resolved;
  }

  // Global unread set from the sweep: ticketId -> latest unread activity.
  // Rebuilt whenever the sweep data or a cursor decrypt lands; reads of
  // the decrypt SvelteMap inside make this reactive to Worker results.
  const sweep = $derived.by(() => {
    const data = config.sweepQuery.data;
    // Ephemeral view rebuilt wholesale per recompute, never mutated after.
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const unread = new Map<string, Date>();
    if (data === undefined) return { unread, settled: false };

    let settled = true;
    for (const entry of data) {
      // Null wrap: the server has no current-generation wrap for this
      // user, so the cursor is undecryptable. Quietly not-unread.
      if (entry.keyWrap === null) continue;
      const readUpTo = memoizedResolve(
        sweepMemo,
        entry,
        entry.ticketId,
        entry.keyWrap,
        entry.encryptedReadCursor,
      );
      if (readUpTo === undefined) {
        settled = false;
        continue;
      }
      if (readUpTo === null || entry.latestActivityAt === null) continue;
      const latestMs = Date.parse(entry.latestActivityAt);
      if (latestMs > readUpTo.getTime()) {
        // eslint-disable-next-line svelte/prefer-svelte-reactivity -- immutable value, not mutated after construction
        unread.set(entry.ticketId, new Date(latestMs));
      }
    }
    return { unread, settled };
  });

  // Window entries as a Map: keyed reads over the server-shaped record
  // without computed object access.
  const windowEntries = $derived.by(() => {
    // Ephemeral view rebuilt wholesale per recompute, never mutated after.
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    return new Map(Object.entries(config.windowQuery.data ?? {}));
  });

  function unreadCount(ticketId: string): number {
    const entry = windowEntries.get(ticketId);
    // No entry (window pending or out of scope): not unread.
    if (entry === undefined) return 0;
    // No cursor row (never opened the detail view): the New status mark
    // already announces the ticket, so no pill and no decrypt fired.
    if (entry.encryptedReadCursor === null) return 0;

    const readUpTo = memoizedResolve(
      windowMemo,
      entry,
      ticketId,
      config.getKeyWrap(ticketId),
      entry.encryptedReadCursor,
    );
    if (readUpTo === undefined || readUpTo === null) return 0;

    let count = 0;
    for (const ts of entry.followUpCreatedAt) {
      if (Date.parse(ts) > readUpTo.getTime()) count++;
    }
    return count;
  }

  function isUnread(ticketId: string): boolean {
    // The window is authoritative for loaded rows (it has the 20-deep
    // timestamps); the sweep only vouches for tickets outside it.
    if (windowEntries.has(ticketId)) {
      return unreadCount(ticketId) > 0;
    }
    return sweep.unread.has(ticketId);
  }

  return {
    unreadCount,
    isUnread,
    unreadTotal(): number {
      return sweep.unread.size;
    },
    unreadIds(): string[] {
      return [...sweep.unread.entries()]
        .sort((a, b) => b[1].getTime() - a[1].getTime())
        .map(([ticketId]) => ticketId);
    },
    sweepSettled(): boolean {
      return sweep.settled;
    },
  };
}
