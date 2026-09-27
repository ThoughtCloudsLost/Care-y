/**
 * Batch preview loader for ticket follow-up content.
 *
 * Handles fetching encrypted follow-up data for the ticket list's
 * preview windows. Batches requests with a configurable delay to
 * avoid N+1 queries when many cards enter the viewport simultaneously.
 *
 * The loader stores raw encrypted follow-up data in a registry-tracked
 * SvelteMap. Decryption happens at render time via FollowUpDecryptCache
 * (not here), keeping the separation between fetch and decrypt clean.
 *
 * Two loading modes:
 * - eagerLoad(): for the first page of tickets (immediate batch fetch)
 * - observe(): for subsequent tickets entering the viewport (batched with delay)
 *
 * Both modes split their IDs into chunks the server schema accepts.
 */

import { SvelteSet } from "svelte/reactivity";
import type { SvelteMap } from "svelte/reactivity";
import { RECENT_FOLLOW_UPS_MAX_TICKET_IDS } from "@care-y/shared";
import { cacheRegistry } from "$lib/crypto/cache-registry.js";
import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";
import { chunk } from "$lib/utils/chunk.js";

export interface RawFollowUpPreview {
  readonly id: string;
  readonly source: string;
  readonly type: string;
  readonly encryptedContent: string;
  readonly keyWrap: TicketKeyWrap | null;
  readonly createdAt: string;
  readonly hasRecording: boolean;
  readonly hasImage: boolean;
  readonly hasFile: boolean;
  readonly noteTypeId: string | null;
  readonly eventParams: Record<string, unknown> | null;
}

export interface PreviewQueryResult {
  readonly previews: Record<string, RawFollowUpPreview[]>;
  readonly latestClientType: Record<string, string | null>;
}

interface PreviewLoaderOptions {
  queryFn: (ticketIds: string[]) => Promise<PreviewQueryResult>;
  batchDelayMs?: number;
}

export interface PreviewLoader {
  readonly rawPreviews: SvelteMap<string, RawFollowUpPreview[]>;
  observe(ticketId: string): void;
  eagerLoad(ticketIds: string[]): Promise<void>;
  get(ticketId: string): RawFollowUpPreview[] | undefined;
  getLatestClientType(ticketId: string): string | null;
}

export function createPreviewLoader(
  options: PreviewLoaderOptions,
): PreviewLoader {
  const { queryFn, batchDelayMs = 100 } = options;

  // Raw encrypted follow-up data, registered with cache registry.
  const rawPreviews = cacheRegistry.createMap<string, RawFollowUpPreview[]>(
    "PreviewLoader:raw",
  );
  const latestClientTypeMap = cacheRegistry.createMap<string, string | null>(
    "PreviewLoader:latestClientType",
  );
  const loaded = new SvelteSet<string>();
  const inflight = new SvelteSet<string>();
  const pending = new SvelteSet<string>();
  let batchTimer: ReturnType<typeof setTimeout> | null = null;

  // Register the full loader clearable (covers loaded/inflight/pending Sets + timer).
  cacheRegistry.register("PreviewLoader:state", {
    clear() {
      loaded.clear();
      inflight.clear();
      pending.clear();
      if (batchTimer !== null) {
        clearTimeout(batchTimer);
        batchTimer = null;
      }
    },
  });

  function scheduleBatch(): void {
    if (batchTimer !== null) return;
    batchTimer = setTimeout(() => {
      batchTimer = null;
      void flushBatch();
    }, batchDelayMs);
  }

  /**
   * Fetch one chunk and store its results. A failed chunk sets empty
   * arrays for its own IDs only, so the UI can show "No messages yet"
   * rather than shimmer indefinitely; other chunks are unaffected.
   */
  async function loadChunk(ids: string[]): Promise<void> {
    try {
      const result = await queryFn(ids);
      // Ephemeral lookup, discarded after the loop. Not reactive state.
      // eslint-disable-next-line svelte/prefer-svelte-reactivity
      const resultsMap = new Map(Object.entries(result.previews));
      // eslint-disable-next-line svelte/prefer-svelte-reactivity
      const typesMap = new Map(Object.entries(result.latestClientType));
      for (const ticketId of ids) {
        rawPreviews.set(ticketId, resultsMap.get(ticketId) ?? []);
        latestClientTypeMap.set(ticketId, typesMap.get(ticketId) ?? null);
        loaded.add(ticketId);
      }
    } catch {
      for (const id of ids) {
        if (!rawPreviews.has(id)) rawPreviews.set(id, []);
      }
    } finally {
      for (const id of ids) inflight.delete(id);
    }
  }

  /** Request IDs in chunks the recentFollowUps schema accepts. */
  async function loadInChunks(ids: string[]): Promise<void> {
    for (const id of ids) inflight.add(id);
    await Promise.all(
      chunk(ids, RECENT_FOLLOW_UPS_MAX_TICKET_IDS).map(loadChunk),
    );
  }

  async function flushBatch(): Promise<void> {
    if (pending.size === 0) return;
    const batch = [...pending];
    pending.clear();
    await loadInChunks(batch);
  }

  return {
    get rawPreviews() {
      return rawPreviews;
    },

    /** Call when a ticket card enters the viewport (lazy load). */
    observe(ticketId: string): void {
      if (
        loaded.has(ticketId) ||
        inflight.has(ticketId) ||
        pending.has(ticketId)
      )
        return;
      pending.add(ticketId);
      scheduleBatch();
    },

    /** Eagerly load previews for a batch (first page). */
    async eagerLoad(ticketIds: string[]): Promise<void> {
      const toLoad = ticketIds.filter(
        (id) => !loaded.has(id) && !inflight.has(id),
      );
      if (toLoad.length === 0) return;
      await loadInChunks(toLoad);
    },

    /** Get raw encrypted preview data for a ticket. undefined = not loaded. */
    get(ticketId: string): RawFollowUpPreview[] | undefined {
      return rawPreviews.get(ticketId);
    },

    /** Latest client-sourced follow-up type for a ticket, or null when none. */
    getLatestClientType(ticketId: string): string | null {
      return latestClientTypeMap.get(ticketId) ?? null;
    },
  };
}
